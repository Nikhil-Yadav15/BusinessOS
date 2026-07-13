'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function DailyPurchaseTrendArea({ purchases = [] }) {
  if (!purchases || purchases.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-slate-100">No purchase data available</div>;
  }

  // Aggregate by Date
  const aggregated = purchases.reduce((acc, p) => {
    const dateStr = new Date(p.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, amount: 0 };
    }
    acc[dateStr].amount += parseFloat(p.totalAmount || 0);
    return acc;
  }, {});

  const data = Object.values(aggregated).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
          
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
          
          <Tooltip 
            cursor={{ stroke: '#f8fafc', strokeWidth: 2 }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost Amount']}
          />
          <Area type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PurchaseStatusPie({ purchases = [] }) {
  if (!purchases || purchases.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data</div>;
  }

  const counts = {
    'PAID': 0,
    'UNPAID': 0,
    'PARTIALLY_PAID': 0,
    'DRAFT': 0,
    'CANCELLED': 0
  };

  purchases.forEach(p => {
    const status = p.paymentStatus || 'DRAFT';
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
    <div className="h-[240px] sm:h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="50%"
            outerRadius="72%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`${value} Bills`, 'Status']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
