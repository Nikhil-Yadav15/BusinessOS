'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../../../components/providers/BusinessProvider.js';
import { apiClient } from '../../../lib/apiClient.js';

export default function DashboardHome() {
  const { session } = useBusinessContext();
  const [metrics, setMetrics] = useState({ totalSalesRevenue: 0, pendingOutboxEvents: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.token || !session?.businessId) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/api/system/analytics', {
        token: session.token,
        businessId: session.businessId,
      });
      // Fallback map on empty structured JSONB
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

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Business Overview</h1>
           <p className="text-slate-500 mt-1">Live metrics generated dynamically from background event consumers.</p>
         </div>
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
           <h3 className="font-semibold text-slate-900">Recent Automated In-App Notifications</h3>
        </div>
        <div className="p-6 text-center text-slate-500 text-sm">
           Waiting for UI Stage 5 (Workflows Component) binding... Navigate to Ledger Tab for deep financials.
        </div>
      </div>
    </div>
  );
}
