import { useId, useState, type ReactNode } from 'react'
import { STATE_PRICE_INDEX } from '../data/regions'
import { EQUIPMENT } from '../data/recipes'
import { ACTIVITY } from '../lib/energy'
import type { Activity, Equipment, Goal, Profile } from '../types'
import { Icon } from './Icon'
import { Cite, NumberField, type ViewProps } from './ui'

function useProfile({ state, update }: ViewProps) {
  const p = state.profile
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => update((s) => ({ ...s, profile: { ...s.profile, [k]: v } }))
  return { p, set }
}

/** A small "Why?" link that reveals the reasoning and sources behind a setting. */
export function Why({ children, label = 'Why?' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={`pf-why ${open ? 'open' : ''}`}>
      <button type="button" className="pf-why-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {label} <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} />
      </button>
      <div id={id} className="pf-why-body" hidden={!open}>{children}</div>
    </div>
  )
}

/** A checkbox row: bold label, one short hint, and an optional "Why?" kept outside the label so it never ticks the box. */
export function ToggleRow({ checked, onChange, label, hint, why }: { checked: boolean; onChange: (on: boolean) => void; label: string; hint?: ReactNode; why?: ReactNode }) {
  return (
    <div className={`pf-toggle ${checked ? 'on' : ''}`}>
      <label>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>
          <strong>{label}</strong>
          {hint && <small>{hint}</small>}
        </span>
      </label>
      {why && <Why>{why}</Why>}
    </div>
  )
}

/** Name, sex, age, weight and height. */
export function BodyBasicsFields(props: ViewProps) {
  const { p, set } = useProfile(props)
  const feet = Math.floor(p.heightIn / 12)
  const inches = Math.round(p.heightIn - feet * 12)
  return (
    <div className="form-grid">
      <label className="field span-2">
        <span>Name (optional)</span>
        <input value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="What should we call you?" />
      </label>
      <fieldset className="field span-2">
        <legend>Sex</legend>
        <div className="segmented">
          {(['male', 'female'] as const).map((s) => (
            <button key={s} type="button" className={p.sex === s ? 'on' : ''} aria-pressed={p.sex === s} onClick={() => set('sex', s)}>
              {s === 'male' ? 'Male' : 'Female'}
            </button>
          ))}
        </div>
        <small className="muted">Sets your energy and nutrient targets.</small>
      </fieldset>
      <NumberField label="Age" value={p.age} min={16} max={100} onChange={(n) => set('age', n)} suffix="yr" />
      <NumberField label="Weight" value={p.weightLb} min={70} max={600} onChange={(n) => set('weightLb', n)} suffix="lb" />
      <NumberField label="Height (ft)" value={feet} min={4} max={7} onChange={(n) => set('heightIn', n * 12 + inches)} suffix="ft" />
      <NumberField label="Height (in)" value={inches} min={0} max={11} onChange={(n) => set('heightIn', feet * 12 + n)} suffix="in" />
    </div>
  )
}

/** How active you are and what you want from the plan. */
export function ActivityGoalFields(props: ViewProps) {
  const { p, set } = useProfile(props)
  return (
    <div className="stack">
      <fieldset className="field">
        <legend>Goal</legend>
        <div className="segmented">
          {([['lose', 'Lose fat'], ['maintain', 'Maintain'], ['gain', 'Build / gain']] as [Goal, string][]).map(([g, l]) => (
            <button key={g} type="button" className={p.goal === g ? 'on' : ''} aria-pressed={p.goal === g} onClick={() => set('goal', g)}>{l}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className="field">
        <legend>How active are you?</legend>
        <div className="radio-list">
          {(Object.keys(ACTIVITY) as Activity[]).map((a) => (
            <label key={a} className={`radio-card ${p.activity === a ? 'on' : ''}`}>
              <input type="radio" name="activity" checked={p.activity === a} onChange={() => set('activity', a)} />
              <strong>{ACTIVITY[a].label}</strong>
              <small>{ACTIVITY[a].detail}</small>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

/** Body, activity and goal together, for the Profile page. */
export function BodyFields(props: ViewProps) {
  return (
    <div className="stack">
      <BodyBasicsFields {...props} />
      <ActivityGoalFields {...props} />
    </div>
  )
}

/** Wake, bed and workout times, caffeine and heat: used to time meals, water and habits. */
export function RhythmFields(props: ViewProps) {
  const { p, set } = useProfile(props)
  return (
    <div className="stack">
      <div className="form-grid">
        <label className="field">
          <span>Wake up</span>
          <input type="time" value={p.wakeTime} onChange={(e) => e.target.value && set('wakeTime', e.target.value)} />
        </label>
        <label className="field">
          <span>Bedtime</span>
          <input type="time" value={p.bedTime} onChange={(e) => e.target.value && set('bedTime', e.target.value)} />
        </label>
        <label className="field span-2">
          <span>Usual workout time (optional)</span>
          <span className="pf-time-row">
            <input type="time" value={p.workoutTime} onChange={(e) => set('workoutTime', e.target.value)} />
            {p.workoutTime && <button type="button" className="ghost small" onClick={() => set('workoutTime', '')}>Clear</button>}
          </span>
        </label>
      </div>
      <ToggleRow
        checked={p.caffeine} onChange={(v) => set('caffeine', v)}
        label="I drink coffee, tea or energy drinks"
        hint="Adds a caffeine cutoff 8 hours before bed to your schedule."
        why={<p>Based on: <Cite ids={['drake']} /></p>}
      />
      <ToggleRow
        checked={p.hotClimate} onChange={(v) => set('hotClimate', v)}
        label="Hot climate or I sweat a lot"
        hint="Raises your daily water target."
        why={<p>Based on: <Cite ids={['nasem_water', 'acsm_fluid']} /></p>}
      />
    </div>
  )
}

/** Where you shop, what you spend, and how long you want to cook. */
export function BudgetFields(props: ViewProps) {
  const { p, set } = useProfile(props)
  return (
    <div className="form-grid pf-align-end">
      <NumberField label="Weekly grocery budget" value={p.weeklyBudget} min={20} max={1000} step={5} onChange={(n) => set('weeklyBudget', n)} suffix="$" />
      <NumberField label="Max hands-on time per meal" value={p.maxMealMin} min={2} max={90} step={1} onChange={(n) => set('maxMealMin', n)} suffix="min" />
      <label className="field">
        <span>State (for prices)</span>
        <select value={p.state} onChange={(e) => set('state', e.target.value)}>
          <option value="">US average</option>
          {Object.entries(STATE_PRICE_INDEX).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, { name, index }]) => (
            <option key={code} value={code}>{name} ({index >= 1 ? '+' : ''}{Math.round((index - 1) * 100)}%)</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>ZIP (optional)</span>
        <input value={p.zip} inputMode="numeric" maxLength={5} onChange={(e) => set('zip', e.target.value.replace(/\D/g, ''))} placeholder="e.g. 98101" />
      </label>
      <NumberField label="Snacks per day" value={p.snacksPerDay} min={0} max={4} onChange={(n) => set('snacksPerDay', Math.round(n))} />
    </div>
  )
}

/** Daily rhythm plus budget and time, for the Profile page. */
export function LifestyleFields(props: ViewProps) {
  return (
    <div className="stack">
      <h3 className="pf-sub">Your day</h3>
      <RhythmFields {...props} />
      <h3 className="pf-sub">Shopping & cooking</h3>
      <BudgetFields {...props} />
    </div>
  )
}

export function EquipmentFields({ state, update }: ViewProps) {
  const toggle = (e: Equipment) =>
    update((s) => ({ ...s, equipment: s.equipment.includes(e) ? s.equipment.filter((x) => x !== e) : [...s.equipment, e] }))
  return (
    <div className="check-grid">
      {EQUIPMENT.map((e) => (
        <label key={e.id} className={`check-card ${state.equipment.includes(e.id) ? 'on' : ''}`}>
          <input type="checkbox" checked={state.equipment.includes(e.id)} onChange={() => toggle(e.id)} />
          <span>{e.label}</span>
        </label>
      ))}
    </div>
  )
}
