'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import { apiClient } from '../../../../lib/apiClient.js';

const accountColumns = [
  { key: 'accountCode', label: 'Code' },
  { key: 'accountName', label: 'Account Name' },
  {
    key: 'accountType',
    label: 'Type',
    render: (val) => {
      const colors = {
        ASSET: 'bg-blue-50 text-blue-700',
        LIABILITY: 'bg-red-50 text-red-700',
        EQUITY: 'bg-purple-50 text-purple-700',
        INCOME: 'bg-emerald-50 text-emerald-700',
        EXPENSE: 'bg-amber-50 text-amber-700',
      };
      return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-600'}`}>
          {val}
        </span>
      );
    },
  },
  {
    key: 'status',
    label: 'Status',
    render: (val) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${val === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {val}
      </span>
    ),
  },
];

export default function LedgerPage() {
  const { session } = useBusinessContext();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAccounts = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/ledger/accounts', {
        token: session.token,
        businessId: session.businessId,
      });
      setAccounts(res.data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load chart of accounts.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Group accounts by type for the summary
  const byType = accounts.reduce((acc, a) => {
    if (!acc[a.accountType]) acc[a.accountType] = 0;
    acc[a.accountType]++;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounting Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Chart of Accounts ({accounts.length} accounts)</p>
        </div>
        <button onClick={fetchAccounts}
          className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Account Type Summary */}
      {accounts.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(byType).map(([type, count]) => (
            <div key={type} className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm shadow-sm">
              <span className="text-slate-500">{type}: </span>
              <span className="font-semibold text-slate-900">{count}</span>
            </div>
          ))}
        </div>
      )}

      <DataTable
        columns={accountColumns}
        data={accounts}
        loading={loading}
        emptyMessage="No ledger accounts yet. Create your Chart of Accounts via the API."
      />
    </div>
  );
}
