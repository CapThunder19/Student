'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Heart, Users, LogOut, Reply, Smile, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../lib/useSocket';
import { ChatMessage } from '../../lib/socket';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Community() {
  const { data: session } = useSession();
  const { messages, onlineCount, typingUsers, connected, sendMessage, sendTyping, likeMessage } = useSocket();
  const [input, setInput] = useState('');
  const [activePanel, setActivePanel] = useState<'chat' | 'updates'>('chat');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const quickEmojis = ['😀', '😂', '😍', '🔥', '👏', '💯', '🎉', '🤝', '👀', '😅', '😎', '🙏'];

  useEffect(() => {
    if (!shouldAutoScroll) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers, shouldAutoScroll]);

  const handleChatScroll = () => {
    const container = chatScrollRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    setShouldAutoScroll(distanceFromBottom < 80);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(
      input,
      replyTarget
        ? {
            id: replyTarget.id,
            author: replyTarget.author,
            message: replyTarget.message,
          }
        : undefined
    );
    setInput('');
    setReplyTarget(null);
    setShowEmojiPicker(false);
    sendTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    sendTyping(Boolean(value.trim()));
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (value.trim()) {
      typingTimeout.current = setTimeout(() => sendTyping(false), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleInputBlur = () => {
    sendTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  };

  const handleEmojiClick = (emoji: string) => {
    setInput((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
    sendTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(false), 1500);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTarget(msg);
    setActivePanel('chat');
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTarget(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const userName = session?.user?.name || 'Anonymous';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image || '';
  const canSendMessages = Boolean(session?.user?.email);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <MessageCircle className="w-9 h-9 text-blue-600" />
              Community Chat
            </h1>
            <div className="flex items-center gap-2">
              {userImage ? (
                <Image src={userImage} alt="avatar" width={36} height={36} className="rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {userName[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userName}</span>
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {connected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <Users className="w-4 h-4" />
              <span>{onlineCount} online</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-4 h-4" />
              <span>{messages.length} messages</span>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActivePanel('chat')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activePanel === 'chat'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Realtime Chat
            </button>
            <button
              onClick={() => setActivePanel('updates')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activePanel === 'updates'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Community Updates
            </button>
          </div>
        </motion.div>

        {activePanel === 'updates' ? (
          <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-slate-600 dark:text-slate-300">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Community Updates</h2>
            <p className="text-sm">Realtime chat is available in the Realtime Chat tab.</p>
          </div>
        ) : (
          <>

        <div
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p>No messages yet. Be the first to say hi! 👋</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg: ChatMessage) => {
              const isMe = msg.author === userName;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className="shrink-0">
                    {msg.avatar.startsWith('http') ? (
                      <Image src={msg.avatar} alt={msg.author} width={36} height={36} className="rounded-full" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center font-bold text-blue-600">
                        {msg.avatar}
                      </div>
                    )}
                  </div>

                  <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 px-1">
                      {isMe ? 'You' : msg.author} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isMe
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                    }`}>
                      {msg.replyTo && (
                        <div
                          className={`mb-2 rounded-lg border px-2 py-1.5 text-xs ${
                            isMe
                              ? 'border-blue-300/50 bg-white/10 text-blue-100'
                              : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <p className="font-semibold">Reply to {msg.replyTo.author}</p>
                          <p className="truncate">{msg.replyTo.message}</p>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-3 px-1">
                      <button
                        onClick={() => handleReply(msg)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>
                      <button
                        onClick={() => likeMessage(msg.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          msg.likedBy.includes(userEmail)
                            ? 'text-red-500'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className="w-3 h-3" />
                        {msg.likes > 0 && <span>{msg.likes}</span>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 pl-1"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          {!canSendMessages && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
              Please <Link href="/login" className="font-semibold underline">login</Link> to send messages. You can still read community chat.
            </div>
          )}
          {replyTarget && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Replying to {replyTarget.author}</p>
                <p className="truncate">{replyTarget.message}</p>
              </div>
              <button
                onClick={cancelReply}
                className="text-blue-600 dark:text-blue-300 hover:opacity-80"
                aria-label="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="relative flex-1 flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                disabled={!canSendMessages}
                className="shrink-0 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 p-3 text-slate-500 dark:text-slate-300 hover:text-blue-500 transition-colors disabled:opacity-40"
                aria-label="Open emoji picker"
              >
                <Smile className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                placeholder={canSendMessages ? 'Type a message...' : 'Login to send a message'}
                disabled={!canSendMessages}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              <AnimatePresence>
                {showEmojiPicker && canSendMessages && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-14 left-0 z-20 w-72 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl p-3"
                  >
                    <div className="grid grid-cols-6 gap-1.5">
                      {quickEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="rounded-lg p-2 text-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || !canSendMessages}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

