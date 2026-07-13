'use client';

import { useEffect } from 'react';

export default function Drawer({ isOpen, onClose, title, children }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-dvh shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 sm:rounded-l-[32px] border-l border-slate-200/50">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
