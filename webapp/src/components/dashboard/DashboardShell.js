'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusinessContext } from '../providers/BusinessProvider.js';
import ChatDrawer from '../ai/ChatDrawer.js';
import GlobalSearchModal from './GlobalSearchModal.js';
import NotificationDropdown from './NotificationDropdown.js';
import { Home, Users, Package, Tags, ReceiptText, ShoppingCart, Wallet, Settings, Command, Sparkles, ChevronsUpDown, Bell, Menu, X, Shield } from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Customers & CRM', href: '/dashboard/crm', icon: Users },
  { name: 'Product Catalog', href: '/dashboard/catalog', icon: Tags },
  { name: 'Inventory & Stock', href: '/dashboard/inventory', icon: Package },
  { name: 'Sales & Invoices', href: '/dashboard/sales', icon: ReceiptText },
  { name: 'Purchasing & Bills', href: '/dashboard/purchasing', icon: ShoppingCart },
  { name: 'Accounting Ledger', href: '/dashboard/ledger', icon: Wallet },
];

const secondaryNav = [
  { name: 'Team & Access', href: '/dashboard/team', icon: Shield },
  { name: 'Settings & Workflows', href: '/dashboard/workflows', icon: Settings },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { session, logout } = useBusinessContext();
  const [isAiOpen, setAiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Register Cmd+K / Ctrl+K Global Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const user = session?.user;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  // The Navigation Sidebar is heavily styled based on the "Lumina" design system
  const NavigationSidebar = ({ isMobile }) => (
    <aside className={`flex flex-col shrink-0 bg-slate-50 text-slate-900 h-full ${isMobile ? 'w-full' : 'w-64 border-r border-slate-200/60'}`}>
      
      {/* Business Selector Mock */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200/60 group cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white shadow-sm shrink-0 text-sm">
          A
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <h2 className="text-sm font-extrabold text-slate-900 truncate tracking-tight">Atlas BusinessOS</h2>
          <p className="text-[11px] font-medium text-slate-400 truncate">B-ID: {session?.businessId?.slice(0, 8) || 'Unknown'}</p>
        </div>
        {!isMobile && <ChevronsUpDown size={16} className="text-slate-400 group-hover:text-slate-600 shrink-0" />}
        {isMobile && (
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        
        <div>
          <p className="px-3 text-[10px] font-extrabold tracking-[0.15em] text-slate-400 uppercase mb-3">Modules</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
           <p className="px-3 text-[10px] font-extrabold tracking-[0.15em] text-slate-400 uppercase mb-3">System</p>
           <ul className="space-y-1">
             {secondaryNav.map((item) => {
               const isActive = pathname === item.href;
               return (
                 <li key={item.name}>
                   <Link
                     href={item.href}
                     onClick={() => isMobile && setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                       isActive
                         ? 'bg-white text-slate-900 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                         : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                     }`}
                   >
                     <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                     {item.name}
                   </Link>
                 </li>
               );
             })}
           </ul>
        </div>

      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200/60 shrink-0">
        <div className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold text-[11px] shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-slate-900 text-sm truncate tracking-tight">{user?.fullName || 'Shop Manager'}</p>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-slate-900 text-[11px] font-bold transition-colors flex items-center gap-1 mt-0.5"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh min-h-[100dvh] bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <NavigationSidebar isMobile={false} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <NavigationSidebar isMobile={true} />
        </div>
      )}

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-dvh overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 shrink-0 bg-white/70 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md -ml-2 cursor-pointer transition-colors active:scale-95"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Clickable Search input triggering Modal */}
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-50/50 hover:bg-slate-100/80 transition-all active:scale-[0.98] border border-slate-200/60 px-3 py-1.5 rounded-lg cursor-pointer shadow-sm w-64"
            >
              <Command size={14} /> <span>Search everything...</span> <span className="text-xs border border-slate-200 px-1.5 rounded bg-white ml-auto text-slate-400 font-medium tracking-widest uppercase">⌘K</span>
            </div>
            
            {/* Mobile simplified search trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer transition-colors active:scale-95"
            >
              <Command size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* NEW: Notification Dropdown Component */}
            <NotificationDropdown />

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto w-full pb-20">
            {children}
          </div>
        </div>
      </main>

      {/* Floating AI Action Button (FAB) */}
      <button 
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-slate-900 text-white px-5 py-3.5 rounded-full flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-black hover:scale-105 active:scale-95 transition-all z-40 font-bold border border-slate-800 cursor-pointer"
      >
        <Sparkles size={16} className="text-white" />
        Ask AI
      </button>

      {/* AI Chat Drawer Component */}
      <ChatDrawer isOpen={isAiOpen} onClose={() => setAiOpen(false)} />

      {/* NEW: Global Search Modal Component */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        openAiDrawer={() => {
           setIsSearchOpen(false);
           setAiOpen(true);
        }}
      />
    </div>
  );
}
