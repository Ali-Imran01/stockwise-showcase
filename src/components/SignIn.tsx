import { Boxes } from 'lucide-react'
import { useState } from 'react'

interface SignInProps {
  onSignIn: () => void
}

export function SignIn({ onSignIn }: SignInProps) {
  const [email, setEmail] = useState('admin@stockwise.demo')
  const [password, setPassword] = useState('••••••••')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Boxes size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">StockWise</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Inventory management, made traceable.</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSignIn()
          }}
          className="space-y-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border-none bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border-none bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed font-semibold text-slate-400">
          This is a showcase demo — any email/password signs you in. No real accounts, no backend, all data below is
          mock.
        </p>
      </div>
    </div>
  )
}
