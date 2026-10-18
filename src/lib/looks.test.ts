import { describe, expect, it, vi } from 'vitest'
import { CONDITION_BY_ID } from '../data/conditions'
import { RECIPE_BY_ID } from '../data/recipes'
import { SOURCES } from '../data/sources'
import { NOT_RECOMMENDED } from '../data/supplements'
import { avoidedFoods, planViolations } from './conditions'
import { cookingStyle, gentleness, glycemicLoad, gentlerCookingTip, puffiness } from './looks'
import { dayEntries, generatePlan } from './planner'
import { defaultState } from './store'
import type { AppState, ConditionId, DayPlan } from '../types'

vi.setConfig({ testTimeout: 120_000 })

function person(conditions: ConditionId[], patch: Partial<AppState['profile']> = {}): AppState {
  const s = defaultState()
  s.equipment = ['stove', 'skillet', 'pot', 'oven', 'sheetpan', 'microwave', 'airfryer', 'blender', 'slowcooker']
  s.profile = { ...s.profile, conditions, ...patch }
  return s
}

const average = (plan: DayPlan[], f: (id: string, portion: number) => number) => {
  const xs = plan.flatMap((d) => dayEntries(d).map(({ entry }) => f(entry.recipe, entry.portion)))
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

describe('skin & looks: food logic', () => {
  it('estimates glycemic load: white-rice and cereal meals above lentils and eggs', () => {
    expect(glycemicLoad(RECIPE_BY_ID.shrimp_fried_rice)).toBeGreaterThan(glycemicLoad(RECIPE_BY_ID.lentil_spinach_stew))
    expect(glycemicLoad(RECIPE_BY_ID.cereal_milk)).toBeGreaterThan(glycemicLoad(RECIPE_BY_ID.boiled_eggs))
    expect(glycemicLoad(RECIPE_BY_ID.boiled_eggs)).toBeLessThan(2)
  })

  it('reads the cooking method from the steps', () => {
    expect(cookingStyle(RECIPE_BY_ID.overnight_oats)).toBe('none')
    expect(cookingStyle(RECIPE_BY_ID.boiled_eggs)).toBe('moist')
    expect(cookingStyle(RECIPE_BY_ID.airfryer_thighs)).toBe('dry')
    expect(gentleness(RECIPE_BY_ID.airfryer_thighs)).toBe(-1)
    expect(gentlerCookingTip(RECIPE_BY_ID.airfryer_thighs)).toMatch(/steaming, poaching or stewing/)
    expect(gentlerCookingTip(RECIPE_BY_ID.overnight_oats)).toBeNull()
  })

  it('the goal lowers glycemic load and favors gentler cooking across a week', () => {
    let glWith = 0, glWithout = 0, gentleWith = 0, gentleWithout = 0
    for (const seed of [1, 2, 3]) {
      const on = generatePlan(person(['looks']), seed)
      const off = generatePlan(person([]), seed)
      glWith += average(on, (id, p) => glycemicLoad(RECIPE_BY_ID[id], p))
      glWithout += average(off, (id, p) => glycemicLoad(RECIPE_BY_ID[id], p))
      gentleWith += average(on, (id) => gentleness(RECIPE_BY_ID[id]))
      gentleWithout += average(off, (id) => gentleness(RECIPE_BY_ID[id]))
    }
    expect(glWith).toBeLessThan(glWithout)
    expect(gentleWith).toBeGreaterThan(gentleWithout)
  })

  for (const conditions of [['looks', 'hypertension'], ['looks', 't2d', 'cholesterol'], ['looks', 'ckd'], ['looks', 'hashimotos']] as ConditionId[][]) {
    it(`keeps every hard limit: ${conditions.join(' + ')}`, () => {
      const s = person(conditions)
      expect(planViolations(s.profile, generatePlan(s, 9))).toEqual([])
    })
  }

  it('dairy is removed only if the person says it affects their skin', () => {
    expect(avoidedFoods(person(['looks']).profile).has('milk')).toBe(false)
    expect(avoidedFoods(person(['looks'], { optInTriggers: ['milk'] }).profile).has('milk')).toBe(true)
  })

  it('puffiness never pushes potassium with kidney disease or potassium-raising BP drugs', () => {
    const day = { sodium: 1800, potassium: 1200 }
    expect(puffiness(day, person(['looks']).profile).text).toMatch(/potassium/i)
    expect(puffiness(day, person(['looks', 'ckd']).profile).text).not.toMatch(/beans|banana|potatoes/)
    const bp = person(['looks'], { meds: { ...defaultState().profile.meds, bpMeds: true } })
    expect(puffiness(day, bp.profile).text).not.toMatch(/beans|banana|potatoes/)
    expect(puffiness({ sodium: 3100, potassium: 4000 }, person(['looks']).profile).tone).toBe('warn')
  })

  it('every looks claim and the vitamin C entry cite real sources', () => {
    const c = CONDITION_BY_ID.looks
    const claims = [...c.helps, ...c.guidance, ...c.avoid.map((a) => a.reason)]
    for (const cl of claims) for (const id of cl.sources) expect(SOURCES[id], id).toBeDefined()
    for (const r of c.rules) for (const id of r.sources) expect(SOURCES[id], id).toBeDefined()
    const vc = NOT_RECOMMENDED.find((x) => x.id === 'vitc_megadose')!
    for (const id of vc.sources) expect(SOURCES[id], id).toBeDefined()
  })
})
