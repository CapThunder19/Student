'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-10 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute bottom-2 right-10 w-16 h-16 bg-white rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
              </motion.div>
            </div>
          </div>

          <div className="px-8 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">Welcome Back</h1>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-8">Sign in to continue your learning journey</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            <motion.form onSubmit={handleSubmit} className="space-y-5">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <Link href="#" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'} id="password" name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex items-center">
                <input type="checkbox" id="remember" className="w-4 h-4 border-2 border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                <label htmlFor="remember" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Keep me logged in</label>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </motion.button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">Create one</Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-slate-600 dark:text-slate-400 text-xs mt-8">
          Need help? <Link href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact support</Link>
        </motion.p>
      </div>
    </div>
  );
}
