import { describe, expect, it } from 'vitest'
import { DIAGRAMS, DRILL_DIAGRAMS } from '../data/diagrams'
import { EXERCISES, FASCIA, POSTURE } from '../data/training'
import { FLOOR, FRAME, framePoints, gap, solve, type Diagram, type Pose, type Prop } from './pose'

const all: [string, Diagram][] = [...Object.entries(DIAGRAMS), ...Object.entries(DRILL_DIAGRAMS)]
const frames = (d: Diagram): [Pose, Prop[]][] => [
  [d.start, [...(d.props ?? []), ...(d.startProps ?? [])]],
  ...(d.end ? [[d.end, [...(d.props ?? []), ...(d.endProps ?? [])]] as [Pose, Prop[]]] : []),
]
const r = (n: number) => Math.round(n * 10) / 10

describe('exercise diagrams', () => {
  it('every exercise the app can program has a diagram', () => {
    expect(EXERCISES.filter((e) => !DIAGRAMS[e.id]).map((e) => e.id)).toEqual([])
    expect(Object.keys(DIAGRAMS).filter((id) => !EXERCISES.some((e) => e.id === id))).toEqual([])
  })

  it('every posture and mobility drill has a diagram', () => {
    expect([...POSTURE.drills, ...FASCIA.drills].filter((d) => !DRILL_DIAGRAMS[d.id]).map((d) => d.id)).toEqual([])
  })

  it('everything stays inside its frame', () => {
    const out: string[] = []
    for (const [id, d] of all) {
      // A cropped diagram zooms in on purpose (the head for chin tucks, the foot for foot drills).
      if (d.crop) continue
      const [x, y, w, h] = [0, 0, FRAME, FRAME]
      frames(d).forEach(([pose, props], f) => {
        for (const [px, py] of framePoints(pose, props)) {
          if (px < x + 2 || px > x + w - 2 || py < y + 2 || py > y + h - 2) out.push(`${id}#${f} (${r(px)}, ${r(py)})`)
        }
      })
    }
    expect(out).toEqual([])
  })

  it('no body part sinks through the floor', () => {
    const out: string[] = []
    for (const [id, d] of all) {
      if (d.noFigure) continue
      frames(d).forEach(([pose], f) => {
        for (const [name, [, py]] of Object.entries(solve(pose))) if (py > FLOOR + 1.5) out.push(`${id}#${f} ${name} ${r(py)}`)
      })
    }
    expect(out).toEqual([])
  })

  it('hands and feet placed by reaching actually get there', () => {
    const out: string[] = []
    for (const [id, d] of all) {
      frames(d).forEach(([pose], f) => {
        if ('view' in pose) return
        const j = solve(pose)
        const limbs = [['arm', pose.arm, j.hand], ['arm2', pose.arm2, j.hand2], ['leg', pose.leg, j.ankle], ['leg2', pose.leg2, j.ankle2]] as const
        for (const [name, l, end] of limbs) if (l && !Array.isArray(l) && gap(end, l.to) > 2) out.push(`${id}#${f} ${name} short by ${r(gap(end, l.to))}`)
      })
    }
    expect(out).toEqual([])
  })
})
