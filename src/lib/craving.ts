import { FOOD_BY_ID, FOODS } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import type { AppState, MealSlot, Recipe } from '../types'
import { activeAvoidEntries, activeConditions, activeDiets, avoidedFoods, avoidLabel, CAFFEINATED_DRINKS, dietBlocked, mergedLimits, netCarbLimits } from './conditions'
import { computeTargets } from './energy'
import { hasLooksGoal } from './looks'
import { packagePrice, servingCost, servingTotals } from './nutrition'
import { eligibleRecipes } from './planner'

/**
 * "I'm craving…": ideas that satisfy a craving and still follow every setting. Everything a
 * suggestion can be is decided here first: only recipes the planner itself would allow (kitchen,
 * time, conditions, diet, exclusions, caffeine) and only foods none of those rules remove. The AI
 * (when the person adds a key) only chooses from these lists, and its picks are checked again.
 */

export interface CravingRecipe {
  id: string
  name: string
  slots: MealSlot[]
  kcal: number
  protein: number
  sugar: number
  sodium: number
  minutes: number
  /** Share of the recipe's ingredients (by weight) already in the pantry, 0–1. */
  pantry: number
  cost: number
  crunch: number
  flavor: number
}

export interface CravingFood { id: string; name: string; aisle: string; price: number }

export interface CravingOptions {
  recipes: CravingRecipe[]
  foods: CravingFood[]
}

export interface CravingIdea {
  kind: 'recipe' | 'food'
  id: string
  name: string
  why: string
  /** Recipes: share already in the pantry. */
  pantry?: number
  kcal?: number
  protein?: number
  price?: number
}

export interface CravingResult {
  /** What the craving was read as, e.g. "sweet and crunchy". */
  understood: string
  fromPantry: CravingIdea[]
  toBuy: CravingIdea[]
  note: string
  source: 'ai' | 'device'
}

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
/** A recipe counts as "from your pantry" when at least this share of it is already at home. */
export const PANTRY_SHARE = 0.6

function pantryShare(r: Recipe, state: AppState): number {
  const stock = new Map(state.pantry.filter((p) => p.grams > 0).map((p) => [p.food, p.grams]))
  let need = 0
  let have = 0
  for (const it of r.items) {
    const g = it.grams / r.servings
    need += g
    have += Math.min(g, stock.get(it.food) ?? 0)
  }
  return need ? have / need : 0
}

/** Every recipe and food a suggestion may be, given all of this person's settings. */
export function cravingOptions(state: AppState): CravingOptions {
  const seen = new Map<string, Recipe>()
  for (const slot of SLOTS) for (const r of eligibleRecipes(state, slot)) seen.set(r.id, r)
  const recipes = [...seen.values()].map((r): CravingRecipe => {
    const t = servingTotals(r)
    return {
      id: r.id, name: r.name, slots: r.slots, kcal: Math.round(t.kcal), protein: Math.round(t.protein),
      sugar: Math.round(t.sugar), sodium: Math.round(t.sodium), minutes: r.activeMin,
      pantry: Math.round(pantryShare(r, state) * 100) / 100, cost: Math.round(servingCost(r, state) * 100) / 100,
      crunch: r.dopamine.crunch, flavor: r.dopamine.flavor,
    }
  })
  const p = state.profile
  const avoided = avoidedFoods(p)
  const blocked = dietBlocked(p)
  const foods = FOODS.filter((f) =>
    !avoided.has(f.id) && !blocked.has(f.id) && !p.excluded.includes(f.id) && (p.caffeine || !CAFFEINATED_DRINKS.includes(f.id)),
  ).map((f): CravingFood => ({ id: f.id, name: f.name, aisle: f.aisle, price: Math.round(packagePrice(f.id, state) * 100) / 100 }))
  return { recipes, foods }
}

/** A plain-language summary of everything chosen in setup, for the AI. */
export function profileSummary(state: AppState): string {
  const p = state.profile
  const t = computeTargets(p)
  const limits = mergedLimits(p)
  const carbs = netCarbLimits(p)
  const meds = Object.entries(p.meds).filter(([, on]) => on).map(([k]) => k)
  const lines = [
    `Body: ${p.sex}, ${p.age} y, ${p.weightLb} lb, ${p.heightIn} in, activity ${p.activity}, goal ${p.goal}. Daily target ${t.kcal} kcal, ${t.protein} g protein.`,
    `Health conditions: ${activeConditions(p).map((c) => c.label).join(', ') || 'none'}.`,
    `Diets: ${activeDiets(p).map((d) => d.label).join(', ') || 'none'}.`,
    `Medications and states: ${[...meds, p.maoi ? 'MAOI' : '', p.stimulantMeds ? 'stimulant medication' : ''].filter(Boolean).join(', ') || 'none'}.`,
    `Hard limits: ${[
      limits.sodiumMaxMg && `sodium under ${limits.sodiumMaxMg} mg a day`,
      limits.satFatMaxPct && `saturated fat under ${limits.satFatMaxPct}% of calories`,
      limits.addedSugarMaxPct && `added sugar under ${limits.addedSugarMaxPct}% of calories`,
      limits.noCrashMeals && 'no blood-sugar-spiking foods',
      limits.proteinMaxPerKg && `protein capped at ${limits.proteinMaxPerKg} g/kg`,
      carbs && `net carbs under ${carbs.perServing} g per serving`,
    ].filter(Boolean).join('; ') || 'none'}.`,
    `Ruled out: ${activeAvoidEntries(p).map((r) => `${avoidLabel(r)} (${[...r.entry.foods.map((f) => FOOD_BY_ID[f]?.name ?? f), ...(r.entry.keywords ?? [])].join(', ')})`).join('; ') || 'nothing beyond the diet'}.`,
    `Won't eat: ${p.excluded.map((f) => FOOD_BY_ID[f]?.name ?? f).join(', ') || 'nothing listed'}. Caffeine: ${p.caffeine ? 'yes' : 'no'}.`,
    `Kitchen: ${state.equipment.join(', ') || 'no equipment'}; up to ${p.maxMealMin} min hands-on. Weekly grocery budget $${p.weeklyBudget}.`,
    hasLooksGoal(p) ? 'Goal: skin and looks (prefer lower glycemic load and gentle cooking).' : '',
  ]
  return lines.filter(Boolean).join('\n')
}

// ── On-device matching (no key, or the AI can't be reached) ──────────────

interface Taste { label: string; words: RegExp; score: (r: Recipe, o: CravingRecipe) => number }
const has = (r: Recipe, ids: string[]) => (r.items.some((i) => ids.includes(i.food)) ? 1 : 0)
const TASTES: Taste[] = [
  { label: 'sweet', words: /sweet|sugar|dessert|candy|treat|cake|cookie|fruit|honey|jam/, score: (r, o) => Math.min(1, (o.sugar * 4) / Math.max(1, o.kcal) / 0.3) * 0.7 + has(r, ['berries', 'banana', 'mango', 'dates', 'honey', 'apple', 'grapes', 'strawberries', 'dark_chocolate']) * 0.5 },
  { label: 'chocolate', words: /chocolate|cocoa|mocha|brownie/, score: (r) => has(r, ['dark_chocolate']) * 1.5 },
  { label: 'salty', words: /salt|salty|savou?ry|chips|pretzel|fries|pickle/, score: (r, o) => Math.min(1, o.sodium / Math.max(1, o.kcal) / 1.5) * 0.6 + has(r, ['pickles', 'olives', 'tortilla_chips', 'popcorn', 'jerky']) * 0.6 },
  { label: 'crunchy', words: /crunch|crisp|chips|cracker|nuts|popcorn/, score: (_r, o) => o.crunch / 3 },
  { label: 'creamy', words: /cream|creamy|smooth|yogurt|milkshake|shake|ice cream/, score: (r) => has(r, ['greek_yogurt', 'kefir', 'avocado', 'peanut_butter', 'cottage_cheese', 'coconut_milk', 'heavy_cream', 'cream_cheese', 'soy_yogurt', 'almond_butter', 'hummus']) },
  { label: 'cheesy', words: /chees|pizza|mac\b|quesadilla/, score: (r) => has(r, ['cheddar', 'mozzarella', 'parmesan', 'feta', 'goat_cheese', 'string_cheese', 'cottage_cheese']) * 1.2 },
  { label: 'spicy', words: /spic|hot\b|chil[ei]|buffalo|taco|mexican|curry/, score: (r, o) => o.flavor / 3 * 0.6 + has(r, ['salsa', 'kimchi', 'ginger']) * 0.6 + (/(chili|curry|taco|fajita|salsa)/i.test(r.name) ? 0.6 : 0) },
  { label: 'carby', words: /bread|pasta|carb|noodle|rice|pizza|sandwich|toast|bagel|burger|wrap/, score: (r) => has(r, ['bread', 'pasta', 'ww_pasta', 'white_rice', 'brown_rice', 'tortillas', 'couscous', 'potato']) },
  { label: 'cold', words: /cold|frozen|\bice\b|smoothie|refresh/, score: (r) => (/(smoothie|nice cream|parfait|overnight|chia)/i.test(r.name) ? 1.2 : 0) },
  { label: 'warm and comforting', words: /warm|comfort|soup|cozy|cosy|stew|oatmeal|porridge/, score: (r) => (/(soup|chili|stew|curry|oatmeal|bolognese)/i.test(r.name) ? 1.2 : 0) },
  { label: 'meaty and filling', words: /meat|steak|burger|chicken|protein|filling|hearty/, score: (_r, o) => Math.min(1, (o.protein * 4) / Math.max(1, o.kcal) / 0.35) },
]

/** The tastes named in a craving, e.g. "something sweet and crunchy" → sweet, crunchy. */
export function readCraving(text: string): Taste[] {
  const t = text.toLowerCase()
  return TASTES.filter((x) => x.words.test(t))
}

const FILLER = new Set(['something', 'some', 'really', 'want', 'craving', 'crave', 'like', 'kind', 'need', 'feel', 'feeling', 'with', 'that', 'this', 'just'])
/** Dish words to look for in recipe names ("pizza", "mango"), leaving out tastes so "sweet" doesn't match "sweet potato". */
const words = (s: string) => s.toLowerCase().split(/[^a-z]+/)
  .filter((w) => w.length >= 4 && !FILLER.has(w) && !TASTES.some((t) => t.words.test(w)))

export function deviceIdeas(text: string, state: AppState, options = cravingOptions(state)): CravingResult {
  const tastes = readCraving(text)
  const named = words(text)
  const scored = options.recipes.map((o) => {
    const r = RECIPE_BY_ID[o.id]
    const taste = tastes.reduce((s, x) => s + x.score(r, o), 0)
    const nameHit = named.some((w) => o.name.toLowerCase().includes(w)) ? 1.5 : 0
    return { o, score: taste + nameHit }
  }).filter((x) => x.score > 0.3).sort((a, b) => b.score - a.score)
  // The numbers are shown under each idea, so the reason only names the taste.
  const why = tastes.length ? `Hits ${tastes.map((x) => x.label).slice(0, 2).join(' and ')}, within your settings.` : 'Matches what you typed, within your settings.'
  const toIdea = (o: CravingRecipe): CravingIdea => ({ kind: 'recipe', id: o.id, name: o.name, why, pantry: o.pantry, kcal: o.kcal, protein: o.protein, price: o.cost })
  const fromPantry = scored.filter((x) => x.o.pantry >= PANTRY_SHARE).slice(0, 3).map((x) => toIdea(x.o))
  const toBuy = scored.filter((x) => x.o.pantry < PANTRY_SHARE).slice(0, 3).map((x) => toIdea(x.o))
  return {
    understood: tastes.length ? tastes.map((x) => x.label).join(', ') : text.trim(),
    fromPantry, toBuy, source: 'device',
    note: fromPantry.length || toBuy.length ? '' : 'Nothing matched that yet. Try a taste like sweet, salty, crunchy, creamy, cheesy, spicy or chocolate.',
  }
}

// ── Checking the AI's picks ───────────────────────────────────────────────

export interface AiPick { kind: 'recipe' | 'food'; id: string; why: string }
export interface AiAnswer { understood: string; from_pantry: AiPick[]; to_buy: AiPick[]; note: string }

/**
 * Keep only picks from the allowed lists (so nothing the settings rule out can get through),
 * move "pantry" recipes that aren't mostly at home to the buy list, and drop duplicates.
 */
export function checkAiAnswer(answer: AiAnswer, options: CravingOptions): CravingResult {
  const recipes = new Map(options.recipes.map((r) => [r.id, r]))
  const foods = new Map(options.foods.map((f) => [f.id, f]))
  const used = new Set<string>()
  const toIdea = (p: AiPick): CravingIdea | null => {
    if (used.has(`${p.kind}:${p.id}`)) return null
    if (p.kind === 'recipe') {
      const r = recipes.get(p.id)
      if (!r) return null
      used.add(`recipe:${p.id}`)
      return { kind: 'recipe', id: r.id, name: r.name, why: p.why, pantry: r.pantry, kcal: r.kcal, protein: r.protein, price: r.cost }
    }
    const f = foods.get(p.id)
    if (!f) return null
    used.add(`food:${p.id}`)
    return { kind: 'food', id: f.id, name: f.name, why: p.why, price: f.price }
  }
  const pantryPicks = answer.from_pantry.map(toIdea).filter((x): x is CravingIdea => !!x)
  const fromPantry = pantryPicks.filter((x) => x.kind === 'recipe' && (x.pantry ?? 0) >= PANTRY_SHARE)
  const moved = pantryPicks.filter((x) => !fromPantry.includes(x))
  const toBuy = [...moved, ...answer.to_buy.map(toIdea).filter((x): x is CravingIdea => !!x)]
  return { understood: answer.understood, fromPantry: fromPantry.slice(0, 3), toBuy: toBuy.slice(0, 4), note: answer.note, source: 'ai' }
}
