import { describe, expect, it } from 'vitest'
import { SOURCES } from '../data/sources'
import { ACCESS, canDo, EXERCISES, gearNames, gearOf, HEAD_INFO, HEADS, CHECKINS, CONDITION_TRAINING, FASCIA, FUEL, HORMONE_CUES, MOBILITY_MYTHS, MUSCLES, NOT_FOR_YOU, POSTURE, PRINCIPLES, TENDON, VTAPER, type Access, type Muscle } from '../data/training'
import type { ConditionId, FitnessSettings, Profile } from '../types'
import { computeTargets, lbToKg } from './energy'
import { activityFor, alternativesFor, bodyTrend, buildProgram, fuelAdvice, usableExercises, whyNot } from './training'
import { LIMITATIONS } from '../data/limitations'
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
      const gear = gearOf(ACCESS.find((a) => a.id === access)!.equipment)
      expect(prog.sessions).toHaveLength(days)
      for (const s of prog.sessions) {
        expect(s.minutes, `${access} ${days}d ${sessionMin}m ${s.name}`).toBeLessThanOrEqual(sessionMin)
        for (const x of s.exercises) expect(canDo(x.exercise, gear), `${x.exercise.id} needs ${gearNames(x.exercise).join(', ')}`).toBe(true)
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
    const claims = [VTAPER.claim, ...TENDON.claims, POSTURE.claim, ...FASCIA.claims, ...FASCIA.height, ...Object.values(CHECKINS), ...HORMONE_CUES, ...NOT_FOR_YOU.map((x) => x.claim)]
    for (const c of claims) {
      expect(c.sources.length, c.text).toBeGreaterThan(0)
      for (const s of c.sources) expect(SOURCES[s], `${c.text.slice(0, 40)}: ${s}`).toBeDefined()
    }
  })

  it('fascia & mobility is its own routine, and never promises an adult height gain', () => {
    const base = buildProgram(fit({ days: 4 }), person())
    const withFascia = buildProgram(fit({ days: 4, addOns: ['fascia'] }), person())
    expect(withFascia.sessions).toEqual(base.sessions)
    expect(FASCIA.drills.length).toBeGreaterThanOrEqual(5)
    const text = [...FASCIA.claims, ...FASCIA.height].map((c) => c.text).join(' ') + FASCIA.drills.map((d) => d.cue).join(' ')
    expect(text).not.toMatch(/grow taller|gain height|add height|inches taller/i)
    expect(text).toMatch(/growth plates close/)
  })

  it('mobility research: every claim, myth and safety note is sourced, and nothing claims to "release" fascia', () => {
    const claims = [...FASCIA.claims, FASCIA.mechanism, FASCIA.safety, ...FASCIA.height, ...MOBILITY_MYTHS.map((m) => m.claim), CHECKINS.height]
    for (const c of claims) {
      expect(c.sources.length, c.text).toBeGreaterThan(0)
      for (const s of c.sources) expect(SOURCES[s], `${c.text.slice(0, 40)}: ${s}`).toBeDefined()
    }
    // "Release" only ever appears inside quotes, as the myth being corrected.
    const advice = [...FASCIA.claims, ...FASCIA.height].map((c) => c.text).join(' ') + FASCIA.drills.map((d) => `${d.name} ${d.cue}`).join(' ')
    expect(advice).not.toMatch(/release|adhesion|break up|hydrat/i)
    expect(MOBILITY_MYTHS.length).toBeGreaterThanOrEqual(8)
  })

  it('high blood pressure warns against inversion', () => {
    const prog = buildProgram(fit(), person(['hypertension']))
    expect(prog.conditionNotes.some((c) => c.sources.includes('haskvitz_inversion'))).toBe(true)
  })

  it('height check-ins: flags loss over 2 cm in 3 years or 6 cm from your tallest, and ignores normal readings', () => {
    const today = new Date('2026-10-30T12:00')
    const day = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
    const p = person([], { heightIn: 70 })
    // 0.5 in (1.3 cm) lower than a year ago: normal.
    expect(bodyTrend([{ date: day(365), heightIn: 70 }, { date: day(0), heightIn: 69.5 }], p, today).height).toMatchObject({ latestIn: 69.5, flag: false })
    // 1 in (2.5 cm) lower than two years ago: worth raising.
    expect(bodyTrend([{ date: day(730), heightIn: 70 }, { date: day(0), heightIn: 69 }], p, today).height?.flag).toBe(true)
    // An old reading beyond 3 years doesn't count toward the 2 cm rule...
    expect(bodyTrend([{ date: day(2000), heightIn: 70 }, { date: day(0), heightIn: 69 }], p, today).height?.flag).toBe(false)
    // ...but 2.5 in (6.4 cm) below the profile's height does, against the 6 cm rule.
    expect(bodyTrend([{ date: day(0), heightIn: 67.5 }], p, today).height?.flag).toBe(true)
    expect(bodyTrend([{ date: day(0), weightLb: 180 }], p, today).height).toBeUndefined()
  })

  it('the V-taper preset picks its exercises for the priority muscles', () => {
    const prog = buildProgram(fit({ days: 4, sessionMin: 90, experience: 'some', preset: 'vtaper', priorities: VTAPER.priorities }), person())
    const ids = prog.sessions.flatMap((s) => s.exercises.map((x) => x.exercise.id))
    expect(ids).toEqual(expect.arrayContaining(['cable_lateral', 'preacher', 'overhead_ext', 'pulldown', 'incline_db']))
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

describe('equipment, limitations and swaps', () => {
  const at = (equipment: FitnessSettings['places'] extends (infer P)[] | undefined ? P extends { equipment: infer E } ? E : never : never) =>
    fit({ places: [{ id: 'p', name: 'Here', equipment }], place: 'p', days: 4, sessionMin: 75 })
  const all = (prog: ReturnType<typeof buildProgram>) => prog.sessions.flatMap((s) => s.exercises.map((x) => x.exercise))

  it('uses only the equipment ticked for the active place, including home systems', () => {
    const prog = buildProgram(at(['suspension', 'bands']), person())
    const gear = gearOf(['suspension', 'bands'])
    for (const e of all(prog)) expect(canDo(e, gear), e.id).toBe(true)
    expect(all(prog).some((e) => e.gear.includes('suspension'))).toBe(true)
  })

  it('switching place changes the plan straight away', () => {
    const f = fit({ places: [{ id: 'gym', name: 'Gym', equipment: [...ACCESS[0].equipment] }, { id: 'hotel', name: 'Hotel', equipment: [] }], place: 'hotel' })
    for (const e of all(buildProgram(f, person()))) expect(canDo(e, gearOf([])), e.id).toBe(true)
    expect(all(buildProgram({ ...f, place: 'gym' }, person())).some((e) => e.gear.includes('barbell') || e.gear.includes('cable'))).toBe(true)
  })

  it('never plans an exercise that loads a limitation, and adds the targeted work', () => {
    const gym = [...ACCESS[0].equipment]
    for (const l of LIMITATIONS) {
      const prog = buildProgram({ ...at(gym), limitations: [l.id] }, person())
      for (const e of all(prog)) for (const s of e.stress ?? []) expect(l.avoid.includes(s), `${l.id}: ${e.id} (${s})`).toBe(false)
      for (const a of l.adds ?? []) expect(all(prog).some((e) => e.id === a.exercise || e.id === a.exercise.replace(/^band_/, 'cable_')), `${l.id} adds ${a.exercise}`).toBe(true)
      for (const x of prog.sessions.flatMap((s) => s.exercises)) if (l.minRir && x.exercise.compound && x.rir !== '—') expect(Number(x.rir.split('–')[0]), `${l.id} ${x.exercise.id}`).toBeGreaterThanOrEqual(l.minRir)
    }
  })

  it('osteoporosis swaps crunches for spine-friendly core work, and shoulder pain drops overhead pressing', () => {
    const gym = [...ACCESS[0].equipment]
    const bones = all(buildProgram({ ...at(gym), limitations: ['osteoporosis'], priorities: ['abs'] }, person()))
    expect(bones.some((e) => e.primary.includes('abs'))).toBe(true)
    expect(bones.some((e) => e.stress?.includes('spine_flexion'))).toBe(false)
    const shoulder = all(buildProgram({ ...at(gym), limitations: ['shoulder'] }, person()))
    expect(shoulder.some((e) => e.stress?.includes('overhead'))).toBe(false)
    expect(shoulder.some((e) => e.primary[0] === 'shoulders' && !e.addOnOnly)).toBe(true)
  })

  it('every muscle has alternatives, and limitations keep at least one per muscle at the gym', () => {
    const gym = fit({ access: 'gym' })
    for (const { id } of MUSCLES) {
      const one = usableExercises(gym, person()).find((e) => e.primary[0] === id)!
      expect(alternativesFor(one, gym, person()).length, id).toBeGreaterThanOrEqual(3)
    }
    for (const l of LIMITATIONS) {
      const prog = buildProgram({ ...gym, days: 4, sessionMin: 90, limitations: [l.id] }, person())
      expect(prog.warnings.join(' '), l.id).not.toMatch(/Nothing for your/)
    }
  })

  it('a swap replaces the planned exercise, and an avoided one is never planned', () => {
    const f = at([...ACCESS[0].equipment])
    const first = buildProgram(f, person()).sessions[0].exercises[0].exercise
    const alt = alternativesFor(first, f, person())[0]
    const swapped = buildProgram({ ...f, swaps: { [first.id]: alt.id } }, person())
    expect(swapped.sessions[0].exercises[0].exercise.id).toBe(alt.id)
    const avoided = buildProgram({ ...f, avoid: [first.id] }, person())
    expect(all(avoided).some((e) => e.id === first.id)).toBe(false)
    expect(whyNot(first, { ...f, avoid: [first.id] }, person())).toMatch(/chose/)
  })
})

describe('muscles worked', () => {
  it('every exercise lists its main movers, using known muscles', () => {
    for (const e of EXERCISES) {
      const h = HEADS[e.id]
      expect(h, `${e.id} has no muscle list`).toBeDefined()
      expect(h.prime.length, `${e.id} main movers`).toBeGreaterThan(0)
      for (const m of [...h.prime, ...h.assist, ...(h.stabilize ?? [])]) expect(HEAD_INFO[m], `${e.id}: ${m}`).toBeDefined()
    }
    expect(Object.keys(HEADS).filter((id) => !EXERCISES.some((e) => e.id === id))).toEqual([])
  })
})

describe('osteoporosis as a health condition', () => {
  it('raises calcium and vitamin D the way the bone foundation advises', async () => {
    const { nutrientTarget } = await import('./conditions')
    expect(nutrientTarget('calcium', person(['osteoporosis'], { sex: 'female', age: 60 }), 2000)).toBe(1200)
    expect(nutrientTarget('calcium', person(['osteoporosis'], { sex: 'male', age: 60 }), 2000)).toBe(1000)
    expect(nutrientTarget('calcium', person(['osteoporosis'], { sex: 'male', age: 75 }), 2000)).toBe(1200)
    expect(nutrientTarget('vitD', person(['osteoporosis'], { age: 55 }), 2000)).toBe(20)
    expect(nutrientTarget('vitD', person([], { age: 55 }), 2000)).toBe(15)
  })
  it('switches on the training limitation by itself: no crunches or twists, back extensions added', () => {
    const f = fit({ access: 'gym', days: 4, sessionMin: 75, priorities: ['abs'] })
    const prog = buildProgram(f, person(['osteoporosis'], { sex: 'female', age: 62 }))
    const all = prog.sessions.flatMap((s) => s.exercises.map((x) => x.exercise))
    expect(all.some((e) => e.stress?.some((s) => s === 'spine_flexion' || s === 'spine_twist'))).toBe(false)
    expect(all.some((e) => e.id === 'superman')).toBe(true)
    expect(prog.conditionNotes.some((c) => c.sources.includes('tftf_2014'))).toBe(true)
  })
})

describe('custom weeks, stretch, yoga and balance', () => {
  const items = (s: { exercises: { exercise: { id: string } }[]; blocks: { items: { exercise: { id: string } }[] }[] }) => [...s.exercises, ...s.blocks.flatMap((b) => b.items)].map((x) => x.exercise.id)

  it('builds your own week day by day, mixing lifting with stretch, yoga and balance', () => {
    const week: FitnessSettings['week'] = [['push', 'balance'], [], ['pull'], [], ['legs'], ['stretch'], ['yoga']]
    const prog = buildProgram(fit({ layout: 'custom', week, access: 'gym', sessionMin: 60 }), person())
    expect(prog.sessions.map((s) => s.weekday)).toEqual([0, 2, 4, 5, 6])
    expect(prog.sessions[0].name).toBe('Push + Balance')
    expect(prog.sessions[0].blocks.map((b) => b.kind)).toEqual(['balance'])
    expect(prog.sessions[0].exercises.every((x) => ['chest', 'shoulders', 'triceps'].includes(x.for!))).toBe(true)
    expect(prog.sessions[3].exercises).toHaveLength(0)
    expect(prog.sessions[3].blocks[0].kind).toBe('stretch')
    expect(prog.sessions[4].blocks[0].items.every((x) => x.exercise.kind === 'yoga')).toBe(true)
    // Push, pull and legs once each: the week says so.
    expect(prog.notes.join(' ')).toMatch(/once a week/)
    expect(prog.split).toBe('Your own week + stretch, yoga, balance')
  })

  it('warns when your own week leaves muscles out', () => {
    const week: FitnessSettings['week'] = [['upper'], [], ['upper'], [], [], [], []]
    const prog = buildProgram(fit({ layout: 'custom', week }), person())
    expect(prog.warnings.join(' ')).toMatch(/doesn’t train your quads, hamstrings, glutes, calves/)
  })

  it('fixed layouts and added sessions land on the right days', () => {
    const ul = buildProgram(fit({ layout: 'upper_lower', days: 4 }), person())
    expect(ul.sessions.map((s) => s.name)).toEqual(['Upper body', 'Lower body', 'Upper body', 'Lower body'])
    const ppl = buildProgram(fit({ layout: 'ppl', days: 3, extraDays: { stretch: 1, balance: 1 } }), person())
    expect(ppl.sessions.map((s) => s.name)).toEqual(['Push', 'Pull', 'Legs', 'Balance', 'Stretch'])
    expect(ppl.sessions.find((s) => s.name === 'Stretch')!.weekday).toBe(6)
    // Six lifting days and two extras: both share the one free day.
    const six = buildProgram(fit({ days: 6, extraDays: { stretch: 1, yoga: 1 } }), person())
    expect(six.sessions).toHaveLength(7)
    expect(six.sessions.find((s) => s.weekday === 6)!.name).toBe('Stretch + Yoga')
  })

  it('stretch sessions start with your regions and posture goals', () => {
    const prog = buildProgram(fit({ extraDays: { stretch: 1 }, stretchRegions: ['hip_flexors', 'calves'], extraMin: 15 }), person())
    const block = prog.sessions.flatMap((s) => s.blocks).find((b) => b.kind === 'stretch')!
    const regions = block.items.slice(0, 2).flatMap((x) => x.exercise.regions ?? [])
    expect(regions).toEqual(expect.arrayContaining(['hip_flexors', 'calves']))
    expect(block.items.length).toBeGreaterThanOrEqual(4)
  })

  it('without a stretch day, chosen regions become cool-down stretches after lifting', () => {
    const prog = buildProgram(fit({ days: 3, stretchRegions: ['chest'] }), person())
    for (const s of prog.sessions) {
      const cool = s.blocks.find((b) => b.kind === 'cooldown')!
      expect(cool.items.length).toBeGreaterThan(0)
      expect(cool.items[0].exercise.regions).toContain('chest')
    }
  })

  it('posture goals add strength work to two lifting days and drills to the stretching', () => {
    const prog = buildProgram(fit({ days: 4, access: 'gym', postureGoals: ['pelvic_tilt', 'forward_head'] }), person())
    for (const s of prog.sessions.slice(0, 2)) {
      expect(s.exercises.some((x) => x.exercise.id === 'glute_bridge')).toBe(true)
      expect(items(s)).toContain('pelvic_tilt')
      expect(items(s)).toContain('chin_tucks')
    }
    expect(items(prog.sessions[2])).not.toContain('chin_tucks')
    expect(prog.focus).toEqual(expect.arrayContaining(['hip_flexors', 'quads', 'neck', 'chest']))
  })

  it('limitations and pregnancy shape the stretch, yoga and balance parts too', () => {
    const week: FitnessSettings['week'] = [['stretch'], ['yoga'], ['balance'], [], [], [], []]
    const floor = buildProgram(fit({ layout: 'custom', week, limitations: ['floor'] }), person())
    for (const s of floor.sessions) for (const x of s.blocks.flatMap((b) => b.items)) {
      expect(x.exercise.stress ?? [], x.exercise.id).not.toContain('floor')
      expect(x.exercise.stress ?? [], x.exercise.id).not.toContain('kneeling')
    }
    const steady = buildProgram(fit({ layout: 'custom', week, limitations: ['balance'] }), person())
    const drills = steady.sessions.flatMap((s) => s.blocks).filter((b) => b.kind === 'balance').flatMap((b) => b.items)
    expect(drills.length).toBeGreaterThan(0)
    for (const x of drills) {
      expect(x.exercise.support, x.exercise.id).toBe(true)
      expect(x.note).toMatch(/counter/)
    }
    const pregnant = buildProgram(fit({ layout: 'custom', week }), person([], { meds: { ...defaultState().profile.meds, pregnant: true } }))
    for (const s of pregnant.sessions) for (const x of s.blocks.flatMap((b) => b.items)) {
      expect(x.exercise.supine, x.exercise.id).toBeFalsy()
      expect(x.exercise.stress ?? [], x.exercise.id).not.toContain('prone')
    }
  })

  it('applies your changes to single days', () => {
    const base = buildProgram(fit({ days: 3, access: 'gym' }), person())
    const gone = base.sessions[0].exercises[1].exercise.id
    const prog = buildProgram(fit({ days: 3, access: 'gym', dayEdits: { 0: { remove: [gone], add: ['hammer_curl', 'down_dog'] } } }), person())
    const monday = prog.sessions[0]
    expect(items(monday)).not.toContain(gone)
    expect(monday.exercises.find((x) => x.exercise.id === 'hammer_curl')!.added).toBe(true)
    expect(monday.blocks.flatMap((b) => b.items).some((x) => x.exercise.id === 'down_dog' && x.added)).toBe(true)
    expect(items(prog.sessions[1])).not.toContain('down_dog')
  })

  it('swaps work for stretches and poses too', () => {
    const f = fit({ extraDays: { stretch: 1 }, stretchRegions: ['hip_flexors'] })
    const first = buildProgram(f, person()).sessions.flatMap((s) => s.blocks).find((b) => b.kind === 'stretch')!.items[0].exercise
    const alt = alternativesFor(first, f, person())[0]
    expect(alt.regions).toContain('hip_flexors')
    const swapped = buildProgram(fit({ ...f, swaps: { [first.id]: alt.id } }), person()).sessions.flatMap((s) => s.blocks).find((b) => b.kind === 'stretch')!.items[0]
    expect(swapped.exercise.id).toBe(alt.id)
    expect(swapped.swappedFrom).toBe(first.id)
  })

  it('counts lifting days, not extra sessions, for the activity level', () => {
    expect(activityFor(fit({ days: 3, sessionMin: 45, extraDays: { yoga: 3 } }))).toBe('light')
    expect(activityFor(fit({ layout: 'custom', week: [['full'], ['full'], ['full'], ['full'], [], ['yoga'], []] }))).toBe('moderate')
  })
})

describe('what a swap changes', () => {
  const ex = (id: string) => EXERCISES.find((e) => e.id === id)!
  it('explains stretch-position loading, equipment and joint stress, with sources', async () => {
    const { compareExercises } = await import('./compare')
    const tri = compareExercises(ex('pressdown'), ex('overhead_ext'))
    expect(tri.summary).toMatch(/Same main muscle/)
    expect(tri.points.some((p) => p.tone === 'gain' && p.claim?.sources.includes('pm_35819335'))).toBe(true)
    expect(tri.points.some((p) => p.tone === 'lose' && /arms overhead/.test(p.text))).toBe(true)
    const chest = compareExercises(ex('bench'), ex('machine_press'))
    expect(chest.points.some((p) => p.claim?.sources.includes('pm_37582807'))).toBe(true)
    expect(chest.points.some((p) => /lying on your back/.test(p.text))).toBe(true)
    const legs = compareExercises(ex('squat'), ex('leg_ext'))
    expect(legs.points.some((p) => /isolation/i.test(p.text))).toBe(true)
    expect(legs.points.some((p) => p.tone === 'gain' && /heavy load through the spine/.test(p.text))).toBe(true)
    const stretch = compareExercises(ex('hip_flexor_stretch'), ex('low_lunge'))
    expect(stretch.claim?.sources).toContain('konrad_stretch')
    expect(stretch.points.some((p) => /yoga pose/.test(p.text))).toBe(true)
    // Every claim in an explanation cites real sources.
    for (const c of [tri, chest, legs, stretch]) for (const p of c.points) for (const s of p.claim?.sources ?? []) expect(SOURCES[s], s).toBeDefined()
  })

  it('every posture goal and day-type claim cites real sources, and every option exists', async () => {
    const { POSTURE_GOALS, DAY_TYPE_CLAIMS } = await import('../data/mobility')
    const claims = [...POSTURE_GOALS.flatMap((g) => g.claims), ...Object.values(DAY_TYPE_CLAIMS).flat()]
    for (const c of claims) for (const s of c.sources) expect(SOURCES[s], `${c.text.slice(0, 30)}: ${s}`).toBeDefined()
    for (const g of POSTURE_GOALS) for (const w of g.strengthen) for (const id of w.options) expect(EXERCISES.some((e) => e.id === id), `${g.id}: ${id}`).toBe(true)
  })
})
