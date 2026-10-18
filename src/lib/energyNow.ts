import type { IconName } from '../components/Icon'
import type { SourceId } from '../data/sources'
import type { AppState, Evidence, Recipe } from '../types'
import type { WeekAnalysis } from './analysis'
import { avoidedFoods, caffeineLimit, dietBlocked, hasCondition } from './conditions'
import { computeTargets } from './energy'
import { crashRisk, satietyScore, servingTotals } from './nutrition'
import { dayTotals, eligibleRecipes, portionFor, slotShares } from './planner'
import { formatTime, mealTimes } from './schedule'

export interface EnergyFix {
  id: string
  icon: IconName
  title: string
  detail: string
  evidence: Evidence
  sources: SourceId[]
  /** Why it's suggested for this person right now. */
  why?: string
  /** A "don't" rather than a "do". */
  avoid?: boolean
  /** Snack suggestions, for the eat-something fix. */
  snacks?: { recipe: Recipe; portion: number }[]
}

export interface EnergyContext {
  /** Minutes after midnight. */
  now: number
  /** Monday = 0. */
  dayIndex: number
  sleptBadly: boolean
  notEaten: boolean
}

/**
 * Quick, evidence-based fixes for feeling low on energy right now, ranked for this person: time
 * of day against their schedule, conditions, medications, diet and this week's nutrient gaps.
 */
export function lowEnergyFixes(state: AppState, a: WeekAnalysis, ctx: EnergyContext): { fixes: EnergyFix[]; later: EnergyFix[] } {
  const p = state.profile
  const day = state.plan[ctx.dayIndex]
  const t = mealTimes(p, day?.snacks.length ?? p.snacksPerDay)
  // Times after midnight but before waking belong to the late end of the previous evening.
  const now = ctx.now < t.wake - 120 ? ctx.now + 1440 : ctx.now
  const eatTimes = [t.breakfast, t.lunch, t.dinner, ...t.snacks].sort((x, y) => x - y)
  const lastEat = [...eatTimes].reverse().find((m) => m <= now)
  const nextEat = eatTimes.find((m) => m > now)
  const sinceFood = lastEat === undefined ? now - t.wake : now - lastEat
  const hungryGap = ctx.notEaten || sinceFood >= 210
  const cutoff = t.bed - 8 * 60
  const avoided = avoidedFoods(p)
  const blocked = dietBlocked(p)
  const caffeineToday = day ? dayTotals(day).caffeine : 0
  const scored: { fix: EnergyFix; score: number }[] = []
  const add = (score: number, fix: EnergyFix) => scored.push({ fix, score })

  // Blood sugar first for anyone who can go low.
  if (hasCondition(p, 't1d') || p.meds.diabetesMeds) {
    add(100, {
      id: 'glucose', icon: 'stethoscope', title: 'Check your blood sugar first',
      detail: 'Tiredness, shakiness or fogginess can be a low. If you’re under 70 mg/dL, take 15 g of fast carbs (4 oz juice or glucose tablets) and recheck in 15 minutes.',
      evidence: 'strong', sources: ['ada_hypo', 'ada_6'], why: 'You use insulin or a medicine that can cause lows.',
    })
  }

  // Eat something with protein and fiber.
  const snackKcal = computeTargets(p).kcal * (slotShares(p).snack || 0.12)
  const snacks = eligibleRecipes(state, 'snack')
    .filter((r) => r.activeMin <= 5)
    .map((r) => {
      const portion = portionFor(r, snackKcal, 'snack')
      const s = servingTotals(r, portion)
      return { recipe: r, portion, crash: crashRisk(s), score: satietyScore(s) + (s.kcal ? (s.protein * 400) / s.kcal : 0) }
    })
    .filter((x) => !x.crash)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3)
    .map(({ recipe, portion }) => ({ recipe, portion }))
  add(hungryGap ? 90 : 40, {
    id: 'eat', icon: 'meal', title: 'Eat a protein-and-fiber snack',
    detail: 'If it’s been a while since you ate, low energy is often just hunger. Pick something with protein and fiber rather than sugar alone.',
    evidence: 'moderate', sources: ['ludwig', 'leidy'], snacks,
    why: hungryGap
      ? (lastEat !== undefined ? `Your last planned food was at ${formatTime(lastEat)}.` : 'You haven’t had a planned meal yet today.')
      : nextEat !== undefined ? `Your next planned food is at ${formatTime(nextEat)}.` : undefined,
  })

  if (p.stimulantMeds && t.medsAt !== undefined && now >= t.medsAt + 240) {
    add(85, {
      id: 'meds_wearoff', icon: 'pill', title: 'Your medication may be wearing off: eat',
      detail: 'Stimulants suppress appetite, so it’s easy to under-eat until the dose fades and the crash hits. Eat now even if you’re not very hungry.',
      evidence: 'strong', sources: ['cortese'], why: 'You take stimulant medication.',
    })
  }

  add(70, {
    id: 'water', icon: 'water', title: 'Drink a big glass of water (about 500 ml)',
    detail: 'Even mild dehydration (about 1.4% of body weight) lowered mood and concentration, caused headaches and made tasks feel harder in a controlled study.',
    evidence: 'moderate', sources: ['armstrong', 'adan'],
    why: p.hotClimate || p.activity === 'very' || p.activity === 'athlete' ? 'You sweat a lot, so you need more water than most.' : undefined,
  })

  add(ctx.sleptBadly ? 80 : 75, {
    id: 'move', icon: 'footprints', title: 'Walk briskly or climb stairs for 10 minutes',
    detail: 'Ten minutes of walking up and down stairs made sleep-deprived women feel more energetic than a 50 mg caffeine pill.',
    evidence: 'moderate', sources: ['randolph'],
    why: p.activity === 'sedentary' ? 'You spend most of the day sitting.' : undefined,
  })

  if (now >= t.wake && now <= Math.min(t.bed - 180, 18 * 60)) {
    add(60, {
      id: 'light', icon: 'sun', title: 'Get outside into daylight',
      detail: 'Bright daylight is a strong alertness signal and keeps your body clock on track, which helps tonight’s sleep too.',
      evidence: 'moderate', sources: ['blume'], why: now <= t.wake + 120 ? 'Morning light also sets your body clock for the day.' : undefined,
    })
  }

  // Caffeine, only if it fits their settings and the time of day.
  const coffeeOff = avoided.has('coffee') || blocked.has('coffee') || p.excluded.includes('coffee')
  const teaOff = avoided.has('green_tea') || blocked.has('green_tea') || p.excluded.includes('green_tea')
  if (p.caffeine && !(coffeeOff && teaOff)) {
    const drink = coffeeOff ? 'a cup of green tea (about 30 mg)' : teaOff ? 'a small coffee (about 60–95 mg)' : 'a small coffee or a cup of green tea (about 30–95 mg)'
    if (p.meds.thyroid && now < t.wake + 60) {
      add(30, { id: 'caffeine_wait', icon: 'coffee', title: 'Wait a little for coffee', detail: 'Coffee within an hour of levothyroxine reduces how much you absorb. Have it with or after breakfast.', evidence: 'moderate', sources: ['benvenga', 'niddk_hashimoto'], why: 'You take thyroid medication.' })
    } else if (now >= cutoff) {
      add(35, { id: 'caffeine_late', icon: 'coffee', title: 'Skip caffeine now', avoid: true, detail: `It’s past your ${formatTime(cutoff)} cutoff. Caffeine even 6 hours before bed cut sleep by about an hour, which makes tomorrow worse.`, evidence: 'moderate', sources: ['drake'] })
    } else if (caffeineToday + 95 > caffeineLimit(p)) {
      add(20, { id: 'caffeine_max', icon: 'coffee', title: 'No more caffeine today', avoid: true, detail: `Your plan already has about ${Math.round(caffeineToday)} mg today, close to your ${caffeineLimit(p)} mg limit.`, evidence: 'strong', sources: p.meds.pregnant ? ['acog_caffeine'] : ['fda_caffeine'] })
    } else {
      add(ctx.sleptBadly ? 65 : 55, {
        id: 'caffeine', icon: 'coffee', title: `Have ${drink}`,
        detail: `Moderate caffeine reliably improves alertness and reaction time, especially after short sleep. Finish it before ${formatTime(cutoff)}.`,
        evidence: 'strong', sources: ['mclellan', 'drake'],
        why: hasCondition(p, 'anxiety') ? 'With anxiety, keep it small or skip it if it makes you jittery.' : hasCondition(p, 'migraine') ? 'With migraine, keep your daily amount consistent.' : undefined,
      })
    }
  }

  if (now >= 12 * 60 && now <= Math.min(16 * 60 + 30, t.bed - 7 * 60)) {
    add(ctx.sleptBadly ? 78 : 45, {
      id: 'nap', icon: 'bed', title: 'Take a 10-minute nap',
      detail: 'After short sleep, a 10-minute afternoon nap improved alertness right away and for over 2 hours. Longer naps (30 minutes) caused grogginess first. Set an alarm.',
      evidence: 'moderate', sources: ['brooks_nap'], why: ctx.sleptBadly ? 'You slept badly last night.' : undefined,
    })
  }

  add(10, {
    id: 'sugar', icon: 'x', title: 'Skip the sugar-only pick-me-up', avoid: true,
    detail: 'Across studies, sugary carbs didn’t lift mood and left people more tired and less alert within an hour.',
    evidence: 'moderate', sources: ['mantantzis'],
  })

  // If it keeps happening.
  const later: EnergyFix[] = []
  const low = (k: string) => a.reports.find((r) => r.info.key === k && r.status === 'low')
  if (low('iron')) later.push({ id: 'iron', icon: 'droplet', title: 'Iron is low in your plan', detail: 'Iron deficiency causes fatigue even before anemia, and iron treatment reduced fatigue in iron-deficient adults. Ask your doctor about a ferritin test before supplementing.', evidence: 'moderate', sources: ['houston_iron', 'ods_iron'] })
  if (low('b12') || p.diets.includes('vegan')) later.push({ id: 'b12', icon: 'pill', title: 'Make sure you get B12', detail: 'B12 deficiency causes tiredness and weakness. Vegans need fortified foods or a supplement.', evidence: 'strong', sources: ['ods_b12', 'melina'] })
  if (hasCondition(p, 'hashimotos') || p.meds.thyroid) later.push({ id: 'tsh', icon: 'gauge', title: 'Ask about your thyroid levels', detail: 'Ongoing tiredness can mean your thyroid dose needs adjusting. A TSH blood test checks it.', evidence: 'strong', sources: ['niddk_hashimoto', 'jonklaas'] })
  if (p.diets.includes('keto')) later.push({ id: 'keto', icon: 'flame', title: 'Early keto fatigue', detail: 'Tiredness and headaches are common in the first weeks of very-low-carb eating while your body adapts. Drink enough water; it usually passes.', evidence: 'limited', sources: ['bueno_keto'] })
  later.push({ id: 'exercise', icon: 'dumbbell', title: 'Regular exercise', detail: 'Across trials, regular exercise raised everyday energy and lowered fatigue, even in sedentary people.', evidence: 'moderate', sources: ['puetz'] })
  later.push({ id: 'doctor', icon: 'stethoscope', title: 'See a doctor if it lasts', detail: 'Tiredness for weeks without a clear cause can come from iron deficiency, an underactive thyroid or other medical problems worth checking.', evidence: 'strong', sources: ['niddk_hashimoto', 'ods_iron'] })

  return { fixes: scored.sort((x, y) => y.score - x.score).map((x) => x.fix), later }
}
