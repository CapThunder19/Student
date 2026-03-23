'use client';

import { CheckCircle, Calendar, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -5, boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full hover:shadow-2xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-xl flex items-center justify-center shadow-md"
        >
          <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance & Classes</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track Progress</p>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
        Monitor your class attendance and schedule.
      </p>

      <div className="space-y-4 mb-6">
        <motion.div
          className="bg-green-50 dark:bg-slate-700 p-4 rounded-lg"
          whileHover={{ backgroundColor: '#dcfce7' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attendance Rate</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-green-600 dark:text-green-400"
            >
              92%
            </motion.span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Present</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-orange-50 dark:bg-slate-700 rounded-lg text-center hover:bg-orange-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Absent</div>
          </motion.div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
      >
        View Schedule
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}
