import type { SourceId } from '../data/sources'
import type { DayPlan, MealSlot, Profile } from '../types'
import { hasCondition, mergedLimits } from './conditions'
import { glasses, type WaterPlan } from './water'

export type ItemKind = 'meal' | 'water' | 'habit' | 'meds' | 'workout'

export interface ScheduleItem {
  /** Minutes after midnight (can exceed 1440 for after-midnight bedtimes). */
  at: number
  kind: ItemKind
  label: string
  detail?: string
  sources?: SourceId[]
  slot?: MealSlot
  snackIndex?: number
}

export function parseTime(t: string, fallback: number): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return fallback
  return Math.min(23, Number(m[1])) * 60 + Math.min(59, Number(m[2]))
}

export function formatTime(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = m % 60
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
}

const round15 = (m: number) => Math.round(m / 15) * 15
const floor15 = (m: number) => Math.floor(m / 15) * 15

export interface MealTimes {
  wake: number
  bed: number
  breakfast: number
  lunch: number
  dinner: number
  snacks: number[]
  medsAt?: number
  /** Latest time any food is planned (GERD keeps 3 h clear before bed). */
  lastFood: number
}

/**
 * When to eat. Breakfast about 30 min after waking (before a stimulant dose), dinner about
 * 11 h after breakfast and at least 3 h before bed, lunch halfway between, snacks in the longest
 * gaps. With stimulant meds the evening slot comes first (appetite returns as the dose wears off).
 * A pre-workout snack moves to about 75 min before training. With GERD, nothing is planned in the
 * 3 h before bed.
 */
export function mealTimes(p: Profile, snackCount: number): MealTimes {
  const wake = parseTime(p.wakeTime, 7 * 60)
  let bed = parseTime(p.bedTime, 23 * 60)
  if (bed <= wake + 8 * 60) bed += 1440
  const clearBeforeBed = mergedLimits(p).lastFoodBeforeBedMin ?? 75
  const lastFood = floor15(bed - clearBeforeBed)

  // Levothyroxine goes on an empty stomach 30–60 min before breakfast.
  const breakfast = round15(wake + (p.meds.thyroid ? 45 : 30))
  const dinner = Math.min(lastFood, round15(Math.max(breakfast + 8 * 60, Math.min(breakfast + 11 * 60, bed - 3 * 60))))
  const lunch = round15((breakfast + dinner) / 2)

  const slots: Record<'morning' | 'afternoon' | 'evening', number | null> = {
    morning: round15((breakfast + lunch) / 2),
    afternoon: round15((lunch + dinner) / 2),
    evening: Math.min(round15(dinner + 2 * 60), lastFood) > dinner + 30 ? Math.min(round15(dinner + 2 * 60), lastFood) : null,
  }
  const order: (keyof typeof slots)[] = p.stimulantMeds ? ['evening', 'afternoon', 'morning'] : ['afternoon', 'morning', 'evening']
  let snacks = order.map((k) => slots[k]).filter((x): x is number => x !== null).slice(0, snackCount)

  const workout = p.workoutTime ? parseTime(p.workoutTime, -1) : -1
  if (workout >= 0 && snacks.length) {
    const w = workout < wake ? workout + 1440 : workout
    const pre = round15(w - 75)
    const mealBefore = [breakfast, lunch, dinner].some((m) => w - m >= 60 && w - m <= 180)
    // Move the nearest snack to a pre-workout slot unless a meal already lands 1–3 h before training.
    if (!mealBefore && pre > wake && pre <= lastFood) {
      const nearest = snacks.reduce((bi, s, i) => (Math.abs(s - pre) < Math.abs(snacks[bi] - pre) ? i : bi), 0)
      snacks[nearest] = pre
    }
  }
  // Any extra snacks go in the afternoon, never past the last-food time.
  for (let i = snacks.length; i < snackCount; i++) snacks.push(Math.min(lastFood, round15((lunch + dinner) / 2 + 45 * (i - 1))))
  snacks = snacks.sort((a, b) => a - b)

  return { wake, bed, breakfast, lunch, dinner, snacks, lastFood, medsAt: p.stimulantMeds ? breakfast + 15 : undefined }
}

export function daySchedule(p: Profile, day: DayPlan, water: WaterPlan): ScheduleItem[] {
  const t = mealTimes(p, day.snacks.length)
  const items: ScheduleItem[] = []
  const gerd = hasCondition(p, 'gerd')
  const diabetes = hasCondition(p, 't1d') || hasCondition(p, 't2d')

  items.push({ at: t.wake, kind: 'water', label: 'Glass of water', detail: 'About 500 ml to start on your daily target.', sources: ['nasem_water'] })
  if (p.meds.thyroid) {
    items.push({
      at: t.wake, kind: 'meds', label: 'Thyroid medication with water',
      detail: `Levothyroxine on an empty stomach, 30–60 minutes before breakfast.${p.caffeine ? ' Hold coffee until breakfast: coffee taken with it reduced absorption.' : ''} Keep iron and calcium supplements at least 4 hours apart.`,
      sources: p.caffeine ? ['niddk_hashimoto', 'jonklaas', 'benvenga'] : ['niddk_hashimoto', 'jonklaas'],
    })
  }
  items.push({ at: t.wake + 10, kind: 'habit', label: 'Morning light', detail: 'Get outside for daylight soon after waking. Morning light is the strongest signal setting your body clock, which shapes alertness and sleep.', sources: ['blume'] })
  items.push({
    at: t.breakfast, kind: 'meal', label: 'Breakfast', slot: 'breakfast',
    detail: p.stimulantMeds ? 'Eat before your dose: stimulants commonly suppress appetite.' : 'A protein-rich breakfast helps keep you full.',
    sources: p.stimulantMeds ? ['cortese'] : ['leidy'],
  })
  if (t.medsAt) items.push({ at: t.medsAt, kind: 'meds', label: 'Take medication (if prescribed in the morning)', detail: 'After breakfast. Acidic juice and vitamin C reduce amphetamine absorption, so keep them apart from the dose.', sources: ['adderall_label'] })
  items.push({ at: t.lunch, kind: 'meal', label: 'Lunch', slot: 'lunch', detail: p.stimulantMeds ? 'Eat even if not hungry; smaller and easy is fine.' : undefined, sources: p.stimulantMeds ? ['cortese'] : undefined })
  items.push({
    at: t.dinner, kind: 'meal', label: 'Dinner', slot: 'dinner',
    detail: gerd ? 'At least 3 hours before bed, the main lifestyle step for nighttime reflux.' : 'Finishing a few hours before bed is linked to less reflux.',
    sources: ['fujiwara', 'acg_gerd'],
  })
  t.snacks.forEach((at, i) => items.push({ at, kind: 'meal', label: day.snacks.length > 1 ? `Snack ${i + 1}` : 'Snack', slot: 'snack', snackIndex: i }))
  if (gerd) items.push({ at: t.lastFood, kind: 'habit', label: 'Kitchen closed', detail: 'No more food tonight. Lying down within 3 hours of eating makes reflux worse.', sources: ['acg_gerd', 'fujiwara'] })

  const walkSources: SourceId[] = ['reynolds_walk', 'buffey']
  items.push({ at: t.lunch + 20, kind: 'habit', label: '10-minute walk', detail: 'Light walking after a meal lowers the blood-sugar rise.', sources: walkSources })
  items.push({ at: t.dinner + 20, kind: 'habit', label: '10-minute walk', detail: 'Walking after each meal beat one longer walk at another time for post-meal glucose.', sources: walkSources })
  if (p.caffeine) {
    const extra = hasCondition(p, 'anxiety') ? ' With anxiety, less caffeine overall may help.' : hasCondition(p, 'migraine') ? ' With migraine, keep the amount steady day to day.' : ''
    items.push({
      at: t.bed - 8 * 60, kind: 'habit', label: 'Caffeine cutoff',
      detail: `Caffeine even 6 hours before bed cut sleep by about an hour in a controlled study.${extra}`,
      sources: hasCondition(p, 'anxiety') ? ['drake', 'klevebrant'] : hasCondition(p, 'migraine') ? ['drake', 'nowaczewska'] : ['drake'],
    })
  }
  if (p.workoutTime) {
    const w = parseTime(p.workoutTime, -1)
    if (w >= 0) {
      items.push({
        at: w < t.wake ? w + 1440 : w, kind: 'workout', label: 'Workout',
        detail: `Start hydrated, and get 20–40 g protein within a couple of hours after.${hasCondition(p, 't1d') ? ' Check glucose before, during and after: exercise can cause lows for hours.' : ''}`,
        sources: hasCondition(p, 't1d') ? ['acsm_fluid', 'kerksick', 'riddell'] : ['acsm_fluid', 'kerksick'],
      })
    }
  }
  if (diabetes) items.push({ at: t.bed - 45, kind: 'habit', label: 'Hypo kit by the bed', detail: 'Keep 15 g of fast carbs nearby; if low, take it and recheck in 15 minutes.', sources: ['ada_6', 'ada_hypo'] })
  items.push({ at: t.bed - 60, kind: 'habit', label: 'Dim the lights', detail: 'Bright light and screens in the evening delay your body clock and melatonin.', sources: ['blume'] })

  // Spread the rest of the water over the day: a glass with each meal, the remainder between.
  const mealTimesList = [t.breakfast, t.lunch, t.dinner]
  const withMeals = 250 * mealTimesList.length
  const remaining = Math.max(0, water.drinkMl - 500 - withMeals)
  mealTimesList.forEach((at) => items.push({ at: at + 1, kind: 'water', label: 'Glass of water with the meal', detail: '250 ml' }))
  const between = Math.max(1, Math.round(remaining / 300))
  const span = t.bed - 90 - (t.breakfast + 60)
  for (let i = 0; i < between && remaining > 0; i++) {
    const at = round15(t.breakfast + 60 + (span * (i + 0.5)) / between)
    items.push({ at, kind: 'water', label: 'Water', detail: `${Math.round(remaining / between / 50) * 50} ml` })
  }

  return items.sort((a, b) => a.at - b.at || kindOrder(a.kind) - kindOrder(b.kind))
}

const kindOrder = (k: ItemKind) => ({ meds: 0, meal: 1, workout: 2, water: 3, habit: 4 })[k]

export function waterSummary(w: WaterPlan): string {
  return `${(w.drinkMl / 1000).toFixed(1)} L to drink (about ${glasses(w.drinkMl)} glasses)`
}
