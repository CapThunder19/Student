'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Heart, Users, Reply, Smile, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../lib/useSocket';
import { ChatMessage } from '../../lib/socket';
import Image from 'next/image';
import Link from 'next/link';

const PAGE_BG = "bg-[#FDF9F1] text-[#1A1A1A]";
const CARD = "bg-white border-2 border-[#1A1A1A] rounded-3xl shadow-[4px_4px_0_0_#1A1A1A]";
const SUBTLE_CARD = "bg-[#F8F1E7] border-2 border-[#1A1A1A] rounded-3xl";

export default function Community() {
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

  const userName = 'Student';
  const userEmail = 'student@example.com';
  const userImage = '';
  const canSendMessages = true;

  return (
    <div className={`min-h-screen ${PAGE_BG}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-[#1A1A1A] bg-[#FDE68A] text-xs font-semibold shadow-[2px_2px_0_0_#1A1A1A] mb-3">
                <MessageCircle className="w-4 h-4" />
                <span>Common Room · Live</span>
              </div>
              <h1 className="text-4xl font-extrabold flex items-center gap-3">
                <MessageCircle className="w-9 h-9 text-[#1A1A1A]" />
                Community Chat
              </h1>
              <p className="text-sm text-[#7C6A58] mt-1">Drop updates, ask quick questions, or just say hi.</p>
            </div>
            <div className="flex items-center gap-2">
              {userImage ? (
                <Image src={userImage} alt="avatar" width={36} height={36} className="rounded-full border-2 border-[#1A1A1A]" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center text-[#1A1A1A] font-bold text-sm border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A]">
                  {userName[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-sm font-medium">{userName}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-3 text-sm text-[#7C6A58]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
              <span>
                {connected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{onlineCount} online</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{messages.length} messages</span>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center rounded-full border-2 border-[#1A1A1A] bg-[#FFEBD4] p-1 shadow-[3px_3px_0_0_#1A1A1A]">
            <button
              onClick={() => setActivePanel('chat')}
              className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors ${
                activePanel === 'chat'
                  ? 'bg-[#1A1A1A] text-[#FDF9F1]'
                  : 'text-[#1A1A1A] hover:bg-white'
              }`}
            >
              Realtime Chat
            </button>
            <button
              onClick={() => setActivePanel('updates')}
              className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors ${
                activePanel === 'updates'
                  ? 'bg-[#1A1A1A] text-[#FDF9F1]'
                  : 'text-[#1A1A1A] hover:bg-white'
              }`}
            >
              Community Updates
            </button>
          </div>
        </motion.div>

        {activePanel === 'updates' ? (
          <div className={`${CARD} flex-1 p-6 text-sm text-[#7C6A58]`}>
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Community Updates</h2>
            <p>Realtime chat is available in the Realtime Chat tab.</p>
          </div>
        ) : (
          <>

        <div
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 mt-1"
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
                      <Image src={msg.avatar} alt={msg.author} width={36} height={36} className="rounded-full border-2 border-[#1A1A1A]" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center font-bold text-[#1A1A1A] border-2 border-[#1A1A1A]">
                        {msg.avatar}
                      </div>
                    )}
                  </div>

                  <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-[#7C6A58] mb-1 px-1">
                      {isMe ? 'You' : msg.author} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-[#1A1A1A] text-[#FDF9F1] border-2 border-[#1A1A1A] rounded-tr-sm shadow-[3px_3px_0_0_#1A1A1A]'
                          : 'bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-tl-sm shadow-[3px_3px_0_0_#1A1A1A]'
                      }`}
                    >
                      {msg.replyTo && (
                        <div
                          className={`mb-2 rounded-lg border px-2 py-1.5 text-xs ${
                            isMe
                              ? 'border-[#FDE68A] bg-[#F97316]/10 text-[#FDE68A]'
                              : 'border-[#F3E2CC] bg-[#F8F1E7] text-[#7C6A58]'
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
                        className="flex items-center gap-1 text-xs text-[#7C6A58] hover:text-[#1A1A1A] transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>
                      <button
                        onClick={() => likeMessage(msg.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          msg.likedBy.includes(userEmail)
                            ? 'text-[#DC2626]'
                            : 'text-[#7C6A58] hover:text-[#DC2626]'
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
                className="flex items-center gap-2 text-sm text-[#7C6A58] pl-1"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-[#1A1A1A] rounded-full"
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
          className={`mt-4 ${CARD} p-4 bg-white`}
        >
          {replyTarget && (
            <div className="mb-3 rounded-2xl border-2 border-[#1A1A1A] bg-[#FDE68A] px-3 py-2 text-xs text-[#1A1A1A] flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Replying to {replyTarget.author}</p>
                <p className="truncate">{replyTarget.message}</p>
              </div>
              <button
                onClick={cancelReply}
                className="text-[#1A1A1A] hover:opacity-80"
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
                className="shrink-0 rounded-full border-2 border-[#1A1A1A] bg-white p-3 text-[#1A1A1A] hover:bg-[#FDE68A] transition-colors disabled:opacity-40"
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
                placeholder="Type a message..."
                disabled={!canSendMessages}
                className="flex-1 px-4 py-3 rounded-full border-2 border-[#1A1A1A] bg-white focus:outline-none text-sm shadow-[2px_2px_0_0_#1A1A1A]"
              />

              <AnimatePresence>
                {showEmojiPicker && canSendMessages && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-14 left-0 z-20 w-72 rounded-3xl border-2 border-[#1A1A1A] bg-white shadow-[4px_4px_0_0_#1A1A1A] p-3"
                  >
                    <div className="grid grid-cols-6 gap-1.5">
                      {quickEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="rounded-2xl p-2 text-lg hover:bg-[#F3E2CC] transition-colors"
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
              disabled={!input.trim()}
              className="px-5 py-3 rounded-full border-2 border-[#1A1A1A] bg-[#22C55E] text-[#1A1A1A] font-semibold flex items-center gap-2 shadow-[3px_3px_0_0_#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed"
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

