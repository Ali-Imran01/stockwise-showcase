import { Boxes, ClipboardList, LayoutDashboard, LogOut, Repeat } from 'lucide-react'
import type { ReactNode } from 'react'

export type View = 'dashboard' | 'products' | 'ledger' | 'reports'

interface NavItem {
  id: View
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'ledger', label: 'Stock Ledger', icon: Repeat },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
]

interface AppShellProps {
  active: View
  onNavigate: (view: View) => void
  onSignOut: () => void
  children: ReactNode
}

export function AppShell({ active, onNavigate, onSignOut, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Boxes size={18} />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">StockWise</span>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="space-y-3 px-4 py-6">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <LogOut size={18} />
            Sign Out
          </button>
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-[11px] leading-relaxed font-semibold text-slate-400">
            Showcase demo — frontend only, mock data, no backend. The original system is a Laravel + MySQL app not
            publicly deployed.
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Boxes size={16} />
            </div>
            <span className="font-black text-slate-900">StockWise</span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-bold text-slate-400 hover:text-slate-700"
          >
            Sign Out
          </button>
        </header>

        {/* Mobile nav row — the sidebar is desktop-only, so small screens get a horizontal scroller instead. */}
        <nav className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          {navItems.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500'
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
