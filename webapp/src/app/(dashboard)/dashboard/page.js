'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../components/providers/BusinessProvider.js';
import { apiClient } from '../../../lib/apiClient.js';
import { Plus, Receipt, CircleDollarSign, RefreshCcw, BellRing, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);

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

  useEffect(() => {
    fetchAnalytics();
    fetchNotifications();
  }, [fetchAnalytics, fetchNotifications]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
           <p className="text-slate-500 text-sm mt-1">Here's what's happening today.</p>
         </div>
         
         <div className="flex items-center gap-3">
           <button
             onClick={() => { fetchAnalytics(); fetchNotifications(); }}
             className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
             title="Refresh Data"
           >
             <RefreshCcw size={16} className={loading || notifLoading ? 'animate-spin text-blue-600' : ''} />
           </button>
           <Link href="/dashboard/sales?action=new" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-all focus:ring-2 focus:ring-slate-900/20 focus:outline-none">
              <Plus size={16} /> New Sale
           </Link>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? '...' : `₹${parseFloat(metrics.totalSalesRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <TrendingUp size={14} /> <span>Live tracking</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors">
           <div className="flex justify-between items-start">
             <p className="text-sm font-medium text-slate-500">Stock Alerts</p>
             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
               <AlertTriangle size={16} />
             </div>
           </div>
           <div className="mt-4">
             <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
               {loading ? '...' : notifications.filter(n => n.title?.includes('Low Stock')).length}
             </h3>
             <Link href="/dashboard/inventory" className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
               Review catalog <ChevronRight size={14} />
             </Link>
           </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors">
           <div className="flex justify-between items-start">
             <p className="text-sm font-medium text-slate-500">Event Queue</p>
             <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
               <Receipt size={16} />
             </div>
           </div>
           <div className="mt-4">
             <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
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

      {/* Activity Log Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200">
           <h3 className="font-semibold text-slate-900 text-base">Recent Activity</h3>
           <p className="text-sm text-slate-500 mt-1">Real-time alerts, stock warnings, and transaction logs.</p>
        </div>
        
        <div className="px-6 py-2">
          {notifLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
               <RefreshCcw className="animate-spin text-slate-300" size={24} />
               <p className="text-slate-500 text-sm">Loading activity feed...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-medium text-slate-900">No activity yet</p>
              <p className="text-slate-500 text-sm mt-1">Your ledger is completely caught up.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={n.id}>
                <NotificationBadge title={n.title} message={n.message} createdAt={n.createdAt} />
                {i < notifications.length - 1 && <hr className="border-slate-100" />}
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
