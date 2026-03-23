'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Award, BookOpen, Settings, LogOut, Edit2 } from 'lucide-react';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-48 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden mb-6"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-2 right-10 w-24 h-24 bg-white rounded-full"></div>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 -mt-20 relative z-10 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-7xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl"
            >
              👩‍🎓
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Sarah Chen</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Computer Science Student • Year 3</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Mail className="w-5 h-5 text-purple-600" />
                  sarah.chen@uni.edu
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="w-5 h-5 text-purple-600" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  San Francisco, CA
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Award className="w-5 h-5 text-purple-600" />
                  GPA: 3.8/4.0
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { icon: BookOpen, label: 'Courses Enrolled', value: '12', color: 'from-blue-500 to-blue-700' },
            { icon: Award, label: 'Achievements', value: '24', color: 'from-purple-500 to-purple-700' },
            { icon: User, label: 'Followers', value: '342', color: 'from-pink-500 to-pink-700' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="w-12 h-12 opacity-50" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {['Completed Advanced Algorithms course', 'Earned "Problem Solver" badge', 'Posted in community discussion', 'Attended group study session'].map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-slate-700 dark:text-slate-300">{activity}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
