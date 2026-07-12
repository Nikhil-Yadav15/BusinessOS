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

      // Save short-lived access token in sessionStorage
      saveSession({ accessToken: data.accessToken, user: data.user });
      
      // Now fetch the user's businesses to decide routing
      const bizRes = await fetch('/api/businesses', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      const bizData = await bizRes.json();

      // Smart routing: If user has no business, send them to onboarding wizard
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
    <div className="flex bg-background min-h-screen items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-premium border border-border transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity">Atlas BusinessOS</h1>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Sign in to manage your operations</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Mobile Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={form.mobile}
              onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <Link href="/reset-password" className="text-xs text-primary hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? 'Signing in...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-bold transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
