/**
 * Stick-figure poses for the exercise diagrams.
 *
 * Angles are absolute, in degrees: 0 points straight down, 90 points forward (to the right of the
 * frame), 180 straight up and -90 (or 270) backward. Every frame is 200 × 200 with the floor at y = 190.
 */

export type Pt = [number, number]

export const FRAME = 200
export const FLOOR = 190
/** Where an ankle sits when the foot is flat on the floor. */
export const ANKLE_Y = 186

export const LEN = { torso: 46, neck: 5, head: 8, upper: 26, fore: 24, thigh: 38, shin: 36, foot: 13 } as const
/** Front view: half the shoulder and hip widths. */
const SHOULDER_W = 15
const HIP_W = 8

export type Joint =
  | 'hip' | 'shoulder' | 'neck' | 'head'
  | 'elbow' | 'hand' | 'knee' | 'ankle' | 'toe' | 'heel'
  | 'elbow2' | 'hand2' | 'knee2' | 'ankle2' | 'toe2' | 'heel2'
  | 'shoulder2' | 'hip2'

/**
 * A limb as angles, or as a point for the hand (arm) or ankle (leg) to reach. `bend` picks which way
 * the elbow or knee points; `foot` sets the foot angle for a leg.
 */
export type Limb = [number, number, number?] | { to: Pt; bend: 'front' | 'back' | 'up' | 'down'; foot?: number }

/** A figure seen from the side, facing right. Limbs marked 2 are the far side, drawn fainter. */
export interface SidePose {
  /** Pin one joint to a point; the rest of the body hangs off it. It can't be a joint placed by reaching. */
  at: [Joint, number, number]
  /** Hip to shoulder; 180 = upright, 90 = lying face down with the head forward. */
  torso: number
  /** Head tilt relative to the torso line; positive nods forward. */
  head?: number
  /** Push the head forward (+) or back (−) along the frame's x axis (forward head / chin tuck). */
  headShift?: number
  /** Upper arm and forearm angles, or a hand position to reach. */
  arm: Limb
  arm2?: Limb
  /** Thigh, shin and foot angles, or an ankle position to reach. The foot defaults to 90 (flat, pointing forward). */
  leg: Limb
  leg2?: Limb
  /** Shortens the arms to show them pointing toward you (1 = full length). */
  reach?: number
}

/** A figure seen from the front. The arm and leg on the right of the frame set the angles; the left mirrors them unless given. */
export interface FrontPose {
  view: 'front'
  at: [Joint, number, number]
  /** [upper arm, forearm]: 0 down, 90 straight out to the side, 180 up, negative across the body. */
  arm: [number, number]
  arm2?: [number, number]
  /** [thigh, shin]: 0 straight down, positive out to the side. */
  leg?: [number, number]
  leg2?: [number, number]
  /** Shortens the torso to show a forward bend or an incline seen end on (1 = upright). */
  bend?: number
  /** Shortens the arms to show them reaching toward you (1 = full length). */
  reach?: number
}

export type Pose = SidePose | FrontPose

export type Ref = Pt | Joint | [Joint, number, number]

export type Prop =
  /** A bench, seat, back pad or board: a thick rounded bar between two points. */
  | { t: 'pad'; a: Ref; b: Ref; w?: number }
  /** A barbell seen end on. */
  | { t: 'plate'; at: Ref; r?: number }
  /** A dumbbell seen from the side. */
  | { t: 'db'; at: Ref; angle?: number }
  /** A cable from a pulley to a handle. */
  | { t: 'cable'; from: Ref; to: Ref }
  /** A resistance band. */
  | { t: 'band'; from: Ref; to: Ref }
  /** A bar seen end on (pull-up bar, table edge, rail, handle). */
  | { t: 'bar'; at: Ref }
  /** A thin line: a wall, a frame or a door. */
  | { t: 'line'; a: Ref; b: Ref }
  /** A foam roller or rolled towel, end on. */
  | { t: 'roller'; at: Ref; r?: number }
  /** A bare foot from the side, for foot drills: arch height in px. */
  | { t: 'foot'; at: Ref; arch: number }

export interface Diagram {
  start: Pose
  /** Left out for a position you hold: one frame. */
  end?: Pose
  /** Captions; default "Start" and "Finish" (or "Position" for one frame). */
  labels?: [string, string?]
  /** Zoom in on part of the frame: [x, y, width, height]. */
  crop?: [number, number, number, number]
  /** Only the equipment (the foot drill). */
  noFigure?: boolean
  /** Equipment, drawn in both frames; joint references follow the body. */
  props?: Prop[]
  /** Equipment that only appears in one frame. */
  startProps?: Prop[]
  endProps?: Prop[]
  /** No floor line (hanging from a bar, for example). */
  noFloor?: boolean
}

const rad = (deg: number) => (deg * Math.PI) / 180
const dir = (deg: number): Pt => [Math.sin(rad(deg)), Math.cos(rad(deg))]
const add = (p: Pt, a: number, len: number): Pt => { const [dx, dy] = dir(a); return [p[0] + dx * len, p[1] + dy * len] }

export type Joints = Record<Joint, Pt>

/** Where every joint lands for a pose. */
export function solve(pose: Pose): Joints {
  if ('view' in pose) {
    const j = front(pose)
    return shift(j, pose.at, j)
  }
  return side(pose)
}

function shift<T extends Partial<Joints>>(j: T, [name, x, y]: [Joint, number, number], from: Partial<Joints>): T {
  const p = from[name]
  if (!p) throw new Error(`Can't pin ${name}: it is placed by reaching for a point`)
  const dx = x - p[0]
  const dy = y - p[1]
  return Object.fromEntries(Object.entries(j).map(([k, q]) => [k, [q![0] + dx, q![1] + dy]])) as T
}

/** Two-bone reach: the middle joint and the end for a root, a target and a bend direction. */
function reach(root: Pt, target: Pt, a: number, b: number, bend: 'front' | 'back' | 'up' | 'down'): [Pt, Pt] {
  const dx = target[0] - root[0]
  const dy = target[1] - root[1]
  const c = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(a - b) + 0.01), a + b - 0.01)
  const base = Math.atan2(dy, dx)
  const off = Math.acos((a * a + c * c - b * b) / (2 * a * c))
  const options = [base + off, base - off].map((t): Pt => [root[0] + a * Math.cos(t), root[1] + a * Math.sin(t)])
  const score = (p: Pt) => (bend === 'front' ? p[0] : bend === 'back' ? -p[0] : bend === 'up' ? -p[1] : p[1])
  const mid = score(options[0]) >= score(options[1]) ? options[0] : options[1]
  // The end lands on the target when it's in reach, otherwise as close as the limb allows.
  const ex = target[0] - mid[0]
  const ey = target[1] - mid[1]
  const el = Math.hypot(ex, ey) || 1
  return [mid, [mid[0] + (ex / el) * b, mid[1] + (ey / el) * b]]
}

const isAngles = (l: Limb): l is [number, number, number?] => Array.isArray(l)

function side(p: SidePose): Joints {
  const hip: Pt = [0, 0]
  const shoulder = add(hip, p.torso, LEN.torso)
  const neck = add(shoulder, p.torso + (p.head ?? 0), LEN.neck)
  const headBase = add(neck, p.torso + (p.head ?? 0), LEN.head)
  const head: Pt = [headBase[0] + (p.headShift ?? 0), headBase[1]]
  const rel: Partial<Joints> = { hip, shoulder, neck, head, hip2: hip, shoulder2: shoulder }
  const arms: [Limb, '' | '2'][] = [[p.arm, ''], [p.arm2 ?? p.arm, '2']]
  const legs: [Limb, '' | '2'][] = [[p.leg, ''], [p.leg2 ?? p.leg, '2']]
  for (const [l, n] of arms) {
    if (!isAngles(l)) continue
    const elbow = add(shoulder, l[0], LEN.upper * (p.reach ?? 1))
    rel[`elbow${n}`] = elbow
    rel[`hand${n}`] = add(elbow, l[1], LEN.fore * (p.reach ?? 1))
  }
  for (const [l, n] of legs) {
    if (!isAngles(l)) continue
    const knee = add(hip, l[0], LEN.thigh)
    const ankle = add(knee, l[1], LEN.shin)
    rel[`knee${n}`] = knee
    rel[`ankle${n}`] = ankle
    rel[`toe${n}`] = add(ankle, l[2] ?? 90, LEN.foot)
    rel[`heel${n}`] = add(ankle, l[2] ?? 90, -3)
  }
  const j = shift(rel, p.at, rel)
  for (const [l, n] of arms) {
    if (isAngles(l)) continue
    const [elbow, hand] = reach(j.shoulder!, l.to, LEN.upper, LEN.fore, l.bend)
    j[`elbow${n}`] = elbow
    j[`hand${n}`] = hand
  }
  for (const [l, n] of legs) {
    if (isAngles(l)) continue
    const [knee, ankle] = reach(j.hip!, l.to, LEN.thigh, LEN.shin, l.bend)
    j[`knee${n}`] = knee
    j[`ankle${n}`] = ankle
    j[`toe${n}`] = add(ankle, l.foot ?? 90, LEN.foot)
    j[`heel${n}`] = add(ankle, l.foot ?? 90, -3)
  }
  return j as Joints
}

const mirror = ([a, b]: [number, number]): [number, number] => [-a, -b]

function front(p: FrontPose): Joints {
  const bend = p.bend ?? 1
  const shoulderC: Pt = [0, -LEN.torso * bend]
  const neck: Pt = [0, shoulderC[1] - LEN.neck * bend]
  // Bent forward, the head drops in front of the chest instead of sitting above it.
  const head: Pt = [0, bend < 0.8 ? shoulderC[1] + LEN.head * 0.3 : neck[1] - LEN.head]
  const sR: Pt = [SHOULDER_W, shoulderC[1]]
  const sL: Pt = [-SHOULDER_W, shoulderC[1]]
  const hR: Pt = [HIP_W, 0]
  const hL: Pt = [-HIP_W, 0]
  const armL = p.arm2 ?? mirror(p.arm)
  const legR = p.leg ?? [4, 0]
  const legL = p.leg2 ?? mirror(legR)
  const r = p.reach ?? 1
  const elbow = add(sR, p.arm[0], LEN.upper * r)
  const hand = add(elbow, p.arm[1], LEN.fore * r)
  const elbow2 = add(sL, armL[0], LEN.upper * r)
  const hand2 = add(elbow2, armL[1], LEN.fore * r)
  const knee = add(hR, legR[0], LEN.thigh)
  const ankle = add(knee, legR[1], LEN.shin)
  const knee2 = add(hL, legL[0], LEN.thigh)
  const ankle2 = add(knee2, legL[1], LEN.shin)
  const toe: Pt = [ankle[0] + 6, ankle[1]]
  const toe2: Pt = [ankle2[0] - 6, ankle2[1]]
  return {
    hip: hR, hip2: hL, shoulder: sR, shoulder2: sL, neck, head, elbow, hand, elbow2, hand2,
    knee, ankle, toe, heel: ankle, knee2, ankle2, toe2, heel2: ankle2,
  }
}

/** A point from a reference: a fixed point, a joint, or a joint plus an offset. */
export function at(ref: Ref, j: Joints): Pt {
  if (typeof ref === 'string') return j[ref]
  if (typeof ref[0] === 'string') {
    const [name, dx, dy] = ref as [Joint, number, number]
    return [j[name][0] + dx, j[name][1] + dy]
  }
  return ref as Pt
}

/** Every point a frame draws, for bounds checks. */
export function framePoints(pose: Pose, props: Prop[] = []): Pt[] {
  const j = solve(pose)
  const pts: Pt[] = Object.values(j)
  // The head is a circle: include its edges.
  pts.push([j.head[0], j.head[1] - LEN.head], [j.head[0], j.head[1] + LEN.head], [j.head[0] - LEN.head, j.head[1]], [j.head[0] + LEN.head, j.head[1]])
  for (const pr of props) {
    if ('a' in pr) pts.push(at(pr.a, j), at(pr.b, j))
    else if ('from' in pr) pts.push(at(pr.from, j), at(pr.to, j))
    else pts.push(at(pr.at, j))
  }
  return pts
}

/** Distance between two joints, for checking that reaching limbs actually reach. */
export const gap = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])
