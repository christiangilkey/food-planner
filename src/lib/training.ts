import type { Claim } from '../data/conditions'
import { RECIPE_BY_ID } from '../data/recipes'
import { ACCESS, CONDITION_TRAINING, EXERCISE_BY_ID, EXERCISES, FUEL, MUSCLE_LABEL, MUSCLES, VTAPER, type Exercise, type Muscle, type TrainingGoal } from '../data/training'
import type { Activity, AppState, BodyCheckIn, FitnessSettings, Profile } from '../types'
import { hasCondition } from './conditions'
import { computeTargets, lbToKg } from './energy'
import { servingTotals } from './nutrition'
import { DAYS } from './plan-utils'
import { formatTime, parseTime } from './schedule'
import { analyzeSleep } from './sleep'

type DayKind = 'full' | 'upper' | 'lower' | 'push' | 'pull' | 'legs'

const DAY_MUSCLES: Record<DayKind, Muscle[]> = {
  full: ['quads', 'back', 'chest', 'hamstrings', 'glutes', 'shoulders', 'triceps', 'biceps', 'calves', 'abs'],
  upper: ['back', 'chest', 'shoulders', 'triceps', 'biceps'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'shoulders', 'biceps', 'abs'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
}
const DAY_NAME: Record<DayKind, string> = { full: 'Full body', upper: 'Upper body', lower: 'Lower body', push: 'Push', pull: 'Pull', legs: 'Legs' }

/** Splits that train every muscle at least twice a week for 2–6 days. */
const SPLITS: Record<number, { kinds: DayKind[]; weekdays: number[]; name: string; why: string }> = {
  2: { kinds: ['full', 'full'], weekdays: [0, 3], name: 'Full body, twice a week', why: 'With two days, training everything each day is the only way to hit each muscle twice.' },
  3: { kinds: ['full', 'full', 'full'], weekdays: [0, 2, 4], name: 'Full body, three days', why: 'Every muscle three times a week, with a rest day between sessions.' },
  4: { kinds: ['upper', 'lower', 'upper', 'lower'], weekdays: [0, 1, 3, 4], name: 'Upper / lower', why: 'Each half of the body twice a week, with shorter sessions than full body.' },
  5: { kinds: ['upper', 'lower', 'push', 'pull', 'legs'], weekdays: [0, 1, 2, 3, 4], name: 'Upper / lower + push / pull / legs', why: 'Every muscle twice a week across five shorter sessions.' },
  6: { kinds: ['push', 'pull', 'legs', 'push', 'pull', 'legs'], weekdays: [0, 1, 2, 3, 4, 5], name: 'Push / pull / legs, twice', why: 'Each muscle twice a week with lots of room for extra sets.' },
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
  /** Main target of this pick. */
  for: Muscle
  note?: string
}

export interface Session {
  weekday: number
  name: string
  exercises: PlannedExercise[]
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
  cardio: string
  warnings: string[]
}

const SET_MIN = { compound: 3, isolation: 2 } // minutes per working set including rest (app convention)
const WARMUP_MIN = 8

const isPregnant = (p: Profile) => p.meds.pregnant
const activeConditionTraining = (p: Profile) =>
  CONDITION_TRAINING.filter((c) => (c.condition === 'pregnant' ? isPregnant(p) : c.condition === 'diabetesMeds' ? p.meds.diabetesMeds : hasCondition(p, c.condition)))

function prescription(e: Exercise, f: FitnessSettings, minRir: number, firstCompound: boolean): Pick<PlannedExercise, 'reps' | 'rir' | 'rest'> {
  const fresh = f.experience === 'new'
  const loadless = e.gear.length === 1 && e.gear[0] === 'bodyweight'
  if (e.isometric) return { reps: e.id === 'plank' ? '30–60 s hold' : '2 min hold', rir: '—', rest: '1–2 min' }
  if (e.compound) {
    if (f.goal === 'strength' && firstCompound && !loadless) return { reps: '3–6', rir: '2–3', rest: '3–5 min' }
    const rir = Math.max(minRir, fresh || f.goal === 'health' ? 2 : 1)
    return { reps: loadless ? '8–20' : f.goal === 'health' ? '8–12' : '6–10', rir: `${rir}–${rir + 1}`, rest: '2–3 min' }
  }
  const rir = fresh || f.goal === 'health' ? '1–2' : '0–2'
  return { reps: loadless ? '12–25' : f.goal === 'health' ? '12–15' : '10–15', rir, rest: '1–2 min' }
}

/** Lifting time for a session. Blood-pressure wall sits are extra (they can be done at home, any time). */
const minutesOf = (list: PlannedExercise[]) =>
  WARMUP_MIN + list.reduce((m, x) => m + (x.exercise.id === 'wall_sit' ? 0 : x.sets * (x.exercise.compound ? SET_MIN.compound : SET_MIN.isolation)), 0)
/** 4 × 2-minute holds with 2 minutes between. */
export const WALL_SIT_MIN = 16

/** Build the week: split, exercises, sets, reps, effort and rest, fitted to the session length. */
export function buildProgram(f: FitnessSettings, p: Profile): Program {
  const days = Math.max(2, Math.min(6, Math.round(f.days)))
  const split = SPLITS[days]
  const gear = new Set(ACCESS.find((a) => a.id === f.access)!.gear)
  const rules = activeConditionTraining(p)
  const minRir = Math.max(0, ...rules.map((r) => r.minRir ?? 0))
  const noSupine = rules.some((r) => r.noSupine)
  const targets = weeklyTargets(f)
  const usable = EXERCISES.filter((e) => e.gear.every((g) => gear.has(g)) && !(noSupine && e.supine) && e.id !== 'wall_sit' && e.id !== 'nordic')
  const prefer = f.preset === 'vtaper' ? VTAPER.prefer : {}

  const hits = {} as Record<Muscle, number>
  for (const { id } of MUSCLES) hits[id] = split.kinds.filter((k) => DAY_MUSCLES[k].includes(id)).length
  const seen = {} as Record<Muscle, number>

  const sessions: Session[] = split.kinds.map((kind, si) => {
    const list: PlannedExercise[] = []
    const credit = {} as Record<Muscle, number>
    const add = (e: Exercise, sets: number, m: Muscle) => {
      const firstCompound = e.compound && !list.some((x) => x.exercise.compound)
      list.push({ exercise: e, sets, for: m, ...prescription(e, f, e.compound ? minRir : 0, firstCompound) })
      for (const q of e.primary) credit[q] = (credit[q] ?? 0) + sets
      for (const q of e.secondary) credit[q] = (credit[q] ?? 0) + sets / 2
    }
    // Priorities first, so they get the session's freshest effort; abs and calves always last,
    // so a tired core or calves never comes before squats and deadlifts.
    const rank = (m: Muscle) => (m === 'abs' || m === 'calves' ? 2 : f.priorities.includes(m) ? 0 : 1)
    const order = [...DAY_MUSCLES[kind]].sort((a, b) => rank(a) - rank(b))
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
    return { weekday: split.weekdays[si], name: DAY_NAME[kind], exercises: list, minutes: 0 }
  })

  // Blood pressure: isometric wall sits (4 × 2 min) on up to three days.
  if (rules.some((r) => r.adds === 'isometric')) {
    for (const s of sessions.slice(0, 3)) s.exercises.push({ exercise: EXERCISE_BY_ID.wall_sit, sets: 4, reps: '2 min hold', rir: '—', rest: '2 min', for: 'quads', note: `For blood pressure, about ${WALL_SIT_MIN} minutes on top of the session (or at home on another day): hold at an effort you could just keep up for 2 minutes. Breathe throughout.` })
  }

  // Tendon add-on: Nordic hamstring curls once a week, on the first day that trains hamstrings.
  if (f.addOns?.includes('tendon')) {
    const day = sessions[split.kinds.findIndex((k) => DAY_MUSCLES[k].includes('hamstrings'))]
    day?.exercises.push({ exercise: EXERCISE_BY_ID.nordic, sets: 2, reps: '4–6 slow', rir: '1–3', rest: '2 min', for: 'hamstrings', note: 'For injury-proofing: lower as slowly as you can. Expect sore hamstrings for the first two weeks.' })
  }

  // Fit each session into the time available: trim non-priority sets first, then priority, never below 2.
  let trimmed = false
  for (const s of sessions) {
    const limit = Math.max(25, f.sessionMin)
    const pri = (x: PlannedExercise) => f.priorities.includes(x.for)
    for (let guard = 0; minutesOf(s.exercises) > limit && guard < 200; guard++) {
      const cut = [...s.exercises].filter((x) => x.sets > 2 && !x.exercise.isometric).sort((a, b) => Number(pri(a)) - Number(pri(b)) || b.sets - a.sets)[0]
      if (cut) { cut.sets--; trimmed = true; continue }
      // Everything at 2 sets: drop the last non-priority extra exercise for a muscle that has two.
      // Add-ons (wall sits, Nordic curls) are kept: the user asked for them.
      const keep = (x: PlannedExercise) => x.exercise.isometric || x.exercise.id === 'nordic'
      const extras = s.exercises.filter((x, i) => !keep(x) && s.exercises.findIndex((y) => y.for === x.for) !== i)
      const drop = extras.sort((a, b) => Number(pri(a)) - Number(pri(b)))[0] ?? [...s.exercises].reverse().find((x) => !pri(x) && !keep(x))
      if (!drop) break
      s.exercises.splice(s.exercises.indexOf(drop), 1)
      trimmed = true
    }
    s.minutes = minutesOf(s.exercises)
  }

  const weekly = {} as Program['weekly']
  for (const { id } of MUSCLES) weekly[id] = { target: targets[id], sets: 0 }
  for (const s of sessions) for (const x of s.exercises) {
    if (x.exercise.id === 'wall_sit') continue
    for (const q of x.exercise.primary) weekly[q].sets += x.sets
    for (const q of x.exercise.secondary) weekly[q].sets += x.sets / 2
  }

  const warnings: string[] = []
  if (f.access === 'bodyweight') warnings.push('Without equipment, progress by doing harder variations (feet raised, slower lowering, one leg) once you pass the top of the rep range.')
  if (trimmed) warnings.push(`Sets were cut to fit ${f.sessionMin}-minute sessions. Longer sessions or another training day would let every muscle reach its target.`)
  const migraine = hasCondition(p, 'migraine')
  const cardio = migraine
    ? 'Aerobic exercise for 40 minutes, 3 times a week (cycling, brisk walking), as in the migraine trial. Your after-meal walks add to it.'
    : f.goal === 'health' || f.goal === 'recomp' || p.goal === 'lose' || hasCondition(p, 't2d') || hasCondition(p, 'hypertension')
      ? '150–300 minutes a week of moderate cardio. Your two 10-minute walks after lunch and dinner give about 140; add a couple of longer sessions.'
      : 'Keep the after-meal walks on your schedule; together with lifting they work toward the WHO weekly activity target.'

  return { split: split.name, splitWhy: split.why, sessions, weekly, trimmed, conditionNotes: rules.flatMap((r) => r.claims), cardio, warnings }
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
  if (f.days >= 6) return 'very'
  if (f.days >= 4 || (f.days === 3 && f.sessionMin >= 60)) return 'moderate'
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
      text: `${f.days} sessions of ${f.sessionMin} minutes a week fits “${ACTIVITY_LABEL[want]}”, but your profile says “${ACTIVITY_LABEL[p.activity]}”, so your calorie target is too low for this training.`,
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
}

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
  return out
}

/** "Chest, Back and Arms": a short list for labels. */
export const muscleList = (ms: Muscle[]) => {
  const names = ms.map((m) => MUSCLE_LABEL[m])
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}
