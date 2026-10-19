/**
 * Every source the app cites. PubMed IDs were checked against PubMed's own records
 * (October 2026); web pages were opened to confirm they exist.
 */
export type SourceKind = 'guideline' | 'meta-analysis' | 'trial' | 'cohort' | 'review' | 'reference' | 'regulation'

export interface Source {
  /** Short label shown inline, e.g. "Shukla 2015". */
  label: string
  title: string
  where: string
  year: number
  url: string
  kind: SourceKind
}

const pm = (id: number) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`
const ods = (slug: string) => `https://ods.od.nih.gov/factsheets/${slug}-HealthProfessional/`

function s(label: string, title: string, where: string, year: number, url: string, kind: SourceKind): Source {
  return { label, title, where, year, url, kind }
}

export const SOURCES = {
  // ── Food data ───────────────────────────────────────────
  usda_fdc: s('USDA FoodData Central', 'FoodData Central (SR Legacy and FNDDS)', 'U.S. Department of Agriculture', 2024, 'https://fdc.nal.usda.gov/', 'reference'),

  // ── Reference intakes ────────────────────────────────────
  ods_calcium: s('NIH ODS: Calcium', 'Calcium – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Calcium'), 'reference'),
  ods_iron: s('NIH ODS: Iron', 'Iron – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Iron'), 'reference'),
  ods_magnesium: s('NIH ODS: Magnesium', 'Magnesium – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Magnesium'), 'reference'),
  ods_potassium: s('NIH ODS: Potassium', 'Potassium – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Potassium'), 'reference'),
  ods_zinc: s('NIH ODS: Zinc', 'Zinc – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Zinc'), 'reference'),
  ods_vitA: s('NIH ODS: Vitamin A', 'Vitamin A and Carotenoids – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminA'), 'reference'),
  ods_vitC: s('NIH ODS: Vitamin C', 'Vitamin C – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminC'), 'reference'),
  ods_vitD: s('NIH ODS: Vitamin D', 'Vitamin D – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminD'), 'reference'),
  ods_vitE: s('NIH ODS: Vitamin E', 'Vitamin E – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminE'), 'reference'),
  ods_vitK: s('NIH ODS: Vitamin K', 'Vitamin K – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminK'), 'reference'),
  ods_folate: s('NIH ODS: Folate', 'Folate – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Folate'), 'reference'),
  ods_b12: s('NIH ODS: Vitamin B12', 'Vitamin B12 – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminB12'), 'reference'),
  ods_omega3: s('NIH ODS: Omega-3', 'Omega-3 Fatty Acids – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Omega3FattyAcids'), 'reference'),
  ods_choline: s('NIH ODS: Choline', 'Choline – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Choline'), 'reference'),
  ods_b6: s('NIH ODS: Vitamin B6', 'Vitamin B6 – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('VitaminB6'), 'reference'),
  ods_selenium: s('NIH ODS: Selenium', 'Selenium – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Selenium'), 'reference'),
  ods_iodine: s('NIH ODS: Iodine', 'Iodine – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Iodine'), 'reference'),
  ods_biotin: s('NIH ODS: Biotin', 'Biotin – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2022, ods('Biotin'), 'reference'),
  nasem_macros: s('NASEM 2005 (macronutrients)', 'Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids', 'National Academies Press', 2005, 'https://nap.nationalacademies.org/catalog/10490/dietary-reference-intakes-for-energy-carbohydrate-fiber-fat-fatty-acids-cholesterol-protein-and-amino-acids', 'reference'),
  nasem_water: s('NASEM 2005 (water)', 'Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate', 'National Academies Press', 2005, 'https://nap.nationalacademies.org/catalog/10925/dietary-reference-intakes-for-water-potassium-sodium-chloride-and-sulfate', 'reference'),
  nasem_sodium: s('NASEM 2019 (sodium & potassium)', 'Dietary Reference Intakes for Sodium and Potassium', 'National Academies Press', 2019, 'https://nap.nationalacademies.org/catalog/25353/dietary-reference-intakes-for-sodium-and-potassium', 'reference'),
  dga_2025: s('Dietary Guidelines 2025–2030', 'Dietary Guidelines for Americans, 2025–2030', 'USDA & HHS', 2026, 'https://realfood.gov/', 'guideline'),
  dga_home: s('DietaryGuidelines.gov', 'Dietary Guidelines for Americans (current and previous editions)', 'USDA & HHS', 2026, 'https://www.dietaryguidelines.gov/', 'guideline'),
  aha_sodium: s('AHA: sodium', 'How much sodium should I eat per day?', 'American Heart Association', 2024, 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/how-much-sodium-should-i-eat-per-day', 'guideline'),

  // ── Energy, protein, satiety ─────────────────────────────
  mifflin: s('Mifflin 1990', 'A new predictive equation for resting energy expenditure in healthy individuals', 'Am J Clin Nutr', 1990, pm(2305711), 'trial'),
  jensen: s('AHA/ACC/TOS 2013 obesity guideline', '2013 AHA/ACC/TOS guideline for the management of overweight and obesity in adults', 'Circulation', 2014, pm(24222017), 'guideline'),
  jager: s('ISSN protein 2017', 'International Society of Sports Nutrition position stand: protein and exercise', 'J Int Soc Sports Nutr', 2017, pm(28642676), 'guideline'),
  morton: s('Morton 2018', 'Protein supplementation and resistance-training gains: meta-analysis', 'Br J Sports Med', 2018, pm(28698222), 'meta-analysis'),
  leidy: s('Leidy 2015', 'The role of protein in weight loss and maintenance', 'Am J Clin Nutr', 2015, pm(25926512), 'review'),
  iraki: s('Iraki 2019', 'Nutrition recommendations for bodybuilders in the off-season', 'Sports (Basel)', 2019, pm(31247944), 'review'),
  holt: s('Holt 1995', 'A satiety index of common foods', 'Eur J Clin Nutr', 1995, pm(7498104), 'trial'),
  rolls: s('Rolls 2009', 'The relationship between dietary energy density and energy intake', 'Physiol Behav', 2009, pm(19303887), 'review'),
  wanders: s('Wanders 2011', 'Dietary fibre, subjective appetite, energy intake and body weight: systematic review of RCTs', 'Obes Rev', 2011, pm(21676152), 'meta-analysis'),
  ludwig: s('Ludwig 1999', 'High glycemic index foods, overeating, and obesity', 'Pediatrics', 1999, pm(10049982), 'trial'),
  robinson: s('Robinson 2014', 'Effect of eating rate on energy intake and hunger: meta-analysis', 'Am J Clin Nutr', 2014, pm(24847856), 'meta-analysis'),
  mamerow: s('Mamerow 2014', 'Dietary protein distribution and 24-h muscle protein synthesis', 'J Nutr', 2014, pm(24477298), 'trial'),
  kerksick: s('ISSN nutrient timing 2017', 'ISSN position stand: nutrient timing', 'J Int Soc Sports Nutr', 2017, pm(28919842), 'guideline'),
  kreider: s('ISSN creatine 2017', 'ISSN position stand: safety and efficacy of creatine supplementation', 'J Int Soc Sports Nutr', 2017, pm(28615996), 'guideline'),
  avgerinos: s('Avgerinos 2018', 'Creatine supplementation and cognitive function: systematic review of RCTs', 'Exp Gerontol', 2018, pm(29704637), 'meta-analysis'),

  // ── Water, sleep, rhythm, blood sugar ────────────────────
  acsm_fluid: s('ACSM 2007 fluids', 'ACSM position stand: exercise and fluid replacement', 'Med Sci Sports Exerc', 2007, pm(17277604), 'guideline'),
  wittbrodt: s('Wittbrodt 2018', 'Dehydration impairs cognitive performance: a meta-analysis', 'Med Sci Sports Exerc', 2018, pm(29933347), 'meta-analysis'),
  adan: s('Adan 2012', 'Cognitive performance and dehydration', 'J Am Coll Nutr', 2012, pm(22855911), 'review'),
  drake: s('Drake 2013', 'Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed', 'J Clin Sleep Med', 2013, pm(24235903), 'trial'),
  blume: s('Blume 2019', 'Effects of light on human circadian rhythms, sleep and mood', 'Somnologie', 2019, pm(31534436), 'review'),
  shukla: s('Shukla 2015', 'Food order has a significant impact on postprandial glucose and insulin levels', 'Diabetes Care', 2015, pm(26106234), 'trial'),
  buffey: s('Buffey 2022', 'Interrupting prolonged sitting with standing or light walking: effects on cardiometabolic risk markers', 'Sports Med', 2022, pm(35147898), 'meta-analysis'),
  reynolds_walk: s('Reynolds 2016', 'Advice to walk after meals lowers postprandial glycaemia in type 2 diabetes', 'Diabetologia', 2016, pm(27747394), 'trial'),
  lowe_tre: s('Lowe 2020 (TREAT)', 'Time-restricted eating and weight loss: randomized clinical trial', 'JAMA Intern Med', 2020, pm(32986097), 'trial'),
  liu_tre: s('Liu 2022', 'Calorie restriction with or without time-restricted eating in weight loss', 'N Engl J Med', 2022, pm(35443107), 'trial'),
  fujiwara: s('Fujiwara 2005', 'Association between dinner-to-bed time and gastro-esophageal reflux disease', 'Am J Gastroenterol', 2005, pm(16393212), 'cohort'),
  arno: s('Arno 2016', 'Nudge strategies and adult dietary behaviour: systematic review and meta-analysis', 'BMC Public Health', 2016, pm(27475752), 'meta-analysis'),

  // ── Food groups and rotation ─────────────────────────────
  rimm: s('AHA 2018 seafood advisory', 'Seafood long-chain n-3 PUFAs and cardiovascular disease: AHA science advisory', 'Circulation', 2018, pm(29773586), 'guideline'),
  cdc_listeria: s('CDC: preventing Listeria', 'Preventing Listeria infection', 'U.S. Centers for Disease Control and Prevention', 2025, 'https://www.cdc.gov/listeria/prevention/index.html', 'guideline'),
  fda_fish: s('FDA/EPA fish advice', 'Advice about eating fish', 'U.S. Food & Drug Administration', 2024, 'https://www.fda.gov/food/consumers/advice-about-eating-fish', 'guideline'),
  wcrf_meat: s('WCRF: red & processed meat', 'Limit red and processed meat', 'World Cancer Research Fund', 2018, 'https://www.wcrf.org/research-policy/evidence-for-our-recommendations/limit-red-processed-meat/', 'guideline'),
  iarc: s('IARC 2015', 'Carcinogenicity of consumption of red and processed meat', 'Lancet Oncol', 2015, pm(26514947), 'review'),
  afshin: s('Afshin 2014', 'Nuts, legumes and risk of heart disease, stroke and diabetes: meta-analysis', 'Am J Clin Nutr', 2014, pm(24898241), 'meta-analysis'),
  guasch: s('Guasch-Ferré 2017', 'Nut consumption and risk of cardiovascular disease', 'J Am Coll Cardiol', 2017, pm(29145952), 'cohort'),
  predimed: s('PREDIMED 2018', 'Primary prevention of CVD with a Mediterranean diet with olive oil or nuts', 'N Engl J Med', 2018, pm(29897866), 'trial'),
  morris_greens: s('Morris 2018', 'Green leafy vegetables and cognitive decline: prospective study', 'Neurology', 2018, pm(29263222), 'cohort'),
  higdon: s('Higdon 2007', 'Cruciferous vegetables and human cancer risk', 'Pharmacol Res', 2007, pm(17317210), 'review'),
  aune_fv: s('Aune 2017', 'Fruit and vegetable intake and CVD, cancer and mortality: meta-analysis', 'Int J Epidemiol', 2017, pm(28338764), 'meta-analysis'),
  aune_wg: s('Aune 2016', 'Whole grain consumption and CVD, cancer and mortality: meta-analysis', 'BMJ', 2016, pm(27301975), 'meta-analysis'),
  reynolds_carb: s('Reynolds 2019', 'Carbohydrate quality and human health: systematic reviews and meta-analyses', 'Lancet', 2019, pm(30638909), 'meta-analysis'),
  devore: s('Devore 2012', 'Dietary intakes of berries and flavonoids in relation to cognitive decline', 'Ann Neurol', 2012, pm(22535616), 'cohort'),
  fda_arsenic: s('FDA: arsenic in food', 'Arsenic in food', 'U.S. Food & Drug Administration', 2024, 'https://www.fda.gov/food/environmental-contaminants-food/arsenic-food', 'guideline'),
  wastyk: s('Wastyk 2021', 'Gut-microbiota-targeted diets modulate human immune status', 'Cell', 2021, pm(34256014), 'trial'),
  mcdonald: s('McDonald 2018', 'American Gut: an open platform for citizen science microbiome research', 'mSystems', 2018, pm(29795809), 'cohort'),
  lane_upf: s('Lane 2024', 'Ultra-processed food exposure and adverse health outcomes: umbrella review', 'BMJ', 2024, pm(38418082), 'meta-analysis'),

  // ── Nutrient effects ─────────────────────────────────────
  wang_iron: s('Wang 2017', 'Iron status in ADHD: systematic review and meta-analysis', 'PLoS One', 2017, pm(28046016), 'meta-analysis'),
  konofal: s('Konofal 2004', 'Iron deficiency in children with ADHD', 'Arch Pediatr Adolesc Med', 2004, pm(15583094), 'cohort'),
  allen_rls: s('IRLSSG 2018', 'Guidelines for the iron treatment of restless legs syndrome', 'Sleep Med', 2018, pm(29425576), 'guideline'),
  villagomez: s('Villagomez 2014', 'Iron, magnesium, vitamin D and zinc deficiencies in children with ADHD symptoms', 'Children (Basel)', 2014, pm(27417479), 'review'),
  swardfager: s('Swardfager 2013', 'Zinc in depression: a meta-analysis', 'Biol Psychiatry', 2013, pm(23806573), 'meta-analysis'),
  boyle: s('Boyle 2017', 'Magnesium supplementation and subjective anxiety and stress: systematic review', 'Nutrients', 2017, pm(28445426), 'meta-analysis'),
  arab: s('Arab 2023', 'The role of magnesium in sleep health: systematic review', 'Biol Trace Elem Res', 2023, pm(35184264), 'review'),
  poly: s('Poly 2011', 'Dietary choline and cognitive performance (Framingham Offspring)', 'Am J Clin Nutr', 2011, pm(22071706), 'cohort'),
  morris_vitE: s('Morris 2002', 'Vitamin E and cognitive decline in older persons', 'Arch Neurol', 2002, pm(12117360), 'cohort'),
  dawson: s('Dawson-Hughes 2015', 'Dietary fat increases vitamin D3 absorption', 'J Acad Nutr Diet', 2015, pm(25441954), 'trial'),
  vital_dep: s('VITAL-DEP 2020', 'Long-term vitamin D3 supplementation vs placebo and risk of depression', 'JAMA', 2020, pm(32749491), 'trial'),
  liao: s('Liao 2019', 'Efficacy of omega-3 PUFAs in depression: meta-analysis', 'Transl Psychiatry', 2019, pm(31383846), 'meta-analysis'),
  guu: s('ISNPR 2019', 'ISNPR practice guidelines for omega-3 fatty acids in depression', 'Psychother Psychosom', 2019, pm(31480057), 'guideline'),
  su_anx: s('Su 2018', 'Omega-3 PUFAs and anxiety symptoms: systematic review and meta-analysis', 'JAMA Netw Open', 2018, pm(30646157), 'meta-analysis'),
  bloch: s('Bloch 2011', 'Omega-3 supplementation for children with ADHD: meta-analysis', 'J Am Acad Child Adolesc Psychiatry', 2011, pm(21961774), 'meta-analysis'),
  chang_adhd: s('Chang 2018', 'Omega-3 PUFAs in youths with ADHD: systematic review and meta-analysis', 'Neuropsychopharmacology', 2018, pm(28741625), 'meta-analysis'),

  // ── ADHD ────────────────────────────────────────────────
  cortese: s('Cortese 2018', 'Comparative efficacy and tolerability of ADHD medications: network meta-analysis', 'Lancet Psychiatry', 2018, pm(30097390), 'meta-analysis'),
  adderall_label: s('Adderall label (DailyMed)', 'Amphetamine mixed salts prescribing information', 'NIH DailyMed', 2024, 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=adderall', 'regulation'),
  luman: s('Luman 2005', 'The impact of reinforcement contingencies on ADHD', 'Clin Psychol Rev', 2005, pm(15642646), 'review'),
  wolraich: s('Wolraich 1995', 'The effect of sugar on behavior or cognition in children: meta-analysis', 'JAMA', 1995, pm(7474248), 'meta-analysis'),

  // ── Mental health ───────────────────────────────────────
  smiles: s('SMILES 2017', 'Dietary improvement for adults with major depression (SMILES trial)', 'BMC Med', 2017, pm(28137247), 'trial'),
  lassale: s('Lassale 2019', 'Healthy dietary indices and risk of depressive outcomes: meta-analysis', 'Mol Psychiatry', 2019, pm(30254236), 'meta-analysis'),
  klevebrant: s('Klevebrant 2022', 'Caffeine, anxiety and panic attacks in panic disorder: meta-analysis', 'Gen Hosp Psychiatry', 2022, pm(34871964), 'meta-analysis'),
  gillman: s('Gillman 2018', 'Safety profile of MAOIs: tyramine reassessed', 'J Neural Transm', 2018, pm(30255284), 'review'),
  flockhart: s('Flockhart 2012', 'Dietary restrictions and drug interactions with MAOIs: an update', 'J Clin Psychiatry', 2012, pm(22951238), 'review'),

  // ── Hypertension, cholesterol ───────────────────────────
  dash: s('DASH 1997', 'A clinical trial of the effects of dietary patterns on blood pressure', 'N Engl J Med', 1997, pm(9099655), 'trial'),
  dash_sodium: s('DASH-Sodium 2001', 'Effects on blood pressure of reduced sodium and the DASH diet', 'N Engl J Med', 2001, pm(11136953), 'trial'),
  acc_htn: s('ACC/AHA 2017 hypertension guideline', '2017 ACC/AHA guideline for high blood pressure in adults', 'Hypertension', 2018, pm(29133356), 'guideline'),
  acc_chol: s('AHA/ACC 2018 cholesterol guideline', '2018 AHA/ACC guideline on the management of blood cholesterol', 'Circulation', 2019, pm(30586774), 'guideline'),
  eckel: s('AHA/ACC 2013 lifestyle guideline', '2013 AHA/ACC guideline on lifestyle management to reduce cardiovascular risk', 'Circulation', 2014, pm(24222015), 'guideline'),
  sacks_fat: s('AHA 2017 dietary fats', 'Dietary fats and cardiovascular disease: AHA presidential advisory', 'Circulation', 2017, pm(28620111), 'guideline'),
  carson_eggs: s('AHA 2020 dietary cholesterol', 'Dietary cholesterol and cardiovascular risk: AHA science advisory', 'Circulation', 2020, pm(31838890), 'guideline'),
  whitehead: s('Whitehead 2014', 'Cholesterol-lowering effects of oat β-glucan: meta-analysis of RCTs', 'Am J Clin Nutr', 2014, pm(25411276), 'meta-analysis'),
  fda_oats: s('FDA oat claim (21 CFR 101.81)', 'Health claims: soluble fiber from certain foods and risk of coronary heart disease', 'Code of Federal Regulations', 2024, 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-E/section-101.81', 'regulation'),
  brown_fiber: s('Brown 1999', 'Cholesterol-lowering effects of dietary fiber: meta-analysis', 'Am J Clin Nutr', 1999, pm(9925120), 'meta-analysis'),
  portfolio: s('Jenkins 2003 (Portfolio)', 'Dietary portfolio of cholesterol-lowering foods vs lovastatin', 'JAMA', 2003, pm(12876093), 'trial'),
  delgobbo: s('Del Gobbo 2015', 'Tree nuts and blood lipids: meta-analysis', 'Am J Clin Nutr', 2015, pm(26561616), 'meta-analysis'),
  soy_ldl: s('Blanco Mejia 2019', 'Soy protein decreases LDL cholesterol: meta-analysis of 46 trials', 'J Nutr', 2019, pm(31006811), 'meta-analysis'),

  // ── Diabetes ────────────────────────────────────────────
  ada_5: s('ADA Standards 2024 §5', 'Facilitating positive health behaviors: Standards of Care in Diabetes 2024', 'Diabetes Care', 2024, pm(38078584), 'guideline'),
  ada_6: s('ADA Standards 2024 §6', 'Glycemic goals and hypoglycemia: Standards of Care in Diabetes 2024', 'Diabetes Care', 2024, pm(38078586), 'guideline'),
  evert: s('ADA nutrition consensus 2019', 'Nutrition therapy for adults with diabetes or prediabetes: consensus report', 'Diabetes Care', 2019, pm(31000505), 'guideline'),
  dpp: s('DPP 2002', 'Reduction in incidence of type 2 diabetes with lifestyle intervention or metformin', 'N Engl J Med', 2002, pm(11832527), 'trial'),
  reynolds_fiber_dm: s('Reynolds 2020', 'Dietary fibre and whole grains in diabetes management: meta-analyses', 'PLoS Med', 2020, pm(32142510), 'meta-analysis'),
  jenkins_legumes: s('Jenkins 2012', 'Legumes as part of a low glycemic index diet in type 2 diabetes', 'Arch Intern Med', 2012, pm(23089999), 'trial'),
  corley: s('Corley 2018', 'Intermittent fasting in type 2 diabetes and risk of hypoglycaemia: RCT', 'Diabet Med', 2018, pm(29405359), 'trial'),
  riddell: s('Riddell 2017', 'Exercise management in type 1 diabetes: consensus statement', 'Lancet Diabetes Endocrinol', 2017, pm(28126459), 'guideline'),
  ada_hypo: s('ADA: hypoglycemia', 'Hypoglycemia (low blood glucose)', 'American Diabetes Association', 2024, 'https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose', 'guideline'),

  // ── GERD ────────────────────────────────────────────────
  acg_gerd: s('ACG 2022 GERD guideline', 'ACG clinical guideline for the diagnosis and management of GERD', 'Am J Gastroenterol', 2022, pm(34807007), 'guideline'),
  ness_jensen: s('Ness-Jensen 2013', 'Weight loss and reduction in gastroesophageal reflux (HUNT study)', 'Am J Gastroenterol', 2013, pm(23358462), 'cohort'),

  // ── Menopause ───────────────────────────────────────────
  straw: s('STRAW+10 2012', 'Stages of Reproductive Aging Workshop +10', 'Menopause', 2012, pm(22343510), 'guideline'),
  nams_nonhormone: s('NAMS 2023 nonhormone', 'The 2023 nonhormone therapy position statement of The North American Menopause Society', 'Menopause', 2023, pm(37252752), 'guideline'),
  nams_bone: s('NAMS 2021 osteoporosis', 'Management of osteoporosis in postmenopausal women: NAMS 2021 position statement', 'Menopause', 2021, pm(34448749), 'guideline'),
  elkhoudary: s('AHA 2020 menopause & CVD', 'Menopause transition and cardiovascular disease risk: AHA scientific statement', 'Circulation', 2020, pm(33251828), 'guideline'),
  faubion: s('Faubion 2015', 'Caffeine and menopausal symptoms: what is the association?', 'Menopause', 2015, pm(25051286), 'cohort'),
  protage: s('PROT-AGE 2013', 'Evidence-based recommendations for optimal dietary protein intake in older people', 'J Am Med Dir Assoc', 2013, pm(23867520), 'guideline'),

  // ── Migraine ────────────────────────────────────────────
  aan_migraine: s('AAN/AHS 2012 migraine prevention', 'Evidence-based guideline update: NSAIDs and other complementary treatments for episodic migraine prevention', 'Neurology', 2012, pm(22529203), 'guideline'),
  kelman: s('Kelman 2007', 'The triggers or precipitants of the acute migraine attack', 'Cephalalgia', 2007, pm(17403039), 'cohort'),
  ramsden: s('Ramsden 2021', 'Dietary alteration of n-3 and n-6 fatty acids for headache reduction in migraine: RCT', 'BMJ', 2021, pm(34526307), 'trial'),
  chiu_mg: s('Chiu 2016', 'Intravenous and oral magnesium for reducing migraine: meta-analysis of RCTs', 'Pain Physician', 2016, pm(26752497), 'meta-analysis'),
  nowaczewska: s('Nowaczewska 2020', 'The ambiguous role of caffeine in migraine headache: from trigger to treatment', 'Nutrients', 2020, pm(32731623), 'review'),
  martin_diet: s('Martin 2016', 'Diet and headache: part 2', 'Headache', 2016, pm(27699772), 'review'),

  // ── Supplements ─────────────────────────────────────────
  ods_riboflavin: s('NIH ODS: Riboflavin', 'Riboflavin – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Riboflavin'), 'reference'),
  ods_ashwagandha: s('NIH ODS: Ashwagandha', 'Ashwagandha: Is it helpful for stress, anxiety, or sleep? – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2025, ods('Ashwagandha'), 'reference'),
  ods_probiotics: s('NIH ODS: Probiotics', 'Probiotics – Health Professional Fact Sheet', 'NIH Office of Dietary Supplements', 2024, ods('Probiotics'), 'reference'),
  nccih_melatonin: s('NCCIH: Melatonin', 'Melatonin: what you need to know', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know', 'reference'),
  nccih_sjw: s('NCCIH: St. John\u2019s wort', 'St. John\u2019s wort: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/st-johns-wort', 'reference'),
  nccih_feverfew: s('NCCIH: Feverfew', 'Feverfew: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/feverfew', 'reference'),
  nccih_black_cohosh: s('NCCIH: Black cohosh', 'Black cohosh: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/black-cohosh', 'reference'),
  ada_9: s('ADA Standards 2024 §9', 'Pharmacologic approaches to glycemic treatment: Standards of Care in Diabetes 2024', 'Diabetes Care', 2024, pm(38078590), 'guideline'),
  ferracioli: s('Ferracioli-Oda 2013', 'Melatonin for the treatment of primary sleep disorders: meta-analysis', 'PLoS One', 2013, pm(23691095), 'meta-analysis'),
  hidese: s('Hidese 2019', 'L-theanine, stress-related symptoms and cognitive function: randomized trial', 'Nutrients', 2019, pm(31623400), 'trial'),
  owen: s('Owen 2008', 'Combined effects of L-theanine and caffeine on cognitive performance and mood', 'Nutr Neurosci', 2008, pm(18681988), 'trial'),
  hempel: s('Hempel 2012', 'Probiotics for antibiotic-associated diarrhea: systematic review and meta-analysis', 'JAMA', 2012, pm(22570464), 'meta-analysis'),
  hemila_c: s('Hemilä 2013 (Cochrane)', 'Vitamin C for preventing and treating the common cold', 'Cochrane Database Syst Rev', 2013, pm(23440782), 'meta-analysis'),
  hemila_zinc: s('Hemilä 2016', 'Zinc acetate lozenges for treating the common cold: individual patient data meta-analysis', 'Br J Clin Pharmacol', 2016, pm(27378206), 'meta-analysis'),
  hausenblas: s('Hausenblas 2013', 'Saffron and major depressive disorder: meta-analysis of RCTs', 'J Integr Med', 2013, pm(24299602), 'meta-analysis'),
  linde_sjw: s('Linde 2008 (Cochrane)', 'St John\u2019s wort for major depression', 'Cochrane Database Syst Rev', 2008, pm(18843608), 'meta-analysis'),
  lopresti: s('Lopresti 2019', 'Stress-relieving actions of an ashwagandha extract: randomized trial', 'Medicine (Baltimore)', 2019, pm(31517876), 'trial'),
  yap: s('Yap 2019', 'Lavender essential oil (Silexan) for anxiety: meta-analysis', 'Sci Rep', 2019, pm(31792285), 'meta-analysis'),
  gibb: s('Gibb 2015', 'Psyllium fiber improves glycemic control: meta-analysis', 'Am J Clin Nutr', 2015, pm(26561625), 'meta-analysis'),
  ras: s('Ras 2014', 'LDL-lowering effect of plant sterols and stanols across doses: meta-analysis', 'Br J Nutr', 2014, pm(24780090), 'meta-analysis'),
  lan: s('Lan 2015', 'Berberine for type 2 diabetes, hyperlipidemia and hypertension: meta-analysis', 'J Ethnopharmacol', 2015, pm(25498346), 'meta-analysis'),
  siervo: s('Siervo 2013', 'Inorganic nitrate and beetroot juice lower blood pressure: meta-analysis', 'J Nutr', 2013, pm(23596162), 'meta-analysis'),
  leiman: s('Leiman 2017', 'Alginate therapy for GERD symptoms: systematic review and meta-analysis', 'Dis Esophagus', 2017, pm(28375448), 'meta-analysis'),
  demiranda: s('de Miranda 2021', 'Hydrolyzed collagen supplementation and skin aging: meta-analysis', 'Int J Dermatol', 2021, pm(33742704), 'meta-analysis'),
  gencer: s('Gencer 2021', 'Long-term marine omega-3 supplementation and atrial fibrillation risk: meta-analysis', 'Circulation', 2021, pm(34612056), 'meta-analysis'),
  cosmos_mind: s('COSMOS-Mind 2023', 'Cocoa extract and a multivitamin on cognitive function: randomized trial', 'Alzheimers Dement', 2023, pm(36102337), 'trial'),

  // Commonly used, less-researched supplements
  dekosky: s('GEM trial 2008', 'Ginkgo biloba for prevention of dementia: randomized controlled trial', 'JAMA', 2008, pm(19017911), 'trial'),
  kongkeaw: s('Kongkeaw 2014', 'Cognitive effects of Bacopa monnieri extract: meta-analysis of RCTs', 'J Ethnopharmacol', 2014, pm(24252493), 'meta-analysis'),
  mori: s('Mori 2009', 'Lion\u2019s mane mushroom (Hericium erinaceus) in mild cognitive impairment: double-blind trial', 'Phytother Res', 2009, pm(18844328), 'trial'),
  jongkees: s('Jongkees 2015', 'Tyrosine supplementation under stress or cognitive demands: review', 'J Psychiatr Res', 2015, pm(26424423), 'review'),
  ishaque: s('Ishaque 2012', 'Rhodiola rosea for physical and mental fatigue: systematic review', 'BMC Complement Altern Med', 2012, pm(22643043), 'meta-analysis'),
  shaw_5htp: s('Shaw 2002 (Cochrane)', 'Tryptophan and 5-hydroxytryptophan for depression', 'Cochrane Database Syst Rev', 2002, pm(11869656), 'meta-analysis'),
  turner_5htp: s('Turner 2006', 'Serotonin a la carte: supplementation with 5-hydroxytryptophan (efficacy and safety)', 'Pharmacol Ther', 2006, pm(16023217), 'review'),
  galizia: s('Galizia 2016 (Cochrane)', 'S-adenosyl methionine (SAMe) for depression in adults', 'Cochrane Database Syst Rev', 2016, pm(27727432), 'meta-analysis'),
  pigeon: s('Pigeon 2010', 'Tart cherry juice and sleep in older adults with insomnia: pilot study', 'J Med Food', 2010, pm(20438325), 'trial'),
  karsch: s('Karsch-Völk 2014 (Cochrane)', 'Echinacea for preventing and treating the common cold', 'Cochrane Database Syst Rev', 2014, pm(24554461), 'meta-analysis'),
  qu_coq10: s('Qu 2018', 'Coenzyme Q10 for statin-associated muscle symptoms: meta-analysis', 'J Am Heart Assoc', 2018, pm(30371340), 'meta-analysis'),
  nccih_valerian: s('NCCIH: Valerian', 'Valerian: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/valerian', 'reference'),
  nccih_chamomile: s('NCCIH: Chamomile', 'Chamomile: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/chamomile', 'reference'),
  nccih_elderberry: s('NCCIH: Elderberry', 'Elderberry: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/elderberry', 'reference'),
  nccih_ginkgo: s('NCCIH: Ginkgo', 'Ginkgo: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/ginkgo', 'reference'),
  nccih_ginseng: s('NCCIH: Asian ginseng', 'Asian ginseng: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/asian-ginseng', 'reference'),
  nccih_garlic: s('NCCIH: Garlic', 'Garlic: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/garlic', 'reference'),
  nccih_ryr: s('NCCIH: Red yeast rice', 'Red yeast rice: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/red-yeast-rice', 'reference'),

  // Coffee, tea, caffeine, grapefruit, ginger, pomegranate
  poole_coffee: s('Poole 2017', 'Coffee consumption and health: umbrella review of meta-analyses', 'BMJ', 2017, pm(29167102), 'meta-analysis'),
  fda_caffeine: s('FDA: caffeine', 'Spilling the beans: how much caffeine is too much?', 'U.S. Food & Drug Administration', 2024, 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much', 'guideline'),
  acog_caffeine: s('ACOG 2010 caffeine', 'Committee Opinion No. 462: moderate caffeine consumption during pregnancy', 'Obstet Gynecol', 2010, pm(20664420), 'guideline'),
  fda_grapefruit: s('FDA: grapefruit & drugs', 'Grapefruit juice and some drugs don\u2019t mix', 'U.S. Food & Drug Administration', 2024, 'https://www.fda.gov/consumers/consumer-updates/grapefruit-juice-and-some-drugs-dont-mix', 'guideline'),
  bailey_grapefruit: s('Bailey 2013', 'Grapefruit\u2013medication interactions: forbidden fruit or avoidable consequences?', 'CMAJ', 2013, pm(23184849), 'review'),
  nccih_green_tea: s('NCCIH: Green tea', 'Green tea: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/green-tea', 'reference'),
  nccih_ginger: s('NCCIH: Ginger', 'Ginger: usefulness and safety', 'NIH National Center for Complementary and Integrative Health', 2024, 'https://www.nccih.nih.gov/health/ginger', 'reference'),
  viljoen: s('Viljoen 2014', 'Ginger for pregnancy-associated nausea and vomiting: meta-analysis', 'Nutr J', 2014, pm(24642205), 'meta-analysis'),
  sahebkar_pom: s('Sahebkar 2017', 'Effects of pomegranate juice on blood pressure: meta-analysis of RCTs', 'Pharmacol Res', 2017, pm(27888156), 'meta-analysis'),
  // Hashimoto's / thyroid
  niddk_hashimoto: s('NIDDK: Hashimoto’s disease', 'Hashimoto’s disease', 'NIH National Institute of Diabetes and Digestive and Kidney Diseases', 2021, 'https://www.niddk.nih.gov/health-information/endocrine-diseases/hashimotos-disease', 'guideline'),
  jonklaas: s('ATA 2014 hypothyroidism', 'Guidelines for the treatment of hypothyroidism (American Thyroid Association)', 'Thyroid', 2014, pm(25266247), 'guideline'),
  huwiler: s('Huwiler 2024', 'Selenium supplementation in Hashimoto thyroiditis: meta-analysis of RCTs', 'Thyroid', 2024, pm(38243784), 'meta-analysis'),
  wichman: s('Wichman 2016', 'Selenium supplementation reduces thyroid autoantibodies in autoimmune thyroiditis: meta-analysis', 'Thyroid', 2016, pm(27702392), 'meta-analysis'),
  roy_celiac: s('Roy 2016', 'Prevalence of celiac disease in autoimmune thyroid disease: meta-analysis', 'Thyroid', 2016, pm(27256300), 'meta-analysis'),
  krysiak: s('Krysiak 2019', 'Gluten-free diet and thyroid autoimmunity in women with Hashimoto’s thyroiditis: pilot study', 'Exp Clin Endocrinol Diabetes', 2019, pm(30060266), 'trial'),
  benvenga: s('Benvenga 2008', 'Altered intestinal absorption of L-thyroxine caused by coffee', 'Thyroid', 2008, pm(18341376), 'trial'),
  abbott_aip: s('Abbott 2019', 'Autoimmune protocol diet as part of a lifestyle intervention for Hashimoto’s thyroiditis', 'Cureus', 2019, pm(31275780), 'trial'),
  konijeti_aip: s('Konijeti 2017', 'Efficacy of the autoimmune protocol diet for inflammatory bowel disease', 'Inflamm Bowel Dis', 2017, pm(28858071), 'trial'),

  // Skin & looks
  smith_acne: s('Smith 2007', 'A low-glycemic-load diet improves symptoms in acne vulgaris patients: randomized controlled trial', 'Am J Clin Nutr', 2007, pm(17616769), 'trial'),
  atkinson_gi: s('Atkinson 2021', 'International tables of glycemic index and glycemic load values 2021: systematic review', 'Am J Clin Nutr', 2021, pm(34258626), 'review'),
  juhl_dairy: s('Juhl 2018', 'Dairy intake and acne vulgaris: systematic review and meta-analysis of 78,529 children, adolescents and young adults', 'Nutrients', 2018, pm(30096883), 'meta-analysis'),
  whitehead_skin: s('Whitehead 2012', 'Within-subject increases in fruit and vegetable consumption confer beneficial skin-color changes', 'PLoS One', 2012, pm(22412966), 'trial'),
  uribarri_age: s('Uribarri 2010', 'Advanced glycation end products in foods and a practical guide to their reduction in the diet', 'J Am Diet Assoc', 2010, pm(20497781), 'review'),
  dejager_face: s('de Jager 2018', 'Facial adiposity, attractiveness, and health: a review', 'Front Psychol', 2018, pm(30622491), 'review'),
  thomas_vitc: s('Thomas 2013', 'Ascorbic acid supplements and kidney stone incidence among men: prospective study', 'JAMA Intern Med', 2013, pm(23381591), 'cohort'),

  // Diets
  bueno_keto: s('Bueno 2013', 'Very-low-carbohydrate ketogenic diet vs low-fat diet for long-term weight loss: meta-analysis', 'Br J Nutr', 2013, pm(23651522), 'meta-analysis'),
  retterstol: s('Retterstøl 2018', 'Low-carbohydrate high-fat diet and LDL cholesterol in young adults: RCT', 'Atherosclerosis', 2018, pm(30408717), 'trial'),
  patel_sglt2: s('Patel 2022', 'SGLT2 inhibitor-induced euglycemic diabetic ketoacidosis: review', 'Cureus', 2022, pm(36320965), 'review'),
  melina: s('Academy 2016 vegetarian', 'Position of the Academy of Nutrition and Dietetics: vegetarian diets', 'J Acad Nutr Diet', 2016, pm(27886704), 'guideline'),
  manheimer: s('Manheimer 2015', 'Paleolithic nutrition for metabolic syndrome: meta-analysis', 'Am J Clin Nutr', 2015, pm(26269362), 'meta-analysis'),

  // Energy right now
  randolph: s('Randolph 2017', 'Stair walking is more energizing than low-dose caffeine in sleep-deprived young women', 'Physiol Behav', 2017, pm(28302573), 'trial'),
  armstrong: s('Armstrong 2012', 'Mild dehydration affects mood in healthy young women', 'J Nutr', 2012, pm(22190027), 'trial'),
  brooks_nap: s('Brooks 2006', 'A brief afternoon nap after sleep restriction: which nap duration is most recuperative?', 'Sleep', 2006, pm(16796222), 'trial'),
  mclellan: s('McLellan 2016', 'Caffeine’s effects on cognitive, physical and occupational performance: review', 'Neurosci Biobehav Rev', 2016, pm(27612937), 'review'),
  puetz: s('Puetz 2006', 'Effects of chronic exercise on feelings of energy and fatigue: quantitative synthesis', 'Psychol Bull', 2006, pm(17073524), 'meta-analysis'),
  mantantzis: s('Mantantzis 2019', 'Sugar rush or sugar crash? Meta-analysis of carbohydrate effects on mood', 'Neurosci Biobehav Rev', 2019, pm(30951762), 'meta-analysis'),
  houston_iron: s('Houston 2018', 'Iron supplementation for fatigue in non-anaemic iron-deficient adults: systematic review', 'BMJ Open', 2018, pm(29626044), 'meta-analysis'),

  // Hormones
  leproult_cortisol: s('Leproult 1997', 'Sleep loss results in an elevation of cortisol levels the next evening', 'Sleep', 1997, pm(9415946), 'trial'),
  spiegel: s('Spiegel 2004', 'Sleep curtailment decreases leptin, raises ghrelin, and increases hunger', 'Ann Intern Med', 2004, pm(15583226), 'trial'),
  taheri: s('Taheri 2004', 'Short sleep duration is associated with reduced leptin, elevated ghrelin and higher BMI', 'PLoS Med', 2004, pm(15602591), 'cohort'),
  gooley: s('Gooley 2011', 'Room light before bedtime suppresses melatonin onset and shortens melatonin duration', 'J Clin Endocrinol Metab', 2011, pm(21193540), 'trial'),
  leproult_t: s('Leproult 2011', 'One week of sleep restriction lowers testosterone in young healthy men', 'JAMA', 2011, pm(21632481), 'trial'),
  corona: s('Corona 2013', 'Weight loss reverses obesity-associated low testosterone: meta-analysis', 'Eur J Endocrinol', 2013, pm(23482592), 'meta-analysis'),
  whittaker: s('Whittaker 2021', 'Low-fat diets and testosterone in men: meta-analysis of intervention studies', 'J Steroid Biochem Mol Biol', 2021, pm(33741447), 'meta-analysis'),
  mountjoy: s('IOC 2018 RED-S', 'IOC consensus statement on relative energy deficiency in sport (RED-S)', 'Br J Sports Med', 2018, pm(29773536), 'guideline'),
  fsis: s('USDA FSIS: safe temperatures', 'Safe minimum internal temperature chart', 'USDA Food Safety and Inspection Service', 2024, 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart', 'guideline'),

  // ── Peptides ────────────────────────────────────────────
  step1: s('STEP 1 2021', 'Once-weekly semaglutide in adults with overweight or obesity', 'N Engl J Med', 2021, pm(33567185), 'trial'),
  select: s('SELECT 2023', 'Semaglutide and cardiovascular outcomes in obesity without diabetes', 'N Engl J Med', 2023, pm(37952131), 'trial'),
  sustain6: s('SUSTAIN-6 2016', 'Semaglutide and cardiovascular outcomes in type 2 diabetes', 'N Engl J Med', 2016, pm(27633186), 'trial'),
  surmount1: s('SURMOUNT-1 2022', 'Tirzepatide once weekly for the treatment of obesity', 'N Engl J Med', 2022, pm(35658024), 'trial'),
  falutz: s('Falutz 2007', 'Metabolic effects of a growth hormone-releasing factor (tesamorelin) in patients with HIV', 'N Engl J Med', 2007, pm(18057338), 'trial'),
  kingsberg: s('Kingsberg 2019', 'Bremelanotide for hypoactive sexual desire disorder: two phase 3 trials', 'Obstet Gynecol', 2019, pm(31599840), 'trial'),
  teichman: s('Teichman 2006', 'CJC-1295 stimulation of GH and IGF-I in healthy adults', 'J Clin Endocrinol Metab', 2006, pm(16352683), 'trial'),
  vasireddi: s('Vasireddi 2025', 'Emerging use of BPC-157 in orthopaedic sports medicine: systematic review', 'HSS J', 2025, pm(40756949), 'review'),
  pickart: s('Pickart 2015', 'GHK peptide as a modulator of skin regeneration pathways', 'Biomed Res Int', 2015, pm(26236730), 'review'),
  fda_cat2: s('FDA: compounding safety risks', 'Certain bulk drug substances for use in compounding that may present significant safety risks', 'U.S. Food & Drug Administration', 2026, 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks', 'regulation'),
  wada: s('WADA Prohibited List', 'The World Anti-Doping Code Prohibited List', 'World Anti-Doping Agency', 2026, 'https://www.wada-ama.org/en/prohibited-list', 'regulation'),
  label_semaglutide: s('Semaglutide label (DailyMed)', 'Semaglutide (Wegovy, Ozempic, Rybelsus) prescribing information', 'NIH DailyMed', 2025, 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=semaglutide', 'regulation'),
  label_tirzepatide: s('Tirzepatide label (DailyMed)', 'Tirzepatide (Zepbound, Mounjaro) prescribing information', 'NIH DailyMed', 2025, 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=tirzepatide', 'regulation'),
  label_bremelanotide: s('Vyleesi label (DailyMed)', 'Bremelanotide (Vyleesi) prescribing information', 'NIH DailyMed', 2024, 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=bremelanotide', 'regulation'),
  label_tesamorelin: s('Egrifta label (DailyMed)', 'Tesamorelin (Egrifta) prescribing information', 'NIH DailyMed', 2024, 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=tesamorelin', 'regulation'),

  // ── Kidney ──────────────────────────────────────────────
  kdoqi: s('KDOQI 2020', 'KDOQI clinical practice guideline for nutrition in CKD: 2020 update', 'Am J Kidney Dis', 2020, pm(32829751), 'guideline'),

  // ── Sleep ───────────────────────────────────────────────
  watson_sleep: s('AASM/SRS 2015', 'Recommended amount of sleep for a healthy adult: joint consensus statement of the AASM and Sleep Research Society', 'Sleep', 2015, pm(26039963), 'guideline'),
  hirshkowitz: s('NSF 2015', 'National Sleep Foundation’s sleep time duration recommendations', 'Sleep Health', 2015, pm(29073412), 'guideline'),
  alkhatib: s('Al Khatib 2017', 'Effects of partial sleep deprivation on energy balance: meta-analysis', 'Eur J Clin Nutr', 2017, pm(27804960), 'meta-analysis'),
  prather: s('Prather 2015', 'Behaviorally assessed sleep and susceptibility to the common cold', 'Sleep', 2015, pm(26118561), 'trial'),
  van_dongen: s('Van Dongen 2003', 'The cumulative cost of additional wakefulness: chronic sleep restriction and total sleep deprivation', 'Sleep', 2003, pm(12683469), 'trial'),
  cappuccio_mort: s('Cappuccio 2010', 'Sleep duration and all-cause mortality: meta-analysis of prospective studies', 'Sleep', 2010, pm(20469800), 'meta-analysis'),
  cappuccio_cvd: s('Cappuccio 2011', 'Sleep duration predicts cardiovascular outcomes: meta-analysis of prospective studies', 'Eur Heart J', 2011, pm(21300732), 'meta-analysis'),
  windred: s('Windred 2024', 'Sleep regularity is a stronger predictor of mortality risk than sleep duration', 'Sleep', 2024, pm(37738616), 'cohort'),
  spiegel_1999: s('Spiegel 1999', 'Impact of sleep debt on metabolic and endocrine function', 'Lancet', 1999, pm(10543671), 'trial'),
  acp_insomnia: s('ACP 2016 insomnia', 'Management of chronic insomnia disorder in adults: ACP clinical practice guideline', 'Ann Intern Med', 2016, pm(27136449), 'guideline'),
  baglioni: s('Baglioni 2011', 'Insomnia as a predictor of depression: meta-analysis of longitudinal studies', 'J Affect Disord', 2011, pm(21300408), 'meta-analysis'),
  shan_sleep: s('Shan 2015', 'Sleep duration and risk of type 2 diabetes: meta-analysis of prospective studies', 'Diabetes Care', 2015, pm(25715415), 'meta-analysis'),
  kredlow: s('Kredlow 2015', 'The effects of physical activity on sleep: meta-analytic review', 'J Behav Med', 2015, pm(25596964), 'meta-analysis'),
  nedeltcheva: s('Nedeltcheva 2010', 'Insufficient sleep undermines dietary efforts to reduce adiposity', 'Ann Intern Med', 2010, pm(20921542), 'trial'),
  phillips_sleep: s('Phillips 2017', 'Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian timing', 'Sci Rep', 2017, pm(28607474), 'cohort'),
  van_veen: s('Van Veen 2010', 'Delayed circadian rhythm in adults with ADHD and chronic sleep-onset insomnia', 'Biol Psychiatry', 2010, pm(20163790), 'cohort'),
  gangwisch: s('Gangwisch 2006', 'Short sleep duration as a risk factor for hypertension (NHANES I)', 'Hypertension', 2006, pm(16585410), 'cohort'),
  chang_ereader: s('Chang 2015', 'Evening use of light-emitting eReaders negatively affects sleep, circadian timing and next-morning alertness', 'Proc Natl Acad Sci U S A', 2015, pm(25535358), 'trial'),

  // ── Training ────────────────────────────────────────────
  schoenfeld_volume: s('Schoenfeld 2017 (volume)', 'Dose-response relationship between weekly resistance training volume and muscle mass: meta-analysis', 'J Sports Sci', 2017, pm(27433992), 'meta-analysis'),
  baz_valle: s('Baz-Valle 2022', 'Effects of different resistance training volumes on muscle hypertrophy: systematic review', 'J Hum Kinet', 2022, pm(35291645), 'review'),
  bickel: s('Bickel 2011', 'Exercise dosing to retain resistance training adaptations in young and older adults', 'Med Sci Sports Exerc', 2011, pm(21131862), 'trial'),
  schoenfeld_freq: s('Schoenfeld 2016 (frequency)', 'Effects of resistance training frequency on muscle hypertrophy: meta-analysis', 'Sports Med', 2016, pm(27102172), 'meta-analysis'),
  schoenfeld_freq_2019: s('Schoenfeld 2019 (frequency)', 'How many times per week should a muscle be trained to maximize hypertrophy? Meta-analysis', 'J Sports Sci', 2019, pm(30558493), 'meta-analysis'),
  schoenfeld_load: s('Schoenfeld 2017 (load)', 'Strength and hypertrophy adaptations between low- vs high-load resistance training: meta-analysis', 'J Strength Cond Res', 2017, pm(28834797), 'meta-analysis'),
  lopez_load: s('Lopez 2021', 'Resistance training load effects on muscle hypertrophy and strength gain: network meta-analysis', 'Med Sci Sports Exerc', 2021, pm(33433148), 'meta-analysis'),
  refalo: s('Refalo 2023', 'Influence of resistance training proximity-to-failure on muscle hypertrophy: meta-analysis', 'Sports Med', 2023, pm(36334240), 'meta-analysis'),
  robinson_rir: s('Robinson 2024', 'Dose-response relationship between proximity to failure, strength gain and muscle hypertrophy: meta-regressions', 'Sports Med', 2024, pm(38970765), 'meta-analysis'),
  schoenfeld_rest: s('Schoenfeld 2016 (rest)', 'Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men', 'J Strength Cond Res', 2016, pm(26605807), 'trial'),
  fonseca: s('Fonseca 2014', 'Changes in exercises are more effective than in loading schemes to improve muscle strength', 'J Strength Cond Res', 2014, pm(24832974), 'trial'),
  acsm_progression: s('ACSM 2009 progression', 'Progression models in resistance training for healthy adults (ACSM position stand)', 'Med Sci Sports Exerc', 2009, pm(19204579), 'guideline'),
  who_activity: s('WHO 2020 activity', 'World Health Organization 2020 guidelines on physical activity and sedentary behaviour', 'Br J Sports Med', 2020, pm(33239350), 'guideline'),
  longland: s('Longland 2016', 'Higher vs lower dietary protein during an energy deficit with intense exercise: lean mass gain and fat loss', 'Am J Clin Nutr', 2016, pm(26817506), 'trial'),
  schoenfeld_aragon: s('Schoenfeld & Aragon 2018', 'How much protein can the body use in a single meal for muscle-building?', 'J Int Soc Sports Nutr', 2018, pm(29497353), 'review'),
  edwards_bp: s('Edwards 2023', 'Exercise training and resting blood pressure: network meta-analysis of 270 randomised trials', 'Br J Sports Med', 2023, pm(37491419), 'meta-analysis'),
  acsm_htn: s('ACSM 2004 hypertension', 'Exercise and hypertension (ACSM position stand)', 'Med Sci Sports Exerc', 2004, pm(15076798), 'guideline'),
  kanaley: s('ACSM 2022 type 2 diabetes', 'Exercise/physical activity in individuals with type 2 diabetes: ACSM consensus statement', 'Med Sci Sports Exerc', 2022, pm(35029593), 'guideline'),
  noetel: s('Noetel 2024', 'Effect of exercise for depression: network meta-analysis of randomised trials', 'BMJ', 2024, pm(38355154), 'meta-analysis'),
  singh_pa: s('Singh 2023', 'Physical activity for improving depression, anxiety and distress: umbrella review', 'Br J Sports Med', 2023, pm(36796860), 'meta-analysis'),
  yang_adhd: s('Yang 2025', 'Physical activity and inhibitory control in adult ADHD: meta-analysis', 'J Glob Health', 2025, pm(40084538), 'meta-analysis'),
  cerrillo: s('Cerrillo-Urbina 2015', 'Effects of physical exercise in children with ADHD: meta-analysis of randomized trials', 'Child Care Health Dev', 2015, pm(25988743), 'meta-analysis'),
  varkey: s('Varkey 2011', 'Exercise as migraine prophylaxis: randomized study with relaxation and topiramate as controls', 'Cephalalgia', 2011, pm(21890526), 'trial'),
  liftmor: s('LIFTMOR 2018', 'High-intensity resistance and impact training improves bone density in postmenopausal women with low bone mass', 'J Bone Miner Res', 2018, pm(28975661), 'trial'),
  heiwe: s('Heiwe 2011 (Cochrane)', 'Exercise training for adults with chronic kidney disease', 'Cochrane Database Syst Rev', 2011, pm(21975737), 'meta-analysis'),
  acog_exercise: s('ACOG 2020 exercise', 'Physical activity and exercise during pregnancy and the postpartum period (Committee Opinion 804)', 'Obstet Gynecol', 2020, pm(32217980), 'guideline'),

  // ── Looks (training & sleep) ────────────────────────────
  axelsson: s('Axelsson 2010', 'Beauty sleep: perceived health and attractiveness of sleep deprived people', 'BMJ', 2010, pm(21156746), 'trial'),
  sundelin: s('Sundelin 2017', 'Negative effects of restricted sleep on facial appearance and social appeal', 'R Soc Open Sci', 2017, pm(28572989), 'trial'),
  gollwitzer: s('Gollwitzer & Sheeran 2006', 'Implementation intentions and goal achievement: a meta-analysis of effects and processes', 'Adv Exp Soc Psychol', 2006, 'https://doi.org/10.1016/S0065-2601(06)38002-1', 'meta-analysis'),
  van_dyk: s('van Dyk 2019', 'Including the Nordic hamstring exercise in injury prevention programmes halves hamstring injuries: meta-analysis', 'Br J Sports Med', 2019, pm(30808663), 'meta-analysis'),
  shaw_gelatin: s('Shaw 2017', 'Vitamin C–enriched gelatin before intermittent activity augments collagen synthesis', 'Am J Clin Nutr', 2017, pm(27852613), 'trial'),
  leong_grip: s('Leong 2015 (PURE)', 'Prognostic value of grip strength: Prospective Urban Rural Epidemiology study', 'Lancet', 2015, pm(25982160), 'cohort'),
  sepehri: s('Sepehri 2024', 'Therapeutic exercises for forward head posture, rounded shoulders and hyperkyphosis: meta-analysis', 'BMC Musculoskelet Disord', 2024, pm(38302926), 'meta-analysis'),
  nice_whtr: s('NICE NG246', 'Overweight and obesity management: waist-to-height ratio', 'National Institute for Health and Care Excellence', 2025, 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', 'guideline'),
  reed_soy: s('Reed 2021', 'Neither soy nor isoflavone intake affects male reproductive hormones: meta-analysis', 'Reprod Toxicol', 2021, pm(33383165), 'meta-analysis'),
  pope_aas: s('Endocrine Society 2014 (Pope)', 'Adverse health consequences of performance-enhancing drugs: Endocrine Society scientific statement', 'Endocr Rev', 2014, pm(24423981), 'guideline'),
  fda_bodybuilding: s('FDA: bodybuilding products', 'Caution: bodybuilding products can be risky', 'U.S. Food & Drug Administration', 2024, 'https://www.fda.gov/consumers/consumer-updates/caution-bodybuilding-products-can-be-risky', 'regulation'),
  melville_daa: s('Melville 2015', 'Three and six grams supplementation of D-aspartic acid in resistance-trained men', 'J Int Soc Sports Nutr', 2015, pm(25844073), 'trial'),
} satisfies Record<string, Source>

export type SourceId = keyof typeof SOURCES

/** Design choices that are informed by the sources but are the app's own convention, not a published rule. */
export const APP_CONVENTION = 'App convention: built from the cited evidence, but the exact numbers are this app’s choice, not a published rule.'
