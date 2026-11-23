import { useState } from 'react'
import { isLift, type Exercise } from '../data/training'
import { best, dayLabel, fmt, hasValue, history, inUnit, lastBefore, logKind, nextHint, rangeTop, saveEntry, setText, today, type LogKind } from '../lib/lifts'
import type { PlannedExercise } from '../lib/training'
import type { LiftEntry, LoggedSet, WeightUnit } from '../types'
import { Icon } from './Icon'
import type { ViewProps } from './ui'

/** A set counts once every number it needs is in: weight and reps, reps, or seconds. */
const complete = (s: LoggedSet, kind: LogKind) =>
  kind === 'weight' ? s.weight !== undefined && s.reps !== undefined : kind === 'reps' ? s.reps !== undefined : s.sec !== undefined

const num = (v: string): number | undefined => {
  if (v.trim() === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

type Draft = { weight: string; reps: string; sec: string }
const toDraft = (s: LoggedSet | undefined): Draft => ({ weight: s?.weight !== undefined ? fmt(s.weight) : '', reps: s?.reps !== undefined ? String(s.reps) : '', sec: s?.sec !== undefined ? String(s.sec) : '' })

/**
 * Today's sets for one exercise. Fill in what you did (blanks take the grey suggestions from last
 * time or the plan) and log the whole exercise with one button; it then shows as done in the list.
 * Stretches, poses and balance drills just get marked done.
 */
export function LiftLog({ exercise, dose, state, update, onLogged }: ViewProps & { exercise: Exercise; dose?: PlannedExercise; onLogged?: () => void }) {
  const date = today()
  const saved = state.liftLog.find((e) => e.exercise === exercise.id && e.date === date)
  if (!isLift(exercise)) return <DoneLog exercise={exercise} dose={dose} logged={!!saved?.sets.some(hasValue)} state={state} update={update} onLogged={onLogged} />
  return <SetLog key={saved ? 'saved' : 'new'} exercise={exercise} dose={dose} state={state} update={update} onLogged={onLogged} />
}

function SetLog({ exercise, dose, state, update, onLogged }: ViewProps & { exercise: Exercise; dose?: PlannedExercise; onLogged?: () => void }) {
  const kind = logKind(exercise)
  const unit: WeightUnit = state.fitness.weightUnit ?? 'lb'
  const date = today()
  const saved = state.liftLog.find((e) => e.exercise === exercise.id && e.date === date)
  const entry: LiftEntry = saved ? inUnit(saved, unit) : { date, exercise: exercise.id, unit, sets: [] }
  const logged = entry.sets.some(hasValue)
  const last = lastBefore(state.liftLog, exercise.id, date)
  const lastSets = last ? inUnit(last, unit).sets : []
  const hint = nextHint(last, exercise, dose?.reps, unit)
  const topReps = dose ? rangeTop(dose.reps) : null
  const [rows, setRows] = useState<Draft[]>(() => {
    const n = Math.max(dose?.sets ?? 3, entry.sets.length)
    return Array.from({ length: n }, (_, i) => toDraft(entry.sets[i]))
  })
  const [edited, setEdited] = useState(false)

  // Grey suggestions: the hinted weight, else last time's set; reps from last time, else the top of the range.
  const suggest = (i: number): LoggedSet => {
    const prev = lastSets[i] ?? lastSets[lastSets.length - 1]
    return {
      weight: kind === 'weight' ? (hint?.weight ?? prev?.weight) : undefined,
      reps: kind !== 'hold' ? (prev?.reps ?? topReps ?? undefined) : undefined,
      sec: kind === 'hold' ? (prev?.sec ?? topReps ?? undefined) : undefined,
    }
  }
  const edit = (i: number, patch: Partial<Draft>) => {
    setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)))
    setEdited(true)
  }
  /** What the rows log as: typed numbers, with blanks filled from the suggestions. */
  const filled = (): LoggedSet[] => rows.map((d, i) => {
    const s = suggest(i)
    const set: LoggedSet = {
      weight: kind === 'weight' ? (num(d.weight) ?? s.weight) : undefined,
      reps: kind !== 'hold' ? (num(d.reps) ?? s.reps) : undefined,
      sec: kind === 'hold' ? (num(d.sec) ?? s.sec) : undefined,
    }
    return complete(set, kind) ? set : {}
  })
  const ready = filled().filter((s) => complete(s, kind)).length
  const log = () => {
    const sets = filled()
    update((s) => ({ ...s, liftLog: saveEntry(s.liftLog, { ...entry, sets }) }))
    setRows(sets.map(toDraft))
    setEdited(false)
    onLogged?.()
  }
  const clear = () => {
    update((s) => ({ ...s, liftLog: saveEntry(s.liftLog, { ...entry, sets: [] }) }))
    setEdited(false)
  }
  const setUnit = (u: WeightUnit) => update((s) => ({ ...s, fitness: { ...s.fitness, weightUnit: u } }))

  return (
    <section className={`lift-log ${logged ? 'is-logged' : ''}`} aria-label="Log your sets">
      <div className="row-between">
        <h3>{logged ? <span className="with-icon good-text"><Icon name="check" size={18} /> Logged today</span> : 'Today’s sets'}</h3>
        {kind === 'weight' && (
          <div className="segmented unit-switch" role="group" aria-label="Weight unit">
            {(['lb', 'kg'] as const).map((u) => <button key={u} className={unit === u ? 'on' : ''} aria-pressed={unit === u} onClick={() => setUnit(u)}>{u}</button>)}
          </div>
        )}
      </div>
      {hint && !logged && <p className="small lift-hint"><Icon name="target" size={15} /> {hint.text}</p>}
      {last && <p className="muted small lift-last">Last time, {dayLabel(last.date)}: {lastSets.filter(hasValue).map((s) => setText(s, kind, unit)).join(' · ')}{kind === 'weight' ? ` ${unit}` : kind === 'reps' ? ' reps' : ''}</p>}

      <ol className="set-rows">
        {rows.map((cur, i) => {
          const sug = suggest(i)
          return (
            <li key={i}>
              <span className="set-n">{i + 1}</span>
              {kind === 'weight' && (
                <label className="set-field">
                  <input type="number" inputMode="decimal" step="any" min={0} value={cur.weight} placeholder={sug.weight !== undefined ? fmt(sug.weight) : unit}
                    onChange={(e) => edit(i, { weight: e.target.value })} aria-label={`Set ${i + 1} weight in ${unit}`} />
                  <span>{unit}</span>
                </label>
              )}
              {kind !== 'hold' ? (
                <label className="set-field">
                  {kind === 'weight' && <span className="times">×</span>}
                  <input type="number" inputMode="numeric" step={1} min={0} value={cur.reps} placeholder={sug.reps !== undefined ? String(sug.reps) : 'reps'}
                    onChange={(e) => edit(i, { reps: e.target.value })} aria-label={`Set ${i + 1} reps`} />
                  <span>reps</span>
                </label>
              ) : (
                <label className="set-field">
                  <input type="number" inputMode="numeric" step={1} min={0} value={cur.sec} placeholder={sug.sec !== undefined ? String(sug.sec) : 'sec'}
                    onChange={(e) => edit(i, { sec: e.target.value })} aria-label={`Set ${i + 1} seconds`} />
                  <span>s</span>
                </label>
              )}
              {rows.length > 1 && (
                <button type="button" className="set-remove" onClick={() => { setRows((r) => r.filter((_, k) => k !== i)); setEdited(true) }} aria-label={`Remove set ${i + 1}`}>
                  <Icon name="x" size={16} />
                </button>
              )}
            </li>
          )
        })}
      </ol>
      <div className="row-between lift-log-foot">
        <button className="link small" onClick={() => { setRows((r) => [...r, toDraft(undefined)]); setEdited(true) }}><Icon name="plus" size={14} /> Add a set</button>
        {logged && <button className="link small" onClick={clear}>Clear today’s log</button>}
      </div>
      {(!logged || edited) && (
        <button className="primary log-button" onClick={log} disabled={!ready}>
          <Icon name="check" size={18} /> {logged ? 'Update the log' : `Log ${ready} set${ready === 1 ? '' : 's'}`}
        </button>
      )}
      {!logged && <p className="muted small">Grey numbers are suggestions: leave a box blank to log the suggestion, or type what you did.</p>}

      <Progress entries={history(state.liftLog, exercise.id)} kind={kind} unit={unit} />
    </section>
  )
}

/** Stretches, yoga poses and balance drills: one tap marks them done for today. */
function DoneLog({ exercise, dose, logged, update, onLogged }: ViewProps & { exercise: Exercise; dose?: PlannedExercise; logged: boolean; onLogged?: () => void }) {
  const date = today()
  const set = (on: boolean) => {
    update((s) => ({ ...s, liftLog: saveEntry(s.liftLog, { date, exercise: exercise.id, unit: s.fitness.weightUnit ?? 'lb', sets: on ? [{ reps: 1 }] : [] }) }))
    if (on) onLogged?.()
  }
  return (
    <section className={`lift-log ${logged ? 'is-logged' : ''}`} aria-label="Mark as done">
      <div className="row-between">
        <h3>{logged ? <span className="with-icon good-text"><Icon name="check" size={18} /> Done today</span> : 'Today'}</h3>
        {(dose?.hold ?? exercise.hold) && <span className="lift-dose">{dose?.hold ?? exercise.hold}</span>}
      </div>
      {logged
        ? <button className="link small" onClick={() => set(false)}>Mark as not done</button>
        : <button className="primary log-button" onClick={() => set(true)}><Icon name="check" size={18} /> Mark as done</button>}
    </section>
  )
}

const TITLE: Record<LogKind, string> = { weight: 'Heaviest set', reps: 'Most reps in a set', hold: 'Longest hold' }
const SUFFIX = (kind: LogKind, unit: WeightUnit) => (kind === 'weight' ? ` ${unit}` : kind === 'reps' ? ' reps' : ' s')

/** Best set per session over the last dozen sessions; tap a point for that day's sets. */
function Progress({ entries, kind, unit }: { entries: LiftEntry[]; kind: LogKind; unit: WeightUnit }) {
  const pts = entries.slice(-12).map((e) => ({ e, v: best(e, kind, unit) })).filter((p): p is { e: LiftEntry; v: number } => p.v !== null)
  const [sel, setSel] = useState<number | null>(null)
  if (pts.length < 2) {
    return <p className="muted small lift-progress-empty">Log this exercise on two days to see your progress here.</p>
  }
  const W = 300, H = 110, PX = 14, PT = 12, PB = 14
  const vals = pts.map((p) => p.v)
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || 1
  const x = (i: number) => PX + (i * (W - 2 * PX)) / (pts.length - 1)
  const y = (v: number) => (hi === lo ? (PT + H - PB) / 2 : PT + (1 - (v - lo) / span) * (H - PT - PB))
  const first = pts[0], lastP = pts[pts.length - 1]
  const change = lastP.v - first.v
  const shown = pts[sel ?? pts.length - 1]
  const suffix = SUFFIX(kind, unit)

  return (
    <div className="lift-progress">
      <div className="row-between">
        <strong className="small">{TITLE[kind]}</strong>
        <span className="small muted">{change === 0 ? 'No change' : `${change > 0 ? '+' : '−'}${fmt(Math.abs(change))}${suffix}`} since {dayLabel(first.e.date)}</span>
      </div>
      <p className="small lift-progress-read" aria-live="polite">
        <strong>{fmt(shown.v)}{suffix}</strong> <span className="muted">· {dayLabel(shown.e.date)} · {inUnit(shown.e, unit).sets.filter(hasValue).map((s) => setText(s, kind, unit)).join(', ')}</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="lift-chart" role="img" aria-label={`${TITLE[kind]} over ${pts.length} sessions, from ${fmt(first.v)} to ${fmt(lastP.v)}${suffix}`}>
        <line className="grid" x1={PX} x2={W - PX} y1={y(hi)} y2={y(hi)} />
        <line className="grid" x1={PX} x2={W - PX} y1={y(lo)} y2={y(lo)} />
        <polyline className="line" points={pts.map((p, i) => `${x(i)},${y(p.v)}`).join(' ')} />
        {pts.map((p, i) => (
          <g key={p.e.date} onClick={() => setSel(i)} className="pt-hit">
            <circle cx={x(i)} cy={y(p.v)} r={14} fill="transparent" />
            <circle className={`pt ${i === (sel ?? pts.length - 1) ? 'on' : ''}`} cx={x(i)} cy={y(p.v)} r={4} />
          </g>
        ))}
      </svg>
      <div className="row-between lift-chart-axis muted"><span>{dayLabel(first.e.date)}</span><span>{dayLabel(lastP.e.date)}</span></div>
      <details className="lift-history">
        <summary className="small">All sessions</summary>
        <ul>
          {[...entries].reverse().map((e) => (
            <li key={e.date} className="small"><span className="muted">{dayLabel(e.date)}</span> {inUnit(e, unit).sets.filter(hasValue).map((s) => setText(s, kind, unit)).join(' · ')}{suffix}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
