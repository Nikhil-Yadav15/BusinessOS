'use client';

/**
 * Reusable DataTable component.
 * Props:
 *  - columns: [{ key, label, render? }]
 *  - data: Array of row objects
 *  - loading: boolean
 *  - emptyMessage: string
 */
export default function DataTable({ columns, data = [], loading = false, emptyMessage = 'No records found.' }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto touch-pan-x overscroll-x-contain pb-1">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-widest"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400 font-medium text-[13px]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4 text-slate-900 text-[13px] font-medium">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
