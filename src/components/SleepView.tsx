import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { exportLabel } from '../lib/onyx'
import { formatTime, mealTimes, parseTime } from '../lib/schedule'
import { analyzeSleep, formatHours, nightMinutes, scheduleAdvice, sleepImpacts, windDown, type ImpactArea, type SleepAnalysis, type SleepImpact } from '../lib/sleep'
import type { Profile, SleepEntry } from '../types'
import { SleepExportSheet } from './ExportSheet'
import { Icon, type IconName } from './Icon'
import { Why } from './TrainView'
import { Sheet, type ViewProps } from './ui'

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const AREA_TITLE: Record<ImpactArea, string> = {
  body: 'Your body', brain: 'Your brain', food: 'Your eating and your goal', looks: 'How you look', condition: 'With your conditions', habit: 'What helps',
}
const AREA_ORDER: ImpactArea[] = ['food', 'looks', 'brain', 'body', 'condition', 'habit']
const TONE_RANK = { bad: 0, warn: 1, good: 2 } as const

/** The headline: one plain sentence about the last week. */
function verdict(a: SleepAnalysis): { title: string; text: string; tone: 'good' | 'warn' } {
  const target = a.target.min / 60
  const hours = (a.avgMin / 60).toFixed(1)
  if (a.avgMin < a.target.min - 30) return { title: `${hours} hours a night`, text: `Short of the ${target} hours you need. That adds up to ${formatHours(a.debtMin)} this week.`, tone: 'warn' }
  if (a.avgMin < a.target.min) return { title: `${hours} hours a night`, text: `Just under your ${target} hours.`, tone: 'warn' }
  if (a.avgMin > a.target.max) return { title: `${hours} hours a night`, text: 'More than recommended. Fine when catching up or unwell.', tone: 'warn' }
  if (a.irregular) return { title: `${hours} hours a night`, text: 'Enough sleep, but at changing times.', tone: 'warn' }
  return { title: `${hours} hours a night`, text: 'Enough sleep, at steady times.', tone: 'good' }
}

const STEP_ICON = (label: string): IconName =>
  label.startsWith('Wake') ? 'sunrise' : label.startsWith('Lights') ? 'bed' : label.startsWith('Caffeine') ? 'coffee' : label.startsWith('Last food') ? 'meal' : 'moon'

export function SleepView({ state, update, goTo }: ViewProps & { goTo: (t: Tab, section?: string) => void }) {
  const p = state.profile
  const a = useMemo(() => analyzeSleep(state.sleepLog, p), [state.sleepLog, p])
  const impacts = useMemo(() => sleepImpacts(a, p), [a, p])
  const [sheet, setSheet] = useState<'impacts' | 'history' | 'export' | null>(null)
  const has = a.nights.length > 0
  const v = has ? verdict(a) : null
  // The few that matter most for this person: problems first, then the rest.
  const top = [...impacts].filter((x) => x.area !== 'habit').sort((x, y) => TONE_RANK[x.tone] - TONE_RANK[y.tone]).slice(0, 3)

  return (
    <div className="stack">
      <section className="card hero">
        <p className="eyebrow">Sleep · last 7 days</p>
        {v ? (
          <>
            <h1>{v.title}</h1>
            <p className={v.tone === 'good' ? 'good-text' : 'warn-text'}>{v.text}</p>
            <SleepChart log={state.sleepLog} targetMin={a.target.min} />
          </>
        ) : (
          <>
            <h1>How are you sleeping?</h1>
            <p className="muted">Log a few nights to see what your sleep does to your hunger, focus and goal.</p>
          </>
        )}
        <p className="muted small">{a.target.text} <Why sources={a.target.sources} label="Source" /></p>
      </section>

      <LogNight state={state} update={update} onHistory={() => setSheet('history')} />

      {top.length > 0 && (
        <>
          <h2 className="section-title">What it means for you</h2>
          <section className="card">
            {top.map((x) => <ImpactRow key={x.id} x={x} />)}
            {impacts.length > top.length && (
              <button className="link small" onClick={() => setSheet('impacts')}>See all {impacts.length}, and what helps ›</button>
            )}
          </section>
        </>
      )}

      <h2 className="section-title">Your schedule</h2>
      <Schedule state={state} update={update} a={a} onExport={() => setSheet('export')} goTo={goTo} />

      {sheet === 'impacts' && (
        <Sheet title="What your sleep is doing" onClose={() => setSheet(null)}>
          {AREA_ORDER.map((area) => {
            const list = impacts.filter((x) => x.area === area)
            if (!list.length) return null
            return (
              <div key={area} className="sheet-section">
                <h3>{AREA_TITLE[area]}</h3>
                {list.map((x) => <ImpactRow key={x.id} x={x} />)}
              </div>
            )
          })}
        </Sheet>
      )}
      {sheet === 'history' && (
        <Sheet title="Past nights" onClose={() => setSheet(null)}>
          <History state={state} update={update} />
        </Sheet>
      )}
      {sheet === 'export' && <SleepExportSheet state={state} update={update} onClose={() => setSheet(null)} />}
    </div>
  )
}

/** Title, the line about you, and the evidence behind a "Why?". */
function ImpactRow({ x }: { x: SleepImpact }) {
  return (
    <div className={`sleep-impact tone-${x.tone}`}>
      <strong>{x.title}</strong>
      {x.because && <span className="small muted">{x.because}</span>}
      <span><Why claims={[{ text: x.text, evidence: x.evidence, sources: x.sources }]} convention={x.convention} /></span>
    </div>
  )
}

/** Log (or correct) one night: last night by default, at the scheduled times. */
function LogNight({ state, update, onHistory }: ViewProps & { onHistory: () => void }) {
  const [today] = useState(() => isoDate(new Date()))
  const [date, setDate] = useState(today)
  const [otherDay, setOtherDay] = useState(false)
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
    setSaved(`Saved ${formatHours(minutes)}.`)
  }

  return (
    <section className="card">
      <div className="row-between">
        <h2 className="with-icon"><Icon name="bed" /> {date === today ? 'Last night' : new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
        {state.sleepLog.length > 0 && <button className="link small" onClick={onHistory}>Past nights</button>}
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Fell asleep</span>
          <input type="time" value={bed} onChange={(e) => e.target.value && setBed(e.target.value)} />
        </label>
        <label className="field">
          <span>Woke up</span>
          <input type="time" value={wake} onChange={(e) => e.target.value && setWake(e.target.value)} />
        </label>
      </div>
      {otherDay && (
        <label className="field">
          <span>Morning of</span>
          <input type="date" value={date} max={today} onChange={(e) => e.target.value && pick(e.target.value)} />
        </label>
      )}
      <div className="add-row">
        <button className="primary" onClick={save}>{existing ? 'Update' : 'Save'} · {formatHours(minutes)}</button>
        {saved ? <span className="good-text small" role="status">{saved}</span> : !otherDay && <button className="link small" onClick={() => setOtherDay(true)}>A different night?</button>}
      </div>
    </section>
  )
}

/** Logged nights, newest first, with edit-by-picking and remove. */
function History({ state, update }: ViewProps) {
  const recent = [...state.sleepLog].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 30)
  const remove = (d: string) => update((s) => ({ ...s, sleepLog: s.sleepLog.filter((e) => e.date !== d) }))
  return (
    <ul className="pantry-list sleep-log">
      {recent.map((e) => (
        <li key={e.date}>
          <div className="pantry-name">
            <strong>{new Date(`${e.date}T12:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
            <span className="muted small">{formatTime(parseTime(e.bed, 0))} to {formatTime(parseTime(e.wake, 0))} · {formatHours(nightMinutes(e))}</span>
          </div>
          <button className="ghost small" onClick={() => remove(e.date)} aria-label={`Remove the night before ${e.date}`}>Remove</button>
        </li>
      ))}
    </ul>
  )
}

/** Bedtime and wake time (which also set meal times), the wind-down routine, and export. */
function Schedule({ state, update, a, onExport, goTo }: ViewProps & { a: SleepAnalysis; onExport: () => void; goTo: (t: Tab, section?: string) => void }) {
  const p = state.profile
  const [showRoutine, setShowRoutine] = useState(false)
  const setProfile = (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const advice = scheduleAdvice(a)
  const steps = windDown(p)
  const meals = mealTimes(p, p.snacksPerDay)
  return (
    <section className="card">
      <div className="form-grid">
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
        {advice ?? `${formatHours(a.planned.minutes)} in bed: room for ${formatHours(a.target.min)} of sleep.`}
        {advice && <> <Why sources={a.target.sources} convention="Allowing 30 extra minutes in bed for falling asleep and brief wakings is this app’s convention." /></>}
      </p>
      <p className="muted small">
        Meals follow these times: breakfast {formatTime(meals.breakfast)}, dinner {formatTime(meals.dinner)}, last food by {formatTime(meals.lastFood)}.{' '}
        <button className="link small" onClick={() => goTo('week')}>See the week</button>
      </p>

      <button className="disclosure row-between full routine-toggle" onClick={() => setShowRoutine(!showRoutine)} aria-expanded={showRoutine}>
        <span><strong>Wind-down routine</strong> <span className="muted small">{steps.length} steps</span></span>
        <span className="muted"><Icon name={showRoutine ? 'chevronDown' : 'chevronRight'} /></span>
      </button>
      {showRoutine && (
        <ol className="timeline">
          {steps.map((s) => (
            <li key={s.label} className="kind-habit">
              <span className="t-time">{formatTime(s.at)}</span>
              <span className="t-icon"><Icon name={STEP_ICON(s.label)} size={16} /></span>
              <span className="t-body">
                <strong>{s.label}</strong>
                <span className="muted small t-detail">{s.detail} <Why sources={s.sources} label="Source" /></span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <button className="secondary with-icon schedule-export" onClick={onExport}><Icon name="calendar" size={16} /> {exportLabel(state)}</button>
    </section>
  )
}

/** Bars for the last 14 mornings, with the minimum target as a line. */
function SleepChart({ log, targetMin }: { log: SleepEntry[]; targetMin: number }) {
  const [days] = useState(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return isoDate(d)
  }))
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
