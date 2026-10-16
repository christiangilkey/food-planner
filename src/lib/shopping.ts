import { FOOD_BY_ID } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import type { Aisle, AppState, DayPlan, Food } from '../types'
import { packagePrice } from './nutrition'
import { dayEntries } from './plan-utils'

export interface ShoppingItem {
  food: Food
  /** Grams the plan uses this week. */
  needGrams: number
  /** Grams already at home. */
  pantryGrams: number
  /** Grams still to buy (need − pantry). */
  buyGrams: number
  packages: number
  /** Cost at the preferred store (or the regional estimate). */
  cost: number
  /** Cheapest store with an entered price, if it beats the preferred store. */
  cheaper?: { storeId: string; storeName: string; cost: number }
  /** Grams left over after the week, from rounding up to whole packages. */
  leftoverGrams: number
  /** The leftovers will likely spoil before the week ends plus a few days. */
  spoilRisk: boolean
}

export const AISLE_ORDER: Aisle[] = [
  'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery & Grains', 'Canned & Dry', 'Frozen', 'Snacks', 'Condiments & Oils',
]

export function weeklyNeeds(plan: DayPlan[]): Record<string, number> {
  const need: Record<string, number> = {}
  for (const day of plan) for (const { entry } of dayEntries(day)) {
    const r = RECIPE_BY_ID[entry.recipe]
    if (!r) continue
    for (const it of r.items) need[it.food] = (need[it.food] ?? 0) + (it.grams * entry.portion) / r.servings
  }
  return need
}

export function buildShoppingList(state: AppState): { items: ShoppingItem[]; covered: ShoppingItem[]; total: number } {
  const need = weeklyNeeds(state.plan)
  const items: ShoppingItem[] = []
  const covered: ShoppingItem[] = []
  for (const [foodId, needGrams] of Object.entries(need)) {
    const food = FOOD_BY_ID[foodId]
    if (!food || needGrams < 1) continue
    const pantryGrams = state.pantry.find((p) => p.food === foodId)?.grams ?? 0
    const buyGrams = Math.max(0, needGrams - pantryGrams)
    // Allow a 10% tolerance so 460 g of a 454 g pack doesn't force a second pack.
    const packages = buyGrams <= 0 ? 0 : Math.max(1, Math.ceil(buyGrams / (food.packageGrams * 1.1)))
    const unit = packagePrice(foodId, state)
    const cost = packages * unit

    let cheaper: ShoppingItem['cheaper']
    for (const store of state.stores) {
      if (store.id === state.preferredStore) continue
      const price = state.priceOverrides[store.id]?.[foodId]
      if (price === undefined) continue
      const c = packages * price
      if (c < cost - 0.005 && (!cheaper || c < cheaper.cost)) cheaper = { storeId: store.id, storeName: store.name, cost: c }
    }

    const leftoverGrams = Math.max(0, packages * food.packageGrams - buyGrams)
    const item: ShoppingItem = {
      food, needGrams, pantryGrams, buyGrams, packages, cost, cheaper, leftoverGrams,
      spoilRisk: leftoverGrams > food.packageGrams * 0.25 && food.shelfDays <= 10,
    }
    if (packages === 0) covered.push(item)
    else items.push(item)
  }
  items.sort((a, b) => AISLE_ORDER.indexOf(a.food.aisle) - AISLE_ORDER.indexOf(b.food.aisle) || a.food.name.localeCompare(b.food.name))
  covered.sort((a, b) => a.food.name.localeCompare(b.food.name))
  const total = items.reduce((s, i) => s + i.cost, 0)
  return { items, covered, total }
}

export function formatGrams(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`
  return `${Math.round(g)} g`
}

export function formatLb(g: number): string {
  const oz = g / 28.3495
  if (oz < 0.95) return '<1 oz'
  return oz >= 16 ? `${(oz / 16).toFixed(1)} lb` : `${Math.round(oz)} oz`
}
