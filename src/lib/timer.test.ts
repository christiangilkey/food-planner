import { beforeEach, describe, expect, it } from 'vitest'
import { clock, elapsed, getTimer, parseRest, remaining, restAdd, restReset, restStart, restToggle, watchLap, watchReset, watchToggle } from './timer'

describe('timer helpers', () => {
  it('reads the low end of an exercise’s rest time', () => {
    expect(parseRest('2–3 min')).toBe(120)
    expect(parseRest('1–2 min')).toBe(60)
    expect(parseRest('3–5 min')).toBe(180)
    expect(parseRest('2 min')).toBe(120)
    expect(parseRest('90 s')).toBe(90)
    expect(parseRest('as needed')).toBeNull()
  })

  it('formats times like a clock', () => {
    expect(clock(0)).toBe('0:00')
    expect(clock(75_400)).toBe('1:15')
    expect(clock(3_723_000)).toBe('1:02:03')
  })
})

describe('stopwatch', () => {
  beforeEach(() => { watchReset() })
  it('counts across pauses and records laps', () => {
    watchToggle(1_000)
    expect(elapsed(getTimer().watch, 6_000)).toBe(5_000)
    watchLap(4_000)
    watchToggle(6_000) // pause at 5 s
    expect(elapsed(getTimer().watch, 60_000)).toBe(5_000)
    watchToggle(10_000) // resume
    expect(elapsed(getTimer().watch, 12_000)).toBe(7_000)
    expect(getTimer().watch.laps).toEqual([3_000])
  })
})

describe('rest timer', () => {
  beforeEach(() => { restStart(120, 0); restToggle(0); restReset() })
  it('counts down, pauses, resumes and adds time', () => {
    restStart(90, 0)
    expect(remaining(getTimer().rest, 30_000)).toBe(60_000)
    restToggle(30_000) // pause with 60 s left
    expect(remaining(getTimer().rest, 99_000)).toBe(60_000)
    restToggle(100_000) // resume
    expect(remaining(getTimer().rest, 110_000)).toBe(50_000)
    restAdd(15, 110_000)
    expect(remaining(getTimer().rest, 110_000)).toBe(65_000)
    restToggle(110_000)
  })
  it('never shows less than zero or more than the chosen time', () => {
    restStart(60, 0)
    expect(remaining(getTimer().rest, 120_000)).toBe(0)
    expect(remaining(getTimer().rest, -5_000)).toBe(60_000)
    restToggle(0)
  })
})
