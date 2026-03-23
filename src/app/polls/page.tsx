'use client';

import { motion } from 'framer-motion';
import { BarChart3, ThumbsUp, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Polls() {
  const [polls] = useState([
    {
      id: 1,
      question: 'Which is your preferred learning style?',
      options: [
        { label: 'Visual (Diagrams, Videos)', votes: 42, percentage: 42 },
        { label: 'Hands-on (Coding, Projects)', votes: 38, percentage: 38 },
        { label: 'Reading & Discussion', votes: 20, percentage: 20 },
      ],
      totalVotes: 100,
      endDate: '2 days left',
    },
    {
      id: 2,
      question: 'Should we have more group projects?',
      options: [
        { label: 'Yes, definitely!', votes: 67, percentage: 67 },
        { label: 'Maybe, depends on subject', votes: 28, percentage: 28 },
        { label: 'No, prefer individual work', votes: 5, percentage: 5 },
      ],
      totalVotes: 100,
      endDate: '5 days left',
    },
  ]);

  const [hasVoted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-yellow-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-orange-600" />
            Student Polls
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Share your opinions and help shape our community</p>
        </motion.div>

        {/* Polls */}
        <div className="space-y-6">
          {polls.map((poll, idx) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex-1">{poll.question}</h2>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-semibold">
                  {poll.endDate}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                {poll.options.map((option, optIdx) => (
                  <motion.div
                    key={optIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 + optIdx * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input type="radio" className="w-5 h-5 accent-orange-600" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{option.label}</span>
                      </label>
                      <span className="text-orange-600 font-bold">{option.percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 + optIdx * 0.05 }}
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">{poll.totalVotes}</span> total votes
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {hasVoted ? 'Already Voted' : 'Submit Vote'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Poll Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
        >
          + Create New Poll
        </motion.button>
      </div>
    </div>
  );
}
