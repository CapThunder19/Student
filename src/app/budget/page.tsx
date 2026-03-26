'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, TrendingUp, Plus, Eye, EyeOff, Users, ArrowUpRight, ArrowDownRight, Receipt, X, Calendar, Edit2, Check, Loader, Bell, BellOff } from 'lucide-react';

interface Transaction {
  _id: string;
  desc: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

interface SharedExpense {
  _id: string;
  desc: string;
  amount: number;
  paidBy: string;
  splitWith: string;
  splitType: string;
  impactAmount: number;
  date: string;
}

function sendBudgetNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

const CATEGORY_LIMITS: Record<string, number> = {
  Food: 10000, Transport: 3000, Study: 5000, Entertainment: 5000, Shopping: 8000, Emergency: 10000
};

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>('personal');
  const [hideBalance, setHideBalance] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [showAddExpense, setShowAddExpense] = useState(false); // Transaction Modal
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  
  // Date calculations
  const [daysLeft, setDaysLeft] = useState(0);
  const [totalDays, setTotalDays] = useState(30);
  const [currentMonth, setCurrentMonth] = useState('');
  const [isEditingDays, setIsEditingDays] = useState(false);
  const [tempDays, setTempDays] = useState(0);

  // Personal Budget DB data
  const [totalBudget, setTotalBudget] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>([]);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(0);

  // Track which notifications have already been sent this session
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await fetch('/api/budget');
      if (res.ok) {
        const data = await res.json();
        setTotalBudget(data.budget?.monthlyTarget || 20000);
        setTempBudget(data.budget?.monthlyTarget || 20000);
        
        if (data.budget?.daysRemaining !== undefined) {
          setDaysLeft(data.budget.daysRemaining);
          setTempDays(data.budget.daysRemaining);
        }
        
        setTransactions(data.transactions || []);
        setSharedExpenses(data.sharedExpenses || []);
      }
    } catch (error) {
      console.error('Failed to fetch budget', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    setTotalDays(daysInMonth);
    setDaysLeft(daysInMonth - today.getDate());
    setCurrentMonth(today.toLocaleString('default', { month: 'long', year: 'numeric' }));

    fetchBudget();
  }, []);

  // Budget notifications effect
  useEffect(() => {
    if (!notificationsEnabled || loading || totalBudget === 0) return;

    const spent = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const remaining = totalBudget - spent;
    const usedPct = (spent / totalBudget) * 100;

    // Notify when budget usage crosses 80%
    if (usedPct >= 80 && !notifiedRef.current.has('budget-80')) {
      notifiedRef.current.add('budget-80');
      sendBudgetNotification(
        '⚠️ Budget Alert',
        `You have used ${Math.round(usedPct)}% of your monthly budget. Only ₹${remaining.toLocaleString()} remaining.`
      );
    }

    // Notify when budget is critically low (< 15%)
    if (remaining < totalBudget * 0.15 && !notifiedRef.current.has('budget-critical')) {
      notifiedRef.current.add('budget-critical');
      sendBudgetNotification(
        '🚨 Critical Budget Warning',
        `You are running very low on budget! Only ₹${remaining.toLocaleString()} left for ${daysLeft} days.`
      );
    }

    // Notify when a category exceeds its limit
    Object.entries(CATEGORY_LIMITS).forEach(([cat, limit]) => {
      const catSpent = transactions.filter(t => t.category === cat && t.type === 'expense').reduce((a, b) => a + b.amount, 0);
      if (catSpent > limit && !notifiedRef.current.has(`cat-${cat}`)) {
        notifiedRef.current.add(`cat-${cat}`);
        sendBudgetNotification(
          `📊 ${cat} Limit Exceeded`,
          `You've spent ₹${catSpent.toLocaleString()} on ${cat}, exceeding your ₹${limit.toLocaleString()} limit.`
        );
      }
    });
  }, [transactions, totalBudget, notificationsEnabled, loading, daysLeft]);

  const handleSaveBudget = async () => {
    try {
      await fetch('/api/budget/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyTarget: tempBudget }),
      });
      setTotalBudget(tempBudget);
      setIsEditingBudget(false);
    } catch (error) {
      console.error('Failed to save budget target', error);
    }
  };

  const handleSaveDays = async () => {
    try {
      await fetch('/api/budget/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysRemaining: tempDays }),
      });
      setDaysLeft(tempDays);
      setIsEditingDays(false);
    } catch (error) {
      console.error('Failed to save days target', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!expenseDesc || !expenseAmount) return;
    
    try {
      const res = await fetch('/api/budget/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desc: expenseDesc,
          amount: Number(expenseAmount),
          category: expenseCategory,
          type: 'expense'
        }),
      });
      if (res.ok) {
        await fetchBudget();
        setShowAddExpense(false);
        setExpenseDesc('');
        setExpenseAmount('');
      }
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  const spent = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const remaining = totalBudget - spent;
  
  // Dynamically calculate Categories breakdown
  const categoryColors: Record<string, string> = {
    Food: 'bg-red-600', Transport: 'bg-cyan-600', Study: 'bg-blue-600', Entertainment: 'bg-green-600', Shopping: 'bg-yellow-600', Emergency: 'bg-purple-600'
  };

  const categorySpending = Array.from(new Set([...transactions.map(t => t.category), ...Object.keys(CATEGORY_LIMITS)])).map(cat => {
    const spentOnCat = transactions.filter(t => t.category === cat && t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    return {
      name: cat,
      spent: spentOnCat,
      limit: CATEGORY_LIMITS[cat] || 5000,
      color: categoryColors[cat] || 'bg-slate-600',
    };
  }).filter(c => c.spent > 0 || Object.keys(CATEGORY_LIMITS).includes(c.name));

  // Split calculations
  const totalOwedToYou = sharedExpenses.filter(e => e.impactAmount > 0).reduce((a, b) => a + b.impactAmount, 0);
  const totalYouOwe = sharedExpenses.filter(e => e.impactAmount < 0).reduce((a, b) => a + Math.abs(b.impactAmount), 0);

  // Group by friend (mocking friends from expenses)
  const friendTotals: Record<string, number> = {};
  sharedExpenses.forEach(e => {
    if (!friendTotals[e.splitWith]) friendTotals[e.splitWith] = 0;
    friendTotals[e.splitWith] += e.impactAmount;
  });

  const friends = Object.keys(friendTotals).map((name, idx) => ({
    id: `f${idx}`,
    name,
    balance: Math.abs(friendTotals[name]),
    type: friendTotals[name] > 0 ? 'owes_you' : 'you_owe'
  })).filter(f => f.balance > 0);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-600 bg-opacity-20">
              <Wallet className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Finances</h1>
              <p className="text-slate-400 text-sm">Track budget & split expenses</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification toggle */}
            <button
              onClick={notificationsEnabled ? undefined : requestNotificationPermission}
              disabled={notificationsEnabled}
              title={notificationsEnabled ? 'Budget alerts enabled — to disable, update your browser notification settings' : 'Enable budget notifications'}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${notificationsEnabled ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 text-yellow-400 cursor-default' : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer'}`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{notificationsEnabled ? 'Alerts On' : 'Enable Alerts'}</span>
            </button>

            <div className="flex bg-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'personal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                Personal Budget
              </button>
              <button 
                onClick={() => setActiveTab('shared')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'shared' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                Split Expenses
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div 
                key="personal"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Total Budget Card */}
                <div className="mb-12 bg-slate-800 border border-slate-700 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {currentMonth} • 
                  {isEditingDays ? (
                    <span className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={tempDays}
                        onChange={(e) => setTempDays(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-600 text-white text-sm rounded px-2 py-1 w-20 outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button onClick={handleSaveDays} className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-xs">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setIsEditingDays(false); setTempDays(daysLeft); }} className="p-1 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors text-xs">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsEditingDays(true); setTempDays(daysLeft); }}>
                      <span className={`${daysLeft < 7 ? 'text-red-400 font-semibold' : 'text-blue-400'}`}>{daysLeft} days left</span>
                      <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  {isEditingBudget ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-white">₹</span>
                      <input 
                        type="number" 
                        value={tempBudget}
                        onChange={(e) => setTempBudget(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-600 text-white text-3xl font-bold rounded-lg px-3 py-1 w-40 outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button onClick={handleSaveBudget} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setIsEditingBudget(false)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-bold text-white tracking-tight">
                        {hideBalance ? '****' : `₹${totalBudget.toLocaleString()}`}
                      </h2>
                      <button onClick={() => setIsEditingBudget(true)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="Edit Monthly Target">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <span className="text-xs font-medium px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-md ml-2 border border-blue-500/30">Target</span>
                </div>
              </div>
              <button onClick={() => setHideBalance(!hideBalance)} className="text-slate-400 hover:text-white transition-colors bg-slate-900 p-3 rounded-full border border-slate-700">
                {hideBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">Spent</p>
                <p className="text-white text-2xl font-bold">₹{spent.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm font-semibold mb-2">Remaining</p>
                <p className={`text-2xl font-bold ${remaining < totalBudget * 0.15 ? 'text-red-400' : 'text-green-400'}`}>₹{remaining.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm font-semibold mb-2">Used</p>
                <div className="flex items-center gap-3">
                  <p className="text-white text-2xl font-bold">{Math.round((spent / totalBudget) * 100)}%</p>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${Math.round((spent / totalBudget) * 100) > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(Math.round((spent / totalBudget) * 100), 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {remaining < totalBudget * 0.15 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 p-4 bg-red-900 bg-opacity-30 border border-red-500 border-opacity-50 rounded-xl flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">You're running low on budget!</p>
                  <p className="text-red-400 text-sm mt-1">You have only ₹{remaining.toLocaleString()} left for the next {daysLeft} days. Try to limit non-essential expenses.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Categories */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorySpending.map((cat, idx) => (
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
              <button onClick={() => setShowAddExpense(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-slate-400 text-center py-4 bg-slate-800 rounded-lg">No transactions yet.</p>
              ) : transactions.map((txn, idx) => (
                <motion.div key={txn._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.06 }} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-750 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{txn.desc}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">{txn.category}</span>
                        <span>{new Date(txn.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${txn.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                      {txn.type === 'income' ? '+' : '-'}₹{Math.abs(txn.amount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      )}

      {activeTab === 'shared' && (
              <motion.div 
                key="shared"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Balances Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-600 bg-opacity-20">
                        <ArrowDownRight className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">You are owed</h3>
                    </div>
                    <p className="text-4xl font-bold text-green-400 mb-2">₹{totalOwedToYou}</p>
                    <p className="text-slate-400 text-sm">From {friends.filter(f => f.type === 'owes_you').length} friends</p>
                  </div>
                  
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-red-600 bg-opacity-20">
                        <ArrowUpRight className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">You owe</h3>
                    </div>
                    <p className="text-4xl font-bold text-red-400 mb-2">₹{totalYouOwe}</p>
                    <p className="text-slate-400 text-sm">To {friends.filter(f => f.type === 'you_owe').length} friends</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {/* Friends List */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Friends</h2>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                      {friends.map((friend, idx) => (
                        <div key={friend.id} className={`p-4 flex items-center justify-between border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors ${idx !== friends.length - 1 ? 'border-b' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                              {friend.name.charAt(0)}
                            </div>
                            <span className="text-white font-medium">{friend.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-0.5">
                              {friend.type === 'owes_you' ? 'Owes you' : 'You owe'}
                            </p>
                            <p className={`font-bold ${friend.type === 'owes_you' ? 'text-green-400' : 'text-red-400'}`}>
                              ₹{friend.balance}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                      <button 
                        onClick={() => setShowAddExpense(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4" /> Add Expense
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {sharedExpenses.length === 0 ? (
                        <p className="text-slate-400 text-center py-4 bg-slate-800 rounded-lg">No shared expenses.</p>
                      ) : sharedExpenses.map((exp, idx) => (
                        <div key={exp._id || idx} className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:bg-slate-750 transition-all flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                              💸
                            </div>
                            <div>
                              <p className="text-white font-semibold text-lg">{exp.desc}</p>
                              <p className="text-slate-400 text-sm mt-1">
                                {exp.paidBy} paid <span className="font-semibold text-slate-300">₹{exp.amount}</span> • {new Date(exp.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">
                              {exp.impactAmount > 0 ? 'You lent' : 'You borrowed'}
                            </p>
                            <p className={`font-bold ${exp.impactAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {exp.impactAmount > 0 ? '+' : ''}₹{Math.abs(exp.impactAmount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add an expense</h2>
                <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                {activeTab === 'shared' && (
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">With you and:</label>
                    <input type="text" placeholder="Friend's Name" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-purple-500 transition-colors" />
                  </div>
                )}
                
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Description</label>
                  <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} placeholder="e.g. Dinner, Groceries" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                    <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-8 pr-4 py-3 outline-none focus:border-blue-500 transition-colors font-medium text-lg" />
                  </div>
                </div>

                {activeTab === 'personal' && (
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Category</label>
                    <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors">
                      {Object.keys(CATEGORY_LIMITS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'shared' && (
                  <div className="bg-slate-900 rounded-lg p-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                    <span className="text-slate-400">Paid by</span>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded font-medium transition-colors">You</button>
                    <span className="text-slate-400">and split</span>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded font-medium transition-colors">equally</button>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-700 bg-slate-850 flex gap-3">
                <button 
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={activeTab === 'personal' ? handleAddTransaction : () => setShowAddExpense(false)}
                  className={`flex-1 py-3 text-white font-semibold rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
