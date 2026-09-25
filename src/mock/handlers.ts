// Mock implementation of the Laravel API in routes/api.php. Each handler mirrors the matching
// controller's request validation and response shape so the copied UI code needs no changes.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { audit, db, nextId, stockOf, withoutPassword, type Row } from './db'
import { receiptPdf, valuationPdf } from './pdf'

export interface Req {
  method: string
  path: string
  params: Row
  body: any
  user: Row | null
}
export interface Res {
  status: number
  data: any
}

const ok = (data: any, status = 200): Res => ({ status, data })
const fail = (message: string, status: number): Res => ({ status, data: { message } })
const invalid = (errors: Record<string, string[]>): Res => ({
  status: 422,
  data: { message: Object.values(errors)[0]?.[0] ?? 'The given data was invalid.', errors },
})

const blank = (v: any) => v === undefined || v === null || v === ''
const num = (v: any) => (blank(v) ? NaN : Number(v))

/** Returns a 422 response when any required field is empty. */
function required(body: Row, fields: string[]): Res | null {
  const errors: Record<string, string[]> = {}
  fields.forEach((f) => {
    if (blank(body[f])) errors[f] = [`The ${f.replace(/_/g, ' ')} field is required.`]
  })
  return Object.keys(errors).length ? invalid(errors) : null
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const withRelations = (p: Row): Row => ({
  ...p,
  category: db.categories.find((c) => c.id === p.category_id) ?? null,
  unit: db.units.find((u) => u.id === p.unit_id) ?? null,
  total_stock: stockOf(p.id),
})

const withMovementRelations = (m: Row) => ({
  ...m,
  product: db.products.find((p) => p.id === m.product_id) ?? null,
  user: db.users.find((u) => u.id === m.user_id) ? withoutPassword(db.users.find((u) => u.id === m.user_id)!) : null,
  warehouse: db.warehouses.find((w) => w.id === m.warehouse_id) ?? null,
})

const paginate = (rows: Row[], perPage: number, page = 1) => ({
  current_page: page,
  data: rows.slice((page - 1) * perPage, page * perPage),
  per_page: perPage,
  total: rows.length,
  last_page: Math.max(1, Math.ceil(rows.length / perPage)),
})

const latestFirst = (rows: Row[]) => [...rows].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at) || b.id - a.id)
const stamped = (row: Row): Row => ({ ...row, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })

// ---------------------------------------------------------------------------------------------
// Generic CRUD used by categories, units, suppliers and warehouses.
// ---------------------------------------------------------------------------------------------
interface CrudOptions {
  rows: Row[]
  requiredFields: string[]
  fields: string[]
  auditPrefix?: string
  validate?: (body: Row, existing?: Row) => Res | null
  deleted?: (id: number) => Res | null
}

function crud(id: number | null, req: Req, o: CrudOptions): Res {
  const { rows } = o
  const record = id === null ? null : rows.find((r) => r.id === id)
  if (id !== null && !record) return fail('No query results for model.', 404)

  if (req.method === 'GET') return ok(record ?? rows)

  if (req.method === 'DELETE') {
    const blocked = o.deleted?.(id!)
    if (blocked) return blocked
    rows.splice(rows.indexOf(record!), 1)
    if (o.auditPrefix) audit(`${o.auditPrefix}_DELETED`, record!, req.user?.id ?? null)
    return ok({ message: 'Deleted successfully' })
  }

  const body = req.body ?? {}
  const missing = required(body, record ? o.requiredFields.filter((f) => f in body) : o.requiredFields)
  if (missing) return missing
  const custom = o.validate?.(body, record ?? undefined)
  if (custom) return custom
  const picked: Row = {}
  o.fields.forEach((f) => {
    if (f in body) picked[f] = body[f]
  })

  if (record) {
    Object.assign(record, picked, { updated_at: new Date().toISOString() })
    if (o.auditPrefix) audit(`${o.auditPrefix}_UPDATED`, record, req.user?.id ?? null)
    return ok(record)
  }
  const created = stamped({ id: nextId(rows), ...picked })
  rows.push(created)
  if (o.auditPrefix) audit(`${o.auditPrefix}_CREATED`, created, req.user?.id ?? null)
  return ok(created, 201)
}

// ---------------------------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------------------------
async function route(req: Req): Promise<Res> {
  const { method, path, params } = req
  let m: RegExpMatchArray | null

  if (path === '/login' && method === 'POST') {
    const body = req.body ?? {}
    const missing = required(body, ['email', 'password'])
    if (missing) return missing
    const user = db.users.find((u) => u.email === String(body.email).toLowerCase() && u.password === body.password)
    if (!user) return invalid({ email: ['The provided credentials are incorrect.'] })
    return ok({ token: `demo-token-${user.id}`, user: withoutPassword(user) })
  }

  if (!req.user) return fail('Unauthenticated.', 401)
  const uid = req.user.id

  if (path === '/me' && method === 'GET') return ok(withoutPassword(req.user))
  if (path === '/logout' && method === 'POST') return ok({ message: 'Logged out successfully' })

  // --- categories / units / suppliers / warehouses -------------------------------------------
  if ((m = path.match(/^\/categories(?:\/(\d+))?$/)))
    return crud(m[1] ? +m[1] : null, req, { rows: db.categories, requiredFields: ['name'], fields: ['name', 'description'], auditPrefix: 'CATEGORY', deleted: (id) => (db.products.some((p) => p.category_id === id) ? fail('Cannot delete a category that still has products.', 409) : null) })

  if ((m = path.match(/^\/units(?:\/(\d+))?$/)))
    return crud(m[1] ? +m[1] : null, req, {
      rows: db.units,
      requiredFields: ['name'],
      fields: ['name'],
      auditPrefix: 'UNIT',
      deleted: (id) => (db.products.some((p) => p.unit_id === id) ? fail('Cannot delete a unit that is used by products.', 409) : null),
      validate: (body, existing) =>
        db.units.some((u) => u.name.toLowerCase() === String(body.name).toLowerCase() && u.id !== existing?.id)
          ? invalid({ name: ['The name has already been taken.'] })
          : null,
    })

  if ((m = path.match(/^\/suppliers(?:\/(\d+))?$/)))
    return crud(m[1] ? +m[1] : null, req, {
      rows: db.suppliers,
      requiredFields: ['name'],
      fields: ['name', 'phone', 'email', 'address'],
      validate: (body) => (body.email && !isEmail(body.email) ? invalid({ email: ['The email field must be a valid email address.'] }) : null),
    })

  if ((m = path.match(/^\/warehouses(?:\/(\d+))?$/)))
    return crud(m[1] ? +m[1] : null, req, { rows: db.warehouses, requiredFields: ['name'], fields: ['name', 'location', 'is_active'], deleted: (id) => (db.movements.some((mv) => mv.warehouse_id === id) ? fail('Cannot delete a warehouse that has stock movements.', 409) : null) })

  // --- products ------------------------------------------------------------------------------
  if (path === '/products/low-stock' && method === 'GET')
    return ok(db.products.map(withRelations).filter((p) => p.total_stock <= p.min_stock))

  if ((m = path.match(/^\/products(?:\/(\d+))?$/))) {
    const id = m[1] ? +m[1] : null
    const product = id === null ? null : db.products.find((p) => p.id === id)
    if (id !== null && !product) return fail('No query results for model.', 404)

    if (method === 'GET' && !product) {
      let rows = db.products.map(withRelations)
      if (!blank(params.search)) {
        const s = String(params.search).toLowerCase()
        rows = rows.filter((p) => [p.name, p.sku, p.category?.name].some((v) => String(v ?? '').toLowerCase().includes(s)))
      }
      if (!blank(params.category_id)) rows = rows.filter((p) => p.category_id === Number(params.category_id))
      return ok(rows)
    }
    if (method === 'GET') return ok(withRelations(product!))

    if (method === 'DELETE') {
      db.products.splice(db.products.indexOf(product!), 1)
      for (let i = db.movements.length - 1; i >= 0; i--) if (db.movements[i].product_id === id) db.movements.splice(i, 1)
      audit('PRODUCT_DELETED', product!, uid)
      return ok({ message: 'Product deleted successfully' })
    }

    const body = req.body ?? {}
    const missing = required(body, ['sku', 'name', 'category_id', 'unit_id', 'cost_price', 'sell_price', 'min_stock'])
    if (missing) return missing
    const errors: Record<string, string[]> = {}
    if (db.products.some((p) => p.sku === body.sku && p.id !== id)) errors.sku = ['The sku has already been taken.']
    if (!db.categories.some((c) => c.id === Number(body.category_id))) errors.category_id = ['The selected category id is invalid.']
    if (!db.units.some((u) => u.id === Number(body.unit_id))) errors.unit_id = ['The selected unit id is invalid.']
    ;['cost_price', 'sell_price', 'min_stock'].forEach((f) => {
      if (!(num(body[f]) >= 0)) errors[f] = [`The ${f.replace(/_/g, ' ')} field must be at least 0.`]
    })
    if (Object.keys(errors).length) return invalid(errors)

    const data = {
      sku: String(body.sku),
      name: String(body.name),
      category_id: Number(body.category_id),
      unit_id: Number(body.unit_id),
      cost_price: Number(body.cost_price),
      sell_price: Number(body.sell_price),
      min_stock: Math.trunc(Number(body.min_stock)),
    }
    if (product) {
      Object.assign(product, data, { updated_at: new Date().toISOString() })
      audit('PRODUCT_UPDATED', product, uid)
      return ok(product)
    }
    const created = stamped({ id: nextId(db.products), ...data })
    db.products.push(created)
    audit('PRODUCT_CREATED', created, uid)
    return ok(created, 201)
  }

  // --- stock ---------------------------------------------------------------------------------
  if ((m = path.match(/^\/stock\/(in|out)$/)) && method === 'POST') {
    const type = m[1] === 'in' ? 'IN' : 'OUT'
    const body = req.body ?? {}
    const missing = required(body, ['product_id', 'warehouse_id', 'quantity'])
    if (missing) return missing
    const product = db.products.find((p) => p.id === Number(body.product_id))
    if (!product) return invalid({ product_id: ['The selected product id is invalid.'] })
    if (!db.warehouses.some((w) => w.id === Number(body.warehouse_id))) return invalid({ warehouse_id: ['The selected warehouse id is invalid.'] })
    const quantity = Number(body.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) return invalid({ quantity: ['The quantity field must be at least 1.'] })
    if (type === 'OUT' && stockOf(product.id) < quantity) return fail('Insufficient stock', 422)

    const movement = stamped({
      id: nextId(db.movements),
      product_id: product.id,
      warehouse_id: Number(body.warehouse_id),
      type,
      quantity,
      reference: body.reference || null,
      user_id: uid,
    })
    db.movements.push(movement)
    audit(`STOCK_${type}`, movement, uid)
    return ok({ message: type === 'IN' ? 'Stock added successfully' : 'Stock removed successfully', movement }, 201)
  }

  if (path === '/stock/history' && method === 'GET')
    return ok(paginate(latestFirst(db.movements).map(withMovementRelations), 20, Number(params.page) || 1))

  // --- audit logs ----------------------------------------------------------------------------
  if (path === '/audit-logs' && method === 'GET') {
    const rows = latestFirst(db.auditLogs).map((l) => ({ ...l, user: db.users.find((u) => u.id === l.user_id) ? withoutPassword(db.users.find((u) => u.id === l.user_id)!) : null }))
    return ok(paginate(rows, 50, Number(params.page) || 1))
  }

  // --- reports -------------------------------------------------------------------------------
  if (path === '/reports/movement-history' && method === 'GET') {
    let rows = latestFirst(db.movements)
    if (!blank(params.type)) rows = rows.filter((mv) => mv.type === params.type)
    if (!blank(params.start_date)) rows = rows.filter((mv) => mv.created_at.slice(0, 10) >= params.start_date)
    if (!blank(params.end_date)) rows = rows.filter((mv) => mv.created_at.slice(0, 10) <= params.end_date)
    return ok(paginate(rows.map(withMovementRelations), 50, Number(params.page) || 1))
  }

  if (path === '/reports/valuation' && method === 'GET') {
    const items = db.products.map((p) => ({ name: p.name, stock: stockOf(p.id), cost_price: p.cost_price, value: Math.round(stockOf(p.id) * p.cost_price * 100) / 100 }))
    return ok({ total_value: Math.round(items.reduce((s, i) => s + i.value, 0) * 100) / 100, currency: 'USD', product_count: items.length, items })
  }

  if (path === '/reports/export-csv' && method === 'GET') {
    const esc = (v: any) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
    const lines = [['SKU', 'Name', 'Category', 'Unit', 'Cost Price', 'Sell Price', 'Min Stock', 'Current Stock']]
    db.products.map(withRelations).forEach((p) => lines.push([p.sku, p.name, p.category?.name ?? 'N/A', p.unit?.name ?? 'N/A', p.cost_price, p.sell_price, p.min_stock, p.total_stock]))
    return ok(new Blob([lines.map((l) => l.map(esc).join(',')).join('\n')], { type: 'text/csv' }))
  }

  if (path === '/reports/charts/stock-trend' && method === 'GET') {
    const days = [6, 5, 4, 3, 2, 1, 0].map((i) => new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10))
    return ok(
      days.map((date) => {
        const day = db.movements.filter((mv) => mv.created_at.slice(0, 10) === date)
        const sum = (type: string) => day.filter((mv) => mv.type === type).reduce((s, mv) => s + mv.quantity, 0)
        return { date, in: sum('IN'), out: sum('OUT') }
      }),
    )
  }

  if (path === '/reports/charts/category-distribution' && method === 'GET') {
    return ok(
      db.categories
        .map((c) => {
          const list = db.products.filter((p) => p.category_id === c.id)
          return list.length
            ? { name: c.name, value: list.reduce((s, p) => s + stockOf(p.id) * p.cost_price, 0), count: list.reduce((s, p) => s + stockOf(p.id), 0) }
            : null
        })
        .filter(Boolean),
    )
  }

  if (path === '/reports/charts/warehouse-comparison' && method === 'GET') {
    return ok(
      db.warehouses.map((w) => ({
        name: w.name,
        stock: db.movements.filter((mv) => mv.warehouse_id === w.id).reduce((s, mv) => s + (mv.type === 'IN' ? mv.quantity : -mv.quantity), 0),
      })),
    )
  }

  // --- documents (PDF generated in the browser) ----------------------------------------------
  if ((m = path.match(/^\/documents\/receipt\/(\d+)$/)) && method === 'GET') {
    const movement = db.movements.find((mv) => mv.id === +m![1])
    if (!movement) return fail('No query results for model.', 404)
    const product = db.products.find((p) => p.id === movement.product_id)!
    const unit = db.units.find((u) => u.id === product.unit_id)?.name ?? ''
    const user = db.users.find((u) => u.id === movement.user_id)
    return ok(await receiptPdf(movement, product, unit, db.warehouses.find((w) => w.id === movement.warehouse_id), user?.name ?? 'System'))
  }

  if (path === '/documents/valuation' && method === 'GET') {
    const items = db.products.map((p) => ({ sku: p.sku, name: p.name, stock: stockOf(p.id), cost: p.cost_price }))
    return ok(await valuationPdf(items, items.reduce((s, i) => s + i.stock * i.cost, 0)))
  }

  // --- users ---------------------------------------------------------------------------------
  if ((m = path.match(/^\/users(?:\/(\d+))?$/))) {
    const id = m[1] ? +m[1] : null
    const target = id === null ? null : db.users.find((u) => u.id === id)
    if (id !== null && !target) return fail('No query results for model.', 404)
    if (req.user.role !== 'admin') return fail('This action is unauthorized.', 403)

    if (method === 'GET') return ok(db.users.map(withoutPassword))

    if (method === 'DELETE') {
      if (target!.id === uid) return fail('Cannot delete your own account', 403)
      db.users.splice(db.users.indexOf(target!), 1)
      return ok({ message: 'User deleted successfully' })
    }

    const body = req.body ?? {}
    const errors: Record<string, string[]> = {}
    const roles = ['admin', 'staff', 'viewer']
    if (!target || 'name' in body) if (blank(body.name)) errors.name = ['The name field is required.']
    if (!target || 'email' in body) {
      if (blank(body.email)) errors.email = ['The email field is required.']
      else if (!isEmail(body.email)) errors.email = ['The email field must be a valid email address.']
      else if (db.users.some((u) => u.email === String(body.email).toLowerCase() && u.id !== id)) errors.email = ['The email has already been taken.']
    }
    if (!target || 'role' in body) if (!roles.includes(body.role)) errors.role = ['The selected role is invalid.']
    if ((!target || !blank(body.password)) && String(body.password ?? '').length < 8) errors.password = ['The password field must be at least 8 characters.']
    if (Object.keys(errors).length) return invalid(errors)

    if (target) {
      ;['name', 'role'].forEach((f) => f in body && (target[f] = body[f]))
      if ('email' in body) target.email = String(body.email).toLowerCase()
      if (!blank(body.password)) target.password = body.password
      target.updated_at = new Date().toISOString()
      return ok(withoutPassword(target))
    }
    const created = stamped({ id: nextId(db.users), name: body.name, email: String(body.email).toLowerCase(), role: body.role, password: body.password, email_verified_at: null })
    db.users.push(created)
    return ok(withoutPassword(created), 201)
  }

  // --- CSV import (runs in the browser) ------------------------------------------------------
  if (path === '/import/products' && method === 'POST') {
    const file = req.body instanceof FormData ? (req.body.get('file') as File | null) : null
    if (!file) return invalid({ file: ['The file field is required.'] })
    if (!/\.csv$/i.test(file.name)) return { status: 422, data: { status: 'error', message: 'This demo can only import .csv files.', errors: [{ row: 1, attribute: 'file', errors: ['Please upload a .csv file.'] }] } }

    const rows = parseCsv(await file.text())
    if (rows.length < 2) return { status: 422, data: { status: 'error', message: 'The file has no data rows.', errors: [{ row: 1, attribute: 'file', errors: ['No data rows found.'] }] } }
    const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const parsed = rows.slice(1).filter((r) => r.some((c) => c.trim() !== '')).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])))

    const errors: { row: number; attribute: string; errors: string[] }[] = []
    const seen = new Set(db.products.map((p) => p.sku))
    parsed.forEach((row, i) => {
      const rowNo = i + 2
      if (!row.sku) errors.push({ row: rowNo, attribute: 'sku', errors: ['The sku field is required.'] })
      else if (seen.has(row.sku)) errors.push({ row: rowNo, attribute: 'sku', errors: ['The sku has already been taken.'] })
      else seen.add(row.sku)
      if (!row.name) errors.push({ row: rowNo, attribute: 'name', errors: ['The name field is required.'] })
      if (!row.category) errors.push({ row: rowNo, attribute: 'category', errors: ['The category field is required.'] })
      ;['cost_price', 'sell_price', 'initial_stock'].forEach((f) => {
        if (row[f] && !(Number(row[f]) >= 0)) errors.push({ row: rowNo, attribute: f, errors: [`The ${f.replace(/_/g, ' ')} field must be a number of at least 0.`] })
      })
    })
    if (errors.length) return { status: 422, data: { status: 'error', message: 'Validation failed for some rows', errors } }

    parsed.forEach((row) => {
      let category = db.categories.find((c) => c.name === row.category)
      if (!category) db.categories.push((category = stamped({ id: nextId(db.categories), name: row.category, description: null })))
      const unitName = row.unit || 'pcs'
      let unit = db.units.find((u) => u.name === unitName)
      if (!unit) db.units.push((unit = stamped({ id: nextId(db.units), name: unitName })))
      const product = stamped({ id: nextId(db.products), sku: row.sku, name: row.name, category_id: category.id, unit_id: unit.id, cost_price: Number(row.cost_price || 0), sell_price: Number(row.sell_price || 0), min_stock: Math.trunc(Number(row.min_stock || 0)) })
      db.products.push(product)
      if (Number(row.initial_stock) > 0)
        db.movements.push(stamped({ id: nextId(db.movements), product_id: product.id, warehouse_id: Number(row.warehouse_id) || 1, type: 'IN', quantity: Number(row.initial_stock), reference: 'EXCEL-IMPORT-INITIAL', user_id: uid }))
    })
    return ok({ status: 'success', message: 'Products imported successfully' })
  }

  return fail('Not found.', 404)
}

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"', i++)
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') (row.push(cell), (cell = ''))
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell !== '' || row.length) (row.push(cell), rows.push(row))
  return rows
}

export const handle = route
