import { useMemo, useState, type ReactNode } from 'react'
import type { Tab } from '../App'
import { ACCESS, CHECKINS, EXPERIENCE, HORMONE_CUES, MUSCLES, NOT_FOR_YOU, POSTURE, PRINCIPLES, TENDON, TRAINING_GOALS, VTAPER, type Muscle } from '../data/training'
import { hasCondition } from '../lib/conditions'
import { bodyTrend, buildProgram, fuelAdvice, muscleList, type FuelAdvice, type Program, type Session } from '../lib/training'
import { DAYS } from '../lib/plan-utils'
import type { BodyCheckIn, FitnessSettings, Profile, TrainingAddOn } from '../types'
import { Icon, type IconName } from './Icon'
import { Bar, Cite, EvidenceChip, Sheet, Sourced, Why, type ViewProps } from './ui'

const SESSION_LENGTHS = [30, 45, 60, 75, 90]
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type Panel = 'setup' | 'meals' | 'checkins' | 'extras' | 'health' | 'learn'

/** Which session is next: today's if it's still today, else the next day with one. */
function nextSession(p: Program, today: number): Session | undefined {
  return p.sessions.find((s) => s.weekday >= today) ?? p.sessions[0]
}

export function TrainView({ state, update, goTo }: ViewProps & { goTo: (t: Tab, section?: string) => void }) {
  const f = state.fitness
  const p = state.profile
  const [panel, setPanel] = useState<Panel | null>(null)
  const [today] = useState(() => (new Date().getDay() + 6) % 7)
  const [open, setOpen] = useState<number | null>(null)
  const setFit = (patch: Partial<FitnessSettings>) =>
    update((s) => {
      const fitness = { ...s.fitness, ...patch }
      return { ...s, fitness, profile: { ...s.profile, strengthTraining: fitness.enabled && fitness.feedMealPlan } }
    })
  const setProfile = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))

  const program = useMemo(() => buildProgram(f, p), [f, p])
  const advice = useMemo(() => (f.enabled ? fuelAdvice(state) : []), [f.enabled, state])
  const close = () => setPanel(null)

  if (!f.enabled) {
    return (
      <div className="stack">
        <section className="card hero empty-state">
          <h1>Training</h1>
          <p>Tell it your goal, how often you can train and the body parts you most want to grow. You get a week of sessions built from the research, adjusted for your health, and your meal plan follows along.</p>
          <button className="primary" onClick={() => setPanel('setup')}>Set up my training</button>
        </section>
        {panel === 'setup' && (
          <Sheet title="Your training" onClose={close}>
            <Setup f={f} p={p} setFit={setFit} setProfile={setProfile} onDone={() => { setFit({ enabled: true }); close() }} />
          </Sheet>
        )}
      </div>
    )
  }

  const next = nextSession(program, today)
  const nextIdx = next ? program.sessions.indexOf(next) : -1
  const avgMin = Math.round(program.sessions.reduce((m, s) => m + s.minutes, 0) / Math.max(1, program.sessions.length))
  const goal = TRAINING_GOALS.find((g) => g.id === f.goal)!
  const mealTodos = advice.filter((a) => a.apply || (a.meals && a.meals.length) || a.goTo).length
  const latest = [...state.bodyLog].reverse()[0]
  const addOnCount = f.addOns?.length ?? 0

  const tiles: { id: Panel; icon: IconName; title: string; detail: string }[] = [
    { id: 'setup', icon: 'target', title: 'Goal & schedule', detail: `${goal.label} · ${f.days} days` },
    { id: 'meals', icon: 'meal', title: 'Meals for training', detail: mealTodos ? `${mealTodos} suggestion${mealTodos > 1 ? 's' : ''}` : 'All set' },
    { id: 'checkins', icon: 'scale', title: 'Check-ins', detail: latest ? `Last: ${new Date(`${latest.date}T12:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Weight, waist, grip' },
    { id: 'extras', icon: 'sparkles', title: 'Extras', detail: addOnCount ? `${addOnCount} on` : 'Posture, injury-proofing' },
    ...(program.conditionNotes.length ? [{ id: 'health' as Panel, icon: 'heartPulse' as IconName, title: 'With your health', detail: `${program.conditionNotes.length} note${program.conditionNotes.length > 1 ? 's' : ''}` }] : []),
    { id: 'learn', icon: 'lightbulb', title: 'How it works', detail: 'Sets, effort, myths' },
  ]

  return (
    <div className="stack">
      <section className="card hero">
        <p className="eyebrow">This week · {program.split}</p>
        <h1>Training</h1>
        <p className="muted">
          {program.sessions.length} sessions, about {avgMin} min each
          {f.priorities.length > 0 && <> · extra work for {muscleList(f.priorities).toLowerCase()}</>}
        </p>
      </section>

      {next && (
        <>
          <h2 className="section-title">{next.weekday === today ? 'Today' : `Next · ${FULL_DAYS[next.weekday]}`}</h2>
          <SessionCard key={nextIdx} s={next} />
        </>
      )}

      <h2 className="section-title">The week</h2>
      <section className="card week-list">
        {program.sessions.map((s, i) => (
          <div key={i} className={`week-row ${i === nextIdx ? 'is-next' : ''}`}>
            <button className="week-row-head" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span className="week-day">{DAYS[s.weekday]}</span>
              <span className="week-name"><strong>{s.name}</strong><span className="muted small">{s.exercises.length} exercises · {s.minutes} min</span></span>
              <Icon name={open === i ? 'chevronDown' : 'chevronRight'} label={open === i ? `Hide ${DAYS[s.weekday]}` : `Show ${DAYS[s.weekday]}`} />
            </button>
            {open === i && <LiftList s={s} />}
          </div>
        ))}
        <p className="muted small week-cardio"><Icon name="heartPulse" size={15} /> {program.cardio} <Cite ids={['who_activity', ...(program.cardio.includes('migraine') ? ['varkey' as const] : [])]} /></p>
        {program.warnings.map((w) => <p key={w} className="warn-text small">{w}</p>)}
      </section>

      <h2 className="section-title">Your plan</h2>
      <div className="tile-grid">
        {tiles.map((t) => (
          <button key={t.id} className="tile" onClick={() => setPanel(t.id)}>
            <Icon name={t.icon} size={20} />
            <strong>{t.title}</strong>
            <span className="muted small">{t.detail}</span>
          </button>
        ))}
      </div>

      {panel === 'setup' && (
        <Sheet title="Goal & schedule" onClose={close}>
          <Setup f={f} p={p} setFit={setFit} setProfile={setProfile} onDone={close} />
        </Sheet>
      )}
      {panel === 'meals' && (
        <Sheet title="Meals for training" onClose={close}>
          <p className="muted small">What your training changes in the meal plan.</p>
          {advice.map((a) => <AdviceRow key={a.id} a={a} onApply={(patch) => setProfile(patch)} goTo={(t) => { close(); goTo(t) }} />)}
        </Sheet>
      )}
      {panel === 'checkins' && (
        <Sheet title="Check-ins" onClose={close}>
          <CheckIns state={state} update={update} />
        </Sheet>
      )}
      {panel === 'extras' && (
        <Sheet title="Extras" onClose={close}>
          <Extras f={f} setFit={setFit} />
        </Sheet>
      )}
      {panel === 'health' && (
        <Sheet title="With your health" onClose={close}>
          {program.conditionNotes.map((c) => (
            <div key={c.text} className="claim">
              <span className="small">{c.text}</span> <Sourced evidence={c.evidence} ids={c.sources} />
            </div>
          ))}
        </Sheet>
      )}
      {panel === 'learn' && (
        <Sheet title="How it works" onClose={close}>
          <Learn program={program} f={f} p={p} />
        </Sheet>
      )}
    </div>
  )
}

/** The next session: what it trains at a glance, the full list on tap. */
function SessionCard({ s }: { s: Session }) {
  const [open, setOpen] = useState(false)
  const names = s.exercises.map((x) => x.exercise.name)
  return (
    <section className="card next-session">
      <div className="row-between">
        <h2>{s.name}</h2>
        <span className="muted small">about {s.minutes} min</span>
      </div>
      {!open && <p className="muted small">{names.slice(0, 4).join(' · ')}{names.length > 4 ? ` · and ${names.length - 4} more` : ''}</p>}
      {open && <LiftList s={s} />}
      <button className="primary next-open" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide the exercises' : `See the ${s.exercises.length} exercises`}</button>
    </section>
  )
}

function LiftList({ s }: { s: Session }) {
  const [cues, setCues] = useState(false)
  return (
    <>
      <ol className="lift-list">
        {s.exercises.map((x) => (
          <li key={x.exercise.id}>
            <div className="row-between">
              <strong>{x.exercise.name}</strong>
              <span className="lift-dose">{x.sets} × {x.reps}</span>
            </div>
            <span className="muted small">{x.rir !== '—' ? `Stop with ${x.rir} reps left · ` : ''}rest {x.rest}</span>
            {(cues || x.note) && <span className="small lift-cue">{x.note ?? x.exercise.cue}</span>}
          </li>
        ))}
      </ol>
      <p className="muted small lift-foot">
        Warm up with lighter sets of the first exercise. When every set reaches the top of the rep range, add a little weight. <Why sources={['acsm_progression']} label="Source" />
      </p>
      <button className="link small" onClick={() => setCues(!cues)}>{cues ? 'Hide' : 'Show'} how to do each</button>
    </>
  )
}

/** Goal, body parts, days, time, experience and equipment. */
function Setup({ f, p, setFit, setProfile, onDone }: {
  f: FitnessSettings; p: Profile
  setFit: (patch: Partial<FitnessSettings>) => void
  setProfile: (patch: Partial<Profile>) => void
  onDone: () => void
}) {
  const togglePriority = (m: Muscle) => setFit({ priorities: f.priorities.includes(m) ? f.priorities.filter((x) => x !== m) : [...f.priorities, m], preset: undefined })
  return (
    <div className="stack tight setup">
      <h3>Goal</h3>
      <div className="radio-list">
        {TRAINING_GOALS.map((g) => (
          <label key={g.id} className={`radio-card ${f.goal === g.id ? 'on' : ''}`}>
            <input type="radio" name="train-goal" checked={f.goal === g.id} onChange={() => setFit({ goal: g.id })} />
            <strong>{g.label}</strong>
            <small>{g.detail}</small>
          </label>
        ))}
      </div>

      <h3>Days a week</h3>
      <div className="segmented" role="group" aria-label="Days a week">
        {[2, 3, 4, 5, 6].map((n) => (
          <button key={n} type="button" className={f.days === n ? 'on' : ''} aria-pressed={f.days === n} onClick={() => setFit({ days: n })}>{n}</button>
        ))}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Minutes per session</span>
          <select value={f.sessionMin} onChange={(e) => setFit({ sessionMin: Number(e.target.value) })}>
            {SESSION_LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
        <label className="field">
          <span>Usual time</span>
          <input type="time" value={p.workoutTime} onChange={(e) => setProfile({ workoutTime: e.target.value })} />
        </label>
      </div>

      <h3>Body parts to grow most</h3>
      <p className="muted small">They get extra sets and go first. Leave empty for balanced growth.</p>
      <div className="trigger-list">
        <button type="button" className={`toggle-chip ${f.preset === 'vtaper' ? 'on' : ''}`} aria-pressed={f.preset === 'vtaper'}
          onClick={() => setFit(f.preset === 'vtaper' ? { preset: undefined } : { preset: 'vtaper', priorities: VTAPER.priorities })}>
          <Icon name="sparkles" size={14} /> V-taper preset
        </button>
        {MUSCLES.map((m) => {
          const on = f.priorities.includes(m.id)
          return (
            <button key={m.id} type="button" className={`toggle-chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => togglePriority(m.id)}>
              {on && <Icon name="check" size={14} />} {m.label}
            </button>
          )
        })}
      </div>
      {f.preset === 'vtaper' && (
        <p className="muted small">
          Side delts, lats, upper chest, biceps and abs, with exercises chosen for them.{hasCondition(p, 'looks') && ' Fits your Skin & looks goal.'}{' '}
          <Why claims={[VTAPER.claim]} convention={VTAPER.claim.convention} />
        </p>
      )}

      <div className="form-grid">
        <label className="field">
          <span>Experience</span>
          <select value={f.experience} onChange={(e) => setFit({ experience: e.target.value as FitnessSettings['experience'] })}>
            {EXPERIENCE.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Where you train</span>
          <select value={f.access} onChange={(e) => setFit({ access: e.target.value as FitnessSettings['access'] })}>
            {ACCESS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
      </div>

      <label className="toggle compact">
        <input type="checkbox" checked={f.feedMealPlan} onChange={(e) => setFit({ feedMealPlan: e.target.checked })} />
        <span>
          <strong>Use my training in the meal plan</strong>
          <small>Raises protein to at least 1.6 g per kg (2.0 when losing weight). <Cite ids={['morton', 'longland']} /></small>
        </span>
      </label>

      <button className="primary" onClick={onDone}>{f.enabled ? 'Done' : 'Build my training plan'}</button>
    </div>
  )
}

/** Optional blocks: injury-proofing and posture. */
function Extras({ f, setFit }: { f: FitnessSettings; setFit: (patch: Partial<FitnessSettings>) => void }) {
  const toggle = (id: TrainingAddOn) => {
    const on = !!f.addOns?.includes(id)
    setFit({ addOns: on ? (f.addOns ?? []).filter((x) => x !== id) : [...(f.addOns ?? []), id] })
  }
  const tendon = !!f.addOns?.includes('tendon')
  const posture = !!f.addOns?.includes('posture')
  return (
    <div className="stack tight">
      <label className={`toggle compact ${tendon ? 'on' : ''}`}>
        <input type="checkbox" checked={tendon} onChange={() => toggle('tendon')} />
        <span><strong>Injury-proofing</strong><small>{TENDON.dose} <Why claims={TENDON.claims} /></small></span>
      </label>
      <label className={`toggle compact ${posture ? 'on' : ''}`}>
        <input type="checkbox" checked={posture} onChange={() => toggle('posture')} />
        <span><strong>Posture routine</strong><small>About 10 minutes, 2–3 times a week, any time. <Why claims={[POSTURE.claim]} convention={POSTURE.convention} /></small></span>
      </label>
      {posture && (
        <ol className="lift-list">
          {POSTURE.drills.map((d) => (
            <li key={d.name}>
              <div className="row-between"><strong>{d.name}</strong><span className="lift-dose">{d.dose}</span></div>
              <span className="small lift-cue">{d.cue}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** The research behind the plan, weekly sets per muscle, hormones and things to avoid. */
function Learn({ program, f, p }: { program: Program; f: FitnessSettings; p: Profile }) {
  return (
    <div className="stack tight">
      <h3>Weekly sets per muscle</h3>
      <p className="muted small">Hard sets a week; helper muscles in big lifts count as half. <Why claims={[PRINCIPLES.find((x) => x.id === 'volume')!, PRINCIPLES.find((x) => x.id === 'maintain')!]} convention="The half-set credit and the targets per experience level are this app’s choices." /></p>
      <div className="summary-grid">
        {MUSCLES.map(({ id, label }) => {
          const w = program.weekly[id]
          return (
            <div key={id}>
              <div className="summary-label"><span>{label}{f.priorities.includes(id) ? ' ★' : ''}</span><span>{Math.round(w.sets)} / {w.target}</span></div>
              <Bar value={w.sets} max={w.target} tone={w.sets >= w.target * 0.85 ? 'good' : 'warn'} label={`${label} sets`} />
            </div>
          )
        })}
      </div>

      <h3>How the plan is built</h3>
      {PRINCIPLES.map((x) => (
        <div key={x.id} className="claim">
          <div className="row-between"><strong className="small">{x.title}</strong><EvidenceChip level={x.evidence} /></div>
          <span className="small">{x.text} <Cite ids={x.sources} convention={x.convention} /></span>
        </div>
      ))}

      {(p.sex === 'male' || hasCondition(p, 'looks')) && (
        <>
          <h3>Testosterone: what actually moves it</h3>
          {HORMONE_CUES.map((c) => <div key={c.text} className="claim"><span className="small">{c.text}</span> <Sourced evidence={c.evidence} ids={c.sources} /></div>)}
        </>
      )}

      <h3 className="with-icon"><Icon name="shield" size={16} /> Not for you</h3>
      <p className="muted small">Sold for muscle or looks, but harmful or backfiring. The app never plans these or gives doses.</p>
      {NOT_FOR_YOU.map((x) => (
        <div key={x.name} className="claim">
          <p className="small"><strong>{x.name}</strong></p>
          <p className="small">{x.claim.text} <Sourced evidence={x.claim.evidence} ids={x.claim.sources} /></p>
        </div>
      ))}
      <p className="muted small">Programs by coaches such as Jeff Nippard inspired the structure (splits, weekly sets per muscle, effort targets); the numbers come from the cited research.</p>
    </div>
  )
}

function AdviceRow({ a, onApply, goTo }: { a: FuelAdvice; onApply: (patch: Partial<Profile>) => void; goTo: (t: Tab) => void }) {
  return (
    <div className="claim advice">
      <strong>{a.title}</strong>
      <p className="small">{a.text}</p>
      {a.meals && a.meals.length > 0 && (
        <ul className="explain small">{a.meals.map((m) => <li key={`${m.day}-${m.slot}`}>{m.day} {m.slot}: {m.name} ({m.protein} g)</li>)}</ul>
      )}
      <div className="advice-actions">
        {a.apply && <button className="secondary small" onClick={() => onApply(a.apply!.patch)}>{a.apply.label}</button>}
        {a.goTo && <button className="ghost small" onClick={() => goTo(a.goTo!)}>{a.goTo === 'plan' ? 'Open the week' : 'Open sleep'}</button>}
        <Why claims={[a.claim]} convention={a.convention} />
      </div>
    </div>
  )
}

const BAND_TEXT = { healthy: 'healthy range', increased: 'increased risk', high: 'high risk' } as const

/** Check-ins: weight (as a weekly average), waist, grip strength and dead-hang time. */
function CheckIns({ state, update }: ViewProps) {
  const [iso] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const [draft, setDraft] = useState<Record<'weightLb' | 'waistIn' | 'gripKg' | 'hangSec', string>>({ weightLb: '', waistIn: '', gripKg: '', hangSec: '' })
  const [saved, setSaved] = useState('')
  const t = bodyTrend(state.bodyLog, state.profile)
  const save = () => {
    const entry: BodyCheckIn = { date: iso }
    for (const k of Object.keys(draft) as (keyof typeof draft)[]) {
      const n = Number(draft[k])
      if (draft[k].trim() !== '' && Number.isFinite(n) && n > 0) entry[k] = n
    }
    if (Object.keys(entry).length === 1) return
    update((s) => {
      const old = s.bodyLog.find((e) => e.date === iso)
      const merged = { ...old, ...entry }
      return { ...s, bodyLog: [...s.bodyLog.filter((e) => e.date !== iso), merged].sort((a, b) => a.date.localeCompare(b.date)).slice(-400) }
    })
    setDraft({ weightLb: '', waistIn: '', gripKg: '', hangSec: '' })
    setSaved('Saved.')
  }
  const field = (k: keyof typeof draft, label: string, suffix: string) => (
    <label className="field">
      <span>{label}</span>
      <span className="input-wrap">
        <input type="number" inputMode="decimal" min={0} value={draft[k]} onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))} />
        <span className="suffix">{suffix}</span>
      </span>
    </label>
  )
  const change = t.thisWeek !== undefined && t.lastWeek !== undefined ? t.thisWeek - t.lastWeek : undefined
  const rows: ReactNode[] = []
  if (t.thisWeek !== undefined) rows.push(<li key="w">Weight this week: <strong>{t.thisWeek.toFixed(1)} lb</strong>{change !== undefined ? `, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)} from last week` : ''}. <Why claims={[CHECKINS.trend]} convention={CHECKINS.trend.convention} /></li>)
  if (t.waistToHeight !== undefined) rows.push(<li key="h" className={t.whtrBand === 'healthy' ? 'good-text' : 'warn-text'}>Waist is {Math.round(t.waistToHeight * 100)}% of your height: {BAND_TEXT[t.whtrBand!]}. <Why claims={[CHECKINS.waist]} /></li>)
  if (t.grip) rows.push(<li key="g">Grip: <strong>{t.grip.latest} kg</strong>{t.grip.latest !== t.grip.first ? ` (from ${t.grip.first})` : ''}. <Why claims={[CHECKINS.grip]} /></li>)
  if (t.hang) rows.push(<li key="d">Dead hang: <strong>{t.hang.latest} s</strong>{t.hang.latest !== t.hang.first ? ` (from ${t.hang.first} s)` : ''}. <span className="muted">A simple grip and shoulder benchmark; there’s no research target for it.</span></li>)
  return (
    <div className="stack tight">
      {rows.length > 0 ? <ul className="explain small">{rows}</ul> : <p className="muted small">Nothing logged yet. A weekly check-in shows your trend better than the scale on any one day.</p>}
      <h3>Today</h3>
      <p className="muted small">Fill in whatever you measured; blanks are skipped.</p>
      <div className="form-grid">
        {field('weightLb', 'Weight', 'lb')}
        {field('waistIn', 'Waist at the navel', 'in')}
        {field('gripKg', 'Grip strength', 'kg')}
        {field('hangSec', 'Dead hang', 's')}
      </div>
      <div className="add-row">
        <button className="primary" onClick={save}>Save check-in</button>
        {saved && <span className="good-text small" role="status">{saved}</span>}
      </div>
    </div>
  )
}
