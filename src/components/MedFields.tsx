import type { SourceId } from '../data/sources'
import type { MedFlags, Profile } from '../types'
import { Cite, type ViewProps } from './ui'

const MEDS: { key: keyof MedFlags; label: string; detail: string; sources?: SourceId[] }[] = [
  { key: 'bloodThinner', label: 'Blood thinner', detail: 'Warfarin, apixaban, rivaroxaban, clopidogrel and similar' },
  { key: 'ssri', label: 'SSRI / SNRI or other serotonergic drug', detail: 'Sertraline, fluoxetine, venlafaxine, trazodone, triptans and similar' },
  {
    key: 'thyroid', label: 'Levothyroxine or other thyroid hormone',
    detail: 'Puts your dose on waking with breakfast 30–60 minutes later, keeps coffee back, and warns about iron and calcium supplements taken too close to it.',
    sources: ['niddk_hashimoto', 'jonklaas', 'benvenga'],
  },
  { key: 'diabetesMeds', label: 'Insulin or a sulfonylurea', detail: 'Glipizide, glyburide, glimepiride: medicines that can cause lows' },
  { key: 'bpMeds', label: 'ACE inhibitor, ARB or potassium-sparing diuretic', detail: 'Lisinopril, losartan, spironolactone and similar' },
  { key: 'grapefruitMeds', label: 'A medicine with a grapefruit warning', detail: 'Some statins (simvastatin, atorvastatin), nifedipine, buspirone, transplant drugs. Check your label.' },
  { key: 'pregnant', label: 'Pregnant or breastfeeding', detail: 'Lowers the caffeine limit to 200 mg; many supplements haven’t been shown safe in pregnancy' },
]

/** Medications and pregnancy: screen supplements, peptides and foods, and time meals around doses. */
export function MedFields({ state, update }: ViewProps) {
  const p = state.profile
  const setMed = (k: keyof MedFlags, v: boolean) => update((s) => ({ ...s, profile: { ...s.profile, meds: { ...s.profile.meds, [k]: v } } }))
  const set = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  return (
    <div className="check-grid wide">
      {MEDS.map((m) => (
        <label key={m.key} className={`check-card ${p.meds[m.key] ? 'on' : ''}`}>
          <input type="checkbox" checked={p.meds[m.key]} onChange={(e) => setMed(m.key, e.target.checked)} />
          <span><strong>{m.label}</strong><small className="muted"> {m.detail}{m.sources && <> <Cite ids={m.sources} /></>}</small></span>
        </label>
      ))}
      <label className={`check-card ${p.maoi ? 'on' : ''}`}>
        <input type="checkbox" checked={p.maoi} onChange={(e) => set({ maoi: e.target.checked })} />
        <span><strong>MAOI</strong><small className="muted"> Phenelzine, tranylcypromine, isocarboxazid, selegiline</small></span>
      </label>
      <label className={`check-card ${p.stimulantMeds ? 'on' : ''}`}>
        <input type="checkbox" checked={p.stimulantMeds} onChange={(e) => set({ stimulantMeds: e.target.checked })} />
        <span><strong>Stimulant medication</strong><small className="muted"> Amphetamine or methylphenidate</small></span>
      </label>
    </div>
  )
}
