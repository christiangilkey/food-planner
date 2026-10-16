import { useState } from 'react'
import { FOODS } from '../data/foods'
import { priceIndex, STATE_PRICE_INDEX } from '../data/regions'
import { estimatedPackagePrice } from '../lib/nutrition'
import { weeklyNeeds } from '../lib/shopping'
import { type ViewProps } from './ui'
import { money } from '../lib/format'

export function PricesView({ state, update }: ViewProps) {
  const [newStore, setNewStore] = useState('')
  const [filter, setFilter] = useState<'plan' | 'all'>('plan')
  const [query, setQuery] = useState('')
  const storeId = state.preferredStore
  const region = STATE_PRICE_INDEX[state.profile.state]
  const needs = weeklyNeeds(state.plan)

  const addStore = () => {
    const name = newStore.trim()
    if (!name) return
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    update((s) => ({ ...s, stores: [...s.stores, { id, name }], preferredStore: s.preferredStore ?? id }))
    setNewStore('')
  }
  const removeStore = (id: string) =>
    update((s) => {
      const stores = s.stores.filter((x) => x.id !== id)
      const priceOverrides = { ...s.priceOverrides }
      delete priceOverrides[id]
      return { ...s, stores, priceOverrides, preferredStore: s.preferredStore === id ? stores[0]?.id ?? null : s.preferredStore }
    })
  const setPrice = (food: string, raw: string) =>
    update((s) => {
      if (!storeId) return s
      const forStore = { ...(s.priceOverrides[storeId] ?? {}) }
      const n = Number(raw)
      if (raw.trim() === '' || !Number.isFinite(n) || n < 0) delete forStore[food]
      else forStore[food] = n
      return { ...s, priceOverrides: { ...s.priceOverrides, [storeId]: forStore } }
    })

  const foods = FOODS.filter((f) => (filter === 'all' || needs[f.id]) && f.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.aisle.localeCompare(b.aisle) || a.name.localeCompare(b.name))
  const entered = storeId ? Object.keys(state.priceOverrides[storeId] ?? {}).length : 0

  return (
    <div className="stack">
      <section className="card">
        <h1>Stores</h1>
        <p className="muted small">
          Estimates start from US averages
          {region ? `, adjusted ${priceIndex(state.profile.state) >= 1 ? '+' : ''}${Math.round((priceIndex(state.profile.state) - 1) * 100)}% for ${region.name}` : ' (set your state in Profile to adjust them)'}.
          Add the stores you use and type in real shelf prices as you shop. The shopping list will use them and point out where something is cheaper.
        </p>
        <div className="add-row">
          <input value={newStore} onChange={(e) => setNewStore(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStore()} placeholder="Store name, e.g. Trader Joe's" aria-label="Store name" />
          <button className="primary" onClick={addStore} disabled={!newStore.trim()}>Add store</button>
        </div>
        {state.stores.length > 0 && (
          <div className="store-list">
            {state.stores.map((s) => (
              <div key={s.id} className={`store ${s.id === storeId ? 'on' : ''}`}>
                <button className="store-pick" onClick={() => update((x) => ({ ...x, preferredStore: s.id }))} aria-pressed={s.id === storeId}>
                  {s.id === storeId ? '★ ' : ''}{s.name}
                </button>
                <button className="ghost small" onClick={() => removeStore(s.id)} aria-label={`Remove ${s.name}`}>✕</button>
              </div>
            ))}
          </div>
        )}
        {storeId && <p className="muted small">★ is your main store: the shopping list totals use its prices. Tap another store to edit its prices.</p>}
      </section>

      <section className="card">
        <div className="row-between">
          <h2>{storeId ? `Prices at ${state.stores.find((s) => s.id === storeId)?.name}` : 'Estimated prices'}</h2>
          {storeId && <span className="muted small">{entered} entered</span>}
        </div>
        <div className="add-row">
          <div className="segmented">
            <button className={filter === 'plan' ? 'on' : ''} onClick={() => setFilter('plan')}>This week</button>
            <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All foods</button>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search foods" />
        </div>
        {!storeId && <p className="muted small">Add a store above to enter your own prices.</p>}
        <table className="price-table">
          <thead>
            <tr><th>Food</th><th>Package</th><th>Estimate</th>{storeId && <th>Your price</th>}</tr>
          </thead>
          <tbody>
            {foods.map((f) => {
              const override = storeId ? state.priceOverrides[storeId]?.[f.id] : undefined
              return (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td className="muted small">{f.packageLabel}</td>
                  <td className="num">{money(estimatedPackagePrice(f.id, state))}</td>
                  {storeId && (
                    <td>
                      <input
                        key={`${storeId}-${f.id}`}
                        className="price-input"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        defaultValue={override ?? ''}
                        placeholder="—"
                        onBlur={(e) => setPrice(f.id, e.target.value)}
                        aria-label={`${f.name} price`}
                      />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
