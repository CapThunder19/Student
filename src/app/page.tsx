'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  Shield,
  BookOpen,
  Heart,
  Users,
  Home as HouseIcon,
  Wallet,
  ArrowRight,
  Search,
} from 'lucide-react';

const THIN_SHADOW = "shadow-sm hover:shadow-md transition-all duration-300";
const THIN_BORDER = "border-[2px] border-[#1A1A1A]";

const modules = [
  {
    icon: Shield,
    title: 'Safe Commute',
    description: 'Real-time GPS tracking & emergency alerts to keep you secure on campus.',
    href: '/safecommute',
    color: 'bg-[#A7F3D0]', // Mint
    align: 'left',
  },
  {
    icon: BookOpen,
    title: 'Academics',
    description: 'Doubt pool, flashcards, and smart learning materials for top grades.',
    href: '/academics',
    color: 'bg-[#A594F1]', // Lavender
    align: 'right',
  },
  {
    icon: Heart,
    title: 'Wellbeing',
    description: 'Mood tracking, breathing exercises, and peer support when you need it.',
    href: '/wellbeing',
    color: 'bg-[#FDC029]', // Yellow
    align: 'left',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Campus events, lost & found, and project partnerships.',
    href: '/community',
    color: 'bg-[#F2E9E1]', // Beige
    align: 'right',
  },
  {
    icon: HouseIcon,
    title: 'Housing',
    description: 'Verified PG and flat listings directly from owners.',
    href: '/housing',
    color: 'bg-[#A7F3D0]', // Mint
    align: 'left',
  },
  {
    icon: Wallet,
    title: 'Budget',
    description: 'Track daily expenses and manage your finances effortlessly.',
    href: '/budget',
    color: 'bg-[#A594F1]', // Lavender
    align: 'right',
  },
];

export default function Home() {
  return (
    <div className="relative w-full text-[#1A1A1A] font-sans selection:bg-[#EA7A34] selection:text-[#1A1A1A] bg-[#FDF9F1]">
      {/* Navbar - Sticky corner items */}
      <nav className="fixed top-0 w-full p-4 sm:p-8 flex justify-between items-start z-[100] pointer-events-none">
        {/* Logo Box */}
        <div className="text-2xl sm:text-3xl font-black tracking-tighter pointer-events-auto bg-white px-6 py-3 rounded-[24px] border-[2px] border-[#1A1A1A] shadow-sm transform -rotate-2 hover:rotate-0 transition-transform">
          STUDENT<span className="text-[#EA7A34]">.APP</span>
        </div>
        {/* Top right actions */}
        <div className="flex gap-4 pointer-events-auto mr-8 md:mr-16 lg:mr-20">
          <Link href="/login" className="font-bold text-lg bg-white px-6 py-3 rounded-[24px] border-[2px] border-[#1A1A1A] hover:bg-[#FDF9F1] transition-colors shadow-sm hidden sm:block transform rotate-1 hover:rotate-0">
            Log In
          </Link>
          <Link href="/signup" className="font-bold text-lg bg-[#A594F1] px-6 py-3 rounded-[24px] border-[2px] border-[#1A1A1A] hover:bg-[#A7F3D0] transition-colors shadow-sm rotate-2 hover:rotate-0 flex items-center gap-2">
            Register <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </nav>

      {/* 1. Hero Stack (Light Mode, Flying Text Icons) */}
      <HeroSection />

      {/* 2. Modules Stack (Orange, Overlaps Hero) */}
      <ModulesSection />

      {/* 3. Footer Stack (Dark CTA) */}
      <FooterCTASection />

      {/* Sticky Bottom Search / Action Bar */}
      <motion.div
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: 'spring' }}
        className="fixed bottom-6 sm:bottom-8 z-50 px-4 w-full flex justify-center pointer-events-none transition-all"
      >
        <div className="pointer-events-auto bg-white border-[2px] border-[#1A1A1A] rounded-[40px] shadow-md p-2 flex items-center gap-2 w-full max-w-md transform transition-transform hover:scale-105">
          <div className="w-12 h-12 bg-[#FDC029] rounded-full border-[2px] border-[#1A1A1A] flex items-center justify-center shrink-0">
            <Search className="w-6 h-6 stroke-[2]" />
          </div>
          <input
            type="text"
            placeholder="Search features..."
            className="flex-1 bg-transparent border-none outline-none font-bold text-lg placeholder:text-[#1A1A1A]/40 px-2"
          />
          <Link href="/dashboard" className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-bold whitespace-nowrap hidden sm:block shrink-0 border-[2px] border-[#1A1A1A] hover:bg-[#EA7A34] hover:text-[#1A1A1A] transition-all">
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// --- Sections ---

const FlyingIcon = ({ icon: Icon, color, progress, startX, startY, startScale = 4, triggerEnd = 0.5, rotateOffset = 0 }: any) => {
  // X and Y travel from their designated scattered points (free space) directly into the inline sentence
  const x = useTransform(progress, [0, triggerEnd], [startX, "0vw"]);
  const y = useTransform(progress, [0, triggerEnd], [startY, "0vh"]);
  const scale = useTransform(progress, [0, triggerEnd], [startScale, 1]);
  const rotate = useTransform(progress, [0, triggerEnd], [rotateOffset, 0]);

  return (
    <span className="inline-block align-middle mx-1 sm:mx-3 z-10">
      <motion.span
        style={{ x, y, scale, rotate }}
        className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 border-[2px] border-[#1A1A1A] ${color} rounded-[12px] lg:rounded-[20px] overflow-hidden origin-center`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#1A1A1A] stroke-[2]" />
      </motion.span>
    </span>
  )
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  return (
    <div ref={ref} className="h-[200vh] relative w-full bg-[#FDF9F1] z-0">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-between overflow-hidden px-4 md:px-8 py-24 sm:py-32">

        {/* TOP: Main Title */}
        <div className="text-center w-full z-10 flex flex-col items-center mb-auto pt-10">
          <h1 className="text-5xl sm:text-6xl lg:text-[6.5rem] font-black leading-[1.0] tracking-tighter text-[#1A1A1A]">
            Your campus life, <br />
            <span className="bg-[#EA7A34] px-8 py-3 rounded-[40px] border-[2px] border-[#1A1A1A] inline-block -rotate-2 mt-4 shadow-sm">synchronized.</span>
          </h1>
        </div>

        {/* MIDDLE: Free Space for Icons */}
        <div className="flex-1 w-full relative pointer-events-none" />

        {/* BOTTOM: Sentence waiting for icons */}
        <div className="text-center w-full relative z-10 flex flex-col items-center pb-20">
          <div className="text-2xl sm:text-4xl lg:text-[45px] leading-[1.8] lg:leading-[2.0] normal-case font-bold text-[#1A1A1A] max-w-6xl w-full tracking-tight">
            Manage your
            <FlyingIcon icon={BookOpen} color="bg-[#A594F1]" progress={scrollYProgress} startX="-25vw" startY="-50vh" triggerEnd={0.4} rotateOffset={-35} startScale={3} />
            classes, track your
            <FlyingIcon icon={Wallet} color="bg-[#FDC029]" progress={scrollYProgress} startX="20vw" startY="-60vh" triggerEnd={0.5} rotateOffset={25} startScale={4.5} />
            budget,<br className="hidden xl:block" />
            find
            <FlyingIcon icon={HouseIcon} color="bg-[#A7F3D0]" progress={scrollYProgress} startX="-15vw" startY="-45vh" triggerEnd={0.45} rotateOffset={-15} startScale={3.5} />
            housing, and connect with your
            <FlyingIcon icon={Users} color="bg-[#EA7A34]" progress={scrollYProgress} startX="30vw" startY="-40vh" triggerEnd={0.55} rotateOffset={40} startScale={4} />
            community.
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
          className="absolute bottom-6 flex flex-col items-center gap-2 text-[#1A1A1A] z-10"
        >
          <span className="font-black uppercase tracking-widest text-[11px] sm:text-xs">Scroll to assemble</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-[3px] sm:border-[4px] border-[#1A1A1A] rounded-full flex justify-center p-1.5 bg-white shadow-md mt-1"
          >
            <div className="w-1.5 h-2.5 bg-[#1A1A1A] rounded-full" />
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

function ModulesSection() {
  const ref = useRef(null);
  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"]
  });

  // Zooming text effect
  const contentScale = useTransform(entranceProgress, [0, 1], [1.1, 1]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  return (
    <div ref={ref} className="relative z-10 bg-[#EA7A34] rounded-t-[40px] sm:rounded-t-[80px] border-t-[2px] border-[#1A1A1A] pb-32 min-h-screen w-full mt-[-2px] pt-24 sm:pt-40 shadow-xl overflow-hidden">

      {/* Introduction Header */}
      <motion.div style={{ scale: contentScale }} className="flex flex-col items-center justify-center text-center px-4 w-full origin-top mb-32 z-20 relative">
        <div className="flex items-center gap-3 bg-[#1A1A1A] text-[#FDF9F1] px-6 py-2 rounded-full border-[2px] border-[#1A1A1A] shadow-sm mb-8">
          <span className="font-black bg-[#FDF9F1] text-[#1A1A1A] w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
          <span className="font-bold uppercase tracking-widest text-sm">Modules</span>
        </div>
        <h2 className="text-[14vw] sm:text-[10vw] font-black leading-[0.8] tracking-tighter text-[#1A1A1A]">
          Explore the <br /> Features
        </h2>
        <p className="mt-10 text-xl sm:text-2xl font-bold bg-[#FDF9F1] p-4 rounded-2xl border-[2px] border-[#1A1A1A] transform -rotate-1 max-w-2xl px-8 shadow-sm">
          Everything designed to make your campus life seamless and highly organized.
        </p>
      </motion.div>

      {/* Diagram & Cards */}
      <div className="w-full max-w-5xl mx-auto relative px-4 z-10">
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden lg:block z-0">
          <div className="absolute inset-0 bg-transparent border-l-[2px] border-dashed border-[#1A1A1A]/30" />
          <motion.div className="w-full bg-[#1A1A1A] origin-top relative z-10" style={{ scaleY: smoothProgress, height: '100%' }} />
        </div>

        <div className="space-y-32">
          {modules.map((mod, idx) => (
            <ModuleCard key={idx} mod={mod} index={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FooterCTASection() {
  return (
    <div className="relative z-20 bg-[#1A1A1A] rounded-t-[40px] sm:rounded-t-[80px] border-t-[4px] border-[#1A1A1A] min-h-[90vh] w-full flex flex-col items-center justify-center px-4 mt-[-40px] sm:mt-[-80px] pt-32 pb-40 shadow-xl">

      <div className="max-w-4xl text-center mb-24 relative px-4 flex flex-col items-center z-10">
        <ScrollingText text="Bring order to chaos." />
        <ScrollingText text="Empowering your journey." />
      </div>

      <div className="bg-[#F2E9E1] text-[#1A1A1A] p-8 sm:p-24 rounded-[40px] w-full max-w-5xl border-[4px] border-[#1A1A1A] shadow-[16px_16px_0_0_#A7F3D0] flex flex-col items-center text-center transform -rotate-1 relative z-20">
        <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tighter leading-[0.9]">
          Ready to <br />start?
        </h2>
        <p className="text-xl sm:text-2xl mb-12 max-w-2xl text-[#1A1A1A]/80 font-bold tracking-tight">
          Join thousands of students and simplify your campus life today.
        </p>
        <Link href="/dashboard" className="text-2xl sm:text-4xl font-black bg-[#EA7A34] text-[#1A1A1A] px-10 py-6 sm:px-14 sm:py-8 rounded-[40px] border-[4px] border-[#1A1A1A] hover:bg-[#FDC029] transition-all shadow-[8px_8px_0_0_#1A1A1A] hover:shadow-[12px_12px_0_0_#1A1A1A] hover:-translate-y-2 flex items-center gap-4 group">
          ENTER NOW
          <ArrowRight className="w-10 h-10 sm:w-12 sm:h-12 group-hover:translate-x-3 transition-transform" strokeWidth={4} />
        </Link>
      </div>
    </div>
  )
}

// --- Subcomponents ---

function ModuleCard({ mod, index }: { mod: any, index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1.2", "0.5 0.5"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  const isLeft = mod.align === 'left';

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className={`flex flex-col lg:flex-row items-center gap-4 sm:gap-12 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} relative z-10 w-full`}
    >
      <div className={`flex-1 flex ${isLeft ? 'justify-end' : 'justify-start'} w-full lg:w-1/2`}>
        <div className={`w-full max-w-[440px] ${mod.color} p-8 sm:p-10 rounded-[40px] ${THIN_BORDER} ${THIN_SHADOW} transform transition-transform hover:-translate-y-2 group relative z-20`}>

          <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-[2px] border-[#1A1A1A] bg-[#FDF9F1] z-20 items-center justify-center shadow-sm ${isLeft ? '-right-[4.2rem] translate-x-1/2' : '-left-[4.2rem] -translate-x-1/2'}`}>
            <div className="w-3 h-3 rounded-full bg-[#1A1A1A]" />
          </div>

          <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 h-[2px] bg-[#1A1A1A] z-10 ${isLeft ? '-right-12 w-12' : '-left-12 w-12'}`} />

          <div className={`w-20 h-20 rounded-3xl bg-white border-[2px] border-[#1A1A1A] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform origin-bottom-left`}>
            <mod.icon className="w-10 h-10 text-[#1A1A1A]" strokeWidth={2} />
          </div>

          <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tighter leading-tight bg-white inline-block px-4 py-1 rounded-[16px] border-[2px] border-[#1A1A1A] shadow-sm">{mod.title}</h3>
          <p className="text-xl font-bold text-[#1A1A1A] leading-snug mb-8">{mod.description}</p>

          <Link href={mod.href} className="inline-flex items-center gap-3 font-black text-xl bg-white px-8 py-4 rounded-[20px] border-[2px] border-[#1A1A1A] shadow-sm hover:bg-[#1A1A1A] hover:text-[#FDF9F1] transition-colors group/btn">
            Explore
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" strokeWidth={2} />
          </Link>
        </div>
      </div>
      <div className="flex-1 hidden lg:block" />
    </motion.div>
  );
}

// Dynamic text opacity component
function ScrollingText({ text }: { text: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.5 0.5"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [0.2, 0.5, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <motion.h3
      ref={ref}
      style={{ opacity, scale }}
      className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1] mb-6 inline-block text-[#FDF9F1]"
    >
      {text}
    </motion.h3>
  );
}
