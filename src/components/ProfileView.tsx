import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Tab } from '../App'
import { EQUIPMENT } from '../data/recipes'
import { FOODS } from '../data/foods'
import { ACTIVITY, computeTargets } from '../lib/energy'
import { useInstall } from '../lib/install'
import { defaultState, exportState, importState } from '../lib/store'
import { ConditionFields, ConditionSummary } from './ConditionFields'
import { DietFields, DietSummary } from './DietFields'
import { OnyxFields } from './ExportSheet'
import type { ExportTarget, Profile } from '../types'
import { Icon, type IconName } from './Icon'
import { InstallFields } from './InstallApp'
import { AiKeyFields } from './AiKeyFields'
import { useAiKey } from '../lib/aiKey'
import { DisclaimerText } from './Disclaimer'
import { MedFields, MedSummary } from './MedFields'
import { BodyFields, EquipmentFields, LifestyleFields, Why } from './ProfileFields'
import { Cite, type ViewProps } from './ui'

type Page = 'body' | 'conditions' | 'diet' | 'meds' | 'excluded' | 'lifestyle' | 'kitchen' | 'exports' | 'ai' | 'install' | 'about' | 'data'
type Props = ViewProps & { goTo?: (t: Tab, section?: string) => void; section?: string }

const GOAL: Record<Profile['goal'], string> = { lose: 'Lose fat', maintain: 'Maintain', gain: 'Build / gain' }

/** "07:30" → "7:30 am". */
function clock(t: string) {
  const [h, m] = t.split(':').map(Number)
  if (!Number.isFinite(h)) return t
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

export function ProfileView(props: Props) {
  const { state } = props
  const p = state.profile
  // A link can open a settings page directly (e.g. the craving sheet opens AI suggestions).
  const [page, setPage] = useState<Page | null>(() => (props.section === 'ai' ? 'ai' : null))
  const aiKey = useAiKey()
  const install = useInstall()
  // Each settings page starts at the top, and Back returns to the list's top too.
  useEffect(() => { window.scrollTo(0, 0) }, [page])

  const rows: { title: string; items: { id: Page; icon: IconName; label: string; value: ReactNode }[] }[] = [
    {
      title: 'You',
      items: [
        { id: 'body', icon: 'scale', label: 'Body & goal', value: `${p.age} yr · ${p.weightLb} lb · ${ACTIVITY[p.activity].label} · ${GOAL[p.goal]}` },
        { id: 'conditions', icon: 'stethoscope', label: 'Health conditions', value: <ConditionSummary p={p} /> },
        { id: 'diet', icon: 'salad', label: 'Diet', value: <DietSummary p={p} /> },
        { id: 'meds', icon: 'pill', label: 'Medications & pregnancy', value: <MedSummary p={p} /> },
        { id: 'excluded', icon: 'ban', label: 'Foods you won’t eat', value: p.excluded.length ? `${p.excluded.length} food${p.excluded.length > 1 ? 's' : ''}` : 'None' },
      ],
    },
    {
      title: 'Your days',
      items: [
        { id: 'lifestyle', icon: 'sunrise', label: 'Daily rhythm & lifestyle', value: `Up ${clock(p.wakeTime)} · bed ${clock(p.bedTime)} · $${p.weeklyBudget} a week` },
        { id: 'kitchen', icon: 'chef', label: 'Kitchen equipment', value: `${state.equipment.length} of ${EQUIPMENT.length} items` },
      ],
    },
    {
      title: 'App',
      items: [
        { id: 'exports', icon: 'share', label: 'Exports', value: state.exportTarget === 'onyx' ? 'Onyx Calendar' : 'Google Tasks' },
        { id: 'ai', icon: 'sparkles', label: 'AI suggestions', value: aiKey ? 'Using your Anthropic key' : 'Off: suggestions made on your device' },
        { id: 'install', icon: 'smartphone', label: 'Home screen app', value: install.installed ? 'Installed' : 'Not installed' },
        { id: 'about', icon: 'info', label: 'About & disclaimer', value: 'Not medical advice' },
        { id: 'data', icon: 'hardDrive', label: 'Your data', value: 'Backup, restore or erase' },
      ],
    },
  ]

  if (page) {
    const item = rows.flatMap((g) => g.items).find((i) => i.id === page)!
    return (
      <div className="stack">
        <div className="pf-page-head">
          <button type="button" className="pf-back" onClick={() => setPage(null)}>
            <Icon name="chevronLeft" size={20} /> Profile
          </button>
          <h1>{item.label}</h1>
        </div>
        <SettingsPage page={page} {...props} />
      </div>
    )
  }

  return (
    <div className="stack">
      <TargetsCard p={p} />
      {rows.map((g) => (
        <section key={g.title} aria-label={g.title}>
          <h2 className="pf-group-title">{g.title}</h2>
          <div className="pf-group">
            {g.items.map((i) => (
              <button key={i.id} type="button" className="pf-row" onClick={() => setPage(i.id)}>
                <span className="pf-row-icon"><Icon name={i.icon} size={18} /></span>
                <span className="pf-row-text">
                  <span className="pf-row-label">{i.label}</span>
                  <span className="pf-row-value">{i.value}</span>
                </span>
                <Icon name="chevronRight" size={18} className="pf-row-chevron" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function TargetsCard({ p }: { p: Profile }) {
  const t = computeTargets(p)
  return (
    <section className="card pf-targets">
      <h1>Your targets</h1>
      <div className="pf-target-nums">
        <div><span className="big-number">{t.kcal.toLocaleString()}</span><small>calories a day</small></div>
        <div><span className="big-number">{t.protein} g</span><small>protein a day</small></div>
      </div>
      <p className="small muted">Carbs {t.carbs} g · fat {t.fat} g</p>
      <Why label="How?">
        <ul className="explain">
          {t.explain.map((line) => <li key={line.text}>{line.text} <Cite ids={line.sources} convention={line.convention} /></li>)}
          <li>BMI {t.bmi}. BMI is a rough screening measure; it doesn’t distinguish muscle from fat. <Cite ids={['jensen']} /></li>
        </ul>
        <p className="muted small">Changes apply to your next “New week”. Swap individual meals to refresh portions right away.</p>
      </Why>
    </section>
  )
}

/** "Make a new week" reminder for settings that change what gets planned. */
function NewWeekNote({ goTo }: { goTo?: Props['goTo'] }) {
  return (
    <p className="pf-foot muted small">
      Changes apply when you make a new week.{' '}
      {goTo && <button type="button" className="link" onClick={() => goTo('week')}>Open Food</button>}
    </p>
  )
}

function SettingsPage({ page, ...props }: Props & { page: Page }) {
  const { state, update } = props
  switch (page) {
    case 'body':
      return (
        <>
          <p className="muted pf-intro">Used to work out your energy, protein and nutrient targets.</p>
          <section className="card"><BodyFields {...props} /></section>
          <TargetsCard p={state.profile} />
        </>
      )
    case 'conditions':
      return (
        <>
          <p className="muted pf-intro">Tap any you have. The plan avoids foods that could worsen them.</p>
          <ConditionFields {...props} />
          <NewWeekNote {...props} />
        </>
      )
    case 'diet':
      return (
        <>
          <p className="muted pf-intro">Choose any eating pattern you follow.</p>
          <DietFields {...props} />
          <NewWeekNote {...props} />
        </>
      )
    case 'meds':
      return (
        <>
          <p className="muted pf-intro">Used to screen supplements, peptides and foods for interactions, and to time meals around doses. Stored on this device only.</p>
          <MedFields {...props} />
        </>
      )
    case 'excluded':
      return <ExcludedFoods {...props} />
    case 'lifestyle':
      return (
        <>
          <p className="muted pf-intro">Used to time your meals, water, caffeine cutoff and habits, and to keep the plan in budget.</p>
          <section className="card"><LifestyleFields {...props} /></section>
        </>
      )
    case 'kitchen':
      return (
        <>
          <p className="muted pf-intro">Tick what you own. You’ll only get meals you can actually make. A knife and cutting board are assumed.</p>
          <EquipmentFields {...props} />
          <NewWeekNote {...props} />
        </>
      )
    case 'exports':
      return (
        <>
          <p className="muted pf-intro">Where the export buttons on Food and Sleep send your meals, groceries, prep day and sleep schedule.</p>
          <div className="radio-list">
            {([['google', 'Google Tasks', 'Task lists in your Google account. Needs a one-time Google Cloud client ID.'], ['onyx', 'Onyx Calendar', 'Time blocks and tasks on your Onyx calendar, sent to the Onyx app on your computer.']] as [ExportTarget, string, string][]).map(([id, label, detail]) => (
              <label key={id} className={`radio-card ${state.exportTarget === id ? 'on' : ''}`}>
                <input type="radio" name="export-target" checked={state.exportTarget === id} onChange={() => update((s) => ({ ...s, exportTarget: id }))} />
                <strong>{label}</strong>
                <small>{detail}</small>
              </label>
            ))}
          </div>
          {state.exportTarget === 'onyx' && <section className="card"><OnyxFields {...props} /></section>}
        </>
      )
    case 'ai':
      return <AiKeyFields />
    case 'install':
      return <section className="card"><InstallFields /></section>
    case 'about':
      return <section className="card disclaimer-card"><DisclaimerText /></section>
    case 'data':
      return <DataPage {...props} />
  }
}

function ExcludedFoods({ state, update, goTo }: Props) {
  const [q, setQ] = useState('')
  const ex = state.profile.excluded
  const toggle = (id: string) =>
    update((s) => {
      const cur = s.profile.excluded
      return { ...s, profile: { ...s.profile, excluded: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } }
    })
  const sorted = [...FOODS].sort((a, b) => a.name.localeCompare(b.name))
  const chosen = sorted.filter((f) => ex.includes(f.id))
  const shown = sorted.filter((f) => !ex.includes(f.id) && f.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <>
      <p className="muted pf-intro">Allergies, dislikes, or anything off-limits. Meals that contain these are never suggested.</p>
      {chosen.length > 0 && (
        <div className="trigger-list" aria-label="Foods you won’t eat">
          {chosen.map((f) => (
            <button key={f.id} type="button" className="trigger avoided" onClick={() => toggle(f.id)} aria-label={`Allow ${f.name} again`}>
              <Icon name="x" size={14} /> {f.name}
            </button>
          ))}
        </div>
      )}
      <label className="pf-search">
        <Icon name="search" size={18} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a food" aria-label="Find a food" />
      </label>
      <div className="check-grid compact">
        {shown.map((f) => (
          <label key={f.id} className="check-card">
            <input type="checkbox" checked={false} onChange={() => toggle(f.id)} />
            <span>{f.name}</span>
          </label>
        ))}
      </div>
      {!shown.length && <p className="muted small">No other foods match “{q}”.</p>}
      <NewWeekNote goTo={goTo} />
    </>
  )
}

function DataPage({ state, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const download = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `food-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const restore = async (file: File | undefined) => {
    if (!file) return
    try {
      const next = importState(await file.text())
      update(() => next)
      setMsg('Backup restored.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not read that file.')
    }
  }
  return (
    <>
      <p className="muted pf-intro">Everything is stored only on this device. Make a backup to move it to another phone or browser.</p>
      <section className="card stack tight">
        <button className="primary with-icon" onClick={download}><Icon name="download" size={16} /> Download backup</button>
        <button className="secondary" onClick={() => fileRef.current?.click()}>Restore backup</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => restore(e.target.files?.[0])} />
        {msg && <p className="small" role="status">{msg}</p>}
      </section>
      <section className="card">
        <h2>Start over</h2>
        <p className="muted small">Erases your profile, pantry, prices and plan on this device.</p>
        <button
          className="ghost danger"
          onClick={() => {
            if (confirm('Erase your profile, pantry, prices and plan on this device?')) update(() => defaultState())
          }}
        >
          Erase everything
        </button>
      </section>
    </>
  )
}
