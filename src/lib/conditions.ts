import { CONDITION_BY_ID, CONDITIONS, type AvoidEntry, type Claim, type Condition, type Limits } from '../data/conditions'
import { RECIPE_BY_ID } from '../data/recipes'
import { ROTATION_RULES, type RotationRule } from '../data/rotation'
import { dailyTarget } from '../data/nutrients'
import type { ConditionId, DayPlan, NutrientKey, Profile, Recipe } from '../types'
import { addInto, crashRisk, EMPTY, servingTotals } from './nutrition'
import { dayEntries } from './plan-utils'

export const hasCondition = (p: Profile, id: ConditionId) => p.conditions.includes(id)

export function activeConditions(p: Profile): Condition[] {
  return CONDITIONS.filter((c) => p.conditions.includes(c.id))
}

export interface AvoidReason { condition: Condition; entry: AvoidEntry }

/** Every food the active conditions remove from the plan, with the reasons. */
export function avoidedFoods(p: Profile): Map<string, AvoidReason[]> {
  const out = new Map<string, AvoidReason[]>()
  for (const condition of activeConditions(p)) {
    for (const entry of condition.avoid) {
      if (entry.onlyIf === 'maoi' && !p.maoi) continue
      for (const food of entry.foods) {
        if (entry.optIn && !p.optInTriggers.includes(food)) continue
        if (entry.tolerable && p.toleratedTriggers.includes(food)) continue
        out.set(food, [...(out.get(food) ?? []), { condition, entry }])
      }
    }
  }
  return out
}

/** The strictest version of every limit across active conditions. */
export function mergedLimits(p: Profile): Limits {
  const out: Limits = {}
  const min = (a: number | undefined, b: number | undefined) => (a === undefined ? b : b === undefined ? a : Math.min(a, b))
  const max = (a: number | undefined, b: number | undefined) => (a === undefined ? b : b === undefined ? a : Math.max(a, b))
  for (const c of activeConditions(p)) {
    const l = c.limits
    out.sodiumMaxMg = min(out.sodiumMaxMg, l.sodiumMaxMg)
    out.sodiumGoalMg = min(out.sodiumGoalMg, l.sodiumGoalMg)
    out.satFatMaxPct = min(out.satFatMaxPct, l.satFatMaxPct)
    out.addedSugarMaxPct = min(out.addedSugarMaxPct, l.addedSugarMaxPct)
    out.eggsMaxWeek = min(out.eggsMaxWeek, l.eggsMaxWeek)
    out.proteinMaxPerKg = min(out.proteinMaxPerKg, l.proteinMaxPerKg)
    out.lastFoodBeforeBedMin = max(out.lastFoodBeforeBedMin, l.lastFoodBeforeBedMin)
    out.noCrashMeals = out.noCrashMeals || l.noCrashMeals
  }
  return out
}

/** The claim behind each active limit, for display. */
export function limitReasons(p: Profile): { key: keyof Limits; condition: Condition; claim: Claim }[] {
  return activeConditions(p).flatMap((c) =>
    (Object.entries(c.limitReasons) as [keyof Limits, Claim][]).map(([key, claim]) => ({ key, condition: c, claim })),
  )
}

/** Base weekly rotation rules plus the extra ones each active condition adds. */
export function activeRules(p: Profile): RotationRule[] {
  const rules = [...ROTATION_RULES]
  for (const c of activeConditions(p)) for (const r of c.rules) if (!rules.some((x) => x.id === r.id)) rules.push(r)
  return rules
}

export function suppressedTips(p: Profile): Set<string> {
  return new Set(activeConditions(p).flatMap((c) => c.suppressTips))
}

/** Is this recipe allowed at all under the active conditions? */
export function recipeAllowed(r: Recipe, p: Profile, avoided = avoidedFoods(p), limits = mergedLimits(p)): boolean {
  if (r.items.some((i) => avoided.has(i.food))) return false
  if (limits.noCrashMeals && crashRisk(servingTotals(r))) return false
  return true
}

export interface Violation {
  kind: 'avoided' | 'sodium' | 'satFat' | 'addedSugar' | 'eggs' | 'crash'
  message: string
  day?: number
}

const EGG_SERVING_G = 50

/** Everything in a plan that breaks an active condition's rules. Empty = safe. */
export function planViolations(p: Profile, plan: DayPlan[]): Violation[] {
  const avoided = avoidedFoods(p)
  const limits = mergedLimits(p)
  const out: Violation[] = []
  const week = { ...EMPTY }
  let eggs = 0
  plan.forEach((day, d) => {
    const dayTotals = { ...EMPTY }
    for (const { entry } of dayEntries(day)) {
      const r = RECIPE_BY_ID[entry.recipe]
      if (!r) continue
      const bad = r.items.find((i) => avoided.has(i.food))
      if (bad) out.push({ kind: 'avoided', day: d, message: `${r.name} contains a food your conditions exclude.` })
      const t = servingTotals(r, entry.portion)
      if (limits.noCrashMeals && crashRisk(t)) out.push({ kind: 'crash', day: d, message: `${r.name} is likely to spike blood sugar.` })
      addInto(dayTotals, t)
      eggs += r.items.filter((i) => i.food === 'egg').reduce((s, i) => s + (i.grams * entry.portion) / r.servings / EGG_SERVING_G, 0)
    }
    if (limits.sodiumMaxMg && dayTotals.sodium > limits.sodiumMaxMg) {
      out.push({ kind: 'sodium', day: d, message: `${Math.round(dayTotals.sodium)} mg sodium, over the ${limits.sodiumMaxMg} mg daily cap.` })
    }
    addInto(week, dayTotals)
  })
  if (week.kcal > 0) {
    const satPct = (week.satFat * 9 * 100) / week.kcal
    if (limits.satFatMaxPct && satPct > limits.satFatMaxPct) out.push({ kind: 'satFat', message: `Saturated fat is ${satPct.toFixed(1)}% of calories (limit ${limits.satFatMaxPct}%).` })
    const sugarPct = (week.addedSugar * 4 * 100) / week.kcal
    if (limits.addedSugarMaxPct && sugarPct > limits.addedSugarMaxPct) out.push({ kind: 'addedSugar', message: `Added sugar is ${sugarPct.toFixed(1)}% of calories (limit ${limits.addedSugarMaxPct}%).` })
  }
  if (limits.eggsMaxWeek && eggs > limits.eggsMaxWeek + 0.25) out.push({ kind: 'eggs', message: `${eggs.toFixed(1)} eggs this week (limit ${limits.eggsMaxWeek}).` })
  return out
}

/** How far a plan is over its hard limits, as one number (0 = within all limits). Used to steer repairs. */
export function safetyGap(p: Profile, plan: DayPlan[]): number {
  const limits = mergedLimits(p)
  const avoided = avoidedFoods(p)
  let gap = 0
  const week = { ...EMPTY }
  let eggs = 0
  for (const day of plan) {
    const t = { ...EMPTY }
    for (const { entry } of dayEntries(day)) {
      const r = RECIPE_BY_ID[entry.recipe]
      if (!r) continue
      if (r.items.some((i) => avoided.has(i.food))) gap += 5
      const s = servingTotals(r, entry.portion)
      if (limits.noCrashMeals && crashRisk(s)) gap += 2
      addInto(t, s)
      eggs += r.items.filter((i) => i.food === 'egg').reduce((sum, i) => sum + (i.grams * entry.portion) / r.servings / EGG_SERVING_G, 0)
    }
    if (limits.sodiumMaxMg && t.sodium > limits.sodiumMaxMg) gap += 2 + (t.sodium - limits.sodiumMaxMg) / limits.sodiumMaxMg
    // Softer pull toward the ideal sodium goal.
    if (limits.sodiumGoalMg && t.sodium > limits.sodiumGoalMg) gap += (0.3 * (t.sodium - limits.sodiumGoalMg)) / limits.sodiumGoalMg
    addInto(week, t)
  }
  if (week.kcal > 0) {
    const satPct = (week.satFat * 900) / week.kcal
    if (limits.satFatMaxPct && satPct > limits.satFatMaxPct) gap += 2 + (satPct - limits.satFatMaxPct) / limits.satFatMaxPct
    const sugarPct = (week.addedSugar * 400) / week.kcal
    if (limits.addedSugarMaxPct && sugarPct > limits.addedSugarMaxPct) gap += 2 + (sugarPct - limits.addedSugarMaxPct) / limits.addedSugarMaxPct
  }
  if (limits.eggsMaxWeek && eggs > limits.eggsMaxWeek + 0.25) gap += 2 + (eggs - limits.eggsMaxWeek) / limits.eggsMaxWeek
  return gap
}

/** Menopause stage and age adjust iron and calcium targets. */
export function targetOverrides(p: Profile): { iron?: number; calcium?: number } {
  if (p.sex !== 'female' || !hasCondition(p, 'menopause')) return {}
  if (p.menopauseStage === 'peri') return { iron: 18 }
  return { iron: 8, calcium: 1200 }
}

/** Daily target for a nutrient, after any condition-specific adjustments. */
export function nutrientTarget(key: NutrientKey, p: Profile, kcal: number): number {
  const o = targetOverrides(p)
  const base = dailyTarget(key, p.sex, p.age, kcal, o.iron)
  return key === 'calcium' && o.calcium ? Math.max(base, o.calcium) : base
}

export { CONDITION_BY_ID, CONDITIONS }
