/**
 * Exercises, the equipment they need, the joints they load and the muscles they work.
 *
 * - Gear is what an exercise needs (a capability, like "cable" or "incline bench").
 * - EQUIPMENT is what people actually own (a cable station, a Bowflex-style rod gym, a TRX-style
 *   suspension trainer…); each item provides one or more kinds of gear.
 * - Stress marks what an exercise asks of the body, so physical limitations can rule it out.
 * - Muscle heads (who does the work) live in HEADS, filled per muscle group in ./extra/.
 */
import { DIAGRAMS_BACK, FORM_BACK, HEADS_BACK } from './extra/back'
import { DIAGRAMS_CHEST, FORM_CHEST, HEADS_CHEST } from './extra/chest'
import { DIAGRAMS_CORE, FORM_CORE, HEADS_CORE } from './extra/core'
import { DIAGRAMS_LEGS, FORM_LEGS, HEADS_LEGS } from './extra/legs'
import { DIAGRAMS_SHOULDERS, FORM_SHOULDERS, HEADS_SHOULDERS } from './extra/shoulders'
import { DIAGRAMS_BALANCE, EX_BALANCE, FORM_BALANCE, HEADS_BALANCE } from './extra/balance'
import { DIAGRAMS_MOBILITY_LOWER, EX_MOBILITY_LOWER, FORM_MOBILITY_LOWER, HEADS_MOBILITY_LOWER } from './extra/mobility_lower'
import { DIAGRAMS_MOBILITY_UPPER, EX_MOBILITY_UPPER, FORM_MOBILITY_UPPER, HEADS_MOBILITY_UPPER } from './extra/mobility_upper'
import { DIAGRAMS_YOGA, EX_YOGA, FORM_YOGA, HEADS_YOGA } from './extra/yoga'
import type { Diagram } from '../lib/pose'
import type { FormGuide } from './form'

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

// ── Gear and equipment ──────────────────────────────────────────

export type Gear =
  | 'bodyweight' | 'barbell' | 'trap_bar' | 'landmine' | 'dumbbell' | 'kettlebell'
  | 'bench' | 'incline_bench' | 'pullup_bar' | 'dip_bars' | 'box' | 'back_ext'
  | 'cable' | 'cable_dual' | 'smith' | 'leg_press' | 'leg_ext' | 'leg_curl' | 'chest_press' | 'shoulder_press'
  | 'row_machine' | 'pec_deck' | 'calf_machine'
  | 'band' | 'mini_band' | 'suspension' | 'ab_wheel' | 'stability_ball'

export type EquipmentId =
  | 'dumbbells' | 'kettlebells' | 'barbell_rack' | 'trap_bar' | 'landmine'
  | 'flat_bench' | 'adjustable_bench' | 'pullup_bar' | 'dip_station' | 'box' | 'back_ext_bench'
  | 'cable_station' | 'lat_machine' | 'smith' | 'leg_press' | 'leg_ext' | 'leg_curl' | 'chest_press'
  | 'shoulder_press' | 'row_machine' | 'pec_deck' | 'calf_machine' | 'assisted_machine'
  | 'suspension' | 'rings' | 'rod_gym' | 'digital_cable' | 'all_in_one'
  | 'bands' | 'mini_bands' | 'ab_wheel' | 'stability_ball'

export type EquipmentGroup = 'free' | 'bench' | 'machine' | 'home' | 'small'
export const EQUIPMENT_GROUPS: { id: EquipmentGroup; label: string }[] = [
  { id: 'free', label: 'Free weights' },
  { id: 'bench', label: 'Benches, bars and boxes' },
  { id: 'home', label: 'Home gym systems' },
  { id: 'machine', label: 'Gym machines' },
  { id: 'small', label: 'Bands and small gear' },
]

export interface Equipment { id: EquipmentId; label: string; detail?: string; group: EquipmentGroup; gives: Gear[] }

// Brand names only say what kind of system is meant ("TRX-style"); the app isn't affiliated with them.
export const EQUIPMENT: Equipment[] = [
  { id: 'dumbbells', label: 'Dumbbells', detail: 'A set or adjustable', group: 'free', gives: ['dumbbell'] },
  { id: 'kettlebells', label: 'Kettlebells', group: 'free', gives: ['kettlebell'] },
  { id: 'barbell_rack', label: 'Barbell, plates and a rack', group: 'free', gives: ['barbell'] },
  { id: 'trap_bar', label: 'Trap (hex) bar', group: 'free', gives: ['trap_bar'] },
  { id: 'landmine', label: 'Landmine attachment', detail: 'Or a barbell end wedged in a corner', group: 'free', gives: ['landmine'] },
  { id: 'flat_bench', label: 'Flat bench', group: 'bench', gives: ['bench'] },
  { id: 'adjustable_bench', label: 'Adjustable (incline) bench', group: 'bench', gives: ['bench', 'incline_bench'] },
  { id: 'pullup_bar', label: 'Pull-up bar', group: 'bench', gives: ['pullup_bar'] },
  { id: 'dip_station', label: 'Dip bars or station', group: 'bench', gives: ['dip_bars'] },
  { id: 'box', label: 'Sturdy box or step', detail: 'Knee height or lower', group: 'bench', gives: ['box'] },
  { id: 'back_ext_bench', label: 'Back extension bench', detail: '45° or flat hyperextension', group: 'bench', gives: ['back_ext'] },
  { id: 'suspension', label: 'Suspension trainer', detail: 'TRX-style straps', group: 'home', gives: ['suspension'] },
  { id: 'rings', label: 'Gymnastic rings', group: 'home', gives: ['suspension'] },
  { id: 'rod_gym', label: 'Rod or cable home gym', detail: 'Bowflex-style, with bench and leg attachment', group: 'home', gives: ['cable', 'cable_dual', 'bench', 'leg_ext', 'leg_curl'] },
  { id: 'digital_cable', label: 'Wall-mounted or digital cable trainer', detail: 'Tonal-style', group: 'home', gives: ['cable', 'cable_dual'] },
  { id: 'all_in_one', label: 'All-in-one trainer', detail: 'Rack, Smith machine and cables in one', group: 'home', gives: ['barbell', 'smith', 'cable', 'cable_dual', 'pullup_bar', 'dip_bars'] },
  { id: 'cable_station', label: 'Cable station or crossover', detail: 'Adjustable pulleys', group: 'machine', gives: ['cable', 'cable_dual'] },
  { id: 'lat_machine', label: 'Lat pulldown and low-row machine', group: 'machine', gives: ['cable'] },
  { id: 'smith', label: 'Smith machine', group: 'machine', gives: ['smith'] },
  { id: 'leg_press', label: 'Leg press', group: 'machine', gives: ['leg_press'] },
  { id: 'leg_ext', label: 'Leg extension', group: 'machine', gives: ['leg_ext'] },
  { id: 'leg_curl', label: 'Leg curl', group: 'machine', gives: ['leg_curl'] },
  { id: 'chest_press', label: 'Chest press machine', group: 'machine', gives: ['chest_press'] },
  { id: 'shoulder_press', label: 'Shoulder press machine', group: 'machine', gives: ['shoulder_press'] },
  { id: 'row_machine', label: 'Seated or chest-supported row machine', group: 'machine', gives: ['row_machine'] },
  { id: 'pec_deck', label: 'Pec deck / rear-delt machine', group: 'machine', gives: ['pec_deck'] },
  { id: 'calf_machine', label: 'Calf raise machine', group: 'machine', gives: ['calf_machine'] },
  { id: 'assisted_machine', label: 'Assisted pull-up and dip machine', group: 'machine', gives: ['pullup_bar', 'dip_bars'] },
  { id: 'bands', label: 'Long resistance bands', detail: 'With a door anchor', group: 'small', gives: ['band'] },
  { id: 'mini_bands', label: 'Mini loop bands', group: 'small', gives: ['mini_band'] },
  { id: 'ab_wheel', label: 'Ab wheel', group: 'small', gives: ['ab_wheel'] },
  { id: 'stability_ball', label: 'Stability ball', group: 'small', gives: ['stability_ball'] },
]
export const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e])) as Record<EquipmentId, Equipment>

export type Access = 'gym' | 'home' | 'bodyweight'

/** Quick starting points; people then tick exactly what they have. */
export const ACCESS: { id: Access; label: string; detail: string; equipment: EquipmentId[] }[] = [
  {
    id: 'gym', label: 'Gym', detail: 'Free weights, benches, cables and machines',
    equipment: ['dumbbells', 'kettlebells', 'barbell_rack', 'trap_bar', 'landmine', 'flat_bench', 'adjustable_bench', 'pullup_bar', 'dip_station', 'box', 'back_ext_bench', 'cable_station', 'lat_machine', 'smith', 'leg_press', 'leg_ext', 'leg_curl', 'chest_press', 'shoulder_press', 'row_machine', 'pec_deck', 'calf_machine', 'assisted_machine', 'bands', 'mini_bands', 'ab_wheel', 'stability_ball'],
  },
  { id: 'home', label: 'Home with dumbbells', detail: 'Dumbbells, an adjustable bench, a pull-up bar and bands', equipment: ['dumbbells', 'adjustable_bench', 'pullup_bar', 'bands'] },
  { id: 'bodyweight', label: 'No equipment', detail: 'Bodyweight only', equipment: [] },
]

/** Every kind of gear a set of equipment provides; bodyweight is always there. */
export function gearOf(equipment: EquipmentId[]): Set<Gear> {
  return new Set<Gear>(['bodyweight', ...equipment.flatMap((id) => EQUIPMENT_BY_ID[id]?.gives ?? [])])
}

/** Each item is needed; an inner list means any one of them. */
export type GearNeed = Gear | Gear[]
export const canDo = (e: Exercise, gear: Set<Gear>) => e.gear.every((g) => (Array.isArray(g) ? g.some((x) => gear.has(x)) : gear.has(g)))
/** The gear an exercise needs, flattened (first choice of each alternative), for labels. */
export const gearNames = (e: Exercise) => e.gear.map((g) => (Array.isArray(g) ? g.join(' or ') : g))

// ── What an exercise asks of the body ───────────────────────────

export type Stress =
  | 'overhead' // arms overhead under load
  | 'shoulder_deep' // the shoulder taken far behind the body under load (dips, deep flys)
  | 'hanging' // hanging from a bar
  | 'wrist_load' // body weight on the hands with the wrists bent back
  | 'spine_flexion' // curling the spine (crunches)
  | 'spine_twist' // twisting the spine against load
  | 'spine_load' // heavy load through the spine (barbell squats, deadlifts, bent rows, swings)
  | 'deep_knee' // deep knee bend under load
  | 'kneeling' // kneeling on the knees
  | 'deep_hip' // deep hip bend under load
  | 'balance' // standing on one leg or unsupported
  | 'head_down' // head lower than the heart
  | 'floor' // getting down onto the floor
  | 'prone' // lying face down

/** What an exercise is for: lifting builds muscle; the rest are planned on stretch, yoga and balance days. */
export type ExerciseKind = 'strength' | 'mobility' | 'yoga' | 'balance'

/** Body regions people can ask to stretch more. */
export type Region =
  | 'neck' | 'chest' | 'shoulders' | 'upper_back' | 'lats' | 'lower_back' | 'wrists'
  | 'hip_flexors' | 'glutes' | 'adductors' | 'hamstrings' | 'quads' | 'calves'

export const REGIONS: { id: Region; label: string; detail: string }[] = [
  { id: 'neck', label: 'Neck', detail: 'Sides and back of the neck' },
  { id: 'chest', label: 'Chest', detail: 'Chest and the front of the shoulders' },
  { id: 'shoulders', label: 'Back of the shoulders', detail: 'Rear shoulder and rotator cuff' },
  { id: 'upper_back', label: 'Upper back', detail: 'Between and around the shoulder blades' },
  { id: 'lats', label: 'Lats and sides', detail: 'Sides of the back, for reaching overhead' },
  { id: 'lower_back', label: 'Lower back', detail: 'Lower back and the sides of the waist' },
  { id: 'wrists', label: 'Wrists and forearms', detail: 'For push-ups, typing and grip' },
  { id: 'hip_flexors', label: 'Hip flexors', detail: 'Front of the hips, tight from sitting' },
  { id: 'glutes', label: 'Glutes and outer hips', detail: 'Buttocks and the deep hip rotators' },
  { id: 'adductors', label: 'Inner thighs', detail: 'Adductors, for wide stances and squats' },
  { id: 'hamstrings', label: 'Hamstrings', detail: 'Back of the thighs' },
  { id: 'quads', label: 'Quads', detail: 'Front of the thighs' },
  { id: 'calves', label: 'Calves and ankles', detail: 'For squat depth and walking' },
]
export const REGION_LABEL = Object.fromEntries(REGIONS.map((r) => [r.id, r.label])) as Record<Region, string>

export interface Exercise {
  id: string
  name: string
  gear: GearNeed[]
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
  stress?: Stress[]
  /** Only planned as a specific add-on (blood pressure, injury-proofing, a limitation), never for volume. */
  addOnOnly?: boolean
  /** Missing means strength (lifting). */
  kind?: ExerciseKind
  /** Regions a stretch, mobility drill or yoga pose works on. */
  regions?: Region[]
  /** The dose for a stretch, pose or balance drill, e.g. "2 × 30–60 s each side". */
  hold?: string
  /** Can be done holding a counter or wall, so it stays in the plan with balance problems. */
  support?: boolean
  /** Loads the target muscle hardest where it is stretched (deep in the range). */
  long?: boolean
  /** One arm or leg at a time. */
  unilateral?: boolean
}

export const kindOf = (e: Exercise): ExerciseKind => e.kind ?? 'strength'
export const isLift = (e: Exercise) => kindOf(e) === 'strength'

const ex = (id: string, name: string, gear: GearNeed[], primary: Muscle[], secondary: Muscle[], compound: boolean, cue: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, gear, primary, secondary, compound, cue, ...extra })

// Cues are this app's own short reminders; full-range, controlled reps are the common thread.
const LIFTS: Exercise[] = [
  // ── Chest ──
  ex('bench', 'Barbell bench press', ['barbell', 'bench'], ['chest'], ['triceps', 'shoulders'], true, 'Shoulder blades pulled back, bar touches the lower chest, press up and slightly back.', { supine: true }),
  ex('incline_db', 'Incline dumbbell press', ['dumbbell', 'incline_bench'], ['chest'], ['shoulders', 'triceps'], true, 'Bench at about 30° (45° at most), lower until you feel a stretch across the chest.'),
  ex('db_bench', 'Dumbbell bench press', ['dumbbell', 'bench'], ['chest'], ['triceps', 'shoulders'], true, 'Lower the dumbbells to chest level with elbows about 45° from your sides.', { supine: true }),
  ex('machine_press', 'Machine chest press', ['chest_press'], ['chest'], ['triceps', 'shoulders'], true, 'Seat set so the handles line up with mid-chest; control the way back.'),
  ex('smith_bench', 'Smith machine bench press', ['smith', 'bench'], ['chest'], ['triceps', 'shoulders'], true, 'Bench set so the bar comes down to the lower chest; set the safety stops just above your chest.', { supine: true }),
  ex('floor_press', 'Dumbbell floor press', ['dumbbell'], ['chest'], ['triceps'], true, 'Lying on the floor, lower until the upper arms touch down; the floor limits the range, which suits sore shoulders.', { supine: true, stress: ['floor'] }),
  ex('cable_press', 'Standing cable chest press', ['cable_dual'], ['chest'], ['triceps', 'shoulders'], true, 'Split stance between the pulleys, press the handles forward and together at chest height.'),
  ex('trx_press', 'Suspension chest press', ['suspension'], ['chest'], ['triceps', 'shoulders'], true, 'Face away from the anchor, lean into the straps and lower your chest between your hands; walk your feet back to make it harder.'),
  ex('band_press', 'Band chest press', ['band'], ['chest'], ['triceps', 'shoulders'], true, 'Anchor the band behind you at chest height and press forward until the arms are straight.'),
  ex('cable_fly', 'Cable fly', ['cable_dual'], ['chest'], [], false, 'Slight bend in the elbows, bring the hands together in a wide hug.'),
  ex('pec_deck', 'Pec deck fly', ['pec_deck'], ['chest'], [], false, 'Seat so the handles are at chest height; squeeze them together, then open until you feel a mild stretch.'),
  ex('db_fly', 'Incline dumbbell fly', ['dumbbell', 'incline_bench'], ['chest'], [], false, 'Open until the upper arms are level with the bench or you feel a mild stretch, then bring them up.', { stress: ['shoulder_deep'] }),
  ex('pushup', 'Push-up', ['bodyweight'], ['chest'], ['triceps', 'shoulders'], true, 'Body in a straight line, chest to just above the floor. Raise the hands on a bench to make it easier, or the feet to make it harder.', { stress: ['wrist_load', 'floor'] }),
  ex('incline_pushup', 'Incline push-up', ['bench'], ['chest'], ['triceps', 'shoulders'], true, 'Hands on a bench or kitchen counter, body straight; the higher the hands, the easier it is.', { stress: ['wrist_load'] }),
  ex('dip', 'Dip', ['dip_bars'], ['chest', 'triceps'], ['shoulders'], true, 'Lean slightly forward and lower until the upper arms are about level.', { stress: ['shoulder_deep'] }),
  ex('low_high_fly', 'Low-to-high cable fly', ['cable_dual'], ['chest'], ['shoulders'], false, 'Cables low, sweep the hands up to chin height: aims at the upper chest.'),
  // ── Back ──
  ex('pulldown', 'Lat pulldown', ['cable'], ['back'], ['biceps'], true, 'Pull the bar to the upper chest, driving the elbows down.', { stress: ['overhead'] }),
  ex('pullup', 'Pull-up or chin-up', ['pullup_bar'], ['back'], ['biceps'], true, 'From a full hang, pull until the chin passes the bar. Use a band for help.', { stress: ['overhead', 'hanging'] }),
  ex('band_pulldown', 'Band lat pulldown', ['band'], ['back'], ['biceps'], true, 'Band anchored high; kneel or sit and pull your elbows down to your sides.', { stress: ['overhead'] }),
  ex('cable_row', 'Seated cable row', ['cable'], ['back'], ['biceps'], true, 'Chest up, pull the handle to the stomach, then reach forward slowly without slumping.'),
  ex('db_row', 'One-arm dumbbell row', ['dumbbell', 'bench'], ['back'], ['biceps'], true, 'Hand and knee on the bench, pull the dumbbell toward the hip.'),
  ex('chest_row', 'Chest-supported row machine', ['row_machine'], ['back'], ['biceps', 'shoulders'], true, 'Chest against the pad so the back does the work, not momentum.'),
  ex('chest_db_row', 'Chest-supported dumbbell row', ['dumbbell', 'incline_bench'], ['back'], ['biceps', 'shoulders'], true, 'Lie face down on a 30–45° bench and row both dumbbells to your ribs; the bench takes the load off your lower back.'),
  ex('barbell_row', 'Bent-over barbell row', ['barbell'], ['back'], ['biceps', 'hamstrings'], true, 'Hinge to about 45° with a flat back and row the bar to your lower ribs.', { stress: ['spine_load'] }),
  ex('trx_row', 'Suspension row', ['suspension'], ['back'], ['biceps'], true, 'Lean back holding the straps, body straight, and pull your chest to your hands; walk your feet forward to make it harder.'),
  ex('band_row', 'Band row', ['band'], ['back'], ['biceps'], true, 'Anchor the band at chest height and pull your elbows back.'),
  ex('inverted_row', 'Inverted row (under a table)', ['bodyweight'], ['back'], ['biceps'], true, 'Lie under a sturdy table, grip the edge and pull your chest up to it. Bend the knees to make it easier.', { stress: ['floor'] }),
  ex('straight_arm', 'Straight-arm pulldown', ['cable'], ['back'], [], false, 'Arms nearly straight, sweep the bar to the thighs; feel it in the lats, not the arms.', { stress: ['overhead'] }),
  ex('superman', 'Prone back extension (superman)', ['bodyweight'], ['back'], ['glutes'], false, 'Face down, lift your chest and arms a few centimetres, squeeze the shoulder blades and hold 3 seconds. Small and controlled.', { stress: ['floor', 'prone'], addOnOnly: true }),
  // ── Shoulders ──
  ex('ohp', 'Seated dumbbell shoulder press', ['dumbbell', 'bench'], ['shoulders'], ['triceps'], true, 'Press up and slightly in, without arching the lower back.', { stress: ['overhead'] }),
  ex('machine_ohp', 'Machine shoulder press', ['shoulder_press'], ['shoulders'], ['triceps'], true, 'Handles start at chin height; press without shrugging.', { stress: ['overhead'] }),
  ex('landmine_press', 'Landmine press', ['barbell', 'landmine'], ['shoulders'], ['chest', 'triceps'], true, 'Press the end of the bar up and forward from the shoulder; the angled path is kinder to sore shoulders than pressing straight up.'),
  ex('pike_pushup', 'Pike push-up', ['bodyweight'], ['shoulders'], ['triceps'], true, 'Hips high, lower the head toward the floor between the hands.', { stress: ['overhead', 'wrist_load', 'head_down', 'floor'] }),
  ex('lateral', 'Lateral raise', ['dumbbell'], ['shoulders'], [], false, 'Raise to shoulder height leading with the elbows; light weight, strict form.'),
  ex('cable_lateral', 'Cable lateral raise', ['cable'], ['shoulders'], [], false, 'Cable from the opposite side, raise to shoulder height.'),
  ex('band_lateral', 'Band lateral raise', ['band'], ['shoulders'], [], false, 'Stand on the band and raise your arms out to shoulder height, elbows soft.'),
  ex('rear_fly', 'Rear-delt fly', ['dumbbell'], ['shoulders'], ['back'], false, 'Hinge forward, open the arms wide; works the back of the shoulders.'),
  ex('reverse_pec_deck', 'Reverse pec deck', ['pec_deck'], ['shoulders'], ['back'], false, 'Face the pad, arms straight ahead, and sweep them back to your sides.'),
  ex('face_pull', 'Face pull', ['cable'], ['shoulders'], ['back'], false, 'Pull the rope to the face with elbows high, hands finishing beside the ears.'),
  ex('band_face_pull', 'Band face pull', ['band'], ['shoulders'], ['back'], false, 'Band anchored at face height; pull toward your face with the elbows high and wide.'),
  ex('band_pull_apart', 'Band pull-apart', ['band'], ['shoulders'], ['back'], false, 'Arms straight at chest height, pull the band apart to your chest.'),
  ex('trx_y', 'Suspension Y-raise', ['suspension'], ['shoulders'], ['back'], false, 'Lean back holding the straps and raise your straight arms into a Y; works the rear shoulders and lower traps.', { stress: ['overhead'] }),
  ex('band_external_rotation', 'Band external rotation', ['band'], ['shoulders'], [], false, 'Elbow tucked at your side with a towel under it, rotate the forearm outward against the band, slowly.', { addOnOnly: true }),
  ex('cable_external_rotation', 'Cable external rotation', ['cable'], ['shoulders'], [], false, 'Elbow at your side, pulley at elbow height, rotate the forearm out and back slowly.', { addOnOnly: true }),
  // ── Biceps ──
  ex('db_curl', 'Dumbbell curl', ['dumbbell'], ['biceps'], [], false, 'Elbows stay at your sides; lower slowly all the way.'),
  ex('bb_curl', 'Barbell curl', ['barbell'], ['biceps'], [], false, 'Shoulder-width grip, elbows by your sides, no swinging.'),
  ex('incline_curl', 'Incline dumbbell curl', ['dumbbell', 'incline_bench'], ['biceps'], [], false, 'Lying back on an incline bench stretches the biceps at the bottom.'),
  ex('preacher', 'Preacher curl', ['dumbbell', 'incline_bench'], ['biceps'], [], false, 'Upper arm flat on an inclined bench back; lower all the way without bouncing.'),
  ex('spider_curl', 'Spider curl', ['dumbbell', 'incline_bench'], ['biceps'], [], false, 'Chest on an incline bench, arms hanging straight down; curl without moving the upper arms.'),
  ex('concentration_curl', 'Concentration curl', ['dumbbell', 'bench'], ['biceps'], [], false, 'Seated, elbow braced on the inside of your thigh; curl slowly and squeeze.'),
  ex('cable_curl', 'Cable curl', ['cable'], ['biceps'], [], false, 'Constant tension: no swinging, full range.'),
  ex('bayesian_curl', 'Behind-the-body cable curl', ['cable'], ['biceps'], [], false, 'Face away from a low pulley, arm drawn back behind you, and curl; the biceps works from a full stretch.', { stress: ['shoulder_deep'] }),
  ex('hammer_curl', 'Hammer curl', ['dumbbell'], ['biceps'], [], false, 'Palms facing each other; also trains the forearm.'),
  ex('band_curl', 'Band curl', ['band'], ['biceps'], [], false, 'Stand on the band and curl with elbows fixed.'),
  ex('trx_curl', 'Suspension curl', ['suspension'], ['biceps'], [], false, 'Lean back, palms up, and curl your body toward your hands with the elbows high and still.'),
  // ── Triceps ──
  ex('pressdown', 'Cable triceps pressdown', ['cable'], ['triceps'], [], false, 'Elbows pinned to your sides, straighten fully.'),
  ex('band_pressdown', 'Band triceps pressdown', ['band'], ['triceps'], [], false, 'Band anchored high; elbows at your sides, push down until the arms are straight.'),
  ex('overhead_ext', 'Overhead triceps extension', ['dumbbell'], ['triceps'], [], false, 'Lower the weight behind the head for a deep stretch, then straighten.', { stress: ['overhead'] }),
  ex('cable_overhead', 'Cable overhead extension', ['cable'], ['triceps'], [], false, 'Face away from the cable, extend overhead.', { stress: ['overhead'] }),
  ex('skull_crusher', 'Lying dumbbell triceps extension', ['dumbbell', 'bench'], ['triceps'], [], false, 'Lying on a bench, upper arms angled slightly back, bend the elbows to lower the dumbbells beside your head.', { supine: true }),
  ex('kickback', 'Dumbbell kickback', ['dumbbell', 'bench'], ['triceps'], [], false, 'Hinge with a hand on the bench, upper arm along your side, and straighten the elbow fully.'),
  ex('trx_triceps', 'Suspension triceps extension', ['suspension'], ['triceps'], [], false, 'Lean into the straps with the arms forward and bend only at the elbows, then press back.', { stress: ['overhead'] }),
  ex('close_bench', 'Close-grip bench press', ['barbell', 'bench'], ['triceps'], ['chest', 'shoulders'], true, 'Hands about shoulder-width, elbows tucked; lower to the lower chest.', { supine: true }),
  ex('close_pushup', 'Close-grip push-up', ['bodyweight'], ['triceps'], ['chest'], true, 'Hands under the shoulders, elbows tucked to the sides.', { stress: ['wrist_load', 'floor'] }),
  ex('bench_dip', 'Bench dip', ['bench'], ['triceps'], [], false, 'Hands on a bench behind you, lower until the elbows reach about 90°.', { stress: ['shoulder_deep', 'wrist_load'] }),
  // ── Quads ──
  ex('squat', 'Barbell back squat', ['barbell'], ['quads', 'glutes'], [], true, 'Brace, sit down between the hips to at least thigh-parallel (or a pain-free box depth), drive up.', { stress: ['spine_load', 'deep_knee', 'deep_hip'] }),
  ex('smith_squat', 'Smith machine squat', ['smith'], ['quads', 'glutes'], [], true, 'Feet slightly in front of the bar, sit down to a depth you control, drive up through the whole foot.', { stress: ['deep_knee', 'deep_hip'] }),
  ex('leg_press', 'Leg press', ['leg_press'], ['quads', 'glutes'], [], true, 'Lower until the knees reach about 90° or deeper without the lower back lifting.'),
  ex('goblet', 'Goblet squat', [['dumbbell', 'kettlebell']], ['quads', 'glutes'], [], true, 'Hold a dumbbell or kettlebell at the chest, elbows inside the knees at the bottom.', { stress: ['deep_knee', 'deep_hip'] }),
  ex('box_squat', 'Box squat', ['bench'], ['quads', 'glutes'], [], true, 'Sit back to a bench or box at a height that’s comfortable for your knees and hips, then stand; hold a weight once it’s easy.'),
  ex('trx_squat', 'Suspension-assisted squat', ['suspension'], ['quads', 'glutes'], [], true, 'Hold the straps for balance and help, sit down as deep as is comfortable and stand back up.'),
  ex('split_squat', 'Bulgarian split squat', ['dumbbell', 'bench'], ['quads', 'glutes'], [], true, 'Back foot on the bench, front knee travels forward over the toes.', { stress: ['deep_knee', 'balance'] }),
  ex('bw_split_squat', 'Split squat', ['bodyweight'], ['quads', 'glutes'], [], true, 'Long stance, lower the back knee toward the floor; slow on the way down.', { stress: ['deep_knee', 'balance'] }),
  ex('reverse_lunge', 'Dumbbell reverse lunge', ['dumbbell'], ['quads', 'glutes'], [], true, 'Step back and lower the back knee toward the floor, then push through the front heel to return.', { stress: ['deep_knee', 'balance'] }),
  ex('step_up', 'Step-up', ['box'], ['quads', 'glutes'], [], true, 'Whole foot on a knee-height or lower step, push through it to stand up tall; lower slowly. Hold dumbbells once it’s easy.', { stress: ['balance'] }),
  ex('leg_ext', 'Leg extension', ['leg_ext'], ['quads'], [], false, 'Pause briefly with the legs straight.'),
  ex('wall_sit', 'Wall sit', ['bodyweight'], ['quads'], ['glutes'], false, 'Back flat on a wall, knees bent to a level you can hold for 2 minutes. Breathe throughout.', { isometric: true, addOnOnly: true }),
  // ── Hamstrings ──
  ex('rdl', 'Romanian deadlift', ['barbell'], ['hamstrings', 'glutes'], ['back'], true, 'Push the hips back with a flat back until you feel the hamstrings stretch.', { stress: ['spine_load'] }),
  ex('db_rdl', 'Dumbbell Romanian deadlift', [['dumbbell', 'kettlebell']], ['hamstrings', 'glutes'], ['back'], true, 'Dumbbells or kettlebells slide down the front of the legs as the hips go back.'),
  ex('trap_deadlift', 'Trap-bar deadlift', ['trap_bar'], ['glutes', 'hamstrings'], ['quads', 'back'], true, 'Stand in the middle of the bar, hips back and chest up, then stand tall pushing the floor away.', { stress: ['spine_load'] }),
  ex('kb_swing', 'Kettlebell swing', ['kettlebell'], ['glutes', 'hamstrings'], ['back'], true, 'Hinge and snap the hips forward so the bell floats to chest height; the arms just guide it.', { stress: ['spine_load'] }),
  ex('single_rdl', 'Single-leg Romanian deadlift', ['bodyweight'], ['hamstrings', 'glutes'], [], true, 'Hinge on one leg with the back flat; hold a wall for balance at first.', { stress: ['balance'] }),
  ex('leg_curl', 'Seated or lying leg curl', ['leg_curl'], ['hamstrings'], [], false, 'Control the weight back; seated curls stretch the hamstrings more.'),
  ex('slider_curl', 'Hamstring slider curl', ['bodyweight'], ['hamstrings'], ['glutes'], false, 'Lie on your back, heels on a towel on a smooth floor, lift the hips and pull the heels in.', { supine: true, stress: ['floor'] }),
  ex('ball_curl', 'Stability-ball hamstring curl', ['stability_ball'], ['hamstrings'], ['glutes'], false, 'Heels on the ball, hips lifted, roll the ball in toward you and back out slowly.', { supine: true, stress: ['floor'] }),
  ex('trx_ham_curl', 'Suspension hamstring curl', ['suspension'], ['hamstrings'], ['glutes'], false, 'Heels in the foot cradles, hips lifted, pull the heels toward you.', { supine: true, stress: ['floor'] }),
  ex('band_leg_curl', 'Standing band leg curl', ['band'], ['hamstrings'], [], false, 'Band anchored low around one ankle; hold a support and curl the heel toward your seat.'),
  ex('nordic', 'Nordic hamstring curl', ['bodyweight'], ['hamstrings'], [], false, 'Kneel with the ankles anchored, lower the body forward as slowly as you can, catch yourself with the hands, push back up.', { stress: ['kneeling', 'floor'], addOnOnly: true }),
  // ── Glutes ──
  ex('hip_thrust', 'Hip thrust', ['barbell', 'bench'], ['glutes'], ['hamstrings'], true, 'Upper back on the bench, drive the hips up and squeeze at the top.'),
  ex('db_hip_thrust', 'Dumbbell hip thrust', ['dumbbell', 'bench'], ['glutes'], ['hamstrings'], true, 'Dumbbell on the hips, chin tucked, ribs down.'),
  ex('back_ext', 'Back extension', ['back_ext'], ['glutes', 'hamstrings'], ['back'], false, 'Hips on the pad, hinge down with a flat back and rise until your body is in a straight line; squeeze the glutes.'),
  ex('cable_kickback', 'Cable glute kickback', ['cable'], ['glutes'], ['hamstrings'], false, 'Ankle strap on a low pulley; hold the frame and push the leg back without arching your lower back.'),
  ex('glute_bridge', 'Glute bridge', ['bodyweight'], ['glutes'], ['hamstrings'], false, 'Feet flat, drive through the heels; try one leg at a time to make it harder.', { supine: true, stress: ['floor'] }),
  ex('band_walk', 'Mini-band side walk', ['mini_band'], ['glutes'], [], false, 'Band above the knees, half-squat, and step sideways keeping tension; works the side of the hips.'),
  ex('clamshell', 'Banded clamshell', ['mini_band'], ['glutes'], [], false, 'Lie on your side, knees bent, band above the knees; open the top knee without rolling back.', { stress: ['floor'] }),
  // ── Calves ──
  ex('calf_raise', 'Standing calf raise', ['bodyweight'], ['calves'], [], false, 'On a step, lower the heels for a full stretch and pause at the bottom.'),
  ex('machine_calf', 'Machine calf raise', ['calf_machine'], ['calves'], [], false, 'Full stretch at the bottom, full rise at the top.'),
  ex('seated_calf', 'Seated dumbbell calf raise', ['dumbbell', 'bench'], ['calves'], [], false, 'Seated, balls of the feet on a plate or step, dumbbells on the knees; full stretch, full rise.'),
  ex('leg_press_calf', 'Leg press calf raise', ['leg_press'], ['calves'], [], false, 'Balls of the feet on the bottom edge of the platform, knees straight but soft; press with the ankles only.'),
  // ── Core ──
  ex('cable_crunch', 'Cable crunch', ['cable'], ['abs'], [], false, 'Kneel and curl the ribs toward the hips; the hips stay still.', { stress: ['spine_flexion', 'kneeling'] }),
  ex('crunch', 'Crunch', ['bodyweight'], ['abs'], [], false, 'Lie with knees bent and curl your shoulders off the floor, ribs toward the hips; lower slowly.', { supine: true, stress: ['spine_flexion', 'floor'] }),
  ex('reverse_crunch', 'Reverse crunch', ['bodyweight'], ['abs'], [], false, 'Lying down, knees bent at 90°, curl the hips up off the floor toward the ribs; no swinging.', { supine: true, stress: ['spine_flexion', 'floor'] }),
  ex('plank', 'Plank', ['bodyweight'], ['abs'], [], false, 'Forearms down, body in a straight line, squeeze the glutes.', { isometric: true, stress: ['floor'] }),
  ex('side_plank', 'Side plank', ['bodyweight'], ['abs'], [], false, 'On one forearm, body in a straight line from head to feet; knees down to make it easier.', { isometric: true, stress: ['floor'] }),
  ex('dead_bug', 'Dead bug', ['bodyweight'], ['abs'], [], false, 'Brace gently all round and keep breathing while opposite arm and leg reach out.', { supine: true, stress: ['floor'] }),
  ex('bird_dog', 'Bird dog', ['bodyweight'], ['abs'], ['glutes'], false, 'On hands and knees, reach one arm and the opposite leg out long without the back moving; pause and switch.', { stress: ['floor', 'kneeling'] }),
  ex('pallof', 'Pallof press', [['cable', 'band']], ['abs'], [], false, 'Side-on to the anchor, press the handle straight out from your chest and resist being turned.'),
  ex('woodchop', 'Cable woodchop', ['cable'], ['abs'], ['shoulders'], false, 'Rotate from high to low across the body, turning through the hips and upper back together.', { stress: ['spine_twist'] }),
  ex('farmer_carry', 'Farmer’s carry', [['dumbbell', 'kettlebell']], ['abs'], ['back'], false, 'Heavy weights at your sides, stand tall and walk with short, steady steps.', { isometric: true }),
  ex('ab_wheel', 'Ab-wheel rollout', ['ab_wheel'], ['abs'], [], false, 'From your knees, roll out only as far as you can keep your back flat, then pull back with the abs.', { stress: ['kneeling', 'floor'] }),
  ex('trx_fallout', 'Suspension fallout', ['suspension'], ['abs'], [], false, 'Facing away from the anchor, lean into the straps and let the arms go forward overhead with the body straight, then pull back.', { stress: ['overhead'] }),
  ex('hanging_raise', 'Hanging knee raise', ['pullup_bar'], ['abs'], [], false, 'Curl the hips up, not just the knees.', { stress: ['hanging', 'spine_flexion'] }),
  ex('leg_raise', 'Lying leg raise', ['bodyweight'], ['abs'], [], false, 'Lower back pressed down; bend the knees to make it easier, lower slowly to make it harder.', { supine: true, stress: ['floor'] }),
]

/** Lifts that load the target muscle hardest where it is stretched (see the long-length trials in compare.ts). */
const LONG_LENGTH = ['overhead_ext', 'cable_overhead', 'incline_curl', 'bayesian_curl', 'rdl', 'db_rdl', 'single_rdl', 'split_squat', 'bw_split_squat', 'reverse_lunge', 'db_fly', 'cable_fly', 'dip', 'calf_raise', 'machine_calf', 'leg_press_calf', 'squat', 'goblet', 'pullup']
/** Lifts done one arm or one leg at a time. */
const ONE_SIDE = ['db_row', 'split_squat', 'bw_split_squat', 'reverse_lunge', 'step_up', 'single_rdl', 'concentration_curl', 'kickback', 'cable_lateral', 'bayesian_curl', 'cable_kickback', 'band_leg_curl']
for (const e of LIFTS) {
  if (LONG_LENGTH.includes(e.id)) e.long = true
  if (ONE_SIDE.includes(e.id)) e.unilateral = true
}

export const EXERCISES: Exercise[] = [...LIFTS, ...EX_MOBILITY_UPPER, ...EX_MOBILITY_LOWER, ...EX_YOGA, ...EX_BALANCE]

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e])) as Record<string, Exercise>

// ── Muscles and muscle heads ────────────────────────────────────

export type HeadId =
  | 'pec_upper' | 'pec_mid' | 'pec_lower' | 'serratus'
  | 'lats' | 'teres_major' | 'traps_upper' | 'traps_mid' | 'traps_lower' | 'rhomboids' | 'erectors'
  | 'delt_front' | 'delt_side' | 'delt_rear' | 'rotator_cuff'
  | 'biceps_long' | 'biceps_short' | 'brachialis' | 'brachioradialis' | 'forearms'
  | 'triceps_long' | 'triceps_lateral' | 'triceps_medial'
  | 'rectus_femoris' | 'vastus_lateralis' | 'vastus_medialis' | 'vastus_intermedius'
  | 'biceps_femoris' | 'semis'
  | 'glute_max' | 'glute_med' | 'adductors' | 'hip_flexors'
  | 'gastrocnemius' | 'soleus'
  | 'rectus_abdominis' | 'obliques' | 'transverse_abdominis'
  | 'pec_minor' | 'neck_flexors' | 'levator' | 'hip_rotators' | 'tfl' | 'quadratus_lumborum' | 'tibialis' | 'foot_ankle' | 'wrist_extensors'

export const HEAD_INFO: Record<HeadId, { label: string; area: string; note: string }> = {
  pec_upper: { label: 'Upper chest', area: 'Pectoralis major, clavicular head', note: 'Works most when the arms press or sweep up and in (incline work).' },
  pec_mid: { label: 'Middle chest', area: 'Pectoralis major, sternal head', note: 'The bulk of the chest; any press or fly at chest height.' },
  pec_lower: { label: 'Lower chest', area: 'Pectoralis major, lower fibres', note: 'Pressing or sweeping downward (dips, high-to-low flys).' },
  serratus: { label: 'Serratus anterior', area: 'Along the ribs, under the arm', note: 'Moves the shoulder blade forward and around the ribs.' },
  lats: { label: 'Lats', area: 'Latissimus dorsi', note: 'Pulls the upper arm down and back; gives the back its width.' },
  teres_major: { label: 'Teres major', area: 'Under the armpit, back of the shoulder blade', note: 'The lats’ small helper.' },
  traps_upper: { label: 'Upper traps', area: 'Trapezius, upper fibres', note: 'Lifts the shoulder blades (shrugging).' },
  traps_mid: { label: 'Middle traps', area: 'Trapezius, middle fibres', note: 'Squeezes the shoulder blades together in rows.' },
  traps_lower: { label: 'Lower traps', area: 'Trapezius, lower fibres', note: 'Draws the shoulder blades down; important for healthy overhead reaching.' },
  rhomboids: { label: 'Rhomboids', area: 'Between the shoulder blades', note: 'Pull the shoulder blades together.' },
  erectors: { label: 'Spinal erectors', area: 'Erector spinae, along the spine', note: 'Hold the back straight in hinges and squats.' },
  delt_front: { label: 'Front delts', area: 'Deltoid, anterior head', note: 'Raises the arm forward; works hard in every press.' },
  delt_side: { label: 'Side delts', area: 'Deltoid, lateral head', note: 'Raises the arm out to the side; makes the shoulders look broader.' },
  delt_rear: { label: 'Rear delts', area: 'Deltoid, posterior head', note: 'Pulls the arm back; often undertrained.' },
  rotator_cuff: { label: 'Rotator cuff', area: 'Infraspinatus, teres minor, supraspinatus, subscapularis', note: 'Small muscles that keep the ball of the shoulder centred.' },
  biceps_long: { label: 'Biceps, long head', area: 'Outer biceps', note: 'Crosses the shoulder; stretched with the arm behind the body (incline curls).' },
  biceps_short: { label: 'Biceps, short head', area: 'Inner biceps', note: 'Works most with the arm in front of the body (preacher curls).' },
  brachialis: { label: 'Brachialis', area: 'Under the biceps', note: 'The pure elbow-bender; neutral or overhand grips load it more.' },
  brachioradialis: { label: 'Brachioradialis', area: 'Top of the forearm', note: 'Bends the elbow with the thumb up (hammer curls).' },
  forearms: { label: 'Forearms and grip', area: 'Wrist and finger flexors', note: 'Holds on to the weight.' },
  triceps_long: { label: 'Triceps, long head', area: 'Back of the arm, inner side', note: 'Crosses the shoulder; grew more with overhead work in a trial.' },
  triceps_lateral: { label: 'Triceps, lateral head', area: 'Back of the arm, outer side', note: 'Works most in presses and pressdowns.' },
  triceps_medial: { label: 'Triceps, medial head', area: 'Deep, near the elbow', note: 'Works in every elbow straightening.' },
  rectus_femoris: { label: 'Rectus femoris', area: 'Front of the thigh, centre', note: 'Crosses the hip too, so squats load it less than leg extensions.' },
  vastus_lateralis: { label: 'Vastus lateralis', area: 'Outer thigh', note: 'The biggest quad; works in every squat and press.' },
  vastus_medialis: { label: 'Vastus medialis', area: 'Inner thigh above the knee (the “teardrop”)', note: 'Works hard near full knee extension and in deep squats.' },
  vastus_intermedius: { label: 'Vastus intermedius', area: 'Deep, front of the thigh', note: 'Under the rectus femoris.' },
  biceps_femoris: { label: 'Biceps femoris', area: 'Outer hamstring', note: 'Its long head works in hinges and curls; its short head only in curls.' },
  semis: { label: 'Semitendinosus and semimembranosus', area: 'Inner hamstrings', note: 'Work strongly in leg curls and Nordic curls.' },
  glute_max: { label: 'Gluteus maximus', area: 'The main buttock muscle', note: 'Straightens the hip: thrusts, hinges, squats.' },
  glute_med: { label: 'Gluteus medius and minimus', area: 'Side of the hip', note: 'Keep the pelvis level on one leg; side walks and clamshells.' },
  adductors: { label: 'Adductors', area: 'Inner thigh', note: 'Help in deep squats and lunges (adductor magnus).' },
  hip_flexors: { label: 'Hip flexors', area: 'Iliopsoas, front of the hip', note: 'Lift the thigh (leg raises).' },
  gastrocnemius: { label: 'Gastrocnemius', area: 'Upper calf', note: 'Works most with the knee straight.' },
  soleus: { label: 'Soleus', area: 'Lower calf, under the gastrocnemius', note: 'Takes over with the knee bent (seated calf raises).' },
  rectus_abdominis: { label: 'Rectus abdominis', area: 'The “six-pack”', note: 'Curls the spine and resists arching.' },
  obliques: { label: 'Obliques', area: 'Sides of the waist', note: 'Turn and side-bend the trunk and resist rotation.' },
  transverse_abdominis: { label: 'Transverse abdominis', area: 'Deep, wraps the waist', note: 'Braces the trunk like a belt.' },
  pec_minor: { label: 'Pec minor', area: 'Under the chest, from the ribs to the front of the shoulder blade', note: 'When short or stiff it tips the shoulder blade forward.' },
  neck_flexors: { label: 'Deep neck flexors', area: 'Front of the neck, along the spine', note: 'Tuck the chin and hold the head over the shoulders.' },
  levator: { label: 'Levator scapulae', area: 'Side and back of the neck', note: 'Lifts the shoulder blade; often feels tight with desk work.' },
  hip_rotators: { label: 'Deep hip rotators', area: 'Piriformis and its neighbours, under the glutes', note: 'Turn the thigh outward and steady the hip.' },
  tfl: { label: 'TFL and IT band', area: 'Outside of the hip and thigh', note: 'Helps lift and turn the thigh inward; steadies the knee.' },
  quadratus_lumborum: { label: 'Quadratus lumborum', area: 'Deep, low back beside the spine', note: 'Side-bends the trunk and hitches the hip.' },
  tibialis: { label: 'Tibialis anterior', area: 'Front of the shin', note: 'Lifts the toes and controls the foot as it lands.' },
  foot_ankle: { label: 'Foot and ankle stabilisers', area: 'Small foot muscles and the peroneals', note: 'Make the constant small corrections that keep you upright.' },
  wrist_extensors: { label: 'Wrist extensors', area: 'Top of the forearm', note: 'Bend the wrist back; sore in tennis elbow.' },
}

/**
 * Who does the work: main movers, helpers and stabilisers. For stretches and yoga poses, prime is
 * what gets stretched most and assist what works to hold the position; for balance drills, prime is
 * what works hardest to keep you steady.
 */
export interface HeadSpec { prime: HeadId[]; assist: HeadId[]; stabilize?: HeadId[]; note?: string }

export const HEADS: Record<string, HeadSpec> = {
  ...HEADS_CHEST, ...HEADS_BACK, ...HEADS_SHOULDERS, ...HEADS_LEGS, ...HEADS_CORE,
  ...HEADS_MOBILITY_UPPER, ...HEADS_MOBILITY_LOWER, ...HEADS_YOGA, ...HEADS_BALANCE,
}

/** Diagrams and form guides for exercises added with equipment choice; merged into DIAGRAMS and FORM. */
export const EXTRA_DIAGRAMS: Record<string, Diagram> = {
  ...DIAGRAMS_CHEST, ...DIAGRAMS_BACK, ...DIAGRAMS_SHOULDERS, ...DIAGRAMS_LEGS, ...DIAGRAMS_CORE,
  ...DIAGRAMS_MOBILITY_UPPER, ...DIAGRAMS_MOBILITY_LOWER, ...DIAGRAMS_YOGA, ...DIAGRAMS_BALANCE,
}
export const EXTRA_FORM: Record<string, FormGuide> = {
  ...FORM_CHEST, ...FORM_BACK, ...FORM_SHOULDERS, ...FORM_LEGS, ...FORM_CORE,
  ...FORM_MOBILITY_UPPER, ...FORM_MOBILITY_LOWER, ...FORM_YOGA, ...FORM_BALANCE,
}
