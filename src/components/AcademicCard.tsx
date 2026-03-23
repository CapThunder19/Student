'use client';

import { BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcademicCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
      whileHover={{ y: -5, boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full hover:shadow-2xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center shadow-md"
        >
          <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ask & Discuss</p>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 line-clamp-2">
        Get help with academic questions and create polls for your doubts.
      </p>

      <div className="space-y-2 mb-6">
        <motion.div
          whileHover={{ x: 5 }}
          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Discussions</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</span>
            <span className="text-xs text-blue-500">active</span>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ x: 5 }}
          className="flex items-center justify-between p-3 bg-green-50 dark:bg-slate-700 rounded-lg hover:bg-green-100 dark:hover:bg-slate-600 transition-colors"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Answered</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">5</span>
            <span className="text-xs text-green-500">today</span>
          </div>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
      >
        <MessageSquare className="w-4 h-4" />
        Ask a Question
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}
