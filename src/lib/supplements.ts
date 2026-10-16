import { PEPTIDES, type Peptide } from '../data/peptides'
import { SUPPLEMENTS, type Caution, type Supplement, type Trigger, type Use } from '../data/supplements'
import type { Evidence, Profile } from '../types'
import type { NutrientReport } from './analysis'

const RANK: Record<Evidence, number> = { strong: 0, moderate: 1, emerging: 2, limited: 3 }

/** Everything about this person that can make a supplement unsafe. */
export function activeTriggers(p: Profile): Set<Trigger> {
  const t = new Set<Trigger>(p.conditions)
  if (p.maoi) t.add('maoi')
  if (p.stimulantMeds) t.add('stimulant')
  for (const [k, on] of Object.entries(p.meds) as [keyof Profile['meds'], boolean][]) if (on) t.add(k)
  return t
}

export interface Assessment {
  /** Cautions that make it unsafe for this person. */
  blocks: Caution[]
  /** Cautions that apply to them (or to everyone). */
  cautions: Caution[]
}

export function assess(cautions: Caution[], triggers: Set<Trigger>): Assessment {
  const applies = (c: Caution) => !c.when || c.when.some((w) => triggers.has(w))
  return {
    blocks: cautions.filter((c) => c.block && applies(c)),
    cautions: cautions.filter((c) => !c.block && applies(c)),
  }
}

export interface Recommendation {
  supplement: Supplement
  /** The uses that make it relevant to this person. */
  reasons: Use[]
  assessment: Assessment
}

/**
 * Supplements that match the person's conditions or this week's nutrient gaps, minus anything
 * unsafe for their conditions or medications. Strongest evidence first.
 */
export function recommendedSupplements(p: Profile, reports: NutrientReport[]): Recommendation[] {
  const triggers = activeTriggers(p)
  const short = new Set(reports.filter((r) => r.status !== 'ok').map((r) => r.info.key))
  const out: Recommendation[] = []
  for (const s of SUPPLEMENTS) {
    const assessment = assess(s.cautions, triggers)
    if (assessment.blocks.length) continue
    const reasons = s.uses.filter((u) => (u.conditions?.some((c) => p.conditions.includes(c))) || (u.nutrient && short.has(u.nutrient)))
    if (reasons.length) out.push({ supplement: s, reasons, assessment })
  }
  const best = (r: Recommendation) => Math.min(...r.reasons.map((u) => RANK[u.evidence]))
  return out.sort((a, b) => best(a) - best(b) || b.reasons.length - a.reasons.length)
}

export function assessSupplement(s: Supplement, p: Profile): Assessment {
  return assess(s.cautions, activeTriggers(p))
}

export function assessPeptide(x: Peptide, p: Profile): Assessment {
  return assess(x.cautions, activeTriggers(p))
}

/** Approved peptides that are evidence-based options for the person's conditions (to discuss with a clinician). */
export function relevantPeptides(p: Profile): Peptide[] {
  const triggers = activeTriggers(p)
  return PEPTIDES.filter((x) => x.status === 'approved' && x.conditions?.some((c) => p.conditions.includes(c)) && !assess(x.cautions, triggers).blocks.length)
}
