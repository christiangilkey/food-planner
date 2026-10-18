import type { Aisle, LabelFacts, MealSlot, Product } from '../types'
import { packageGramsFrom } from './label'

/**
 * Barcode lookup in Open Food Facts, a free, open, crowd-sourced product database. Only the
 * barcode number is sent; nothing about the person leaves the device.
 */
const API = 'https://world.openfoodfacts.org/api/v2/product/'
const FIELDS = 'product_name,brands,nutriments,serving_quantity,product_quantity,quantity,ingredients_text,ingredients_text_en,categories_tags'

interface OffProduct {
  product_name?: string
  brands?: string
  nutriments?: Record<string, number | string | undefined>
  serving_quantity?: number | string
  product_quantity?: number | string
  quantity?: string
  ingredients_text?: string
  ingredients_text_en?: string
  categories_tags?: string[]
}

// Open Food Facts stores per 100 g, in grams; the label form wants the label's units.
const NUTRIMENTS: [keyof LabelFacts, string, number][] = [
  ['kcal', 'energy-kcal_100g', 1],
  ['fat', 'fat_100g', 1],
  ['satFat', 'saturated-fat_100g', 1],
  ['sodium', 'sodium_100g', 1000],
  ['carbs', 'carbohydrates_100g', 1],
  ['fiber', 'fiber_100g', 1],
  ['sugar', 'sugars_100g', 1],
  ['addedSugar', 'added-sugars_100g', 1],
  ['protein', 'proteins_100g', 1],
  ['vitD', 'vitamin-d_100g', 1e6],
  ['calcium', 'calcium_100g', 1000],
  ['iron', 'iron_100g', 1000],
  ['potassium', 'potassium_100g', 1000],
]

const num = (x: unknown) => {
  const n = typeof x === 'string' ? Number(x) : x
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined
}

export type BarcodeResult = Partial<Product> & { categories: string[] }

/** Look a barcode up. Resolves to null when the product isn't in the database. */
export async function lookupBarcode(code: string, fetcher: typeof fetch = fetch): Promise<BarcodeResult | null> {
  const digits = code.replace(/\D/g, '')
  if (digits.length < 6) return null
  const res = await fetcher(`${API}${digits}.json?fields=${FIELDS}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Open Food Facts answered ${res.status}`)
  const json = (await res.json()) as { status?: number; product?: OffProduct }
  if (json.status !== 1 || !json.product) return null
  return fromOff(json.product, digits)
}

export function fromOff(p: OffProduct, barcode: string): BarcodeResult {
  const servingGrams = num(p.serving_quantity) ?? 100
  const label: LabelFacts = {}
  for (const [key, field, scale] of NUTRIMENTS) {
    const per100 = num(p.nutriments?.[field])
    if (per100 !== undefined) label[key] = Math.round(((per100 * scale * servingGrams) / 100) * 10) / 10
  }
  const categories = p.categories_tags ?? []
  const name = (p.product_name ?? '').trim()
  const packageGrams = Math.round(num(p.product_quantity) ?? (p.quantity ? packageGramsFrom(p.quantity) : undefined) ?? 0)
  const guess = guessUse(name, categories)
  return {
    barcode, name, brand: (p.brands ?? '').split(',')[0].trim(), servingGrams, packageGrams, label,
    ingredients: (p.ingredients_text_en || p.ingredients_text || '').trim(),
    aisle: guessAisle(categories), ...guess, categories,
  }
}

const has = (cats: string[], ...words: string[]) => cats.some((c) => words.some((w) => c.includes(w)))

export function guessAisle(cats: string[]): Aisle {
  if (has(cats, 'frozen')) return 'Frozen'
  if (has(cats, 'dairies', 'dairy', 'yogurt', 'cheese', 'milk', 'eggs')) return 'Dairy & Eggs'
  if (has(cats, 'meats', 'fishes', 'seafood', 'poultry')) return 'Meat & Seafood'
  if (has(cats, 'snacks', 'bars', 'chips', 'crackers', 'cookies', 'candies')) return 'Snacks'
  if (has(cats, 'breads', 'cereals', 'pastas', 'rices', 'grains')) return 'Bakery & Grains'
  if (has(cats, 'fresh-fruits', 'fresh-vegetables')) return 'Produce'
  if (has(cats, 'sauces', 'condiments', 'oils', 'spreads', 'dressings')) return 'Condiments & Oils'
  return 'Canned & Dry'
}

/** Whether it's likely eaten as is (bars, yogurt cups, frozen meals), and for which meals. */
export function guessUse(name: string, cats: string[]): Pick<Product, 'readyToEat' | 'slots' | 'microwave'> {
  const n = name.toLowerCase()
  const meal = has(cats, 'meals', 'frozen-dinners', 'microwave') || /\b(bowl|entree|dinner|burrito)\b/.test(n)
  const snack = has(cats, 'snacks', 'bars', 'yogurts', 'protein-bars', 'nuts') || /\b(bar|bites|cup|chips|jerky)\b/.test(n)
  const slots: MealSlot[] = meal ? ['lunch', 'dinner'] : snack ? ['snack'] : []
  return { readyToEat: meal || snack, slots, microwave: meal && (has(cats, 'frozen') || /microwave/.test(n)) }
}
