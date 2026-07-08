'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
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
  { key: 'invoiceDate', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
  { key: 'totalAmount', label: 'Total', render: (val) => `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
  { key: 'balanceAmount', label: 'Balance', render: (val) => <span className={parseFloat(val) > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>₹{parseFloat(val || 0).toLocaleString()}</span> },
  { key: 'status', label: 'Status', render: (val) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[val] || 'bg-slate-100 text-slate-600'}`}>{val?.replace('_', ' ')}</span> },
];

export default function SalesPage() {
  const { session } = useBusinessContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer States
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Invoice Viewer Modal
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Forms
  const [form, setForm] = useState({ customerId: '', lines: [{ productId: '', quantity: 1, unitPrice: '' }] });
  const [paymentForm, setPaymentForm] = useState({ invoiceId: '', invoiceNum: '', amount: '', paymentMethod: 'CASH', referenceNumber: '', remarks: '', maxBalance: 0 });

  const fetchInvoices = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/api/sales/invoices', { token: session.token, businessId: session.businessId });
      setInvoices(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) { setError(err.message || 'Failed to load invoices.'); } finally { setLoading(false); }
  }, [session]);

  const loadDropdowns = async () => {
    try {
      const [crmRes, prodRes] = await Promise.all([
        apiClient.get('/api/crm/parties?partyType=CUSTOMER', { token: session.token, businessId: session.businessId }),
        apiClient.get('/api/catalog/products', { token: session.token, businessId: session.businessId })
      ]);
      setCustomers(Array.isArray(crmRes.data) ? crmRes.data : (crmRes.data?.items || []));
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.items || []));
    } catch(e) { console.error('Failed to load dropdowns', e); }
  };

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { if (isDrawerOpen) loadDropdowns(); }, [isDrawerOpen]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/sales/invoices', form, { token: session.token, businessId: session.businessId });
      setDrawerOpen(false);
      setForm({ customerId: '', lines: [{ productId: '', quantity: 1, unitPrice: '' }] });
      fetchInvoices();
    } catch(err) {
      alert(err.message || 'Failed to create Invoice');
    } finally { setSaving(false); }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/sales/payments', {
        invoiceId: paymentForm.invoiceId,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentForm.paymentMethod,
        amount: parseFloat(paymentForm.amount),
        referenceNumber: paymentForm.referenceNumber || undefined,
        remarks: paymentForm.remarks || undefined
      }, { token: session.token, businessId: session.businessId });
      setPaymentDrawerOpen(false);
      fetchInvoices();
    } catch(err) {
      alert(err.message || 'Failed to record payment');
    } finally { setSaving(false); }
  };

  const handleOpenPayment = (invoice) => {
    setPaymentForm({
      invoiceId: invoice.id,
      invoiceNum: invoice.invoiceNumber,
      amount: invoice.balanceAmount,
      paymentMethod: 'CASH',
      referenceNumber: '',
      remarks: '',
      maxBalance: invoice.balanceAmount
    });
    setPaymentDrawerOpen(true);
  };

  const openInvoiceReceipt = (invoice) => {
    setViewingInvoice(invoice);
  };

  const updateLine = (i, field, value) => {
    const newLines = [...form.lines];
    newLines[i][field] = value;
    if (field === 'productId') {
       const p = products.find(prod => prod.id === value);
       if (p) newLines[i].unitPrice = p.sellingPrice || 0;
    }
    setForm({ ...form, lines: newLines });
  };

  const dynamicColumns = [...columns, {
    key: 'actions', 
    label: '', 
    render: (_, row) => (
      <div className="flex justify-end gap-3 font-medium text-xs">
        <button onClick={() => openInvoiceReceipt(row)} className="text-indigo-600 hover:text-indigo-800 transition-colors">Receipt</button>
        {parseFloat(row.balanceAmount) > 0 && (
          <button onClick={() => handleOpenPayment(row)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Pay</button>
        )}
      </div>
    )
  }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">{invoices.length} total</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchInvoices} className="text-sm px-4 py-2 rounded-lg border border-slate-200">↻ Refresh</button>
           <button onClick={() => setDrawerOpen(true)} className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">+ Create Invoice</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="print:hidden">
        <DataTable columns={dynamicColumns} data={invoices} loading={loading} emptyMessage="No invoices yet." />
      </div>

      {/* CREATE INVOICE DRAWER */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="New Sales Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
            <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
               <option value="">Select a Customer...</option>
               {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Line Items</label>
                <button type="button" onClick={() => setForm({...form, lines: [...form.lines, {productId:'', quantity:1, unitPrice:''}]})} className="text-xs text-indigo-600">+ Add Line</button>
             </div>
             <div className="space-y-3">
               {form.lines.map((line, i) => (
                 <div key={i} className="flex gap-2 items-start p-3 bg-slate-50 border border-slate-100 rounded-lg">
                   <div className="flex-1">
                      <select required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded">
                         <option value="">Product...</option>
                         {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                   <div className="w-20">
                      <input required type="number" min="1" step="any" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded" placeholder="Qty" />
                   </div>
                   <div className="w-24">
                      <input required type="number" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded" placeholder="Price" />
                   </div>
                   {form.lines.length > 1 && (
                     <button type="button" onClick={() => setForm({...form, lines: form.lines.filter((_, idx) => idx !== i)})} className="text-red-500 font-bold px-2 py-1">✕</button>
                   )}
                 </div>
               ))}
             </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? 'Generating...' : 'Finalize Invoice (Zero-Sum Ledger)'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* RECORD PAYMENT DRAWER */}
      <Drawer isOpen={paymentDrawerOpen} onClose={() => setPaymentDrawerOpen(false)} title="Record Incoming Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-6 text-sm">
             <p className="text-indigo-800 font-medium">Invoice: {paymentForm.invoiceNum}</p>
             <p className="text-indigo-600 mt-1">Remaining Balance to clear: ₹{parseFloat(paymentForm.maxBalance).toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount Received (₹) *</label>
            <input required type="number" step="0.01" max={paymentForm.maxBalance} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method *</label>
            <select required value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
               <option value="CASH">Cash</option>
               <option value="UPI">UPI</option>
               <option value="CARD">Card</option>
               <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Ref (Optional)</label>
            <input type="text" value={paymentForm.referenceNumber} onChange={e => setPaymentForm({...paymentForm, referenceNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="UPI ID / Cheque Num" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? 'Processing...' : 'Record Payment into Ledger'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* PRINTABLE RECEIPT MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm print:bg-white print:backdrop-blur-none p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden print:shadow-none print:max-w-full">
            <div className="p-8 sm:p-12 print:p-0">
               
               {/* Invoice Header */}
               <div className="flex justify-between items-start border-b border-slate-200 pb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                    <p className="text-slate-500 text-sm mt-1">Receipt for goods and services</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{viewingInvoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-500 mt-1">{new Date(viewingInvoice.invoiceDate).toLocaleDateString()}</p>
                    <span className={`inline-flex px-2 py-0.5 mt-3 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusColors[viewingInvoice.status] || 'bg-slate-100 text-slate-600'}`}>{viewingInvoice.status}</span>
                  </div>
               </div>

               {/* Financial Breakdown */}
               <div className="mt-8 bg-slate-50/50 rounded-xl border border-slate-100 p-6 space-y-3 print:bg-transparent print:border-none print:p-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal amount</span>
                    <span className="font-medium text-slate-900">₹{parseFloat(viewingInvoice.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Calculated Taxes</span>
                    <span className="font-medium text-slate-900">₹{parseFloat(viewingInvoice.taxAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Payments Applied</span>
                    <span className="font-medium text-emerald-600">- ₹{parseFloat(viewingInvoice.paidAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4">
                    <span className="text-base font-semibold text-slate-900">Amount Due</span>
                    <span className={`text-2xl font-black tracking-tight ${parseFloat(viewingInvoice.balanceAmount) > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      ₹{parseFloat(viewingInvoice.balanceAmount).toLocaleString()}
                    </span>
                  </div>
               </div>
               
               {/* Controls */}
               <div className="mt-10 flex justify-end gap-3 print:hidden">
                 <button onClick={() => setViewingInvoice(null)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Close</button>
                 <button onClick={() => window.print()} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">Print & Download PDF</button>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
