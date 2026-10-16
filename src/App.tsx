import { useState } from 'react'
import { HealthView } from './components/HealthView'
import { KitchenView } from './components/KitchenView'
import { Onboarding } from './components/Onboarding'
import { PlanView } from './components/PlanView'
import { PricesView } from './components/PricesView'
import { ProfileView } from './components/ProfileView'
import { ShopView } from './components/ShopView'
import { useAppState } from './lib/store'

type Tab = 'plan' | 'shop' | 'health' | 'kitchen' | 'prices' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'plan', label: 'Plan', icon: '🗓️' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'health', label: 'Health', icon: '🧠' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'prices', label: 'Prices', icon: '🏷️' },
]

export default function App() {
  const [state, update] = useAppState()
  const [tab, setTab] = useState<Tab>('plan')

  if (!state.setupDone) return <Onboarding state={state} update={update} />

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden>🥕</span>
          <span>Food Planner</span>
        </div>
        <button className={`ghost ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          {state.profile.name ? state.profile.name : 'Profile'}
        </button>
      </header>

      <main className="content">
        {tab === 'plan' && <PlanView state={state} update={update} goTo={setTab} />}
        {tab === 'shop' && <ShopView state={state} update={update} goTo={setTab} />}
        {tab === 'health' && <HealthView state={state} />}
        {tab === 'kitchen' && <KitchenView state={state} update={update} />}
        {tab === 'prices' && <PricesView state={state} update={update} />}
        {tab === 'profile' && <ProfileView state={state} update={update} />}
      </main>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <span aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export type { Tab }
