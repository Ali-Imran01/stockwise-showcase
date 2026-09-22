import { AlertCircle, ArrowDownRight, ArrowUpRight, Boxes, DollarSign, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { categoryValue, dashboardStats, lowStockProducts, productById, stockTrend } from '../data/mockData'
import { Badge } from './ui/Badge'

// Categorical slots 1 & 2 (blue, orange) from the validated default palette — fixed order, not cycled.
const COLOR_IN = '#2a78d6'
const COLOR_OUT = '#eb6834'

const statCards = [
  {
    label: 'Total Inventory Value',
    value: `RM ${dashboardStats.totalValue.toLocaleString()}`,
    icon: DollarSign,
    tone: 'text-blue-600 bg-blue-50',
  },
  {
    label: 'Active Products',
    value: dashboardStats.productCount.toString(),
    icon: Boxes,
    tone: 'text-slate-600 bg-slate-100',
  },
  {
    label: 'Low Stock Alerts',
    value: dashboardStats.lowStockCount.toString(),
    icon: AlertCircle,
    tone: 'text-orange-600 bg-orange-50',
  },
  {
    label: 'Movements (7 days)',
    value: stockTrend.reduce((sum, day) => sum + day.in + day.out, 0).toString(),
    icon: TrendingUp,
    tone: 'text-green-600 bg-green-50',
  },
]

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">System Overview</h1>
        <p className="mt-1 font-medium text-slate-500">Real-time status of the inventory ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
              <card.icon size={20} />
            </div>
            <p className="mt-5 text-sm font-bold text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-sm font-black tracking-widest text-slate-900 uppercase">Movement Velocity</h3>
          <p className="text-xs font-bold text-slate-400 uppercase">7-Day Stock In / Out</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockTrend} margin={{ left: -16 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_IN} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={COLOR_IN} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_OUT} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={COLOR_OUT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e0d9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#898781' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e1e0d9', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Area type="monotone" dataKey="in" name="Stock In" stroke={COLOR_IN} strokeWidth={2} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="out" name="Stock Out" stroke={COLOR_OUT} strokeWidth={2} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-sm font-black tracking-widest text-slate-900 uppercase">Inventory Value</h3>
          <p className="text-xs font-bold text-slate-400 uppercase">By Category</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryValue} margin={{ left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e0d9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#898781' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e1e0d9', fontSize: 12 }}
                  formatter={(value) => [`RM ${Number(value).toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" name="Value" fill="#2a78d6" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-50 px-6 py-4">
            <h3 className="font-bold text-slate-900">Recent Movements</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold tracking-widest text-slate-400 uppercase">Product</th>
                <th className="px-6 py-3 text-xs font-bold tracking-widest text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold tracking-widest text-slate-400 uppercase">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dashboardStats.recentMovements.map((movement) => {
                const product = productById(movement.productId)
                return (
                  <tr key={movement.id}>
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-900">{product?.name}</div>
                      <div className="font-mono text-xs text-slate-400">{product?.sku}</div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={movement.type === 'IN' ? 'green' : 'red'}>
                        {movement.type === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        Stock {movement.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right font-black text-slate-900">{movement.quantity}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <h3 className="px-1 text-xs font-black tracking-widest text-slate-900 uppercase">Depleted Inventory</h3>
          {lowStockProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-900">{product.name}</p>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Min required: {product.minStock}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                {product.totalStock}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
