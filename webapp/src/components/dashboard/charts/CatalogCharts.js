'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

export function ProfitMarginBarChart({ products = [] }) {
  if (!products || products.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-slate-100">No product data available</div>;
  }

  // Calculate profit margin: Selling Price - Purchase Price
  const data = products
    .filter(p => parseFloat(p.sellingPrice || 0) > 0 && parseFloat(p.purchasePrice || 0) > 0)
    .map(p => {
      const sp = parseFloat(p.sellingPrice);
      const pp = parseFloat(p.purchasePrice);
      const margin = sp - pp;
      return {
        name: p.name,
        profitMargin: margin > 0 ? margin : 0, // Ignoring negative margins for this specific highlight chart
        sellingPrice: sp,
        purchasePrice: pp
      };
    })
    .sort((a, b) => b.profitMargin - a.profitMargin)
    .slice(0, 15);

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">Need both Purchase and Selling prices to calculate margin</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Profit Margin/Unit']}
            labelStyle={{ color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}
          />
          <Bar dataKey="profitMargin" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CatalogDistributionPie({ products = [] }) {
  if (!products || products.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data</div>;
  }

  const counts = {
    'PHYSICAL': 0,
    'SERVICE': 0,
    'DIGITAL': 0
  };

  products.forEach(p => {
    const type = p.type || 'PHYSICAL';
    if (counts[type] !== undefined) {
      counts[type]++;
    }
  });

  const data = [
    { name: 'Physical Goods', value: counts['PHYSICAL'], color: '#3b82f6' }, // Blue
    { name: 'Services', value: counts['SERVICE'], color: '#8b5cf6' }, // Purple
    { name: 'Digital', value: counts['DIGITAL'], color: '#ec4899' } // Pink
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
            formatter={(value) => [`${value} Items`, 'Type']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
