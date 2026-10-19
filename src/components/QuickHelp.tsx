import { useMemo, useState } from 'react'
import { analyzeWeek } from '../lib/analysis'
import { computeTargets } from '../lib/energy'
import { lowEnergyFixes, type EnergyFix } from '../lib/energyNow'
import { rewardScore, satietyScore, servingTotals } from '../lib/nutrition'
import { eligibleRecipes, portionFor, slotShares } from '../lib/planner'
import { Icon } from './Icon'
import { todayIndex } from '../lib/meals'
import { RecipeLink } from './RecipeViewer'
import { Cite, EvidenceChip, type ViewProps } from './ui'

/** Zero-friction snacks right now: under 4 minutes, filling, favoring what's in the pantry. */
export function HungryPanel({ state }: { state: ViewProps['state'] }) {
  const targets = computeTargets(state.profile)
  const snackKcal = targets.kcal * (slotShares(state.profile).snack || 0.12)
  const pantry = new Set(state.pantry.filter((p) => p.grams > 0).map((p) => p.food))
  const picks = eligibleRecipes(state, 'snack').filter((r) => r.activeMin <= 4)
    .map((r) => {
      const portion = portionFor(r, snackKcal, 'snack')
      const t = servingTotals(r, portion)
      const have = r.items.filter((i) => pantry.has(i.food)).length / r.items.length
      return { r, portion, t, have, score: satietyScore(t) * 0.5 + rewardScore(r) * 0.3 + have * 40 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  return (
    <>
      <p className="muted small">Ready in under 4 minutes, filling for the calories, and allowed by your conditions. What’s in your pantry comes first. <Cite ids={['holt', 'rolls']} /></p>
      <ul className="option-list">
        {picks.map(({ r, portion, t, have }) => (
          <li key={r.id}>
            <RecipeLink id={r.id} portion={portion} className="option">
              <span className="option-title">{r.name}</span>
              <span className="muted small">{Math.round(t.kcal)} kcal · {Math.round(t.protein)} g protein</span>
              {have === 1 && <span className="why">you have everything</span>}
            </RecipeLink>
          </li>
        ))}
      </ul>
    </>
  )
}

/** "I feel low energy": quick fixes ranked for the person, the time of day and today's plan. */
export function LowEnergyPanel({ state }: { state: ViewProps['state'] }) {
  const [at] = useState(() => new Date())
  const [sleptBadly, setSleptBadly] = useState(false)
  const [notEaten, setNotEaten] = useState(false)
  const analysis = useMemo(() => analyzeWeek(state), [state])
  const result = useMemo(
    () => lowEnergyFixes(state, analysis, { now: at.getHours() * 60 + at.getMinutes(), dayIndex: todayIndex(), sleptBadly, notEaten }),
    [state, analysis, at, sleptBadly, notEaten],
  )
  return (
    <div className="energy-card">
      <p className="muted small">Ranked for the time of day, today’s meals, and your conditions, medications and diet.</p>
      <div className="chips" role="group" aria-label="Tell us more">
        <button className={`toggle-chip ${sleptBadly ? 'on' : ''}`} aria-pressed={sleptBadly} onClick={() => setSleptBadly(!sleptBadly)}><Icon name="bed" size={14} /> Slept badly</button>
        <button className={`toggle-chip ${notEaten ? 'on' : ''}`} aria-pressed={notEaten} onClick={() => setNotEaten(!notEaten)}><Icon name="meal" size={14} /> Haven’t eaten in a while</button>
      </div>
      <ol className="fix-steps">{result.fixes.map((f) => <FixItem key={f.id} f={f} />)}</ol>
      {result.later.length > 0 && (
        <details className="methods">
          <summary>If it keeps happening</summary>
          <ul className="fix-steps plain">{result.later.map((f) => <FixItem key={f.id} f={f} />)}</ul>
        </details>
      )}
    </div>
  )
}

function FixItem({ f }: { f: EnergyFix }) {
  return (
    <li className={f.avoid ? 'avoid' : ''}>
      <span className="fix-icon"><Icon name={f.icon} size={18} /></span>
      <span className="fix-body">
        <span className="row-between"><strong>{f.title}</strong><EvidenceChip level={f.evidence} /></span>
        <span className="small">{f.detail} <Cite ids={f.sources} /></span>
        {f.why && <span className="why">For you: {f.why}</span>}
        {f.snacks && f.snacks.length > 0 && (
          <span className="fix-snacks">
            {f.snacks.map(({ recipe, portion }) => <RecipeLink key={recipe.id} id={recipe.id} portion={portion} className="chip tone-accent" />)}
          </span>
        )}
      </span>
    </li>
  )
}
