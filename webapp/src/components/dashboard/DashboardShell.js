'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusinessContext } from '../providers/BusinessProvider.js';
import ChatDrawer from '../ai/ChatDrawer.js';
import { Home, Users, Package, Tags, ReceiptText, ShoppingCart, Wallet, Settings, Command, Sparkles, ChevronsUpDown, Bell, Menu, X } from 'lucide-react';

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
  { name: 'Settings & Workflows', href: '/dashboard/workflows', icon: Settings },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { session, logout } = useBusinessContext();
  const [isAiOpen, setAiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = session?.user;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  // The Navigation Sidebar is heavily styled based on the "Precision Merchant" design system
  const NavigationSidebar = ({ isMobile }) => (
    <aside className={`flex flex-col shrink-0 bg-[#0F172A] text-slate-300 h-full ${isMobile ? 'w-full' : 'w-64 border-r border-[#1E293B]'}`}>
      
      {/* Business Selector Mock */}
      <div className="h-16 flex items-center px-4 border-b border-[#1E293B] group cursor-pointer hover:bg-slate-800 transition-colors shrink-0">
        <div className="w-8 h-8 rounded-md bg-[#B5995D] flex items-center justify-center font-bold text-white shadow-sm shrink-0">
          A
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate font-serif">Atlas BusinessOS</h2>
          <p className="text-xs text-slate-400 truncate">B-ID: {session?.businessId?.slice(0, 8) || 'Unknown'}</p>
        </div>
        {!isMobile && <ChevronsUpDown size={16} className="text-slate-500 group-hover:text-slate-300 shrink-0" />}
        {isMobile && (
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        
        <div>
          <p className="px-3 text-[11px] font-bold tracking-widest text-[#B5995D] uppercase mb-3">Modules</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-800 to-slate-800/20 text-white border-l-2 border-[#B5995D]'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#B5995D]' : 'text-slate-500'} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
           <p className="px-3 text-[11px] font-bold tracking-widest text-[#B5995D] uppercase mb-3">System</p>
           <ul className="space-y-1">
             {secondaryNav.map((item) => {
               const isActive = pathname === item.href;
               return (
                 <li key={item.name}>
                   <Link
                     href={item.href}
                     onClick={() => isMobile && setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                       isActive
                         ? 'bg-slate-800 text-white border-l-2 border-[#B5995D]'
                         : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
                     }`}
                   >
                     <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#B5995D]' : 'text-slate-500'} />
                     {item.name}
                   </Link>
                 </li>
               );
             })}
           </ul>
        </div>

      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#1E293B] shrink-0">
        <div className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-200 text-sm truncate">{user?.fullName || 'Shop Manager'}</p>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 text-xs font-medium transition-colors flex items-center gap-1 mt-0.5"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
              <Command size={14} /> <span>Search everything...</span> <span className="text-xs border border-slate-200 px-1.5 rounded bg-white ml-2 text-slate-400">⌘K</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-[#0F172A] transition-colors">
              <Bell size={20} />
            </button>
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
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#0F172A] text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-[0_8px_30px_rgb(15,23,42,0.2)] hover:scale-105 transition-all z-40 font-semibold border border-slate-700"
      >
        <Sparkles size={18} className="text-[#B5995D]" />
        Ask AI
      </button>

      {/* AI Chat Drawer Component */}
      <ChatDrawer isOpen={isAiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
