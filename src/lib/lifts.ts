import type { Exercise } from '../data/training'
import type { LiftEntry, LoggedSet, WeightUnit } from '../types'

/**
 * Logging sets in Train: what each exercise records, last time's numbers, the "add weight" hint
 * and progress over time. Weights keep the unit they were typed in and are converted for display.
 */

/** Weight and reps for loaded lifts, reps for bodyweight and band moves, seconds for holds. */
export type LogKind = 'weight' | 'reps' | 'hold'

const LOADED = new Set(['barbell', 'dumbbell', 'machine', 'cable'])

export function logKind(e: Exercise): LogKind {
  if (e.isometric) return 'hold'
  return e.gear.some((g) => LOADED.has(g)) ? 'weight' : 'reps'
}

/** Today's date as YYYY-MM-DD in local time. */
export function today(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const LB_PER_KG = 2.20462

/** Convert, rounded to the nearest half unit (plates and dumbbells step in 2.5s and 5s). */
export function convert(w: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return w
  const v = from === 'kg' ? w * LB_PER_KG : w / LB_PER_KG
  return Math.round(v * 2) / 2
}

/** The entry with every weight in `unit`. */
export function inUnit(e: LiftEntry, unit: WeightUnit): LiftEntry {
  if (e.unit === unit) return e
  return { ...e, unit, sets: e.sets.map((s) => (s.weight === undefined ? s : { ...s, weight: convert(s.weight, e.unit, unit) })) }
}

export const hasValue = (s: LoggedSet) => s.weight !== undefined || s.reps !== undefined || s.sec !== undefined

/** One exercise's entries, oldest first, skipping empty ones. */
export function history(log: LiftEntry[], id: string): LiftEntry[] {
  return log.filter((e) => e.exercise === id && e.sets.some(hasValue)).sort((a, b) => a.date.localeCompare(b.date))
}

/** The most recent session before `date`. */
export function lastBefore(log: LiftEntry[], id: string, date: string): LiftEntry | undefined {
  const h = history(log, id).filter((e) => e.date < date)
  return h[h.length - 1]
}

/** Save one day's sets: replaces that day's entry, or removes it when nothing is filled in. */
export function saveEntry(log: LiftEntry[], entry: LiftEntry): LiftEntry[] {
  const rest = log.filter((e) => !(e.exercise === entry.exercise && e.date === entry.date))
  // Trailing empty sets aren't worth keeping.
  const sets = [...entry.sets]
  while (sets.length && !hasValue(sets[sets.length - 1])) sets.pop()
  return sets.length ? [...rest, { ...entry, sets }] : rest
}

/** The top of a prescribed range: "6–10" → 10, "30–60 s hold" → 60, "2 min hold" → 120. */
export function rangeTop(text: string): number | null {
  const m = text.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(min)?/)
  if (!m) return null
  const n = Number(m[2] ?? m[1])
  return m[3] ? n * 60 : n
}

/** Weight steps: smaller for isolation lifts, where small jumps are a bigger share of the load. */
export const step = (unit: WeightUnit, compound: boolean) => (unit === 'lb' ? (compound ? 5 : 2.5) : (compound ? 2.5 : 1))

export interface Hint {
  /** Suggested weight for today (weighted lifts). */
  weight?: number
  text: string
}

/**
 * The progression rule the plan already teaches: when every set reached the top of the range
 * last time, go up a little. Below the top, repeat the weight and aim for more reps.
 */
export function nextHint(last: LiftEntry | undefined, e: Exercise, reps: string | undefined, unit: WeightUnit): Hint | null {
  if (!last || !reps) return null
  const top = rangeTop(reps)
  const kind = logKind(e)
  const sets = inUnit(last, unit).sets.filter(hasValue)
  if (!top || !sets.length) return null
  if (kind === 'hold') {
    return sets.every((s) => (s.sec ?? 0) >= top)
      ? { text: `Every hold reached ${top} s last time: try a harder version or a few seconds more.` }
      : null
  }
  const allTop = sets.every((s) => (s.reps ?? 0) >= top)
  if (kind === 'reps') {
    return allTop ? { text: `Every set reached ${top} reps last time: make it harder (slower, a pause, or a harder version).` } : null
  }
  const heaviest = Math.max(...sets.map((s) => s.weight ?? 0))
  if (!heaviest) return null
  if (allTop) {
    const w = heaviest + step(unit, e.compound)
    return { weight: w, text: `Every set reached ${top} reps last time: try ${fmt(w)} ${unit} today.` }
  }
  return { weight: heaviest, text: `Stay at ${fmt(heaviest)} ${unit} and aim for ${top} reps on every set.` }
}

/** The number a session is charted by: heaviest weight, most reps or longest hold. */
export function best(entry: LiftEntry, kind: LogKind, unit: WeightUnit): number | null {
  const sets = inUnit(entry, unit).sets
  const vals = sets.map((s) => (kind === 'weight' ? s.weight : kind === 'reps' ? s.reps : s.sec)).filter((v): v is number => v !== undefined)
  return vals.length ? Math.max(...vals) : null
}

/** 135 → "135", 62.5 → "62.5". */
export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/** One set as text: "135 × 10", "12 reps", "45 s". */
export function setText(s: LoggedSet, kind: LogKind, unit: WeightUnit): string {
  if (kind === 'hold') return s.sec !== undefined ? `${s.sec} s` : '–'
  if (kind === 'reps') return s.reps !== undefined ? `${s.reps}` : '–'
  const w = s.weight !== undefined ? `${fmt(s.weight)}` : '–'
  return s.reps !== undefined ? `${w} × ${s.reps}` : `${w} ${unit}`
}

/** "2026-11-03" → "Tue, Nov 3". */
export function dayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
