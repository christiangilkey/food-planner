import { FOOD_BY_ID } from '../data/foods'
import { METHODS } from '../data/methods'
import { EQUIPMENT } from '../data/recipes'
import { crashRisk, easeScore, rewardScore, satietyScore, servingCost, servingTotals } from '../lib/nutrition'
import { formatLb } from '../lib/shopping'
import type { AppState, Recipe } from '../types'
import { Chip, Cite, Score, Sheet } from './ui'
import { money } from '../lib/format'

const eqLabel = (id: string) => EQUIPMENT.find((e) => e.id === id)?.label ?? id
/** Raw meat, poultry, fish or eggs: the steps give USDA safe internal temperatures. */
const SEASONING = /salt|cumin|chili powder|garlic powder|oregano|paprika|seasoning|curry powder|turmeric|herbs/i
const needsTemp =(r: Recipe) => r.items.some((i) => i.food === 'egg' || FOOD_BY_ID[i.food]?.aisle === 'Meat & Seafood')

export function RecipeSheet({ recipe, portion, state, onClose }: { recipe: Recipe; portion: number; state: AppState; onClose: () => void }) {
  const t = servingTotals(recipe, portion)
  const scale = portion / recipe.servings
  const method = METHODS[recipe.id]
  const stepCount = method?.length ?? recipe.steps
  const seasoned = method && SEASONING.test(method.join(' '))
  return (
    <Sheet title={recipe.name} onClose={onClose}>
      <div className="chips">
        <Score label="Fullness" value={satietyScore(t)} />
        <Score label="Reward" value={rewardScore(recipe)} />
        <Score label="Ease" value={easeScore(recipe)} />
        {recipe.batch && <Chip tone="accent">Batch-friendly</Chip>}
        {crashRisk(t) && <Chip tone="warn">Sugar crash risk</Chip>}
      </div>
      <p className="stat-line">
        <strong>{Math.round(t.kcal)}</strong> kcal · <strong>{Math.round(t.protein)} g</strong> protein · {Math.round(t.carbs)} g carbs · {Math.round(t.fat)} g fat · {Math.round(t.fiber)} g fiber
      </p>
      <p className="stat-line muted">
        {recipe.activeMin} min hands-on{recipe.totalMin > recipe.activeMin ? `, ${recipe.totalMin} min total` : ''} · {stepCount} step{stepCount > 1 ? 's' : ''} · about {money(servingCost(recipe, state, portion))} per plate
      </p>
      {recipe.note && <p className="note">{recipe.note}</p>}

      <h3>Ingredients for {portion === 1 ? 'one serving' : `${portion} servings`}</h3>
      <ul className="ingredients">
        {recipe.items.map((it) => {
          const f = FOOD_BY_ID[it.food]
          const g = it.grams * scale
          return (
            <li key={it.food}>
              <span>{f?.name ?? it.food}</span>
              <span className="muted">{Math.round(g)} g · {formatLb(g)}</span>
            </li>
          )
        })}
      </ul>
      {recipe.servings > 1 && (
        <p className="muted small">The full recipe makes {recipe.servings} servings. Cook the whole batch and eat it as leftovers.</p>
      )}

      <h3>You'll need</h3>
      <p>
        {recipe.equipment.length ? recipe.equipment.map(eqLabel).join(', ') : 'Just a knife and a bowl or plate'}
        {recipe.alt && <span className="muted"> (or {recipe.alt.map(eqLabel).join(', ')})</span>}
      </p>

      {method && (
        <>
          <h3>How to make it</h3>
          <ol className="method-steps">
            {method.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          {seasoned && <p className="muted small">Salt, pepper, and dried spices like cumin, chili powder or garlic powder are to taste and aren’t on the shopping list.</p>}
          {needsTemp(recipe) && (
            <p className="muted small">
              Cook to safe internal temperatures: poultry 165°F, ground meat 160°F, steaks, chops and fish 145°F, egg dishes 160°F. A food thermometer is the only reliable check. <Cite ids={['fsis']} />
            </p>
          )}
        </>
      )}

      <details className="methods">
        <summary>How these scores work</summary>
        <p className="small"><strong>Fullness</strong> combines lower energy density (more food per calorie), a higher share of calories from protein, more fiber, and less sugar: the food properties most consistently linked to satiety. <Cite ids={['holt', 'rolls', 'leidy', 'wanders']} convention="The weights that combine these into one 0–100 number are this app’s choice." /></p>
        <p className="small"><strong>Reward</strong> rates crunch, flavor intensity, novelty and fun, reflecting the stronger pull of immediate rewards in ADHD. <Cite ids={['luman']} convention="The 0–3 ratings for each recipe are this app’s judgment, not a validated scale." /></p>
        <p className="small"><strong>Ease</strong> penalizes hands-on minutes, steps and tools, because convenience strongly shapes what people actually eat. <Cite ids={['arno']} convention="The point deductions are this app’s choice." /></p>
        <p className="small"><strong>Crash risk</strong> flags meals that are high in sugar with little protein or fiber. Fast-absorbed meals were followed by more hunger in a controlled trial. <Cite ids={['ludwig']} convention="The thresholds are this app’s choice." /></p>
      </details>
    </Sheet>
  )
}
