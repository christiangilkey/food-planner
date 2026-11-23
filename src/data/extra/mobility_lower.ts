// Stretches and mobility drills for the lower back, hips, thighs, calves and ankles.
// Diagram coordinates follow src/lib/pose.ts: 200 × 200 frames, floor at y = 190, a flat foot's
// ankle at y = 186, angles absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { Exercise, HeadId, HeadSpec, Region, Stress } from '../exercises'
import type { FormGuide } from '../form'

const mob = (id: string, name: string, regions: Region[], hold: string, cue: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, kind: 'mobility', gear: ['bodyweight'], primary: [], secondary: [], compound: false, regions, hold, cue, ...extra })
const st = (...s: Stress[]) => ({ stress: s })

export const EX_MOBILITY_LOWER: Exercise[] = [
  mob('cat_cow', 'Cat-cow', ['lower_back', 'upper_back'], '2 × 8 slow', 'On hands and knees, round the back up as you breathe out, then let the belly sink and the chest lift as you breathe in.', st('floor', 'kneeling', 'spine_flexion')),
  mob('knees_to_chest', 'Knees-to-chest stretch', ['lower_back', 'glutes'], '2 × 30–60 s', 'Lying on your back, hug both knees toward your chest and let the lower back relax.', { supine: true, ...st('floor', 'spine_flexion') }),
  mob('pelvic_tilt', 'Pelvic tilts', ['lower_back'], '2 × 10 slow', 'Lying on your back with knees bent, gently flatten the lower back to the floor by tucking the tailbone, then relax.', { supine: true, ...st('floor') }),
  mob('hip_flexor_stretch', 'Half-kneeling hip flexor stretch', ['hip_flexors'], '2 × 30–60 s each side', 'Back knee on a pad, tuck the tailbone and squeeze the back glute, then shift forward until the front of that hip stretches.', st('kneeling')),
  mob('standing_hip_flexor', 'Standing hip flexor stretch', ['hip_flexors'], '2 × 30–60 s each side', 'Long split stance with a hand on a wall and the back heel up; tuck the tailbone and shift forward.'),
  mob('couch_stretch', 'Couch stretch', ['quads', 'hip_flexors'], '2 × 30–60 s each side', 'Back shin up against a wall or sofa, front foot forward; lift the chest until the front of the back thigh stretches.', st('kneeling', 'deep_knee')),
  mob('standing_quad_stretch', 'Standing quad stretch', ['quads'], '2 × 30–60 s each side', 'Hold a wall, pull one heel toward your seat with the knees together, and tuck the tailbone.', { support: true, ...st('balance') }),
  mob('hamstring_stretch', 'Lying hamstring stretch', ['hamstrings'], '2 × 30–60 s each side', 'Lie in a doorway with one leg up the frame, knee straight; slide closer to deepen it. A towel or strap works too.', { supine: true, ...st('floor') }),
  mob('standing_hamstring', 'Standing hamstring stretch', ['hamstrings', 'calves'], '2 × 30–60 s each side', 'Heel on a low step with the leg straight; hinge forward from the hips with a flat back.'),
  mob('figure_four', 'Figure-4 glute stretch', ['glutes'], '2 × 30–60 s each side', 'On your back, cross one ankle over the other knee and pull the bottom thigh toward you.', { supine: true, ...st('floor') }),
  mob('seated_figure_four', 'Seated figure-4 stretch', ['glutes'], '2 × 30–60 s each side', 'On a chair, rest one ankle on the other knee and lean forward with a flat back.'),
  mob('ninety_ninety', '90/90 hip switches', ['glutes', 'adductors'], '2 × 6 each side', 'Sit with both knees bent at 90°, one in front and one to the side, then turn both knees to the other side; hands behind you for support.', st('floor', 'deep_hip')),
  mob('adductor_rockback', 'Adductor rock-back', ['adductors'], '2 × 8 each side', 'On hands and knees with one leg straight out to the side, rock the hips back until the inner thigh stretches.', st('floor', 'kneeling')),
  mob('side_lunge_stretch', 'Side lunge stretch', ['adductors'], '2 × 30 s each side', 'Wide stance, bend one knee and sit into that hip, keeping the other leg straight and both feet flat.', st('deep_knee')),
  mob('calf_stretch', 'Wall calf stretch', ['calves'], '2 × 30–60 s each side', 'Hands on a wall, one foot back with the heel down and the knee straight; then bend the back knee for the lower calf.'),
  mob('knee_to_wall', 'Knee-to-wall ankle mobility', ['calves'], '2 × 10 each side', 'Foot a few centimetres from a wall, drive the knee forward to touch it without the heel lifting; move the foot back as it gets easier.'),
]

const G = 186

// On hands and knees, seen from the side: the far knee stays planted (as in core.ts).
const allFours = (extra: Partial<SidePose> = {}): SidePose => ({ at: ['knee2', 88, 184], torso: 102, arm: [0, 0], leg: [0, -90, -90], ...extra })
// Lying on the back, head to the left, knees bent and feet flat.
const backLie = (extra: Partial<SidePose> = {}): SidePose => ({ at: ['shoulder', 58, 180], torso: -90, arm: [90, 90], leg: { to: [146, G], bend: 'up' }, ...extra })
const wall = (x: number, top = 20): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })
// A folded mat under a kneeling knee.
const kneePad: Prop = { t: 'pad', a: ['knee', -9, 4], b: ['knee', 9, 4], w: 5 }

export const DIAGRAMS_MOBILITY_LOWER: Record<string, Diagram> = {
  // ── Lower back ──
  cat_cow: {
    // A stick spine can't curve, so the head shows the direction: tucked for cat, lifted for cow.
    start: allFours({ head: -55 }),
    end: allFours({ head: 25 }),
    labels: ['Cat: round up', 'Cow: chest lifts'],
  },
  knees_to_chest: {
    start: backLie(),
    end: backLie({ arm: { to: [89, 144], bend: 'down' }, leg: [-150, 125, 205] }),
    labels: ['Start', 'Hug knees in'],
  },
  pelvic_tilt: {
    // Zoomed in: the tailbone curls up a little as the low back presses into the floor.
    start: backLie(),
    end: backLie({ torso: -86 }),
    crop: [28, 136, 144, 60],
    labels: ['Relax', 'Flatten back'],
  },

  // ── Hip flexors and quads ──
  hip_flexor_stretch: {
    // The near (back) knee stays on its pad while the hips shift forward.
    start: { at: ['knee', 76, 184], torso: 180, arm: [10, 40], leg: [0, -90, -90], leg2: { to: [124, G], bend: 'up' } },
    end: { at: ['knee', 76, 184], torso: 180, arm: [10, 40], leg: [-22, -90, -90], leg2: { to: [124, G], bend: 'up' } },
    props: [kneePad],
    labels: ['Tuck the tailbone', 'Shift forward'],
  },
  standing_hip_flexor: {
    start: { at: ['hip', 92, 120], torso: 180, arm: { to: [137, 90], bend: 'down' }, arm2: [10, 40], leg: { to: [50, 180], bend: 'down', foot: 60 }, leg2: { to: [122, G], bend: 'front' } },
    end: { at: ['hip', 100, 130], torso: 180, arm: { to: [137, 90], bend: 'down' }, arm2: [10, 40], leg: { to: [50, 180], bend: 'down', foot: 60 }, leg2: { to: [122, G], bend: 'front' } },
    props: [wall(140)],
    labels: ['Split stance', 'Shift forward'],
  },
  couch_stretch: {
    // Back shin up the wall, top of the foot against it.
    start: { at: ['knee', 47, 184], torso: 128, arm: { to: [103, 147], bend: 'down' }, leg: [-22, 180, 180], leg2: { to: [110, G], bend: 'up' } },
    end: { at: ['knee', 47, 184], torso: 180, arm: [10, 40], leg: [-8, 180, 180], leg2: { to: [110, G], bend: 'up' } },
    props: [wall(40, 100), kneePad],
    labels: ['Lean forward', 'Lift the chest'],
  },
  standing_quad_stretch: {
    start: { at: ['ankle2', 100, G], torso: 180, arm: [0, 0], arm2: { to: [140, 92], bend: 'down' }, leg: [0, 0], leg2: [0, 0] },
    end: { at: ['ankle2', 100, G], torso: 180, arm: { to: [87.2, 114], bend: 'back' }, arm2: { to: [140, 92], bend: 'down' }, leg: [-10, -170, -150], leg2: [0, 0] },
    props: [wall(143)],
    labels: ['Hold the wall', 'Heel to seat'],
  },

  // ── Hamstrings ──
  hamstring_stretch: {
    // Lying in a doorway: the raised heel rests on the frame, the other leg lies flat through the door.
    start: { at: ['hip', 98, 180], torso: -90, arm: [90, 90], leg: [154.4, 154.4, 244.4], leg2: [90, 90, 180] },
    end: { at: ['hip', 114, 180], torso: -90, arm: [90, 90], leg: [165.9, 165.9, 255.9], leg2: [90, 90, 180] },
    props: [wall(132, 30)],
    labels: ['Heel on the frame', 'Slide closer'],
  },
  standing_hamstring: {
    start: { at: ['hip', 90, 116], torso: 178, arm: [0, 0], leg: { to: [134, 174], bend: 'up', foot: 160 }, leg2: { to: [92, G], bend: 'front' } },
    end: { at: ['hip', 90, 116], torso: 125, arm: { to: [113, 137], bend: 'back' }, leg: { to: [134, 174], bend: 'up', foot: 160 }, leg2: { to: [92, G], bend: 'front' } },
    props: [{ t: 'pad', a: [128, 181], b: [160, 181], w: 10 }],
    labels: ['Heel on a step', 'Hinge forward'],
  },

  // ── Glutes and inner thighs ──
  figure_four: {
    // The near ankle crosses over the far knee; then the far thigh is pulled in.
    start: backLie({ leg: { to: [126, 147], bend: 'up' }, leg2: [141, 10] }),
    end: backLie({ arm: { to: [94, 154], bend: 'down' }, leg: { to: [96, 150], bend: 'front' }, leg2: [-160, 95, 175] }),
    labels: ['Cross the ankle', 'Pull the thigh in'],
  },
  seated_figure_four: {
    // The near ankle rests on the far knee, so the near leg makes the "4".
    start: { at: ['hip', 86, 150], torso: 180, arm: { to: [110, 128], bend: 'down' }, leg: { to: [124, 144], bend: 'up' }, leg2: [90, 0] },
    end: { at: ['hip', 86, 150], torso: 145, arm: { to: [124, 146], bend: 'down' }, leg: { to: [124, 144], bend: 'up' }, leg2: [90, 0] },
    props: [{ t: 'pad', a: [64, 158], b: [104, 158] }, { t: 'line', a: [66, 156], b: [66, 102] }, { t: 'line', a: [70, 162], b: [70, 190] }, { t: 'line', a: [98, 162], b: [98, 190] }],
    labels: ['Ankle on knee', 'Lean forward'],
  },
  ninety_ninety: {
    // Seen from above: hands behind on the floor, both knees bent 90°, then both swing to the other side.
    start: { view: 'front', at: ['hip', 108, 112], bend: 0.3, arm: [125, 140], reach: 0.6, leg: [0, -90], leg2: [-90, 180] },
    end: { view: 'front', at: ['hip', 108, 112], bend: 0.3, arm: [125, 140], reach: 0.6, leg: [90, 180], leg2: [0, 90] },
    noFloor: true,
    labels: ['From above', 'Switch sides'],
  },
  adductor_rockback: {
    // Seen from the front so the straight leg out to the side shows. One frame: the rock back
    // happens toward and away from the viewer, which this view can't show.
    start: { view: 'front', at: ['knee2', 96, 184], bend: 0.2, arm: [6, 6], leg: [57, 57], leg2: [8, -176] },
    labels: ['Leg out, rock back'],
  },
  side_lunge_stretch: {
    start: { view: 'front', at: ['ankle2', 57, G], arm: [30, -60], leg: [28, 28], leg2: [-28, -28] },
    end: { view: 'front', at: ['ankle2', 57, G], arm: [30, -60], leg: [55.6, -16.5], leg2: [-40.8, -40.8] },
    labels: ['Wide stance', 'Sit into one hip'],
  },

  // ── Calves and ankles ──
  calf_stretch: {
    start: { at: ['hip', 101, 122], torso: 160, arm: { to: [159, 84], bend: 'down' }, leg: { to: [64, G], bend: 'front' }, leg2: { to: [128, G], bend: 'front' } },
    end: { at: ['hip', 98, 130], torso: 165, arm: { to: [159, 84], bend: 'down' }, leg: { to: [64, G], bend: 'front' }, leg2: { to: [128, G], bend: 'front' } },
    props: [wall(162)],
    labels: ['Straight knee', 'Bent knee'],
  },
  knee_to_wall: {
    start: { at: ['ankle', 136, G], torso: 180, arm: { to: [157, 96], bend: 'down' }, leg: [30, -5], leg2: { to: [84, 180], bend: 'down', foot: 60 } },
    end: { at: ['ankle', 136, G], torso: 180, arm: { to: [157, 96], bend: 'down' }, leg: [45, -38], leg2: { to: [84, 180], bend: 'down', foot: 60 } },
    props: [wall(160)],
    labels: ['Foot near the wall', 'Knee to the wall'],
  },
}

export const FORM_MOBILITY_LOWER: Record<string, FormGuide> = {
  // ── Lower back ──
  cat_cow: {
    setup: ['Hands under your shoulders, knees under your hips.', 'Start with a flat back and your neck long.'],
    execution: ['Breathe out and round your back up toward the ceiling, letting your head and tailbone drop.', 'Breathe in and let your belly sink as your chest and tailbone lift; look slightly forward.', 'Move slowly between the two, 8 times, for 2 rounds.'],
    breathing: 'Breathe out as you round up, in as you sink and lift.',
    mistakes: ['Rushing or jerking between the positions.', 'Throwing your head back or arching hard.', 'Moving only the neck instead of the whole back.'],
    easier: 'Smaller movements, or sit on a chair with your hands on your knees.',
    harder: 'Move one part of the back at a time, and pause for a breath at each end.',
    stretches: [],
  },
  knees_to_chest: {
    setup: ['Lie on your back with your knees bent and feet flat.'],
    execution: ['Bring one knee, then the other, up toward your chest.', 'Hold behind your thighs or just below your knees and gently draw them in.', 'Let your lower back and shoulders sink into the floor; hold 30–60 s, twice.'],
    breathing: 'Breathe slowly; let your lower back soften each time you breathe out.',
    mistakes: ['Pulling hard or bouncing.', 'Lifting your head and shoulders off the floor.', 'Holding your breath.'],
    easier: 'One knee at a time, with the other foot on the floor.',
    harder: 'Hold for the full minute and rock gently from side to side.',
    stretches: [],
  },
  pelvic_tilt: {
    setup: ['Lie on your back, knees bent, feet flat and hip-width apart.', 'Arms by your sides; notice the small gap under your lower back.'],
    execution: ['Gently tighten your belly and tuck your tailbone so your lower back presses into the floor.', 'Hold for 2–3 s; your seat stays on the floor.', 'Relax back to the start. Do 10 slow tilts, for 2 rounds.'],
    breathing: 'Breathe out as you flatten your back, in as you relax.',
    mistakes: ['Lifting your seat into a bridge.', 'Pushing hard with your legs instead of using your belly.', 'Holding your breath.'],
    easier: 'Make the movement smaller, with a hand under your lower back to feel it.',
    harder: 'Hold each tilt for 5 s, or do it standing with your back against a wall.',
    stretches: [],
  },

  // ── Hip flexors and quads ──
  hip_flexor_stretch: {
    setup: ['Kneel on one knee on a pad, the other foot flat in front with that knee bent about 90°.', 'Back knee under your hip, body upright.'],
    execution: ['Tuck your tailbone under and squeeze the glute of the kneeling leg.', 'Shift your hips forward a little until you feel a mild stretch at the front of that hip.', 'Stay tall and hold 30–60 s; do 2 on each side.'],
    breathing: 'Breathe slowly; let the hip ease forward a little as you breathe out.',
    mistakes: ['Arching your lower back instead of tucking.', 'Leaning your chest forward.', 'Letting the front knee fall inward.'],
    easier: 'Hold a chair or wall for balance and shift forward less.',
    harder: 'Reach the arm on the kneeling side overhead and lean gently away from it.',
    stretches: [],
  },
  standing_hip_flexor: {
    setup: ['Face a wall and rest one hand on it.', 'Take a long step back with one foot: back heel up, front knee soft.'],
    execution: ['Tuck your tailbone and squeeze the glute of the back leg.', 'Bend the front knee and shift your hips forward until the front of the back hip stretches.', 'Stay tall and hold 30–60 s; do 2 on each side.'],
    breathing: 'Breathe slowly and steadily through the hold.',
    mistakes: ['Arching your lower back.', 'A stance so short you feel nothing.', 'Leaning your chest forward.'],
    easier: 'Shorter stance and a smaller shift.',
    harder: 'Raise the arm on the back-leg side overhead.',
    stretches: [],
  },
  couch_stretch: {
    setup: ['Kneel with your back to a wall or sofa, a pad under one knee.', 'Slide that knee close to the wall with the shin up against it, and put the other foot flat in front.'],
    execution: ['Start leaning forward with your hands on your front knee.', 'Tuck your tailbone, squeeze the back glute and slowly lift your chest.', 'Stop at a strong but comfortable stretch at the front of the back thigh; hold 30–60 s, 2 on each side.'],
    breathing: 'Breathe slowly; don’t hold your breath as the stretch builds.',
    mistakes: ['Arching your lower back to sit up.', 'Forcing it until the knee hurts.', 'Front knee falling inward.'],
    easier: 'Move the knee further from the wall, or keep your hands on the front knee.',
    harder: 'Bring the knee closer to the wall and sit fully upright.',
    stretches: [],
  },
  standing_quad_stretch: {
    setup: ['Stand tall and hold a wall with one hand.'],
    execution: ['Bend one knee and hold that ankle behind you with your free hand.', 'Draw the heel toward your seat with your knees side by side and the knee pointing down.', 'Tuck your tailbone a little to feel more at the front of the thigh; hold 30–60 s, 2 on each side.'],
    breathing: 'Breathe evenly through the hold.',
    mistakes: ['Arching your lower back.', 'Knee drifting forward or out to the side.', 'Yanking the heel hard into your seat.'],
    easier: 'Loop a towel around the ankle if you can’t reach it, or lie on your side.',
    harder: 'Tuck your tailbone more and ease the knee slightly back.',
    stretches: [],
  },

  // ── Hamstrings ──
  hamstring_stretch: {
    setup: ['Lie on your back in a doorway, hips just in front of the frame.', 'Rest one heel up on the frame; the other leg lies flat through the door.'],
    execution: ['Keep the raised knee straight but not locked.', 'Slide your hips closer to the frame until you feel a mild stretch at the back of the thigh.', 'Hold 30–60 s, then switch legs; 2 on each side.'],
    breathing: 'Breathe slowly and let the leg relax as you breathe out.',
    mistakes: ['Bending the knee to get the leg higher.', 'Letting the flat leg lift or roll out.', 'Pushing into pain or bouncing.'],
    easier: 'Move further from the frame, or use a towel around the foot instead.',
    harder: 'Slide closer, or gently pull your toes toward you.',
    stretches: [],
  },
  standing_hamstring: {
    setup: ['Stand facing a low step or stair.', 'Rest one heel on it with that leg straight and toes up; standing knee soft.'],
    execution: ['Rest your hands on your thigh and keep your back flat.', 'Hinge forward from the hips until the back of the raised thigh stretches.', 'Hold 30–60 s, then switch; 2 on each side.'],
    breathing: 'Breathe slowly; hinge a touch further as you breathe out if it feels fine.',
    mistakes: ['Rounding your back to reach your toes.', 'Using a step that is too high.', 'Locking the raised knee hard.'],
    easier: 'Use a lower step and hinge less.',
    harder: 'Pull your toes back toward you to add the calf.',
    stretches: [],
  },

  // ── Glutes and inner thighs ──
  figure_four: {
    setup: ['Lie on your back with your knees bent and feet flat.', 'Cross one ankle over the other knee and let the top knee open out.'],
    execution: ['Lift the bottom foot and hold behind that thigh, one hand through the gap.', 'Gently pull the thigh toward your chest until the buttock of the crossed leg stretches.', 'Hold 30–60 s, then switch; 2 on each side.'],
    breathing: 'Breathe slowly and let the hip relax as you breathe out.',
    mistakes: ['Lifting your head and shoulders to pull harder.', 'Rolling your hips to one side.', 'Pulling into pain.'],
    easier: 'Keep the bottom foot on the floor.',
    harder: 'Draw the crossed knee gently toward the opposite shoulder as you pull.',
    stretches: [],
  },
  seated_figure_four: {
    setup: ['Sit tall near the front of a sturdy chair, feet flat.', 'Rest one ankle on the opposite knee and let the top knee drop out.'],
    execution: ['Keep your back long and lean forward from the hips.', 'Stop when you feel a mild stretch in the buttock of the crossed leg.', 'Hold 30–60 s, then switch; 2 on each side.'],
    breathing: 'Breathe evenly; lean a little further as you breathe out if it feels fine.',
    mistakes: ['Rounding your back to lean further.', 'Pushing hard on the top knee.', 'Forcing the ankle up if your knee complains.'],
    easier: 'Sit upright without leaning, or rest the ankle lower on the shin.',
    harder: 'Lean further, bringing your chest toward the shin.',
    stretches: [],
  },
  ninety_ninety: {
    setup: ['Sit on the floor with your hands on the floor behind you.', 'Bend both knees to about 90°: one leg in front of you, the other out to the side.'],
    execution: ['Lift both knees and swing them over to the other side, so the legs swap places.', 'Sit up tall for a breath in the new position.', 'Switch back and forth slowly, 6 times each side, for 2 rounds.'],
    breathing: 'Breathe out as the knees swing over, in as you settle.',
    mistakes: ['Dropping into the position instead of lowering slowly.', 'Slumping back onto your hands.', 'Forcing the knees down if your hips or knees complain.'],
    easier: 'Lean back more on your hands, feet wider, and only swing part way.',
    harder: 'Do it without your hands, or lean over the front shin for a breath on each side.',
    stretches: [],
  },
  adductor_rockback: {
    setup: ['Start on your hands and knees.', 'Straighten one leg out to the side with the foot flat and toes forward.'],
    execution: ['Keep your back flat and rock your hips back toward your heels.', 'Stop when the inner thigh of the straight leg stretches; pause a moment.', 'Rock forward again. Do 8 on each side, for 2 rounds.'],
    breathing: 'Breathe out as you rock back, in as you come forward.',
    mistakes: ['Rounding your back as you rock.', 'Letting the straight leg’s foot roll onto its edge.', 'Rocking so far that it pulls sharply.'],
    easier: 'Rock back less, with the straight leg a little closer in.',
    harder: 'Move the straight leg further out, or pause for 2 s at the back.',
    stretches: [],
  },
  side_lunge_stretch: {
    setup: ['Stand with your feet wide apart, toes forward or turned out slightly.'],
    execution: ['Bend one knee and sit back into that hip, keeping the other leg straight.', 'Keep both feet flat and your chest up.', 'Stop when the inner thigh of the straight leg stretches; hold 30 s, 2 on each side.'],
    breathing: 'Breathe evenly through the hold.',
    mistakes: ['Bent knee caving inward.', 'Heel of the bent leg lifting.', 'Rounding your back.'],
    easier: 'Narrower stance and less bend, with a hand on a chair.',
    harder: 'Wider stance and sit lower.',
    stretches: [],
  },

  // ── Calves and ankles ──
  calf_stretch: {
    setup: ['Face a wall with your hands on it.', 'Step one foot back, toes pointing forward and heel down.'],
    execution: ['With the back knee straight, lean in until the upper calf stretches; hold 30–60 s.', 'Then bend the back knee a little, heel still down, to feel it lower in the calf; hold again.', 'Do 2 rounds on each leg.'],
    breathing: 'Breathe slowly and let the calf relax as you breathe out.',
    mistakes: ['Back heel lifting.', 'Back foot turned out.', 'Bouncing.'],
    easier: 'Take a shorter step back.',
    harder: 'Step further back, or lower the heel off the edge of a step.',
    stretches: [],
  },
  knee_to_wall: {
    setup: ['Face a wall with your hands on it.', 'Put one foot a few centimetres from the wall, the other foot behind you.'],
    execution: ['Keep the front heel down and push that knee forward to touch the wall.', 'Come back, and move the foot a little further away once it gets easy.', 'Do 10 touches on each side, for 2 rounds.'],
    breathing: 'Breathe out as the knee goes forward, in as it comes back.',
    mistakes: ['Front heel lifting.', 'Knee falling inward instead of moving over the toes.', 'Bouncing the knee into the wall.'],
    easier: 'Keep the foot closer to the wall.',
    harder: 'Move the foot further from the wall, or hold each touch for 2 s.',
    stretches: [],
  },
}

const QUADS: HeadId[] = ['rectus_femoris', 'vastus_lateralis', 'vastus_medialis', 'vastus_intermedius']
const HAMS: HeadId[] = ['biceps_femoris', 'semis']

export const HEADS_MOBILITY_LOWER: Record<string, HeadSpec> = {
  // ── Lower back ──
  cat_cow: { prime: ['erectors', 'rectus_abdominis'], assist: ['obliques', 'transverse_abdominis'], stabilize: ['serratus', 'delt_front'], note: 'The abs round the spine and the back muscles arch it, in turn.' },
  knees_to_chest: { prime: ['erectors', 'glute_max'], assist: ['hip_flexors', 'forearms'], note: 'The arms do the pulling so the lower back can relax.' },
  pelvic_tilt: { prime: ['rectus_abdominis', 'transverse_abdominis'], assist: ['obliques', 'glute_max'], note: 'The abs tilt the pelvis while the lower back muscles lengthen.' },
  // ── Hip flexors and quads ──
  hip_flexor_stretch: { prime: ['hip_flexors', 'rectus_femoris'], assist: ['glute_max'], stabilize: ['transverse_abdominis', 'glute_med'], note: 'Squeezing the back glute lets the front of the hip lengthen without arching.' },
  standing_hip_flexor: { prime: ['hip_flexors'], assist: ['glute_max'], stabilize: ['glute_med', 'transverse_abdominis'], note: 'The straighter back knee puts more of the stretch in the deep hip flexor.' },
  couch_stretch: { prime: ['rectus_femoris', 'hip_flexors'], assist: ['glute_max'], stabilize: ['transverse_abdominis', 'rectus_abdominis'], note: 'Knee fully bent and hip straight: the rectus femoris is stretched at both ends.' },
  standing_quad_stretch: { prime: QUADS, assist: ['glute_max'], stabilize: ['glute_med', 'foot_ankle'], note: 'Tucking the tailbone moves the stretch up into the rectus femoris.' },
  // ── Hamstrings ──
  hamstring_stretch: { prime: HAMS, assist: [], note: 'The door frame holds the leg up, so the hamstrings can relax into the stretch.' },
  standing_hamstring: { prime: [...HAMS, 'gastrocnemius'], assist: ['erectors'], stabilize: ['glute_med'], note: 'A flat back keeps the stretch in the hamstrings; toes up adds the calf.' },
  // ── Glutes and inner thighs ──
  figure_four: { prime: ['glute_max', 'hip_rotators'], assist: ['hip_flexors', 'forearms'], note: 'Reaches the deep rotators, such as the piriformis, as well as the main glute.' },
  seated_figure_four: { prime: ['glute_max', 'hip_rotators'], assist: ['erectors'], note: 'Leaning from the hips deepens it; rounding the back only bends the spine.' },
  ninety_ninety: { prime: ['hip_rotators', 'glute_med'], assist: ['tfl', 'adductors', 'glute_max'], stabilize: ['obliques', 'erectors'], note: 'Each switch turns one hip outward and the other inward.' },
  adductor_rockback: { prime: ['adductors'], assist: ['transverse_abdominis', 'erectors'], stabilize: ['delt_front', 'serratus'], note: 'A flat back keeps the stretch in the inner thigh.' },
  side_lunge_stretch: { prime: ['adductors'], assist: ['vastus_lateralis', 'vastus_medialis', 'glute_max'], stabilize: ['erectors', 'foot_ankle'], note: 'The bent leg holds you up while the straight leg’s inner thigh stretches.' },
  // ── Calves and ankles ──
  calf_stretch: { prime: ['gastrocnemius', 'soleus'], assist: [], note: 'Straight knee: mostly the upper calf; bent knee: the lower calf (soleus).' },
  knee_to_wall: { prime: ['tibialis', 'soleus'], assist: ['foot_ankle'], stabilize: ['glute_med'], note: 'The shin glides forward over the foot; a tight soleus is what usually stops it.' },
}
