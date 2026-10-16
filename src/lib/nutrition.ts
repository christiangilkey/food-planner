import { FOOD_BY_ID } from '../data/foods'
import { priceIndex } from '../data/regions'
import type { AppState, Equipment, Nutrients, Recipe } from '../types'

export const EMPTY: Nutrients = {
  kcal: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, water: 0, sodium: 0, fiber: 0, calcium: 0,
  iron: 0, magnesium: 0, potassium: 0, zinc: 0, vitA: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0,
  folate: 0, b12: 0, omega3: 0, choline: 0, b6: 0, selenium: 0, satFat: 0, addedSugar: 0, caffeine: 0,
}

const KEYS = Object.keys(EMPTY) as (keyof Nutrients)[]

export function addInto(acc: Nutrients, n: Nutrients, scale = 1): Nutrients {
  for (const k of KEYS) acc[k] += n[k] * scale
  return acc
}

export interface Totals extends Nutrients {
  grams: number
  /** Weight adjusted for volume: airy foods count as ~4× their weight for fullness. */
  bulk: number
}

export function itemsTotals(items: { food: string; grams: number }[], scale = 1): Totals {
  const t: Totals = { ...EMPTY, grams: 0, bulk: 0 }
  for (const it of items) {
    const f = FOOD_BY_ID[it.food]
    if (!f) continue
    const g = it.grams * scale
    addInto(t, f.n, g / 100)
    t.grams += g
    t.bulk += f.airy ? g * 4 : g
  }
  return t
}

/** Nutrition for one plan entry: one serving × portion. */
const totalsCache = new Map<string, Readonly<Totals>>()

/** Nutrition for one plan entry: one serving × portion. Cached; treat the result as read-only. */
export function servingTotals(r: Recipe, portion = 1): Readonly<Totals> {
  const key = `${r.id}|${portion}`
  let t = totalsCache.get(key)
  if (!t) {
    t = Object.freeze(itemsTotals(r.items, portion / r.servings))
    totalsCache.set(key, t)
  }
  return t
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

/**
 * Fullness per calorie, 0–100. Driven by the factors with the best satiety evidence:
 * low energy density (lots of food volume per calorie), a high share of calories from
 * protein, and fiber. Sugar-heavy foods get a penalty.
 */
export function satietyScore(t: Nutrients & { grams: number; bulk?: number }): number {
  const weight = t.bulk ?? t.grams
  if (t.kcal <= 0 || weight <= 0) return 0
  const ed = t.kcal / weight // kcal per (volume-adjusted) gram
  const edScore = clamp01((3 - ed) / 2.4) // 0.6 kcal/g → 1, 3 kcal/g → 0
  const proteinScore = clamp01((t.protein * 4) / t.kcal / 0.35) // 35%+ of kcal from protein → 1
  const fiberScore = clamp01(t.fiber / (t.kcal / 100) / 3) // 3 g fiber per 100 kcal → 1
  const sugarShare = (t.sugar * 4) / t.kcal
  const sugarPenalty = clamp01((sugarShare - 0.2) / 0.3) // 20% sugar is fine, 50%+ is maxed out
  return Math.round(100 * (0.35 * edScore + 0.35 * proteinScore + 0.2 * fiberScore + 0.1 * (1 - sugarPenalty)))
}

/** How rewarding/stimulating a food is to eat: crunch, bold flavor, novelty, fun. 0–100. */
export function rewardScore(r: Recipe): number {
  const d = r.dopamine
  return Math.round(((d.crunch + d.flavor + d.novelty + d.fun) / 12) * 100)
}

/** Low executive-function cost, 0–100: few steps, little hands-on time, few tools. */
export function easeScore(r: Recipe): number {
  const timePenalty = clamp01(r.activeMin / 30) * 55
  const stepPenalty = clamp01((r.steps - 1) / 5) * 30
  const toolPenalty = clamp01(r.equipment.length / 3) * 15
  return Math.round(100 - timePenalty - stepPenalty - toolPenalty)
}

/** Likely to spike then crash blood sugar: lots of sugar, little protein or fiber to slow it. */
export function crashRisk(t: Nutrients): boolean {
  if (t.kcal <= 0) return false
  const sugarShare = (t.sugar * 4) / t.kcal
  const proteinShare = (t.protein * 4) / t.kcal
  const fiberPer100 = t.fiber / (t.kcal / 100)
  return sugarShare > 0.3 && proteinShare < 0.12 && fiberPer100 < 2
}

/** Can this recipe be made with the equipment the user owns? */
export function canMake(r: Recipe, owned: Equipment[]): boolean {
  const has = (set: Equipment[]) => set.every((e) => owned.includes(e))
  return has(r.equipment) || (!!r.alt && has(r.alt))
}

// ── Pricing ─────────────────────────────────────────────

/** Estimated package price for the user's region (no store override). */
export function estimatedPackagePrice(foodId: string, state: AppState): number {
  const f = FOOD_BY_ID[foodId]
  return f ? f.packagePrice * priceIndex(state.profile.state) : 0
}

/** Package price at a given store: the user's entered price, else the regional estimate. */
export function packagePrice(foodId: string, state: AppState, storeId = state.preferredStore): number {
  const override = storeId ? state.priceOverrides[storeId]?.[foodId] : undefined
  return override ?? estimatedPackagePrice(foodId, state)
}

export function pricePerGram(foodId: string, state: AppState): number {
  const f = FOOD_BY_ID[foodId]
  return f ? packagePrice(foodId, state) / f.packageGrams : 0
}

/** Ingredient cost of one serving × portion (by weight used, not whole packages). */
export function servingCost(r: Recipe, state: AppState, portion = 1): number {
  let c = 0
  for (const it of r.items) c += pricePerGram(it.food, state) * it.grams * (portion / r.servings)
  return c
}
