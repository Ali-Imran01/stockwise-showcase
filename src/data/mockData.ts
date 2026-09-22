// All content for this demo lives here — no backend, no persistence. Every record below is
// invented for demonstration; nothing here reflects a real business or real inventory.

export interface Category {
  id: string
  name: string
}

export const categories: Category[] = [
  { id: 'power-tools', name: 'Power Tools' },
  { id: 'hand-tools', name: 'Hand Tools' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'safety', name: 'Safety Equipment' },
]

export interface Product {
  id: string
  sku: string
  name: string
  categoryId: string
  unit: string
  costPrice: number
  sellPrice: number
  totalStock: number
  minStock: number
}

export const products: Product[] = [
  { id: 'p1', sku: 'PT-1042', name: 'Cordless Drill Driver 18V', categoryId: 'power-tools', unit: 'pcs', costPrice: 185, sellPrice: 269, totalStock: 42, minStock: 15 },
  { id: 'p2', sku: 'PT-1187', name: 'Angle Grinder 4.5"', categoryId: 'power-tools', unit: 'pcs', costPrice: 96, sellPrice: 149, totalStock: 8, minStock: 10 },
  { id: 'p3', sku: 'PT-1290', name: 'Circular Saw 7-1/4"', categoryId: 'power-tools', unit: 'pcs', costPrice: 210, sellPrice: 315, totalStock: 19, minStock: 8 },
  { id: 'p4', sku: 'HT-0512', name: 'Claw Hammer 16oz', categoryId: 'hand-tools', unit: 'pcs', costPrice: 14, sellPrice: 24, totalStock: 130, minStock: 30 },
  { id: 'p5', sku: 'HT-0630', name: 'Adjustable Wrench Set (3pc)', categoryId: 'hand-tools', unit: 'set', costPrice: 32, sellPrice: 55, totalStock: 26, minStock: 20 },
  { id: 'p6', sku: 'HT-0744', name: 'Screwdriver Set 6-in-1', categoryId: 'hand-tools', unit: 'set', costPrice: 18, sellPrice: 32, totalStock: 74, minStock: 25 },
  { id: 'p7', sku: 'EL-2201', name: 'Extension Cord 10m Heavy Duty', categoryId: 'electrical', unit: 'pcs', costPrice: 28, sellPrice: 46, totalStock: 5, minStock: 12 },
  { id: 'p8', sku: 'EL-2305', name: 'MCB Circuit Breaker 32A', categoryId: 'electrical', unit: 'pcs', costPrice: 9, sellPrice: 16, totalStock: 210, minStock: 50 },
  { id: 'p9', sku: 'EL-2410', name: 'LED Work Light 50W', categoryId: 'electrical', unit: 'pcs', costPrice: 45, sellPrice: 72, totalStock: 33, minStock: 15 },
  { id: 'p10', sku: 'SF-3001', name: 'Safety Helmet (ANSI Rated)', categoryId: 'safety', unit: 'pcs', costPrice: 12, sellPrice: 22, totalStock: 88, minStock: 20 },
  { id: 'p11', sku: 'SF-3115', name: 'Safety Goggles Anti-Fog', categoryId: 'safety', unit: 'pcs', costPrice: 6, sellPrice: 12, totalStock: 11, minStock: 25 },
  { id: 'p12', sku: 'SF-3220', name: 'Cut-Resistant Gloves (Pair)', categoryId: 'safety', unit: 'pair', costPrice: 8, sellPrice: 15, totalStock: 60, minStock: 20 },
]

export function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function categoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export const lowStockProducts = products.filter((p) => p.totalStock <= p.minStock)

export interface StockMovement {
  id: string
  type: 'IN' | 'OUT'
  productId: string
  quantity: number
  balanceAfter: number
  reference: string
  userName: string
  createdAt: string // ISO
}

export const stockMovements: StockMovement[] = [
  { id: 'm1', type: 'IN', productId: 'p1', quantity: 20, balanceAfter: 42, reference: 'PO-8821', userName: 'Nurul A.', createdAt: '2026-09-21T09:14:00+08:00' },
  { id: 'm2', type: 'OUT', productId: 'p2', quantity: 6, balanceAfter: 8, reference: 'SO-4410', userName: 'Haziq R.', createdAt: '2026-09-21T11:02:00+08:00' },
  { id: 'm3', type: 'OUT', productId: 'p7', quantity: 9, balanceAfter: 5, reference: 'SO-4411', userName: 'Haziq R.', createdAt: '2026-09-20T15:40:00+08:00' },
  { id: 'm4', type: 'IN', productId: 'p8', quantity: 100, balanceAfter: 210, reference: 'PO-8819', userName: 'Nurul A.', createdAt: '2026-09-20T10:05:00+08:00' },
  { id: 'm5', type: 'OUT', productId: 'p11', quantity: 14, balanceAfter: 11, reference: 'SO-4405', userName: 'Wei Liang', createdAt: '2026-09-19T14:22:00+08:00' },
  { id: 'm6', type: 'IN', productId: 'p6', quantity: 40, balanceAfter: 74, reference: 'PO-8802', userName: 'Nurul A.', createdAt: '2026-09-19T09:50:00+08:00' },
  { id: 'm7', type: 'OUT', productId: 'p4', quantity: 25, balanceAfter: 130, reference: 'SO-4390', userName: 'Wei Liang', createdAt: '2026-09-18T16:12:00+08:00' },
  { id: 'm8', type: 'IN', productId: 'p3', quantity: 12, balanceAfter: 19, reference: 'PO-8790', userName: 'Nurul A.', createdAt: '2026-09-18T08:30:00+08:00' },
  { id: 'm9', type: 'OUT', productId: 'p9', quantity: 7, balanceAfter: 33, reference: 'SO-4372', userName: 'Haziq R.', createdAt: '2026-09-17T13:05:00+08:00' },
  { id: 'm10', type: 'IN', productId: 'p10', quantity: 30, balanceAfter: 88, reference: 'PO-8765', userName: 'Nurul A.', createdAt: '2026-09-16T10:45:00+08:00' },
]

export interface AuditLogEntry {
  id: string
  userName: string
  action: string
  detail: string
  createdAt: string
}

export const auditLog: AuditLogEntry[] = [
  { id: 'a1', userName: 'Nurul A.', action: 'Stock received', detail: 'Logged PO-8821 — Cordless Drill Driver 18V, +20 units', createdAt: '2026-09-21T09:14:00+08:00' },
  { id: 'a2', userName: 'Haziq R.', action: 'Stock issued', detail: 'Fulfilled SO-4410 — Angle Grinder 4.5", -6 units', createdAt: '2026-09-21T11:02:00+08:00' },
  { id: 'a3', userName: 'Admin', action: 'Low stock threshold changed', detail: 'Safety Goggles Anti-Fog min stock 15 → 25', createdAt: '2026-09-20T17:30:00+08:00' },
  { id: 'a4', userName: 'Wei Liang', action: 'Product updated', detail: 'Claw Hammer 16oz — sell price RM22 → RM24', createdAt: '2026-09-19T12:10:00+08:00' },
  { id: 'a5', userName: 'Admin', action: 'User role changed', detail: "Wei Liang's role: Staff → Staff (Warehouse B)", createdAt: '2026-09-18T09:00:00+08:00' },
  { id: 'a6', userName: 'Nurul A.', action: 'Product added', detail: 'New product LED Work Light 50W (EL-2410)', createdAt: '2026-09-15T14:20:00+08:00' },
]

/** 7-day stock movement volume, for the trend chart. */
export const stockTrend = [
  { date: '09-15', in: 30, out: 10 },
  { date: '09-16', in: 30, out: 4 },
  { date: '09-17', in: 0, out: 7 },
  { date: '09-18', in: 12, out: 25 },
  { date: '09-19', in: 40, out: 14 },
  { date: '09-20', in: 100, out: 9 },
  { date: '09-21', in: 20, out: 6 },
]

/** Inventory value by category, for the distribution chart. */
export const categoryValue = categories.map((category) => {
  const value = products
    .filter((p) => p.categoryId === category.id)
    .reduce((sum, p) => sum + p.costPrice * p.totalStock, 0)
  return { name: category.name, value }
})

export const dashboardStats = {
  totalValue: products.reduce((sum, p) => sum + p.costPrice * p.totalStock, 0),
  productCount: products.length,
  lowStockCount: lowStockProducts.length,
  recentMovements: stockMovements.slice(0, 5),
}
