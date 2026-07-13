'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

export function ProductStockBarChart({ inventory = [] }) {
  if (!inventory || inventory.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-slate-100">No stock data available</div>;
  }

  // Filter out any zero-quantity if desired, or keep them to show out of stock.
  // We'll map them strictly to name and quantity.
  const data = inventory
    .map(item => ({
      name: item.product?.name || 'Unknown',
      sku: item.product?.sku || '',
      quantity: parseFloat(item.quantity || 0)
    }))
    .sort((a, b) => b.quantity - a.quantity) // Sort highest stock first
    .slice(0, 15); // Top 15 to avoid overcrowding

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`${value.toLocaleString()} units`, 'In Stock']}
            labelStyle={{ color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}
          />
          <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.quantity <= 0 ? '#ef4444' : '#6366f1'} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StockHealthPie({ inventory = [] }) {
  if (!inventory || inventory.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data</div>;
  }

  let healthy = 0;
  let lowStock = 0;
  let outOfStock = 0;

  inventory.forEach(item => {
    const qty = parseFloat(item.quantity || 0);
    const min = parseFloat(item.product?.minimumStock || item.minimumStock || 0);
    
    if (qty <= 0) {
      outOfStock++;
    } else if (min > 0 && qty <= min) {
      lowStock++;
    } else {
      healthy++;
    }
  });

  const data = [
    { name: 'Healthy', value: healthy, color: '#10b981' }, // Emerald
    { name: 'Low Stock', value: lowStock, color: '#f59e0b' }, // Amber
    { name: 'Out of Stock', value: outOfStock, color: '#ef4444' } // Red
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
            formatter={(value) => [`${value} Items`, 'Status']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
