import { useState } from 'react'
import { ACCESS, EQUIPMENT, EQUIPMENT_GROUPS, EXERCISE_BY_ID, type EquipmentId } from '../data/training'
import { LIMITATIONS, type LimitationId } from '../data/limitations'
import { activePlace, placesOf } from '../lib/training'
import { hasCondition } from '../lib/conditions'
import type { FitnessSettings, Profile, TrainingPlace } from '../types'
import { Icon } from './Icon'
import { Sourced, Why } from './ui'

type SetFit = (patch: Partial<FitnessSettings>) => void

/** "Training at: Gym · Home · Hotel": one tap changes the place, and the plan follows. */
export function PlaceBar({ f, setFit, onEquipment, onLimits }: { f: FitnessSettings; setFit: SetFit; onEquipment: () => void; onLimits: () => void }) {
  const places = placesOf(f)
  const here = activePlace(f)
  const limits = f.limitations?.length ?? 0
  return (
    <section className="card place-bar" aria-label="Where you’re training">
      <div className="row-between">
        <span className="eyebrow">Training at</span>
        <button type="button" className="link small" onClick={onEquipment}>Equipment</button>
      </div>
      <div className="trigger-list" role="group" aria-label="Places">
        {places.map((p) => (
          <button key={p.id} type="button" className={`toggle-chip ${p.id === here.id ? 'on' : ''}`} aria-pressed={p.id === here.id}
            onClick={() => setFit({ places, place: p.id })}>
            {p.id === here.id && <Icon name="check" size={14} />} {p.name}
          </button>
        ))}
        <button type="button" className="toggle-chip" onClick={onEquipment} aria-label="Add or edit places"><Icon name="plus" size={14} /> Place</button>
      </div>
      <p className="muted small">
        {here.equipment.length ? `${here.equipment.length} piece${here.equipment.length > 1 ? 's' : ''} of equipment` : 'Bodyweight only'} ·{' '}
        <button type="button" className="link small" onClick={onLimits}>{limits ? `${limits} limitation${limits > 1 ? 's' : ''}` : 'Injuries or limitations?'}</button>
      </p>
    </section>
  )
}

const newId = () => `p${Date.now().toString(36)}`

/** Places and the equipment at each. Every tick changes the plan straight away. */
export function EquipmentEditor({ f, setFit }: { f: FitnessSettings; setFit: SetFit }) {
  const places = placesOf(f)
  const here = activePlace(f)
  const [naming, setNaming] = useState<string | null>(null)
  const save = (next: TrainingPlace[], place = here.id) => setFit({ places: next, place })
  const patch = (p: Partial<TrainingPlace>) => save(places.map((x) => (x.id === here.id ? { ...x, ...p } : x)))
  const toggle = (id: EquipmentId) => patch({ equipment: here.equipment.includes(id) ? here.equipment.filter((x) => x !== id) : [...here.equipment, id] })
  const add = () => {
    const id = newId()
    save([...places, { id, name: `Place ${places.length + 1}`, equipment: [] }], id)
    setNaming(id)
  }
  const remove = () => {
    const rest = places.filter((x) => x.id !== here.id)
    if (rest.length) save(rest, rest[0].id)
  }
  return (
    <div className="stack tight equipment-editor">
      <p className="muted small">Tick what you can use at each place you train. Switch places on the Train tab and the week rebuilds around what’s there.</p>
      <div className="trigger-list" role="group" aria-label="Places">
        {places.map((p) => (
          <button key={p.id} type="button" className={`toggle-chip ${p.id === here.id ? 'on' : ''}`} aria-pressed={p.id === here.id} onClick={() => save(places, p.id)}>{p.name}</button>
        ))}
        <button type="button" className="toggle-chip" onClick={add}><Icon name="plus" size={14} /> Add a place</button>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input value={here.name} autoFocus={naming === here.id} maxLength={40} onChange={(e) => patch({ name: e.target.value })} onBlur={() => setNaming(null)} />
        </label>
        <label className="field">
          <span>Start from</span>
          <select value="" onChange={(e) => { const a = ACCESS.find((x) => x.id === e.target.value); if (a) patch({ equipment: [...a.equipment] }) }}>
            <option value="">Choose a preset…</option>
            {ACCESS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
      </div>

      {EQUIPMENT_GROUPS.map((g) => (
        <div key={g.id}>
          <h3>{g.label}</h3>
          <div className="check-grid compact">
            {EQUIPMENT.filter((e) => e.group === g.id).map((e) => {
              const on = here.equipment.includes(e.id)
              return (
                <label key={e.id} className={`check-card ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(e.id)} />
                  <span><strong>{e.label}</strong>{e.detail && <small className="muted"> {e.detail}</small>}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
      <p className="muted small">Bodyweight exercises are always included. Brand names only describe the kind of equipment; the app isn’t affiliated with them.</p>
      {places.length > 1 && <button type="button" className="ghost danger small" onClick={remove}>Remove {here.name}</button>}
    </div>
  )
}

/** Physical limitations, and the exercises you've swapped or ruled out yourself. */
export function LimitsEditor({ f, p, setFit }: { f: FitnessSettings; p?: Profile; setFit: SetFit }) {
  // Osteoporosis set as a health condition in the profile is always on here too.
  const fromProfile = new Set<LimitationId>(p && hasCondition(p, 'osteoporosis') ? ['osteoporosis'] : [])
  const on = new Set([...(f.limitations ?? []), ...fromProfile])
  const toggle = (id: LimitationId) => setFit({ limitations: on.has(id) ? [...on].filter((x) => x !== id) : [...on, id] })
  const swaps = Object.entries(f.swaps ?? {}).filter(([a, b]) => EXERCISE_BY_ID[a] && EXERCISE_BY_ID[b])
  const avoided = (f.avoid ?? []).filter((id) => EXERCISE_BY_ID[id])
  return (
    <div className="stack tight">
      <p className="muted small">Tick anything that applies. Exercises that load it are swapped for ones that don’t, and a little targeted work is added where it helps. Change it any time.</p>
      {LIMITATIONS.map((l) => (
        <div key={l.id}>
          <label className={`toggle compact ${on.has(l.id) ? 'on' : ''}`}>
            <input type="checkbox" checked={on.has(l.id)} disabled={fromProfile.has(l.id)} onChange={() => toggle(l.id)} />
            <span><strong>{l.label}</strong><small> {fromProfile.has(l.id) ? 'On from your health conditions in Profile.' : l.detail}</small></span>
          </label>
          {on.has(l.id) && (
            <div className="limit-detail small">
              <p>{l.tip}</p>
              {l.claims.map((c) => (
                <p key={c.text} className="muted">
                  {c.text}{' '}
                  {c.sources.length ? <Sourced evidence={c.evidence} ids={c.sources} /> : <Why convention="This app’s rule, based on how the exercise loads the joint; no trial tested it." />}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
      <p className="muted small">Pregnancy is set in Profile → Medications & pregnancy; the plan already adjusts for it.</p>

      {(swaps.length > 0 || avoided.length > 0) && <h3>Your changes</h3>}
      {swaps.map(([from, to]) => (
        <div key={from} className="row-between small swap-row">
          <span>{EXERCISE_BY_ID[to].name} <span className="muted">instead of {EXERCISE_BY_ID[from].name}</span></span>
          <button type="button" className="link small" onClick={() => { const next = { ...f.swaps }; delete next[from]; setFit({ swaps: next }) }}>Undo</button>
        </div>
      ))}
      {avoided.map((id) => (
        <div key={id} className="row-between small swap-row">
          <span>{EXERCISE_BY_ID[id].name} <span className="muted">is never planned</span></span>
          <button type="button" className="link small" onClick={() => setFit({ avoid: avoided.filter((x) => x !== id) })}>Allow again</button>
        </div>
      ))}
    </div>
  )
}
