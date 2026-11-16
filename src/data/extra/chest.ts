// Diagrams, form guides and muscle heads for this muscle group's exercises (see ../exercises.ts).
// Diagram coordinates follow src/lib/pose.ts: 200 × 200 frames, floor at y = 190, a flat foot's
// ankle at y = 186, angles absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { HeadId, HeadSpec } from '../exercises'
import type { FormGuide } from '../form'

const G = 186

// Helpers copied from ../diagrams.ts (importing it would make a cycle).
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
const benchFlat = (x1: number, x2: number, y: number): Prop[] => [
  { t: 'pad', a: [x1, y], b: [x2, y] },
  { t: 'line', a: [x1 + 10, y + 4], b: [x1 + 10, 190] },
  { t: 'line', a: [x2 - 10, y + 4], b: [x2 - 10, 190] },
]
const tower = (x: number, top = 10): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })
// Lying on a flat bench, head to the left, feet on the floor.
const benchLie = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 127, 126], torso: 270, arm, leg: { to: [150, G], bend: 'up' } })
// Sitting upright on a machine seat.
const seated = (arm: SidePose['arm'], extra: Partial<SidePose> = {}): SidePose => ({ at: ['hip', 88, 150], torso: 180, arm, leg: { to: [126, G], bend: 'up' }, ...extra })
const uprightSeat: Prop[] = [{ t: 'pad', a: [74, 158], b: [112, 158] }, { t: 'pad', a: [80, 154], b: [80, 94] }, { t: 'line', a: [92, 162], b: [92, 190] }]
// Lying on the floor, head to the left, knees bent and feet flat.
const floorLie = (arm: SidePose['arm']): SidePose => ({ at: ['shoulder', 58, 180], torso: -90, arm, leg: { to: [140, G], bend: 'up' } })
// Standing in a split stance, front foot forward, leaning slightly into the press.
const splitStand = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 95, 118], torso: 172, arm, leg: { to: [120, G], bend: 'front' }, leg2: { to: [72, G], bend: 'front' } })
// Leaning on suspension straps, facing away from the anchor: a straight body pivoting on the toes.
const strapLean = (torso: number, arm: SidePose['arm']): SidePose => ({ at: ['ankle', 34, 183], torso, arm, leg: [torso - 180, torso - 180, 60] })
const strapAnchor: Prop[] = [{ t: 'line', a: [14, 10], b: [46, 10] }, { t: 'cable', from: [30, 12], to: 'hand' }]
// Hinged over a bench, one hand and knee on it (as in the one-arm row).
const benchHinge = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 75, 113], torso: 100, arm, arm2: [0, 0], leg: { to: [78, G], bend: 'front' }, leg2: [0, -90, -90] })

export const DIAGRAMS_CHEST: Record<string, Diagram> = {
  smith_bench: {
    // The bar runs straight up and down between the machine's rails.
    start: benchLie({ to: [94, 78], bend: 'down' }), end: benchLie({ to: [94, 114], bend: 'down' }),
    props: [
      ...benchFlat(48, 142, 134),
      { t: 'line', a: [86, 14], b: [86, 190] }, { t: 'line', a: [102, 14], b: [102, 190] }, { t: 'line', a: [86, 14], b: [102, 14] },
      { t: 'plate', at: 'hand' },
    ],
  },
  floor_press: {
    start: floorLie([174, 180]), end: floorLie([80, 180]),
    props: [{ t: 'db', at: 'hand' }],
  },
  cable_press: {
    start: splitStand({ to: [114, 80], bend: 'back' }), end: splitStand([92, 92]),
    props: [tower(22, 30), { t: 'cable', from: [22, 76], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  trx_press: {
    start: strapLean(138, [92, 92]), end: strapLean(118, { to: [140, 114], bend: 'back' }),
    props: [...strapAnchor, { t: 'bar', at: 'hand' }],
  },
  band_press: {
    start: splitStand({ to: [114, 80], bend: 'back' }), end: splitStand([92, 92]),
    props: [tower(22, 30), { t: 'band', from: [22, 76], to: 'hand' }],
  },
  pec_deck: {
    // Seen from the side, arms opened wide point toward you, so they look short.
    start: seated([-100, 60], { reach: 0.35 }), end: seated([90, 90]),
    props: [...uprightSeat, tower(60, 30), { t: 'line', a: [60, 30], b: [88, 30] }, { t: 'line', a: [88, 30], b: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  incline_pushup: {
    start: { at: ['ankle', 30, 183], torso: 135, arm: { to: [118, 146], bend: 'back' }, leg: [-45, -45, 60] },
    end: { at: ['ankle', 30, 183], torso: 115, arm: { to: [118, 146], bend: 'back' }, leg: [-65, -65, 60] },
    props: benchFlat(108, 176, 150),
  },
  skull_crusher: {
    start: benchLie([195, 195]), end: benchLie([195, -60]),
    props: [...benchFlat(48, 142, 134), { t: 'db', at: 'hand', angle: 90 }],
  },
  kickback: {
    start: benchHinge([-80, 0]), end: benchHinge([-80, -80]),
    props: [...benchFlat(26, 140, 156), { t: 'db', at: 'hand' }],
  },
  trx_triceps: {
    start: strapLean(136, [125, 125]), end: strapLean(120, [165, 45]),
    props: [...strapAnchor, { t: 'bar', at: 'hand' }],
  },
  close_bench: {
    start: benchLie([180, 180]), end: benchLie({ to: [103, 114], bend: 'down' }),
    props: [...benchFlat(48, 142, 134), { t: 'plate', at: 'hand' }],
  },
  band_pressdown: {
    start: stand(96, { torso: 172, arm: [6, 110] }), end: stand(96, { torso: 172, arm: [4, 4] }),
    props: [{ t: 'line', a: [150, 10], b: [150, 190] }, { t: 'band', from: [150, 16], to: 'hand' }],
  },
}

export const FORM_CHEST: Record<string, FormGuide> = {
  smith_bench: {
    setup: ['Set the bench so the bar comes down to your lower chest.', 'Set the safety stops just above your chest.', 'Lie with feet flat and shoulder blades pulled down and back.'],
    execution: ['Twist the bar off its hooks with straight arms.', 'Lower under control to your lower chest, elbows 45-70° out.', 'Press straight up; twist the hooks back on after the last rep.'],
    breathing: 'Breathe in and brace before lowering, out as you press.',
    mistakes: ['Bench in the wrong spot, so the bar comes down on your neck or belly.', 'Bouncing the bar off your chest.', 'Forgetting to set the safety stops.'],
    easier: 'Machine chest press, or a lighter weight.',
    harder: 'Paused reps, 1 s just above your chest.',
    stretches: ['doorway_pec_mid', 'overhead_triceps'],
  },
  floor_press: {
    setup: ['Sit on the floor with a dumbbell on each thigh, then lie back with knees bent and feet flat.', 'Press the dumbbells up over your chest.'],
    execution: ['Lower until your upper arms rest lightly on the floor, elbows about 45° from your sides.', 'Pause briefly without bouncing.', 'Press back up over your chest.'],
    breathing: 'In on the way down, out as you press.',
    mistakes: ['Slamming your elbows into the floor.', 'Elbows flared straight out to the sides.', 'Wrists bent back.'],
    easier: 'Lighter dumbbells, or one arm at a time.',
    harder: 'A 2 s pause with your arms on the floor.',
    stretches: ['doorway_pec_mid', 'overhead_triceps'],
  },
  cable_press: {
    setup: ['Set both pulleys at chest height, a handle in each hand.', 'Step forward into a split stance with your hands beside your chest.'],
    execution: ['Brace and press the handles forward and slightly together.', 'Finish with straight arms in front of your chest, without locking hard.', 'Let your hands come back slowly to your chest.'],
    breathing: 'Out as you press, in as you return.',
    mistakes: ['Leaning far forward to help the press.', 'Letting the cables pull your arms far behind you.', 'Shrugging toward your ears.'],
    easier: 'Band chest press, or a lighter weight.',
    harder: 'One arm at a time, so your trunk also has to resist turning.',
    stretches: ['doorway_pec_mid'],
  },
  trx_press: {
    setup: ['Straps at full length, a handle in each hand, facing away from the anchor.', 'Arms straight in front of your chest, body leaning forward in a straight line.'],
    execution: ['Bend your elbows and lower your chest between your hands.', 'Keep your body straight like a moving plank, elbows about 45° from your sides.', 'Push back up to straight arms.'],
    breathing: 'In on the way down, out as you push up.',
    mistakes: ['Hips sagging or sticking up.', 'Hands drifting wide so the straps rub your arms.', 'Going deeper than your shoulders are comfortable with.'],
    easier: 'Step your feet forward so you stand more upright.',
    harder: 'Walk your feet back so you lean further, or lift one foot.',
    stretches: ['doorway_pec_mid'],
  },
  band_press: {
    setup: ['Anchor the band behind you at chest height, a handle in each hand.', 'Step forward until the band is tight; split stance, hands beside your chest.'],
    execution: ['Press forward until your arms are straight in front of your chest.', 'Pause, then let your hands come back slowly.'],
    breathing: 'Out as you press, in as you return.',
    mistakes: ['Letting the band snap your arms back.', 'Leaning forward instead of pressing.', 'Elbows flared straight out to the sides.'],
    easier: 'Step closer to the anchor, or use a lighter band.',
    harder: 'Step further away, or use a heavier band.',
    stretches: ['doorway_pec_mid'],
  },
  pec_deck: {
    setup: ['Set the seat so the handles are at chest height.', 'Back flat on the pad, feet down, elbows slightly bent.'],
    execution: ['Squeeze the handles together in front of your chest.', 'Pause about 1 s.', 'Open slowly until you feel a mild stretch across your chest.'],
    breathing: 'Out as the handles meet, in as they open.',
    mistakes: ['Seat too low, so your shoulders take over.', 'Letting the weight pull your arms far back.', 'Back coming off the pad.'],
    easier: 'Lighter weight and a shorter range.',
    harder: 'Open slowly over 3 s.',
    stretches: ['doorway_pec_mid'],
  },
  incline_pushup: {
    setup: ['Hands on a sturdy bench or counter edge, a little wider than your shoulders.', 'Walk your feet back until your body is straight from head to heels.'],
    execution: ['Lower your chest to the edge as one unit, elbows angled back about 45°.', 'Push away until your arms are straight.'],
    breathing: 'In on the way down, out as you push away.',
    mistakes: ['Hips sagging.', 'Only your head moving toward the bench.', 'Using something that can slide or tip.'],
    easier: 'A higher surface, like a kitchen counter or a wall.',
    harder: 'A lower surface, then the floor.',
    stretches: ['doorway_pec_mid'],
  },
  skull_crusher: {
    setup: ['Lie on a bench with a dumbbell in each hand, feet flat.', 'Arms straight up, then tilt them slightly back toward your head.'],
    execution: ['Bend only at the elbows to lower the dumbbells beside your head.', 'Keep your upper arms still, elbows pointing up.', 'Straighten your arms back to the start.'],
    breathing: 'In as you lower, out as you straighten.',
    mistakes: ['Elbows flaring out wide.', 'Upper arms swinging, so it turns into a press.', 'Going too heavy to control near your head.'],
    easier: 'Lighter dumbbells, or a cable pressdown.',
    harder: 'Slower lowering, or a short pause at the bottom.',
    stretches: ['overhead_triceps'],
  },
  kickback: {
    setup: ['One hand and knee on a bench, back flat.', 'Dumbbell in the other hand, upper arm lifted along your side.'],
    execution: ['Keep the upper arm still and straighten your elbow until the arm points straight back.', 'Squeeze 1 s, then lower slowly to about 90°.'],
    breathing: 'Out as you straighten, in as you lower.',
    mistakes: ['Upper arm dropping, so the weight just swings.', 'Throwing the weight with momentum.', 'Rounding your back.'],
    easier: 'A lighter dumbbell, or a band pressdown.',
    harder: 'A 2 s squeeze with the arm straight.',
    stretches: ['overhead_triceps'],
  },
  trx_triceps: {
    setup: ['Face away from the anchor, a handle in each hand.', 'Arms straight out in front at about head height, body leaning forward in a straight line.'],
    execution: ['Bend only at the elbows so your hands come toward your forehead and your body leans in.', 'Keep your upper arms pointing forward and still.', 'Press your hands away to straighten your arms and lift your body back.'],
    breathing: 'In as you lean in, out as you press back.',
    mistakes: ['Hips sagging.', 'Elbows dropping, so it turns into a press.', 'Elbows flaring wide.'],
    easier: 'Step your feet forward so you stand more upright.',
    harder: 'Walk your feet back so you lean further.',
    stretches: ['overhead_triceps'],
  },
  close_bench: {
    setup: ['Lie with your eyes under the bar, feet flat.', 'Grip about shoulder-width apart, no narrower.', 'Shoulder blades pulled down and back.'],
    execution: ['Unrack with straight arms over your shoulders.', 'Lower to your lower chest with elbows tucked close to your sides.', 'Press back up to straight arms.'],
    breathing: 'Breathe in and brace before lowering, out as you press.',
    mistakes: ['Hands too close together, which strains the wrists.', 'Elbows flaring out.', 'Bouncing the bar off your chest.'],
    easier: 'Close-grip push-up, or a dumbbell press with palms facing each other.',
    harder: 'Paused reps, 1 s on the chest.',
    stretches: ['overhead_triceps', 'doorway_pec_mid'],
  },
  band_pressdown: {
    setup: ['Anchor the band high on a door or bar.', 'Stand tall, elbows at your sides, forearms at about 90°.'],
    execution: ['Push down until your arms are straight.', 'Let your forearms rise slowly back to about 90°.'],
    breathing: 'Out as you push down, in as you return.',
    mistakes: ['Elbows drifting forward.', 'Leaning over the band.', 'Letting the band snap back up.'],
    easier: 'A lighter band, or step closer to the anchor.',
    harder: 'A heavier band, or a cable pressdown.',
    stretches: ['overhead_triceps'],
  },
}

const PRESS_ARMS: HeadId[] = ['delt_front', 'triceps_lateral', 'triceps_medial']
const CORE: HeadId[] = ['rectus_abdominis', 'transverse_abdominis']

export const HEADS_CHEST: Record<string, HeadSpec> = {
  // ── Chest presses ──
  bench: { prime: ['pec_mid'], assist: ['pec_upper', ...PRESS_ARMS], stabilize: ['rotator_cuff', 'rhomboids'] },
  incline_db: { prime: ['pec_upper'], assist: ['pec_mid', ...PRESS_ARMS], stabilize: ['rotator_cuff'], note: 'A bench at about 30° shifts work to the upper chest; much steeper and the shoulders take over.' },
  db_bench: { prime: ['pec_mid'], assist: ['pec_upper', ...PRESS_ARMS], stabilize: ['rotator_cuff'], note: 'Each dumbbell moves on its own, so the small shoulder muscles work to steady them.' },
  machine_press: { prime: ['pec_mid'], assist: PRESS_ARMS, note: 'The machine guides the path, so less steadying work is needed.' },
  smith_bench: { prime: ['pec_mid'], assist: ['pec_upper', ...PRESS_ARMS], stabilize: ['rhomboids'], note: 'The bar runs on rails, so the small steadying muscles work less than with a free bar.' },
  floor_press: { prime: ['pec_mid'], assist: ['triceps_lateral', 'triceps_medial', 'delt_front'], stabilize: ['rotator_cuff'], note: 'The floor stops the elbows at your sides, which limits shoulder stretch.' },
  cable_press: { prime: ['pec_mid'], assist: [...PRESS_ARMS, 'serratus'], stabilize: [...CORE, 'obliques'], note: 'Standing, your trunk braces so the cables don’t pull you backward.' },
  trx_press: { prime: ['pec_mid'], assist: PRESS_ARMS, stabilize: ['serratus', 'rotator_cuff', ...CORE], note: 'The straps wobble, so your shoulder steadiers and core work harder than on a bench.' },
  band_press: { prime: ['pec_mid'], assist: [...PRESS_ARMS, 'serratus'], stabilize: CORE, note: 'A band gets harder as it stretches, so the end of the press is the toughest part.' },
  // ── Flys ──
  cable_fly: { prime: ['pec_mid'], assist: ['pec_upper', 'pec_lower', 'delt_front'], stabilize: ['rotator_cuff', 'biceps_short'], note: 'The arms stay slightly bent, so the chest moves the arm without the triceps helping.' },
  pec_deck: { prime: ['pec_mid'], assist: ['pec_upper', 'delt_front'], stabilize: ['rotator_cuff'], note: 'Seated on a fixed path, so nearly all the work goes to the chest.' },
  db_fly: { prime: ['pec_upper'], assist: ['pec_mid', 'delt_front'], stabilize: ['rotator_cuff', 'biceps_short'], note: 'The load is heaviest with the arms open, where the chest is stretched.' },
  low_high_fly: { prime: ['pec_upper'], assist: ['delt_front', 'pec_mid'], stabilize: ['rotator_cuff', ...CORE], note: 'Sweeping up and in follows the line of the upper chest fibres.' },
  // ── Push-ups and dips ──
  pushup: { prime: ['pec_mid'], assist: PRESS_ARMS, stabilize: ['serratus', ...CORE] },
  incline_pushup: { prime: ['pec_mid'], assist: ['pec_lower', ...PRESS_ARMS], stabilize: ['serratus', ...CORE], note: 'Hands raised, you lift less of your body weight, and the press angle leans toward the lower chest.' },
  dip: { prime: ['pec_lower', 'triceps_lateral', 'triceps_medial'], assist: ['pec_mid', 'triceps_long', 'delt_front'], stabilize: ['rotator_cuff', 'traps_lower'], note: 'Leaning forward shifts work to the chest; staying upright shifts it to the triceps.' },
  // ── Triceps ──
  pressdown: { prime: ['triceps_lateral', 'triceps_medial'], assist: ['triceps_long'], stabilize: ['rectus_abdominis', 'forearms'], note: 'With the arms at your sides the long head is short, so the other two heads do most of the work.' },
  band_pressdown: { prime: ['triceps_lateral', 'triceps_medial'], assist: ['triceps_long'], stabilize: ['rectus_abdominis', 'forearms'], note: 'The band is hardest near full straightening.' },
  overhead_ext: { prime: ['triceps_long'], assist: ['triceps_lateral', 'triceps_medial'], stabilize: [...CORE, 'rotator_cuff'], note: 'Arms overhead stretch the long head, which grew more with overhead work in a trial.' },
  cable_overhead: { prime: ['triceps_long'], assist: ['triceps_lateral', 'triceps_medial'], stabilize: CORE, note: 'Arms overhead stretch the long head; the cable keeps tension through the whole rep.' },
  skull_crusher: { prime: ['triceps_long'], assist: ['triceps_lateral', 'triceps_medial'], stabilize: ['rotator_cuff', 'forearms'], note: 'Tilting the upper arms back toward your head keeps the long head stretched.' },
  kickback: { prime: ['triceps_lateral', 'triceps_medial'], assist: ['triceps_long'], stabilize: ['delt_rear', 'erectors'], note: 'Hardest with the arm straight, when the weight is furthest from the elbow.' },
  trx_triceps: { prime: ['triceps_long'], assist: ['triceps_lateral', 'triceps_medial'], stabilize: ['serratus', ...CORE], note: 'Arms raised in front stretch the long head; your core holds the body straight.' },
  close_bench: { prime: ['triceps_lateral', 'triceps_medial'], assist: ['pec_mid', 'triceps_long', 'delt_front'], stabilize: ['rotator_cuff'], note: 'A narrower grip with tucked elbows moves work from the chest to the triceps.' },
  close_pushup: { prime: ['triceps_lateral', 'triceps_medial'], assist: ['pec_mid', 'triceps_long', 'delt_front'], stabilize: ['serratus', ...CORE] },
  bench_dip: { prime: ['triceps_lateral', 'triceps_medial'], assist: ['triceps_long', 'delt_front', 'pec_lower'], stabilize: ['traps_lower', 'rotator_cuff'], note: 'The shoulders go far behind the body, so keep the depth modest.' },
}
