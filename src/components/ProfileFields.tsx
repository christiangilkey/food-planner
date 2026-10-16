import { STATE_PRICE_INDEX } from '../data/regions'
import { EQUIPMENT } from '../data/recipes'
import { ACTIVITY } from '../lib/energy'
import type { Activity, Equipment, Goal, Profile } from '../types'
import { Cite, NumberField, type ViewProps } from './ui'

function useProfile({ state, update }: ViewProps) {
  const p = state.profile
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => update((s) => ({ ...s, profile: { ...s.profile, [k]: v } }))
  return { p, set }
}

export function BodyFields(props: ViewProps) {
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
        <legend>Sex (for energy and nutrient targets)</legend>
        <div className="segmented">
          {(['male', 'female'] as const).map((s) => (
            <button key={s} type="button" className={p.sex === s ? 'on' : ''} onClick={() => set('sex', s)}>
              {s === 'male' ? 'Male' : 'Female'}
            </button>
          ))}
        </div>
      </fieldset>
      <NumberField label="Age" value={p.age} min={16} max={100} onChange={(n) => set('age', n)} suffix="yr" />
      <NumberField label="Weight" value={p.weightLb} min={70} max={600} onChange={(n) => set('weightLb', n)} suffix="lb" />
      <NumberField label="Height (ft)" value={feet} min={4} max={7} onChange={(n) => set('heightIn', n * 12 + inches)} suffix="ft" />
      <NumberField label="Height (in)" value={inches} min={0} max={11} onChange={(n) => set('heightIn', feet * 12 + n)} suffix="in" />
      <fieldset className="field span-2">
        <legend>Activity level</legend>
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
      <fieldset className="field span-2">
        <legend>Goal</legend>
        <div className="segmented">
          {([['lose', 'Lose fat'], ['maintain', 'Maintain'], ['gain', 'Build / gain']] as [Goal, string][]).map(([g, l]) => (
            <button key={g} type="button" className={p.goal === g ? 'on' : ''} onClick={() => set('goal', g)}>{l}</button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export function LifestyleFields(props: ViewProps) {
  const { p, set } = useProfile(props)
  return (
    <div className="form-grid">
      <label className="toggle span-2">
        <input type="checkbox" checked={p.stimulantMeds} onChange={(e) => set('stimulantMeds', e.target.checked)} />
        <span>
          <strong>I take stimulant medication</strong>
          <small>Stimulants commonly reduce appetite, so calories shift to breakfast (before the dose) and evening, and lunch gets smaller and easier. <Cite ids={['cortese']} convention="The exact calorie split is this app’s choice." /></small>
        </span>
      </label>
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
      <NumberField label="Weekly grocery budget" value={p.weeklyBudget} min={20} max={1000} step={5} onChange={(n) => set('weeklyBudget', n)} suffix="$" />
      <NumberField label="Max hands-on time per meal" value={p.maxMealMin} min={2} max={90} step={1} onChange={(n) => set('maxMealMin', n)} suffix="min" />
      <NumberField label="Snacks per day" value={p.snacksPerDay} min={0} max={4} onChange={(n) => set('snacksPerDay', Math.round(n))} />
      <h3 className="span-2 form-section">Daily rhythm</h3>
      <p className="span-2 muted small form-hint">Used to time your meals, water, caffeine cutoff and habits.</p>
      <label className="field">
        <span>Wake up</span>
        <input type="time" value={p.wakeTime} onChange={(e) => e.target.value && set('wakeTime', e.target.value)} />
      </label>
      <label className="field">
        <span>Bedtime</span>
        <input type="time" value={p.bedTime} onChange={(e) => e.target.value && set('bedTime', e.target.value)} />
      </label>
      <label className="field">
        <span>Usual workout time (optional)</span>
        <span className="input-wrap">
          <input type="time" value={p.workoutTime} onChange={(e) => set('workoutTime', e.target.value)} />
        </span>
      </label>
      <div className="field">
        <span>&nbsp;</span>
        {p.workoutTime && <button type="button" className="ghost small" onClick={() => set('workoutTime', '')}>No set workout time</button>}
      </div>
      <label className="toggle span-2">
        <input type="checkbox" checked={p.caffeine} onChange={(e) => set('caffeine', e.target.checked)} />
        <span>
          <strong>I drink coffee, tea or energy drinks</strong>
          <small>Adds a caffeine cutoff 8 hours before bed to your schedule. <Cite ids={['drake']} /></small>
        </span>
      </label>
      <label className="toggle span-2">
        <input type="checkbox" checked={p.hotClimate} onChange={(e) => set('hotClimate', e.target.checked)} />
        <span>
          <strong>Hot climate or I sweat a lot</strong>
          <small>Raises your daily water target. <Cite ids={['nasem_water', 'acsm_fluid']} /></small>
        </span>
      </label>
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
