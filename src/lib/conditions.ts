import { CONDITION_BY_ID, CONDITIONS, FLAG_AVOIDS, type AvoidEntry, type AvoidFlag, type Claim, type Condition, type Limits } from '../data/conditions'
import { DIET_BY_ID, DIETS, dietAllowsFood, type Diet } from '../data/diets'
import { FOOD_BY_ID, FOODS } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import { ROTATION_RULES, type RotationRule } from '../data/rotation'
import { dailyTarget } from '../data/nutrients'
import type { ConditionId, DayPlan, Food, NutrientKey, Profile, Recipe } from '../types'
import { addInto, crashRisk, EMPTY, servingTotals } from './nutrition'
import { dayEntries } from './plan-utils'

export const hasCondition = (p: Profile, id: ConditionId) => p.conditions.includes(id)

const medFlag = (p: Profile, flag: AvoidFlag) => (flag === 'maoi' ? p.maoi : flag === 'pregnant' ? p.meds.pregnant : p.meds.grapefruitMeds)

const FLAG_LABEL: Record<AvoidFlag, string> = { maoi: 'MAOI', grapefruitMeds: 'Grapefruit-warning medicine', pregnant: 'Pregnancy' }

/** What to call the reason a food is ruled out: the condition, or the setting behind a medication or pregnancy rule. */
export const avoidLabel = (r: AvoidReason) => (r.entry.onlyIf ? FLAG_LABEL[r.entry.onlyIf] : r.condition?.label ?? '')

export function activeConditions(p: Profile): Condition[] {
  return CONDITIONS.filter((c) => p.conditions.includes(c.id))
}

/** Why a food is ruled out. condition is missing for rules that come from a setting alone (pregnancy). */
export interface AvoidReason { condition?: Condition; entry: AvoidEntry }

/**
 * Every food the active conditions remove from the plan, with the reasons. Medication-based
 * avoids (MAOI) apply whenever the medication is set, even if the related condition is off.
 */
export function avoidedFoods(p: Profile): Map<string, AvoidReason[]> {
  const out = new Map<string, AvoidReason[]>()
  for (const condition of CONDITIONS) {
    const active = p.conditions.includes(condition.id)
    for (const entry of condition.avoid) {
      if (entry.onlyIf ? !medFlag(p, entry.onlyIf) : !active) continue
      for (const food of entry.foods) {
        if (entry.optIn && !p.optInTriggers.includes(food)) continue
        if (entry.tolerable && p.toleratedTriggers.includes(food)) continue
        out.set(food, [...(out.get(food) ?? []), { condition, entry }])
      }
    }
  }
  for (const entry of FLAG_AVOIDS) {
    if (!entry.onlyIf || !medFlag(p, entry.onlyIf)) continue
    for (const food of entry.foods) out.set(food, [...(out.get(food) ?? []), { entry }])
  }
  // Scanned products: look for the same foods (and any extra trigger words) in the name and ingredients.
  for (const f of FOODS) {
    if (!f.scanText) continue
    const hits = productTriggers(f, p, out)
    if (hits.length) out.set(f.id, hits)
  }
  return out
}

/** Whole-word, plural-tolerant match that skips plant butters and milks ("peanut butter" isn't butter). */
const hasWord = (text: string, word: string) =>
  new RegExp(`(?<!(?:peanut|almond|cashew|cocoa|shea|apple|nut|seed|sunflower|coconut|oat|soy|rice) )\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:e?s)?\\b`, 'i').test(text)

/** How a food on an avoid list shows up in ingredient lists, when its name alone wouldn't. */
const SEARCH_TERMS: Record<string, string[]> = {
  canned_tomatoes: ['tomato'], tomato: ['tomato'], marinara: ['marinara', 'tomato sauce'], clementine: ['clementine', 'mandarin'],
  orange: ['orange'], lemon: ['lemon'], lime: ['lime'], dark_chocolate: ['chocolate', 'cocoa'], coffee: ['coffee', 'espresso'],
  green_tea: ['green tea', 'matcha'], soy_sauce: ['soy sauce', 'tamari', 'shoyu'], jerky: ['jerky'], deli_turkey: ['deli turkey', 'turkey breast'],
}
/** "Cheddar cheese (aged)" → "cheddar cheese": the part of a food's name worth searching for. */
const searchTerms = (id: string) => SEARCH_TERMS[id] ?? [FOOD_BY_ID[id].name.replace(/\(.*?\)/g, '').trim().toLowerCase()]

/**
 * Why a scanned product is unsafe for this person: an avoided food or trigger word in its name
 * or ingredients. With an MAOI and no ingredient list, it can't be checked, so it's kept out.
 */
export function productTriggers(f: Food, p: Profile, avoided: Map<string, AvoidReason[]>): AvoidReason[] {
  const text = f.scanText ?? ''
  const hits: AvoidReason[] = []
  for (const r of activeAvoidEntries(p)) {
    const foods = r.entry.foods.filter((id) => avoided.get(id)?.some((x) => x.entry === r.entry) && FOOD_BY_ID[id])
    const words = [...foods.flatMap(searchTerms), ...(r.entry.keywords ?? [])]
    if (words.some((w) => hasWord(text, w))) hits.push(r)
    else if (r.entry.onlyIf === 'maoi' && !f.ingredientsKnown) hits.push(r)
  }
  return hits
}

/** Avoid entries that apply to this person (condition on, or medication set), keyword-only entries included. */
export function activeAvoidEntries(p: Profile): AvoidReason[] {
  return CONDITIONS.flatMap((condition) =>
    condition.avoid
      .filter((entry) => (entry.onlyIf ? medFlag(p, entry.onlyIf) : p.conditions.includes(condition.id)))
      .map((entry): AvoidReason => ({ condition, entry })),
  ).concat(FLAG_AVOIDS.filter((entry) => entry.onlyIf && medFlag(p, entry.onlyIf)).map((entry) => ({ entry })))
}

export function activeDiets(p: Profile): Diet[] {
  return DIETS.filter((d) => p.diets.includes(d.id))
}

/** Foods outside any of the chosen diets. */
export function dietBlocked(p: Profile): Set<string> {
  const diets = activeDiets(p)
  return new Set(diets.length ? FOODS.filter((f) => diets.some((d) => !dietAllowsFood(d, f.id))).map((f) => f.id) : [])
}

/** Net-carb ceilings from the chosen diets (keto), or undefined. */
export function netCarbLimits(p: Profile): { perServing: number; perDay: number } | undefined {
  const limits = activeDiets(p).map((d) => d.netCarbs).filter((x) => !!x)
  if (!limits.length) return undefined
  return { perServing: Math.min(...limits.map((l) => l.perServing)), perDay: Math.min(...limits.map((l) => l.perDay)) }
}

const netCarbs = (t: { carbs: number; fiber: number }) => Math.max(0, t.carbs - t.fiber)

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
export function recipeAllowed(r: Recipe, p: Profile, avoided = avoidedFoods(p), limits = mergedLimits(p), blocked = dietBlocked(p)): boolean {
  if (r.items.some((i) => avoided.has(i.food) || blocked.has(i.food))) return false
  if (limits.noCrashMeals && crashRisk(servingTotals(r))) return false
  const carbs = netCarbLimits(p)
  if (carbs && netCarbs(servingTotals(r)) > carbs.perServing) return false
  return true
}

export interface Violation {
  kind: 'avoided' | 'diet' | 'netCarbs' | 'sodium' | 'satFat' | 'addedSugar' | 'eggs' | 'crash' | 'caffeine'
  message: string
  day?: number
}

const EGG_SERVING_G = 50

/** Everything in a plan that breaks an active condition's rules. Empty = safe. */
export function planViolations(p: Profile, plan: DayPlan[]): Violation[] {
  const avoided = avoidedFoods(p)
  const limits = mergedLimits(p)
  const blocked = dietBlocked(p)
  const carbLimit = netCarbLimits(p)
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
      if (r.items.some((i) => blocked.has(i.food))) out.push({ kind: 'diet', day: d, message: `${r.name} doesn’t fit your diet.` })
      const t = servingTotals(r, entry.portion)
      if (limits.noCrashMeals && crashRisk(t)) out.push({ kind: 'crash', day: d, message: `${r.name} is likely to spike blood sugar.` })
      addInto(dayTotals, t)
      eggs += r.items.filter((i) => i.food === 'egg').reduce((s, i) => s + (i.grams * entry.portion) / r.servings / EGG_SERVING_G, 0)
    }
    if (limits.sodiumMaxMg && dayTotals.sodium > limits.sodiumMaxMg) {
      out.push({ kind: 'sodium', day: d, message: `${Math.round(dayTotals.sodium)} mg sodium, over the ${limits.sodiumMaxMg} mg daily cap.` })
    }
    if (carbLimit && netCarbs(dayTotals) > carbLimit.perDay + 0.5) {
      out.push({ kind: 'netCarbs', day: d, message: `${Math.round(netCarbs(dayTotals))} g net carbs, over your ${carbLimit.perDay} g keto limit.` })
    }
    if (dayTotals.caffeine > caffeineLimit(p)) {
      out.push({ kind: 'caffeine', day: d, message: `${Math.round(dayTotals.caffeine)} mg caffeine, over the ${caffeineLimit(p)} mg daily limit.` })
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
  const blocked = dietBlocked(p)
  const carbLimit = netCarbLimits(p)
  let gap = 0
  const week = { ...EMPTY }
  let eggs = 0
  for (const day of plan) {
    const t = { ...EMPTY }
    for (const { entry } of dayEntries(day)) {
      const r = RECIPE_BY_ID[entry.recipe]
      if (!r) continue
      if (r.items.some((i) => avoided.has(i.food) || blocked.has(i.food))) gap += 5
      const s = servingTotals(r, entry.portion)
      if (limits.noCrashMeals && crashRisk(s)) gap += 2
      addInto(t, s)
      eggs += r.items.filter((i) => i.food === 'egg').reduce((sum, i) => sum + (i.grams * entry.portion) / r.servings / EGG_SERVING_G, 0)
    }
    if (limits.sodiumMaxMg && t.sodium > limits.sodiumMaxMg) gap += 2 + (t.sodium - limits.sodiumMaxMg) / limits.sodiumMaxMg
    if (carbLimit && netCarbs(t) > carbLimit.perDay) gap += 2 + (netCarbs(t) - carbLimit.perDay) / carbLimit.perDay
    if (t.caffeine > caffeineLimit(p)) gap += 2 + (t.caffeine - caffeineLimit(p)) / caffeineLimit(p)
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

/** Daily caffeine ceiling: 400 mg for most adults (FDA), under 200 mg in pregnancy (ACOG). */
export function caffeineLimit(p: Profile): number {
  return p.meds.pregnant ? 200 : 400
}

/** Caffeinated drinks the planner may use: none if the person doesn't drink caffeine. */
export const CAFFEINATED_DRINKS = ['coffee', 'green_tea']

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

export { CONDITION_BY_ID, CONDITIONS, DIET_BY_ID, DIETS }
