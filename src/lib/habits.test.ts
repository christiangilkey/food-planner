import { describe, expect, it } from 'vitest'
import { FOODS } from '../data/foods'
import { NUTRIENTS } from '../data/nutrients'
import { RECIPES } from '../data/recipes'
import { ROTATION_RULES } from '../data/rotation'
import { analyzeRotation, rotationGap } from './rotation'
import { generatePlan } from './planner'
import { daySchedule, mealTimes, parseTime } from './schedule'
import { defaultState } from './store'
import { weeklyTips, mealTip } from './tips'
import { waterPlan } from './water'

describe('data', () => {
  it('every food has a serving size, and plant species where relevant', () => {
    for (const f of FOODS) {
      expect(f.serving, f.id).toBeGreaterThan(0)
      if (f.groups.some((g) => ['legumes', 'fruit', 'leafy_greens', 'whole_grain'].includes(g))) expect(f.plants.length, f.id).toBeGreaterThan(0)
    }
  })
  it('every nutrient lists at least one brain/body effect and absorption tip', () => {
    for (const n of NUTRIENTS) {
      expect(n.effects.length, n.key).toBeGreaterThan(0)
      expect(n.absorption.length, n.key).toBeGreaterThan(0)
    }
  })
  it('every rotation rule can be met by some recipe', () => {
    for (const rule of ROTATION_RULES) {
      const hit = RECIPES.some((r) => r.items.some((i) => FOODS.find((f) => f.id === i.food)?.groups.some((g) => rule.groups.includes(g))))
      expect(hit, rule.id).toBe(true)
    }
  })
})

describe('water', () => {
  it('follows the NASEM adequate intake by sex, adds activity and heat, and subtracts food water', () => {
    const s = defaultState()
    s.plan = generatePlan(s, 3)
    const base = waterPlan(s.profile, s.plan[0])
    expect(base.totalMl).toBe(3700 + 250)
    expect(waterPlan({ ...s.profile, sex: 'female' }, s.plan[0]).totalMl).toBe(2700 + 250)
    const heavy = waterPlan({ ...s.profile, activity: 'very', hotClimate: true }, s.plan[0])
    expect(heavy.totalMl - base.totalMl).toBe(1000)
    expect(base.foodMl).toBeGreaterThan(300)
    expect(base.drinkMl).toBeLessThan(base.totalMl)
  })
})

describe('schedule', () => {
  it('spaces meals sensibly within waking hours', () => {
    const p = defaultState().profile
    const t = mealTimes(p, 2)
    expect(t.breakfast - t.wake).toBeLessThanOrEqual(45)
    expect(t.bed - t.dinner).toBeGreaterThanOrEqual(150)
    expect(t.lunch).toBeGreaterThan(t.breakfast + 180)
    expect(t.dinner).toBeGreaterThan(t.lunch + 180)
    for (const s of t.snacks) expect(s).toBeLessThan(t.bed - 60)
  })
  it('handles bedtimes after midnight', () => {
    const p = { ...defaultState().profile, wakeTime: '10:00', bedTime: '02:00' }
    const t = mealTimes(p, 1)
    expect(t.bed).toBe(26 * 60)
    expect(t.dinner).toBe(21 * 60 + 30)
  })
  it('moves a snack before a workout and adds a caffeine cutoff', () => {
    const s = defaultState()
    s.profile.workoutTime = '17:30'
    s.plan = generatePlan(s, 3)
    const t = mealTimes(s.profile, 2)
    expect(t.snacks).toContain(parseTime('16:15', 0))
    const items = daySchedule(s.profile, s.plan[0], waterPlan(s.profile, s.plan[0]))
    expect(items.some((i) => i.label === 'Caffeine cutoff' && i.at === 15 * 60)).toBe(true)
    expect(items.some((i) => i.kind === 'workout')).toBe(true)
  })
  it('puts medication after breakfast for stimulant users', () => {
    const p = { ...defaultState().profile, stimulantMeds: true }
    const t = mealTimes(p, 2)
    expect(t.medsAt).toBeGreaterThan(t.breakfast)
  })
})

describe('rotation', () => {
  it('generated weeks get close to the weekly food guidelines', () => {
    const s = defaultState()
    s.plan = generatePlan(s, 21)
    const r = analyzeRotation(s)
    const strongMisses = r.rules.filter((x) => x.status !== 'met' && x.rule.evidence === 'strong')
    expect(strongMisses.length).toBeLessThanOrEqual(2)
    expect(r.rules.find((x) => x.rule.id === 'fatty_fish')?.status).toBe('met')
    expect(r.plants.length).toBeGreaterThanOrEqual(18)
  })
  it('gap is zero-ish for a good week and larger for a monotonous one', () => {
    const s = defaultState()
    const good = generatePlan(s, 21)
    const mono = good.map(() => ({ breakfast: { recipe: 'cereal_milk', portion: 2 }, lunch: { recipe: 'cereal_milk', portion: 2 }, dinner: { recipe: 'cereal_milk', portion: 2 }, snacks: [] }))
    expect(rotationGap(mono, ROTATION_RULES)).toBeGreaterThan(rotationGap(good, ROTATION_RULES) + 3)
  })
})

describe('tips', () => {
  it('tailors tips to the profile and plan', () => {
    const s = defaultState()
    s.profile.stimulantMeds = true
    s.plan = generatePlan(s, 4)
    const ids = weeklyTips(s).map((t) => t.id)
    expect(ids).toContain('meds_food')
    expect(ids).toContain('caffeine')
    s.profile.caffeine = false
    expect(weeklyTips(s).map((t) => t.id)).not.toContain('caffeine')
  })
  it('suggests vitamin C with plant iron', () => {
    const quesadillas = RECIPES.find((r) => r.id === 'quesadillas')!
    expect(mealTip(quesadillas, 1, defaultState().profile)?.text).toMatch(/Iron-rich/)
  })
})
