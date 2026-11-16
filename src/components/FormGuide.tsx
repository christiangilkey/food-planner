import { DIAGRAMS, DRILL_DIAGRAMS } from '../data/diagrams'
import { FORM, FORM_RULES, STRETCHES, type FormEvidence, type FormRule, type Stretch } from '../data/form'
import { useState } from 'react'
import { EXERCISE_BY_ID, HEAD_INFO, HEADS, type Drill } from '../data/training'
import { ExerciseDiagram } from './ExerciseDiagram'
import { LiftLog } from './LiftLog'
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
  /** Show set logging at the top, with the plan's sets, reps and rest for this exercise. */
  log?: ViewProps & { dose?: PlannedExercise }
}) {
  const ex = EXERCISE_BY_ID[id]
  const g = FORM[id]
  if (!ex || !g) return null
  return (
    <Sheet title={ex.name} onClose={onClose}>
      <div className="form-guide">
        {log && <LiftLog exercise={ex} dose={log.dose} state={log.state} update={log.update} />}
        {log?.dose && <SwapPanel x={log.dose} state={log.state} update={log.update} onDone={onClose} />}
        {log && <h3>How to do it</h3>}
        {DIAGRAMS[id] && <ExerciseDiagram d={DIAGRAMS[id]} name={ex.name} />}
        <p className="muted small form-cue">{ex.cue}</p>

        <MusclesUsed id={id} />

        <h3>Set up</h3>
        <ol className="form-steps">{g.setup.map((s) => <li key={s}>{s}</li>)}</ol>

        <h3>Do it</h3>
        <ol className="form-steps">{g.execution.map((s) => <li key={s}>{s}</li>)}</ol>

        <h3>Breathe</h3>
        <p className="small">{g.breathing}</p>
        {careful && (
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

        <h3>Stretch afterwards</h3>
        {g.stretches.map((sid) => <StretchCard key={sid} s={STRETCHES[sid]} />)}
        <p className="muted small"><RuleLine id="stretch_weekly" /> <RuleLine id="stretch_pre_short" /></p>

        <p className="muted small">Setup and movement cues are coaching guidance (ACE and common practice), not tested one by one in trials.</p>
      </div>
    </Sheet>
  )
}

const ROLES: { key: 'prime' | 'assist' | 'stabilize'; title: string }[] = [
  { key: 'prime', title: 'Main movers' },
  { key: 'assist', title: 'Helpers' },
  { key: 'stabilize', title: 'Steadying' },
]

/** The muscles and muscle heads an exercise works, by how much. */
function MusclesUsed({ id }: { id: string }) {
  const h = HEADS[id]
  if (!h) return null
  return (
    <section className="muscles-used" aria-label="Muscles worked">
      <h3>Muscles worked</h3>
      {ROLES.map(({ key, title }) => {
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
      <p className="muted small">From anatomy and muscle-activity studies; which head works hardest varies a little from person to person. <Why sources={['pm_26214739']} label="Note" convention="Muscle activity in a lift doesn’t always predict which muscle grows most." /></p>
    </section>
  )
}

/** Swap a planned exercise for one that fits your equipment and body, or stop it being planned. */
function SwapPanel({ x, state, update, onDone }: ViewProps & { x: PlannedExercise; onDone: () => void }) {
  const [open, setOpen] = useState(false)
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
  return (
    <div className="swap-panel">
      <div className="add-row">
        <button type="button" className="secondary small with-icon" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="reset" size={14} /> Swap this exercise</button>
        <button type="button" className="ghost small" onClick={() => { setFit({ avoid: [...new Set([...(f.avoid ?? []), x.exercise.id])] }); onDone() }}>Don’t plan this</button>
      </div>
      {x.swappedFrom && EXERCISE_BY_ID[x.swappedFrom] && (
        <p className="muted small">Your swap for {EXERCISE_BY_ID[x.swappedFrom].name}. <button type="button" className="link small" onClick={() => swapTo(original)}>Go back to it</button></p>
      )}
      {open && (
        alts.length ? (
          <ul className="swap-list">
            {alts.map((e) => (
              <li key={e.id}>
                <button type="button" className="swap-option" onClick={() => swapTo(e.id)}>
                  <strong>{e.name}</strong>
                  <span className="muted small">{e.compound ? 'Compound' : 'Isolation'} · {e.cue}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="muted small">Nothing else for this muscle fits {activePlace(f).name}’s equipment and your limitations. Tick more equipment to see options.</p>
      )}
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
