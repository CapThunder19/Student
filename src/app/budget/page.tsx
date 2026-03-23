'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Wallet, TrendingUp, Plus, Eye, EyeOff } from 'lucide-react';

export default function BudgetPage() {
  const [hideBalance, setHideBalance] = useState(false);
  const totalBudget = 41000;
  const spent = 18500;
  const remaining = totalBudget - spent;

  const categories = [
    { name: 'Food', spent: 10000, limit: 10000, color: 'bg-red-600' },
    { name: 'Transport', spent: 3000, limit: 3000, color: 'bg-cyan-600' },
    { name: 'Study', spent: 2500, limit: 5000, color: 'bg-blue-600' },
    { name: 'Entertainment', spent: 1500, limit: 5000, color: 'bg-green-600' },
    { name: 'Shopping', spent: 1500, limit: 8000, color: 'bg-yellow-600' },
    { name: 'Emergency', spent: 0, limit: 10000, color: 'bg-purple-600' },
  ];

  const transactions = [
    { id: '1', desc: 'Lunch at cafeteria', amount: -350, cat: 'Food', date: '2 hours ago' },
    { id: '2', desc: 'Recharge allowance', amount: 5000, cat: 'Income', date: 'Yesterday' },
    { id: '3', desc: 'Movie tickets', amount: -400, cat: 'Entertainment', date: '2 days ago' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-yellow-600 bg-opacity-20">
            <Wallet className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Budget</h1>
            <p className="text-slate-400 text-sm">Track expenses & manage finances</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Total Budget Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 bg-slate-800 border border-slate-700 rounded-xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Total Monthly Budget</p>
                <h2 className="text-4xl font-bold text-white">
                  {hideBalance ? '****' : `₹${totalBudget.toLocaleString()}`}
                </h2>
              </div>
              <button onClick={() => setHideBalance(!hideBalance)} className="text-slate-400 hover:text-white transition-colors">
                {hideBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 bg-opacity-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs font-semibold mb-1">Spent</p>
                <p className="text-white font-bold">₹{spent.toLocaleString()}</p>
              </div>
              <div className="bg-slate-700 bg-opacity-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs font-semibold mb-1">Remaining</p>
                <p className={`font-bold ${remaining < 5000 ? 'text-red-400' : 'text-green-400'}`}>₹{remaining.toLocaleString()}</p>
              </div>
              <div className="bg-slate-700 bg-opacity-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs font-semibold mb-1">Used</p>
                <p className="text-white font-bold">{Math.round((spent / totalBudget) * 100)}%</p>
              </div>
            </div>

            {remaining < 5000 && (
              <div className="mt-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 border-opacity-50 rounded-lg flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">You're running low on budget! Only ₹{remaining} remaining.</p>
              </div>
            )}
          </motion.div>

          {/* Categories */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => (
                <motion.div key={cat.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.06 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold">{cat.name}</h3>
                      <p className="text-slate-400 text-sm">₹{cat.spent} / ₹{cat.limit}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`${cat.color} h-2 rounded-full transition-all`} style={{ width: `${Math.min((cat.spent / cat.limit) * 100, 100)}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Transactions */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {transactions.map((txn, idx) => (
                <motion.div key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.06 }} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-750 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{txn.desc}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">{txn.cat}</span>
                        <span>{txn.date}</span>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                      {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
