'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Heart, Smile, Zap, Users, Sparkles, Loader, Send, Droplets, Coffee, Bell, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PAGE_BG = "bg-[#FDF9F1] text-[#1A1A1A]";
const CARD = "bg-white border-2 border-[#1A1A1A] rounded-3xl shadow-[4px_4px_0_0_#1A1A1A]";
const SUBTLE_CARD = "bg-[#F8F1E7] border-2 border-[#1A1A1A] rounded-3xl";

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function WellbeingPage() {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(2);
  const [breathing, setBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Ready');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI wellness buddy. I\'m here to listen and support you. How are you feeling today? You can answer below and I\'ll give you personalized support.',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Reminders State
  const [waterInterval, setWaterInterval] = useState(60);
  const [breakInterval, setBreakInterval] = useState(45);
  const [waterActive, setWaterActive] = useState(false);
  const [breakActive, setBreakActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathing) {
      setBreathingPhase('Breathe In');
      let time = 0;
      interval = setInterval(() => {
        time = (time + 1) % 10;
        if (time === 0) setBreathingPhase('Breathe In');
        else if (time === 4) setBreathingPhase('Hold');
        else if (time === 6) setBreathingPhase('Relax');
      }, 1000);
    } else {
      setBreathingPhase('Ready');
    }
    return () => clearInterval(interval);
  }, [breathing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/wellness/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          moodLevel: mood,
          stressLevel: stress,
          chatHistory: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          role: 'ai',
          content: data.response,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiMessage]);
        if (data.offline) {
          setOfflineMode(true);
        }
      } else {
        const errorMessage: Message = {
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'ai',
        content: 'Connection error. Please check your internet and try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const peerListeners = [
    { id: '1', name: 'Priya', rating: 4.8, sessions: 23, status: 'online' },
    { id: '2', name: 'Rahul', rating: 4.6, sessions: 18, status: 'online' },
    { id: '3', name: 'Zara', rating: 4.9, sessions: 31, status: 'offline' },
  ];

  // Fetch recommendations when mood or stress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 1000);

    return () => clearTimeout(timer);
  }, [mood, stress]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wellness/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: mood + 1,
          stressLevel: stress,
          activities: breathing ? 'Doing breathing exercises' : 'Regular activities',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        if (data.offline) {
          setOfflineMode(true);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${PAGE_BG} flex flex-col min-h-screen`}>
      <header className="pt-28 pb-10 px-6 sm:px-10 bg-[#FDF1DC] border-b-2 border-[#1A1A1A] rounded-b-[2.5rem] shadow-[0_10px_0_0_#1A1A1A]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-[#1A1A1A] rounded-full shadow-[3px_3px_0_0_#1A1A1A] text-sm font-semibold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDE6F2] border-2 border-[#1A1A1A]">
                <Heart className="w-4 h-4 text-[#E11D48]" />
              </span>
              <span className="tracking-wide uppercase text-xs">Neural Core · Check-In</span>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Wellbeing
              </h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base text-[#7C6A58]">
                Track your mood, sync your breathing, and lean on peers when things feel heavy. All in one soft dashboard.
              </p>
            </div>
          </div>
          <div className="md:self-end w-full md:w-auto">
            <div className={`${CARD} px-5 py-4 bg-[#FFF7E8] flex flex-col gap-3`}>
              <div className="flex items-center justify-between text-xs font-semibold text-[#7C6A58]">
                <span className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#22C55E]" />
                  Mood today
                </span>
                <span className="px-2 py-0.5 rounded-full border border-[#1A1A1A] bg-white text-[11px]">
                  {moodLabels[mood]}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#7C6A58]">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F97316]" />
                  Stress load
                </span>
                <span className="px-2 py-0.5 rounded-full border border-[#1A1A1A] bg-white text-[11px]">
                  {stress}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
          {/* Mood Tracker */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Check-in</h2>
            <p className="text-sm text-[#7C6A58] mb-4">Tap how you feel right now – we&apos;ll tune the dashboard around you.</p>
            <div className={`${CARD} p-8`}>
              <div className="flex justify-between items-center mb-6">
                {moodEmojis.map((emoji, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }} onClick={() => setMood(idx)} className={`text-5xl transition-all ${mood === idx ? 'scale-125' : 'opacity-50'}`}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
              <input type="range" min="0" max="4" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full mb-3 accent-[#F97316]" />
              <p className="text-center text-sm font-medium text-[#7C6A58]">{moodLabels[mood]}</p>
            </div>
          </motion.section>

          {/* Breathing Exercise */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Ground · Breathing Loop</h2>
            <div className={`${CARD} p-8 text-center bg-[#FFF7E8]`}>
              <motion.div
                animate={{ scale: breathing ? [1, 1.5, 1.5, 1] : 1 }}
                transition={{ duration: 10, times: [0, 0.4, 0.6, 1], ease: "easeInOut", repeat: breathing ? Infinity : 0 }}
                className="w-48 h-48 bg-linear-to-br from-[#4F46E5] to-[#22C55E] rounded-full mx-auto mb-6 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-[#4F46E5]/40"
              >
                {breathingPhase}
              </motion.div>
              <p className="text-[#7C6A58] text-sm mb-4">Follow the circle – breathe in, hold, and soften your shoulders as you exhale.</p>
              <button
                onClick={() => setBreathing(!breathing)}
                className="px-6 py-2 rounded-full border-2 border-[#1A1A1A] bg-[#F97316] text-[#1A1A1A] font-semibold shadow-[3px_3px_0_0_#1A1A1A] hover:-translate-y-0.5 transition-transform"
              >
                {breathing ? 'Stop' : 'Start'} Exercise
              </button>
            </div>
          </motion.section>

          {/* Soothing Sound Music Player */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" /> Soothing Sound
            </h2>
            <div className={`${CARD} p-6 flex flex-col gap-3`}>
              <p className="text-[#7C6A58] text-sm">
                Plug in your earphones, close your eyes, and let this gentle ambient track help you unwind.
              </p>
              <audio controls className="w-full mt-2 rounded-lg">
                <source src="/audio/soothing-sound.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-xs text-[#9A8774] mt-1">
                If you don&apos;t hear anything, make sure the file is available at
                <span className="font-mono"> /public/audio/soothing-sound.mp3</span> in the project.
              </p>
            </div>
          </motion.section>

          {/* Wellness Reminders */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Bell className="w-6 h-6 text-yellow-500" /> Flow · Tiny nudges
            </h2>
            <p className="text-sm text-[#7C6A58] mb-6">Hydrate, move, and blink away from the screen – your body keeps score.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Water Reminder */}
              <div className={`${CARD} p-6 flex flex-col items-center text-center bg-[#E0F9FF]`}>
                <div className="p-4 bg-white border-2 border-[#1A1A1A] rounded-full mb-4 shadow-[3px_3px_0_0_#1A1A1A]">
                  <Droplets className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold mb-1">Water Reminder</h3>
                <p className="text-[#7C6A58] text-sm mb-4">Stay hydrated to keep your focus sharp</p>
                <div className="flex items-center gap-3 w-full max-w-50 mb-4">
                  <Clock className="w-5 h-5 text-[#9A8774] hidden sm:block" />
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={waterInterval}
                    onChange={(e) => setWaterInterval(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] px-3 py-2 rounded-2xl outline-none shadow-[2px_2px_0_0_#1A1A1A]"
                    disabled={waterActive}
                  />
                  <span className="text-[#7C6A58] text-sm">mins</span>
                </div>
                <button
                  onClick={() => setWaterActive(!waterActive)}
                  className={`w-full py-2 font-semibold rounded-full border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] transition-transform ${waterActive ? 'bg-white text-[#1A1A1A]' : 'bg-[#22C55E] text-[#1A1A1A]'}`}
                >
                  {waterActive ? 'Pause Reminder' : 'Start Reminder'}
                </button>
              </div>

              {/* Break Reminder */}
              <div className={`${CARD} p-6 flex flex-col items-center text-center bg-[#FFEFD8]`}>
                <div className="p-4 bg-white border-2 border-[#1A1A1A] rounded-full mb-4 shadow-[3px_3px_0_0_#1A1A1A]">
                  <Coffee className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold mb-1">Break Reminder</h3>
                <p className="text-[#7C6A58] text-sm mb-4">Take regular breaks to avoid burnout</p>
                <div className="flex items-center gap-3 w-full max-w-50 mb-4">
                  <Clock className="w-5 h-5 text-[#9A8774] hidden sm:block" />
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={breakInterval}
                    onChange={(e) => setBreakInterval(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] px-3 py-2 rounded-2xl outline-none shadow-[2px_2px_0_0_#1A1A1A]"
                    disabled={breakActive}
                  />
                  <span className="text-[#7C6A58] text-sm">mins</span>
                </div>
                <button
                  onClick={() => setBreakActive(!breakActive)}
                  className={`w-full py-2 font-semibold rounded-full border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] transition-transform ${breakActive ? 'bg-white text-[#1A1A1A]' : 'bg-[#FDBA74] text-[#1A1A1A]'}`}
                >
                  {breakActive ? 'Pause Reminder' : 'Start Reminder'}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Stress Level */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Stress Level</h2>
            <div className={`${CARD} p-6`}>
              <input type="range" min="0" max="10" value={stress} onChange={e => setStress(Number(e.target.value))} className="w-full mb-4 accent-[#F97316]" />
              <div className="flex items-center justify-between">
                <span className="text-[#7C6A58] text-sm">Current load</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F1E5D4] rounded-full h-2 w-24 overflow-hidden border border-[#1A1A1A]">
                    <div className="bg-linear-to-r from-[#FACC15] to-[#EF4444] h-2" style={{ width: `${(stress / 10) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{stress}/10</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* AI Wellness Recommendations */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" /> Neural Suggestions
            </h2>
            <p className="text-sm text-[#7C6A58] mb-4">Tiny, AI-shaped nudges tuned to your current mood and stress.</p>
            <div className={`${SUBTLE_CARD} p-8 shadow-[4px_4px_0_0_#1A1A1A]`}>
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-[#7C6A58]">
                  <Loader className="w-5 h-5 animate-spin text-[#F97316]" />
                  Generating personalized recommendations...
                </div>
              ) : recommendations ? (
                <div className="space-y-4 text-[#4A3B2C] prose max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-[#1A1A1A] font-bold text-lg mt-4 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-[#1A1A1A] font-bold text-base mt-3 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-[#1A1A1A] font-semibold text-sm mt-2 mb-1" {...props} />,
                      p: ({ node, ...props }) => <p className="text-[#4A3B2C] text-sm leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="text-[#1A1A1A] font-semibold" {...props} />,
                      ol: ({ node, ...props }) => <ol className="space-y-3 list-decimal list-inside" {...props} />,
                      ul: ({ node, ...props }) => <ul className="space-y-2 list-disc list-inside" {...props} />,
                      li: ({ node, ...props }) => <li className="text-[#4A3B2C] text-sm" {...props} />,
                    }}
                  >
                    {recommendations}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-[#7C6A58] text-center text-sm">Personalizing your recommendations...</p>
              )}
            </div>
          </motion.section>

          {/* AI Chat */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-500" /> Talk it out
              </h2>
              {offlineMode && (
                <div className="bg-[#FEF3C7] border-2 border-[#1A1A1A] px-3 py-1 rounded-full text-xs font-semibold text-[#92400E] shadow-[2px_2px_0_0_#1A1A1A]">
                  📡 Offline Mode
                </div>
              )}
            </div>
            <div className={`${CARD} overflow-hidden flex flex-col h-96 bg-[#FFF7E8]`}>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[#7C6A58] text-sm text-center">
                    <p>Start a conversation with your AI wellness mentor. Share what's on your mind!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {chatMessages.map((message, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={
                            message.role === 'user'
                              ? 'max-w-xs px-4 py-2 rounded-2xl text-sm bg-[#DCFCE7] border-2 border-[#16A34A] rounded-br-sm'
                              : 'max-w-xs px-4 py-2 rounded-2xl text-sm bg-white border-2 border-[#1A1A1A] rounded-bl-sm'
                          }
                        >
                          <p className="leading-relaxed text-[#1A1A1A]">{message.content}</p>
                          <p className="text-[10px] opacity-70 mt-1 text-[#7C6A58]">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl rounded-bl-sm px-4 py-2 flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-[#F97316]" />
                      <span className="text-sm text-[#1A1A1A]">AI is thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t-2 border-[#1A1A1A] bg-[#FFEFD8] px-4 py-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder="Type your thoughts or feelings..."
                  disabled={chatLoading}
                  className="flex-1 bg-white text-[#1A1A1A] rounded-2xl px-3 py-2 border-2 border-[#1A1A1A] focus:outline-none focus:ring-0 shadow-[2px_2px_0_0_#1A1A1A] disabled:opacity-50 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-[#F97316] hover:bg-[#FACC15] disabled:bg-[#F5D0B5] text-[#1A1A1A] px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A]"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Peer Listeners */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Peer Links</h2>
            <p className="text-sm text-[#7C6A58] mb-6">Student listeners who get it. Reach out when you don&apos;t want to carry it alone.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peerListeners.map((listener, idx) => (
                <motion.div
                  key={listener.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  className={`${CARD} p-6 hover:-translate-y-1 transition-transform bg-[#FFFFFF]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1A1A1A]">{listener.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-[#7C6A58] mt-1">
                        <span>⭐ {listener.rating}</span>
                        <span>•</span>
                        <span>{listener.sessions} sessions</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-bold border-2 border-[#1A1A1A] ${listener.status === 'online' ? 'bg-[#BBF7D0] text-[#166534]' : 'bg-[#E5E7EB] text-[#4B5563]'
                        }`}
                    >
                      {listener.status === 'online' ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 rounded-full border-2 border-[#1A1A1A] bg-[#F97316] text-[#1A1A1A] font-semibold shadow-[3px_3px_0_0_#1A1A1A] hover:-translate-y-0.5 transition-transform">
                    Connect
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
