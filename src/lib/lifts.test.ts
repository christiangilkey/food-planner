import { describe, expect, it } from 'vitest'
import { EXERCISE_BY_ID } from '../data/training'
import { best, convert, history, inUnit, lastBefore, logKind, nextHint, rangeTop, saveEntry, setText, today } from './lifts'
import { importState, exportState, defaultState } from './store'
import type { LiftEntry } from '../types'

const bench = EXERCISE_BY_ID.bench
const lateral = EXERCISE_BY_ID.lateral
const e = (date: string, sets: LiftEntry['sets'], unit: LiftEntry['unit'] = 'lb', exercise = 'bench'): LiftEntry => ({ date, exercise, unit, sets })

describe('what each exercise logs', () => {
  it('weights for loaded lifts, reps for bodyweight and bands, seconds for holds', () => {
    expect(logKind(bench)).toBe('weight')
    expect(logKind(EXERCISE_BY_ID.pulldown)).toBe('weight')
    expect(logKind(EXERCISE_BY_ID.pushup)).toBe('reps')
    expect(logKind(EXERCISE_BY_ID.band_row)).toBe('reps')
    expect(logKind(EXERCISE_BY_ID.plank)).toBe('hold')
    expect(logKind(EXERCISE_BY_ID.wall_sit)).toBe('hold')
  })
})

describe('saving and reading the log', () => {
  it('keeps one entry per exercise per day and drops empty ones', () => {
    let log = saveEntry([], e('2026-11-02', [{ weight: 135, reps: 10 }]))
    log = saveEntry(log, e('2026-11-02', [{ weight: 135, reps: 10 }, { weight: 135, reps: 9 }, {}]))
    expect(log).toHaveLength(1)
    expect(log[0].sets).toHaveLength(2)
    expect(saveEntry(log, e('2026-11-02', [{}, {}]))).toEqual([])
  })
  it('finds last time and the history in date order', () => {
    const log = [e('2026-11-05', [{ weight: 140, reps: 8 }]), e('2026-11-02', [{ weight: 135, reps: 10 }]), e('2026-11-03', [{ reps: 12 }], 'lb', 'pushup')]
    expect(history(log, 'bench').map((x) => x.date)).toEqual(['2026-11-02', '2026-11-05'])
    expect(lastBefore(log, 'bench', '2026-11-05')?.date).toBe('2026-11-02')
    expect(lastBefore(log, 'bench', '2026-11-02')).toBeUndefined()
  })
  it('formats today in local time', () => {
    expect(today(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('units', () => {
  it('converts to the nearest half unit', () => {
    expect(convert(100, 'kg', 'lb')).toBe(220.5)
    expect(convert(135, 'lb', 'kg')).toBe(61)
    expect(convert(20, 'kg', 'kg')).toBe(20)
  })
  it('shows an old entry in the current unit', () => {
    expect(inUnit(e('2026-11-02', [{ weight: 60, reps: 8 }], 'kg'), 'lb').sets[0]).toEqual({ weight: 132.5, reps: 8 })
  })
})

describe('the next-weight hint', () => {
  it('adds weight when every set hit the top of the range', () => {
    const last = e('2026-11-02', [{ weight: 135, reps: 10 }, { weight: 135, reps: 10 }])
    expect(nextHint(last, bench, '6–10', 'lb')).toMatchObject({ weight: 140 })
    expect(nextHint(last, bench, '6–10', 'kg')).toMatchObject({ weight: 63.5 }) // 61 kg + 2.5
  })
  it('uses smaller steps for isolation lifts', () => {
    const last = e('2026-11-02', [{ weight: 15, reps: 15 }, { weight: 15, reps: 15 }], 'lb', 'lateral')
    expect(nextHint(last, lateral, '10–15', 'lb')?.weight).toBe(17.5)
  })
  it('holds the weight until every set reaches the top', () => {
    const last = e('2026-11-02', [{ weight: 135, reps: 10 }, { weight: 135, reps: 8 }])
    const h = nextHint(last, bench, '6–10', 'lb')
    expect(h?.weight).toBe(135)
    expect(h?.text).toMatch(/aim for 10 reps/)
  })
  it('says nothing without a last time', () => {
    expect(nextHint(undefined, bench, '6–10', 'lb')).toBeNull()
  })
})

describe('progress and text', () => {
  it('charts the heaviest set, most reps or longest hold', () => {
    expect(best(e('d', [{ weight: 135, reps: 10 }, { weight: 145, reps: 6 }]), 'weight', 'lb')).toBe(145)
    expect(best(e('d', [{ reps: 12 }, { reps: 15 }]), 'reps', 'lb')).toBe(15)
    expect(best(e('d', [{ sec: 45 }]), 'hold', 'lb')).toBe(45)
  })
  it('reads range tops and writes sets', () => {
    expect(rangeTop('6–10')).toBe(10)
    expect(rangeTop('30–60 s hold')).toBe(60)
    expect(rangeTop('2 min hold')).toBe(120)
    expect(setText({ weight: 62.5, reps: 8 }, 'weight', 'kg')).toBe('62.5 × 8')
    expect(setText({ sec: 40 }, 'hold', 'lb')).toBe('40 s')
  })
})

describe('backups', () => {
  it('keep the lift log and the unit, and older backups start with an empty log', () => {
    const s = defaultState()
    s.liftLog = [e('2026-11-02', [{ weight: 135, reps: 10 }])]
    s.fitness = { ...s.fitness, weightUnit: 'kg' }
    const back = importState(exportState(s))
    expect(back.liftLog).toEqual(s.liftLog)
    expect(back.fitness.weightUnit).toBe('kg')
    const old = JSON.parse(exportState(defaultState()))
    delete old.liftLog
    expect(importState(JSON.stringify(old)).liftLog).toEqual([])
  })
})
