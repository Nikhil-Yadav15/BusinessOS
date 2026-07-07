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
        ...session,
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg text-indigo-700 tracking-tight">Atlas OS</span>
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`w-8 h-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">What kind of business do you run?</h1>
              <p className="text-sm text-slate-500 mt-1">This helps us configure your workspace with the right defaults.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt.value}
                    onClick={() => selectType(bt.value)}
                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all text-sm
                      ${form.businessType === bt.value 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm shadow-indigo-100' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <span className="font-semibold text-slate-900">{bt.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{bt.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { if (form.businessType) setStep(2); else setError('Please select a business type.'); }}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm disabled:opacity-50"
                disabled={!form.businessType}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Business Details */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold mb-4 inline-flex items-center gap-1">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tell us about your business</h1>
              <p className="text-sm text-slate-500 mt-1">We will use this to set up your private tenant workspace.</p>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
                  <input type="text" placeholder="e.g. Yadav Enterprises" value={form.name} onChange={handleChange('name')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Legal Name <span className="text-slate-400">(optional)</span></label>
                  <input type="text" placeholder="Registered legal entity name" value={form.legalName} onChange={handleChange('legalName')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange('phone')}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400">(optional)</span></label>
                    <input type="email" placeholder="hello@company.com" value={form.email} onChange={handleChange('email')}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN <span className="text-slate-400">(15 chars)</span></label>
                    <input type="text" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={handleChange('gstin')} maxLength={15}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">PAN <span className="text-slate-400">(10 chars)</span></label>
                    <input type="text" placeholder="ABCDE1234F" value={form.pan} onChange={handleChange('pan')} maxLength={10}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-sm shadow-sm"
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
