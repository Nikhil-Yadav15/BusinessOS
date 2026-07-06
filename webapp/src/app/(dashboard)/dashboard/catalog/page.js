'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
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

  const fetchProducts = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/catalog/products', {
        token: session.token,
        businessId: session.businessId,
      });
      setProducts(res.data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in this business</p>
        </div>
        <button
          onClick={fetchProducts}
          className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          ↻ Refresh
        </button>
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
    </div>
  );
}
