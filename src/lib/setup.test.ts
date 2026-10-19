import { describe, expect, it, vi } from 'vitest'
import { RECIPE_BY_ID } from '../data/recipes'
import { SOURCES } from '../data/sources'
import { FLAG_AVOIDS } from '../data/conditions'
import { avoidedFoods, CAFFEINATED_DRINKS, dietBlocked, planViolations } from './conditions'
import { canMake } from './nutrition'
import { dayEntries, magicPlan } from './planner'
import { blankProduct, productFoodId, syncProducts } from './products'
import { defaultState } from './store'
import type { AppState } from '../types'

vi.setConfig({ testTimeout: 120_000 })

/** Someone who filled in a lot during setup. */
function busyProfile(): AppState {
  const s = defaultState()
  s.equipment = ['stove', 'pot', 'microwave', 'blender']
  s.profile = {
    ...s.profile,
    sex: 'female', age: 32, weightLb: 140, heightIn: 64, goal: 'lose', activity: 'moderate',
    conditions: ['hypertension', 't2d', 'hashimotos'], diets: ['pescatarian'],
    excluded: ['tofu', 'shrimp'], caffeine: false, maxMealMin: 15, snacksPerDay: 1, weeklyBudget: 60,
    meds: { ...s.profile.meds, pregnant: true, thyroid: true },
  }
  s.pantry = [{ food: 'egg', grams: 600 }, { food: 'oats', grams: 1000 }, { food: 'lentils', grams: 900 }, { food: 'salmon', grams: 454 }, { food: 'deli_turkey', grams: 227 }]
  return s
}

describe('magic plan follows every setup choice', () => {
  const s = busyProfile()
  const plan = magicPlan(s, 21)
  const entries = plan.flatMap((d) => dayEntries(d).map((x) => x.entry))
  const recipes = entries.map((e) => RECIPE_BY_ID[e.recipe])
  const foods = new Set(recipes.flatMap((r) => r.items.map((i) => i.food)))

  it('plans a full week', () => expect(entries.length).toBeGreaterThanOrEqual(21))
  it('breaks no condition limit', () => expect(planViolations(s.profile, plan)).toEqual([]))
  it('stays within the diet (pescatarian: no meat)', () => {
    const blocked = dietBlocked(s.profile)
    expect([...foods].filter((f) => blocked.has(f))).toEqual([])
  })
  it('never uses foods you won’t eat, even ones in the pantry', () => {
    expect(foods.has('tofu')).toBe(false)
    expect(foods.has('shrimp')).toBe(false)
  })
  it('respects no caffeine', () => expect(CAFFEINATED_DRINKS.some((c) => foods.has(c))).toBe(false))
  it('respects pregnancy food safety, even with deli turkey in the pantry', () => expect(foods.has('deli_turkey')).toBe(false))
  it('only plans meals your kitchen can make, within your hands-on time', () => {
    for (const r of recipes) {
      expect(canMake(r, s.equipment), r.id).toBe(true)
      expect(r.activeMin, r.id).toBeLessThanOrEqual(15)
    }
  })
  it('plans the number of snacks you chose', () => {
    for (const d of plan) expect(d.snacks.length).toBeLessThanOrEqual(1)
  })
})

describe('pregnancy food safety (CDC listeria advice)', () => {
  it('removes deli meat only when pregnant', () => {
    // No high blood pressure here: that condition removes deli meat on its own, for the salt.
    const p = { ...busyProfile().profile, conditions: [] }
    expect(avoidedFoods(p).has('deli_turkey')).toBe(true)
    expect(avoidedFoods({ ...p, meds: { ...p.meds, pregnant: false } }).has('deli_turkey')).toBe(false)
  })
  it('keeps scanned salami or unpasteurized cheese out', () => {
    const salami = { ...blankProduct(), name: 'Genoa salami', ingredients: 'Pork, salt, spices', servingGrams: 28, packageGrams: 200, label: { kcal: 110 } }
    const cheese = { ...blankProduct(), name: 'Queso fresco', ingredients: 'Pasteurized milk, salt, enzymes', servingGrams: 28, packageGrams: 280, label: { kcal: 80 } }
    syncProducts([salami, cheese])
    const avoided = avoidedFoods(busyProfile().profile)
    expect(avoided.has(productFoodId(salami))).toBe(true)
    expect(avoided.has(productFoodId(cheese))).toBe(true)
    syncProducts([])
  })
  it('cites a real source', () => {
    for (const e of FLAG_AVOIDS) for (const id of e.reason.sources) expect(SOURCES[id], id).toBeDefined()
  })
})
