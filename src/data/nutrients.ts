import type { IconName } from '../components/Icon'
import type { Domain, Evidence, NutrientKey, Sex } from '../types'
import type { SourceId } from './sources'

export interface Effect {
  domain: Domain
  evidence: Evidence
  /** What a shortfall does to this area. */
  what: string
  sources: SourceId[]
}

export interface Tip {
  text: string
  evidence: Evidence
  sources: SourceId[]
}

export interface NutrientInfo {
  key: NutrientKey
  label: string
  unit: string
  /** What a shortfall can lead to over time. */
  issues: string
  /** Where the daily target and upper limit come from. */
  targetSources: SourceId[]
  /** Areas of brain and body a shortfall affects, with how solid the evidence is. */
  effects: Effect[]
  /** How to absorb and use more of it. */
  absorption: Tip[]
  /** Extra context, especially ADHD-relevant notes. */
  note?: { text: string; sources: SourceId[] }
  /** Normally covered by sunlight or a supplement rather than food, so a food shortfall alone is only a "watch". */
  notFoodAlone?: boolean
}

export const DOMAINS: { id: Domain; label: string; icon: IconName; blurb: string }[] = [
  { id: 'memory', label: 'Memory', icon: 'brain', blurb: 'Learning, recall, brain fog' },
  { id: 'focus', label: 'Focus & thinking', icon: 'target', blurb: 'Attention, processing speed, critical thinking' },
  { id: 'mood', label: 'Mood & emotions', icon: 'cloudSun', blurb: 'Low mood, anxiety, irritability, emotional regulation' },
  { id: 'immunity', label: 'Immunity', icon: 'shield', blurb: 'Getting sick, recovery, wound healing' },
  { id: 'energy', label: 'Energy', icon: 'zap', blurb: 'Fatigue, stamina, cold intolerance' },
  { id: 'sleep', label: 'Sleep', icon: 'moon', blurb: 'Falling and staying asleep, restless legs' },
  { id: 'bones', label: 'Bones & muscles', icon: 'bone', blurb: 'Bone density, cramps, strength' },
  { id: 'heart', label: 'Heart & blood pressure', icon: 'heartPulse', blurb: 'Blood pressure, cholesterol, rhythm' },
]

/** Targets are US Dietary Reference Intakes (RDA or AI) for adults; `ironOverride` lets menopause staging set iron directly. */
export function dailyTarget(key: NutrientKey, sex: Sex, age: number, kcal: number, ironOverride?: number): number {
  const m = sex === 'male'
  switch (key) {
    case 'fiber': return Math.round((14 * kcal) / 1000)
    case 'calcium': return (!m && age > 50) || age > 70 ? 1200 : 1000
    case 'iron': return ironOverride ?? (m || age > 50 ? 8 : 18)
    case 'magnesium': return m ? (age <= 30 ? 400 : 420) : age <= 30 ? 310 : 320
    case 'potassium': return m ? 3400 : 2600
    case 'zinc': return m ? 11 : 8
    case 'vitA': return m ? 900 : 700
    case 'vitC': return m ? 90 : 75
    case 'vitD': return age > 70 ? 20 : 15
    case 'vitE': return 15
    case 'vitK': return m ? 120 : 90
    case 'folate': return 400
    case 'b12': return 2.4
    case 'omega3': return m ? 1.6 : 1.1
    case 'choline': return m ? 550 : 425
    case 'b6': return age <= 50 ? 1.3 : m ? 1.7 : 1.5
    case 'selenium': return 55
  }
}

export const SODIUM_LIMIT_MG = 2300
export const SODIUM_SOURCES: SourceId[] = ['nasem_sodium', 'aha_sodium']

/** Tolerable upper intake levels (adults) for nutrients where food + fortification can overshoot. */
export const UPPER_LIMITS: Partial<Record<NutrientKey, number>> = {
  iron: 45,
  zinc: 40,
  calcium: 2500,
  vitD: 100,
  selenium: 400,
  b6: 100,
}

export const NUTRIENTS: NutrientInfo[] = [
  {
    key: 'fiber', label: 'Fiber', unit: 'g', targetSources: ['nasem_macros'],
    issues: 'Constipation, bigger blood-sugar swings, less fullness after meals, and over time a higher risk of heart disease, type 2 diabetes and colorectal cancer.',
    effects: [
      { domain: 'energy', evidence: 'moderate', what: 'Fiber slows how fast carbs are absorbed. Fast-absorbed, low-fiber meals were followed by more hunger and eating in a controlled trial.', sources: ['ludwig', 'wanders'] },
      { domain: 'heart', evidence: 'strong', what: 'People eating 25–29 g a day or more had 15–30% lower heart disease and mortality in pooled studies.', sources: ['reynolds_carb'] },
    ],
    absorption: [
      { text: 'Eat vegetables and protein before the starchy part of a meal. It blunts the blood-sugar rise.', evidence: 'moderate', sources: ['shukla'] },
    ],
    note: { text: 'Fiber is one of the most reliable levers for fullness per calorie.', sources: ['wanders'] },
  },
  {
    key: 'calcium', label: 'Calcium', unit: 'mg', targetSources: ['ods_calcium'],
    issues: 'Gradual bone loss (osteopenia, then osteoporosis) and higher fracture risk. Your body pulls calcium from bone to keep blood levels normal, so a shortfall stays silent for years.',
    effects: [
      { domain: 'bones', evidence: 'strong', what: 'Bone density drops slowly and silently.', sources: ['ods_calcium'] },
      { domain: 'heart', evidence: 'moderate', what: 'Diets rich in calcium from low-fat dairy (as in DASH) lowered blood pressure.', sources: ['dash', 'ods_calcium'] },
    ],
    absorption: [
      { text: 'Your body absorbs calcium best in amounts of 500 mg or less at a time, so spread it out.', evidence: 'strong', sources: ['ods_calcium'] },
      { text: 'Calcium can reduce iron absorption. Keep large calcium sources away from your most iron-rich meal.', evidence: 'moderate', sources: ['ods_iron'] },
      { text: 'Vitamin D is needed to absorb calcium.', evidence: 'strong', sources: ['ods_calcium'] },
    ],
  },
  {
    key: 'iron', label: 'Iron', unit: 'mg', targetSources: ['ods_iron'],
    issues: 'Fatigue, weakness, poor concentration, feeling cold, and eventually iron-deficiency anemia. Menstruating women are at highest risk.',
    effects: [
      { domain: 'focus', evidence: 'moderate', what: 'Iron deficiency impairs concentration and cognitive function.', sources: ['ods_iron', 'wang_iron'] },
      { domain: 'memory', evidence: 'moderate', what: 'Iron deficiency is linked to impaired cognitive function, including memory.', sources: ['ods_iron'] },
      { domain: 'energy', evidence: 'strong', what: 'Fatigue and weakness are the classic signs.', sources: ['ods_iron'] },
      { domain: 'sleep', evidence: 'moderate', what: 'Low iron stores are a recognized, treatable contributor to restless legs at night.', sources: ['allen_rls'] },
      { domain: 'immunity', evidence: 'moderate', what: 'Iron deficiency impairs immune function.', sources: ['ods_iron'] },
    ],
    absorption: [
      { text: 'Pair plant iron (beans, lentils, spinach, fortified cereal) with vitamin C (peppers, berries, citrus) to absorb more.', evidence: 'strong', sources: ['ods_iron'] },
      { text: 'Tea and coffee reduce iron absorption. Keep them away from iron-rich meals.', evidence: 'strong', sources: ['ods_iron'] },
      { text: 'Iron from meat and fish (heme iron) is absorbed much better than iron from plants.', evidence: 'strong', sources: ['ods_iron'] },
    ],
    note: { text: 'People with ADHD have lower ferritin (stored iron) on average. Ask a doctor for a ferritin test before supplementing, because too much iron is harmful.', sources: ['wang_iron', 'konofal'] },
  },
  {
    key: 'magnesium', label: 'Magnesium', unit: 'mg', targetSources: ['ods_magnesium'],
    issues: 'Early shortfall is often silent. Lower intake is linked to high blood pressure and type 2 diabetes; severe deficiency causes cramps, weakness and abnormal heart rhythm.',
    effects: [
      { domain: 'sleep', evidence: 'emerging', what: 'Studies link low magnesium to poorer sleep, but trial results are mixed.', sources: ['arab'] },
      { domain: 'mood', evidence: 'emerging', what: 'Magnesium may ease mild anxiety; the existing studies are small and of low quality.', sources: ['boyle'] },
      { domain: 'focus', evidence: 'emerging', what: 'Magnesium is often low in children with ADHD symptoms.', sources: ['villagomez'] },
      { domain: 'energy', evidence: 'moderate', what: 'Needed to make cellular energy; deficiency causes fatigue and weakness.', sources: ['ods_magnesium'] },
      { domain: 'heart', evidence: 'moderate', what: 'Higher intake is associated with lower blood pressure.', sources: ['ods_magnesium'] },
      { domain: 'bones', evidence: 'moderate', what: 'Part of bone structure; deficiency causes cramps.', sources: ['ods_magnesium'] },
    ],
    absorption: [
      { text: 'Best food sources are pumpkin seeds, chia, almonds, beans, whole grains and dark chocolate.', evidence: 'strong', sources: ['ods_magnesium'] },
      { text: 'Supplements above 350 mg a day (the upper limit) can cause diarrhea, and very high doses cause toxicity. The kidneys clear magnesium, so with kidney disease take supplements only on medical advice.', evidence: 'strong', sources: ['ods_magnesium', 'kdoqi'] },
    ],
  },
  {
    key: 'potassium', label: 'Potassium', unit: 'mg', targetSources: ['nasem_sodium', 'ods_potassium'],
    issues: 'Higher blood pressure (especially with a high-sodium diet) and, at very low levels, muscle weakness and cramps.',
    effects: [
      { domain: 'heart', evidence: 'strong', what: 'Potassium-rich diets lower blood pressure, especially alongside less sodium.', sources: ['dash', 'nasem_sodium'] },
      { domain: 'bones', evidence: 'moderate', what: 'Low potassium causes muscle weakness and cramps.', sources: ['ods_potassium'] },
    ],
    absorption: [
      { text: 'Potatoes, beans, lentils, spinach, bananas, avocado and yogurt are easy sources.', evidence: 'strong', sources: ['ods_potassium'] },
      { text: 'If you have kidney disease or take ACE inhibitors, ARBs or potassium-sparing diuretics, check with your doctor before eating more potassium.', evidence: 'strong', sources: ['ods_potassium'] },
    ],
  },
  {
    key: 'zinc', label: 'Zinc', unit: 'mg', targetSources: ['ods_zinc'],
    issues: 'More frequent infections and slow wound healing, hair loss, loss of taste, and poor appetite.',
    effects: [
      { domain: 'immunity', evidence: 'strong', what: 'Zinc is essential for immune cells; deficiency means more infections and slower healing.', sources: ['ods_zinc'] },
      { domain: 'focus', evidence: 'emerging', what: 'Zinc is often low in children with ADHD symptoms.', sources: ['villagomez'] },
      { domain: 'mood', evidence: 'emerging', what: 'People with depression have lower blood zinc on average.', sources: ['swardfager'] },
    ],
    absorption: [
      { text: 'Phytates in beans and whole grains reduce zinc absorption; meat, seafood and eggs are absorbed best.', evidence: 'strong', sources: ['ods_zinc'] },
    ],
  },
  {
    key: 'vitA', label: 'Vitamin A', unit: 'µg', targetSources: ['ods_vitA'],
    issues: 'Night blindness, dry eyes and weaker immunity. Deficiency is rare in the US.',
    effects: [
      { domain: 'immunity', evidence: 'strong', what: 'Vitamin A maintains the linings of the gut and airways and supports immune cells.', sources: ['ods_vitA'] },
    ],
    absorption: [
      { text: 'The plant form (beta-carotene in carrots, sweet potato, spinach) needs some fat to be absorbed.', evidence: 'strong', sources: ['ods_vitA'] },
    ],
  },
  {
    key: 'vitC', label: 'Vitamin C', unit: 'mg', targetSources: ['ods_vitC'],
    issues: 'Fatigue, easy bruising, bleeding gums, slow wound healing, and poorer iron absorption. Scurvy appears only at very low intakes.',
    effects: [
      { domain: 'immunity', evidence: 'strong', what: 'Vitamin C supports immune function and wound healing.', sources: ['ods_vitC'] },
      { domain: 'energy', evidence: 'moderate', what: 'Fatigue is one of the first signs of deficiency.', sources: ['ods_vitC'] },
    ],
    absorption: [
      { text: 'Long storage and cooking reduce vitamin C. Eat some produce raw (peppers, berries, citrus).', evidence: 'strong', sources: ['ods_vitC'] },
    ],
    note: { text: 'Acidifying agents such as vitamin C and fruit juices lower absorption of amphetamine medication (such as Adderall). Keep them apart from the dose.', sources: ['adderall_label'] },
  },
  {
    key: 'vitD', label: 'Vitamin D', unit: 'µg', notFoodAlone: true, targetSources: ['ods_vitD'],
    issues: 'Weak, painful bones (osteomalacia) and higher fracture risk, plus muscle weakness. Common with little sun exposure, in winter, and in darker skin.',
    effects: [
      { domain: 'bones', evidence: 'strong', what: 'Without vitamin D you can’t absorb calcium, so bones weaken.', sources: ['ods_vitD'] },
      { domain: 'immunity', evidence: 'moderate', what: 'Vitamin D supports immune function; low levels are linked to more respiratory infections.', sources: ['ods_vitD'] },
      { domain: 'mood', evidence: 'emerging', what: 'Low levels are associated with depression in observational studies, but in the large VITAL trial, vitamin D supplements did not prevent depression.', sources: ['ods_vitD', 'vital_dep'] },
      { domain: 'energy', evidence: 'moderate', what: 'Deficiency causes muscle weakness and aches.', sources: ['ods_vitD'] },
    ],
    absorption: [
      { text: 'Vitamin D is absorbed better with a meal that contains fat.', evidence: 'moderate', sources: ['dawson'] },
      { text: 'Skin makes vitamin D from midday sun; output depends on season, latitude and skin tone, and is low in winter in northern states.', evidence: 'strong', sources: ['ods_vitD'] },
    ],
    note: { text: 'Food alone rarely covers vitamin D. Sunlight or a supplement usually fills the gap. A 25-hydroxyvitamin D blood test shows where you stand.', sources: ['ods_vitD'] },
  },
  {
    key: 'vitE', label: 'Vitamin E', unit: 'mg', targetSources: ['ods_vitE'],
    issues: 'Deficiency is rare and mostly linked to fat-malabsorption disorders; it can cause nerve and muscle damage and weaker immunity.',
    effects: [
      { domain: 'immunity', evidence: 'moderate', what: 'Vitamin E supports immune function.', sources: ['ods_vitE'] },
      { domain: 'memory', evidence: 'emerging', what: 'Older adults with more vitamin E from food had slower cognitive decline in a cohort study.', sources: ['morris_vitE'] },
    ],
    absorption: [
      { text: 'Nuts, seeds, peanut butter, spinach and vegetable oils are the main sources.', evidence: 'strong', sources: ['ods_vitE'] },
    ],
  },
  {
    key: 'vitK', label: 'Vitamin K', unit: 'µg', targetSources: ['ods_vitK'],
    issues: 'Easy bruising and bleeding, and possibly weaker bones. If you take warfarin, keep your vitamin K intake steady and talk to your doctor before changing it.',
    effects: [
      { domain: 'bones', evidence: 'moderate', what: 'Needed to make bone proteins; low intake is linked to lower bone density.', sources: ['ods_vitK'] },
      { domain: 'heart', evidence: 'emerging', what: 'May help keep calcium out of blood vessels; evidence is still limited.', sources: ['ods_vitK'] },
    ],
    absorption: [
      { text: 'Leafy greens are the richest source; vitamin K is fat-soluble, so a little fat helps.', evidence: 'moderate', sources: ['ods_vitK'] },
    ],
  },
  {
    key: 'folate', label: 'Folate', unit: 'µg', targetSources: ['ods_folate'],
    issues: 'Megaloblastic anemia (fatigue, weakness, irritability, headaches). Critical before and during pregnancy to prevent neural tube defects.',
    effects: [
      { domain: 'mood', evidence: 'moderate', what: 'Low folate status is linked to depression and poorer response to antidepressants.', sources: ['ods_folate'] },
      { domain: 'memory', evidence: 'emerging', what: 'Low folate is linked to cognitive decline, but supplement trials are mixed.', sources: ['ods_folate'] },
      { domain: 'energy', evidence: 'strong', what: 'Anemia causes fatigue and weakness.', sources: ['ods_folate'] },
    ],
    absorption: [
      { text: 'Lentils, beans, spinach and fortified grains are the richest sources.', evidence: 'strong', sources: ['ods_folate'] },
    ],
  },
  {
    key: 'b12', label: 'Vitamin B12', unit: 'µg', targetSources: ['ods_b12'],
    issues: 'Fatigue, memory problems, numbness or tingling in the hands and feet, low mood, and anemia. Nerve damage can become permanent if untreated.',
    effects: [
      { domain: 'memory', evidence: 'strong', what: 'Deficiency causes memory loss and confusion.', sources: ['ods_b12'] },
      { domain: 'focus', evidence: 'moderate', what: 'Deficiency slows thinking and concentration.', sources: ['ods_b12'] },
      { domain: 'mood', evidence: 'moderate', what: 'Deficiency is linked to depression.', sources: ['ods_b12'] },
      { domain: 'energy', evidence: 'strong', what: 'Anemia causes fatigue and weakness.', sources: ['ods_b12'] },
    ],
    absorption: [
      { text: 'Only animal and fortified foods supply B12. Vegans need fortified foods or a supplement.', evidence: 'strong', sources: ['ods_b12'] },
      { text: 'Absorption drops with age and with long-term metformin or acid-reducing medication. Ask about testing.', evidence: 'strong', sources: ['ods_b12'] },
    ],
  },
  {
    key: 'omega3', label: 'Omega-3 fats', unit: 'g', targetSources: ['ods_omega3'],
    issues: 'Low intake of the marine forms (EPA, DHA) is linked to higher cardiovascular risk. Plant omega-3 (ALA) converts poorly to EPA and DHA.',
    effects: [
      { domain: 'mood', evidence: 'moderate', what: 'EPA-rich omega-3 improved depression symptoms in meta-analyses and is recommended in psychiatric nutrition guidelines.', sources: ['liao', 'guu'] },
      { domain: 'focus', evidence: 'emerging', what: 'Small improvements in ADHD symptoms in some trials, mainly with EPA.', sources: ['bloch', 'chang_adhd'] },
      { domain: 'heart', evidence: 'strong', what: 'Eating fatty fish is linked to lower cardiovascular risk; EPA and DHA lower triglycerides.', sources: ['rimm', 'ods_omega3'] },
    ],
    absorption: [
      { text: 'Fatty fish twice a week (salmon, sardines) supplies EPA and DHA directly.', evidence: 'strong', sources: ['rimm'] },
      { text: 'Algae-based supplements provide EPA and DHA for people who don’t eat fish.', evidence: 'moderate', sources: ['ods_omega3'] },
    ],
  },
  {
    key: 'choline', label: 'Choline', unit: 'mg', targetSources: ['ods_choline'],
    issues: 'Fatty liver and muscle damage. Most Americans eat less than the recommended amount.',
    effects: [
      { domain: 'memory', evidence: 'emerging', what: 'Choline is used to make acetylcholine, a memory neurotransmitter; higher intake was linked to better memory in a large cohort.', sources: ['ods_choline', 'poly'] },
    ],
    absorption: [
      { text: 'Eggs are the richest common source; meat, fish, soy and beans also help.', evidence: 'strong', sources: ['ods_choline'] },
    ],
  },
  {
    key: 'b6', label: 'Vitamin B6', unit: 'mg', targetSources: ['ods_b6'],
    issues: 'Deficiency (uncommon) causes anemia, cracked lips, a sore tongue, depression, confusion and weaker immunity.',
    effects: [
      { domain: 'mood', evidence: 'emerging', what: 'Deficiency causes depression and confusion; supplement trials for mood are inconsistent.', sources: ['ods_b6'] },
      { domain: 'immunity', evidence: 'moderate', what: 'Deficiency weakens immune function.', sources: ['ods_b6'] },
    ],
    absorption: [
      { text: 'Poultry, fish, potatoes, chickpeas, bananas and fortified cereal are top sources. Long-term supplements above 100 mg a day can damage nerves.', evidence: 'strong', sources: ['ods_b6'] },
    ],
  },
  {
    key: 'selenium', label: 'Selenium', unit: 'µg', targetSources: ['ods_selenium'],
    issues: 'Deficiency is rare in the US; it can weaken immunity and thyroid function.',
    effects: [
      { domain: 'immunity', evidence: 'moderate', what: 'Selenium is needed for antioxidant enzymes that support immune function.', sources: ['ods_selenium'] },
      { domain: 'energy', evidence: 'moderate', what: 'Needed for thyroid hormone metabolism.', sources: ['ods_selenium'] },
    ],
    absorption: [
      { text: 'Seafood, eggs and whole grains cover it. Brazil nuts are so rich that eating many daily can exceed the upper limit.', evidence: 'strong', sources: ['ods_selenium'] },
    ],
  },
]

export const NUTRIENT_BY_KEY = Object.fromEntries(NUTRIENTS.map((n) => [n.key, n])) as Record<NutrientKey, NutrientInfo>
