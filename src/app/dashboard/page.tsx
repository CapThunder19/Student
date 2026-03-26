'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Shield,
  BookOpen,
  Heart,
  Users,
  Home as HouseIcon,
  Wallet,
  Megaphone,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface QuickStats {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const quickStats: QuickStats[] = [
    {
      label: 'GPA',
      value: '4.2',
      change: '+0.1 this semester',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Attendance',
      value: '92%',
      change: 'On track',
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Active Classes',
      value: '8',
      change: '4 ending soon',
      icon: Clock,
      color: 'purple',
    },
    {
      label: 'Tasks Due',
      value: '3',
      change: '1 overdue',
      icon: AlertCircle,
      color: 'red',
    },
  ];

  const modules = [
    {
      icon: AlertTriangle,
      title: 'SOS Emergency',
      description: 'Instant emergency alerts, quick dial, and emergency contacts',
      href: '/sos',
      color: 'red',
    },
    {
      icon: Shield,
      title: 'Safe Commute',
      description: 'Real-time GPS tracking, emergency alerts, and safety features',
      href: '/safecommute',
      color: 'red',
    },
    {
      icon: BookOpen,
      title: 'Academics',
      description: 'Doubt pool, flashcards, and smart learning materials',
      href: '/academics',
      color: 'purple',
    },
    {
      icon: Heart,
      title: 'Wellbeing',
      description: 'Mood tracking, breathing exercises, and peer support',
      href: '/wellbeing',
      color: 'pink',
    },
    {
      icon: Megaphone,
      title: 'Complaints',
      description: 'Submit campus complaints with urgent red, yellow, and green labels',
      href: '/complaints',
      color: 'orange',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Events, lost & found, and project partnerships',
      href: '/community',
      color: 'green',
    },
    {
      icon: HouseIcon,
      title: 'Housing',
      description: 'PG and flat listings with verified owners',
      href: '/housing',
      color: 'orange',
    },
    {
      icon: Wallet,
      title: 'Budget',
      description: 'Track expenses and manage your finances',
      href: '/budget',
      color: 'yellow',
    },
  ];

  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  const getColorClass = (color: string) => {
    return colorMap[color as keyof typeof colorMap] || 'from-blue-500 to-blue-600';
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Header/Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-white"
            >
              Dashboard
            </motion.h1>
            <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name || 'Student'}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Get Help
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Quick Stats Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-white mb-6">Your Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-750 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    </div>
                    <stat.icon
                      className={`w-8 h-8 ${stat.color === 'blue'
                          ? 'text-blue-400'
                          : stat.color === 'green'
                            ? 'text-green-400'
                            : stat.color === 'purple'
                              ? 'text-purple-400'
                              : 'text-red-400'
                        }`}
                    />
                  </div>
                  <p className="text-slate-400 text-xs">{stat.change}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Modules Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-white mb-6">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Link href={module.href} className="block h-full">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 h-full hover:border-slate-600 hover:bg-slate-750 transition-all cursor-pointer">
                      {/* Icon */}
                      <div
                        className={`inline-flex p-3 rounded-lg bg-linear-to-br ${getColorClass(
                          module.color
                        )} mb-4 group-hover:scale-110 transition-all`}
                      >
                        <module.icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">{module.description}</p>

                      {/* Footer */}
                      <div className="flex items-center text-blue-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                        Explore <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Complaints Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-white mb-6">Complaints</h2>
            <div className="bg-linear-to-r from-amber-950 via-slate-800 to-red-950 border border-slate-700 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <Megaphone className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Raise and track complaints</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Use red for very urgent issues, yellow for medium urgency, and green for light problems.
                    The complaints page is now visible in the dashboard and top navigation.
                  </p>
                  <Link href="/complaints" className="inline-flex mt-4 items-center gap-2 text-amber-300 font-semibold hover:text-amber-200 transition-colors">
                    Open complaints center <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Coming Soon Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-white mb-6">Announcements</h2>
            <div className="bg-linear-to-r from-blue-950 via-slate-800 to-purple-950 border border-slate-700 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">New Features Coming Soon</h3>
                  <p className="text-slate-300 leading-relaxed">
                    We're working on AI-powered study recommendations, direct professor messaging, and advanced analytics.
                    Stay tuned for updates!
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center py-8 border-t border-slate-800"
          >
            <p className="text-slate-400 text-sm">
              Last updated: Just now | System Status: <span className="text-green-400">✓ All Systems Normal</span>
            </p>
          </motion.footer>
        </div>
      </main>
    </div>
  );
}
