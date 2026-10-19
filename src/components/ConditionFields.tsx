import { CONDITIONS, MENOPAUSE_SOURCES, MENOPAUSE_STAGES } from '../data/conditions'
import { FOOD_BY_ID } from '../data/foods'
import type { ConditionId, Profile } from '../types'
import { Icon } from './Icon'
import { ToggleRow, Why } from './ProfileFields'
import { Cite, Sourced, type ViewProps } from './ui'

/** Health-condition toggles plus each condition's own options (stage, MAOI, trigger foods). */
export function ConditionFields({ state, update }: ViewProps) {
  const p = state.profile
  const set = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const toggle = (id: ConditionId) => {
    const on = !p.conditions.includes(id)
    const conditions = on ? [...p.conditions, id] : p.conditions.filter((c) => c !== id)
    set({ conditions, ...(id === 'adhd' ? { adhd: on } : {}) })
  }
  const toggleIn = (key: 'toleratedTriggers' | 'optInTriggers', food: string) =>
    set({ [key]: p[key].includes(food) ? p[key].filter((f) => f !== food) : [...p[key], food] } as Partial<Profile>)

  const visible = CONDITIONS.filter((c) => c.id !== 'menopause' || p.sex === 'female')
  const chosen = visible.filter((c) => p.conditions.includes(c.id))

  return (
    <div className="stack">
      <Why label="How this works">
        <p>Each condition adds hard limits the planner must respect, removes foods that could make it worse, and favors foods with evidence of helping. Every rule links to its source. This doesn’t replace advice from your doctor or dietitian.</p>
      </Why>
      <div className="pf-tiles">
        {visible.map((c) => {
          const on = p.conditions.includes(c.id)
          return (
            <button key={c.id} type="button" className={`pf-tile ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(c.id)}>
              <Icon name={c.icon} />
              <span>{c.label}</span>
              {on && <Icon name="check" size={16} className="pf-tile-check" />}
            </button>
          )
        })}
      </div>

      {chosen.map((c) => {
        const triggers = c.avoid.filter((a) => a.tolerable || a.optIn)
        return (
          <section key={c.id} className="pf-detail">
            <h3 className="with-icon"><Icon name={c.icon} /> {c.label}</h3>
            <p className="small muted">{c.blurb}</p>

            {c.id === 'menopause' && (
              <fieldset className="field">
                <legend>Stage</legend>
                <div className="radio-list">
                  {MENOPAUSE_STAGES.map((st) => (
                    <label key={st.id} className={`radio-card ${p.menopauseStage === st.id ? 'on' : ''}`}>
                      <input type="radio" name="meno" checked={p.menopauseStage === st.id} onChange={() => set({ menopauseStage: st.id })} />
                      <strong>{st.label}</strong>
                      <small>{st.detail}</small>
                    </label>
                  ))}
                </div>
                <Why><p>Based on: <Cite ids={MENOPAUSE_SOURCES} /></p></Why>
              </fieldset>
            )}

            {c.id === 'depression' && (
              <ToggleRow
                checked={p.maoi} onChange={(v) => set({ maoi: v })}
                label="I take an MAOI antidepressant"
                hint="Phenelzine, tranylcypromine, isocarboxazid, or the selegiline patch at higher doses. Removes tyramine-rich foods (aged cheese, kimchi, soy sauce, cured meat)."
                why={<p>Based on: <Cite ids={['gillman', 'flockhart']} /></p>}
              />
            )}

            {c.id === 'hashimotos' && !p.meds.thyroid && (
              <p className="small">Taking levothyroxine? Tick it under Medications so your dose and breakfast are timed around it.</p>
            )}

            {triggers.map((a, i) => (
              <div key={i} className="pf-triggers">
                <p className="small"><strong>{a.optIn ? 'Tap the foods that trigger you' : 'Tap any trigger you tolerate to allow it back'}</strong></p>
                <div className="trigger-list">
                  {a.foods.map((f) => {
                    const avoided = a.optIn ? p.optInTriggers.includes(f) : !p.toleratedTriggers.includes(f)
                    return (
                      <button key={f} type="button" className={`trigger ${avoided ? 'avoided' : ''}`} aria-pressed={avoided}
                        onClick={() => toggleIn(a.optIn ? 'optInTriggers' : 'toleratedTriggers', f)}>
                        <Icon name={avoided ? 'x' : 'check'} size={14} /> {FOOD_BY_ID[f]?.name ?? f}
                      </button>
                    )
                  })}
                </div>
                <Why><p>{a.reason.text} <Sourced evidence={a.reason.evidence} ids={a.reason.sources} /></p></Why>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

/** One-line summary of chosen conditions, for the Profile list. */
export function ConditionSummary({ p }: { p: Profile }) {
  const on = CONDITIONS.filter((c) => p.conditions.includes(c.id) && (c.id !== 'menopause' || p.sex === 'female'))
  return <>{on.length ? on.map((c) => c.label).join(', ') : 'None'}</>
}
