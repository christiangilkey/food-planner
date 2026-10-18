import { describe, expect, it } from 'vitest'
import { SOURCES } from '../data/sources'
import { ACCESS, CHECKINS, CONDITION_TRAINING, FUEL, HORMONE_CUES, MUSCLES, NOT_FOR_YOU, POSTURE, PRINCIPLES, TENDON, VTAPER, type Access, type Muscle } from '../data/training'
import type { ConditionId, FitnessSettings, Profile } from '../types'
import { computeTargets, lbToKg } from './energy'
import { activityFor, bodyTrend, buildProgram, fuelAdvice } from './training'
import { defaultState } from './store'

const fit = (patch: Partial<FitnessSettings> = {}): FitnessSettings => ({ ...defaultState().fitness, enabled: true, ...patch })
const person = (conditions: ConditionId[] = [], patch: Partial<Profile> = {}): Profile => ({ ...defaultState().profile, conditions, ...patch })

describe('training claims are sourced', () => {
  it('every principle, condition note and fuel claim cites real sources', () => {
    const claims = [...PRINCIPLES, ...CONDITION_TRAINING.flatMap((c) => c.claims), ...Object.values(FUEL)]
    for (const c of claims) {
      expect(c.sources.length, c.text).toBeGreaterThan(0)
      for (const s of c.sources) expect(SOURCES[s], `${c.text.slice(0, 40)}: ${s}`).toBeDefined()
    }
  })
})

describe('program builder', () => {
  const accesses: Access[] = ['gym', 'home', 'bodyweight']

  it('trains every muscle at least twice a week, with only the equipment available, inside the session length', () => {
    for (const access of accesses) for (const days of [2, 3, 4, 5, 6]) for (const sessionMin of [45, 75]) {
      const prog = buildProgram(fit({ access, days, sessionMin, experience: 'some' }), person())
      const gear = new Set(ACCESS.find((a) => a.id === access)!.gear)
      expect(prog.sessions).toHaveLength(days)
      for (const s of prog.sessions) {
        expect(s.minutes, `${access} ${days}d ${sessionMin}m ${s.name}`).toBeLessThanOrEqual(sessionMin)
        for (const x of s.exercises) for (const g of x.exercise.gear) expect(gear.has(g), `${x.exercise.id} needs ${g}`).toBe(true)
      }
      for (const m of ['chest', 'back', 'quads', 'hamstrings', 'shoulders'] as Muscle[]) {
        const sessions = prog.sessions.filter((s) => s.exercises.some((x) => x.exercise.primary.includes(m) || x.exercise.secondary.includes(m)))
        expect(sessions.length, `${access} ${days}d: ${m}`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('gives priority muscles more weekly sets', () => {
    const prog = buildProgram(fit({ days: 4, sessionMin: 90, experience: 'advanced', priorities: ['chest', 'biceps'] }), person())
    expect(prog.weekly.chest.target).toBeGreaterThan(prog.weekly.back.target)
    expect(prog.weekly.chest.sets).toBeGreaterThan(prog.weekly.back.sets)
    expect(prog.weekly.biceps.sets).toBeGreaterThan(prog.weekly.triceps.sets)
    // Priorities lead the session.
    const upper = prog.sessions.find((s) => s.name === 'Upper body')!
    expect(['chest', 'biceps']).toContain(upper.exercises[0].for)
  })

  it('reaches most of the weekly targets when time allows', () => {
    const prog = buildProgram(fit({ days: 4, sessionMin: 90, experience: 'some' }), person())
    for (const { id } of MUSCLES) expect(prog.weekly[id].sets, id).toBeGreaterThanOrEqual(prog.weekly[id].target * 0.7)
    expect(prog.trimmed).toBe(false)
  })

  it('short sessions are trimmed, and the plan says so', () => {
    const prog = buildProgram(fit({ days: 2, sessionMin: 30, experience: 'advanced', priorities: ['quads'] }), person())
    expect(prog.trimmed).toBe(true)
    expect(prog.warnings.join(' ')).toMatch(/cut to fit/)
  })

  it('high blood pressure: adds wall sits and keeps 2+ reps in reserve on compounds', () => {
    const prog = buildProgram(fit({ days: 3, sessionMin: 75 }), person(['hypertension']))
    expect(prog.sessions.filter((s) => s.exercises.some((x) => x.exercise.id === 'wall_sit'))).toHaveLength(3)
    for (const s of prog.sessions) for (const x of s.exercises) if (x.exercise.compound) expect(Number(x.rir[0]), x.exercise.id).toBeGreaterThanOrEqual(2)
    expect(prog.conditionNotes.some((c) => c.sources.includes('edwards_bp'))).toBe(true)
  })

  it('pregnancy: nothing lying flat on the back', () => {
    const p = person([], { meds: { ...defaultState().profile.meds, pregnant: true } })
    for (const access of accesses) {
      const prog = buildProgram(fit({ access, days: 3 }), p)
      for (const s of prog.sessions) for (const x of s.exercises) expect(x.exercise.supine, x.exercise.id).toBeFalsy()
    }
  })

  it('migraine gets the aerobic prescription from the trial', () => {
    expect(buildProgram(fit(), person(['migraine'])).cardio).toMatch(/40 minutes, 3 times a week/)
  })
})

describe('training and the meal plan', () => {
  it('raises protein for lifting, more in a deficit, but never past the kidney cap', () => {
    const base = person([], { weightLb: 176, heightIn: 70, goal: 'maintain' })
    const kg = lbToKg(176)
    expect(computeTargets(base).protein / kg).toBeLessThan(1.5)
    expect(computeTargets({ ...base, strengthTraining: true }).protein / kg).toBeCloseTo(1.6, 1)
    expect(computeTargets({ ...base, strengthTraining: true, goal: 'lose' }).protein / kg).toBeCloseTo(2.0, 1)
    expect(computeTargets({ ...base, strengthTraining: true, conditions: ['ckd'] }).protein / kg).toBeLessThanOrEqual(0.81)
  })

  it('suggests a matching activity level and a goal that fits the training goal', () => {
    expect(activityFor(fit({ days: 2, sessionMin: 45 }))).toBe('light')
    expect(activityFor(fit({ days: 4 }))).toBe('moderate')
    expect(activityFor(fit({ days: 6 }))).toBe('very')
    const s = defaultState()
    s.fitness = fit({ days: 5, goal: 'hypertrophy' })
    s.profile = { ...s.profile, activity: 'sedentary', goal: 'lose', strengthTraining: true }
    const ids = fuelAdvice(s)
    expect(ids.find((a) => a.id === 'activity')?.apply?.patch).toEqual({ activity: 'moderate' })
    expect(ids.find((a) => a.id === 'goal')?.apply?.patch).toEqual({ goal: 'gain' })
  })

  it('flags low-protein main meals in the plan', () => {
    const s = defaultState()
    s.fitness = fit()
    s.plan[0].breakfast = { recipe: 'pb_banana_toast', portion: 1 }
    const perMeal = fuelAdvice(s).find((a) => a.id === 'per_meal')!
    expect(perMeal.meals?.[0]).toMatchObject({ day: 'Mon', slot: 'breakfast' })
  })

  it('skips creatine with kidney disease', () => {
    const s = defaultState()
    s.fitness = fit()
    s.profile = { ...s.profile, conditions: ['ckd'] }
    expect(fuelAdvice(s).some((a) => a.id === 'creatine')).toBe(false)
  })
})

describe('looks, tendons, posture and check-ins', () => {
  it('every new claim cites real sources', () => {
    const claims = [VTAPER.claim, ...TENDON.claims, POSTURE.claim, ...Object.values(CHECKINS), ...HORMONE_CUES, ...NOT_FOR_YOU.map((x) => x.claim)]
    for (const c of claims) {
      expect(c.sources.length, c.text).toBeGreaterThan(0)
      for (const s of c.sources) expect(SOURCES[s], `${c.text.slice(0, 40)}: ${s}`).toBeDefined()
    }
  })

  it('the V-taper preset picks its exercises for the priority muscles', () => {
    const prog = buildProgram(fit({ days: 4, sessionMin: 90, experience: 'some', preset: 'vtaper', priorities: VTAPER.priorities }), person())
    const ids = prog.sessions.flatMap((s) => s.exercises.map((x) => x.exercise.id))
    expect(ids).toEqual(expect.arrayContaining(['cable_lateral', 'preacher', 'pulldown', 'incline_db']))
    expect(prog.weekly.shoulders.sets).toBeGreaterThan(prog.weekly.quads.sets)
  })

  it('the tendon add-on puts Nordic curls on one leg day, and only then', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const withIt = buildProgram(fit({ days, sessionMin: 45, addOns: ['tendon'] }), person())
      const hits = withIt.sessions.filter((s) => s.exercises.some((x) => x.exercise.id === 'nordic'))
      expect(hits, `${days} days`).toHaveLength(1)
      expect(['Full body', 'Lower body', 'Legs']).toContain(hits[0].name)
      expect(buildProgram(fit({ days }), person()).sessions.some((s) => s.exercises.some((x) => x.exercise.id === 'nordic'))).toBe(false)
    }
  })

  it('check-ins: weekly averages and NICE waist-to-height bands', () => {
    const today = new Date('2026-10-18T12:00')
    const day = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
    const log = [
      { date: day(10), weightLb: 180, gripKg: 40, hangSec: 30 },
      { date: day(8), weightLb: 182 },
      { date: day(3), weightLb: 182, waistIn: 36 },
      { date: day(1), weightLb: 184, gripKg: 43, hangSec: 45 },
    ]
    const t = bodyTrend(log, person([], { heightIn: 70 }), today)
    expect(t.lastWeek).toBe(181)
    expect(t.thisWeek).toBe(183)
    expect(t.waistToHeight).toBeCloseTo(36 / 70)
    expect(t.whtrBand).toBe('increased')
    expect(t.grip).toEqual({ first: 40, latest: 43 })
    expect(bodyTrend([{ date: day(0), waistIn: 33 }], person([], { heightIn: 70 }), today).whtrBand).toBe('healthy')
    expect(bodyTrend([{ date: day(0), waistIn: 43 }], person([], { heightIn: 70 }), today).whtrBand).toBe('high')
  })
})
