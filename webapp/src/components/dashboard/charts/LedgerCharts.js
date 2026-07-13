'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function CashflowBalanceBar({ journal = [] }) {
  if (!journal || journal.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-slate-100">No journal entries available</div>;
  }

  // Aggregate Credits (Income/Positive) and Debits (Expense/Negative) by Date
  const aggregated = journal.reduce((acc, entry) => {
    const dateStr = new Date(entry.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, credit: 0, debit: 0 };
    }
    if (entry.entryType === 'CREDIT' || parseFloat(entry.amount || 0) > 0) {
       acc[dateStr].credit += Math.abs(parseFloat(entry.amount || 0));
    } else {
       acc[dateStr].debit += Math.abs(parseFloat(entry.amount || 0));
    }
    return acc;
  }, {});

  const data = Object.values(aggregated).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`₹${value.toLocaleString()}`, null]}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} iconType="circle" />
          <Bar dataKey="credit" name="Credit (In)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Bar dataKey="debit" name="Debit (Out)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpenseCategoryPie({ expenses = [] }) {
  if (!expenses || expenses.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No expenses logged</div>;
  }

  // Aggregate total expenses by their category name or type
  const counts = expenses.reduce((acc, exp) => {
    // Assuming backend returns related account details, or we just map using category details
    const category = exp.account?.accountName || exp.title || 'Uncategorized';
    acc[category] = (acc[category] || 0) + parseFloat(exp.amount || 0);
    return acc;
  }, {});

  const data = Object.entries(counts)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]) // highest expenses first
    .slice(0, 7) // top 7 categories to prevent clutter
    .map(([name, value], idx) => {
      const colors = ['#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#64748b', '#ec4899'];
      return { name, value, color: colors[idx % colors.length] };
    });

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No valid expense data</div>;
  }

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
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
