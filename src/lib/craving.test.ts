import { describe, expect, it, vi } from 'vitest'
import { RECIPE_BY_ID } from '../data/recipes'
import { avoidedFoods, CAFFEINATED_DRINKS, dietBlocked } from './conditions'
import { checkAiAnswer, cravingOptions, deviceIdeas, PANTRY_SHARE, profileSummary, readCraving } from './craving'
import { canMake } from './nutrition'
import { defaultState } from './store'
import type { AppState } from '../types'

vi.setConfig({ testTimeout: 60_000 })

function busyProfile(): AppState {
  const s = defaultState()
  s.equipment = ['stove', 'pot', 'microwave', 'blender']
  s.profile = {
    ...s.profile,
    conditions: ['hypertension', 't2d'], diets: ['pescatarian'],
    excluded: ['tofu', 'shrimp'], caffeine: false, maxMealMin: 15,
    meds: { ...s.profile.meds, pregnant: true },
  }
  s.pantry = [{ food: 'greek_yogurt', grams: 900 }, { food: 'berries', grams: 500 }, { food: 'oats', grams: 1000 }, { food: 'deli_turkey', grams: 227 }]
  return s
}

describe('craving options follow every setup choice', () => {
  const s = busyProfile()
  const options = cravingOptions(s)

  it('offers something', () => {
    expect(options.recipes.length).toBeGreaterThan(0)
    expect(options.foods.length).toBeGreaterThan(0)
  })
  it('only lists recipes the kitchen can make within the time limit, with no ruled-out foods', () => {
    const avoided = avoidedFoods(s.profile)
    const blocked = dietBlocked(s.profile)
    for (const o of options.recipes) {
      const r = RECIPE_BY_ID[o.id]
      expect(canMake(r, s.equipment), o.id).toBe(true)
      expect(r.activeMin, o.id).toBeLessThanOrEqual(15)
      for (const it of r.items) {
        expect(avoided.has(it.food) || blocked.has(it.food) || s.profile.excluded.includes(it.food), `${o.id}: ${it.food}`).toBe(false)
      }
    }
  })
  it('leaves out foods to buy that the settings rule out', () => {
    const ids = options.foods.map((f) => f.id)
    for (const f of ['tofu', 'shrimp', 'deli_turkey', 'chicken_breast', ...CAFFEINATED_DRINKS]) expect(ids, f).not.toContain(f)
  })
  it('tells the AI about the setup', () => {
    const text = profileSummary(s)
    expect(text).toMatch(/Pescatarian/i)
    expect(text).toMatch(/pregnan/i)
    expect(text).toMatch(/Caffeine: no/)
    expect(text).toMatch(/15 min/)
  })
})

describe('on-device ideas', () => {
  const s = busyProfile()
  it('reads tastes from what you type', () => {
    expect(readCraving('something sweet and crunchy').map((t) => t.label)).toEqual(['sweet', 'crunchy'])
  })
  it('splits ideas into pantry and buy-later by how much is at home', () => {
    const res = deviceIdeas('something sweet and creamy', s)
    expect(res.source).toBe('device')
    expect(res.fromPantry.length + res.toBuy.length).toBeGreaterThan(0)
    for (const x of res.fromPantry) expect(x.pantry ?? 0).toBeGreaterThanOrEqual(PANTRY_SHARE)
    for (const x of res.toBuy) expect(x.pantry ?? 0).toBeLessThan(PANTRY_SHARE)
  })
  it('doesn’t treat a taste word as a dish name (sweet ≠ sweet potato)', () => {
    const res = deviceIdeas('something sweet', s)
    const names = [...res.fromPantry, ...res.toBuy].map((x) => x.name.toLowerCase())
    expect(names.filter((n) => n.includes('sweet potato'))).toEqual([])
  })
  it('explains when nothing matches', () => {
    const res = deviceIdeas('zzzz', s)
    expect(res.fromPantry).toEqual([])
    expect(res.toBuy).toEqual([])
    expect(res.note).not.toBe('')
  })
})

describe('checking the AI’s picks', () => {
  const s = busyProfile()
  const options = cravingOptions(s)
  const home = options.recipes.find((r) => r.pantry >= PANTRY_SHARE)
  const away = options.recipes.find((r) => r.pantry < PANTRY_SHARE)!
  const food = options.foods[0]

  it('drops anything not on the allowed lists', () => {
    const res = checkAiAnswer({
      understood: 'x', note: '',
      from_pantry: [{ kind: 'recipe', id: 'not_a_recipe', why: '' }],
      to_buy: [{ kind: 'food', id: 'deli_turkey', why: '' }, { kind: 'food', id: 'tofu', why: '' }, { kind: 'food', id: food.id, why: 'ok' }],
    }, options)
    expect(res.fromPantry).toEqual([])
    expect(res.toBuy.map((x) => x.id)).toEqual([food.id])
    expect(res.source).toBe('ai')
  })
  it('moves pantry picks that aren’t mostly at home to the buy list, and removes duplicates', () => {
    const res = checkAiAnswer({
      understood: 'x', note: '',
      from_pantry: [{ kind: 'recipe', id: away.id, why: '' }, ...(home ? [{ kind: 'recipe' as const, id: home.id, why: '' }] : [])],
      to_buy: [{ kind: 'recipe', id: away.id, why: '' }],
    }, options)
    expect(res.fromPantry.map((x) => x.id)).toEqual(home ? [home.id] : [])
    expect(res.toBuy.map((x) => x.id)).toEqual([away.id])
  })
})
