'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../components/providers/BusinessProvider.js';
import { apiClient } from '../../../lib/apiClient.js';

function NotificationBadge({ title, message, createdAt }) {
  const isLowStock = title?.includes('Low Stock');
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${isLowStock ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
      <span className="text-xl mt-0.5">{isLowStock ? '⚠️' : '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isLowStock ? 'text-amber-800' : 'text-slate-800'}`}>{title}</p>
        <p className="text-sm text-slate-500 mt-0.5 break-words">{message}</p>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(createdAt).toLocaleTimeString()}</span>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Business Overview</h1>
           <p className="text-slate-500 mt-1">Live metrics and system alerts for your business.</p>
         </div>
         <button
           onClick={() => { fetchAnalytics(); fetchNotifications(); }}
           className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
         >
           ↻ Refresh
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${loading ? 'animate-pulse' : ''}`}>
          <h3 className="text-slate-500 text-sm font-medium">Total Sales Revenue</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            ₹{parseFloat(metrics.totalSalesRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-emerald-500 text-sm font-medium mt-2 block">O(1) JSONB Snapshot Read</span>
        </div>

        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${loading ? 'animate-pulse' : ''}`}>
           <h3 className="text-slate-500 text-sm font-medium">Inventory Valuations</h3>
           <p className="text-3xl font-bold text-slate-900 mt-2">Live Mode</p>
           <span className="text-indigo-500 text-sm font-medium mt-2 block">See Inventory Tab</span>
        </div>

        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${loading ? 'animate-pulse' : ''}`}>
           <h3 className="text-slate-500 text-sm font-medium">Pending Output Pings</h3>
           <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.pendingOutboxEvents}</p>
           <span className="text-emerald-500 text-sm font-medium mt-2 block">All events processed cleanly</span>
        </div>

      </div>

      <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
           <div>
             <h3 className="font-semibold text-slate-900">Recent Alerts & Notifications</h3>
             <p className="text-xs text-slate-400 mt-0.5">Low stock warnings, invoice events, and system messages</p>
           </div>
           {notifications.length > 0 && (
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
               {notifications.filter(n => n.title?.includes('Low Stock')).length} stock alerts
             </span>
           )}
        </div>
        <div className="p-4 space-y-2">
          {notifLoading ? (
            <div className="py-8 text-center text-slate-400 text-sm animate-pulse">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p className="text-3xl mb-2">✅</p>
              <p>No alerts — everything is running smoothly!</p>
            </div>
          ) : (
            notifications.map(n => (
              <NotificationBadge key={n.id} title={n.title} message={n.message} createdAt={n.createdAt} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
