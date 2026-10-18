import { DIETS, type Diet } from '../data/diets'
import { dietCautions } from '../lib/diets'
import type { DietId, Profile } from '../types'
import { Icon } from './Icon'
import { Sourced, type ViewProps } from './ui'

/** Pick one or more eating patterns. The planner only uses foods every chosen diet allows. */
export function DietFields({ state, update }: ViewProps) {
  const p = state.profile
  const toggle = (id: DietId) =>
    update((s) => {
      const on = s.profile.diets.includes(id)
      return { ...s, profile: { ...s.profile, diets: on ? s.profile.diets.filter((x) => x !== id) : [...s.profile.diets, id] } }
    })
  const chosen = DIETS.filter((d) => p.diets.includes(d.id))
  return (
    <div className="stack">
      <p className="muted small">
        Choose any eating pattern you follow. Meals with foods outside it are never planned, and combining diets keeps only what all of them allow. Your health conditions still apply on top.
      </p>
      <div className="condition-grid">
        {DIETS.map((d) => {
          const on = p.diets.includes(d.id)
          return (
            <div key={d.id} className={`condition-card ${on ? 'on' : ''}`}>
              <input type="checkbox" id={`diet-${d.id}`} checked={on} onChange={() => toggle(d.id)} />
              <label htmlFor={`diet-${d.id}`}>
                <strong className="with-icon"><Icon name={d.icon} /> {d.label}</strong>
                <small>{d.blurb}</small>
              </label>
            </div>
          )
        })}
      </div>
      {chosen.map((d) => {
        const { personal } = dietCautions(d, p)
        if (!personal.length) return null
        return (
          <div key={d.id} className="note">
            <strong className="with-icon"><Icon name={d.icon} size={16} /> {d.label} with your health settings</strong>
            {personal.map((c) => <p key={c.text} className="small">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
          </div>
        )
      })}
    </div>
  )
}

/** A diet's evidence and cautions, for the Health tab. */
export function DietCard({ d, p }: { d: Diet; p: Profile }) {
  const { personal, general } = dietCautions(d, p)
  return (
    <section className="card">
      <h2 className="with-icon"><Icon name={d.icon} /> {d.label} diet</h2>
      <p className="small muted">{d.blurb}</p>
      <h3>What the research shows</h3>
      {d.evidence.map((c) => <p key={c.text} className="claim">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
      {personal.length > 0 && (
        <>
          <h3>With your conditions and medications</h3>
          {personal.map((c) => <p key={c.text} className="claim">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
        </>
      )}
      <h3>Also know</h3>
      {general.map((c) => <p key={c.text} className="claim">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
    </section>
  )
}
