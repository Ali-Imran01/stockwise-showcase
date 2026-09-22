import { Box, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { categories, categoryById, products } from '../data/mockData'

export function Products() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [search, categoryFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Product Catalog</h1>
        <p className="mt-1 font-medium text-slate-500">Browse inventory items and current stock levels.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU or name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border-none bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-2xl border-none bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-600 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Product</th>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Pricing</th>
              <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Stock Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((product) => {
              const lowStock = product.totalStock <= product.minStock
              const fillPct = Math.min((product.totalStock / (product.minStock * 2)) * 100, 100)
              return (
                <tr key={product.id} className="hover:bg-slate-50/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Box size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="font-mono text-xs font-bold text-slate-400">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {categoryById(product.categoryId)?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">RM {product.sellPrice}</div>
                    <div className="text-[10px] font-black tracking-tighter text-slate-400 uppercase">Cost RM {product.costPrice}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${lowStock ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${fillPct}%` }} />
                      </div>
                      <span className={`text-sm font-black ${lowStock ? 'text-orange-600' : 'text-slate-900'}`}>
                        {product.totalStock} <span className="text-[10px] font-bold text-slate-400">{product.unit}</span>
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {filtered.map((product) => {
          const lowStock = product.totalStock <= product.minStock
          return (
            <div key={product.id} className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              {lowStock && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-orange-500 px-3 py-1 text-[10px] font-black tracking-tighter text-white uppercase">
                  Low Stock
                </div>
              )}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="leading-tight font-bold text-slate-900">{product.name}</h4>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">RM {product.sellPrice}</div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{categoryById(product.categoryId)?.name}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50/50 p-3">
                <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">Stock Level</span>
                <span className={`text-sm font-black ${lowStock ? 'text-orange-600' : 'text-slate-900'}`}>
                  {product.totalStock} {product.unit}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center">
          <p className="font-bold text-slate-900">No products match your search</p>
          <p className="mt-1 text-sm text-slate-500">Try a different name, SKU, or category.</p>
        </div>
      )}
    </div>
  )
}
