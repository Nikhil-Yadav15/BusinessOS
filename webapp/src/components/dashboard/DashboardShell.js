'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusinessContext } from '../providers/BusinessProvider.js';
import ChatDrawer from '../ai/ChatDrawer.js';

const navItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'CRM & Parties', href: '/dashboard/crm' },
  { name: 'Product Catalog', href: '/dashboard/catalog' },
  { name: 'Inventory', href: '/dashboard/inventory' },
  { name: 'Sales Invoices', href: '/dashboard/sales' },
  { name: 'Purchasing', href: '/dashboard/purchasing' },
  { name: 'Accounting', href: '/dashboard/ledger' },
  { name: 'Workflows & AI', href: '/dashboard/workflows' },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { session, logout } = useBusinessContext();
  const [isAiOpen, setAiOpen] = useState(false);

  const user = session?.user;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="font-bold text-xl text-indigo-700 tracking-tight">Atlas OS</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-sm truncate">
              <p className="font-semibold text-slate-900 truncate">{user?.fullName || 'User'}</p>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-500 text-xs transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Business ID: <span className="font-mono text-slate-700 text-xs">{session?.businessId || 'Not selected'}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Live
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Floating AI Action Button (FAB) */}
      <button 
        onClick={() => setAiOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 hover:scale-105 transition-all z-40 text-2xl"
        title="Open Atlas AI Co-Pilot"
      >
        ✨
      </button>

      {/* AI Chat Drawer Component */}
      <ChatDrawer isOpen={isAiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
