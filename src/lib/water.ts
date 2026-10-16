import { FOOD_BY_ID } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import type { Activity, DayPlan, Profile } from '../types'
import type { Explained } from './energy'
import { dayEntries } from './plan-utils'

/**
 * Extra water for exercise sweat. ACSM puts sweat losses at roughly 0.5–2 L per hour of exercise;
 * these are estimates of a typical day's training at each activity level.
 */
const ACTIVITY_EXTRA_ML: Record<Activity, number> = { sedentary: 0, light: 250, moderate: 500, very: 750, athlete: 1000 }

/** Dry foods soak up cooking water you then eat: grams of water absorbed per gram dry. */
const COOKING_WATER: Record<string, number> = { white_rice: 1.7, brown_rice: 1.8, pasta: 1.3, lentils: 2.0 }

export interface WaterPlan {
  /** Total water need from all sources, ml. */
  totalMl: number
  /** Water supplied by the day's planned food (including cooking water), ml. */
  foodMl: number
  /** How much of that is credited against the total (capped at 30%), ml. */
  fromFoodMl: number
  /** What to drink, ml. */
  drinkMl: number
  explain: Explained[]
}

export function foodWaterMl(day: DayPlan): number {
  let ml = 0
  for (const { entry } of dayEntries(day)) {
    const r = RECIPE_BY_ID[entry.recipe]
    if (!r) continue
    for (const it of r.items) {
      const f = FOOD_BY_ID[it.food]
      if (!f) continue
      const g = (it.grams * entry.portion) / r.servings
      ml += (g * f.n.water) / 100 + g * (COOKING_WATER[f.id] ?? 0)
    }
  }
  return ml
}

/**
 * Daily water from the National Academies' Adequate Intake (3.7 L men, 2.7 L women, total
 * from all sources), plus exercise sweat and heat. Food typically supplies about 20%.
 */
export function waterPlan(p: Profile, day: DayPlan): WaterPlan {
  const base = p.sex === 'male' ? 3700 : 2700
  const activity = ACTIVITY_EXTRA_ML[p.activity]
  const heat = p.hotClimate ? 500 : 0
  const totalMl = base + activity + heat
  const foodMl = foodWaterMl(day)
  const fromFood = foodMl > 0 ? Math.min(foodMl, totalMl * 0.3) : totalMl * 0.2
  const drinkMl = Math.max(1500, Math.round((totalMl - fromFood) / 50) * 50)

  const explain: Explained[] = [
    { text: `${(base / 1000).toFixed(1)} L total water a day: the National Academies’ Adequate Intake for adult ${p.sex === 'male' ? 'men' : 'women'}, counting food and drinks.`, sources: ['nasem_water'] },
  ]
  if (activity) explain.push({ text: `+${activity} ml for exercise sweat. Sweat losses are roughly 0.5–2 L per hour of exercise, so add more on long or hot sessions.`, sources: ['acsm_fluid'], convention: 'The per-activity-level amounts are this app’s estimates within the ACSM range.' })
  if (heat) explain.push({ text: '+500 ml for hot weather or heavy sweating; water needs rise with heat.', sources: ['nasem_water', 'acsm_fluid'], convention: 'The 500 ml figure is this app’s estimate.' })
  explain.push({ text: `Food supplies about ${(fromFood / 1000).toFixed(1)} L${foodMl > 0 ? " from today's plan" : ''} (typically about 20% of total water), so drink the rest.`, sources: ['nasem_water'] })
  explain.push({ text: 'Coffee and tea count toward your fluids. Pale-yellow urine is a practical sign you’re drinking enough.', sources: ['nasem_water'] })
  if (p.conditions.includes('ckd')) explain.push({ text: 'If your kidney or heart team has set a fluid limit, follow that instead of this target.', sources: ['kdoqi'] })
  return { totalMl, foodMl, fromFoodMl: fromFood, drinkMl, explain }
}

export const glasses = (ml: number) => Math.round(ml / 250)
