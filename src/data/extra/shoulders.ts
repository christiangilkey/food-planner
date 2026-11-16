// Diagrams, form guides and muscle heads for this muscle group's exercises (see ../exercises.ts).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { HeadSpec } from '../exercises'
import type { FormGuide } from '../form'

// Helpers copied from ../diagrams.ts (importing it would make a cycle).
const G = 186
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
const tower = (x: number, top = 10): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })
const benchFlat = (x1: number, x2: number, y: number): Prop[] => [
  { t: 'pad', a: [x1, y], b: [x2, y] },
  { t: 'line', a: [x1 + 10, y + 4], b: [x1 + 10, 190] },
  { t: 'line', a: [x2 - 10, y + 4], b: [x2 - 10, 190] },
]

// Landmine: staggered stance facing the floor pivot, leaning in a little.
const landmine = (torso: number, arm: SidePose['arm']): SidePose => ({
  at: ['hip', 62, 116], torso, arm,
  leg: { to: [80, G], bend: 'front' }, leg2: { to: [44, G], bend: 'front', foot: 70 },
})
const LANDMINE_PIVOT: [number, number] = [196, 188]

// Seated, facing the chest pad of a rear-delt machine; the handle arms hang from a pivot above the shoulder.
const deckSit = (arm: SidePose['arm'], reach?: number): SidePose => ({ at: ['hip', 88, 150], torso: 180, arm, leg: { to: [126, G], bend: 'up' }, reach })

// Suspension strap anchor, high in front.
const STRAP_ANCHOR: [number, number] = [178, 8]

// External rotation, front view: elbow at the side, forearm level, swinging from across the stomach to out to the side.
const rotate = (fore: number) => ({ view: 'front' as const, at: ['ankle', 111, G] as ['ankle', number, number], arm: [0, fore] as [number, number], arm2: [-4, -4] as [number, number] })

// Seated calf raise: hips stay on the bench, the ball of the foot stays on the step, the heel drops or rises.
const CALF_TOE: [number, number] = [132, 172]
const seatedCalf = (foot: number, hand: [number, number]): SidePose => {
  const r = (foot * Math.PI) / 180
  const ankle: [number, number] = [CALF_TOE[0] - Math.sin(r) * 13, CALF_TOE[1] - Math.cos(r) * 13]
  return { at: ['hip', 84, 140], torso: 172, arm: { to: hand, bend: 'down' }, leg: { to: ankle, bend: 'up', foot } }
}

// Leg press calf raise: legs nearly straight, ball of the foot on the bottom edge of the platform.
const pressCalf = (foot: number): SidePose => ({ at: ['hip', 80, 150], torso: 225, arm: [-30, 60], leg: [133, 138, foot] })

export const DIAGRAMS_SHOULDERS: Record<string, Diagram> = {
  landmine_press: {
    // The bar end travels on an arc around the pivot: both hand positions sit the same distance from it.
    start: landmine(168, { to: [82, 74], bend: 'down' }),
    end: landmine(160, { to: [119.7, 46], bend: 'down' }),
    props: [{ t: 'line', a: LANDMINE_PIVOT, b: 'hand' }, { t: 'bar', at: LANDMINE_PIVOT }],
    // Plates sit just past the hands, along the bar.
    startProps: [{ t: 'plate', at: ['hand', 9.9, 9.9], r: 9 }],
    endProps: [{ t: 'plate', at: ['hand', 6.6, 12.3], r: 9 }],
  },
  band_lateral: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [8, 4] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [86, 92] },
    props: [{ t: 'band', from: 'toe', to: 'hand' }, { t: 'band', from: 'toe2', to: 'hand2' }],
  },
  reverse_pec_deck: {
    // Seen from the side, the arms sweep back out toward you, so they look short at the finish.
    start: deckSit([90, 90]),
    end: deckSit([-90, -90], 0.25),
    props: [
      { t: 'pad', a: [72, 158], b: [108, 158] }, { t: 'line', a: [90, 162], b: [90, 190] },
      { t: 'pad', a: [99, 112], b: [99, 140] }, { t: 'line', a: [103, 126], b: [164, 126] },
      { t: 'line', a: [88, 40], b: [164, 40] }, tower(164, 40), { t: 'line', a: [88, 40], b: 'hand' }, { t: 'bar', at: 'hand' },
    ],
  },
  band_face_pull: {
    start: stand(70, { arm: [104, 100] }), end: stand(70, { arm: { to: [80, 52], bend: 'back' } }),
    props: [tower(178, 20), { t: 'band', from: [178, 52], to: 'hand' }],
  },
  trx_y: {
    start: { at: ['ankle', 140, G], torso: 210, arm: [122, 122], leg: [30, 30] },
    end: { at: ['ankle', 140, G], torso: 195, arm: [165, 165], leg: [15, 15] },
    props: [{ t: 'line', a: [160, 4], b: [196, 4] }, { t: 'cable', from: STRAP_ANCHOR, to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  band_external_rotation: {
    start: rotate(-90), end: rotate(88),
    props: [tower(20, 40), { t: 'band', from: [20, 92], to: 'hand' }, { t: 'roller', at: ['elbow', -3, 0], r: 3 }],
  },
  cable_external_rotation: {
    start: rotate(-90), end: rotate(88),
    props: [tower(20, 30), { t: 'cable', from: [20, 92], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  seated_calf: {
    start: seatedCalf(112, [117, 133]),
    end: seatedCalf(52, [115, 120]),
    props: [
      ...benchFlat(40, 96, 148),
      { t: 'pad', a: [124, 178], b: [156, 178] }, { t: 'line', a: [150, 182], b: [150, 190] },
      { t: 'db', at: ['knee', 0, -7] },
    ],
  },
  leg_press_calf: {
    start: pressCalf(245), end: pressCalf(190),
    props: [
      { t: 'pad', a: [76, 158], b: [36, 118] }, { t: 'line', a: [60, 160], b: [60, 190] }, { t: 'line', a: [100, 146], b: [172, 74] }, { t: 'line', a: [100, 146], b: [100, 190] },
      // The platform stays square to the legs; the ball of the foot sits on its bottom edge.
      { t: 'pad', a: ['toe', 5.6, 0], b: ['toe', -12.8, -18.4], w: 6 },
    ],
  },
}

export const FORM_SHOULDERS: Record<string, FormGuide> = {
  landmine_press: {
    setup: ['Bar end in a landmine or wedged into a corner; load the other end.', 'Stand facing the bar in a split stance, or half-kneel.', 'Hold the end of the bar at the front of your shoulder, elbow down.'],
    execution: ['Press the bar up and forward until your arm is straight.', 'Let your shoulder blade move forward around your ribs at the top.', 'Lower slowly back to your shoulder.'],
    breathing: 'Out as you press, in as you lower.',
    mistakes: ['Leaning back and arching your low back.', 'Elbow flaring straight out to the side.', 'Shrugging toward your ear.'],
    easier: 'Half-kneeling with a lighter load, or both hands on the bar.',
    harder: 'Add weight, or stand on the opposite leg to the pressing arm.',
    stretches: ['doorway_pec_low', 'overhead_triceps'],
  },
  band_lateral: {
    setup: ['Stand on the middle of the band, feet hip-width.', 'One end in each hand at your sides, palms in.', 'Elbows slightly bent; shoulders down.'],
    execution: ['Raise your arms out to the sides, elbows leading.', 'Stop at shoulder height.', 'Lower slowly against the band.'],
    breathing: 'Out as you raise, in as you lower.',
    mistakes: ['Going above shoulder height.', 'Shrugging or leaning to cheat.', 'Letting the band snap your arms down.'],
    safety: { text: 'Stop at shoulder height; raises above it are linked to impingement signs.', sources: ['pm_24077379'] },
    easier: 'Lighter band, or stand on it with one foot.',
    harder: 'Thicker band, a wider stance, or a pause at the top.',
    stretches: ['cross_body_shoulder'],
  },
  reverse_pec_deck: {
    setup: ['Sit facing the pad, chest against it.', 'Set the handles so your arms are at shoulder height.', 'Grip with palms facing in or down, elbows soft.'],
    execution: ['Sweep your arms back and out until they are in line with your body.', 'Pause and squeeze the back of your shoulders.', 'Return slowly until your hands are in front of you.'],
    breathing: 'Out as you sweep back, in as you return.',
    mistakes: ['Pulling the chest off the pad.', 'Bending the elbows into a row.', 'Shrugging or swinging the weight.'],
    easier: 'Lighter stack, or a band pull-apart.',
    harder: 'A 2 s pause at the back, or one arm at a time.',
    stretches: ['cross_body_shoulder'],
  },
  band_face_pull: {
    setup: ['Anchor the band at face height.', 'Hold both ends, palms down, and step back until it is taut.', 'Stand tall, knees soft.'],
    execution: ['Pull toward your face with your elbows high and wide.', 'Finish with your hands beside your ears.', 'Pause, then return slowly.'],
    breathing: 'Out as you pull, in as you return.',
    mistakes: ['Leaning back to pull.', 'Elbows dropping into a low row.', 'Shrugging toward your ears.'],
    easier: 'Lighter band, or step closer to the anchor.',
    harder: 'Thicker band, step further back, or a longer pause.',
    stretches: ['cross_body_shoulder'],
  },
  trx_y: {
    setup: ['Straps short; face the anchor and hold a handle in each hand.', 'Walk your feet forward and lean back, body in a straight line.', 'Arms straight out in front, palms facing down.'],
    execution: ['Raise your straight arms up and out into a Y.', 'Your body rises toward upright as your arms go up.', 'Lower slowly back to the lean.'],
    breathing: 'Out as you raise, in as you lower.',
    mistakes: ['Bending the elbows to pull.', 'Hips sagging.', 'Shrugging toward your ears.'],
    easier: 'Stand more upright, with your feet further back.',
    harder: 'Walk your feet further forward so you lean back more.',
    stretches: ['cross_body_shoulder', 'kneeling_lat'],
  },
  band_external_rotation: {
    setup: ['Anchor the band at elbow height beside you, on the side away from the working arm.', 'Elbow bent 90° and tucked at your side, a rolled towel under it.', 'Forearm across your stomach.'],
    execution: ['Rotate your forearm out, keeping the elbow at your side.', 'Stop when it points forward and out, or a little further.', 'Return slowly.'],
    breathing: 'Out as you rotate out, in as you return.',
    mistakes: ['Elbow drifting away from your side.', 'Turning the body instead of the arm.', 'Going fast or heavy.'],
    easier: 'Lighter band, or a smaller range.',
    harder: 'Thicker band, or a 2 s pause at the end.',
    stretches: ['cross_body_shoulder'],
  },
  cable_external_rotation: {
    setup: ['Set the pulley at elbow height and stand side-on, working arm away from the stack.', 'Elbow bent 90° and tucked at your side; a rolled towel under it helps.', 'Forearm across your stomach.'],
    execution: ['Rotate your forearm out, keeping the elbow at your side.', 'Stop when it points forward and out, or a little further.', 'Return slowly.'],
    breathing: 'Out as you rotate out, in as you return.',
    mistakes: ['Elbow drifting away from your side.', 'Twisting the body.', 'Too much weight, so the movement gets jerky.'],
    easier: 'Lightest plate, or a band.',
    harder: 'Slower reps with a 2 s pause.',
    stretches: ['cross_body_shoulder'],
  },
  seated_calf: {
    setup: ['Sit on a bench, knees bent about 90°.', 'Balls of your feet on a plate or step, heels free.', 'Dumbbells resting on your knees, held in place.'],
    execution: ['Lower your heels slowly to a full stretch; pause.', 'Push up as high as you can on the balls of your feet.', 'Pause at the top, then lower slowly.'],
    breathing: 'Out as you rise, in as you lower.',
    mistakes: ['Bouncing out of the bottom.', 'Short, half reps.', 'Rolling onto the outer toes.'],
    easier: 'Lighter dumbbells, or feet flat on the floor.',
    harder: 'Heavier dumbbells, or one leg at a time.',
    stretches: ['calf_bent_knee'],
  },
  leg_press_calf: {
    setup: ['Sit in the leg press, balls of your feet on the bottom edge of the platform.', 'Legs straight but knees soft; keep the safety catches on.', 'Heels hanging off the edge.'],
    execution: ['Let the platform press your toes back to a full calf stretch.', 'Push the platform away with your ankles only.', 'Pause at the top, then lower slowly.'],
    breathing: 'Out as you push, in as you lower.',
    mistakes: ['Bending the knees to help.', 'Feet slipping too low on the platform.', 'Bouncing at the bottom.'],
    easier: 'Lighter load, smaller range at first.',
    harder: 'More load, one leg at a time, or a pause in the stretch.',
    stretches: ['calf_wall_straight', 'calf_bent_knee'],
  },
}

const PRESS: HeadSpec = { prime: ['delt_front'], assist: ['delt_side', 'triceps_lateral', 'triceps_medial', 'triceps_long'], stabilize: ['traps_upper', 'serratus', 'rotator_cuff'] }
const RAISE: HeadSpec = { prime: ['delt_side'], assist: ['rotator_cuff', 'traps_upper', 'delt_front'], stabilize: ['serratus', 'traps_lower'], note: 'The supraspinatus (rotator cuff) helps start the raise.' }
const REAR: HeadSpec = { prime: ['delt_rear'], assist: ['traps_mid', 'rhomboids', 'rotator_cuff'], stabilize: ['traps_lower'] }
const FACE_PULL: HeadSpec = { prime: ['delt_rear', 'traps_mid'], assist: ['rhomboids', 'rotator_cuff', 'traps_lower'], stabilize: ['transverse_abdominis'], note: 'The outward turn at the end works the rotator cuff.' }
const EXTERNAL_ROTATION: HeadSpec = { prime: ['rotator_cuff'], assist: ['delt_rear'], stabilize: ['traps_mid', 'rhomboids'], note: 'Mainly the infraspinatus and teres minor.' }
const STRAIGHT_KNEE_CALF: HeadSpec = { prime: ['gastrocnemius'], assist: ['soleus'], note: 'With the knee straight the gastrocnemius does most of the work.' }

export const HEADS_SHOULDERS: Record<string, HeadSpec> = {
  ohp: { ...PRESS, stabilize: ['traps_upper', 'serratus', 'rotator_cuff', 'transverse_abdominis'] },
  machine_ohp: { ...PRESS, assist: ['delt_side', 'triceps_lateral', 'triceps_medial'], stabilize: ['traps_upper', 'serratus'] },
  landmine_press: {
    prime: ['delt_front', 'pec_upper'], assist: ['serratus', 'triceps_lateral', 'triceps_medial'], stabilize: ['rotator_cuff', 'obliques', 'transverse_abdominis'],
    note: 'The forward-and-up path brings in the upper chest and lets the shoulder blade move freely.',
  },
  pike_pushup: { prime: ['delt_front'], assist: ['delt_side', 'pec_upper', 'triceps_lateral', 'triceps_medial', 'triceps_long'], stabilize: ['serratus', 'traps_upper', 'rectus_abdominis'] },
  lateral: RAISE,
  cable_lateral: { ...RAISE, note: 'The cable keeps tension at the bottom, where a dumbbell gets light.' },
  band_lateral: { ...RAISE, note: 'The band gets harder toward the top of the raise.' },
  rear_fly: { ...REAR, stabilize: ['traps_lower', 'erectors'] },
  reverse_pec_deck: REAR,
  face_pull: FACE_PULL,
  band_face_pull: FACE_PULL,
  band_pull_apart: { prime: ['delt_rear', 'traps_mid'], assist: ['rhomboids', 'rotator_cuff', 'traps_lower'] },
  trx_y: {
    prime: ['traps_lower', 'delt_rear'], assist: ['traps_mid', 'rhomboids', 'delt_side', 'serratus', 'rotator_cuff'], stabilize: ['rectus_abdominis', 'transverse_abdominis', 'glute_max'],
    note: 'The lower traps draw the shoulder blades down and around as the arms rise.',
  },
  band_external_rotation: EXTERNAL_ROTATION,
  cable_external_rotation: EXTERNAL_ROTATION,
  calf_raise: STRAIGHT_KNEE_CALF,
  machine_calf: { ...STRAIGHT_KNEE_CALF, note: 'Standing, knees straight: mostly the gastrocnemius. On a seated machine the soleus takes over.' },
  seated_calf: { prime: ['soleus'], assist: ['gastrocnemius'], note: 'With the knee bent the gastrocnemius goes slack, so the soleus does most of the work.' },
  leg_press_calf: STRAIGHT_KNEE_CALF,
}
