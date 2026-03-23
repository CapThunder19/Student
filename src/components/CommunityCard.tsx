'use client';

import { Users, MessageCircle, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommunityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full hover:shadow-2xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -10 }}
          className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900 dark:to-pink-800 rounded-xl flex items-center justify-center shadow-md"
        >
          <Users className="w-7 h-7 text-pink-600 dark:text-pink-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Chat</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Connect & Share</p>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
        Connect with peers, share experiences, and build friendships.
      </p>

      <div className="space-y-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-700 rounded-lg border border-pink-200 dark:border-slate-600"
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Online Now</span>
          </div>
          <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">47</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Active Members</div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Groups</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-purple-50 dark:bg-slate-700 rounded-lg text-center hover:bg-purple-100 dark:hover:bg-slate-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">156</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Messages</div>
          </motion.div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
      >
        Join Chat
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}
