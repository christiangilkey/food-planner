import type { IconName } from '../components/Icon'
import type { ConditionId, Domain, Evidence, FoodGroup, MenopauseStage } from '../types'
import type { RotationRule } from './rotation'
import type { SourceId } from './sources'

export interface Claim {
  text: string
  evidence: Evidence
  sources: SourceId[]
}

export interface AvoidEntry {
  foods: string[]
  reason: Claim
  /** The user can mark individual foods as tolerated (triggers vary person to person). */
  tolerable?: boolean
  /** Off by default; the user turns it on if it's one of their triggers. */
  optIn?: boolean
  /** Only applies when this profile flag is on. */
  onlyIf?: 'maoi'
}

/** Hard limits the planner must respect when the condition is on. */
export interface Limits {
  /** Daily sodium ceiling (mg) the plan must stay under every day. */
  sodiumMaxMg?: number
  /** Ideal daily sodium (mg) the plan aims for. */
  sodiumGoalMg?: number
  /** Weekly average saturated fat, as a share of calories. */
  satFatMaxPct?: number
  /** Weekly average added sugar, as a share of calories. */
  addedSugarMaxPct?: number
  /** Eggs per week. */
  eggsMaxWeek?: number
  /** No meals likely to spike then crash blood sugar. */
  noCrashMeals?: boolean
  /** Minimum minutes between the last food of the day and bedtime. */
  lastFoodBeforeBedMin?: number
  /** Protein ceiling, g per kg body weight. */
  proteinMaxPerKg?: number
}

export interface Condition {
  id: ConditionId
  label: string
  icon: IconName
  blurb: string
  limits: Limits
  /** Why each limit is set, keyed like Limits. */
  limitReasons: Partial<Record<keyof Limits, Claim>>
  avoid: AvoidEntry[]
  /** Food-frequency rules added to the weekly rotation while the condition is on. */
  rules: RotationRule[]
  /** What the plan emphasizes and why. */
  helps: Claim[]
  /** Advice that isn't about food choice. */
  guidance: Claim[]
  /** General tips that are unsafe or unhelpful with this condition. */
  suppressTips: string[]
  /** Nutrient domains the condition is most tied to (for highlighting). */
  domains: Domain[]
}

const rule = (
  id: string, label: string, groups: FoodGroup[], bound: { min?: number; max?: number },
  evidence: Evidence, sources: SourceId[], why: string, fixes: string[], extra: Partial<RotationRule> = {},
): RotationRule => ({ id, label, groups, ...bound, evidence, sources, why, domains: [], fixes, ...extra })

export const CONDITIONS: Condition[] = [
  {
    id: 'adhd', label: 'ADHD', icon: 'target', domains: ['focus', 'mood'],
    blurb: 'Plans favor low-effort, rewarding meals at set times, with stimulant-medication timing built in.',
    limits: {}, limitReasons: {},
    avoid: [],
    rules: [
      rule('adhd_fish', 'Fatty fish (ADHD)', ['fatty_fish'], { min: 2 }, 'emerging', ['bloch', 'chang_adhd'],
        'Omega-3 (mainly EPA) gave small improvements in ADHD symptoms in meta-analyses of trials.', ['salmon', 'sardines']),
    ],
    helps: [
      { text: 'Iron- and zinc-rich foods: ferritin and zinc are lower on average in ADHD. Get levels checked before supplementing.', evidence: 'emerging', sources: ['wang_iron', 'villagomez'] },
      { text: 'Low-effort, rewarding meals: ADHD involves stronger sensitivity to immediate rewards and weaker response to delayed ones, so the planner favors quick, satisfying options over effortful ones.', evidence: 'moderate', sources: ['luman'] },
    ],
    guidance: [
      { text: 'Stimulants commonly reduce appetite. Eat breakfast before the dose and plan food for when it wears off.', evidence: 'strong', sources: ['cortese'] },
      { text: 'Acidic foods and vitamin C reduce amphetamine absorption. Keep juice and vitamin C supplements apart from the dose.', evidence: 'strong', sources: ['adderall_label'] },
      { text: 'Sugar does not cause hyperactivity: controlled trials found no effect on behavior or thinking. The plan limits sugar for blood-sugar and health reasons, not ADHD.', evidence: 'strong', sources: ['wolraich'] },
    ],
    suppressTips: [],
  },
  {
    id: 'anxiety', label: 'Anxiety', icon: 'waves', domains: ['mood', 'sleep'],
    blurb: 'Steadier caffeine, regular meals, and omega-3-rich fish.',
    limits: {}, limitReasons: {},
    avoid: [],
    rules: [
      rule('anx_fish', 'Fatty fish (anxiety)', ['fatty_fish'], { min: 2 }, 'moderate', ['su_anx'],
        'Omega-3 supplementation reduced anxiety symptoms in a meta-analysis of clinical trials.', ['salmon', 'sardines']),
    ],
    helps: [
      { text: 'Magnesium-rich foods (pumpkin seeds, almonds, beans) may help mild anxiety. The evidence is weak.', evidence: 'emerging', sources: ['boyle'] },
    ],
    guidance: [
      { text: 'Caffeine increases anxiety and can trigger panic attacks in people with panic disorder. Consider less caffeine or none; the schedule keeps it to the morning.', evidence: 'moderate', sources: ['klevebrant'] },
    ],
    suppressTips: [],
  },
  {
    id: 'depression', label: 'Depression', icon: 'cloudSun', domains: ['mood', 'energy'],
    blurb: 'A Mediterranean-style pattern (fish, legumes, vegetables, olive oil, nuts), which improved depression in a randomized trial.',
    limits: {}, limitReasons: {},
    avoid: [
      {
        foods: ['cheddar', 'parmesan', 'feta', 'kimchi', 'soy_sauce', 'jerky'], onlyIf: 'maoi',
        reason: { text: 'MAOI antidepressants block the breakdown of tyramine, which is high in aged cheese, fermented soy and cabbage, and cured meat. Too much can cause a dangerous spike in blood pressure.', evidence: 'strong', sources: ['gillman', 'flockhart'] },
      },
    ],
    rules: [
      rule('dep_fish', 'Fatty fish (depression)', ['fatty_fish'], { min: 2 }, 'moderate', ['liao', 'guu'],
        'EPA-rich omega-3 improved depression symptoms in meta-analyses and is recommended by psychiatric nutrition guidelines.', ['salmon', 'sardines']),
      rule('dep_legumes', 'Legumes (Mediterranean)', ['legumes'], { min: 4 }, 'moderate', ['smiles'],
        'The SMILES diet, which improved major depression, included legumes 3–4 times a week.', ['lentils', 'chickpeas', 'black_beans']),
    ],
    helps: [
      { text: 'In the SMILES trial, people with major depression who switched to a Mediterranean-style diet improved more than a social-support control group.', evidence: 'moderate', sources: ['smiles'] },
      { text: 'Healthier dietary patterns are associated with lower depression risk.', evidence: 'moderate', sources: ['lassale'] },
      { text: 'Higher ultra-processed food intake is associated with depression, so the plan uses whole foods.', evidence: 'emerging', sources: ['lane_upf'] },
    ],
    guidance: [
      { text: 'Vitamin D supplements did not prevent depression in the large VITAL trial. Correct a deficiency for your bones, but don’t expect it to treat mood.', evidence: 'strong', sources: ['vital_dep'] },
      { text: 'If you take an MAOI, turn on the MAOI option so tyramine-rich foods are removed.', evidence: 'strong', sources: ['gillman'] },
    ],
    suppressTips: [],
  },
  {
    id: 'migraine', label: 'Migraine', icon: 'zap', domains: ['energy', 'sleep'],
    blurb: 'Regular meals with no skipping, steady caffeine, magnesium, and omega-3-rich fish. You choose your own trigger foods.',
    limits: {}, limitReasons: {},
    avoid: [
      {
        foods: ['dark_chocolate', 'cheddar', 'parmesan'], optIn: true,
        reason: { text: 'Chocolate and aged cheese are commonly reported triggers, but controlled evidence is weak and triggers differ between people. Avoid them only if they trigger you.', evidence: 'emerging', sources: ['martin_diet'] },
      },
    ],
    rules: [
      rule('mig_fish', 'Fatty fish (migraine)', ['fatty_fish'], { min: 2 }, 'moderate', ['ramsden'],
        'Raising omega-3 intake from fish reduced headache frequency in a randomized trial.', ['salmon', 'sardines']),
      rule('mig_mg', 'Magnesium-rich foods', ['nuts_seeds', 'legumes', 'leafy_greens'], { min: 10 }, 'emerging', ['aan_migraine', 'chiu_mg'],
        'Magnesium is "probably effective" for migraine prevention (AAN/AHS) and reduced migraine in trials. Food sources: seeds, nuts, beans, greens.', ['pumpkin_seeds', 'almonds', 'spinach', 'black_beans'],
        { convention: 'The guideline covers supplements; the 10-servings-a-week food target is this app’s choice.' }),
    ],
    helps: [
      { text: 'Magnesium is rated "probably effective" for preventing migraine. Supplement doses are higher than food supplies, so ask your doctor.', evidence: 'moderate', sources: ['aan_migraine', 'chiu_mg'] },
    ],
    guidance: [
      { text: 'Skipping meals is one of the most commonly reported migraine triggers. Your schedule spaces meals evenly and fasting tips are turned off.', evidence: 'moderate', sources: ['kelman'] },
      { text: 'Caffeine can both relieve and trigger migraine, and withdrawal causes headaches. Keep intake modest and consistent day to day.', evidence: 'moderate', sources: ['nowaczewska'] },
    ],
    suppressTips: ['fast'],
  },
  {
    id: 'menopause', label: 'Menopause', icon: 'flower', domains: ['bones', 'heart', 'sleep'],
    blurb: 'Bone-protecting calcium and vitamin D, protein for muscle, and heart-healthy fats, adjusted by stage.',
    limits: {}, limitReasons: {},
    avoid: [],
    rules: [
      rule('meno_calcium', 'Calcium-rich foods', ['dairy'], { min: 14 }, 'strong', ['nams_bone'],
        'NAMS advises getting calcium mainly from food (1,200 mg a day after menopause) to protect bone.', ['greek_yogurt', 'milk', 'cottage_cheese', 'sardines', 'tofu'],
        { convention: 'Two dairy servings a day is this app’s way of reaching the calcium target; calcium-set tofu and sardines also count toward calcium.' }),
    ],
    helps: [
      { text: 'Bone loss speeds up across the menopause transition. Calcium (1,200 mg a day after menopause) and vitamin D come from food first.', evidence: 'strong', sources: ['nams_bone', 'ods_calcium'] },
      { text: 'LDL cholesterol rises across the transition, so the plan favors fish, nuts, olive oil and fiber over saturated fat.', evidence: 'strong', sources: ['elkhoudary'] },
      { text: 'Enough protein (at least 1.0–1.2 g per kg) helps preserve muscle with age. Your target is set above this.', evidence: 'moderate', sources: ['protage'] },
    ],
    guidance: [
      { text: 'Caffeine was associated with more bothersome hot flashes in postmenopausal women. Notice whether it affects yours.', evidence: 'emerging', sources: ['faubion'] },
      { text: 'Soy foods and supplements are not recommended specifically for hot flashes by NAMS (2023), though soy is still a good protein. Proven hot-flash treatments include hormone and nonhormone medications and CBT.', evidence: 'strong', sources: ['nams_nonhormone'] },
    ],
    suppressTips: [],
  },
  {
    id: 'hypertension', label: 'High blood pressure', icon: 'droplet', domains: ['heart'],
    blurb: 'DASH-style eating with a hard daily sodium cap. DASH plus lower sodium lowered blood pressure in trials.',
    limits: { sodiumMaxMg: 2300, sodiumGoalMg: 1500 },
    limitReasons: {
      sodiumMaxMg: { text: 'No day may exceed 2,300 mg sodium. The ACC/AHA guideline sets an optimal goal under 1,500 mg, and cutting at least 1,000 mg a day still helps.', evidence: 'strong', sources: ['acc_htn', 'aha_sodium', 'dash_sodium'] },
    },
    avoid: [
      {
        foods: ['jerky', 'deli_turkey'],
        reason: { text: 'Cured and deli meats are among the biggest sodium sources.', evidence: 'strong', sources: ['aha_sodium', 'acc_htn'] },
      },
    ],
    rules: [
      rule('dash_fruit', 'Fruit (DASH)', ['fruit'], { min: 28 }, 'strong', ['dash'], 'DASH includes 4–5 servings of fruit a day.', ['banana', 'apple', 'berries', 'clementine']),
      rule('dash_veg', 'Vegetables (DASH)', ['vegetables', 'leafy_greens', 'cruciferous', 'red_orange_veg'], { min: 28 }, 'strong', ['dash'], 'DASH includes 4–5 servings of vegetables a day.', ['spinach', 'broccoli', 'carrots', 'sweet_potato']),
      rule('dash_dairy', 'Low-fat dairy (DASH)', ['dairy'], { min: 14 }, 'strong', ['dash'], 'DASH includes 2–3 servings of low-fat dairy a day.', ['greek_yogurt', 'milk', 'cottage_cheese']),
    ],
    helps: [
      { text: 'The DASH diet (rich in fruit, vegetables, low-fat dairy, whole grains and nuts) lowered blood pressure, and adding lower sodium lowered it further.', evidence: 'strong', sources: ['dash', 'dash_sodium'] },
      { text: 'Potassium-rich foods help lower blood pressure. With kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics, check with your doctor first.', evidence: 'strong', sources: ['ods_potassium', 'acc_htn'] },
    ],
    guidance: [],
    suppressTips: [],
  },
  {
    id: 'cholesterol', label: 'High cholesterol', icon: 'heartPulse', domains: ['heart'],
    blurb: 'Saturated fat under 6% of calories, plus foods that lower LDL: oats, nuts, soy and legumes.',
    limits: { satFatMaxPct: 6, eggsMaxWeek: 7 },
    limitReasons: {
      satFatMaxPct: { text: 'For people who need to lower LDL, AHA/ACC advise saturated fat at 5–6% of calories, replaced with unsaturated fats.', evidence: 'strong', sources: ['eckel', 'sacks_fat', 'acc_chol'] },
      eggsMaxWeek: { text: 'The AHA advisory considers up to about one egg a day acceptable, with more caution for people with high LDL or diabetes.', evidence: 'moderate', sources: ['carson_eggs'] },
    },
    avoid: [
      {
        foods: ['butter', 'jerky'],
        reason: { text: 'Butter and fatty cured meat are concentrated saturated-fat sources. The plan uses olive oil instead.', evidence: 'strong', sources: ['sacks_fat'] },
      },
    ],
    rules: [
      rule('chol_oats', 'Oats (beta-glucan)', ['whole_grain'], { min: 7 }, 'strong', ['whitehead', 'fda_oats'],
        'Oat beta-glucan (3 g a day) lowers LDL cholesterol; the FDA allows a heart-health claim for it.', ['oats'],
        { convention: 'Counts all whole grains; oats are the specific LDL-lowering grain.' }),
      rule('chol_nuts', 'Nuts (LDL)', ['nuts_seeds'], { min: 5 }, 'strong', ['delgobbo', 'portfolio'], 'Tree nuts lower LDL cholesterol in trials.', ['almonds', 'walnuts']),
      rule('chol_legumes', 'Soy & legumes (LDL)', ['legumes'], { min: 5 }, 'strong', ['soy_ldl', 'portfolio'], 'Soy protein and legumes lower LDL; they are part of the Portfolio diet.', ['tofu', 'edamame', 'lentils']),
    ],
    helps: [
      { text: 'The Portfolio diet (soluble fiber, nuts, soy protein, plant sterols) lowered LDL about as much as an early statin in a trial.', evidence: 'strong', sources: ['portfolio'] },
      { text: 'Soluble fiber lowers LDL cholesterol.', evidence: 'strong', sources: ['brown_fiber'] },
    ],
    guidance: [
      { text: 'The 2025–2030 Dietary Guidelines encourage full-fat dairy. For high cholesterol this app follows the AHA/ACC saturated-fat limit instead, so full-fat dairy is limited.', evidence: 'strong', sources: ['dga_2025', 'acc_chol'] },
    ],
    suppressTips: [],
  },
  {
    id: 'gerd', label: 'GERD / acid reflux', icon: 'flame', domains: ['sleep'],
    blurb: 'No food in the 3 hours before bed, and common trigger foods removed (you can re-allow any you tolerate).',
    limits: { lastFoodBeforeBedMin: 180 },
    limitReasons: {
      lastFoodBeforeBedMin: { text: 'The ACG guideline advises not eating within 2–3 hours of lying down; a short dinner-to-bed time was linked to more reflux.', evidence: 'moderate', sources: ['acg_gerd', 'fujiwara'] },
    },
    avoid: [
      {
        foods: ['canned_tomatoes', 'tomato', 'marinara', 'salsa', 'clementine', 'lemon', 'dark_chocolate', 'kimchi'], tolerable: true,
        reason: { text: 'Tomato, citrus, chocolate and spicy foods are common reflux triggers. The ACG advises avoiding the ones that trigger your symptoms, so re-allow any you tolerate.', evidence: 'emerging', sources: ['acg_gerd'] },
      },
    ],
    rules: [],
    helps: [
      { text: 'Weight loss reduces reflux symptoms if you carry extra weight.', evidence: 'moderate', sources: ['ness_jensen', 'acg_gerd'] },
    ],
    guidance: [
      { text: 'Raising the head of your bed helps nighttime reflux.', evidence: 'moderate', sources: ['acg_gerd'] },
      { text: 'Coffee, alcohol and carbonated drinks bother some people. Cut back on any that trigger your symptoms.', evidence: 'emerging', sources: ['acg_gerd'] },
    ],
    suppressTips: [],
  },
  {
    id: 't1d', label: 'Type 1 diabetes', icon: 'syringe', domains: ['energy'],
    blurb: 'Consistent, visible carbs per meal for insulin dosing, no blood-sugar-spiking meals, and hypoglycemia safety built in.',
    limits: { noCrashMeals: true, addedSugarMaxPct: 5 },
    limitReasons: {
      noCrashMeals: { text: 'The ADA advises minimizing added sugars and refined grains in favor of high-fiber whole foods.', evidence: 'strong', sources: ['ada_5', 'evert'] },
      addedSugarMaxPct: { text: 'The ADA advises minimizing added sugar. This app caps it at 5% of calories (its own number; the ADA gives none).', evidence: 'strong', sources: ['ada_5'] },
    },
    avoid: [],
    rules: [
      rule('dm1_legumes', 'Legumes (glycemic control)', ['legumes'], { min: 4 }, 'moderate', ['jenkins_legumes', 'reynolds_fiber_dm'], 'Legumes and fiber improve glycemic control.', ['lentils', 'chickpeas', 'black_beans']),
    ],
    helps: [
      { text: 'Carb counting (matching insulin to the grams of carbs in each meal) improves glucose control. Every meal shows its carbs.', evidence: 'strong', sources: ['ada_5', 'evert'] },
      { text: 'Higher fiber and whole grains improve glucose control in diabetes.', evidence: 'strong', sources: ['reynolds_fiber_dm'] },
    ],
    guidance: [
      { text: 'Hypoglycemia: take 15 g of fast carbs (4 oz juice or glucose tabs) and recheck in 15 minutes. Always carry some.', evidence: 'strong', sources: ['ada_6', 'ada_hypo'] },
      { text: 'Exercise can cause lows during and hours after. Check glucose before, during and after, and adjust with your care team.', evidence: 'strong', sources: ['riddell'] },
      { text: 'Don’t fast or skip meals without your diabetes team adjusting insulin.', evidence: 'strong', sources: ['ada_6'] },
    ],
    suppressTips: ['fast'],
  },
  {
    id: 't2d', label: 'Type 2 diabetes', icon: 'stethoscope', domains: ['energy', 'heart'],
    blurb: 'High-fiber, low-added-sugar meals, no spike-and-crash meals, legumes and whole grains, and walks after meals.',
    limits: { noCrashMeals: true, addedSugarMaxPct: 5 },
    limitReasons: {
      noCrashMeals: { text: 'The ADA advises minimizing added sugars and refined grains in favor of nonstarchy vegetables, legumes and whole foods.', evidence: 'strong', sources: ['ada_5', 'evert'] },
      addedSugarMaxPct: { text: 'The ADA advises minimizing added sugar. This app caps it at 5% of calories (its own number; the ADA gives none).', evidence: 'strong', sources: ['ada_5'] },
    },
    avoid: [],
    rules: [
      rule('dm2_legumes', 'Legumes (glycemic control)', ['legumes'], { min: 4 }, 'moderate', ['jenkins_legumes'], 'Adding legumes lowered HbA1c in a randomized trial.', ['lentils', 'chickpeas', 'black_beans']),
    ],
    helps: [
      { text: 'Higher fiber and whole grains improve HbA1c and fasting glucose.', evidence: 'strong', sources: ['reynolds_fiber_dm'] },
      { text: 'Walking right after meals lowered post-meal glucose more than walking at other times.', evidence: 'moderate', sources: ['reynolds_walk'] },
      { text: 'Eating vegetables and protein before carbohydrate lowered post-meal glucose.', evidence: 'moderate', sources: ['shukla'] },
    ],
    guidance: [
      { text: 'Losing 5% or more of body weight improves glucose control in type 2 diabetes.', evidence: 'strong', sources: ['ada_5', 'dpp'] },
      { text: 'On insulin or sulfonylureas, fasting raises the risk of lows. Don’t fast without your care team.', evidence: 'strong', sources: ['corley', 'ada_6'] },
    ],
    suppressTips: ['fast'],
  },
  {
    id: 'ckd', label: 'Chronic kidney disease', icon: 'bean', domains: [],
    blurb: 'Safety mode: lower protein, no creatine, no extra potassium or magnesium pushes. Work with a renal dietitian.',
    limits: { proteinMaxPerKg: 0.8 },
    limitReasons: {
      proteinMaxPerKg: { text: 'KDOQI advises limiting protein (0.55–0.8 g/kg depending on stage and diabetes) in CKD not on dialysis. Your target is capped at 0.8 g/kg; your renal team may set it lower.', evidence: 'strong', sources: ['kdoqi'] },
    },
    avoid: [],
    rules: [],
    helps: [],
    guidance: [
      { text: 'Potassium and phosphorus needs are individual in CKD. The app no longer pushes potassium-rich foods; follow your lab results and renal dietitian.', evidence: 'strong', sources: ['kdoqi', 'ods_potassium'] },
      { text: 'The kidneys clear magnesium and potassium, so take supplements of either only on medical advice.', evidence: 'strong', sources: ['ods_magnesium', 'kdoqi'] },
    ],
    suppressTips: ['creatine', 'protein_spread'],
  },
]

export const CONDITION_BY_ID = Object.fromEntries(CONDITIONS.map((c) => [c.id, c])) as Record<ConditionId, Condition>

export const MENOPAUSE_STAGES: { id: MenopauseStage; label: string; detail: string }[] = [
  { id: 'peri', label: 'Perimenopause', detail: 'Cycles becoming irregular. Periods still happen, so iron needs stay at 18 mg.' },
  { id: 'meno', label: 'Menopause', detail: 'Within about a year of your final period. Iron drops to 8 mg; calcium rises to 1,200 mg.' },
  { id: 'post', label: 'Postmenopause', detail: 'More than a year after your final period. Bone and heart protection matter most.' },
]
export const MENOPAUSE_SOURCES: SourceId[] = ['straw', 'ods_iron', 'nams_bone']
