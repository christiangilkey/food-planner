import type { ConditionId, Evidence } from '../types'
import type { Claim } from './conditions'
import type { SourceId } from './sources'

export type Muscle = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs'

export const MUSCLES: { id: Muscle; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'calves', label: 'Calves' },
  { id: 'abs', label: 'Abs' },
]
export const MUSCLE_LABEL = Object.fromEntries(MUSCLES.map((m) => [m.id, m.label])) as Record<Muscle, string>

export type Gear = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bench' | 'pullup_bar' | 'band' | 'bodyweight'
export type Access = 'gym' | 'home' | 'bodyweight'

export const ACCESS: { id: Access; label: string; detail: string; gear: Gear[] }[] = [
  { id: 'gym', label: 'Gym', detail: 'Barbells, dumbbells, cables and machines', gear: ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'pullup_bar', 'band', 'bodyweight'] },
  { id: 'home', label: 'Home with dumbbells', detail: 'Adjustable dumbbells, a bench, a pull-up bar and bands', gear: ['dumbbell', 'bench', 'pullup_bar', 'band', 'bodyweight'] },
  { id: 'bodyweight', label: 'No equipment', detail: 'Bodyweight only', gear: ['bodyweight'] },
]

export interface Exercise {
  id: string
  name: string
  /** Every item is needed. */
  gear: Gear[]
  /** Muscles it trains directly (counts as a full set). */
  primary: Muscle[]
  /** Muscles that help (count as half a set). */
  secondary: Muscle[]
  compound: boolean
  /** A short technique cue. */
  cue: string
  /** Done lying flat on the back: swapped out in later pregnancy. */
  supine?: boolean
  /** Holds a position instead of moving (isometric). */
  isometric?: boolean
}

const ex = (id: string, name: string, gear: Gear[], primary: Muscle[], secondary: Muscle[], compound: boolean, cue: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, gear, primary, secondary, compound, cue, ...extra })

// Cues are this app's own short reminders; full-range, controlled reps are the common thread.
export const EXERCISES: Exercise[] = [
  // Chest
  ex('bench', 'Barbell bench press', ['barbell', 'bench'], ['chest'], ['triceps', 'shoulders'], true, 'Shoulder blades pulled back, bar touches the lower chest, press up and slightly back.', { supine: true }),
  ex('incline_db', 'Incline dumbbell press', ['dumbbell', 'bench'], ['chest'], ['shoulders', 'triceps'], true, 'Bench at 30–45°, lower until you feel a stretch across the chest.'),
  ex('db_bench', 'Dumbbell bench press', ['dumbbell', 'bench'], ['chest'], ['triceps', 'shoulders'], true, 'Lower the dumbbells to chest level with elbows about 45° from your sides.', { supine: true }),
  ex('machine_press', 'Machine chest press', ['machine'], ['chest'], ['triceps', 'shoulders'], true, 'Seat set so the handles line up with mid-chest; control the way back.'),
  ex('cable_fly', 'Cable fly', ['cable'], ['chest'], [], false, 'Slight bend in the elbows, bring the hands together in a wide hug.'),
  ex('db_fly', 'Incline dumbbell fly', ['dumbbell', 'bench'], ['chest'], [], false, 'Open wide to a deep stretch, then squeeze the chest to bring them up.'),
  ex('pushup', 'Push-up', ['bodyweight'], ['chest'], ['triceps', 'shoulders'], true, 'Body in a straight line, chest to just above the floor. Raise the hands on a bench to make it easier, or the feet to make it harder.'),
  ex('dip', 'Dip', ['pullup_bar'], ['chest', 'triceps'], ['shoulders'], true, 'Lean slightly forward and lower until the upper arms are about level.'),
  // Back
  ex('pulldown', 'Lat pulldown', ['cable'], ['back'], ['biceps'], true, 'Pull the bar to the upper chest, driving the elbows down.'),
  ex('pullup', 'Pull-up or chin-up', ['pullup_bar'], ['back'], ['biceps'], true, 'From a full hang, pull until the chin passes the bar. Use a band for help.'),
  ex('cable_row', 'Seated cable row', ['cable'], ['back'], ['biceps'], true, 'Chest up, pull the handle to the stomach, let the shoulder blades stretch forward.'),
  ex('db_row', 'One-arm dumbbell row', ['dumbbell', 'bench'], ['back'], ['biceps'], true, 'Hand and knee on the bench, pull the dumbbell toward the hip.'),
  ex('chest_row', 'Chest-supported row', ['machine'], ['back'], ['biceps', 'shoulders'], true, 'Chest against the pad so the back does the work, not momentum.'),
  ex('band_row', 'Band row', ['band'], ['back'], ['biceps'], true, 'Anchor the band at chest height and squeeze the shoulder blades together.'),
  ex('inverted_row', 'Inverted row (under a table)', ['bodyweight'], ['back'], ['biceps'], true, 'Lie under a sturdy table, grip the edge and pull your chest up to it. Bend the knees to make it easier.'),
  // Shoulders
  ex('ohp', 'Seated dumbbell shoulder press', ['dumbbell', 'bench'], ['shoulders'], ['triceps'], true, 'Press up and slightly in, without arching the lower back.'),
  ex('machine_ohp', 'Machine shoulder press', ['machine'], ['shoulders'], ['triceps'], true, 'Handles start at chin height; press without shrugging.'),
  ex('lateral', 'Lateral raise', ['dumbbell'], ['shoulders'], [], false, 'Raise to shoulder height leading with the elbows; light weight, strict form.'),
  ex('cable_lateral', 'Cable lateral raise', ['cable'], ['shoulders'], [], false, 'Cable from the opposite side, raise to shoulder height.'),
  ex('rear_fly', 'Rear-delt fly', ['dumbbell'], ['shoulders'], ['back'], false, 'Hinge forward, open the arms wide; works the back of the shoulders.'),
  ex('face_pull', 'Face pull', ['cable'], ['shoulders'], ['back'], false, 'Pull the rope to the face with elbows high, hands finishing beside the ears.'),
  ex('pike_pushup', 'Pike push-up', ['bodyweight'], ['shoulders'], ['triceps'], true, 'Hips high, lower the head toward the floor between the hands.'),
  ex('band_pull_apart', 'Band pull-apart', ['band'], ['shoulders'], ['back'], false, 'Arms straight at chest height, pull the band apart to your chest.'),
  // Arms
  ex('db_curl', 'Dumbbell curl', ['dumbbell'], ['biceps'], [], false, 'Elbows stay at your sides; lower slowly all the way.'),
  ex('incline_curl', 'Incline dumbbell curl', ['dumbbell', 'bench'], ['biceps'], [], false, 'Lying back on an incline bench stretches the biceps at the bottom.'),
  ex('cable_curl', 'Cable curl', ['cable'], ['biceps'], [], false, 'Constant tension: no swinging, full range.'),
  ex('hammer_curl', 'Hammer curl', ['dumbbell'], ['biceps'], [], false, 'Palms facing each other; also trains the forearm.'),
  ex('band_curl', 'Band curl', ['band'], ['biceps'], [], false, 'Stand on the band and curl with elbows fixed.'),
  ex('pressdown', 'Cable triceps pressdown', ['cable'], ['triceps'], [], false, 'Elbows pinned to your sides, straighten fully.'),
  ex('overhead_ext', 'Overhead triceps extension', ['dumbbell'], ['triceps'], [], false, 'Lower the weight behind the head for a deep stretch, then straighten.'),
  ex('cable_overhead', 'Cable overhead extension', ['cable'], ['triceps'], [], false, 'Face away from the cable, extend overhead.'),
  ex('close_pushup', 'Close-grip push-up', ['bodyweight'], ['triceps'], ['chest'], true, 'Hands under the shoulders, elbows tucked to the sides.'),
  ex('bench_dip', 'Bench dip', ['bench'], ['triceps'], [], false, 'Hands on a bench behind you, lower until the elbows reach about 90°.'),
  // Legs
  ex('squat', 'Barbell back squat', ['barbell'], ['quads', 'glutes'], [], true, 'Brace, sit down between the hips to at least thigh-parallel, drive up.'),
  ex('leg_press', 'Leg press', ['machine'], ['quads', 'glutes'], [], true, 'Lower until the knees reach about 90° or deeper without the lower back lifting.'),
  ex('goblet', 'Goblet squat', ['dumbbell'], ['quads', 'glutes'], [], true, 'Hold the dumbbell at the chest, elbows inside the knees at the bottom.'),
  ex('split_squat', 'Bulgarian split squat', ['dumbbell', 'bench'], ['quads', 'glutes'], [], true, 'Back foot on the bench, front knee travels forward over the toes.'),
  ex('bw_split_squat', 'Split squat', ['bodyweight'], ['quads', 'glutes'], [], true, 'Long stance, lower the back knee toward the floor; slow on the way down.'),
  ex('leg_ext', 'Leg extension', ['machine'], ['quads'], [], false, 'Pause briefly with the legs straight.'),
  ex('rdl', 'Romanian deadlift', ['barbell'], ['hamstrings', 'glutes'], ['back'], true, 'Push the hips back with a flat back until you feel the hamstrings stretch.'),
  ex('db_rdl', 'Dumbbell Romanian deadlift', ['dumbbell'], ['hamstrings', 'glutes'], ['back'], true, 'Dumbbells slide down the front of the legs as the hips go back.'),
  ex('leg_curl', 'Seated or lying leg curl', ['machine'], ['hamstrings'], [], false, 'Control the weight back; seated curls stretch the hamstrings more.'),
  ex('slider_curl', 'Hamstring slider curl', ['bodyweight'], ['hamstrings'], ['glutes'], false, 'Lie on your back, heels on a towel on a smooth floor, lift the hips and pull the heels in.', { supine: true }),
  ex('single_rdl', 'Single-leg Romanian deadlift', ['bodyweight'], ['hamstrings', 'glutes'], [], true, 'Hinge on one leg with the back flat; hold a wall for balance at first.'),
  ex('hip_thrust', 'Hip thrust', ['barbell', 'bench'], ['glutes'], ['hamstrings'], true, 'Upper back on the bench, drive the hips up and squeeze at the top.'),
  ex('db_hip_thrust', 'Dumbbell hip thrust', ['dumbbell', 'bench'], ['glutes'], ['hamstrings'], true, 'Dumbbell on the hips, chin tucked, ribs down.'),
  ex('glute_bridge', 'Glute bridge', ['bodyweight'], ['glutes'], ['hamstrings'], false, 'Feet flat, drive through the heels; try one leg at a time to make it harder.', { supine: true }),
  ex('calf_raise', 'Standing calf raise', ['bodyweight'], ['calves'], [], false, 'On a step, lower the heels for a full stretch and pause at the bottom.'),
  ex('machine_calf', 'Machine calf raise', ['machine'], ['calves'], [], false, 'Full stretch at the bottom, full rise at the top.'),
  // Core
  ex('cable_crunch', 'Cable crunch', ['cable'], ['abs'], [], false, 'Kneel and curl the ribs toward the hips; the hips stay still.'),
  ex('plank', 'Plank', ['bodyweight'], ['abs'], [], false, 'Forearms down, body in a straight line, squeeze the glutes.', { isometric: true }),
  ex('dead_bug', 'Dead bug', ['bodyweight'], ['abs'], [], false, 'Lower back pressed down while opposite arm and leg reach out.', { supine: true }),
  ex('hanging_raise', 'Hanging knee raise', ['pullup_bar'], ['abs'], [], false, 'Curl the hips up, not just the knees.'),
  // Looks-focused and tendon work
  ex('preacher', 'Preacher curl', ['dumbbell', 'bench'], ['biceps'], [], false, 'Upper arm flat on an inclined bench back; lower all the way without bouncing.'),
  ex('straight_arm', 'Straight-arm pulldown', ['cable'], ['back'], [], false, 'Arms nearly straight, sweep the bar to the thighs; feel it in the lats, not the arms.'),
  ex('low_high_fly', 'Low-to-high cable fly', ['cable'], ['chest'], ['shoulders'], false, 'Cables low, sweep the hands up to chin height: aims at the upper chest.'),
  ex('leg_raise', 'Lying leg raise', ['bodyweight'], ['abs'], [], false, 'Lower back pressed down; bend the knees to make it easier, lower slowly to make it harder.', { supine: true }),
  ex('nordic', 'Nordic hamstring curl', ['bodyweight'], ['hamstrings'], [], false, 'Kneel with the ankles anchored, lower the body forward as slowly as you can, catch yourself with the hands, push back up.'),
  // Isometrics for blood pressure
  ex('wall_sit', 'Wall sit', ['bodyweight'], ['quads'], ['glutes'], false, 'Back flat on a wall, knees bent to a level you can hold for 2 minutes. Breathe throughout.', { isometric: true }),
]

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e])) as Record<string, Exercise>

export type TrainingGoal = 'hypertrophy' | 'strength' | 'recomp' | 'health'

export const TRAINING_GOALS: { id: TrainingGoal; label: string; detail: string }[] = [
  { id: 'hypertrophy', label: 'Build muscle', detail: 'Grow muscle, with extra volume for the body parts you pick' },
  { id: 'recomp', label: 'Lose fat, keep or build muscle', detail: 'Lifting plus high protein while the meal plan runs a deficit' },
  { id: 'strength', label: 'Get stronger', detail: 'Heavier sets in fewer reps on the main lifts' },
  { id: 'health', label: 'Health and fitness', detail: 'The weekly minimum for health: strength twice a week plus cardio' },
]

export type Experience = 'new' | 'some' | 'advanced'
export const EXPERIENCE: { id: Experience; label: string; detail: string }[] = [
  { id: 'new', label: 'New to lifting', detail: 'Less than 6 months of regular training' },
  { id: 'some', label: 'Some experience', detail: '6 months to 2 years' },
  { id: 'advanced', label: 'Experienced', detail: 'More than 2 years of consistent training' },
]

/** The evidence behind how programs are built. Shown on the Train tab. */
export const PRINCIPLES: (Claim & { id: string; title: string; convention?: string })[] = [
  {
    id: 'volume', title: 'Weekly sets per muscle', evidence: 'moderate', sources: ['schoenfeld_volume', 'baz_valle'],
    text: 'Muscle growth rose with the number of hard sets per muscle per week, with 10 or more sets doing best in a meta-analysis. Priority muscles get more sets; the rest get enough to keep growing.',
    convention: 'The exact set counts per experience level are this app’s choice within the studied range.',
  },
  {
    id: 'maintain', title: 'Less is enough to keep what you have', evidence: 'emerging', sources: ['bickel'],
    text: 'Young adults kept their new muscle on as little as a third, and even a ninth, of their training volume for 32 weeks. That is why lower-priority muscles can get fewer sets.',
  },
  {
    id: 'frequency', title: 'Each muscle twice a week', evidence: 'strong', sources: ['schoenfeld_freq', 'schoenfeld_freq_2019'],
    text: 'Training a muscle twice a week grew it more than once a week. With the same weekly sets, splitting them over 2 or 3 days made little difference, so frequency is mostly a way to fit the sets in.',
  },
  {
    id: 'load', title: 'Any rep range works if the sets are hard', evidence: 'strong', sources: ['schoenfeld_load', 'lopez_load'],
    text: 'Light and heavy loads built similar muscle when sets were taken close to failure; heavier loads built more strength. The plan uses mostly 6–15 reps.',
  },
  {
    id: 'effort', title: 'Close to failure, not always to failure', evidence: 'moderate', sources: ['refalo', 'robinson_rir'],
    text: 'Growth improved as sets ended closer to failure, but going all the way to failure added little over stopping 1–2 reps short. The plan says how many reps to leave in the tank (RIR).',
  },
  {
    id: 'rest', title: 'Rest 2–3 minutes on big lifts', evidence: 'moderate', sources: ['schoenfeld_rest'],
    text: 'In trained men, 3-minute rests between sets built more muscle and strength than 1-minute rests, because more reps could be done each set.',
  },
  {
    id: 'variety', title: 'More than one exercise per muscle', evidence: 'emerging', sources: ['fonseca'],
    text: 'Using several leg exercises grew all parts of the quadriceps, while squats alone missed some. Muscles with more sets get a second exercise.',
  },
  {
    id: 'progress', title: 'Progressive overload', evidence: 'strong', sources: ['acsm_progression'],
    text: 'Keep the weight until you reach the top of the rep range on every set, then add a little weight and start back at the bottom of the range. ACSM recommends progressing load and volume gradually.',
    convention: 'Four building weeks then an easier week with half the sets is this app’s scheme.',
  },
  {
    id: 'range', title: 'Full-range reps build flexibility too', evidence: 'strong', sources: ['alizadeh_rom', 'afonso_rom', 'pallares_rom'],
    text: 'Lifting with added load through a full range of motion improved flexibility about as much as stretching, and full-range reps built more strength and leg muscle than partial ones. That’s why the plan cues a full stretch at the bottom of each rep.',
  },
  {
    id: 'injury', title: 'Strength training, not stretching, prevents injuries', evidence: 'strong', sources: ['lauersen', 'rudisill_hamstring'],
    text: 'In pooled trials, stretching didn’t reduce sports injuries, while strength training cut them to under a third. Eccentric hamstring work, like Nordic curls, cut hamstring injuries by 57–70%.',
  },
  {
    id: 'activity', title: 'Strength plus cardio for health', evidence: 'strong', sources: ['who_activity'],
    text: 'The WHO advises muscle-strengthening work on 2 or more days a week and 150–300 minutes of moderate activity (or 75–150 vigorous). The walks after meals on your schedule count.',
  },
]

/** How each condition changes training, with the evidence. `adds` puts specific work in the plan. */
export interface ConditionTraining {
  condition: ConditionId | 'pregnant' | 'diabetesMeds'
  claims: Claim[]
  /** Isometric work added to the week (blood pressure). */
  adds?: 'isometric'
  /** Keep reps in reserve at or above this on compound lifts. */
  minRir?: number
  /** Swap out exercises done lying on the back. */
  noSupine?: boolean
}

export const CONDITION_TRAINING: ConditionTraining[] = [
  {
    condition: 'hypertension', adds: 'isometric', minRir: 2,
    claims: [
      { text: 'In 270 trials, every type of exercise lowered resting blood pressure, and isometric holds (wall sits, handgrips) lowered it most: about 8/4 mmHg. The plan adds wall sits on three days.', evidence: 'strong', sources: ['edwards_bp'] },
      { text: 'Breathe out during the effort and don’t hold your breath on heavy lifts; straining with a closed throat spikes blood pressure. Compound lifts stop at least 2 reps short of failure.', evidence: 'moderate', sources: ['acsm_htn'] },
      { text: 'Skip inversion tables and hanging upside down: inversion raised blood pressure in a trial.', evidence: 'moderate', sources: ['haskvitz_inversion'] },
    ],
  },
  {
    condition: 't2d',
    claims: [
      { text: 'ACSM advises resistance training 2–3 days a week plus 150 minutes of aerobic activity, and light activity after meals, for glucose control in type 2 diabetes.', evidence: 'strong', sources: ['kanaley'] },
    ],
  },
  {
    condition: 't1d',
    claims: [
      { text: 'Check glucose before, during and after training, and carry fast carbs. Doing resistance work before cardio in the same session can make glucose more stable.', evidence: 'strong', sources: ['riddell'] },
    ],
  },
  {
    condition: 'diabetesMeds',
    claims: [
      { text: 'On insulin or a sulfonylurea, exercise can cause lows during and hours after a session. Check glucose and agree dose changes with your care team.', evidence: 'strong', sources: ['riddell', 'ada_6'] },
    ],
  },
  {
    condition: 'depression',
    claims: [
      { text: 'In a network meta-analysis of 218 trials, walking or jogging, yoga and strength training each reduced depression moderately, and more intense programs helped more. Strength training was one of the easiest to stick with.', evidence: 'strong', sources: ['noetel'] },
    ],
  },
  {
    condition: 'anxiety',
    claims: [
      { text: 'Physical activity reduced anxiety, depression and distress across many trials, with larger effects from higher-intensity programs.', evidence: 'strong', sources: ['singh_pa'] },
    ],
  },
  {
    condition: 'adhd',
    claims: [
      { text: 'Single sessions and regular exercise both improved inhibitory control (stopping impulsive responses) in adults with ADHD, in a meta-analysis of small studies.', evidence: 'emerging', sources: ['yang_adhd', 'cerrillo'] },
      { text: 'The plan keeps sessions short and the same every week, so there is little to decide on the day.', evidence: 'moderate', sources: ['luman'] },
    ],
  },
  {
    condition: 'migraine',
    claims: [
      { text: 'Aerobic exercise 40 minutes, 3 times a week, cut migraine attacks as much as relaxation or the drug topiramate in a randomized trial. Warm up gradually and drink enough water.', evidence: 'moderate', sources: ['varkey'] },
    ],
  },
  {
    condition: 'menopause',
    claims: [
      { text: 'In postmenopausal women with low bone mass, supervised heavy resistance and impact training improved bone density and function in a trial (LIFTMOR). Get coached form before going heavy.', evidence: 'moderate', sources: ['liftmor'] },
    ],
  },
  {
    condition: 'ckd',
    claims: [
      { text: 'Exercise improved fitness, blood pressure and quality of life in kidney disease trials. Your protein stays capped for your kidneys, even while training.', evidence: 'moderate', sources: ['heiwe', 'kdoqi'] },
    ],
  },
  {
    condition: 'pregnant', noSupine: true,
    claims: [
      { text: 'ACOG recommends at least 150 minutes of moderate activity a week in pregnancy, avoiding contact and fall-risk sports and long periods lying flat on the back. Exercises done lying on your back are swapped out.', evidence: 'strong', sources: ['acog_exercise'] },
    ],
  },
]

/** Nutrition that supports training, used for meal-plan recommendations. */
export const FUEL: Record<'protein' | 'deficit' | 'perMeal' | 'timing' | 'creatine', Claim> = {
  protein: { text: 'Protein above about 1.6 g per kg a day gave no further muscle gain from training on average in a meta-analysis (some people benefit up to 2.2 g/kg).', evidence: 'strong', sources: ['morton'] },
  deficit: { text: 'During a large calorie deficit with hard training, a high-protein diet (2.4 vs 1.2 g/kg) gained muscle and lost more fat.', evidence: 'moderate', sources: ['longland'] },
  perMeal: { text: 'For muscle building, about 0.4 g of protein per kg at each of 4 meals spreads the daily target well.', evidence: 'moderate', sources: ['schoenfeld_aragon'] },
  timing: { text: 'A meal with carbs and protein a few hours before or soon after training supports performance and recovery.', evidence: 'moderate', sources: ['kerksick'] },
  creatine: { text: 'Creatine monohydrate (3–5 g a day) adds to strength and muscle gains from training and is well studied for safety in healthy people.', evidence: 'strong', sources: ['kreider'] },
}

export const evidenceOrder: Evidence[] = ['strong', 'moderate', 'emerging', 'limited']
export const TRAINING_SOURCES: SourceId[] = ['schoenfeld_volume', 'schoenfeld_freq', 'acsm_progression', 'who_activity']

// ── Looks, longevity and posture ───────────────────────────

/** The "V-taper" look: broad shoulders and lats, upper chest, arms and abs. */
export const VTAPER: {
  priorities: Muscle[]
  /** Exercises picked first for each muscle when the preset is on. */
  prefer: Partial<Record<Muscle, string[]>>
  claim: Claim & { convention: string }
} = {
  priorities: ['shoulders', 'back', 'chest', 'biceps', 'abs'],
  prefer: {
    shoulders: ['cable_lateral', 'lateral'],
    back: ['pulldown', 'pullup', 'straight_arm'],
    chest: ['incline_db', 'low_high_fly'],
    biceps: ['preacher', 'incline_curl'],
    abs: ['cable_crunch', 'hanging_raise', 'leg_raise'],
  },
  claim: {
    text: 'More weekly sets grow a muscle more, so the preset gives extra sets to the side delts, lats, upper chest, biceps and abs, each trained twice a week.',
    evidence: 'moderate', sources: ['schoenfeld_volume', 'schoenfeld_freq'],
    convention: 'Which muscles make a “V-taper” look is a matter of taste, not science; the choice of muscles and exercises is this app’s.',
  },
}

export const TENDON: { claims: Claim[]; dose: string } = {
  dose: 'Nordic hamstring curls, 2 sets of 4–6 slow reps, once a week on a leg day.',
  claims: [
    { text: 'Programs that included Nordic hamstring curls cut hamstring injuries by about half in a meta-analysis of 15 studies.', evidence: 'strong', sources: ['van_dyk'] },
    { text: 'Heavy, slow strength training stiffens healthy tendons over 8–12+ weeks; how heavy the load is matters more than whether the movement is eccentric.', evidence: 'strong', sources: ['bohm_tendon'] },
    { text: 'Jump training moderately increases tendon stiffness, and about 50 jumps four times a week raised hip bone density by about 1.5% in pooled trials.', evidence: 'moderate', sources: ['plyo_tendon', 'florence_jumps'] },
    { text: 'Taking 15 g of gelatin with vitamin C an hour before exercise raised a marker of collagen synthesis in a small trial. Whether that makes tendons stronger isn’t known yet.', evidence: 'emerging', sources: ['shaw_gelatin'] },
  ],
}

export const POSTURE: { claim: Claim; drills: { name: string; dose: string; cue: string }[]; convention: string } = {
  claim: { text: 'In people with forward head, rounded shoulders or a rounded upper back, programs of strengthening and stretching improved those angles in a meta-analysis of small trials.', evidence: 'emerging', sources: ['sepehri'] },
  convention: 'The drill list and the 10-minute dose are this app’s choice; the trials combined strengthening and stretching like this.',
  drills: [
    { name: 'Chin tucks', dose: '2 × 10, 3-second hold', cue: 'Glide the head straight back, making a double chin, without tilting.' },
    { name: 'Wall angels', dose: '2 × 10', cue: 'Back, head and arms against a wall; slide the arms up and down without arching.' },
    { name: 'Y-W-T raises', dose: '2 × 8 of each', cue: 'Face down on an incline or bent over, lift the arms into Y, W and T shapes with the shoulder blades squeezed.' },
    { name: 'Doorway chest stretch', dose: '2 × 30 s each side', cue: 'Forearm on the door frame, step through until the front of the shoulder stretches.' },
    { name: 'Upper-back extension over a foam roller', dose: '1 × 10', cue: 'Roller across the upper back, hands behind the head, extend over it.' },
    { name: 'Dead hang', dose: '2–3 holds', cue: 'Hang from a bar with relaxed shoulders, then pull the shoulders down slightly; build time week by week.' },
  ],
}

/**
 * Fascia & mobility, rebuilt on a review of the meta-analyses (see the "Fascia mobility and height
 * evidence" report): lasting range comes from regular stretching or full-range loaded training,
 * mostly through stretch tolerance; rolling is a short-term warm-up and soreness aid, not a way to
 * "release" fascia; nothing lengthens adult bones, and height loss is a bone-health signal.
 */
export const FASCIA: {
  claims: Claim[]; mechanism: Claim; safety: Claim; height: Claim[]
  drills: { name: string; dose: string; cue: string }[]; convention: string
} = {
  claims: [
    { text: 'Stretching regularly for several weeks clearly improves flexibility, with moderate-to-large gains in pooled trials, and it works for older adults too.', evidence: 'strong', sources: ['konrad_stretch', 'ingram_dose'] },
    { text: 'About 10 minutes per muscle group a week (roughly 4 minutes a session, a few days a week) captured most of the gain, and comfortable stretches worked about as well as intense ones.', evidence: 'moderate', sources: ['ingram_dose', 'konrad_stretch'] },
    { text: 'Lifting with added load through a full range of motion improves flexibility about as much as stretching; if you already train that way, extra stretching adds little range on average.', evidence: 'strong', sources: ['alizadeh_rom', 'afonso_rom'] },
    { text: 'One session of stretching, rolling or any active warm-up gives a small boost in range that fades within about 10–30 minutes.', evidence: 'strong', sources: ['behm_acute', 'warneke_warmup', 'konrad_bout'] },
    { text: 'Static holds under about 60 seconds before exercise barely affect performance; longer holds can briefly reduce maximal strength.', evidence: 'strong', sources: ['behm_stretch'] },
    { text: 'Rolling after hard exercise modestly reduces soreness over the next 1–3 days; about 90 seconds per muscle looked like the minimum that helped.', evidence: 'moderate', sources: ['zhou_doms', 'wiewelhove', 'hughes_rolling'] },
    { text: 'Rolling for more than 4 weeks also improves range, though stretching works faster, and rolling doesn’t make you faster or stronger.', evidence: 'moderate', sources: ['konrad_rolling', 'konrad_vs', 'konrad_perf'] },
    { text: 'Moderate pressure (about 4–6 out of 10 discomfort) increased range as much as painful rolling.', evidence: 'emerging', sources: ['grabow_pressure'] },
    { text: 'Foot exercises, or walking in flexible minimalist shoes with steps added gradually, strengthen the foot muscles.', evidence: 'moderate', sources: ['peters_dickie', 'jaffri_foot', 'ridge_walking'] },
    { text: 'Switching to minimalist shoes for running too quickly led to foot bone stress and calf or Achilles pain; build up over at least 10–12 weeks, starting with walking.', evidence: 'moderate', sources: ['ridge_edema', 'fuller_minimal'] },
  ],
  mechanism: {
    text: 'Rolling and stretching mainly change how your nervous system senses stretch, not the fascia itself: deforming dense fascia takes forces beyond what hands or rollers apply, rolling one leg also loosened the other, and stretching barely lengthens muscle fibres.',
    evidence: 'moderate', sources: ['chaudhry_fascia', 'behm_wilke', 'krause_sliding', 'kasahara_cross', 'ingram_mech', 'panidi'],
  },
  safety: { text: 'Don’t roll over open wounds or fractures, and check with a clinician first if you have a blood clot, local inflammation or an infection.', evidence: 'limited', sources: ['bartsch_delphi'] },
  height: [
    { text: 'You are about 1–2 cm taller when you wake up; most of it is lost in the first hours upright and comes back lying down as your spinal discs regain fluid. Measure your height at the same time of day, ideally the morning.', evidence: 'strong', sources: ['reilly_stature', 'tyrrell_stature'] },
    { text: 'Hanging, inversion and traction add only a few millimetres for a short time, which normal upright activity reverses, and traction does little for back pain.', evidence: 'limited', sources: ['bridger_traction', 'marcos_float', 'wegner_traction'] },
    { text: 'Hanging upside down more than doubled eye pressure and raised blood pressure, so avoid inversion with glaucoma, other eye disease or high blood pressure.', evidence: 'moderate', sources: ['friberg_inversion', 'sanborn_inversion', 'haskvitz_inversion'] },
    { text: 'Exercise, especially back strengthening, modestly improves a rounded upper back and forward-head posture, but no study has measured whether it adds standing height.', evidence: 'moderate', sources: ['ponzano_kyphosis', 'gonzalez_kyphosis', 'katzman_sheaf', 'sepehri'] },
    { text: 'Once the growth plates close in adolescence, no exercise, stretching, hanging or supplement makes bones longer.', evidence: 'strong', sources: ['niams_growth'] },
    { text: 'In healthy older adults, growth hormone changed body composition, not height, and caused more side effects such as swelling and joint pain.', evidence: 'moderate', sources: ['liu_gh'] },
  ],
  convention: 'The drill list, holds and weekly schedule are this app’s choice, built around the doses in the cited studies.',
  drills: [
    { name: 'Lift through a full range', dose: 'Every session', cue: 'Lower each rep under control to a full stretch. Loaded full-range training builds range as well as strength.' },
    { name: 'Hip flexor stretch', dose: '2 × 60 s each side, 3–4 days a week', cue: 'Half-kneeling, squeeze the back glute and shift forward until the front of the hip stretches. Comfortable, not painful.' },
    { name: 'Hamstring and calf stretch', dose: '2 × 60 s each side, 3–4 days a week', cue: 'Heel on a low step, hips back, back flat; then a wall calf stretch with the back heel down.' },
    { name: 'Foam roll after hard sessions', dose: 'About 90 s per sore muscle', cue: 'Slow passes at a moderate 4–6 out of 10. Never sharp pain, and never over wounds or fresh bruises.' },
    { name: 'Short-foot drill', dose: '2 × 10, 5-second hold', cue: 'Seated or standing, pull the ball of the foot toward the heel to lift the arch without curling the toes.' },
    { name: 'Walk in flexible, flat shoes', dose: 'Add a little each week, over 10–12+ weeks', cue: 'Start with short walks. Switch running shoes slowly, if at all.' },
    { name: 'Rest lying down, legs supported', dose: '5 minutes after heavy lifting', cue: 'On your back with your calves on a chair, breathing slowly. Lying down restores the day’s spinal compression.' },
  ],
}

/** Popular mobility, fascia and height claims, checked against the research. Shown under "How it works". */
export const MOBILITY_MYTHS: { myth: string; claim: Claim }[] = [
  { myth: 'Foam rollers break up adhesions and “release” fascia', claim: { text: 'Deforming dense fascia takes forces beyond what rollers apply; rolling changes how stretch feels without changing stiffness, and reviewers call the term “misleading”.', evidence: 'moderate', sources: ['chaudhry_fascia', 'behm_wilke', 'krause_sliding'] } },
  { myth: 'The more it hurts, the better it works', claim: { text: 'Moderate rolling pressure increased range as much as painful pressure.', evidence: 'emerging', sources: ['grabow_pressure'] } },
  { myth: 'Rolling or “fascia hops” rehydrate fascia', claim: { text: 'Fascia hydration has only been measured in animal tissue in the lab; no exercise trial has tested it in people.', evidence: 'limited', sources: ['schleip_hydration', 'behm_wilke'] } },
  { myth: 'Stretching makes your muscles longer', claim: { text: 'Muscle fibres barely lengthen; most of the gain is your nervous system tolerating more stretch.', evidence: 'strong', sources: ['ingram_mech', 'panidi'] } },
  { myth: 'Stretching prevents injuries', claim: { text: 'Stretching didn’t reduce sports injuries in pooled trials, while strength training cut them to under a third, and eccentric hamstring work cut hamstring injuries by 57–70%.', evidence: 'strong', sources: ['lauersen', 'rudisill_hamstring'] } },
  { myth: 'Stretching prevents soreness', claim: { text: 'Stretching before or after exercise made no meaningful difference to next-day soreness.', evidence: 'strong', sources: ['herbert_doms'] } },
  { myth: 'Short-foot exercises fix flat feet', claim: { text: 'Arch changes were tiny (about 0.2 mm) or absent, even though foot strength improves.', evidence: 'emerging', sources: ['huang_flatfoot', 'cheng_flatfoot'] } },
  { myth: 'Barefoot or minimalist running prevents injuries', claim: { text: 'A fast switch raised injury risk, including foot bone stress.', evidence: 'moderate', sources: ['ridge_edema', 'fuller_minimal'] } },
  { myth: 'Hanging, inversion or decompression makes you permanently taller', claim: { text: 'Gains are millimetres and reverse once you’re upright; the normal daily swing is 1–2 cm.', evidence: 'limited', sources: ['bridger_traction', 'marcos_float', 'reilly_stature'] } },
  { myth: 'Fixing your posture adds inches', claim: { text: 'Never measured: posture trials changed spinal angles by a few degrees, which implies millimetres.', evidence: 'limited', sources: ['katzman_sheaf', 'ponzano_kyphosis'] } },
  { myth: 'Adults can grow taller with stretching, supplements or growth hormone', claim: { text: 'Bone length is fixed once growth plates close; growth hormone changes body composition, not height.', evidence: 'strong', sources: ['niams_growth', 'liu_gh'] } },
]

/** What strength and body measurements say about health. */
export const CHECKINS: Record<'grip' | 'waist' | 'trend' | 'height', Claim & { convention?: string }> = {
  height: {
    text: 'Losing about 1 cm of height per decade after 40 is common, but losing more than 2 cm over 1–3 years, or more than 6 cm from your tallest height, can signal spine fractures and is worth raising with a clinician. Measure in the morning, since you’re 1–2 cm shorter by evening.',
    evidence: 'moderate', sources: ['medline_height', 'siminoski_2005', 'siminoski_2006', 'reilly_stature'],
    convention: 'Comparing to your tallest logged or profile height is this app’s method.',
  },
  grip: { text: 'In about 140,000 adults across 17 countries, every 5 kg lower grip strength was linked to 16% higher risk of death, a stronger predictor than blood pressure.', evidence: 'moderate', sources: ['leong_grip'] },
  waist: { text: 'NICE advises keeping your waist to less than half your height: a waist-to-height ratio under 0.5. From 0.5 to 0.59 means increased health risk, and 0.6 or more means high risk.', evidence: 'strong', sources: ['nice_whtr'] },
  trend: {
    text: 'Day-to-day weight swings with water and food in the gut, so compare weekly averages. During a modest surplus, a slow rise alongside better gym numbers suggests muscle rather than fat.',
    evidence: 'moderate', sources: ['iraki'],
    convention: 'Comparing 7-day averages is this app’s method.',
  },
}

/** Testosterone: what moves it, and a myth. Shown on the Train tab for men or a looks goal. */
export const HORMONE_CUES: Claim[] = [
  { text: 'One week of 5-hour nights lowered daytime testosterone by 10–15% in young men. Sleep is the cheapest lever.', evidence: 'moderate', sources: ['leproult_t'] },
  { text: 'In men with obesity, losing weight raised testosterone, more so with larger losses.', evidence: 'moderate', sources: ['corona'] },
  { text: 'Soy foods and isoflavones did not change testosterone or other male reproductive hormones in a meta-analysis of 41 clinical studies. Tofu and soy milk stay in the plan.', evidence: 'strong', sources: ['reed_soy'] },
]

/** Promoted for muscle or looks, but harmful or backfiring. Never planned; doses never given. */
export const NOT_FOR_YOU: { name: string; claim: Claim }[] = [
  {
    name: 'Anabolic steroids and “steroid-like” supplements (including SARMs)',
    claim: { text: 'The FDA warns that bodybuilding products sold as supplements may illegally contain steroids or steroid-like substances. These have been linked to liver injury, severe acne, hair loss, mood changes, testicular shrinkage and blood clots. The Endocrine Society lists heart, hormone and psychiatric harms from performance-enhancing drugs.', evidence: 'strong', sources: ['fda_bodybuilding', 'pope_aas'] },
  },
  {
    name: 'D-aspartic acid',
    claim: { text: 'Sold to raise testosterone, but 6 g a day lowered testosterone in resistance-trained men in a randomized trial.', evidence: 'moderate', sources: ['melville_daa'] },
  },
  {
    name: 'Vitamin C megadoses',
    claim: { text: 'Men taking vitamin C supplements had about twice the rate of kidney stones in a large cohort. The adult upper limit is 2,000 mg a day; food gives plenty.', evidence: 'moderate', sources: ['thomas_vitc', 'ods_vitC'] },
  },
]
