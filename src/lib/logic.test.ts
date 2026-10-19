import { describe, expect, it, vi } from 'vitest'
import { FOOD_BY_ID, FOODS } from '../data/foods'
import { METHODS } from '../data/methods'
import { RECIPES } from '../data/recipes'
import { analyzeWeek } from './analysis'
import { computeTargets } from './energy'
import { canMake, satietyScore, itemsTotals, servingTotals } from './nutrition'
import { dayEntries, dayTotals, eligibleRecipes, generatePlan, planCost, rankCandidates } from './planner'
import { buildShoppingList } from './shopping'
import { defaultState } from './store'
import type { AppState } from '../types'

// Building plans takes a few seconds per case; under a full parallel run that can pass the 5 s default.
vi.setConfig({ testTimeout: 60_000 })

const state = (patch: Partial<AppState> = {}): AppState => ({ ...defaultState(), ...patch })

describe('data integrity', () => {
  it('every recipe ingredient exists in the food table', () => {
    for (const r of RECIPES) for (const i of r.items) expect(FOOD_BY_ID[i.food], `${r.id} → ${i.food}`).toBeTruthy()
  })
  it('every recipe has step-by-step instructions', () => {
    for (const r of RECIPES) expect(METHODS[r.id]?.length ?? 0, r.id).toBeGreaterThanOrEqual(2)
    for (const id of Object.keys(METHODS)) expect(RECIPES.some((r) => r.id === id), `method for unknown recipe ${id}`).toBe(true)
  })
  it('food macros roughly add up to calories', () => {
    for (const f of FOODS) {
      // Fiber yields about 2 kcal/g rather than 4; food-specific Atwater factors (and organic acids in
      // citrus juice) leave some slack, especially for low-calorie foods.
      const est = f.n.protein * 4 + (f.n.carbs - f.n.fiber) * 4 + f.n.fiber * 2 + f.n.fat * 9
      const diff = Math.abs(est - f.n.kcal)
      expect(diff < 12 || diff / f.n.kcal < 0.25, `${f.id}: ${Math.round(est)} vs ${f.n.kcal}`).toBe(true)
    }
  })
})

describe('energy targets', () => {
  it('matches Mifflin–St Jeor for a known case', () => {
    // 30 y/o male, 170 lb (77.1 kg), 69 in (175.3 cm): BMR ≈ 1732
    const t = computeTargets(defaultState().profile)
    expect(t.bmr).toBeGreaterThan(1720)
    expect(t.bmr).toBeLessThan(1745)
    expect(Math.abs(t.tdee - t.bmr * 1.375)).toBeLessThan(1.5)
  })
  it('creates a deficit for weight loss and never drops below the floor', () => {
    const p = { ...defaultState().profile, sex: 'female' as const, weightLb: 110, heightIn: 60, age: 60, activity: 'sedentary' as const, goal: 'lose' as const }
    expect(computeTargets(p).kcal).toBeGreaterThanOrEqual(1200)
  })
})

describe('scoring', () => {
  it('rates lean protein + veg as more filling than chocolate', () => {
    const veg = satietyScore(itemsTotals([{ food: 'chicken_breast', grams: 150 }, { food: 'broccoli', grams: 150 }]))
    const choc = satietyScore(itemsTotals([{ food: 'dark_chocolate', grams: 40 }]))
    expect(veg).toBeGreaterThan(70)
    expect(choc).toBeLessThan(35)
  })
  it('respects equipment alternatives', () => {
    const soup = RECIPES.find((r) => r.id === 'lentil_soup')!
    expect(canMake(soup, ['slowcooker'])).toBe(true)
    expect(canMake(soup, ['microwave'])).toBe(false)
  })
})

describe('planner', () => {
  it('fills a full week close to the calorie target', () => {
    const s = state()
    const plan = generatePlan(s, 42)
    const target = computeTargets(s.profile).kcal
    for (const day of plan) {
      expect(day.breakfast && day.lunch && day.dinner).toBeTruthy()
      expect(day.snacks).toHaveLength(2)
      const kcal = dayTotals(day).kcal
      expect(kcal).toBeGreaterThan(target * 0.75)
      expect(kcal).toBeLessThan(target * 1.3)
    }
  })
  it('only uses recipes the kitchen can make', () => {
    const s = state({ equipment: ['microwave'] })
    const plan = generatePlan(s, 7)
    for (const day of plan) for (const { entry } of dayEntries(day)) {
      expect(canMake(RECIPES.find((r) => r.id === entry.recipe)!, ['microwave'])).toBe(true)
    }
  })
  it('keeps locked meals', () => {
    const s = state()
    s.plan = generatePlan(s, 1)
    s.plan[3].dinner = { recipe: 'chili', portion: 1, locked: true }
    const next = generatePlan(s, 99)
    expect(next[3].dinner?.recipe).toBe('chili')
  })
  it('never uses excluded foods', () => {
    const s = state()
    s.profile.excluded = ['egg', 'peanut_butter']
    const plan = generatePlan(s, 3)
    for (const day of plan) for (const { entry } of dayEntries(day)) {
      const r = RECIPES.find((x) => x.id === entry.recipe)!
      expect(r.items.some((i) => i.food === 'egg' || i.food === 'peanut_butter')).toBe(false)
    }
  })
  it('a tight budget produces a cheaper week', () => {
    const rich = state()
    rich.profile.weeklyBudget = 300
    const poor = state()
    poor.profile.weeklyBudget = 35
    expect(planCost(poor, generatePlan(poor, 5))).toBeLessThan(planCost(rich, generatePlan(rich, 5)))
  })
  it('ranks alternatives for a slot', () => {
    const s = state()
    s.plan = generatePlan(s, 11)
    const alts = rankCandidates(s, s.plan, 0, 'dinner')
    expect(alts.length).toBe(eligibleRecipes(s, 'dinner').length)
    expect(alts[0].score).toBeGreaterThanOrEqual(alts[alts.length - 1].score)
  })
})

describe('shopping list', () => {
  it('subtracts the pantry and rounds up to packages', () => {
    const s = state()
    s.plan = generatePlan(s, 8)
    const before = buildShoppingList(s)
    const first = before.items[0]
    s.pantry = [{ food: first.food.id, grams: first.needGrams + 10 }]
    const after = buildShoppingList(s)
    expect(after.items.find((i) => i.food.id === first.food.id)).toBeUndefined()
    expect(after.covered.find((i) => i.food.id === first.food.id)).toBeTruthy()
    for (const i of before.items) expect(i.packages * i.food.packageGrams * 1.1).toBeGreaterThanOrEqual(i.buyGrams)
  })
  it('uses store prices and flags a cheaper store', () => {
    const s = state()
    s.plan = generatePlan(s, 8)
    const food = buildShoppingList(s).items[0].food.id
    s.stores = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]
    s.preferredStore = 'a'
    s.priceOverrides = { a: { [food]: 10 }, b: { [food]: 2 } }
    const item = buildShoppingList(s).items.find((i) => i.food.id === food)!
    expect(item.cost).toBe(10 * item.packages)
    expect(item.cheaper?.storeName).toBe('B')
  })
})

describe('deficiency analysis', () => {
  it('flags vitamin D when the week has no fish, eggs or fortified foods', () => {
    const s = state()
    s.plan = s.plan.map(() => ({ breakfast: { recipe: 'apple_pb', portion: 1 }, lunch: null, dinner: null, snacks: [] }))
    const vitD = analyzeWeek(s).reports.find((r) => r.info.key === 'vitD')!
    expect(vitD.status).toBe('low')
    expect(vitD.foods.map((f) => f.food.id)).toContain('salmon')
  })
  it('serving totals scale with portion', () => {
    const r = RECIPES[0]
    expect(servingTotals(r, 2).kcal).toBeCloseTo(servingTotals(r, 1).kcal * 2)
  })
})
