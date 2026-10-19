import type { SourceId } from '../data/sources'
import type { MedFlags, Profile } from '../types'
import { ToggleRow } from './ProfileFields'
import { Cite, type ViewProps } from './ui'

const MEDS: { key: keyof MedFlags; label: string; short: string; detail: string; sources?: SourceId[] }[] = [
  { key: 'bloodThinner', label: 'Blood thinner', short: 'Blood thinner', detail: 'Warfarin, apixaban, rivaroxaban, clopidogrel and similar' },
  { key: 'ssri', label: 'SSRI / SNRI or other serotonergic drug', short: 'SSRI / SNRI', detail: 'Sertraline, fluoxetine, venlafaxine, trazodone, triptans and similar' },
  {
    key: 'thyroid', label: 'Levothyroxine or other thyroid hormone', short: 'Thyroid hormone',
    detail: 'Puts your dose on waking with breakfast 30–60 minutes later, keeps coffee back, and warns about iron and calcium supplements taken too close to it.',
    sources: ['niddk_hashimoto', 'jonklaas', 'benvenga'],
  },
  { key: 'diabetesMeds', label: 'Insulin or a sulfonylurea', short: 'Insulin / sulfonylurea', detail: 'Glipizide, glyburide, glimepiride: medicines that can cause lows' },
  { key: 'bpMeds', label: 'ACE inhibitor, ARB or potassium-sparing diuretic', short: 'Blood pressure medicine', detail: 'Lisinopril, losartan, spironolactone and similar' },
  { key: 'grapefruitMeds', label: 'A medicine with a grapefruit warning', short: 'Grapefruit warning', detail: 'Some statins (simvastatin, atorvastatin), nifedipine, buspirone, transplant drugs. Check your label.' },
  { key: 'pregnant', label: 'Pregnant or breastfeeding', short: 'Pregnant or breastfeeding', detail: 'Lowers the caffeine limit to 200 mg; many supplements haven’t been shown safe in pregnancy' },
]

/** Medications and pregnancy: screen supplements, peptides and foods, and time meals around doses. */
export function MedFields({ state, update }: ViewProps) {
  const p = state.profile
  const setMed = (k: keyof MedFlags, v: boolean) => update((s) => ({ ...s, profile: { ...s.profile, meds: { ...s.profile.meds, [k]: v } } }))
  const set = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const row = (m: (typeof MEDS)[number]) => (
    <ToggleRow
      key={m.key} checked={p.meds[m.key]} onChange={(v) => setMed(m.key, v)} label={m.label} hint={m.detail}
      why={m.sources && <p>Based on: <Cite ids={m.sources} /></p>}
    />
  )
  return (
    <div className="stack">
      <div className="pf-list">
        {MEDS.filter((m) => m.key !== 'pregnant').map(row)}
        <ToggleRow checked={p.maoi} onChange={(v) => set({ maoi: v })} label="MAOI" hint="Phenelzine, tranylcypromine, isocarboxazid, selegiline" />
        <ToggleRow
          checked={p.stimulantMeds} onChange={(v) => set({ stimulantMeds: v })} label="Stimulant medication" hint="Amphetamine or methylphenidate"
          why={<p>Stimulants commonly reduce appetite, so calories shift to breakfast (before the dose) and evening, and lunch gets smaller and easier. <Cite ids={['cortese']} convention="The exact calorie split is this app’s choice." /></p>}
        />
      </div>
      <h3 className="pf-sub">Pregnancy</h3>
      <div className="pf-list">{MEDS.filter((m) => m.key === 'pregnant').map(row)}</div>
    </div>
  )
}

/** One-line summary of ticked medications, for the Profile list. */
export function MedSummary({ p }: { p: Profile }) {
  const on = [...MEDS.filter((m) => p.meds[m.key]).map((m) => m.short), ...(p.maoi ? ['MAOI'] : []), ...(p.stimulantMeds ? ['Stimulant'] : [])]
  return <>{on.length ? on.join(', ') : 'None'}</>
}
