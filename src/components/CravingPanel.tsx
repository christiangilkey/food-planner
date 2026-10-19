import { useState } from 'react'
import type { Tab } from '../App'
import { useAiKey } from '../lib/aiKey'
import { deviceIdeas, type CravingIdea, type CravingResult } from '../lib/craving'
import { money } from '../lib/format'
import { portionFor, slotShares } from '../lib/planner'
import { computeTargets } from '../lib/energy'
import { RECIPE_BY_ID } from '../data/recipes'
import { Icon } from './Icon'
import { RecipeLink } from './RecipeViewer'
import type { ViewProps } from './ui'

const QUICK = ['Sweet', 'Salty', 'Crunchy', 'Creamy', 'Chocolate', 'Cheesy', 'Spicy', 'Something warm']

/** "I'm craving…": type it, get ideas from the pantry and things to buy later, all within your settings. */
export function CravingPanel({ state, update, goTo, day }: ViewProps & { goTo: (t: Tab, section?: string) => void; day: number }) {
  const key = useAiKey()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CravingResult | null>(null)
  const [warning, setWarning] = useState('')
  const [added, setAdded] = useState<string[]>([])

  const find = async (craving = text) => {
    if (!craving.trim()) return
    setBusy(true)
    setWarning('')
    setResult(null)
    try {
      if (key) {
        // Loaded only when used, so the app stays small for people without a key.
        const { aiIdeas } = await import('../lib/cravingAi')
        setResult(await aiIdeas(craving, state, key))
      } else {
        setResult(deviceIdeas(craving, state))
      }
    } catch (error) {
      setWarning(error instanceof Error ? error.message : 'Something went wrong.')
      setResult(deviceIdeas(craving, state))
    } finally {
      setBusy(false)
    }
  }

  /** Add a recipe idea as an extra snack today. */
  const addSnack = (id: string) => {
    const r = RECIPE_BY_ID[id]
    if (!r) return
    const kcal = computeTargets(state.profile).kcal * (slotShares(state.profile).snack || 0.12)
    const portion = portionFor(r, kcal, 'snack')
    update((s) => ({ ...s, plan: s.plan.map((d, i) => (i === day ? { ...d, snacks: [...d.snacks, { recipe: id, portion }] } : d)) }))
    setAdded((a) => [...a, id])
  }

  return (
    <div className="stack tight craving">
      <form className="craving-form" onSubmit={(e) => { e.preventDefault(); void find() }}>
        <label className="field">
          <span>What are you craving?</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. something sweet and crunchy, or pizza" autoFocus />
        </label>
        <div className="chips" role="group" aria-label="Quick picks">
          {QUICK.map((q) => (
            <button key={q} type="button" className="toggle-chip" onClick={() => { setText(q.toLowerCase()); void find(q.toLowerCase()) }}>{q}</button>
          ))}
        </div>
        <button className="primary with-icon" disabled={busy || !text.trim()}><Icon name="sparkles" size={16} /> {busy ? 'Finding ideas…' : 'Find ideas'}</button>
      </form>

      {warning && <p className="warn-text small" role="status">{warning}</p>}

      {result && (
        <>
          {result.understood && <p className="muted small">Reading this as: <strong>{result.understood}</strong></p>}
          {result.fromPantry.length > 0 && (
            <>
              <h3 className="with-icon"><Icon name="chef" size={16} /> Make now from your pantry</h3>
              <IdeaList ideas={result.fromPantry} added={added} onAdd={addSnack} />
            </>
          )}
          {result.toBuy.length > 0 && (
            <>
              <h3 className="with-icon"><Icon name="cart" size={16} /> Buy for next time</h3>
              <IdeaList ideas={result.toBuy} added={added} onAdd={addSnack} />
            </>
          )}
          {!result.fromPantry.length && !result.toBuy.length && <p className="muted">{result.note || 'No ideas that fit your settings this time. Try describing it another way.'}</p>}
          {result.note && (result.fromPantry.length > 0 || result.toBuy.length > 0) && <p className="note">{result.note}</p>}
          <p className="muted small">
            {result.source === 'ai'
              ? 'Ideas from Claude, picked only from meals and foods your conditions, diet, medications and kitchen allow, then checked again by the app.'
              : <>Ideas from your device, using only meals and foods your settings allow. For smarter ideas, add your own Anthropic API key in <button type="button" className="link" onClick={() => goTo('profile', 'ai')}>Profile → AI suggestions</button>.</>}
          </p>
        </>
      )}
    </div>
  )
}

function IdeaList({ ideas, added, onAdd }: { ideas: CravingIdea[]; added: string[]; onAdd: (id: string) => void }) {
  return (
    <ul className="option-list">
      {ideas.map((x) => (
        <li key={`${x.kind}-${x.id}`} className="craving-idea">
          <div>
            {x.kind === 'recipe' ? <RecipeLink id={x.id} className="option-title" /> : <span className="option-title">{x.name}</span>}
            <p className="small">{x.why}</p>
            <p className="muted small">
              {x.kind === 'recipe'
                ? [x.kcal !== undefined && `${x.kcal} kcal`, x.protein !== undefined && `${x.protein} g protein`, x.pantry !== undefined && x.pantry > 0 && `${Math.round(x.pantry * 100)}% at home`].filter(Boolean).join(' · ')
                : x.price !== undefined ? `about ${money(x.price)} a package` : ''}
            </p>
          </div>
          {x.kind === 'recipe' && (
            added.includes(x.id)
              ? <span className="good-text small with-icon"><Icon name="check" size={14} /> Added</span>
              : <button type="button" className="secondary small" onClick={() => onAdd(x.id)}>Add as snack</button>
          )}
        </li>
      ))}
    </ul>
  )
}
