import { motion, MotionConfig, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DisclaimerGate } from './components/Disclaimer'
import { HealthView } from './components/HealthView'
import { Icon, type IconName } from './components/Icon'
import { InstallButton } from './components/InstallApp'
import { Logo } from './components/Logo'
import { Onboarding } from './components/Onboarding'
import { PlanView } from './components/PlanView'
import { ProfileView } from './components/ProfileView'
import { RecipeViewerProvider } from './components/RecipeViewer'
import { ShareButton } from './components/ShareButton'
import { ShopView } from './components/ShopView'
import { TodayView } from './components/TodayView'
import { TrainView } from './components/TrainView'
import { useAppState } from './lib/store'
import { useSwipe } from './lib/swipe'

/** The five main tabs, plus Profile (opened from the header). */
type Main = 'today' | 'week' | 'shop' | 'health' | 'train' | 'profile'
/**
 * Older screen names stay valid so links inside screens keep working:
 * plan → Week, kitchen → Shop's pantry, prices → Shop's prices, sleep → Health's sleep page.
 */
type Tab = Main | 'plan' | 'kitchen' | 'prices' | 'sleep'

const ALIAS: Record<Exclude<Tab, Main>, [Main, string]> = {
  plan: ['week', ''],
  kitchen: ['shop', 'pantry'],
  prices: ['shop', 'prices'],
  sleep: ['health', 'sleep'],
}

const TABS: { id: Main; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'week', label: 'Food', icon: 'apple' },
  { id: 'shop', label: 'Shop', icon: 'cart' },
  { id: 'health', label: 'Health', icon: 'activity' },
  { id: 'train', label: 'Train', icon: 'dumbbell' },
]
const ORDER: Main[] = [...TABS.map((t) => t.id), 'profile']

export default function App() {
  const [state, update] = useAppState()
  const [nav, setNav] = useState<{ tab: Main; section: string; dir: number }>({ tab: 'today', section: '', dir: 0 })
  const { tab, section, dir } = nav
  const mainRef = useRef<HTMLElement>(null)
  const dragX = useMotionValue(0)

  const goTo = useCallback((to: Tab, sub = '') => {
    const [next, aliasSection] = to in ALIAS ? ALIAS[to as keyof typeof ALIAS] : [to as Main, '']
    setNav((cur) => ({ tab: next, section: sub || aliasSection, dir: Math.sign(ORDER.indexOf(next) - ORDER.indexOf(cur.tab)) }))
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
  useEffect(() => { window.scrollTo(0, 0); dragX.set(0) }, [tab, section, dragX])

  if (!state.setupDone) return <Onboarding state={state} update={update} />
  if (!state.disclaimerAccepted) return <DisclaimerGate onAccept={() => update((s) => ({ ...s, disclaimerAccepted: true }))} />

  const props = { state, update, goTo }
  const initial = (state.profile.name.trim()[0] ?? '').toUpperCase()

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: [0.25, 0.8, 0.25, 1] }}>
      <RecipeViewerProvider state={state}>
        <div className="app">
          <header className="topbar">
            <Logo />
            <div className="topbar-actions">
              <InstallButton />
              <ShareButton />
              <button className={`avatar-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => goTo('profile')} aria-label="Profile and settings" title="Profile and settings">
                {initial ? <span className="avatar">{initial}</span> : <Icon name="user" size={20} />}
                <span className="avatar-label">Profile</span>
              </button>
            </div>
          </header>

          <main className="content" ref={mainRef}>
            <motion.div style={{ x: dragX }}>
              {/* Enter-only slide: the new page mounts immediately, so it can never get stuck behind an exit animation. */}
              <motion.div key={`${tab}-${section}`} initial={dir ? { x: dir * 40, opacity: 0 } : false} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                {tab === 'today' && <TodayView {...props} />}
                {tab === 'week' && <PlanView {...props} />}
                {tab === 'shop' && <ShopView {...props} section={section} />}
                {tab === 'health' && <HealthView {...props} section={section} />}
                {tab === 'train' && <TrainView {...props} />}
                {tab === 'profile' && <ProfileView {...props} />}
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
