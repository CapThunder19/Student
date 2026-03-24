'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Lightbulb, Search, Filter, BarChart3, Send, Sparkles, Loader } from 'lucide-react';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'doubts' | 'flashcards' | 'notes' | 'polls' | 'chatbot'>('doubts');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDb, setLoadingDb] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Real Database States
  const [doubts, setDoubts] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [votedPolls, setVotedPolls] = useState<Record<string, boolean>>({});

  // Doubts Expanding state
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState('');

  // Modals
  const [modalType, setModalType] = useState<null | 'doubt' | 'flashcard' | 'note' | 'poll'>(null);
  const [formData, setFormData] = useState<any>({});

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hi there! I\'m your automated Academic Assistant. How can I help you regarding courses, assignments, or campus resources today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/academics');
        const data = await res.json();
        if (res.ok) {
          setDoubts(data.doubts || []);
          setFlashcards(data.flashcards || []);
          setNotes(data.notes || []);
          setPolls(data.polls || []);
        }
      } catch (err) {
        console.error('Failed to fetch academics data', err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchData();
  }, []);

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (votedPolls[pollId]) return;
    
    // Optimistic update
    setVotedPolls((prev) => ({ ...prev, [pollId]: true }));
    setPolls((prev) => 
      prev.map((poll) => {
        if (poll._id === pollId) {
          const newPoll = { ...poll, totalVotes: poll.totalVotes + 1, options: [...poll.options] };
          newPoll.options[optionIndex] = {
            ...newPoll.options[optionIndex],
            votes: newPoll.options[optionIndex].votes + 1,
          };
          return newPoll;
        }
        return poll;
      })
    );

    try {
      await fetch('/api/academics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionIndex })
      });
    } catch (err) {
      console.error('Failed to vote', err);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userQuery = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/academics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I am facing network issues. Please try again later.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePostAnswer = async (doubtId: string) => {
    if (!answerInput.trim()) return;

    const currentAnswer = answerInput;
    setAnswerInput('');

    // Optimistic UI Update so the answer appears instantly
    setDoubts(prev => prev.map(d => {
      if (d._id === doubtId) {
        return {
          ...d,
          answers: [...(d.answers || []), { text: currentAnswer, createdAt: new Date().toISOString() }],
          responses: (d.responses || 0) + 1,
          status: 'answered'
        };
      }
      return d;
    }));

    try {
      const res = await fetch('/api/academics/doubt/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubtId, answer: currentAnswer })
      });

      if (res.ok) {
        const updatedDoubt = await res.json();
        // Only replace if the DB returns the expected answers array
        // (This prevents Next.js dev schema caching from hiding answers)
        if (updatedDoubt.answers) {
          setDoubts(prev => prev.map(d => d._id === doubtId ? updatedDoubt : d));
        }
      }
    } catch (err) {
      console.error('Failed to post answer', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (modalType === 'poll') {
        payload.options = formData.options.split(',').map((o: string) => o.trim()).filter(Boolean);
      }
      if (modalType === 'doubt') {
        payload.responses = 0;
        payload.status = 'pending';
        payload.time = 'Just now';
      }
      if (modalType === 'flashcard') {
        payload.mastery = 0;
      }
      
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: modalType, payload })
      });
      if (res.ok) {
        const newItem = await res.json();
        if (modalType === 'doubt') setDoubts(prev => [newItem, ...prev]);
        if (modalType === 'flashcard') setFlashcards(prev => [newItem, ...prev]);
        if (modalType === 'note') setNotes(prev => [newItem, ...prev]);
        if (modalType === 'poll') setPolls(prev => [newItem, ...prev]);
        setModalType(null);
        setFormData({});
      }
    } catch (err) {
      console.error('Failed to create item', err);
    }
  };

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-4 mb-8 border-b border-slate-700 pb-4">
            {[
              { id: 'doubts', label: 'Doubts' },
              { id: 'flashcards', label: 'Flashcards' },
              { id: 'notes', label: 'Notes' },
              { id: 'polls', label: 'Anonymous Polls' },
              { id: 'chatbot', label: 'Query Bot' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tab.label}
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
                <button onClick={() => setModalType('doubt')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold flex items-center gap-2">
                  + Ask a Doubt
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              <div className="space-y-4">
                {doubts.map((d: any, idx) => (
                  <motion.div 
                    key={d._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.08 }} 
                    className={`bg-slate-800 border ${expandedDoubtId === d._id ? 'border-blue-500' : 'border-slate-700 hover:border-slate-600'} rounded-xl p-6 transition-all group`}
                  >
                    <div className="cursor-pointer" onClick={() => setExpandedDoubtId(expandedDoubtId === d._id ? null : d._id)}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex-1">{d.title}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${d.status === 'answered' ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>
                          {d.status === 'answered' ? '✓ Answered' : '○ Pending'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{d.course}</p>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" /> {d.responses || d.answers?.length || 0}
                        </span>
                        <span>{d.time}</span>
                      </div>
                    </div>

                    {expandedDoubtId === d._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 pt-6 border-t border-slate-700">
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {d.answers && d.answers.length > 0 ? (
                            d.answers.map((ans: any, i: number) => (
                              <div key={i} className="bg-slate-750 p-4 rounded-lg bg-slate-900/50">
                                <p className="text-slate-200">{ans.text}</p>
                                <span className="text-xs text-slate-500 mt-2 block">
                                  {new Date(ans.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 italic text-center py-4">No answers yet. Be the first to help!</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={answerInput} 
                            onChange={(e) => setAnswerInput(e.target.value)} 
                            placeholder="Write your answer..." 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePostAnswer(d._id);
                            }}
                          />
                          <button 
                            onClick={() => handlePostAnswer(d._id)} 
                            disabled={!answerInput.trim()} 
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'flashcards' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-end mb-6">
                <button onClick={() => setModalType('flashcard')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  + Create Flashcard
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card: any, idx) => (
                <motion.div key={card._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer h-72 flex flex-col justify-between group">
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
              </div>
            </motion.section>
          )}

          {activeTab === 'notes' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-end mb-6">
                <button onClick={() => setModalType('note')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  + Create Note
                </button>
              </div>
              {notes.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
                  <Lightbulb className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No notes yet. Create your first study note!</p>
                  <button onClick={() => setModalType('note')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                    + Create Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note: any, idx) => (
                    <motion.div key={note._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer">
                      <p className="text-slate-400 text-sm font-semibold mb-2">{note.course}</p>
                      <h3 className="text-white font-bold text-lg mb-3">{note.title}</h3>
                      <p className="text-slate-300 text-sm line-clamp-4">{note.content}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'polls' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  Anonymous Student Polls
                </h2>
                <button onClick={() => setModalType('poll')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors">
                  + Create Poll
                </button>
              </div>
              <p className="text-slate-400 mb-6">Vote anonymously to shape our academic community.</p>

              {polls.map((poll, idx) => (
                <motion.div key={poll._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex-1">{poll.question}</h3>
                    <span className="bg-orange-900 bg-opacity-30 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {poll.endDate}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    {poll.options.map((option: any, optIdx: number) => {
                      const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={optIdx}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleVote(poll._id, optIdx)}>
                              <input 
                                type="radio" 
                                name={`poll-${poll._id}`} 
                                disabled={votedPolls[poll._id]}
                                checked={votedPolls[poll._id]}
                                onChange={() => handleVote(poll._id, optIdx)} 
                                className="w-4 h-4 accent-orange-500" 
                              />
                              <span className="text-slate-300 font-medium">{option.label}</span>
                            </label>
                            <span className="text-orange-400 font-bold">{percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-to-r from-orange-400 to-orange-600" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-slate-400 text-sm">{poll.totalVotes} total votes</p>
                </motion.div>
              ))}
            </motion.section>
          )}

          {activeTab === 'chatbot' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[600px] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex flex-col">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Academic Query Bot
                </h2>
                <p className="text-slate-400 text-sm">Ask about courses, deadlines, resources, and policies.</p>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 bg-slate-900 border-t border-slate-700 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Ask a question..." 
                  className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" disabled={!chatInput.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.section>
          )}
        </div>
      </main>

      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalType === 'doubt' && 'Ask a Doubt'}
              {modalType === 'flashcard' && 'Create Flashcard'}
              {modalType === 'note' && 'Create Note'}
              {modalType === 'poll' && 'Create Poll'}
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {modalType === 'doubt' && (
                <>
                  <input type="text" placeholder="Doubt Title" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
                  <input type="text" placeholder="Course Name" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, course: e.target.value})} />
                </>
              )}
              {modalType === 'flashcard' && (
                <>
                  <input type="text" placeholder="Course Name" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, course: e.target.value})} />
                  <input type="text" placeholder="Question" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, q: e.target.value})} />
                  <textarea placeholder="Answer" required rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" onChange={e => setFormData({...formData, a: e.target.value})} />
                </>
              )}
              {modalType === 'note' && (
                <>
                  <input type="text" placeholder="Course Name" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, course: e.target.value})} />
                  <input type="text" placeholder="Note Title" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
                  <textarea placeholder="Note Details..." required rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" onChange={e => setFormData({...formData, content: e.target.value})} />
                </>
              )}
              {modalType === 'poll' && (
                <>
                  <input type="text" placeholder="Poll Question" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, question: e.target.value})} />
                  <input type="text" placeholder="Options (comma separated)" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={e => setFormData({...formData, options: e.target.value})} />
                </>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalType(null)} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
