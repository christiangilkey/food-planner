import { FOODS } from '../data/foods'
import { NUTRIENTS, SODIUM_LIMIT_MG, UPPER_LIMITS, type NutrientInfo } from '../data/nutrients'
import { RECIPES } from '../data/recipes'
import type { AppState, Food, NutrientKey, Recipe } from '../types'
import { computeTargets } from './energy'
import { avoidedFoods, mergedLimits, nutrientTarget, recipeAllowed } from './conditions'
import { addInto, canMake, EMPTY, servingTotals } from './nutrition'
import { dayTotals } from './planner'

export type Status = 'low' | 'borderline' | 'ok'

export interface NutrientReport {
  info: NutrientInfo
  perDay: number
  target: number
  pct: number
  status: Status
  /** Safe upper limit, if one applies, and whether the plan is near or over it. */
  upperLimit?: number
  nearUpper: boolean
  /** Best whole foods for this nutrient (per typical serving). */
  foods: { food: Food; perServing: number; servingGrams: number }[]
  /** Recipes the user can make that supply the most of it. */
  recipes: { recipe: Recipe; perServing: number }[]
}

export interface WeekAnalysis {
  reports: NutrientReport[]
  sodiumPerDay: number
  /** Daily sodium ceiling: 2,300 mg, or a condition's stricter goal. */
  sodiumLimit: number
  satFatPct: number
  addedSugarPct: number
  daysPlanned: number
}

export function analyzeWeek(state: AppState): WeekAnalysis {
  const p = state.profile
  const avoided = avoidedFoods(p)
  const limits = mergedLimits(p)
  const targets = computeTargets(p)
  const sum = { ...EMPTY }
  let daysPlanned = 0
  for (const day of state.plan) {
    const t = dayTotals(day)
    if (t.kcal > 0) daysPlanned++
    addInto(sum, t)
  }
  const div = Math.max(1, daysPlanned)

  const reports = NUTRIENTS.map((info): NutrientReport => {
    const key = info.key as NutrientKey
    const perDay = sum[key] / div
    const target = nutrientTarget(key, p, targets.kcal)
    const pct = target ? perDay / target : 1
    const status: Status = pct < 0.7 ? 'low' : pct < 0.9 ? 'borderline' : 'ok'

    const foods = FOODS.filter((f) => !p.excluded.includes(f.id) && !avoided.has(f.id))
      .map((f) => {
        const servingGrams = f.serving
        return { food: f, servingGrams, perServing: (f.n[key] * servingGrams) / 100 }
      })
      .filter((x) => x.perServing > target * 0.1)
      .sort((a, b) => b.perServing - a.perServing)
      .slice(0, 5)

    const recipes = RECIPES.filter((r) => canMake(r, state.equipment) && !r.items.some((i) => p.excluded.includes(i.food)) && recipeAllowed(r, p, avoided, limits))
      .map((r) => ({ recipe: r, perServing: servingTotals(r)[key] }))
      .sort((a, b) => b.perServing - a.perServing)
      .slice(0, 3)

    const upperLimit = UPPER_LIMITS[key]
    const nearUpper = upperLimit !== undefined && perDay >= upperLimit * 0.8
    return { info, perDay, target, pct, status, upperLimit, nearUpper, foods, recipes }
  })

  return {
    reports,
    sodiumPerDay: sum.sodium / div,
    sodiumLimit: limits.sodiumGoalMg ?? SODIUM_LIMIT_MG,
    satFatPct: sum.kcal ? (sum.satFat * 900) / sum.kcal : 0,
    addedSugarPct: sum.kcal ? (sum.addedSugar * 400) / sum.kcal : 0,
    daysPlanned,
  }
}

export { SODIUM_LIMIT_MG }
