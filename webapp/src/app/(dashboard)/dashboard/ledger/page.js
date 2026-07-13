'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import { apiClient } from '../../../../lib/apiClient.js';
import { CashflowBalanceBar, ExpenseCategoryPie } from '../../../../components/dashboard/charts/LedgerCharts.js';

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
  const [expenses, setExpenses] = useState([]);
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAccounts = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const [accRes, expRes, journalRes] = await Promise.all([
        apiClient.get('/api/ledger/accounts', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/ledger/expenses', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/ledger/journal', { token: session.token, businessId: session.businessId })
      ]);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : (accRes.data?.items || []));
      setExpenses(Array.isArray(expRes.data) ? expRes.data : (expRes.data?.items || []));
      setJournal(Array.isArray(journalRes.data) ? journalRes.data : (journalRes.data?.items || []));
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">Accounting Ledger</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Chart of Accounts ({accounts.length} accounts)</p>
        </div>
        <button onClick={fetchAccounts}
          className="text-sm font-semibold px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.98]">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
      )}

      {/* Account Type Summary */}
      {accounts.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {Object.entries(byType).map(([type, count]) => (
            <div key={type} className="bg-slate-50/50 border border-slate-200/60 rounded-[14px] px-5 py-3 text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mr-2">{type}</span>
              <span className="font-extrabold text-slate-900">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="xl:col-span-2 bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-6 flex flex-col">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-100 text-slate-900 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><path d="M9 21V9"/></svg>
             </div>
             <div>
               <h3 className="font-extrabold text-slate-900 tracking-tight text-[15px]">Cashflow Balance</h3>
               <p className="text-xs text-slate-500 font-medium tracking-wide">Master Journal Credit (In) vs Debit (Out)</p>
             </div>
           </div>
           <div className="flex-1 min-h-[300px]">
             {loading ? <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium text-sm">Loading data...</div> : <CashflowBalanceBar journal={journal} />}
           </div>
        </div>
        
        <div className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-6 flex flex-col">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-100 text-slate-900 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
             </div>
             <div>
               <h3 className="font-extrabold text-slate-900 tracking-tight text-[15px]">Expense Categories</h3>
               <p className="text-xs text-slate-500 font-medium tracking-wide">Distribution of logged expenses</p>
             </div>
           </div>
           <div className="flex-1 min-h-[300px]">
             {loading ? <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium text-sm">Loading ratio...</div> : <ExpenseCategoryPie expenses={expenses} />}
           </div>
        </div>
      </div>

      <DataTable
        columns={accountColumns}
        data={accounts}
        loading={loading}
        emptyMessage="No ledger accounts yet. Create your Chart of Accounts via the API."
      />
    </div>
  );
}
