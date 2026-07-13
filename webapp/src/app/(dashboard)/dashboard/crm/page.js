'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';

const columns = [
  { key: 'name', label: 'Name' },
  {
    key: 'partyType',
    label: 'Type',
    render: (val) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        val === 'CUSTOMER' ? 'bg-blue-50 text-blue-700'
        : val === 'SUPPLIER' ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-600'
      }`}>
        {val}
      </span>
    ),
  },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'city', label: 'City' },
  {
    key: 'status',
    label: 'Status',
    render: (val) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        val === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}>
        {val}
      </span>
    ),
  },
];

export default function CRMPage() {
  const { session } = useBusinessContext();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: '', partyType: 'CUSTOMER', mobile: '', email: '' });
  const [saving, setSaving] = useState(false);

  const fetchParties = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const url = filter ? `/api/crm/parties?partyType=${filter}` : '/api/crm/parties';
      const res = await apiClient.get(url, { token: session.token, businessId: session.businessId });
      setParties(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) { setError(err.message || 'Failed to load parties.'); } 
    finally { setLoading(false); }
  }, [session, filter]);

  useEffect(() => { fetchParties(); }, [fetchParties]);

  async function handleCreateParty(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/crm/parties', form, { token: session.token, businessId: session.businessId });
      setDrawerOpen(false);
      setForm({ name: '', partyType: 'CUSTOMER', mobile: '', email: '' });
      fetchParties();
    } catch(err) {
      alert(err.message || 'Failed to create CRM record');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">CRM & Parties</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{parties.length} record{parties.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1 sm:flex-none text-[13px] font-medium px-4 py-2.5 rounded-xl border border-slate-200/60 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-[2px_4px_12px_rgba(0,0,0,0.03)] cursor-pointer">
            <option value="">All Types</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SUPPLIER">Suppliers</option>
            <option value="BOTH">Both</option>
          </select>
          <button onClick={fetchParties} className="text-sm font-semibold px-4 py-2.5 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.98]">↻ Refresh</button>
          <button onClick={() => setDrawerOpen(true)} className="flex-1 sm:flex-none text-sm font-bold px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-md shadow-slate-200 active:scale-[0.98]">+ Add Record</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <DataTable columns={columns} data={parties} loading={loading} emptyMessage="No parties yet. Add customers and suppliers." />

      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="Create New Record">
        <form onSubmit={handleCreateParty} className="space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Party Type</label>
            <select value={form.partyType} onChange={e => setForm({...form, partyType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all">
               <option value="CUSTOMER">Customer</option>
               <option value="SUPPLIER">Supplier</option>
               <option value="BOTH">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Business Name / Full Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Mobile Number</label>
            <input type="text" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" />
          </div>
          <div className="pt-4 border-t border-slate-200/60 mt-4 text-center">
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50">
              {saving ? 'Creating...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
