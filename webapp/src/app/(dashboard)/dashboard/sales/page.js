'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import DataTable from '../../../../components/ui/DataTable.js';
import Drawer from '../../../../components/ui/Drawer.js';
import { apiClient } from '../../../../lib/apiClient.js';
import { DailyRevenueComposedChart, InvoiceStatusPie } from '../../../../components/dashboard/charts/SalesCharts.js';

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
      let subtotal = 0;
      const items = form.lines.map(line => {
        const qty = parseFloat(line.quantity) || 0;
        const price = parseFloat(line.unitPrice) || 0;
        const lineTotal = qty * price;
        subtotal += lineTotal;
        return {
          productId: line.productId,
          quantity: qty,
          unitPrice: price,
          discountAmount: 0,
          taxAmount: 0,
          lineTotal
        };
      });

      // Quick client-side check against stock levels
      for (const item of items) {
        const p = products.find(prod => prod.id === item.productId);
        if (p && item.quantity > p.stock) {
          alert(`Cannot sell more than available stock for ${p.name} (Stock: ${p.stock})`);
          setSaving(false);
          return;
        }
      }

      const payload = {
        customerId: form.customerId || null,
        invoiceType: 'SALE',
        invoiceDate: new Date().toISOString(),
        subtotal,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: subtotal,
        status: 'FINALIZED',
        items
      };

      await apiClient.post('/api/sales/invoices', payload, { token: session.token, businessId: session.businessId });
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
       if (p) {
         newLines[i].unitPrice = p.sellingPrice || 0;
         // Reset/cap quantity if it exceeds new product's stock
         if (parseFloat(newLines[i].quantity) > p.stock) {
           newLines[i].quantity = p.stock;
         }
       }
    }
    if (field === 'quantity') {
       const line = newLines[i];
       const p = products.find(prod => prod.id === line.productId);
       if (p) {
         const val = parseFloat(value);
         if (val > p.stock) {
           newLines[i].quantity = p.stock;
         }
       }
    }
    setForm({ ...form, lines: newLines });
  };

  const dynamicColumns = [...columns, {
    key: 'actions', 
    label: '', 
    render: (_, row) => (
      <div className="flex justify-end gap-3 font-medium text-xs">
        <button onClick={() => openInvoiceReceipt(row)} className="text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer font-semibold active:scale-95">Receipt</button>
        {parseFloat(row.balanceAmount) > 0 && (
          <button onClick={() => handleOpenPayment(row)} className="text-emerald-600 hover:text-emerald-800 transition-all cursor-pointer font-semibold active:scale-95">Pay</button>
        )}
      </div>
    )
  }];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">Sales Invoices</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{invoices.length} total operations</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <button onClick={fetchInvoices} className="flex-1 sm:flex-none text-sm font-semibold px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.98]">↻ Refresh</button>
           <button onClick={() => setDrawerOpen(true)} className="flex-1 sm:flex-none text-sm px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all cursor-pointer active:scale-[0.98] shadow-md shadow-slate-200">+ Create Invoice</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="xl:col-span-2 bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-6 flex flex-col">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-100 text-slate-900 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
             </div>
             <div>
               <h3 className="font-extrabold text-slate-900 tracking-tight text-[15px]">Velocity vs Cashflow</h3>
               <p className="text-xs text-slate-500 font-medium tracking-wide">Daily revenue alongside total volume</p>
             </div>
           </div>
           <div className="flex-1 min-h-[220px] md:min-h-[300px]">
             {loading ? <div className="h-[220px] md:h-[300px] flex items-center justify-center text-slate-400 font-medium text-sm">Loading data...</div> : <DailyRevenueComposedChart invoices={invoices} />}
           </div>
        </div>
        
        <div className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-6 flex flex-col">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-100 text-slate-900 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
             </div>
             <div>
               <h3 className="font-extrabold text-slate-900 tracking-tight text-[15px]">Invoice Status</h3>
               <p className="text-xs text-slate-500 font-medium tracking-wide">Pending vs cleared payments</p>
             </div>
           </div>
           <div className="flex-1 min-h-[220px] md:min-h-[300px]">
             {loading ? <div className="h-[220px] md:h-[300px] flex items-center justify-center text-slate-400 font-medium text-sm">Loading ratio...</div> : <InvoiceStatusPie invoices={invoices} />}
           </div>
        </div>
      </div>

      <div className="print:hidden">
        <DataTable columns={dynamicColumns} data={invoices} loading={loading} emptyMessage="No invoices yet." />
      </div>

      {/* CREATE INVOICE DRAWER */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="New Sales Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Customer *</label>
            <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all">
               <option value="">Select a Customer...</option>
               {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
             <div className="flex justify-between items-center mb-3">
                <label className="text-[13px] font-bold text-slate-900">Line Items</label>
                <button type="button" onClick={() => setForm({...form, lines: [...form.lines, {productId:'', quantity:1, unitPrice:''}]})} className="text-[11px] font-bold tracking-widest uppercase text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-200 transition-all active:scale-[0.98]">+ Add Line</button>
             </div>
             <div className="space-y-3">
                {form.lines.map((line, i) => (
                  <div key={i} className="flex flex-col p-3 bg-slate-50/50 border border-slate-200/60 rounded-[14px] gap-2">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                       <div className="flex-1 w-full sm:w-auto">
                          <select required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)} className="w-full px-3 py-2 text-[13px] font-medium border border-slate-200/80 rounded-lg shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400">
                             <option value="">Product...</option>
                             {products.filter(p => (p.stock || 0) > 0).map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                          </select>
                       </div>
                       <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                         <div className="w-20">
                            <input required type="number" min="1" max={products.find(p => p.id === line.productId)?.stock || undefined} step="any" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} className="w-full px-3 py-2 text-[13px] font-medium border border-slate-200/80 rounded-lg shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400" placeholder="Qty" />
                         </div>
                         <span className="text-slate-400 text-xs font-semibold">x</span>
                         <div className="w-28">
                            <input required type="number" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', e.target.value)} className="w-full px-3 py-2 text-[13px] font-medium border border-slate-200/80 rounded-lg shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400" placeholder="Price" />
                         </div>
                         {form.lines.length > 1 && (
                           <button type="button" onClick={() => setForm({...form, lines: form.lines.filter((_, idx) => idx !== i)})} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg font-bold w-8 h-8 flex items-center justify-center ml-auto sm:ml-0 cursor-pointer active:scale-95 transition-all">✕</button>
                         )}
                       </div>
                    </div>
                    {line.productId && (
                      <div className="text-xs text-slate-500 text-right font-medium pr-2">
                        Line Total: ₹{((parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
           </div>

           {/* Running Totals Summary Section */}
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
             <div className="flex justify-between text-xs text-slate-600 font-bold">
               <span>Subtotal:</span>
               <span className="text-slate-900 font-extrabold font-mono">
                 ₹{form.lines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
               </span>
             </div>
             <div className="flex justify-between text-xs text-slate-900 font-bold border-t border-slate-200/60 pt-2">
               <span>Grand Total:</span>
               <span className="text-slate-900 font-black font-mono">
                 ₹{form.lines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
               </span>
             </div>
           </div>

           <div className="pt-4 border-t border-slate-200/60">
             <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50">
               {saving ? 'Generating...' : 'Finalize Invoice (Zero-Sum Ledger)'}
             </button>
           </div>
        </form>
      </Drawer>

      {/* RECORD PAYMENT DRAWER */}
      <Drawer isOpen={paymentDrawerOpen} onClose={() => setPaymentDrawerOpen(false)} title="Record Incoming Payment">
        <form onSubmit={handleRecordPayment} className="space-y-5">
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-[14px] mb-6 text-[13px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
             <p className="text-slate-900 font-extrabold tracking-tight">Invoice: {paymentForm.invoiceNum}</p>
             <p className="text-slate-500 font-medium mt-1">Remaining Balance to clear: <span className="font-bold text-slate-900">₹{parseFloat(paymentForm.maxBalance).toLocaleString()}</span></p>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Amount Received (₹) *</label>
            <input required type="number" step="0.01" max={paymentForm.maxBalance} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-mono" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Payment Method *</label>
            <select required value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all">
               <option value="CASH">Cash</option>
               <option value="UPI">UPI</option>
               <option value="CARD">Card</option>
               <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Transaction Ref (Optional)</label>
            <input type="text" value={paymentForm.referenceNumber} onChange={e => setPaymentForm({...paymentForm, referenceNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" placeholder="UPI ID / Cheque Num" />
          </div>
          <div className="pt-4 border-t border-slate-200/60 mt-4 text-center">
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50">
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
               <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                    <p className="text-slate-500 text-sm mt-1">Receipt for goods and services</p>
                  </div>
                  <div className="text-left sm:text-right">
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
               <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3 print:hidden">
                 <button onClick={() => setViewingInvoice(null)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200/80 hover:bg-slate-50 transition-all cursor-pointer active:scale-95">Close</button>
                 <button onClick={() => window.print()} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all cursor-pointer active:scale-95">Print & Download PDF</button>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
