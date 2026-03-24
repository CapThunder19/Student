import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiResponse } from 'next';
import { Socket as NetSocket } from 'net';
import dbConnect from '@/lib/mongodb';
import ChatMessageModel from '@/models/ChatMessage';

export interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}
export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}
export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}
export interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  message: string;
  replyTo?: {
    id: string;
    author: string;
    message: string;
  };
  timestamp: string;
  likes: number;
  likedBy: string[];
}

type StoredChatMessage = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  replyTo?: {
    id: string;
    author: string;
    message: string;
  };
  timestamp: Date | string;
  likes: number;
  likedBy: string[];
};

const HISTORY_LIMIT = 100;

const toClientMessage = (doc: StoredChatMessage): ChatMessage => ({
  id: doc.id,
  author: doc.author,
  avatar: doc.avatar,
  message: doc.message,
  replyTo: doc.replyTo,
  timestamp: new Date(doc.timestamp).toISOString(),
  likes: doc.likes || 0,
  likedBy: doc.likedBy || [],
});

export const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Starting Socket.io server...');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
      transports: ['websocket'],
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    const typingState = new Map<string, { name: string; userId: string }>();

    const emitTypingUsers = () => {
      const typingUsers = Array.from(typingState.entries()).map(([typingId, value]) => ({
        typingId,
        name: value.name,
        userId: value.userId,
      }));
      io.to('community').emit('typing_users', typingUsers);
    };

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_community', async (user: { name: string; email: string; image?: string }) => {
        console.log('User joined community:', user.name);
        socket.data.user = user;
        socket.join('community');

        try {
          await dbConnect();
          const historyDocs = await ChatMessageModel.find({})
            .sort({ timestamp: -1 })
            .limit(HISTORY_LIMIT)
            .lean<StoredChatMessage[]>();

          const history = historyDocs.map((doc) =>
            toClientMessage({
              id: doc.id,
              author: doc.author,
              avatar: doc.avatar,
              message: doc.message,
              replyTo: doc.replyTo,
              timestamp: doc.timestamp,
              likes: doc.likes,
              likedBy: doc.likedBy,
            })
          );

          socket.emit('chat_history', history.reverse());
        } catch (error) {
          console.error('Failed to load chat history:', error);
          socket.emit('chat_history', []);
        }

        io.to('community').emit('online_count', io.sockets.adapter.rooms.get('community')?.size || 0);
      });

      socket.on('send_message', async (msg: ChatMessage) => {
        console.log('Message received on server, broadcasting:', msg.message);
        if (!socket.rooms.has('community')) {
          socket.join('community');
        }

        let savedMessage = msg;
        try {
          await dbConnect();
          const persisted = await ChatMessageModel.findOneAndUpdate(
            { id: msg.id },
            {
              id: msg.id,
              author: msg.author,
              avatar: msg.avatar,
              message: msg.message,
              replyTo: msg.replyTo,
              timestamp: msg.timestamp,
              likes: msg.likes,
              likedBy: msg.likedBy,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).lean<StoredChatMessage | null>();

          if (persisted) {
            savedMessage = toClientMessage({
              id: persisted.id,
              author: persisted.author,
              avatar: persisted.avatar,
              message: persisted.message,
              replyTo: persisted.replyTo,
              timestamp: persisted.timestamp,
              likes: persisted.likes,
              likedBy: persisted.likedBy,
            });
          }
        } catch (error) {
          console.error('Failed to persist message:', error);
        }

        io.to('community').emit('receive_message', savedMessage);
      });

      socket.on('typing', (data: { name?: string; userId?: string; isTyping: boolean }) => {
        if (!socket.rooms.has('community')) {
          socket.join('community');
        }

        const user = socket.data.user as { name?: string; email?: string } | undefined;
        if (Boolean(data.isTyping)) {
          typingState.set(socket.id, {
            name: user?.name || data.name || 'Someone',
            userId: user?.email || data.userId || '',
          });
        } else {
          typingState.delete(socket.id);
        }

        emitTypingUsers();
      });

      socket.on('like_message', async (data: { messageId: string; userId: string }) => {
        try {
          await dbConnect();
          const existing = await ChatMessageModel.findOne({ id: data.messageId }).lean<StoredChatMessage | null>();

          if (!existing) {
            return;
          }

          const hasLiked = Array.isArray(existing.likedBy) && existing.likedBy.includes(data.userId);

          const updated = await ChatMessageModel.findOneAndUpdate(
            { id: data.messageId },
            hasLiked
              ? {
                  $pull: { likedBy: data.userId },
                  $inc: { likes: -1 },
                }
              : {
                  $addToSet: { likedBy: data.userId },
                  $inc: { likes: 1 },
                },
            { new: true }
          ).lean<StoredChatMessage | null>();

          if (!updated) {
            return;
          }

          io.to('community').emit('message_reaction', {
            messageId: data.messageId,
            userId: data.userId,
            liked: !hasLiked,
            likes: Math.max(updated.likes || 0, 0),
          });
        } catch (error) {
          console.error('Failed to persist like:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        typingState.delete(socket.id);
        emitTypingUsers();
        io.to('community').emit('online_count', io.sockets.adapter.rooms.get('community')?.size || 0);
      });
    });

    res.socket.server.io = io;
    console.log('Socket.io server started!');
  } else {
    console.log('Socket.io server already running');
  }
  return res.socket.server.io;
};
