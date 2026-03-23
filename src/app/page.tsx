'use client';

import { motion } from "framer-motion";
import AcademicCard from "@/components/AcademicCard";
import BudgetCard from "@/components/BudgetCard";
import AttendanceCard from "@/components/AttendanceCard";
import CommunityCard from "@/components/CommunityCard";
import ComplaintSection from "@/components/ComplaintSection";
import StatsOverview from "@/components/StatsOverview";
import { BookOpen, PenTool, Trophy, Settings } from "lucide-react";

export default function Home() {
  const stats = [
    { label: 'GPA', value: '4.2', color: 'blue' },
    { label: 'Attendance', value: '92%', color: 'green' },
    { label: 'Active Classes', value: '8', color: 'purple' },
    { label: 'Messages', value: '24', color: 'pink' },
  ];

  const quickLinks = [
    { icon: BookOpen, label: 'Course Materials', color: 'blue' },
    { icon: PenTool, label: 'Assignments', color: 'green' },
    { icon: Trophy, label: 'Achievements', color: 'purple' },
    { icon: Settings, label: 'Settings', color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 text-white py-12 px-6 md:px-12 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome Back! 👋</h1>
            <p className="text-xl text-blue-100">Let's make your academic journey smooth and productive</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Stats Overview with Charts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0, duration: 0.5 }}
          className="mb-16"
        >
          <StatsOverview />
        </motion.div>

        {/* Main Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AcademicCard />
            <BudgetCard />
            <AttendanceCard />
            <CommunityCard />
          </div>
        </motion.div>

        {/* Complaint Section  */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <ComplaintSection />
        </motion.div>

        {/* Quick Links Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-10"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickLinks.map((link, idx) => (
              <motion.a
                key={idx}
                href="#"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all group ${
                  link.color === 'blue'
                    ? 'bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600'
                    : link.color === 'green'
                    ? 'bg-green-50 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-slate-600'
                    : link.color === 'purple'
                    ? 'bg-purple-50 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-slate-600'
                    : 'bg-orange-50 dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-slate-600'
                }`}
              >
                <link.icon className={`w-8 h-8 mb-3 transition-transform group-hover:scale-110 ${
                  link.color === 'blue'
                    ? 'text-blue-600 dark:text-blue-400'
                    : link.color === 'green'
                    ? 'text-green-600 dark:text-green-400'
                    : link.color === 'purple'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {link.label}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            Last login: Today at 10:30 AM
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © 2026 Student App. All rights reserved. | System Status: ✅ All Systems Normal
          </p>
        </motion.div>
      </main>
    </div>
  );
}
