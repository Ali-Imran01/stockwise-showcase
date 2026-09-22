import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { productById, stockMovements } from '../data/mockData'
import { Badge } from './ui/Badge'

type Filter = 'all' | 'IN' | 'OUT'

export function StockLedger() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? stockMovements : stockMovements.filter((m) => m.type === filter)),
    [filter],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Stock Ledger</h1>
        <p className="mt-1 max-w-2xl font-medium text-slate-500">
          Every change to available stock is a logged transaction — quantity on hand is <em>derived</em> from this
          ledger, never edited directly.
        </p>
      </div>

      <div className="flex gap-2">
        {(['all', 'IN', 'OUT'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide uppercase transition-colors ${
              filter === option ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {option === 'all' ? 'All' : `Stock ${option}`}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Product</th>
              <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-slate-400 uppercase">Quantity</th>
              <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-slate-400 uppercase">
                Balance After
              </th>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Reference</th>
              <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-slate-400 uppercase">
                Date / User
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {filtered.map((movement) => {
              const product = productById(movement.productId)
              return (
                <tr key={movement.id} className="hover:bg-slate-50/40">
                  <td className="px-6 py-4">
                    <Badge tone={movement.type === 'IN' ? 'green' : 'red'}>
                      {movement.type === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      Stock {movement.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{product?.name}</div>
                    <div className="font-mono text-xs text-slate-400">{product?.sku}</div>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.type === 'IN' ? '+' : '-'}
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {movement.balanceAfter} <span className="text-[10px] font-bold text-slate-400">{product?.unit}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 italic">{movement.reference}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-700">
                      {new Date(movement.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{movement.userName}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {filtered.map((movement) => {
          const product = productById(movement.productId)
          return (
            <div key={movement.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${movement.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {movement.type === 'IN' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div>
                  <h4 className="text-sm leading-tight font-bold text-slate-900">{product?.name}</h4>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{movement.reference}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {movement.type === 'IN' ? '+' : '-'}
                  {movement.quantity}
                </div>
                <div className="text-[10px] font-black tracking-tighter text-slate-400 uppercase">Bal. {movement.balanceAfter}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
