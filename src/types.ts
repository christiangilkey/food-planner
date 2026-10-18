import type { DietTag } from './data/diets'
import type { Access, Experience, Muscle, TrainingGoal } from './data/training'

export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'very' | 'athlete'
export type Goal = 'lose' | 'maintain' | 'gain'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type ConditionId =
  | 'adhd'
  | 'anxiety'
  | 'depression'
  | 'migraine'
  | 'menopause'
  | 'hypertension'
  | 'cholesterol'
  | 'gerd'
  | 't1d'
  | 't2d'
  | 'ckd'
  | 'hashimotos'
  /** A goal rather than a condition: skin and appearance through food. */
  | 'looks'

/** Eating patterns the planner can follow. Several can be combined (the strictest rule wins). */
export type DietId = 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'aip'

/** Medications and states that change which supplements are safe. */
export interface MedFlags {
  /** Warfarin, apixaban, rivaroxaban, clopidogrel and similar. */
  bloodThinner: boolean
  /** SSRIs, SNRIs, trazodone, triptans or other serotonergic drugs. */
  ssri: boolean
  /** Levothyroxine or other thyroid hormone. */
  thyroid: boolean
  /** Insulin or sulfonylureas (glipizide, glyburide, glimepiride): can cause lows. */
  diabetesMeds: boolean
  /** ACE inhibitors, ARBs or potassium-sparing diuretics. */
  bpMeds: boolean
  /** Any medicine with a grapefruit warning (some statins, nifedipine, buspirone, transplant drugs…). */
  grapefruitMeds: boolean
  pregnant: boolean
}

/** STRAW+10 stages: perimenopause (cycles changing), menopause (first year after the final period), postmenopause. */
export type MenopauseStage = 'peri' | 'meno' | 'post'

/** Micronutrients tracked for deficiency analysis. */
export type NutrientKey =
  | 'fiber'
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'potassium'
  | 'zinc'
  | 'vitA'
  | 'vitC'
  | 'vitD'
  | 'vitE'
  | 'vitK'
  | 'folate'
  | 'b12'
  | 'omega3'
  | 'choline'
  | 'b6'
  | 'selenium'

/** Areas of brain and body a nutrient shortfall can affect. */
export type Domain = 'memory' | 'focus' | 'mood' | 'immunity' | 'energy' | 'sleep' | 'bones' | 'heart'

/** How solid the science behind a claim or tip is. */
/** strong > moderate > emerging; "limited" = commonly used, but little or inconclusive research. */
export type Evidence = 'strong' | 'moderate' | 'emerging' | 'limited'

/** Food categories used for weekly frequency and rotation guidelines. */
export type FoodGroup =
  | 'fatty_fish'
  | 'seafood'
  | 'red_meat'
  | 'processed_meat'
  | 'poultry'
  | 'eggs'
  | 'legumes'
  | 'nuts_seeds'
  | 'dairy'
  | 'leafy_greens'
  | 'cruciferous'
  | 'red_orange_veg'
  | 'vegetables'
  | 'fruit'
  | 'berries'
  | 'whole_grain'
  | 'refined_grain'
  | 'rice'
  | 'fermented'
  | 'tuna'

/** Nutrients per 100 g of edible food. */
export interface Nutrients {
  kcal: number
  protein: number // g
  carbs: number // g
  fat: number // g
  sugar: number // g
  water: number // g
  sodium: number // mg
  fiber: number // g
  calcium: number // mg
  iron: number // mg
  magnesium: number // mg
  potassium: number // mg
  zinc: number // mg
  vitA: number // µg RAE
  vitC: number // mg
  vitD: number // µg
  vitE: number // mg
  vitK: number // µg
  folate: number // µg DFE
  b12: number // µg
  omega3: number // g (ALA + EPA + DHA)
  choline: number // mg
  b6: number // mg
  selenium: number // µg
  satFat: number // g
  addedSugar: number // g
  caffeine: number // mg
}

export type Aisle =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Bakery & Grains'
  | 'Canned & Dry'
  | 'Frozen'
  | 'Snacks'
  | 'Condiments & Oils'

export interface Food {
  id: string
  name: string
  aisle: Aisle
  /** Typical package the store sells, in grams. */
  packageGrams: number
  packageLabel: string
  /** US average price for one package, USD. */
  packagePrice: number
  /** Days it keeps once bought (fridge/pantry as appropriate). */
  shelfDays: number
  /** Puffed/airy (popcorn, rice cakes): far more volume per gram, which fills you up more. */
  airy?: boolean
  /** One standard serving in grams (as bought, e.g. dry lentils), for frequency guidelines. */
  serving: number
  groups: FoodGroup[]
  /** Plant species in this food, for the weekly plant-diversity count. */
  plants: string[]
  n: Nutrients
  /** Set on foods made from a scanned product: the product's id. */
  product?: string
  /** Scanned products: lowercase name and ingredient list, checked against condition trigger words. */
  scanText?: string
  /** Scanned products: an ingredient list was entered, so trigger checks are meaningful. */
  ingredientsKnown?: boolean
}

export type Equipment =
  | 'stove'
  | 'oven'
  | 'microwave'
  | 'airfryer'
  | 'blender'
  | 'ricecooker'
  | 'slowcooker'
  | 'toaster'
  | 'sheetpan'
  | 'skillet'
  | 'pot'

/** Sensory / reward traits that make food engaging for an ADHD brain. 0–3 each. */
export interface Dopamine {
  crunch: number
  flavor: number // intensity: spicy, umami, tangy
  novelty: number // interesting / varied
  fun: number // dippable, handheld, build-your-own, colorful
}

export interface Recipe {
  id: string
  name: string
  slots: MealSlot[]
  servings: number
  /** Ingredients for the whole recipe. */
  items: { food: string; grams: number }[]
  /** Everything needed to make it. A knife and board are always assumed. */
  equipment: Equipment[]
  /** An alternative full equipment set that also works (e.g. slow cooker instead of stove + pot). */
  alt?: Equipment[]
  /** Hands-on minutes. */
  activeMin: number
  /** Total minutes including passive cooking. */
  totalMin: number
  /** Number of distinct steps — proxy for executive-function load. */
  steps: number
  dopamine: Dopamine
  /** Keeps well as leftovers / meal prep. */
  batch?: boolean
  note?: string
  /** A ready-to-eat scanned product served as is: the product's id. Only planned while it's in the pantry. */
  product?: string
}

export interface Profile {
  name: string
  sex: Sex
  age: number
  weightLb: number
  heightIn: number
  activity: Activity
  goal: Goal
  adhd: boolean
  stimulantMeds: boolean
  state: string
  zip: string
  weeklyBudget: number
  /** Max total minutes the user wants to spend per cooked meal. */
  maxMealMin: number
  snacksPerDay: number
  /** "HH:MM", 24-hour. */
  wakeTime: string
  bedTime: string
  /** Usual workout start time, or '' for none / varies. */
  workoutTime: string
  caffeine: boolean
  /** Hot climate or heavy sweating: raises water needs. */
  hotClimate: boolean
  /** Food ids the user won't eat. */
  excluded: string[]
  conditions: ConditionId[]
  /** Eating patterns to follow; foods outside them are never planned. */
  diets: DietId[]
  menopauseStage: MenopauseStage
  /** Takes a monoamine oxidase inhibitor (MAOI) antidepressant: tyramine-rich foods are unsafe. */
  maoi: boolean
  /** Condition trigger foods the user has found they tolerate (re-enabled). */
  toleratedTriggers: string[]
  /** Optional, individual triggers the user has chosen to avoid (e.g. chocolate for migraine). */
  optInTriggers: string[]
  meds: MedFlags
  /** Follows a resistance-training plan (set from the Train tab): raises the protein target. */
  strengthTraining: boolean
}

export interface Store {
  id: string
  name: string
}

/** Nutrition Facts values per serving, as printed (g, mg or µg like the label). */
export type LabelKey = 'kcal' | 'fat' | 'satFat' | 'sodium' | 'carbs' | 'fiber' | 'sugar' | 'addedSugar' | 'protein' | 'vitD' | 'calcium' | 'iron' | 'potassium'
export type LabelFacts = Partial<Record<LabelKey, number>>

/** A product scanned from its barcode or Nutrition Facts label. */
export interface Product {
  id: string
  name: string
  brand: string
  barcode: string
  /** Grams in one serving, from the label. */
  servingGrams: number
  /** Grams in one package. */
  packageGrams: number
  /** What one package cost, USD; 0 if not entered. */
  price: number
  label: LabelFacts
  ingredients: string
  /** The app food this product is (e.g. greek_yogurt), so recipes can use it; '' if none. */
  matches: string
  /** Eaten as is (protein bar, frozen meal), so the planner can serve it on its own. */
  readyToEat: boolean
  slots: MealSlot[]
  /** Heated in the microwave (frozen meals). */
  microwave: boolean
  /** What kinds of food it contains, for diets. */
  tags: DietTag[]
  aisle: Aisle
  /** ISO date it was scanned. */
  addedAt: string
}

export interface PantryItem {
  food: string
  grams: number
}

export interface PlanEntry {
  recipe: string
  /** Portion multiplier relative to one serving. */
  portion: number
  locked?: boolean
}

export interface DayPlan {
  breakfast: PlanEntry | null
  lunch: PlanEntry | null
  dinner: PlanEntry | null
  snacks: PlanEntry[]
}

export interface AppState {
  profile: Profile
  equipment: Equipment[]
  pantry: PantryItem[]
  /** Products scanned into the pantry. */
  products: Product[]
  stores: Store[]
  /** priceOverrides[storeId][foodId] = package price */
  priceOverrides: Record<string, Record<string, number>>
  preferredStore: string | null
  plan: DayPlan[]
  /** OAuth client ID for exporting to Google Tasks (public, not a secret). */
  googleClientId: string
  /** Shopping list check-off state, by food id. */
  checked: Record<string, boolean>
  setupDone: boolean
  /** The user has read and acknowledged the "not a health professional" disclaimer. */
  disclaimerAccepted: boolean
  /** Nights the user has logged, newest last. */
  sleepLog: SleepEntry[]
  /** Where the export buttons send tasks. */
  exportTarget: ExportTarget
  onyx: OnyxSettings
  fitness: FitnessSettings
}

// ── Training ──────────────────────────────────────────────

export interface FitnessSettings {
  /** The user has set up a training plan. */
  enabled: boolean
  goal: TrainingGoal
  /** Training days a week, 2–6. */
  days: number
  /** Minutes per session, including rest between sets. */
  sessionMin: number
  experience: Experience
  access: Access
  /** Body parts to grow most: these get extra weekly sets. */
  priorities: Muscle[]
  /** Let the training plan raise protein and set activity in the meal plan. */
  feedMealPlan: boolean
}

// ── Sleep and exports ─────────────────────────────────────

/** One night of sleep, logged by the date the user woke up. */
export interface SleepEntry {
  /** YYYY-MM-DD of the morning they woke. */
  date: string
  /** "HH:MM", 24-hour: when they fell asleep (roughly). */
  bed: string
  /** "HH:MM", 24-hour: when they woke for the day. */
  wake: string
}

export type ExportTarget = 'google' | 'onyx'

export interface OnyxSettings {
  /** Base address of Onyx Calendar's server, e.g. http://127.0.0.1:4747. */
  url: string
  /** The token from Onyx Calendar → Settings → MCP server. */
  token: string
}
