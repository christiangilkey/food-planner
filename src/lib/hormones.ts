import type { IconName } from '../components/Icon'
import type { Claim } from '../data/conditions'
import { RECIPE_BY_ID } from '../data/recipes'
import type { AppState } from '../types'
import type { WeekAnalysis } from './analysis'
import { hasCondition } from './conditions'
import { computeTargets } from './energy'
import { crashRisk, servingTotals } from './nutrition'
import { dayEntries } from './plan-utils'
import { formatTime, mealTimes } from './schedule'

export interface HormoneStat {
  label: string
  value: string
  tone?: 'good' | 'warn'
}

export interface HormoneSystem {
  id: string
  title: string
  icon: IconName
  /** What the hormones do, in a sentence or two. */
  what: string
  /** Numbers from this person's week. */
  stats: HormoneStat[]
  /** Food and habit levers with evidence. */
  levers: Claim[]
  /** Advice specific to this person's conditions, medications, sex or diet. */
  forYou: Claim[]
}

/** Hormone systems food and habits can influence, with evidence, tailored to the person and their week. */
export function hormoneSystems(state: AppState, a: WeekAnalysis): HormoneSystem[] {
  const p = state.profile
  const targets = computeTargets(p)
  const t = mealTimes(p, p.snacksPerDay)
  const keto = p.diets.includes('keto')
  const diabetes = hasCondition(p, 't1d') || hasCondition(p, 't2d')
  const fiberTarget = (targets.kcal / 1000) * 14
  const crashMeals = state.plan.reduce((n, day) => n + dayEntries(day).filter(({ entry }) => {
    const r = RECIPE_BY_ID[entry.recipe]
    return r && crashRisk(servingTotals(r, entry.portion))
  }).length, 0)
  const selenium = a.reports.find((r) => r.info.key === 'selenium')
  const kgM = (p.weightLb * 0.4536) / ((p.heightIn * 0.0254) ** 2)

  const systems: HormoneSystem[] = []

  // Insulin & blood sugar
  const sugarForYou: Claim[] = []
  if (diabetes) sugarForYou.push({ text: 'Your plan blocks meals likely to spike blood sugar and caps added sugar at 5% of calories.', evidence: 'strong', sources: ['ada_5', 'evert'] })
  if (keto) sugarForYou.push({ text: 'Keto keeps carbs, and so insulin release, low. If you take insulin or a sulfonylurea, your doses need adjusting first to avoid lows.', evidence: 'strong', sources: ['evert', 'ada_6'] })
  if (p.stimulantMeds) sugarForYou.push({ text: 'Stimulants suppress appetite, so long gaps without food are common. A planned snack when the dose wears off avoids an evening crash and binge.', evidence: 'strong', sources: ['cortese'] })
  systems.push({
    id: 'insulin', title: 'Insulin & blood sugar', icon: 'activity',
    what: 'Insulin moves sugar from your blood into your cells. Meals of fast carbs with little protein or fiber cause a big rise, then a dip that brings hunger and tiredness.',
    stats: [
      { label: 'Fiber a day', value: `${Math.round(a.fiberPerDay)} g of ${Math.round(fiberTarget)} g`, tone: a.fiberPerDay >= fiberTarget * 0.9 ? 'good' : 'warn' },
      { label: 'Spike-and-crash meals this week', value: String(crashMeals), tone: crashMeals === 0 ? 'good' : 'warn' },
      ...(keto ? [{ label: 'Net carbs a day', value: `${Math.round(a.netCarbsPerDay)} g`, tone: (a.netCarbsPerDay <= 50 ? 'good' : 'warn') as 'good' | 'warn' }] : []),
    ],
    levers: [
      { text: 'Eat the vegetables and protein on your plate before the starch: it lowered the after-meal glucose and insulin rise in a trial.', evidence: 'moderate', sources: ['shukla'] },
      { text: 'A 10-minute walk after meals lowered post-meal blood sugar more than one longer walk at another time.', evidence: 'moderate', sources: ['reynolds_walk', 'buffey'] },
      { text: 'More fiber and whole grains improve long-term blood sugar control.', evidence: 'strong', sources: ['reynolds_fiber_dm'] },
      { text: 'Fast-absorbed meals were followed by more hunger and eating later in the day than slower ones.', evidence: 'moderate', sources: ['ludwig'] },
    ],
    forYou: sugarForYou,
  })

  // Hunger & fullness
  const hungerForYou: Claim[] = []
  if (p.goal === 'lose') hungerForYou.push({ text: 'You’re losing weight, when hunger hormones push back hardest. Protein at every meal and enough sleep are the two biggest levers.', evidence: 'moderate', sources: ['leidy', 'spiegel'] })
  systems.push({
    id: 'appetite', title: 'Hunger & fullness (ghrelin, leptin, GLP-1)', icon: 'meal',
    what: 'Ghrelin drives hunger; leptin, GLP-1 and PYY signal fullness. Protein and sleep move them the most.',
    stats: [
      { label: 'Protein a day', value: `${Math.round(a.proteinPerDay)} g of ${targets.protein} g`, tone: a.proteinPerDay >= targets.protein * 0.9 ? 'good' : 'warn' },
      { label: 'Planned sleep', value: `${formatTime(t.bed)} to ${formatTime(t.wake)} (${((t.wake + 1440 - t.bed) % 1440 / 60).toFixed(1)} h)`, tone: (t.wake + 1440 - t.bed) % 1440 >= 420 ? 'good' : 'warn' },
    ],
    levers: [
      { text: 'Higher-protein meals raise fullness hormones (GLP-1, PYY), lower ghrelin and keep you full longer.', evidence: 'moderate', sources: ['leidy'] },
      { text: 'Two nights of 4 hours’ sleep lowered leptin, raised ghrelin and increased hunger by about 24%, mostly for carb-rich foods.', evidence: 'moderate', sources: ['spiegel'] },
      { text: 'People who regularly sleep less have lower leptin, higher ghrelin and a higher BMI.', evidence: 'moderate', sources: ['taheri'] },
    ],
    forYou: hungerForYou,
  })

  // Cortisol
  const cortisolForYou: Claim[] = []
  if (hasCondition(p, 'anxiety')) cortisolForYou.push({ text: 'With anxiety, less caffeine may help; caffeine increases anxiety and can trigger panic attacks.', evidence: 'moderate', sources: ['klevebrant'] })
  systems.push({
    id: 'cortisol', title: 'Cortisol & stress', icon: 'waves',
    what: 'Cortisol peaks in the morning to get you going and should fall by evening. Short sleep keeps it high at night.',
    stats: [
      { label: 'Caffeine a day (from the plan)', value: `${Math.round(a.caffeinePerDay)} mg`, tone: a.caffeinePerDay <= a.caffeineLimit ? 'good' : 'warn' },
    ],
    levers: [
      { text: 'After a night of short sleep, evening cortisol was higher the next day, which can disturb the following night’s sleep too.', evidence: 'moderate', sources: ['leproult_cortisol'] },
      { text: 'Regular exercise reliably raises feelings of energy and lowers fatigue.', evidence: 'moderate', sources: ['puetz'] },
      { text: 'Keep caffeine to the morning: even 6 hours before bed it cut sleep by about an hour.', evidence: 'moderate', sources: ['drake'] },
    ],
    forYou: cortisolForYou,
  })

  // Melatonin & body clock
  systems.push({
    id: 'melatonin', title: 'Melatonin & your body clock', icon: 'moon',
    what: 'Melatonin rises in the evening darkness and tells your body it’s night. Light is the strongest signal that sets the clock.',
    stats: [
      { label: 'Morning light', value: `by ${formatTime(t.wake + 30)}` },
      { label: 'Dim the lights', value: `from ${formatTime(t.bed - 60)}` },
      ...(p.caffeine ? [{ label: 'Caffeine cutoff', value: formatTime(t.bed - 8 * 60) }] : []),
    ],
    levers: [
      { text: 'Daylight soon after waking is the strongest signal for setting your body clock, which shapes alertness, mood and sleep.', evidence: 'moderate', sources: ['blume'] },
      { text: 'Ordinary room light before bed suppressed melatonin and shortened its duration. Dim lights and screens in the last hour.', evidence: 'moderate', sources: ['gooley'] },
    ],
    forYou: [],
  })

  // Thyroid
  const thyroidForYou: Claim[] = []
  if (hasCondition(p, 'hashimotos')) {
    thyroidForYou.push({ text: 'In Hashimoto’s, selenium lowered thyroid antibodies (and TSH before treatment) in a meta-analysis. Your plan favors seafood, eggs and seeds; one Brazil nut has about 95 µg.', evidence: 'moderate', sources: ['huwiler', 'ods_selenium'] })
    thyroidForYou.push({ text: 'Avoid kelp, seaweed snacks and iodine supplements: large amounts of iodine can worsen Hashimoto’s.', evidence: 'strong', sources: ['niddk_hashimoto'] })
  }
  if (p.meds.thyroid) thyroidForYou.push({ text: 'Your schedule puts levothyroxine on waking and breakfast 30–60 minutes later. Coffee, soy, and iron or calcium supplements reduce absorption.', evidence: 'strong', sources: ['niddk_hashimoto', 'jonklaas', 'benvenga'] })
  systems.push({
    id: 'thyroid', title: 'Thyroid', icon: 'gauge',
    what: 'Thyroid hormones set the pace of your metabolism. Making them takes iodine, and selenium helps activate them.',
    stats: selenium ? [{ label: 'Selenium a day', value: `${Math.round(selenium.perDay)} µg of ${Math.round(selenium.target)} µg (limit 400)`, tone: selenium.status === 'ok' && selenium.perDay < 400 ? 'good' : 'warn' }] : [],
    levers: [
      { text: 'Selenium comes from seafood, eggs, poultry, sunflower seeds and Brazil nuts. More than 400 µg a day is harmful.', evidence: 'strong', sources: ['ods_selenium'] },
      { text: 'Iodized salt, dairy, eggs and fish supply enough iodine. Seaweed and iodine pills can supply far too much.', evidence: 'strong', sources: ['niddk_hashimoto'] },
    ],
    forYou: thyroidForYou,
  })

  // Sex hormones
  const sexForYou: Claim[] = []
  const sexLevers: Claim[] = [
    { text: 'Eating too little for how much you exercise (low energy availability) disrupts reproductive hormones in both sexes, including menstrual cycles and testosterone, and harms bone.', evidence: 'strong', sources: ['mountjoy'] },
  ]
  if (p.sex === 'male') {
    sexLevers.unshift(
      { text: 'One week of 5-hour nights lowered daytime testosterone by 10–15% in young men.', evidence: 'moderate', sources: ['leproult_t'] },
      { text: 'Very low-fat diets lowered testosterone slightly in men compared with higher-fat diets.', evidence: 'emerging', sources: ['whittaker'] },
    )
    if (kgM >= 30) sexForYou.push({ text: 'Weight loss raised testosterone in men with obesity in a meta-analysis, more so with greater loss.', evidence: 'moderate', sources: ['corona'] })
  } else {
    if (hasCondition(p, 'menopause')) {
      sexForYou.push({ text: 'Falling estrogen speeds bone loss and raises LDL. Your plan raises calcium and favors fish, nuts, olive oil and fiber.', evidence: 'strong', sources: ['nams_bone', 'elkhoudary'] })
      sexForYou.push({ text: 'For hot flashes, proven options are hormone therapy, some nonhormone medications and CBT. Soy and black cohosh are not recommended.', evidence: 'strong', sources: ['nams_nonhormone'] })
    }
  }
  if (p.goal === 'lose' && (p.activity === 'very' || p.activity === 'athlete')) sexForYou.push({ text: 'You’re cutting calories while training hard, the classic setup for low energy availability. Your targets keep the deficit modest; watch for missed periods, low libido or frequent injuries.', evidence: 'strong', sources: ['mountjoy'] })
  systems.push({
    id: 'sex', title: p.sex === 'male' ? 'Testosterone' : 'Estrogen & your cycle', icon: p.sex === 'male' ? 'dumbbell' : 'flower',
    what: p.sex === 'male'
      ? 'Testosterone supports muscle, bone, mood and libido. Sleep, body weight and eating enough affect it most.'
      : 'Estrogen and progesterone run the menstrual cycle and protect bone and heart. Eating enough for your activity keeps them steady; they fall at menopause.',
    stats: [{ label: 'Fat, share of calories', value: `${Math.round(a.fatPct)}%`, tone: a.fatPct >= 20 ? 'good' : 'warn' }],
    levers: sexLevers,
    forYou: sexForYou,
  })

  return systems
}
