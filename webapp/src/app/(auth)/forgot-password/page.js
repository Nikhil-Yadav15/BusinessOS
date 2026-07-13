'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('EMAIL_INPUT'); // 'EMAIL_INPUT' | 'RESET_PASSWORD'
  
  // States for Email Step
  const [email, setEmail] = useState('');
  
  // States for Reset Step
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  
  // Global form UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Failed to request password reset.');
        return;
      }

      setSuccess('Reset code sent! Check your email inbox.');
      setStep('RESET_PASSWORD');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: form.otp, newPassword: form.newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Failed to reset password. Check your code.');
        return;
      }

      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100">
      {/* Left Panel — Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-20">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-md w-8 h-8 flex items-center justify-center font-bold text-lg shadow-sm">A</div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Atlas OS</span>
          </Link>
        </div>
        
        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-2">
          Secure account <span className="text-blue-600">recovery</span>.
        </h2>
        
        <p className="text-slate-500 mt-6 text-sm lg:text-base leading-relaxed max-w-md">
          Lost access? Recover your account quickly and securely within seconds and get back to managing your business.
        </p>
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recover account</h1>
            <p className="text-slate-500 text-sm mt-1">
              {step === 'EMAIL_INPUT' 
                ? 'Enter your email to receive a password reset code.' 
                : 'Enter the verification code and your new password.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
              {success}
            </div>
          )}

          {step === 'EMAIL_INPUT' ? (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="owner@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2 text-[15px]"
              >
                {loading ? 'Sending Request...' : 'Send Reset Code →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Reset Code (OTP)</label>
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={form.otp}
                  onChange={(e) => setForm(f => ({ ...f, otp: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm tracking-[4px] text-center"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.newPassword}
                  onChange={(e) => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Rewrite password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || success !== ''}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2 text-[15px]"
              >
                {loading ? 'Resetting Password...' : 'Reset Password ✓'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center text-sm font-medium">
            <Link href="/login" className="text-slate-500 hover:text-blue-600 transition-colors">
              ← Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
