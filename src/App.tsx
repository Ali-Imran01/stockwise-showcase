import { useState } from 'react'
import { AppShell, type View } from './components/AppShell'
import { Dashboard } from './components/Dashboard'
import { Products } from './components/Products'
import { Reports } from './components/Reports'
import { SignIn } from './components/SignIn'
import { StockLedger } from './components/StockLedger'

function App() {
  const [signedIn, setSignedIn] = useState(false)
  const [view, setView] = useState<View>('dashboard')

  if (!signedIn) {
    return <SignIn onSignIn={() => setSignedIn(true)} />
  }

  return (
    <AppShell active={view} onNavigate={setView} onSignOut={() => setSignedIn(false)}>
      {view === 'dashboard' && <Dashboard />}
      {view === 'products' && <Products />}
      {view === 'ledger' && <StockLedger />}
      {view === 'reports' && <Reports />}
    </AppShell>
  )
}

export default App
