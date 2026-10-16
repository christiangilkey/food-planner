import type { Domain, Evidence, FoodGroup } from '../types'
import type { SourceId } from './sources'

/**
 * How often to eat things over a week. Counts are standard servings (see Food.serving).
 * Where a guideline gives a direction but no number, the number is marked as an app convention.
 */
export interface RotationRule {
  id: string
  label: string
  /** A food counts if it belongs to any of these groups. */
  groups: FoodGroup[]
  min?: number
  max?: number
  evidence: Evidence
  sources: SourceId[]
  why: string
  /** Set when the exact number is this app's choice rather than a published figure. */
  convention?: string
  domains: Domain[]
  /** Example foods to add when short, by food id. */
  fixes?: string[]
}

export const ROTATION_RULES: RotationRule[] = [
  {
    id: 'seafood', label: 'Seafood', groups: ['seafood'], min: 2, evidence: 'strong', sources: ['fda_fish', 'rimm'],
    why: 'The FDA advises 2–3 servings of low-mercury fish a week. Seafood supplies omega-3s, B12, selenium and vitamin D, and is linked to lower heart disease risk.',
    domains: ['heart', 'mood', 'memory'], fixes: ['salmon', 'sardines', 'shrimp', 'tuna'],
  },
  {
    id: 'fatty_fish', label: 'Fatty fish', groups: ['fatty_fish'], min: 1, evidence: 'strong', sources: ['rimm'],
    why: 'The AHA advises 1–2 seafood meals a week, especially fatty fish. Salmon and sardines are the practical food sources of EPA and DHA.',
    domains: ['mood', 'focus', 'heart'], fixes: ['salmon', 'sardines'],
  },
  {
    id: 'tuna', label: 'Canned tuna (mercury)', groups: ['tuna'], max: 3, evidence: 'strong', sources: ['fda_fish'],
    why: 'Canned light tuna is an FDA "best choice" at 2–3 servings a week. Albacore (white) tuna is a "good choice": once a week.',
    domains: [],
  },
  {
    id: 'red_meat', label: 'Red meat', groups: ['red_meat'], max: 4, evidence: 'strong', sources: ['wcrf_meat', 'iarc'],
    why: 'WCRF advises no more than about 350–500 g cooked red meat a week; higher intakes are linked to colorectal cancer. Four of these servings is about 350 g cooked.',
    domains: ['heart'],
  },
  {
    id: 'processed_meat', label: 'Processed meat', groups: ['processed_meat'], max: 1, evidence: 'strong', sources: ['iarc', 'wcrf_meat'],
    why: 'IARC classifies processed meat as carcinogenic to humans; WCRF advises eating little, if any.',
    convention: 'Guidelines say "little, if any"; this app allows at most one serving a week.',
    domains: ['heart'],
  },
  {
    id: 'legumes', label: 'Beans, lentils & soy', groups: ['legumes'], min: 4, evidence: 'moderate', sources: ['afshin'],
    why: 'In pooled studies, each 4 servings a week of legumes was associated with about 14% lower heart disease risk.',
    domains: ['heart', 'energy'], fixes: ['lentils', 'black_beans', 'chickpeas', 'edamame', 'hummus'],
  },
  {
    id: 'nuts_seeds', label: 'Nuts & seeds', groups: ['nuts_seeds'], min: 5, evidence: 'moderate', sources: ['guasch', 'predimed'],
    why: 'Eating a 1-oz serving of nuts 5+ times a week was linked to lower heart disease risk, and adding nuts to a Mediterranean diet cut cardiovascular events in the PREDIMED trial.',
    domains: ['heart'], fixes: ['almonds', 'walnuts', 'pumpkin_seeds', 'chia'],
  },
  {
    id: 'leafy_greens', label: 'Leafy greens', groups: ['leafy_greens'], min: 6, evidence: 'emerging', sources: ['morris_greens'],
    why: 'In a prospective cohort, about one serving a day of leafy greens was linked to markedly slower cognitive decline.',
    convention: 'The study compared about 1 serving a day with rarely; 6 a week is this app’s rounding of that.',
    domains: ['memory', 'bones'], fixes: ['spinach'],
  },
  {
    id: 'cruciferous', label: 'Cruciferous veg', groups: ['cruciferous'], min: 3, evidence: 'emerging', sources: ['higdon'],
    why: 'Observational studies link cruciferous vegetables (broccoli, cabbage) with lower risk of some cancers.',
    convention: 'No official serving target exists; 3 a week is this app’s choice.',
    domains: ['immunity'], fixes: ['broccoli', 'kimchi'],
  },
  {
    id: 'vegetables', label: 'Vegetables, all kinds',
    groups: ['vegetables', 'leafy_greens', 'cruciferous', 'red_orange_veg'], min: 21, evidence: 'strong', sources: ['dga_2025', 'aune_fv'],
    why: 'The 2025–2030 Dietary Guidelines advise 3 servings of vegetables a day. Higher fruit and vegetable intake is linked to lower heart disease and mortality.',
    domains: ['heart', 'immunity', 'energy'], fixes: ['spinach', 'broccoli', 'bell_pepper', 'carrots', 'stirfry_veg'],
  },
  {
    id: 'fruit', label: 'Fruit', groups: ['fruit'], min: 14, evidence: 'strong', sources: ['dga_2025', 'aune_fv'],
    why: 'The 2025–2030 Dietary Guidelines advise 2 servings of fruit a day, as whole fruit rather than juice.',
    domains: ['immunity', 'heart'], fixes: ['berries', 'apple', 'banana', 'clementine'],
  },
  {
    id: 'berries', label: 'Berries', groups: ['berries'], min: 2, evidence: 'emerging', sources: ['devore'],
    why: 'In the Nurses’ Health Study, 2+ servings a week of strawberries and blueberries was linked to about 2.5 years slower cognitive aging.',
    domains: ['memory'], fixes: ['berries'],
  },
  {
    id: 'whole_grain', label: 'Whole grains', groups: ['whole_grain'], min: 14, evidence: 'strong', sources: ['dga_2025', 'aune_wg'],
    why: 'The 2025–2030 Dietary Guidelines advise 2–4 servings of whole grains a day and less refined carbohydrate. Whole grains are linked to lower heart disease and mortality.',
    domains: ['energy', 'heart'], fixes: ['oats', 'bread', 'brown_rice', 'popcorn'],
  },
  {
    id: 'rice', label: 'Rice (arsenic)', groups: ['rice'], max: 5, evidence: 'moderate', sources: ['fda_arsenic'],
    why: 'Rice takes up more inorganic arsenic than other grains. The FDA advises eating a variety of grains; cooking rice in extra water and draining it lowers arsenic.',
    convention: 'The FDA gives no number; the cap of 5 servings a week is this app’s way of enforcing variety.',
    domains: [],
  },
  {
    id: 'fermented', label: 'Fermented foods', groups: ['fermented'], min: 7, evidence: 'emerging', sources: ['wastyk'],
    why: 'In a Stanford trial, a diet high in fermented foods increased gut microbe diversity and lowered inflammation markers.',
    convention: 'The trial built up to about 6 servings a day; one a day is this app’s modest target.',
    domains: ['immunity'], fixes: ['greek_yogurt', 'kimchi', 'cheddar'],
  },
]

/** At least this many different plant species a week (American Gut Project, McDonald et al., 2018). */
export const PLANT_TARGET = 30
export const PLANT_SOURCES: SourceId[] = ['mcdonald']

/** Protein groups to rotate across during the week. */
export const PROTEIN_GROUPS: FoodGroup[] = ['seafood', 'poultry', 'red_meat', 'eggs', 'legumes', 'nuts_seeds', 'dairy']
export const PROTEIN_VARIETY_TARGET = 5
