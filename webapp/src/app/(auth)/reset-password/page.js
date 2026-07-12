'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Send OTP (Verification code)
  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      return setError('A valid email is required for verification.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  // Verify OTP and reset password
  async function handleVerifyAndReset(e) {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) return setError('Please enter the 6-digit verification code.');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');

    setLoading(true);
    try {
      // Verify OTP using the real api
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData?.message || 'Verification failed. Please check the code.');
        return;
      }

      // Update password in the database
      const resetRes = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });
      const resetData = await resetRes.json();

      if (!resetRes.ok) {
        setError(resetData?.message || 'Failed to update password.');
        return;
      }

      setStep(3);
      setTimeout(() => router.push('/login'), 3000);
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
        body: JSON.stringify({ email }),
      });
      setError('');
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="flex bg-background min-h-screen items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-premium border border-border transition-all duration-300">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity">Atlas OS</h1>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Reset your account password</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        )}

        {/* Step 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Registered Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 text-sm"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code →'}
            </button>
          </form>
        )}

        {/* Step 2: Input OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-5 animate-in fade-in duration-300">
            <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline font-semibold mb-2 inline-flex items-center gap-1">← Back</button>
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
              </p>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-center text-lg font-bold tracking-[0.2em] font-mono"
                maxLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 text-sm"
            >
              {loading ? 'Verifying...' : 'Verify & Reset Password'}
            </button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              Didn't receive the code?{' '}
              <button type="button" onClick={handleResend} disabled={loading} className="text-primary hover:underline font-semibold">
                Resend
              </button>
            </p>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl border border-emerald-500/20">✅</div>
            <h1 className="text-2xl font-bold text-foreground">Password Reset!</h1>
            <p className="text-muted-foreground text-sm mt-2">Your verification succeeded. Redirecting you to login...</p>
            <div className="mt-5 w-24 h-1.5 bg-primary rounded-full mx-auto animate-pulse" />
          </div>
        )}

        {step !== 3 && (
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline font-bold transition-colors">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
