'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, BookOpen, AlertCircle } from 'lucide-react';

const dailyData = [
  { day: 'Mon', value: 2400 },
  { day: 'Tue', value: 1398 },
  { day: 'Wed', value: 9800 },
  { day: 'Thu', value: 3908 },
  { day: 'Fri', value: 4800 },
  { day: 'Sat', value: 3800 },
  { day: 'Sun', value: 4300 },
];

const weeklyData = [
  { week: 'W1', expenses: 2400 },
  { week: 'W2', expenses: 1221 },
  { week: 'W3', expenses: 4400 },
  { week: 'W4', expenses: 2210 },
];

export default function StatsOverview() {
  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { icon: TrendingUp, label: 'Total', value: '$320.00', color: 'from-lime-400 to-lime-600', bgColor: 'bg-lime-50 dark:bg-lime-900/20' },
          { icon: BookOpen, label: 'Courses', value: '12', color: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
          { icon: Users, label: 'Active Users', value: '482', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: AlertCircle, label: 'Alerts', value: '24', color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-6 backdrop-blur-sm border border-white/20 dark:border-slate-700/50`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
              >
                <stat.icon className="w-6 h-6" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Daily Activity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Expenses Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Weekly Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar 
                dataKey="expenses" 
                fill="#f97316"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total', value: '27', color: 'from-blue-500 to-blue-700', icon: '📊' },
          { label: 'In Progress', value: '45', color: 'from-yellow-500 to-yellow-700', icon: '⚙️' },
          { label: 'Completed', value: '24', color: 'from-cyan-500 to-cyan-700', icon: '✅' },
          { label: 'Feedback', value: '61%', color: 'from-green-500 to-green-700', icon: '👍' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-xl cursor-pointer transform transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">{card.label}</p>
                <p className="text-4xl font-bold">{card.value}</p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
