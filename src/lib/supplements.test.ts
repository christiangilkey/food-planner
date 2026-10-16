import { describe, expect, it } from 'vitest'
import { CONDITIONS } from '../data/conditions'
import { PEPTIDES } from '../data/peptides'
import { SOURCES } from '../data/sources'
import { GOALS, NOT_RECOMMENDED, SUPPLEMENTS, type Trigger } from '../data/supplements'
import { analyzeWeek } from './analysis'
import { avoidedFoods } from './conditions'
import { generatePlan } from './planner'
import { defaultState } from './store'
import { activeTriggers, assessSupplement, recommendedSupplements, relevantPeptides } from './supplements'
import type { AppState, MedFlags } from '../types'

const ids = new Set(Object.keys(SOURCES))
const sourced = (list: string[], where: string) => {
  expect(list.length, where).toBeGreaterThan(0)
  for (const id of list) expect(ids.has(id), `${where}: ${id}`).toBe(true)
}

function person(patch: Partial<AppState['profile']> = {}, meds: Partial<MedFlags> = {}): AppState {
  const s = defaultState()
  s.profile = { ...s.profile, ...patch, meds: { ...s.profile.meds, ...meds } }
  s.plan = generatePlan(s, 2)
  return s
}

const MED_KEYS: (keyof MedFlags)[] = ['bloodThinner', 'ssri', 'thyroid', 'diabetesMeds', 'bpMeds', 'pregnant']

describe('supplement and peptide data', () => {
  it('every dose, use, caution and claim is sourced', () => {
    for (const s of SUPPLEMENTS) {
      sourced(s.dose.sources, `${s.id} dose`)
      s.uses.forEach((u, i) => sourced(u.sources, `${s.id} use ${i}`))
      s.cautions.forEach((c, i) => sourced(c.sources, `${s.id} caution ${i}`))
      s.doesntHelp?.forEach((d, i) => sourced(d.sources, `${s.id} doesntHelp ${i}`))
    }
    NOT_RECOMMENDED.forEach((n) => sourced(n.sources, n.id))
    for (const x of PEPTIDES) {
      sourced(x.sources, x.id)
      x.cautions.forEach((c, i) => sourced(c.sources, `${x.id} caution ${i}`))
    }
  })

  it('research peptides are never presented as approved or with strong evidence, and carry the FDA warning', () => {
    for (const x of PEPTIDES.filter((p) => p.status === 'research')) {
      expect(x.humanEvidence, x.id).not.toBe('strong')
      expect(x.sources, x.id).toContain('fda_cat2')
      // No dosing for unapproved peptides.
      expect(/\b\d+\s?(mg|mcg|µg|iu|units)\b/i.test(`${x.usedFor} ${x.evidence} ${x.risks}`), x.id).toBe(false)
    }
  })
})

describe('interaction safety', () => {
  // Every trigger, alone: nothing recommended may carry a block for it.
  const triggers: Trigger[] = [...CONDITIONS.map((c) => c.id), 'maoi', 'stimulant', ...MED_KEYS]
  for (const t of triggers) {
    it(`no blocked supplement is recommended: ${t}`, () => {
      const isMed = (MED_KEYS as string[]).includes(t)
      const s = person({
        conditions: isMed || t === 'maoi' || t === 'stimulant' ? ['depression', 'migraine', 'anxiety', 't2d', 'cholesterol', 'menopause'] : [t as never, 'depression', 'migraine', 'anxiety'],
        maoi: t === 'maoi', stimulantMeds: t === 'stimulant', sex: 'female', age: 52,
      }, isMed ? { [t]: true } : {})
      expect(activeTriggers(s.profile).has(t)).toBe(true)
      const recs = recommendedSupplements(s.profile, analyzeWeek(s).reports)
      for (const r of recs) {
        const blocked = r.supplement.cautions.filter((c) => c.block && c.when?.includes(t))
        expect(blocked.map((b) => b.text), `${t} → ${r.supplement.id}`).toEqual([])
      }
      for (const x of relevantPeptides(s.profile)) {
        expect(x.cautions.some((c) => c.block && c.when?.includes(t)), `${t} → ${x.id}`).toBe(false)
      }
    })
  }

  it('specific dangerous combinations are blocked', () => {
    const sjw = SUPPLEMENTS.find((s) => s.id === 'st_johns_wort')!
    for (const p of [person({ conditions: ['depression'] }, { ssri: true }), person({ conditions: ['depression'], maoi: true }), person({}, { bloodThinner: true })]) {
      expect(assessSupplement(sjw, p.profile).blocks.length).toBeGreaterThan(0)
    }
    const ckd = person({ conditions: ['ckd', 'migraine'] })
    const recIds = recommendedSupplements(ckd.profile, analyzeWeek(ckd).reports).map((r) => r.supplement.id)
    for (const id of ['creatine', 'magnesium', 'protein_powder']) expect(recIds).not.toContain(id)
    const preg = person({ conditions: ['migraine', 'anxiety'] }, { pregnant: true })
    const pregIds = recommendedSupplements(preg.profile, analyzeWeek(preg).reports).map((r) => r.supplement.id)
    for (const id of ['feverfew', 'ashwagandha']) expect(pregIds).not.toContain(id)
    expect(relevantPeptides(person({ conditions: ['t2d'] }, { pregnant: true }).profile).map((x) => x.id)).not.toContain('semaglutide')
  })

  it('setting MAOI removes tyramine foods even without the depression condition', () => {
    const avoided = avoidedFoods(person({ conditions: [], maoi: true }).profile)
    for (const f of ['cheddar', 'kimchi', 'soy_sauce', 'jerky']) expect(avoided.has(f)).toBe(true)
  })

  it('recommendations follow conditions and gaps', () => {
    const mig = person({ conditions: ['migraine'] })
    const ids = recommendedSupplements(mig.profile, analyzeWeek(mig).reports).map((r) => r.supplement.id)
    for (const id of ['magnesium', 'riboflavin', 'feverfew']) expect(ids).toContain(id)
    expect(relevantPeptides(person({ conditions: ['t2d'] }).profile).map((x) => x.id)).toContain('semaglutide')
    expect(relevantPeptides(person({ conditions: [] }).profile)).toEqual([])
  })
})

describe('brain & body options', () => {
  it('every area has supplement options, including annotated low-evidence ones somewhere', () => {
    const goalIds = new Set(GOALS.map((g) => g.id))
    for (const s of SUPPLEMENTS) for (const u of s.uses) expect(goalIds.has(u.goal), `${s.id}: ${u.goal}`).toBe(true)
    const byGoal = (g: string) => SUPPLEMENTS.filter((s) => s.uses.some((u) => u.goal === g))
    for (const g of ['memory', 'focus', 'mood', 'stress', 'immunity', 'energy', 'sleep', 'bones', 'heart']) expect(byGoal(g).length, g).toBeGreaterThan(0)
    expect(SUPPLEMENTS.some((s) => s.uses.some((u) => u.evidence === 'limited'))).toBe(true)
  })
})
