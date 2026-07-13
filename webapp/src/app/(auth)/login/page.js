'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveSession } from '../../../lib/session.js';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Login failed. Check your credentials.');
        return;
      }

      saveSession({ accessToken: data.accessToken, user: data.user });
      
      const bizRes = await fetch('/api/businesses', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      const bizData = await bizRes.json();

      const businesses = bizData?.businesses || bizData?.data || [];
      
      if (!Array.isArray(businesses) || businesses.length === 0) {
        router.push('/onboarding');
        return;
      }

      const firstBusiness = businesses[0];
      saveSession({
        accessToken: data.accessToken,
        user: data.user,
        businessId: firstBusiness.id,
      });

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-slate-200">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-20 bg-gradient-to-b from-white to-slate-100/50">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer">
            <div className="bg-black text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)]">A</div>
            <span className="text-2xl font-extrabold tracking-tighter text-slate-900">Atlas.</span>
          </Link>
        </div>
        
        <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter leading-[1.05] mb-2">
          Invisible precision.<br />
          <span className="text-slate-400 font-medium">Infinite scale.</span>
        </h2>
        
        <p className="text-slate-500 mt-6 text-sm lg:text-base leading-relaxed max-w-md">
          CRM, Inventory, Sales, Accounting, AI Co-Pilot, and Workflow Automation — all unified under one roof. Zero infrastructure cost.
        </p>
        
        <div className="flex gap-4 mt-12">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl px-6 py-5 shadow-sm border border-slate-200/60 text-center w-32">
            <p className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">₹0</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold">Monthly Cost</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl px-6 py-5 shadow-sm border border-slate-200/60 text-center w-32">
            <p className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">60s</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold">Setup Time</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl px-6 py-5 shadow-sm border border-slate-200/60 text-center w-32">
            <p className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">∞</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold">Scale</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-10 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white">
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="bg-black text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold text-lg shadow-sm">A</div>
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Atlas.</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to manage your operations.</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-2">Mobile Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-slate-900 hover:text-slate-600 cursor-pointer transition-all">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-md mt-4 text-[15px]"
            >
              {loading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-slate-900 hover:text-slate-600 font-bold transition-all cursor-pointer ml-1">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
