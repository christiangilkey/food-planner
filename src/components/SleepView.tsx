import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { analyzeSleep, formatHours, nightMinutes, scheduleAdvice, sleepImpacts, windDown, type ImpactArea, type SleepImpact } from '../lib/sleep'
import { formatTime, mealTimes, parseTime } from '../lib/schedule'
import type { Profile, SleepEntry } from '../types'
import { exportLabel, SleepExportSheet } from './ExportSheet'
import { Icon } from './Icon'
import { Cite, EvidenceChip, type ViewProps } from './ui'

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const AREA_TITLE: Record<ImpactArea, string> = {
  body: 'Your body', brain: 'Your brain', food: 'Your eating and your goal', looks: 'How you look', condition: 'With your conditions', habit: 'What helps',
}
const AREA_ORDER: ImpactArea[] = ['food', 'looks', 'brain', 'body', 'condition', 'habit']

export function SleepView({ state, update, goTo }: ViewProps & { goTo: (t: Tab) => void }) {
  const p = state.profile
  const a = useMemo(() => analyzeSleep(state.sleepLog, p), [state.sleepLog, p])
  const impacts = useMemo(() => sleepImpacts(a, p), [a, p])
  const [showExport, setShowExport] = useState(false)
  const setProfile = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const advice = scheduleAdvice(a)
  const steps = windDown(p)
  const meals = mealTimes(p, p.snacksPerDay)

  return (
    <div className="stack">
      <section className="card hero">
        <h1>Sleep</h1>
        {a.nights.length === 0 ? (
          <p className="muted">Log last night below to see what your sleep is doing to your health, your hunger and your goal.</p>
        ) : (
          <>
            <div className="target-grid">
              <div><span className="big-number">{(a.avgMin / 60).toFixed(1)}</span><small>h a night, last 7 days</small></div>
              <div><span className="big-number">{a.short}</span><small>night{a.short === 1 ? '' : 's'} under {a.target.min / 60} h</small></div>
              <div><span className="big-number">{a.debtMin ? formatHours(a.debtMin) : '0'}</span><small>short of {a.target.min / 60} h this week</small></div>
            </div>
            <SleepChart log={state.sleepLog} targetMin={a.target.min} />
          </>
        )}
        <p className="muted small">{a.target.text} <Cite ids={a.target.sources} /></p>
      </section>

      <LogNight state={state} update={update} />

      {impacts.length > 0 && AREA_ORDER.map((area) => {
        const list = impacts.filter((x) => x.area === area)
        if (!list.length) return null
        return (
          <section key={area} className="card">
            <h2>{AREA_TITLE[area]}</h2>
            {list.map((x) => <ImpactRow key={x.id} x={x} />)}
          </section>
        )
      })}

      <section className="card">
        <h2 className="with-icon"><Icon name="moon" /> Your sleep schedule</h2>
        <p className="muted small">Your meals, caffeine cutoff and medication times are planned around these, so changing them updates the Plan tab too.</p>
        <div className="add-row">
          <label className="field">
            <span>Lights out</span>
            <input type="time" value={p.bedTime} onChange={(e) => e.target.value && setProfile({ bedTime: e.target.value })} />
          </label>
          <label className="field">
            <span>Wake up</span>
            <input type="time" value={p.wakeTime} onChange={(e) => e.target.value && setProfile({ wakeTime: e.target.value })} />
          </label>
        </div>
        <p className={`small ${advice ? 'warn-text' : 'good-text'}`}>
          {advice ?? `${formatHours(a.planned.minutes)} in bed, enough room for ${formatHours(a.target.min)} of sleep.`}{' '}
          {advice && <Cite ids={a.target.sources} convention="Allowing 30 extra minutes in bed for falling asleep and brief wakings is this app’s convention." />}
        </p>
        <ol className="timeline">
          {steps.map((s) => (
            <li key={s.label} className="kind-habit">
              <span className="t-time">{formatTime(s.at)}</span>
              <span className="t-icon"><Icon name={s.label.startsWith('Wake') ? 'sunrise' : s.label.startsWith('Lights') ? 'bed' : s.label.startsWith('Caffeine') ? 'coffee' : s.label.startsWith('Last food') ? 'meal' : 'moon'} size={16} /></span>
              <span className="t-body">
                <strong>{s.label}</strong>
                <span className="muted small t-detail">{s.detail} <Cite ids={s.sources} /></span>
              </span>
            </li>
          ))}
        </ol>
        <div className="add-row">
          <button className="primary with-icon" onClick={() => setShowExport(true)}><Icon name="check" size={16} /> {exportLabel(state)}</button>
          <button className="secondary" onClick={() => goTo('plan')}>See meal times</button>
        </div>
        <p className="muted small">Breakfast {formatTime(meals.breakfast)}, dinner {formatTime(meals.dinner)}, last food by {formatTime(meals.lastFood)}.</p>
      </section>

      {showExport && <SleepExportSheet state={state} update={update} onClose={() => setShowExport(false)} />}
    </div>
  )
}

function ImpactRow({ x }: { x: SleepImpact }) {
  return (
    <div className={`claim sleep-impact tone-${x.tone}`}>
      <div className="row-between"><strong>{x.title}</strong><EvidenceChip level={x.evidence} /></div>
      <span className="small">{x.text} <Cite ids={x.sources} convention={x.convention} /></span>
      {x.because && <span className="why">For you: {x.because}</span>}
    </div>
  )
}

/** Log (or correct) one night. Defaults to last night at the scheduled times. */
function LogNight({ state, update }: ViewProps) {
  const today = isoDate(new Date())
  const [date, setDate] = useState(today)
  const existing = state.sleepLog.find((e) => e.date === date)
  const [bed, setBed] = useState(existing?.bed ?? state.profile.bedTime)
  const [wake, setWake] = useState(existing?.wake ?? state.profile.wakeTime)
  const [saved, setSaved] = useState('')
  const minutes = nightMinutes({ bed, wake })

  const pick = (d: string) => {
    setDate(d)
    const e = state.sleepLog.find((x) => x.date === d)
    setBed(e?.bed ?? state.profile.bedTime)
    setWake(e?.wake ?? state.profile.wakeTime)
    setSaved('')
  }
  const save = () => {
    const entry: SleepEntry = { date, bed, wake }
    update((s) => ({ ...s, sleepLog: [...s.sleepLog.filter((e) => e.date !== date), entry].sort((x, y) => x.date.localeCompare(y.date)).slice(-120) }))
    setSaved(`Saved ${formatHours(minutes)} for the night before ${new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: 'long' })}.`)
  }
  const remove = (d: string) => update((s) => ({ ...s, sleepLog: s.sleepLog.filter((e) => e.date !== d) }))
  const recent = [...state.sleepLog].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 7)

  return (
    <section className="card">
      <h2 className="with-icon"><Icon name="bed" /> How did you sleep?</h2>
      <div className="add-row">
        <label className="field">
          <span>Morning of</span>
          <input type="date" value={date} max={today} onChange={(e) => e.target.value && pick(e.target.value)} />
        </label>
        <label className="field">
          <span>Fell asleep</span>
          <input type="time" value={bed} onChange={(e) => e.target.value && setBed(e.target.value)} />
        </label>
        <label className="field">
          <span>Woke up</span>
          <input type="time" value={wake} onChange={(e) => e.target.value && setWake(e.target.value)} />
        </label>
      </div>
      <div className="add-row">
        <button className="primary" onClick={save}>{existing ? 'Update' : 'Save'} {formatHours(minutes)}</button>
        {saved && <span className="good-text small" role="status">{saved}</span>}
      </div>
      {recent.length > 0 && (
        <ul className="pantry-list sleep-log">
          {recent.map((e) => (
            <li key={e.date}>
              <div className="pantry-name">
                <strong>{new Date(`${e.date}T12:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                <span className="muted small">{formatTime(parseTime(e.bed, 0))} to {formatTime(parseTime(e.wake, 0))} · {formatHours(nightMinutes(e))}</span>
              </div>
              <div className="pantry-controls">
                <button className="ghost small" onClick={() => pick(e.date)}>Edit</button>
                <button className="ghost small" onClick={() => remove(e.date)} aria-label={`Remove ${e.date}`}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Bars for the last 14 mornings, with the minimum target as a line. */
function SleepChart({ log, targetMin }: { log: SleepEntry[]; targetMin: number }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return isoDate(d)
  })
  const max = 10 * 60
  return (
    <div className="sleep-chart" role="img" aria-label="Hours slept, last 14 nights">
      <div className="sleep-target" style={{ bottom: `${(targetMin / max) * 100}%` }}><span>{targetMin / 60} h</span></div>
      {days.map((d) => {
        const e = log.find((x) => x.date === d)
        const m = e ? nightMinutes(e) : 0
        return (
          <div key={d} className="sleep-col" title={e ? `${d}: ${formatHours(m)}` : `${d}: not logged`}>
            <div className={`sleep-bar ${!e ? 'empty' : m < targetMin ? 'short' : 'ok'}`} style={{ height: `${e ? Math.min(100, (m / max) * 100) : 4}%` }} />
            <span className="sleep-day">{new Date(`${d}T12:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
          </div>
        )
      })}
    </div>
  )
}
