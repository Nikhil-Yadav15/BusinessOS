'use client';

import { useState } from 'react';
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

      // Save short-lived access token in sessionStorage
      saveSession({ accessToken: data.accessToken, user: data.user });
      
      // Now fetch the user's first business to auto-select it
      const bizRes = await fetch('/api/businesses', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      const bizData = await bizRes.json();
      const firstBusiness = bizData?.data?.items?.[0];

      if (firstBusiness) {
        saveSession({
          accessToken: data.accessToken,
          user: data.user,
          businessId: firstBusiness.id,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-700 tracking-tight">Atlas BusinessOS</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your operations</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={form.mobile}
              onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
          >
            {loading ? 'Signing in...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
