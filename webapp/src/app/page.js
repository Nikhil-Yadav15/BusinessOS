'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('crm');
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light'); // default to light to match Vercel landing page

  // Simple state toggle for simulated theme switcher
  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }

  const faqItems = [
    {
      q: "What is Atlas BusinessOS?",
      a: "Atlas BusinessOS is an intelligent, unified operating system designed to run modern business operations. It consolidates CRM, inventory, invoicing, purchasing, double-entry ledger accounting, and AI co-pilot capabilities into a single integrated platform, eliminating the need for complex API integrations between disjointed SaaS tools."
    },
    {
      q: "How does the double-entry accounting ledger integrate?",
      a: "Unlike typical business software where accounting is a separate sync step, Atlas writes directly to the accounting ledger at the moment of transaction. Approving a sales invoice or paying a supplier bill immediately creates audit-ready double-entry journal logs mapping to assets, liabilities, expenses, and revenues."
    },
    {
      q: "Is my business data isolated?",
      a: "Yes. Atlas utilizes strict row-level isolation policies. Every business workspace executes within a secure sandbox context, ensuring complete isolation of databases, schemas, users, and audit trails."
    },
    {
      q: "Can I self-host Atlas?",
      a: "Absolutely. The core application is open and designed to be fully self-hostable with standard PostgreSQL or SQLite databases. We also offer Managed Cloud pools for zero-maintenance enterprise deployments."
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50/50 text-slate-900 flex flex-col relative font-sans antialiased overflow-x-hidden ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : ''}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <nav className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
              A
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Atlas OS</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">Features</a>
            <a href="#demo" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">Live Demo</a>
            <a href="#specs" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">Technical Spec</a>
            <a href="#pricing" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">Pricing</a>
            <a href="#faq" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">FAQ</a>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer" 
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              )}
            </button>
            <Link href="/login">
              <button className="inline-flex items-center justify-center font-semibold transition-all select-none active:scale-[0.98] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs h-10 px-4 min-h-[44px]">Sign In</button>
            </Link>
            <Link href="/register">
              <button className="inline-flex items-center justify-center font-semibold transition-all select-none active:scale-[0.98] bg-blue-600 hover:bg-blue-500 text-white shadow-sm rounded-lg text-xs h-10 px-4 min-h-[44px]">Get Started</button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              ☰
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 py-2">Features</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 py-2">Live Demo</a>
            <a href="#specs" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 py-2">Technical Spec</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 py-2">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 py-2">FAQ</a>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <Link href="/login" className="flex-1">
                <button className="w-full font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg text-xs h-10 px-4 min-h-[44px]">Sign In</button>
              </Link>
              <Link href="/register" className="flex-1">
                <button className="w-full font-semibold bg-blue-600 text-white rounded-lg text-xs h-10 px-4 min-h-[44px]">Get Started</button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Sections */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative px-6 pt-20 md:pt-28 pb-20 md:pb-28 max-w-7xl mx-auto z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center text-xs font-semibold tracking-wide transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 gap-1.5 py-1.5 px-4 rounded-full select-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-blue-600 dark:text-blue-400 animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
              <span>V1.2 Released — AI Co-Pilot &amp; Workflow Gateway</span>
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              The modern operating system <br/>
              <span className="text-blue-600 dark:text-blue-400">for business operations.</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Atlas unifies CRM, inventory tracking, invoicing, and ledger accounting on a secure, row-level isolated workspace. Designed for retail, logistics, and service enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="inline-flex items-center justify-center font-semibold transition-all select-none active:scale-[0.98] bg-blue-600 hover:bg-blue-500 text-white shadow-sm rounded-xl text-base h-12 px-8 w-full sm:w-auto min-h-[44px]">Create Free Workspace</button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <button className="inline-flex items-center justify-center font-semibold transition-all select-none active:scale-[0.98] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-base h-12 px-8 w-full min-h-[44px]">See How it Works</button>
              </a>
            </div>
          </div>

          {/* Graphic Dashboard Mockup */}
          <div className="relative mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden aspect-[16/10] relative group select-none transition-all duration-500 hover:shadow-blue-500/5 hover:border-blue-500/20 hover:scale-[1.005]">
              <div className="h-11 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500/70"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500/70"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/70"></span>
                </div>
                <div className="w-1/2 h-6.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-lg text-[10px] text-slate-400 flex items-center justify-center font-mono select-none">
                  https://atlas-os.com/dashboard
                </div>
                <div className="w-12"></div>
              </div>
              <img 
                src="/atlas_dashboard_preview.png" 
                alt="Atlas OS Premium Dashboard Preview" 
                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-750"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Client Logos / Trusted By */}
        <section className="border-y border-slate-200/40 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm py-12 z-10 relative">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">TRUSTED BY FAST-GROWING COMPANIES NATIONWIDE</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all select-none">
                <span className="w-8 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">VL</span>
                <span className="font-bold text-slate-800 dark:text-white text-xs tracking-tight">Vertex Logistics</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all select-none">
                <span className="w-8 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">AR</span>
                <span className="font-bold text-slate-800 dark:text-white text-xs tracking-tight">Apex Retail Group</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all select-none">
                <span className="w-8 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">HW</span>
                <span className="font-bold text-slate-800 dark:text-white text-xs tracking-tight">Horizon Wholesale</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all select-none">
                <span className="w-8 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">NS</span>
                <span className="font-bold text-slate-800 dark:text-white text-xs tracking-tight">Nexus Services</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all select-none">
                <span className="w-8 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">CD</span>
                <span className="font-bold text-slate-800 dark:text-white text-xs tracking-tight">Core Distribution</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Walkthrough Demo (id=demo) */}
        <section id="demo" className="max-w-6xl mx-auto px-6 py-24 sm:py-32 scroll-mt-20">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Interactive Product Walkthrough</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
              Explore concrete database tables and system responses inside the Atlas operating schema in real-time.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            
            {/* Sidebar Buttons - WITHOUT emojis */}
            <div className="space-y-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-2 lg:gap-0 select-none">
              
              {/* CRM & Sales Button */}
              <button 
                onClick={() => setActiveTab('crm')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all shrink-0 lg:shrink cursor-pointer min-h-[44px] ${
                  activeTab === 'crm' 
                    ? 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <p className="font-bold text-xs uppercase tracking-wider">CRM &amp; Sales</p>
                </div>
                <p className="text-[10px] opacity-80 mt-1 hidden lg:block ml-6">Invoices &amp; clients ledger</p>
              </button>

              {/* Stock & Catalog Button */}
              <button 
                onClick={() => setActiveTab('stock')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all shrink-0 lg:shrink cursor-pointer min-h-[44px] ${
                  activeTab === 'stock' 
                    ? 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                  <p className="font-bold text-xs uppercase tracking-wider">Stock &amp; Catalog</p>
                </div>
                <p className="text-[10px] opacity-80 mt-1 hidden lg:block ml-6">Real-time quantity status</p>
              </button>

              {/* Accounting Ledger Button */}
              <button 
                onClick={() => setActiveTab('ledger')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all shrink-0 lg:shrink cursor-pointer min-h-[44px] ${
                  activeTab === 'ledger' 
                    ? 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <p className="font-bold text-xs uppercase tracking-wider">Accounting Ledger</p>
                </div>
                <p className="text-[10px] opacity-80 mt-1 hidden lg:block ml-6">Double-entry operations</p>
              </button>

              {/* AI Co-Pilot Console Button */}
              <button 
                onClick={() => setActiveTab('ai')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all shrink-0 lg:shrink cursor-pointer min-h-[44px] ${
                  activeTab === 'ai' 
                    ? 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                  <p className="font-bold text-xs uppercase tracking-wider">AI Co-Pilot Console</p>
                </div>
                <p className="text-[10px] opacity-80 mt-1 hidden lg:block ml-6">Autonomous queries</p>
              </button>
            </div>

            {/* Display Panel */}
            <div className="lg:col-span-3 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 md:p-6 flex flex-col justify-between min-h-[320px] w-full max-w-full overflow-x-auto select-none">
              
              {/* Tab 1 content: CRM & Sales */}
              {activeTab === 'crm' && (
                <div className="space-y-4 w-full animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Draft Invoice Ledger</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">4 Pending Approval</span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5 px-3 whitespace-nowrap">Invoice #</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Party (Client)</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Due Date</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-semibold text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="py-3 px-3 font-mono whitespace-nowrap text-blue-600 dark:text-blue-400">INV-2026-0012</td>
                        <td className="py-3 px-3 whitespace-nowrap">Vertex Logistics</td>
                        <td className="py-3 px-3 whitespace-nowrap">Jul 15, 2026</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">₹12,450.00</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20">UNPAID</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-mono whitespace-nowrap text-blue-600 dark:text-blue-400">INV-2026-0011</td>
                        <td className="py-3 px-3 whitespace-nowrap">Apex Retail Group</td>
                        <td className="py-3 px-3 whitespace-nowrap">Jul 09, 2026</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">₹48,200.00</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">PAID</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2 content: Stock & Catalog */}
              {activeTab === 'stock' && (
                <div className="space-y-4 w-full animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Inventory Safety Alerts</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20">2 Below Threshold</span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5 px-3 whitespace-nowrap">Item Name</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">SKU</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Stock Level</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Threshold</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-semibold text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="py-3 px-3 whitespace-nowrap">Premium Coffee Beans (1kg)</td>
                        <td className="py-3 px-3 font-mono whitespace-nowrap">COF-BEA-001</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap text-red-600 dark:text-red-400">12 bags</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">20 bags</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20">LOW STOCK</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 whitespace-nowrap">Double-Walled Espresso Glass</td>
                        <td className="py-3 px-3 font-mono whitespace-nowrap">GLA-ESP-002</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap text-emerald-600 dark:text-emerald-400">45 units</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">30 units</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">HEALTHY</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3 content: Accounting Ledger */}
              {activeTab === 'ledger' && (
                <div className="space-y-4 w-full animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Chart of Accounts</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">Balanced Trial Balance</span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5 px-3 whitespace-nowrap">Code</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Account Name</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Debit Balance</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Credit Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-semibold text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="py-3 px-3 font-mono whitespace-nowrap">1010</td>
                        <td className="py-3 px-3 whitespace-nowrap">Cash &amp; Bank Assets</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">Asset</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap font-mono">₹1,24,500.00</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap font-mono">₹0.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-mono whitespace-nowrap">4010</td>
                        <td className="py-3 px-3 whitespace-nowrap">Sales Revenues</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">Revenue</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap font-mono">₹0.00</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap font-mono text-emerald-600 dark:text-emerald-400">₹1,24,500.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 4 content: AI Co-Pilot Console */}
              {activeTab === 'ai' && (
                <div className="space-y-4 w-full animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Execution Logs &amp; Outbox</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">All Tasks Idle</span>
                  </div>
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 space-y-1.5 shadow-inner">
                    <p className="text-slate-500">{"[01:22:45] AI Agent initialized for Business Workspace."}</p>
                    <p className="text-slate-300">{"[01:22:46] Operation read database transaction logs: Querying sales reports."}</p>
                    <p className="text-amber-400">{"[01:22:47] POST /api/system/cron/outbox: 2 events queued. Retrying connection..."}</p>
                    <p className="text-emerald-400">{"[01:22:48] Success: 2 webhook deliveries dispatched successfully to https://api.vertexlogistics.com/events."}</p>
                  </div>
                </div>
              )}

              {/* Footer row of Walkthrough panel */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0 w-full">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Row-level context isolated (Tenant DB isolation verified)
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider">v1.2 // Production Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Suite Modules (id=features) */}
        <section id="features" className="px-6 py-24 sm:py-32 border-t border-slate-200/40 dark:border-slate-800/40 scroll-mt-20 bg-slate-50/30 dark:bg-slate-950/20 border-y">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Enterprise Suite Modules</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                Six cohesive business frameworks run in parallel to eliminate external API bridge dependencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Module 1 */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">Unified CRM &amp; Parties</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Centralize customers and suppliers directory with real-time transaction logs, credit balance tracking, and registration.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Integrated with Catalog</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right size-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">Sales &amp; Electronic Invoices</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Draft professional estimates, approve sales invoices, capture partial payments, and calculate taxes automatically.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Double-entry auto-post</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right size-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>

              {/* Module 3 */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">Inventory &amp; Reorder Levels</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Real-time stock ledger tracking. Automatically flag low-stock warnings when quantities drop below safety thresholds.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automatic SKU sync</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right size-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>

              {/* Module 4 */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">Purchasing &amp; Bills</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Process supplier bills, map incoming purchase orders, and automatically add stock entries to inventory records.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accounts payable ready</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right size-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>

              {/* Module 5 */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">Double-Entry Accounting Ledger</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Every billing action automatically records double-entry posts to assets, liabilities, and revenues, ensuring an audit-ready trail.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart of Accounts compliant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right size-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>

              {/* Module 6 */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">AI Co-Pilot &amp; Webhook Gateway</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Natural language database queries coupled with an event outbox queue that secures external webhooks and ledger logs.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Autonomous execution</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right size-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Technical Specs Section (id=specs) */}
        <section id="specs" className="max-w-6xl mx-auto px-6 py-24 sm:py-32 scroll-mt-20">
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="inline-flex items-center text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 py-1.5 px-4 rounded-full select-none">
                Architecture Spec
              </span>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl text-white">
                Ultra-high performance, built on PostgreSQL isolation levels.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                Atlas is designed for maximum speed and rock-solid consistency. The backend executes operations directly within database transactions, enforcing Serializable row guarantees to eliminate double-booking or inventory lag.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                <div>
                  <p className="text-3xl font-bold text-blue-400">100%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Tenant Isolated</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">&lt;200ms</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">API Response</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">Zero</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">SaaS Bridges</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">ISO</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">ISO 20022 Audit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (id=pricing) */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 sm:py-32 scroll-mt-20">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Straightforward, transparent pricing</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
              No surprises. Host it yourself or utilize our managed zero-maintenance database pools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border shadow-sm relative flex flex-col h-full justify-between p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Community / Starter</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
                    <span className="text-xs text-slate-400">/ forever</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Perfect for self-hosting, local testing, and individual operators.</p>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Full access to all 6 core modules</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Unlimited local transactions</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>PostgreSQL or SQLite database driver support</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Standard double-entry chart of accounts</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4">
                <Link href="/register" className="w-full block">
                  <button className="inline-flex items-center justify-center font-semibold text-sm transition-all select-none active:scale-[0.98] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 px-5 rounded-xl w-full min-h-[44px]">Get Started</button>
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="text-slate-900 dark:text-slate-100 rounded-2xl relative flex flex-col h-full justify-between p-6 overflow-hidden transition-all duration-300 hover:shadow-xl border-blue-600 border-2 bg-blue-500/[0.015] dark:bg-blue-900/[0.02] shadow-lg shadow-blue-500/5">
              <div className="space-y-6">
                <span className="absolute top-3 right-3 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Managed Cloud / Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹2,499</span>
                    <span className="text-xs text-slate-400">/ per month</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">For growing businesses requiring hosted infrastructure and cloud backups.</p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Hosted Neon PostgreSQL database pool</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Automated daily encrypted backups</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Up to 5 team members with RBAC</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>AI Co-Pilot natural query search</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4">
                <Link href="/register" className="w-full block">
                  <button className="inline-flex items-center justify-center font-semibold text-sm transition-all select-none active:scale-[0.98] bg-blue-600 hover:bg-blue-500 text-white shadow-sm h-11 px-5 rounded-xl w-full min-h-[44px]">Try Managed Pro</button>
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border shadow-sm relative flex flex-col h-full justify-between p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise / Scale</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹12,499</span>
                    <span className="text-xs text-slate-400">/ per month</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">For high-volume operations demanding custom configurations and SLA.</p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Unlimited workspaces &amp; members</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Dedicated DB pool properties</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Custom webhook execution outbox</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Priority Slack SLA response (2h)</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4">
                <Link href="/register" className="w-full block">
                  <button className="inline-flex items-center justify-center font-semibold text-sm transition-all select-none active:scale-[0.98] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 px-5 rounded-xl w-full min-h-[44px]">Talk to Sales</button>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ Accordions Section (id=faq) */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-24 sm:py-32 border-t border-slate-200/40 dark:border-slate-800/40 scroll-mt-20 bg-slate-50/10 dark:bg-slate-950/10">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Everything you need to know about the Atlas stack architecture.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-colors"
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none min-h-[44px]"
                  >
                    <span>{item.q}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`lucide lucide-chevron-down size-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200 border-t border-slate-100 dark:border-slate-800/40 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-16 px-6 md:px-12 select-none z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">A</span>
              <span className="font-bold text-slate-800 dark:text-white tracking-tight text-sm">Atlas OS</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              The high-performance, double-entry transactional operating system built for modern enterprise business workflows.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#demo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Interactive Demo</a></li>
              <li><a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Core Modules</a></li>
              <li><a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Developers</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Database Schema</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Self-Hosting</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security Audit</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Status</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">License (MIT)</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">SLA Agreement</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 Atlas Technology Systems. All rights reserved. Enterprise Ledger accounting core certified under ISO 20022 principles.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">System Status</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Support Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
