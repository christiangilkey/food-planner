import { at, FLOOR, FRAME, LEN, solve, type Diagram, type Joints, type Pose, type Prop, type Pt } from '../lib/pose'

const line = (pts: Pt[]) => pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

/** The body: far limbs faint, then torso, head and near limbs. */
function Figure({ pose, ghost }: { pose: Pose; ghost?: boolean }) {
  const j = solve(pose)
  const frontView = 'view' in pose
  return (
    <g className={ghost ? 'fig ghost' : 'fig'}>
      {frontView ? <FrontBody j={j} /> : <SideBody j={j} />}
    </g>
  )
}

function SideBody({ j }: { j: Joints }) {
  return (
    <>
      <polyline className="limb far" points={line([j.hip, j.knee2, j.ankle2, j.toe2])} />
      <polyline className="limb far" points={line([j.shoulder, j.elbow2, j.hand2])} />
      <polyline className="torso" points={line([j.hip, j.shoulder])} />
      <polyline className="limb" points={line([j.shoulder, j.neck])} />
      <circle className="head" cx={j.head[0]} cy={j.head[1]} r={LEN.head} />
      <polyline className="limb" points={line([j.hip, j.knee, j.ankle, j.toe])} />
      <polyline className="limb" points={line([j.shoulder, j.elbow, j.hand])} />
    </>
  )
}

function FrontBody({ j }: { j: Joints }) {
  const hipC = mid(j.hip, j.hip2)
  const shC = mid(j.shoulder, j.shoulder2)
  return (
    <>
      <polyline className="limb" points={line([j.hip2, j.knee2, j.ankle2, j.toe2])} />
      <polyline className="limb" points={line([j.hip, j.knee, j.ankle, j.toe])} />
      <polygon className="chest" points={line([j.shoulder2, j.shoulder, j.hip, j.hip2])} />
      <polyline className="torso" points={line([hipC, shC])} />
      <polyline className="limb" points={line([shC, j.neck])} />
      <circle className="head" cx={j.head[0]} cy={j.head[1]} r={LEN.head} />
      <polyline className="limb" points={line([j.shoulder2, j.elbow2, j.hand2])} />
      <polyline className="limb" points={line([j.shoulder, j.elbow, j.hand])} />
    </>
  )
}

const BEHIND = new Set<Prop['t']>(['pad', 'line', 'cable', 'band', 'roller', 'foot'])

function PropShape({ p, j }: { p: Prop; j: Joints }) {
  switch (p.t) {
    case 'pad': { const a = at(p.a, j), b = at(p.b, j); return <line className="pad" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={p.w ? { strokeWidth: p.w } : undefined} /> }
    case 'line': { const a = at(p.a, j), b = at(p.b, j); return <line className="frame-line" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} /> }
    case 'cable': { const a = at(p.from, j), b = at(p.to, j); return <g><line className="cable" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} /><circle className="pulley" cx={a[0]} cy={a[1]} r={4} /></g> }
    case 'band': { const a = at(p.from, j), b = at(p.to, j); return <line className="band" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} /> }
    case 'roller': { const c = at(p.at, j); return <circle className="roller" cx={c[0]} cy={c[1]} r={p.r ?? 7} /> }
    case 'plate': { const c = at(p.at, j); return <g><circle className="plate" cx={c[0]} cy={c[1]} r={p.r ?? 12} /><circle className="plate-hub" cx={c[0]} cy={c[1]} r={2.5} /></g> }
    case 'foot': {
      // Heel on the left, toes on the right; the sole lifts in the middle by `arch`.
      const [x, y] = at(p.at, j)
      const sole = `M${x} ${y} Q${x + 40} ${y - p.arch * 2} ${x + 80} ${y} L${x + 104} ${y}`
      const top = `M${x - 6} ${y - 4} Q${x - 8} ${y - 26} ${x + 8} ${y - 34} L${x + 14} ${y - 74} M${x + 34} ${y - 74} L${x + 34} ${y - 36} Q${x + 70} ${y - 22} ${x + 104} ${y - 6}`
      return <g><path className="foot-top" d={top} /><path className="foot-sole" d={sole} /></g>
    }
    case 'bar': { const c = at(p.at, j); return <circle className="plate-hub" cx={c[0]} cy={c[1]} r={3.5} /> }
    case 'db': {
      const c = at(p.at, j)
      return (
        <g transform={`translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) rotate(${p.angle ?? 0})`}>
          <line className="db-handle" x1={-6} y1={0} x2={6} y2={0} />
          <rect className="db-end" x={-11} y={-5.5} width={5} height={11} rx={1.5} />
          <rect className="db-end" x={6} y={-5.5} width={5} height={11} rx={1.5} />
        </g>
      )
    }
  }
}

function Frame({ pose, d, extra, ghost, label }: { pose: Pose; d: Diagram; extra?: Prop[]; ghost?: Pose; label: string }) {
  const j = solve(pose)
  const props = [...(d.props ?? []), ...(extra ?? [])]
  const box = d.crop ?? [0, 0, FRAME, FRAME]
  return (
    <figure className="diagram-frame">
      <svg viewBox={box.join(' ')} aria-hidden="true">
        {!d.noFloor && <line className="floor" x1={8} y1={FLOOR} x2={FRAME - 8} y2={FLOOR} />}
        {props.filter((p) => BEHIND.has(p.t)).map((p, i) => <PropShape key={i} p={p} j={j} />)}
        {ghost && !d.noFigure && <Figure pose={ghost} ghost />}
        {!d.noFigure && <Figure pose={pose} />}
        {props.filter((p) => !BEHIND.has(p.t)).map((p, i) => <PropShape key={i} p={p} j={j} />)}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

/** Start and finish positions side by side; the finish frame shows the start faintly behind it. A hold has one frame. */
export function ExerciseDiagram({ d, name }: { d: Diagram; name: string }) {
  const [first, second] = d.labels ?? (d.end ? ['Start', 'Finish'] : ['Position'])
  return (
    <div className={`exercise-diagram${d.end ? '' : ' single'}`} role="img" aria-label={d.end ? `${name}: ${first} and ${second} positions` : `${name}: the position`}>
      <Frame pose={d.start} d={d} extra={d.startProps} label={first} />
      {d.end && <Frame pose={d.end} d={d} extra={d.endProps} ghost={d.start} label={second ?? 'Finish'} />}
    </div>
  )
}
