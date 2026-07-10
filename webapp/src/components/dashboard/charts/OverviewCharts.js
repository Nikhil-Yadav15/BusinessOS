'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, ComboBox
} from 'recharts';

// 1. Executive Sales Trend (Area Chart)
export function ExecutiveSalesTrend({ invoices = [] }) {
  if (!invoices || invoices.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No sales data available</div>;
  }

  // Aggregate by date (last 7 days logic could go here, but for now we aggregate whatever is fetched)
  const aggregated = invoices.reduce((acc, inv) => {
    const date = new Date(inv.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + parseFloat(inv.totalAmount || 0);
    return acc;
  }, {});

  const data = Object.keys(aggregated).map(date => ({
    date,
    revenue: aggregated[date],
  }));

  // Sort by date naive
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            labelStyle={{ color: '#64748b', fontWeight: '500', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Top Udhaar Alert (Bar Chart)
export function TopUdhaarAlert({ parties = [] }) {
  // Filter for customers with Udhaar (positive balance indicating they owe money)
  const debtors = parties
    .filter(p => parseFloat(p.openingBalance || 0) > 0)
    .sort((a, b) => parseFloat(b.openingBalance) - parseFloat(a.openingBalance))
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      amount: parseFloat(p.openingBalance)
    }));

  if (debtors.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No pending Udhaar</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={debtors} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} width={80} />
          <Tooltip 
             cursor={{ fill: '#f8fafc' }}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             formatter={(value) => [`₹${value.toLocaleString()}`, 'Pending']}
          />
          <Bar dataKey="amount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Critical Stock Alert (Bar Chart)
export function CriticalStockAlert({ inventory = [] }) {
  // We want to highlight items where quantity <= minimumStock (or close to it)
  // For safety, assume minimumStock is available either on the inventory row or nested product row.
  const critical = inventory
    .filter(item => {
       const qty = parseFloat(item.quantity || 0);
       const min = parseFloat(item.product?.minimumStock || item.minimumStock || 0);
       return min > 0 && qty <= min + 10; // Low stock threshold logic
    })
    .sort((a, b) => parseFloat(a.quantity) - parseFloat(b.quantity))
    .slice(0, 5)
    .map(item => ({
      name: item.product?.name || 'Unknown Item',
      qty: parseFloat(item.quantity || 0),
      min: parseFloat(item.product?.minimumStock || item.minimumStock || 0)
    }));

  if (critical.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Stock levels healthy</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={critical} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} 
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
             cursor={{ fill: '#f8fafc' }}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
          <Bar dataKey="qty" name="Current Stock" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="min" name="Min Required" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
