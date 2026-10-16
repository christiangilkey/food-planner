import { useState } from 'react'
import { FOOD_BY_ID, FOODS } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import { DAYS, dayEntries } from '../lib/planner'
import { formatLb } from '../lib/shopping'
import { EquipmentFields } from './ProfileFields'
import { NumberField, type ViewProps } from './ui'

export function KitchenView(props: ViewProps) {
  const { state, update } = props
  const [adding, setAdding] = useState('')
  const [ateDay, setAteDay] = useState(0)
  const [toast, setToast] = useState('')

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
    setToast(`Removed ${DAYS[ateDay]}'s ingredients from your pantry.`)
  }

  const sorted = [...state.pantry].sort((a, b) => (FOOD_BY_ID[a.food]?.name ?? '').localeCompare(FOOD_BY_ID[b.food]?.name ?? ''))
  const notInPantry = FOODS.filter((f) => !state.pantry.some((p) => p.food === f.id)).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="stack">
      <section className="card">
        <h1>Equipment</h1>
        <p className="muted small">Meals that need tools you don't have won't be suggested.</p>
        <EquipmentFields {...props} />
      </section>

      <section className="card">
        <h1>Pantry, fridge & freezer</h1>
        <p className="muted small">
          What's already at home. The shopping list subtracts it, and the planner favors meals that use it up. Checking off your shopping list adds items here automatically.
        </p>
        <div className="add-row">
          <select value={adding} onChange={(e) => setAdding(e.target.value)} aria-label="Food to add">
            <option value="">Add something you have…</option>
            {notInPantry.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="primary" onClick={() => add(adding)} disabled={!adding}>Add</button>
        </div>
        {sorted.length === 0 && <p className="muted">Empty. Add what you've got, or check off items on the shopping list after you shop.</p>}
        <ul className="pantry-list">
          {sorted.map((p) => {
            const f = FOOD_BY_ID[p.food]
            if (!f) return null
            const expiring = f.shelfDays <= 7
            return (
              <li key={p.food} className={p.grams <= 0 ? 'empty' : ''}>
                <div className="pantry-name">
                  <strong>{f.name}</strong>
                  <span className="muted small">{formatLb(p.grams)} · about {Math.round((p.grams / f.packageGrams) * 10) / 10} × {f.packageLabel}{expiring ? ` · use within ${f.shelfDays} d` : ''}</span>
                </div>
                <div className="pantry-controls">
                  <NumberField label="Grams" value={Math.round(p.grams)} min={0} max={20000} step={10} onChange={(n) => setGrams(p.food, n)} suffix="g" />
                  <button className="secondary small" onClick={() => setGrams(p.food, p.grams + f.packageGrams)}>+1 pack</button>
                  <button className="ghost small" onClick={() => remove(p.food)} aria-label={`Remove ${f.name}`}>Remove</button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card">
        <h2>Ate a day's meals?</h2>
        <p className="muted small">Take that day's planned ingredients out of the pantry so next week's list stays accurate.</p>
        <div className="add-row">
          <select value={ateDay} onChange={(e) => setAteDay(Number(e.target.value))} aria-label="Day">
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <button className="secondary" onClick={eatDay}>Remove from pantry</button>
        </div>
        {toast && <p className="good-text small" role="status">{toast}</p>}
      </section>
    </div>
  )
}
