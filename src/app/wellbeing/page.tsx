'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, Smile, Zap, Users } from 'lucide-react';

export default function WellbeingPage() {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(2);
  const [breathing, setBreathing] = useState(false);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const peerListeners = [
    { id: '1', name: 'Priya', rating: 4.8, sessions: 23, status: 'online' },
    { id: '2', name: 'Rahul', rating: 4.6, sessions: 18, status: 'online' },
    { id: '3', name: 'Zara', rating: 4.9, sessions: 31, status: 'offline' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-pink-600 bg-opacity-20">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Wellbeing</h1>
            <p className="text-slate-400 text-sm">Mental health & peer support</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Mood Tracker */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">How are you feeling today?</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                {moodEmojis.map((emoji, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }} onClick={() => setMood(idx)} className={`text-5xl transition-all ${mood === idx ? 'scale-125' : 'opacity-50'}`}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
              <input type="range" min="0" max="4" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full" />
            </div>
          </motion.section>

          {/* Breathing Exercise */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Breathing Exercise</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <motion.div animate={{ scale: breathing ? [1, 1.5, 1] : 1 }} transition={{ duration: 4, repeat: breathing ? Infinity : 0 }} className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-6" />
              <button onClick={() => setBreathing(!breathing)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                {breathing ? 'Stop' : 'Start'} Exercise
              </button>
            </div>
          </motion.section>

          {/* Stress Level */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Stress Level</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <input type="range" min="0" max="10" value={stress} onChange={e => setStress(Number(e.target.value))} className="w-full mb-4" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current: </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 rounded-full h-2 w-24">
                    <div className="bg-gradient-to-r from-yellow-500 to-red-500 h-2 rounded-full" style={{ width: `${(stress / 10) * 100}%` }} />
                  </div>
                  <span className="text-white font-bold">{stress}/10</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Peer Listeners */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Connect with Peer Listeners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peerListeners.map((listener, idx) => (
                <motion.div key={listener.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.08 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-750 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{listener.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <span>⭐ {listener.rating}</span>
                        <span>•</span>
                        <span>{listener.sessions} sessions</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${listener.status === 'online' ? 'bg-green-600 bg-opacity-20 text-green-400' : 'text-slate-400'}`}>
                      {listener.status === 'online' ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
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
