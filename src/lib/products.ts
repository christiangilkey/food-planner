import { FOOD_TAGS, type DietTag } from '../data/diets'
import { FOOD_BY_ID, FOODS } from '../data/foods'
import { RECIPE_BY_ID, RECIPES } from '../data/recipes'
import type { AppState, Food, LabelFacts, LabelKey, Nutrients, Product, Recipe } from '../types'
import { clearTotalsCache, EMPTY } from './nutrition'

/**
 * Scanned products join the app's food tables so every planner rule applies to them unchanged:
 *  - a product that matches a known food (a brand of Greek yogurt) replaces that food's USDA
 *    averages with the label's own numbers, so recipes using it get the brand's real nutrition;
 *  - any other product becomes its own food (id "p_…"), with diet tags and an ingredient list
 *    that condition trigger words are checked against;
 *  - a ready-to-eat product (protein bar, frozen meal) also becomes a one-item "recipe" the
 *    planner can serve, but only while it's in the pantry.
 */

export const LABEL_FIELDS: { key: LabelKey; label: string; unit: 'kcal' | 'g' | 'mg' | 'µg' }[] = [
  { key: 'kcal', label: 'Calories', unit: 'kcal' },
  { key: 'fat', label: 'Total fat', unit: 'g' },
  { key: 'satFat', label: 'Saturated fat', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'carbs', label: 'Total carbohydrate', unit: 'g' },
  { key: 'fiber', label: 'Dietary fiber', unit: 'g' },
  { key: 'sugar', label: 'Total sugars', unit: 'g' },
  { key: 'addedSugar', label: 'Added sugars', unit: 'g' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'vitD', label: 'Vitamin D', unit: 'µg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
]

export const productFoodId = (p: Pick<Product, 'id'>) => `p_${p.id}`

/** The app food a product stands for: the matched food, or its own entry. */
export const productFood = (p: Product) => (p.matches && FOOD_BY_ID[p.matches] ? p.matches : productFoodId(p))

export const productTitle = (p: Pick<Product, 'brand' | 'name'>) =>
  p.brand && !p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? `${p.brand} ${p.name}` : p.name

/** Label values per serving → nutrients per 100 g (only the ones the label gives). */
export function labelPer100(label: LabelFacts, servingGrams: number): Partial<Nutrients> {
  const out: Partial<Nutrients> = {}
  if (servingGrams <= 0) return out
  for (const { key } of LABEL_FIELDS) {
    const v = label[key]
    if (v !== undefined && Number.isFinite(v)) out[key] = (v * 100) / servingGrams
  }
  return out
}

// Original USDA nutrients of foods a product has overridden, so they can be restored.
const original = new Map<string, Nutrients>()
let lastSynced: Product[] | null = null

/** Make the food and recipe tables reflect these products. Cheap to call repeatedly with the same array. */
export function syncProducts(products: Product[]) {
  if (products === lastSynced) return
  lastSynced = products

  for (const [id, n] of original) if (FOOD_BY_ID[id]) FOOD_BY_ID[id].n = { ...n }
  original.clear()
  removeWhere(FOODS, (f) => !!f.product)
  removeWhere(RECIPES, (r) => !!r.product)
  for (const id of Object.keys(FOOD_BY_ID)) if (FOOD_BY_ID[id].product) delete FOOD_BY_ID[id]
  for (const id of Object.keys(RECIPE_BY_ID)) if (RECIPE_BY_ID[id].product) delete RECIPE_BY_ID[id]
  for (const id of Object.keys(FOOD_TAGS)) if (id.startsWith('p_')) delete FOOD_TAGS[id]

  // Oldest first, so the most recently scanned brand of a food wins.
  for (const p of [...products].sort((a, b) => a.addedAt.localeCompare(b.addedAt))) {
    const base = p.matches ? FOOD_BY_ID[p.matches] : undefined
    if (base) {
      if (!original.has(base.id)) original.set(base.id, { ...base.n })
      base.n = { ...base.n, ...labelPer100(p.label, p.servingGrams) }
      continue
    }
    const food = productToFood(p)
    FOODS.push(food)
    FOOD_BY_ID[food.id] = food
    if (p.tags.length) FOOD_TAGS[food.id] = new Set(p.tags)
    if (p.readyToEat && p.slots.length) {
      const r = productRecipe(p)
      RECIPES.push(r)
      RECIPE_BY_ID[r.id] = r
    }
  }
  clearTotalsCache()
}

function removeWhere<T>(list: T[], bad: (x: T) => boolean) {
  for (let i = list.length - 1; i >= 0; i--) if (bad(list[i])) list.splice(i, 1)
}

function productToFood(p: Product): Food {
  const id = productFoodId(p)
  return {
    id, name: productTitle(p), aisle: p.aisle,
    packageGrams: Math.max(1, p.packageGrams), packageLabel: `${Math.round(p.packageGrams)} g package`,
    packagePrice: p.price, shelfDays: p.aisle === 'Produce' || p.aisle === 'Dairy & Eggs' || p.aisle === 'Meat & Seafood' ? 7 : 180,
    serving: Math.max(1, p.servingGrams), groups: [], plants: [],
    n: { ...EMPTY, ...labelPer100(p.label, p.servingGrams) },
    product: p.id,
    scanText: `${p.brand} ${p.name} ${p.ingredients}`.toLowerCase(),
    ingredientsKnown: p.ingredients.trim().length > 0,
  }
}

function productRecipe(p: Product): Recipe {
  const id = productFoodId(p)
  return {
    id, name: productTitle(p), slots: p.slots, servings: 1,
    items: [{ food: id, grams: Math.max(1, p.servingGrams) }],
    equipment: p.microwave ? ['microwave'] : [],
    activeMin: p.microwave ? 2 : 1, totalMin: p.microwave ? 6 : 1, steps: 1,
    dopamine: { crunch: 1, flavor: 1, novelty: 1, fun: 1 },
    note: 'A product you scanned, served as is. One serving is the label’s serving size.',
    product: p.id,
  }
}

/** Add whole packages of a product to the pantry. */
export function stockProduct(state: AppState, p: Product, packages: number): AppState['pantry'] {
  const food = productFood(p)
  const grams = Math.round(Math.max(0, packages) * p.packageGrams)
  const pantry = [...state.pantry]
  const i = pantry.findIndex((x) => x.food === food)
  if (i >= 0) pantry[i] = { ...pantry[i], grams: pantry[i].grams + grams }
  else pantry.push({ food, grams })
  return pantry
}

// ── Guessing from the name and ingredient list ─────────────────────────

const IGNORE = new Set(['plain', 'nonfat', 'frozen', 'canned', 'fresh', 'dry', 'large', 'baby', 'boneless', 'raw', 'whole', 'low', 'fat', 'sodium', 'the', 'and', 'with', 'pack', 'brewed', 'cooked', 'ready', 'eat', 'unsweetened', 'fortified', 'refrigerated', 'shelled', 'drained'])
const words = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, ' ').split(/[^a-z]+/).map((w) => w.replace(/(ies)$/, 'y').replace(/(?<=[a-z]{3})s$/, '')).filter((w) => w.length >= 3 && !IGNORE.has(w))

/** Known foods a product is most likely to be, best first. */
export function suggestMatches(name: string, limit = 5): Food[] {
  const have = new Set(words(name))
  if (!have.size) return []
  return FOODS.filter((f) => !f.product)
    .map((f) => {
      const want = words(f.name)
      const hit = want.filter((w) => have.has(w)).length
      return { f, score: want.length ? hit / want.length + hit * 0.1 : 0 }
    })
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.f)
}

/**
 * Is the label close enough to the known food to stand in for it in every recipe? A sweetened,
 * flavored yogurt is not "plain Greek yogurt": its numbers would leak into every recipe that uses it.
 */
export function plausibleMatch(p: Pick<Product, 'label' | 'servingGrams'>, f: Food): boolean {
  const n = labelPer100(p.label, p.servingGrams)
  if (n.kcal === undefined) return false
  const kcalOk = Math.abs(n.kcal - f.n.kcal) <= Math.max(25, f.n.kcal * 0.35)
  const sugarOk = (n.addedSugar ?? 0) <= f.n.addedSugar + 2 && (n.sugar ?? 0) <= f.n.sugar + 5
  return kcalOk && sugarOk
}

/** The best known food to pre-select for a product, if its label fits that food. */
export function defaultMatch(p: Pick<Product, 'name' | 'label' | 'servingGrams'>): string {
  const have = new Set(words(p.name))
  // Every word of the food's name must be in the product's ("soy yogurt" isn't a Greek yogurt).
  return suggestMatches(p.name).find((f) => words(f.name).every((w) => have.has(w)) && plausibleMatch(p, f))?.id ?? ''
}

const TAG_WORDS: [DietTag, RegExp][] = [
  ['meat', /\b(beef|pork|chicken|turkey|lamb|bacon|ham|sausage|salami|pepperoni|gelatin|lard|veal|duck)\b/],
  ['fish', /\b(fish|salmon|tuna|cod|tilapia|sardine|anchov|shrimp|crab|lobster|shellfish|mackerel|trout|pollock)/],
  ['egg', /\begg/],
  ['dairy', /\b(milk|whey|casein|caseinate|cheese|butter|cream|yogurt|lactose|ghee)/],
  ['honey', /\bhoney\b/],
  ['grain', /\b(wheat|oat|barley|rye|rice|corn|flour|malt|spelt|quinoa|semolina|couscous)/],
  // "Locust bean gum" and "guar gum" are thickeners, not beans.
  ['legume', /\b(soy|beans?\b(?! gum)|lentil|peas?\b|chickpea|peanut)/],
  ['soy', /\bsoy/],
  ['peanut', /\bpeanut/],
  ['nut', /\b(almond|cashew|walnut|pecan|hazelnut|pistachio|macadamia|brazil nut)/],
  ['seed', /\b(sesame|sunflower|pumpkin seed|chia|flax|hemp)/],
  ['nightshade', /\b(tomato|potato|pepper|paprika|eggplant|chili)/],
  ['coffee_cocoa', /\b(coffee|cocoa|chocolate)/],
  ['sweetener', /\b(sugar|syrup|dextrose|fructose|sucrose|maltodextrin|honey|agave|molasses)/],
]

/**
 * Diet tags from a product's name and ingredient list. "Processed" is added when the list is
 * long or has typical additives, which is a rough proxy, so the user can untick it.
 */
export function inferTags(text: string): DietTag[] {
  const t = text.toLowerCase()
  const tags = TAG_WORDS.filter(([, re]) => re.test(t)).map(([tag]) => tag)
  // "Peanut", "soybean oil" etc. already set legume; "pepper" in "black pepper" isn't a nightshade.
  if (/\bblack pepper\b/.test(t) && !/\b(bell|red|green|chili|jalape|cayenne) pepper/.test(t) && !/\b(tomato|potato|paprika|eggplant|chili)/.test(t)) {
    const i = tags.indexOf('nightshade')
    if (i >= 0) tags.splice(i, 1)
  }
  const additives = /\b(natural flavor|artificial|preservative|sodium benzoate|potassium sorbate|carrageenan|maltodextrin|modified (food )?starch|hydrogenated|color|emulsifier|lecithin|xanthan)/
  if (t.split(',').length >= 8 || additives.test(t)) tags.push('processed')
  return [...new Set(tags)]
}

/** A new product with nothing filled in. */
export function blankProduct(): Product {
  return {
    id: Math.random().toString(36).slice(2, 10), name: '', brand: '', barcode: '', servingGrams: 0, packageGrams: 0, price: 0,
    label: {}, ingredients: '', matches: '', readyToEat: false, slots: [], microwave: false, tags: [], aisle: 'Canned & Dry',
    addedAt: new Date().toISOString(),
  }
}
