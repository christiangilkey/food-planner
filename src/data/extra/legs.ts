// Diagrams, form guides and muscle heads for this muscle group's exercises (see ../exercises.ts).
// Coordinates and angles follow src/lib/pose.ts: frames are 200 × 200, the floor is at y = 190, a flat
// foot's ankle at y = 186, angles are absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { HeadSpec } from '../exercises'
import type { FormGuide } from '../form'

const G = 186

// Copied from ../diagrams.ts (importing it would make a cycle).
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
const benchFlat = (x1: number, x2: number, y: number): Prop[] => [
  { t: 'pad', a: [x1, y], b: [x2, y] },
  { t: 'line', a: [x1 + 10, y + 4], b: [x1 + 10, 190] },
  { t: 'line', a: [x2 - 10, y + 4], b: [x2 - 10, 190] },
]
const tower = (x: number, top = 10): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })

// Lying on the back, shoulders on the floor, head to the left.
// The head is tilted so it rests on the floor rather than dipping below it.
const supine = (torso: number, leg: SidePose['leg']): SidePose => ({ at: ['shoulder', 45, 180], torso, head: -85 - torso, arm: [90, 90], leg })

export const DIAGRAMS_LEGS: Record<string, Diagram> = {
  // Two rails with the bar sliding between them, feet a little in front of the bar.
  smith_squat: {
    start: { at: ['ankle', 112, G], torso: 184, arm: [-44, 149], leg: [7, 7] },
    end: { at: ['ankle', 120, G], torso: 160, arm: [-60, 133], leg: [85, -5] },
    props: [tower(92, 14), tower(100, 14), { t: 'plate', at: ['shoulder', -6, 1], r: 10 }, { t: 'bar', at: ['shoulder', -6, 1] }],
  },
  // Sit back to a box behind you, arms forward to balance.
  box_squat: {
    start: stand(112, { arm: [90, 90] }),
    end: { at: ['ankle', 112, G], torso: 150, arm: [95, 95], leg: [88, -15] },
    props: benchFlat(48, 92, 158),
  },
  // Holding straps from a high anchor in front, sitting deep.
  trx_squat: {
    start: stand(92, { torso: 184, arm: [117, 117], leg: [4, 4] }),
    end: { at: ['ankle', 92, G], torso: 165, arm: [132, 132], leg: [100, -25] },
    props: [{ t: 'line', a: [150, 8], b: [192, 8] }, { t: 'cable', from: [182, 12], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  // Step back and drop the back knee toward the floor.
  reverse_lunge: {
    start: stand(118),
    end: { at: ['hip', 86, 146], torso: 176, arm: [0, 0], leg: { to: [118, G], bend: 'front' }, leg2: { to: [48, 180], bend: 'down', foot: 60 } },
    props: [{ t: 'db', at: 'hand', angle: 90 }],
  },
  // One foot on the box, then stand tall on it.
  step_up: {
    start: { at: ['hip', 98, 118], torso: 170, arm: [6, 6], leg: { to: [128, 150], bend: 'front' }, leg2: { to: [92, G], bend: 'front' } },
    end: { at: ['ankle', 128, 150], torso: 180, arm: [0, 0], leg: [0, 0], leg2: [-15, -40] },
    props: benchFlat(108, 164, 158),
  },
  // Hips back, chest up, hands on the handles beside the body; plates on the sleeves.
  trap_deadlift: {
    start: { at: ['ankle', 100, G], torso: 138, arm: [0, 0], leg: [70, -20] },
    end: stand(100, { arm: [6, 6] }),
    props: [{ t: 'line', a: 'hand', b: ['hand', 0, 19] }, { t: 'bar', at: 'hand' }, { t: 'plate', at: ['hand', 0, 19], r: 16 }],
  },
  // Bell hiked back between the legs, then snapped up to chest height.
  kb_swing: {
    start: { at: ['ankle', 100, G], torso: 120, arm: [-15, -15], leg: [35, 5] },
    end: stand(100, { arm: [92, 92] }),
    startProps: [{ t: 'roller', at: ['hand', -2, 7], r: 7 }],
    endProps: [{ t: 'roller', at: ['hand', 7, 1], r: 7 }],
  },
  // Heels on a big ball, hips up; roll it in.
  ball_curl: {
    start: supine(-70, { to: [154, 140], bend: 'up', foot: 170 }),
    end: supine(-50, { to: [126, 140], bend: 'up', foot: 160 }),
    startProps: [{ t: 'roller', at: [154, 168], r: 22 }],
    endProps: [{ t: 'roller', at: [127, 168], r: 22 }],
  },
  // Heels in the foot cradles of straps hung from a high anchor.
  trx_ham_curl: {
    start: supine(-80, { to: [160, 160], bend: 'up', foot: 170 }),
    end: supine(-55, { to: [124, 156], bend: 'up', foot: 160 }),
    props: [{ t: 'line', a: [130, 8], b: [190, 8] }, { t: 'cable', from: [150, 12], to: 'ankle' }],
  },
  // Band from a low anchor around the near ankle; hold the support and curl the heel up.
  band_leg_curl: {
    start: { at: ['ankle2', 96, G], torso: 174, arm: { to: [130, 104], bend: 'down' }, leg: [0, 0], leg2: [0, 0] },
    end: { at: ['ankle2', 96, G], torso: 174, arm: { to: [130, 104], bend: 'down' }, leg: [-4, -120, -30], leg2: [0, 0] },
    props: [{ t: 'line', a: [133, 98], b: [133, 190] }, { t: 'band', from: [133, 184], to: 'ankle' }],
  },
}

export const FORM_LEGS: Record<string, FormGuide> = {
  smith_squat: {
    setup: ['Bar on your upper back, hands just outside your shoulders.', 'Feet shoulder-width, a little in front of the bar.', 'Brace, then twist the bar to unhook it.'],
    execution: ['Sit down until your thighs are about level, or as deep as you control.', 'Keep your heels down and knees in line with your toes.', 'Push through the whole foot to stand.'],
    breathing: 'Breathe in and brace at the top, breathe out on the way up.',
    mistakes: ['Feet too far forward, so your back rounds at the bottom.', 'Knees caving in.', 'Heels lifting.'],
    safety: { text: 'Deep squats are safe for healthy knees if load builds gradually; use a pain-free depth if your knees hurt.', sources: ['pm_23821469'] },
    easier: 'Box squat, or a shallower depth.',
    harder: 'Pause 2 s at the bottom, or add load.',
    stretches: ['quad_side_lying', 'figure4_glute'],
  },
  box_squat: {
    setup: ['Box or bench behind you at a height that suits your knees and hips.', 'Feet shoulder-width, toes out a little, arms forward.'],
    execution: ['Sit back and down until you just touch the box.', 'Stay tight; don’t flop or rock back.', 'Push through your whole foot to stand.'],
    breathing: 'In on the way down, out as you stand.',
    mistakes: ['Dropping onto the box.', 'Rocking back to get momentum.', 'Knees caving as you stand.'],
    easier: 'Use a higher box.',
    harder: 'Lower box, or hold a dumbbell at your chest.',
    stretches: ['quad_side_lying', 'figure4_glute'],
  },
  trx_squat: {
    setup: ['Face the anchor, holding the handles with your arms straight out in front.', 'Feet shoulder-width, straps tight.'],
    execution: ['Sit back and down, keeping your arms long.', 'Go as deep as is comfortable, heels down.', 'Stand back up, pulling on the straps only as much as you need.'],
    breathing: 'In on the way down, out on the way up.',
    mistakes: ['Pulling with your arms to do the work.', 'Heels lifting.', 'Straps going slack.'],
    easier: 'Pull a bit more with your arms.',
    harder: 'Use the straps less, or try a goblet squat.',
    stretches: ['quad_side_lying', 'figure4_glute'],
  },
  reverse_lunge: {
    setup: ['Stand tall, feet hip-width, dumbbells at your sides.'],
    execution: ['Take a long step back and lower your back knee toward the floor.', 'Front shin fairly upright, front heel down.', 'Push through your front heel to step back up.'],
    breathing: 'In on the way down, out as you step back up.',
    mistakes: ['Stepping too short, so the front heel lifts.', 'Front knee caving in.', 'Pushing off the back foot.'],
    easier: 'No weights, or hold a support.',
    harder: 'Heavier dumbbells, or step back off a low step.',
    stretches: ['hip_flexor_kneeling', 'quad_side_lying'],
  },
  step_up: {
    setup: ['Sturdy box or step at knee height or lower.', 'Whole foot on top of the box.'],
    execution: ['Lean forward a little and push through the top foot to stand tall.', 'Don’t push off the bottom foot.', 'Lower slowly back down.'],
    breathing: 'Out as you step up, in as you lower.',
    mistakes: ['Pushing off the back foot.', 'Knee caving in.', 'Dropping down fast.'],
    easier: 'Lower step, or hold a rail.',
    harder: 'Higher step (up to knee height), or hold dumbbells.',
    stretches: ['quad_side_lying', 'hip_flexor_kneeling'],
  },
  trap_deadlift: {
    setup: ['Stand in the middle of the bar, feet hip-width.', 'Hips back and down, grip the handles, chest up, back flat.'],
    execution: ['Brace and push the floor away.', 'Hips and shoulders rise together until you stand tall.', 'Lower the same way, hips back first.'],
    breathing: 'Breathe in and brace before each lift, out at the top.',
    mistakes: ['Rounding your back off the floor.', 'Hips shooting up first.', 'Leaning back at the top.'],
    safety: { text: 'Keep your back flat under load; repeated loaded bending injured spinal discs in animal tests.', sources: ['pm_11114441'] },
    easier: 'Use the high handles, or lift from blocks.',
    harder: 'Add load, or pause just off the floor.',
    stretches: ['hamstring_supine', 'figure4_glute'],
  },
  kb_swing: {
    setup: ['Bell on the floor a foot in front of you, feet a bit wider than hips.', 'Hinge, grip the handle, back flat.'],
    execution: ['Hike the bell back between your legs.', 'Snap your hips forward so the bell floats to chest height.', 'Let it fall, then hinge as it passes your legs.'],
    breathing: 'Breathe in on the backswing, out sharply as your hips snap.',
    mistakes: ['Squatting instead of hinging.', 'Lifting with your arms.', 'Rounding or arching your back.'],
    safety: { text: 'Keep your back flat; repeated loaded bending injured spinal discs in animal tests.', sources: ['pm_11114441'] },
    easier: 'Lighter bell, or practise the hip hinge first.',
    harder: 'Heavier bell, or one-arm swings.',
    stretches: ['hamstring_supine', 'hip_flexor_kneeling'],
  },
  ball_curl: {
    setup: ['Lie on your back, heels on top of the ball, arms out by your sides.', 'Lift your hips so your body is straight.'],
    execution: ['Keep your hips up and pull your heels in, rolling the ball toward you.', 'Pause, then roll it out slowly until your legs are straight.'],
    breathing: 'Out as you pull in, in as you roll out.',
    mistakes: ['Hips dropping.', 'Arching your low back.', 'Rolling out too fast.'],
    easier: 'Hold a bridge on the ball, or lower your hips between reps.',
    harder: 'One leg at a time, or arms on your chest.',
    stretches: ['hamstring_supine'],
  },
  trx_ham_curl: {
    setup: ['Lie under the anchor, heels in the foot cradles.', 'Arms by your sides, lift your hips so your body is straight.'],
    execution: ['Keep your hips up and pull your heels toward your seat.', 'Pause, then straighten your legs slowly.'],
    breathing: 'Out as you pull in, in as you straighten.',
    mistakes: ['Hips sagging.', 'Arching your low back.', 'Swinging the straps.'],
    easier: 'Hips down between reps, or smaller range.',
    harder: 'Slower lowering, or one leg at a time.',
    stretches: ['hamstring_supine'],
  },
  band_leg_curl: {
    setup: ['Loop the band around one ankle, anchored low in front of you.', 'Hold a sturdy support and stand tall.'],
    execution: ['Keep your knee pointing down and curl your heel toward your seat.', 'Pause, then lower slowly.'],
    breathing: 'Out as you curl, in as you lower.',
    mistakes: ['Knee swinging forward.', 'Arching your back.', 'Letting the band snap back.'],
    easier: 'Lighter band, or stand closer to the anchor.',
    harder: 'Thicker band, or step further away.',
    stretches: ['hamstring_supine'],
  },
}

const VASTI = ['vastus_lateralis', 'vastus_medialis', 'vastus_intermedius'] as const

export const HEADS_LEGS: Record<string, HeadSpec> = {
  // ── Quads ──
  squat: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['erectors', 'transverse_abdominis'], note: 'Squats grow the rectus femoris less than leg extensions.' },
  smith_squat: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['erectors'], note: 'The rails do the balancing, so stabilisers work less.' },
  leg_press: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], note: 'The back is supported, so the spine takes little load.' },
  goblet: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['erectors', 'transverse_abdominis'] },
  box_squat: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['erectors'] },
  trx_squat: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], note: 'The straps take some of your weight, so it’s a gentle start.' },
  split_squat: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['glute_med'] },
  bw_split_squat: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['glute_med'] },
  reverse_lunge: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['glute_med'], note: 'Stepping back is usually kinder to the knees than a forward lunge.' },
  step_up: { prime: [...VASTI, 'glute_max'], assist: ['adductors', 'rectus_femoris'], stabilize: ['glute_med'] },
  leg_ext: { prime: ['rectus_femoris', ...VASTI], assist: [], note: 'The best way to load the rectus femoris, which squats work less.' },
  wall_sit: { prime: [...VASTI], assist: ['rectus_femoris', 'glute_max'], note: 'A hold: the quads work without moving.' },
  // ── Hamstrings ──
  rdl: { prime: ['glute_max', 'biceps_femoris', 'semis'], assist: ['adductors'], stabilize: ['erectors', 'forearms'], note: 'Loads the hamstrings in a long stretch.' },
  db_rdl: { prime: ['glute_max', 'biceps_femoris', 'semis'], assist: ['adductors'], stabilize: ['erectors', 'forearms'] },
  trap_deadlift: { prime: ['glute_max', 'biceps_femoris', 'semis'], assist: [...VASTI, 'adductors'], stabilize: ['erectors', 'traps_upper', 'forearms'], note: 'You sit lower than in a straight-bar deadlift, so the quads help more.' },
  kb_swing: { prime: ['glute_max', 'biceps_femoris', 'semis'], assist: ['adductors'], stabilize: ['erectors', 'transverse_abdominis', 'forearms'], note: 'A fast hip snap; the glutes do most of the work.' },
  single_rdl: { prime: ['glute_max', 'biceps_femoris', 'semis'], assist: ['adductors'], stabilize: ['glute_med', 'erectors'] },
  leg_curl: { prime: ['semis', 'biceps_femoris'], assist: ['gastrocnemius'], note: 'Seated curls stretch the hamstrings more than lying curls.' },
  slider_curl: { prime: ['semis', 'biceps_femoris'], assist: ['glute_max', 'gastrocnemius'], stabilize: ['transverse_abdominis'], note: 'The glutes hold the hips up while the hamstrings bend the knees.' },
  ball_curl: { prime: ['semis', 'biceps_femoris'], assist: ['glute_max', 'gastrocnemius'], stabilize: ['glute_med', 'transverse_abdominis'] },
  trx_ham_curl: { prime: ['semis', 'biceps_femoris'], assist: ['glute_max', 'gastrocnemius'], stabilize: ['glute_med', 'transverse_abdominis'] },
  band_leg_curl: { prime: ['semis', 'biceps_femoris'], assist: ['gastrocnemius'], stabilize: ['glute_med'], note: 'Light load: good for warm-ups, rehab and high reps.' },
  nordic: { prime: ['semis', 'biceps_femoris'], assist: ['gastrocnemius'], stabilize: ['glute_max', 'erectors'], note: 'Hard lowering work; the inner hamstrings work especially hard.' },
}
