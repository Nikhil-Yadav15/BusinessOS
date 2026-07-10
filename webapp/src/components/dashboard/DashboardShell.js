'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusinessContext } from '../providers/BusinessProvider.js';
import ChatDrawer from '../ai/ChatDrawer.js';
import { Home, Users, Package, Tags, ReceiptText, ShoppingCart, Wallet, Settings, LogOut, Command, Sparkles, ChevronsUpDown, Bell } from 'lucide-react';

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

  const user = session?.user;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans">
      {/* Sidebar - Modern Light Mode (Vercel/Stripe Vibe) */}
      <aside className="w-64 border-r border-slate-200 flex flex-col shrink-0 bg-[#FAFAFA]">
        
        {/* Business Selector Mock */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 group cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600 shadow-sm shrink-0">
            A
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 truncate">Atlas BusinessOS</h2>
            <p className="text-xs text-slate-500 truncate font-medium">B-ID: {session?.businessId?.slice(0, 8) || 'Unknown'}</p>
          </div>
          <ChevronsUpDown size={16} className="text-slate-400 group-hover:text-slate-600 shrink-0" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          
          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 mb-2">Modules</p>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
             <p className="px-3 text-xs font-semibold text-slate-400 mb-2">System</p>
             <ul className="space-y-0.5">
               {secondaryNav.map((item) => {
                 const isActive = pathname === item.href;
                 return (
                   <li key={item.name}>
                     <Link
                       href={item.href}
                       className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                         isActive
                           ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5'
                           : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                       }`}
                     >
                       <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                       {item.name}
                     </Link>
                   </li>
                 );
               })}
             </ul>
          </div>

        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{user?.fullName || 'Shop Manager'}</p>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-500 text-xs font-medium transition-colors flex items-center gap-1 mt-0.5"
              >
                Logout Account
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
              <Command size={14} /> <span>Search everything...</span> <span className="text-xs border border-slate-200 px-1.5 rounded bg-white ml-2 text-slate-400">⌘K</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-900 transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-6xl mx-auto w-full pb-20">
            {children}
          </div>
        </div>
      </main>

      {/* Floating AI Action Button (FAB) */}
      <button 
        onClick={() => setAiOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-900 text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all z-40 font-semibold"
      >
        <Sparkles size={18} className="text-blue-400" />
        Ask AI
      </button>

      {/* AI Chat Drawer Component */}
      <ChatDrawer isOpen={isAiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
