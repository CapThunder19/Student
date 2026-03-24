'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { ChatMessage } from './socket';

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingById, setTypingById] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState(false);
  const currentUser = session?.user;

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const merged = new Map<string, ChatMessage>();

      for (const msg of prev) {
        merged.set(msg.id, msg);
      }

      for (const msg of incoming) {
        merged.set(msg.id, msg);
      }

      return Array.from(merged.values()).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
  }, []);

  const applyReaction = useCallback(
    ({ messageId, userId, liked, likes }: { messageId: string; userId: string; liked: boolean; likes: number }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          const nextLikedBy = liked
            ? Array.from(new Set([...msg.likedBy, userId]))
            : msg.likedBy.filter((id) => id !== userId);

          return {
            ...msg,
            likedBy: nextLikedBy,
            likes: Math.max(likes, 0),
          };
        })
      );
    },
    []
  );

  const fetchPersistedMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/community/messages', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: ChatMessage[] };
      if (Array.isArray(data.messages)) {
        mergeMessages(data.messages);
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch persisted messages:', error);
    }
  }, [mergeMessages]);

  useEffect(() => {
    if (!currentUser) return;
    const initialize = async () => {
      // Ensure API route is hit at least once so Socket.IO server gets attached.
      try {
        await fetch('/api/socket_io');
      } catch (error) {
        console.log('⚠️ Socket warmup request failed, continuing:', error);
      }

      if (!globalSocket) {
        globalSocket = io({
          path: '/api/socket_io',
          addTrailingSlash: false,
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });
      }

      const socket = globalSocket;

      const joinCommunity = () => {
        if (!currentUser) return;
        socket.emit('join_community', {
          name: currentUser.name || 'Anonymous',
          email: currentUser.email || '',
          image: currentUser.image || '',
        });
      };

      const onConnect = () => {
        console.log('✅ Socket connected:', socket.id);
        setConnected(true);
        joinCommunity();
      };

      const onConnectError = (err: Error) => {
        console.log('❌ Connection error:', err.message);
        setConnected(false);
      };

      const onDisconnect = (reason: string) => {
        console.log('🔌 Disconnected:', reason);
        setConnected(false);
        setTypingById({});
      };

      const onReceiveMessage = (msg: ChatMessage) => {
        console.log('📨 Message received:', msg.message);
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      };

      const onChatHistory = (history: ChatMessage[]) => {
        mergeMessages(history);
      };

      const onOnlineCount = (count: number) => setOnlineCount(count);

      const onTypingUsers = (
        users: Array<{ typingId: string; name?: string; userId?: string }>
      ) => {
        const next: Record<string, string> = {};
        for (const entry of users || []) {
          if (!entry?.typingId || entry.typingId === socket.id) continue;
          next[entry.typingId] = entry.name || entry.userId || 'Someone';
        }
        setTypingById(next);
      };

      const onMessageReaction = (payload: {
        messageId: string;
        userId: string;
        liked: boolean;
        likes: number;
      }) => {
        applyReaction(payload);
      };

      socket.on('connect', onConnect);
      socket.on('connect_error', onConnectError);
      socket.on('disconnect', onDisconnect);
      socket.on('receive_message', onReceiveMessage);
      socket.on('chat_history', onChatHistory);
      socket.on('online_count', onOnlineCount);
      socket.on('typing_users', onTypingUsers);
      socket.on('message_reaction', onMessageReaction);

      if (socket.connected) {
        setConnected(true);
        joinCommunity();
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        socket.off('disconnect', onDisconnect);
        socket.off('receive_message', onReceiveMessage);
        socket.off('chat_history', onChatHistory);
        socket.off('online_count', onOnlineCount);
        socket.off('typing_users', onTypingUsers);
        socket.off('message_reaction', onMessageReaction);
      };
    };

    let cleanup: (() => void) | undefined;
    initialize()
      .then((fn) => {
        cleanup = fn;
      })
      .catch((err) => {
        console.log('❌ Failed to initialize socket:', err);
        setConnected(false);
      });

    // Keep singleton socket alive, remove only this hook's listeners.
    return () => {
      if (cleanup) cleanup();
    };
  }, [applyReaction, currentUser, mergeMessages]);

  const typingUsers = Object.values(typingById);

  useEffect(() => {
    const timer = setInterval(fetchPersistedMessages, 4000);
    const kickoff = setTimeout(fetchPersistedMessages, 250);

    return () => {
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, [fetchPersistedMessages]);

  const sendMessage = useCallback((text: string, replyTo?: ChatMessage['replyTo']) => {
    if (!globalSocket?.connected || !currentUser || !text.trim()) {
      console.log('❌ Cannot send - connected:', globalSocket?.connected, 'text:', text);
      if (!currentUser || !text.trim()) return;
    }
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      author: currentUser.name || 'Anonymous',
      avatar: currentUser.image || '👤',
      message: text.trim(),
      replyTo,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    // Optimistic update so sender sees the message instantly.
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });

    fetch('/api/community/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.message) {
          mergeMessages([data.message as ChatMessage]);
        }
      })
      .catch((error) => {
        console.log('⚠️ Failed to persist sent message:', error);
      });

    console.log('📤 Emitting message:', msg.message);
    if (globalSocket?.connected) {
      globalSocket.emit('send_message', msg);
    }
  }, [currentUser, mergeMessages]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!globalSocket || !currentUser) return;
    globalSocket.emit('typing', {
      name: currentUser.name || 'Anonymous',
      userId: currentUser.email || '',
      isTyping,
    });
  }, [currentUser]);

  const likeMessage = useCallback(
    async (messageId: string) => {
      if (!currentUser?.email) return;

      if (globalSocket?.connected) {
        globalSocket.emit('like_message', { messageId, userId: currentUser.email });
        return;
      }

      try {
        const res = await fetch('/api/community/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, userId: currentUser.email }),
        });

        if (!res.ok) return;
        const data = (await res.json()) as {
          messageId: string;
          userId: string;
          liked: boolean;
          likes: number;
        };
        applyReaction(data);
      } catch (error) {
        console.log('⚠️ Failed to update reaction:', error);
      }
    },
    [applyReaction, currentUser]
  );

  return { messages, onlineCount, typingUsers, connected, sendMessage, sendTyping, likeMessage };
};
