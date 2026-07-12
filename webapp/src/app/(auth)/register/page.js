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
    <div className="flex min-h-screen bg-slate-50/50 transition-colors duration-300 font-sans">
      {/* Left Panel — Branding (Light theme matching ss2) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50/40 relative overflow-hidden border-r border-slate-200/60 justify-center items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.06),transparent_60%)]" />
        <div className="relative z-10 w-full max-w-lg px-12">
          
          {/* Logo block */}
          <Link href="/" className="flex items-center gap-2 mb-12 select-none group w-fit">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
              A
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">Atlas OS</span>
          </Link>

          {/* Heading */}
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Your entire business,<br />
            <span className="text-blue-600">one intelligent platform.</span>
          </h2>

          {/* Description */}
          <p className="text-slate-500 mt-4 text-xs leading-relaxed max-w-sm font-medium">
            CRM, Inventory, Sales, Accounting, AI Co-Pilot, and Workflow Automation — all unified under one roof. Zero infrastructure cost.
          </p>

          {/* Stats Grid Cards */}
          <div className="flex gap-4 mt-10 select-none">
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm text-center max-w-[120px]">
              <p className="text-2xl font-black text-blue-600">₹0</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Monthly Cost</p>
            </div>
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm text-center max-w-[120px]">
              <p className="text-2xl font-black text-blue-600">60s</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Setup Time</p>
            </div>
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm text-center max-w-[120px]">
              <p className="text-2xl font-black text-blue-600">∞</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Scale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Multi-Step Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xl transition-all duration-300">
          <div className="lg:hidden mb-8 text-center flex justify-center">
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
                A
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">Atlas OS</span>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-blue-600' : 'bg-slate-100'}`} />
            ))}
          </div>

          {/* ─── Step 1: Details ─── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
              <p className="text-slate-500 text-xs mt-1">We'll send a verification code to your email.</p>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">{error}</div>
              )}

              <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={form.fullName} 
                    onChange={handleChange('fullName')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={form.mobile} 
                    onChange={handleChange('mobile')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input 
                    type="email" 
                    placeholder="you@company.com" 
                    value={form.email} 
                    onChange={handleChange('email')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input 
                    type="password" 
                    placeholder="Minimum 8 characters" 
                    value={form.password} 
                    onChange={handleChange('password')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm" 
                    required 
                    minLength={8} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 text-sm shadow-sm h-11"
                >
                  {loading ? 'Sending Code...' : 'Send Verification Code →'}
                </button>
              </form>
            </div>
          )}

          {/* ─── Step 2: OTP Verify ─── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline font-semibold mb-4 inline-flex items-center gap-1">← Back</button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h1>
              <p className="text-slate-500 text-xs mt-1">
                We sent a 6-digit code to <span className="font-semibold text-slate-900">{form.email}</span>
              </p>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">{error}</div>
              )}

              <form onSubmit={handleVerifyAndRegister} className="mt-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-center text-2xl font-bold tracking-[0.4em] font-mono"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 text-sm shadow-sm h-11"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-500">
                Didn't receive the code?{' '}
                <button onClick={handleResend} disabled={loading} className="text-blue-600 hover:underline font-semibold transition-colors">
                  Resend
                </button>
              </p>
            </div>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl border border-emerald-100">✓</div>
              <h1 className="text-2xl font-bold text-slate-900">Account Created!</h1>
              <p className="text-slate-500 text-xs mt-2">Your email has been verified. Redirecting you to login...</p>
              <div className="mt-5 w-24 h-1.5 bg-blue-600 rounded-full mx-auto animate-pulse" />
            </div>
          )}

          {step !== 3 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-bold transition-colors">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
