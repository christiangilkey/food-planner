import { useEffect, useMemo, useRef, useState } from 'react'
import type { DietTag } from '../data/diets'
import { FOOD_BY_ID, FOODS } from '../data/foods'
import { AISLE_ORDER } from '../lib/shopping'
import { avoidedFoods, avoidLabel, dietBlocked, productTriggers } from '../lib/conditions'
import { packageGramsFrom, parseNutritionLabel } from '../lib/label'
import { lookupBarcode } from '../lib/openfoodfacts'
import { blankProduct, defaultMatch, inferTags, LABEL_FIELDS, plausibleMatch, productFoodId, stockProduct, suggestMatches } from '../lib/products'
import { ocrText, readBarcode } from '../lib/scan'
import type { MealSlot, Product } from '../types'
import { Icon } from './Icon'
import { NumberField, Sheet, Sourced, type ViewProps } from './ui'

type Step = 'start' | 'camera' | 'review'

const TAG_LABELS: [DietTag, string][] = [
  ['meat', 'Meat'], ['fish', 'Fish/seafood'], ['egg', 'Egg'], ['dairy', 'Dairy'], ['grain', 'Grain'], ['legume', 'Beans/soy/peanut'],
  ['soy', 'Soy'], ['peanut', 'Peanut'], ['nut', 'Tree nuts'], ['seed', 'Seeds'], ['nightshade', 'Nightshades'], ['coffee_cocoa', 'Coffee/cocoa'],
  ['honey', 'Honey'], ['sweetener', 'Sweetener'], ['processed', 'Processed'],
]
const SLOT_LABELS: [MealSlot, string][] = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snack']]

/** Scan a product (barcode or label photo), check it, and put it in the pantry. */
export function ScanSheet({ state, update, onClose, editing }: ViewProps & { onClose: () => void; editing?: Product }) {
  const [step, setStep] = useState<Step>(editing ? 'review' : 'start')
  const [draft, setDraft] = useState<Product>(() => editing ?? blankProduct())
  const [packages, setPackages] = useState(editing ? 0 : 1)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const labelInput = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<Product>) => setDraft((d) => ({ ...d, ...patch }))

  const lookup = async (barcode: string) => {
    setBusy('Looking up the barcode…')
    setNote('')
    try {
      const found = await lookupBarcode(barcode)
      if (!found) {
        set({ barcode })
        setNote('That barcode isn’t in Open Food Facts yet. Take a photo of the Nutrition Facts label, or type the numbers in.')
      } else {
        const { categories: _, ...rest } = found
        setDraft((d) => {
          const next = { ...d, ...rest }
          return { ...next, tags: inferTags(`${next.name} ${next.ingredients}`), matches: defaultMatch(next) }
        })
        if (!Object.keys(found.label ?? {}).length) setNote('Found the product, but not its nutrition. Add a label photo or type the numbers in.')
      }
      setStep('review')
    } catch {
      set({ barcode })
      setNote('Couldn’t reach Open Food Facts (are you offline?). Take a label photo or type the numbers in.')
      setStep('review')
    } finally {
      setBusy('')
    }
  }

  const readLabel = async (file: File) => {
    setBusy('Reading the label… 0%')
    setNote('')
    try {
      const text = await ocrText(file, (p) => setBusy(`Reading the label… ${Math.round(p * 100)}%`))
      const parsed = parseNutritionLabel(text)
      setDraft((d) => {
        const packageGrams = d.packageGrams || (parsed.servingGrams && parsed.servingsPerContainer ? Math.round(parsed.servingGrams * parsed.servingsPerContainer) : 0)
        return { ...d, label: { ...d.label, ...parsed.label }, servingGrams: parsed.servingGrams ?? d.servingGrams, packageGrams }
      })
      setNote(parsed.found >= 4
        ? `Read ${parsed.found} values from the label. Check them against the package before saving.`
        : 'Only part of the label was readable. Fill in the rest, or retake the photo flat, in good light, filling the frame.')
      setStep('review')
    } catch {
      setNote('Couldn’t read that photo. The text reader downloads once (about 10 MB) and needs a connection the first time.')
    } finally {
      setBusy('')
    }
  }

  const save = () => {
    const product = { ...draft, name: draft.name.trim() || 'Scanned product', addedAt: editing?.addedAt ?? new Date().toISOString() }
    update((s) => {
      const products = [...s.products.filter((x) => x.id !== product.id), product]
      // An edit that changes what the product matches moves its stock to the new food.
      let pantry = s.pantry
      if (editing && editing.matches !== product.matches) {
        const from = editing.matches || productFoodId(editing)
        const grams = pantry.find((x) => x.food === from)?.grams ?? 0
        pantry = pantry.filter((x) => x.food !== from)
        if (grams > 0) pantry = stockProduct({ ...s, pantry }, product, grams / Math.max(1, product.packageGrams))
      }
      return { ...s, products, pantry: packages > 0 ? stockProduct({ ...s, pantry }, product, packages) : pantry }
    })
    onClose()
  }

  return (
    <Sheet title={editing ? 'Edit scanned product' : 'Scan a product'} onClose={onClose}>
      {!editing && (
        <p className="scan-step">
          {step === 'review' ? <><span>Step 2 of 2</span> Check and save</> : <><span>Step 1 of 2</span> Find the product</>}
        </p>
      )}
      {busy && <p className="scan-busy" role="status"><span className="spinner" aria-hidden /> {busy}</p>}
      {note && <p className="note" role="status">{note}</p>}

      {step === 'start' && (
        <div className="stack">
          <p className="muted small">The barcode fills everything in. No barcode? Photograph the Nutrition Facts panel. Photos stay on your phone; only a barcode number is sent.</p>
          <div className="scan-start">
            <button className="primary with-icon" onClick={() => setStep('camera')} disabled={!!busy}><Icon name="scan" /> Scan barcode</button>
            <button className="secondary with-icon" onClick={() => labelInput.current?.click()} disabled={!!busy}><Icon name="camera" /> Photo of the label</button>
          </div>
          <form className="add-row" onSubmit={(e) => { e.preventDefault(); if (code) lookup(code) }}>
            <input inputMode="numeric" placeholder="Barcode number" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Barcode number" />
            <button className="secondary" disabled={code.replace(/\D/g, '').length < 6 || !!busy}>Look up</button>
          </form>
          <button className="ghost scan-manual" onClick={() => setStep('review')} disabled={!!busy}>No barcode or label? Type it in</button>
        </div>
      )}

      {step === 'camera' && <BarcodeCamera onCode={(c) => lookup(c)} onCancel={() => setStep('start')} />}

      <input ref={labelInput} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) readLabel(f) }} />

      {step === 'review' && (
        <ProductForm state={state} draft={draft} set={set} packages={packages} setPackages={setPackages} editing={!!editing}
          onLabelPhoto={() => labelInput.current?.click()} busy={!!busy} onSave={save} />
      )}
    </Sheet>
  )
}

function BarcodeCamera({ onCode, onCancel }: { onCode: (code: string) => void; onCancel: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const photo = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  // Keep the latest callback without restarting the camera on every render.
  const onCodeRef = useRef(onCode)
  useEffect(() => { onCodeRef.current = onCode })

  useEffect(() => {
    let stream: MediaStream | null = null
    let timer = 0
    let done = false
    const tick = async () => {
      const v = video.current
      if (done || !v) return
      if (v.readyState >= 2) {
        const c = await readBarcode(v).catch(() => null)
        if (c && !done) { done = true; onCodeRef.current(c); return }
      }
      timer = window.setTimeout(tick, 250)
    }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        stream = s
        if (video.current) { video.current.srcObject = s; video.current.play().catch(() => {}) }
        tick()
      })
      .catch(() => setError('The camera isn’t available here. Take a photo of the barcode instead, or type its number.'))
    return () => { done = true; clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()) }
  }, [])

  const fromPhoto = async (file: File) => {
    const c = await readBarcode(await createImageBitmap(file)).catch(() => null)
    if (c) onCode(c)
    else setError('No barcode found in that photo. Get closer so the bars fill most of the frame.')
  }

  return (
    <div className="stack">
      {!error && <div className="scan-video"><video ref={video} muted playsInline /><span className="scan-frame" aria-hidden /></div>}
      {error ? <p className="warn-text small">{error}</p> : <p className="muted small">Hold the barcode inside the box. It reads by itself.</p>}
      <div className="scan-options">
        <button className={`${error ? 'primary' : 'secondary'} with-icon`} onClick={() => photo.current?.click()}><Icon name="camera" /> Photo of the barcode</button>
        <button className="ghost with-icon" onClick={onCancel}><Icon name="chevronLeft" /> Back</button>
      </div>
      <input ref={photo} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) fromPhoto(f) }} />
    </div>
  )
}

function ProductForm({
  state, draft, set, packages, setPackages, editing, onLabelPhoto, busy, onSave,
}: {
  state: ViewProps['state']
  draft: Product
  set: (p: Partial<Product>) => void
  packages: number
  setPackages: (n: number) => void
  editing: boolean
  onLabelPhoto: () => void
  busy: boolean
  onSave: () => void
}) {
  const p = state.profile
  const matches = useMemo(() => suggestMatches(draft.name), [draft.name])
  const known = FOODS.filter((f) => !f.product).sort((a, b) => a.name.localeCompare(b.name))

  // Run the same checks the planner will: condition triggers in the name and ingredients, and diets.
  const check = useMemo(() => {
    const avoided = avoidedFoods(p)
    const probe = {
      ...FOODS[0], id: '__probe', product: draft.id, scanText: `${draft.brand} ${draft.name} ${draft.ingredients}`.toLowerCase(),
      ingredientsKnown: draft.ingredients.trim().length > 0,
    }
    const triggers = productTriggers(probe, p, avoided)
    const matchedOut = draft.matches && (avoided.has(draft.matches) || dietBlocked(p).has(draft.matches))
    return { triggers, matchedOut }
  }, [p, draft])

  const toggleTag = (t: DietTag) => set({ tags: draft.tags.includes(t) ? draft.tags.filter((x) => x !== t) : [...draft.tags, t] })
  const toggleSlot = (s: MealSlot) => set({ slots: draft.slots.includes(s) ? draft.slots.filter((x) => x !== s) : [...draft.slots, s] })
  const servings = draft.servingGrams > 0 && draft.packageGrams > 0 ? Math.round((draft.packageGrams / draft.servingGrams) * 10) / 10 : 0
  const canSave = draft.servingGrams > 0 && draft.packageGrams > 0 && (draft.label.kcal ?? -1) >= 0 && !busy

  return (
    <div className="stack scan-form">
      <h3 className="scan-h">Product</h3>
      <div className="form-grid">
        <label className="field"><span>Name</span><input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Plain Greek yogurt" /></label>
        <label className="field"><span>Brand</span><input value={draft.brand} onChange={(e) => set({ brand: e.target.value })} /></label>
      </div>

      <div className="form-grid">
        <NumberField label="Serving size" value={draft.servingGrams} min={0} max={5000} onChange={(n) => set({ servingGrams: n })} suffix="g" />
        <NumberField label="Package size" value={draft.packageGrams} min={0} max={50000} onChange={(n) => set({ packageGrams: n })} suffix="g" />
        <NumberField label="Price paid" value={draft.price} min={0} max={500} step={0.01} onChange={(n) => set({ price: n })} suffix="$" />
      </div>
      <p className="muted small">
        {servings ? `About ${servings} servings per package. ` : ''}Size in ounces? Type it:{' '}
        <input className="inline-input" placeholder="16 oz" aria-label="Package size with units"
          onBlur={(e) => { const g = packageGramsFrom(e.target.value); if (g) set({ packageGrams: g }) }} />
      </p>

      <div className="row-between">
        <h3 className="scan-h">Nutrition Facts <span className="muted small">per serving</span></h3>
        <button className="ghost small with-icon" onClick={onLabelPhoto} disabled={busy}><Icon name="camera" size={14} /> Read from photo</button>
      </div>
      <div className="label-grid">
        {LABEL_FIELDS.map((f) => (
          <label key={f.key} className="field">
            <span>{f.label}</span>
            <span className="input-wrap">
              <input type="number" inputMode="decimal" min={0} step="any" value={draft.label[f.key] ?? ''}
                onChange={(e) => set({ label: { ...draft.label, [f.key]: e.target.value === '' ? undefined : Number(e.target.value) } })} />
              <span className="suffix">{f.unit}</span>
            </span>
          </label>
        ))}
      </div>

      <label className="field">
        <span>Ingredients</span>
        <textarea rows={3} value={draft.ingredients} onChange={(e) => set({ ingredients: e.target.value })}
          onBlur={() => !editing && draft.ingredients && set({ tags: inferTags(`${draft.name} ${draft.ingredients}`) })}
          placeholder="Copy from the package. Checked against your conditions and diet." />
      </label>

      {check.triggers.length > 0 && (
        <div className="banner card" role="alert">
          <strong>Not for you: this stays in the pantry but won’t be planned</strong>
          {check.triggers.map((r, i) => (
            <p key={i} className="small">{avoidLabel(r)}: {r.entry.onlyIf === 'maoi' && !draft.ingredients.trim() ? 'with an MAOI, products without an ingredient list can’t be checked for tyramine. ' : ''}{r.entry.reason.text} <Sourced evidence={r.entry.reason.evidence} ids={r.entry.reason.sources} /></p>
          ))}
        </div>
      )}

      <label className="field">
        <span>What is it?</span>
        <select value={draft.matches} onChange={(e) => set({ matches: e.target.value })}>
          <option value="">Something else: keep it as its own item</option>
          {matches.length > 0 && <optgroup label="Best guesses">{matches.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</optgroup>}
          <optgroup label="All foods">{known.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</optgroup>
        </select>
        <small className="muted">
          {draft.matches
            ? 'Recipes with this food use your product and its label numbers instead of USDA averages.'
            : 'Recipes can’t use it. Mark it ready to eat below to have it planned on its own.'}
        </small>
      </label>
      {check.matchedOut && <p className="warn-text small">Your conditions or diet already keep this food out of your plan.</p>}
      {draft.matches && FOOD_BY_ID[draft.matches] && draft.label.kcal !== undefined && !plausibleMatch(draft, FOOD_BY_ID[draft.matches]) && (
        <p className="warn-text small">
          This label is quite different from {FOOD_BY_ID[draft.matches].name.toLowerCase()} (more calories or sugar). Matching would put these numbers into every recipe that uses it. If it’s a flavored or sweetened version, keep it as its own item instead.
        </p>
      )}

      {!draft.matches && (
        <>
          <label className="toggle">
            <input type="checkbox" checked={draft.readyToEat} onChange={(e) => set({ readyToEat: e.target.checked, slots: e.target.checked && !draft.slots.length ? ['snack'] : draft.slots })} />
            <span><strong>Ready to eat as is</strong><small>Protein bars, yogurt cups, frozen meals: planned as a meal or snack while you have some.</small></span>
          </label>
          {draft.readyToEat && (
            <div className="chips" role="group" aria-label="Good for">
              {SLOT_LABELS.map(([s, l]) => <button key={s} type="button" className={`toggle-chip ${draft.slots.includes(s) ? 'on' : ''}`} aria-pressed={draft.slots.includes(s)} onClick={() => toggleSlot(s)}>{l}</button>)}
              <button type="button" className={`toggle-chip ${draft.microwave ? 'on' : ''}`} aria-pressed={draft.microwave} onClick={() => set({ microwave: !draft.microwave })}>Needs microwave</button>
            </div>
          )}
          <div className="field">
            <span>Contains (for your diet) <small className="muted">guessed from the ingredients; fix anything wrong</small></span>
            <div className="chips">
              {TAG_LABELS.map(([t, l]) => <button key={t} type="button" className={`toggle-chip ${draft.tags.includes(t) ? 'on' : ''}`} aria-pressed={draft.tags.includes(t)} onClick={() => toggleTag(t)}>{l}</button>)}
            </div>
          </div>
          <label className="field">
            <span>Aisle</span>
            <select value={draft.aisle} onChange={(e) => set({ aisle: e.target.value as Product['aisle'] })}>
              {AISLE_ORDER.map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </>
      )}

      <div className="scan-save">
        <div className="row-between save-row">
          <NumberField label={editing ? 'Add packages to pantry' : 'Packages bought'} value={packages} min={0} max={50} onChange={setPackages} />
          <button className="primary" onClick={onSave} disabled={!canSave}>{editing ? 'Save changes' : 'Add to pantry'}</button>
        </div>
        {!canSave && !busy && <p className="muted small">Needs a serving size, package size and calories.</p>}
      </div>
    </div>
  )
}
