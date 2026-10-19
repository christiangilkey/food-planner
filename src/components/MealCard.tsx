import { useMemo } from 'react'
import { RECIPE_BY_ID } from '../data/recipes'
import { hasCondition } from '../lib/conditions'
import { money } from '../lib/format'
import { servingTotals } from '../lib/nutrition'
import { mealBadges, SLOT_LABEL } from '../lib/meals'
import { getEntry, type Pos } from '../lib/plan-utils'
import { isAdhd, rankCandidates, type Candidate } from '../lib/planner'
import { mealTip } from '../lib/tips'
import type { PlanEntry } from '../types'
import { Icon } from './Icon'
import { RecipeLink } from './RecipeViewer'
import { Chip, Cite, Sheet, type ViewProps } from './ui'

/** One meal: what it is, the key numbers, and a single Change button. */
export function MealCard({
  label, entry, state, onOpen, showTip,
}: {
  label: string
  entry: PlanEntry | null
  state: ViewProps['state']
  /** Opens the Change sheet (swap, portion, keep, remove). */
  onOpen: () => void
  showTip?: boolean
}) {
  const r = entry ? RECIPE_BY_ID[entry.recipe] : undefined
  if (!entry || !r) {
    return (
      <section className="card meal empty">
        <div className="meal-slot">{label}</div>
        <div className="row-between">
          <p className="muted">Nothing planned</p>
          <button className="secondary small" onClick={onOpen}>Choose a meal</button>
        </div>
      </section>
    )
  }
  const t = servingTotals(r, entry.portion)
  const diabetes = hasCondition(state.profile, 't1d') || hasCondition(state.profile, 't2d')
  const tip = showTip ? mealTip(r, entry.portion, state.profile) : null
  return (
    <section className={`card meal ${entry.locked ? 'locked' : ''}`}>
      <div className="meal-head">
        <div className="meal-slot">{label}</div>
        {entry.locked && <span className="kept with-icon"><Icon name="lock" size={13} /> Kept</span>}
      </div>
      <RecipeLink id={r.id} portion={entry.portion} className="meal-name" />
      <p className="stat-line">
        {Math.round(t.kcal)} kcal · {Math.round(t.protein)} g protein
        {diabetes && <> · <span className="carbs">{Math.round(t.carbs)} g carbs</span></>}
        {' '}· {r.totalMin > r.activeMin + 5 ? `${r.activeMin} min hands-on` : `${r.activeMin} min`}
        {entry.portion !== 1 && <> · {entry.portion}× portion</>}
      </p>
      {tip && <p className="meal-tip"><Icon name="lightbulb" size={15} className="tip-icon" /> {tip.text} <Cite ids={tip.sources} /></p>}
      <div className="meal-foot">
        <div className="chips">{mealBadges(r, entry.portion, state).map((b) => <Chip key={b.text} tone={b.tone}>{b.text}</Chip>)}</div>
        <button className="secondary small" onClick={onOpen}>Change</button>
      </div>
    </section>
  )
}

/**
 * Everything you can do to one meal, in one place: swap it (meals from your pantry first),
 * change the portion, keep it for next week, or remove a snack.
 */
export function MealSheet({ pos, state, onChange, onClose }: { pos: Pos; state: ViewProps['state']; onChange: (e: PlanEntry | null) => void; onClose: () => void }) {
  const entry = getEntry(state.plan, pos)
  const r = entry ? RECIPE_BY_ID[entry.recipe] : undefined
  const pantryCount = state.pantry.filter((p) => p.grams > 0).length
  const { fromPantry, best } = useMemo(() => {
    const all = rankCandidates(state, state.plan, pos.day, pos.slot)
    const pantry = pantryCount ? rankCandidates(state, state.plan, pos.day, pos.slot, { pantryFirst: true }).filter((c) => c.parts.pantry >= 0.5 && c.recipe.id !== entry?.recipe).slice(0, 4) : []
    const taken = new Set([entry?.recipe, ...pantry.map((c) => c.recipe.id)])
    return { fromPantry: pantry, best: all.filter((c) => !taken.has(c.recipe.id)).slice(0, 8) }
  }, [state, pos, entry?.recipe, pantryCount])
  const pick = (c: Candidate) => { onChange({ recipe: c.recipe.id, portion: c.portion }); onClose() }
  const step = (delta: number) => entry && onChange({ ...entry, portion: Math.max(0.25, Math.min(3, entry.portion + delta)) })
  const title = r ? `Change ${SLOT_LABEL[pos.slot].toLowerCase()}` : `Choose a ${SLOT_LABEL[pos.slot].toLowerCase()}`

  return (
    <Sheet title={title} onClose={onClose}>
      {entry && r && (
        <div className="sheet-section">
          <p className="option-title">{r.name}</p>
          <div className="row-between">
            <span className="muted small">Portion</span>
            <div className="portion">
              <button className="icon small" onClick={() => step(-0.25)} aria-label="Smaller portion">−</button>
              <span className="portion-value">{entry.portion}×</span>
              <button className="icon small" onClick={() => step(0.25)} aria-label="Bigger portion">+</button>
            </div>
          </div>
          <label className="toggle compact">
            <input type="checkbox" checked={!!entry.locked} onChange={(e) => onChange({ ...entry, locked: e.target.checked })} />
            <span><strong>Keep this meal</strong><small>“New week” won’t replace it.</small></span>
          </label>
          {pos.slot === 'snack' && <button className="ghost danger small" onClick={() => { onChange(null); onClose() }}>Remove this snack</button>}
        </div>
      )}

      {fromPantry.length > 0 && (
        <>
          <h3 className="with-icon"><Icon name="wand" size={16} /> From your pantry</h3>
          <OptionList options={fromPantry} state={state} onPick={pick} pantry />
        </>
      )}
      <h3>{fromPantry.length ? 'Other good options' : 'Good options'}</h3>
      {best.length === 0
        ? <p className="muted">No recipes fit your kitchen, time limit and exclusions for this meal. Try adding equipment or raising your time limit in Profile.</p>
        : <OptionList options={best} state={state} onPick={pick} />}
    </Sheet>
  )
}

function OptionList({ options, state, onPick, pantry }: { options: Candidate[]; state: ViewProps['state']; onPick: (c: Candidate) => void; pantry?: boolean }) {
  return (
    <ul className="option-list">
      {options.map((c) => {
        const why: string[] = []
        if (pantry) why.push(`${Math.round(c.parts.pantry * 100)}% from your pantry`)
        if (c.parts.satiety > 0.7) why.push('very filling')
        if (c.parts.gaps > 0.6) why.push('fills nutrient gaps')
        if (isAdhd(state.profile) && c.parts.ease > 0.8) why.push('low effort')
        if (!pantry && c.parts.cost > 0.8) why.push('cheap')
        return (
          <li key={c.recipe.id} className="option-row">
            <button className="option" onClick={() => onPick(c)}>
              <span className="option-title">{c.recipe.name}</span>
              <span className="muted small">{Math.round(c.totals.kcal)} kcal · {Math.round(c.totals.protein)} g protein · {c.recipe.activeMin} min · {money(c.cost)}</span>
              {why.length > 0 && <span className="why">{why.slice(0, 2).join(' · ')}</span>}
            </button>
            <RecipeLink id={c.recipe.id} portion={c.portion} className="details-btn">Details</RecipeLink>
          </li>
        )
      })}
    </ul>
  )
}
