'use client';

import { Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BudgetCard() {
  const spent = 32500;
  const total = 50000;
  const percentage = (spent / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full hover:shadow-2xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 rounded-xl flex items-center justify-center shadow-md"
        >
          <Wallet className="w-7 h-7 text-purple-600 dark:text-purple-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Budget Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Expense Tracking</p>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
        Track and manage your academic budget efficiently.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Budget Utilization</span>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">₹{spent.toLocaleString('en-IN')}</div>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
          />
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 dark:text-slate-400">₹{spent.toLocaleString('en-IN')} spent</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">{percentage.toFixed(0)}%</span>
          <span className="text-slate-600 dark:text-slate-400">₹{(total - spent).toLocaleString('en-IN')} left</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
      >
        View Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}
