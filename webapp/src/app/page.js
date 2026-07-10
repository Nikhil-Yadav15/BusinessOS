"use client";

import Link from 'next/link';
import { useState } from 'react';
import { 
  Moon, Sparkles, Handshake, ReceiptText, Package, 
  ShoppingCart, Wallet, Zap, Check, ChevronDown, Shield, PieChart, Database, UserCheck
} from 'lucide-react';

export default function HeroPage() {
  const [activeTab, setActiveTab] = useState('crm');

  const tabs = [
    { id: 'crm', title: 'CRM & SALES', desc: 'Invoices & clients ledger', icon: <Shield className="w-4 h-4 text-orange-400" /> },
    { id: 'stock', title: 'STOCK & CATALOG', desc: 'Real-time quantity status', icon: <Package className="w-4 h-4 text-amber-700" /> },
    { id: 'ledger', title: 'ACCOUNTING LEDGER', desc: 'Double-entry operations', icon: <Wallet className="w-4 h-4 text-yellow-500" /> },
    { id: 'ai', title: 'AI CO-PILOT CONSOLE', desc: 'Autonomous queries', icon: <Zap className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-md w-8 h-8 flex items-center justify-center font-bold text-lg">A</div>
          <span className="text-xl font-bold tracking-tight">Atlas OS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 tracking-wide">
          <Link href="#features" className="hover:text-slate-900 transition-colors">FEATURES</Link>
          <Link href="#walkthrough" className="hover:text-slate-900 transition-colors">LIVE DEMO</Link>
          <Link href="#walkthrough" className="hover:text-slate-900 transition-colors">TECHNICAL SPEC</Link>
          <Link href="#pricing" className="hover:text-slate-900 transition-colors">PRICING</Link>
          <Link href="#faq" className="hover:text-slate-900 transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-full bg-white shadow-sm">
            <Moon size={18} />
          </button>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 border border-slate-200 bg-white rounded-md hover:bg-slate-50 shadow-sm">
            Sign In
          </Link>
          <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-6 pt-20 pb-16 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-600 rounded-full px-4 py-1.5 text-sm font-medium border border-blue-100/50 mb-8">
          <Sparkles size={16} />
          V1.2 Released — AI Co-Pilot & Workflow Gateway
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
          The modern operating system <br/>
          <span className="text-blue-600">for business operations.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Atlas unifies CRM, inventory tracking, invoicing, and ledger accounting on a secure, row-level isolated workspace. Designed for retail, logistics, and service enterprises.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/register" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md text-[15px]">
            Create Free Workspace
          </Link>
          <Link href="#walkthrough" className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-3.5 rounded-xl transition-all border border-slate-200 shadow-sm text-[15px]">
            See How it Works
          </Link>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-20 mx-auto max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden shadow-slate-200/50">
          {/* Browser Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-md px-32 py-1 text-xs text-slate-400 font-mono flex-1 mx-4 text-center max-w-xl shadow-sm">
              https://atlas-os.com/dashboard
            </div>
            <div className="w-16"></div>
          </div>
          {/* Dashboard Content Mock */}
          <div className="bg-[#1C1F26] h-[500px] flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-700/50 p-4 space-y-4">
              <div className="flex items-center space-x-2 text-white font-bold mb-8 opacity-90">
                <div className="bg-blue-500 text-white rounded text-xs w-6 h-6 flex items-center justify-center">A</div>
                <span>Atlas OS</span>
              </div>
              <div className="space-y-1">
                <div className="bg-slate-800/80 text-blue-400 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-3">
                  <Database size={16} /> <span>CRM</span>
                </div>
                <div className="text-slate-400 hover:text-slate-200 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-3">
                  <Package size={16} /> <span>Inventory</span>
                </div>
                <div className="text-slate-400 hover:text-slate-200 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-3">
                  <Wallet size={16} /> <span>Ledger</span>
                </div>
                <div className="text-slate-400 hover:text-slate-200 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-3">
                  <ReceiptText size={16} /> <span>Invoices</span>
                </div>
              </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-6 relative">
              <div className="flex space-x-4 h-64 mb-6">
                <div className="flex-1 bg-[#232731] border border-slate-700/50 rounded-xl p-5 shadow-lg">
                  <div className="text-slate-300 text-sm font-medium mb-4 flex justify-between">
                    <span>Revenue Trends</span>
                    <span className="text-slate-500 text-xs">All revenue ⌄</span>
                  </div>
                  {/* Fake Chart Line */}
                  <svg className="w-full h-40" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path d="M0,80 L100,50 L200,90 L300,20 L400,0" fill="none" stroke="#60A5FA" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-between text-[#8A91A6] text-[10px] mt-2">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                  </div>
                </div>
                <div className="w-64 bg-[#232731] border border-slate-700/50 rounded-xl p-5 shadow-lg">
                  <div className="text-slate-300 text-sm font-medium mb-4">Sales performance</div>
                  <div className="flex items-end space-x-2 h-40">
                    <div className="w-full bg-blue-500/80 rounded-t h-[40%]"></div>
                    <div className="w-full bg-blue-500/80 rounded-t h-[80%]"></div>
                    <div className="w-full bg-blue-500/80 rounded-t h-[30%]"></div>
                    <div className="w-full bg-blue-500/80 rounded-t h-[90%]"></div>
                    <div className="w-full bg-blue-500/80 rounded-t h-[60%]"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating AI Assistant Mockup */}
              <div className="absolute right-8 top-32 w-80 bg-[#2C313C] border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#353A45] px-4 py-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center space-x-2 text-white text-sm font-medium">
                    <Zap size={14} className="text-blue-400" /> <span>Atlas Assistant</span>
                  </div>
                  <div className="flex space-x-2 text-slate-400">
                    <span>−</span> <span>✕</span>
                  </div>
                </div>
                <div className="p-4 h-48 flex flex-col justify-end space-y-4 text-sm bg-gradient-to-b from-[#2C313C] to-[#232731]">
                  <div className="flex space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Zap size={12} />
                    </div>
                    <div className="bg-[#353A45] p-3 rounded-lg text-slate-200 text-xs rounded-tl-none border border-slate-700/50 leading-relaxed shadow-sm">
                      Hello, I'm an AI chatbot assistant. I can help you with your tasks!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Trusted by fast-growing companies nationwide</p>
          <div className="flex flex-wrap justify-center gap-10 opacity-70 grayscale">
            {/* Logos mockup */}
            <div className="flex items-center space-x-2 font-bold text-slate-700"><span className="bg-slate-800 text-white rounded p-1 text-xs px-2">VL</span> <span>Vertex Logistics</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-700"><span className="bg-slate-800 text-white rounded p-1 text-xs px-2">AR</span> <span>Apex Retail Group</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-700"><span className="bg-slate-800 text-white rounded p-1 text-xs px-2">HW</span> <span>Horizon Wholesale</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-700"><span className="bg-slate-800 text-white rounded p-1 text-xs px-2">NS</span> <span>Nexus Services</span></div>
            <div className="flex items-center space-x-2 font-bold text-slate-700"><span className="bg-slate-800 text-white rounded p-1 text-xs px-2">CD</span> <span>Core Distribution</span></div>
          </div>
        </div>
      </section>

      {/* Interactive Walkthrough */}
      <section id="walkthrough" className="py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Interactive Product Walkthrough</h2>
            <p className="text-slate-500 mt-3 text-lg">Click each tab below to view concrete database tables and metrics inside the Atlas dashboard shell.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
            {/* Tabs sidebar */}
            <div className="md:w-64 space-y-2 flex-shrink-0">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-4 rounded-xl border flex flex-col transition-all ${
                    activeTab === tab.id 
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {tab.icon}
                    <span className={`text-sm font-bold ${activeTab === tab.id ? 'text-blue-900' : 'text-slate-700'}`}>{tab.title}</span>
                  </div>
                  <span className="text-xs text-slate-500">{tab.desc}</span>
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-bold text-slate-900 tracking-wide text-sm">DRAFT INVOICE LEDGER</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">4 Pending Approval</span>
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
                <tbody className="text-slate-700 font-medium font-mono text-xs">
                  <tr className="border-b border-slate-50">
                    <td className="py-4">INV-2026-0012</td>
                    <td className="py-4 font-sans text-slate-900">Vertex Logistics</td>
                    <td className="py-4 font-sans">Jul 15, 2026</td>
                    <td className="py-4 text-right">₹12,450.00</td>
                    <td className="py-4 pl-4"><span className="text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full text-[10px] font-bold font-sans uppercase">Unpaid</span></td>
                  </tr>
                  <tr>
                    <td className="py-4">INV-2026-0011</td>
                    <td className="py-4 font-sans text-slate-900">Apex Retail Group</td>
                    <td className="py-4 font-sans">Jul 09, 2026</td>
                    <td className="py-4 text-right">₹48,200.00</td>
                    <td className="py-4 pl-4"><span className="text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-[10px] font-bold font-sans uppercase">Paid</span></td>
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
      <section id="features" className="py-24 bg-white border-t border-b border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Enterprise Suite Modules</h2>
            <p className="text-slate-500 mt-3 text-lg">Six cohesive business frameworks run in parallel to eliminate external API bridge dependencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <Handshake size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Unified CRM & Parties</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Centralize customers and suppliers directory with real-time transaction logs, credit balance tracking, and registration.
              </p>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex justify-between items-center uppercase mt-auto pt-4 border-t border-slate-100">
                <span>Integrated with Catalog</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-6">
                <ReceiptText size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Sales & Electronic Invoices</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Draft professional estimates, approve sales invoices, capture partial payments, and calculate taxes automatically.
              </p>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex justify-between items-center uppercase mt-auto pt-4 border-t border-slate-100">
                <span>Double-entry auto-post</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
                <Package size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Inventory & Reorder Levels</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Real-time stock ledger tracking. Automatically flag low-stock warnings when quantities drop below safety thresholds.
              </p>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex justify-between items-center uppercase mt-auto pt-4 border-t border-slate-100">
                <span>Automatic SKU sync</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <ShoppingCart size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Purchasing & Bills</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Process supplier bills, map incoming purchase orders, and automatically add stock entries to inventory records.
              </p>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex justify-between items-center uppercase mt-auto pt-4 border-t border-slate-100">
                <span>Accounts payable ready</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-6">
                <Wallet size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Double-Entry Accounting Ledger</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Every billing action automatically records double-entry posts to assets, liabilities, and revenues, ensuring an audit-ready trail.
              </p>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex justify-between items-center uppercase mt-auto pt-4 border-t border-slate-100">
                <span>Chart of accounts compliant</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-6">
                <Zap size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">AI Co-Pilot & Webhook Gateway</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Natural language database queries coupled with an event outbox queue that secures external webhooks and ledger logs.
              </p>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex justify-between items-center uppercase mt-auto pt-4 border-t border-slate-100">
                <span>Autonomous execution</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Straightforward, transparent pricing</h2>
            <p className="text-slate-500 mt-3 text-lg">No surprises. Host it yourself or utilize our managed zero-maintenance database pools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
            {/* Starter Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Community / Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                <span className="text-slate-500 text-sm"> / forever</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed h-10">Perfect for self-hosting, local testing, and individual operators.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Full access to all 6 core modules</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Unlimited local transactions</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> PostgreSQL or SQLite database driver support</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Standard double-entry chart of accounts</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Community Discord assistance</div>
              </div>
              <button className="w-full py-3 px-4 border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl shadow-blue-900/5 relative scale-105 z-10">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">Most Popular</span>
              </div>
              <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Managed Cloud / Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-slate-900">₹2,499</span>
                <span className="text-slate-500 text-sm"> / per month</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed h-10">For growing businesses requiring hosted infrastructure and cloud backups.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Hosted Neon PostgreSQL database pool</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Automated daily encrypted database backups</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Up to 5 team members with RBAC settings</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> AI Co-Pilot natural language search integration</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Standard email ticket support (24h response)</div>
              </div>
              <button className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                Try Managed Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Enterprise / Scale</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-slate-900">₹12,499</span>
                <span className="text-slate-500 text-sm"> / per month</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed h-10">For high-volume operations demanding custom configurations and SLA.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Unlimited team members & business contexts</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Dedicated database connection pool parameters</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Custom webhooks outbox engine execution</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Priority Slack SLA assistance (2h response)</div>
                <div className="flex items-start gap-3 text-sm text-slate-600"><Check size={16} className="text-blue-500 mt-0.5 shrink-0"/> Custom invoice header PDF templates styling</div>
              </div>
              <button className="w-full py-3 px-4 border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500 mt-3">Everything you need to know about the Atlas stack architecture.</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center hover:border-slate-300 cursor-pointer transition-colors shadow-sm bg-[#FAFAFA]">
              <h3 className="font-semibold text-slate-800 text-sm">What is Atlas BusinessOS?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center hover:border-slate-300 cursor-pointer transition-colors shadow-sm bg-[#FAFAFA]">
              <h3 className="font-semibold text-slate-800 text-sm">How does the double-entry accounting ledger integrate?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center hover:border-slate-300 cursor-pointer transition-colors shadow-sm bg-[#FAFAFA]">
              <h3 className="font-semibold text-slate-800 text-sm">Is my business data isolated?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center hover:border-slate-300 cursor-pointer transition-colors shadow-sm bg-[#FAFAFA]">
              <h3 className="font-semibold text-slate-800 text-sm">Can I self-host Atlas?</h3>
              <ChevronDown className="text-slate-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center font-bold text-sm">A</div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Atlas OS</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              The high-performance, double-entry transactional operating system built for modern enterprise business workflows.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-5">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-600">Interactive Demo</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Core Modules</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Pricing Plans</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-5">Developers</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-600">Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-600">API Reference</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Database Schema</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Self-Hosting</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-5">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Security Audit</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-5">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-blue-600">License (MIT)</Link></li>
              <li><Link href="#" className="hover:text-blue-600">SLA Agreement</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>© 2026 Atlas Technology Systems. All rights reserved. Enterprise Ledger accounting core certified under ISO 20022 principles.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-600">System Status</Link>
            <Link href="#" className="hover:text-slate-600">Support Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
