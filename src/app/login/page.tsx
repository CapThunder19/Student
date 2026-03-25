'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = {
      name: name.trim() || 'Student',
      email: email.trim() || 'student@example.com',
    };

    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = 'isLoggedIn=true; path=/; max-age=2592000';
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#f8fafc_45%,_#e2e8f0_100%)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border-2 border-slate-900 bg-white p-8 shadow-[10px_10px_0_0_#1a1a1a]">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-600">Login</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Welcome back</h1>
          <p className="mt-2 text-slate-600">Login karke dashboard, complaints, aur messaging features unlock karo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-2xl border-2 border-slate-900 bg-slate-950 px-5 py-3 font-black text-white shadow-[6px_6px_0_0_#ea7a34]"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New here? <Link href="/signup" className="font-bold underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}