import { DIAGRAMS, DRILL_DIAGRAMS } from '../data/diagrams'
import { FORM, FORM_RULES, STRETCHES, type FormEvidence, type FormRule, type Stretch } from '../data/form'
import { useState } from 'react'
import { EXERCISE_BY_ID, HEAD_INFO, HEADS, isLift, kindOf, REGION_LABEL, type Drill, type Exercise } from '../data/training'
import { ExerciseDiagram } from './ExerciseDiagram'
import { LiftLog } from './LiftLog'
import { RestBar } from './WorkoutTimer'
import { compareExercises, headline, swapTag, type SwapPoint } from '../lib/compare'
import { activePlace, alternativesFor, type PlannedExercise } from '../lib/training'
import type { FitnessSettings } from '../types'
import { Icon } from './Icon'
import { Sheet, Why, type ViewProps } from './ui'

const CONVENTION = 'Coaching guidance (ACE and common practice); no trial has tested this specifically.'
const rule = (id: string) => FORM_RULES.find((r) => r.id === id)!

/** Evidence behind a guide line: a level and sources, or "coaching guidance" when no trial exists. */
function Evidence({ evidence, sources, note, label }: { evidence: FormEvidence; sources: FormRule['sources']; note?: string; label?: string }) {
  return evidence === 'convention'
    ? <Why sources={sources} convention={CONVENTION} label={label} />
    : <Why evidence={evidence} sources={sources} convention={note} label={label} />
}

/** One rule from the research as a plain line with its "Why?". */
export function RuleLine({ id }: { id: string }) {
  const r = rule(id)
  return <>{r.text} <Evidence evidence={r.evidence} sources={r.sources} note={r.note} /></>
}

/**
 * How to do one exercise: setup, the movement, breathing, mistakes, any evidence-based safety
 * note, easier and harder versions, and the stretches for the muscles it trains.
 * `careful` switches breathing advice to "breathe throughout" (high blood pressure, pregnancy).
 */
export function FormSheet({ id, careful, onClose, log }: {
  id: string; careful: boolean; onClose: () => void
  /** Show the rest timer and logging at the top, with the plan's dose for this exercise and the day it's on. */
  log?: ViewProps & { dose?: PlannedExercise; weekday?: number }
}) {
  const ex = EXERCISE_BY_ID[id]
  const g = FORM[id]
  if (!ex || !g) return null
  const lift = isLift(ex)
  return (
    <Sheet title={ex.name} onClose={onClose}>
      <div className="form-guide">
        {log && <RestBar rest={log.dose && lift ? log.dose.rest : undefined} />}
        {log && <LiftLog exercise={ex} dose={log.dose} state={log.state} update={log.update} onLogged={onClose} />}
        {log?.dose && <SwapPanel x={log.dose} weekday={log.weekday} state={log.state} update={log.update} onDone={onClose} />}
        {log && <h3>How to do it</h3>}
        {DIAGRAMS[id] && <ExerciseDiagram d={DIAGRAMS[id]} name={ex.name} />}
        <p className="muted small form-cue">{ex.cue}</p>
        {!lift && ex.hold && <p className="small"><strong>How much:</strong> {ex.hold}{ex.regions?.length ? ` · for your ${ex.regions.map((r) => REGION_LABEL[r].toLowerCase()).join(', ')}` : ''}</p>}

        <MusclesUsed e={ex} />

        <h3>Set up</h3>
        <ol className="form-steps">{g.setup.map((s) => <li key={s}>{s}</li>)}</ol>

        <h3>Do it</h3>
        <ol className="form-steps">{g.execution.map((s) => <li key={s}>{s}</li>)}</ol>

        <h3>Breathe</h3>
        <p className="small">{g.breathing}</p>
        {careful && lift && (
          <p className="small warn-text"><RuleLine id="breath_avoid_hold" /></p>
        )}

        <h3>Avoid</h3>
        <ul className="form-mistakes">{g.mistakes.map((m) => <li key={m}><Icon name="x" size={14} /> {m}</li>)}</ul>

        {g.safety && (
          <p className="small form-safety"><Icon name="shield" size={15} /> {g.safety.text} <Why sources={g.safety.sources} label="Source" /></p>
        )}

        <div className="form-variants">
          <div><span className="eyebrow">Easier</span><span className="small">{g.easier}</span></div>
          <div><span className="eyebrow">Harder</span><span className="small">{g.harder}</span></div>
        </div>

        {g.stretches.length > 0 && (
          <>
            <h3>Stretch afterwards</h3>
            {g.stretches.map((sid) => <StretchCard key={sid} s={STRETCHES[sid]} />)}
            <p className="muted small"><RuleLine id="stretch_weekly" /> <RuleLine id="stretch_pre_short" /></p>
          </>
        )}
        {!lift && kindOf(ex) !== 'balance' && <p className="muted small"><RuleLine id="stretch_weekly" /></p>}

        <p className="muted small">Setup and movement cues are coaching guidance (ACE and common practice), not tested one by one in trials.</p>
      </div>
    </Sheet>
  )
}

/** Labels for who does the work, by kind of exercise. */
function roles(e: Exercise): { key: 'prime' | 'assist' | 'stabilize'; title: string }[] {
  const k = kindOf(e)
  if (k === 'mobility' || k === 'yoga') return [{ key: 'prime', title: 'Stretched most' }, { key: 'assist', title: 'Working to hold it' }, { key: 'stabilize', title: 'Steadying' }]
  if (k === 'balance') return [{ key: 'prime', title: 'Keeping you steady' }, { key: 'assist', title: 'Helpers' }, { key: 'stabilize', title: 'Also working' }]
  return [{ key: 'prime', title: 'Main movers' }, { key: 'assist', title: 'Helpers' }, { key: 'stabilize', title: 'Steadying' }]
}

/** The muscles and muscle heads an exercise works, by how much. */
function MusclesUsed({ e }: { e: Exercise }) {
  const h = HEADS[e.id]
  if (!h) return null
  const lift = isLift(e)
  return (
    <section className="muscles-used" aria-label="Muscles worked">
      <h3>{lift ? 'Muscles worked' : kindOf(e) === 'balance' ? 'Muscles that keep you steady' : 'Muscles stretched and working'}</h3>
      {roles(e).map(({ key, title }) => {
        const list = h[key] ?? []
        if (!list.length) return null
        return (
          <div key={key} className={`muscle-role role-${key}`}>
            <span className="eyebrow">{title}</span>
            <ul>
              {list.map((m) => (
                <li key={m}>
                  <span className="muscle-dot" aria-hidden />
                  <span><strong>{HEAD_INFO[m].label}</strong> <span className="muted small">{HEAD_INFO[m].area}</span><br /><span className="small">{HEAD_INFO[m].note}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      {h.note && <p className="small muted">{h.note}</p>}
      {lift && <p className="muted small">From anatomy and muscle-activity studies; which head works hardest varies a little from person to person. <Why sources={['pm_26214739']} label="Note" convention="Muscle activity in a lift doesn’t always predict which muscle grows most." /></p>}
    </section>
  )
}


const TONE_ICON = { gain: 'plus', lose: 'minus', info: 'info' } as const

function PointLine({ p }: { p: SwapPoint }) {
  return (
    <li className={`swap-point tone-${p.tone}`}>
      <Icon name={TONE_ICON[p.tone]} size={14} />
      <span className="small">{p.text} {p.claim ? <Why claims={[p.claim]} /> : p.convention ? <Why convention={p.convention} /> : null}</span>
    </li>
  )
}

/** What swapping changes, then the button to do it. */
function SwapDetail({ from, to, onSwap }: { from: Exercise; to: Exercise; onSwap: () => void }) {
  const c = compareExercises(from, to)
  return (
    <div className="swap-detail">
      <p className="small">{c.summary} {c.claim && <Why claims={[c.claim]} />}</p>
      <ul className="swap-points">{c.points.map((p) => <PointLine key={p.text} p={p} />)}</ul>
      <button className="primary small" onClick={onSwap}><Icon name="reset" size={14} /> Swap to {to.name}</button>
    </div>
  )
}

/**
 * Choose a replacement for a planned exercise: every option that fits your equipment and body,
 * each with what it changes and why. Swaps apply wherever the plan uses that exercise.
 */
export function SwapChooser({ x, weekday, state, update, onDone }: ViewProps & { x: PlannedExercise; weekday?: number; onDone: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const f = state.fitness
  const original = x.swappedFrom ?? x.exercise.id
  const alts = alternativesFor(x.exercise, f, state.profile).filter((e) => e.id !== original)
  const setFit = (patch: Partial<FitnessSettings>) => update((s) => ({ ...s, fitness: { ...s.fitness, ...patch } }))
  const swapTo = (to: string) => {
    const swaps = { ...f.swaps }
    if (to === original) delete swaps[original]
    else swaps[original] = to
    setFit({ swaps })
    onDone()
  }
  const removeFromDay = () => {
    if (weekday === undefined) return
    const key = String(weekday)
    const edit = f.dayEdits?.[key] ?? {}
    const next = x.added
      ? { ...edit, add: (edit.add ?? []).filter((id) => id !== x.exercise.id) }
      : { ...edit, remove: [...new Set([...(edit.remove ?? []), original])] }
    setFit({ dayEdits: { ...f.dayEdits, [key]: next } })
    onDone()
  }
  return (
    <div className="swap-chooser">
      {x.swappedFrom && EXERCISE_BY_ID[x.swappedFrom] && (
        <p className="muted small">Your swap for {EXERCISE_BY_ID[x.swappedFrom].name}. <button type="button" className="link small" onClick={() => swapTo(original)}>Go back to it</button></p>
      )}
      {alts.length ? (
        <>
          <p className="muted small">{alts.length} option{alts.length > 1 ? 's' : ''} that fit {activePlace(f).name}’s equipment and your body. Tap one to see what changes compared with {x.exercise.name}.</p>
          <ul className="swap-list">
            {alts.map((e) => {
              const c = compareExercises(x.exercise, e)
              const top = headline(c)
              return (
                <li key={e.id} className={open === e.id ? 'open' : ''}>
                  <button type="button" className="swap-option" aria-expanded={open === e.id} onClick={() => setOpen(open === e.id ? null : e.id)}>
                    <span className="row-between"><strong>{e.name}</strong><Icon name={open === e.id ? 'chevronDown' : 'chevronRight'} size={16} /></span>
                    <span className="muted small">{swapTag(e)}</span>
                    {open !== e.id && top.length > 0 && <span className="small swap-teaser">{top.map((p) => p.text.replace(/\.$/, '')).slice(0, 2).join(' · ')}</span>}
                  </button>
                  {open === e.id && <SwapDetail from={x.exercise} to={e} onSwap={() => swapTo(e.id)} />}
                </li>
              )
            })}
          </ul>
          <p className="muted small">A swap applies wherever the plan uses {EXERCISE_BY_ID[original]?.name ?? x.exercise.name}.</p>
        </>
      ) : <p className="muted small">Nothing else for this fits {activePlace(f).name}’s equipment and your limitations. Tick more equipment to see options.</p>}
      <div className="add-row">
        {weekday !== undefined && <button type="button" className="ghost small" onClick={removeFromDay}>Remove from this day</button>}
        {!x.added && <button type="button" className="ghost small" onClick={() => { setFit({ avoid: [...new Set([...(f.avoid ?? []), x.exercise.id])] }); onDone() }}>Never plan this</button>}
      </div>
    </div>
  )
}

/** In the exercise sheet: a button that opens the swap options in place. */
function SwapPanel({ x, weekday, state, update, onDone }: ViewProps & { x: PlannedExercise; weekday?: number; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="swap-panel">
      <button type="button" className="secondary small with-icon" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="reset" size={14} /> {open ? 'Hide swap options' : 'Swap or remove this exercise'}
      </button>
      {open && <SwapChooser x={x} weekday={weekday} state={state} update={update} onDone={onDone} />}
    </div>
  )
}

/** A posture or mobility drill: its diagram, how much and how to do it. */
export function DrillSheet({ drill, onClose }: { drill: Drill; onClose: () => void }) {
  const d = DRILL_DIAGRAMS[drill.id]
  return (
    <Sheet title={drill.name} onClose={onClose}>
      <div className="form-guide">
        {d && <ExerciseDiagram d={d} name={drill.name} />}
        <h3>How much</h3>
        <p className="small">{drill.dose}</p>
        <h3>How</h3>
        <p className="small">{drill.cue}</p>
        <p className="muted small">The drill list, holds and schedule are this app’s choice, built around the doses in the cited studies.</p>
      </div>
    </Sheet>
  )
}

function StretchCard({ s }: { s: Stretch }) {
  return (
    <div className="stretch-card">
      <div className="row-between">
        <strong className="small">{s.name}</strong>
        <span className="lift-dose small">{s.hold} × {s.sets}</span>
      </div>
      <span className="small">{s.howTo}</span>
      <span className="muted small">
        Stretches {s.muscles.join(', ')}. {s.when === 'after' ? 'After training or on rest days.' : s.when}{' '}
        <Evidence evidence={s.evidence} sources={s.sources} />
      </span>
    </div>
  )
}

const GROUPS: { prefix: string; title: string }[] = [
  { prefix: 'warmup_', title: 'Warming up' },
  { prefix: 'breath_', title: 'Breathing and bracing' },
  { prefix: 'stretch_', title: 'Stretching around lifting' },
  { prefix: 'myth_', title: 'Form myths, checked' },
]

/** Every lifting rule from the research, grouped, for the "How it works" sheet. */
export function LiftingRules() {
  return (
    <>
      {GROUPS.map((grp) => (
        <div key={grp.prefix}>
          <h3>{grp.title}</h3>
          <ul className="explain small">
            {FORM_RULES.filter((r) => r.id.startsWith(grp.prefix)).map((r) => (
              <li key={r.id}>{r.text} <Evidence evidence={r.evidence} sources={r.sources} note={r.note} /></li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
