// Stretches and mobility drills for the neck, shoulders, chest, upper back, lats and wrists.
// Diagram coordinates follow src/lib/pose.ts: 200 × 200 frames, floor at y = 190, a flat foot's
// ankle at y = 186, angles absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { Exercise, HeadSpec, Region, Stress } from '../exercises'
import type { FormGuide } from '../form'

const mob = (id: string, name: string, regions: Region[], hold: string, cue: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, kind: 'mobility', gear: ['bodyweight'], primary: [], secondary: [], compound: false, regions, hold, cue, ...extra })
const st = (...s: Stress[]) => ({ stress: s })

export const EX_MOBILITY_UPPER: Exercise[] = [
  mob('neck_side_stretch', 'Neck side stretch', ['neck'], '2 × 30 s each side', 'Sit tall, drop one ear toward the shoulder and let the other shoulder sink; add light hand pressure only if it stays comfortable.'),
  mob('chin_tucks', 'Chin tucks', ['neck'], '2 × 10, 3-second hold', 'Glide the head straight back to make a double chin, eyes level, and hold 3 seconds.'),
  mob('doorway_stretch', 'Doorway chest stretch', ['chest'], '2 × 30–60 s each side', 'Forearm on the door frame at shoulder height, step through until the front of the shoulder and chest stretch.'),
  mob('cross_body_stretch', 'Cross-body shoulder stretch', ['shoulders'], '2 × 30–60 s each side', 'Pull one straight arm across your chest at shoulder height, keeping the shoulder down.'),
  mob('wall_angel', 'Wall angels', ['upper_back', 'chest'], '2 × 10 slow', 'Back, head and arms against a wall; slide the arms up and down without arching or losing contact.'),
  mob('thoracic_extension', 'Upper-back extension over a chair', ['upper_back'], '2 × 8 slow', 'Sit with the chair back at your shoulder blades, hands behind your head, and lean back over it, moving from the upper back.'),
  mob('open_book', 'Side-lying open book', ['upper_back', 'chest'], '2 × 8 each side', 'Lie on your side, knees bent, arms out in front; sweep the top arm open and follow it with your eyes, knees together.', st('floor', 'spine_twist')),
  mob('thread_needle', 'Thread the needle', ['upper_back', 'shoulders'], '2 × 8 each side', 'On hands and knees, slide one arm under the other along the floor, then reach it up to the ceiling.', st('floor', 'kneeling', 'spine_twist')),
  mob('lat_stretch', 'Kneeling lat stretch', ['lats'], '2 × 30–60 s', 'Kneel facing a chair or bench, elbows on it, and sit your hips back until the sides of your back stretch.', st('kneeling')),
  mob('side_bend_stretch', 'Standing side bend', ['lats', 'lower_back'], '2 × 30 s each side', 'Reach one arm overhead and lean gently to the other side, hips staying over the feet.'),
  mob('wrist_stretch', 'Wrist flexor and extensor stretch', ['wrists'], '2 × 30 s each way', 'Arm straight in front, gently pull the fingers back with the palm up, then down with the palm down.'),
]

// Helpers copied from ../diagrams.ts and ./core.ts (importing ../diagrams.ts would make a cycle).
const G = 186
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
const benchFlat = (x1: number, x2: number, y: number): Prop[] => [
  { t: 'pad', a: [x1, y], b: [x2, y] },
  { t: 'line', a: [x1 + 10, y + 4], b: [x1 + 10, 190] },
  { t: 'line', a: [x2 - 10, y + 4], b: [x2 - 10, 190] },
]
// On hands and knees, seen from the side: the far knee stays planted.
const allFours = (extra: Partial<SidePose> = {}): SidePose => ({ at: ['knee2', 88, 184], torso: 102, arm: [0, 0], leg: [0, -90, -90], ...extra })

// Facing you. A front view can't tilt the head or lean the trunk sideways, so the stretched position
// is a side pose drawn square to the viewer, over a true front view (FRONT) as the start: limbs right
// of the spine are the near ones, left of it the far ones. The feet line up with FRONT's.
const FRONT = { view: 'front' as const, at: ['ankle', 111, G] as ['ankle', number, number] }
const facing = (extra: Partial<SidePose> = {}): SidePose => ({
  at: ['ankle', 110.85, G], torso: 180, arm: [22, 18], arm2: [-22, -18], leg: [16, 0, 90], leg2: [-16, 0, -90], ...extra,
})

// Doorway: the forearm rests on the frame; stepping through takes the arm back behind the body.
// At the start the upper arm points out toward you, so it is drawn shorter.
const DOOR_X = 85

// Thoracic extension: sitting on a chair whose back reaches the shoulder blades.
// Hands behind the head with the elbows forward: the arms point partly toward you, so they are drawn shorter.
const chairSit = (torso: number, head: number): SidePose =>
  ({ at: ['hip', 88, 150], torso, head, arm: [torso - 30, torso - 260], reach: 0.7, leg: { to: [126, G], bend: 'up' } })
const lowBackChair: Prop[] = [{ t: 'pad', a: [72, 158], b: [112, 158] }, { t: 'pad', a: [76, 154], b: [76, 122] }, { t: 'line', a: [92, 162], b: [92, 190] }]

// Open book, seen from above: lying on the left side on a mat, head to the left, facing the bottom
// of the frame; hips and knees bent to 90°. The top arm and leg are the near ones.
const sideLie = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 124, 100], torso: -90, arm, arm2: [0, 0], leg: [0, 90, 0] })
const MAT: Prop[] = [
  { t: 'line', a: [28, 44], b: [176, 44] }, { t: 'line', a: [176, 44], b: [176, 160] },
  { t: 'line', a: [176, 160], b: [28, 160] }, { t: 'line', a: [28, 160], b: [28, 44] },
  // A pillow under the head.
  { t: 'pad', a: [63, 91], b: [63, 109], w: 16 },
]

// Kneeling lat stretch: the knees stay put and the elbows stay on the bench at LAT_ELBOW.
const LAT_KNEE: [number, number] = [70, 184]
const LAT_ELBOW: [number, number] = [118, 144]

export const DIAGRAMS_MOBILITY_UPPER: Record<string, Diagram> = {
  neck_side_stretch: {
    start: { ...FRONT, arm: [8, 4] },
    // The head tips toward the near shoulder while the far arm hangs long, so that shoulder sinks.
    end: facing({ head: -28, arm: [24, 20], arm2: [-22, -18] }),
    crop: [44, 24, 112, 96],
    labels: ['Sit tall', 'Ear to shoulder'],
  },
  chin_tucks: {
    start: stand(100, { headShift: 5, head: 6 }),
    end: stand(100, { headShift: -4 }),
    crop: [62, 34, 76, 76],
    labels: ['Relaxed', 'Tuck and hold'],
  },
  doorway_stretch: {
    start: stand(104, { arm: [-90, 180], reach: 0.6, arm2: { to: [106, 115], bend: 'back' } }),
    end: {
      at: ['hip', 111.4, 117], torso: 176, arm: [-92, 178], arm2: { to: [116, 120], bend: 'back' },
      leg: { to: [136, G], bend: 'front' }, leg2: { to: [104, G], bend: 'front' },
    },
    props: [{ t: 'line', a: [DOOR_X, 20], b: [DOOR_X, 190] }],
    labels: ['Forearm on the frame', 'Step through'],
  },
  cross_body_stretch: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [8, 4] },
    // The far hand holds the near arm just above the elbow.
    end: { view: 'front', at: ['ankle', 111, G], arm: [-90, -90], arm2: [-10, 156] },
    labels: ['Stand tall', 'Pull across'],
  },
  wall_angel: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [92, 180] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [155, 170] },
    labels: ['Arms low', 'Slide up'],
  },
  thoracic_extension: {
    start: chairSit(180, 0),
    end: chairSit(194, 4),
    props: lowBackChair,
    labels: ['Sit tall', 'Lean back'],
  },
  open_book: {
    start: sideLie([0, 0]),
    end: sideLie([180, 180]),
    props: MAT,
    noFloor: true,
    labels: ['From above', 'Top arm open'],
  },
  thread_needle: {
    // The threading arm points across under the body, so it is drawn shorter; the far hand stays planted.
    start: allFours({ torso: 82, head: -40, arm: [-18, -18], arm2: { to: [138, 186], bend: 'back' }, reach: 0.68 }),
    end: allFours({ head: 15, arm: [180, 180], arm2: { to: [134, 186], bend: 'back' } }),
    labels: ['Thread under', 'Reach up'],
  },
  lat_stretch: {
    // Torso and upper-arm angles put the elbow on LAT_ELBOW in both frames.
    start: { at: ['knee', ...LAT_KNEE], torso: 124.5, arm: [22.8, 180], leg: [0, -90, -90] },
    end: { at: ['knee', ...LAT_KNEE], torso: 88, head: -20, arm: [113.7, -160], leg: [35, -90, -90] },
    props: benchFlat(LAT_ELBOW[0] - 6, LAT_ELBOW[0] + 54, LAT_ELBOW[1] + 6),
    labels: ['Elbows on the seat', 'Sit back'],
  },
  side_bend_stretch: {
    start: { ...FRONT, arm: [180, 180], arm2: [-8, -4] },
    // Leaning away from the raised arm; the far hand slides down the side of the thigh.
    end: facing({ torso: 196, arm: [205, 235], arm2: [-12, -8] }),
    labels: ['Reach up', 'Lean over'],
  },
  wrist_stretch: {
    // The hand is drawn as a short pad off the end of the straight arm; the far hand holds it.
    start: stand(80, { arm: [90, 90], reach: 0.92, arm2: { to: [126, 57], bend: 'down' } }),
    end: stand(80, { arm: [90, 90], reach: 0.92, arm2: { to: [128, 72], bend: 'down' } }),
    startProps: [{ t: 'pad', a: 'hand', b: ['hand', -2, -10], w: 6 }],
    endProps: [{ t: 'pad', a: 'hand', b: ['hand', -2, 10], w: 6 }],
    crop: [56, 22, 96, 96],
    labels: ['Fingers back', 'Hand down'],
  },
}

export const FORM_MOBILITY_UPPER: Record<string, FormGuide> = {
  neck_side_stretch: {
    setup: ['Sit tall on a chair, feet flat, shoulders relaxed.', 'Hold the edge of the seat with one hand to keep that shoulder down.'],
    execution: [
      'Slowly tip the other ear toward its shoulder, nose still pointing forward.',
      'Stop at a mild stretch along the side of the neck; let the held shoulder sink.',
      'If it feels fine, rest the free hand on your head for a little extra, without pulling.',
      'Hold 30 s, lift your head slowly and switch sides; twice each side.',
    ],
    breathing: 'Breathe slowly and let each breath out soften the stretch.',
    mistakes: ['Letting the held shoulder creep up toward the ear.', 'Turning the head or dropping the chin instead of tilting sideways.', 'Pulling hard on the head with the hand.'],
    easier: 'Tilt less, with no hand on the head.',
    harder: 'Turn your nose down toward the armpit on the side you tilt to; it reaches further back into the neck.',
    stretches: [],
  },
  chin_tucks: {
    setup: ['Sit or stand tall, shoulders relaxed, eyes looking straight ahead.'],
    execution: [
      'Slide your head straight back, as if making a double chin; keep your eyes level.',
      'Stop when the back of the neck feels long; hold 3 s.',
      'Let the head ease forward again. Do 10, rest, then 10 more.',
    ],
    breathing: 'Breathe out as you tuck, then breathe normally through the hold.',
    mistakes: ['Nodding the chin down to the chest instead of sliding back.', 'Tipping the head up or back.', 'Shrugging the shoulders or pushing hard enough to strain.'],
    easier: 'Lie on your back with a folded towel under your head and gently press the back of the head into it.',
    harder: 'Lying on your back, tuck, then lift the head just off the floor and hold a few seconds.',
    stretches: [],
  },
  doorway_stretch: {
    setup: ['Stand in a doorway and lift one arm out to the side, elbow bent 90° at shoulder height.', 'Rest that forearm and palm flat on the door frame.'],
    execution: [
      'Step one foot forward through the doorway until you feel a mild stretch across the chest and the front of the shoulder.',
      'Keep your chest up, ribs down and the shoulder away from your ear.',
      'Hold 30–60 s, step back and switch arms; twice each side.',
    ],
    breathing: 'Breathe slowly and ease a little further into the stretch each time you breathe out.',
    mistakes: ['Stepping so far that the front of the shoulder pinches.', 'Arching the low back or poking the head forward.', 'Shrugging the shoulder up.'],
    easier: 'Take a smaller step, or set the elbow a little lower on the frame.',
    harder: 'Set the elbow a little higher, or turn your chest slightly away from the arm.',
    stretches: [],
  },
  cross_body_stretch: {
    setup: ['Stand or sit tall, shoulders relaxed.', 'Lift one straight arm to shoulder height and bring it across your chest.'],
    execution: [
      'Hold the arm just above the elbow with your other hand.',
      'Gently draw it closer to your chest until the back of the shoulder feels a mild stretch.',
      'Keep that shoulder down and your body facing forward. Hold 30–60 s, then switch; twice each side.',
    ],
    breathing: 'Breathe slowly; let the shoulder soften as you breathe out.',
    mistakes: ['Shrugging the shoulder toward the ear.', 'Turning the body to pull the arm further.', 'Pressing on the elbow joint itself or yanking the arm.'],
    easier: 'Let the arm sit a little below shoulder height and pull more gently.',
    harder: 'Press the arm lightly into your hand for 5 s, relax, then draw it a little further.',
    stretches: [],
  },
  wall_angel: {
    setup: [
      'Stand with your back to a wall, feet a small step away, knees soft.',
      'Head, upper back and seat touch the wall; ribs down so the low back doesn\'t arch.',
      'Raise your arms into a goalpost: elbows bent 90° at shoulder height, backs of the arms toward the wall.',
    ],
    execution: [
      'Slowly slide your arms up the wall only as far as they keep contact.',
      'Slide back down until the elbows are a little below shoulder height.',
      'Take about 3 s each way; 10 slow reps, twice.',
    ],
    breathing: 'Breathe out as the arms slide up, in as they come down.',
    mistakes: ['Arching the low back off the wall to get the arms higher.', 'Head poking forward away from the wall.', 'Shrugging the shoulders up toward the ears.'],
    easier: 'Lie on your back, knees bent, and slide the arms along the floor instead.',
    harder: 'Pause 3 s at the top, or stand with your heels closer to the wall.',
    stretches: [],
  },
  thoracic_extension: {
    setup: ['Sit on a sturdy chair whose back reaches the bottom of your shoulder blades; scoot forward if it is too high.', 'Feet flat, hands behind your head, elbows pointing forward.'],
    execution: [
      'Lean back over the top of the chair, bending through the upper back.',
      'Keep your ribs down and go only as far as is comfortable; pause 2 s.',
      'Come back up to sitting tall. 8 slow reps, twice.',
    ],
    breathing: 'Breathe out as you lean back, in as you come up.',
    mistakes: ['Arching from the low back or flaring the ribs.', 'Throwing the head back or pulling on the neck.', 'Moving fast or bouncing over the chair.'],
    easier: 'A smaller range, with your arms crossed over your chest.',
    harder: 'Reach the arms overhead as you lean back, or do it lying over a foam roller.',
    stretches: [],
  },
  open_book: {
    setup: ['Lie on your side, head on a pillow or folded towel.', 'Bend your hips and knees to about 90° and stack them; arms straight out in front at shoulder height, palms together.'],
    execution: [
      'Sweep the top arm up and over to the other side, turning your chest toward the ceiling; follow the hand with your eyes.',
      'Open only as far as is comfortable, knees staying together; pause 2–3 s.',
      'Bring the arm back to the start. 8 slow reps, then turn over and do the other side.',
    ],
    breathing: 'Breathe out as you open, in as you bring the arm back.',
    mistakes: ['Knees sliding apart or the hips rolling back.', 'Forcing the arm down to the floor.', 'Rushing the turn.'],
    easier: 'Keep the top elbow bent with the hand on your chest and just turn the chest.',
    harder: 'Stay in the open position for 3 slow breaths each rep.',
    stretches: [],
  },
  thread_needle: {
    setup: ['On hands and knees, hands under your shoulders and knees under your hips.'],
    execution: [
      'Slide one arm under your body along the floor, palm up, letting that shoulder and the side of your head lower toward the floor.',
      'Then sweep the same arm up toward the ceiling, turning your chest open and following the hand with your eyes.',
      'Keep your hips over your knees. 8 slow reps on one side, then switch.',
    ],
    breathing: 'Breathe out as you thread the arm under, in as you reach up.',
    mistakes: ['Sitting the hips back or swaying them to the side.', 'Twisting from the low back instead of the upper back.', 'Dropping hard onto the shoulder or rushing.'],
    easier: 'Do only the thread-under part, with a cushion under your head.',
    harder: 'Pause 2–3 s at each end of the movement.',
    stretches: [],
  },
  lat_stretch: {
    setup: ['Kneel facing a chair or bench, a pad under your knees.', 'Rest both elbows on the seat about shoulder-width apart, palms together.'],
    execution: [
      'Sit your hips back toward your heels and let your chest sink below the seat.',
      'Stop at a mild stretch down the sides of your back and under the arms; keep your back flat.',
      'Hold 30–60 s, then come up slowly. Twice.',
    ],
    breathing: 'Breathe slowly; let your chest sink a little more each time you breathe out.',
    mistakes: ['Arching the low back and flaring the ribs.', 'Shrugging the shoulders up to the ears.', 'Pushing into a pinch at the front of the shoulder.'],
    easier: 'Sit back less, stopping at a gentle stretch.',
    harder: 'Let your hands drop behind your head as you sink, which also stretches the back of the arms.',
    stretches: [],
  },
  side_bend_stretch: {
    setup: ['Stand tall, feet hip-width, knees soft.', 'Reach one arm up beside your ear; rest the other hand on your thigh.'],
    execution: [
      'Lean gently away from the raised arm, reaching up and over.',
      'Keep your hips over your feet and your chest facing forward; stop at a mild stretch along the side.',
      'Hold 30 s, come up slowly and switch sides; twice each side.',
    ],
    breathing: 'Breathe slowly into the stretched side and ease a little further as you breathe out.',
    mistakes: ['Pushing the hips out to the side.', 'Leaning forward or twisting instead of straight to the side.', 'Sinking into the lower side instead of lengthening the top side.'],
    easier: 'Do it sitting on a chair, or keep the top hand resting on your head.',
    harder: 'Cross the foot on the stretching side behind the other, or hold the top wrist and draw it gently over.',
    stretches: [],
  },
  wrist_stretch: {
    setup: ['Stand or sit tall with one arm straight out in front at shoulder height.'],
    execution: [
      'Palm up (or facing away, fingers up): use the other hand to ease the fingers back toward you until the inside of the forearm stretches. Hold 30 s.',
      'Palm down: let the hand drop and press gently on the back of it until the top of the forearm stretches. Hold 30 s.',
      'Do both on each arm, twice.',
    ],
    breathing: 'Breathe slowly and let the hand relax as you breathe out.',
    mistakes: ['Locking the elbow hard.', 'Pulling into pain, numbness or tingling in the fingers.', 'Shrugging the shoulder up.'],
    easier: 'Bend the elbow slightly, or press the hand gently against a table instead.',
    harder: 'For the palm-down stretch, make a loose fist before pressing the hand down.',
    stretches: [],
  },
}

export const HEADS_MOBILITY_UPPER: Record<string, HeadSpec> = {
  neck_side_stretch: { prime: ['traps_upper', 'levator'], assist: ['traps_lower'], note: 'Also stretches the scalenes at the side of the neck; the lower traps keep the shoulder down.' },
  chin_tucks: { prime: ['neck_flexors'], assist: ['erectors'], note: 'The deep neck flexors draw the head back over the shoulders while the back of the neck lengthens.' },
  doorway_stretch: { prime: ['pec_mid', 'pec_minor', 'delt_front'], assist: ['traps_lower', 'rhomboids'], note: 'With the elbow at shoulder height the middle chest and pec minor stretch most.' },
  cross_body_stretch: { prime: ['delt_rear', 'rotator_cuff'], assist: ['traps_lower'], note: 'Stretches the back of the shoulder, including the infraspinatus and teres minor.' },
  wall_angel: {
    prime: ['traps_lower', 'traps_mid'], assist: ['serratus', 'rhomboids', 'rotator_cuff'], stabilize: ['rectus_abdominis', 'transverse_abdominis'],
    note: 'The lower traps and serratus turn the shoulder blades up as the arms rise; the abs keep the low back on the wall.',
  },
  thoracic_extension: { prime: ['erectors'], assist: ['traps_mid', 'traps_lower'], stabilize: ['rectus_abdominis'], note: 'Moves the stiff upper back into extension; the chest and stomach get a light stretch.' },
  open_book: { prime: ['pec_mid', 'delt_front', 'obliques'], assist: ['traps_mid', 'rhomboids'], stabilize: ['adductors'], note: 'The upper back turns while the knees stay stacked; the chest stretches as the arm opens.' },
  thread_needle: {
    prime: ['delt_rear', 'rhomboids', 'traps_mid'], assist: ['serratus', 'delt_front', 'obliques'], stabilize: ['transverse_abdominis'],
    note: 'Threading under stretches the back of the shoulder and between the shoulder blades; the reach up turns the upper back the other way.',
  },
  lat_stretch: { prime: ['lats', 'teres_major'], assist: ['transverse_abdominis'], note: 'The abs stop the low back arching; with the hands behind the head the long head of the triceps stretches too.' },
  side_bend_stretch: { prime: ['lats', 'obliques', 'quadratus_lumborum'], assist: ['glute_med'], note: 'Stretches the side of the trunk from hip to armpit on the raised-arm side.' },
  wrist_stretch: { prime: ['forearms', 'wrist_extensors'], assist: ['delt_front'], note: 'Palm up stretches the wrist and finger flexors; palm down stretches the extensors on top of the forearm.' },
}
