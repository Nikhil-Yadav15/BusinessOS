'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';
import { ProfitMarginBarChart, CatalogDistributionPie } from '../../../../components/dashboard/charts/CatalogCharts.js';

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
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${val === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
        {val}
      </span>
    ),
  },
];

export default function CatalogPage() {
  const { session } = useBusinessContext();
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer State
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', type: 'PHYSICAL', sellingPrice: '', purchasePrice: '', unitId: '' });
  const [saving, setSaving] = useState(false);

  // Inline Unit Creator State
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitForm, setNewUnitForm] = useState({ name: '', shortName: '' });

  const fetchProducts = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const [res, unitRes] = await Promise.all([
        apiClient.get('/api/catalog/products', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/catalog/units', { token: session.token, businessId: session.businessId })
      ]);
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.items || []));
      const allUnits = Array.isArray(unitRes.data) ? unitRes.data : (unitRes.data?.items || []);
      setUnits(allUnits.filter(u => u.status === 'ACTIVE'));
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      sku: row.sku || '',
      type: row.type || 'PHYSICAL',
      sellingPrice: row.sellingPrice || '',
      purchasePrice: row.purchasePrice || '',
      unitId: row.unitId || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to definitively delete '${name}'? This action cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/catalog/products/${id}`, {
        token: session.token,
        businessId: session.businessId
      });
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  async function handleSaveProduct(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Strip empty strings — the backend DTO treats them as invalid
      const payload = {
        ...form,
        // SKU: auto-generate a simple SKU if left blank
        sku: form.sku?.trim() || `SKU-${Date.now()}`,
      };

      if (editingId) {
        await apiClient.patch(`/api/catalog/products/${editingId}`, payload, {
          token: session.token,
          businessId: session.businessId
        });
      } else {
        await apiClient.post('/api/catalog/products', payload, {
          token: session.token,
          businessId: session.businessId
        });
      }
      setDrawerOpen(false);
      setEditingId(null);
      setForm({ name: '', sku: '', type: 'PHYSICAL', sellingPrice: '', purchasePrice: '', unitId: '' });
      fetchProducts(); // Refresh table
    } catch (err) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  const handleCreateUnit = async () => {
    if (!newUnitForm.name) return alert('Unit name is required.');

    try {
      await apiClient.post('/api/catalog/units', {
        name: newUnitForm.name,
        shortName: newUnitForm.shortName || newUnitForm.name.substring(0, 3).toUpperCase()
      }, {
        token: session.token,
        businessId: session.businessId
      });
      // Refetch units instantly
      const unitRes = await apiClient.get('/api/catalog/units', { token: session.token, businessId: session.businessId });
      const updatedUnits = (Array.isArray(unitRes.data) ? unitRes.data : (unitRes.data?.items || [])).filter(u => u.status === 'ACTIVE');
      setUnits(updatedUnits);
      setIsAddingUnit(false);
      setNewUnitForm({ name: '', shortName: '' });

      // Automatically select the newly created unit in the dropdown
      const newlyCreatedUnit = updatedUnits.find(u => u.name === newUnitForm.name);
      if (newlyCreatedUnit) {
        setForm(prev => ({ ...prev, unitId: newlyCreatedUnit.id }));
      }
    } catch (err) {
      alert('Failed to add unit: ' + err.message);
    }
  };

  const dynamicColumns = [...columns, {
    key: 'actions',
    label: '',
    render: (_, row) => (
      <div className="flex justify-end gap-3 font-medium">
        <button onClick={() => handleEdit(row)} className="text-indigo-600 hover:text-indigo-800 transition-colors">Edit</button>
        <button onClick={() => handleDelete(row.id, row.name)} className="text-red-500 hover:text-red-700 transition-colors">Delete</button>
      </div>
    )
  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in this business</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchProducts}
            className="flex-1 sm:flex-none text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', sku: '', type: 'PHYSICAL', sellingPrice: '', purchasePrice: '', unitId: '' });
              setIsAddingUnit(false);
              setDrawerOpen(true);
            }}
            className="flex-1 sm:flex-none cursor-pointer text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm font-medium"
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Profit Margin Analysis</h3>
              <p className="text-xs text-slate-500">Margin spread (Selling minus Purchase price) across top products</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {loading ? <div className="h-[300px] flex items-center justify-center text-slate-400">Loading data...</div> : <ProfitMarginBarChart products={products} />}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Stock Value by Category</h3>
              <p className="text-xs text-slate-500">Physical Goods vs Digital & Services</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {loading ? <div className="h-[300px] flex items-center justify-center text-slate-400">Loading ratio...</div> : <CatalogDistributionPie products={products} />}
          </div>
        </div>
      </div>

      <DataTable
        columns={dynamicColumns}
        data={products}
        loading={loading}
        emptyMessage="No products yet. Add your first product to get started."
      />

      <Drawer isOpen={isDrawerOpen} onClose={() => { setDrawerOpen(false); setIsAddingUnit(false); }} title={editingId ? "Edit Product" : "Create New Product"}>
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SKU <span className="text-slate-400 font-normal text-xs">(leave blank to auto-generate)</span></label>
            <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PROD-001" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Unit *</label>
              {!isAddingUnit && (
                <button type="button" onClick={() => setIsAddingUnit(true)} className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                  + Create unit
                </button>
              )}
            </div>

            {isAddingUnit ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3 mb-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Name (e.g. Kilograms)</label>
                    <input type="text" value={newUnitForm.name} onChange={e => setNewUnitForm({ ...newUnitForm, name: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-indigo-500" placeholder="Pieces" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Short Name (e.g. Kg)</label>
                    <input type="text" value={newUnitForm.shortName} onChange={e => setNewUnitForm({ ...newUnitForm, shortName: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-indigo-500" placeholder="Pcs" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingUnit(false)} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">Cancel</button>
                  <button type="button" onClick={handleCreateUnit} className="text-xs bg-indigo-600 text-white rounded px-3 py-1 font-medium hover:bg-indigo-700 transition-colors">Save Unit</button>
                </div>
              </div>
            ) : (
              <select required value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="" disabled>Select a unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price *</label>
              <input required type="number" step="0.01" min="0" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price *</label>
              <input required type="number" step="0.01" min="0" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
              {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
