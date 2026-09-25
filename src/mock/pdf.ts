/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Row } from './db'

// jsPDF is loaded on demand so it only ships to visitors who actually download a PDF.
const newDoc = async () => new (await import('jspdf')).jsPDF()

function heading(doc: any, title: string) {
  doc.setTextColor(37, 99, 235)
  doc.setFontSize(20)
  doc.text(title.toUpperCase(), 105, 20, { align: 'center' })
  doc.setTextColor(102, 102, 102)
  doc.setFontSize(9)
  doc.text(`Generated on: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, 105, 27, { align: 'center' })
  doc.setDrawColor(37, 99, 235)
  doc.line(15, 31, 195, 31)
  doc.setTextColor(51, 51, 51)
}

export async function receiptPdf(movement: Row, product: Row, unit: string, warehouse: Row | undefined, userName: string): Promise<Blob> {
  const doc = await newDoc()
  heading(doc, 'Stock Movement Receipt')
  doc.setFontSize(11)
  const lines: [string, string][] = [
    ['Reference', movement.reference || 'N/A'],
    ['Type', `STOCK ${movement.type}`],
    ['Date', movement.created_at.replace('T', ' ').slice(0, 19)],
    ['Warehouse', warehouse?.name ?? 'Primary Center'],
    ['Location', warehouse?.location ?? 'Global Distribution'],
    ['Processed by', userName],
    ['Product SKU', product.sku],
    ['Product', product.name],
    ['Quantity', `${movement.quantity} ${unit}`],
  ]
  lines.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, 20, 46 + i * 9)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), 65, 46 + i * 9)
  })
  doc.setFontSize(8)
  doc.setTextColor(153, 153, 153)
  doc.text('StockWise demo — generated in your browser from sample data.', 105, 285, { align: 'center' })
  return doc.output('blob')
}

export async function valuationPdf(items: { sku: string; name: string; stock: number; cost: number }[], total: number): Promise<Blob> {
  const doc = await newDoc()
  heading(doc, 'Inventory Valuation')
  let y = 42
  const header = () => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('SKU', 15, y)
    doc.text('Product', 45, y)
    doc.text('Stock', 130, y, { align: 'right' })
    doc.text('Cost', 155, y, { align: 'right' })
    doc.text('Value', 195, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    y += 7
  }
  header()
  items.forEach((item) => {
    if (y > 275) {
      doc.addPage()
      y = 20
      header()
    }
    doc.text(item.sku, 15, y)
    doc.text(item.name.slice(0, 44), 45, y)
    doc.text(String(item.stock), 130, y, { align: 'right' })
    doc.text(item.cost.toFixed(2), 155, y, { align: 'right' })
    doc.text((item.stock * item.cost).toFixed(2), 195, y, { align: 'right' })
    y += 7
  })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Total value: $${total.toFixed(2)}`, 195, y + 6, { align: 'right' })
  return doc.output('blob')
}
