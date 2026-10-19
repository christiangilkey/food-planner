import { useMemo, useState } from 'react'
import type { Tab } from '../App'
import { RECIPE_BY_ID } from '../data/recipes'
import { planViolations } from '../lib/conditions'
import { computeTargets } from '../lib/energy'
import { hasLooksGoal, puffiness } from '../lib/looks'
import { setEntry, type Pos } from '../lib/plan-utils'
import { dayEntries, dayTotals } from '../lib/planner'
import { daySchedule, formatTime, mealTimes, type ItemKind } from '../lib/schedule'
import { glasses, waterPlan } from '../lib/water'
import type { PlanEntry } from '../types'
import { Icon, type IconName } from './Icon'
import { MealCard, MealSheet } from './MealCard'
import { SLOT_LABEL } from '../lib/meals'
import { HungryPanel, LowEnergyPanel } from './QuickHelp'
import { RecipeLink } from './RecipeViewer'
import { Cite, Sheet, type ViewProps } from './ui'

const KIND_ICON: Record<ItemKind, IconName> = { meal: 'meal', water: 'water', habit: 'sparkles', meds: 'pill', workout: 'dumbbell' }

interface Slot { pos: Pos; label: string; at: number; entry: PlanEntry | null }

/** Today: what to eat next, the rest of the day, water, and quick help. */
export function TodayView({ state, update, goTo }: ViewProps & { goTo: (t: Tab, section?: string) => void }) {
  // The time when the screen opened: picks today's day and the next meal.
  const [opened] = useState(() => new Date())
  const day = (opened.getDay() + 6) % 7
  const d = state.plan[day]
  const [open, setOpen] = useState<Pos | null>(null)
  const [help, setHelp] = useState<'hungry' | 'energy' | 'water' | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const targets = computeTargets(state.profile)
  const totals = dayTotals(d)
  const water = waterPlan(state.profile, d)
  const times = mealTimes(state.profile, d.snacks.length)
  const violations = useMemo(() => planViolations(state.profile, state.plan), [state.profile, state.plan])
  const hasPlan = state.plan.some((x) => dayEntries(x).length > 0)
  const change = (pos: Pos, entry: PlanEntry | null) => update((s) => ({ ...s, plan: setEntry(s.plan, pos, entry) }))

  const slots: Slot[] = [
    ...(['breakfast', 'lunch', 'dinner'] as const).map((slot): Slot => ({ pos: { day, slot }, label: SLOT_LABEL[slot], at: times[slot], entry: d[slot] })),
    ...d.snacks.map((entry, i): Slot => ({ pos: { day, slot: 'snack', snack: i }, label: d.snacks.length > 1 ? `Snack ${i + 1}` : 'Snack', at: times.snacks[i] ?? times.lunch, entry })),
  ].sort((a, b) => a.at - b.at)
  const now = opened.getHours() * 60 + opened.getMinutes()
  // The meal you're about to have, or are in the middle of (up to 45 minutes after its time).
  const nextIdx = slots.findIndex((s) => s.at >= now - 45)
  const next = nextIdx >= 0 ? slots[nextIdx] : null
  const rest = slots.filter((s) => s !== next)
  const date = opened.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  if (!hasPlan) {
    return (
      <div className="stack">
        <section className="card hero empty-state">
          <h1>Today</h1>
          <p className="muted">{date}</p>
          <p>No meals planned yet. Make a week of meals that fit your body, health and budget.</p>
          <button className="primary" onClick={() => goTo('week')}>Plan my week</button>
        </section>
      </div>
    )
  }

  const puff = hasLooksGoal(state.profile) && totals.kcal > 0 ? puffiness(totals, state.profile) : null

  return (
    <div className="stack">
      <section className="card hero today-hero">
        <p className="eyebrow">{date}</p>
        <h1>Today</h1>
        <p className="muted">{Math.round(totals.kcal)} of {targets.kcal} kcal · {Math.round(totals.protein)} of {targets.protein} g protein</p>
        <button className="water-row" onClick={() => setHelp('water')}>
          <span className="water-drop"><Icon name="droplet" size={22} /></span>
          <span><strong>Drink {(water.drinkMl / 1000).toFixed(1)} L</strong> <span className="muted small">about {glasses(water.drinkMl)} glasses</span></span>
          <span className="muted"><Icon name="chevronRight" /></span>
        </button>
        {puff && <p className={`small ${puff.tone === 'warn' ? 'warn-text' : 'good-text'}`}>{puff.text}</p>}
      </section>

      {violations.length > 0 && (
        <button className="card banner link-card" onClick={() => goTo('week')}>
          <strong>This week doesn’t fit your health settings</strong>
          <span className="small">Open Food to make a new one ›</span>
        </button>
      )}

      {next ? (
        <>
          <h2 className="section-title">Next up · {formatTime(next.at)}</h2>
          <MealCard label={next.label} entry={next.entry} state={state} onOpen={() => setOpen(next.pos)} showTip />
        </>
      ) : (
        <p className="muted">That’s everything for today.</p>
      )}

      <div className="quick-actions">
        <button className="secondary with-icon" onClick={() => setHelp('hungry')}><Icon name="meal" size={18} /> Hungry now?</button>
        <button className="secondary with-icon" onClick={() => setHelp('energy')}><Icon name="batteryLow" size={18} /> Low energy?</button>
      </div>

      {rest.length > 0 && <h2 className="section-title">{next ? 'Rest of today' : 'Today’s meals'}</h2>}
      {rest.map((s) => (
        <MealCard key={`${s.pos.slot}-${s.pos.snack ?? 0}`} label={`${s.label} · ${formatTime(s.at)}`} entry={s.entry} state={state} onOpen={() => setOpen(s.pos)} />
      ))}

      <section className="card">
        <button className="disclosure row-between full" onClick={() => setShowSchedule(!showSchedule)} aria-expanded={showSchedule}>
          <span><strong>Full day schedule</strong> <span className="muted small">water, light, walks, medication</span></span>
          <span className="muted"><Icon name={showSchedule ? 'chevronDown' : 'chevronRight'} /></span>
        </button>
        {showSchedule && <Schedule state={state} day={day} />}
      </section>

      {open && <MealSheet pos={open} state={state} onChange={(e) => change(open, e)} onClose={() => setOpen(null)} />}
      {help === 'hungry' && <Sheet title="Hungry right now?" onClose={() => setHelp(null)}><HungryPanel state={state} /></Sheet>}
      {help === 'energy' && <Sheet title="Low on energy?" onClose={() => setHelp(null)}><LowEnergyPanel state={state} /></Sheet>}
      {help === 'water' && (
        <Sheet title="Your water today" onClose={() => setHelp(null)}>
          <p className="big-number">{(water.drinkMl / 1000).toFixed(1)} L to drink</p>
          <p className="muted">Food gives about {(water.fromFoodMl / 1000).toFixed(1)} L more, for about {(water.totalMl / 1000).toFixed(1)} L in all.</p>
          <ul className="explain">{water.explain.map((l) => <li key={l.text}>{l.text} <Cite ids={l.sources} convention={l.convention} /></li>)}</ul>
          <p className="note">Losing about 2% of body weight in water measurably dulls attention and thinking. <Cite ids={['wittbrodt', 'adan']} /> The full day schedule spreads the glasses out.</p>
        </Sheet>
      )}
    </div>
  )
}

function Schedule({ state, day }: { state: ViewProps['state']; day: number }) {
  const d = state.plan[day]
  const items = daySchedule(state.profile, d, waterPlan(state.profile, d))
  return (
    <ol className="timeline">
      {items.map((item, i) => {
        const entry = item.slot === 'snack' ? d.snacks[item.snackIndex ?? 0] : item.slot ? d[item.slot] : null
        const r = entry ? RECIPE_BY_ID[entry.recipe] : undefined
        return (
          <li key={i} className={`kind-${item.kind}`}>
            <span className="t-time">{formatTime(item.at)}</span>
            <span className="t-icon"><Icon name={KIND_ICON[item.kind]} size={16} /></span>
            <span className="t-body">
              <strong>{item.label}</strong>
              {r && entry && <span> · <RecipeLink id={r.id} portion={entry.portion} /></span>}
              {item.detail && !r && <span className="muted small t-detail">{item.detail} {item.sources && <Cite ids={item.sources} />}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
