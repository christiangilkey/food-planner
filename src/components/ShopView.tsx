import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { planCost } from '../lib/planner'
import { AISLE_ORDER, buildShoppingList, formatLb, type ShoppingItem } from '../lib/shopping'
import { Bar, Chip, type ViewProps } from './ui'
import { money } from '../lib/format'
import { Icon } from './Icon'
import { KitchenView } from './KitchenView'
import { PricesView } from './PricesView'

type Section = 'list' | 'pantry' | 'prices'
const SECTIONS: [Section, string][] = [['list', 'List'], ['pantry', 'Pantry'], ['prices', 'Prices']]

type ShopProps = ViewProps & { goTo: (t: Tab, section?: string) => void; section?: string }

/** Shop: the shopping list, what's at home, and store prices, behind one switch. */
export function ShopView({ state, update, goTo, section }: ShopProps) {
  const [view, setView] = useState<Section>(section === 'pantry' || section === 'prices' ? section : 'list')
  const show = (s: Section) => { setView(s); window.scrollTo(0, 0) }

  return (
    <div className="stack shop">
      <div className="segmented shop-switch" role="tablist" aria-label="Shop sections">
        {SECTIONS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} className={view === id ? 'on' : ''} onClick={() => show(id)}>{label}</button>
        ))}
      </div>
      {view === 'list' && <ShopList state={state} update={update} goTo={goTo} show={show} />}
      {view === 'pantry' && <KitchenView state={state} update={update} />}
      {view === 'prices' && <PricesView state={state} update={update} />}
    </div>
  )
}

function ShopList({ state, update, goTo, show }: ViewProps & { goTo: ShopProps['goTo']; show: (s: Section) => void }) {
  const { items, covered, total } = useMemo(() => buildShoppingList(state), [state])
  const [showCovered, setShowCovered] = useState(false)
  const [stocked, setStocked] = useState(0)
  const eaten = planCost(state, state.plan)
  const store = state.stores.find((s) => s.id === state.preferredStore)
  const budget = state.profile.weeklyBudget
  const checkedItems = items.filter((i) => state.checked[i.food.id])
  const checkedTotal = checkedItems.reduce((s, i) => s + i.cost, 0)
  const left = items.length - checkedItems.length
  const savings = items.reduce((s, i) => s + (i.cheaper ? i.cost - i.cheaper.cost : 0), 0)

  const toggle = (id: string) => update((s) => ({ ...s, checked: { ...s.checked, [id]: !s.checked[id] } }))

  /** Move everything checked into the pantry (whole packages bought) and clear the checks. */
  const stockPantry = () => {
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
    setStocked(checkedItems.length)
  }

  if (!items.length && !covered.length) {
    return (
      <section className="card hero empty-state">
        <h1>Shopping list</h1>
        <p>Plan a week of meals and the list fills itself in.</p>
        <button className="primary" onClick={() => goTo('week')}>Plan my week</button>
      </section>
    )
  }

  const over = total - budget

  return (
    <>
      <section className="card hero shop-summary">
        <p className="eyebrow">This week{store ? ` · ${store.name}` : ''}</p>
        <h1>{items.length === 0 ? 'Nothing to buy' : left === 0 ? 'All in the cart' : `${left} ${left === 1 ? 'item' : 'items'} to buy`}</h1>
        {items.length > 0 && (
          <>
            <div className="summary-label"><span><strong>{money(total)}</strong> of your {money(budget)} budget</span>
              <span className={over > 0 ? 'warn-text' : 'good-text'}>{over > 0 ? `${money(over)} over` : `${money(-over)} under`}</span>
            </div>
            <Bar value={total} max={budget} tone={over > 0 ? 'warn' : 'accent'} label="List total against weekly budget" />
            {over > 0 && (
              <p className="small">
                Mark what you have in <button className="link" onClick={() => show('pantry')}>Pantry</button>, or plan a new week: the planner picks cheaper meals when you're over.
              </p>
            )}
            {savings > 0.5 && <p className="good-text small">Another store is cheaper for some items: about {money(savings)} to save.</p>}
            <p className="muted small">
              About {money(eaten)} of it gets eaten this week; the rest stays in your pantry.
              {!store && <> Prices are local estimates. <button className="link" onClick={() => show('prices')}>Add your store</button></>}
            </p>
          </>
        )}
        {items.length === 0 && <p className="muted">Everything this week's meals need is already at home.</p>}
      </section>

      {stocked > 0 && (
        <p className="note shop-note" role="status">
          Added {stocked} {stocked === 1 ? 'item' : 'items'} to your pantry. <button className="link" onClick={() => show('pantry')}>See pantry</button>
        </p>
      )}

      {AISLE_ORDER.map((aisle) => {
        const rows = items.filter((i) => i.food.aisle === aisle)
        if (!rows.length) return null
        const todo = rows.filter((i) => !state.checked[i.food.id]).length
        return (
          <section key={aisle} className="card">
            <div className="row-between">
              <h2>{aisle}</h2>
              <span className="muted small">{todo ? `${todo} left` : 'Done'}</span>
            </div>
            <ul className="shop-list">
              {rows.map((it) => <ShopRow key={it.food.id} it={it} checked={!!state.checked[it.food.id]} onToggle={() => toggle(it.food.id)} />)}
            </ul>
          </section>
        )
      })}

      {covered.length > 0 && (
        <section className="card">
          <button className="disclosure full" onClick={() => setShowCovered(!showCovered)} aria-expanded={showCovered}>
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

      {items.length > 0 && (
        <section className={`card shop-done ${checkedItems.length ? 'sticky-action' : ''}`}>
          <p className="small">
            {checkedItems.length ? <><strong>{checkedItems.length}</strong> in cart · {money(checkedTotal)}</> : <span className="muted">Tick items as they go in your cart</span>}
          </p>
          <button className="primary" onClick={stockPantry} disabled={!checkedItems.length}>Done shopping: add to pantry</button>
        </section>
      )}
    </>
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
          {(it.cheaper || it.spoilRisk) && (
            <span className="chips">
              {it.cheaper && <Chip tone="good">{money(it.cheaper.cost)} at {it.cheaper.storeName}</Chip>}
              {it.spoilRisk && <Chip tone="warn">~{formatLb(it.leftoverGrams)} extra, keeps {it.food.shelfDays} d</Chip>}
            </span>
          )}
        </span>
      </label>
      <span className="shop-price">{money(it.cost)}</span>
    </li>
  )
}
