'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';

const statusColors = {
  DRAFT: 'bg-slate-100 text-slate-600',
  UNPAID: 'bg-amber-50 text-amber-700',
  PARTIALLY_PAID: 'bg-blue-50 text-blue-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const columns = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'invoiceDate', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
  { key: 'totalAmount', label: 'Total', render: (val) => `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
  { key: 'balanceAmount', label: 'Balance', render: (val) => <span className={parseFloat(val) > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>₹{parseFloat(val || 0).toLocaleString()}</span> },
  { key: 'paymentStatus', label: 'Status', render: (val) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[val] || 'bg-slate-100 text-slate-600'}`}>{val?.replace('_', ' ')}</span> },
];

export default function SalesPage() {
  const { session } = useBusinessContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer States
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Form State
  const [form, setForm] = useState({ 
    customerId: '', 
    lines: [{ productId: '', quantity: 1, unitPrice: '' }] 
  });

  const fetchInvoices = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/api/sales/invoices', { token: session.token, businessId: session.businessId });
      setInvoices(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) { setError(err.message || 'Failed to load invoices.'); } finally { setLoading(false); }
  }, [session]);

  const loadDropdowns = async () => {
    try {
      const [crmRes, prodRes] = await Promise.all([
        apiClient.get('/api/crm/parties?partyType=CUSTOMER', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/catalog/products', { token: session.token, businessId: session.businessId })
      ]);
      setCustomers(Array.isArray(crmRes.data) ? crmRes.data : (crmRes.data?.items || []));
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.items || []));
    } catch(e) { console.error('Failed to load dropdowns', e); }
  };

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { if (isDrawerOpen) loadDropdowns(); }, [isDrawerOpen]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/sales/invoices', form, { token: session.token, businessId: session.businessId });
      setDrawerOpen(false);
      setForm({ customerId: '', lines: [{ productId: '', quantity: 1, unitPrice: '' }] });
      fetchInvoices();
    } catch(err) {
      alert(err.message || 'Failed to create Invoice');
    } finally { setSaving(false); }
  };

  const updateLine = (i, field, value) => {
    const newLines = [...form.lines];
    newLines[i][field] = value;
    // Auto-detect unitPrice if product is selected
    if (field === 'productId') {
       const p = products.find(prod => prod.id === value);
       if (p) newLines[i].unitPrice = p.sellingPrice || 0;
    }
    setForm({ ...form, lines: newLines });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">{invoices.length} total</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchInvoices} className="text-sm px-4 py-2 rounded-lg border border-slate-200">↻ Refresh</button>
           <button onClick={() => setDrawerOpen(true)} className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">+ Create Invoice</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <DataTable columns={columns} data={invoices} loading={loading} emptyMessage="No invoices yet." />

      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="New Sales Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
            <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
               <option value="">Select a Customer...</option>
               {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Line Items</label>
                <button type="button" onClick={() => setForm({...form, lines: [...form.lines, {productId:'', quantity:1, unitPrice:''}]})} className="text-xs text-indigo-600">+ Add Line</button>
             </div>
             <div className="space-y-3">
               {form.lines.map((line, i) => (
                 <div key={i} className="flex gap-2 items-start p-3 bg-slate-50 border border-slate-100 rounded-lg">
                   <div className="flex-1">
                      <select required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded">
                         <option value="">Product...</option>
                         {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                   <div className="w-20">
                      <input required type="number" min="1" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded" placeholder="Qty" />
                   </div>
                   <div className="w-24">
                      <input required type="number" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded" placeholder="Price" />
                   </div>
                   {form.lines.length > 1 && (
                     <button type="button" onClick={() => setForm({...form, lines: form.lines.filter((_, idx) => idx !== i)})} className="text-red-500 font-bold px-2 py-1">✕</button>
                   )}
                 </div>
               ))}
             </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? 'Generating...' : 'Finalize Invoice (Zero-Sum Ledger)'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
