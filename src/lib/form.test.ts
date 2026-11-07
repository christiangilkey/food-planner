import { describe, expect, it } from 'vitest'
import { FORM, FORM_RULES, STRETCHES } from '../data/form'
import { SOURCES } from '../data/sources'
import { EXERCISES } from '../data/training'

describe('exercise form guides', () => {
  it('every exercise in the app has a full guide', () => {
    for (const e of EXERCISES) {
      const g = FORM[e.id]
      expect(g, e.id).toBeDefined()
      expect(g.setup.length, `${e.id} setup`).toBeGreaterThanOrEqual(1)
      expect(g.execution.length, `${e.id} execution`).toBeGreaterThanOrEqual(2)
      expect(g.mistakes.length, `${e.id} mistakes`).toBeGreaterThanOrEqual(2)
      expect(g.breathing.length, `${e.id} breathing`).toBeGreaterThan(5)
      expect(g.easier && g.harder, `${e.id} variations`).toBeTruthy()
      expect(g.stretches.length, `${e.id} stretches`).toBeGreaterThanOrEqual(1)
    }
    // No guides for exercises the app doesn't have.
    for (const id of Object.keys(FORM)) expect(EXERCISES.some((e) => e.id === id), id).toBe(true)
  })

  it('every stretch a guide points to exists, and every stretch is used', () => {
    const used = new Set(Object.values(FORM).flatMap((g) => g.stretches))
    for (const id of used) expect(STRETCHES[id], id).toBeDefined()
    for (const id of Object.keys(STRETCHES)) expect(used.has(id), `${id} unused`).toBe(true)
  })

  it('every source behind a safety note, stretch or rule exists', () => {
    const refs = [
      ...Object.values(FORM).flatMap((g) => g.safety?.sources ?? []),
      ...Object.values(STRETCHES).flatMap((s) => s.sources),
      ...FORM_RULES.flatMap((r) => r.sources),
    ]
    for (const id of refs) expect(SOURCES[id], id).toBeDefined()
    // Safety notes are only shown when there is evidence behind them.
    for (const [id, g] of Object.entries(FORM)) if (g.safety) expect(g.safety.sources.length, id).toBeGreaterThan(0)
    // Rules other than coaching convention cite something.
    for (const r of FORM_RULES) if (r.evidence !== 'convention') expect(r.sources.length, r.id).toBeGreaterThan(0)
  })

  it('has the rules the screens rely on', () => {
    for (const id of ['warmup_ramp', 'stretch_weekly', 'stretch_pre_short', 'breath_avoid_hold']) {
      expect(FORM_RULES.some((r) => r.id === id), id).toBe(true)
    }
  })

  it('corrects the old form myths in the guides themselves', () => {
    expect(FORM.incline_db.setup.join(' ')).toMatch(/30°/)
    expect(FORM.pulldown.execution.join(' ')).not.toMatch(/behind (your|the) (neck|head)/i)
    const squat = [...FORM.squat.setup, ...FORM.squat.execution, ...FORM.squat.mistakes].join(' ')
    expect(squat).not.toMatch(/knees? (must|should) (not|never) (pass|go past)/i)
  })
})
