'use client';

import { useState, useEffect } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  const user = session?.user;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Client-safe time greeting calculation to prevent Next.js hydration mismatch
  useEffect(() => {
    const hour = new Date().getHours();
    let greet = 'Good Morning';
    if (hour >= 0 && hour <= 4) {
      greet = 'Late Night';
    } else if (hour >= 5 && hour <= 11) {
      greet = 'Good Morning';
    } else if (hour >= 12 && hour <= 16) {
      greet = 'Good Afternoon';
    } else if (hour >= 17 && hour <= 23) {
      greet = 'Good Evening';
    }
    setGreeting(greet);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans relative overflow-hidden">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Responsive Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col shrink-0 shadow-premium transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight">Atlas OS</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
              {initials}
            </div>
            <div className="flex-1 text-sm truncate">
              <p className="font-semibold text-foreground truncate">{user?.fullName || 'User'}</p>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-destructive text-xs transition-colors font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Open Navigation"
            >
              <span className="text-xl">☰</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              {greeting && (
                <span className="text-sm font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  {greeting}, {user?.fullName || 'Business Partner'}
                </span>
              )}
              <span className="hidden sm:inline text-muted-foreground text-xs">|</span>
              <p className="text-xs text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                Business ID: <span className="font-mono text-foreground text-[10px] sm:text-xs">{session?.businessId || 'Not selected'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              Live
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Floating AI Action Button (FAB) */}
      <button 
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 text-2xl"
        title="Open Atlas AI Co-Pilot"
      >
        ✨
      </button>

      {/* AI Chat Drawer Component */}
      <ChatDrawer isOpen={isAiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
