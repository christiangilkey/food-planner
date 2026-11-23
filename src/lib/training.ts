import type { Claim } from '../data/conditions'
import { RECIPE_BY_ID } from '../data/recipes'
import { LIMITATION_BY_ID, type Limitation } from '../data/limitations'
import { POSTURE_GOAL_BY_ID, type PostureGoal } from '../data/mobility'
import {
  ACCESS, canDo, CONDITION_TRAINING, DAY_PART_LABEL, EXERCISE_BY_ID, EXERCISES, EXTRA_DAYS, FUEL, gearOf, isLift, isLiftDay, kindOf, MUSCLE_LABEL, MUSCLES, VTAPER,
  type DayPart, type EquipmentId, type Exercise, type ExerciseKind, type ExtraDay, type LiftDay, type Muscle, type Region, type Stress, type TrainingGoal,
} from '../data/training'
import type { Activity, AppState, BodyCheckIn, FitnessSettings, Profile, TrainingPlace } from '../types'
import { hasCondition } from './conditions'
import { computeTargets, lbToKg } from './energy'
import { servingTotals } from './nutrition'
import { DAYS } from './plan-utils'
import { formatTime, parseTime } from './schedule'
import { analyzeSleep } from './sleep'

const DAY_MUSCLES: Record<LiftDay, Muscle[]> = {
  full: ['quads', 'back', 'chest', 'hamstrings', 'glutes', 'shoulders', 'triceps', 'biceps', 'calves', 'abs'],
  upper: ['back', 'chest', 'shoulders', 'triceps', 'biceps'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'shoulders', 'biceps', 'abs'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
}

/** Muscles a lifting day trains: everything on a full-body day, else every part's muscles, in a sensible order. */
function dayMuscles(parts: LiftDay[]): Muscle[] {
  if (!parts.length) return []
  if (parts.includes('full')) return DAY_MUSCLES.full
  const set = new Set(parts.flatMap((p) => DAY_MUSCLES[p]))
  return DAY_MUSCLES.full.filter((m) => set.has(m))
}

/** Splits that train every muscle at least twice a week for 2–6 days. */
const SPLITS: Record<number, { kinds: LiftDay[]; weekdays: number[]; name: string; why: string }> = {
  2: { kinds: ['full', 'full'], weekdays: [0, 3], name: 'Full body, twice a week', why: 'With two days, training everything each day is the only way to hit each muscle twice.' },
  3: { kinds: ['full', 'full', 'full'], weekdays: [0, 2, 4], name: 'Full body, three days', why: 'Every muscle three times a week, with a rest day between sessions.' },
  4: { kinds: ['upper', 'lower', 'upper', 'lower'], weekdays: [0, 1, 3, 4], name: 'Upper / lower', why: 'Each half of the body twice a week, with shorter sessions than full body.' },
  5: { kinds: ['upper', 'lower', 'push', 'pull', 'legs'], weekdays: [0, 1, 2, 3, 4], name: 'Upper / lower + push / pull / legs', why: 'Every muscle twice a week across five shorter sessions.' },
  6: { kinds: ['push', 'pull', 'legs', 'push', 'pull', 'legs'], weekdays: [0, 1, 2, 3, 4, 5], name: 'Push / pull / legs, twice', why: 'Each muscle twice a week with lots of room for extra sets.' },
}

const clampDays = (n: number) => Math.max(2, Math.min(6, Math.round(n)))

/** Fixed styles, for any number of days. */
const FIXED: Record<'full' | 'upper_lower' | 'ppl', (n: number) => LiftDay[]> = {
  full: (n) => Array.from({ length: n }, () => 'full'),
  upper_lower: (n) => Array.from({ length: n }, (_, i) => (i % 2 ? 'lower' : 'upper')),
  ppl: (n) => Array.from({ length: n }, (_, i) => (['push', 'pull', 'legs'] as const)[i % 3]),
}

/** Where added stretch, yoga or balance sessions go, best first: the weekend, then midweek gaps. */
const FREE_ORDER = [6, 5, 2, 3, 1, 4, 0]

/** Monday to Sunday, what each day holds (an empty day is rest). */
export function weekLayout(f: FitnessSettings): DayPart[][] {
  if (f.layout === 'custom' && Array.isArray(f.week) && f.week.length === 7) return f.week.map((d) => [...d])
  const n = clampDays(f.days)
  const split = SPLITS[n]
  const kinds = f.layout === 'full' || f.layout === 'upper_lower' || f.layout === 'ppl' ? FIXED[f.layout](n) : split.kinds
  const week: DayPart[][] = Array.from({ length: 7 }, () => [])
  split.weekdays.forEach((wd, i) => week[wd].push(kinds[i]))
  for (const { id } of EXTRA_DAYS) {
    for (let k = 0; k < Math.min(7, f.extraDays?.[id] ?? 0); k++) {
      // A free day if there is one; otherwise added to the least busy day that doesn't have it yet.
      const d = FREE_ORDER.find((x) => !week[x].length) ?? FREE_ORDER.filter((x) => !week[x].includes(id)).sort((a, b) => week[a].length - week[b].length)[0]
      if (d === undefined) break
      week[d].push(id)
    }
  }
  return week
}

/** How many days a week include lifting. */
export const liftDayCount = (f: FitnessSettings) => weekLayout(f).filter((d) => d.some(isLiftDay)).length

function layoutText(f: FitnessSettings, week: DayPart[][]): { name: string; why: string } {
  const n = clampDays(f.days)
  const extras = EXTRA_DAYS.map((d) => [d, week.filter((x) => x.includes(d.id)).length] as const).filter(([, c]) => c > 0)
  const tail = extras.length ? ` + ${extras.map(([d, c]) => `${c > 1 ? `${c} ` : ''}${d.label.toLowerCase()}`).join(', ')}` : ''
  const base =
    f.layout === 'custom' ? { name: 'Your own week', why: 'Built day by day by you. Each lifting day gets the exercises for the muscles it covers.' }
      : f.layout === 'full' ? { name: `Full body, ${n} days`, why: 'Every muscle each session, so each one is trained as often as you lift.' }
        : f.layout === 'upper_lower' ? { name: 'Upper / lower', why: n % 2 ? 'Upper and lower days alternate; with an odd number of days, the upper body gets the extra day.' : 'Each half of the body twice a week.' }
          : f.layout === 'ppl' ? { name: 'Push / pull / legs', why: n < 6 ? 'Pushing, pulling and legs in turn; with fewer than 6 days some muscles are trained only once a week.' : 'Each muscle twice a week.' }
            : SPLITS[n]
  return { name: base.name + tail, why: base.why }
}

/** Hard sets per muscle per week. Priorities get more; the rest get enough to keep growing (Bickel 2011). */
function weeklyTargets(f: FitnessSettings): Record<Muscle, number> {
  const table: Record<TrainingGoal, { priority: number[]; other: number[] }> = {
    hypertrophy: { priority: [12, 16, 20], other: [8, 10, 12] },
    recomp: { priority: [12, 14, 18], other: [8, 10, 10] },
    strength: { priority: [10, 14, 16], other: [8, 10, 10] },
    health: { priority: [8, 8, 10], other: [4, 6, 6] },
  }
  const level = f.experience === 'new' ? 0 : f.experience === 'some' ? 1 : 2
  const out = {} as Record<Muscle, number>
  for (const { id } of MUSCLES) {
    const pri = f.priorities.includes(id)
    let n = (pri ? table[f.goal].priority : table[f.goal].other)[level]
    // Calves and abs get indirect work from squats, hinges and bracing.
    if (!pri && (id === 'calves' || id === 'abs')) n = Math.min(n, 6)
    out[id] = n
  }
  return out
}

export interface PlannedExercise {
  exercise: Exercise
  sets: number
  reps: string
  /** Reps to leave in the tank. */
  rir: string
  rest: string
  /** Main target of this pick (lifts). */
  for?: Muscle
  /** For stretches, poses and balance drills: the whole dose, e.g. "2 × 30–60 s each side". */
  hold?: string
  /** The exercise the plan chose before your swap. */
  swappedFrom?: string
  /** You added it to this day yourself. */
  added?: boolean
  note?: string
}

/** A stretch, yoga or balance part of a day, or a short cool-down after lifting. */
export interface Block {
  kind: ExtraDay | 'cooldown'
  title: string
  minutes: number
  items: PlannedExercise[]
}

export interface Session {
  weekday: number
  name: string
  /** What the day holds, as chosen (or from the layout). */
  parts: DayPart[]
  /** Lifting. */
  exercises: PlannedExercise[]
  /** Stretch, yoga, balance or cool-down parts, after the lifting. */
  blocks: Block[]
  minutes: number
}

export interface Program {
  split: string
  splitWhy: string
  sessions: Session[]
  weekly: Record<Muscle, { target: number; sets: number }>
  /** Sets had to be cut to fit the session length. */
  trimmed: boolean
  conditionNotes: Claim[]
  /** Limitations that shaped this week. */
  limits: Limitation[]
  /** Posture goals that shaped this week. */
  posture: PostureGoal[]
  /** Regions the stretches focus on: yours, then your posture goals'. */
  focus: Region[]
  cardio: string
  warnings: string[]
  /** Softer notes about the week (a muscle trained only once, say). */
  notes: string[]
}

const SET_MIN = { compound: 3, isolation: 2 } // minutes per working set including rest (app convention)
const WARMUP_MIN = 8
/** Minutes per stretch, pose or balance drill, both sides (app convention). */
const ITEM_MIN: Record<ExerciseKind, number> = { strength: 3, mobility: 3, yoga: 2, balance: 3 }
export const DEFAULT_EXTRA_MIN = 15

const isPregnant = (p: Profile) => p.meds.pregnant
const activeConditionTraining = (p: Profile) =>
  CONDITION_TRAINING.filter((c) => (c.condition === 'pregnant' ? isPregnant(p) : c.condition === 'diabetesMeds' ? p.meds.diabetesMeds : hasCondition(p, c.condition)))

function prescription(e: Exercise, f: FitnessSettings, minRir: number, firstCompound: boolean): Pick<PlannedExercise, 'reps' | 'rir' | 'rest'> {
  const fresh = f.experience === 'new'
  // Moving your own body weight (on the floor or in suspension straps): progress with reps and harder versions.
  const loadless = e.gear.every((g) => g === 'bodyweight' || g === 'suspension')
  if (e.isometric) return { reps: HOLDS[e.id] ?? '30–60 s hold', rir: '—', rest: '1–2 min' }
  if (e.compound) {
    if (f.goal === 'strength' && firstCompound && !loadless) return { reps: '3–6', rir: '2–3', rest: '3–5 min' }
    const rir = Math.max(minRir, fresh || f.goal === 'health' ? 2 : 1)
    return { reps: loadless ? '8–20' : f.goal === 'health' ? '8–12' : '6–10', rir: `${rir}–${rir + 1}`, rest: '2–3 min' }
  }
  const rir = fresh || f.goal === 'health' ? '1–2' : '0–2'
  return { reps: loadless ? '12–25' : f.goal === 'health' ? '12–15' : '10–15', rir, rest: '1–2 min' }
}

const HOLDS: Record<string, string> = { plank: '30–60 s hold', side_plank: '20–45 s each side', farmer_carry: '30–45 s walk', wall_sit: '2 min hold' }

/** A stretch, pose or balance drill as a plan line. */
const holdLine = (e: Exercise, extra: Partial<PlannedExercise> = {}): PlannedExercise =>
  ({ exercise: e, sets: 1, reps: e.hold ?? '', hold: e.hold ?? '', rir: '—', rest: '—', ...extra })

// ── Where you train, what you have, and what your body needs ─────────────

/** Your places; without any saved, one place built from the old "where you train" choice. */
export function placesOf(f: FitnessSettings): TrainingPlace[] {
  if (f.places?.length) return f.places
  const a = ACCESS.find((x) => x.id === f.access) ?? ACCESS[0]
  return [{ id: 'main', name: a.id === 'gym' ? 'Gym' : a.id === 'home' ? 'Home' : 'Anywhere', equipment: [...a.equipment] }]
}
export const activePlace = (f: FitnessSettings): TrainingPlace => placesOf(f).find((x) => x.id === f.place) ?? placesOf(f)[0]
export const equipmentOf = (f: FitnessSettings): EquipmentId[] => activePlace(f).equipment

/**
 * Limitations in force: the ones ticked on the Train tab, plus osteoporosis when it's a health
 * condition in the profile (so the diet and the training always agree).
 */
export function limitationsOf(f: FitnessSettings, p?: Profile): Limitation[] {
  const ids = new Set(f.limitations ?? [])
  if (p && hasCondition(p, 'osteoporosis')) ids.add('osteoporosis')
  return [...ids].map((id) => LIMITATION_BY_ID[id]).filter(Boolean)
}

/** Joint stresses to avoid: from limitations, plus lying face down in pregnancy. */
function avoidedStress(f: FitnessSettings, p: Profile): Set<Stress> {
  const out = new Set<Stress>(limitationsOf(f, p).flatMap((l) => l.avoid))
  if (p.meds.pregnant) out.add('prone')
  return out
}

/** The stresses that count: a balance drill done holding a counter doesn't count as unsupported balance. */
const stressOf = (e: Exercise): Stress[] => (e.stress ?? []).filter((s) => !(s === 'balance' && e.support))

/** Why an exercise can't be planned right now, or null if it can. */
export function whyNot(e: Exercise, f: FitnessSettings, p: Profile): string | null {
  if (!canDo(e, gearOf(equipmentOf(f)))) return `Needs equipment you haven’t ticked for ${activePlace(f).name}`
  const avoid = avoidedStress(f, p)
  const hit = limitationsOf(f, p).find((l) => stressOf(e).some((s) => l.avoid.includes(s)))
  if (hit) return `Not with ${hit.label.toLowerCase()}`
  if (stressOf(e).some((s) => avoid.has(s)) || (p.meds.pregnant && e.supine)) return 'Not in pregnancy'
  if (f.avoid?.includes(e.id)) return 'You chose not to do this one'
  return null
}

/** Exercises the planner may use right now (lifts for volume, plus stretches, poses and balance drills). */
export function usableExercises(f: FitnessSettings, p: Profile): Exercise[] {
  return EXERCISES.filter((e) => !e.addOnOnly && !whyNot(e, f, p))
}

const regionOverlap = (a: Exercise, b: Exercise) => (a.regions ?? []).filter((r) => b.regions?.includes(r)).length

/**
 * Other exercises that do the same job and fit your equipment and body, best match first: lifts for
 * the same main muscle, stretches and poses for the same regions, or other balance drills.
 */
export function alternativesFor(e: Exercise, f: FitnessSettings, p: Profile): Exercise[] {
  const pool = usableExercises(f, p).filter((x) => x.id !== e.id)
  const k = kindOf(e)
  if (k === 'strength') {
    return pool
      .filter((x) => isLift(x) && x.primary[0] === e.primary[0])
      .sort((a, b) => Number(b.compound === e.compound) - Number(a.compound === e.compound) || a.name.localeCompare(b.name))
  }
  if (k === 'balance') {
    return pool.filter((x) => kindOf(x) === 'balance' || (!isLift(x) && x.stress?.includes('balance')))
  }
  return pool
    .filter((x) => (kindOf(x) === 'mobility' || kindOf(x) === 'yoga') && regionOverlap(x, e) > 0)
    .sort((a, b) => regionOverlap(b, e) - regionOverlap(a, e) || Number(kindOf(b) === k) - Number(kindOf(a) === k) || a.name.localeCompare(b.name))
}

/** Everything you could add to a day, by kind, leaving out what's already on it. */
export function addableFor(s: Session, f: FitnessSettings, p: Profile): Record<ExerciseKind, Exercise[]> {
  const on = new Set([...s.exercises, ...s.blocks.flatMap((b) => b.items)].map((x) => x.exercise.id))
  const out: Record<ExerciseKind, Exercise[]> = { strength: [], mobility: [], yoga: [], balance: [] }
  for (const e of usableExercises(f, p)) if (!on.has(e.id)) out[kindOf(e)].push(e)
  out.strength.sort((a, b) => MUSCLES.findIndex((m) => m.id === a.primary[0]) - MUSCLES.findIndex((m) => m.id === b.primary[0]) || a.name.localeCompare(b.name))
  return out
}

/** Lifting time for a session. Blood-pressure wall sits are extra (they can be done at home, any time). */
const minutesOf = (list: PlannedExercise[]) => {
  const lifts = list.filter((x) => isLift(x.exercise) && x.exercise.id !== 'wall_sit')
  if (!lifts.length) return list.length * 3
  return WARMUP_MIN + lifts.reduce((m, x) => m + x.sets * (x.exercise.compound ? SET_MIN.compound : SET_MIN.isolation), 0) + (list.length - lifts.length - list.filter((x) => x.exercise.id === 'wall_sit').length) * 3
}
const blockMinutes = (items: PlannedExercise[]) => items.reduce((m, x) => m + ITEM_MIN[kindOf(x.exercise)], 0)
/** 4 × 2-minute holds with 2 minutes between. */
export const WALL_SIT_MIN = 16

/** What each lifting muscle stretches best afterwards, for cool-downs. */
const MUSCLE_REGIONS: Record<Muscle, Region[]> = {
  chest: ['chest'], back: ['lats', 'upper_back'], shoulders: ['shoulders'], biceps: ['chest'], triceps: ['lats'],
  quads: ['quads', 'hip_flexors'], hamstrings: ['hamstrings'], glutes: ['glutes'], calves: ['calves'], abs: ['lower_back'],
}
/** Regions a general stretch session covers when you haven't picked any. */
const DEFAULT_REGIONS: Region[] = ['hip_flexors', 'hamstrings', 'chest', 'upper_back', 'glutes', 'calves', 'lats', 'quads', 'adductors', 'lower_back']

const unique = <T,>(xs: T[]) => [...new Set(xs)]

/** Build the week: layout, exercises, sets, reps, effort and rest, stretches, poses and balance work. */
export function buildProgram(f: FitnessSettings, p: Profile): Program {
  const week = weekLayout(f)
  const layout = layoutText(f, week)
  const rules = activeConditionTraining(p)
  const limits = limitationsOf(f, p)
  const minRir = Math.max(0, ...rules.map((r) => r.minRir ?? 0), ...limits.map((l) => l.minRir ?? 0))
  const noSupine = rules.some((r) => r.noSupine)
  const targets = weeklyTargets(f)
  const usableAll = usableExercises(f, p).filter((e) => !(noSupine && e.supine))
  const usable = usableAll.filter(isLift)
  const usableIds = new Set(usableAll.map((e) => e.id))
  const gear = gearOf(equipmentOf(f))
  const prefer = f.preset === 'vtaper' ? VTAPER.prefer : {}
  const fits = (e: Exercise | undefined): e is Exercise => !!e && !whyNot(e, f, p) && !(noSupine && e.supine)
  const extraMin = Math.max(5, f.extraMin ?? DEFAULT_EXTRA_MIN)

  const posture = (f.postureGoals ?? []).map((id) => POSTURE_GOAL_BY_ID[id]).filter(Boolean)
  const focus = unique<Region>([...(f.stretchRegions ?? []), ...posture.flatMap((g) => g.stretch)])
  const hasStretchDay = week.some((d) => d.includes('stretch') || d.includes('yoga'))

  const liftParts = week.map((d) => d.filter(isLiftDay))
  const hits = {} as Record<Muscle, number>
  for (const { id } of MUSCLES) hits[id] = liftParts.filter((d) => dayMuscles(d).includes(id)).length
  const seen = {} as Record<Muscle, number>
  const blockSeen: Record<string, number> = {}

  // Your swap wins when it still fits your equipment and body and isn't already in the list.
  const swapped = (picked: Exercise, taken: PlannedExercise[]) => {
    const mine = f.swaps?.[picked.id]
    return mine && usableIds.has(mine) && !taken.some((x) => x.exercise.id === mine) ? EXERCISE_BY_ID[mine] : picked
  }

  /** Stretches (or poses) for regions, focus first; rotates through the rest across the week. */
  const stretchPick = (regions: Region[], n: number, occ: number, kinds: ExerciseKind[], taken: PlannedExercise[]): PlannedExercise[] => {
    const out: PlannedExercise[] = []
    const pool = usableAll.filter((e) => kinds.includes(kindOf(e)))
    for (const r of regions) {
      if (out.length >= n) break
      const options = pool.filter((e) => e.regions?.includes(r) && ![...out, ...taken].some((x) => x.exercise.id === e.id || x.swappedFrom === e.id))
      const picked = options[occ % Math.max(1, options.length)]
      if (!picked) continue
      const e = swapped(picked, [...out, ...taken])
      out.push(holdLine(e, e !== picked ? { swappedFrom: picked.id } : {}))
    }
    return out
  }
  const regionOrder = (occ: number, n: number, extra: Region[] = []) => {
    const rest = unique([...extra, ...DEFAULT_REGIONS]).filter((r) => !focus.includes(r))
    // Your regions every time when they fit; otherwise they take turns, like the rest.
    const mine = focus.length <= n ? focus : [...focus.slice((occ * n) % focus.length), ...focus.slice(0, (occ * n) % focus.length)]
    const shift = rest.length ? (occ * Math.max(1, n - focus.length)) % rest.length : 0
    return [...mine, ...rest.slice(shift), ...rest.slice(0, shift)]
  }

  const extraBlock = (kind: ExtraDay, dayMusclesList: Muscle[], taken: PlannedExercise[]): Block => {
    const occ = (blockSeen[kind] = (blockSeen[kind] ?? 0) + 1) - 1
    if (kind === 'stretch') {
      const n = Math.max(2, Math.floor(extraMin / ITEM_MIN.mobility))
      const items = stretchPick(regionOrder(occ, n, dayMusclesList.flatMap((m) => MUSCLE_REGIONS[m])), n, occ, ['mobility', 'yoga'], taken)
      return { kind, title: 'Stretch', minutes: blockMinutes(items), items }
    }
    if (kind === 'yoga') {
      const n = Math.max(3, Math.floor(extraMin / ITEM_MIN.yoga))
      const poses = usableAll.filter((e) => kindOf(e) === 'yoga')
      const order = (e: Exercise) => poses.indexOf(e)
      // One balance pose, then poses for your regions, then the rest taking turns across the week.
      const balancePose = poses.filter((e) => e.stress?.includes('balance'))[occ % Math.max(1, poses.filter((e) => e.stress?.includes('balance')).length)]
      const forFocus = poses.filter((e) => e.regions?.some((r) => focus.includes(r)) && e !== balancePose)
      const others = poses.filter((e) => e !== balancePose && !forFocus.includes(e))
      const rotated = [...others.slice(occ % Math.max(1, others.length)), ...others.slice(0, occ % Math.max(1, others.length))]
      const chosen = unique([...(balancePose ? [balancePose] : []), ...forFocus, ...rotated]).slice(0, n).sort((a, b) => order(a) - order(b))
      const items: PlannedExercise[] = []
      for (const picked of chosen) {
        const e = swapped(picked, [...items, ...taken])
        items.push(holdLine(e, e !== picked ? { swappedFrom: picked.id } : {}))
      }
      return { kind, title: 'Yoga', minutes: blockMinutes(items), items }
    }
    const n = Math.max(3, Math.floor(extraMin / ITEM_MIN.balance))
    const drills = usableAll.filter((e) => kindOf(e) === 'balance')
    // New lifters and anyone with balance problems start with the easiest drills; others rotate.
    const easy = f.experience === 'new' || limits.some((l) => l.id === 'balance')
    const start = easy ? 0 : occ % Math.max(1, drills.length)
    const chosen = easy ? drills.slice(0, n) : [...drills.slice(start), ...drills.slice(0, start)].slice(0, n)
    const items: PlannedExercise[] = []
    for (const picked of chosen) {
      const e = swapped(picked, [...items, ...taken])
      items.push(holdLine(e, e !== picked ? { swappedFrom: picked.id } : {}))
    }
    const steady = limits.some((l) => l.id === 'balance')
    if (steady) for (const x of items) x.note = 'Stand next to a counter or sturdy chair and hold it whenever you need to.'
    return { kind, title: 'Balance', minutes: blockMinutes(items), items }
  }

  const sessions: Session[] = []
  week.forEach((parts, weekday) => {
    if (!parts.length) return
    const lifts = parts.filter(isLiftDay)
    const extras = parts.filter((x): x is ExtraDay => !isLiftDay(x))
    const muscles = dayMuscles(lifts)
    const list: PlannedExercise[] = []
    const credit = {} as Record<Muscle, number>
    const add = (picked: Exercise, sets: number, m: Muscle) => {
      const e = swapped(picked, list)
      const firstCompound = e.compound && !list.some((x) => x.exercise.compound)
      list.push({ exercise: e, sets, for: m, ...(e !== picked ? { swappedFrom: picked.id } : {}), ...prescription(e, f, e.compound ? minRir : 0, firstCompound) })
      for (const q of e.primary) credit[q] = (credit[q] ?? 0) + sets
      for (const q of e.secondary) credit[q] = (credit[q] ?? 0) + sets / 2
    }
    // Priorities first, so they get the session's freshest effort; abs and calves always last,
    // so a tired core or calves never comes before squats and deadlifts.
    const rank = (m: Muscle) => (m === 'abs' || m === 'calves' ? 2 : f.priorities.includes(m) ? 0 : 1)
    const order = [...muscles].sort((a, b) => rank(a) - rank(b))
    for (const m of order) {
      const want = targets[m] / Math.max(1, hits[m])
      let remaining = want - (credit[m] ?? 0)
      const big = ['quads', 'back', 'chest', 'hamstrings', 'glutes'].includes(m)
      // Big muscles always get one direct exercise on their days; helper credit alone isn't enough.
      const direct = list.some((x) => x.exercise.primary.includes(m))
      if (remaining < 1.5 && !(big && !direct && want >= 2)) continue
      remaining = Math.max(remaining, 2)
      const occurrence = (seen[m] = (seen[m] ?? 0) + 1) - 1
      const pool = usable.filter((e) => e.primary[0] === m && !list.some((x) => x.exercise.id === e.id))
      const compounds = pool.filter((e) => e.compound)
      const isolations = pool.filter((e) => !e.compound)
      // A preset's favorite exercises come first, rotating across the week.
      const liked = (prefer[m] ?? []).map((id) => pool.find((e) => e.id === id)).filter((e): e is Exercise => !!e)
      const first = liked[occurrence % Math.max(1, liked.length)]
        ?? (big ? compounds : isolations)[occurrence % Math.max(1, (big ? compounds : isolations).length)] ?? pool[occurrence % Math.max(1, pool.length)]
      if (!first) continue
      // Per-day ceiling of 4 sets per pick; a muscle trained once a week still gets at most two picks.
      const s1 = Math.max(2, Math.min(4, Math.round(remaining > 4.5 ? remaining / 2 : remaining)))
      add(first, s1, m)
      remaining -= s1
      if (remaining >= 1.5) {
        // A different movement for the second pick: an isolation if there is one (Fonseca 2014).
        const likedOther = liked.filter((e) => e.id !== first.id)
        const others = isolations.filter((e) => e.id !== first.id)
        const rest = likedOther.length ? likedOther : others.length ? others : compounds.filter((e) => e.id !== first.id)
        const second = rest[occurrence % Math.max(1, rest.length)]
        if (second) add(second, Math.max(2, Math.min(4, Math.round(remaining))), m)
      }
    }
    const blocks: Block[] = []
    for (const kind of extras) blocks.push(extraBlock(kind, muscles, blocks.flatMap((b) => b.items)))
    // Regions or posture goals but no stretch or yoga day: a short cool-down after lifting.
    if (lifts.length && focus.length && !hasStretchDay) {
      const occ = (blockSeen.cooldown = (blockSeen.cooldown ?? 0) + 1) - 1
      const items = stretchPick(regionOrder(occ, 2), 2, occ, ['mobility'], blocks.flatMap((b) => b.items))
      if (items.length) blocks.push({ kind: 'cooldown', title: 'Cool-down stretches', minutes: blockMinutes(items), items })
    }
    const name = [...(lifts.includes('full') ? (['full'] as DayPart[]) : lifts), ...extras].map((x) => DAY_PART_LABEL[x]).join(' + ')
    sessions.push({ weekday, name, parts, exercises: list, blocks, minutes: 0 })
  })

  const liftSessions = sessions.filter((s) => s.parts.some(isLiftDay))
  const firstTwo = (liftSessions.length ? liftSessions : sessions).slice(0, 2)

  // Blood pressure: isometric wall sits (4 × 2 min) on up to three lifting days.
  if (rules.some((r) => r.adds === 'isometric')) {
    for (const s of (liftSessions.length ? liftSessions : sessions).slice(0, 3)) s.exercises.push({ exercise: EXERCISE_BY_ID.wall_sit, sets: 4, reps: '2 min hold', rir: '—', rest: '2 min', for: 'quads', note: `For blood pressure, about ${WALL_SIT_MIN} minutes on top of the session (or at home on another day): hold at an effort you could just keep up for 2 minutes. Breathe throughout.` })
  }

  // Tendon add-on: Nordic hamstring curls once a week, on the first day that trains hamstrings.
  if (f.addOns?.includes('tendon') && !whyNot(EXERCISE_BY_ID.nordic, f, p)) {
    const day = sessions.find((s) => dayMuscles(s.parts.filter(isLiftDay)).includes('hamstrings'))
    day?.exercises.push({ exercise: EXERCISE_BY_ID.nordic, sets: 2, reps: '4–6 slow', rir: '1–3', rest: '2 min', for: 'hamstrings', note: 'For injury-proofing: lower as slowly as you can. Expect sore hamstrings for the first two weeks.' })
  }

  // Limitation add-ons (rotator cuff work for shoulders, back extensions for bones) on the first two days.
  for (const l of limits) for (const a of l.adds ?? []) {
    // A band exercise falls back to the cable version, and the other way round.
    const options = [a.exercise, a.exercise.replace(/^band_/, 'cable_'), a.exercise.replace(/^cable_/, 'band_')]
    const e = options.map((id) => EXERCISE_BY_ID[id]).find((x) => x && canDo(x, gear) && !whyNot(x, f, p))
    if (!e) continue
    for (const s of firstTwo) {
      if (s.exercises.some((x) => x.exercise.id === e.id)) continue
      s.exercises.push({ exercise: e, sets: a.sets, reps: a.reps, rir: '2–3', rest: '1 min', for: e.primary[0], note: `For your ${l.label.toLowerCase()}: ${a.note}` })
    }
  }

  // Posture goals: their strength work goes with the lifting, their drills into a stretch part of the day.
  for (const g of posture) for (const w of g.strengthen) {
    const e = w.options.map((id) => EXERCISE_BY_ID[id]).find(fits)
    if (!e) continue
    for (const s of firstTwo) {
      const all = [...s.exercises, ...s.blocks.flatMap((b) => b.items)]
      if (all.some((x) => x.exercise.id === e.id)) continue
      const note = `For ${g.label.replace(/ \(.*\)$/, '').toLowerCase()}: ${w.note}`
      if (isLift(e)) {
        s.exercises.push({ exercise: e, sets: w.sets, reps: w.reps, rir: '2–3', rest: '1 min', for: e.primary[0], note })
      } else {
        const block = s.blocks.find((b) => b.kind === 'stretch' || b.kind === 'cooldown')
          ?? (s.blocks[s.blocks.push({ kind: 'cooldown', title: 'Posture work', minutes: 0, items: [] }) - 1])
        block.items.push(holdLine(e, { reps: `${w.sets} × ${w.reps}`, hold: `${w.sets} × ${w.reps}`, note }))
      }
    }
  }

  // Your own changes to single days: taken out, then added.
  for (const s of sessions) {
    const edit = f.dayEdits?.[String(s.weekday)]
    if (!edit) continue
    const gone = new Set(edit.remove ?? [])
    const keep = (x: PlannedExercise) => !gone.has(x.exercise.id) && !(x.swappedFrom && gone.has(x.swappedFrom))
    s.exercises = s.exercises.filter(keep)
    for (const b of s.blocks) b.items = b.items.filter(keep)
    for (const id of edit.add ?? []) {
      const e = EXERCISE_BY_ID[id]
      if (!e || gone.has(id) || !fits(e)) continue
      const all = [...s.exercises, ...s.blocks.flatMap((b) => b.items)]
      if (all.some((x) => x.exercise.id === id)) continue
      if (isLift(e)) {
        s.exercises.push({ exercise: e, sets: e.compound ? 3 : 2, for: e.primary[0], added: true, ...prescription(e, f, e.compound ? minRir : 0, false) })
      } else {
        const kind: Block['kind'] = kindOf(e) === 'yoga' ? 'yoga' : kindOf(e) === 'balance' ? 'balance' : 'stretch'
        const block = s.blocks.find((b) => b.kind === kind) ?? s.blocks.find((b) => b.kind === 'cooldown')
          ?? (s.blocks[s.blocks.push({ kind, title: 'Added by you', minutes: 0, items: [] }) - 1])
        block.items.push(holdLine(e, { added: true }))
      }
    }
    s.blocks = s.blocks.filter((b) => b.items.length)
  }

  // Fit the lifting into the time available: trim non-priority sets first, then priority, never below 2.
  let trimmed = false
  for (const s of sessions) {
    const limit = Math.max(25, f.sessionMin)
    const pri = (x: PlannedExercise) => !!x.for && f.priorities.includes(x.for)
    // Add-ons (wall sits, Nordic curls, work for a limitation or posture goal, which all carry a note)
    // and your own additions are kept: you asked for them.
    const keep = (x: PlannedExercise) => !!x.exercise.isometric || !!x.exercise.addOnOnly || !!x.added || !!x.note || !isLift(x.exercise)
    for (let guard = 0; minutesOf(s.exercises) > limit && guard < 200; guard++) {
      const cut = [...s.exercises].filter((x) => x.sets > 2 && !keep(x)).sort((a, b) => Number(pri(a)) - Number(pri(b)) || b.sets - a.sets)[0]
      if (cut) { cut.sets--; trimmed = true; continue }
      // Everything at 2 sets: drop the last non-priority extra exercise for a muscle that has two.
      const extras = s.exercises.filter((x, i) => !keep(x) && s.exercises.findIndex((y) => y.for === x.for) !== i)
      const drop = extras.sort((a, b) => Number(pri(a)) - Number(pri(b)))[0] ?? [...s.exercises].reverse().find((x) => !pri(x) && !keep(x))
      if (!drop) break
      s.exercises.splice(s.exercises.indexOf(drop), 1)
      trimmed = true
    }
    for (const b of s.blocks) b.minutes = blockMinutes(b.items)
    s.minutes = (s.exercises.length ? minutesOf(s.exercises) : 0) + s.blocks.reduce((m, b) => m + b.minutes, 0)
  }

  const weekly = {} as Program['weekly']
  for (const { id } of MUSCLES) weekly[id] = { target: targets[id], sets: 0 }
  for (const s of sessions) for (const x of s.exercises) {
    if (x.exercise.addOnOnly || !isLift(x.exercise)) continue
    for (const q of x.exercise.primary) weekly[q].sets += x.sets
    for (const q of x.exercise.secondary) weekly[q].sets += x.sets / 2
  }

  const warnings: string[] = []
  const notes: string[] = []
  if (liftSessions.length) {
    const trained = MUSCLES.filter(({ id }) => hits[id] > 0)
    // Muscles nothing fits for: say so rather than silently leaving them out.
    const missing = trained.filter(({ id }) => !usable.some((e) => e.primary[0] === id)).map((m) => m.label.toLowerCase())
    if (missing.length) warnings.push(`Nothing for your ${missing.join(', ')} fits ${activePlace(f).name}’s equipment and your limitations. Tick more equipment, or try another place.`)
    const never = MUSCLES.filter(({ id }) => !hits[id]).map((m) => m.label.toLowerCase())
    if (never.length) warnings.push(`Your week doesn’t train your ${never.join(', ')}. Add a day that covers ${never.length > 1 ? 'them' : 'it'}, or switch a day to full body.`)
    const once = MUSCLES.filter(({ id }) => hits[id] === 1).map((m) => m.label.toLowerCase())
    if (once.length && f.goal !== 'health') notes.push(`Your ${once.join(', ')} ${once.length > 1 ? 'are' : 'is'} trained once a week; twice a week grows muscle more.`)
  }
  if (!equipmentOf(f).length && liftSessions.length) warnings.push('Without equipment, progress by doing harder variations (feet raised, slower lowering, one leg) once you pass the top of the rep range.')
  if (trimmed) warnings.push(`Sets were cut to fit ${f.sessionMin}-minute sessions. Longer sessions or another training day would let every muscle reach its target.`)
  const migraine = hasCondition(p, 'migraine')
  const cardio = migraine
    ? 'Aerobic exercise for 40 minutes, 3 times a week (cycling, brisk walking), as in the migraine trial. Your after-meal walks add to it.'
    : f.goal === 'health' || f.goal === 'recomp' || p.goal === 'lose' || hasCondition(p, 't2d') || hasCondition(p, 'hypertension')
      ? '150–300 minutes a week of moderate cardio. Your two 10-minute walks after lunch and dinner give about 140; add a couple of longer sessions.'
      : 'Keep the after-meal walks on your schedule; together with lifting they work toward the WHO weekly activity target.'

  return { split: layout.name, splitWhy: layout.why, sessions, weekly, trimmed, conditionNotes: rules.flatMap((r) => r.claims), limits, posture, focus, cardio, warnings, notes }
}

// ── What training changes in the meal plan ─────────────────────────

export interface FuelAdvice {
  id: string
  title: string
  text: string
  claim: Claim
  /** A one-tap change to the profile. */
  apply?: { label: string; patch: Partial<Profile> }
  /** Meals in this week's plan that fall short. */
  meals?: { day: string; slot: string; name: string; protein: number }[]
  goTo?: 'plan' | 'sleep'
  convention?: string
}

const ACTIVITY_RANK: Activity[] = ['sedentary', 'light', 'moderate', 'very', 'athlete']
const ACTIVITY_LABEL: Record<Activity, string> = { sedentary: 'Sedentary', light: 'Lightly active', moderate: 'Moderately active', very: 'Very active', athlete: 'Athlete' }

/** The activity level that matches the training plan (the app's activity definitions). */
export function activityFor(f: FitnessSettings): Activity {
  const days = liftDayCount(f)
  if (days >= 6) return 'very'
  if (days >= 4 || (days === 3 && f.sessionMin >= 60)) return 'moderate'
  return 'light'
}

export function fuelAdvice(state: AppState): FuelAdvice[] {
  const p = state.profile
  const f = state.fitness
  const out: FuelAdvice[] = []
  const targets = computeTargets(p)
  const kg = lbToKg(p.weightLb)

  const perKg = targets.protein / kg
  out.push({
    id: 'protein', title: `Protein: ${targets.protein} g a day`,
    text: hasCondition(p, 'ckd')
      ? 'Your protein stays capped for kidney disease even while training. Ask your renal team before raising it.'
      : p.strengthTraining
        ? `Your meal plan already counts your training (about ${perKg.toFixed(1)} g per kg of body weight${p.goal === 'lose' ? ', higher because you are in a calorie deficit' : ''}).`
        : 'Turn on “Use my training in the meal plan” to raise your protein target for lifting.',
    claim: p.goal === 'lose' ? FUEL.deficit : FUEL.protein,
  })

  const want = activityFor(f)
  if (ACTIVITY_RANK.indexOf(p.activity) < ACTIVITY_RANK.indexOf(want)) {
    out.push({
      id: 'activity', title: 'Count the training in your calories',
      text: `${liftDayCount(f)} sessions of ${f.sessionMin} minutes a week fits “${ACTIVITY_LABEL[want]}”, but your profile says “${ACTIVITY_LABEL[p.activity]}”, so your calorie target is too low for this training.`,
      claim: { text: 'Calorie needs are estimated from your resting burn times an activity factor; more training means a higher factor.', evidence: 'moderate', sources: ['mifflin', 'nasem_macros'] },
      apply: { label: `Set to ${ACTIVITY_LABEL[want]}`, patch: { activity: want } },
    })
  }

  if (f.goal === 'hypertrophy' && p.goal === 'lose') {
    out.push({
      id: 'goal', title: 'Building muscle in a deficit is slow',
      text: 'Your meal plan is set to lose weight. To build muscle faster, eat a small surplus; or keep the deficit and choose “Lose fat, keep or build muscle” as your training goal.',
      claim: { text: 'A modest surplus of about 10–20% above maintenance is suggested to build muscle while limiting fat gain.', evidence: 'moderate', sources: ['iraki'] },
      apply: { label: 'Set goal to gain', patch: { goal: 'gain' } },
    })
  }
  if (f.goal === 'recomp' && p.goal !== 'lose') {
    out.push({
      id: 'goal', title: 'Recomposition needs a small deficit',
      text: 'To lose fat while keeping muscle, set your meal plan to lose weight; protein rises to protect muscle.',
      claim: FUEL.deficit,
      apply: { label: 'Set goal to lose', patch: { goal: 'lose' } },
    })
  }

  // Protein at each main meal.
  const floor = 0.3 * kg
  const short: NonNullable<FuelAdvice['meals']> = []
  let counted = 0
  state.plan.forEach((day, d) => {
    for (const slot of ['breakfast', 'lunch', 'dinner'] as const) {
      const e = day[slot]
      const r = e && RECIPE_BY_ID[e.recipe]
      if (!e || !r) continue
      counted++
      const protein = servingTotals(r, e.portion).protein
      if (protein < floor) short.push({ day: DAYS[d], slot, name: r.name, protein: Math.round(protein) })
    }
  })
  out.push({
    id: 'per_meal', title: `About ${Math.round(0.4 * kg)} g protein per meal`,
    text: !counted
      ? 'Plan a week on the Food tab and this checks the protein in each meal.'
      : short.length
        ? `${short.length} of this week’s main meals are under ${Math.round(floor)} g. Swap them on the Food tab, or add Greek yogurt, eggs or a protein shake.`
        : 'Every main meal this week has enough protein.',
    claim: FUEL.perMeal,
    meals: short.slice(0, 6),
    goTo: short.length || !counted ? 'plan' : undefined,
    convention: `Flagging meals under 0.3 g/kg (${Math.round(floor)} g) is this app’s threshold.`,
  })

  out.push({
    id: 'timing', title: p.workoutTime ? `Fuel around your ${formatTime(parseTime(p.workoutTime, 0))} training` : 'Set your training time',
    text: p.workoutTime
      ? 'Your schedule places a snack 1–3 hours before training when no meal falls there.'
      : 'Set your usual training time below and the schedule will put a carb-and-protein snack 1–3 hours before it.',
    claim: FUEL.timing,
  })

  if (!hasCondition(p, 'ckd') && !p.meds.pregnant && f.goal !== 'health') {
    out.push({ id: 'creatine', title: 'Creatine', text: 'Optional: see Health → Supplements for details and cautions.', claim: FUEL.creatine })
  }

  const sleep = analyzeSleep(state.sleepLog, p)
  if (sleep.nights.length && sleep.avgMin < sleep.target.min) {
    out.push({
      id: 'sleep', title: 'Sleep is part of the plan',
      text: `You averaged ${(sleep.avgMin / 60).toFixed(1)} hours. With short sleep, a diet loses more muscle and less fat.`,
      claim: { text: 'On the same calorie deficit, 5.5 hours of sleep instead of 8.5 cut fat loss by 55% and increased lean-mass loss by 60%.', evidence: 'moderate', sources: ['nedeltcheva'] },
      goTo: 'sleep',
    })
  }
  return out
}

// ── Body check-ins ─────────────────────────────────────────────

export interface BodyTrend {
  /** Average weight over the last 7 days and the 7 before, lb. */
  thisWeek?: number
  lastWeek?: number
  waistToHeight?: number
  whtrBand?: 'healthy' | 'increased' | 'high'
  grip?: { latest: number; first: number }
  hang?: { latest: number; first: number }
  /** Latest logged height and how far it is below earlier readings, in cm. */
  height?: { latestIn: number; recentLossCm: number; tallestLossCm: number; flag: boolean }
}

/** Height loss worth raising with a clinician: over 2 cm within 3 years, or over 6 cm from your tallest. */
export const HEIGHT_LOSS_CM = { recent: 2, total: 6 }

const dayDiff = (a: string, b: string) => Math.round((new Date(`${a}T12:00`).getTime() - new Date(`${b}T12:00`).getTime()) / 86_400_000)

/** Weekly weight averages, waist-to-height band (NICE), and grip and hang progress. */
export function bodyTrend(log: BodyCheckIn[], p: Profile, today = new Date()): BodyTrend {
  const now = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date))
  const avg = (from: number, to: number) => {
    const xs = sorted.filter((e) => e.weightLb !== undefined && dayDiff(now, e.date) >= from && dayDiff(now, e.date) < to).map((e) => e.weightLb!)
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined
  }
  const out: BodyTrend = { thisWeek: avg(0, 7), lastWeek: avg(7, 14) }
  const waist = [...sorted].reverse().find((e) => e.waistIn !== undefined)?.waistIn
  if (waist && p.heightIn > 0) {
    out.waistToHeight = waist / p.heightIn
    out.whtrBand = out.waistToHeight < 0.5 ? 'healthy' : out.waistToHeight < 0.6 ? 'increased' : 'high'
  }
  const series = (k: 'gripKg' | 'hangSec') => {
    const xs = sorted.filter((e) => e[k] !== undefined).map((e) => e[k]!)
    return xs.length ? { first: xs[0], latest: xs[xs.length - 1] } : undefined
  }
  out.grip = series('gripKg')
  out.hang = series('hangSec')

  // Height: compare the latest morning reading with earlier ones (and the profile height, as the
  // tallest you remember). Loss, not gain, is what carries health meaning.
  const heights = sorted.filter((e) => e.heightIn !== undefined)
  const last = heights.at(-1)
  if (last) {
    const earlier = heights.slice(0, -1).filter((e) => dayDiff(last.date, e.date) <= 3 * 365).map((e) => e.heightIn!)
    const recentMax = earlier.length ? Math.max(...earlier) : last.heightIn!
    const tallest = Math.max(p.heightIn || 0, ...heights.map((e) => e.heightIn!))
    const recentLossCm = Math.max(0, (recentMax - last.heightIn!) * 2.54)
    const tallestLossCm = Math.max(0, (tallest - last.heightIn!) * 2.54)
    out.height = { latestIn: last.heightIn!, recentLossCm, tallestLossCm, flag: recentLossCm > HEIGHT_LOSS_CM.recent || tallestLossCm > HEIGHT_LOSS_CM.total }
  }
  return out
}

/** "Chest, Back and Arms": a short list for labels. */
export const muscleList = (ms: Muscle[]) => {
  const names = ms.map((m) => MUSCLE_LABEL[m])
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}
