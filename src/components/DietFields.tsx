import { DIETS, type Diet } from '../data/diets'
import { dietCautions } from '../lib/diets'
import type { DietId, Profile } from '../types'
import { Icon } from './Icon'
import { Why } from './ProfileFields'
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
      <Why label="How this works">
        <p>Meals with foods outside your diet are never planned, and combining diets keeps only what all of them allow. Your health conditions still apply on top.</p>
      </Why>
      <div className="pf-tiles">
        {DIETS.map((d) => {
          const on = p.diets.includes(d.id)
          return (
            <button key={d.id} type="button" className={`pf-tile ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(d.id)}>
              <Icon name={d.icon} />
              <span>{d.label}</span>
              {on && <Icon name="check" size={16} className="pf-tile-check" />}
            </button>
          )
        })}
      </div>
      {chosen.map((d) => {
        const { personal } = dietCautions(d, p)
        return (
          <section key={d.id} className="pf-detail">
            <h3 className="with-icon"><Icon name={d.icon} /> {d.label}</h3>
            <p className="small muted">{d.blurb}</p>
            {personal.length > 0 && (
              <div className="note">
                <strong>With your health settings</strong>
                {personal.map((c) => <p key={c.text} className="small">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

/** One-line summary of chosen diets, for the Profile list. */
export function DietSummary({ p }: { p: Profile }) {
  const on = DIETS.filter((d) => p.diets.includes(d.id))
  return <>{on.length ? on.map((d) => d.label).join(', ') : 'No set diet'}</>
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
