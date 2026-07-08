'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';

const columns = [
  { key: 'name', label: 'Product Name' },
  { key: 'sku', label: 'SKU' },
  {
    key: 'sellingPrice',
    label: 'Selling Price',
    render: (val) => val ? `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—',
  },
  {
    key: 'purchasePrice',
    label: 'Purchase Price',
    render: (val) => val ? `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—',
  },
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

export default function CatalogPage() {
  const { session } = useBusinessContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Drawer State
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', type: 'PHYSICAL', sellingPrice: '', purchasePrice: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/catalog/products', {
        token: session.token,
        businessId: session.businessId,
      });
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleCreateProduct(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/catalog/products', {
        ...form,
        sellingPrice: form.sellingPrice || undefined,
        purchasePrice: form.purchasePrice || undefined
      }, {
        token: session.token,
        businessId: session.businessId
      });
      setDrawerOpen(false);
      setForm({ name: '', sku: '', type: 'PHYSICAL', sellingPrice: '', purchasePrice: '' });
      fetchProducts(); // Refresh table
    } catch(err) {
      alert(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in this business</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products yet. Add your first product via the API."
      />

      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="Create New Product">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
            <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
              <input type="number" step="0.01" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
              <input type="number" step="0.01" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
