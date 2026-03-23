'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Send, Heart, Share2, Users } from 'lucide-react';
import { useState } from 'react';

export default function Community() {
  const [messages, setMessages] = useState([
    { id: 1, author: 'Sarah Chen', avatar: '👩‍💼', message: 'Just finished the new course module!', likes: 12, timestamp: '2 hours ago' },
    { id: 2, author: 'Alex Kumar', avatar: '👨‍💻', message: 'Anyone interested in group study tomorrow?', likes: 8, timestamp: '1 hour ago' },
    { id: 3, author: 'Maria Garcia', avatar: '👩‍🎓', message: 'Great discussion in class today!', likes: 24, timestamp: '30 minutes ago' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
            <MessageCircle className="w-10 h-10 text-blue-600" />
            Community Chat
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Connect with peers and share ideas</p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-xl"
        >
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Members</p>
              <p className="text-4xl font-bold">482</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Online Now</p>
              <p className="text-4xl font-bold">97</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Messages Today</p>
              <p className="text-4xl font-bold">1.2K</p>
            </div>
          </div>
        </motion.div>

        {/* Messages Feed */}
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
            >
              <div className="flex gap-4">
                <div className="text-4xl">{msg.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{msg.author}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{msg.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                      </motion.button>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{msg.likes}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">{msg.message}</p>
                  <div className="flex gap-4 text-slate-600 dark:text-slate-400">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Reply
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Share your thoughts with the community..."
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
