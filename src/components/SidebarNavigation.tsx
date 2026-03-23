'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, Home, MessageCircle, User, BarChart3, AlertTriangle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SidebarNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { icon: Home, href: '/', label: 'Dashboard' },
    { icon: MessageCircle, href: '/community', label: 'Community' },
    { icon: User, href: '/profile', label: 'Profile' },
    { icon: BarChart3, href: '/polls', label: 'Polls' },
    { icon: AlertTriangle, href: '/sos', label: 'SOS' },
    { icon: Settings, href: '#', label: 'Settings' },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 shadow-2xl flex flex-col items-center py-6 z-50 border-r border-slate-700"
    >
      {/* Logo */}
      <Link
        href="/"
        className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg hover:shadow-xl transition-all hover:scale-110 mb-8"
      >
        📚
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-6">
        {navItems.map((item, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={item.href}
              title={item.label}
              className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-300 hover:text-white transition-all group shadow-lg hover:shadow-xl"
            >
              <item.icon className="w-6 h-6" />
              {/* Tooltip */}
              <div className="absolute left-20 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4">
        {/* User Avatar */}
        {user ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={user.name}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {user.name.charAt(0).toUpperCase()}
          </motion.button>
        ) : null}

        {/* Logout Button */}
        {user ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            title="Logout"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-600/20 hover:bg-red-600/40 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 hover:text-red-400 transition-all shadow-lg hover:shadow-xl group relative"
          >
            <LogOut className="w-6 h-6" />
            {/* Tooltip */}
            <div className="absolute left-20 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Logout
            </div>
          </motion.button>
        ) : null}
      </div>
    </motion.aside>
  );
}
