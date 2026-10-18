import { afterEach, describe, expect, it, vi } from 'vitest'
import { SOURCES } from '../data/sources'
import type { ConditionId, Profile, SleepEntry } from '../types'
import { buildTaskLists, type TaskListDraft } from './googleTasks'
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

  type Call = { name: string; args: Record<string, any>; auth: string }
  /** Fake Onyx: answers magic_add with `reply` (or an unknown-tool error) and everything else with an id. */
  const fakeOnyx = (reply: (args: any) => unknown, hasMagic = true) => {
    const calls: Call[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body))
      calls.push({ name: body.params.name, args: body.params.arguments, auth: (init.headers as Record<string, string>).Authorization })
      if (body.params.name === 'magic_add' && !hasMagic) return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: -32602, message: 'Unknown tool: magic_add' } }), { status: 200 })
      const result = body.params.name === 'magic_add' ? reply(body.params.arguments) : { id: 'x' }
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } }), { status: 200 })
    }))
    return calls
  }
  const cfg = { url: 'http://127.0.0.1:4747/', token: 'abc' }
  const week = (): TaskListDraft[] => [
    { title: 'Meals', tag: 'meals', tasks: [
      { title: 'Mon 7:30 am · Breakfast: Oats', due: '2026-10-19', at: 450, minutes: 20 },
      { title: 'Mon 6:00 pm · Dinner: Lentil soup', due: '2026-10-19', at: 1080, minutes: 45 },
      { title: 'Tue 7:30 am · Breakfast: Eggs', due: '2026-10-20', at: 450, minutes: 15 },
    ] },
    { title: 'Groceries · Oct 19', tag: 'groceries', onyx: 'bundle', tasks: [{ title: 'Eggs: 1 dozen', notes: 'Dairy & Eggs', due: '2026-10-19' }, { title: 'Oats: 42 oz', due: '2026-10-19' }] },
    { title: 'Sleep schedule', tag: 'sleep', onyx: 'fixed', tasks: [{ title: 'Mon 11:00 pm · Lights out', due: '2026-10-19', at: 1380, minutes: 480 }] },
  ]

  it('hands meals to Magic add one day per call, bundles groceries, keeps sleep as an exact block', async () => {
    const calls = fakeOnyx((a) => ({ mode: 'review', date: a.date, queued: a.items }))
    const r = await exportToOnyx(cfg, week())
    expect(calls.map((c) => c.name)).toEqual(['magic_add', 'magic_add', 'create_time_block'])
    expect(calls[0].auth).toBe('Bearer abc')
    expect(calls[0].args).toMatchObject({ date: '2026-10-19', source: 'food-planner' })
    const [oats, soup, shopping] = calls[0].args.items
    expect(oats).toMatchObject({ title: 'Breakfast: Oats', minutes: 20, preferred: '07:30', tags: ['food-planner', 'meals'] })
    expect(soup.preferred).toBe('18:00')
    expect(shopping).toMatchObject({ title: 'Grocery shopping', tags: ['food-planner', 'groceries'] })
    expect(shopping.notes).toMatch(/☐ Eggs: 1 dozen \(Dairy & Eggs\)\n☐ Oats: 42 oz/)
    expect(calls[1].args.date).toBe('2026-10-20')
    expect(calls[2].args).toMatchObject({ title: 'Lights out', start: '2026-10-19T23:00', end: '2026-10-20T07:00', tags: ['food-planner', 'sleep'] })
    expect(r).toEqual({ sent: 5, queued: 4, placed: 1, unplaced: [], legacy: false })
  })

  it('gives each item a stable id, so sending again updates instead of duplicating', async () => {
    const first = fakeOnyx((a) => ({ mode: 'review', queued: a.items }))
    await exportToOnyx(cfg, week())
    const again = fakeOnyx((a) => ({ mode: 'review', queued: a.items }))
    await exportToOnyx(cfg, week())
    const ids = (cs: Call[]) => cs.filter((c) => c.name === 'magic_add').flatMap((c) => c.args.items.map((i: { id: string }) => i.id))
    expect(ids(again)).toEqual(ids(first))
    expect(new Set(ids(first)).size).toBe(ids(first).length)
  })

  it('splits days with more than 30 items, and reports what Magic add could not fit', async () => {
    const many: TaskListDraft[] = [{ title: 'Prep', tag: 'meal-prep', tasks: Array.from({ length: 35 }, (_, i) => ({ title: `Cook ${i}`, due: '2026-10-18', minutes: 30 })) }]
    const calls = fakeOnyx((a) => ({ mode: 'placed', placed: a.items.slice(1), unplaced: [{ title: a.items[0].title, reason: 'No free time left' }] }))
    const r = await exportToOnyx(cfg, many)
    expect(calls.map((c) => c.args.items.length)).toEqual([30, 5])
    expect(r.placed).toBe(33)
    expect(r.unplaced).toEqual([{ title: 'Cook 0', reason: 'No free time left' }, { title: 'Cook 30', reason: 'No free time left' }])
  })

  it('falls back to blocks and tasks on an Onyx without Magic add', async () => {
    const calls = fakeOnyx(() => ({}), false)
    const r = await exportToOnyx(cfg, week())
    expect(r.legacy).toBe(true)
    expect(calls.filter((c) => c.name === 'magic_add')).toHaveLength(1)
    expect(calls.find((c) => c.name === 'create_time_block' && c.args.title === 'Breakfast: Oats')?.args).toMatchObject({ start: '2026-10-19T07:30', end: '2026-10-19T07:50' })
    expect(calls.find((c) => c.name === 'create_task')?.args).toMatchObject({ title: 'Grocery shopping', due: '2026-10-19' })
    expect(r.sent).toBe(5)
  })

  it('explains a wrong token and a missing token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })))
    const list = [{ title: 'x', tasks: [{ title: 'a' }] }]
    await expect(exportToOnyx({ url: 'http://127.0.0.1:4747', token: 'bad' }, list)).rejects.toThrow(/refused the token/)
    await expect(exportToOnyx({ url: 'http://127.0.0.1:4747', token: ' ' }, list)).rejects.toThrow(/Paste the token/)
  })
})

describe('sleep and looks', () => {
  it('short sleep shows the appearance effect, and the if-then habit helps', () => {
    const p = profile({}, ['looks' as ConditionId])
    const list = sleepImpacts(analyzeSleep(nights(7, '01:00', '06:30'), p, TODAY), p)
    const looks = list.find((x) => x.id === 'looks')!
    expect(looks.sources).toEqual(['axelsson', 'sundelin'])
    expect(looks.because).toMatch(/looks goal/)
    expect(list.some((x) => x.id === 'ifthen')).toBe(true)
    expect(sleepImpacts(analyzeSleep(nights(7, '23:00', '07:00'), p, TODAY), p).some((x) => x.id === 'looks')).toBe(false)
  })
})
