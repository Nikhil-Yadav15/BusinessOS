'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Home, Users, Tags, Package, ReceiptText, ShoppingCart, Wallet, Shield, X, ArrowRight } from 'lucide-react';

const STATIC_ROUTES = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: Home, category: 'Navigation' },
  { name: 'Customers & CRM', href: '/dashboard/crm', icon: Users, category: 'Navigation' },
  { name: 'Product Catalog', href: '/dashboard/catalog', icon: Tags, category: 'Navigation' },
  { name: 'Inventory & Stock', href: '/dashboard/inventory', icon: Package, category: 'Navigation' },
  { name: 'Sales & Invoices', href: '/dashboard/sales', icon: ReceiptText, category: 'Navigation' },
  { name: 'Purchasing & Bills', href: '/dashboard/purchasing', icon: ShoppingCart, category: 'Navigation' },
  { name: 'Accounting Ledger', href: '/dashboard/ledger', icon: Wallet, category: 'Navigation' },
  { name: 'Team & Access', href: '/dashboard/team', icon: Shield, category: 'Settings' },
];

export default function GlobalSearchModal({ isOpen, onClose, openAiDrawer }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter routes
  const filteredRoutes = STATIC_ROUTES.filter(route => 
    route.name.toLowerCase().includes(query.toLowerCase())
  );
  
  // Quick AI Prompt Builder
  const aiOption = query.length > 3 ? {
    isAi: true,
    name: `Ask AI to "${query}"...`,
    icon: Sparkles
  } : null;

  const results = aiOption ? [...filteredRoutes, aiOption] : filteredRoutes;

  const handleSelect = (item) => {
    onClose();
    if (item.isAi) {
      openAiDrawer();
      // Future scope: pass query down to pre-fill AI chat input if desired
    } else {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
           <Search size={20} className="text-slate-400 shrink-0" />
           <input 
             ref={inputRef}
             type="text"
             className="flex-1 bg-transparent border-none outline-none px-4 text-slate-800 placeholder:text-slate-400 text-lg w-full"
             placeholder="Search modules, customers, or hit AI..."
             value={query}
             onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
             onKeyDown={handleKeyDown}
           />
           
           <div className="flex items-center gap-2">
             <span className="hidden sm:inline-flex text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-100 px-2 py-1 rounded">esc</span>
             <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
               <X size={20} />
             </button>
           </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto w-full p-2">
          {results.length === 0 ? (
             <div className="py-12 text-center text-slate-500">
               <p>No matches found for &quot;{query}&quot;</p>
             </div>
          ) : (
            <ul className="space-y-1">
              {results.map((item, idx) => {
                const isActive = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <li key={item.name || 'ai'}>
                    <button
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all text-left ${
                        isActive 
                          ? item.isAi ? 'bg-[#0F172A] text-white' : 'bg-indigo-50 text-indigo-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-md ${
                           isActive 
                             ? item.isAi ? 'bg-white/20 text-[#B5995D]' : 'bg-indigo-100 text-indigo-600'
                             : 'bg-slate-100 text-slate-500'
                         }`}>
                           <Icon size={18} />
                         </div>
                         <div>
                           <p className={`text-sm font-medium ${item.isAi && isActive ? 'text-white' : ''}`}>
                             {item.name}
                           </p>
                           {item.category && !isActive && (
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                           )}
                         </div>
                      </div>
                      
                      {isActive && (
                        <div className="shrink-0 text-current opacity-70 flex items-center gap-2">
                           <span className="text-xs font-medium">Select</span>
                           <ArrowRight size={14} />
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-4 text-xs text-slate-500">
           <span>Use <span className="font-bold text-slate-700 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm">↑</span> <span className="font-bold text-slate-700 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm">↓</span> to navigate</span>
           <span><span className="font-bold text-slate-700 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm">Enter</span> to select</span>
        </div>
      </div>
    </div>
  );
}
