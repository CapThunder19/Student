'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { BookOpen, MessageCircle, Lightbulb, Search, Filter } from 'lucide-react';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'doubts' | 'flashcards' | 'notes'>('doubts');
  const [searchQuery, setSearchQuery] = useState('');

  const doubts = [
    { id: '1', title: 'How to solve differential equations?', course: 'Calculus', responses: 3, status: 'answered', time: '2 hours ago' },
    { id: '2', title: 'Quantum mechanics: Uncertainty principle', course: 'Physics', responses: 0, status: 'pending', time: '30 mins ago' },
    { id: '3', title: 'React hooks best practices', course: 'Web Dev', responses: 5, status: 'answered', time: '1 hour ago' },
  ];

  const flashcards = [
    { id: '1', course: 'Chemistry', q: 'What is a catalyst?', a: 'Substance that increases reaction rate', mastery: 85 },
    { id: '2', course: 'Biology', q: 'Mitochondria function', a: 'Energy production', mastery: 92 },
    { id: '3', course: 'History', q: 'French Revolution', a: '1789', mastery: 100 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-600 bg-opacity-20">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Academics</h1>
            <p className="text-slate-400 text-sm">Doubts, flashcards & notes</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mb-8 border-b border-slate-700 pb-4">
            {['doubts', 'flashcards', 'notes'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>

          {activeTab === 'doubts' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <div className="mb-8 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input type="text" placeholder="Search doubts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              <div className="space-y-4">
                {doubts.map((d, idx) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-750 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex-1">{d.title}</h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${d.status === 'answered' ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>
                        {d.status === 'answered' ? '✓' : '○'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{d.course}</p>
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" /> {d.responses}
                      </span>
                      <span>{d.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'flashcards' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card, idx) => (
                <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer h-72 flex flex-col justify-between group">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold mb-3">{card.course}</p>
                    <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors mb-4">{card.q}</h3>
                    <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">{card.a}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: `${card.mastery}%` }} />
                    </div>
                    <span className="text-slate-400 text-xs">{card.mastery}%</span>
                  </div>
                </motion.div>
              ))}
            </motion.section>
          )}

          {activeTab === 'notes' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <Lightbulb className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No notes yet. Create your first study note!</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                + Create Note
              </button>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
