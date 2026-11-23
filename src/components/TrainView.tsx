import { useMemo, useState, type ReactNode } from 'react'
import type { Tab } from '../App'
import {
  CHECKINS, EXERCISE_BY_ID, EXPERIENCE, EXTRA_DAYS, FASCIA, HORMONE_CUES, isLift, LAYOUTS, LIFT_DAYS, MOBILITY_MYTHS, MUSCLE_LABEL, MUSCLES, NOT_FOR_YOU, PRINCIPLES, REGION_LABEL, REGIONS, TENDON, TRAINING_GOALS, VTAPER,
  type DayPart, type Exercise, type ExerciseKind, type ExtraDay, type Muscle, type Region,
} from '../data/training'
import { DAY_TYPE_CLAIMS, POSTURE_GOALS, type PostureGoalId } from '../data/mobility'
import { hasCondition } from '../lib/conditions'
import { activePlace, addableFor, bodyTrend, buildProgram, DEFAULT_EXTRA_MIN, liftDayCount, placesOf, fuelAdvice, muscleList, weekLayout, type Block, type FuelAdvice, type PlannedExercise, type Program, type Session } from '../lib/training'
import { hasValue, inUnit, lastBefore, loggedOn, logKind, setText, today } from '../lib/lifts'
import { DAYS } from '../lib/plan-utils'
import type { BodyCheckIn, FitnessSettings, LiftEntry, Profile, TrainingAddOn, WeightUnit } from '../types'
import type { Drill } from '../data/training'
import { DrillSheet, FormSheet, LiftingRules, RuleLine, SwapChooser } from './FormGuide'
import { swapTag } from '../lib/compare'
import { WorkoutTimer } from './WorkoutTimer'
import { EquipmentEditor, LimitsEditor, PlaceBar } from './TrainSetup'
import { parseRest, restStart } from '../lib/timer'
import { Icon, type IconName } from './Icon'
import { Bar, Cite, EvidenceChip, Sheet, Sourced, Why, type ViewProps } from './ui'

const SESSION_LENGTHS = [30, 45, 60, 75, 90]
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type Panel = 'setup' | 'equipment' | 'limits' | 'stretch' | 'meals' | 'checkins' | 'extras' | 'health' | 'learn'

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
  // Breath-holding spikes blood pressure: breathe through every rep with high blood pressure or in pregnancy.
  const careful = hasCondition(p, 'hypertension') || p.meds.pregnant
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
  const addOnCount = (f.addOns ?? []).filter((a) => a !== 'posture').length
  const stretchCount = (f.stretchRegions?.length ?? 0) + (f.postureGoals?.length ?? 0)

  const tiles: { id: Panel; icon: IconName; title: string; detail: string }[] = [
    { id: 'setup', icon: 'target', title: 'Goal & week', detail: `${goal.label} · ${liftDayCount(f)} lifting day${liftDayCount(f) === 1 ? '' : 's'}` },
    { id: 'equipment', icon: 'dumbbell', title: 'Equipment', detail: `${placesOf(f).length} place${placesOf(f).length > 1 ? 's' : ''} · ${activePlace(f).name}` },
    { id: 'limits', icon: 'shield', title: 'Injuries & limits', detail: f.limitations?.length ? `${f.limitations.length} on` : 'None set' },
    { id: 'stretch', icon: 'stretch', title: 'Stretch & posture', detail: stretchCount ? `${stretchCount} chosen` : 'Regions, posture goals' },
    { id: 'meals', icon: 'meal', title: 'Meals for training', detail: mealTodos ? `${mealTodos} suggestion${mealTodos > 1 ? 's' : ''}` : 'All set' },
    { id: 'checkins', icon: 'scale', title: 'Check-ins', detail: latest ? `Last: ${new Date(`${latest.date}T12:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Weight, waist, grip' },
    { id: 'extras', icon: 'sparkles', title: 'Extras', detail: addOnCount ? `${addOnCount} on` : 'Fascia, injury-proofing' },
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

      <PlaceBar f={f} setFit={setFit} onEquipment={() => setPanel('equipment')} onLimits={() => setPanel('limits')} />

      <WorkoutTimer />

      {next && (
        <>
          <h2 className="section-title">{next.weekday === today ? 'Today' : `Next · ${FULL_DAYS[next.weekday]}`}</h2>
          <SessionCard key={nextIdx} s={next} live={next.weekday === today} careful={careful} state={state} update={update} />
        </>
      )}

      <h2 className="section-title">The week</h2>
      <section className="card week-list">
        {program.sessions.map((s, i) => (
          <div key={i} className={`week-row ${i === nextIdx ? 'is-next' : ''}`}>
            <button className="week-row-head" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span className="week-day">{DAYS[s.weekday]}</span>
              <span className="week-name"><strong>{s.name}</strong><span className="muted small">{itemsOf(s).length} exercises · {s.minutes} min{s.weekday === today ? ` · ${doneCount(s, state.liftLog)} done` : ''}</span></span>
              <Icon name={open === i ? 'chevronDown' : 'chevronRight'} label={open === i ? `Hide ${DAYS[s.weekday]}` : `Show ${DAYS[s.weekday]}`} />
            </button>
            {open === i && <LiftList s={s} live={s.weekday === today} careful={careful} state={state} update={update} />}
          </div>
        ))}
        <p className="muted small week-cardio"><Icon name="heartPulse" size={15} /> {program.cardio} <Cite ids={['who_activity', ...(program.cardio.includes('migraine') ? ['varkey' as const] : [])]} /></p>
        {program.warnings.map((w) => <p key={w} className="warn-text small">{w}</p>)}
        {program.notes.map((w) => <p key={w} className="muted small">{w}</p>)}
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
        <Sheet title="Goal & week" onClose={close}>
          <Setup f={f} p={p} setFit={setFit} setProfile={setProfile} onDone={close} />
        </Sheet>
      )}
      {panel === 'equipment' && (
        <Sheet title="Equipment" onClose={close}>
          <EquipmentEditor f={f} setFit={setFit} />
        </Sheet>
      )}
      {panel === 'limits' && (
        <Sheet title="Injuries and limitations" onClose={close}>
          <LimitsEditor f={f} p={p} setFit={setFit} />
        </Sheet>
      )}
      {panel === 'stretch' && (
        <Sheet title="Stretch & posture" onClose={close}>
          <StretchSetup f={f} setFit={setFit} program={program} onWeek={() => setPanel('setup')} />
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
          <Extras f={f} setFit={setFit} onPosture={() => setPanel('stretch')} />
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

/** Everything on a day: the lifting, then each stretch, yoga, balance or cool-down part. */
const itemsOf = (s: Session): PlannedExercise[] => [...s.exercises, ...s.blocks.flatMap((b) => b.items)]
const doneCount = (s: Session, log: LiftEntry[]) => {
  const date = today()
  return `${itemsOf(s).filter((x) => loggedOn(log, x.exercise.id, date)).length} of ${itemsOf(s).length}`
}

/** The next session: what it trains at a glance, the full list on tap. */
function SessionCard({ s, live, careful, state, update }: ViewProps & { s: Session; live: boolean; careful: boolean }) {
  const [open, setOpen] = useState(false)
  const items = itemsOf(s)
  const names = items.map((x) => x.exercise.name)
  const date = today()
  const done = live ? items.filter((x) => loggedOn(state.liftLog, x.exercise.id, date)).length : 0
  return (
    <section className="card next-session">
      <div className="row-between">
        <h2>{s.name}</h2>
        <span className="muted small">about {s.minutes} min</span>
      </div>
      {live && done > 0 && (
        <div className="session-progress">
          <Bar value={done} max={items.length} tone="good" label="Exercises done" />
          <span className="small good-text">{done === items.length ? 'All done today' : `${done} of ${items.length} done`}</span>
        </div>
      )}
      {!open && <p className="muted small">{names.slice(0, 4).join(' · ')}{names.length > 4 ? ` · and ${names.length - 4} more` : ''}</p>}
      {open && <LiftList s={s} live={live} careful={careful} state={state} update={update} />}
      <button className="primary next-open" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide the exercises' : `See the ${items.length} exercises`}</button>
    </section>
  )
}

const BLOCK_ICON: Record<Block['kind'], IconName> = { stretch: 'stretch', yoga: 'flower', balance: 'footprints', cooldown: 'stretch' }

/**
 * A day's exercises. Tap one to log it and see how to do it; Swap shows the alternatives and what
 * each changes. Logged exercises show as done (on today's session only).
 */
function LiftList({ s, live, careful, state, update }: ViewProps & { s: Session; live: boolean; careful: boolean }) {
  const [guide, setGuide] = useState<PlannedExercise | null>(null)
  const [swap, setSwap] = useState<PlannedExercise | null>(null)
  const [adding, setAdding] = useState(false)
  const date = today()
  const row = (x: PlannedExercise) => {
    const done = live && loggedOn(state.liftLog, x.exercise.id, date)
    const lift = isLift(x.exercise)
    return (
      // The whole row opens the guide; the name button carries keyboard focus and the label.
      <li key={x.exercise.id} className={`lift-tap ${done ? 'done' : ''}`} onClick={() => setGuide(x)}>
        <div className="row-between">
          <button type="button" className="lift-name" aria-label={`${done ? 'Done: ' : ''}How to do ${x.exercise.name}`}>
            {done && <span className="done-mark" aria-hidden><Icon name="check" size={14} /></span>}
            <strong>{x.exercise.name}</strong> <Icon name="info" size={15} />
          </button>
          <span className="lift-dose">{lift ? `${x.sets} × ${x.reps}` : x.hold}</span>
        </div>
        <span className="lift-row-line">
          <span className="muted small">
            {lift
              ? <>{x.rir !== '—' ? `Stop with ${x.rir} reps left · ` : ''}<RestButton rest={x.rest} /></>
              : (x.exercise.regions ?? []).map((r) => REGION_LABEL[r]).join(', ')}
          </span>
          <button type="button" className="link small lift-swap" onClick={(e) => { e.stopPropagation(); setSwap(x) }} aria-label={`Swap or remove ${x.exercise.name}`}>
            <Icon name="swap" size={14} /> Swap
          </button>
        </span>
        {lift && <LastLine log={state.liftLog} x={x} date={date} unit={state.fitness.weightUnit ?? 'lb'} />}
        {x.note && <span className="small lift-cue">{x.note}</span>}
        {(x.added || x.swappedFrom) && (
          <span className="lift-row-foot">
            {x.added && <span className="tag small">Added by you</span>}
            {x.swappedFrom && <span className="muted small">Instead of {EXERCISE_NAME(x.swappedFrom)}</span>}
          </span>
        )}
      </li>
    )
  }
  return (
    <>
      {s.exercises.length > 0 && <ol className="lift-list">{s.exercises.map(row)}</ol>}
      {s.blocks.map((b, i) => (
        <div key={`${b.kind}-${i}`} className="lift-block">
          <h4 className="block-title"><Icon name={BLOCK_ICON[b.kind]} size={16} /> {b.title} <span className="muted small">about {b.minutes} min</span></h4>
          <ol className="lift-list">{b.items.map(row)}</ol>
        </div>
      ))}
      <button type="button" className="link small add-to-day" onClick={() => setAdding(true)}><Icon name="plus" size={14} /> Add an exercise to this day</button>
      <p className="muted small lift-foot">
        Tap an exercise to log it, see a diagram and form tips; Swap shows what else fits and what it would change. <RuleLine id="warmup_ramp" /> When every set reaches the top of the rep range, add a little weight. <Why sources={['acsm_progression']} label="Source" />
      </p>
      {guide && <FormSheet id={guide.exercise.id} careful={careful} onClose={() => setGuide(null)} log={{ state, update, dose: guide, weekday: s.weekday }} />}
      {swap && (
        <Sheet title={`Swap ${swap.exercise.name}`} onClose={() => setSwap(null)}>
          <SwapChooser x={swap} weekday={s.weekday} state={state} update={update} onDone={() => setSwap(null)} />
        </Sheet>
      )}
      {adding && <AddSheet s={s} state={state} update={update} onClose={() => setAdding(false)} />}
    </>
  )
}

const EXERCISE_NAME = (id: string) => EXERCISE_BY_ID[id]?.name ?? id

const ADD_TABS: { id: ExerciseKind; label: string }[] = [
  { id: 'strength', label: 'Lifts' }, { id: 'mobility', label: 'Stretches' }, { id: 'yoga', label: 'Yoga' }, { id: 'balance', label: 'Balance' },
]

/** Add any exercise that fits your equipment and body to one day. */
function AddSheet({ s, state, update, onClose }: ViewProps & { s: Session; onClose: () => void }) {
  const f = state.fitness
  const [tab, setTab] = useState<ExerciseKind>(s.parts.some((x) => LIFT_DAYS.some((d) => d.id === x)) ? 'strength' : s.parts.includes('yoga') ? 'yoga' : s.parts.includes('balance') ? 'balance' : 'mobility')
  const [q, setQ] = useState('')
  const all = addableFor(s, f, state.profile)
  const shown = all[tab].filter((e) => !q.trim() || e.name.toLowerCase().includes(q.trim().toLowerCase()))
  const add = (e: Exercise) => {
    const key = String(s.weekday)
    const edit = f.dayEdits?.[key] ?? {}
    update((st) => ({ ...st, fitness: { ...st.fitness, dayEdits: { ...st.fitness.dayEdits, [key]: { add: [...new Set([...(edit.add ?? []), e.id])], remove: (edit.remove ?? []).filter((id) => id !== e.id) } } } }))
    onClose()
  }
  const group = (e: Exercise) => (isLift(e) ? MUSCLE_LABEL[e.primary[0]] : '')
  return (
    <Sheet title={`Add to ${FULL_DAYS[s.weekday]}`} onClose={onClose}>
      <div className="segmented" role="tablist">
        {ADD_TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      <label className="field"><span>Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name of an exercise" /></label>
      {shown.length ? (
        <ul className="swap-list add-list">
          {shown.map((e, i) => (
            <li key={e.id}>
              {group(e) && group(e) !== group(shown[i - 1] ?? e) || (i === 0 && group(e)) ? <p className="eyebrow add-group">{group(e)}</p> : null}
              <button type="button" className="swap-option" onClick={() => add(e)}>
                <strong>{e.name}</strong>
                <span className="muted small">{swapTag(e)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="muted small">Nothing here fits {activePlace(f).name}’s equipment and your limitations.</p>}
      <p className="muted small">Added exercises stay on {FULL_DAYS[s.weekday]} every week until you remove them (Swap, then Remove from this day). Lifts you add come on top of the planned sets.</p>
    </Sheet>
  )
}

const EXTRA_MINUTES = [10, 15, 20, 30]

/** How the week is laid out: a style and a number of days (plus extra sessions), or your own days. */
function WeekSetup({ f, setFit }: { f: FitnessSettings; setFit: (patch: Partial<FitnessSettings>) => void }) {
  const layout = f.layout ?? 'auto'
  const pick = (id: FitnessSettings['layout']) => setFit(id === 'custom' && layout !== 'custom' ? { layout: id, week: weekLayout(f) } : { layout: id })
  const stepExtra = (id: ExtraDay, by: number) => setFit({ extraDays: { ...f.extraDays, [id]: Math.max(0, Math.min(3, (f.extraDays?.[id] ?? 0) + by)) } })
  return (
    <>
      <h3>Week layout</h3>
      <div className="radio-list compact">
        {LAYOUTS.map((l) => (
          <label key={l.id} className={`radio-card ${layout === l.id ? 'on' : ''}`}>
            <input type="radio" name="train-layout" checked={layout === l.id} onChange={() => pick(l.id)} />
            <strong>{l.label}</strong>
            <small>{l.detail}</small>
          </label>
        ))}
      </div>
      {layout !== 'custom' ? (
        <>
          <h3>Lifting days a week</h3>
          <div className="segmented" role="group" aria-label="Lifting days a week">
            {[2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button" className={f.days === n ? 'on' : ''} aria-pressed={f.days === n} onClick={() => setFit({ days: n })}>{n}</button>
            ))}
          </div>
          <h3>Also each week</h3>
          <p className="muted small">Added on rest days first (the weekend, then midweek), or after a lifting day when the week is full.</p>
          <div className="stack tight">
            {EXTRA_DAYS.map((d) => {
              const n = f.extraDays?.[d.id] ?? 0
              return (
                <div key={d.id} className="row-between extra-day-row">
                  <span><strong className="small">{d.label}</strong><br /><span className="muted small">{d.detail} <Why claims={DAY_TYPE_CLAIMS[d.id]} /></span></span>
                  <span className="stepper" role="group" aria-label={`${d.label} sessions a week`}>
                    <button type="button" className="secondary small icon-only" onClick={() => stepExtra(d.id, -1)} disabled={!n} aria-label={`One fewer ${d.label.toLowerCase()} session`}><Icon name="minus" size={14} /></button>
                    <span className="stepper-n">{n}</span>
                    <button type="button" className="secondary small icon-only" onClick={() => stepExtra(d.id, 1)} disabled={n >= 3} aria-label={`One more ${d.label.toLowerCase()} session`}><Icon name="plus" size={14} /></button>
                  </span>
                </div>
              )
            })}
          </div>
        </>
      ) : <WeekEditor f={f} setFit={setFit} />}
      <label className="field">
        <span>Minutes for each stretch, yoga or balance part</span>
        <select value={f.extraMin ?? DEFAULT_EXTRA_MIN} onChange={(e) => setFit({ extraMin: Number(e.target.value) })}>
          {EXTRA_MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
        </select>
      </label>
    </>
  )
}

/** Your own week: tick what each day holds; mix lifting with stretch, yoga or balance. */
function WeekEditor({ f, setFit }: { f: FitnessSettings; setFit: (patch: Partial<FitnessSettings>) => void }) {
  const week = f.week?.length === 7 ? f.week : weekLayout(f)
  const toggle = (d: number, part: DayPart) => {
    const day = week[d]
    let next: DayPart[]
    if (day.includes(part)) next = day.filter((x) => x !== part)
    // Full body covers everything, so it replaces other lifting types (and they replace it).
    else if (part === 'full') next = [...day.filter((x) => !LIFT_DAYS.some((l) => l.id === x)), part]
    else if (LIFT_DAYS.some((l) => l.id === part)) next = [...day.filter((x) => x !== 'full'), part]
    else next = [...day, part]
    const order = [...LIFT_DAYS, ...EXTRA_DAYS].map((x) => x.id as DayPart)
    setFit({ week: week.map((x, i) => (i === d ? next.sort((a, b) => order.indexOf(a) - order.indexOf(b)) : x)) })
  }
  const lifting = week.filter((d) => d.some((x) => LIFT_DAYS.some((l) => l.id === x))).length
  return (
    <>
      <h3>Your days</h3>
      <p className="muted small">Tick what each day holds; leave a day empty to rest. Lifting types can be combined (Push + Legs), and any day can add stretch, yoga or balance.</p>
      <div className="week-editor">
        {week.map((day, d) => (
          <div key={d} className="week-editor-day">
            <span className="week-editor-name">{FULL_DAYS[d]}{!day.length && <span className="muted small"> · rest</span>}</span>
            <div className="trigger-list">
              {[...LIFT_DAYS, ...EXTRA_DAYS].map((x) => {
                const on = day.includes(x.id)
                return (
                  <button key={x.id} type="button" className={`toggle-chip small ${on ? 'on' : ''} ${EXTRA_DAYS.some((e) => e.id === x.id) ? 'extra' : ''}`} aria-pressed={on} onClick={() => toggle(d, x.id)} title={x.detail}>
                    {on && <Icon name="check" size={13} />} {x.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="muted small">{lifting} lifting day{lifting === 1 ? '' : 's'}. Each muscle twice a week grows best; the week list says if anything is left out. <Why claims={[PRINCIPLES.find((x) => x.id === 'frequency')!]} /></p>
    </>
  )
}

/** Regions to stretch more and posture goals; both shape the stretch, yoga and cool-down parts of the week. */
function StretchSetup({ f, setFit, program, onWeek }: { f: FitnessSettings; setFit: (patch: Partial<FitnessSettings>) => void; program: Program; onWeek: () => void }) {
  const regions = f.stretchRegions ?? []
  const goals = f.postureGoals ?? []
  const toggleRegion = (r: Region) => setFit({ stretchRegions: regions.includes(r) ? regions.filter((x) => x !== r) : [...regions, r] })
  const toggleGoal = (g: PostureGoalId) => setFit({ postureGoals: goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g] })
  const stretchDays = program.sessions.filter((s) => s.blocks.some((b) => b.kind === 'stretch' || b.kind === 'yoga')).length
  return (
    <div className="stack tight">
      <p className="muted small">
        {stretchDays
          ? `Your week has ${stretchDays} stretch or yoga session${stretchDays > 1 ? 's' : ''}; they start with what you pick here.`
          : 'With no stretch or yoga day, what you pick here becomes short cool-down stretches after lifting.'}{' '}
        <button type="button" className="link small" onClick={onWeek}>Add stretch, yoga or balance days</button>
      </p>

      <h3>Regions to stretch more</h3>
      <div className="trigger-list">
        {REGIONS.map((r) => {
          const on = regions.includes(r.id)
          return (
            <button key={r.id} type="button" className={`toggle-chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleRegion(r.id)} title={r.detail}>
              {on && <Icon name="check" size={14} />} {r.label}
            </button>
          )
        })}
      </div>
      <p className="muted small"><Why claims={DAY_TYPE_CLAIMS.stretch} label="What stretching does" /></p>

      <h3>Posture and mobility goals</h3>
      <p className="muted small">Each adds stretches for the areas involved and a little strength work on two days a week.</p>
      {POSTURE_GOALS.map((g) => {
        const on = goals.includes(g.id)
        return (
          <div key={g.id} className={`posture-goal ${on ? 'on' : ''}`}>
            <label className="posture-goal-head">
              <input type="checkbox" checked={on} onChange={() => toggleGoal(g.id)} />
              <span><strong>{g.label}</strong><small>{g.detail}</small></span>
            </label>
            {on && (
              <div className="posture-goal-body small">
                <p>{g.tip}</p>
                <p className="muted">Stretches: {g.stretch.map((r) => REGIONS.find((x) => x.id === r)!.label.toLowerCase()).join(', ')}. Strength: {g.strengthen.map((w) => EXERCISE_NAME(w.options[0])).join(', ')}{g.strengthen.some((w) => w.options.length > 1) ? ' (or what fits your equipment)' : ''}. <Why claims={g.claims} convention={g.convention} /></p>
              </div>
            )}
          </div>
        )
      })}
    </div>
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

      <WeekSetup f={f} setFit={setFit} />

      <div className="form-grid">
        <label className="field">
          <span>Minutes of lifting per session</span>
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
          Side delts, lats, upper chest, biceps, triceps and abs, with exercises chosen for them.{hasCondition(p, 'looks') && ' Fits your Skin & looks goal.'}{' '}
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
      </div>

      <h3>Where you train</h3>
      <p className="muted small">Pick a starting point, then tick exactly what you have. Add more places (home, a hotel) any time from the Train tab.</p>
      <EquipmentEditor f={f} setFit={setFit} />

      <h3>Injuries and limitations</h3>
      <LimitsEditor f={f} p={p} setFit={setFit} />

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
function Extras({ f, setFit, onPosture }: { f: FitnessSettings; setFit: (patch: Partial<FitnessSettings>) => void; onPosture: () => void }) {
  const toggle = (id: TrainingAddOn) => {
    const on = !!f.addOns?.includes(id)
    setFit({ addOns: on ? (f.addOns ?? []).filter((x) => x !== id) : [...(f.addOns ?? []), id] })
  }
  const tendon = !!f.addOns?.includes('tendon')
  const fascia = !!f.addOns?.includes('fascia')
  return (
    <div className="stack tight">
      <label className={`toggle compact ${fascia ? 'on' : ''}`}>
        <input type="checkbox" checked={fascia} onChange={() => toggle('fascia')} />
        <span><strong>Fascia & mobility</strong><small>Full-range lifting, short comfortable stretches, rolling after hard sessions and foot work. <Why label="What works" claims={FASCIA.claims} convention={FASCIA.convention} /></small></span>
      </label>
      {fascia && (
        <>
          <DrillList drills={FASCIA.drills} />
          <p className="muted small">It works by your body tolerating more stretch, not by “releasing” fascia, so keep it regular: the gains fade within weeks of stopping. <Why claims={[FASCIA.mechanism, { text: 'Flexibility gains partly faded within 2–6 weeks of stopping.', evidence: 'limited', sources: ['konrad_detrain'] }]} /></p>
          <p className="muted small">{FASCIA.safety.text} <Why sources={FASCIA.safety.sources} label="Source" /></p>
          <p className="muted small">Standing tall: you’re 1–2 cm shorter by evening and get it back lying down; after your teens, no routine makes bones longer. <Why claims={FASCIA.height} /></p>
        </>
      )}
      <label className={`toggle compact ${tendon ? 'on' : ''}`}>
        <input type="checkbox" checked={tendon} onChange={() => toggle('tendon')} />
        <span><strong>Injury-proofing</strong><small>{TENDON.dose} <Why claims={TENDON.claims} /></small></span>
      </label>
      <p className="muted small">Posture work (forward head, rounded shoulders, pelvic tilt and more) now lives in <button type="button" className="link small" onClick={onPosture}>Stretch & posture</button>, where it’s built into your week.</p>
    </div>
  )
}

/** Today's logged sets, or last time's, under an exercise in the list. */
function LastLine({ log, x, date, unit }: { log: LiftEntry[]; x: PlannedExercise; date: string; unit: WeightUnit }) {
  const kind = logKind(x.exercise)
  const todays = log.find((e) => e.exercise === x.exercise.id && e.date === date && e.sets.some(hasValue))
  const e = todays ?? lastBefore(log, x.exercise.id, date)
  if (!e) return null
  const sets = inUnit(e, unit).sets.filter(hasValue).map((s) => setText(s, kind, unit)).join(' · ')
  const tail = kind === 'weight' ? ` ${unit}` : kind === 'reps' ? ' reps' : ''
  return <span className={`small lift-logged ${todays ? 'today' : ''}`}>{todays ? <><Icon name="check" size={13} /> Today: </> : 'Last time: '}{sets}{tail}</span>
}

/** "rest 2–3 min" that starts the rest timer at the low end, without opening the exercise guide. */
function RestButton({ rest }: { rest: string }) {
  const sec = parseRest(rest)
  if (!sec) return <>rest {rest}</>
  return (
    <button type="button" className="lift-rest" onClick={(e) => { e.stopPropagation(); restStart(sec) }} aria-label={`Start a ${rest} rest`}>
      <Icon name="timer" size={13} /> rest {rest}
    </button>
  )
}

/** Posture and mobility drills; tap one for its diagram. */
function DrillList({ drills }: { drills: Drill[] }) {
  const [open, setOpen] = useState<Drill | null>(null)
  return (
    <>
      <ol className="lift-list">
        {drills.map((d) => (
          <li key={d.id} className="lift-tap" onClick={() => setOpen(d)}>
            <div className="row-between">
              <button type="button" className="lift-name" aria-label={`How to do ${d.name}`}>
                <strong>{d.name}</strong> <Icon name="info" size={15} />
              </button>
              <span className="lift-dose">{d.dose}</span>
            </div>
            <span className="small lift-cue">{d.cue}</span>
          </li>
        ))}
      </ol>
      {open && <DrillSheet drill={open} onClose={() => setOpen(null)} />}
    </>
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

      <LiftingRules />

      <h3>Mobility, fascia and height myths</h3>
      <p className="muted small">Popular claims, checked against the research.</p>
      {MOBILITY_MYTHS.map((m) => (
        <div key={m.myth} className="claim">
          <p className="small"><strong>“{m.myth}”</strong></p>
          <p className="small">{m.claim.text} <Sourced evidence={m.claim.evidence} ids={m.claim.sources} /></p>
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
  const [draft, setDraft] = useState<Record<'weightLb' | 'waistIn' | 'gripKg' | 'hangSec' | 'heightIn', string>>({ weightLb: '', waistIn: '', gripKg: '', hangSec: '', heightIn: '' })
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
    setDraft({ weightLb: '', waistIn: '', gripKg: '', hangSec: '', heightIn: '' })
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
  if (t.height) {
    const lost = Math.max(t.height.recentLossCm, t.height.tallestLossCm)
    rows.push(
      <li key="ht" className={t.height.flag ? 'warn-text' : undefined}>
        Height: <strong>{t.height.latestIn} in</strong>
        {t.height.flag
          ? `, about ${lost.toFixed(1)} cm below your tallest. That’s more than usual; mention it to your doctor, who may check your bones.`
          : lost >= 0.5 ? `, ${lost.toFixed(1)} cm below your tallest: within the normal range.` : '.'}{' '}
        <Why claims={[CHECKINS.height]} convention={CHECKINS.height.convention} />
      </li>,
    )
  }
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
        {field('heightIn', 'Height, in the morning', 'in')}
      </div>
      <div className="add-row">
        <button className="primary" onClick={save}>Save check-in</button>
        {saved && <span className="good-text small" role="status">{saved}</span>}
      </div>
    </div>
  )
}
