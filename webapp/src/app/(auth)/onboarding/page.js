'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, saveSession } from '../../../lib/session.js';

const BUSINESS_TYPES = [
  { value: 'RETAIL', label: '🛍️ Retail', desc: 'Sell directly to consumers' },
  { value: 'WHOLESALE', label: '📦 Wholesale', desc: 'Sell in bulk to retailers' },
  { value: 'DISTRIBUTOR', label: '🚚 Distributor', desc: 'Supply chain intermediary' },
  { value: 'MANUFACTURER', label: '🏭 Manufacturer', desc: 'Produce goods from raw materials' },
  { value: 'SERVICE', label: '💼 Service', desc: 'Provide professional services' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    legalName: '',
    businessType: '',
    phone: '',
    email: '',
    gstin: '',
    pan: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const selectType = (type) => setForm(f => ({ ...f, businessType: type }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Business name is required.');
    if (!form.businessType) return setError('Please select a business type.');
    if (!form.phone.trim()) return setError('A contact phone number is required.');

    setLoading(true);
    try {
      const session = getSession();
      if (!session?.token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Failed to create business.');
        return;
      }

      // Persist business context
      saveSession({
        accessToken: session.token,
        user: session.user,
        businessId: data.business.id,
      });

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight">Atlas OS</span>
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-xl bg-card p-8 rounded-2xl border border-border shadow-premium transition-all duration-300">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">What kind of business do you run?</h1>
              <p className="text-sm text-muted-foreground mt-1">This helps us configure your workspace with the right defaults.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt.value}
                    onClick={() => selectType(bt.value)}
                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm cursor-pointer
                      ${form.businessType === bt.value 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-border bg-background hover:border-muted-foreground/30'
                      }`}
                  >
                    <span className="font-semibold text-foreground">{bt.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">{bt.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { if (form.businessType) setStep(2); else setError('Please select a business type.'); }}
                className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-sm disabled:opacity-50 disabled:pointer-events-none"
                disabled={!form.businessType}
              >
                Continue →
              </button>

              <div className="mt-8 pt-6 border-t border-border text-center">
                <h3 className="text-sm font-semibold text-foreground">Joining an existing business?</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Ask your manager to invite this account's email address from their team settings. 
                  Once invited, you can <button onClick={() => window.location.href = '/login'} className="text-primary font-bold hover:underline">re-login</button> to access their dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline font-semibold mb-4 inline-flex items-center gap-1">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Tell us about your business</h1>
              <p className="text-sm text-muted-foreground mt-1">We will use this to set up your private tenant workspace.</p>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Business Name *</label>
                  <input type="text" placeholder="e.g. Enterprises" value={form.name} onChange={handleChange('name')}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Legal Name <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input type="text" placeholder="Registered legal entity name" value={form.legalName} onChange={handleChange('legalName')}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Phone *</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange('phone')}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Email <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input type="email" placeholder="hello@company.com" value={form.email} onChange={handleChange('email')}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">GSTIN <span className="text-muted-foreground font-normal">(15 chars)</span></label>
                    <input type="text" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={handleChange('gstin')} maxLength={15}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">PAN <span className="text-muted-foreground font-normal">(10 chars)</span></label>
                    <input type="text" placeholder="ABCDE1234F" value={form.pan} onChange={handleChange('pan')} maxLength={10}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm font-mono" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 text-sm shadow-sm"
                >
                  {loading ? 'Setting up your workspace...' : 'Launch My Business →'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
