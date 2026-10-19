import { useState } from 'react'
import { FOOD_BY_ID, FOODS } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import { DAYS, dayEntries } from '../lib/planner'
import { productFoodId, productTitle } from '../lib/products'
import { AISLE_ORDER, formatLb } from '../lib/shopping'
import type { Food, PantryItem, Product } from '../types'
import { Icon } from './Icon'
import { ScanSheet } from './ScanSheet'
import { Chip, NumberField, type ViewProps } from './ui'

/** Foods that keep a week or less are called out so they get eaten first. */
const USE_SOON_DAYS = 7

interface Row { p: PantryItem; f: Food }

/** Pantry: scan or add what's at home, see it grouped, and keep it honest. */
export function KitchenView(props: ViewProps) {
  const { state, update } = props
  const [adding, setAdding] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [ateDay, setAteDay] = useState(() => (new Date().getDay() + 6) % 7)
  const [showAte, setShowAte] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [toast, setToast] = useState('')
  const [scan, setScan] = useState<{ editing?: Product } | null>(null)
  const scannedFoods = new Set(state.products.map((x) => x.matches || productFoodId(x)))
  const removeProduct = (x: Product) =>
    update((s) => ({ ...s, products: s.products.filter((y) => y.id !== x.id), pantry: x.matches ? s.pantry : s.pantry.filter((p) => p.food !== productFoodId(x)) }))

  const setGrams = (food: string, grams: number) =>
    update((s) => ({ ...s, pantry: s.pantry.map((p) => (p.food === food ? { ...p, grams: Math.max(0, grams) } : p)) }))
  const remove = (food: string) => update((s) => ({ ...s, pantry: s.pantry.filter((p) => p.food !== food) }))
  const add = (food: string) => {
    if (!food || state.pantry.some((p) => p.food === food)) return
    update((s) => ({ ...s, pantry: [...s.pantry, { food, grams: FOOD_BY_ID[food].packageGrams }] }))
    setAdding('')
  }

  /** Subtract a day's planned ingredients from the pantry so inventory stays honest. */
  const eatDay = () => {
    const used: Record<string, number> = {}
    for (const { entry } of dayEntries(state.plan[ateDay])) {
      const r = RECIPE_BY_ID[entry.recipe]
      if (!r) continue
      for (const it of r.items) used[it.food] = (used[it.food] ?? 0) + (it.grams * entry.portion) / r.servings
    }
    update((s) => ({
      ...s,
      pantry: s.pantry.map((p) => (used[p.food] ? { ...p, grams: Math.max(0, Math.round(p.grams - used[p.food])) } : p)),
    }))
    setToast(`Took ${DAYS[ateDay]}'s ingredients out of your pantry.`)
  }

  const rows: Row[] = state.pantry.flatMap((p) => (FOOD_BY_ID[p.food] ? [{ p, f: FOOD_BY_ID[p.food] }] : []))
    .sort((a, b) => a.f.name.localeCompare(b.f.name))
  const useSoon = rows.filter((r) => r.p.grams > 0 && r.f.shelfDays <= USE_SOON_DAYS).sort((a, b) => a.f.shelfDays - b.f.shelfDays)
  const usedUp = rows.filter((r) => r.p.grams <= 0)
  const rest = rows.filter((r) => r.p.grams > 0 && r.f.shelfDays > USE_SOON_DAYS)
  const groups: [string, Row[]][] = AISLE_ORDER.map((a): [string, Row[]] => [a, rest.filter((r) => r.f.aisle === a)]).filter(([, r]) => r.length > 0)
  const notInPantry = FOODS.filter((f) => !f.product && !state.pantry.some((p) => p.food === f.id)).sort((a, b) => a.name.localeCompare(b.name))
  const inStock = rows.length - usedUp.length

  const renderRow = ({ p, f }: Row) => {
    const isOpen = open === p.food
    const packs = Math.round((p.grams / f.packageGrams) * 10) / 10
    return (
      <li key={p.food} className={`pantry-item ${p.grams <= 0 ? 'empty' : ''}`}>
        <button className="pantry-row" onClick={() => setOpen(isOpen ? null : p.food)} aria-expanded={isOpen}>
          <span className="pantry-name">
            <strong>{f.name}</strong>
            <span className="muted small">{p.grams > 0 ? `${formatLb(p.grams)} · about ${packs} × ${f.packageLabel}` : 'Used up'}</span>
          </span>
          <span className="pantry-tags">
            {scannedFoods.has(p.food) && <Chip tone="accent">Scanned</Chip>}
            {p.grams > 0 && f.shelfDays <= USE_SOON_DAYS && <Chip tone="warn">Keeps {f.shelfDays} d</Chip>}
            <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} />
          </span>
        </button>
        {isOpen && (
          <div className="pantry-controls">
            <NumberField label={`${f.name} grams`} value={Math.round(p.grams)} min={0} max={20000} step={10} onChange={(n) => setGrams(p.food, n)} suffix="g" />
            <button className="secondary small" onClick={() => setGrams(p.food, p.grams + f.packageGrams)}>+1 pack</button>
            <button className="ghost small danger" onClick={() => remove(p.food)} aria-label={`Remove ${f.name}`}>Remove</button>
          </div>
        )}
      </li>
    )
  }

  return (
    <>
      <section className="card hero pantry-hero">
        <h1>Pantry, fridge & freezer</h1>
        <p className="muted small">What's at home. Your list skips it, and meals use it up first.</p>
        <button className="primary with-icon pantry-scan" onClick={() => setScan({})}><Icon name="scan" /> Scan a product</button>
        <div className="add-row">
          <select value={adding} onChange={(e) => setAdding(e.target.value)} aria-label="Food to add">
            <option value="">Or add by name…</option>
            {notInPantry.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="secondary" onClick={() => add(adding)} disabled={!adding}>Add</button>
        </div>
      </section>

      {rows.length === 0 ? (
        <section className="card">
          <p className="muted">Nothing here yet. Scan or add what you have, or tick off your shopping list after you shop.</p>
        </section>
      ) : (
        <p className="muted small pantry-count">{inStock} {inStock === 1 ? 'food' : 'foods'} at home. Tap one to change how much.</p>
      )}

      {useSoon.length > 0 && (
        <section className="card pantry-soon">
          <h2 className="with-icon"><Icon name="clock" /> Use soon</h2>
          <p className="muted small">Fresh foods that keep about a week or less once bought.</p>
          <ul className="pantry-list">{useSoon.map(renderRow)}</ul>
        </section>
      )}

      {groups.map(([aisle, list]) => (
        <section key={aisle} className="card">
          <h2>{aisle}</h2>
          <ul className="pantry-list">{list.map(renderRow)}</ul>
        </section>
      ))}

      {usedUp.length > 0 && (
        <section className="card">
          <h2>Used up</h2>
          <ul className="pantry-list">{usedUp.map(renderRow)}</ul>
        </section>
      )}

      {state.products.length > 0 && (
        <section className="card">
          <button className="disclosure full" onClick={() => setShowProducts(!showProducts)} aria-expanded={showProducts}>
            <Icon name={showProducts ? 'chevronDown' : 'chevronRight'} /> Scanned products ({state.products.length})
          </button>
          {showProducts && (
            <>
              <p className="muted small">Label numbers replace the app's averages for matched foods. Ready-to-eat products get planned on their own while you have some.</p>
              <ul className="pantry-list">
                {[...state.products].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).map((x) => {
                  const base = x.matches ? FOOD_BY_ID[x.matches] : undefined
                  return (
                    <li key={x.id} className="pantry-item">
                      <div className="product-row">
                        <button className="pantry-row" onClick={() => setScan({ editing: x })}>
                          <span className="pantry-name">
                            <strong>{productTitle(x)}</strong>
                            <span className="muted small">
                              {x.label.kcal ?? '?'} kcal · {x.label.protein ?? '?'} g protein per {x.servingGrams} g
                              {base ? ` · used as ${base.name}` : x.readyToEat ? ' · ready to eat' : ' · its own item'}
                            </span>
                          </span>
                          <Icon name="pencil" size={16} label="Edit" />
                        </button>
                        <button className="ghost small" onClick={() => removeProduct(x)} aria-label={`Remove ${productTitle(x)}`}>Remove</button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      )}

      <section className="card quiet-tool">
        <button className="disclosure full" onClick={() => setShowAte(!showAte)} aria-expanded={showAte}>
          <Icon name={showAte ? 'chevronDown' : 'chevronRight'} /> Ate a day's meals?
        </button>
        {showAte && (
          <>
            <p className="muted small">Take that day's planned ingredients out of the pantry so next week's list stays right.</p>
            <div className="add-row">
              <select value={ateDay} onChange={(e) => setAteDay(Number(e.target.value))} aria-label="Day">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
              <button className="secondary" onClick={eatDay}>Take out of pantry</button>
            </div>
          </>
        )}
        {toast && <p className="good-text small" role="status">{toast}</p>}
      </section>
      {scan && <ScanSheet state={state} update={update} editing={scan.editing} onClose={() => setScan(null)} />}
    </>
  )
}
