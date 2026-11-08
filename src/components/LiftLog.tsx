import { useState } from 'react'
import type { Exercise } from '../data/training'
import { best, dayLabel, fmt, hasValue, history, inUnit, lastBefore, logKind, nextHint, rangeTop, saveEntry, setText, today, type LogKind } from '../lib/lifts'
import type { PlannedExercise } from '../lib/training'
import { parseRest, restStart } from '../lib/timer'
import type { LiftEntry, LoggedSet, WeightUnit } from '../types'
import { Icon } from './Icon'
import type { ViewProps } from './ui'

/** A set is logged once every number it needs is in: weight and reps, reps, or seconds. */
const complete = (s: LoggedSet, kind: LogKind) =>
  kind === 'weight' ? s.weight !== undefined && s.reps !== undefined : kind === 'reps' ? s.reps !== undefined : s.sec !== undefined

const num = (v: string): number | undefined => {
  if (v.trim() === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

/**
 * Today's sets for one exercise, pre-filled from last time, with the next-weight hint and a
 * progress chart. Tapping a set's check saves it (using the grey suggestions if left blank)
 * and starts the rest timer.
 */
export function LiftLog({ exercise, dose, state, update }: ViewProps & { exercise: Exercise; dose?: PlannedExercise }) {
  const kind = logKind(exercise)
  const unit: WeightUnit = state.fitness.weightUnit ?? 'lb'
  const date = today()
  const saved = state.liftLog.find((e) => e.exercise === exercise.id && e.date === date)
  const entry: LiftEntry = saved ? inUnit(saved, unit) : { date, exercise: exercise.id, unit, sets: [] }
  const last = lastBefore(state.liftLog, exercise.id, date)
  const lastSets = last ? inUnit(last, unit).sets : []
  const hint = nextHint(last, exercise, dose?.reps, unit)
  const [extra, setExtra] = useState(0)
  const rows = Math.max(dose?.sets ?? 3, entry.sets.length) + extra
  const topReps = dose ? rangeTop(dose.reps) : null

  const save = (sets: LoggedSet[]) => update((s) => ({ ...s, liftLog: saveEntry(s.liftLog, { ...entry, sets }) }))
  const setAt = (i: number, patch: LoggedSet) => {
    const sets = Array.from({ length: Math.max(entry.sets.length, i + 1) }, (_, k) => entry.sets[k] ?? {})
    sets[i] = { ...sets[i], ...patch }
    save(sets)
  }
  // Grey suggestions: the hinted weight, else last time's set; reps from last time, else the top of the range.
  const suggest = (i: number): LoggedSet => {
    const prev = lastSets[i] ?? lastSets[lastSets.length - 1]
    return {
      weight: kind === 'weight' ? (hint?.weight ?? prev?.weight) : undefined,
      reps: kind !== 'hold' ? (prev?.reps ?? topReps ?? undefined) : undefined,
      sec: kind === 'hold' ? (prev?.sec ?? topReps ?? undefined) : undefined,
    }
  }
  const tick = (i: number) => {
    const cur = entry.sets[i] ?? {}
    if (complete(cur, kind)) return setAt(i, { weight: undefined, reps: undefined, sec: undefined })
    const s = suggest(i)
    setAt(i, { weight: cur.weight ?? s.weight, reps: cur.reps ?? s.reps, sec: cur.sec ?? s.sec })
    const rest = dose ? parseRest(dose.rest) : null
    if (rest) restStart(rest)
  }
  const setUnit = (u: WeightUnit) => update((s) => ({ ...s, fitness: { ...s.fitness, weightUnit: u } }))

  return (
    <section className="lift-log" aria-label="Log your sets">
      <div className="row-between">
        <h3>Today’s sets</h3>
        {kind === 'weight' && (
          <div className="segmented unit-switch" role="group" aria-label="Weight unit">
            {(['lb', 'kg'] as const).map((u) => <button key={u} className={unit === u ? 'on' : ''} aria-pressed={unit === u} onClick={() => setUnit(u)}>{u}</button>)}
          </div>
        )}
      </div>
      {hint && <p className="small lift-hint"><Icon name="target" size={15} /> {hint.text}</p>}
      {last && <p className="muted small lift-last">Last time, {dayLabel(last.date)}: {lastSets.filter(hasValue).map((s) => setText(s, kind, unit)).join(' · ')}{kind === 'weight' ? ` ${unit}` : kind === 'reps' ? ' reps' : ''}</p>}

      <ol className="set-rows">
        {Array.from({ length: rows }, (_, i) => {
          const cur = entry.sets[i] ?? {}
          const sug = suggest(i)
          const done = complete(cur, kind)
          return (
            <li key={i} className={done ? 'done' : ''}>
              <span className="set-n">{i + 1}</span>
              {kind === 'weight' && (
                <label className="set-field">
                  <input type="number" inputMode="decimal" step="any" min={0} value={cur.weight ?? ''} placeholder={sug.weight !== undefined ? fmt(sug.weight) : unit}
                    onChange={(e) => setAt(i, { weight: num(e.target.value) })} aria-label={`Set ${i + 1} weight in ${unit}`} />
                  <span>{unit}</span>
                </label>
              )}
              {kind !== 'hold' ? (
                <label className="set-field">
                  {kind === 'weight' && <span className="times">×</span>}
                  <input type="number" inputMode="numeric" step={1} min={0} value={cur.reps ?? ''} placeholder={sug.reps !== undefined ? String(sug.reps) : 'reps'}
                    onChange={(e) => setAt(i, { reps: num(e.target.value) })} aria-label={`Set ${i + 1} reps`} />
                  <span>reps</span>
                </label>
              ) : (
                <label className="set-field">
                  <input type="number" inputMode="numeric" step={1} min={0} value={cur.sec ?? ''} placeholder={sug.sec !== undefined ? String(sug.sec) : 'sec'}
                    onChange={(e) => setAt(i, { sec: num(e.target.value) })} aria-label={`Set ${i + 1} seconds`} />
                  <span>s</span>
                </label>
              )}
              <button className="set-check" onClick={() => tick(i)} aria-pressed={done} aria-label={done ? `Clear set ${i + 1}` : `Log set ${i + 1}`}>
                <Icon name="check" size={18} />
              </button>
            </li>
          )
        })}
      </ol>
      <div className="row-between lift-log-foot">
        <button className="link small" onClick={() => setExtra(extra + 1)}><Icon name="plus" size={14} /> Add a set</button>
        <span className="muted small">Tick a set to log it{dose && parseRest(dose.rest) ? ' and start your rest' : ''}.</span>
      </div>

      <Progress entries={history(state.liftLog, exercise.id)} kind={kind} unit={unit} />
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
