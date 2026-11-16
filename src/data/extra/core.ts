// Diagrams, form guides and muscle heads for the abs (core) and glute exercises (see ../exercises.ts).
// Diagram coordinates follow src/lib/pose.ts: 200 × 200 frames, floor at y = 190, a flat foot's
// ankle at y = 186, angles absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { HeadId, HeadSpec } from '../exercises'
import type { FormGuide } from '../form'

const G = 186

// Helpers copied from ../diagrams.ts (importing it would make a cycle).
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
const tower = (x: number, top = 10): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })

// Lying on the back, head to the left, knees bent and feet flat; the hips stay put.
const crunchLie = (torso: number, arm: SidePose['arm'], head = 0): SidePose => ({ at: ['hip', 104, 180], torso, head, arm, leg: { to: [146, G], bend: 'up' } })
// On hands and knees, seen from the side: the far knee stays planted.
const allFours = (extra: Partial<SidePose> = {}): SidePose => ({ at: ['knee2', 88, 184], torso: 102, arm: [0, 0], leg: [0, -90, -90], ...extra })
// Arms folded across the chest, whatever the torso angle.
const folded = (torso: number): [number, number] => [torso + 190, torso - 15]
// Back extension: hips on an angled pad, feet on a plate; only the torso moves.
const backExt = (torso: number): SidePose => ({ at: ['ankle', 40, 168], torso, arm: folded(torso), leg: [-45, -45, 45] })
// Front view, feet a little wider than the hips.
const frontStand = (arm: [number, number], arm2?: [number, number], extra: object = {}) =>
  ({ view: 'front' as const, at: ['ankle', 110, G] as ['ankle', number, number], arm, arm2, leg: [9, 0] as [number, number], ...extra })

export const DIAGRAMS_CORE: Record<string, Diagram> = {
  // ── Abs ──
  crunch: {
    start: crunchLie(-90, [96, 96]),
    end: crunchLie(-122, [106, 106], -15),
  },
  reverse_crunch: {
    start: { at: ['shoulder', 58, 180], torso: -90, arm: [90, 90], leg: [180, 90, 180] },
    end: { at: ['shoulder', 58, 180], torso: -70, head: -20, arm: [90, 90], leg: [-150, 140, 140] },
  },
  side_plank: {
    // Seen from the front: the body is one slanted line, the top arm points at the ceiling.
    start: { at: ['shoulder', 140, 158], torso: 125, arm: [0, 90], arm2: [180, 180], leg: [-90, -90, 90] },
    end: { at: ['shoulder', 140, 158], torso: 104, arm: [0, 90], arm2: [180, 180], leg: [-76, -76, 90] },
    labels: ['Set up', 'Hold'],
  },
  bird_dog: {
    // The far arm reaches forward while the near leg reaches back (opposite arm and leg).
    start: allFours({ arm2: [0, 0], leg2: [0, -90, -90] }),
    end: allFours({ arm2: [90, 90], leg: [-86, -86, 0], leg2: [0, -90, -90] }),
  },
  pallof: {
    // Facing you, side-on to the anchor: the hands press straight out toward you.
    start: frontStand([12, -140]),
    end: frontStand([-40, -40], undefined, { reach: 0.28 }),
    props: [tower(14, 40), { t: 'cable', from: [14, 76], to: 'hand2' }, { t: 'bar', at: 'hand2' }],
  },
  woodchop: {
    start: frontStand([180, 110], [125, 125]),
    end: frontStand([-45, -50], [-5, -60]),
    props: [tower(188, 16), { t: 'cable', from: [188, 20], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  farmer_carry: {
    start: stand(100),
    end: { at: ['hip', 100, 118], torso: 180, arm: [-6, -4], arm2: [6, 4], leg: { to: [124, G], bend: 'front' }, leg2: { to: [76, 183], bend: 'front', foot: 60 } },
    props: [{ t: 'db', at: 'hand' }, { t: 'db', at: 'hand2' }],
    labels: ['Stand tall', 'Walk'],
  },
  ab_wheel: {
    start: { at: ['knee', 60, 184], torso: 112, arm: { to: [100, 181], bend: 'back' }, leg: [25, -90, -90] },
    end: { at: ['knee', 60, 184], torso: 96, arm: { to: [178, 181], bend: 'up' }, leg: [-60, -90, -90] },
    props: [{ t: 'roller', at: 'hand', r: 7 }],
  },
  trx_fallout: {
    // Facing away from a high anchor; the body stays straight and pivots on the feet.
    start: { at: ['ankle', 60, G], torso: 165, arm: [100, 100], leg: [-15, -15] },
    end: { at: ['ankle', 60, G], torso: 140, arm: [150, 150], leg: [-40, -40] },
    props: [{ t: 'line', a: [36, 8], b: [80, 8] }, { t: 'cable', from: [58, 10], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },

  // ── Glutes ──
  back_ext: {
    start: backExt(35),
    end: backExt(135),
    props: [
      { t: 'pad', a: [98, 118], b: [81, 135], w: 8 }, { t: 'line', a: [88, 130], b: [88, 190] },
      { t: 'pad', a: ['heel', -4, 4], b: ['toe', -4, 4], w: 5 }, { t: 'roller', at: ['ankle', -5, -5], r: 4 },
      { t: 'line', a: ['toe', -4, 4], b: [45, 190] },
    ],
  },
  cable_kickback: {
    start: { at: ['ankle2', 110, G], torso: 165, arm: { to: [158, 92], bend: 'down' }, leg: [3, 0], leg2: [0, 0] },
    end: { at: ['ankle2', 110, G], torso: 165, arm: { to: [158, 92], bend: 'down' }, leg: [-35, -25, 30], leg2: [0, 0] },
    props: [tower(162, 30), { t: 'bar', at: [160, 92] }, { t: 'cable', from: [162, 182], to: 'ankle' }],
  },
  band_walk: {
    // Facing you in a half squat; the right foot steps out against the band.
    start: { view: 'front', at: ['ankle2', 88, G], bend: 0.92, arm: [35, -55], leg: [10, 3] },
    end: { view: 'front', at: ['ankle2', 88, G], bend: 0.92, arm: [35, -55], leg: [24, 12], leg2: [-10, -3] },
    props: [{ t: 'band', from: ['knee2', 0, -6], to: ['knee', 0, -6] }],
  },
  clamshell: {
    // Lying on one side, seen from the front: feet stay together while the top knee opens.
    start: { at: ['hip', 104, 178], torso: -90, arm: [100, 80], arm2: [-84, -88], leg: [98, 80], leg2: [98, 80] },
    end: { at: ['hip', 104, 178], torso: -90, arm: [100, 80], arm2: [-84, -88], leg: [120, 60], leg2: [98, 80] },
    props: [{ t: 'band', from: ['knee2', -6, 0], to: ['knee', -6, 0] }],
  },
}

export const FORM_CORE: Record<string, FormGuide> = {
  crunch: {
    setup: ['Lie on your back, knees bent, feet flat and hip-width.', 'Hands lightly by your ears or crossed on your chest.'],
    execution: ['Curl your head and shoulders off the floor, ribs toward your hips.', 'Lift until your shoulder blades just clear the floor; pause 1 s.', 'Lower slowly over 2 s.'],
    breathing: 'Out as you curl up, in as you lower.',
    mistakes: ['Pulling on your head or neck.', 'Sitting all the way up with the hip flexors.', 'Bouncing off the floor.'],
    easier: 'Smaller range, arms reaching toward your knees.',
    harder: 'Hold a weight on your chest, or a 3 s lowering.',
    stretches: ['cobra'],
  },
  reverse_crunch: {
    setup: ['Lie on your back, arms by your sides, palms down.', 'Lift your legs so hips and knees are bent at 90°.'],
    execution: ['Curl your hips up off the floor, knees toward your chest.', 'Think of rolling your tailbone up, not swinging your legs.', 'Lower your hips slowly back down; keep the knees bent.'],
    breathing: 'Out as your hips curl up, in as they lower.',
    mistakes: ['Swinging the legs for momentum.', 'Pushing hard with your hands.', 'Dropping the hips fast.'],
    easier: 'Smaller curl, or feet resting on a bench.',
    harder: 'Slower lowering, or on a decline bench.',
    stretches: ['cobra', 'childs_pose'],
  },
  side_plank: {
    setup: ['Lie on your side, elbow under your shoulder, forearm on the floor.', 'Legs straight and stacked, or knees bent to make it easier.'],
    execution: ['Lift your hips until your body is straight from head to feet.', 'Hold with hips forward, not sagging or pushed back.', 'Start with 10-20 s each side; build to 30-45 s.'],
    breathing: 'Breathe steadily the whole hold; don\'t hold your breath.',
    mistakes: ['Hips sagging toward the floor.', 'Rolling forward or back.', 'Shoulder shrugged up to your ear.'],
    easier: 'Knees bent and down, or hands on a bench.',
    harder: 'Lift the top leg, or reach the top arm under and back.',
    stretches: ['childs_pose', 'figure4_glute'],
  },
  bird_dog: {
    setup: ['Hands under shoulders, knees under hips.', 'Back flat, head in line with your spine.'],
    execution: ['Reach one arm forward and the opposite leg back until both are level with your body.', 'Keep your back and hips still; pause 2-3 s.', 'Return slowly and switch sides.'],
    breathing: 'Out as you reach, in as you return.',
    mistakes: ['Arching your low back as the leg lifts.', 'Hips twisting open.', 'Rushing the reps.'],
    easier: 'Move just the arm or just the leg.',
    harder: 'Longer pauses, or draw elbow to knee between reps.',
    stretches: ['childs_pose', 'hip_flexor_kneeling'],
  },
  pallof: {
    setup: ['Cable or band at chest height; stand side-on to it.', 'Hold the handle at your chest with both hands; step out until it pulls.', 'Feet hip-width, knees soft.'],
    execution: ['Press the handle straight out in front of your chest.', 'Hold 2 s without letting it turn you toward the anchor.', 'Bring it back to your chest slowly; do both sides.'],
    breathing: 'Out as you press, in as you return.',
    mistakes: ['Letting your hips or shoulders turn.', 'Leaning away from the anchor.', 'Too much load to hold still.'],
    easier: 'Lighter load, or stand closer to the anchor.',
    harder: 'Step further out, longer holds, or a half-kneeling stance.',
    stretches: ['childs_pose'],
  },
  woodchop: {
    setup: ['High pulley with a handle; stand side-on to it.', 'Feet a little wider than your hips, both hands on the handle.'],
    execution: ['Pull the handle down and across your body to the opposite hip.', 'Turn your hips, chest and shoulders together; pivot the back foot.', 'Return slowly to the top.'],
    breathing: 'Out as you chop down, in as you return.',
    mistakes: ['Twisting only from the low back.', 'Pulling with your arms.', 'Going too heavy and jerking it.'],
    easier: 'Lighter load and a smaller turn.',
    harder: 'Slower return, or low-to-high from a half-kneel.',
    stretches: ['childs_pose', 'cobra'],
  },
  farmer_carry: {
    setup: ['Heavy dumbbells or kettlebells at your sides.', 'Lift them with a flat back, then stand tall.'],
    execution: ['Shoulders down and back, ribs down, eyes forward.', 'Walk with short, steady steps without leaning or swaying.', 'Go 20-40 m or 30-60 s, rest, repeat.'],
    breathing: 'Breathe steadily as you walk; brace without holding your breath.',
    mistakes: ['Leaning to one side or back.', 'Shrugging the weights up.', 'Long, rushed steps.'],
    safety: { text: 'Keep breathing; breath-holding adds a lot to the blood-pressure rise during hard efforts.', sources: ['pm_7741618'] },
    easier: 'Lighter weights or a shorter walk.',
    harder: 'Heavier weights, or one weight only (suitcase carry).',
    stretches: ['lat_90'],
  },
  ab_wheel: {
    setup: ['Kneel on a pad, wheel on the floor under your shoulders.', 'Brace and tuck your pelvis slightly; arms straight.'],
    execution: ['Roll forward slowly, hips and shoulders moving together.', 'Stop before your low back starts to sag.', 'Pull back with your abs, not by sitting your hips back.'],
    breathing: 'In as you roll out, out as you pull back.',
    mistakes: ['Low back sagging at the far end.', 'Hips staying back while only the arms go forward.', 'Rolling out further than you can control.'],
    safety: { text: 'Rollouts also work the hip flexors hard, which may not suit some people with low back problems; a plank or dead bug is gentler.', sources: ['pm_16649890'] },
    easier: 'Short range, or roll toward a wall to stop.',
    harder: 'Longer range, slower tempo, or from your feet.',
    stretches: ['cobra', 'hip_flexor_kneeling'],
  },
  trx_fallout: {
    setup: ['Straps to mid length; face away from the anchor.', 'Hold the handles, arms straight in front; walk your feet back to lean.', 'Body straight, glutes squeezed.'],
    execution: ['Let your arms rise forward and overhead as your body tips forward.', 'Stop before your low back sags.', 'Pull your arms back down to bring your body up.'],
    breathing: 'In as you fall out, out as you pull back.',
    mistakes: ['Hips sagging or piking.', 'Bending the elbows.', 'Going further than you can control.'],
    easier: 'Stand more upright, or a smaller arm range.',
    harder: 'Walk your feet back, or pause 2 s at the far end.',
    stretches: ['cobra', 'lat_90'],
  },
  back_ext: {
    setup: ['Set the pad just below your hip crease so you can bend at the hips.', 'Heels under the rollers; arms crossed on your chest.'],
    execution: ['Hinge down with a flat back until you feel the hamstrings stretch.', 'Squeeze your glutes to lift until your body is in a straight line.', 'Pause 1 s; lower slowly.'],
    breathing: 'In on the way down, out on the way up.',
    mistakes: ['Arching past a straight line at the top.', 'Rounding hard at the bottom.', 'Swinging up fast.'],
    easier: 'Smaller range, or hands by your sides.',
    harder: 'Hold a plate on your chest, or one leg at a time.',
    stretches: ['hamstring_supine', 'figure4_glute'],
  },
  cable_kickback: {
    setup: ['Ankle strap on a low pulley; face the machine.', 'Hold the frame and hinge forward slightly; standing knee soft.'],
    execution: ['Push the strapped leg back from the hip until it lines up with your body.', 'Squeeze the glute for 1 s.', 'Return slowly to the start.'],
    breathing: 'Out as the leg goes back, in as it returns.',
    mistakes: ['Arching your low back to get the leg higher.', 'Swinging the leg.', 'Twisting the hips open.'],
    easier: 'Lighter load or a smaller range.',
    harder: 'Slower return, or a longer pause at the back.',
    stretches: ['figure4_glute', 'hip_flexor_kneeling'],
  },
  band_walk: {
    setup: ['Mini band just above your knees.', 'Feet hip-width, half-squat, chest up.'],
    execution: ['Step sideways, pushing your knee out against the band.', 'Bring the other foot in, keeping the band taut.', 'Take 10-15 steps each way, staying low.'],
    breathing: 'Breathe steadily with each step.',
    mistakes: ['Knees caving in.', 'Standing up tall between steps.', 'Rocking your body side to side.'],
    easier: 'Lighter band, or a smaller squat.',
    harder: 'Band at the ankles, or a stronger band.',
    stretches: ['figure4_glute'],
  },
  clamshell: {
    setup: ['Lie on your side, hips and knees bent about 45-90°.', 'Mini band just above your knees; head on your arm, hips stacked.'],
    execution: ['Keep your feet together and lift the top knee.', 'Open only as far as you can without rolling back.', 'Pause 1 s; lower slowly. Do both sides.'],
    breathing: 'Out as the knee opens, in as it closes.',
    mistakes: ['Rolling your hips back.', 'Feet coming apart.', 'Rushing the reps.'],
    easier: 'No band, or a smaller range.',
    harder: 'Stronger band, or lift the feet too.',
    stretches: ['figure4_glute'],
  },
}

const CORE: HeadId[] = ['rectus_abdominis', 'transverse_abdominis']
const HAMS: HeadId[] = ['biceps_femoris', 'semis']

export const HEADS_CORE: Record<string, HeadSpec> = {
  // ── Abs: curling the spine ──
  cable_crunch: { prime: ['rectus_abdominis'], assist: ['obliques'], note: 'Hips stay still so the abs, not the hip flexors, do the curling.' },
  crunch: { prime: ['rectus_abdominis'], assist: ['obliques'], note: 'A short curl keeps the work on the abs rather than the hip flexors.' },
  reverse_crunch: { prime: ['rectus_abdominis'], assist: ['obliques'], stabilize: ['hip_flexors'], note: 'Curls the pelvis up from the bottom; it is the same six-pack muscle, not a separate "lower abs".' },
  hanging_raise: { prime: ['hip_flexors', 'rectus_abdominis'], assist: ['obliques'], stabilize: ['forearms', 'lats'], note: 'The hip flexors lift the legs; the abs work hardest when the pelvis curls up too.' },
  leg_raise: { prime: ['hip_flexors', 'rectus_abdominis'], assist: ['obliques'], stabilize: ['transverse_abdominis'], note: 'The hip flexors lift the legs while the abs stop the low back arching.' },
  // ── Abs: resisting arching (anti-extension) ──
  plank: { prime: CORE, assist: ['obliques'], stabilize: ['glute_max', 'delt_front', 'serratus'] },
  dead_bug: { prime: CORE, assist: ['obliques'], stabilize: ['hip_flexors'], note: 'The abs keep the low back down while the limbs move.' },
  ab_wheel: { prime: CORE, assist: ['obliques', 'lats'], stabilize: ['hip_flexors', 'delt_front', 'triceps_long'], note: 'One of the hardest anti-arching moves; the lats pull you back in.' },
  trx_fallout: { prime: CORE, assist: ['obliques', 'lats'], stabilize: ['delt_front', 'serratus', 'glute_max'], note: 'Like an ab-wheel rollout, standing; the more you lean, the harder it gets.' },
  bird_dog: { prime: ['erectors', 'obliques'], assist: ['glute_max', 'transverse_abdominis', 'rectus_abdominis'], stabilize: ['delt_front', 'serratus'], note: 'The trunk holds still while the back extensors and glute lift the limbs.' },
  // ── Abs: resisting or making rotation ──
  side_plank: { prime: ['obliques'], assist: ['transverse_abdominis', 'glute_med'], stabilize: ['rectus_abdominis', 'erectors', 'rotator_cuff'], note: 'Also works the side of the hip (gluteus medius) on the bottom leg.' },
  pallof: { prime: ['obliques'], assist: ['transverse_abdominis', 'rectus_abdominis'], stabilize: ['delt_front', 'glute_med'], note: 'Anti-rotation: the trunk works to stop the cable turning you.' },
  woodchop: { prime: ['obliques'], assist: ['rectus_abdominis', 'transverse_abdominis', 'delt_front'], stabilize: ['glute_max', 'glute_med'], note: 'The turn comes from the hips and upper back together, driven by the obliques.' },
  farmer_carry: { prime: ['forearms', 'traps_upper'], assist: ['obliques', 'transverse_abdominis'], stabilize: ['glute_med', 'erectors', 'rectus_abdominis'], note: 'Grip and upper traps hold the weight; the trunk and hips keep you upright as you walk.' },

  // ── Glutes ──
  hip_thrust: { prime: ['glute_max'], assist: HAMS, stabilize: ['adductors', 'erectors'], note: 'Hardest at the top, where the hips are straight.' },
  db_hip_thrust: { prime: ['glute_max'], assist: HAMS, stabilize: ['adductors'], note: 'Same as the barbell version with a lighter, easier-to-set-up load.' },
  glute_bridge: { prime: ['glute_max'], assist: HAMS, stabilize: ['transverse_abdominis'], note: 'Shoulders on the floor make the range shorter than a hip thrust.' },
  back_ext: { prime: ['glute_max', ...HAMS], assist: ['erectors'], stabilize: ['rectus_abdominis'], note: 'Bending at the hips with a flat back puts the work on the glutes and hamstrings.' },
  cable_kickback: { prime: ['glute_max'], assist: ['biceps_femoris'], stabilize: ['glute_med', 'transverse_abdominis'], note: 'Stop where the leg lines up with the body; going higher just arches the back.' },
  band_walk: { prime: ['glute_med'], assist: ['glute_max'], stabilize: ['transverse_abdominis'], note: 'The side of the hip pushes the knees out against the band.' },
  clamshell: { prime: ['glute_med'], assist: ['glute_max'], note: 'Opens the knee by turning the thigh out; the hips must not roll back.' },
}
