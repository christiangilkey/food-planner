import { crashRisk, easeScore, rewardScore, satietyScore, servingTotals } from './nutrition'
import { isAdhd } from './planner'
import type { AppState, MealSlot, Recipe } from '../types'

export const SLOT_LABEL: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

/** Monday = 0, matching the plan's day order. */
export const todayIndex = () => (new Date().getDay() + 6) % 7

/** At most two plain-language highlights for a meal, instead of numeric scores. */
export function mealBadges(r: Recipe, portion: number, state: AppState): { text: string; tone: 'good' | 'accent' | 'warn' }[] {
  const t = servingTotals(r, portion)
  const out: { text: string; tone: 'good' | 'accent' | 'warn' }[] = []
  if (crashRisk(t)) out.push({ text: 'Sugar crash risk', tone: 'warn' })
  if (satietyScore(t) >= 70) out.push({ text: 'Very filling', tone: 'good' })
  if (isAdhd(state.profile) && easeScore(r) >= 80) out.push({ text: 'Low effort', tone: 'good' })
  else if (r.activeMin <= 5) out.push({ text: 'Quick', tone: 'good' })
  if (isAdhd(state.profile) && rewardScore(r) >= 67) out.push({ text: 'Satisfying', tone: 'accent' })
  if (r.batch && r.servings > 1) out.push({ text: `Makes ${r.servings} servings`, tone: 'accent' })
  return out.slice(0, 2)
}
