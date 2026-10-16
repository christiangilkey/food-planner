import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { planCost } from '../lib/planner'
import { AISLE_ORDER, buildShoppingList, formatLb, type ShoppingItem } from '../lib/shopping'
import { Chip, type ViewProps } from './ui'
import { money } from '../lib/format'
import { Icon } from './Icon'

export function ShopView({ state, update, goTo }: ViewProps & { goTo: (t: Tab) => void }) {
  const { items, covered, total } = useMemo(() => buildShoppingList(state), [state])
  const [showCovered, setShowCovered] = useState(false)
  const eaten = planCost(state, state.plan)
  const store = state.stores.find((s) => s.id === state.preferredStore)
  const checkedItems = items.filter((i) => state.checked[i.food.id])
  const checkedTotal = checkedItems.reduce((s, i) => s + i.cost, 0)
  const savings = items.reduce((s, i) => s + (i.cheaper ? i.cost - i.cheaper.cost : 0), 0)

  const toggle = (id: string) => update((s) => ({ ...s, checked: { ...s.checked, [id]: !s.checked[id] } }))

  /** Move everything checked into the pantry (whole packages bought) and clear the checks. */
  const stockPantry = () =>
    update((s) => {
      const pantry = [...s.pantry]
      for (const it of checkedItems) {
        const grams = it.packages * it.food.packageGrams
        const existing = pantry.findIndex((p) => p.food === it.food.id)
        if (existing >= 0) pantry[existing] = { ...pantry[existing], grams: pantry[existing].grams + grams }
        else pantry.push({ food: it.food.id, grams })
      }
      const checked = { ...s.checked }
      for (const it of checkedItems) delete checked[it.food.id]
      return { ...s, pantry, checked }
    })

  if (!items.length && !covered.length) {
    return (
      <section className="card">
        <h1>Shopping list</h1>
        <p className="muted">Build a week on the Plan tab first.</p>
        <button className="primary" onClick={() => goTo('plan')}>Go to plan</button>
      </section>
    )
  }

  return (
    <div className="stack">
      <section className="card hero">
        <h1>Shopping list</h1>
        <p className="big-number">{money(total)}</p>
        <p className="muted small">
          {items.length} items{store ? ` at ${store.name}` : ' at estimated local prices'}
          {state.profile.state ? ` (${state.profile.state})` : ''}. You'll eat about {money(eaten)} of it this week; the rest stays in your pantry.
        </p>
        {total > state.profile.weeklyBudget && (
          <p className="warn-text small">
            {money(total - state.profile.weeklyBudget)} over budget. Mark what you already own on the Kitchen tab, or make a new week: the planner leans cheaper when it's over budget.
          </p>
        )}
        {savings > 0.5 && <p className="good-text small">Splitting stores could save about {money(savings)}. See the notes on each item below.</p>}
        {!store && (
          <p className="muted small">
            Prices are regional estimates. <button className="link" onClick={() => goTo('prices')}>Add your stores and real prices</button> to make this accurate.
          </p>
        )}
      </section>

      {AISLE_ORDER.map((aisle) => {
        const rows = items.filter((i) => i.food.aisle === aisle)
        if (!rows.length) return null
        return (
          <section key={aisle} className="card">
            <h2>{aisle}</h2>
            <ul className="shop-list">
              {rows.map((it) => <ShopRow key={it.food.id} it={it} checked={!!state.checked[it.food.id]} onToggle={() => toggle(it.food.id)} />)}
            </ul>
          </section>
        )
      })}

      {checkedItems.length > 0 && (
        <section className="card sticky-action">
          <p>
            <strong>{checkedItems.length}</strong> in cart · {money(checkedTotal)}
          </p>
          <button className="primary" onClick={stockPantry}>Done shopping: add to pantry</button>
        </section>
      )}

      {covered.length > 0 && (
        <section className="card">
          <button className="disclosure" onClick={() => setShowCovered(!showCovered)} aria-expanded={showCovered}>
            <Icon name={showCovered ? 'chevronDown' : 'chevronRight'} /> Already at home ({covered.length})
          </button>
          {showCovered && (
            <ul className="shop-list">
              {covered.map((it) => (
                <li key={it.food.id} className="shop-row">
                  <span>{it.food.name}</span>
                  <span className="muted small">need {formatLb(it.needGrams)}, have {formatLb(it.pantryGrams)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

function ShopRow({ it, checked, onToggle }: { it: ShoppingItem; checked: boolean; onToggle: () => void }) {
  return (
    <li className={`shop-row ${checked ? 'done' : ''}`}>
      <label className="shop-check">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span className="shop-main">
          <span className="shop-name">{it.food.name}</span>
          <span className="muted small">
            {it.packages > 1 ? `${it.packages} × ` : ''}{it.food.packageLabel} · need {formatLb(it.buyGrams)}
            {it.pantryGrams > 0 ? ` (have ${formatLb(it.pantryGrams)})` : ''}
          </span>
          <span className="chips">
            {it.cheaper && <Chip tone="good">{money(it.cheaper.cost)} at {it.cheaper.storeName}</Chip>}
            {it.spoilRisk && <Chip tone="warn">~{formatLb(it.leftoverGrams)} left over, spoils in {it.food.shelfDays} d</Chip>}
          </span>
        </span>
      </label>
      <span className="shop-price">{money(it.cost)}</span>
    </li>
  )
}
