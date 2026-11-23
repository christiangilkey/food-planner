// Balance training, planned on balance days. `support: true` means it can be done holding a
// counter, so it stays in the plan with the "balance problems" limitation.
// Diagram coordinates follow src/lib/pose.ts: 200 × 200 frames, floor at y = 190, a flat foot's
// ankle at y = 186, angles absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../../lib/pose'
import type { Exercise, HeadId, HeadSpec } from '../exercises'
import type { FormGuide } from '../form'

const bal = (id: string, name: string, hold: string, cue: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, kind: 'balance', gear: ['bodyweight'], primary: [], secondary: [], compound: false, regions: [], hold, cue, support: true, stress: ['balance'], ...extra })

// Easiest first.
export const EX_BALANCE: Exercise[] = [
  bal('sit_to_stand', 'Sit-to-stand', '2 × 10', 'From a firm chair, lean forward and stand up without using your hands, then sit down slowly.', { stress: [] }),
  bal('tandem_stance', 'Heel-to-toe stand', '3 × 30 s each way', 'Stand with one foot directly in front of the other, heel touching toe, next to a counter.'),
  bal('side_steps', 'Side steps', '3 lengths of 10 steps', 'Step sideways along a counter, feet together then apart, toes pointing forward.'),
  bal('heel_toe_walk', 'Heel-to-toe walk', '3 lengths of 10 steps', 'Walk in a straight line, placing each heel right in front of the other toes, along a counter or wall.'),
  bal('single_leg_stand', 'Single-leg stand', '3 × 30 s each leg', 'Stand on one foot next to a counter, knee soft, and touch the counter only when you need to.'),
  bal('standing_side_raise', 'Standing side leg raise', '2 × 10 each side', 'Hold a counter and lift one straight leg out to the side without leaning, then lower slowly.'),
  bal('single_leg_calf_raise', 'Single-leg calf raise', '2 × 10 each leg', 'On one foot with a hand on a wall, rise onto the ball of the foot and lower slowly.'),
  bal('clock_reach', 'Single-leg clock reach', '2 × 5 reaches each leg', 'On one leg, tap the other foot lightly to the front, side and back, like the hands of a clock.'),
  bal('eyes_closed_stand', 'Single-leg stand, eyes closed', '3 × 15–30 s each leg', 'Once 30 seconds on one leg is easy, try it with your eyes closed, within arm’s reach of a counter.', { support: false }),
]

const G = 186

// Copied from ../diagrams.ts and ./core.ts (importing diagrams.ts would make a cycle).
const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })
// Arms folded across the chest, whatever the torso angle.
const folded = (torso: number): [number, number] => [torso + 190, torso - 15]

// A kitchen counter in front of the figure: the top at hip height, the cupboard front set back under it.
const COUNTER: Prop[] = [{ t: 'pad', a: [110, 114], b: [194, 114] }, { t: 'line', a: [116, 118], b: [116, 190] }]
// A hand resting on that counter's front edge, or hovering just above it, for a figure standing at x = 92.
const ON_COUNTER: SidePose['arm'] = { to: [112, 108], bend: 'down' }
const OVER_COUNTER: SidePose['arm'] = { to: [112, 100], bend: 'down' }
// A long counter running alongside the figure (drawn behind it), for walking, stepping and reaching drills.
const COUNTER_ALONG: Prop[] = [{ t: 'pad', a: [14, 114], b: [186, 114] }, { t: 'line', a: [20, 118], b: [20, 190] }, { t: 'line', a: [180, 118], b: [180, 190] }]
// A firm chair seen from the side, facing right.
const CHAIR: Prop[] = [
  { t: 'pad', a: [70, 158], b: [108, 158] }, { t: 'pad', a: [72, 154], b: [72, 100] },
  { t: 'line', a: [74, 162], b: [74, 190] }, { t: 'line', a: [104, 162], b: [104, 190] },
]
// The far foot lifted off the floor behind, knee bent.
const LIFT: SidePose['leg'] = [12, -70, 10]
// Front view, hands resting on the counter top at hip height.
const ARMS_ON_TOP: [number, number] = [26, 26]

export const DIAGRAMS_BALANCE: Record<string, Diagram> = {
  // Arms crossed, nose over toes, then straight up in front of the chair.
  sit_to_stand: {
    start: { at: ['hip', 90, 150], torso: 145, arm: folded(145), leg: { to: [122, G], bend: 'up' } },
    end: stand(122, { arm: folded(180) }),
    props: CHAIR,
    labels: ['Lean forward', 'Stand up'],
  },
  // The back foot steps behind so its toes touch the front heel.
  tandem_stance: {
    start: stand(96, { arm: ON_COUNTER }),
    end: { at: ['hip', 88, 113], torso: 180, arm: ON_COUNTER, leg: { to: [96, G], bend: 'front' }, leg2: { to: [80, G], bend: 'front' } },
    props: COUNTER,
    labels: ['Feet together', 'Heel to toe'],
  },
  // Seen from the front, facing the counter, hands on its top; the right foot steps out.
  side_steps: {
    start: { view: 'front', at: ['ankle2', 84, G], arm: ARMS_ON_TOP, leg: [-3, -3] },
    end: { view: 'front', at: ['ankle2', 84, G], arm: ARMS_ON_TOP, leg: [12, 0], leg2: [-12, 0] },
    props: COUNTER_ALONG,
    labels: ['Feet together', 'Step out'],
  },
  // Heel to toe with a hand on the counter, then the back foot swings through to go in front.
  heel_toe_walk: {
    start: { at: ['hip', 92, 113], torso: 180, arm: { to: [106, 109], bend: 'back' }, leg: { to: [100, G], bend: 'front' }, leg2: { to: [84, G], bend: 'front' } },
    end: { at: ['hip', 100, 112.5], torso: 180, arm: { to: [114, 109], bend: 'back' }, leg: { to: [100, G], bend: 'front' }, leg2: { to: [114, 176], bend: 'front' } },
    props: COUNTER_ALONG,
    labels: ['Heel to toe', 'Next step'],
  },
  // Hands on the counter, then one foot up and the hands just clear of it.
  single_leg_stand: {
    start: stand(92, { arm: ON_COUNTER }),
    end: stand(92, { arm: OVER_COUNTER, leg2: LIFT }),
    props: COUNTER,
    labels: ['Hands on counter', 'Lift one foot'],
  },
  // Seen from the front, hands on the counter; the right leg lifts straight out, the body stays upright.
  standing_side_raise: {
    start: { view: 'front', at: ['ankle2', 92, G], arm: ARMS_ON_TOP, leg: [-2, -2] },
    end: { view: 'front', at: ['ankle2', 92, G], arm: ARMS_ON_TOP, leg: [32, 32], leg2: [2, 2] },
    props: COUNTER_ALONG,
    labels: ['Stand tall', 'Lift to the side'],
  },
  // On one foot, a hand on the wall; the ankle rises so the ball of the foot stays where the toes were.
  single_leg_calf_raise: {
    start: stand(92, { arm: { to: [122, 76], bend: 'down' }, leg2: LIFT }),
    end: { at: ['ankle', 94.4, 178.5], torso: 180, arm: { to: [122, 76], bend: 'down' }, leg: [0, 0, 55], leg2: LIFT },
    props: [{ t: 'line', a: [124, 24], b: [124, 190] }],
    labels: ['On one foot', 'Rise up'],
  },
  // Far knee soft and standing; the near foot taps in front, then behind (the side tap can't be seen from here).
  clock_reach: {
    start: { at: ['hip', 98, 119], torso: 180, arm: { to: [112, 110], bend: 'back' }, leg: { to: [128, 181.5], bend: 'front', foot: 70 }, leg2: { to: [96, G], bend: 'front' } },
    end: { at: ['hip', 98, 119], torso: 176, arm: { to: [112, 110], bend: 'back' }, leg: { to: [64, 179.5], bend: 'front', foot: 60 }, leg2: { to: [96, G], bend: 'front' } },
    props: COUNTER_ALONG,
    labels: ['Tap in front', 'Tap behind'],
  },
  // Arms relaxed with the counter within reach; then one foot up and eyes closed.
  eyes_closed_stand: {
    start: stand(92, { arm: [6, 4] }),
    end: stand(92, { arm: [6, 4], leg2: LIFT }),
    props: COUNTER,
    labels: ['Set up', 'Eyes closed'],
  },
}

export const FORM_BALANCE: Record<string, FormGuide> = {
  sit_to_stand: {
    setup: [
      'Push a firm chair without arms back against a wall so it can’t slide, and clear the floor around it.',
      'Sit near the front of the seat, feet flat and hip-width apart, slightly behind your knees.',
      'Cross your arms over your chest.',
    ],
    execution: [
      'Lean forward from your hips until your nose is over your toes.',
      'Press through your whole foot and stand up tall without using your hands.',
      'Reach your bottom back and sit down slowly, taking about 3 seconds.',
      'Do 10, rest for a minute, then do 10 more.',
    ],
    breathing: 'Breathe out as you stand up and in as you sit down.',
    mistakes: ['Pushing off your thighs or the chair with your hands.', 'Dropping into the seat instead of lowering slowly.', 'Knees falling in toward each other as you rise.'],
    safety: { text: 'In a large review of trials, programmes of balance and everyday-movement exercises like this one cut falls in older people living at home.', sources: ['sherrington_falls'] },
    easier: 'Use a higher seat or add a firm cushion, or push lightly off the chair with your hands.',
    harder: 'Hover just above the seat for 2 seconds before standing again, or use a lower chair.',
    stretches: [],
  },
  tandem_stance: {
    setup: ['Stand facing a kitchen counter, close enough to rest your hands on it, with the floor around you clear.'],
    execution: [
      'Put one foot straight in front of the other, so the front heel touches the toes of the back foot.',
      'Stand tall, look at a spot straight ahead, and lighten your touch until only your fingertips rest on the counter.',
      'Hold for 30 seconds, then swap which foot is in front. Do 3 holds each way.',
    ],
    breathing: 'Breathe slowly and normally all through the hold.',
    mistakes: ['Leaving a gap, or setting the feet slightly side by side instead of in one line.', 'Gripping the counter hard the whole time.', 'Looking down at your feet.'],
    easier: 'Put the front foot half a step to the side, so it sits beside the back foot’s toes instead of in line with them.',
    harder: 'Let go of the counter, then try turning your head slowly from side to side or closing your eyes.',
    stretches: [],
  },
  side_steps: {
    setup: ['Face a long kitchen counter with both hands resting on top, and clear the floor along it.'],
    execution: [
      'Step one foot out to the side, then bring the other foot in to meet it.',
      'Keep your toes pointing at the counter and your body upright; don’t let your feet cross.',
      'Take 10 steps along the counter, then 10 back the other way; that’s one length. Do 3 lengths.',
    ],
    breathing: 'Breathe normally as you step.',
    mistakes: ['Turning your toes out, so you walk forward instead of sideways.', 'Leaning your upper body into each step.', 'Rushing, so your feet clip or cross.'],
    easier: 'Take smaller steps and keep a firm hold on the counter.',
    harder: 'Rest only your fingertips on the counter, take bigger, slower steps, or bend your knees a little.',
    stretches: [],
  },
  heel_toe_walk: {
    setup: ['Walk alongside a kitchen counter or wall so one hand can touch it, with a clear path of at least 10 steps.'],
    execution: [
      'Place one foot in front of the other so the heel touches the toes of the back foot.',
      'Look ahead rather than down, and keep a light touch on the counter or wall.',
      'Take 10 steps, turn carefully, and walk back. Do 3 lengths.',
    ],
    breathing: 'Breathe steadily as you walk.',
    mistakes: ['Leaving gaps between heel and toe.', 'Rushing the steps.', 'Watching your feet instead of looking ahead.'],
    easier: 'Leave a small gap between heel and toe, or let your feet sit slightly apart.',
    harder: 'Walk without touching the counter, or turn your head slowly from side to side as you go.',
    stretches: [],
  },
  single_leg_stand: {
    setup: ['Stand facing a kitchen counter with both hands resting on it, feet hip-width apart and the floor clear.'],
    execution: [
      'Shift your weight onto one foot and lift the other just off the floor, keeping the standing knee soft.',
      'Stand tall and lift your hands just clear of the counter; touch it only if you start to tip.',
      'Hold for up to 30 seconds, then change legs. Do 3 holds on each leg.',
    ],
    breathing: 'Breathe slowly and normally; don’t hold your breath.',
    mistakes: ['Locking the standing knee.', 'Leaning to one side or letting the hip drop.', 'Resting the lifted foot against the standing leg.'],
    safety: { text: 'In a review of trials in healthy older adults, balance training worked best at about 3 sessions a week, kept up for 11 to 12 weeks.', sources: ['lesinski_balance'] },
    easier: 'Keep a light hold on the counter, or rest the toes of the lifted foot on the floor.',
    harder: 'Stand on a folded towel or cushion, cross your arms, or turn your head slowly from side to side.',
    stretches: [],
  },
  standing_side_raise: {
    setup: ['Stand facing a kitchen counter with both hands resting on top, feet together and the floor clear.'],
    execution: [
      'Stand tall with your toes pointing forward.',
      'Lift one straight leg out to the side, only as far as you can without leaning.',
      'Lower it slowly over 2 to 3 seconds. Do 10, then switch sides; 2 sets on each side.',
    ],
    breathing: 'Breathe out as you lift and in as you lower.',
    mistakes: ['Leaning the body the other way to get the leg higher.', 'Turning the toes up toward the ceiling.', 'Swinging the leg up and letting it drop.'],
    easier: 'Make the lift smaller and keep a firm hold of the counter.',
    harder: 'Rest only your fingertips on the counter, or pause for 2 seconds at the top.',
    stretches: [],
  },
  single_leg_calf_raise: {
    setup: ['Stand facing a wall, close enough to rest a hand on it at chest height, with the floor clear.'],
    execution: [
      'Lift one foot off the floor behind you and balance on the other.',
      'Rise slowly onto the ball of your foot as high as you can, keeping the knee straight.',
      'Lower your heel slowly back to the floor, taking about 3 seconds. Do 10, then switch legs; 2 sets each leg.',
    ],
    breathing: 'Breathe out as you rise and in as you lower.',
    mistakes: ['Rolling out onto your little toes.', 'Bouncing up and down quickly.', 'Pushing hard on the wall to lift yourself.'],
    easier: 'Rise up on both feet instead of one.',
    harder: 'Touch the wall with one fingertip only, or pause for 2 seconds at the top.',
    stretches: [],
  },
  clock_reach: {
    setup: ['Stand beside a kitchen counter with one hand resting on it, and clear the floor around you.'],
    execution: [
      'Stand on one leg with the knee slightly bent.',
      'Reach the other foot forward and tap the floor lightly, bring it back, then tap out to the side, then behind you, like the hands of a clock.',
      'Front, side and back make one reach. Do 5, then switch legs; 2 sets on each leg.',
    ],
    breathing: 'Breathe normally, letting the breath out as you reach.',
    mistakes: ['Putting weight on the tapping foot.', 'Leaning your body instead of bending the standing hip and knee.', 'Letting the standing knee roll inward.'],
    easier: 'Make the reaches shorter and keep a firm hold of the counter.',
    harder: 'Reach farther, or stand on a folded towel.',
    stretches: [],
  },
  eyes_closed_stand: {
    setup: [
      'Only try this once you can stand on one leg for 30 seconds with your eyes open.',
      'Stand facing a kitchen counter, close enough to grab it, with the floor clear around you.',
    ],
    execution: [
      'Lift one foot and find your balance with your eyes open, arms relaxed.',
      'Close your eyes and hold; open them or touch the counter as soon as you start to tip.',
      'Hold for 15 to 30 seconds, then switch legs. Do 3 holds on each leg.',
    ],
    breathing: 'Breathe slowly and steadily through the hold.',
    mistakes: ['Closing your eyes before you feel steady.', 'Fighting a big wobble instead of touching the counter.', 'Locking the standing knee.'],
    easier: 'Try it with your eyes closed standing heel to toe on two feet first.',
    harder: 'Hold for longer, or stand on a folded towel.',
    stretches: [],
  },
}

const VASTI: HeadId[] = ['vastus_lateralis', 'vastus_medialis', 'vastus_intermedius']

export const HEADS_BALANCE: Record<string, HeadSpec> = {
  sit_to_stand: { prime: [...VASTI, 'glute_max'], assist: ['rectus_femoris', 'adductors', 'erectors'], stabilize: ['tibialis', 'soleus', 'transverse_abdominis'], note: 'Leaning forward first brings your weight over your feet, so the thighs and buttocks can lift you.' },
  tandem_stance: { prime: ['foot_ankle', 'glute_med'], assist: ['adductors', 'tibialis', 'soleus'], stabilize: ['transverse_abdominis', 'obliques'], note: 'The narrow stance makes side-to-side sway hard to control, so the ankles and the sides of the hips do most of the correcting.' },
  side_steps: { prime: ['glute_med', 'tfl'], assist: ['adductors', 'foot_ankle'], stabilize: ['quadratus_lumborum', 'obliques', 'transverse_abdominis'], note: 'The side of the hip moves you sideways and keeps the pelvis level each time you are on one foot.' },
  heel_toe_walk: { prime: ['foot_ankle', 'glute_med'], assist: ['tibialis', 'soleus', 'adductors'], stabilize: ['obliques', 'transverse_abdominis'], note: 'Like the heel-to-toe stand, but you rebalance on a narrow base with every step.' },
  single_leg_stand: { prime: ['glute_med', 'foot_ankle'], assist: ['soleus', 'tibialis', 'hip_rotators'], stabilize: ['quadratus_lumborum', 'obliques', 'transverse_abdominis'], note: 'The side of the standing hip keeps the pelvis level while the ankle makes small corrections.' },
  standing_side_raise: { prime: ['glute_med', 'tfl'], assist: ['glute_max', 'obliques'], stabilize: ['foot_ankle', 'quadratus_lumborum', 'transverse_abdominis'], note: 'Both hips work: one side lifts the leg while the standing side keeps the pelvis level.' },
  single_leg_calf_raise: { prime: ['gastrocnemius', 'soleus'], assist: ['foot_ankle'], stabilize: ['glute_med', 'tibialis'], note: 'With the knee straight the gastrocnemius does most of the lifting, while the ankle stabilisers stop the foot rolling.' },
  clock_reach: { prime: ['glute_med', 'glute_max', 'foot_ankle'], assist: [...VASTI, 'hip_rotators', 'soleus'], stabilize: ['obliques', 'transverse_abdominis'], note: 'The standing leg does the work; the moving foot only taps.' },
  eyes_closed_stand: { prime: ['foot_ankle', 'glute_med'], assist: ['soleus', 'tibialis', 'hip_rotators'], stabilize: ['quadratus_lumborum', 'obliques'], note: 'With your eyes shut, your feet and ankles have to sense and correct every sway on their own.' },
}
