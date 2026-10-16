import { motion, MotionConfig, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DisclaimerGate } from './components/Disclaimer'
import { HealthView } from './components/HealthView'
import { Icon, type IconName } from './components/Icon'
import { KitchenView } from './components/KitchenView'
import { Logo } from './components/Logo'
import { Onboarding } from './components/Onboarding'
import { PlanView } from './components/PlanView'
import { PricesView } from './components/PricesView'
import { ProfileView } from './components/ProfileView'
import { RecipeViewerProvider } from './components/RecipeViewer'
import { ShopView } from './components/ShopView'
import { useAppState } from './lib/store'
import { useSwipe } from './lib/swipe'

type Tab = 'plan' | 'shop' | 'health' | 'kitchen' | 'prices' | 'profile'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'plan', label: 'Plan', icon: 'calendar' },
  { id: 'shop', label: 'Shop', icon: 'cart' },
  { id: 'health', label: 'Health', icon: 'activity' },
  { id: 'kitchen', label: 'Kitchen', icon: 'chef' },
  { id: 'prices', label: 'Prices', icon: 'tag' },
]
const ORDER: Tab[] = [...TABS.map((t) => t.id), 'profile']


export default function App() {
  const [state, update] = useAppState()
  const [[tab, dir], setNav] = useState<[Tab, number]>(['plan', 0])
  const mainRef = useRef<HTMLElement>(null)
  const dragX = useMotionValue(0)

  const goTo = useCallback((next: Tab) => {
    setNav(([cur]) => [next, Math.sign(ORDER.indexOf(next) - ORDER.indexOf(cur))])
  }, [])
  const onSwipe = useCallback((d: 1 | -1) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const next = TABS[i + d]
    if (i < 0 || !next) return false
    goTo(next.id)
    return true
  }, [tab, goTo])

  useSwipe(mainRef, dragX, onSwipe, state.setupDone)
  // New page: start at the top and clear any finger offset.
  useEffect(() => { window.scrollTo(0, 0); dragX.set(0) }, [tab, dragX])

  if (!state.setupDone) return <Onboarding state={state} update={update} />
  if (!state.disclaimerAccepted) return <DisclaimerGate onAccept={() => update((s) => ({ ...s, disclaimerAccepted: true }))} />

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: [0.25, 0.8, 0.25, 1] }}>
      <RecipeViewerProvider state={state}>
        <div className="app">
          <header className="topbar">
            <Logo />
            <button className={`ghost ${tab === 'profile' ? 'active' : ''}`} onClick={() => goTo('profile')}>
              {state.profile.name ? state.profile.name : 'Profile'}
            </button>
          </header>

          <main className="content" ref={mainRef}>
            <motion.div style={{ x: dragX }}>
              {/* Enter-only slide: the new page mounts immediately, so it can never get stuck behind an exit animation. */}
              <motion.div key={tab} initial={dir ? { x: dir * 40, opacity: 0 } : false} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                  {tab === 'plan' && <PlanView state={state} update={update} goTo={goTo} />}
                  {tab === 'shop' && <ShopView state={state} update={update} goTo={goTo} />}
                  {tab === 'health' && <HealthView state={state} />}
                  {tab === 'kitchen' && <KitchenView state={state} update={update} />}
                  {tab === 'prices' && <PricesView state={state} update={update} />}
                  {tab === 'profile' && <ProfileView state={state} update={update} />}
              </motion.div>
            </motion.div>
          </main>

          <nav className="tabbar" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => goTo(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
                {tab === t.id && <motion.span layoutId="tab-indicator" className="tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <Icon name={t.icon} size={22} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </RecipeViewerProvider>
    </MotionConfig>
  )
}

export type { Tab }
