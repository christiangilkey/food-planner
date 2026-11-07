import { DIAGRAMS, DRILL_DIAGRAMS } from '../data/diagrams'
import { FORM, FORM_RULES, STRETCHES, type FormEvidence, type FormRule, type Stretch } from '../data/form'
import { EXERCISE_BY_ID, type Drill } from '../data/training'
import { ExerciseDiagram } from './ExerciseDiagram'
import { Icon } from './Icon'
import { Sheet, Why } from './ui'

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
export function FormSheet({ id, careful, onClose }: { id: string; careful: boolean; onClose: () => void }) {
  const ex = EXERCISE_BY_ID[id]
  const g = FORM[id]
  if (!ex || !g) return null
  return (
    <Sheet title={ex.name} onClose={onClose}>
      <div className="form-guide">
        {DIAGRAMS[id] && <ExerciseDiagram d={DIAGRAMS[id]} name={ex.name} />}
        <p className="muted small form-cue">{ex.cue}</p>

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
