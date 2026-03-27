'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  BookOpen, MessageCircle, Lightbulb, Search, Filter, BarChart3, Send, Sparkles, Loader,
  Home, Shield, Heart, Users, Landmark, Wallet, User, GraduationCap, X, 
  Layers, BrainCircuit
} from 'lucide-react';

const PAGE_BG = "bg-[#FDF9F1] text-[#1A1A1A]";

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
        } else {
            console.warn('DB response error, using fallback state logic if needed.');
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
    setVotedPolls((prev) => ({ ...prev, [pollId]: true }));
    setPolls((prev) => prev.map((poll) => {
      if (poll._id === pollId) {
        const newPoll = { ...poll, totalVotes: (poll.totalVotes || 0) + 1, options: [...poll.options] };
        newPoll.options[optionIndex] = { ...newPoll.options[optionIndex], votes: (newPoll.options[optionIndex].votes || 0) + 1 };
        return newPoll;
      }
      return poll;
    }));
    try {
      await fetch('/api/academics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionIndex })
      });
    } catch (err) { console.error('Failed to vote', err); }
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
      setChatMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I am facing network issues.' }]);
    } finally { setChatLoading(false); }
  };

  const handlePostAnswer = async (doubtId: string) => {
    if (!answerInput.trim()) return;
    const currentAnswer = answerInput;
    setAnswerInput('');
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
      await fetch('/api/academics/doubt/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubtId, answer: currentAnswer })
      });
    } catch (err) { console.error('Failed to post answer', err); }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (modalType === 'poll') {
        payload.options = formData.options.split(',').map((o: string) => ({ label: o.trim(), votes: 0 })).filter((o: any) => o.label);
        payload.totalVotes = 0;
        payload.endDate = 'Active';
      }
      if (modalType === 'doubt') { payload.responses = 0; payload.status = 'pending'; payload.time = 'Just now'; }
      if (modalType === 'flashcard') payload.mastery = 0;
      
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: modalType, payload })
      });
      if (res.ok) {
        const newItem = await res.json();
        if (newItem) {
          if (modalType === 'doubt') setDoubts(prev => [newItem, ...prev]);
          if (modalType === 'flashcard') setFlashcards(prev => [newItem, ...prev]);
          if (modalType === 'note') setNotes(prev => [newItem, ...prev]);
          if (modalType === 'poll') setPolls(prev => [newItem, ...prev]);
        }
        setModalType(null);
        setFormData({});
      }
    } catch (err) { console.error('Failed to create item', err); }
  };

  const filteredDoubts = doubts.filter(d => 
    d.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.course?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

    <div className={`flex flex-col min-h-screen ${PAGE_BG}`}>
      
      {/* 2. HEADER SECTION - Adjusted Spacing for Nav Dock */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-10 pt-32 pb-16 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-10 flex-1">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#A594F1] border-[1px] border-[#1A1A1A] rounded-[2.2rem] flex items-center justify-center shadow-[6px_6px_0_0_#1A1A1A] shrink-0">
              <GraduationCap className="w-12 h-12 text-[#1A1A1A]" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-[#1A1A1A] leading-none">Academics</h1>
              <div className="relative">
                <p className="text-lg sm:text-xl font-bold text-[#4F4F4F] max-w-lg leading-relaxed">Level up your grades. Ask doubts, flip flashcards, and share notes with peers.</p>
                <svg className="absolute -bottom-6 left-0 w-64 h-6 opacity-30" viewBox="0 0 200 20" fill="none">
                  <path d="M0 10C25 0 25 20 50 10C75 0 75 20 100 10C125 0 125 20 150 10C175 0 175 20 200 10" stroke="#A594F1" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 border-[1px] border-black border-dashed rounded-full -m-4 opacity-20" />
              <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-md">
                <path d="M20 50 L45 75 L80 25" stroke="#6EE7B7" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute -top-6 -right-12 bg-[#FBBF24] border-[1px] border-[#1A1A1A] rounded-xl px-5 py-2.5 shadow-[5px_5px_0_0_#1A1A1A] -rotate-12 cursor-default">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] whitespace-nowrap">A+ Guaranteed!</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. TABS SECTION - Mint Highlight for All Active Tabs */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-10 pb-40">
        <div className="flex flex-wrap gap-4 items-center mb-12">
          {[
            { id: 'doubts', label: 'Q&A BOARD', icon: <MessageCircle className="w-4 h-4" /> },
            { id: 'flashcards', label: 'FLASHCARDS', icon: <Layers className="w-4 h-4" /> },
            { id: 'notes', label: 'STUDY HUB', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'polls', label: 'LIVE POLLS', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'chatbot', label: 'AI TUTOR', icon: <BrainCircuit className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full border-[1px] border-[#1A1A1A] font-black text-[11px] transition-all
                ${activeTab === tab.id 
                  ? `bg-[#A7F3D0] shadow-[4px_4px_0_0_#1A1A1A] -translate-y-0.5` 
                  : 'bg-white hover:bg-[#FDF1DC]'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. SEARCH & ACTION BAR - Dynamic based on Reference (https://student-ten-tau.vercel.app/academics) */}
        <div className="bg-white border-[1px] border-[#1A1A1A] rounded-[3rem] p-3 flex flex-col md:flex-row items-stretch gap-4 mb-20 shadow-[1px_1px_0_0_#000]">
          {activeTab === 'doubts' ? (
            <>
              <div className="flex-1 flex items-center bg-[#FDF9F1] border-[1px] border-[#1A1A1A] rounded-full px-6 py-3.5">
                <Search className="w-5 h-5 text-[#9A9A9A] mr-4" />
                <input 
                  type="text" 
                  placeholder="Search the Q&A board..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 outline-none font-bold text-sm placeholder:text-[#B0A89C]"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="px-8 py-3.5 bg-white border-[1px] border-[#1A1A1A] rounded-full font-black uppercase text-[11px] hover:bg-gray-100 transition-colors">FILTER</button>
                <button onClick={() => setModalType('doubt')} className="px-10 py-3.5 bg-[#A7F3D0] border-[1px] border-[#1A1A1A] rounded-full font-black uppercase text-[11px] hover:brightness-105 transition-all text-[#1A1A1A]">+ ASK</button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between px-6 py-2">
              <h2 className="text-xl font-black italic tracking-tight text-[#1A1A1A]">
                {activeTab === 'flashcards' && 'Active Flashcards'}
                {activeTab === 'notes' && 'Global Study Hub'}
                {activeTab === 'polls' && 'Live Community Polls'}
                {activeTab === 'chatbot' && 'AI Learning Tutor'}
              </h2>
              <button 
                onClick={() => setModalType(activeTab === 'polls' ? 'poll' : activeTab === 'notes' ? 'note' : activeTab === 'flashcards' ? 'flashcard' : 'doubt')}
                className={`px-10 py-3.5 border-[1px] border-[#1A1A1A] rounded-full font-black uppercase text-[11px] hover:brightness-105 transition-all text-[#1A1A1A]
                  ${activeTab === 'flashcards' ? 'bg-[#FBBF24]' : activeTab === 'notes' ? 'bg-[#A594F1]' : activeTab === 'polls' ? 'bg-[#F97316]' : 'bg-[#93C5FD]'}`}
              >
                {activeTab === 'flashcards' && '+ Create Flashcard'}
                {activeTab === 'notes' && '+ Create Note'}
                {activeTab === 'polls' && '+ Create Poll'}
                {activeTab === 'chatbot' && 'Start New Session'}
              </button>
            </div>
          )}
        </div>

        {/* 5. CONTENT AREA */}
        <div className="min-h-[500px]">
          {loadingDb ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader className="w-10 h-10 text-[#1A1A1A] animate-spin" />
              <p className="font-black uppercase tracking-widest opacity-20 text-[10px]">Connecting to Core...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'doubts' && (
                <motion.div key="doubts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-8">
                  {filteredDoubts.map((d: any, idx) => (
                    <div key={d._id} className="bg-white border-[1px] border-[#1A1A1A] rounded-[2.5rem] p-10 shadow-[6px_6px_0_0_#1A1A1A]">
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <h3 className="text-2xl font-black italic tracking-tight text-[#1A1A1A]">{d.title}</h3>
                        <span className={`shrink-0 px-4 py-2 rounded-full border-[1px] border-[#1A1A1A] text-[9px] font-black uppercase ${d.status === 'answered' ? 'bg-[#A7F3D0]' : 'bg-[#FBBF24]'}`}>
                          {d.status === 'answered' ? 'Solved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[#1A1A1A] font-black uppercase text-[9px] tracking-widest mb-10 opacity-30">{d.course}</p>
                      <div className="flex items-center gap-8">
                        <button onClick={() => setExpandedDoubtId(expandedDoubtId === d._id ? null : d._id)} className="flex items-center gap-3 bg-[#FDF1DC] border-[1px] border-[#1A1A1A] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-[3px_3px_0_0_#1A1A1A]">
                          <MessageCircle className="w-4 h-4" /> {d.responses || d.answers?.length || 0} Responses
                        </button>
                        <span className="text-[9px] font-black uppercase opacity-20">{d.time}</span>
                      </div>
                      {expandedDoubtId === d._id && (
                        <div className="mt-8 pt-8 border-t-[1px] border-dashed border-gray-200 gap-4 flex flex-col">
                          {(d.answers || []).map((ans: any, i: number) => (
                             <div key={i} className="bg-[#FDF9F1] border-[1px] border-dashed border-black p-5 rounded-2xl">
                               <p className="font-bold text-sm tracking-tight">{ans.text}</p>
                             </div>
                          ))}
                          <div className="flex gap-4">
                            <input type="text" value={answerInput} onChange={e => setAnswerInput(e.target.value)} placeholder="Type answer..." className="flex-1 bg-white border-[1px] border-black rounded-2xl p-4 font-bold outline-none shadow-[2px_2px_0_0_#000]" />
                            <button onClick={() => handlePostAnswer(d._id)} className="bg-[#A7F3D0] border-[1px] border-black p-4 rounded-2xl shadow-[2px_2px_0_0_#000]"><Send className="w-5 h-5" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredDoubts.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase italic">No records in Board</div>}
                </motion.div>
              )}

              {activeTab === 'flashcards' && (
                <motion.div key="flashcards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {flashcards.map((card: any, idx) => (
                    <div key={idx} className="bg-white border-[1px] border-[#1A1A1A] rounded-[2rem] p-8 shadow-[8px_8px_0_0_#FBBF24] min-h-[300px] flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-transform">
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-30 mb-4">{card.course}</p>
                        <h3 className="text-xl font-black mb-6">{card.q}</h3>
                        <p className="text-sm font-bold text-[#4F4F4F] opacity-0 group-hover:opacity-100 transition-opacity">{card.a}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="flex-1 h-2 bg-[#FDF1DC] border-[1px] border-black rounded-full overflow-hidden">
                          <div className="h-full bg-[#FBBF24]" style={{ width: `${card.mastery}%` }} />
                        </div>
                        <span className="text-[10px] font-black">{card.mastery}%</span>
                      </div>
                    </div>
                  ))}
                  {flashcards.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase italic col-span-full">No Flashcards Ready</div>}
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {notes.map((note: any, idx) => (
                    <div key={idx} className="bg-white border-[1px] border-[#1A1A1A] rounded-[2rem] p-10 shadow-[8px_8px_0_0_#A594F1]">
                      <p className="text-[9px] font-black uppercase opacity-30 mb-4">{note.course}</p>
                      <h3 className="text-xl font-black mb-6">{note.title}</h3>
                      <p className="text-sm font-bold text-[#4F4F4F] line-clamp-4 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                  {notes.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase italic col-span-full">Study Hub is Empty</div>}
                </motion.div>
              )}

              {activeTab === 'polls' && (
                <motion.div key="polls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  {polls.map((poll: any, idx) => (
                    <div key={poll._id} className="bg-white border-[1px] border-[#1A1A1A] rounded-[2.5rem] p-10 shadow-[8px_8px_0_0_#F97316]">
                      <div className="flex justify-between items-start mb-10">
                        <h3 className="text-2xl font-black italic">{poll.question}</h3>
                        <span className="bg-[#FDF1DC] border-[1px] border-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">{poll.endDate}</span>
                      </div>
                      <div className="space-y-6">
                        {poll.options.map((opt: any, optIdx: number) => {
                          const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                          return (
                            <div key={optIdx} className="space-y-2 cursor-pointer" onClick={() => handleVote(poll._id, optIdx)}>
                              <div className="flex justify-between font-black uppercase text-[10px] items-center">
                                <span>{opt.label}</span>
                                <span className={votedPolls[poll._id] ? "text-[#F97316]" : ""}>{pct}%</span>
                              </div>
                              <div className="h-3 bg-[#FDF9F1] border-[1px] border-black rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-[#F97316] to-[#FBBF24]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {polls.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase italic">No Active Polls</div>}
                </motion.div>
              )}

              {activeTab === 'chatbot' && (
                <motion.div key="chatbot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[550px] flex flex-col bg-white border-2 border-[#1A1A1A] rounded-[3rem] overflow-hidden shadow-[10px_10px_0_0_#93C5FD]">
                  <div className="p-6 bg-[#93C5FD] border-b-2 border-[#1A1A1A] flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">Study Assitant</h3>
                      <p className="text-[9px] font-black uppercase opacity-60">AI Intelligence Core</p>
                    </div>
                    <BrainCircuit className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#FDF9F1]">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-5 rounded-2xl border-[1px] border-[#1A1A1A] font-bold text-[12px] shadow-[4px_4px_0_0_#1A1A1A] ${msg.role === 'user' ? 'bg-[#A7F3D0]' : 'bg-white'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex justify-center"><Loader className="animate-spin w-5 h-5 opacity-20" /></div>}
                  </div>
                  <form onSubmit={handleChatSubmit} className="p-6 bg-white border-t-2 border-[#1A1A1A] flex gap-4">
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type question..." className="flex-1 bg-[#FDF9F1] border-[1px] border-black rounded-xl p-4 font-bold outline-none" />
                    <button type="submit" disabled={!chatInput.trim() || chatLoading} className="bg-[#93C5FD] border-[1px] border-black p-4 rounded-xl shadow-[3px_3px_0_0_#1A1A1A] active:translate-y-0.5 transition-all">
                      <Send className="w-5 h-5 text-black" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* 6. MODAL SYSTEM - High-Fidelity Match to SS2 */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-[100] backdrop-blur-md">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-[1px] border-black rounded-[2.5rem] p-10 max-w-xl w-full shadow-[20px_20px_0_0_#000] relative">
              <button onClick={() => setModalType(null)} className="absolute top-8 right-8 p-1.5 border-[1px] border-black rounded-lg bg-white hover:bg-gray-50"><X className="w-5 h-5"/></button>
              
              <h3 className="text-2xl font-black mb-8">
                {modalType === 'doubt' && 'Ask a Doubt'}
                {modalType === 'flashcard' && 'Create Flashcard'}
                {modalType === 'note' && 'Create New Note'}
                {modalType === 'poll' && 'Create Community Poll'}
              </h3>

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                 {/* Doubt Fields */}
                 {modalType === 'doubt' && (
                   <>
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Course Name (e.g. Calculus)" required onChange={e => setFormData({ ...formData, course: e.target.value })} />
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="What is your question?" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                   </>
                 )}

                 {/* Flashcard Fields - Matching SS2 */}
                 {modalType === 'flashcard' && (
                   <>
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Course Name" required onChange={e => setFormData({ ...formData, course: e.target.value })} />
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Question" required onChange={e => setFormData({ ...formData, q: e.target.value })} />
                     <textarea className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none h-24" placeholder="Answer" required onChange={e => setFormData({ ...formData, a: e.target.value })} />
                   </>
                 )}

                 {/* Note Fields */}
                 {modalType === 'note' && (
                   <>
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Note Title" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Course" required onChange={e => setFormData({ ...formData, course: e.target.value })} />
                     <textarea className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none h-32" placeholder="Note content..." required onChange={e => setFormData({ ...formData, content: e.target.value })} />
                   </>
                 )}

                 {/* Poll Fields */}
                 {modalType === 'poll' && (
                   <>
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Poll Question" required onChange={e => setFormData({ ...formData, question: e.target.value })} />
                     <input className="w-full p-4 border-[1px] border-black rounded-2xl font-bold bg-white outline-none" placeholder="Options (comma separated)" required onChange={e => setFormData({ ...formData, options: e.target.value })} />
                   </>
                 )}

                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setModalType(null)} className="flex-1 py-4 border-[1px] border-black rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0_0_#F5F5F5] hover:bg-gray-50 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-4 border-[1px] border-black rounded-2xl font-black uppercase text-sm bg-[#F97316] shadow-[4px_4px_0_0_#000] hover:brightness-105 active:translate-y-0.5 transition-all">Create</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
