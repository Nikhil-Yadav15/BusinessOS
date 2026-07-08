'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';

const movementColumns = [
  { key: 'movementType', label: 'Type',
    render: (val) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${val === 'ADJUSTMENT' ? 'bg-blue-50 text-blue-700' : val === 'SALE' ? 'bg-red-50 text-red-700' : val === 'PURCHASE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{val}</span>
  },
  { key: 'quantity', label: 'Quantity', render: (val) => parseFloat(val).toFixed(3) },
  { key: 'reason', label: 'Reason' },
  { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
];

export default function InventoryPage() {
  const { session } = useBusinessContext();
  const [snapshot, setSnapshot] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer States
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  
  const [form, setForm] = useState({ 
    productId: '', 
    quantity: '', 
    reason: 'Stock correction' 
  });

  const fetchInventory = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    try {
      const [snapRes, movRes] = await Promise.all([
        apiClient.get('/api/inventory', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/inventory/movements', { token: session.token, businessId: session.businessId }),
      ]);
      setSnapshot(Array.isArray(snapRes.data) ? snapRes.data : (snapRes.data?.items || []));
      setMovements(Array.isArray(movRes.data) ? movRes.data : (movRes.data?.items || []));
    } catch (err) { setError(err.message || 'Failed to load inventory.'); } finally { setLoading(false); }
  }, [session]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  useEffect(() => {
    if (isDrawerOpen) {
       apiClient.get('/api/catalog/products', { token: session.token, businessId: session.businessId })
        .then(res => setProducts(Array.isArray(res.data) ? res.data : (res.data?.items || [])))
        .catch(console.error);
    }
  }, [isDrawerOpen]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/inventory/adjust', {
        ...form,
        quantity: parseFloat(form.quantity)
      }, { token: session.token, businessId: session.businessId });
      setDrawerOpen(false);
      setForm({ productId: '', quantity: '', reason: 'Stock correction' });
      fetchInventory();
    } catch(err) {
      alert(err.message || 'Failed to adjust stock');
    } finally { setSaving(false); }
  };

  const totalStock = snapshot.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Stock snapshots and movement history</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchInventory} className="text-sm px-4 py-2 rounded-lg border border-slate-200">↻ Refresh</button>
           <button onClick={() => setDrawerOpen(true)} className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">+ Adjust Stock</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Stock Units</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{totalStock.toFixed(3)}</p>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Recent Stock Movements</h2>
        <DataTable columns={movementColumns} data={movements} loading={loading} emptyMessage="No stock movements recorded yet." />
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="Adjust Stock">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
            <select required value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
               <option value="">Select a Product...</option>
               {products.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Change (+ or -) *</label>
            <input required type="number" step="any" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="-5 or +10" />
            <p className="text-xs text-slate-500 mt-1">Use a negative number to subtract stock.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <input type="text" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
