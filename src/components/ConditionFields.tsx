import { CONDITIONS, MENOPAUSE_SOURCES, MENOPAUSE_STAGES } from '../data/conditions'
import { FOOD_BY_ID } from '../data/foods'
import type { ConditionId, Profile } from '../types'
import { Icon } from './Icon'
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

  return (
    <div className="stack">
      <p className="muted small">
        Each condition adds hard limits the planner must respect, removes foods that could make it worse, and favors foods with evidence of helping. Every rule links to its source. This doesn’t replace advice from your doctor or dietitian.
      </p>
      <div className="condition-grid">
        {visible.map((c) => {
          const on = p.conditions.includes(c.id)
          return (
            <div key={c.id} className={`condition-card ${on ? 'on' : ''}`}>
              <input type="checkbox" id={`cond-${c.id}`} checked={on} onChange={() => toggle(c.id)} />
              <label htmlFor={`cond-${c.id}`}>
                <strong className="with-icon"><Icon name={c.icon} /> {c.label}</strong>
                <small>{c.blurb}</small>
              </label>
            </div>
          )
        })}
      </div>

      {p.conditions.includes('menopause') && p.sex === 'female' && (
        <fieldset className="field">
          <legend>Menopause stage <Cite ids={MENOPAUSE_SOURCES} /></legend>
          <div className="radio-list">
            {MENOPAUSE_STAGES.map((st) => (
              <label key={st.id} className={`radio-card ${p.menopauseStage === st.id ? 'on' : ''}`}>
                <input type="radio" name="meno" checked={p.menopauseStage === st.id} onChange={() => set({ menopauseStage: st.id })} />
                <strong>{st.label}</strong>
                <small>{st.detail}</small>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {p.conditions.includes('depression') && (
        <label className="toggle">
          <input type="checkbox" checked={p.maoi} onChange={(e) => set({ maoi: e.target.checked })} />
          <span>
            <strong>I take an MAOI antidepressant</strong>
            <small>
              Phenelzine, tranylcypromine, isocarboxazid, or the selegiline patch at higher doses. Removes tyramine-rich foods (aged cheese, kimchi, soy sauce, cured meat). <Cite ids={['gillman', 'flockhart']} />
            </small>
          </span>
        </label>
      )}

      {CONDITIONS.filter((c) => p.conditions.includes(c.id)).flatMap((c) =>
        c.avoid
          .filter((a) => a.tolerable || a.optIn)
          .map((a, i) => (
            <div key={`${c.id}-${i}`} className="field">
              <span>
                <span className="with-icon"><Icon name={c.icon} /> {c.label}</span>: {a.optIn ? 'tap the foods that trigger you' : 'tap any trigger you tolerate to allow it back'}
              </span>
              <p className="small">{a.reason.text} <Sourced evidence={a.reason.evidence} ids={a.reason.sources} /></p>
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
            </div>
          )),
      )}
    </div>
  )
}
