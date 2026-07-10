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
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-20">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-md w-8 h-8 flex items-center justify-center font-bold text-lg shadow-sm">A</div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Atlas OS</span>
          </Link>
        </div>
        
        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-2">
          Your entire business,<br />
          <span className="text-blue-600">one intelligent platform.</span>
        </h2>
        
        <p className="text-slate-500 mt-6 text-sm lg:text-base leading-relaxed max-w-md">
          CRM, Inventory, Sales, Accounting, AI Co-Pilot, and Workflow Automation — all unified under one roof. Zero infrastructure cost.
        </p>
        
        <div className="flex gap-4 mt-12">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 text-center w-32 border-b-2 border-b-slate-200">
            <p className="text-2xl font-extrabold text-blue-600 mb-1">₹0</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Monthly Cost</p>
          </div>
          <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 text-center w-32 border-b-2 border-b-slate-200">
            <p className="text-2xl font-extrabold text-blue-600 mb-1">60s</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Setup Time</p>
          </div>
          <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 text-center w-32 border-b-2 border-b-slate-200">
            <p className="text-2xl font-extrabold text-blue-600 mb-1">∞</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Scale</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-md w-8 h-8 flex items-center justify-center font-bold text-lg">A</div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Atlas OS</span>
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
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Mobile Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2 text-[15px]"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
