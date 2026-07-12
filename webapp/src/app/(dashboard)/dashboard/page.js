'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../components/providers/BusinessProvider.js';
import { apiClient } from '../../../lib/apiClient.js';

function NotificationBadge({ title, message, createdAt }) {
  const isLowStock = title?.includes('Low Stock');
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
      isLowStock 
        ? 'border-amber-500/25 bg-amber-500/5 text-amber-500' 
        : 'border-border bg-card text-foreground'
    }`}>
      <span className="text-xl mt-0.5">{isLowStock ? '⚠️' : '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{title}</p>
        <p className="text-sm text-muted-foreground mt-1 break-words leading-relaxed">{message}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(createdAt).toLocaleTimeString()}</span>
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
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Business Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Live metrics and system alerts for your business.</p>
        </div>
        <button
          onClick={() => { fetchAnalytics(); fetchNotifications(); }}
          className="self-start sm:self-auto text-sm px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 font-semibold cursor-pointer active:scale-95"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className={`bg-card rounded-2xl border border-border shadow-premium p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-[2px] ${loading ? 'animate-pulse' : ''}`}>
          <h3 className="text-muted-foreground text-sm font-semibold">Total Sales Revenue</h3>
          <p className="text-3xl font-extrabold text-foreground mt-3 tracking-tight">
            ₹{parseFloat(metrics.totalSalesRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-emerald-500 text-xs font-semibold mt-3 block bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full w-fit">
            O(1) JSONB Snapshot Read
          </span>
        </div>

        {/* Metric 2 */}
        <div className={`bg-card rounded-2xl border border-border shadow-premium p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-[2px] ${loading ? 'animate-pulse' : ''}`}>
          <h3 className="text-muted-foreground text-sm font-semibold">Inventory Valuations</h3>
          <p className="text-3xl font-extrabold text-foreground mt-3 tracking-tight">Live Mode</p>
          <span className="text-primary text-xs font-semibold mt-3 block bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-full w-fit">
            See Inventory Tab
          </span>
        </div>

        {/* Metric 3 */}
        <div className={`bg-card rounded-2xl border border-border shadow-premium p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-[2px] ${loading ? 'animate-pulse' : ''}`}>
          <h3 className="text-muted-foreground text-sm font-semibold">Pending Output Pings</h3>
          <p className="text-3xl font-extrabold text-foreground mt-3 tracking-tight">{metrics.pendingOutboxEvents}</p>
          <span className="text-emerald-500 text-xs font-semibold mt-3 block bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full w-fit">
            All events processed cleanly
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-foreground">Recent Alerts & Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">Low stock warnings, invoice events, and system messages</p>
          </div>
          {notifications.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
              {notifications.filter(n => n.title?.includes('Low Stock')).length} stock alerts
            </span>
          )}
        </div>
        <div className="p-6 space-y-3">
          {notifLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm animate-pulse">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-semibold text-foreground">No alerts</p>
              <p className="text-xs text-muted-foreground mt-1">Everything is running smoothly!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <NotificationBadge key={n.id} title={n.title} message={n.message} createdAt={n.createdAt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
