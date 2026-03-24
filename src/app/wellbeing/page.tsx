'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Heart, Smile, Zap, Users, Sparkles, Loader, Send, Droplets, Coffee, Bell, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
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
              <input type="range" min="0" max="4" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full mb-3" />
              <p className="text-slate-400 text-center text-sm">{moodLabels[mood]}</p>
            </div>
          </motion.section>

          {/* Breathing Exercise */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Breathing Exercise</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <motion.div 
                animate={{ scale: breathing ? [1, 1.5, 1.5, 1] : 1 }} 
                transition={{ duration: 10, times: [0, 0.4, 0.6, 1], ease: "easeInOut", repeat: breathing ? Infinity : 0 }} 
                className="w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-blue-500/50"
              >
                {breathingPhase}
              </motion.div>
              <p className="text-slate-400 text-sm mb-4">Follow the circle to relax your mind and body</p>
              <button onClick={() => setBreathing(!breathing)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                {breathing ? 'Stop' : 'Start'} Exercise
              </button>
            </div>
          </motion.section>

          {/* Wellness Reminders */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-yellow-500" /> Wellness Reminders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Water Reminder */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="p-4 bg-cyan-900 bg-opacity-30 rounded-full mb-4">
                  <Droplets className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Water Reminder</h3>
                <p className="text-slate-400 text-sm mb-4">Stay hydrated to keep your focus sharp</p>
                <div className="flex items-center gap-3 w-full max-w-[200px] mb-4">
                  <Clock className="w-5 h-5 text-slate-500 hidden sm:block" />
                  <input type="number" min="15" max="180" step="15" value={waterInterval} onChange={(e) => setWaterInterval(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none" disabled={waterActive} />
                  <span className="text-slate-400 text-sm">mins</span>
                </div>
                <button onClick={() => setWaterActive(!waterActive)} className={`w-full py-2 font-semibold rounded-lg transition-colors ${waterActive ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}>
                  {waterActive ? 'Pause Reminder' : 'Start Reminder'}
                </button>
              </div>

              {/* Break Reminder */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="p-4 bg-orange-900 bg-opacity-30 rounded-full mb-4">
                  <Coffee className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Break Reminder</h3>
                <p className="text-slate-400 text-sm mb-4">Take regular breaks to avoid burnout</p>
                <div className="flex items-center gap-3 w-full max-w-[200px] mb-4">
                  <Clock className="w-5 h-5 text-slate-500 hidden sm:block" />
                  <input type="number" min="15" max="180" step="15" value={breakInterval} onChange={(e) => setBreakInterval(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none" disabled={breakActive} />
                  <span className="text-slate-400 text-sm">mins</span>
                </div>
                <button onClick={() => setBreakActive(!breakActive)} className={`w-full py-2 font-semibold rounded-lg transition-colors ${breakActive ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
                  {breakActive ? 'Pause Reminder' : 'Start Reminder'}
                </button>
              </div>
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

          {/* AI Wellness Recommendations */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" /> AI Wellness Recommendations
            </h2>
            <div className="bg-gradient-to-r from-slate-800 to-slate-800 border border-purple-700 rounded-xl p-8">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating personalized recommendations...
                </div>
              ) : recommendations ? (
                <div className="space-y-4 text-slate-200 prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-white font-bold text-lg mt-4 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-white font-bold text-base mt-3 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-white font-semibold text-sm mt-2 mb-1" {...props} />,
                      p: ({ node, ...props }) => <p className="text-slate-300 text-sm leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                      ol: ({ node, ...props }) => <ol className="space-y-3 list-decimal list-inside" {...props} />,
                      ul: ({ node, ...props }) => <ul className="space-y-2 list-disc list-inside" {...props} />,
                      li: ({ node, ...props }) => <li className="text-slate-300 text-sm" {...props} />,
                    }}
                  >
                    {recommendations}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate-400 text-center">Personalizing your recommendations...</p>
              )}
            </div>
          </motion.section>

          {/* AI Chat */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" /> Chat with AI
              </h2>
              {offlineMode && (
                <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 px-3 py-1 rounded-lg text-yellow-400 text-xs font-semibold">
                  📡 Offline Mode
                </div>
              )}
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-96">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-900 bg-opacity-50">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm text-center">
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
                        <div className={message.role === 'user' ? 'max-w-xs px-4 py-2 rounded-lg text-sm bg-blue-600 text-white rounded-br-none' : 'max-w-xs px-4 py-2 rounded-lg text-sm bg-slate-700 text-slate-100 rounded-bl-none'}>
                          <p className="leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="bg-slate-700 text-slate-100 rounded-lg rounded-bl-none px-4 py-2 flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-slate-700 bg-slate-800 px-4 py-3 flex gap-2">
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
                  className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
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
