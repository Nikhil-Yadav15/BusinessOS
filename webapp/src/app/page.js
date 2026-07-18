"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
  Moon, Sparkles, Handshake, ReceiptText, Package,
  ShoppingCart, Wallet, Zap, Check, ChevronDown, Shield, PieChart, Database, UserCheck
} from 'lucide-react';

export default function HeroPage() {
  const [activeTab, setActiveTab] = useState('crm');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const tabs = [
    { id: 'crm', title: 'CRM & SALES', desc: 'Invoices & clients ledger', icon: <Shield className="w-4 h-4 text-orange-400" /> },
    { id: 'stock', title: 'STOCK & CATALOG', desc: 'Real-time quantity status', icon: <Package className="w-4 h-4 text-amber-700" /> },
    { id: 'ledger', title: 'ACCOUNTING LEDGER', desc: 'Double-entry operations', icon: <Wallet className="w-4 h-4 text-yellow-500" /> },
    { id: 'ai', title: 'AI CO-PILOT CONSOLE', desc: 'Autonomous queries', icon: <Zap className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 relative pt-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]">A</div>
            <span className="text-xl font-extrabold tracking-tighter">Atlas.</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-500 tracking-[0.1em] uppercase">
            <Link href="#features" className="hover:text-slate-900 transition-colors cursor-pointer">Features</Link>
            <Link href="#walkthrough" className="hover:text-slate-900 transition-colors cursor-pointer">Live Demo</Link>
            <Link href="#walkthrough" className="hover:text-slate-900 transition-colors cursor-pointer">Technical Spec</Link>
            <Link href="#pricing" className="hover:text-slate-900 transition-colors cursor-pointer">Pricing</Link>
            <Link href="#faq" className="hover:text-slate-900 transition-colors cursor-pointer">FAQ</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:flex p-2 text-slate-400 hover:text-slate-900 border border-slate-200/60 rounded-full bg-white/50 shadow-sm cursor-pointer transition-all">
              <Moon size={18} />
            </button>
            <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold px-5 py-2.5 border border-slate-200/60 bg-white/80 rounded-xl hover:bg-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer transition-all">
              Sign In
            </Link>
            <Link href="/register" className="text-sm bg-slate-900 hover:bg-black text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98] cursor-pointer">
              Get Started
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {mobileNavOpen ? (
                  <><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl px-6 py-4 space-y-1">
            {[['#features', 'Features'], ['#walkthrough', 'Live Demo'], ['#walkthrough', 'Technical Spec'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
              <Link key={label} href={href} onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 mt-2 flex gap-2">
              <Link href="/login" className="flex-1 text-center text-sm font-semibold px-4 py-2.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-all">Sign In</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="text-center px-4 sm:px-6 pt-16 sm:pt-24 pb-16 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.1em] uppercase border border-slate-200/60 mb-8 mx-auto shadow-sm">
          <Sparkles size={14} className="text-slate-900" />
          V1.2 Released — AI Co-Pilot & Workflow Gateway
        </div>

        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[1.05] text-slate-900">
          Invisible precision. <br />
          <span className="text-slate-400 font-medium">Infinite scale.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Atlas unifies CRM, inventory tracking, invoicing, and ledger accounting on a secure, row-level isolated workspace. Designed for retail, logistics, and service enterprises.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/register" className="inline-flex items-center justify-center bg-slate-900 hover:bg-black text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.98] cursor-pointer text-[15px]">
            Create Free Workspace
          </Link>
          <Link href="#walkthrough" className="inline-flex items-center justify-center bg-white/80 hover:bg-white backdrop-blur-xl text-slate-900 font-bold px-8 py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] border border-slate-200/60 cursor-pointer text-[15px]">
            See How it Works
          </Link>
        </div>

        {/* Dashboard Mockup — hidden on small screens */}
        <div className="hidden sm:block mt-24 mx-auto max-w-5xl bg-white border border-slate-200/60 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Browser Bar */}
          <div className="bg-slate-50/50 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            </div>
            <div className="bg-white/80 border border-slate-200/60 rounded-lg px-32 py-1.5 text-xs text-slate-400 font-mono flex-1 mx-4 text-center max-w-xl shadow-sm">
              atlas.system/dashboard
            </div>
            <div className="w-16"></div>
          </div>
          {/* Dashboard Content Mock */}
          <div className="bg-white h-[500px] flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-100 p-6 space-y-6 bg-slate-50/30">
              <div className="flex items-center space-x-3 text-slate-900 font-extrabold mb-8">
                <div className="bg-black text-white rounded-lg text-[10px] w-6 h-6 flex items-center justify-center shadow-md">A</div>
                <span className="tracking-tighter">Atlas.</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white border border-slate-200/60 shadow-sm text-slate-900 font-bold px-3 py-2 rounded-xl text-sm flex items-center space-x-3">
                  <Database size={16} /> <span>CRM</span>
                </div>
                <div className="text-slate-400 px-3 py-2 rounded-xl text-sm font-semibold flex items-center space-x-3">
                  <Package size={16} /> <span>Inventory</span>
                </div>
                <div className="text-slate-400 px-3 py-2 rounded-xl text-sm font-semibold flex items-center space-x-3">
                  <Wallet size={16} /> <span>Ledger</span>
                </div>
                <div className="text-slate-400 px-3 py-2 rounded-xl text-sm font-semibold flex items-center space-x-3">
                  <ReceiptText size={16} /> <span>Invoices</span>
                </div>
              </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-8 relative bg-[#FAFAFA]">
              <div className="flex space-x-6 h-64 mb-6">
                <div className="flex-1 bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm">
                  <div className="text-slate-900 text-sm font-bold mb-4 flex justify-between tracking-tight">
                    <span>Revenue Trends</span>
                    <span className="text-slate-400 text-xs font-medium">All revenue ⌄</span>
                  </div>
                  {/* Fake Chart Line */}
                  <svg className="w-full h-40" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path d="M0,80 L100,50 L200,90 L300,20 L400,0" fill="none" stroke="#000000" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-between text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-2">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                  </div>
                </div>
                <div className="w-64 bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm">
                  <div className="text-slate-900 text-sm font-bold mb-4 tracking-tight">Sales performance</div>
                  <div className="flex items-end space-x-3 h-40">
                    <div className="w-full bg-slate-900 rounded-md h-[40%]"></div>
                    <div className="w-full bg-slate-200 rounded-md h-[80%]"></div>
                    <div className="w-full bg-slate-900 rounded-md h-[30%]"></div>
                    <div className="w-full bg-slate-200 rounded-md h-[90%]"></div>
                    <div className="w-full bg-slate-900 rounded-md h-[60%]"></div>
                  </div>
                </div>
              </div>

              {/* Floating AI Assistant Mockup */}
              <div className="absolute right-8 top-32 w-80 bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900 text-sm font-bold tracking-tight">
                    <Zap size={14} className="text-slate-900" /> <span>Atlas Assistant</span>
                  </div>
                  <div className="flex space-x-2 text-slate-300 font-bold">
                    <span>−</span> <span>✕</span>
                  </div>
                </div>
                <div className="p-5 h-48 flex flex-col justify-end space-y-4 text-sm bg-gradient-to-b from-white to-slate-50/50">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                      <Zap size={12} />
                    </div>
                    <div className="bg-white p-4 rounded-2xl text-slate-700 text-xs rounded-tl-none border border-slate-200/80 leading-relaxed shadow-sm font-medium">
                      Hello, I'm your AI operating system assistant.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-t border-slate-200/60 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mb-8">Trusted by fast-growing companies nationwide</p>
          <div className="flex flex-wrap justify-center gap-10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Logos mockup */}
            <div className="flex items-center space-x-2 font-bold text-slate-900"><span className="bg-slate-900 text-white rounded-md p-1 text-xs px-2 shadow-sm">VL</span> <span className="tracking-tighter">Vertex Logistics</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-900"><span className="bg-slate-900 text-white rounded-md p-1 text-xs px-2 shadow-sm">AR</span> <span className="tracking-tighter">Apex Retail Group</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-900"><span className="bg-slate-900 text-white rounded-md p-1 text-xs px-2 shadow-sm">HW</span> <span className="tracking-tighter">Horizon Wholesale</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-900"><span className="bg-slate-900 text-white rounded-md p-1 text-xs px-2 shadow-sm">NS</span> <span className="tracking-tighter">Nexus Services</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-900"><span className="bg-slate-900 text-white rounded-md p-1 text-xs px-2 shadow-sm">CD</span> <span className="tracking-tighter">Core Distribution</span></div>
          </div>
        </div>
      </section>

      {/* Interactive Walkthrough */}
      <section id="walkthrough" className="py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Interactive Product Walkthrough</h2>
            <p className="text-slate-500 mt-4 text-lg">Click each tab below to view concrete database tables and metrics inside the Atlas dashboard shell.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
            {/* Tabs sidebar */}
            <div className="md:w-72 space-y-3 flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-5 rounded-2xl border flex flex-col transition-all cursor-pointer active:scale-[0.98] ${activeTab === tab.id
                      ? 'bg-white border-slate-900 shadow-md'
                      : 'bg-white/50 border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {tab.icon}
                    <span className={`text-[15px] font-extrabold tracking-tight ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>{tab.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{tab.desc}</span>
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="flex-1 bg-white border border-slate-200/80 rounded-[24px] shadow-sm p-6 lg:p-10 overflow-x-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-5">
                <h3 className="font-bold text-slate-900 tracking-widest text-[11px] uppercase">Draft Invoice Ledger</h3>
                <span className="bg-slate-100 text-slate-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-slate-200">4 Pending Approval</span>
              </div>

              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-500 font-bold border-b border-slate-100">
                    <th className="pb-3 pt-2">Invoice #</th>
                    <th className="pb-3 pt-2">Party (Client)</th>
                    <th className="pb-3 pt-2">Due Date</th>
                    <th className="pb-3 pt-2 text-right">Amount</th>
                    <th className="pb-3 pt-2 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-900 font-medium font-mono text-[13px]">
                  <tr className="border-b border-slate-50">
                    <td className="py-5">INV-2026-0012</td>
                    <td className="py-5 font-sans font-bold">Vertex Logistics</td>
                    <td className="py-5 font-sans text-slate-500">Jul 15, 2026</td>
                    <td className="py-5 text-right font-bold">₹12,450.00</td>
                    <td className="py-5 pl-4"><span className="text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-[10px] tracking-widest font-bold font-sans uppercase">Unpaid</span></td>
                  </tr>
                  <tr>
                    <td className="py-5">INV-2026-0011</td>
                    <td className="py-5 font-sans font-bold">Apex Retail Group</td>
                    <td className="py-5 font-sans text-slate-500">Jul 09, 2026</td>
                    <td className="py-5 text-right font-bold">₹48,200.00</td>
                    <td className="py-5 pl-4"><span className="text-slate-900 bg-white border border-slate-300 shadow-sm px-3 py-1.5 rounded-full text-[10px] tracking-widest font-bold font-sans uppercase">Paid ✓</span></td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-12 flex justify-between items-center text-xs text-slate-400 font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Row-level context isolated (Tenant DB isolation verified)</span>
                </div>
                <span>V1.2 // PRODUCTION READY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="features" className="py-32 bg-white border-t border-b border-slate-200/60 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Enterprise Suite Modules</h2>
            <p className="text-slate-500 mt-4 text-lg">Six cohesive business frameworks run in parallel to eliminate external API bridge dependencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-900 mb-8">
                <Handshake size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 tracking-tight">Unified Customers & Suppliers</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">
                Centralize customers and suppliers directory with real-time transaction logs, credit balance tracking, and registration.
              </p>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.1em] flex justify-between items-center uppercase mt-auto pt-5 border-t border-slate-100">
                <span>Integrated with Catalog</span>
                <span className="text-slate-900">→</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-900 mb-8">
                <ReceiptText size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 tracking-tight">Sales & Electronic Invoices</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">
                Draft professional estimates, approve sales invoices, capture partial payments, and calculate taxes automatically.
              </p>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.1em] flex justify-between items-center uppercase mt-auto pt-5 border-t border-slate-100">
                <span>Double-entry auto-post</span>
                <span className="text-slate-900">→</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-900 mb-8">
                <Package size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 tracking-tight">Inventory & Reorder Levels</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">
                Real-time stock ledger tracking. Automatically flag low-stock warnings when quantities drop below safety thresholds.
              </p>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.1em] flex justify-between items-center uppercase mt-auto pt-5 border-t border-slate-100">
                <span>Automatic SKU sync</span>
                <span className="text-slate-900">→</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-900 mb-8">
                <ShoppingCart size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 tracking-tight">Purchasing & Bills</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">
                Process supplier bills, map incoming purchase orders, and automatically add stock entries to inventory records.
              </p>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.1em] flex justify-between items-center uppercase mt-auto pt-5 border-t border-slate-100">
                <span>Accounts payable ready</span>
                <span className="text-slate-900">→</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-900 mb-8">
                <Wallet size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 tracking-tight">Double-Entry Accounting</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">
                Every billing action automatically records double-entry posts to assets, liabilities, and revenues, ensuring an audit-ready trail.
              </p>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.1em] flex justify-between items-center uppercase mt-auto pt-5 border-t border-slate-100">
                <span>Chart of accounts compliant</span>
                <span className="text-slate-900">→</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-900 mb-8">
                <Zap size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 tracking-tight">AI Co-Pilot & Workflows</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">
                Natural language database queries coupled with an event outbox queue that secures external webhooks and ledger logs.
              </p>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.1em] flex justify-between items-center uppercase mt-auto pt-5 border-t border-slate-100">
                <span>Autonomous execution</span>
                <span className="text-slate-900">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Straightforward, transparent pricing</h2>
            <p className="text-slate-500 mt-4 text-lg">No surprises. Host it yourself or utilize our managed zero-maintenance database pools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Starter Plan */}
            <div className="bg-white/80 border border-slate-200/60 rounded-[28px] p-8 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-4">Community / Starter</h3>
              <div className="mb-4">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">₹0</span>
                <span className="text-slate-400 font-medium"> / forever</span>
              </div>
              <p className="text-[13px] text-slate-500 mb-8 leading-relaxed h-10 font-medium">Perfect for self-hosting, local testing, and individual operators.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Full access to all 6 core modules</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Unlimited local transactions</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> PostgreSQL or SQLite supported</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Standard double-entry chart</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Community Discord assistance</div>
              </div>
              <button className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]">
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 rounded-[28px] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.12)] relative scale-105 z-10 text-white">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <span className="bg-white text-slate-900 text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Most Popular</span>
              </div>
              <h3 className="text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-4">Managed Cloud / Pro</h3>
              <div className="mb-4">
                <span className="text-5xl font-extrabold text-white tracking-tighter">₹2,499</span>
                <span className="text-slate-400 font-medium"> / per month</span>
              </div>
              <p className="text-[13px] text-slate-300 mb-8 leading-relaxed h-10 font-medium">For growing businesses requiring hosted infrastructure and cloud backups.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-[13px] text-slate-200 font-medium"><Check size={16} className="text-white mt-0.5 shrink-0" /> Hosted Neon PostgreSQL database pool</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-200 font-medium"><Check size={16} className="text-white mt-0.5 shrink-0" /> Automated daily encrypted database backups</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-200 font-medium"><Check size={16} className="text-white mt-0.5 shrink-0" /> Up to 5 team members with RBAC settings</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-200 font-medium"><Check size={16} className="text-white mt-0.5 shrink-0" /> AI Co-Pilot natural language search integration</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-200 font-medium"><Check size={16} className="text-white mt-0.5 shrink-0" /> Standard email ticket support (24h response)</div>
              </div>
              <button className="w-full py-4 px-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-md active:scale-[0.98]">
                Try Managed Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/80 border border-slate-200/60 rounded-[28px] p-8 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-4">Enterprise / Scale</h3>
              <div className="mb-4">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">₹12,499</span>
                <span className="text-slate-400 font-medium"> / per month</span>
              </div>
              <p className="text-[13px] text-slate-500 mb-8 leading-relaxed h-10 font-medium">For high-volume operations demanding custom configurations and SLA.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Unlimited team members & contexts</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Dedicated database connection pools</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Custom webhooks outbox engine execution</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Priority Slack SLA assistance (2h)</div>
                <div className="flex items-start gap-3 text-[13px] text-slate-700 font-medium"><Check size={16} className="text-slate-900 mt-0.5 shrink-0" /> Custom invoice PDF template styling</div>
              </div>
              <button className="w-full py-4 px-4 border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Frequently Asked Questions</h2>
            <p className="text-slate-500 mt-4 text-lg">Everything you need to know about the Atlas stack architecture.</p>
          </div>

          <div className="space-y-4">
            <div className="p-6 border border-slate-200/60 rounded-[20px] flex justify-between items-center hover:border-slate-300 cursor-pointer transition-all shadow-sm bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-[15px]">What is Atlas BusinessOS?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-6 border border-slate-200/60 rounded-[20px] flex justify-between items-center hover:border-slate-300 cursor-pointer transition-all shadow-sm bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-[15px]">How does the double-entry accounting ledger integrate?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-6 border border-slate-200/60 rounded-[20px] flex justify-between items-center hover:border-slate-300 cursor-pointer transition-all shadow-sm bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-[15px]">Is my business data isolated?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-6 border border-slate-200/60 rounded-[20px] flex justify-between items-center hover:border-slate-300 cursor-pointer transition-all shadow-sm bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-[15px]">Can I self-host Atlas?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-black text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold text-[13px] shadow-sm">A</div>
              <span className="font-extrabold text-slate-900 text-xl tracking-tighter">Atlas.</span>
            </div>
            <p className="text-slate-500 text-[13px] leading-relaxed max-w-sm font-medium">
              The high-performance, double-entry transactional operating system built for modern enterprise workflows.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-[10px] tracking-[0.1em] uppercase mb-6">Product</h4>
            <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Interactive Demo</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Core Modules</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Pricing Plans</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-[10px] tracking-[0.1em] uppercase mb-6">Developers</h4>
            <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Database Schema</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Self-Hosting</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-[10px] tracking-[0.1em] uppercase mb-6">Company</h4>
            <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-slate-900 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Security Audit</Link></li>
              <li><Link href="#" className="hover:text-slate-900 transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-400 font-medium uppercase tracking-widest">
          <p>© 2026 Atlas Technology Systems. All rights reserved.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link href="#" className="hover:text-slate-900 transition-colors">System Status</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Support Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
