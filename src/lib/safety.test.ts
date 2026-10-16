import { describe, expect, it, vi } from 'vitest'

// Each case builds many full weeks; give them room.
vi.setConfig({ testTimeout: 120_000 })
import { CONDITIONS } from '../data/conditions'
import { NUTRIENTS } from '../data/nutrients'
import { RECIPES } from '../data/recipes'
import { ROTATION_RULES } from '../data/rotation'
import { SOURCES } from '../data/sources'
import { analyzeWeek } from './analysis'
import { activeRules, avoidedFoods, planViolations } from './conditions'
import { computeTargets, lbToKg } from './energy'
import { dayEntries, eligibleRecipes, generatePlan, rankCandidates } from './planner'
import { mealTimes } from './schedule'
import { defaultState } from './store'
import { weeklyTips } from './tips'
import type { AppState, ConditionId, Equipment } from '../types'

const KITCHENS: Equipment[][] = [
  ['stove', 'skillet', 'pot', 'oven', 'sheetpan', 'microwave'],
  ['microwave'],
  ['stove', 'skillet', 'pot', 'oven', 'sheetpan', 'microwave', 'airfryer', 'blender', 'ricecooker', 'slowcooker', 'toaster'],
]

function stateWith(conditions: ConditionId[], patch: Partial<AppState['profile']> = {}, equipment = KITCHENS[0]): AppState {
  const s = defaultState()
  s.equipment = equipment
  s.profile = { ...s.profile, conditions, ...patch }
  return s
}

const SINGLE = CONDITIONS.map((c) => [c.id] as ConditionId[])
const COMBOS: { conditions: ConditionId[]; patch?: Partial<AppState['profile']> }[] = [
  { conditions: ['hypertension', 'cholesterol', 't2d'] },
  { conditions: ['gerd', 'hypertension', 't2d', 'cholesterol', 'ckd'] },
  { conditions: ['depression'], patch: { maoi: true } },
  { conditions: ['depression', 'anxiety', 'adhd'], patch: { maoi: true, stimulantMeds: true } },
  { conditions: ['menopause', 'gerd', 'migraine'], patch: { sex: 'female', age: 52, menopauseStage: 'peri', optInTriggers: ['dark_chocolate', 'cheddar'] } },
  { conditions: ['t1d', 'gerd'], patch: { workoutTime: '18:00' } },
  { conditions: CONDITIONS.map((c) => c.id), patch: { maoi: true, sex: 'female', age: 55 } },
]
const CASES = [...SINGLE.map((conditions) => ({ conditions, patch: {} })), ...COMBOS]

describe('every claim is sourced', () => {
  const ids = new Set(Object.keys(SOURCES))
  const check = (list: string[], where: string) => {
    expect(list.length, where).toBeGreaterThan(0)
    for (const id of list) expect(ids.has(id), `${where}: ${id}`).toBe(true)
  }
  it('nutrients, effects and absorption tips', () => {
    for (const n of NUTRIENTS) {
      check(n.targetSources, `${n.key} target`)
      n.effects.forEach((e) => check(e.sources, `${n.key}/${e.domain}`))
      n.absorption.forEach((t, i) => check(t.sources, `${n.key} absorption ${i}`))
      if (n.note) check(n.note.sources, `${n.key} note`)
    }
  })
  it('rotation rules and condition data', () => {
    ROTATION_RULES.forEach((r) => check(r.sources, r.id))
    for (const c of CONDITIONS) {
      c.rules.forEach((r) => check(r.sources, `${c.id}/${r.id}`))
      ;[...c.helps, ...c.guidance].forEach((x, i) => check(x.sources, `${c.id} claim ${i}`))
      c.avoid.forEach((a, i) => check(a.reason.sources, `${c.id} avoid ${i}`))
      Object.entries(c.limitReasons).forEach(([k, v]) => check(v!.sources, `${c.id} limit ${k}`))
    }
  })
  it('tips and energy explanations', () => {
    const s = stateWith(CONDITIONS.map((c) => c.id), { goal: 'lose', workoutTime: '17:00', stimulantMeds: true, sex: 'female' })
    s.plan = generatePlan(s, 3)
    weeklyTips(s).forEach((t) => check(t.sources, `tip ${t.id}`))
    computeTargets(s.profile).explain.forEach((e, i) => check(e.sources, `energy ${i}`))
  })
})

describe('condition safety', () => {
  for (const { conditions, patch } of CASES) {
    const name = conditions.join('+') + (patch && Object.keys(patch).length ? ` ${JSON.stringify(patch)}` : '')
    it(`plans are within limits: ${name}`, () => {
      for (const equipment of KITCHENS) {
        for (const seed of [1, 2, 3]) {
          const s = stateWith(conditions, patch, equipment)
          s.plan = generatePlan(s, seed)
          const v = planViolations(s.profile, s.plan)
          expect(v.map((x) => x.message), `${equipment.length} tools, seed ${seed}`).toEqual([])
        }
      }
    })
  }

  it('avoided foods never appear in swap options or "foods that fix it"', () => {
    for (const { conditions, patch } of CASES) {
      const s = stateWith(conditions, patch, KITCHENS[2])
      const avoided = avoidedFoods(s.profile)
      s.plan = generatePlan(s, 9)
      for (const slot of ['breakfast', 'lunch', 'dinner', 'snack'] as const) {
        for (const r of eligibleRecipes(s, slot)) expect(r.items.some((i) => avoided.has(i.food)), r.id).toBe(false)
        for (const c of rankCandidates(s, s.plan, 0, slot)) expect(c.recipe.items.some((i) => avoided.has(i.food)), c.recipe.id).toBe(false)
      }
      for (const rep of analyzeWeek(s).reports) {
        for (const f of rep.foods) expect(avoided.has(f.food.id), `${conditions} ${f.food.id}`).toBe(false)
        for (const x of rep.recipes) expect(x.recipe.items.some((i) => avoided.has(i.food)), x.recipe.id).toBe(false)
      }
    }
  })

  it('MAOI removes tyramine-rich foods; triggers can be re-allowed or opted into', () => {
    expect([...avoidedFoods(stateWith(['depression']).profile).keys()]).toEqual([])
    const maoi = avoidedFoods(stateWith(['depression'], { maoi: true }).profile)
    for (const f of ['cheddar', 'kimchi', 'soy_sauce', 'jerky']) expect(maoi.has(f)).toBe(true)
    const gerd = avoidedFoods(stateWith(['gerd'], { toleratedTriggers: ['salsa'] }).profile)
    expect(gerd.has('salsa')).toBe(false)
    expect(gerd.has('canned_tomatoes')).toBe(true)
    expect(avoidedFoods(stateWith(['migraine']).profile).size).toBe(0)
    expect(avoidedFoods(stateWith(['migraine'], { optInTriggers: ['dark_chocolate'] }).profile).has('dark_chocolate')).toBe(true)
    // MAOI safety can't be switched off by "tolerating" a trigger.
    expect(avoidedFoods(stateWith(['depression'], { maoi: true, toleratedTriggers: ['cheddar'] }).profile).has('cheddar')).toBe(true)
  })

  it('GERD keeps 3 hours food-free before bed, for any snack count and schedule', () => {
    for (const [wakeTime, bedTime] of [['07:00', '23:00'], ['06:00', '21:30'], ['10:00', '02:00'], ['05:00', '20:00']]) {
      for (const snacks of [0, 1, 2, 3, 4]) {
        for (const workoutTime of ['', '19:30', '06:30']) {
          const p = stateWith(['gerd'], { wakeTime, bedTime, workoutTime, stimulantMeds: snacks % 2 === 1 }).profile
          const t = mealTimes(p, snacks)
          for (const at of [t.breakfast, t.lunch, t.dinner, ...t.snacks]) expect(t.bed - at, `${wakeTime}-${bedTime} ${snacks} snacks`).toBeGreaterThanOrEqual(180)
        }
      }
    }
  })

  it('unsafe tips are suppressed and no tip names an avoided food', () => {
    const cases: [ConditionId[], Partial<AppState['profile']>, string[]][] = [
      [['t1d'], {}, ['fast']],
      [['t2d'], {}, ['fast']],
      [['migraine'], {}, ['fast']],
      [['ckd'], { goal: 'lose', workoutTime: '18:00' }, ['creatine', 'protein_spread']],
    ]
    for (const [conditions, patch, banned] of cases) {
      const s = stateWith(conditions, patch)
      s.plan = generatePlan(s, 4)
      const ids = weeklyTips(s).map((t) => t.id)
      for (const b of banned) expect(ids, `${conditions}: ${b}`).not.toContain(b)
    }
    const g = stateWith(['gerd', 'depression'], { maoi: true, sex: 'female' })
    g.plan = generatePlan(g, 5)
    const text = weeklyTips(g).map((t) => t.text).join(' ').toLowerCase()
    for (const word of ['clementine', 'kimchi', 'aged cheese', 'dark chocolate']) expect(text).not.toContain(word)
  })

  it('kidney disease caps protein at 0.8 g/kg', () => {
    const p = stateWith(['ckd'], { goal: 'gain', activity: 'athlete' }).profile
    expect(computeTargets(p).protein).toBeLessThanOrEqual(Math.ceil(lbToKg(p.weightLb) * 0.8))
  })

  it('menopause stage sets iron and calcium targets', () => {
    const t = (stage: 'peri' | 'meno' | 'post', age: number) => {
      const s = stateWith(['menopause'], { sex: 'female', age, menopauseStage: stage })
      s.plan = generatePlan(s, 2)
      const r = analyzeWeek(s).reports
      return { iron: r.find((x) => x.info.key === 'iron')!.target, calcium: r.find((x) => x.info.key === 'calcium')!.target }
    }
    expect(t('peri', 52)).toEqual({ iron: 18, calcium: 1200 })
    expect(t('peri', 46)).toEqual({ iron: 18, calcium: 1000 })
    expect(t('meno', 49)).toEqual({ iron: 8, calcium: 1200 })
    expect(t('post', 60)).toEqual({ iron: 8, calcium: 1200 })
  })

  it('hypertension plans aim for the 1,500 mg goal', () => {
    const s = stateWith(['hypertension'], {}, KITCHENS[2])
    s.plan = generatePlan(s, 6)
    expect(analyzeWeek(s).sodiumLimit).toBe(1500)
    expect(analyzeWeek(s).sodiumPerDay).toBeLessThan(2300)
  })

  it('condition rules are added to the weekly rotation', () => {
    const ids = activeRules(stateWith(['hypertension', 'migraine']).profile).map((r) => r.id)
    expect(ids).toContain('dash_veg')
    expect(ids).toContain('mig_fish')
  })

  it('every recipe is checked: no recipe sneaks past a condition', () => {
    const s = stateWith(CONDITIONS.map((c) => c.id), { maoi: true }, KITCHENS[2])
    const avoided = avoidedFoods(s.profile)
    const allowed = new Set((['breakfast', 'lunch', 'dinner', 'snack'] as const).flatMap((slot) => eligibleRecipes(s, slot).map((r) => r.id)))
    for (const r of RECIPES) if (r.items.some((i) => avoided.has(i.food))) expect(allowed.has(r.id), r.id).toBe(false)
    s.plan = generatePlan(s, 1)
    for (const day of s.plan) for (const { entry } of dayEntries(day)) expect(allowed.has(entry.recipe)).toBe(true)
  })
})
