import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONDITIONS } from '../data/conditions'
import { FOOD_BY_ID } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import { SOURCES } from '../data/sources'
import { avoidedFoods, dietBlocked, planViolations } from './conditions'
import { parseNutritionLabel, packageGramsFrom } from './label'
import { servingTotals } from './nutrition'
import { fromOff } from './openfoodfacts'
import { dayEntries, generatePlan, magicPlan, pantryReport } from './planner'
import { blankProduct, defaultMatch, inferTags, productFoodId, suggestMatches, syncProducts } from './products'
import { weeklyNeeds } from './shopping'
import { defaultState } from './store'
import type { AppState, ConditionId, Product } from '../types'

vi.setConfig({ testTimeout: 120_000 })
afterEach(() => syncProducts([]))

const LABEL = `Nutrition Facts
8 servings per container
Serving size 2/3 cup (55g)
Amount per serving
Calories 230
% Daily Value*
Total Fat 8g 10%
Saturated Fat 1g 5%
Trans Fat 0g
Cholesterol 0mg 0%
Sodium 160mg 7%
Total Carbohydrate 37g 13%
Dietary Fiber 4g 14%
Total Sugars 12g
Includes 10g Added Sugars 20%
Protein 3g
Vitamin D 2mcg 10%
Calcium 260mg 20%
Iron 8mg 45%
Potassium 240mg 6%
* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.`

function product(patch: Partial<Product>): Product {
  return { ...blankProduct(), servingGrams: 50, packageGrams: 500, label: { kcal: 200, protein: 10, fat: 8, carbs: 20, fiber: 3, sugar: 6, sodium: 150 }, ...patch }
}

function withProducts(products: Product[], pantry: AppState['pantry'], conditions: ConditionId[] = [], patch: Partial<AppState['profile']> = {}): AppState {
  const s = defaultState()
  s.equipment = ['stove', 'skillet', 'pot', 'oven', 'sheetpan', 'microwave', 'airfryer', 'blender']
  s.profile = { ...s.profile, conditions, ...patch }
  s.products = products
  s.pantry = pantry
  syncProducts(products)
  return s
}

describe('reading Nutrition Facts labels', () => {
  it('reads every value from a clean label, ignoring % Daily Value and the footnote', () => {
    const r = parseNutritionLabel(LABEL)
    expect(r.servingGrams).toBe(55)
    expect(r.servingsPerContainer).toBe(8)
    expect(r.label).toEqual({
      kcal: 230, fat: 8, satFat: 1, sodium: 160, carbs: 37, fiber: 4, sugar: 12, addedSugar: 10, protein: 3,
      vitD: 2, calcium: 260, iron: 8, potassium: 240,
    })
  })

  it('fixes common OCR slips: g read as 9, O read as 0, <1g', () => {
    const r = parseNutritionLabel('Serving size 1 cup (24Og)\nCalories 11O\nTotal Fat <1g\nSodium 16Omg 7%\nProtein 129\nTotal Sugars 9g')
    expect(r.servingGrams).toBe(240)
    expect(r.label.kcal).toBe(110)
    expect(r.label.fat).toBe(0.5)
    expect(r.label.sodium).toBe(160)
    expect(r.label.protein).toBe(12)
    expect(r.label.sugar).toBe(9)
  })

  it('converts package sizes to grams', () => {
    expect(packageGramsFrom('16 oz (454g)')).toBe(454)
    expect(packageGramsFrom('1.5 lb')).toBe(680)
    expect(packageGramsFrom('32 OZ')).toBe(907)
  })

  it('maps Open Food Facts per-100 g data to per-serving label values', () => {
    const r = fromOff({
      product_name: 'Plain Nonfat Greek Yogurt', brands: 'Chobani', serving_quantity: 150, product_quantity: 907,
      nutriments: { 'energy-kcal_100g': 60, 'proteins_100g': 10, 'sodium_100g': 0.04, 'calcium_100g': 0.1, 'added-sugars_100g': 0 },
      categories_tags: ['en:dairies', 'en:yogurts'],
    }, '0894700010045')
    expect(r.label).toMatchObject({ kcal: 90, protein: 15, sodium: 60, calcium: 150, addedSugar: 0 })
    expect(r.packageGrams).toBe(907)
    expect(r.aisle).toBe('Dairy & Eggs')
  })
})

describe('matching and tagging products', () => {
  it('suggests the known food a product is', () => {
    expect(suggestMatches('Chobani Plain Nonfat Greek Yogurt')[0]?.id).toBe('greek_yogurt')
    expect(suggestMatches('StarKist Chunk Light Tuna in Water')[0]?.id).toBe('tuna')
  })

  it('pre-selects a match only when the label fits the plain food', () => {
    expect(defaultMatch({ name: 'Chobani Plain Nonfat Greek Yogurt', servingGrams: 170, label: { kcal: 90, sugar: 6, addedSugar: 0 } })).toBe('greek_yogurt')
    expect(defaultMatch({ name: 'Chobani Greek Yogurt Strawberry', servingGrams: 150, label: { kcal: 110, sugar: 14, addedSugar: 9 } })).toBe('')
  })

  it('guesses diet tags from ingredients', () => {
    expect(inferTags('Whey protein isolate, almonds, cocoa, natural flavors')).toEqual(expect.arrayContaining(['dairy', 'nut', 'coffee_cocoa', 'processed']))
    expect(inferTags('Roasted seaweed, sesame oil, salt')).toEqual(expect.arrayContaining(['seed']))
    expect(inferTags('Chicken, rice, black pepper')).not.toContain('nightshade')
    expect(inferTags('Nonfat milk, cane sugar, strawberries, fruit pectin, locust bean gum')).not.toContain('legume')
    expect(inferTags('Black beans, water, salt')).toContain('legume')
  })
})

describe('scanned products follow the same rules as every other food', () => {
  it('a matched product replaces the USDA numbers, and removing it restores them', () => {
    const before = FOOD_BY_ID.greek_yogurt.n.protein
    const yogurt = product({ matches: 'greek_yogurt', servingGrams: 150, label: { kcal: 90, protein: 16, sodium: 60 } })
    withProducts([yogurt], [])
    expect(FOOD_BY_ID.greek_yogurt.n.protein).toBeCloseTo(16 / 1.5)
    expect(FOOD_BY_ID.greek_yogurt.n.sodium).toBeCloseTo(40)
    expect(servingTotals(RECIPE_BY_ID.yogurt_parfait).protein).toBeGreaterThan(0)
    syncProducts([])
    expect(FOOD_BY_ID.greek_yogurt.n.protein).toBe(before)
  })

  it('a ready-to-eat product is planned only while it is in the pantry, and never more than is left', () => {
    const bar = product({ name: 'Protein bar', readyToEat: true, slots: ['snack'], servingGrams: 60, packageGrams: 240, label: { kcal: 200, protein: 20, fiber: 10, sugar: 2, fat: 7, carbs: 22 } })
    const id = productFoodId(bar)
    const none = withProducts([bar], [])
    expect(generatePlan(none, 3).some((d) => dayEntries(d).some((x) => x.entry.recipe === id))).toBe(false)
    const stocked = withProducts([bar], [{ food: id, grams: 240 }])
    const plan = magicPlan(stocked, 3)
    const used = weeklyNeeds(plan)[id] ?? 0
    expect(used).toBeGreaterThan(0)
    expect(used).toBeLessThanOrEqual(240 + 1)
  })

  it('Hashimoto’s keeps seaweed products out; without it they can be planned', () => {
    const snack = product({ name: 'Roasted seaweed snack', ingredients: 'Seaweed, sunflower oil, salt', readyToEat: true, slots: ['snack'], servingGrams: 5, packageGrams: 50, label: { kcal: 25, protein: 1, fat: 2, carbs: 1, sodium: 40 } })
    const id = productFoodId(snack)
    const hashi = withProducts([snack], [{ food: id, grams: 50 }], ['hashimotos'])
    expect(avoidedFoods(hashi.profile).has(id)).toBe(true)
    const plan = magicPlan(hashi, 5)
    expect(plan.some((d) => dayEntries(d).some((x) => x.entry.recipe === id))).toBe(false)
    expect(planViolations(hashi.profile, plan)).toEqual([])
    const plain = withProducts([snack], [{ food: id, grams: 50 }], [])
    expect(avoidedFoods(plain.profile).has(id)).toBe(false)
  })

  it('MAOI: tyramine words are caught, and products with no ingredient list are kept out', () => {
    const pizza = product({ name: 'Frozen pizza', ingredients: 'Crust, tomato sauce, mozzarella, pepperoni', readyToEat: true, slots: ['dinner'] })
    const mystery = product({ name: 'Snack mix', ingredients: '', readyToEat: true, slots: ['snack'] })
    const s = withProducts([pizza, mystery], [], ['depression'], { maoi: true })
    const avoided = avoidedFoods(s.profile)
    expect(avoided.has(productFoodId(pizza))).toBe(true)
    expect(avoided.has(productFoodId(mystery))).toBe(true)
  })

  it('trigger words match whole words, not plant butters or milks', () => {
    const pb = product({ name: 'Crunchy peanut butter', ingredients: 'Peanuts, salt' })
    const s = withProducts([pb], [], ['cholesterol'])
    expect(avoidedFoods(s.profile).has(productFoodId(pb))).toBe(false)
    const realButter = product({ name: 'Salted butter', ingredients: 'Cream, salt' })
    const t = withProducts([realButter], [], ['cholesterol'])
    expect(avoidedFoods(t.profile).has(productFoodId(realButter))).toBe(true)
  })

  it('diets use the product’s tags', () => {
    const shake = product({ name: 'Protein shake', ingredients: 'Milk protein concentrate, cocoa', tags: ['dairy', 'coffee_cocoa'] })
    const s = withProducts([shake], [], [], { diets: ['vegan'] })
    expect(dietBlocked(s.profile).has(productFoodId(shake))).toBe(true)
  })
})

describe('magic plan', () => {
  const pantry: AppState['pantry'] = [
    { food: 'lentils', grams: 900 }, { food: 'spinach', grams: 300 }, { food: 'egg', grams: 600 }, { food: 'oats', grams: 1000 },
    { food: 'salmon', grams: 454 }, { food: 'broccoli', grams: 900 }, { food: 'greek_yogurt', grams: 907 }, { food: 'berries', grams: 600 },
  ]

  it('uses more of the pantry than a normal week', () => {
    const s = withProducts([], pantry)
    const normal = pantryReport(s, generatePlan(s, 11))
    const magic = pantryReport(s, magicPlan(s, 11))
    expect(magic.fromPantry).toBeGreaterThan(normal.fromPantry)
    expect(magic.used.length).toBeGreaterThanOrEqual(normal.used.length)
  })

  for (const conditions of [['hypertension', 'cholesterol'], ['t2d', 'gerd'], ['hashimotos', 'migraine'], ['ckd']] as ConditionId[][]) {
    it(`still meets every hard limit: ${conditions.join(' + ')}`, () => {
      const s = withProducts([], pantry, conditions)
      expect(planViolations(s.profile, magicPlan(s, 7))).toEqual([])
    })
  }
})

describe('Hashimoto’s additions are sourced', () => {
  it('every avoid reason cites real sources', () => {
    for (const c of CONDITIONS) for (const a of c.avoid) {
      expect(a.reason.sources.length, c.id).toBeGreaterThan(0)
      for (const id of a.reason.sources) expect(SOURCES[id], `${c.id}: ${id}`).toBeDefined()
    }
  })
})
