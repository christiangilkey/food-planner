import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { ACCESS, EXPERIENCE, MUSCLES, PRINCIPLES, TRAINING_GOALS, type Muscle } from '../data/training'
import { buildProgram, fuelAdvice, muscleList, type FuelAdvice, type Session } from '../lib/training'
import { DAYS } from '../lib/plan-utils'
import type { FitnessSettings, Profile } from '../types'
import { Icon } from './Icon'
import { Bar, Cite, EvidenceChip, Sourced, type ViewProps } from './ui'

const SESSION_LENGTHS = [30, 45, 60, 75, 90]

export function TrainView({ state, update, goTo }: ViewProps & { goTo: (t: Tab) => void }) {
  const f = state.fitness
  const p = state.profile
  const [editing, setEditing] = useState(!f.enabled)
  /** Training settings and the meal-plan link change together. */
  const setFit = (patch: Partial<FitnessSettings>) =>
    update((s) => {
      const fitness = { ...s.fitness, ...patch }
      return { ...s, fitness, profile: { ...s.profile, strengthTraining: fitness.enabled && fitness.feedMealPlan } }
    })
  const setProfile = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const togglePriority = (m: Muscle) => setFit({ priorities: f.priorities.includes(m) ? f.priorities.filter((x) => x !== m) : [...f.priorities, m] })

  const program = useMemo(() => buildProgram(f, p), [f, p])
  const advice = useMemo(() => (f.enabled ? fuelAdvice(state) : []), [f.enabled, state])

  return (
    <div className="stack">
      <section className="card hero">
        <div className="row-between">
          <h1>Training</h1>
          {f.enabled && !editing && <button className="secondary small" onClick={() => setEditing(true)}>Change goals</button>}
        </div>
        {f.enabled && !editing ? (
          <p className="muted">
            {TRAINING_GOALS.find((g) => g.id === f.goal)!.label} · {f.days} days a week · {f.sessionMin} min
            {f.priorities.length > 0 && <> · extra work for {muscleList(f.priorities).toLowerCase()}</>}
          </p>
        ) : (
          <p className="muted">Tell it your goal, the body parts you most want to grow and how often you can train. It builds a week of sessions from the research on training volume, frequency and effort, adjusted for your health conditions, and tells the meal planner what changes.</p>
        )}
      </section>

      {editing && (
        <section className="card">
          <h2>Your goal</h2>
          <div className="radio-list">
            {TRAINING_GOALS.map((g) => (
              <label key={g.id} className={`radio-card ${f.goal === g.id ? 'on' : ''}`}>
                <input type="radio" name="train-goal" checked={f.goal === g.id} onChange={() => setFit({ goal: g.id })} />
                <strong>{g.label}</strong>
                <small>{g.detail}</small>
              </label>
            ))}
          </div>

          <h3>Body parts to grow most</h3>
          <p className="muted small">These get extra weekly sets and go first in each session. Leave empty for balanced growth.</p>
          <div className="trigger-list">
            {MUSCLES.map((m) => {
              const on = f.priorities.includes(m.id)
              return (
                <button key={m.id} type="button" className={`toggle-chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => togglePriority(m.id)}>
                  {on && <Icon name="check" size={14} />} {m.label}
                </button>
              )
            })}
          </div>

          <h3>Days a week</h3>
          <div className="trigger-list">
            {[2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button" className={`toggle-chip ${f.days === n ? 'on' : ''}`} aria-pressed={f.days === n} onClick={() => setFit({ days: n })}>{n} days</button>
            ))}
          </div>

          <div className="add-row">
            <label className="field">
              <span>Minutes per session</span>
              <select value={f.sessionMin} onChange={(e) => setFit({ sessionMin: Number(e.target.value) })}>
                {SESSION_LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
            <label className="field">
              <span>Usual training time</span>
              <input type="time" value={p.workoutTime} onChange={(e) => setProfile({ workoutTime: e.target.value })} />
            </label>
          </div>

          <h3>Experience</h3>
          <div className="radio-list">
            {EXPERIENCE.map((x) => (
              <label key={x.id} className={`radio-card ${f.experience === x.id ? 'on' : ''}`}>
                <input type="radio" name="train-exp" checked={f.experience === x.id} onChange={() => setFit({ experience: x.id })} />
                <strong>{x.label}</strong>
                <small>{x.detail}</small>
              </label>
            ))}
          </div>

          <h3>Where you train</h3>
          <div className="radio-list">
            {ACCESS.map((a) => (
              <label key={a.id} className={`radio-card ${f.access === a.id ? 'on' : ''}`}>
                <input type="radio" name="train-access" checked={f.access === a.id} onChange={() => setFit({ access: a.id })} />
                <strong>{a.label}</strong>
                <small>{a.detail}</small>
              </label>
            ))}
          </div>

          <label className="toggle">
            <input type="checkbox" checked={f.feedMealPlan} onChange={(e) => setFit({ feedMealPlan: e.target.checked })} />
            <span>
              <strong>Use my training in the meal plan</strong>
              <small>Raises your protein target to at least 1.6 g per kg (2.0 in a calorie deficit). Kidney-disease limits still apply. <Cite ids={['morton', 'longland']} /></small>
            </span>
          </label>

          <button className="primary" onClick={() => { setFit({ enabled: true }); setEditing(false) }}>{f.enabled ? 'Done' : 'Build my training plan'}</button>
        </section>
      )}

      {f.enabled && (
        <>
          <section className="card">
            <h2>{program.split}</h2>
            <p className="muted small">{program.splitWhy} <Cite ids={['schoenfeld_freq', 'schoenfeld_freq_2019']} /></p>
            {program.warnings.map((w) => <p key={w} className="warn-text small">{w}</p>)}
          </section>

          {program.sessions.map((s, i) => <SessionCard key={i} s={s} />)}

          <section className="card">
            <h2>Weekly sets per muscle</h2>
            <p className="muted small">Hard sets a week, counting helper muscles in compound lifts as half a set. Priorities aim higher. <Cite ids={['schoenfeld_volume', 'bickel']} convention="The half-set credit for helper muscles and the targets per experience level are this app’s choices." /></p>
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
          </section>

          {program.conditionNotes.length > 0 && (
            <section className="card">
              <h2>With your health conditions</h2>
              {program.conditionNotes.map((c) => (
                <div key={c.text} className="claim">
                  <span className="small">{c.text}</span> <Sourced evidence={c.evidence} ids={c.sources} />
                </div>
              ))}
            </section>
          )}

          <section className="card">
            <h2 className="with-icon"><Icon name="meal" /> What this changes in your meals</h2>
            {advice.map((a) => <AdviceRow key={a.id} a={a} onApply={(patch) => setProfile(patch)} goTo={goTo} />)}
          </section>

          <section className="card">
            <h2 className="with-icon"><Icon name="heartPulse" /> Cardio</h2>
            <p className="small">{program.cardio} <Cite ids={['who_activity', ...(program.cardio.includes('migraine') ? ['varkey' as const] : [])]} /></p>
          </section>

          <section className="card">
            <details className="methods">
              <summary>How this plan is built</summary>
              {PRINCIPLES.map((x) => (
                <div key={x.id} className="claim">
                  <div className="row-between"><strong>{x.title}</strong><EvidenceChip level={x.evidence} /></div>
                  <span className="small">{x.text} <Cite ids={x.sources} convention={x.convention} /></span>
                </div>
              ))}
              <p className="muted small">Training programs by coaches such as Jeff Nippard inspired the structure (splits, weekly sets per muscle, effort targets); the numbers here come from the cited research.</p>
            </details>
          </section>
        </>
      )}
    </div>
  )
}

function SessionCard({ s }: { s: Session }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="card">
      <div className="row-between">
        <h2>{DAYS[s.weekday]} · {s.name}</h2>
        <span className="muted small">about {s.minutes} min</span>
      </div>
      <ol className="lift-list">
        {s.exercises.map((x) => (
          <li key={x.exercise.id}>
            <div className="row-between">
              <strong>{x.exercise.name}</strong>
              <span className="lift-dose">{x.sets} × {x.reps}</span>
            </div>
            <span className="muted small">
              {x.rir !== '—' ? `Stop with ${x.rir} reps left · ` : ''}rest {x.rest}
            </span>
            {(open || x.note) && <span className="small lift-cue">{x.note ?? x.exercise.cue}</span>}
          </li>
        ))}
      </ol>
      <button className="link small" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} technique cues</button>
      <p className="muted small">Warm up with lighter sets of the first exercise. When every set reaches the top of the rep range, add a little weight. <Cite ids={['acsm_progression']} /></p>
    </section>
  )
}

function AdviceRow({ a, onApply, goTo }: { a: FuelAdvice; onApply: (patch: Partial<Profile>) => void; goTo: (t: Tab) => void }) {
  return (
    <div className="claim">
      <div className="row-between"><strong>{a.title}</strong><EvidenceChip level={a.claim.evidence} /></div>
      <p className="small">{a.text}</p>
      <p className="small muted">{a.claim.text} <Cite ids={a.claim.sources} convention={a.convention} /></p>
      {a.meals && a.meals.length > 0 && (
        <ul className="explain small">{a.meals.map((m) => <li key={`${m.day}-${m.slot}`}>{m.day} {m.slot}: {m.name} ({m.protein} g)</li>)}</ul>
      )}
      <div className="add-row">
        {a.apply && <button className="secondary small" onClick={() => onApply(a.apply!.patch)}>{a.apply.label}</button>}
        {a.goTo && <button className="ghost small" onClick={() => goTo(a.goTo!)}>{a.goTo === 'plan' ? 'Open the plan' : 'Open sleep'}</button>}
      </div>
    </div>
  )
}
