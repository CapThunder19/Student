'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, TrendingUp, Plus, Eye, EyeOff, Users, ArrowUpRight, ArrowDownRight, Receipt, X, Calendar, Edit2, Check, Loader, Bell, BellOff } from 'lucide-react';

const PAGE_BG = "bg-[#FDF9F1] text-[#1A1A1A]";
const CARD = "bg-white border-2 border-[#1A1A1A] rounded-3xl shadow-[4px_4px_0_0_#1A1A1A]";
const SUBTLE_CARD = "bg-[#F8F1E7] border-2 border-[#1A1A1A] rounded-3xl";

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
      <div className={`flex h-screen items-center justify-center ${PAGE_BG}`}>
        <Loader className="w-10 h-10 text-[#1A1A1A] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${PAGE_BG}`}>
      <header className="sticky top-0 z-40 bg-[#FDF1DC] border-b-2 border-[#1A1A1A] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FDE68A] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A]">
              <Wallet className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Finances</h1>
              <p className="text-[#7C6A58] text-sm">Track budget & split expenses</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification toggle */}
            <button
              onClick={notificationsEnabled ? undefined : requestNotificationPermission}
              disabled={notificationsEnabled}
              title={notificationsEnabled ? 'Budget alerts enabled — to disable, update your browser notification settings' : 'Enable budget notifications'}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] transition-all ${
                notificationsEnabled
                  ? 'bg-[#BBF7D0] text-[#166534] cursor-default'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#FDE68A] cursor-pointer'
              }`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{notificationsEnabled ? 'Alerts On' : 'Enable Alerts'}</span>
            </button>

            <div className="flex items-center bg-[#FFEBD4] rounded-full p-1 border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A]">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeTab === 'personal'
                    ? 'bg-[#1A1A1A] text-[#FDF9F1]'
                    : 'text-[#1A1A1A] hover:bg-white'
                }`}
              >
                Personal Budget
              </button>
              <button 
                onClick={() => setActiveTab('shared')}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeTab === 'shared'
                    ? 'bg-[#1A1A1A] text-[#FDF9F1]'
                    : 'text-[#1A1A1A] hover:bg-white'
                }`}
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
                <div className={`mb-12 ${CARD} p-8 bg-[#FFF7E7]`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <p className="text-[#7C6A58] text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {currentMonth} • 
                  {isEditingDays ? (
                    <span className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={tempDays}
                        onChange={(e) => setTempDays(Number(e.target.value))}
                        className="bg-white border-2 border-[#1A1A1A] text-sm rounded-lg px-2 py-1 w-20 outline-none focus:border-[#1A1A1A]"
                        autoFocus
                      />
                      <button onClick={handleSaveDays} className="p-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg transition-colors text-xs">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setIsEditingDays(false); setTempDays(daysLeft); }} className="p-1 bg-[#E5E5E5] hover:bg-[#D4D4D4] text-[#1A1A1A] rounded-lg transition-colors text-xs">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsEditingDays(true); setTempDays(daysLeft); }}>
                      <span className={`${daysLeft < 7 ? 'text-[#DC2626] font-semibold' : 'text-[#1A1A1A]'}`}>{daysLeft} days left</span>
                      <Edit2 className="w-3 h-3 text-[#7C6A58] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  {isEditingBudget ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-[#1A1A1A]">₹</span>
                      <input 
                        type="number" 
                        value={tempBudget}
                        onChange={(e) => setTempBudget(Number(e.target.value))}
                        className="bg-white border-2 border-[#1A1A1A] text-3xl font-bold rounded-xl px-3 py-1 w-40 outline-none focus:border-[#1A1A1A]"
                        autoFocus
                      />
                      <button onClick={handleSaveBudget} className="p-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl transition-colors">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setIsEditingBudget(false)} className="p-2 bg-[#E5E5E5] hover:bg-[#D4D4D4] text-[#1A1A1A] rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-bold tracking-tight">
                        {hideBalance ? '****' : `₹${totalBudget.toLocaleString()}`}
                      </h2>
                      <button onClick={() => setIsEditingBudget(true)} className="p-1.5 text-[#7C6A58] hover:bg-[#FDE68A] rounded-md transition-colors" title="Edit Monthly Target">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <span className="text-xs font-medium px-2 py-1 bg-[#FDE68A] text-[#1A1A1A] rounded-md ml-2 border border-[#1A1A1A]">Target</span>
                </div>
              </div>
              <button onClick={() => setHideBalance(!hideBalance)} className="text-[#1A1A1A] hover:bg-[#E5E5E5] transition-colors bg-white p-3 rounded-full border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A]">
                {hideBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className={`${CARD} p-4 bg-white`}>
                <p className="text-[#7C6A58] text-sm font-semibold mb-2 flex items-center gap-2">Spent</p>
                <p className="text-2xl font-bold">₹{spent.toLocaleString()}</p>
              </div>
              <div className={`${CARD} p-4 bg-white`}>
                <p className="text-[#7C6A58] text-sm font-semibold mb-2">Remaining</p>
                <p className={`text-2xl font-bold ${remaining < totalBudget * 0.15 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>₹{remaining.toLocaleString()}</p>
              </div>
              <div className={`${CARD} p-4 bg-white`}>
                <p className="text-[#7C6A58] text-sm font-semibold mb-2">Used</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold">{Math.round((spent / totalBudget) * 100)}%</p>
                  <div className="flex-1 h-2 bg-[#F3E2CC] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${Math.round((spent / totalBudget) * 100) > 85 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(Math.round((spent / totalBudget) * 100), 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {remaining < totalBudget * 0.15 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 p-4 bg-[#FEE2E2] border-2 border-[#1A1A1A] rounded-2xl flex items-start gap-3 shadow-[3px_3px_0_0_#1A1A1A]">
                <TrendingUp className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#991B1B] font-semibold">You're running low on budget!</p>
                  <p className="text-[#7C6A58] text-sm mt-1">You have only ₹{remaining.toLocaleString()} left for the next {daysLeft} days. Try to limit non-essential expenses.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Categories */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Category Breakdown</h2>
            <p className="text-sm text-[#7C6A58] mb-6">See where your money is quietly flowing each month.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorySpending.map((cat, idx) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.06 }}
                  className={`${SUBTLE_CARD} p-6 hover:-translate-y-1 transition-transform shadow-[3px_3px_0_0_#1A1A1A]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{cat.name}</h3>
                      <p className="text-sm text-[#7C6A58]">₹{cat.spent} / ₹{cat.limit}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  </div>
                  <div className="w-full bg-[#F3E2CC] rounded-full h-2">
                    <div className={`${cat.color} h-2 rounded-full transition-all`} style={{ width: `${Math.min((cat.spent / cat.limit) * 100, 100)}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Transactions */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Recent Transactions</h2>
                <p className="text-sm text-[#7C6A58]">Tiny receipts that add up to your month.</p>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-4 py-2 rounded-full border-2 border-[#1A1A1A] bg-[#F97316] text-[#1A1A1A] font-semibold shadow-[3px_3px_0_0_#1A1A1A] hover:translate-y-0.5 transition-transform flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className={`${SUBTLE_CARD} text-center py-4 text-sm text-[#7C6A58]`}>No transactions yet.</p>
              ) : (
                transactions.map((txn, idx) => (
                  <motion.div
                    key={txn._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.06 }}
                    className={`${CARD} p-4 bg-white hover:-translate-y-0.5 transition-transform`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{txn.desc}</p>
                        <div className="flex items-center gap-2 text-xs mt-1 text-[#7C6A58]">
                          <span className="px-2 py-1 bg-[#F3E2CC] rounded-full border border-[#1A1A1A]">{txn.category}</span>
                          <span>{new Date(txn.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          txn.type === 'income' ? 'text-[#16A34A]' : 'text-[#1A1A1A]'
                        }`}
                      >
                        {txn.type === 'income' ? '+' : '-'}₹{Math.abs(txn.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
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
                  <div className={`${CARD} p-6 bg-[#ECFDF3]`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A]">
                        <ArrowDownRight className="w-6 h-6 text-[#16A34A]" />
                      </div>
                      <h3 className="text-xl font-bold">You are owed</h3>
                    </div>
                    <p className="text-4xl font-bold text-[#16A34A] mb-2">₹{totalOwedToYou}</p>
                    <p className="text-sm text-[#7C6A58]">From {friends.filter(f => f.type === 'owes_you').length} friends</p>
                  </div>
                  
                  <div className={`${CARD} p-6 bg-[#FEF2F2]`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A]">
                        <ArrowUpRight className="w-6 h-6 text-[#DC2626]" />
                      </div>
                      <h3 className="text-xl font-bold">You owe</h3>
                    </div>
                    <p className="text-4xl font-bold text-[#DC2626] mb-2">₹{totalYouOwe}</p>
                    <p className="text-sm text-[#7C6A58]">To {friends.filter(f => f.type === 'you_owe').length} friends</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {/* Friends List */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Friends</h2>
                      <button className="p-2 rounded-full border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A] hover:bg-[#FDE68A] transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`${CARD} p-0 overflow-hidden bg-white`}>
                      {friends.map((friend, idx) => (
                        <div
                          key={friend.id}
                          className={`p-4 flex items-center justify-between border-[#1A1A1A] border-opacity-10 cursor-pointer hover:bg-[#FFF7E7] transition-colors ${
                            idx !== friends.length - 1 ? 'border-b' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold">
                              {friend.name.charAt(0)}
                            </div>
                            <span className="font-medium">{friend.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#7C6A58] mb-0.5">
                              {friend.type === 'owes_you' ? 'Owes you' : 'You owe'}
                            </p>
                            <p
                              className={`font-bold ${
                                friend.type === 'owes_you' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                              }`}
                            >
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
                      <h2 className="text-2xl font-bold">Recent Activity</h2>
                      <button 
                        onClick={() => setShowAddExpense(true)}
                        className="px-4 py-2 rounded-full border-2 border-[#1A1A1A] bg-[#A855F7] text-[#1A1A1A] font-semibold shadow-[3px_3px_0_0_#1A1A1A] hover:translate-y-0.5 transition-transform flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4" /> Add Expense
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {sharedExpenses.length === 0 ? (
                        <p className={`${SUBTLE_CARD} text-center py-4 text-sm text-[#7C6A58]`}>No shared expenses.</p>
                      ) : (
                        sharedExpenses.map((exp, idx) => (
                          <div
                            key={exp._id || idx}
                            className={`${CARD} p-5 bg-white flex items-center justify-between hover:-translate-y-0.5 transition-transform`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#F3E2CC] flex items-center justify-center text-xl border-2 border-[#1A1A1A]">
                                💸
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{exp.desc}</p>
                                <p className="text-sm text-[#7C6A58] mt-1">
                                  {exp.paidBy} paid <span className="font-semibold text-[#1A1A1A]">₹{exp.amount}</span> •{' '}
                                  {new Date(exp.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[#7C6A58] mb-1">
                                {exp.impactAmount > 0 ? 'You lent' : 'You borrowed'}
                              </p>
                              <p
                                className={`font-bold ${
                                  exp.impactAmount > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                                }`}
                              >
                                {exp.impactAmount > 0 ? '+' : ''}₹{Math.abs(exp.impactAmount)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className={`${CARD} w-full max-w-md overflow-hidden bg-white`}
            >
              <div className="p-6 border-b-2 border-[#1A1A1A] flex justify-between items-center bg-[#FFF7E7]">
                <h2 className="text-xl font-bold">Add an expense</h2>
                <button onClick={() => setShowAddExpense(false)} className="text-[#1A1A1A] hover:bg-[#F3E2CC] rounded-full p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                {activeTab === 'shared' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#7C6A58]">With you and:</label>
                    <input
                      type="text"
                      placeholder="Friend's Name"
                      className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-4 py-3 outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#7C6A58]">Description</label>
                  <input
                    type="text"
                    value={expenseDesc}
                    onChange={e => setExpenseDesc(e.target.value)}
                    placeholder="e.g. Dinner, Groceries"
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-4 py-3 outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#7C6A58]">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[#7C6A58] font-bold">₹</span>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl pl-8 pr-4 py-3 outline-none focus:border-[#1A1A1A] font-medium text-lg"
                    />
                  </div>
                </div>

                {activeTab === 'personal' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#7C6A58]">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={e => setExpenseCategory(e.target.value)}
                      className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-4 py-3 outline-none focus:border-[#1A1A1A]"
                    >
                      {Object.keys(CATEGORY_LIMITS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'shared' && (
                  <div className="bg-[#F3E2CC] rounded-2xl p-4 flex flex-wrap items-center justify-center gap-2 text-sm border-2 border-[#1A1A1A]">
                    <span className="text-[#7C6A58]">Paid by</span>
                    <button className="bg-white border-2 border-[#1A1A1A] px-3 py-1 rounded-full font-medium shadow-[2px_2px_0_0_#1A1A1A]">You</button>
                    <span className="text-[#7C6A58]">and split</span>
                    <button className="bg-white border-2 border-[#1A1A1A] px-3 py-1 rounded-full font-medium shadow-[2px_2px_0_0_#1A1A1A]">equally</button>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t-2 border-[#1A1A1A] bg-[#FFF7E7] flex gap-3">
                <button 
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-3 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] font-semibold rounded-full shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#F3E2CC] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={activeTab === 'personal' ? handleAddTransaction : () => setShowAddExpense(false)}
                  className={`flex-1 py-3 text-[#1A1A1A] font-semibold rounded-full border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A] transition-colors ${
                    activeTab === 'personal' ? 'bg-[#F97316] hover:bg-[#FDBA74]' : 'bg-[#A855F7] hover:bg-[#C4B5FD]'
                  }`}
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
