import type { IconName } from '../components/Icon'
import type { DietId, Evidence } from '../types'
import type { Claim } from './conditions'
import type { SourceId } from './sources'
import type { Trigger } from './supplements'

/** What kind of food something is, for deciding which diets allow it. */
export type DietTag =
  | 'meat' | 'fish' | 'egg' | 'dairy' | 'honey' | 'grain' | 'legume' | 'soy' | 'peanut' | 'nut' | 'seed'
  | 'nightshade' | 'coffee_cocoa' | 'processed' | 'starchy' | 'sugary_fruit' | 'sweetener'

const TAGGED: Record<DietTag, string[]> = {
  meat: ['chicken_breast', 'chicken_thigh', 'rotisserie', 'ground_beef', 'ground_turkey', 'deli_turkey', 'jerky', 'pork_loin', 'sirloin', 'broth', 'bacon'],
  fish: ['salmon', 'shrimp', 'tuna', 'sardines', 'cod', 'tilapia', 'canned_salmon', 'trout', 'canned_mackerel'],
  egg: ['egg'],
  dairy: ['greek_yogurt', 'cottage_cheese', 'milk', 'cheddar', 'string_cheese', 'butter', 'protein_powder', 'feta', 'parmesan', 'kefir', 'goat_cheese', 'heavy_cream', 'cream_cheese', 'mozzarella'],
  honey: ['honey'],
  grain: ['oats', 'white_rice', 'brown_rice', 'pasta', 'bread', 'tortillas', 'cereal', 'rice_cakes', 'popcorn', 'quinoa', 'ww_pasta', 'corn_tortillas', 'corn', 'couscous', 'tortilla_chips'],
  legume: ['tofu', 'black_beans', 'chickpeas', 'lentils', 'edamame', 'peanut_butter', 'pinto_beans', 'kidney_beans', 'peas', 'hummus', 'soy_sauce', 'soy_milk', 'soy_yogurt', 'tempeh'],
  soy: ['tofu', 'edamame', 'soy_sauce', 'soy_milk', 'soy_yogurt', 'tempeh'],
  peanut: ['peanut_butter'],
  nut: ['almonds', 'walnuts', 'cashews', 'almond_milk', 'almond_flour', 'almond_butter', 'pecans', 'brazil_nuts'],
  seed: ['pumpkin_seeds', 'chia', 'sunflower_seeds', 'flaxseed', 'hemp_seeds', 'tahini', 'hummus'],
  nightshade: ['potato', 'bell_pepper', 'canned_tomatoes', 'salsa', 'tomato', 'marinara', 'stirfry_veg', 'kimchi'],
  coffee_cocoa: ['coffee', 'dark_chocolate'],
  processed: ['deli_turkey', 'jerky', 'cereal', 'tortilla_chips', 'protein_powder', 'dark_chocolate'],
  starchy: ['potato', 'sweet_potato', 'plantains', 'corn', 'squash', 'beets'],
  sugary_fruit: ['banana', 'apple', 'clementine', 'grapes', 'mango', 'dates', 'orange', 'pomegranate', 'grapefruit'],
  sweetener: ['honey', 'dates', 'coconut_aminos'],
}

export const FOOD_TAGS: Record<string, Set<DietTag>> = {}
for (const [tag, foods] of Object.entries(TAGGED) as [DietTag, string[]][]) {
  for (const f of foods) (FOOD_TAGS[f] ??= new Set()).add(tag)
}

export interface DietCaution {
  /** Shown only to people with one of these conditions, medications or diets; omitted = everyone. */
  when?: Trigger[]
  text: string
  evidence: Evidence
  sources: SourceId[]
}

export interface Diet {
  id: DietId
  label: string
  icon: IconName
  blurb: string
  /** Food kinds the diet leaves out. */
  excludes: DietTag[]
  /** Foods allowed despite an excluded tag (keto allows soy foods and peanut butter). */
  allows?: string[]
  /** Keto: net carbs (carbs minus fiber) per serving and per day. */
  netCarbs?: { perServing: number; perDay: number }
  evidence: Claim[]
  /** What to watch for, including how the diet interacts with conditions and medications. */
  cautions: DietCaution[]
}

export const DIETS: Diet[] = [
  {
    id: 'vegetarian', label: 'Vegetarian', icon: 'salad',
    blurb: 'No meat, poultry or fish. Eggs and dairy are in.',
    excludes: ['meat', 'fish'],
    evidence: [
      { text: 'Well-planned vegetarian diets are healthful and nutritionally adequate, and are linked to lower risk of heart disease, type 2 diabetes and some cancers.', evidence: 'strong', sources: ['melina'] },
    ],
    cautions: [
      { text: 'Iron from plants is absorbed less well. Pair beans, lentils and greens with vitamin C (peppers, citrus, berries).', evidence: 'strong', sources: ['melina', 'ods_iron'] },
      { text: 'Get B12 from dairy and eggs every day, or from fortified foods or a supplement.', evidence: 'strong', sources: ['melina', 'ods_b12'] },
      { when: ['menopause', 'pregnant'], text: 'Iron and calcium needs are higher at your stage; the Health tab tracks both.', evidence: 'strong', sources: ['ods_iron', 'ods_calcium'] },
    ],
  },
  {
    id: 'vegan', label: 'Vegan', icon: 'vegan',
    blurb: 'Plants only: no meat, fish, eggs, dairy or honey. Fortified soy milk, tofu and nutritional yeast cover the gaps.',
    excludes: ['meat', 'fish', 'egg', 'dairy', 'honey'],
    evidence: [
      { text: 'Well-planned vegan diets are appropriate at every life stage and are linked to lower risk of heart disease, type 2 diabetes and high blood pressure.', evidence: 'strong', sources: ['melina'] },
    ],
    cautions: [
      { text: 'Vegans need a reliable B12 source: fortified foods (nutritional yeast, soy milk) or a supplement. Plants don’t supply active B12, and deficiency can cause nerve damage.', evidence: 'strong', sources: ['melina', 'ods_b12'] },
      { text: 'Without fish, EPA and DHA omega-3s are very low. Eat flax, chia, hemp and walnuts, and consider algae oil.', evidence: 'moderate', sources: ['melina', 'ods_omega3'] },
      { text: 'Calcium and vitamin D come from calcium-set tofu, fortified soy milk and yogurt, and greens.', evidence: 'strong', sources: ['melina', 'ods_calcium'] },
      { when: ['ckd'], text: 'With kidney disease, potassium and phosphorus from beans, nuts and seeds need your renal team’s guidance.', evidence: 'strong', sources: ['kdoqi'] },
      { when: ['hashimotos', 'thyroid'], text: 'Soy can reduce levothyroxine absorption. Keep soy milk and tofu away from your morning dose; it doesn’t need to be avoided.', evidence: 'strong', sources: ['niddk_hashimoto'] },
    ],
  },
  {
    id: 'pescatarian', label: 'Pescatarian', icon: 'fish',
    blurb: 'Fish and seafood, eggs, dairy and plants. No meat or poultry.',
    excludes: ['meat'],
    evidence: [
      { text: 'Eating seafood, especially fatty fish, about twice a week is linked to lower risk of heart disease.', evidence: 'strong', sources: ['rimm'] },
      { text: 'Vegetarian-style diets, which pescatarian diets resemble, are linked to lower chronic-disease risk.', evidence: 'moderate', sources: ['melina'] },
    ],
    cautions: [
      { text: 'Choose lower-mercury fish (salmon, sardines, trout, shrimp, cod) most often. The plan caps tuna.', evidence: 'strong', sources: ['fda_fish'] },
      { when: ['pregnant'], text: 'In pregnancy, eat 2–3 servings a week of low-mercury fish and avoid high-mercury species.', evidence: 'strong', sources: ['fda_fish'] },
    ],
  },
  {
    id: 'keto', label: 'Keto', icon: 'flame',
    blurb: 'Very low carb (under 50 g net carbs a day), moderate protein, most calories from fat. No grains, beans, starchy vegetables, sweet fruit or sugar.',
    excludes: ['grain', 'legume', 'starchy', 'sugary_fruit', 'sweetener', 'processed'],
    allows: ['tofu', 'edamame', 'soy_milk', 'soy_yogurt', 'tempeh', 'soy_sauce', 'peanut_butter', 'dark_chocolate', 'protein_powder'],
    netCarbs: { perServing: 12, perDay: 50 },
    evidence: [
      { text: 'Very-low-carb ketogenic diets led to slightly more weight loss than low-fat diets after a year or more (about 1 kg), with lower triglycerides and higher HDL but also higher LDL.', evidence: 'moderate', sources: ['bueno_keto'] },
    ],
    cautions: [
      { text: 'LDL cholesterol can rise a lot on keto in some people. The plan uses olive oil, fish, nuts and avocado for fat; get your cholesterol checked after a few months.', evidence: 'moderate', sources: ['retterstol', 'bueno_keto'] },
      { when: ['cholesterol'], text: 'With high cholesterol, keto conflicts with the saturated-fat limit and raised LDL substantially in a trial. Discuss it with your doctor; the planner still enforces your saturated-fat cap.', evidence: 'moderate', sources: ['retterstol', 'acc_chol'] },
      { when: ['t1d', 't2d', 'diabetesMeds'], text: 'On insulin or a sulfonylurea, cutting carbs this far can cause lows. Your care team needs to adjust doses first.', evidence: 'strong', sources: ['evert', 'ada_6'] },
      { when: ['t1d', 't2d'], text: 'If you take an SGLT2 inhibitor (empagliflozin, dapagliflozin, canagliflozin), very-low-carb diets raise the risk of ketoacidosis. The ADA advises caution.', evidence: 'strong', sources: ['evert', 'patel_sglt2'] },
      { when: ['pregnant'], text: 'Very-low-carb diets are not recommended in pregnancy or while breastfeeding.', evidence: 'strong', sources: ['evert'] },
      { when: ['ckd'], text: 'Very-low-carb diets are not recommended with kidney disease.', evidence: 'strong', sources: ['evert'] },
      { text: 'Expect a few days of tiredness and headache while adapting. Drink enough water.', evidence: 'limited', sources: ['bueno_keto'] },
    ],
  },
  {
    id: 'paleo', label: 'Paleo', icon: 'beef',
    blurb: 'Meat, fish, eggs, vegetables, fruit, nuts and seeds. No grains, beans, dairy or processed food.',
    excludes: ['grain', 'legume', 'dairy', 'processed'],
    evidence: [
      { text: 'In short trials (up to 3 months), paleo diets improved waist size, triglycerides, blood pressure and fasting blood sugar more than control diets. Long-term evidence is lacking.', evidence: 'emerging', sources: ['manheimer'] },
    ],
    cautions: [
      { text: 'Without dairy, calcium is easy to miss. Sardines and canned salmon with bones, greens and almonds help.', evidence: 'strong', sources: ['ods_calcium'] },
      { text: 'Dropping whole grains and beans removes fiber sources linked to lower heart-disease risk. The plan makes it up with vegetables, fruit and nuts.', evidence: 'strong', sources: ['aune_wg', 'reynolds_carb'] },
      { when: ['cholesterol'], text: 'With high cholesterol, favor fish, poultry, olive oil and nuts over fatty red meat and bacon. The saturated-fat cap still applies.', evidence: 'strong', sources: ['sacks_fat'] },
      { when: ['menopause'], text: 'Calcium needs rise after menopause; check the Health tab and consider a supplement if food falls short.', evidence: 'strong', sources: ['nams_bone'] },
    ],
  },
  {
    id: 'aip', label: 'AIP (autoimmune protocol)', icon: 'leaf',
    blurb: 'A strict elimination diet used for Hashimoto’s and other autoimmune conditions: paleo, plus no eggs, nuts, seeds, nightshades (tomato, pepper, white potato), coffee or chocolate.',
    excludes: ['grain', 'legume', 'dairy', 'processed', 'egg', 'nut', 'seed', 'nightshade', 'coffee_cocoa'],
    evidence: [
      { text: 'In a small, uncontrolled study of 16 women with Hashimoto’s, AIP improved symptoms and quality of life but did not change thyroid hormone levels or antibodies.', evidence: 'limited', sources: ['abbott_aip'] },
      { text: 'In a small study of inflammatory bowel disease, most people reached remission on AIP; there was no control group.', evidence: 'limited', sources: ['konijeti_aip'] },
    ],
    cautions: [
      { text: 'AIP is meant to be temporary. In the studies, the strict phase lasted about 6 weeks, followed by reintroducing foods one at a time to find what you tolerate.', evidence: 'limited', sources: ['abbott_aip', 'konijeti_aip'] },
      { text: 'It cuts out many sources of calcium, fiber and protein. Work with a dietitian, and watch the Health tab for gaps.', evidence: 'strong', sources: ['ods_calcium'] },
      { when: ['t1d', 't2d', 'ckd'], text: 'Restrictive elimination diets need medical supervision with diabetes or kidney disease.', evidence: 'strong', sources: ['ada_5', 'kdoqi'] },
    ],
  },
]

export const DIET_BY_ID = Object.fromEntries(DIETS.map((d) => [d.id, d])) as Record<DietId, Diet>

/** Does this diet allow this food? */
export function dietAllowsFood(diet: Diet, food: string): boolean {
  if (diet.allows?.includes(food)) return true
  const tags = FOOD_TAGS[food]
  return !tags || !diet.excludes.some((t) => tags.has(t))
}
