import type { IconName } from '../components/Icon'
import type { ConditionId, Evidence, NutrientKey } from '../types'
import type { SourceId } from './sources'

/** Something about the person that changes whether a supplement is safe. */
export type Trigger = ConditionId | 'maoi' | 'ssri' | 'bloodThinner' | 'thyroid' | 'diabetesMeds' | 'bpMeds' | 'pregnant' | 'stimulant'

export type Goal =
  | 'gaps' | 'sleep' | 'focus' | 'mood' | 'stress' | 'heart' | 'bloodSugar' | 'bloodPressure'
  | 'migraine' | 'bones' | 'muscle' | 'immunity' | 'gut' | 'reflux' | 'skin' | 'memory'

export const GOALS: { id: Goal; label: string; icon: IconName }[] = [
  { id: 'gaps', label: 'Nutrient gaps', icon: 'puzzle' },
  { id: 'sleep', label: 'Sleep', icon: 'moon' },
  { id: 'focus', label: 'Focus', icon: 'target' },
  { id: 'mood', label: 'Mood', icon: 'cloudSun' },
  { id: 'stress', label: 'Stress & anxiety', icon: 'waves' },
  { id: 'memory', label: 'Memory', icon: 'brain' },
  { id: 'heart', label: 'Heart & cholesterol', icon: 'heartPulse' },
  { id: 'bloodPressure', label: 'Blood pressure', icon: 'droplet' },
  { id: 'bloodSugar', label: 'Blood sugar', icon: 'stethoscope' },
  { id: 'migraine', label: 'Migraine', icon: 'zap' },
  { id: 'bones', label: 'Bones & menopause', icon: 'bone' },
  { id: 'muscle', label: 'Muscle & training', icon: 'dumbbell' },
  { id: 'immunity', label: 'Immunity & colds', icon: 'shield' },
  { id: 'gut', label: 'Gut', icon: 'microscope' },
  { id: 'reflux', label: 'Reflux', icon: 'flame' },
  { id: 'skin', label: 'Skin', icon: 'sparkles' },
]

export interface Use {
  goal: Goal
  /** Conditions this use is relevant to (drives "recommended for you"). */
  conditions?: ConditionId[]
  /** Recommended when this nutrient is low in your plan. */
  nutrient?: NutrientKey
  text: string
  evidence: Evidence
  sources: SourceId[]
}

export interface Caution {
  /** Only applies to people with this trigger; omitted = applies to everyone. */
  when?: Trigger[]
  /** Unsafe for them: hidden from recommendations and marked "Not for you". */
  block?: boolean
  text: string
  sources: SourceId[]
}

export interface Supplement {
  id: string
  name: string
  forms: string
  dose: { text: string; sources: SourceId[] }
  uses: Use[]
  cautions: Caution[]
  /** Things people take it for that the evidence does not support. */
  doesntHelp?: { text: string; sources: SourceId[] }[]
}

export interface NotRecommended {
  id: string
  name: string
  claim: string
  why: string
  evidence: Evidence
  sources: SourceId[]
  goal: Goal
}

export const SUPPLEMENTS: Supplement[] = [
  // ── Nutrient gaps ───────────────────────────────────────
  {
    id: 'vitamin_d', name: 'Vitamin D3', forms: 'Capsules, softgels, drops',
    dose: { text: 'Recommended intake 600 IU (15 µg) a day to age 70, 800 IU over 70; upper limit 4,000 IU (100 µg) unless prescribed. Absorbed better with a meal that contains fat.', sources: ['ods_vitD', 'dawson'] },
    uses: [
      { goal: 'gaps', nutrient: 'vitD', text: 'Food rarely supplies enough; a supplement is the reliable way to close the gap when sun is limited.', evidence: 'strong', sources: ['ods_vitD'] },
      { goal: 'bones', conditions: ['menopause'], text: 'Needed to absorb calcium and protect bone.', evidence: 'strong', sources: ['ods_vitD', 'nams_bone'] },
    ],
    cautions: [
      { text: 'Get a 25-hydroxyvitamin D blood test to know your level before taking high doses.', sources: ['ods_vitD'] },
      { when: ['ckd'], text: 'With kidney disease, vitamin D and calcium dosing is managed by your renal team.', sources: ['kdoqi'] },
    ],
    doesntHelp: [{ text: 'Preventing depression: the VITAL trial found no benefit.', sources: ['vital_dep'] }],
  },
  {
    id: 'omega3', name: 'Omega-3 (fish oil or algae oil)', forms: 'Softgels, liquid; algae oil for vegetarians',
    dose: { text: 'About 1 g EPA+DHA a day is typical for heart health; depression trials used 1–2 g a day of EPA-predominant oil.', sources: ['ods_omega3', 'guu'] },
    uses: [
      { goal: 'mood', conditions: ['depression'], text: 'EPA-predominant omega-3 reduced depression symptoms in meta-analyses.', evidence: 'moderate', sources: ['liao', 'guu'] },
      { goal: 'stress', conditions: ['anxiety'], text: 'Reduced anxiety symptoms in a meta-analysis of trials.', evidence: 'moderate', sources: ['su_anx'] },
      { goal: 'focus', conditions: ['adhd'], text: 'Small improvements in ADHD symptoms in trials.', evidence: 'emerging', sources: ['bloch', 'chang_adhd'] },
      { goal: 'migraine', conditions: ['migraine'], text: 'More omega-3 (from fish) reduced headache frequency in a trial.', evidence: 'moderate', sources: ['ramsden'] },
      { goal: 'heart', conditions: ['cholesterol'], nutrient: 'omega3', text: 'EPA and DHA lower triglycerides.', evidence: 'strong', sources: ['ods_omega3'] },
    ],
    cautions: [
      { text: 'Doses above about 1 g a day were linked to a higher risk of atrial fibrillation in trials.', sources: ['gencer'] },
      { when: ['bloodThinner'], text: 'High doses have antiplatelet effects; discuss with your doctor if you take warfarin or similar blood thinners.', sources: ['ods_omega3'] },
    ],
  },
  {
    id: 'magnesium', name: 'Magnesium (glycinate or citrate)', forms: 'Capsules, powder',
    dose: { text: 'Supplement upper limit 350 mg a day. Migraine trials used about 600 mg, which is above that limit, so only use that dose on medical advice.', sources: ['ods_magnesium', 'aan_migraine'] },
    uses: [
      { goal: 'migraine', conditions: ['migraine'], text: 'Rated “probably effective” for preventing migraine.', evidence: 'moderate', sources: ['aan_migraine', 'chiu_mg'] },
      { goal: 'sleep', text: 'Low magnesium is linked to poorer sleep; trial results are mixed.', evidence: 'emerging', sources: ['arab'] },
      { goal: 'stress', conditions: ['anxiety'], text: 'May ease mild anxiety; studies are small and low quality.', evidence: 'emerging', sources: ['boyle'] },
      { goal: 'gaps', nutrient: 'magnesium', text: 'Fills a dietary shortfall.', evidence: 'strong', sources: ['ods_magnesium'] },
    ],
    cautions: [
      { text: 'Above 350 mg a day it commonly causes diarrhea and cramping.', sources: ['ods_magnesium'] },
      { when: ['ckd'], block: true, text: 'The kidneys clear magnesium; with kidney disease, take it only if your renal team prescribes it.', sources: ['ods_magnesium', 'kdoqi'] },
    ],
  },
  {
    id: 'iron', name: 'Iron (ferrous sulfate or bisglycinate)', forms: 'Tablets',
    dose: { text: 'Only after a blood test shows low iron or ferritin; your clinician sets the dose. Upper limit 45 mg a day for adults without a prescription.', sources: ['ods_iron'] },
    uses: [
      { goal: 'gaps', nutrient: 'iron', text: 'Corrects iron deficiency and the fatigue and poor concentration it causes.', evidence: 'strong', sources: ['ods_iron'] },
      { goal: 'sleep', text: 'Iron treatment is a guideline-recommended treatment for restless legs when stores are low.', evidence: 'strong', sources: ['allen_rls'] },
      { goal: 'focus', conditions: ['adhd'], text: 'Ferritin is lower on average in ADHD; correcting a measured deficiency matters.', evidence: 'emerging', sources: ['wang_iron', 'konofal'] },
    ],
    cautions: [
      { text: 'Don’t take iron without a test: excess iron is harmful.', sources: ['ods_iron'] },
      { when: ['thyroid'], text: 'Iron interacts with levothyroxine; take them several hours apart.', sources: ['ods_iron'] },
    ],
  },
  {
    id: 'b12', name: 'Vitamin B12', forms: 'Tablets, sublingual, fortified foods',
    dose: { text: 'Recommended intake 2.4 µg a day; no upper limit has been set.', sources: ['ods_b12'] },
    uses: [
      { goal: 'gaps', nutrient: 'b12', text: 'Essential if you eat few animal foods; absorption also falls after 50.', evidence: 'strong', sources: ['ods_b12'] },
      { goal: 'bloodSugar', conditions: ['t2d'], text: 'Long-term metformin can lower B12; the ADA advises periodic testing.', evidence: 'strong', sources: ['ada_9', 'ods_b12'] },
      { goal: 'memory', text: 'Deficiency causes memory problems and nerve damage.', evidence: 'strong', sources: ['ods_b12'] },
    ],
    cautions: [],
  },
  {
    id: 'folic_acid', name: 'Folic acid', forms: 'Tablets, prenatal vitamins',
    dose: { text: '400 µg a day for anyone who could become pregnant. Upper limit 1,000 µg a day from supplements.', sources: ['ods_folate'] },
    uses: [
      { goal: 'gaps', nutrient: 'folate', text: 'Prevents neural tube defects before and in early pregnancy.', evidence: 'strong', sources: ['ods_folate'] },
    ],
    cautions: [],
  },
  {
    id: 'calcium', name: 'Calcium (citrate or carbonate)', forms: 'Tablets, chews',
    dose: { text: 'Only to fill the gap between your food and your target, in doses of 500 mg or less (absorption is best then).', sources: ['ods_calcium', 'nams_bone'] },
    uses: [
      { goal: 'bones', conditions: ['menopause'], nutrient: 'calcium', text: 'Protects bone when food falls short; NAMS advises food first.', evidence: 'strong', sources: ['nams_bone', 'ods_calcium'] },
    ],
    cautions: [
      { text: 'Higher supplemental calcium may raise kidney-stone risk.', sources: ['ods_calcium'] },
      { when: ['thyroid'], text: 'Calcium interacts with levothyroxine; take them several hours apart.', sources: ['ods_calcium'] },
      { when: ['ckd'], text: 'With kidney disease, calcium intake is managed by your renal team.', sources: ['kdoqi'] },
    ],
  },
  {
    id: 'zinc', name: 'Zinc', forms: 'Tablets; zinc acetate lozenges for colds',
    dose: { text: 'Upper limit 40 mg a day for regular use. For colds, trials used zinc acetate lozenges (about 75 mg a day) started within a day of symptoms, for a few days only.', sources: ['ods_zinc', 'hemila_zinc'] },
    uses: [
      { goal: 'immunity', text: 'Zinc acetate lozenges shortened colds in a pooled analysis of trials.', evidence: 'moderate', sources: ['hemila_zinc'] },
      { goal: 'gaps', nutrient: 'zinc', text: 'Fills a dietary shortfall.', evidence: 'strong', sources: ['ods_zinc'] },
    ],
    cautions: [
      { text: 'Long-term excess zinc causes copper deficiency and nerve problems.', sources: ['ods_zinc'] },
    ],
  },
  {
    id: 'vitamin_c', name: 'Vitamin C', forms: 'Tablets, powder',
    dose: { text: 'Upper limit 2,000 mg a day. Regular use of at least 200 mg a day was studied for colds.', sources: ['ods_vitC', 'hemila_c'] },
    uses: [
      { goal: 'immunity', text: 'Taken regularly, it slightly shortened colds (about 8% in adults) but did not prevent them in the general population.', evidence: 'strong', sources: ['hemila_c'] },
    ],
    cautions: [
      { when: ['stimulant'], text: 'Vitamin C reduces amphetamine absorption; keep it apart from your dose.', sources: ['adderall_label'] },
      { text: 'Very high intakes have been linked to kidney stones in some people.', sources: ['ods_vitC'] },
    ],
  },
  {
    id: 'multivitamin', name: 'Daily multivitamin', forms: 'Tablets',
    dose: { text: 'One standard daily multivitamin (not high-dose “mega” formulas).', sources: ['cosmos_mind'] },
    uses: [
      { goal: 'memory', text: 'In older adults (65+), a daily multivitamin modestly improved global cognition over 3 years in the COSMOS-Mind trial.', evidence: 'emerging', sources: ['cosmos_mind'] },
    ],
    cautions: [{ when: ['bloodThinner'], text: 'Many multivitamins contain vitamin K, which affects warfarin; keep your intake consistent and tell your doctor.', sources: ['ods_vitK'] }],
  },

  // ── Brain, mood, sleep ──────────────────────────────────
  {
    id: 'melatonin', name: 'Melatonin', forms: 'Tablets, gummies',
    dose: { text: 'Trials used a range of doses; start with the lowest dose available, 1–2 hours before bed.', sources: ['ferracioli', 'nccih_melatonin'] },
    uses: [
      { goal: 'sleep', text: 'Helped people fall asleep about 7 minutes faster and sleep about 8 minutes longer: real but modest.', evidence: 'moderate', sources: ['ferracioli'] },
    ],
    cautions: [
      { text: 'Supplement contents vary widely from the label, and it can cause next-day drowsiness.', sources: ['nccih_melatonin'] },
    ],
  },
  {
    id: 'l_theanine', name: 'L-theanine', forms: 'Capsules; also in green tea',
    dose: { text: '200 mg a day in the stress trial; 100 mg with 50 mg caffeine in the focus trial.', sources: ['hidese', 'owen'] },
    uses: [
      { goal: 'stress', conditions: ['anxiety'], text: 'Reduced stress-related symptoms in a small randomized trial.', evidence: 'emerging', sources: ['hidese'] },
      { goal: 'focus', conditions: ['adhd'], text: 'With caffeine, improved attention-switching and alertness in a small trial.', evidence: 'emerging', sources: ['owen'] },
    ],
    cautions: [
      { when: ['anxiety'], text: 'Take it without caffeine: caffeine can increase anxiety and panic.', sources: ['klevebrant'] },
    ],
  },
  {
    id: 'ashwagandha', name: 'Ashwagandha (root extract)', forms: 'Capsules',
    dose: { text: 'Trials used standardized root extracts, commonly 240–600 mg a day.', sources: ['lopresti', 'ods_ashwagandha'] },
    uses: [
      { goal: 'stress', conditions: ['anxiety'], text: 'Reduced perceived stress and anxiety in several short trials.', evidence: 'emerging', sources: ['lopresti', 'ods_ashwagandha'] },
      { goal: 'sleep', text: 'Some trials report modestly better sleep.', evidence: 'emerging', sources: ['ods_ashwagandha'] },
    ],
    cautions: [
      { when: ['pregnant'], block: true, text: 'Experts advise against ashwagandha during pregnancy.', sources: ['ods_ashwagandha'] },
      { when: ['thyroid'], text: 'Ashwagandha might affect thyroid function; check with your doctor.', sources: ['ods_ashwagandha'] },
      { text: 'Rare reports of liver problems; stop if you notice yellowing skin or dark urine.', sources: ['ods_ashwagandha'] },
    ],
  },
  {
    id: 'lavender', name: 'Lavender oil capsules (Silexan)', forms: 'Capsules',
    dose: { text: 'Trials used 80–160 mg of Silexan a day.', sources: ['yap'] },
    uses: [
      { goal: 'stress', conditions: ['anxiety'], text: 'Reduced anxiety compared with placebo in a meta-analysis of trials.', evidence: 'moderate', sources: ['yap'] },
    ],
    cautions: [{ text: 'Burping and mild stomach upset are the most common side effects.', sources: ['yap'] }],
  },
  {
    id: 'saffron', name: 'Saffron extract', forms: 'Capsules',
    dose: { text: 'Most trials used 30 mg a day.', sources: ['hausenblas'] },
    uses: [
      { goal: 'mood', conditions: ['depression'], text: 'Improved depression symptoms in small trials, sometimes comparably to antidepressants; the trials were small and short.', evidence: 'emerging', sources: ['hausenblas'] },
    ],
    cautions: [],
  },
  {
    id: 'st_johns_wort', name: 'St. John’s wort', forms: 'Standardized extract tablets',
    dose: { text: 'Trials used standardized extracts; never combine with other antidepressants.', sources: ['linde_sjw'] },
    uses: [
      { goal: 'mood', conditions: ['depression'], text: 'As effective as standard antidepressants for mild to moderate depression in trials.', evidence: 'moderate', sources: ['linde_sjw', 'nccih_sjw'] },
    ],
    cautions: [
      { text: 'Interacts dangerously, sometimes life-threateningly, with many medicines, including antidepressants, birth control, blood thinners, and HIV and transplant drugs.', sources: ['nccih_sjw'] },
      { when: ['ssri', 'maoi'], block: true, text: 'Combined with antidepressants it can cause serotonin syndrome.', sources: ['nccih_sjw'] },
      { when: ['bloodThinner'], block: true, text: 'Reduces the effect of warfarin and other blood thinners.', sources: ['nccih_sjw'] },
    ],
  },
  {
    id: 'creatine', name: 'Creatine monohydrate', forms: 'Powder',
    dose: { text: '3–5 g a day; no loading phase needed.', sources: ['kreider'] },
    uses: [
      { goal: 'muscle', text: 'The best-studied supplement for strength and lean mass, with a strong safety record in healthy people.', evidence: 'strong', sources: ['kreider'] },
      { goal: 'memory', text: 'Small trials suggest benefits for short-term memory and reasoning, especially in vegetarians or when sleep-deprived.', evidence: 'emerging', sources: ['avgerinos'] },
    ],
    cautions: [{ when: ['ckd'], block: true, text: 'Not for people with kidney disease.', sources: ['kreider', 'kdoqi'] }],
  },
  {
    id: 'protein_powder', name: 'Protein powder (whey or pea)', forms: 'Powder',
    dose: { text: 'Only enough to reach your daily protein target when food falls short.', sources: ['morton', 'jager'] },
    uses: [
      { goal: 'muscle', text: 'Protein supplementation increased strength and muscle gains from resistance training.', evidence: 'strong', sources: ['morton'] },
    ],
    cautions: [{ when: ['ckd'], block: true, text: 'Protein is restricted in kidney disease.', sources: ['kdoqi'] }],
  },

  // ── Heart, blood sugar, blood pressure ──────────────────
  {
    id: 'psyllium', name: 'Psyllium husk fiber', forms: 'Powder, capsules',
    dose: { text: 'Trials commonly used about 10 g a day, split across meals, each dose with a full glass of water.', sources: ['gibb'] },
    uses: [
      { goal: 'heart', conditions: ['cholesterol'], text: 'Soluble fiber from psyllium lowers LDL cholesterol (an FDA-authorized health claim).', evidence: 'strong', sources: ['fda_oats', 'brown_fiber'] },
      { goal: 'bloodSugar', conditions: ['t2d'], text: 'Improved fasting glucose and HbA1c, most in people with the poorest control.', evidence: 'moderate', sources: ['gibb'] },
    ],
    cautions: [],
  },
  {
    id: 'plant_sterols', name: 'Plant sterols/stanols', forms: 'Fortified spreads, drinks, capsules',
    dose: { text: 'About 2 g a day with meals.', sources: ['ras'] },
    uses: [
      { goal: 'heart', conditions: ['cholesterol'], text: 'Lower LDL cholesterol by roughly 6–12% depending on dose; part of the Portfolio diet.', evidence: 'strong', sources: ['ras', 'portfolio'] },
    ],
    cautions: [],
  },
  {
    id: 'berberine', name: 'Berberine', forms: 'Capsules',
    dose: { text: 'Trials commonly used 0.5–1.5 g a day in divided doses.', sources: ['lan'] },
    uses: [
      { goal: 'bloodSugar', conditions: ['t2d'], text: 'Lowered glucose and HbA1c in pooled trials, mostly small and of mixed quality.', evidence: 'emerging', sources: ['lan'] },
      { goal: 'heart', conditions: ['cholesterol'], text: 'Lowered LDL and triglycerides in pooled trials.', evidence: 'emerging', sources: ['lan'] },
    ],
    cautions: [
      { text: 'Stomach upset and constipation are common.', sources: ['lan'] },
      { when: ['diabetesMeds'], text: 'It lowers glucose; with insulin or sulfonylureas, check glucose more often and tell your doctor.', sources: ['lan', 'ada_6'] },
    ],
  },
  {
    id: 'beetroot', name: 'Beetroot juice (dietary nitrate)', forms: 'Juice, concentrated shots',
    dose: { text: 'Trial doses varied; a daily glass of beetroot juice or a concentrated shot is typical.', sources: ['siervo'] },
    uses: [
      { goal: 'bloodPressure', conditions: ['hypertension'], text: 'Lowered systolic blood pressure by about 4 mmHg on average.', evidence: 'moderate', sources: ['siervo'] },
    ],
    cautions: [],
  },

  // ── Migraine ────────────────────────────────────────────
  {
    id: 'riboflavin', name: 'Riboflavin (vitamin B2)', forms: 'Tablets',
    dose: { text: 'Migraine trials used 400 mg a day for several months.', sources: ['aan_migraine', 'ods_riboflavin'] },
    uses: [
      { goal: 'migraine', conditions: ['migraine'], text: 'Rated “probably effective” for preventing migraine.', evidence: 'moderate', sources: ['aan_migraine'] },
    ],
    cautions: [{ text: 'Turns urine bright yellow (harmless).', sources: ['ods_riboflavin'] }],
  },
  {
    id: 'feverfew', name: 'Feverfew', forms: 'Standardized extract',
    dose: { text: 'The guideline’s rating is for a specific standardized extract (MIG-99).', sources: ['aan_migraine'] },
    uses: [
      { goal: 'migraine', conditions: ['migraine'], text: 'Rated “probably effective” for preventing migraine.', evidence: 'moderate', sources: ['aan_migraine'] },
    ],
    cautions: [
      { when: ['pregnant'], block: true, text: 'Do not take during pregnancy: it may affect uterine contractions.', sources: ['nccih_feverfew'] },
      { text: 'May interact with medicines, including some migraine drugs; check with your doctor.', sources: ['nccih_feverfew'] },
    ],
  },
  {
    id: 'coq10', name: 'Coenzyme Q10', forms: 'Softgels',
    dose: { text: 'The migraine trial used 100 mg three times a day.', sources: ['aan_migraine'] },
    uses: [
      { goal: 'migraine', conditions: ['migraine'], text: 'Rated “possibly effective” for preventing migraine.', evidence: 'emerging', sources: ['aan_migraine'] },
    ],
    cautions: [],
  },

  // ── Gut, reflux, skin ───────────────────────────────────
  {
    id: 'probiotics', name: 'Probiotics', forms: 'Capsules, fermented foods',
    dose: { text: 'Effects are strain- and dose-specific; trials used specific products.', sources: ['hempel', 'ods_probiotics'] },
    uses: [
      { goal: 'gut', text: 'Reduced antibiotic-associated diarrhea when taken alongside antibiotics.', evidence: 'moderate', sources: ['hempel'] },
    ],
    cautions: [
      { text: 'Serious infections have been reported, mostly in people who were severely ill or immunocompromised.', sources: ['ods_probiotics'] },
    ],
  },
  {
    id: 'alginate', name: 'Alginate (e.g. Gaviscon Advance)', forms: 'Liquid, chewable tablets',
    dose: { text: 'Taken after meals and at bedtime, as on the product label.', sources: ['leiman'] },
    uses: [
      { goal: 'reflux', conditions: ['gerd'], text: 'Improved reflux symptoms compared with placebo or antacids.', evidence: 'moderate', sources: ['leiman'] },
    ],
    cautions: [{ when: ['hypertension'], text: 'Check the label’s sodium: with high blood pressure, every source counts toward your daily cap.', sources: ['aha_sodium'] }],
  },
  {
    id: 'collagen', name: 'Collagen peptides (oral)', forms: 'Powder, drinks',
    dose: { text: 'Trials used about 2.5–10 g a day of hydrolyzed collagen.', sources: ['demiranda'] },
    uses: [
      { goal: 'skin', text: 'Improved skin hydration and elasticity in pooled trials.', evidence: 'emerging', sources: ['demiranda'] },
    ],
    cautions: [],
  },
]

export const NOT_RECOMMENDED: NotRecommended[] = [
  { id: 'black_cohosh', name: 'Black cohosh', goal: 'bones', claim: 'Hot flashes', evidence: 'strong', sources: ['nams_nonhormone', 'nccih_black_cohosh'], why: 'NAMS does not recommend it for hot flashes, and rare cases of serious liver damage have been reported.' },
  { id: 'soy_isoflavones', name: 'Soy isoflavone pills', goal: 'bones', claim: 'Hot flashes', evidence: 'strong', sources: ['nams_nonhormone'], why: 'NAMS does not recommend soy foods or extracts for hot flashes. Proven options include hormone therapy, nonhormone medications and CBT.' },
  { id: 'chromium_cinnamon', name: 'Chromium, cinnamon, aloe', goal: 'bloodSugar', claim: 'Blood sugar control', evidence: 'strong', sources: ['ada_5'], why: 'The ADA finds no clear evidence that these improve outcomes in diabetes without an underlying deficiency.' },
  { id: 'cocoa_extract', name: 'Cocoa flavanol extract', goal: 'memory', claim: 'Memory and cognition', evidence: 'strong', sources: ['cosmos_mind'], why: 'In the large COSMOS-Mind trial, cocoa extract did not improve cognition.' },
  { id: 'vitd_depression', name: 'Vitamin D for mood', goal: 'mood', claim: 'Preventing depression', evidence: 'strong', sources: ['vital_dep'], why: 'The VITAL trial found vitamin D supplements did not prevent depression. Correct a deficiency for bone health instead.' },
  { id: 'potassium_pills', name: 'Potassium pills', goal: 'bloodPressure', claim: 'Blood pressure', evidence: 'strong', sources: ['ods_potassium'], why: 'Over-the-counter potassium supplements contain at most 99 mg, far less than food provides. Potassium can build up to dangerous levels with kidney disease or some blood-pressure drugs, so get it from food.' },
  { id: 'high_dose_fish_oil', name: 'High-dose fish oil (>1 g/day) for prevention', goal: 'heart', claim: 'Preventing heart disease', evidence: 'moderate', sources: ['gencer'], why: 'Doses above about 1 g a day were linked to more atrial fibrillation in trials. Prescription high-dose omega-3 is for specific triglyceride problems under medical care.' },
]
