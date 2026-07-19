'use client';

import { useState, useEffect } from 'react';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';

export default function WorkflowsPage() {
  const { session } = useBusinessContext();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, [session]);

  const fetchWorkflows = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/system/workflows', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'x-business-id': session.businessId
        }
      });
      const json = await res.json();
      if (res.ok) {
        setWorkflows(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch workflows:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    // Optimistic UI update instantly for snap-feel
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isEnabled: updatedStatus } : w));
    
    try {
      await fetch(`/api/system/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'x-business-id': session.businessId
        },
        body: JSON.stringify({ isEnabled: updatedStatus })
      });
    } catch (e) {
      // Revert dynamically if the network fails
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isEnabled: currentStatus } : w));
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-500 font-medium animate-pulse">Initializing Automation Matrix...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage background IFTTT automations generated autonomously by the Atlas AI Co-Pilot.</p>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
          <h3 className="text-lg font-semibold text-slate-900">No Automations Running</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Open the AI Assistant drawer (bottom right) and just say "Create an alert when inventory drops below 10" to magically construct your first background worker algorithm entirely hands-free.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(rule => (
            <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-900 truncate pr-4 text-sm" title={rule.name}>{rule.name}</h3>
                  
                  {/* Status Toggle Switch */}
                  <button 
                    onClick={() => toggleStatus(rule.id, rule.isEnabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0 ${rule.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow tracking-wide transition-transform ${rule.isEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="space-y-4 mt-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Event</p>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/50 shadow-sm">
                      ⚡ {rule.triggerEvent}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Logic Condition</p>
                    {rule.condition && Object.keys(rule.condition).length > 0 ? (
                      <code className="text-xs bg-slate-50 text-slate-700 font-mono px-2 py-1.5 rounded border border-slate-200 flex shadow-sm">
                        {rule.condition.field} {rule.condition.operator} {rule.condition.value}
                      </code>
                    ) : (
                      <span className="text-xs text-slate-500 italic block">Always run directly (No bounds)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-3 py-2.5 text-xs flex justify-between items-center group">
                <span className="font-mono text-[9px] text-slate-400 truncate max-w-[150px]">ID: {rule.id.split('-')[0]}</span>
                {rule.isEnabled ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-[pulse_2s_ease-in-out_infinite]"></span>
                    Listening
                  </span>
                ) : (
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                    Disabled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
