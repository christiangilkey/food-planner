import { FOOD_BY_ID } from '../data/foods'
import { PLANT_TARGET } from '../data/rotation'
import type { SourceId } from '../data/sources'
import type { AppState, Evidence, Profile, Recipe } from '../types'
import { analyzeWeek, type NutrientReport } from './analysis'
import { avoidedFoods, dietBlocked, hasCondition, suppressedTips } from './conditions'
import { servingTotals } from './nutrition'
import { isAdhd } from './planner'
import { analyzeRotation, type RotationReport } from './rotation'
import { formatTime, mealTimes } from './schedule'

export type TipCategory = 'brain' | 'blood sugar' | 'absorption' | 'sleep & rhythm' | 'hydration' | 'ADHD' | 'gut' | 'supplements' | 'training'

export interface BioTip {
  id: string
  title: string
  text: string
  evidence: Evidence
  category: TipCategory
  sources: SourceId[]
  /** Why this tip is showing for you. */
  because?: string
}

const low = (reports: NutrientReport[], key: string) => reports.find((r) => r.info.key === key && r.status !== 'ok')

/** "a, b or c" from the foods that aren't excluded for this person. */
function foodList(p: Profile, options: [string, string][]): string {
  const avoided = avoidedFoods(p)
  const blocked = dietBlocked(p)
  const ok = options.filter(([id]) => !avoided.has(id) && !blocked.has(id) && !p.excluded.includes(id)).map(([, label]) => label)
  if (ok.length <= 1) return ok.join('')
  return `${ok.slice(0, -1).join(', ')} or ${ok[ok.length - 1]}`
}

/** Evidence-rated habits picked for this person and this week's plan, minus anything unsafe for their conditions. */
export function weeklyTips(state: AppState, nutrients = analyzeWeek(state).reports, rotation: RotationReport = analyzeRotation(state)): BioTip[] {
  const p = state.profile
  const t = mealTimes(p, p.snacksPerDay)
  const tips: BioTip[] = []
  const rule = (id: string) => rotation.rules.find((r) => r.rule.id === id)
  const vitCFoods = foodList(p, [['bell_pepper', 'bell pepper'], ['berries', 'berries'], ['clementine', 'a clementine']])

  tips.push({
    id: 'light', category: 'sleep & rhythm', evidence: 'moderate', title: 'Morning light, evening dark', sources: ['blume'],
    text: `Get outdoor light soon after waking (around ${formatTime(t.wake + 10)}) and dim lights and screens in the hour before bed. Light timing is the strongest signal for your body clock, which shapes alertness, sleep and mood.`,
  })
  tips.push({
    id: 'water', category: 'hydration', evidence: 'moderate', title: 'Drink before you’re thirsty', sources: ['wittbrodt', 'adan'],
    text: 'Dehydration of about 2% of body weight measurably impairs attention and complex thinking. Front-load water in the morning and keep a bottle in sight.',
  })
  tips.push({
    id: 'food_order', category: 'blood sugar', evidence: 'moderate', title: 'Eat veg and protein first, starch last', sources: ['shukla'],
    text: 'Same meal, different order: eating the vegetables and protein before the carbohydrate substantially lowered the post-meal glucose and insulin rise in a controlled study.',
  })
  tips.push({
    id: 'walk', category: 'blood sugar', evidence: 'strong', title: 'Walk after meals', sources: ['buffey', 'reynolds_walk'],
    text: 'Light walking after eating lowers the blood-sugar rise. In type 2 diabetes, a 10-minute walk after each meal beat one 30-minute walk at another time.',
  })
  tips.push({
    id: 'fast', category: 'sleep & rhythm', evidence: 'emerging', title: 'Finish eating a few hours before bed', sources: ['fujiwara', 'lowe_tre', 'liu_tre'],
    text: `Your schedule has dinner at ${formatTime(t.dinner)} and breakfast at ${formatTime(t.breakfast)}. Leaving a gap before bed is linked to less reflux. Stricter time-restricted eating gave no extra weight loss beyond calorie control in two randomized trials.`,
  })
  if (p.caffeine) {
    tips.push({
      id: 'caffeine', category: 'sleep & rhythm', evidence: 'strong', title: `Last caffeine by ${formatTime(t.bed - 480)}`,
      sources: hasCondition(p, 'anxiety') ? ['drake', 'klevebrant'] : ['drake'],
      text: `In a controlled study, caffeine taken 6 hours before bed still cut sleep by about an hour.${hasCondition(p, 'anxiety') ? ' Caffeine also raises anxiety, so less overall may help.' : ''}`,
    })
  }
  if (p.caffeine) {
    const lim = p.meds.pregnant ? 200 : 400
    tips.push({
      id: 'coffee', category: 'brain', evidence: 'moderate', title: `Coffee and tea: up to ${lim} mg caffeine a day`,
      sources: p.meds.pregnant ? ['acog_caffeine', 'poole_coffee'] : ['fda_caffeine', 'poole_coffee'],
      text: p.meds.pregnant
        ? 'In pregnancy, keep caffeine under 200 mg a day (about two 8-oz cups of coffee).'
        : 'For most adults up to 400 mg of caffeine a day (about two to three 12-oz cups of coffee) isn’t linked to harm. In observational studies, 3–4 cups of coffee a day were associated with lower risk of death and heart disease. Brewed green tea has about a third of coffee’s caffeine.'
          + (hasCondition(p, 'gerd') ? ' With reflux, coffee is a common trigger.' : ''),
    })
  }
  if (p.goal !== 'maintain' || p.activity === 'very' || p.activity === 'athlete' || p.workoutTime) {
    tips.push({
      id: 'protein_spread', category: 'training', evidence: 'moderate', title: 'Spread protein across meals', sources: ['mamerow', 'jager'],
      text: 'Spreading protein evenly over the day (about 30 g per meal) stimulated more muscle protein synthesis than loading it into dinner.',
    })
    tips.push({
      id: 'creatine', category: 'supplements', evidence: 'moderate', title: 'Creatine monohydrate, 3–5 g a day', sources: ['kreider', 'avgerinos'],
      text: 'The best-studied supplement for strength and muscle, with a strong safety record in healthy people. Small trials suggest benefits for short-term memory and reasoning, especially in vegetarians or when sleep-deprived. Check with your doctor first.',
    })
  }
  if (isAdhd(p)) {
    tips.push({
      id: 'decide_once', category: 'ADHD', evidence: 'moderate', title: 'Decide once, eat on autopilot', sources: ['arno', 'luman'],
      text: 'Changing the environment (what’s visible, convenient and pre-decided) shifts food choices more reliably than intentions, and immediate, easy rewards matter more with ADHD. Batch-cook on prep day and keep planned snacks visible.',
    })
  }
  if (p.stimulantMeds) {
    tips.push({
      id: 'meds_food', category: 'ADHD', evidence: 'strong', title: 'Work around your medication', sources: ['cortese', 'adderall_label'],
      text: 'Stimulants commonly suppress appetite, so eat breakfast before the dose, set reminders for meals, and plan food for when it wears off. Keep acidic juice and vitamin C away from amphetamine doses. Dry mouth is a listed side effect, so keep water nearby.',
    })
  }

  const iron = low(nutrients, 'iron')
  if ((iron || p.sex === 'female') && vitCFoods) {
    tips.push({
      id: 'iron_c', category: 'absorption', evidence: 'strong', title: 'Pair iron with vitamin C, not with coffee', sources: ['ods_iron'],
      text: `Add ${vitCFoods} to bean, lentil, spinach and cereal meals to absorb more iron. Tea and coffee lower absorption, so keep them apart.`,
      because: iron ? `Iron is ${iron.status} this week.` : 'Before menopause, women need 18 mg of iron a day versus 8 mg for men.',
    })
  }
  const vitD = low(nutrients, 'vitD')
  if (vitD) {
    tips.push({
      id: 'vitd', category: 'supplements', evidence: 'moderate', title: 'Vitamin D: test, then top up', sources: ['ods_vitD', 'dawson'],
      text: 'Food rarely covers it. Ask for a 25-hydroxyvitamin D blood test. The recommended intake is 600–800 IU (15–20 µg) a day and the upper limit is 4,000 IU; take any supplement with a meal that has fat.',
      because: `Your plan gives about ${Math.round(vitD.pct * 100)}% of your vitamin D target.`,
    })
  }
  if (hasCondition(p, 'hashimotos')) {
    const se = nutrients.find((r) => r.info.key === 'selenium')
    tips.push({
      id: 'hashi_selenium', category: 'supplements', evidence: 'moderate', title: 'Selenium: food first, one Brazil nut at most', sources: ['huwiler', 'ods_selenium'],
      text: 'Selenium lowered thyroid antibodies in Hashimoto’s trials. Seafood, eggs and sunflower seeds supply it. One Brazil nut has about 95 µg, so a handful a day, or nuts plus a supplement, can pass the 400 µg upper limit.',
      because: se ? `You have Hashimoto’s; your plan gives about ${Math.round(se.pct * 100)}% of your selenium target.` : 'You have Hashimoto’s.',
    })
  }
  const fish = rule('fatty_fish')
  const omega = low(nutrients, 'omega3')
  if ((fish && fish.status === 'short') || omega) {
    tips.push({
      id: 'omega3', category: 'brain', evidence: 'moderate', title: 'Get EPA and DHA in', sources: ['rimm', 'ods_omega3', 'liao'],
      text: 'Swap in salmon or sardines. If you won’t eat fish, fish-oil or algae-oil supplements provide EPA and DHA; EPA-predominant formulas had the clearest mood benefit.',
      because: fish && fish.status === 'short' ? `Only ${fish.servings.toFixed(1)} servings of fatty fish this week.` : 'Omega-3 is low this week.',
    })
  }
  const choline = low(nutrients, 'choline')
  if (choline && !p.excluded.includes('egg') && !dietBlocked(p).has('egg')) {
    tips.push({
      id: 'choline', category: 'brain', evidence: 'emerging', title: 'Eggs for memory chemistry', sources: ['ods_choline', 'poly'],
      text: 'Choline is used to make acetylcholine, a memory neurotransmitter. One large egg has about 147 mg.',
      because: `Choline is at ${Math.round(choline.pct * 100)}% of target.`,
    })
  }
  const mg = low(nutrients, 'magnesium')
  const mgFoods = foodList(p, [['pumpkin_seeds', 'pumpkin seeds'], ['almonds', 'almonds'], ['dark_chocolate', 'dark chocolate']])
  if (mg && mgFoods) {
    tips.push({
      id: 'magnesium', category: 'sleep & rhythm', evidence: 'emerging', title: 'Magnesium-rich snacks', sources: ['ods_magnesium', 'arab'],
      text: `${mgFoods[0].toUpperCase()}${mgFoods.slice(1)} top up magnesium. Low magnesium is linked to poorer sleep, though trial results are mixed.`,
      because: 'Magnesium is short this week.',
    })
  }
  const ferm = rule('fermented')
  const fermFoods = foodList(p, [['greek_yogurt', 'Greek yogurt'], ['kimchi', 'kimchi'], ['cheddar', 'aged cheese']])
  if (ferm && ferm.status === 'short' && fermFoods) {
    tips.push({
      id: 'fermented', category: 'gut', evidence: 'emerging', title: 'A fermented food most days', sources: ['wastyk'],
      text: `${fermFoods[0].toUpperCase()}${fermFoods.slice(1)}: a diet high in fermented foods raised gut microbe diversity and lowered inflammation markers in a Stanford trial.`,
      because: `${ferm.servings.toFixed(1)} servings this week (aim for ${ferm.min}).`,
    })
  }
  if (rotation.plants.length < PLANT_TARGET) {
    tips.push({
      id: 'plants', category: 'gut', evidence: 'emerging', title: `Chase ${PLANT_TARGET} plants a week`, sources: ['mcdonald'],
      text: 'In the American Gut Project, people eating 30+ different plants a week had more diverse gut bacteria than those eating 10 or fewer. Herbs, spices, nuts, seeds, beans and grains all count.',
      because: `Your plan has ${rotation.plants.length} different plants this week.`,
    })
  }
  if (p.workoutTime) {
    tips.push({
      id: 'workout_fuel', category: 'training', evidence: 'moderate', title: 'Fuel around training', sources: ['kerksick'],
      text: 'Carbs plus some protein in the hours before training support performance; 20–40 g protein within a couple of hours after supports recovery. Your snack is moved before your workout in the schedule.',
    })
  }
  if (p.goal === 'lose') {
    tips.push({
      id: 'slow', category: 'blood sugar', evidence: 'moderate', title: 'Eat more slowly', sources: ['robinson'],
      text: 'Slower eating reduced how much people ate in a meta-analysis of trials, without making them hungrier.',
    })
  }

  const blocked = suppressedTips(p)
  return tips.filter((t) => !blocked.has(t.id))
}

export interface MealTip { text: string; sources: SourceId[] }

/** One short, specific tip for a planned meal, or null. */
export function mealTip(r: Recipe, portion: number, p: Profile): MealTip | null {
  const t = servingTotals(r, portion)
  const diabetes = hasCondition(p, 't1d') || hasCondition(p, 't2d')
  const carbShare = (t.carbs * 4) / Math.max(1, t.kcal)
  if (diabetes && t.carbs >= 45) return { text: 'Eat the protein and vegetables first and walk 10 minutes after: both lower the post-meal glucose rise.', sources: ['shukla', 'reynolds_walk'] }
  const plantIron = r.items.some((i) => ['lentils', 'black_beans', 'chickpeas', 'spinach', 'cereal', 'tofu', 'oats', 'edamame'].includes(i.food))
  const hasHeme = r.items.some((i) => FOOD_BY_ID[i.food]?.groups.some((g) => ['red_meat', 'poultry', 'seafood'].includes(g)))
  const vitCFoods = foodList(p, [['bell_pepper', 'bell pepper'], ['berries', 'berries'], ['clementine', 'a clementine']])
  if (plantIron && !hasHeme && t.iron >= 3 && t.vitC < 25 && vitCFoods) return { text: `Iron-rich: add ${vitCFoods} to absorb more, and skip tea or coffee with it.`, sources: ['ods_iron'] }
  if (t.carbs >= 60 && carbShare > 0.5) return { text: 'Carb-heavy: eat the protein and veg first, then take a short walk after.', sources: ['shukla', 'buffey'] }
  const carotene = r.items.some((i) => ['carrots', 'sweet_potato', 'spinach'].includes(i.food))
  if (carotene && t.fat < 5) return { text: 'Add a little fat (olive oil, nuts) so you absorb the vitamin A and K.', sources: ['ods_vitA', 'ods_vitK'] }
  if (p.stimulantMeds && r.slots.includes('breakfast') && t.protein < 20) return { text: 'Before meds, add protein (an egg or Greek yogurt) to stay full once appetite drops.', sources: ['cortese', 'leidy'] }
  if (r.items.some((i) => FOOD_BY_ID[i.food]?.groups.includes('fatty_fish'))) return { text: 'Counts toward your fatty-fish servings for the week (EPA and DHA).', sources: ['rimm'] }
  return null
}

