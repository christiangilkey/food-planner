import { useState } from 'react'
import { FOODS } from '../data/foods'
import { priceIndex, STATE_PRICE_INDEX } from '../data/regions'
import { estimatedPackagePrice } from '../lib/nutrition'
import { weeklyNeeds } from '../lib/shopping'
import { Bar, type ViewProps } from './ui'
import { money } from '../lib/format'
import { Icon } from './Icon'

/** Prices: your stores, then shelf prices for the starred one. */
export function PricesView({ state, update }: ViewProps) {
  const [newStore, setNewStore] = useState('')
  const [filter, setFilter] = useState<'plan' | 'all'>('plan')
  const [query, setQuery] = useState('')
  const [showEstimates, setShowEstimates] = useState(false)
  const storeId = state.preferredStore
  const store = state.stores.find((s) => s.id === storeId)
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
  const overrides = storeId ? state.priceOverrides[storeId] ?? {} : {}
  const weekFoods = Object.keys(needs).filter((id) => FOODS.some((f) => f.id === id))
  const weekEntered = weekFoods.filter((id) => overrides[id] !== undefined).length
  const pct = Math.round((priceIndex(state.profile.state) - 1) * 100)
  const basis = !region ? 'US averages (set your state in Profile to adjust them)'
    : pct === 0 ? `US averages, about right for ${region.name}`
    : `US averages, about ${Math.abs(pct)}% ${pct > 0 ? 'higher' : 'lower'} for ${region.name}`
  const showList = !!storeId || showEstimates

  const addForm = (main: boolean) => (
    <form className="add-row" onSubmit={(e) => { e.preventDefault(); addStore() }}>
      <input value={newStore} onChange={(e) => setNewStore(e.target.value)} placeholder="Store name" aria-label="Store name" />
      <button className={main ? 'primary' : 'secondary'} disabled={!newStore.trim()}>Add store</button>
    </form>
  )

  return (
    <>
      <section className="card hero">
        <h1>Prices</h1>
        {store ? (
          <>
            <p>Your list uses prices from <strong>{store.name}</strong>.</p>
            {weekFoods.length > 0 && (
              <>
                <div className="summary-label"><span>Real prices for this week's foods</span><span>{weekEntered} of {weekFoods.length}</span></div>
                <Bar value={weekEntered} max={weekFoods.length} tone="accent" label="This week's foods with a real price" />
              </>
            )}
            <p className="muted small">The rest use estimates: {basis}.</p>
          </>
        ) : (
          <>
            <p>Your list uses estimates: {basis}.</p>
            <p className="muted small">Add the store you use and type real shelf prices as you shop. The list will use them and point out where something's cheaper.</p>
            {addForm(true)}
          </>
        )}
      </section>

      {state.stores.length > 0 && (
        <section className="card">
          <h2>Your stores</h2>
          <p className="muted small">The starred store is the one your list adds up. Tap another to switch.</p>
          <div className="store-list">
            {state.stores.map((s) => (
              <div key={s.id} className={`store ${s.id === storeId ? 'on' : ''}`}>
                <button className="store-pick" onClick={() => update((x) => ({ ...x, preferredStore: s.id }))} aria-pressed={s.id === storeId}>
                  {s.id === storeId && <Icon name="star" size={14} />} {s.name}
                </button>
                <button className="ghost small" onClick={() => removeStore(s.id)} aria-label={`Remove ${s.name}`}><Icon name="x" size={14} /></button>
              </div>
            ))}
          </div>
          {addForm(false)}
        </section>
      )}

      <section className="card">
        {store ? (
          <>
            <h2>Prices at {store.name}</h2>
            <p className="muted small">Type the shelf price for one package. Leave it blank to use the estimate.</p>
          </>
        ) : (
          <button className="disclosure full" onClick={() => setShowEstimates(!showEstimates)} aria-expanded={showEstimates}>
            <Icon name={showEstimates ? 'chevronDown' : 'chevronRight'} /> See estimated prices
          </button>
        )}
        {showList && (
          <>
            <div className="add-row">
              <div className="segmented">
                <button className={filter === 'plan' ? 'on' : ''} onClick={() => setFilter('plan')} aria-pressed={filter === 'plan'}>This week</button>
                <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>All foods</button>
              </div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search foods" />
            </div>
            {foods.length === 0 && <p className="muted small">{query ? 'No foods match that search.' : 'No meals planned this week. Try All foods.'}</p>}
            <ul className="price-list">
              {foods.map((f) => (
                <li key={f.id} className="price-row">
                  <span className="price-name">
                    <span>{f.name}</span>
                    <span className="muted small">{f.packageLabel} · est. {money(estimatedPackagePrice(f.id, state))}</span>
                  </span>
                  {storeId && (
                    <span className="input-wrap price-field">
                      <input
                        key={`${storeId}-${f.id}`}
                        className="price-input"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        defaultValue={overrides[f.id] ?? ''}
                        placeholder="—"
                        onBlur={(e) => setPrice(f.id, e.target.value)}
                        aria-label={`${f.name} price at ${store?.name ?? 'your store'}`}
                      />
                      <span className="suffix">$</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
