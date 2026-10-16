import type { DayPlan, MealSlot, PlanEntry } from '../types'

/** Where a plan entry lives, so it can be replaced or removed. */
export interface Pos { day: number; slot: MealSlot; snack?: number }

export function setEntry(plan: DayPlan[], pos: Pos, entry: PlanEntry | null): DayPlan[] {
  return plan.map((d, i) => {
    if (i !== pos.day) return d
    if (pos.slot === 'snack') {
      const snacks = [...d.snacks]
      if (entry) snacks[pos.snack ?? snacks.length] = entry
      else snacks.splice(pos.snack ?? 0, 1)
      return { ...d, snacks }
    }
    return { ...d, [pos.slot]: entry }
  })
}

export function getEntry(plan: DayPlan[], pos: Pos): PlanEntry | null {
  const d = plan[pos.day]
  return pos.slot === 'snack' ? d.snacks[pos.snack ?? 0] ?? null : d[pos.slot]
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function emptyPlan(): DayPlan[] {
  return DAYS.map(() => ({ breakfast: null, lunch: null, dinner: null, snacks: [] }))
}

export function dayEntries(day: DayPlan): { slot: MealSlot; entry: PlanEntry }[] {
  const out: { slot: MealSlot; entry: PlanEntry }[] = []
  if (day.breakfast) out.push({ slot: 'breakfast', entry: day.breakfast })
  if (day.lunch) out.push({ slot: 'lunch', entry: day.lunch })
  if (day.dinner) out.push({ slot: 'dinner', entry: day.dinner })
  for (const s of day.snacks) out.push({ slot: 'snack', entry: s })
  return out
}
