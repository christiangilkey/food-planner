import { EQUIPMENT, EXERCISES, type EquipmentId } from '../data/exercises'
import { LIMITATIONS, type LimitationId } from '../data/limitations'
import type { Access, Experience, Muscle, TrainingGoal } from '../data/training'
import type { TrainingAddOn, TrainingPlace } from '../types'
import type {
  Activity, AppState, BodyCheckIn, ConditionId, DayPlan, DietId, Equipment, ExportTarget, Goal, LabelFacts, LabelKey,
  LiftEntry, LoggedSet, MealSlot, MenopauseStage, PantryItem, PlanEntry, Product, Sex, SleepEntry, Store, WeightUnit,
} from '../types'

/**
 * Backups and exports. A backup file comes from outside the app, so treat it as hostile, even one
 * this app made: it may have been edited, or made to look like a backup. Every field is checked
 * against what the app really allows, anything unknown is dropped, and secrets are never carried:
 * exports leave them out, and imports keep this device's own.
 */

/** Generous on purpose: a year of heavy use is well under 1 MB. */
export const MAX_BACKUP_CHARS = 10_000_000
const MAX_ITEMS = 10_000

/** Names that change how JavaScript objects behave if used as keys ("prototype pollution"). */
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const ID = /^[A-Za-z0-9_.:-]{1,200}$/

/** An id or lookup key from outside: short, plain characters, and never a special name. */
export const safeId = (v: unknown): v is string => typeof v === 'string' && ID.test(v) && !BAD_KEYS.has(v)

/** Parse JSON from outside, dropping special keys at every level. */
export function parseUntrusted(json: string): unknown {
  if (json.length > MAX_BACKUP_CHARS) throw new Error('That file is too large to be a Health Tracker backup.')
  return JSON.parse(json, (k, v: unknown) => (BAD_KEYS.has(k) ? undefined : v))
}

/** Only web addresses: no javascript:, file:, data: or anything else. */
export function httpUrl(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > 300) return null
  try {
    const u = new URL(v.trim())
    return (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password ? v.trim() : null
  } catch {
    return null
  }
}

/** A copy of the state that is safe to hand to someone: no tokens. */
export function withoutSecrets(state: AppState): AppState {
  return { ...state, onyx: { ...state.onyx, token: '' } }
}

// ── Small checkers ──────────────────────────────────────────────────

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown, fallback: string, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : fallback)
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)
const num = (v: unknown, fallback: number, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback)
const optNum = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : undefined)
function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback
}
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v.slice(0, MAX_ITEMS) : [])
/** Keep the items that pass, in order. */
function each<T>(v: unknown, check: (x: unknown) => T | null): T[] {
  return list(v).map(check).filter((x): x is T => x !== null)
}
const ids = (v: unknown) => each(v, (x) => (safeId(x) ? x : null))
function enums<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  return [...new Set(list(v).filter((x): x is T => allowed.includes(x as T)))]
}
const date = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null)
const hhmm = (v: unknown, fallback: string) => (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v) ? v : fallback)

// The values each choice may take. Tests check these against the app's own lists.
export const SEXES: readonly Sex[] = ['male', 'female']
export const ACTIVITIES: readonly Activity[] = ['sedentary', 'light', 'moderate', 'very', 'athlete']
export const GOALS: readonly Goal[] = ['lose', 'maintain', 'gain']
export const CONDITION_IDS: readonly ConditionId[] = ['adhd', 'anxiety', 'depression', 'migraine', 'menopause', 'hypertension', 'cholesterol', 'gerd', 't1d', 't2d', 'ckd', 'hashimotos', 'osteoporosis', 'looks']
export const DIET_IDS: readonly DietId[] = ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'aip']
const STAGES: readonly MenopauseStage[] = ['peri', 'meno', 'post']
export const EQUIPMENT_IDS: readonly Equipment[] = ['stove', 'oven', 'microwave', 'airfryer', 'blender', 'ricecooker', 'slowcooker', 'toaster', 'sheetpan', 'skillet', 'pot']
const SLOTS: readonly MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
const AISLES: readonly Product['aisle'][] = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery & Grains', 'Canned & Dry', 'Frozen', 'Snacks', 'Condiments & Oils']
const LABEL_KEYS: readonly LabelKey[] = ['kcal', 'fat', 'satFat', 'sodium', 'carbs', 'fiber', 'sugar', 'addedSugar', 'protein', 'vitD', 'calcium', 'iron', 'potassium']
const TARGETS: readonly ExportTarget[] = ['google', 'onyx']
const UNITS: readonly WeightUnit[] = ['lb', 'kg']
const T_GOALS: readonly TrainingGoal[] = ['hypertrophy', 'strength', 'recomp', 'health']
const EXPERIENCE: readonly Experience[] = ['new', 'some', 'advanced']
const ACCESS: readonly Access[] = ['gym', 'home', 'bodyweight']
const ADD_ONS: readonly TrainingAddOn[] = ['tendon', 'posture', 'fascia']
const LIMITATION_IDS: readonly LimitationId[] = LIMITATIONS.map((l) => l.id)
const EQUIPMENT_IDS_ALL: readonly EquipmentId[] = EQUIPMENT.map((e) => e.id)
const EXERCISE_IDS = new Set(EXERCISES.map((e) => e.id))
const MUSCLES: readonly Muscle[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'abs']

// ── Each part of the state ──────────────────────────────────────────

function profile(v: unknown, base: AppState['profile']): AppState['profile'] {
  const p = isObj(v) ? v : {}
  const m = isObj(p.meds) ? p.meds : {}
  const meds = Object.fromEntries(Object.entries(base.meds).map(([k, d]) => [k, bool(m[k], d)])) as unknown as AppState['profile']['meds']
  return {
    name: str(p.name, base.name, 80),
    sex: oneOf(p.sex, SEXES, base.sex),
    age: num(p.age, base.age, 16, 100),
    weightLb: num(p.weightLb, base.weightLb, 50, 800),
    heightIn: num(p.heightIn, base.heightIn, 36, 96),
    activity: oneOf(p.activity, ACTIVITIES, base.activity),
    goal: oneOf(p.goal, GOALS, base.goal),
    adhd: bool(p.adhd, base.adhd),
    stimulantMeds: bool(p.stimulantMeds, base.stimulantMeds),
    state: str(p.state, base.state, 4),
    zip: str(p.zip, base.zip, 10),
    weeklyBudget: num(p.weeklyBudget, base.weeklyBudget, 0, 10_000),
    maxMealMin: num(p.maxMealMin, base.maxMealMin, 5, 240),
    snacksPerDay: num(p.snacksPerDay, base.snacksPerDay, 0, 6),
    wakeTime: hhmm(p.wakeTime, base.wakeTime),
    bedTime: hhmm(p.bedTime, base.bedTime),
    workoutTime: p.workoutTime === '' ? '' : hhmm(p.workoutTime, base.workoutTime),
    caffeine: bool(p.caffeine, base.caffeine),
    hotClimate: bool(p.hotClimate, base.hotClimate),
    excluded: ids(p.excluded),
    conditions: Array.isArray(p.conditions) ? enums(p.conditions, CONDITION_IDS) : base.conditions,
    diets: enums(p.diets, DIET_IDS),
    menopauseStage: oneOf(p.menopauseStage, STAGES, base.menopauseStage),
    maoi: bool(p.maoi, base.maoi),
    toleratedTriggers: ids(p.toleratedTriggers),
    optInTriggers: ids(p.optInTriggers),
    meds,
    strengthTraining: bool(p.strengthTraining, base.strengthTraining),
  }
}

function product(v: unknown): Product | null {
  if (!isObj(v) || !safeId(v.id)) return null
  const label: LabelFacts = {}
  if (isObj(v.label)) for (const k of LABEL_KEYS) { const n = optNum(v.label[k], 0, 100_000); if (n !== undefined) label[k] = n }
  return {
    id: v.id,
    name: str(v.name, 'Product', 200),
    brand: str(v.brand, '', 200),
    barcode: typeof v.barcode === 'string' && /^\d{0,20}$/.test(v.barcode) ? v.barcode : '',
    servingGrams: num(v.servingGrams, 30, 0, 10_000),
    packageGrams: num(v.packageGrams, 100, 0, 100_000),
    price: num(v.price, 0, 0, 10_000),
    label,
    ingredients: str(v.ingredients, '', 5000),
    matches: safeId(v.matches) ? v.matches : '',
    readyToEat: bool(v.readyToEat, false),
    slots: enums(v.slots, SLOTS),
    microwave: bool(v.microwave, false),
    tags: ids(v.tags) as Product['tags'],
    aisle: oneOf(v.aisle, AISLES, 'Snacks'),
    addedAt: str(v.addedAt, new Date(0).toISOString(), 40),
  }
}

const pantryItem = (v: unknown): PantryItem | null => (isObj(v) && safeId(v.food) ? { food: v.food, grams: num(v.grams, 0, 0, 1_000_000) } : null)
const store = (v: unknown): Store | null => (isObj(v) && safeId(v.id) ? { id: v.id, name: str(v.name, 'Store', 100) } : null)

function entry(v: unknown): PlanEntry | null {
  if (!isObj(v) || !safeId(v.recipe)) return null
  return { recipe: v.recipe, portion: num(v.portion, 1, 0.1, 10), ...(v.locked === true ? { locked: true } : {}) }
}

function plan(v: unknown, base: DayPlan[]): DayPlan[] {
  if (!Array.isArray(v) || v.length !== base.length) return base
  return v.map((d) => (isObj(d)
    ? { breakfast: entry(d.breakfast), lunch: entry(d.lunch), dinner: entry(d.dinner), snacks: each(d.snacks, entry).slice(0, 10) }
    : { breakfast: null, lunch: null, dinner: null, snacks: [] }))
}

/** { key: value } with checked keys, e.g. checked or one store's prices. */
function record<T>(v: unknown, check: (x: unknown) => T | undefined): Record<string, T> {
  if (!isObj(v)) return {}
  const out: Record<string, T> = {}
  for (const [k, x] of Object.entries(v).slice(0, MAX_ITEMS)) {
    const ok = check(x)
    if (safeId(k) && ok !== undefined) out[k] = ok
  }
  return out
}

const sleep = (v: unknown): SleepEntry | null => {
  if (!isObj(v)) return null
  const d = date(v.date)
  return d && typeof v.bed === 'string' && typeof v.wake === 'string' ? { date: d, bed: hhmm(v.bed, '23:00'), wake: hhmm(v.wake, '07:00') } : null
}

function bodyCheck(v: unknown): BodyCheckIn | null {
  if (!isObj(v)) return null
  const d = date(v.date)
  if (!d) return null
  const out: BodyCheckIn = { date: d }
  const put = (k: Exclude<keyof BodyCheckIn, 'date'>, min: number, max: number) => { const n = optNum(v[k], min, max); if (n !== undefined) out[k] = n }
  put('weightLb', 50, 800); put('waistIn', 10, 100); put('gripKg', 0, 200); put('hangSec', 0, 3600); put('heightIn', 36, 96)
  return out
}

function lift(v: unknown): LiftEntry | null {
  if (!isObj(v)) return null
  const d = date(v.date)
  if (!d || !safeId(v.exercise)) return null
  const sets = each(v.sets, (s): LoggedSet | null => {
    if (!isObj(s)) return null
    const out: LoggedSet = {}
    const w = optNum(s.weight, 0, 5000), r = optNum(s.reps, 0, 1000), sec = optNum(s.sec, 0, 36_000)
    if (w !== undefined) out.weight = w
    if (r !== undefined) out.reps = r
    if (sec !== undefined) out.sec = sec
    return out
  }).slice(0, 50)
  return { date: d, exercise: v.exercise, unit: oneOf(v.unit, UNITS, 'lb'), sets }
}

function fitness(v: unknown, base: AppState['fitness']): AppState['fitness'] {
  const f = isObj(v) ? v : {}
  const unit = UNITS.includes(f.weightUnit as WeightUnit) ? (f.weightUnit as WeightUnit) : undefined
  return {
    enabled: bool(f.enabled, base.enabled),
    goal: oneOf(f.goal, T_GOALS, base.goal),
    days: Math.round(num(f.days, base.days, 2, 6)),
    sessionMin: num(f.sessionMin, base.sessionMin, 15, 180),
    experience: oneOf(f.experience, EXPERIENCE, base.experience),
    access: oneOf(f.access, ACCESS, base.access),
    priorities: enums(f.priorities, MUSCLES),
    feedMealPlan: bool(f.feedMealPlan, base.feedMealPlan),
    ...(unit ? { weightUnit: unit } : {}),
    ...(f.preset === 'vtaper' ? { preset: 'vtaper' as const } : {}),
    ...(Array.isArray(f.addOns) ? { addOns: enums(f.addOns, ADD_ONS) } : {}),
    ...(Array.isArray(f.places) ? { places: each(f.places, place).slice(0, 10) } : {}),
    ...(safeId(f.place) ? { place: f.place } : {}),
    ...(Array.isArray(f.limitations) ? { limitations: enums(f.limitations, LIMITATION_IDS) } : {}),
    ...(Array.isArray(f.avoid) ? { avoid: ids(f.avoid).filter((id) => EXERCISE_IDS.has(id)) } : {}),
    ...(isObj(f.swaps) ? { swaps: record(f.swaps, (x) => (safeId(x) && EXERCISE_IDS.has(x) ? x : undefined)) } : {}),
  }
}

const place = (v: unknown): TrainingPlace | null =>
  isObj(v) && safeId(v.id) ? { id: v.id, name: str(v.name, 'Place', 40), equipment: enums(v.equipment, EQUIPMENT_IDS_ALL) } : null

/**
 * Turn an untrusted backup into a state the app can safely use. `base` gives defaults for anything
 * missing; `device` is this device's current state, whose secrets are kept (a backup never brings
 * a token, and never replaces this device's).
 */
export function sanitizeBackup(raw: unknown, base: AppState, device?: AppState): AppState {
  if (!isObj(raw) || !isObj(raw.profile) || !Array.isArray(raw.plan)) throw new Error('That file is not a Health Tracker backup.')
  const onyx = isObj(raw.onyx) ? raw.onyx : {}
  return {
    profile: profile(raw.profile, base.profile),
    equipment: Array.isArray(raw.equipment) ? enums(raw.equipment, EQUIPMENT_IDS) : base.equipment,
    pantry: each(raw.pantry, pantryItem),
    products: each(raw.products, product),
    stores: each(raw.stores, store),
    priceOverrides: record(raw.priceOverrides, (x) => { const r = record(x, (n) => optNum(n, 0, 10_000)); return Object.keys(r).length ? r : undefined }),
    preferredStore: safeId(raw.preferredStore) ? raw.preferredStore : null,
    plan: plan(raw.plan, base.plan),
    checked: record(raw.checked, (x) => (typeof x === 'boolean' ? x : undefined)),
    googleClientId: typeof raw.googleClientId === 'string' && /^[\w.-]{0,200}$/.test(raw.googleClientId) ? raw.googleClientId : '',
    setupDone: bool(raw.setupDone, base.setupDone),
    disclaimerAccepted: bool(raw.disclaimerAccepted, base.disclaimerAccepted),
    // Agreeing to the Terms is personal to the device: a backup can't agree for someone.
    termsAccepted: device?.termsAccepted ?? base.termsAccepted,
    sleepLog: each(raw.sleepLog, sleep),
    exportTarget: oneOf(raw.exportTarget, TARGETS, base.exportTarget),
    onyx: { url: httpUrl(onyx.url) ?? base.onyx.url, token: device?.onyx.token ?? '' },
    fitness: fitness(raw.fitness, base.fitness),
    bodyLog: each(raw.bodyLog, bodyCheck),
    liftLog: each(raw.liftLog, lift),
  }
}
