import { FOOD_BY_ID } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import { PLANT_TARGET, PROTEIN_GROUPS, PROTEIN_VARIETY_TARGET, type RotationRule } from '../data/rotation'
import type { AppState, DayPlan, Evidence, FoodGroup, Recipe } from '../types'
import { activeRules } from './conditions'
import { dayEntries } from './plan-utils'

export type GroupServings = Partial<Record<FoodGroup, number>>

/** Standard servings of each food group in one plan entry. */
const groupsCache = new Map<string, { servings: GroupServings; plants: string[] }>()

/** Standard servings of each food group in one plan entry (cached; read-only). */
export function entryGroups(r: Recipe, portion: number): { servings: GroupServings; plants: string[] } {
  const key = `${r.id}|${portion}`
  const hit = groupsCache.get(key)
  if (hit) return hit
  const out = computeGroups(r, portion)
  groupsCache.set(key, out)
  return out
}

function computeGroups(r: Recipe, portion: number): { servings: GroupServings; plants: string[] } {
  const servings: GroupServings = {}
  const plants = new Set<string>()
  for (const it of r.items) {
    const f = FOOD_BY_ID[it.food]
    if (!f) continue
    const s = (it.grams * portion) / r.servings / f.serving
    for (const g of f.groups) servings[g] = (servings[g] ?? 0) + s
    f.plants.forEach((p) => plants.add(p))
  }
  return { servings, plants: [...plants] }
}

export function addGroups(into: GroupServings, add: GroupServings) {
  for (const [g, n] of Object.entries(add) as [FoodGroup, number][]) into[g] = (into[g] ?? 0) + n
}

/** Standard servings of a week (or meal) that count toward a rule. */
export function ruleServings(rule: RotationRule, servings: GroupServings): number {
  if (rule.groups.length === 1) return servings[rule.groups[0]] ?? 0
  // Multi-group rules (all vegetables) sum the groups; foods carry only one veg group each.
  return rule.groups.reduce((s, g) => s + (servings[g] ?? 0), 0)
}

export function ruleTarget(rule: RotationRule): { min?: number; max?: number } {
  return { min: rule.min, max: rule.max }
}

export const EVIDENCE_WEIGHT: Record<Evidence, number> = { strong: 1, moderate: 0.7, emerging: 0.4 }

export interface RuleStatus {
  rule: RotationRule
  servings: number
  min?: number
  max?: number
  status: 'met' | 'short' | 'over'
  /** Day indexes it's eaten on. */
  days: number[]
}

export interface RotationReport {
  rules: RuleStatus[]
  plants: string[]
  proteinGroups: FoodGroup[]
}

export function weekGroups(plan: DayPlan[]): { total: GroupServings; byDay: GroupServings[]; plants: Set<string> } {
  const total: GroupServings = {}
  const plants = new Set<string>()
  const byDay = plan.map((day) => {
    const d: GroupServings = {}
    for (const { entry } of dayEntries(day)) {
      const r = RECIPE_BY_ID[entry.recipe]
      if (!r) continue
      const g = entryGroups(r, entry.portion)
      addGroups(d, g.servings)
      g.plants.forEach((p) => plants.add(p))
    }
    addGroups(total, d)
    return d
  })
  return { total, byDay, plants }
}

export function analyzeRotation(state: AppState): RotationReport {
  const { total, byDay, plants } = weekGroups(state.plan)
  const rules = activeRules(state.profile).map((rule): RuleStatus => {
    const servings = ruleServings(rule, total)
    const { min, max } = ruleTarget(rule)
    const status = max !== undefined && servings > max + 0.25 ? 'over' : min !== undefined && servings < min - 0.25 ? 'short' : 'met'
    const days = byDay.flatMap((d, i) => (ruleServings(rule, d) >= 0.25 ? [i] : []))
    return { rule, servings, min, max, status, days }
  })
  const proteinGroups = PROTEIN_GROUPS.filter((g) => (total[g] ?? 0) >= 0.75)
  return { rules, plants: [...plants].sort(), proteinGroups }
}

/**
 * Planner helper, 0–1: how much a candidate meal helps the week hit its food-frequency
 * guidelines given what's already planned.
 */
export function rotationScore(
  add: { servings: GroupServings; plants: string[] },
  week: GroupServings,
  weekPlants: Set<string>,
  rules: RotationRule[],
): number {
  let bonus = 0
  let penalty = 0
  for (const rule of rules) {
    const adding = ruleServings(rule, add.servings)
    if (adding <= 0) continue
    const have = ruleServings(rule, week)
    const { min, max } = ruleTarget(rule)
    const w = EVIDENCE_WEIGHT[rule.evidence]
    if (min && have < min) {
      // Reward filling what's still missing for the week, most strongly for the first servings.
      bonus += w * Math.min(1, adding / Math.max(0.5, min / 7)) * ((min - have) / min)
    }
    if (max !== undefined && have + adding > max + 0.25) penalty += w
  }
  if (weekPlants.size < PLANT_TARGET) bonus += 0.08 * add.plants.filter((p) => !weekPlants.has(p)).length
  return Math.max(0, Math.min(1, 0.4 + 0.35 * bonus - 0.6 * penalty))
}

/** How far a plan is from its rotation guidelines, weighted by evidence. 0 = all met. */
export function rotationGap(plan: DayPlan[], rules: RotationRule[]): number {
  const { total } = weekGroups(plan)
  let gap = 0
  for (const rule of rules) {
    const have = ruleServings(rule, total)
    const { min, max } = ruleTarget(rule)
    const w = EVIDENCE_WEIGHT[rule.evidence]
    if (min && have < min - 0.25) gap += (w * (min - have)) / min
    if (max !== undefined && have > max + 0.25) gap += (w * (have - max)) / max
  }
  return gap
}

export { PLANT_TARGET, PROTEIN_VARIETY_TARGET }
