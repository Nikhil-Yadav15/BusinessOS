'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
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
  {
    key: 'invoiceDate',
    label: 'Date',
    render: (val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  },
  {
    key: 'totalAmount',
    label: 'Total',
    render: (val) => `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  },
  {
    key: 'paidAmount',
    label: 'Paid',
    render: (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  },
  {
    key: 'balanceAmount',
    label: 'Balance',
    render: (val) => (
      <span className={parseFloat(val) > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
        ₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: 'paymentStatus',
    label: 'Status',
    render: (val) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[val] || 'bg-slate-100 text-slate-600'}`}>
        {val?.replace('_', ' ')}
      </span>
    ),
  },
];

export default function SalesPage() {
  const { session } = useBusinessContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summary totals
  const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((s, i) => s + parseFloat(i.paidAmount || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + parseFloat(i.balanceAmount || 0), 0);

  const fetchInvoices = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/sales/invoices', {
        token: session.token,
        businessId: session.businessId,
      });
      setInvoices(res.data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={fetchInvoices}
          className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${totalOutstanding > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        emptyMessage="No invoices yet. Create your first sales invoice via the API."
      />
    </div>
  );
}
