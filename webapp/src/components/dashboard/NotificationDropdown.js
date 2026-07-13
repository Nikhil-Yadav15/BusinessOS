'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, PackageOpen, CircleDollarSign, Zap, AlertTriangle } from 'lucide-react';

import useSWR from 'swr';
import { useBusinessContext } from '../providers/BusinessProvider.js';

const fetcher = (url, token, businessId) => fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-business-id': businessId
  }
}).then(res => res.json());

export default function NotificationDropdown() {
  const { session } = useBusinessContext();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch Notifications
  const { data, mutate } = useSWR(
    session?.token ? ['/api/system/notifications', session.token, session.businessId] : null,
    ([url, t, b]) => fetcher(url, t, b)
  );

  // In production, we'd locally track 'read/dismissed' IDs or update the DB. For now, local read state overrides.
  const [localDismissed, setLocalDismissed] = useState([]);
  const [markedRead, setMarkedRead] = useState(false);

  const notifications = (data?.data || []).filter(n => !localDismissed.includes(n.id)).map(n => ({
     ...n,
     read: markedRead ? true : n.read,
     icon: n.type === 'ALERT' ? AlertTriangle : n.type === 'FINANCE' ? CircleDollarSign : Zap
  }));

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllRead = () => {
    setMarkedRead(true);
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setLocalDismissed(prev => [...prev, id]);
  };

  return (
    <div className="relative">
      
      {/* Trigger Button */}
      <button 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Overlay (Responsive Positioning) */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 -mr-2 sm:mr-0"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          
          {/* List */}
          <div className="max-h-80 overflow-y-auto">
             {notifications.length === 0 ? (
               <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">You&apos;re all caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No new alerts or system messages.</p>
               </div>
             ) : (
               <div className="divide-y divide-slate-50">
                 {notifications.map(n => {
                   const Icon = n.icon;
                   return (
                     <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 relative group ${!n.read ? 'bg-blue-50/30' : ''}`}>
                       
                       {/* Icon */}
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === 'ALERT' ? 'bg-amber-100 text-amber-600' :
                          n.type === 'FINANCE' ? 'bg-emerald-100 text-emerald-600' :
                          n.type === 'SYSTEM' ? 'bg-indigo-100 text-indigo-600' :
                          'bg-blue-100 text-blue-600'
                       }`}>
                         <Icon size={14} />
                       </div>
                       
                       {/* Content */}
                       <div className="flex-1 min-w-0 pr-6">
                         <div className="flex items-center justify-between mb-0.5">
                           <p className={`text-sm font-semibold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                             {n.title}
                           </p>
                           <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 ml-2">{n.time}</span>
                         </div>
                         <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                           {n.desc}
                         </p>
                       </div>
                       
                       {/* Quick Delete */}
                       <button 
                         onClick={(e) => removeNotification(n.id, e)}
                         className="absolute right-3 top-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
          
          {/* Footer View All */}
          {notifications.length > 0 && (
             <button className="w-full text-center py-2.5 border-t border-slate-100 text-xs font-semibold text-[#B5995D] hover:bg-slate-50 transition-colors">
                View All Activity
             </button>
          )}

        </div>
      )}
    </div>
  );
}
