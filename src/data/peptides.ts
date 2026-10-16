import type { ConditionId } from '../types'
import type { SourceId } from './sources'
import type { Caution, Goal } from './supplements'

/**
 * Peptides people commonly use or ask about. Approved ones are prescription drugs with
 * trial evidence; "research" peptides are unapproved, so the app gives no doses for them.
 */
export type PeptideStatus = 'approved' | 'food' | 'research'

export interface Peptide {
  id: string
  name: string
  aka?: string
  status: PeptideStatus
  /** What it is approved for (approved) or what people use it for (research). */
  usedFor: string
  goals: Goal[]
  /** Conditions where it is an evidence-based option to discuss with a clinician. */
  conditions?: ConditionId[]
  /** What the human evidence actually shows. */
  evidence: string
  humanEvidence: 'strong' | 'limited' | 'none'
  risks: string
  sources: SourceId[]
  cautions: Caution[]
  /** Banned in tested sport. */
  wada?: boolean
}

export const PEPTIDES: Peptide[] = [
  // ── Approved prescription peptides ──────────────────────
  {
    id: 'semaglutide', name: 'Semaglutide', aka: 'Wegovy, Ozempic, Rybelsus', status: 'approved', goals: ['bloodSugar', 'heart'],
    conditions: ['t2d', 'hypertension', 'cholesterol'],
    usedFor: 'Prescription GLP-1 drug for type 2 diabetes, chronic weight management, and lowering cardiovascular risk in people with obesity and heart disease.',
    evidence: 'About 15% average weight loss over 68 weeks (STEP 1); 20% fewer heart attacks, strokes and cardiovascular deaths in people with obesity and heart disease (SELECT); fewer cardiovascular events in type 2 diabetes (SUSTAIN-6).',
    humanEvidence: 'strong',
    risks: 'Nausea, vomiting and diarrhea are common. Label warnings include thyroid C-cell tumors in rodents (not for people with a personal or family history of medullary thyroid cancer or MEN2), pancreatitis, gallbladder disease, and low blood sugar when combined with insulin or sulfonylureas.',
    sources: ['step1', 'select', 'sustain6', 'label_semaglutide'],
    cautions: [
      { when: ['pregnant'], block: true, text: 'Not for use during pregnancy.', sources: ['label_semaglutide'] },
      { when: ['gerd'], text: 'It slows stomach emptying; reflux and indigestion are listed side effects.', sources: ['label_semaglutide'] },
      { when: ['diabetesMeds'], text: 'Raises the risk of lows with insulin or sulfonylureas; doses usually need adjusting.', sources: ['label_semaglutide', 'ada_9'] },
      { when: ['t1d'], text: 'Not approved for type 1 diabetes.', sources: ['label_semaglutide'] },
    ],
  },
  {
    id: 'tirzepatide', name: 'Tirzepatide', aka: 'Zepbound, Mounjaro', status: 'approved', goals: ['bloodSugar'],
    conditions: ['t2d'],
    usedFor: 'Prescription GIP/GLP-1 drug for type 2 diabetes and chronic weight management.',
    evidence: 'Up to about 21% average weight loss over 72 weeks at the highest dose (SURMOUNT-1).',
    humanEvidence: 'strong',
    risks: 'Similar to semaglutide: GI side effects are common; label warnings include thyroid C-cell tumors in rodents, pancreatitis, gallbladder disease, and lows with insulin or sulfonylureas.',
    sources: ['surmount1', 'label_tirzepatide'],
    cautions: [
      { when: ['pregnant'], block: true, text: 'Not for use during pregnancy.', sources: ['label_tirzepatide'] },
      { when: ['gerd'], text: 'Slows stomach emptying; GI side effects including reflux are common.', sources: ['label_tirzepatide'] },
      { when: ['diabetesMeds'], text: 'Raises the risk of lows with insulin or sulfonylureas.', sources: ['label_tirzepatide', 'ada_9'] },
      { when: ['t1d'], text: 'Not approved for type 1 diabetes.', sources: ['label_tirzepatide'] },
    ],
  },
  {
    id: 'insulin', name: 'Insulin', status: 'approved', goals: ['bloodSugar'], conditions: ['t1d', 't2d'],
    usedFor: 'Essential, life-sustaining treatment in type 1 diabetes; used in type 2 diabetes when needed.',
    evidence: 'The foundation of type 1 diabetes care; dosing is matched to carbohydrate intake (the carbs shown on each meal).',
    humanEvidence: 'strong',
    risks: 'Hypoglycemia. Always carry fast carbs (the rule of 15).',
    sources: ['ada_9', 'ada_6'],
    cautions: [],
  },
  {
    id: 'bremelanotide', name: 'Bremelanotide', aka: 'Vyleesi, PT-141', status: 'approved', goals: ['mood'],
    usedFor: 'Prescription on-demand treatment for low sexual desire (hypoactive sexual desire disorder) in premenopausal women.',
    evidence: 'Small improvements in desire and related distress versus placebo in two phase 3 trials.',
    humanEvidence: 'strong',
    risks: 'Nausea is common; it temporarily raises blood pressure and can darken skin patches.',
    sources: ['kingsberg', 'label_bremelanotide'],
    cautions: [
      { when: ['hypertension'], block: true, text: 'Contraindicated with uncontrolled high blood pressure or known cardiovascular disease.', sources: ['label_bremelanotide'] },
      { when: ['menopause'], text: 'Approved only for premenopausal women.', sources: ['label_bremelanotide'] },
    ],
  },
  {
    id: 'tesamorelin', name: 'Tesamorelin', aka: 'Egrifta', status: 'approved', goals: ['muscle'],
    usedFor: 'Prescription growth-hormone-releasing factor analog approved to reduce excess abdominal fat in people with HIV-associated lipodystrophy. Sometimes promoted off-label for “anti-aging”, which is not an approved or proven use.',
    evidence: 'Reduced visceral abdominal fat in people with HIV in randomized trials.',
    humanEvidence: 'strong',
    risks: 'Can raise blood sugar; joint pain and injection-site reactions.',
    sources: ['falutz', 'label_tesamorelin'],
    cautions: [
      { when: ['pregnant'], block: true, text: 'Contraindicated in pregnancy.', sources: ['label_tesamorelin'] },
      { when: ['t1d', 't2d'], text: 'Can raise blood glucose.', sources: ['label_tesamorelin'] },
    ],
  },
  {
    id: 'collagen_peptides', name: 'Collagen peptides (oral)', status: 'food', goals: ['skin'],
    usedFor: 'A food supplement (digested like protein), taken for skin, hair and joints.',
    evidence: 'Improved skin hydration and elasticity in pooled trials; see the Supplements list for doses.',
    humanEvidence: 'limited',
    risks: 'Generally well tolerated.',
    sources: ['demiranda'],
    cautions: [],
  },

  // ── Unapproved "research" peptides ──────────────────────
  {
    id: 'bpc157', name: 'BPC-157', aka: '“Body protection compound”', status: 'research', goals: ['muscle', 'gut'], wada: true,
    usedFor: 'Injected or taken orally for tendon, ligament, muscle and gut healing.',
    evidence: 'A 2025 systematic review found 35 animal studies and only 1 small human study (7 of 12 people reported knee-pain relief, with no control group). There are no controlled human trials.',
    humanEvidence: 'none',
    risks: 'The FDA lists it among compounding substances that may present significant safety risks (immune reactions, impurities) and has little or no human safety data. Banned in sport.',
    sources: ['vasireddi', 'fda_cat2', 'wada'],
    cautions: [],
  },
  {
    id: 'tb500', name: 'TB-500', aka: 'Thymosin beta-4 fragment', status: 'research', goals: ['muscle'], wada: true,
    usedFor: 'Injected for injury recovery and flexibility.',
    evidence: 'The FDA has identified no human exposure data for the fragment sold as TB-500.',
    humanEvidence: 'none',
    risks: 'FDA-listed safety risk: possible immune reactions and impurities, with no human safety data. Banned in sport.',
    sources: ['fda_cat2', 'wada'],
    cautions: [],
  },
  {
    id: 'cjc1295', name: 'CJC-1295', status: 'research', goals: ['muscle'], wada: true,
    usedFor: 'Injected to raise growth hormone for muscle, fat loss and “anti-aging”.',
    evidence: 'Raised growth hormone and IGF-1 levels in a small study in healthy adults; no trials show benefits for body composition, strength or aging.',
    humanEvidence: 'limited',
    risks: 'The FDA has identified serious adverse events, including increased heart rate and systemic vasodilatory reactions. Banned in sport.',
    sources: ['teichman', 'fda_cat2', 'wada'],
    cautions: [],
  },
  {
    id: 'ipamorelin', name: 'Ipamorelin', status: 'research', goals: ['muscle'], wada: true,
    usedFor: 'Injected (often with CJC-1295) to raise growth hormone.',
    evidence: 'No trials show muscle, fat-loss or longevity benefits.',
    humanEvidence: 'none',
    risks: 'The FDA notes serious adverse events, including death, when given intravenously in a study for gut motility, and no safety data for other injected uses. Banned in sport.',
    sources: ['fda_cat2', 'wada'],
    cautions: [],
  },
  {
    id: 'ghkcu', name: 'GHK-Cu', aka: 'Copper peptide', status: 'research', goals: ['skin'],
    usedFor: 'Skin creams and serums (cosmetic), or injected for skin and hair.',
    evidence: 'Evidence is mostly laboratory and cell studies, with few controlled human trials.',
    humanEvidence: 'limited',
    risks: 'The FDA lists injectable GHK-Cu as a safety risk (immune reactions, impurities) with limited human data. Cosmetic topical use is a different, lower-risk route.',
    sources: ['pickart', 'fda_cat2'],
    cautions: [],
  },
  {
    id: 'semax_selank', name: 'Semax & Selank', status: 'research', goals: ['focus', 'stress'],
    usedFor: 'Nasal sprays marketed for focus (Semax) and anxiety (Selank).',
    evidence: 'Human data are limited; the FDA has no or limited human safety information for either.',
    humanEvidence: 'none',
    risks: 'The FDA lists both as safety risks with no or limited human safety information.',
    sources: ['fda_cat2'],
    cautions: [],
  },
  {
    id: 'epitalon', name: 'Epitalon', status: 'research', goals: ['memory'],
    usedFor: 'Marketed for longevity and “telomere” effects.',
    evidence: 'No approved use, and human data are lacking.',
    humanEvidence: 'none',
    risks: 'The FDA has not identified human safety information for it and lists it as a safety risk.',
    sources: ['fda_cat2'],
    cautions: [],
  },
  {
    id: 'mots_c', name: 'MOTS-c', status: 'research', goals: ['bloodSugar', 'muscle'],
    usedFor: 'Marketed for metabolism, insulin sensitivity and endurance.',
    evidence: 'The FDA has identified no human exposure data.',
    humanEvidence: 'none',
    risks: 'FDA-listed significant risk of immune reactions; no human safety data.',
    sources: ['fda_cat2'],
    cautions: [],
  },
  {
    id: 'aod9604', name: 'AOD-9604', status: 'research', goals: ['muscle'],
    usedFor: 'Marketed for fat loss.',
    evidence: 'No approved use; the FDA has little or no safety information.',
    humanEvidence: 'limited',
    risks: 'The FDA has identified serious adverse events that may be associated with it, though causality is unclear.',
    sources: ['fda_cat2'],
    cautions: [],
  },
  {
    id: 'melanotan2', name: 'Melanotan II', status: 'research', goals: ['skin'],
    usedFor: 'Injected for tanning and libido.',
    evidence: 'Unapproved; no evidence it is safe for these uses.',
    humanEvidence: 'none',
    risks: 'Published case reports describe melanoma, a brain-swelling syndrome (PRES), sympathomimetic toxicity and priapism.',
    sources: ['fda_cat2'],
    cautions: [],
  },
  {
    id: 'other_research', name: 'Kisspeptin-10, LL-37, Dihexa, DSIP, PEG-MGF', status: 'research', goals: ['muscle', 'memory', 'sleep', 'immunity'],
    usedFor: 'Marketed online for fertility, immunity, cognition, sleep and muscle growth.',
    evidence: 'The FDA has no or limited human safety data for any of them, and for several (Dihexa, PEG-MGF) it has found no human exposure data at all.',
    humanEvidence: 'none',
    risks: 'All are on the FDA list of compounding substances that may present significant safety risks.',
    sources: ['fda_cat2'],
    cautions: [],
  },
]
