import Link from 'next/link';

export const metadata = {
  title: 'Atlas BusinessOS — The Intelligent Business Operating System',
  description: 'Run your entire business from one unified command center. AI-powered analytics, automated workflows, and real-time inventory — all in one platform.',
};

const features = [
  { icon: '🧠', title: 'AI Co-Pilot', desc: 'Ask questions in plain English. Atlas autonomously queries your data, generates reports, and drafts actions.' },
  { icon: '⚡', title: 'Workflow Engine', desc: 'Build IFTTT automations hands-free. Auto-reorder stock, send payment alerts, and trigger emails autonomously.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Live revenue, profit margins, and inventory health — all computed in real-time from your transactional data.' },
  { icon: '🔒', title: 'Zero-Trust Security', desc: 'Row-level tenant isolation, JWT rotation, RBAC permissions, and encrypted sessions. Enterprise-grade by default.' },
  { icon: '📦', title: 'Inventory & Catalog', desc: 'Track stock movements, set reorder points, and manage your full product catalog with multi-unit support.' },
  { icon: '💰', title: 'Double-Entry Ledger', desc: 'Chart of Accounts, Journal Entries, Expenses, and full financial tracking built into the core.' },
];

const stats = [
  { value: '100%', label: 'Serverless' },
  { value: '$0', label: 'Infrastructure Cost' },
  { value: '<200ms', label: 'API Response Time' },
  { value: '∞', label: 'Scalability' },
];

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ─── Navigation ─── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Atlas OS
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-4 py-2">
            Sign In
          </Link>
          <Link href="/register" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 text-center px-6 pt-20 pb-28 max-w-4xl mx-auto">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 text-xs text-indigo-300 font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now Live — AI Co-Pilot & Workflow Engine
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          The Intelligent{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Business Operating System
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CRM, Inventory, Sales, Purchasing, Accounting, and AI — unified into one zero‑cost, serverless platform that runs your entire business autonomously.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/register" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/25 text-sm hover:scale-[1.02]">
            Create Your Free Account →
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-8 py-3.5 rounded-xl transition-all border border-slate-700 text-sm">
            Sign In
          </Link>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-6 backdrop-blur-sm">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Everything You Need. Nothing You Don't.</h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm">Six integrated modules that replace dozens of disconnected SaaS tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group">
              <div className="w-11 h-11 bg-slate-800 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600/10 transition-colors">{f.icon}</div>
              <h3 className="font-semibold text-white text-sm">{f.title}</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Footer ─── */}
      <section className="relative z-10 text-center px-6 pb-20">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-10">
          <h2 className="text-xl md:text-2xl font-bold">Ready to run your business on autopilot?</h2>
          <p className="text-slate-400 text-sm mt-3">Set up your workspace in under 60 seconds. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm hover:scale-[1.02]">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-800/50 py-8 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} Atlas BusinessOS. Built with ❤️ and zero infrastructure cost.</p>
      </footer>
    </div>
  );
}
