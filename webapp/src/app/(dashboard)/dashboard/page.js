'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../components/providers/BusinessProvider.js';
import { apiClient } from '../../../lib/apiClient.js';
import { Plus, Receipt, CircleDollarSign, RefreshCcw, BellRing, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, BarChart3, Users, Package } from 'lucide-react';
import Link from 'next/link';

// Import our new pictorial chart components
import { ExecutiveSalesTrend, TopUdhaarAlert, CriticalStockAlert } from '../../../components/dashboard/charts/OverviewCharts.js';

function NotificationBadge({ title, message, createdAt }) {
  const isLowStock = title?.includes('Low Stock');
  const isInvoice = title?.includes('Invoice');
  
  return (
    <div className="group flex items-start gap-4 p-4 -mx-4 rounded-xl hover:bg-slate-50 transition-colors">
      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
        isLowStock ? 'bg-amber-50 border-amber-100 text-amber-600' : 
        isInvoice ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
        'bg-blue-50 border-blue-100 text-blue-600'
      }`}>
        {isLowStock ? <AlertTriangle size={14} /> : isInvoice ? <CheckCircle2 size={14} /> : <BellRing size={14} />}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap shrink-0 group-hover:text-slate-600 transition-colors">
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{message}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { session } = useBusinessContext();
  const [metrics, setMetrics] = useState({ totalSalesRevenue: 0, pendingOutboxEvents: 0 });
  const [notifications, setNotifications] = useState([]);
  
  // Data stores for visual charts
  const [invoices, setInvoices] = useState([]);
  const [parties, setParties] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);

  // Load states
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/api/system/analytics', {
        token: session.token,
        businessId: session.businessId,
      });
      setMetrics({
        totalSalesRevenue: res.data?.data?.totalSalesRevenue || 0,
        pendingOutboxEvents: res.data?.data?.pendingOutboxEvents || 0 
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchNotifications = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setNotifLoading(true);
    try {
      const res = await apiClient.get('/api/system/notifications', {
        token: session.token,
        businessId: session.businessId,
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setNotifLoading(false);
    }
  }, [session]);

  const fetchChartData = useCallback(async () => {
     if (!session?.token || !session?.businessId) return;
     setChartsLoading(true);
     try {
       // Fetch dependencies for all 3 charts in parallel
       const [invRes, crmRes, stockRes, journalRes] = await Promise.all([
         apiClient.get('/api/sales/invoices?limit=50', { token: session.token, businessId: session.businessId }),
         apiClient.get('/api/crm/parties?partyType=CUSTOMER&limit=50', { token: session.token, businessId: session.businessId }),
         apiClient.get('/api/inventory?limit=100', { token: session.token, businessId: session.businessId }),
         apiClient.get('/api/ledger/journal?limit=15', { token: session.token, businessId: session.businessId }).catch(() => ({ data: { items: [] } }))
       ]);
       setInvoices(invRes.data?.items || []);
       setParties(crmRes.data?.items || []);
       setInventory(stockRes.data?.items || []);
       // Grab the latest 5 unique txns
       const txns = Array.isArray(journalRes.data?.items) ? journalRes.data.items : Array.isArray(journalRes.data) ? journalRes.data : [];
       setRecentTxns(txns.slice(0, 5));
     } catch (err) {
       console.error('Failed to load chart data', err);
     } finally {
       setChartsLoading(false);
     }
  }, [session]);

  useEffect(() => {
    fetchAnalytics();
    fetchNotifications();
    fetchChartData();
  }, [fetchAnalytics, fetchNotifications, fetchChartData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight font-serif">Overview</h1>
           <p className="text-slate-500 text-sm mt-1">Here's what's happening today.</p>
         </div>
         
         <div className="flex items-center gap-3 w-full sm:w-auto">
           <button
             onClick={() => { fetchAnalytics(); fetchNotifications(); fetchChartData(); }}
             className="flex-1 sm:flex-none p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors shadow-sm flex justify-center items-center h-10"
             title="Refresh Data"
           >
             <RefreshCcw size={16} className={loading || notifLoading || chartsLoading ? 'animate-spin text-[#B5995D]' : ''} />
           </button>
           <Link href="/dashboard/sales?action=new" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2 rounded-lg font-medium text-sm shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] transition-all h-10">
              <Plus size={16} /> New Sale
           </Link>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border-t-2 border-t-[#B5995D] border-x border-b border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-serif">Total Revenue</p>
            <div className="p-2 bg-slate-50 text-[#0F172A] rounded-lg">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-[#0F172A] tracking-tight font-serif">
              {loading ? '...' : `₹${parseFloat(metrics.totalSalesRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <TrendingUp size={14} /> <span>Live tracking</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-serif">Stock Alerts</p>
             <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
               <AlertTriangle size={16} />
             </div>
           </div>
           <div className="mt-4">
             <h3 className="text-3xl font-bold text-[#0F172A] tracking-tight font-serif">
               {loading ? '...' : notifications.filter(n => n.title?.includes('Low Stock')).length}
             </h3>
             <Link href="/dashboard/inventory" className="flex items-center gap-1 mt-2 text-xs font-medium text-[#B5995D] hover:text-[#0F172A] transition-colors">
               Review catalog <ChevronRight size={14} />
             </Link>
           </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-serif">Event Queue</p>
             <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
               <Receipt size={16} />
             </div>
           </div>
           <div className="mt-4">
             <h3 className="text-3xl font-bold text-[#0F172A] tracking-tight font-serif">
               {loading ? '...' : metrics.pendingOutboxEvents}
             </h3>
             <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Background synced
             </div>
           </div>
        </div>

      </div>

      {/* Pictorial Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* Sales Trend Engine */}
         <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 flex flex-col">
           <div className="flex items-center gap-2 mb-6">
             <div className="p-1.5 bg-slate-50 text-[#0F172A] rounded-md">
               <BarChart3 size={16} />
             </div>
             <div>
               <h3 className="font-semibold text-[#0F172A] text-sm font-serif">Revenue Timeline</h3>
               <p className="text-xs text-slate-500">Recent sales cashflow</p>
             </div>
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center">
             {chartsLoading ? <RefreshCcw className="animate-spin text-slate-300" size={24} /> : <ExecutiveSalesTrend invoices={invoices} />}
           </div>
         </div>

         {/* Secondary Charts Container */}
         <div className="flex flex-col gap-6">
            
            {/* Udhaar Top */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-50 text-[#0F172A] rounded-md">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] text-sm font-serif">Top Udhaar Balances</h3>
                  <p className="text-xs text-slate-500">Accounts receivable</p>
                </div>
              </div>
              <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center">
                {chartsLoading ? <RefreshCcw className="animate-spin text-slate-300" size={20} /> : <TopUdhaarAlert parties={parties} />}
              </div>
            </div>

            {/* Critical Stock */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-50 text-[#0F172A] rounded-md">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] text-sm font-serif">Critical Stock Alert</h3>
                  <p className="text-xs text-slate-500">Items below minimum stock</p>
                </div>
              </div>
              <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center">
                {chartsLoading ? <RefreshCcw className="animate-spin text-slate-300" size={20} /> : <CriticalStockAlert inventory={inventory} />}
              </div>
            </div>

         </div>
      </div>

      {/* Dual Column Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Recent Transactions Table (2/3 width) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
             <h3 className="font-bold text-[#0F172A] text-lg font-serif">Recent Transactions</h3>
             <p className="text-sm text-slate-500 mt-1">Latest records processed by zero-sum ledger system.</p>
             
             <div className="flex items-center justify-between mt-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input type="text" placeholder="Search records..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64 transition-colors" />
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export CSV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Columns
                  </button>
                </div>
             </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartsLoading ? (
                   Array(4).fill(0).map((_, i) => (
                     <tr key={i} className="animate-pulse">
                       <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                       <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                       <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                       <td className="px-6 py-4 flex justify-end"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                       <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-16 ml-auto"></div></td>
                     </tr>
                   ))
                ) : recentTxns.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                      No recent transactions found in the ledger.
                    </td>
                  </tr>
                ) : (
                  recentTxns.map((txn, idx) => {
                    // Normalize deeply nested vs flat payloads based on API structure
                    const id = txn.journalEntry?.entryNumber || txn.entryNumber || `TXN-90${21 - idx}`;
                    const date = new Date(txn.journalEntry?.entryDate || txn.entryDate || txn.createdAt || Date.now());
                    const debit = parseFloat(txn.debitAmount || 0);
                    const credit = parseFloat(txn.creditAmount || 0);
                    const amount = debit > 0 ? debit : (credit > 0 ? credit : 0);
                    
                    // Display heuristics
                    let type = "Voucher (General)";
                    if (debit > 0 && credit === 0) type = "Receipt (Sales)";
                    if (credit > 0 && debit === 0) type = "Expense (Debit)";
                    if (txn.journalEntry?.entryDate) type = "Invoice (Sales)"; // specific structure hint

                    const isPaid = debit > 0;
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 text-sm">{id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 text-sm">
                          {type}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-semibold text-slate-900 text-sm">
                          ₹{amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                            isPaid 
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                             : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {isPaid ? 'PAID' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Operational Activity Feed (1/3 width timeline) */}
        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2">
            <h3 className="font-bold text-[#0F172A] text-lg font-serif">Operational Activity Feed</h3>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            {notifLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCcw className="animate-spin text-slate-300" size={24} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center mt-10">
                <p className="text-sm font-medium text-slate-900">No activity yet</p>
                <p className="text-slate-500 text-sm mt-1">Your ledger is completely caught up.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                {notifications.slice(0, 6).map((n, i) => {
                  const title = n.title?.toLowerCase() || '';
                  
                  // Icon Selection Logic
                  let Icon = CheckCircle2;
                  let iconColor = "text-blue-500 bg-blue-50 border-blue-100";
                  
                  if (title.includes('stock') || title.includes('inventory')) {
                    Icon = RefreshCcw;
                    iconColor = "text-indigo-500 bg-indigo-50 border-indigo-100";
                  } else if (title.includes('ai') || title.includes('reminder')) {
                    Icon = BellRing;
                    iconColor = "text-amber-500 bg-amber-50 border-amber-100";
                  } else if (title.includes('customer') || title.includes('crm')) {
                    Icon = Users;
                    iconColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
                  } else if (title.includes('invoice') || title.includes('paid')) {
                    Icon = CheckCircle2;
                    iconColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
                  } else if (title.includes('purchase')) {
                    Icon = Receipt;
                    iconColor = "text-blue-500 bg-blue-50 border-blue-100";
                  }

                  return (
                    <div key={n.id} className="relative pl-6 sm:pl-8 group">
                       <span className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center ring-1 ring-slate-100 shadow-sm z-10 transition-transform group-hover:scale-110 ${iconColor}`}>
                         <Icon size={12} className="stroke-[2.5]" />
                       </span>
                       
                       <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                          <h4 className="font-semibold text-slate-800 text-sm tracking-tight">{n.title}</h4>
                          <time className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </time>
                       </div>
                       <p className="text-sm text-slate-500 leading-snug">{n.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
