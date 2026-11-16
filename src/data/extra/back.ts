// Diagrams, form guides and muscle heads for this muscle group's exercises (see ../exercises.ts).
// Coordinates follow src/lib/pose.ts: frames are 200 × 200, the floor at y = 190, a flat foot's ankle
// at y = 186; angles are absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { HeadId, HeadSpec } from '../exercises'
import type { FormGuide } from '../form'

const G = 186

// Copied from diagrams.ts (importing it would make a cycle).
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
const tower = (x: number, top = 10): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })

// A suspension trainer: a strap from a high anchor to the hands.
const ANCHOR: [number, number] = [170, 10]
const strapAnchor: Prop[] = [{ t: 'line', a: [150, 6], b: [190, 6] }, { t: 'cable', from: ANCHOR, to: 'hand' }]
// Leaning back on the heels with the body straight: the legs lean as far as the torso.
const leanBack = (lean: number, arm: SidePose['arm']): SidePose => ({ at: ['ankle', 130, 183], torso: 180 + lean, arm, leg: [lean, lean, 150] })

// Lying face down on a 45° incline bench, feet on the floor behind.
const chestOnIncline = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 90, 140], torso: 135, arm, leg: { to: [42, 184], bend: 'front', foot: 67 } })
const inclinePadFull: Prop[] = [{ t: 'pad', a: [88, 152], b: [126, 114] }, { t: 'line', a: [104, 140], b: [104, 190] }, { t: 'line', a: [82, 156], b: [82, 190] }]
// For spider curls the pad stops at the chest so the arms hang over its top edge.
const inclinePadShort: Prop[] = [{ t: 'pad', a: [88, 152], b: [114, 126] }, { t: 'line', a: [104, 140], b: [104, 190] }, { t: 'line', a: [82, 156], b: [82, 190] }]

// Kneeling tall under a high band anchor (a door).
const kneel = (arm: SidePose['arm']): SidePose => ({ at: ['knee', 100, 184], torso: 180, arm, leg: [0, -90, -90] })

// Sitting on a bench edge, leaning forward over the thighs.
const seatLean = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 88, 150], torso: 130, arm, leg: { to: [128, G], bend: 'up' } })

// Face down on the floor, head to the right, arms along the sides.
const prone = (torso: number, arm: SidePose['arm']): SidePose => ({ at: ['hip', 96, 182], torso, arm, leg: [-90, -90, -90] })

// Standing in a split stance, facing away from a low pulley behind.
const splitStand = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 108, 116], torso: 175, arm, leg: { to: [126, G], bend: 'front' }, leg2: { to: [88, G], bend: 'front' } })

export const DIAGRAMS_BACK: Record<string, Diagram> = {
  band_pulldown: {
    start: kneel([151, 151]),
    end: kneel({ to: [110, 94], bend: 'down' }),
    props: [{ t: 'line', a: [150, 8], b: [150, 190] }, { t: 'band', from: [148, 14], to: 'hand' }],
  },
  chest_db_row: {
    start: chestOnIncline([0, 0]),
    end: chestOnIncline({ to: [112, 128], bend: 'up' }),
    props: [...inclinePadFull, { t: 'db', at: 'hand' }],
  },
  barbell_row: {
    start: { at: ['ankle', 100, G], torso: 135, arm: [0, 0], leg: [35, 5] },
    end: { at: ['ankle', 100, G], torso: 135, arm: { to: [99, 108], bend: 'up' }, leg: [35, 5] },
    props: [{ t: 'plate', at: 'hand' }],
  },
  trx_row: {
    start: leanBack(25, [126, 126]),
    end: leanBack(12, { to: [114, 78], bend: 'back' }),
    props: strapAnchor,
  },
  superman: {
    start: prone(90, [-88, -88]),
    end: prone(104, [-76, -76]),
    labels: ['Face down', 'Lift and hold'],
  },
  bb_curl: {
    start: stand(), end: stand(100, { arm: [8, 160] }),
    props: [{ t: 'plate', at: 'hand' }],
  },
  spider_curl: {
    start: chestOnIncline([4, 4]),
    end: chestOnIncline([4, 165]),
    props: [...inclinePadShort, { t: 'db', at: 'hand' }],
  },
  concentration_curl: {
    start: seatLean([5, 0]),
    end: seatLean([5, 150]),
    props: [{ t: 'pad', a: [68, 158], b: [108, 158] }, { t: 'line', a: [88, 162], b: [88, 190] }, { t: 'db', at: 'hand' }],
  },
  bayesian_curl: {
    start: splitStand([-30, -30]),
    end: splitStand([-30, 130]),
    props: [tower(18, 30), { t: 'cable', from: [18, 172], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  trx_curl: {
    start: leanBack(25, [126, 126]),
    end: leanBack(10, { to: [116, 52], bend: 'front' }),
    props: strapAnchor,
  },
}

export const FORM_BACK: Record<string, FormGuide> = {
  band_pulldown: {
    setup: ['Anchor the band high, at the top of a door or a bar.', 'Kneel or sit facing the anchor, far enough back that the band is taut with your arms up.', 'Brace and sit tall.'],
    execution: ['Pull your shoulders down first, then drive your elbows down to your sides.', 'Bring your hands to your upper chest.', 'Let your arms rise slowly until they are straight again.'],
    breathing: 'Out as you pull down, in as your arms go up.',
    mistakes: ['Leaning far back so it becomes a row.', 'Shrugging your shoulders up to your ears.', 'Letting the band snap your arms back up.'],
    easier: 'Lighter band, or move closer to the anchor.',
    harder: 'Thicker band, move further back, or pause with the elbows at your sides.',
    stretches: ['kneeling_lat', 'lat_90'],
  },
  chest_db_row: {
    setup: ['Set an incline bench to 30-45°.', 'Lie face down with your chest on the pad and your feet on the floor behind.', 'Let the dumbbells hang straight down, palms facing in.'],
    execution: ['Row both elbows back toward your hips.', 'Squeeze your shoulder blades together at the top.', 'Lower slowly to straight arms.'],
    breathing: 'Out as you row, in as you lower.',
    mistakes: ['Lifting your chest off the pad.', 'Shrugging the weights up instead of rowing back.', 'Cutting the range short at the bottom.'],
    easier: 'Lighter dumbbells, or one arm at a time.',
    harder: 'Pause for 2 seconds at the top, or lower over 3 seconds.',
    stretches: ['lat_90', 'cross_body_shoulder'],
  },
  barbell_row: {
    setup: ['Feet hip-width, bar over your mid-foot.', 'Grip just outside your knees, palms down.', 'Hinge at the hips to about 45° with a flat back and soft knees.'],
    execution: ['Pull the bar to your lower ribs, elbows close to your body.', 'Keep your torso still; don’t stand up to lift it.', 'Lower slowly to straight arms.'],
    breathing: 'Breathe in and brace before each rep, out as the bar comes up.',
    mistakes: ['Rounding your back.', 'Standing up more each rep to swing the bar.', 'Pulling to the chest with the elbows flared wide.'],
    safety: { text: 'Bent-over rows load the low back more than supported or inverted rows; keep your back flat, and choose a supported row if your back is sore.', sources: ['pm_19197209'] },
    easier: 'Chest-supported dumbbell row, or a lighter bar.',
    harder: 'Pause with the bar at your ribs, or lower over 3 seconds.',
    stretches: ['childs_pose', 'lat_90'],
  },
  trx_row: {
    setup: ['Shorten the straps and face the anchor.', 'Hold the handles with straight arms, palms facing in.', 'Lean back on your heels with your body straight from head to heels.'],
    execution: ['Pull your chest up to your hands, elbows close to your sides.', 'Squeeze your shoulder blades together at the top.', 'Lower slowly to straight arms, body still straight.'],
    breathing: 'Out as you pull up, in as you lower.',
    mistakes: ['Hips sagging.', 'Shrugging toward your ears.', 'Dropping fast into the bottom.'],
    easier: 'Step back so your body is more upright.',
    harder: 'Walk your feet forward so you lean back further, or row with one arm.',
    stretches: ['kneeling_lat', 'cross_body_shoulder'],
  },
  superman: {
    setup: ['Lie face down on a mat, arms along your sides, palms down.', 'Forehead just off the floor, legs relaxed.'],
    execution: ['Squeeze your shoulder blades together and lift your chest and arms a few centimetres.', 'Keep looking at the floor so your neck stays long.', 'Hold for 3 seconds, then lower slowly.'],
    breathing: 'Breathe out as you lift and keep breathing while you hold.',
    mistakes: ['Lifting too high and crunching the low back.', 'Throwing your head back to look forward.', 'Holding your breath.'],
    easier: 'Lift only the chest, or only one arm at a time.',
    harder: 'Hold for longer, or reach the arms forward overhead.',
    stretches: ['childs_pose'],
  },
  bb_curl: {
    setup: ['Stand tall, feet hip-width.', 'Hold the bar at shoulder width, palms up.', 'Elbows by your sides, shoulders down.'],
    execution: ['Curl the bar up without moving your upper arms.', 'Squeeze briefly at the top.', 'Lower over 2-3 seconds to straight arms.'],
    breathing: 'Out as you curl, in as you lower.',
    mistakes: ['Swinging your hips or leaning back.', 'Elbows drifting forward.', 'Stopping short at the bottom.'],
    easier: 'Lighter bar, or an EZ bar if your wrists complain.',
    harder: 'Slower lowering, or a pause halfway up.',
    stretches: ['biceps_seated'],
  },
  spider_curl: {
    setup: ['Set an incline bench to about 45°.', 'Lie face down with your chest over the top edge.', 'Let your arms hang straight down, palms forward.'],
    execution: ['Curl the dumbbells up without moving your upper arms.', 'Squeeze hard at the top.', 'Lower slowly to straight arms.'],
    breathing: 'Out as you curl, in as you lower.',
    mistakes: ['Swinging the elbows forward.', 'Lifting your chest off the bench.', 'Going too heavy to reach the top.'],
    easier: 'Lighter dumbbells, or one arm at a time.',
    harder: 'Hold the top for 2 seconds, or lower over 3 seconds.',
    stretches: ['biceps_seated'],
  },
  concentration_curl: {
    setup: ['Sit on the end of a bench, feet wide.', 'Lean forward and rest the back of your upper arm on the inside of your thigh.', 'Let the dumbbell hang with your arm straight, palm up.'],
    execution: ['Curl the dumbbell toward your shoulder, upper arm still.', 'Squeeze at the top.', 'Lower slowly all the way.'],
    breathing: 'Out as you curl, in as you lower.',
    mistakes: ['Lifting the elbow off your thigh.', 'Using your back to swing the weight.', 'Stopping short at the bottom.'],
    easier: 'Lighter dumbbell.',
    harder: 'Slower lowering, or a pause at the top.',
    stretches: ['biceps_seated'],
  },
  bayesian_curl: {
    setup: ['Set a single handle on a low pulley.', 'Face away from it and step forward into a split stance.', 'Let the cable draw your arm back behind your body, palm forward.'],
    execution: ['Keep the upper arm back and curl your hand toward your shoulder.', 'Squeeze at the top.', 'Lower slowly until the arm is straight and stretched behind you.'],
    breathing: 'Out as you curl, in as you lower.',
    mistakes: ['Letting the elbow swing forward.', 'Leaning forward to make it easier.', 'Going so heavy that the front of the shoulder aches.'],
    easier: 'Lighter weight, or stand closer to the pulley.',
    harder: 'Step further forward for a bigger stretch, or lower over 3 seconds.',
    stretches: ['biceps_seated'],
  },
  trx_curl: {
    setup: ['Shorten the straps and face the anchor.', 'Hold the handles palms up, arms straight out toward the anchor.', 'Lean back on your heels with your body straight.'],
    execution: ['Keep your elbows high and still, and bend them to bring your hands toward your forehead.', 'Your body rises toward your hands.', 'Lower slowly until your arms are straight.'],
    breathing: 'Out as you curl up, in as you lower.',
    mistakes: ['Dropping the elbows so it turns into a row.', 'Hips sagging.', 'Dropping fast into the bottom.'],
    easier: 'Step back so your body is more upright.',
    harder: 'Walk your feet forward so you lean back further.',
    stretches: ['biceps_seated'],
  },
}

const ROW_ARMS: HeadId[] = ['biceps_long', 'biceps_short', 'brachialis', 'brachioradialis', 'forearms']

export const HEADS_BACK: Record<string, HeadSpec> = {
  // ── Vertical pulls ──
  pulldown: { prime: ['lats', 'teres_major'], assist: ['biceps_short', 'biceps_long', 'brachialis', 'traps_lower', 'rhomboids', 'delt_rear', 'forearms'], stabilize: ['rectus_abdominis'], note: 'Pulling to the front works the lats at least as well as behind the neck.' },
  pullup: { prime: ['lats', 'teres_major'], assist: ['biceps_short', 'biceps_long', 'brachialis', 'brachioradialis', 'traps_lower', 'rhomboids', 'forearms'], stabilize: ['rectus_abdominis', 'transverse_abdominis'], note: 'Palms toward you (chin-up) brings the biceps in more.' },
  band_pulldown: { prime: ['lats', 'teres_major'], assist: ['biceps_short', 'biceps_long', 'brachialis', 'traps_lower', 'rhomboids', 'forearms'], stabilize: ['rectus_abdominis'] },
  // ── Rows ──
  cable_row: { prime: ['lats', 'traps_mid', 'rhomboids'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], stabilize: ['erectors'] },
  db_row: { prime: ['lats', 'traps_mid', 'rhomboids'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], stabilize: ['obliques', 'erectors'], note: 'Pulling toward the hip leans on the lats; pulling higher with the elbow out leans on the upper back.' },
  chest_row: { prime: ['traps_mid', 'rhomboids', 'lats'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], note: 'The chest pad takes the low back out of it.' },
  chest_db_row: { prime: ['traps_mid', 'rhomboids', 'lats'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], note: 'The bench takes the low back out of it.' },
  barbell_row: { prime: ['lats', 'traps_mid', 'rhomboids'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], stabilize: ['erectors', 'glute_max', 'biceps_femoris', 'semis'], note: 'The back and hamstrings hold the hinge the whole set.' },
  trx_row: { prime: ['traps_mid', 'rhomboids', 'lats'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], stabilize: ['rectus_abdominis', 'glute_max'] },
  band_row: { prime: ['lats', 'traps_mid', 'rhomboids'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS] },
  inverted_row: { prime: ['traps_mid', 'rhomboids', 'lats'], assist: ['delt_rear', 'teres_major', ...ROW_ARMS], stabilize: ['rectus_abdominis', 'glute_max'] },
  // ── Other back work ──
  straight_arm: { prime: ['lats', 'teres_major'], assist: ['triceps_long', 'delt_rear', 'pec_lower'], stabilize: ['rectus_abdominis'], note: 'The elbows stay straight, so the biceps hardly help: the lats do the work.' },
  superman: { prime: ['erectors'], assist: ['glute_max', 'traps_mid', 'traps_lower', 'rhomboids', 'delt_rear'], note: 'Light endurance work for the muscles that hold the spine up.' },
  // ── Biceps ──
  db_curl: { prime: ['biceps_long', 'biceps_short'], assist: ['brachialis', 'brachioradialis'], stabilize: ['forearms'] },
  bb_curl: { prime: ['biceps_long', 'biceps_short'], assist: ['brachialis', 'brachioradialis'], stabilize: ['forearms'], note: 'The bar keeps the palms turned up the whole way.' },
  incline_curl: { prime: ['biceps_long'], assist: ['biceps_short', 'brachialis', 'brachioradialis'], stabilize: ['forearms'], note: 'Arms hang behind the body, stretching the long head.' },
  preacher: { prime: ['biceps_short', 'brachialis'], assist: ['biceps_long', 'brachioradialis'], stabilize: ['forearms'], note: 'Arms in front of the body favour the short head; hardest near the bottom.' },
  spider_curl: { prime: ['biceps_short', 'brachialis'], assist: ['biceps_long', 'brachioradialis'], stabilize: ['forearms'], note: 'Arms hang in front of the body; hardest near the top.' },
  concentration_curl: { prime: ['biceps_short', 'biceps_long'], assist: ['brachialis', 'brachioradialis'], stabilize: ['forearms'], note: 'The braced elbow stops any swinging.' },
  cable_curl: { prime: ['biceps_long', 'biceps_short'], assist: ['brachialis', 'brachioradialis'], stabilize: ['forearms'] },
  bayesian_curl: { prime: ['biceps_long'], assist: ['biceps_short', 'brachialis', 'brachioradialis'], stabilize: ['forearms', 'delt_front'], note: 'The arm drawn behind the body stretches the long head.' },
  hammer_curl: { prime: ['brachioradialis', 'brachialis'], assist: ['biceps_long', 'biceps_short'], stabilize: ['forearms'], note: 'Thumbs up shifts the work onto the brachialis and forearm.' },
  band_curl: { prime: ['biceps_long', 'biceps_short'], assist: ['brachialis', 'brachioradialis'], stabilize: ['forearms'], note: 'The band gets harder toward the top.' },
  trx_curl: { prime: ['biceps_short', 'biceps_long'], assist: ['brachialis', 'brachioradialis'], stabilize: ['delt_rear', 'rectus_abdominis', 'glute_max'], note: 'Elbows raised in front favour the short head.' },
}
