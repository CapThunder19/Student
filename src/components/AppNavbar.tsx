'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Home, Shield, BookOpen, Heart, Users, Home as HouseIcon, Wallet, MessageCircle, User, Megaphone, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppNavbar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const modules = [
    { icon: Home, href: '/', label: 'Home', theme: 'bg-white' },
    { icon: AlertTriangle, href: '/sos', label: 'SOS', theme: 'bg-red-200' },
    { icon: Shield, href: '/safecommute', label: 'Safety', theme: 'bg-[#A7F3D0]' },
    { icon: BookOpen, href: '/academics', label: 'Academics', theme: 'bg-[#A594F1]' },
    { icon: Heart, href: '/wellbeing', label: 'Wellbeing', theme: 'bg-[#FDC029]' },
    { icon: Megaphone, href: '/complaints', label: 'Complaints', theme: 'bg-[#EA7A34]' },
    { icon: Users, href: '/community', label: 'Community', theme: 'bg-[#A7F3D0]' },
    { icon: HouseIcon, href: '/housing', label: 'Housing', theme: 'bg-[#A594F1]' },
    { icon: Wallet, href: '/budget', label: 'Budget', theme: 'bg-[#FDC029]' },
    { icon: User, href: '/profile', label: 'Profile', theme: 'bg-[#EA7A34]' },
  ];

  return (
    <motion.div 
      variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: "-150%", opacity: 0 } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none flex gap-3 sm:gap-4 items-center w-full justify-center px-4"
    >
      
      {/* 1. Main Navigation Block (Detached) */}
      <div className="pointer-events-auto bg-[rgba(253,249,241,0.95)] backdrop-blur-md border-[2px] border-[#1A1A1A] rounded-[20px] shadow-[4px_4px_0_0_#1A1A1A] px-2 py-1.5 hidden md:flex items-center gap-1">
        
        {modules.map((mod, idx) => {
           const isActive = pathname === mod.href;
           return (
             <div key={idx} className="relative group shrink-0">
                <Link
                  href={mod.href}
                  className={`w-10 h-10 flex items-center justify-center rounded-[12px] transition-all border-[2px] ${isActive ? `border-[#1A1A1A] ${mod.theme} shadow-sm translate-y-[1px]` : 'border-transparent hover:border-[#1A1A1A] hover:bg-gray-50 hover:-translate-y-1'}`}
                >
                  <mod.icon className={`w-4 h-4 ${isActive ? 'text-[#1A1A1A] stroke-[2.5]' : 'text-gray-600 stroke-[2.5] group-hover:text-[#1A1A1A]'}`} />
                </Link>
                {/* Brutalist Tooltip */}
                <div className="absolute top-[50px] left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-[#FDF9F1] text-[11px] font-black px-3 py-1.5 rounded-[8px] border-[2px] border-[#1A1A1A] shadow-[2px_2px_0_0_#EA7A34] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {mod.label}
                </div>
             </div>
           );
        })}

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Auth button: always show Logout here */}
        <button
          type="button"
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch {
              // ignore
            }
            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
              }
            } catch {
              // ignore
            }
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
          className="ml-1 px-3 py-1.5 text-xs font-bold rounded-[12px] border-[2px] border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#EA7A34] hover:text-[#1A1A1A] hover:-translate-y-0.5 transition-all"
        >
          Logout
        </button>
      </div>

    </motion.div>
  );
}
