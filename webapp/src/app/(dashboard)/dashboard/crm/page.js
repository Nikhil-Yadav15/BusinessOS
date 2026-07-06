'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
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

  const fetchParties = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const url = filter ? `/api/crm?partyType=${filter}` : '/api/crm';
      const res = await apiClient.get(url, {
        token: session.token,
        businessId: session.businessId,
      });
      setParties(res.data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load parties.');
    } finally {
      setLoading(false);
    }
  }, [session, filter]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM & Parties</h1>
          <p className="text-slate-500 text-sm mt-1">{parties.length} record{parties.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SUPPLIER">Suppliers</option>
            <option value="BOTH">Both</option>
          </select>
          <button
            onClick={fetchParties}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            ↻ Refresh
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
        data={parties}
        loading={loading}
        emptyMessage="No parties yet. Add customers and suppliers via the API."
      />
    </div>
  );
}
