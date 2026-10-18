import { FOOD_TAGS, type DietTag } from '../data/diets'
import { FOOD_BY_ID } from '../data/foods'
import { METHODS } from '../data/methods'
import type { SourceId } from '../data/sources'
import type { Food, Nutrients, Profile, Recipe } from '../types'
import { hasCondition } from './conditions'

/**
 * The "Skin & looks" goal's food logic: glycemic load per meal (clear skin), how a meal is
 * cooked (AGEs), and a day's sodium–potassium balance (puffiness).
 */

export const hasLooksGoal = (p: Profile) => hasCondition(p, 'looks')

/**
 * Glycemic index estimates, rounded from the 2021 international GI tables. Foods not listed use
 * their food group's typical value. These are estimates: GI varies by variety, ripeness and cooking.
 */
const GI: Record<string, number> = {
  white_rice: 73, brown_rice: 68, bread: 74, tortillas: 30, corn_tortillas: 46, pasta: 49, ww_pasta: 48, oats: 55,
  cereal: 74, rice_cakes: 82, popcorn: 65, couscous: 65, quinoa: 53, corn: 52, potato: 78, sweet_potato: 63,
  plantains: 55, tortilla_chips: 63, banana: 51, apple: 36, orange: 43, clementine: 43, grapes: 59, mango: 51,
  dates: 42, honey: 61, milk: 39, soy_milk: 34, greek_yogurt: 35, kefir: 35, black_beans: 30, chickpeas: 28,
  lentils: 32, pinto_beans: 39, kidney_beans: 24, peas: 51, carrots: 39, beets: 64, pumpkin: 75, squash: 51,
  dark_chocolate: 23, marinara: 30,
}
const GROUP_GI: [Food['groups'][number], number][] = [
  ['rice', 72], ['refined_grain', 70], ['whole_grain', 55], ['fruit', 45], ['berries', 40], ['dairy', 37], ['legumes', 30],
]
export const GI_SOURCES: SourceId[] = ['atkinson_gi']

function giOf(f: Food): number {
  if (GI[f.id] !== undefined) return GI[f.id]
  for (const [g, gi] of GROUP_GI) if (f.groups.includes(g)) return gi
  return 50
}

/** Estimated glycemic load of one plan entry: net carbs × GI / 100, summed over ingredients. */
export function glycemicLoad(r: Recipe, portion = 1): number {
  let gl = 0
  for (const it of r.items) {
    const f = FOOD_BY_ID[it.food]
    if (!f) continue
    const g = (it.grams * portion) / r.servings
    const net = Math.max(0, f.n.carbs - f.n.fiber) * (g / 100)
    gl += (net * giOf(f)) / 100
  }
  return gl
}

/** A meal with a glycemic load of 20 or more counts as high in the GI tables. */
export const HIGH_GL = 20

export type CookingStyle = 'none' | 'moist' | 'dry' | 'mixed'

const DRY = /\b(fry|fried|frying|sear|seared|roast|roasted|grill|grilled|broil|bake|baked|air[- ]?fry|air fryer|toast|crisp|char|saut[eé]|brown|scramble)/i
// Microwaving is quick, moist cooking, which Uribarri lists among the ways to form fewer AGEs.
const MOIST = /\b(steam|steamed|boil|boiling|poach|poached|simmer|simmering|stew|slow cooker|slow-cook|pressure|braise|braised|microwave)/i
const HEAT = /\b(cook|cooked|heat|warm|melt)/i

const PROTEIN = /\b(eggs?|chicken|thighs?|beef|steak|sirloin|turkey|pork|bacon|fish|fillets?|salmon|trout|cod|tilapia|shrimp|mackerel|sardines?|tuna|patties|meat|meatballs?)\b/i

const DISH = /\b(soup|stew|chili|curry|sauce|bolognese)\b/i
const SIDE = /\b(rice|pasta|noodles|quinoa|couscous|oats|bread|toast|tortillas?|broccoli|vegetables?|veg|veggies|potato(es)?|zucchini|spinach|kale|beans|corn|peppers?|onions?|asparagus|brussels|sprouts|cauliflower|squash|plantains?|water)\b/i

const animal = (r: Recipe) => r.items.some((i) => ['meat', 'fish', 'egg'].some((t) => FOOD_TAGS[i.food]?.has(t as DietTag)))

/**
 * How a recipe is cooked, from its steps (or its equipment when it has none). Alternatives in
 * parentheses ("or bake at 425°F") are ignored. For meals with meat, fish or eggs, only the steps
 * that cook the protein count, since that's where AGEs form; boiling rice or microwaving broccoli
 * on the side doesn't change how the chicken was cooked.
 */
export function cookingStyle(r: Recipe): CookingStyle {
  const text = (METHODS[r.id] ?? []).join(' ').replace(/\([^)]*\)/g, ' ')
  const sentences = text.split(/(?<=[.!?])\s+/)
  // With meat, fish or eggs, a step counts if it names the protein (or a soup or stew), or
  // names no side dish; "Microwave the broccoli" says nothing about how the chicken was cooked.
  const counts = animal(r) ? (s: string) => PROTEIN.test(s) || DISH.test(s) || !SIDE.test(s) : () => true
  let dry = sentences.some((s) => DRY.test(s) && counts(s))
  let moist = sentences.some((s) => MOIST.test(s) && counts(s))
  if (!text.trim()) {
    dry = r.equipment.some((e) => e === 'oven' || e === 'airfryer' || e === 'skillet' || e === 'toaster' || e === 'sheetpan')
    moist = r.equipment.some((e) => e === 'slowcooker' || e === 'ricecooker' || e === 'pot')
  }
  if (dry && moist) return 'mixed'
  if (dry) return 'dry'
  if (moist) return 'moist'
  // Heated some other way ("cook the turkey") can't be judged, so it counts as neutral.
  return HEAT.test(text) ? 'mixed' : 'none'
}

/**
 * +1 for moist-heat or no-cook meals, −1 for dry high heat on meat, fish or eggs (where AGEs
 * form most), 0 otherwise: plant foods form few AGEs even when roasted.
 */
export function gentleness(r: Recipe): number {
  const s = cookingStyle(r)
  if (s === 'moist' || s === 'none') return 1
  if (s === 'dry' && animal(r)) return -1
  return 0
}

/** The recipe-sheet hint for the looks goal, if this meal is fried, grilled or roasted meat, fish or eggs. */
export function gentlerCookingTip(r: Recipe): string | null {
  if (cookingStyle(r) === 'mixed' || gentleness(r) >= 0) return null
  return 'For your skin goal: steaming, poaching or stewing the protein makes far fewer AGEs than frying, grilling or roasting. Shorter cooking and a lemon or vinegar marinade help too.'
}

export interface Puffiness {
  tone: 'good' | 'warn'
  text: string
  sources: SourceId[]
}

/**
 * A day's salt-and-water picture. Potassium advice is left out for kidney disease and
 * potassium-raising blood-pressure drugs, where it needs a doctor's guidance.
 */
export function puffiness(day: Pick<Nutrients, 'sodium' | 'potassium'>, p: Profile): Puffiness {
  const na = Math.round(day.sodium)
  const k = Math.round(day.potassium)
  const restrictK = hasCondition(p, 'ckd') || p.meds.bpMeds
  const sources: SourceId[] = restrictK ? ['nasem_sodium', 'aha_sodium'] : ['nasem_sodium', 'ods_potassium']
  if (na > 2300) return { tone: 'warn', sources, text: `Salty day: ${na} mg sodium, over the 2,300 mg limit. Expect some morning puffiness; swap a meal for a lower-sodium one.` }
  if (!restrictK && k < na) return { tone: 'warn', sources, text: `More sodium (${na} mg) than potassium (${k} mg). Potassium-rich beans, potatoes, greens or a banana help balance it.` }
  return { tone: 'good', sources, text: restrictK ? `${na} mg sodium: within limits.` : `Balanced: ${k} mg potassium, ${na} mg sodium.` }
}
