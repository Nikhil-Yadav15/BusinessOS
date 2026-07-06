'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import { apiClient } from '../../../../lib/apiClient.js';

const movementColumns = [
  { key: 'movementType', label: 'Type',
    render: (val) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        val === 'ADJUSTMENT' ? 'bg-blue-50 text-blue-700'
        : val === 'SALE' ? 'bg-red-50 text-red-700'
        : val === 'PURCHASE' ? 'bg-emerald-50 text-emerald-700'
        : 'bg-slate-100 text-slate-500'
      }`}>{val}</span>
    )
  },
  { key: 'quantity', label: 'Quantity',
    render: (val) => parseFloat(val).toFixed(3)
  },
  { key: 'reason', label: 'Reason' },
  { key: 'createdAt', label: 'Date',
    render: (val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  },
];

export default function InventoryPage() {
  const { session } = useBusinessContext();
  const [snapshot, setSnapshot] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInventory = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const [snapRes, movRes] = await Promise.all([
        apiClient.get('/api/inventory', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/inventory/movements', { token: session.token, businessId: session.businessId }),
      ]);
      setSnapshot(snapRes.data?.items || []);
      setMovements(movRes.data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const totalStock = snapshot.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0);
  const totalReserved = snapshot.reduce((sum, s) => sum + parseFloat(s.reservedQuantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Stock snapshots and movement history</p>
        </div>
        <button onClick={fetchInventory}
          className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Stock Units</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalStock.toFixed(3)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Reserved</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalReserved.toFixed(3)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Available</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{(totalStock - totalReserved).toFixed(3)}</p>
        </div>
      </div>

      {/* Movement History */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Recent Stock Movements</h2>
        <DataTable
          columns={movementColumns}
          data={movements}
          loading={loading}
          emptyMessage="No stock movements recorded yet."
        />
      </div>
    </div>
  );
}
