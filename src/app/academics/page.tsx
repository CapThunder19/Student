'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Lightbulb, Search, Filter, BarChart3, Send, Sparkles, Loader } from 'lucide-react';

const PAGE_BG = "bg-[#FDF9F1] text-[#1A1A1A]";
const CARD = "bg-white border-2 border-[#1A1A1A] rounded-3xl shadow-[4px_4px_0_0_#1A1A1A]";
const SUBTLE_CARD = "bg-[#F8F1E7] border-2 border-[#1A1A1A] rounded-3xl";
const TAB_PILL = "px-6 py-2 font-semibold rounded-full border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A] transition-all";

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
    <div className={`flex flex-col min-h-screen ${PAGE_BG}`}>
      <header className="px-6 sm:px-10 pt-28 pb-10 bg-[#FDF1DC] border-b-2 border-[#1A1A1A] rounded-b-[40px]">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#A594F1] w-max text-[10px] sm:text-xs font-black tracking-[0.18em] uppercase">
            <span className="w-7 h-7 rounded-2xl bg-[#A594F1] border-2 border-[#1A1A1A] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
            <span>Study Core</span>
          </div>
          <div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              Academics
            </h1>
            <p className="mt-3 text-sm sm:text-base font-semibold text-[#4F4F4F] max-w-xl">
              Level up your grades. Ask doubts, flip flashcards, and share notes with peers.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 sm:gap-4 mb-10 border-b-2 border-dashed border-[#1A1A1A]/20 pb-6"
          >
            {[
              { id: 'doubts', label: 'Q&A Board' },
              { id: 'flashcards', label: 'Flashcards' },
              { id: 'notes', label: 'Study Hub' },
              { id: 'polls', label: 'Live Polls' },
              { id: 'chatbot', label: 'AI Tutor' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${TAB_PILL} ${
                  activeTab === tab.id
                    ? 'bg-[#A7F3D0] text-[#1A1A1A] -translate-y-0.5'
                    : 'bg-white text-[#4F4F4F] hover:-translate-y-0.5 hover:bg-[#FDF1DC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {activeTab === 'doubts' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
              <div className="mb-6 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-[#9F9F9F]" />
                  <input
                    type="text"
                    placeholder="Search doubts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#1A1A1A] rounded-2xl text-sm sm:text-base placeholder:text-[#B0A89C] focus:outline-none focus:ring-0 focus:border-[#EA7A34] shadow-[2px_2px_0_0_#1A1A1A]"
                  />
                </div>
                <button
                  onClick={() => setModalType('doubt')}
                  className="px-5 py-3 rounded-2xl font-bold bg-[#A594F1] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#9281E0] transition-all flex items-center gap-2 justify-center text-sm"
                >
                  + Ask a Doubt
                </button>
                <button
                  className="px-5 py-3 rounded-2xl font-semibold bg-white border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#FDF1DC] transition-all flex items-center gap-2 justify-center text-sm"
                >
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
                    transition={{ delay: idx * 0.05 }}
                    className={`${CARD} p-6 sm:p-7 transition-all group ${
                      expandedDoubtId === d._id ? 'ring-2 ring-[#A594F1]' : ''
                    }`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedDoubtId(expandedDoubtId === d._id ? null : d._id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg sm:text-xl font-black tracking-tight group-hover:text-[#EA7A34] transition-colors flex-1">
                          {d.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap border-2 border-[#1A1A1A] ${
                            d.status === 'answered'
                              ? 'bg-[#A7F3D0] text-[#1A1A1A]'
                              : 'bg-[#FDC029] text-[#1A1A1A]'
                          }`}
                        >
                          {d.status === 'answered' ? '✓ Answered' : '○ Pending'}
                        </span>
                      </div>
                      <p className="text-[#7A7468] text-sm mb-2 font-semibold uppercase tracking-wide">
                        {d.course}
                      </p>
                      <div className="flex items-center gap-4 text-[#7A7468] text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" /> {d.responses || d.answers?.length || 0} responses
                        </span>
                        <span>{d.time}</span>
                      </div>
                    </div>

                    {expandedDoubtId === d._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t-2 border-dashed border-[#1A1A1A]/30"
                      >
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                          {d.answers && d.answers.length > 0 ? (
                            d.answers.map((ans: any, i: number) => (
                              <div key={i} className={`${SUBTLE_CARD} px-4 py-3`}>
                                <p className="text-sm font-medium text-[#3A3833]">{ans.text}</p>
                                <span className="text-[11px] text-[#8F8678] mt-2 block">
                                  {new Date(ans.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm italic text-center py-4 text-[#A0988C]">
                              No answers yet. Be the first to help!
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder="Write your answer..."
                            className="flex-1 bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-2 text-sm placeholder:text-[#B0A89C] focus:outline-none focus:border-[#A594F1] shadow-[2px_2px_0_0_#1A1A1A]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePostAnswer(d._id);
                            }}
                          />
                          <button
                            onClick={() => handlePostAnswer(d._id)}
                            disabled={!answerInput.trim()}
                            className="bg-[#EA7A34] hover:bg-[#FDC029] disabled:opacity-50 text-[#1A1A1A] px-4 py-2 rounded-2xl font-bold border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A] transition-colors flex items-center justify-center"
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
                <button
                  onClick={() => setModalType('flashcard')}
                  className="px-5 py-3 rounded-2xl font-bold bg-[#A594F1] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#9281E0] transition-all text-sm"
                >
                  + Create Flashcard
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card: any, idx) => (
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`${CARD} p-6 hover:-translate-y-1 transition-transform cursor-pointer h-72 flex flex-col justify-between group`}
                >
                  <div>
                    <p className="text-[#7A7468] text-xs font-semibold mb-2 uppercase tracking-wide">{card.course}</p>
                    <h3 className="text-[#1A1A1A] font-black group-hover:text-[#EA7A34] transition-colors mb-3 text-base">
                      {card.q}
                    </h3>
                    <p className="text-[#4F4F4F] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {card.a}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#E4D9C7] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#A594F1] to-[#EA7A34] h-2 rounded-full"
                        style={{ width: `${card.mastery}%` }}
                      />
                    </div>
                    <span className="text-[#7A7468] text-xs font-semibold">{card.mastery}%</span>
                  </div>
                </motion.div>
              ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'notes' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setModalType('note')}
                  className="px-5 py-3 rounded-2xl font-bold bg-[#A594F1] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#9281E0] transition-all text-sm"
                >
                  + Create Note
                </button>
              </div>
              {notes.length === 0 ? (
                <div className={`${CARD} p-8 text-center`}>
                  <Lightbulb className="w-16 h-16 text-[#EA7A34] mx-auto mb-4" />
                  <p className="text-[#4F4F4F] text-lg font-semibold">
                    No notes yet. Create your first study note!
                  </p>
                  <button
                    onClick={() => setModalType('note')}
                    className="mt-4 px-6 py-3 rounded-2xl font-bold bg-[#A594F1] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#9281E0] transition-all text-sm"
                  >
                    + Create Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note: any, idx) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`${CARD} p-6 hover:-translate-y-1 transition-transform cursor-pointer`}
                    >
                      <p className="text-[#7A7468] text-xs font-semibold mb-2 uppercase tracking-wide">
                        {note.course}
                      </p>
                      <h3 className="text-[#1A1A1A] font-black text-lg mb-3">{note.title}</h3>
                      <p className="text-[#4F4F4F] text-sm line-clamp-4">{note.content}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'polls' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#EA7A34]" />
                  Anonymous Student Polls
                </h2>
                <button
                  onClick={() => setModalType('poll')}
                  className="px-5 py-3 rounded-2xl font-bold bg-[#EA7A34] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#FDC029] transition-all text-sm"
                >
                  + Create Poll
                </button>
              </div>
              <p className="text-[#7A7468] mb-6 text-sm font-medium">
                Vote anonymously to shape our academic community.
              </p>

              {polls.map((poll, idx) => (
                <motion.div
                  key={poll._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`${CARD} p-6`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-xl font-black text-[#1A1A1A] flex-1">{poll.question}</h3>
                    <span className="bg-[#FDF1DC] text-[#7A7468] px-3 py-1 rounded-full text-xs font-semibold border-2 border-[#1A1A1A]">
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
                                className="w-4 h-4 accent-[#EA7A34]" 
                              />
                              <span className="text-[#3A3833] text-sm font-semibold">{option.label}</span>
                            </label>
                            <span className="text-[#EA7A34] font-bold text-sm">{percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#E4D9C7] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full bg-gradient-to-r from-[#EA7A34] to-[#FDC029]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[#7A7468] text-sm">{poll.totalVotes} total votes</p>
                </motion.div>
              ))}
            </motion.section>
          )}

          {activeTab === 'chatbot' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[600px]">
              <div className={`${CARD} flex flex-col flex-1 overflow-hidden p-0`}>
                <div className="px-6 py-4 border-b-2 border-[#1A1A1A] bg-[#F8F1E7] flex flex-col">
                  <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#A594F1]" />
                    Academic Query Bot
                  </h2>
                  <p className="text-[#7A7468] text-sm">Ask about courses, deadlines, resources, and policies.</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#FDF9F1]">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl border-2 border-[#1A1A1A] ${
                          msg.role === 'user'
                            ? 'bg-[#A7F3D0] text-[#1A1A1A] rounded-tr-none'
                            : 'bg-white text-[#1A1A1A] rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChatSubmit} className="p-4 border-t-2 border-[#1A1A1A] bg-white flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white text-sm px-4 py-3 rounded-2xl border-2 border-[#1A1A1A] focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C] shadow-[2px_2px_0_0_#1A1A1A]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-[#EA7A34] hover:bg-[#FDC029] disabled:opacity-50 text-[#1A1A1A] px-5 py-3 rounded-2xl font-bold border-2 border-[#1A1A1A] transition-colors flex items-center justify-center shadow-[2px_2px_0_0_#1A1A1A]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {modalType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${CARD} w-full max-w-md`}
          >
            <h3 className="text-xl font-black text-[#1A1A1A] mb-4">
              {modalType === 'doubt' && 'Ask a Doubt'}
              {modalType === 'flashcard' && 'Create Flashcard'}
              {modalType === 'note' && 'Create Note'}
              {modalType === 'poll' && 'Create Poll'}
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {modalType === 'doubt' && (
                <>
                  <input
                    type="text"
                    placeholder="Doubt Title"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Course Name"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                  />
                </>
              )}
              {modalType === 'flashcard' && (
                <>
                  <input
                    type="text"
                    placeholder="Course Name"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Question"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, q: e.target.value })}
                  />
                  <textarea
                    placeholder="Answer"
                    required
                    rows={3}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] resize-none placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, a: e.target.value })}
                  />
                </>
              )}
              {modalType === 'note' && (
                <>
                  <input
                    type="text"
                    placeholder="Course Name"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Note Title"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Note Details..."
                    required
                    rows={4}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] resize-none placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                  />
                </>
              )}
              {modalType === 'poll' && (
                <>
                  <input
                    type="text"
                    placeholder="Poll Question"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Options (comma separated)"
                    required
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:outline-none focus:border-[#A594F1] placeholder:text-[#B0A89C]"
                    onChange={e => setFormData({ ...formData, options: e.target.value })}
                  />
                </>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 px-4 py-3 bg-white hover:bg-[#FDF1DC] text-[#1A1A1A] rounded-2xl font-semibold border-2 border-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#EA7A34] hover:bg-[#FDC029] text-[#1A1A1A] rounded-2xl font-bold border-2 border-[#1A1A1A] transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
