import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { ACCESS, CHECKINS, EXPERIENCE, HORMONE_CUES, MUSCLES, NOT_FOR_YOU, POSTURE, PRINCIPLES, TENDON, TRAINING_GOALS, VTAPER, type Muscle } from '../data/training'
import { hasCondition } from '../lib/conditions'
import { bodyTrend, buildProgram, fuelAdvice, muscleList, type FuelAdvice, type Session } from '../lib/training'
import { DAYS } from '../lib/plan-utils'
import type { BodyCheckIn, FitnessSettings, Profile, TrainingAddOn } from '../types'
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

          <label className="toggle">
            <input type="checkbox" checked={f.preset === 'vtaper'} onChange={(e) => setFit(e.target.checked ? { preset: 'vtaper', priorities: VTAPER.priorities } : { preset: undefined })} />
            <span>
              <strong>V-taper preset</strong>
              <small>
                Extra work for side delts, lats, upper chest, biceps and abs, with exercises chosen for them.
                {hasCondition(p, 'looks') && ' Fits your Skin & looks goal.'}{' '}
                <Sourced evidence={VTAPER.claim.evidence} ids={VTAPER.claim.sources} convention={VTAPER.claim.convention} />
              </small>
            </span>
          </label>

          <h3>Add-ons</h3>
          <div className="check-grid">
            {([['tendon', 'Injury-proofing', TENDON.dose], ['posture', 'Posture routine', '10 minutes, 2–3 times a week, any time']] as [TrainingAddOn, string, string][]).map(([id, label, detail]) => {
              const on = !!f.addOns?.includes(id)
              return (
                <label key={id} className={`check-card ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => setFit({ addOns: on ? (f.addOns ?? []).filter((x) => x !== id) : [...(f.addOns ?? []), id] })} />
                  <span><strong>{label}</strong><small className="muted"> {detail}</small></span>
                </label>
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

          {f.addOns?.includes('posture') && (
            <section className="card">
              <h2>Posture routine</h2>
              <p className="muted small">About 10 minutes, 2–3 times a week. <Sourced evidence={POSTURE.claim.evidence} ids={POSTURE.claim.sources} convention={POSTURE.convention} /></p>
              <p className="small">{POSTURE.claim.text}</p>
              <ol className="lift-list">
                {POSTURE.drills.map((d) => (
                  <li key={d.name}>
                    <div className="row-between"><strong>{d.name}</strong><span className="lift-dose">{d.dose}</span></div>
                    <span className="small lift-cue">{d.cue}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {f.addOns?.includes('tendon') && (
            <section className="card">
              <h2>Injury-proofing</h2>
              <p className="small">{TENDON.dose}</p>
              {TENDON.claims.map((c) => <div key={c.text} className="claim"><span className="small">{c.text}</span> <Sourced evidence={c.evidence} ids={c.sources} /></div>)}
            </section>
          )}

          <CheckIns state={state} update={update} />

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

          {(p.sex === 'male' || hasCondition(p, 'looks')) && (
            <section className="card">
              <h2>Testosterone: what actually moves it</h2>
              {HORMONE_CUES.map((c) => <div key={c.text} className="claim"><span className="small">{c.text}</span> <Sourced evidence={c.evidence} ids={c.sources} /></div>)}
            </section>
          )}

          <section className="card">
            <h2 className="with-icon"><Icon name="shield" /> Not for you</h2>
            <p className="muted small">Sold for muscle or looks, but harmful or backfiring. The app never plans these or gives doses.</p>
            {NOT_FOR_YOU.map((x) => (
              <div key={x.name} className="claim">
                <p className="small"><strong>{x.name}</strong></p>
                <p className="small">{x.claim.text} <Sourced evidence={x.claim.evidence} ids={x.claim.sources} /></p>
              </div>
            ))}
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

const BAND_TEXT = { healthy: 'Healthy range', increased: 'Increased risk', high: 'High risk' } as const

/** Weekly check-ins: weight (as a weekly average), waist, grip strength and dead-hang time. */
function CheckIns({ state, update }: ViewProps) {
  const today = new Date()
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
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
    setSaved('Saved today’s check-in.')
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
  return (
    <section className="card">
      <h2 className="with-icon"><Icon name="scale" /> Check-ins</h2>
      <p className="muted small">Fill in whatever you measured today; anything left blank is skipped.</p>
      <div className="add-row">
        {field('weightLb', 'Weight', 'lb')}
        {field('waistIn', 'Waist (at the navel)', 'in')}
        {field('gripKg', 'Grip strength', 'kg')}
        {field('hangSec', 'Dead hang', 's')}
      </div>
      <div className="add-row">
        <button className="primary" onClick={save}>Save check-in</button>
        {saved && <span className="good-text small" role="status">{saved}</span>}
      </div>
      <ul className="explain small">
        {t.thisWeek !== undefined && (
          <li>
            Weight: {t.thisWeek.toFixed(1)} lb this week{change !== undefined ? ` (${change >= 0 ? '+' : ''}${change.toFixed(1)} vs last week)` : ''}.{' '}
            <Cite ids={CHECKINS.trend.sources} convention={CHECKINS.trend.convention} />
          </li>
        )}
        {t.waistToHeight !== undefined && (
          <li className={t.whtrBand === 'healthy' ? 'good-text' : 'warn-text'}>
            Waist-to-height {t.waistToHeight.toFixed(2)}: {BAND_TEXT[t.whtrBand!].toLowerCase()}. <Cite ids={CHECKINS.waist.sources} />
          </li>
        )}
        {t.grip && <li>Grip: {t.grip.latest} kg{t.grip.latest !== t.grip.first ? ` (started at ${t.grip.first})` : ''}. <Cite ids={CHECKINS.grip.sources} /></li>}
        {t.hang && <li>Dead hang: {t.hang.latest} s{t.hang.latest !== t.hang.first ? ` (started at ${t.hang.first} s)` : ''}.</li>}
      </ul>
      <details className="methods">
        <summary>Why these four</summary>
        {(['trend', 'waist', 'grip'] as const).map((k) => (
          <div key={k} className="claim"><span className="small">{CHECKINS[k].text}</span> <Sourced evidence={CHECKINS[k].evidence} ids={CHECKINS[k].sources} convention={CHECKINS[k].convention} /></div>
        ))}
        <p className="muted small">Dead-hang time is tracked as a simple grip and shoulder benchmark; there’s no research target for it.</p>
      </details>
    </section>
  )
}
