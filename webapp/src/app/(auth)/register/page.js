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
    <div className="flex min-h-dvh bg-slate-50 font-sans selection:bg-slate-200">
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

      {/* Right Panel — Multi-Step Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-10 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white">
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="bg-black text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold text-lg shadow-sm">A</div>
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Atlas.</span>
            </Link>
          </div>

          {/* Progress Indicator matching the image */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-slate-900' : 'bg-slate-100'}`} />
            ))}
          </div>

          {/* ─── Step 1: Details ─── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
              <p className="text-slate-500 text-sm mt-1 mb-8">We'll send a verification code to your email.</p>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" value={form.fullName} onChange={handleChange('fullName')}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-2">Mobile Number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={handleChange('mobile')}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-2">Email</label>
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={handleChange('email')}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-2">Password</label>
                  <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={handleChange('password')}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" required minLength={8} />
                </div>
                
                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-md text-[15px]">
                    {loading ? 'Sending Code...' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── Step 2: OTP Verify ─── */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="text-[13px] text-slate-900 hover:text-slate-600 font-bold mb-6 inline-flex items-center gap-1 transition-colors cursor-pointer">← Back</button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h1>
              <p className="text-slate-500 text-sm mt-1 mb-8 leading-relaxed">
                We sent a 6-digit code to <br/> <span className="font-bold text-slate-800">{form.email}</span>
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-2">Verification Code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-center text-4xl font-bold tracking-[0.4em] font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
                <button type="submit" disabled={loading || otpCode.length !== 6}
                  className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-md text-[15px]">
                  {loading ? 'Verifying...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 font-medium">
                Didn't receive the code?{' '}
                <button onClick={handleResend} disabled={loading} className="text-slate-900 hover:text-slate-600 font-bold transition-all cursor-pointer ml-1">
                  Resend
                </button>
              </p>
            </div>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-slate-50 border border-slate-200 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">✓</div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Created!</h1>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">Your email has been verified successfully. Redirecting you to login...</p>
              <div className="mt-8 overflow-hidden h-1 w-32 bg-slate-100 rounded-full mx-auto">
                <div className="h-full bg-slate-900 rounded-full animate-[progress_2.5s_ease-in-out]" style={{ width: '100%', animation: 'progress 2.5s ease-in-out' }} />
              </div>
            </div>
          )}

          {step !== 3 && (
            <p className="mt-8 text-center text-[13px] text-slate-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-900 hover:text-slate-600 font-bold transition-all cursor-pointer ml-1">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
