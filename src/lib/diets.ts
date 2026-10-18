import type { Diet, DietCaution } from '../data/diets'
import type { Profile } from '../types'
import { activeTriggers } from './supplements'

/** Cautions for this person: their own (condition/medication-specific) ones, and the general ones. */
export function dietCautions(d: Diet, p: Profile): { personal: DietCaution[]; general: DietCaution[] } {
  const triggers = activeTriggers(p)
  return {
    personal: d.cautions.filter((c) => c.when?.some((w) => triggers.has(w))),
    general: d.cautions.filter((c) => !c.when),
  }
}
