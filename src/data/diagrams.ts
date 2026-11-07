// Start and finish stick figures for every exercise and drill. Coordinates and angles follow
// src/lib/pose.ts: frames are 200 × 200, the floor is at y = 190, a flat foot's ankle at y = 186,
// angles are absolute (0 down, 90 forward, 180 up, -90 back).
import type { Diagram, Prop, SidePose } from '../lib/pose'

const G = 186

const stand = (x = 100, extra: Partial<SidePose> = {}): SidePose => ({ at: ['ankle', x, G], torso: 180, arm: [0, 0], leg: [0, 0], ...extra })

// Equipment pieces used more than once.
const benchFlat = (x1: number, x2: number, y: number): Prop[] => [
  { t: 'pad', a: [x1, y], b: [x2, y] },
  { t: 'line', a: [x1 + 10, y + 4], b: [x1 + 10, 190] },
  { t: 'line', a: [x2 - 10, y + 4], b: [x2 - 10, 190] },
]
const tower = (x: number, top = 10): Prop => ({ t: 'line', a: [x, top], b: [x, 190] })

// Lying on a flat bench, head to the left, feet on the floor.
const benchLie = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 127, 126], torso: 270, arm, leg: { to: [150, G], bend: 'up' } })
// Sitting on a 30° incline bench.
const inclineSit = (arm: SidePose['arm']): SidePose => ({ at: ['hip', 120, 143], torso: 240, arm, leg: { to: [157, G], bend: 'up' } })
const inclineBench: Prop[] = [{ t: 'pad', a: [118, 152], b: [66, 122] }, { t: 'pad', a: [104, 152], b: [140, 152] }, { t: 'line', a: [125, 156], b: [125, 190] }]
// Sitting upright on a bench or machine seat.
const seated = (arm: SidePose['arm'], extra: Partial<SidePose> = {}): SidePose => ({ at: ['hip', 88, 150], torso: 180, arm, leg: { to: [126, G], bend: 'up' }, ...extra })
const uprightSeat: Prop[] = [{ t: 'pad', a: [74, 158], b: [112, 158] }, { t: 'pad', a: [80, 154], b: [80, 94] }, { t: 'line', a: [92, 162], b: [92, 190] }]
// Push-up plank on the hands, and at the bottom.
const plankTop = (): SidePose => ({ at: ['ankle', 39, 181], torso: 112, arm: [0, 0], leg: [-68, -68, 50] })
const plankLow = (): SidePose => ({ at: ['ankle', 39, 181], torso: 100, arm: { to: [150, 186], bend: 'back' }, leg: [-80, -80, 50] })
// Hip hinge with a soft knee: hips back, back flat.
const hinge = (arm: SidePose['arm'] = [-8, -8]): SidePose => ({ at: ['ankle', 100, G], torso: 125, arm, leg: [35, 5] })
// Bottom of a squat.
const squatLow = (torso: number, arm: SidePose['arm']): SidePose => ({ at: ['ankle', 100, G], torso, arm, leg: [80, -25] })
// Lying on the floor, head to the left.
const floorLie = (extra: Partial<SidePose>): SidePose => ({ at: ['shoulder', 58, 180], torso: -90, arm: [90, 90], leg: [90, 90, 180], ...extra })

export const DIAGRAMS: Record<string, Diagram> = {
  // ── Chest ──
  bench: {
    start: benchLie([180, 180]), end: benchLie({ to: [100, 114], bend: 'down' }),
    props: [...benchFlat(48, 142, 134), { t: 'plate', at: 'hand' }],
  },
  incline_db: {
    start: inclineSit([180, 180]), end: inclineSit({ to: [102, 110], bend: 'down' }),
    props: [...inclineBench, { t: 'db', at: 'hand' }],
  },
  db_bench: {
    start: benchLie([180, 180]), end: benchLie({ to: [100, 116], bend: 'down' }),
    props: [...benchFlat(48, 142, 134), { t: 'db', at: 'hand' }],
  },
  machine_press: {
    start: seated({ to: [104, 114], bend: 'down' }), end: seated([93, 93]),
    props: [...uprightSeat, { t: 'line', a: 'hand', b: [170, 58] }, tower(170, 58), { t: 'bar', at: 'hand' }],
  },
  cable_fly: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [112, 112] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [-20, -45], reach: 0.6 },
    props: [tower(188, 20), tower(12, 20), { t: 'cable', from: [188, 24], to: 'hand' }, { t: 'cable', from: [12, 24], to: 'hand2' }],
  },
  db_fly: {
    start: { view: 'front', at: ['ankle', 111, G], bend: 0.75, arm: [-174, -178] },
    end: { view: 'front', at: ['ankle', 111, G], bend: 0.75, arm: [95, 100] },
    props: [{ t: 'pad', a: [100, 116], b: [100, 50], w: 30 }, { t: 'db', at: 'hand', angle: 90 }, { t: 'db', at: 'hand2', angle: 90 }],
  },
  pushup: { start: plankTop(), end: plankLow() },
  dip: {
    start: { at: ['shoulder', 100, 50], torso: 175, arm: [0, 0], leg: [5, -70] },
    end: { at: ['shoulder', 106, 78], torso: 158, arm: { to: [100, 100], bend: 'back' }, leg: [-20, -100] },
    props: [{ t: 'pad', a: [72, 103], b: [136, 103], w: 6 }, { t: 'line', a: [78, 106], b: [78, 190] }, { t: 'line', a: [130, 106], b: [130, 190] }],
  },

  // ── Back ──
  pulldown: {
    start: { at: ['hip', 95, 150], torso: 183, arm: [176, 178], leg: { to: [133, G], bend: 'up' } },
    end: { at: ['hip', 95, 150], torso: 192, arm: { to: [100, 106], bend: 'down' }, leg: { to: [133, G], bend: 'up' } },
    props: [
      { t: 'pad', a: [80, 158], b: [112, 158] }, { t: 'line', a: [96, 162], b: [96, 190] },
      { t: 'roller', at: ['knee', -6, -10], r: 6 }, tower(160, 8), { t: 'line', a: [96, 8], b: [160, 8] },
      { t: 'cable', from: [96, 10], to: 'hand' }, { t: 'bar', at: 'hand' },
    ],
  },
  pullup: {
    start: { at: ['hand', 100, 22], torso: 180, arm: [180, 180], leg: [10, -30] },
    end: { at: ['shoulder', 98, 38], torso: 184, arm: { to: [100, 22], bend: 'down' }, leg: [10, -30] },
    props: [{ t: 'line', a: [40, 22], b: [160, 22] }, { t: 'bar', at: [100, 22] }],
    noFloor: true,
  },
  cable_row: {
    start: { at: ['hip', 70, 160], torso: 165, arm: [110, 110], leg: { to: [142, 162], bend: 'up', foot: 175 } },
    end: { at: ['hip', 70, 160], torso: 182, arm: { to: [94, 138], bend: 'back' }, leg: { to: [142, 162], bend: 'up', foot: 175 } },
    props: [
      { t: 'pad', a: [40, 168], b: [148, 168] }, { t: 'line', a: [150, 140], b: [150, 176] },
      tower(172, 40), { t: 'cable', from: [172, 150], to: 'hand' }, { t: 'bar', at: 'hand' },
    ],
  },
  db_row: {
    start: { at: ['hip', 75, 113], torso: 100, arm: [10, 10], arm2: [0, 0], leg: { to: [78, G], bend: 'front' }, leg2: [0, -90, -90] },
    end: { at: ['hip', 75, 113], torso: 100, arm: { to: [102, 118], bend: 'up' }, arm2: [0, 0], leg: { to: [78, G], bend: 'front' }, leg2: [0, -90, -90] },
    props: [...benchFlat(26, 140, 156), { t: 'db', at: 'hand' }],
  },
  chest_row: {
    start: { at: ['hip', 85, 150], torso: 150, arm: [80, 80], leg: { to: [118, G], bend: 'up' } },
    end: { at: ['hip', 85, 150], torso: 150, arm: { to: [106, 130], bend: 'back' }, leg: { to: [118, G], bend: 'up' } },
    props: [
      { t: 'pad', a: [70, 158], b: [104, 158] }, { t: 'line', a: [88, 162], b: [88, 190] },
      { t: 'pad', a: [104, 138], b: [124, 102] }, { t: 'line', a: 'hand', b: [168, 150] }, tower(168, 150), { t: 'bar', at: 'hand' },
    ],
  },
  band_row: {
    start: stand(80, { arm: [90, 90] }), end: stand(80, { arm: { to: [88, 92], bend: 'back' } }),
    props: [tower(176, 40), { t: 'band', from: [176, 70], to: 'hand' }],
  },
  inverted_row: {
    start: { at: ['ankle', 35, 183], torso: 106, arm: { to: [150, 100], bend: 'down' }, leg: [-74, -74, 160] },
    end: { at: ['ankle', 35, 183], torso: 127, arm: { to: [150, 100], bend: 'down' }, leg: [-53, -53, 160] },
    props: [{ t: 'pad', a: [142, 96], b: [196, 96] }, { t: 'line', a: [190, 100], b: [190, 190] }, { t: 'bar', at: [150, 100] }],
  },

  // ── Shoulders ──
  ohp: {
    start: seated({ to: [96, 98], bend: 'down' }), end: seated([180, 180]),
    props: [...uprightSeat, { t: 'db', at: 'hand' }],
  },
  machine_ohp: {
    start: seated({ to: [96, 98], bend: 'down' }), end: seated([180, 180]),
    props: [...uprightSeat, { t: 'line', a: 'hand', b: [30, 30] }, tower(30, 30), { t: 'bar', at: 'hand' }],
  },
  lateral: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [8, 4] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [86, 92] },
    props: [{ t: 'db', at: 'hand', angle: 90 }, { t: 'db', at: 'hand2', angle: 90 }],
  },
  cable_lateral: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [-15, -15], arm2: [-80, -80] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [86, 92], arm2: [-80, -80] },
    props: [tower(34, 30), { t: 'cable', from: [34, 172], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  rear_fly: {
    // Seen from the side, the arms swing out toward you, so they look short at the top.
    start: { at: ['ankle', 100, G], torso: 108, arm: [0, 0], leg: [30, 5] },
    end: { at: ['ankle', 100, G], torso: 108, arm: [30, 40], leg: [30, 5], reach: 0.3 },
    props: [{ t: 'db', at: 'hand', angle: 90 }],
  },
  face_pull: {
    start: stand(70, { arm: [104, 100] }), end: stand(70, { arm: { to: [80, 52], bend: 'back' } }),
    props: [tower(178, 20), { t: 'cable', from: [178, 52], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  pike_pushup: {
    start: { at: ['hip', 100, 114], torso: 60, arm: [5, 5], leg: [-25, -25, 40] },
    end: { at: ['hip', 100, 114], torso: 40, arm: { to: [144, 186], bend: 'back' }, leg: [-25, -25, 40] },
  },
  band_pull_apart: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [-70, -75], reach: 0.42 },
    end: { view: 'front', at: ['ankle', 111, G], arm: [90, 90] },
    props: [{ t: 'band', from: 'hand2', to: 'hand' }],
  },

  // ── Arms ──
  db_curl: { start: stand(), end: stand(100, { arm: [8, 160] }), props: [{ t: 'db', at: 'hand' }] },
  incline_curl: {
    start: { at: ['hip', 120, 146], torso: 215, arm: [0, 0], leg: { to: [156, G], bend: 'up' } },
    end: { at: ['hip', 120, 146], torso: 215, arm: [0, 170], leg: { to: [156, G], bend: 'up' } },
    props: [{ t: 'pad', a: [114, 154], b: [80, 104] }, { t: 'pad', a: [108, 154], b: [146, 154] }, { t: 'line', a: [128, 158], b: [128, 190] }, { t: 'db', at: 'hand' }],
  },
  cable_curl: {
    start: stand(90, { arm: [5, 5] }), end: stand(90, { arm: [8, 160] }),
    props: [tower(172, 30), { t: 'cable', from: [172, 182], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  hammer_curl: { start: stand(), end: stand(100, { arm: [8, 160] }), props: [{ t: 'db', at: 'hand', angle: 90 }] },
  band_curl: {
    start: stand(100, { arm: [5, 5] }), end: stand(100, { arm: [8, 160] }),
    props: [{ t: 'band', from: ['ankle', 6, 3], to: 'hand' }],
  },
  pressdown: {
    start: stand(96, { torso: 172, arm: [6, 110] }), end: stand(96, { torso: 172, arm: [4, 4] }),
    props: [{ t: 'line', a: [134, 8], b: [164, 8] }, tower(164, 8), { t: 'cable', from: [134, 12], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  overhead_ext: {
    start: stand(100, { arm: [180, 180] }), end: stand(100, { arm: [175, -40] }),
    props: [{ t: 'db', at: 'hand', angle: 90 }],
  },
  cable_overhead: {
    start: { at: ['hip', 110, 116], torso: 155, arm: [150, -120], leg: { to: [128, G], bend: 'front' }, leg2: { to: [88, G], bend: 'front' } },
    end: { at: ['hip', 110, 116], torso: 155, arm: [150, 150], leg: { to: [128, G], bend: 'front' }, leg2: { to: [88, G], bend: 'front' } },
    props: [tower(18, 20), { t: 'cable', from: [18, 30], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  close_pushup: { start: plankTop(), end: plankLow() },
  bench_dip: {
    start: { at: ['shoulder', 78, 92], torso: 180, arm: { to: [78, 142], bend: 'back' }, leg: { to: [135, 184], bend: 'up', foot: 150 } },
    end: { at: ['shoulder', 82, 116], torso: 180, arm: { to: [78, 142], bend: 'back' }, leg: { to: [135, 184], bend: 'up', foot: 150 } },
    props: [{ t: 'pad', a: [18, 146], b: [76, 146] }, { t: 'line', a: [28, 150], b: [28, 190] }, { t: 'line', a: [66, 150], b: [66, 190] }],
  },

  // ── Legs ──
  squat: {
    start: stand(100, { arm: { to: [95, 64], bend: 'down' } }),
    end: squatLow(145, { to: [99, 107], bend: 'down' }),
    props: [{ t: 'plate', at: ['shoulder', -7, 1], r: 10 }],
  },
  leg_press: {
    start: { at: ['hip', 80, 150], torso: 225, arm: [-30, 60], leg: { to: [106, 124], bend: 'up', foot: 225 } },
    end: { at: ['hip', 80, 150], torso: 225, arm: [-30, 60], leg: [135, 135, 225] },
    props: [
      { t: 'pad', a: [76, 158], b: [36, 118] }, { t: 'line', a: [60, 160], b: [60, 190] }, { t: 'line', a: [100, 146], b: [172, 74] }, { t: 'line', a: [100, 146], b: [100, 190] },
      { t: 'pad', a: ['ankle', -7, -16], b: ['ankle', 16, 7], w: 6 },
    ],
  },
  goblet: {
    start: stand(100, { arm: { to: [110, 80], bend: 'down' } }),
    end: squatLow(155, { to: [107, 118], bend: 'down' }),
    props: [{ t: 'db', at: ['hand', 1, -5], angle: 90 }],
  },
  split_squat: {
    start: { at: ['hip', 90, 120], torso: 176, arm: [0, 0], leg: { to: [120, G], bend: 'front' }, leg2: { to: [56, 134], bend: 'down', foot: -90 } },
    end: { at: ['hip', 82, 148], torso: 172, arm: [0, 0], leg: { to: [120, G], bend: 'front' }, leg2: { to: [56, 134], bend: 'down', foot: -90 } },
    props: [...benchFlat(18, 64, 140), { t: 'db', at: 'hand', angle: 90 }],
  },
  bw_split_squat: {
    start: { at: ['hip', 86, 122], torso: 178, arm: [0, 0], leg: { to: [120, G], bend: 'front' }, leg2: { to: [50, 180], bend: 'down', foot: 60 } },
    end: { at: ['hip', 82, 150], torso: 176, arm: [0, 0], leg: { to: [120, G], bend: 'front' }, leg2: { to: [50, 180], bend: 'down', foot: 60 } },
  },
  leg_ext: {
    start: { at: ['hip', 85, 140], torso: 186, arm: [10, 60], leg: [90, 0] },
    end: { at: ['hip', 85, 140], torso: 186, arm: [10, 60], leg: [90, 90, 180] },
    props: [
      { t: 'pad', a: [76, 148], b: [124, 148] }, { t: 'pad', a: [74, 144], b: [69, 92] }, { t: 'line', a: [80, 152], b: [80, 190] },
      { t: 'line', a: [124, 140], b: ['ankle', 4, 0] }, { t: 'roller', at: ['ankle', 4, 0], r: 6 },
    ],
  },
  rdl: { start: stand(), end: hinge(), props: [{ t: 'plate', at: 'hand' }] },
  db_rdl: { start: stand(), end: hinge(), props: [{ t: 'db', at: 'hand' }] },
  leg_curl: {
    start: { at: ['hip', 80, 140], torso: 190, arm: [10, 60], leg: [90, 70] },
    end: { at: ['hip', 80, 140], torso: 190, arm: [10, 60], leg: [90, -30] },
    props: [
      { t: 'pad', a: [66, 148], b: [120, 148] }, { t: 'pad', a: [70, 144], b: [62, 96] }, { t: 'line', a: [76, 152], b: [76, 190] },
      { t: 'roller', at: ['knee', -8, -9], r: 6 }, { t: 'line', a: [120, 140], b: ['ankle', -2, 6] }, { t: 'roller', at: ['ankle', -2, 6], r: 6 },
    ],
  },
  slider_curl: {
    start: { at: ['shoulder', 45, 180], torso: -78, arm: [90, 90], leg: { to: [162, 182], bend: 'up', foot: 170 } },
    end: { at: ['shoulder', 45, 180], torso: -61, arm: [90, 90], leg: { to: [122, 182], bend: 'up', foot: 170 } },
    props: [{ t: 'roller', at: ['heel', 0, 6], r: 4 }],
  },
  single_rdl: {
    start: stand(104, { leg2: [-5, -20] }),
    end: { at: ['ankle', 106, G], torso: 100, arm: [0, 0], leg: [15, 5], leg2: [-80, -80, -80] },
  },
  hip_thrust: {
    start: { at: ['shoulder', 62, 134], torso: 218, arm: { to: [92, 158], bend: 'down' }, leg: { to: [140, G], bend: 'up' } },
    end: { at: ['shoulder', 62, 134], torso: 270, arm: { to: [110, 124], bend: 'up' }, leg: { to: [140, G], bend: 'up' } },
    props: [...benchFlat(14, 62, 142), { t: 'plate', at: ['hip', 3, -14] }],
  },
  db_hip_thrust: {
    start: { at: ['shoulder', 62, 134], torso: 218, arm: { to: [92, 160], bend: 'down' }, leg: { to: [140, G], bend: 'up' } },
    end: { at: ['shoulder', 62, 134], torso: 270, arm: { to: [110, 126], bend: 'up' }, leg: { to: [140, G], bend: 'up' } },
    props: [...benchFlat(14, 62, 142), { t: 'db', at: ['hip', 3, -10] }],
  },
  glute_bridge: {
    start: { at: ['shoulder', 45, 180], torso: -88, arm: [90, 90], leg: { to: [135, G], bend: 'up' } },
    end: { at: ['shoulder', 45, 180], torso: -60, arm: [90, 90], leg: { to: [135, G], bend: 'up' } },
  },
  calf_raise: {
    start: { at: ['toe', 112, 172], torso: 180, arm: [0, 0], leg: [0, 0, 112] },
    end: { at: ['toe', 112, 172], torso: 180, arm: [0, 0], leg: [0, 0, 48] },
    props: [{ t: 'pad', a: [106, 178], b: [156, 178] }, { t: 'line', a: [150, 182], b: [150, 190] }],
  },
  machine_calf: {
    start: { at: ['toe', 112, 172], torso: 180, arm: { to: [96, 56], bend: 'down' }, leg: [0, 0, 112] },
    end: { at: ['toe', 112, 172], torso: 180, arm: { to: [96, 48], bend: 'down' }, leg: [0, 0, 48] },
    startProps: [{ t: 'roller', at: [99, 56], r: 6 }],
    endProps: [{ t: 'roller', at: [99, 48], r: 6 }],
    props: [{ t: 'pad', a: [106, 178], b: [156, 178] }, tower(40, 30), { t: 'line', a: [40, 50], b: ['shoulder', -2, -8] }],
  },

  // ── Core ──
  cable_crunch: {
    start: { at: ['knee', 100, 184], torso: 168, arm: { to: [114, 92], bend: 'down' }, leg: [0, -90, -90] },
    end: { at: ['knee', 100, 184], torso: 112, head: 30, arm: { to: [146, 128], bend: 'down' }, leg: [0, -90, -90] },
    props: [{ t: 'line', a: [140, 8], b: [180, 8] }, tower(180, 8), { t: 'cable', from: [140, 12], to: 'hand' }],
  },
  plank: {
    start: { at: ['shoulder', 140, 158], torso: 101, arm: [0, 90], leg: [-63, -100, -100] },
    end: { at: ['shoulder', 140, 158], torso: 101, arm: [0, 90], leg: [-79, -79, 50] },
    labels: ['Set up', 'Hold'],
  },
  dead_bug: {
    start: floorLie({ arm: [180, 180], leg: [180, 90] }),
    end: floorLie({ arm: [-90, -90], arm2: [180, 180], leg: [180, 90], leg2: [95, 95, 180] }),
  },
  hanging_raise: {
    start: { at: ['hand', 100, 20], torso: 180, arm: [180, 180], leg: [4, 0] },
    end: { at: ['hand', 100, 20], torso: 186, arm: [180, 180], leg: [140, 0] },
    props: [{ t: 'line', a: [40, 20], b: [160, 20] }, { t: 'bar', at: [100, 20] }],
    noFloor: true,
  },

  // ── Looks-focused and tendon work ──
  preacher: {
    start: { at: ['hip', 85, 150], torso: 165, arm: [45, 50], leg: { to: [128, G], bend: 'up' } },
    end: { at: ['hip', 85, 150], torso: 165, arm: [45, 170], leg: { to: [128, G], bend: 'up' } },
    props: [{ t: 'pad', a: [72, 158], b: [104, 158] }, { t: 'line', a: [88, 162], b: [88, 190] }, { t: 'pad', a: [99, 116], b: [120, 137] }, { t: 'line', a: [114, 140], b: [114, 190] }, { t: 'db', at: 'hand' }],
  },
  straight_arm: {
    start: stand(80, { torso: 165, arm: [145, 145], leg: [8, -4] }), end: stand(80, { torso: 165, arm: [-5, -5], leg: [8, -4] }),
    props: [tower(170, 14), { t: 'cable', from: [170, 20], to: 'hand' }, { t: 'bar', at: 'hand' }],
  },
  low_high_fly: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [40, 35] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [-120, -150], reach: 0.55 },
    props: [tower(188, 20), tower(12, 20), { t: 'cable', from: [188, 178], to: 'hand' }, { t: 'cable', from: [12, 178], to: 'hand2' }],
  },
  leg_raise: {
    start: floorLie({ leg: [95, 95, 180] }),
    end: floorLie({ leg: [180, 180, 90] }),
  },
  nordic: {
    start: { at: ['knee', 70, 184], torso: 180, arm: [30, 30], leg: [0, -90, -90] },
    end: { at: ['knee', 70, 184], torso: 128, arm: [30, 40], leg: [-52, -90, -90] },
    props: [{ t: 'roller', at: ['ankle', 2, -8], r: 6 }],
  },
  wall_sit: {
    start: { at: ['hip', 52, 124], torso: 180, arm: [0, 0], leg: { to: [88, G], bend: 'front' } },
    end: { at: ['hip', 49, 150], torso: 180, arm: [20, 40], leg: [90, 0] },
    props: [{ t: 'line', a: [42, 20], b: [42, 190] }],
    labels: ['Slide down', 'Hold'],
  },
}

/** Posture and mobility drills, keyed by the drill id in training.ts. */
export const DRILL_DIAGRAMS: Record<string, Diagram> = {
  // Loaded full-range lifting: the goblet squat shows it best.
  full_range: DIAGRAMS.goblet,
  chin_tuck: {
    start: stand(100, { headShift: 9, head: 12 }), end: stand(100, { headShift: -4 }),
    crop: [62, 34, 76, 76], labels: ['Head forward', 'Tucked'],
  },
  wall_angels: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [92, 180] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [155, 170] },
  },
  ywt: {
    start: { view: 'front', at: ['ankle', 111, G], arm: [150, 150] },
    end: { view: 'front', at: ['ankle', 111, G], arm: [90, 90] },
    labels: ['Y', 'T'],
  },
  doorway_chest: {
    start: stand(110, { arm: [-95, 180] }),
    end: { at: ['hip', 124, 114], torso: 176, arm: [-110, 175], leg: { to: [148, G], bend: 'front' }, leg2: { to: [104, G], bend: 'front' } },
    startProps: [{ t: 'line', a: [82, 20], b: [82, 190] }],
    endProps: [{ t: 'line', a: [82, 20], b: [82, 190] }],
    labels: ['Forearm on the frame', 'Step through'],
  },
  thoracic_roller: {
    start: { at: ['hip', 112, 182], torso: -106, arm: { to: [64, 150], bend: 'up' }, leg: { to: [150, G], bend: 'up' } },
    end: { at: ['hip', 112, 182], torso: -100, head: 25, arm: { to: [60, 160], bend: 'up' }, leg: { to: [150, G], bend: 'up' } },
    props: [{ t: 'roller', at: [82, 180], r: 8 }],
  },
  dead_hang: {
    start: stand(100, { arm: [180, 180] }),
    end: { at: ['hand', 100, 16], torso: 180, arm: [180, 180], leg: [12, -40] },
    props: [{ t: 'line', a: [40, 16], b: [160, 16] }, { t: 'bar', at: [100, 16] }],
    labels: ['Grip the bar', 'Hang'],
  },
  hip_flexor: {
    start: { at: ['hip', 75, 146], torso: 180, arm: [10, 40], leg: { to: [120, G], bend: 'up' }, leg2: [0, -90, -90] },
    end: { at: ['hip', 88, 150], torso: 182, arm: [10, 40], leg: { to: [120, G], bend: 'up' }, leg2: [-20, -90, -90] },
  },
  hamstring_calf: {
    start: { at: ['hip', 90, 116], torso: 178, arm: [0, 0], leg: { to: [134, 174], bend: 'up', foot: 160 }, leg2: { to: [92, G], bend: 'front' } },
    end: { at: ['hip', 90, 116], torso: 125, arm: [40, 40], leg: { to: [134, 174], bend: 'up', foot: 160 }, leg2: { to: [92, G], bend: 'front' } },
    props: [{ t: 'pad', a: [128, 181], b: [160, 181], w: 10 }],
  },
  foam_roll: {
    start: { at: ['hip', 70, 170], torso: 222, arm: { to: [40, 183], bend: 'back' }, leg: [84, 92, 170] },
    end: { at: ['hip', 95, 170], torso: 222, arm: { to: [65, 183], bend: 'back' }, leg: [84, 92, 170] },
    props: [{ t: 'roller', at: [128, 182], r: 7 }],
  },
  short_foot: {
    start: stand(), noFigure: true, crop: [30, 90, 150, 110],
    startProps: [{ t: 'foot', at: [50, 186], arch: 3 }],
    end: stand(),
    endProps: [{ t: 'foot', at: [50, 186], arch: 9 }],
    labels: ['Relaxed', 'Arch lifted'],
  },
  barefoot_walk: {
    start: { at: ['hip', 100, 114], torso: 178, arm: [-20, -10], arm2: [20, 40], leg: { to: [124, G], bend: 'front' }, leg2: { to: [78, 182], bend: 'front', foot: 60 } },
    end: { at: ['hip', 100, 114], torso: 178, arm: [20, 40], arm2: [-20, -10], leg: { to: [78, 182], bend: 'front', foot: 60 }, leg2: { to: [124, G], bend: 'front' } },
  },
  legs_up_rest: {
    start: { at: ['shoulder', 44, 180], torso: -90, arm: [90, 90], leg: { to: [146, 140], bend: 'up', foot: 150 } },
    props: [{ t: 'pad', a: [122, 148], b: [170, 148] }, { t: 'line', a: [130, 152], b: [130, 190] }, { t: 'line', a: [164, 152], b: [164, 190] }],
    labels: ['Calves on a chair'],
  },
}
