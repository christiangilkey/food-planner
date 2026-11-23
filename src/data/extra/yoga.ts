// Yoga poses, planned on yoga days (and for stretch regions). Plain, original descriptions.
// Diagram coordinates follow src/lib/pose.ts: 200 × 200 frames, floor at y = 190, a flat foot's
// ankle at y = 186, angles absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, FrontPose, Prop, SidePose } from '../../lib/pose'
import type { Exercise, HeadId, HeadSpec, Region, Stress } from '../exercises'
import type { FormGuide } from '../form'

const pose = (id: string, name: string, regions: Region[], hold: string, cue: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, kind: 'yoga', gear: ['bodyweight'], primary: [], secondary: [], compound: false, regions, hold, cue, ...extra })
const st = (...s: Stress[]) => ({ stress: s })

// In flow order: standing poses first, then down to the floor.
export const EX_YOGA: Exercise[] = [
  pose('mountain_reach', 'Mountain pose with overhead reach', ['lats'], '5 slow breaths × 2', 'Stand tall, feet hip-width, and reach both arms overhead, growing tall without arching the lower back.'),
  pose('chair_pose', 'Chair pose', ['calves'], '5 breaths × 2', 'Sit back as if into a chair, weight in the heels, arms reaching forward or up.'),
  pose('warrior_two', 'Warrior II', ['adductors', 'hip_flexors'], '5 breaths each side', 'Wide stance, front knee bent over the ankle, back leg straight, arms out level with the shoulders.'),
  pose('triangle', 'Triangle pose', ['hamstrings', 'adductors', 'lats'], '5 breaths each side', 'Wide stance with straight legs; reach forward over the front leg, then tip down to rest a hand on the shin, top arm up.'),
  pose('tree_pose', 'Tree pose', ['adductors'], '5 breaths each side', 'Stand on one leg with the other foot on the inner calf or thigh, never on the knee; a hand on a wall if needed.', { support: true, ...st('balance') }),
  pose('warrior_three', 'Warrior III', ['hamstrings'], '3–5 breaths each side', 'Hinge forward on one leg until body and back leg make a T; rest the hands on a chair back to start.', st('balance')),
  pose('down_dog', 'Downward-facing dog', ['hamstrings', 'calves', 'lats', 'shoulders'], '5 breaths × 2', 'From hands and knees, lift the hips up and back into an upside-down V; bent knees are fine, heels toward the floor.', st('wrist_load', 'head_down', 'floor')),
  pose('low_lunge', 'Low lunge', ['hip_flexors', 'quads'], '5 breaths each side', 'Back knee down, front knee over the ankle; sink the hips forward and lift the chest.', st('kneeling', 'floor')),
  pose('pigeon', 'Pigeon pose', ['glutes', 'hip_flexors'], '5–8 breaths each side', 'Front shin angled across the mat, back leg straight behind; fold forward over the front leg, with a cushion under the hip.', st('floor', 'deep_hip', 'deep_knee')),
  pose('child_pose', 'Child’s pose', ['lats', 'lower_back', 'glutes'], '5–8 breaths', 'Kneel, sit back toward your heels and walk your hands forward, forehead down.', st('floor', 'kneeling')),
  pose('bridge_pose', 'Bridge pose', ['hip_flexors', 'chest'], '5 breaths × 2', 'On your back with knees bent, press through the feet to lift the hips and roll the shoulders under.', { supine: true, ...st('floor') }),
  pose('sphinx', 'Sphinx pose', ['lower_back', 'hip_flexors'], '5 breaths × 2', 'Lying face down, prop up on your forearms with the elbows under the shoulders and let the lower back gently arch.', st('floor', 'prone')),
  pose('seated_fold', 'Seated forward fold', ['hamstrings', 'lower_back'], '5–8 breaths', 'Sit with the legs straight and knees soft, and hinge forward from the hips toward the toes.', st('floor', 'spine_flexion')),
  pose('supine_twist', 'Lying twist', ['lower_back', 'glutes', 'chest'], '5 breaths each side', 'On your back, drop both bent knees to one side with the arms out wide, and look the other way.', { supine: true, ...st('floor', 'spine_twist') }),
]

const G = 186

// Helpers copied from ../diagrams.ts and ./core.ts (importing them would make a cycle).
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
// On hands and knees, seen from the side: the far knee stays planted.
const allFours = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['knee2', x, 184], torso: 102, arm: [0, 0], leg: [0, -90, -90], ...extra })
// Standing, seen from the front.
const front = (arm: [number, number], extra: Partial<FrontPose> = {}): FrontPose => ({ view: 'front', at: ['ankle', 110, G], arm, ...extra })
// Kneeling on a folded mat: the back knee stays planted.
const kneelPad: Prop = { t: 'pad', a: ['knee2', -8, 4], b: ['knee2', 8, 4], w: 5 }
// A mat seen from above, for the lying twist.
const matTop = (x1: number, y1: number, x2: number, y2: number): Prop[] => [
  { t: 'line', a: [x1, y1], b: [x2, y1] }, { t: 'line', a: [x2, y1], b: [x2, y2] },
  { t: 'line', a: [x2, y2], b: [x1, y2] }, { t: 'line', a: [x1, y2], b: [x1, y1] },
]

export const DIAGRAMS_YOGA: Record<string, Diagram> = {
  // ── Standing ──
  mountain_reach: {
    start: front([8, 4]),
    end: front([174, 178]),
    labels: ['Start', 'Pose'],
  },
  chair_pose: {
    start: stand(104),
    end: { at: ['ankle', 104, G], torso: 145, arm: [155, 155], leg: [55, -25] },
    labels: ['Start', 'Pose'],
  },
  warrior_two: {
    // Facing you: front knee bent over the ankle, back leg straight, arms level with the shoulders.
    start: { view: 'front', at: ['ankle2', 50, G], arm: [12, 6], leg: [34.6, 34.6] },
    end: { view: 'front', at: ['ankle2', 50, G], arm: [90, 90], leg: [62, 0], leg2: [-43, -43] },
    labels: ['Start', 'Pose'],
  },
  triangle: {
    // Seen from the front, drawn side-on like the side plank: the trunk tips over the front leg.
    start: { at: ['hip', 96, 125.4], torso: 180, arm: [90, 90], arm2: [-90, -90], leg: [35, 35, 90], leg2: [-35, -35, -90] },
    end: { at: ['hip', 92, 125.4], torso: 103, arm: { to: [116.5, 160.5], bend: 'back' }, arm2: [180, 180], leg: [35, 35, 90], leg2: [-35, -35, -90] },
    labels: ['Start', 'Pose'],
  },
  tree_pose: {
    // Facing you, standing on the left leg; the right foot rests on the inner thigh, the knee opens out.
    start: front([30, -110], { at: ['ankle2', 92, G], leg: [4, 0] }),
    end: front([170, -170], { at: ['ankle2', 92, G], leg: [36.7, -97.1], leg2: [0, 0] }),
    labels: ['Start', 'Pose'],
  },
  warrior_three: {
    start: stand(96, { leg2: [-5, -20] }),
    end: { at: ['ankle', 96, G], torso: 92, arm: [92, 92], leg: [8, -4], leg2: [-88, -88, 0] },
    labels: ['Start', 'Pose'],
  },

  // ── Down to the floor ──
  down_dog: {
    // Hands stay put; the knees lift and the hips go up and back into an upside-down V.
    start: allFours(102),
    end: { at: ['hand', 147, 186.4], torso: 47, arm: [47, 47], leg: [-32, -32, 65] },
    labels: ['Start', 'Pose'],
  },
  low_lunge: {
    start: { at: ['knee2', 66, 184], torso: 180, arm: [10, 40], leg: { to: [122, G], bend: 'up' }, leg2: [0, -90, -90] },
    end: { at: ['knee2', 66, 184], torso: 182, arm: [172, 172], leg: { to: [122, G], bend: 'up' }, leg2: [-30, -90, -90] },
    props: [kneelPad],
    labels: ['Start', 'Pose'],
  },
  pigeon: {
    // Front knee forward with the shin folded across in front of the hips, back leg long behind;
    // a cushion under the front hip. Chest up first, then fold down onto the forearms.
    start: { at: ['hip', 96, 180], torso: 155, arm: { to: [126, 186], bend: 'back' }, leg: [84, -90, -90], leg2: [-86, -86, -90] },
    end: { at: ['hip', 96, 180], torso: 115, arm: [0, 90], leg: [84, -90, -90], leg2: [-86, -86, -90] },
    props: [{ t: 'pad', a: ['hip', -10, 6], b: ['hip', 10, 6], w: 8 }],
    labels: ['Chest up', 'Fold forward'],
  },
  child_pose: {
    start: allFours(108),
    end: { at: ['knee2', 108, 184], torso: 68, arm: { to: [168, 186], bend: 'up' }, leg: [50, -90, -90] },
    labels: ['Start', 'Pose'],
  },
  bridge_pose: {
    start: { at: ['shoulder', 45, 180], torso: -88, head: 0, arm: [90, 90], leg: { to: [132, G], bend: 'up' } },
    end: { at: ['shoulder', 45, 180], torso: -55, head: -33, arm: [90, 90], leg: { to: [132, G], bend: 'up' } },
    labels: ['Start', 'Pose'],
  },
  sphinx: {
    start: { at: ['hip', 92, 182], torso: 90, arm: [80, 90], leg: [-90, -90, -70] },
    end: { at: ['hip', 92, 182], torso: 120, head: 25, arm: [0, 90], leg: [-90, -90, -70] },
    labels: ['Start', 'Pose'],
  },
  seated_fold: {
    start: { at: ['hip', 52, 182], torso: 180, arm: [10, 30], leg: { to: [124, 184], bend: 'up', foot: 170 } },
    end: { at: ['hip', 52, 182], torso: 133, head: -12, arm: { to: [126, 177], bend: 'down' }, leg: { to: [124, 184], bend: 'up', foot: 170 } },
    labels: ['Start', 'Pose'],
  },
  supine_twist: {
    // Seen from above, lying on a mat with the head to the left: arms out wide, then both bent
    // knees drop to one side (down the frame).
    start: { at: ['hip', 106, 96], torso: -90, arm: [180, 180], arm2: [0, 0], leg: [90, 90, 90] },
    end: { at: ['hip', 106, 96], torso: -90, arm: [180, 180], arm2: [0, 0], leg: [12, 92, 90], leg2: [20, 96, 90] },
    props: matTop(32, 80, 196, 112),
    noFloor: true,
    labels: ['Start, from above', 'Pose'],
  },
}
// In pregnancy, lying flat on the back can make some people light-headed (2019 Canadian guideline).
const SUPINE_PREGNANCY: NonNullable<FormGuide['safety']> = {
  text: 'In pregnancy, if lying on your back makes you light-headed, sick or unwell, change position and skip poses done on your back.',
  sources: ['pm_30337460'],
}

export const FORM_YOGA: Record<string, FormGuide> = {
  mountain_reach: {
    setup: ['Stand with your feet hip-width apart, weight spread evenly over both feet.', 'Let your arms hang and keep your knees soft, not locked.'],
    execution: ['Breathe in and sweep your arms up overhead, about shoulder-width apart.', 'Grow tall through the top of your head while your ribs stay down over your hips.', 'Hold for 5 slow breaths, lower your arms, then do it once more.'],
    breathing: 'Breathe slowly in and out through your nose, letting each breath out help you stand a little taller.',
    mistakes: ['Arching your lower back and pushing your ribs forward to get the arms higher.', 'Shrugging your shoulders up to your ears.', 'Locking your knees.'],
    easier: 'Stand with your back against a wall, or reach only as high as is comfortable with your elbows bent.',
    harder: 'Link your fingers and turn your palms to the ceiling, or rise onto your toes as you reach.',
    stretches: [],
  },
  chair_pose: {
    setup: ['Stand with your feet hip-width apart and your weight toward your heels.'],
    execution: ['Bend your knees and send your hips back as if you were sitting into a chair.', 'Reach your arms forward or up, keeping your chest lifted and your back long.', 'Hold for 5 breaths, stand up to rest, then do it once more.'],
    breathing: 'Keep breathing slowly through your nose; don’t hold your breath while your legs work.',
    mistakes: ['Knees falling in toward each other.', 'Heels lifting so your weight tips onto your toes.', 'Rounding your back, or arching it hard to keep the arms up.'],
    easier: 'Sit back only a little while holding the back of a chair, or slide down a wall with your back against it.',
    harder: 'Sit a little lower with your arms overhead.',
    stretches: [],
  },
  warrior_two: {
    setup: ['Step your feet wide apart, roughly a leg’s length.', 'Point your front foot straight ahead and turn your back foot in a little.'],
    execution: ['Bend your front knee until it sits over your ankle; keep the back leg straight.', 'Lift your arms out level with your shoulders and look past your front hand.', 'Hold for 5 breaths, straighten up, turn around and do the other side.'],
    breathing: 'Breathe slowly through your nose and let your shoulders drop a little on each breath out.',
    mistakes: ['Front knee falling in past your big toe.', 'Leaning your body over the front leg.', 'Shoulders creeping up as your arms tire.'],
    easier: 'Sit the front thigh on the seat of a sturdy chair, or use a shorter stance with your hands on your hips.',
    harder: 'Take a longer stance and bend the front knee further, toward a level thigh.',
    stretches: [],
  },
  triangle: {
    setup: ['Stand with your feet wide and legs straight, front foot pointing ahead and back foot turned in a little.', 'Lift your arms out to shoulder height.'],
    execution: ['Reach your front arm forward over your front leg, tipping from the hip.', 'Lower that hand to rest on your shin and reach the other arm straight up.', 'Hold for 5 breaths, come up with a long back, and do the other side.'],
    breathing: 'Breathe slowly through your nose and let your chest open toward the side as you breathe in.',
    mistakes: ['Rounding your back to get the hand lower.', 'Leaning your weight on your knee instead of resting the hand on the shin.', 'Locking the front knee hard; keep it straight but soft.'],
    easier: 'Rest your lower hand on a block or the seat of a chair instead of your shin.',
    harder: 'Bring your lower hand down toward your ankle, keeping your chest turned open.',
    stretches: [],
  },
  tree_pose: {
    setup: ['Stand tall beside a wall and shift your weight onto one foot.', 'Bring your hands together in front of your chest.'],
    execution: ['Turn the other knee out and rest that foot on your inner calf or inner thigh, never on the knee.', 'Press the foot and leg gently into each other and look at a spot that doesn’t move.', 'Hold for 5 breaths, raising your arms overhead if you feel steady, then switch sides.'],
    breathing: 'Breathe slowly and evenly through your nose; a calm breath makes balancing easier.',
    mistakes: ['Resting the foot against the side of the knee.', 'Letting the standing hip push out to the side.', 'Holding your breath to stay steady.'],
    easier: 'Keep a hand on a wall or chair back, or rest your heel on your ankle with the toes on the floor.',
    harder: 'Raise your arms overhead and stay steady for all 5 breaths without touching the wall.',
    stretches: [],
  },
  warrior_three: {
    setup: ['Stand on one leg with the knee soft, facing the back of a sturdy chair or a wall.'],
    execution: ['Hinge forward from the standing hip as the other leg lifts straight out behind you.', 'Stop when your body and back leg make a T, or sooner; keep both hips level and facing the floor.', 'Reach your arms forward, hold for 3 to 5 breaths, then come up slowly and switch sides.'],
    breathing: 'Breathe slowly through your nose, and come up a little if your breath gets tight.',
    mistakes: ['Hip of the lifted leg rolling open toward the ceiling.', 'Rounding your back to reach lower.', 'Locking the standing knee.'],
    easier: 'Rest your hands on the back of a chair or a wall and lift the back leg only part of the way.',
    harder: 'Let go of the support and reach your arms forward for the whole hold.',
    stretches: [],
  },
  down_dog: {
    setup: ['Start on your hands and knees, hands a little ahead of your shoulders with the fingers spread.', 'Tuck your toes under.'],
    execution: ['Lift your knees and send your hips up and back into an upside-down V.', 'Bend your knees as much as you need to keep your back long; let your heels sink toward the floor.', 'Hold for 5 breaths, lower your knees to rest, then do it once more.'],
    breathing: 'Breathe slowly through your nose and let your head hang relaxed between your arms.',
    mistakes: ['Rounding your back to force the heels down.', 'Shoulders creeping up toward your ears.', 'Taking all the weight on the heels of your hands instead of the whole hand.'],
    easier: 'Put your hands on a wall, a chair seat or a table edge and walk back until your back is long.',
    harder: 'Straighten your legs a little more and let the heels move closer to the floor.',
    stretches: [],
  },
  low_lunge: {
    setup: ['Kneel on a folded mat or cushion and step one foot forward so that knee is over the ankle.', 'Rest your hands on your front thigh.'],
    execution: ['Tuck your tailbone slightly and squeeze the buttock of the back leg.', 'Let your hips ease forward until you feel the front of the back hip stretch, keeping your chest lifted.', 'Raise your arms if that feels good; hold for 5 breaths, then switch sides.'],
    breathing: 'Breathe slowly through your nose and let your hips settle a little more on each breath out.',
    mistakes: ['Arching your lower back instead of moving the hips.', 'Front knee falling inward.', 'Kneeling on a hard floor with no padding.'],
    easier: 'Put a cushion under the back knee and hold a chair beside you for balance.',
    harder: 'Reach both arms overhead and step the front foot a little further forward.',
    stretches: [],
  },
  pigeon: {
    setup: ['From hands and knees, bring one knee forward behind the same wrist and angle that shin across the mat.', 'Slide the other leg straight back, and put a cushion under the hip of the front leg.'],
    execution: ['Settle your hips evenly onto the cushion, with your hands on the floor and your chest up.', 'Walk your hands forward and fold over the front leg, resting on your forearms if comfortable.', 'Hold for 5 to 8 breaths, press back up, and do the other side.'],
    breathing: 'Breathe slowly through your nose and let the front hip soften a little more on each breath out.',
    mistakes: ['Pushing on through pain in the front knee; ease off or choose a gentler version.', 'Hips tipping to one side with nothing underneath to support them.', 'Forcing the fold lower than is comfortable.'],
    easier: 'Stay with your chest up and hands on blocks, or do the figure-4 stretch lying on your back.',
    harder: 'Fold further forward with your arms stretched out in front.',
    stretches: [],
  },
  child_pose: {
    setup: ['Kneel on a mat with your big toes touching and your knees about hip-width or wider.'],
    execution: ['Sit your hips back toward your heels.', 'Walk your hands forward and rest your forehead on the floor or a cushion.', 'Stay for 5 to 8 slow breaths.'],
    breathing: 'Breathe slowly through your nose and feel your back widen as you breathe in.',
    mistakes: ['Forcing your hips onto your heels when your knees complain.', 'Holding your head up and straining your neck.'],
    easier: 'Put a cushion between your hips and heels, and a block or folded towel under your forehead.',
    harder: 'Walk both hands over to one side to stretch along that side, then the other.',
    stretches: [],
  },
  bridge_pose: {
    setup: ['Lie on your back with your knees bent and feet flat, hip-width apart and close to your hips.', 'Arms long by your sides, palms down.'],
    execution: ['Press through your feet and lift your hips until there is a line from your shoulders to your knees.', 'Roll your shoulders gently under you and keep your knees pointing forward.', 'Hold for 5 breaths, lower slowly, rest, then do it once more.'],
    breathing: 'Keep breathing slowly through your nose while you hold; don’t hold your breath.',
    mistakes: ['Pushing so high that your lower back arches.', 'Knees falling out or in.', 'Turning your head while your hips are up.'],
    safety: SUPINE_PREGNANCY,
    easier: 'Rest your lower back on a block or firm cushion under your hips, or lift only a little.',
    harder: 'Lift one foot off the floor for part of the hold, keeping your hips level.',
    stretches: [],
  },
  sphinx: {
    setup: ['Lie face down with your legs straight back, hip-width apart.', 'Put your forearms on the floor with your elbows under your shoulders.'],
    execution: ['Press your forearms down and lift your chest, letting your lower back gently arch.', 'Keep your shoulders away from your ears and look straight ahead.', 'Hold for 5 breaths, lower down to rest, then do it once more.'],
    breathing: 'Breathe slowly through your nose and let your belly relax against the floor.',
    mistakes: ['Pushing into a deeper arch than feels easy.', 'Shrugging your shoulders up.', 'Tipping your head far back.'],
    easier: 'Slide your elbows a little further forward, or put a folded towel under your hips.',
    harder: 'Press up onto straight arms into cobra, only as far as stays comfortable.',
    stretches: [],
  },
  seated_fold: {
    setup: ['Sit with your legs straight out in front, knees soft.', 'Sit up tall; a folded blanket under your hips makes this easier.'],
    execution: ['Hinge forward from your hips, reaching your hands toward your shins or feet.', 'Keep your chest long, letting your back round only a little at the end.', 'Stay for 5 to 8 slow breaths, then roll up slowly.'],
    breathing: 'Breathe slowly through your nose and let yourself fold a little further only on the breath out, never by pulling.',
    mistakes: ['Pulling yourself down with your arms.', 'Locking your knees straight.', 'Rounding hard from the upper back instead of hinging at the hips.'],
    easier: 'Sit on a cushion with your knees bent, or loop a strap or towel around your feet.',
    harder: 'Straighten your knees a little more, still hinging from the hips.',
    stretches: [],
  },
  supine_twist: {
    setup: ['Lie on your back with your knees bent and feet flat.', 'Stretch your arms out wide at shoulder height, palms up.'],
    execution: ['Let both knees fall slowly to one side, keeping them together.', 'Turn your head to look the other way, keeping both shoulders on the floor.', 'Hold for 5 breaths, bring your knees back to the middle, then do the other side.'],
    breathing: 'Breathe slowly through your nose and let your knees and shoulders sink a little more on each breath out.',
    mistakes: ['Opposite shoulder lifting off the floor.', 'Pushing your knees down with your hand.', 'Twisting further than feels easy.'],
    safety: SUPINE_PREGNANCY,
    easier: 'Put a cushion or block under your knees so they don’t have to go all the way down.',
    harder: 'Draw your knees higher toward your chest before you let them fall.',
    stretches: [],
  },
}

const VASTI: HeadId[] = ['vastus_lateralis', 'vastus_medialis', 'vastus_intermedius']
const HAMS: HeadId[] = ['biceps_femoris', 'semis']

// For yoga poses, prime is what stretches most (or works hardest, for the strength poses) and assist
// what works to hold the position.
export const HEADS_YOGA: Record<string, HeadSpec> = {
  mountain_reach: { prime: ['lats', 'teres_major'], assist: ['delt_front', 'serratus', 'traps_lower'], stabilize: ['rectus_abdominis', 'transverse_abdominis'], note: 'The abs keep the ribs down so the reach comes from the shoulders, not an arched back.' },
  chair_pose: { prime: [...VASTI, 'glute_max'], assist: ['erectors', 'delt_front', 'traps_lower'], stabilize: ['tibialis', 'transverse_abdominis'], note: 'A held squat; the bent ankles also give the lower calves a gentle stretch.' },
  warrior_two: { prime: ['adductors', 'hip_flexors'], assist: ['vastus_lateralis', 'vastus_medialis', 'glute_max', 'glute_med', 'delt_side'], stabilize: ['obliques', 'foot_ankle'], note: 'The inner thighs and the front of the back hip stretch while the front leg holds the bend.' },
  triangle: { prime: [...HAMS, 'adductors', 'lats'], assist: ['obliques', 'quadratus_lumborum', 'glute_med'], stabilize: ['foot_ankle'], note: 'The front-leg hamstrings and inner thighs stretch while the sides of the trunk hold you up.' },
  tree_pose: { prime: ['adductors'], assist: ['glute_med', 'hip_rotators', 'glute_max'], stabilize: ['foot_ankle', 'tibialis', 'transverse_abdominis'], note: 'The standing hip and foot do the balancing; the opened knee gently stretches the inner thigh.' },
  warrior_three: { prime: ['glute_max', ...HAMS], assist: ['erectors', 'delt_front', 'traps_lower'], stabilize: ['glute_med', 'foot_ankle', 'transverse_abdominis'], note: 'The standing hamstrings also stretch as you hinge.' },
  down_dog: { prime: [...HAMS, 'gastrocnemius', 'lats'], assist: ['delt_front', 'serratus', 'triceps_long'], stabilize: ['forearms', 'rotator_cuff', 'transverse_abdominis'], note: 'Bending the knees moves the stretch from the hamstrings toward the back and lower calves.' },
  low_lunge: { prime: ['hip_flexors', 'rectus_femoris'], assist: ['glute_max', 'vastus_lateralis', 'vastus_medialis'], stabilize: ['glute_med', 'transverse_abdominis'], note: 'Squeezing the back buttock sends the stretch into the front of that hip.' },
  pigeon: { prime: ['glute_max', 'hip_rotators', 'hip_flexors'], assist: ['erectors', 'delt_front'], stabilize: ['glute_med'], note: 'The front hip turns out to stretch the glute and deep rotators; the back leg stretches the front of the hip.' },
  child_pose: { prime: ['lats', 'erectors', 'glute_max'], assist: [], note: 'A resting pose: the floor takes your weight while the back, sides and seat lengthen.' },
  bridge_pose: { prime: ['hip_flexors', 'rectus_femoris', 'pec_mid', 'delt_front'], assist: ['glute_max', ...HAMS], stabilize: ['erectors', 'adductors'], note: 'The glutes and hamstrings hold the hips up, which opens the front of the hips and chest.' },
  sphinx: { prime: ['rectus_abdominis', 'hip_flexors'], assist: ['erectors', 'traps_lower', 'serratus'], note: 'A gentle backbend: the back muscles and forearms hold the chest up while the belly lengthens.' },
  seated_fold: { prime: [...HAMS, 'erectors'], assist: ['hip_flexors'], note: 'Hinging from the hips aims the stretch at the hamstrings; rounding moves it into the back.' },
  supine_twist: { prime: ['obliques', 'erectors', 'glute_med', 'pec_mid'], assist: [], note: 'A resting twist: the knees drop with gravity while the opposite shoulder and chest stay open.' },
}
