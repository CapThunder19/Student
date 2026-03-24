'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Heart, Send, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function WellnessChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI wellness buddy. 👋 I\'m here to listen and support you. How are you feeling today? You can adjust your mood and stress levels below, and I\'ll give you personalized support.',
      timestamp: new Date(),
    },
  ]);

  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(2);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/wellness/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          moodLevel: mood,
          stressLevel: stress,
          chatHistory: messages.map(msg => ({
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
        setMessages(prev => [...prev, aiMessage]);
        if (data.offline) {
          setOfflineMode(true);
        }
      } else {
        const errorMessage: Message = {
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'ai',
        content: 'Connection error. Please check your internet and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 bg-opacity-20">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Wellness Chat</h1>
              <p className="text-slate-400 text-sm">Talk to your AI wellness mentor</p>
            </div>
          </div>
          {offlineMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-900 bg-opacity-30 border border-yellow-700 px-3 py-1 rounded-lg text-yellow-400 text-xs font-semibold whitespace-nowrap">
              📡 Offline Mode
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
          {/* Wellness Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-800 to-slate-800 border-b border-slate-700 px-8 py-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Your Wellness Status</h3>
              <p className="text-sm text-slate-400">AI uses this to personalize support</p>
            </div>

            {/* Mood Adjustment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-medium">Mood</label>
                <span className="text-white font-semibold">{moodLabels[mood]}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                {moodEmojis.map((emoji, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMood(idx)}
                    className={`text-3xl transition-all ${mood === idx ? 'scale-125' : 'opacity-50'}`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={mood}
                onChange={e => setMood(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Stress Adjustment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-medium">Stress Level</label>
                <span className="text-white font-semibold">{stress}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={stress}
                onChange={e => setStress(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stress / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-700 bg-slate-950 px-8 py-6"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your thoughts or feelings..."
                disabled={loading}
                className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </motion.button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Press Enter to send, or use Shift+Enter for new line</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
