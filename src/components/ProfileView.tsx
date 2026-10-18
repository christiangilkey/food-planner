import { useRef, useState } from 'react'
import { FOODS } from '../data/foods'
import { computeTargets } from '../lib/energy'
import { defaultState, exportState, importState } from '../lib/store'
import { ConditionFields } from './ConditionFields'
import { DietFields } from './DietFields'
import { OnyxFields } from './ExportSheet'
import type { ExportTarget } from '../types'
import { InstallCard } from './InstallApp'
import { DisclaimerText } from './Disclaimer'
import { MedFields } from './MedFields'
import { BodyFields, LifestyleFields } from './ProfileFields'
import { Cite, type ViewProps } from './ui'

export function ProfileView(props: ViewProps) {
  const { state, update } = props
  const t = computeTargets(state.profile)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  const toggleExcluded = (id: string) =>
    update((s) => {
      const ex = s.profile.excluded
      return { ...s, profile: { ...s.profile, excluded: ex.includes(id) ? ex.filter((x) => x !== id) : [...ex, id] } }
    })

  const download = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `food-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const restore = async (file: File | undefined) => {
    if (!file) return
    try {
      const next = importState(await file.text())
      update(() => next)
      setMsg('Backup restored.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not read that file.')
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h1>Your targets</h1>
        <div className="target-grid">
          <div><span className="big-number">{t.kcal}</span><small>kcal / day</small></div>
          <div><span className="big-number">{t.protein}</span><small>g protein</small></div>
          <div><span className="big-number">{t.carbs}</span><small>g carbs</small></div>
          <div><span className="big-number">{t.fat}</span><small>g fat</small></div>
        </div>
        <ul className="explain">
          {t.explain.map((line) => <li key={line.text}>{line.text} <Cite ids={line.sources} convention={line.convention} /></li>)}
          <li>BMI {t.bmi}. BMI is a rough screening measure; it doesn’t distinguish muscle from fat. <Cite ids={['jensen']} /></li>
        </ul>
        <p className="muted small">Changes apply to your next "New week". Swap individual meals to refresh portions right away.</p>
      </section>

      <section className="card">
        <h2>Body</h2>
        <BodyFields {...props} />
      </section>

      <section className="card">
        <h2>Health conditions</h2>
        <ConditionFields {...props} />
        <p className="muted small">After changing conditions, make a new week on the Plan tab.</p>
      </section>

      <section className="card">
        <h2>Diet</h2>
        <DietFields {...props} />
        <p className="muted small">After changing your diet, make a new week on the Plan tab.</p>
      </section>

      <section className="card">
        <h2>Medications & pregnancy</h2>
        <p className="muted small">Used only to screen supplements, peptides and foods for interactions. Stored on this device only.</p>
        <MedFields {...props} />
      </section>

      <section className="card">
        <h2>Lifestyle</h2>
        <LifestyleFields {...props} />
      </section>

      <section className="card">
        <h2>Foods you won't eat</h2>
        <p className="muted small">Allergies, dislikes, or anything off-limits. Meals that contain these are never suggested.</p>
        <div className="check-grid compact">
          {[...FOODS].sort((a, b) => a.name.localeCompare(b.name)).map((f) => (
            <label key={f.id} className={`check-card ${state.profile.excluded.includes(f.id) ? 'on bad' : ''}`}>
              <input type="checkbox" checked={state.profile.excluded.includes(f.id)} onChange={() => toggleExcluded(f.id)} />
              <span>{f.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Exports</h2>
        <p className="muted small">Where the export buttons on the Plan and Sleep tabs send your meals, groceries, prep day and sleep schedule.</p>
        <div className="radio-list">
          {([['google', 'Google Tasks', 'Task lists in your Google account. Needs a one-time Google Cloud client ID.'], ['onyx', 'Onyx Calendar', 'Time blocks and tasks on your Onyx calendar, sent to the Onyx app on your computer.']] as [ExportTarget, string, string][]).map(([id, label, detail]) => (
            <label key={id} className={`radio-card ${state.exportTarget === id ? 'on' : ''}`}>
              <input type="radio" name="export-target" checked={state.exportTarget === id} onChange={() => update((s) => ({ ...s, exportTarget: id }))} />
              <strong>{label}</strong>
              <small>{detail}</small>
            </label>
          ))}
        </div>
        {state.exportTarget === 'onyx' && <OnyxFields {...props} />}
      </section>

      <InstallCard />

      <section className="card">
        <h2>About this app</h2>
        <DisclaimerText />
      </section>

      <section className="card">
        <h2>Your data</h2>
        <p className="muted small">Everything is stored only on this device. Make a backup to move it to another phone or browser.</p>
        <div className="add-row">
          <button className="secondary" onClick={download}>Download backup</button>
          <button className="secondary" onClick={() => fileRef.current?.click()}>Restore backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => restore(e.target.files?.[0])} />
          <button
            className="ghost danger"
            onClick={() => {
              if (confirm('Erase your profile, pantry, prices and plan on this device?')) update(() => defaultState())
            }}
          >
            Start over
          </button>
        </div>
        {msg && <p className="small" role="status">{msg}</p>}
      </section>
    </div>
  )
}
