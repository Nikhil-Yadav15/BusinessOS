'use client';

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function DailyRevenueComposedChart({ invoices = [] }) {
  if (!invoices || invoices.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-slate-100">No invoice data available</div>;
  }

  // Aggregate by Date
  const aggregated = invoices.reduce((acc, inv) => {
    const dateStr = new Date(inv.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, revenue: 0, volume: 0 };
    }
    acc[dateStr].revenue += parseFloat(inv.totalAmount || 0);
    acc[dateStr].volume += 1;
    return acc;
  }, {});

  const data = Object.values(aggregated).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
          
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value, name) => [name === 'revenue' ? `₹${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Invoices Generated']}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} iconType="circle" />
          
          <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Line yAxisId="right" type="monotone" dataKey="volume" name="Invoice Volume" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InvoiceStatusPie({ invoices = [] }) {
  if (!invoices || invoices.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data</div>;
  }

  const counts = {
    'PAID': 0,
    'UNPAID': 0,
    'PARTIALLY_PAID': 0,
    'DRAFT': 0,
    'CANCELLED': 0
  };

  invoices.forEach(inv => {
    const status = inv.status || 'DRAFT';
    if (counts[status] !== undefined) {
      counts[status]++;
    }
  });

  const data = [
    { name: 'Paid', value: counts['PAID'], color: '#10b981' }, // Emerald
    { name: 'Unpaid', value: counts['UNPAID'], color: '#ef4444' }, // Red
    { name: 'Partial', value: counts['PARTIALLY_PAID'], color: '#f59e0b' }, // Amber
    { name: 'Draft', value: counts['DRAFT'], color: '#94a3b8' } // Slate
  ].filter(d => d.value > 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`${value} Invoices`, 'Status']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
