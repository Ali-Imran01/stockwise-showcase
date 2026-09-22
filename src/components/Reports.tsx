import { AlertTriangle, ClipboardList } from 'lucide-react'
import { auditLog, lowStockProducts } from '../data/mockData'

export function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Reports</h1>
        <p className="mt-1 font-medium text-slate-500">Audit trail and low-stock alerts across the system.</p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 px-1">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase">Low Stock Alerts</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lowStockProducts.map((product) => (
            <div key={product.id} className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="font-bold text-slate-900">{product.name}</p>
              <p className="mt-0.5 font-mono text-xs text-slate-400">{product.sku}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-black text-orange-600">{product.totalStock}</span>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Min {product.minStock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 px-1">
          <ClipboardList className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase">Audit Log</h3>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <ul className="divide-y divide-slate-50">
            {auditLog.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{entry.action}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{entry.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-bold text-slate-600">{entry.userName}</div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {new Date(entry.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
