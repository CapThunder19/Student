'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LogOut,
  Home,
  Shield,
  BookOpen,
  Heart,
  Users,
  Home as HouseIcon,
  Wallet,
  User,
  BarChart3,
  AlertTriangle,
  Settings,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscordSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/login');
  };

  // Discord-like modules/servers
  const modules = [
    { icon: Home, href: '/', label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, href: '/safecommute', label: 'Safety', color: 'from-red-500 to-red-600' },
    { icon: BookOpen, href: '/academics', label: 'Academics', color: 'from-purple-500 to-purple-600' },
    { icon: Heart, href: '/wellbeing', label: 'Wellbeing', color: 'from-pink-500 to-pink-600' },
    { icon: Users, href: '/community', label: 'Community', color: 'from-green-500 to-green-600' },
    { icon: HouseIcon, href: '/housing', label: 'Housing', color: 'from-orange-500 to-orange-600' },
    { icon: Wallet, href: '/budget', label: 'Budget', color: 'from-yellow-500 to-yellow-600' },
  ];

  const secondaryItems = [
    { icon: User, href: '/profile', label: 'Profile' },
    { icon: BarChart3, href: '/polls', label: 'Polls' },
    { icon: AlertTriangle, href: '/sos', label: 'SOS' },
    { icon: Settings, href: '#', label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Main Sidebar - Modules/Servers (Discord style) */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 80 }}
        transition={{ duration: 0.2 }}
        className="w-20 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 space-y-2 overflow-y-auto"
      >
        {/* Home/Logo */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg hover:rounded-3xl transition-all"
        >
          📚
        </motion.button>

        {/* Divider */}
        <div className="w-8 h-1 bg-slate-700 rounded-full"></div>

        {/* Module Icons (like Discord servers) */}
        {modules.map((module, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link
              href={module.href}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all group relative ${
                pathname === module.href
                  ? `bg-gradient-to-br ${module.color} text-white shadow-lg`
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={module.label}
            >
              <module.icon className="w-6 h-6" />

              {/* Tooltip */}
              <div className="absolute left-20 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700">
                {module.label}
              </div>

              {/* Active indicator (Discord style) */}
              {pathname === module.href && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                />
              )}
            </Link>
          </motion.div>
        ))}

        {/* Divider */}
        <div className="w-8 h-1 bg-slate-700 rounded-full my-2"></div>

        {/* Secondary Items */}
        {secondaryItems.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link
              href={item.href}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />

              {/* Tooltip */}
              <div className="absolute left-20 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700">
                {item.label}
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Bottom Actions */}
        {user ? (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center hover:shadow-lg transition-all"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-12 h-12 rounded-lg bg-slate-800 text-red-500 hover:text-red-400 hover:bg-slate-700 flex items-center justify-center transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </>
        ) : null}
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden" />
    </div>
  );
}
