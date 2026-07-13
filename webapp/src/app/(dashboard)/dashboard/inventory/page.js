'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';
import { ProductStockBarChart, StockHealthPie } from '../../../../components/dashboard/charts/InventoryCharts.js';

const movementColumns = [
  {
    key: 'movementType', label: 'Type',
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
    quantityChange: '',
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
        productId: form.productId,
        quantityChange: parseFloat(form.quantityChange),
        reason: form.reason
      }, { token: session.token, businessId: session.businessId });
      setDrawerOpen(false);
      setForm({ productId: '', quantityChange: '', reason: 'Stock correction' });
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Failed to adjust stock');
    } finally { setSaving(false); }
  };

  const totalStock = snapshot.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">Inventory Ledger</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Stock snapshots and movement history</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={fetchInventory} className="flex-1 sm:flex-none text-sm font-semibold px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.98]">↻ Refresh</button>
          <button onClick={() => setDrawerOpen(true)} className="cursor-pointer flex-1 sm:flex-none text-sm font-bold px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-md shadow-slate-200 active:scale-[0.98]">+ Adjust Stock</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>}

      <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest">Total Stock Units</p>
          <p className="text-4xl font-extrabold text-slate-900 mt-2 tracking-tighter">{totalStock.toFixed(3)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 text-slate-900 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 tracking-tight text-[15px]">Product Stock Levels</h3>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Current actual physical quantity of catalog items</p>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] md:min-h-[300px]">
            {loading ? <div className="h-[220px] md:h-[300px] flex items-center justify-center text-slate-400 font-medium text-sm">Loading data...</div> : <ProductStockBarChart inventory={snapshot} />}
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 text-slate-900 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 tracking-tight text-[15px]">Stock Health</h3>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Ratio of healthy vs critically low stock</p>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] md:min-h-[300px]">
            {loading ? <div className="h-[220px] md:h-[300px] flex items-center justify-center text-slate-400 font-medium text-sm">Loading ratio...</div> : <StockHealthPie inventory={snapshot} />}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4">Recent Stock Movements</h2>
        <DataTable columns={movementColumns} data={movements} loading={loading} emptyMessage="No stock movements recorded yet." />
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="Adjust Stock">
        <form onSubmit={handleAdjust} className="space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Product *</label>
            <select required value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all">
              <option value="">Select a Product...</option>
              {products.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Quantity Change (+ or -) *</label>
            <input required type="number" step="any" value={form.quantityChange} onChange={e => setForm({ ...form, quantityChange: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" placeholder="-5 or +10" />
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">Use a negative number to subtract stock.</p>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Reason</label>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" />
          </div>
          <div className="pt-4 border-t border-slate-200/60 mt-4 text-center">
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50">
              {saving ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
