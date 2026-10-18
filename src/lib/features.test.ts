import { describe, expect, it, vi } from 'vitest'
import { CONDITIONS } from '../data/conditions'
import { DIETS, dietAllowsFood, DIET_BY_ID } from '../data/diets'
import { SOURCES } from '../data/sources'
import { analyzeWeek } from './analysis'
import { lowEnergyFixes, type EnergyContext } from './energyNow'
import { hormoneSystems } from './hormones'
import { detectPlatform } from './install'
import { generatePlan } from './planner'
import { mealTimes } from './schedule'
import { defaultState } from './store'
import type { AppState, ConditionId, DietId } from '../types'

vi.setConfig({ testTimeout: 60_000 })

const ids = new Set(Object.keys(SOURCES))
const sourced = (list: string[], where: string) => {
  expect(list.length, where).toBeGreaterThan(0)
  for (const id of list) expect(ids.has(id), `${where}: ${id}`).toBe(true)
}

function planned(conditions: ConditionId[] = [], patch: Partial<AppState['profile']> = {}): AppState {
  const s = defaultState()
  s.equipment = ['stove', 'skillet', 'pot', 'oven', 'sheetpan', 'microwave', 'airfryer', 'blender']
  s.profile = { ...s.profile, conditions, ...patch }
  s.plan = generatePlan(s, 4)
  return s
}
const at = (s: AppState, now: number, extra: Partial<EnergyContext> = {}) =>
  lowEnergyFixes(s, analyzeWeek(s), { now, dayIndex: 2, sleptBadly: false, notEaten: false, ...extra })

describe('diets, hormones and energy fixes are sourced', () => {
  it('every diet claim and caution cites real sources', () => {
    for (const d of DIETS) {
      d.evidence.forEach((c, i) => sourced(c.sources, `${d.id} evidence ${i}`))
      d.cautions.forEach((c, i) => sourced(c.sources, `${d.id} caution ${i}`))
    }
    const h = CONDITIONS.find((c) => c.id === 'hashimotos')!
    ;[...h.helps, ...h.guidance].forEach((c, i) => sourced(c.sources, `hashimotos ${i}`))
  })
  it('every hormone lever and energy fix cites real sources, for many kinds of people', () => {
    const people: [ConditionId[], Partial<AppState['profile']>][] = [
      [[], {}],
      [['hashimotos', 'anxiety'], { sex: 'female', meds: { ...defaultState().profile.meds, thyroid: true } }],
      [['menopause', 't2d'], { sex: 'female', age: 54, goal: 'lose', activity: 'very' }],
      [['t1d'], { diets: ['keto'], stimulantMeds: true, weightLb: 260 }],
    ]
    for (const [c, patch] of people) {
      const s = planned(c, patch)
      for (const h of hormoneSystems(s, analyzeWeek(s))) [...h.levers, ...h.forYou].forEach((x, i) => sourced(x.sources, `${h.id} ${i}`))
      for (const now of [8 * 60, 14 * 60, 21 * 60]) {
        const r = at(s, now)
        ;[...r.fixes, ...r.later].forEach((f) => sourced(f.sources, f.id))
      }
    }
  })
})

describe('low energy right now', () => {
  it('puts a glucose check first for type 1 diabetes or insulin/sulfonylureas', () => {
    expect(at(planned(['t1d']), 15 * 60).fixes[0].id).toBe('glucose')
    expect(at(planned([], { meds: { ...defaultState().profile.meds, diabetesMeds: true } }), 15 * 60).fixes[0].id).toBe('glucose')
    expect(at(planned(), 15 * 60).fixes.some((f) => f.id === 'glucose')).toBe(false)
  })
  it('never suggests caffeine after the cutoff, when off caffeine, or when pregnant near the limit', () => {
    const s = planned()
    const bed = mealTimes(s.profile, 2).bed
    const late = at(s, bed - 6 * 60).fixes
    expect(late.some((f) => f.id === 'caffeine')).toBe(false)
    expect(late.some((f) => f.id === 'caffeine_late' && f.avoid)).toBe(true)
    expect(at(s, 10 * 60).fixes.some((f) => f.id === 'caffeine')).toBe(true)
    expect(at(planned([], { caffeine: false }), 10 * 60).fixes.some((f) => f.id.startsWith('caffeine'))).toBe(false)
  })
  it('suggests only drinks the person’s settings allow', () => {
    const gerd = at(planned(['gerd']), 10 * 60).fixes.find((f) => f.id === 'caffeine')
    expect(gerd?.title).toMatch(/green tea/)
    expect(gerd?.title).not.toMatch(/coffee/)
  })
  it('holds coffee for an hour after levothyroxine', () => {
    const s = planned(['hashimotos'], { meds: { ...defaultState().profile.meds, thyroid: true } })
    const wake = mealTimes(s.profile, 2).wake
    const fixes = at(s, wake + 20).fixes
    expect(fixes.some((f) => f.id === 'caffeine')).toBe(false)
    expect(fixes.some((f) => f.id === 'caffeine_wait')).toBe(true)
  })
  it('offers a nap only in the early afternoon, and ranks it higher after a bad night', () => {
    const s = planned()
    expect(at(s, 9 * 60).fixes.some((f) => f.id === 'nap')).toBe(false)
    const rank = (bad: boolean) => at(s, 14 * 60, { sleptBadly: bad }).fixes.findIndex((f) => f.id === 'nap')
    expect(rank(true)).toBeLessThan(rank(false))
  })
  it('snack suggestions fit the person’s diet', () => {
    for (const d of ['vegan', 'keto', 'aip'] as DietId[]) {
      const s = planned([], { diets: [d] })
      const eat = at(s, 16 * 60, { notEaten: true }).fixes.find((f) => f.id === 'eat')!
      expect(eat.snacks!.length, d).toBeGreaterThan(0)
      for (const { recipe } of eat.snacks!) for (const i of recipe.items) expect(dietAllowsFood(DIET_BY_ID[d], i.food), `${d} ${recipe.id}`).toBe(true)
    }
  })
  it('flags B12 for vegans and thyroid checks for Hashimoto’s in the longer-term list', () => {
    expect(at(planned([], { diets: ['vegan'] }), 15 * 60).later.some((f) => f.id === 'b12')).toBe(true)
    expect(at(planned(['hashimotos']), 15 * 60).later.some((f) => f.id === 'tsh')).toBe(true)
  })
})

describe('install', () => {
  it('detects the platform for install instructions', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')).toBe('ios')
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36')).toBe('android')
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36')).toBe('desktop')
  })
})
