import { afterEach, describe, expect, it, vi } from 'vitest'
import { SOURCES } from '../data/sources'
import type { ConditionId, Profile, SleepEntry } from '../types'
import { buildTaskLists } from './googleTasks'
import { exportToOnyx, localStamp } from './onyx'
import { analyzeSleep, buildSleepTaskLists, midpoint, nightMinutes, scheduleAdvice, sleepImpacts, windDown } from './sleep'
import { defaultState } from './store'

const TODAY = new Date('2026-10-18T09:00')
const profile = (patch: Partial<Profile> = {}, conditions: ConditionId[] = []): Profile => ({ ...defaultState().profile, conditions, ...patch })
/** `n` nights ending this morning, each from `bed` to `wake`. */
const nights = (n: number, bed: string, wake: string): SleepEntry[] =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(TODAY)
    d.setDate(d.getDate() - i)
    return { date: d.toISOString().slice(0, 10), bed, wake }
  })

describe('sleep maths', () => {
  it('measures nights across midnight', () => {
    expect(nightMinutes({ bed: '23:00', wake: '07:00' })).toBe(480)
    expect(nightMinutes({ bed: '01:30', wake: '06:00' })).toBe(270)
    expect(nightMinutes({ bed: '22:00', wake: '22:00' })).toBe(1440)
    // 11pm–7am and 1am–9am: midpoints 3am and 5am, two hours apart on one line.
    expect(midpoint({ bed: '01:00', wake: '09:00' }) - midpoint({ bed: '23:00', wake: '07:00' })).toBe(120)
  })

  it('averages the last week and counts short nights', () => {
    const a = analyzeSleep(nights(7, '00:30', '06:30'), profile(), TODAY)
    expect(a.nights).toHaveLength(7)
    expect(a.avgMin).toBe(360)
    expect(a.short).toBe(7)
    expect(a.under6).toBe(0)
    expect(a.debtMin).toBe(7 * 60)
  })

  it('flags irregular sleep times', () => {
    const log = [...nights(3, '23:00', '07:00'), ...nights(6, '02:00', '10:00').slice(3)]
    expect(analyzeSleep(log, profile(), TODAY).irregular).toBe(true)
    expect(analyzeSleep(nights(7, '23:00', '07:00'), profile(), TODAY).irregular).toBe(false)
  })

  it('uses age-based targets', () => {
    expect(analyzeSleep([], profile({ age: 70 }), TODAY).target.max).toBe(8 * 60)
    expect(analyzeSleep([], profile({ age: 16 }), TODAY).target.min).toBe(8 * 60)
  })
})

describe('sleep impacts', () => {
  const ids = (p: Profile, log: SleepEntry[]) => sleepImpacts(analyzeSleep(log, p, TODAY), p).map((x) => x.id)

  it('every impact cites real sources', () => {
    const everyone = profile({ goal: 'lose', sex: 'male' }, ['adhd', 'depression', 't2d', 'hypertension', 'migraine', 'gerd', 'hashimotos'])
    for (const log of [nights(7, '01:00', '05:30'), nights(7, '23:00', '07:00'), nights(7, '21:00', '08:00'), []]) {
      for (const x of sleepImpacts(analyzeSleep(log, everyone, TODAY), everyone)) {
        expect(x.sources.length, x.id).toBeGreaterThan(0)
        for (const s of x.sources) expect(SOURCES[s], `${x.id}: ${s}`).toBeDefined()
      }
    }
    for (const s of windDown(everyone)) for (const id of s.sources) expect(SOURCES[id]).toBeDefined()
  })

  it('short sleep: hunger, focus, colds, and the goal-specific effect', () => {
    const lose = ids(profile({ goal: 'lose' }), nights(7, '01:00', '06:30'))
    expect(lose).toEqual(expect.arrayContaining(['hunger', 'focus', 'colds', 'goal_lose']))
    expect(ids(profile({ goal: 'gain' }), nights(7, '01:00', '06:30'))).toContain('goal_muscle')
  })

  it('good sleep: says so, and skips the warnings', () => {
    const list = ids(profile(), nights(7, '23:00', '07:00'))
    expect(list).toContain('on_target')
    expect(list).not.toContain('hunger')
  })

  it('conditions change what is shown', () => {
    const short = nights(7, '01:00', '05:30')
    expect(ids(profile({}, ['depression']), short)).toContain('mood')
    expect(ids(profile({}, ['t2d']), short)).toContain('diabetes')
    expect(ids(profile({}, ['hypertension']), short)).toContain('bp')
    expect(ids(profile({}, ['migraine']), short)).toContain('migraine')
    expect(ids(profile({}, ['hashimotos']), nights(7, '23:00', '07:00'))).toContain('thyroid')
    expect(ids(profile({}, []), short)).not.toContain('mood')
    // Most nights under 6 hours: point to CBT-I.
    expect(ids(profile(), short)).toContain('cbti')
  })
})

describe('sleep schedule and export', () => {
  it('builds the wind-down in order and warns about a short schedule', () => {
    const p = profile({ bedTime: '23:00', wakeTime: '07:00', caffeine: true })
    const steps = windDown(p)
    expect(steps.map((s) => s.label)).toEqual(['Caffeine cutoff', 'Last food of the day', 'Dim lights, screens away', 'Lights out', 'Wake up and get daylight'])
    expect(steps.find((s) => s.label === 'Lights out')!.minutes).toBe(480)
    expect(scheduleAdvice(analyzeSleep([], p, TODAY))).toBeNull()
    expect(scheduleAdvice(analyzeSleep([], profile({ bedTime: '00:30', wakeTime: '06:30' }), TODAY))).toMatch(/lights out by 11:00 pm/)
  })

  it('makes 7 nights of tasks, with waking dated the next morning', () => {
    const [list] = buildSleepTaskLists(profile({ bedTime: '23:00', wakeTime: '07:00', caffeine: false }), TODAY)
    expect(list.tag).toBe('sleep')
    expect(list.tasks).toHaveLength(7 * 4)
    const wake = list.tasks.filter((t) => t.title.includes('Wake up'))
    expect(wake[0].due).toBe('2026-10-19')
    expect(wake[0].at).toBe(7 * 60)
    expect(list.tasks[0].due).toBe('2026-10-18')
  })

  it('meal tasks carry their time and length for calendar blocks', () => {
    const s = defaultState()
    s.plan[0].breakfast = { recipe: 'overnight_oats', portion: 1 }
    const [meals] = buildTaskLists(s, { meals: true, shopping: false, prep: false })
    expect(meals.tag).toBe('meals')
    expect(meals.tasks[0].at).toBeTypeOf('number')
    expect(meals.tasks[0].minutes).toBeGreaterThanOrEqual(15)
  })
})

describe('Onyx export', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('formats local times, rolling past midnight', () => {
    expect(localStamp('2026-10-18', 7 * 60 + 30)).toBe('2026-10-18T07:30')
    expect(localStamp('2026-10-18', 1440 + 60)).toBe('2026-10-19T01:00')
  })

  it('sends timed items as blocks and the rest as tasks, tagged, with the token', async () => {
    const calls: { name: string; args: Record<string, unknown>; auth: string }[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body))
      calls.push({ name: body.params.name, args: body.params.arguments, auth: (init.headers as Record<string, string>).Authorization })
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: '{"id":"x"}' }] } }), { status: 200 })
    }))
    const n = await exportToOnyx({ url: 'http://127.0.0.1:4747/', token: 'abc' }, [
      { title: 'Meals', tag: 'meals', tasks: [{ title: 'Mon 7:30 am · Breakfast: Oats', due: '2026-10-19', at: 450, minutes: 20 }] },
      { title: 'Groceries', tag: 'groceries', tasks: [{ title: 'Eggs', due: '2026-10-19' }] },
    ])
    expect(n).toBe(2)
    expect(calls[0]).toMatchObject({ name: 'create_time_block', auth: 'Bearer abc', args: { title: 'Breakfast: Oats', start: '2026-10-19T07:30', end: '2026-10-19T07:50', tags: ['food-planner', 'meals'] } })
    expect(calls[1]).toMatchObject({ name: 'create_task', args: { title: 'Eggs', due: '2026-10-19', tags: ['food-planner', 'groceries'] } })
  })

  it('explains a wrong token and a missing token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })))
    const list = [{ title: 'x', tasks: [{ title: 'a' }] }]
    await expect(exportToOnyx({ url: 'http://127.0.0.1:4747', token: 'bad' }, list)).rejects.toThrow(/refused the token/)
    await expect(exportToOnyx({ url: 'http://127.0.0.1:4747', token: ' ' }, list)).rejects.toThrow(/Paste the token/)
  })
})
