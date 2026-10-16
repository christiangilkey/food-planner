import { UPPER_LIMITS } from '../data/nutrients'
import type { RotationRule } from '../data/rotation'
import { RECIPES, RECIPE_BY_ID } from '../data/recipes'
import type { AppState, DayPlan, MealSlot, NutrientKey, Nutrients, PlanEntry, Profile, Recipe } from '../types'
import { dayEntries, emptyPlan, getEntry, setEntry, type Pos } from './plan-utils'
import { addGroups, entryGroups, rotationGap, rotationScore, type GroupServings } from './rotation'
import { buildShoppingList } from './shopping'
import { computeTargets, type Targets } from './energy'
import { activeRules, avoidedFoods, hasCondition, mergedLimits, nutrientTarget, planViolations, recipeAllowed, safetyGap } from './conditions'
import {
  addInto, canMake, EMPTY, easeScore, rewardScore, satietyScore, servingCost, servingTotals, type Totals,
} from './nutrition'

export { DAYS, dayEntries, emptyPlan } from './plan-utils'

const MICROS: NutrientKey[] = [
  'fiber', 'calcium', 'iron', 'magnesium', 'potassium', 'zinc', 'vitA', 'vitC', 'vitD', 'vitE', 'vitK', 'folate', 'b12', 'omega3',
  'choline', 'b6', 'selenium',
]

/** Share of daily calories for each meal. Stimulant meds shift food to before they kick in and to the evening. */
export function slotShares(p: Profile): Record<MealSlot, number> {
  const base = p.stimulantMeds
    ? { breakfast: 0.3, lunch: 0.2, dinner: 0.32, snack: 0.18 }
    : { breakfast: 0.25, lunch: 0.3, dinner: 0.3, snack: 0.15 }
  if (p.snacksPerDay <= 0) {
    const rest = 1 - base.snack
    return { breakfast: base.breakfast / rest, lunch: base.lunch / rest, dinner: base.dinner / rest, snack: 0 }
  }
  return { ...base, snack: base.snack / p.snacksPerDay }
}

/**
 * Recipes the user can actually make for this slot: right equipment, time limit, no excluded
 * foods, and nothing their health conditions rule out.
 */
export function eligibleRecipes(state: AppState, slot: MealSlot): Recipe[] {
  const p = state.profile
  const avoided = avoidedFoods(p)
  const limits = mergedLimits(p)
  return RECIPES.filter(
    (r) =>
      r.slots.includes(slot) &&
      canMake(r, state.equipment) &&
      r.activeMin <= p.maxMealMin &&
      (r.batch || r.totalMin <= Math.max(p.maxMealMin * 2, 20)) &&
      !r.items.some((i) => p.excluded.includes(i.food)) &&
      recipeAllowed(r, p, avoided, limits),
  )
}

export const isAdhd = (p: Profile) => hasCondition(p, 'adhd')

const roundQuarter = (x: number) => Math.round(x * 4) / 4

export function portionFor(r: Recipe, slotKcal: number, slot: MealSlot): number {
  const kcal = servingTotals(r).kcal
  if (kcal <= 0) return 1
  const max = slot === 'snack' ? 1.5 : 2
  return Math.max(0.5, Math.min(max, roundQuarter(slotKcal / kcal)))
}

export interface ScoreParts {
  satiety: number
  protein: number
  gaps: number
  cost: number
  reward: number
  ease: number
  onHand: number
  variety: number
  /** Helps the week hit food-frequency guidelines (fish, legumes, greens, plant variety…). */
  rotation: number
}

export interface Candidate {
  recipe: Recipe
  portion: number
  totals: Totals
  cost: number
  score: number
  parts: ScoreParts
}

/** Running totals for the meals planned so far this week. */
interface WeekTracker {
  /** Nutrients planned so far this week. */
  week: Nutrients
  /** Calories planned so far. */
  planned: number
  /** Number of times each recipe appears this week. */
  usesThisWeek: Record<string, number>
  /** Servings (sum of portions) of each recipe eaten this week. */
  servingsUsed: Record<string, number>
  /** Foods already in the pantry or already on this week's list. */
  onHandFoods: Set<string>
  /** Standard servings per food group, and plant species, for rotation guidelines. */
  groups: GroupServings
  plants: Set<string>
}

function newTracker(state: AppState): WeekTracker {
  return {
    week: { ...EMPTY }, planned: 0, usesThisWeek: {}, servingsUsed: {},
    onHandFoods: new Set(state.pantry.filter((p) => p.grams > 0).map((p) => p.food)),
    groups: {}, plants: new Set(),
  }
}

function track(w: WeekTracker, entry: PlanEntry) {
  const r = RECIPE_BY_ID[entry.recipe]
  if (!r) return
  const t = servingTotals(r, entry.portion)
  addInto(w.week, t)
  w.planned += t.kcal
  w.usesThisWeek[r.id] = (w.usesThisWeek[r.id] ?? 0) + 1
  w.servingsUsed[r.id] = (w.servingsUsed[r.id] ?? 0) + entry.portion
  r.items.forEach((it) => w.onHandFoods.add(it.food))
  const g = entryGroups(r, entry.portion)
  addGroups(w.groups, g.servings)
  g.plants.forEach((x) => w.plants.add(x))
}

interface Ctx extends WeekTracker {
  state: AppState
  targets: Targets
  /** Fraction of the week's calories already planned, including the meal being chosen. */
  progress: number
  usedToday: Set<string>
  costWeight: number
  rules: RotationRule[]
  limits: ReturnType<typeof mergedLimits>
}

function scoreCandidate(r: Recipe, slot: MealSlot, slotKcal: number, ctx: Ctx): Candidate {
  const { state, targets } = ctx
  const p = state.profile
  const portion = portionFor(r, slotKcal, slot)
  const totals = servingTotals(r, portion)
  const cost = servingCost(r, state, portion)

  const satiety = satietyScore(totals) / 100
  const targetProteinShare = (targets.protein * 4) / targets.kcal
  const protein = totals.kcal > 0 ? Math.min(1, (totals.protein * 4) / totals.kcal / targetProteinShare) : 0

  // Nutrient gaps: weight each micronutrient by how far behind the week is, then reward meals that supply it.
  let gapNum = 0
  let gapDen = 0
  const share = totals.kcal / targets.kcal
  for (const k of MICROS) {
    const weekTarget = nutrientTarget(k, p, targets.kcal) * 7
    const behind = Math.max(0, 1 - ctx.week[k] / (weekTarget * ctx.progress || 1))
    const w = 0.2 + behind
    gapNum += w * Math.min(1, totals[k] / ((weekTarget / 7) * share || 1))
    gapDen += w
  }
  let gaps = gapDen ? gapNum / gapDen : 0
  // Don't pile on nutrients that are heading past their safe upper limit (e.g. iron from fortified cereal).
  for (const [k, ul] of Object.entries(UPPER_LIMITS) as [NutrientKey, number][]) {
    const projectedDaily = (ctx.week[k] + totals[k]) / Math.max(1, 7 * ctx.progress)
    if (projectedDaily > ul * 0.8) gaps -= 0.5
  }

  // Cost relative to what the weekly budget allows per 1000 kcal.
  const allowedPer1000 = p.weeklyBudget / 7 / (targets.kcal / 1000)
  const per1000 = totals.kcal > 0 ? (cost / totals.kcal) * 1000 : 99
  const costScore = Math.max(0, Math.min(1, 1.5 - per1000 / allowedPer1000))

  const reward = rewardScore(r) / 100
  const ease = easeScore(r) / 100

  // Ingredients already at home or already being bought this week: fewer items, less waste.
  const onHand = r.items.filter((i) => ctx.onHandFoods.has(i.food)).length / r.items.length

  // Variety: batch recipes are meant to be eaten as leftovers (but not every day);
  // everything else should rotate.
  const uses = ctx.usesThisWeek[r.id] ?? 0
  const served = ctx.servingsUsed[r.id] ?? 0
  let variety: number
  if (ctx.usedToday.has(r.id)) variety = -1
  else if (r.batch) variety = uses === 0 ? 0.9 : uses < 3 && served + portion <= r.servings + 0.25 ? 1 : 0.1 - 0.3 * uses
  else variety = 1 - 0.5 * uses

  const rotation = rotationScore(entryGroups(r, portion), ctx.groups, ctx.plants, ctx.rules)

  // Condition limits: penalize meals that use up more than their share of a capped nutrient.
  const l = ctx.limits
  let safety = 0
  if (totals.kcal > 0) {
    const sodiumBudget = (l.sodiumGoalMg ?? l.sodiumMaxMg ?? 0) * share
    if (sodiumBudget > 0 && totals.sodium > sodiumBudget) safety += Math.min(1, (totals.sodium - sodiumBudget) / sodiumBudget)
    const satPct = (totals.satFat * 900) / totals.kcal
    if (l.satFatMaxPct && satPct > l.satFatMaxPct) safety += Math.min(1, (satPct - l.satFatMaxPct) / l.satFatMaxPct)
    const sugarPct = (totals.addedSugar * 400) / totals.kcal
    if (l.addedSugarMaxPct && sugarPct > l.addedSugarMaxPct) safety += Math.min(1, (sugarPct - l.addedSugarMaxPct) / l.addedSugarMaxPct)
  }

  const adhd = isAdhd(p)
  const easeWeight = adhd ? (p.stimulantMeds && slot === 'lunch' ? 0.25 : 0.16) : 0.07
  const parts: ScoreParts = { satiety, protein, gaps, cost: costScore, reward, ease, onHand, variety, rotation }
  const score =
    0.24 * satiety +
    0.15 * protein +
    0.2 * gaps +
    0.12 * ctx.costWeight * costScore +
    (adhd ? 0.15 : 0.05) * reward +
    easeWeight * ease +
    0.1 * onHand +
    0.22 * variety +
    0.18 * rotation -
    0.35 * safety

  return { recipe: r, portion, totals, cost, score, parts }
}

/** Ranked options for one slot on one day, given the rest of the plan. */
export function rankCandidates(state: AppState, plan: DayPlan[], dayIndex: number, slot: MealSlot): Candidate[] {
  const targets = computeTargets(state.profile)
  const shares = slotShares(state.profile)
  const w = newTracker(state)
  const usedToday = new Set<string>()
  plan.forEach((day, i) => {
    for (const { slot: s, entry } of dayEntries(day)) {
      if (i === dayIndex && s === slot) continue
      track(w, entry)
      if (i === dayIndex) usedToday.add(entry.recipe)
    }
  })
  const slotKcal = targets.kcal * shares[slot]
  const ctx: Ctx = {
    ...w, state, targets, usedToday, costWeight: 1, rules: activeRules(state.profile), limits: mergedLimits(state.profile),
    progress: Math.min(1, (w.planned + slotKcal) / (targets.kcal * 7)),
  }
  return eligibleRecipes(state, slot)
    .map((r) => scoreCandidate(r, slot, slotKcal, ctx))
    .sort((a, b) => b.score - a.score)
}

/** Small deterministic PRNG so "regenerate" gives a different but reproducible plan per seed. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildOnce(state: AppState, seed: number, costWeight: number): DayPlan[] {
  const rand = mulberry32(seed)
  const targets = computeTargets(state.profile)
  const shares = slotShares(state.profile)
  const prev = state.plan.length === 7 ? state.plan : emptyPlan()
  const plan = emptyPlan()
  const w = newTracker(state)
  const rules = activeRules(state.profile)
  const limits = mergedLimits(state.profile)

  // Count locked meals first so the rest of the week plans around them.
  prev.forEach((day) => dayEntries(day).forEach(({ entry }) => entry.locked && track(w, entry)))

  for (let d = 0; d < 7; d++) {
    const usedToday = new Set<string>()
    const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', ...Array<MealSlot>(state.profile.snacksPerDay).fill('snack')]
    let snackIdx = 0
    for (const slot of slots) {
      const prevEntry = slot === 'snack' ? prev[d].snacks[snackIdx] : prev[d][slot]
      let chosen: PlanEntry | null = null
      if (prevEntry?.locked) {
        chosen = prevEntry
        usedToday.add(prevEntry.recipe)
      } else {
        const slotKcal = targets.kcal * shares[slot]
        const ctx: Ctx = {
          ...w, state, targets, usedToday, costWeight, rules, limits,
          progress: Math.min(1, (w.planned + slotKcal) / (targets.kcal * 7)),
        }
        const ranked = eligibleRecipes(state, slot)
          .map((r) => scoreCandidate(r, slot, slotKcal, ctx))
          .sort((a, b) => b.score - a.score)
        if (ranked.length) {
          // Pick among the top few, weighted toward the best, so plans don't feel robotic.
          const top = ranked.slice(0, 3)
          const weights = top.map((c, i) => Math.max(0.01, c.score) * [1, 0.6, 0.35][i])
          let x = rand() * weights.reduce((a, b) => a + b, 0)
          let pick = top[0]
          for (let i = 0; i < top.length; i++) {
            x -= weights[i]
            if (x <= 0) { pick = top[i]; break }
          }
          chosen = { recipe: pick.recipe.id, portion: pick.portion }
          track(w, chosen)
          usedToday.add(pick.recipe.id)
        }
      }
      if (slot === 'snack') {
        if (chosen) plan[d].snacks.push(chosen)
        snackIdx++
      } else {
        plan[d][slot] = chosen
      }
    }
  }
  return plan
}

export function planCost(state: AppState, plan: DayPlan[]): number {
  let c = 0
  for (const day of plan) for (const { entry } of dayEntries(day)) {
    const r = RECIPE_BY_ID[entry.recipe]
    if (r) c += servingCost(r, state, entry.portion)
  }
  return c
}

/**
 * Hill-climb toward the weekly food-frequency guidelines (fish twice a week, enough fruit,
 * rice under its limit…) and every active condition's limits. Each round tries every unlocked
 * meal slot, swapping in the alternative that closes the most gap for the least loss in meal
 * score. Condition limits weigh 4× guidelines, and may cost more meal score to fix.
 */
function repairRotation(state: AppState, plan: DayPlan[]): DayPlan[] {
  const p = state.profile
  const rules = activeRules(p)
  const budget = p.weeklyBudget
  const gapOf = (x: DayPlan[]) => rotationGap(x, rules) + 4 * safetyGap(p, x)
  let gap = gapOf(plan)
  let bill = shoppingCost(state, plan)
  for (let round = 0; round < 10 && gap > 0.05; round++) {
    let best: { plan: DayPlan[]; gap: number; bill: number; value: number } | null = null
    for (let day = 0; day < 7; day++) {
      const positions: Pos[] = [
        { day, slot: 'breakfast' }, { day, slot: 'lunch' }, { day, slot: 'dinner' },
        ...plan[day].snacks.map((_, i): Pos => ({ day, slot: 'snack', snack: i })),
      ]
      for (const pos of positions) {
        const current = getEntry(plan, pos)
        if (!current || current.locked) continue
        const ranked = rankCandidates(state, plan, day, pos.slot)
        const currentScore = ranked.find((c) => c.recipe.id === current.recipe)?.score ?? 0
        for (const c of ranked.slice(0, 12)) {
          if (c.recipe.id === current.recipe) continue
          const loss = currentScore - c.score
          if (loss > (safetyGap(p, plan) > 0 ? 0.4 : 0.12)) continue
          const next = setEntry(plan, pos, { recipe: c.recipe.id, portion: c.portion })
          const g = gapOf(next)
          if (g >= gap - 0.02) continue
          // Trade-off: guideline gap closed, minus meal quality lost, minus extra spending past the budget.
          const nextBill = shoppingCost(state, next)
          const overspend = Math.max(0, nextBill - Math.max(bill, budget)) / budget
          const value = gap - g - Math.max(0, loss) * 0.5 - overspend * 2
          if (!best || value > best.value) best = { plan: next, gap: g, bill: nextBill, value }
        }
      }
    }
    if (!best || best.value <= 0) break
    plan = best.plan
    gap = best.gap
    bill = best.bill
  }
  return plan
}

/** What this plan costs at the store: whole packages, minus what's already in the pantry. */
export function shoppingCost(state: AppState, plan: DayPlan[]): number {
  return buildShoppingList({ ...state, plan }).total
}

/**
 * Build a week. Locked meals are kept. If the shopping bill runs over budget,
 * retry with cost (and ingredient reuse) weighted more heavily. Finally, swap
 * meals to meet the weekly food-frequency guidelines.
 */
export function generatePlan(state: AppState, seed = Date.now()): DayPlan[] {
  let best = buildOnce(state, seed, 1)
  let bestCost = shoppingCost(state, best)
  for (let w = 2; w <= 6 && bestCost > state.profile.weeklyBudget; w++) {
    const p = buildOnce(state, seed + w, w)
    const c = shoppingCost(state, p)
    if (c < bestCost) { best = p; bestCost = c }
  }
  return enforceLimits(state, repairRotation(state, best))
}

/**
 * Last line of defense: if any hard condition limit is still broken (a day over the sodium
 * cap, saturated fat over its share…), swap meals for whichever eligible option reduces the
 * violation most, ignoring taste and cost, until the plan is within limits.
 */
function enforceLimits(state: AppState, plan: DayPlan[]): DayPlan[] {
  const p = state.profile
  const hard = (x: DayPlan[]) => planViolations(p, x).length
  for (let round = 0; round < 40 && hard(plan) > 0; round++) {
    const current = safetyGap(p, plan)
    let best: { plan: DayPlan[]; gap: number } | null = null
    for (let day = 0; day < 7; day++) {
      const positions: Pos[] = [
        { day, slot: 'breakfast' }, { day, slot: 'lunch' }, { day, slot: 'dinner' },
        ...plan[day].snacks.map((_, i): Pos => ({ day, slot: 'snack', snack: i })),
      ]
      for (const pos of positions) {
        const entry = getEntry(plan, pos)
        if (!entry || entry.locked) continue
        for (const c of rankCandidates(state, plan, day, pos.slot)) {
          for (const portion of [c.portion, Math.max(0.5, c.portion - 0.5)]) {
            const next = setEntry(plan, pos, { recipe: c.recipe.id, portion })
            const g = safetyGap(p, next)
            if (g < current - 1e-6 && (!best || g < best.gap)) best = { plan: next, gap: g }
          }
        }
        // Dropping a snack is also an option.
        if (pos.slot === 'snack') {
          const next = setEntry(plan, pos, null)
          const g = safetyGap(p, next)
          if (g < current - 1e-6 && (!best || g < best.gap)) best = { plan: next, gap: g }
        }
      }
    }
    if (!best) break
    plan = best.plan
  }
  return plan
}

export function dayTotals(day: DayPlan): Totals {
  const t: Totals = { ...EMPTY, grams: 0, bulk: 0 }
  for (const { entry } of dayEntries(day)) {
    const r = RECIPE_BY_ID[entry.recipe]
    if (!r) continue
    const s = servingTotals(r, entry.portion)
    addInto(t, s)
    t.grams += s.grams
    t.bulk += s.bulk
  }
  return t
}
