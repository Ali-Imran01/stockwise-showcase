// In-memory dummy database for the StockWise showcase. Everything here is invented for demonstration;
// nothing reflects a real business. State lives in module scope, so it resets on every page refresh.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Row = Record<string, any>

const DAY = 86_400_000
const now = Date.now()
const iso = (msAgo: number) => new Date(now - msAgo).toISOString()

// Small deterministic PRNG so the seeded history looks the same on every load.
let seed = 20260926
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

const stamp = (created_at: string) => ({ created_at, updated_at: created_at })

const units: Row[] = ['pcs', 'set', 'pair', 'box', 'roll'].map((name, i) => ({ id: i + 1, name, ...stamp(iso(120 * DAY)) }))
const unitId = (name: string) => units.find((u) => u.name === name)!.id

const categories: Row[] = [
  { id: 1, name: 'Power Tools', description: 'Corded and cordless power tools for workshops and job sites.' },
  { id: 2, name: 'Hand Tools', description: 'Hammers, wrenches, screwdrivers and other manual tools.' },
  { id: 3, name: 'Electrical', description: 'Cabling, breakers, lighting and electrical accessories.' },
  { id: 4, name: 'Safety Equipment', description: 'Protective gear: helmets, goggles, gloves and more.' },
].map((c) => ({ ...c, ...stamp(iso(120 * DAY)) }))

const suppliers: Row[] = [
  { id: 1, name: 'Northwind Tool Supply', phone: '+1 555 0101', email: 'orders@northwind.example', address: '12 Foundry Lane, Springfield' },
  { id: 2, name: 'Bright Electric Co.', phone: '+1 555 0134', email: 'sales@brightelectric.example', address: '88 Volt Street, Riverton' },
  { id: 3, name: 'SafeWorks Distribution', phone: '+1 555 0177', email: 'hello@safeworks.example', address: '5 Harbor Road, Lakeview' },
  { id: 4, name: 'IronForge Hardware', phone: '+1 555 0192', email: 'trade@ironforge.example', address: '301 Anvil Avenue, Ridgeway' },
  { id: 5, name: 'Pacific Fasteners', phone: '+1 555 0218', email: 'info@pacificfasteners.example', address: '47 Bolt Court, Bayside' },
].map((s) => ({ ...s, ...stamp(iso(100 * DAY)) }))

const warehouses: Row[] = [
  { id: 1, name: 'Main Warehouse', location: 'Springfield — Dock A', is_active: true },
  { id: 2, name: 'East Distribution Center', location: 'Riverton — Building 3', is_active: true },
  { id: 3, name: 'Retail Backroom', location: 'Downtown Store', is_active: true },
].map((w) => ({ ...w, ...stamp(iso(100 * DAY)) }))

const users: Row[] = [
  { id: 1, name: 'Alex Morgan', email: 'admin@stockwise.demo', role: 'admin', password: 'password' },
  { id: 2, name: 'Jamie Lee', email: 'staff@stockwise.demo', role: 'staff', password: 'password' },
  { id: 3, name: 'Sam Rivera', email: 'viewer@stockwise.demo', role: 'viewer', password: 'password' },
  { id: 4, name: 'Taylor Brooks', email: 'taylor@stockwise.demo', role: 'staff', password: 'password' },
].map((u) => ({ ...u, email_verified_at: null, ...stamp(iso(90 * DAY)) }))

// [sku, name, category, unit, cost, sell, min stock, target stock]
const productSeed: [string, string, number, string, number, number, number, number][] = [
  ['PT-1042', 'Cordless Drill Driver 18V', 1, 'pcs', 185, 269, 15, 42],
  ['PT-1187', 'Angle Grinder 4.5"', 1, 'pcs', 96, 149, 10, 8],
  ['PT-1290', 'Circular Saw 7-1/4"', 1, 'pcs', 210, 315, 8, 19],
  ['HT-0512', 'Claw Hammer 16oz', 2, 'pcs', 14, 24, 30, 130],
  ['HT-0630', 'Adjustable Wrench Set (3pc)', 2, 'set', 32, 55, 20, 26],
  ['HT-0744', 'Screwdriver Set 6-in-1', 2, 'set', 18, 32, 25, 74],
  ['EL-2201', 'Extension Cord 10m Heavy Duty', 3, 'pcs', 28, 46, 12, 5],
  ['EL-2305', 'MCB Circuit Breaker 32A', 3, 'pcs', 9, 16, 50, 210],
  ['EL-2410', 'LED Work Light 50W', 3, 'pcs', 45, 72, 15, 33],
  ['SF-3001', 'Safety Helmet (ANSI Rated)', 4, 'pcs', 12, 22, 20, 88],
  ['SF-3115', 'Safety Goggles Anti-Fog', 4, 'pcs', 6, 12, 25, 11],
  ['SF-3220', 'Cut-Resistant Gloves (Pair)', 4, 'pair', 8, 15, 20, 60],
]

const products: Row[] = productSeed.map(([sku, name, category_id, unit, cost_price, sell_price, min_stock], i) => ({
  id: i + 1,
  sku,
  name,
  category_id,
  unit_id: unitId(unit),
  cost_price,
  sell_price,
  min_stock,
  ...stamp(iso(110 * DAY)),
}))

const movements: Row[] = []
let movementId = 1
const addMovement = (product_id: number, type: 'IN' | 'OUT', quantity: number, msAgo: number, warehouse_id: number, user_id: number, reference: string) => {
  movements.push({ id: movementId++, product_id, warehouse_id, type, quantity, reference, user_id, ...stamp(iso(msAgo)) })
}

productSeed.forEach(([, , , , , , , target], i) => {
  const pid = i + 1
  // Recent activity over the last 14 days (drives the 7-day trend chart and the ledger).
  // OUTs ship from the main warehouse and INs are capped, so no warehouse's balance goes negative.
  let net = 0
  let ins = 0
  const recent = randInt(4, 6)
  for (let n = 0; n < recent; n++) {
    const isIn = ins < 2 && rand() < 0.35
    const qty = Math.max(1, Math.round(target * (isIn ? 0.2 : 0.25) * rand()))
    ins += isIn ? 1 : 0
    net += isIn ? qty : -qty
    addMovement(
      pid,
      isIn ? 'IN' : 'OUT',
      qty,
      Math.round(rand() * 14 * DAY) + 3_600_000,
      isIn ? randInt(1, 3) : 1,
      randInt(1, 4) === 3 ? 4 : randInt(1, 2),
      isIn ? `PO-${randInt(1000, 1999)}` : `SO-${randInt(5000, 5999)}`,
    )
  }
  // Opening stock so the net total lands on the target level, split across the three warehouses.
  const opening = Math.max(1, target - net)
  const east = Math.round(target * 0.3)
  const retail = Math.round(target * 0.1)
  const split = opening - east - retail >= 1
  const openingRef = () => `PO-${randInt(100, 999)}`
  addMovement(pid, 'IN', split ? opening - east - retail : opening, randInt(30, 75) * DAY, 1, 1, openingRef())
  if (split && east) addMovement(pid, 'IN', east, randInt(30, 75) * DAY, 2, 1, openingRef())
  if (split && retail) addMovement(pid, 'IN', retail, randInt(30, 75) * DAY, 3, 1, openingRef())
})
movements.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
movements.forEach((m, i) => (m.id = i + 1))
movementId = movements.length + 1

const auditLogs: Row[] = []
let auditId = 1

export const db = { units, categories, suppliers, warehouses, users, products, movements, auditLogs }

export const nextId = (rows: Row[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1

export const withoutPassword = (user: Row) => {
  const { password: _password, ...rest } = user
  void _password
  return rest
}

export function audit(action: string, payload: Row | null, userId: number | null) {
  auditLogs.push({ id: auditId++, user_id: userId, action, payload, ...stamp(new Date().toISOString()) })
}

// Seed a short audit trail from the seeded movements so the audit page isn't empty on first load.
movements
  .slice(-12)
  .forEach((m) => auditLogs.push({ id: auditId++, user_id: m.user_id, action: m.type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT', payload: { ...m }, created_at: m.created_at, updated_at: m.created_at }))
products
  .slice(0, 3)
  .forEach((p, i) => auditLogs.push({ id: auditId++, user_id: 1, action: 'PRODUCT_CREATED', payload: { ...p }, ...stamp(iso((40 - i) * DAY)) }))
auditLogs.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
auditLogs.forEach((l, i) => (l.id = i + 1))
auditId = auditLogs.length + 1

export const stockOf = (productId: number) =>
  db.movements.reduce((sum, m) => (m.product_id === productId ? sum + (m.type === 'IN' ? m.quantity : -m.quantity) : sum), 0)
