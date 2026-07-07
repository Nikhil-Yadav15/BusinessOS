'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verify, 3: Success
  const [form, setForm] = useState({ fullName: '', mobile: '', email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Step 1: Submit details & send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');

    if (form.fullName.trim().length < 2) return setError('Please enter your full name.');
    if (form.mobile.trim().length < 10) return setError('Enter a valid mobile number.');
    if (!form.email || !form.email.includes('@')) return setError('A valid email is required for verification.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Failed to send verification code.');
        return;
      }

      setStep(2);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP, then register
  async function handleVerifyAndRegister(e) {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) return setError('Please enter the 6-digit code.');

    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: otpCode }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData?.message || 'Verification failed.');
        return;
      }

      // 2. Now register the user
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const regData = await regRes.json();

      if (!regRes.ok) {
        setError(regData?.message || 'Registration failed after verification.');
        return;
      }

      setStep(3);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      setError(''); // Clear any previous error
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-12">
            Atlas OS
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Your entire business,<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">one intelligent platform.</span>
          </h2>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-md">
            CRM, Inventory, Sales, Accounting, AI Co-Pilot, and Workflow Automation — all unified under one roof. Zero infrastructure cost.
          </p>
          <div className="flex gap-6 mt-10">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">$0</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Monthly Cost</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">60s</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Setup Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">∞</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Scale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Multi-Step Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-xl font-bold text-indigo-700">Atlas OS</Link>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            ))}
          </div>

          {/* ─── Step 1: Details ─── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
              <p className="text-slate-500 text-sm mt-1">We'll send a verification code to your email.</p>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" placeholder="John Doe" value={form.fullName} onChange={handleChange('fullName')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={handleChange('mobile')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-indigo-500 text-xs font-semibold">(required for verification)</span></label>
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={handleChange('email')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={handleChange('password')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required minLength={8} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                  {loading ? 'Sending Code...' : 'Send Verification Code →'}
                </button>
              </form>
            </div>
          )}

          {/* ─── Step 2: OTP Verify ─── */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold mb-4 inline-flex items-center gap-1">← Back</button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h1>
              <p className="text-slate-500 text-sm mt-1">
                We sent a 6-digit code to <span className="font-semibold text-slate-700">{form.email}</span>
              </p>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleVerifyAndRegister} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl font-bold tracking-[0.4em] font-mono"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
                <button type="submit" disabled={loading || otpCode.length !== 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-500">
                Didn't receive the code?{' '}
                <button onClick={handleResend} disabled={loading} className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Resend
                </button>
              </p>
            </div>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h1 className="text-2xl font-bold text-slate-900">Account Created!</h1>
              <p className="text-slate-500 text-sm mt-2">Your email has been verified. Redirecting you to login...</p>
              <div className="mt-4 w-24 h-1 bg-indigo-600 rounded-full mx-auto animate-pulse" />
            </div>
          )}

          {step !== 3 && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
