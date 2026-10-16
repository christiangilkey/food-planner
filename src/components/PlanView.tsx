import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { RECIPE_BY_ID } from '../data/recipes'
import type { Tab } from '../App'
import { computeTargets } from '../lib/energy'
import { crashRisk, easeScore, rewardScore, satietyScore, servingCost, servingTotals } from '../lib/nutrition'
import { DAYS, dayEntries, dayTotals, eligibleRecipes, generatePlan, isAdhd, rankCandidates, shoppingCost, slotShares, portionFor } from '../lib/planner'
import type { MealSlot, PlanEntry } from '../types'
import { setEntry, type Pos } from '../lib/plan-utils'
import { analyzeRotation } from '../lib/rotation'
import { daySchedule, formatTime, mealTimes, type ItemKind } from '../lib/schedule'
import { mealTip } from '../lib/tips'
import { hasCondition, planViolations } from '../lib/conditions'
import { glasses, waterPlan } from '../lib/water'
import { Icon, type IconName } from './Icon'
import { ExportSheet } from './ExportSheet'
import { RecipeLink } from './RecipeViewer'
import { Bar, Chip, Cite, Score, Sheet, type ViewProps } from './ui'
import { money } from '../lib/format'

const SLOT_LABEL: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
const KIND_ICON: Record<ItemKind, IconName> = { meal: 'meal', water: 'water', habit: 'sparkles', meds: 'pill', workout: 'dumbbell' }

const todayIndex = () => (new Date().getDay() + 6) % 7

export function PlanView({ state, update, goTo }: ViewProps & { goTo: (t: Tab) => void }) {
  const [day, setDayRaw] = useState(todayIndex)
  const [dayDir, setDayDir] = useState(0)
  const setDay = (d: number) => { setDayDir(Math.sign(d - day)); setDayRaw(d) }
  const [swap, setSwap] = useState<Pos | null>(null)
  const [showWater, setShowWater] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showTimeline, setShowTimeline] = useState(true)
  const targets = computeTargets(state.profile)
  const plan = state.plan
  const d = plan[day]
  const totals = dayTotals(d)
  const bill = useMemo(() => shoppingCost(state, plan), [state, plan])
  const hasPlan = plan.some((x) => dayEntries(x).length > 0)

  const regenerate = () => update((s) => ({ ...s, plan: generatePlan(s), checked: {} }))
  const change = (pos: Pos, entry: PlanEntry | null) => update((s) => ({ ...s, plan: setEntry(s.plan, pos, entry) }))

  const water = waterPlan(state.profile, d)
  const times = mealTimes(state.profile, d.snacks.length)
  const schedule = daySchedule(state.profile, d, water)
  const rotation = useMemo(() => analyzeRotation(state), [state])
  const rulesMet = rotation.rules.filter((r) => r.status === 'met').length
  const violations = useMemo(() => planViolations(state.profile, plan), [state.profile, plan])

  const handsOn = dayEntries(d).reduce((m, { entry }) => m + (RECIPE_BY_ID[entry.recipe]?.activeMin ?? 0), 0)
  const kcalTone = totals.kcal < targets.kcal * 0.85 ? 'warn' : totals.kcal > targets.kcal * 1.15 ? 'warn' : 'good'

  return (
    <div className="stack">
      {hasPlan && violations.length > 0 && (
        <section className="card banner" role="alert">
          <h2>This week doesn’t fit your health settings</h2>
          <ul className="explain">{violations.slice(0, 5).map((v, i) => <li key={i}>{v.day !== undefined ? `${DAYS[v.day]}: ` : ''}{v.message}</li>)}</ul>
          <p className="small">Usually this means your conditions changed after the week was built. Make a new week. If it keeps happening, add equipment or allow more foods, since your current options can’t meet every limit.</p>
          <button className="primary" onClick={regenerate}>Make a new week</button>
        </section>
      )}
      <section className="card hero">
        <div className="hero-row">
          <div>
            <h1>Your week</h1>
            <p className="muted">
              {targets.kcal} kcal · {targets.protein} g protein a day · shopping ≈ <strong>{money(bill)}</strong>
              {bill > state.profile.weeklyBudget && <span className="warn-text"> (over your {money(state.profile.weeklyBudget)} budget)</span>}
            </p>
          </div>
          <div className="hero-actions">
            <button className="primary" onClick={regenerate}>{hasPlan ? 'New week' : 'Build week'}</button>
            <button className="secondary" onClick={() => goTo('shop')}>Shopping list</button>
            {hasPlan && <button className="primary with-icon" onClick={() => setShowExport(true)}><Icon name="check" size={16} /> Export to Google Tasks</button>}
          </div>
        </div>
        <p className="muted small with-icon">"New week" keeps any meal you've locked <Icon name="lock" size={14} /></p>
        {hasPlan && (
          <button className="rotation-pill" onClick={() => goTo('health')}>
            <span className="with-icon"><Icon name="refresh" size={16} /> Food rotation: <strong>{rulesMet}/{rotation.rules.length}</strong> guidelines met</span>
            <span className="with-icon"><Icon name="sprout" size={16} /> <strong>{rotation.plants.length}</strong>/30 plants</span>
            <span className="muted">Details ›</span>
          </button>
        )}
      </section>

      <div className="day-tabs" role="tablist" aria-label="Day">
        {DAYS.map((name, i) => {
          return (
            <button key={name} role="tab" aria-selected={i === day} className={i === day ? 'on' : ''} onClick={() => setDay(i)}>
              <span>{name}</span>
            </button>
          )
        })}
      </div>

      <section className="card">
        <div className="summary-grid">
          <div>
            <div className="summary-label"><span>Calories</span><span>{Math.round(totals.kcal)} / {targets.kcal}</span></div>
            <Bar value={totals.kcal} max={targets.kcal} tone={kcalTone} label="Calories" />
          </div>
          <div>
            <div className="summary-label"><span>Protein</span><span>{Math.round(totals.protein)} / {targets.protein} g</span></div>
            <Bar value={totals.protein} max={targets.protein} tone={totals.protein >= targets.protein * 0.9 ? 'good' : 'warn'} label="Protein" />
          </div>
          <div>
            <div className="summary-label"><span>Fiber</span><span>{Math.round(totals.fiber)} / {Math.round(targets.kcal * 0.014)} g</span></div>
            <Bar value={totals.fiber} max={targets.kcal * 0.014} tone={totals.fiber >= targets.kcal * 0.0126 ? 'good' : 'warn'} label="Fiber" />
          </div>
        </div>
        <button className="water-row" onClick={() => setShowWater(true)}>
          <span className="water-drop"><Icon name="droplet" size={22} /></span>
          <span>
            <strong>Drink {(water.drinkMl / 1000).toFixed(1)} L</strong> (about {glasses(water.drinkMl)} glasses)
            <span className="muted small"> · food gives about {(water.fromFoodMl / 1000).toFixed(1)} L more</span>
          </span>
          <span className="muted"><Icon name="info" /></span>
        </button>
        <p className="muted small">
          About {handsOn} min of hands-on cooking · ingredients eaten today ≈ {money(dayEntries(d).reduce((m, { entry }) => {
            const r = RECIPE_BY_ID[entry.recipe]
            return m + (r ? servingCost(r, state, entry.portion) : 0)
          }, 0))}
        </p>
      </section>

      <section className="card">
        <button className="disclosure row-between full" onClick={() => setShowTimeline(!showTimeline)} aria-expanded={showTimeline}>
          <h2>{DAYS[day]}’s schedule</h2>
          <span className="muted"><Icon name={showTimeline ? 'chevronDown' : 'chevronRight'} /></span>
        </button>
        {showTimeline && (
          <ol className="timeline">
            {schedule.map((item, i) => {
              const entry = item.slot === 'snack' ? d.snacks[item.snackIndex ?? 0] : item.slot ? d[item.slot] : null
              const r = entry ? RECIPE_BY_ID[entry.recipe] : undefined
              return (
                <li key={i} className={`kind-${item.kind}`}>
                  <span className="t-time">{formatTime(item.at)}</span>
                  <span className="t-icon"><Icon name={KIND_ICON[item.kind]} size={16} /></span>
                  <span className="t-body">
                    <strong>{item.label}</strong>
                    {r && entry && <span> · <RecipeLink id={r.id} portion={entry.portion} /></span>}
                    {item.detail && <span className="muted small t-detail">{item.detail} {item.sources && <Cite ids={item.sources} />}</span>}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <motion.div
        key={day}
        className="stack"
        initial={{ opacity: 0, x: dayDir * 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
      {(['breakfast', 'lunch', 'dinner'] as const).map((slot) => (
        <MealCard
          key={slot}
          label={`${SLOT_LABEL[slot]} · ${formatTime(times[slot])}`}
          entry={d[slot]}
          state={state}
          onSwap={() => setSwap({ day, slot })}
          onChange={(e) => change({ day, slot }, e)}
        />
      ))}
      {d.snacks.map((s, i) => (
        <MealCard
          key={`snack-${i}`}
          label={`${`Snack ${d.snacks.length > 1 ? i + 1 : ''}`.trim()}${times.snacks[i] !== undefined ? ` · ${formatTime(times.snacks[i])}` : ''}`}
          entry={s}
          state={state}
          onSwap={() => setSwap({ day, slot: 'snack', snack: i })}
          onChange={(e) => change({ day, slot: 'snack', snack: i }, e)}
          removable
        />
      ))}
      <button className="secondary add-snack" onClick={() => setSwap({ day, slot: 'snack', snack: d.snacks.length })}>+ Add a snack</button>
      </motion.div>

      {isAdhd(state.profile) && <HungryNow {...{ state, update }} />}
      <BatchPrep state={state} />

      {swap && (
        <SwapSheet
          pos={swap}
          state={state}
          onPick={(entry) => { change(swap, entry); setSwap(null) }}
          onClose={() => setSwap(null)}
        />
      )}
      {showExport && <ExportSheet state={state} update={update} onClose={() => setShowExport(false)} />}
      {showWater && (
        <Sheet title="Your water target" onClose={() => setShowWater(false)}>
          <p className="big-number">{(water.drinkMl / 1000).toFixed(1)} L to drink</p>
          <p className="muted">Total need about {(water.totalMl / 1000).toFixed(1)} L a day from all sources.</p>
          <ul className="explain">{water.explain.map((l) => <li key={l.text}>{l.text} <Cite ids={l.sources} convention={l.convention} /></li>)}</ul>
          <p className="note">Dehydration of about 2% of body weight measurably impairs attention and complex thinking. <Cite ids={['wittbrodt', 'adan']} /> Your schedule spreads the glasses over the day.</p>
        </Sheet>
      )}
    </div>
  )
}

function MealCard({
  label, entry, state, onSwap, onChange, removable,
}: {
  label: string
  entry: PlanEntry | null
  state: ViewProps['state']
  onSwap: () => void
  onChange: (e: PlanEntry | null) => void
  removable?: boolean
}) {
  const r = entry ? RECIPE_BY_ID[entry.recipe] : undefined
  if (!entry || !r) {
    return (
      <section className="card meal empty">
        <div className="meal-slot">{label}</div>
        <p className="muted">Nothing planned.</p>
        <button className="secondary" onClick={onSwap}>Choose a meal</button>
      </section>
    )
  }
  const t = servingTotals(r, entry.portion)
  const tip = mealTip(r, entry.portion, state.profile)
  const step = (delta: number) => onChange({ ...entry, portion: Math.max(0.25, Math.min(3, entry.portion + delta)) })
  return (
    <section className={`card meal ${entry.locked ? 'locked' : ''}`}>
      <div className="meal-head">
        <div className="meal-slot">{label}</div>
        <div className="meal-tools">
          <button className="icon" onClick={() => onChange({ ...entry, locked: !entry.locked })} aria-pressed={!!entry.locked} title={entry.locked ? 'Unlock' : 'Lock: keep this when making a new week'}>
            <Icon name={entry.locked ? 'lock' : 'unlock'} />
          </button>
          <button className="icon" onClick={onSwap} title="Swap for something else" aria-label="Swap"><Icon name="swap" /></button>
          {removable && <button className="icon" onClick={() => onChange(null)} title="Remove" aria-label="Remove"><Icon name="x" /></button>}
        </div>
      </div>
      <RecipeLink id={r.id} portion={entry.portion} className="meal-name" />
      <p className="stat-line">
        <strong>{Math.round(t.kcal)}</strong> kcal · <strong>{Math.round(t.protein)} g</strong> protein
        {(hasCondition(state.profile, 't1d') || hasCondition(state.profile, 't2d')) && <> · <span className="carbs">{Math.round(t.carbs)} g carbs</span> ({Math.round(t.fiber)} g fiber)</>}
        {' '}· {r.activeMin} min
        {r.totalMin > r.activeMin + 5 ? ` (${r.totalMin} total)` : ''}
      </p>
      <div className="chips">
        <Score label="Fullness" value={satietyScore(t)} title="Fullness per calorie: protein, fiber and food volume" />
        {isAdhd(state.profile) && <Score label="Reward" value={rewardScore(r)} title="Crunch, bold flavor, novelty and fun" />}
        {isAdhd(state.profile) && <Score label="Ease" value={easeScore(r)} title="Few steps, little hands-on time, few tools" />}
        {r.batch && r.servings > 1 && <Chip tone="accent">Batch · {r.servings} servings</Chip>}
        {crashRisk(t) && <Chip tone="warn">Crash risk</Chip>}
      </div>
      {tip && <p className="meal-tip"><Icon name="lightbulb" size={15} className="tip-icon" /> {tip.text} <Cite ids={tip.sources} /></p>}
      <div className="portion">
        <span className="muted small">Portion</span>
        <button className="icon small" onClick={() => step(-0.25)} aria-label="Smaller portion">−</button>
        <span className="portion-value">{entry.portion}×</span>
        <button className="icon small" onClick={() => step(0.25)} aria-label="Bigger portion">+</button>
      </div>
    </section>
  )
}

function SwapSheet({ pos, state, onPick, onClose }: { pos: Pos; state: ViewProps['state']; onPick: (e: PlanEntry) => void; onClose: () => void }) {
  const options = rankCandidates(state, state.plan, pos.day, pos.slot).slice(0, 10)
  return (
    <Sheet title={`Pick a ${SLOT_LABEL[pos.slot].toLowerCase()}`} onClose={onClose}>
      {options.length === 0 && <p className="muted">No recipes fit your kitchen, time limit and exclusions for this slot. Try adding equipment or raising your time limit.</p>}
      <ul className="option-list">
        {options.map((c) => {
          const why: string[] = []
          if (c.parts.satiety > 0.7) why.push('very filling')
          if (c.parts.gaps > 0.6) why.push('fills nutrient gaps')
          if (c.parts.onHand > 0.6) why.push('reuses groceries you already have or are buying')
          if (isAdhd(state.profile) && c.parts.ease > 0.8) why.push('low effort')
          if (isAdhd(state.profile) && c.parts.reward > 0.6) why.push('satisfying')
          if (c.parts.cost > 0.8) why.push('cheap')
          return (
            <li key={c.recipe.id} className="option-row">
              <button className="option" onClick={() => onPick({ recipe: c.recipe.id, portion: c.portion })}>
                <span className="option-title">{c.recipe.name}</span>
                <span className="muted small">
                  {c.portion}× · {Math.round(c.totals.kcal)} kcal · {Math.round(c.totals.protein)} g protein · {c.recipe.activeMin} min · {money(c.cost)}
                </span>
                {why.length > 0 && <span className="why">{why.join(' · ')}</span>}
              </button>
              <RecipeLink id={c.recipe.id} portion={c.portion} className="details-btn">Details</RecipeLink>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}

/** ADHD helper: zero-friction options right now, favoring food already in the house. */
function HungryNow({ state }: ViewProps) {
  const targets = computeTargets(state.profile)
  const snackKcal = targets.kcal * (slotShares(state.profile).snack || 0.12)
  const pantry = new Set(state.pantry.filter((p) => p.grams > 0).map((p) => p.food))
  const picks = eligibleRecipes(state, 'snack').filter((r) => r.activeMin <= 4)
    .map((r) => {
      const portion = portionFor(r, snackKcal, 'snack')
      const t = servingTotals(r, portion)
      const have = r.items.filter((i) => pantry.has(i.food)).length / r.items.length
      return { r, portion, t, have, score: satietyScore(t) * 0.5 + rewardScore(r) * 0.3 + have * 40 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  return (
    <section className="card">
      <h2>Hungry right now?</h2>
      <p className="muted small">Under 4 minutes and high on fullness per calorie, favoring what’s in your pantry and what your conditions allow. <Cite ids={['holt', 'rolls']} /></p>
      <ul className="option-list">
        {picks.map(({ r, portion, t, have }) => (
          <li key={r.id}>
            <RecipeLink id={r.id} portion={portion} className="option">
              <span className="option-title">{r.name}</span>
              <span className="muted small">{Math.round(t.kcal)} kcal · {Math.round(t.protein)} g protein · fullness {satietyScore(t)}</span>
              {have === 1 && <span className="why">you have everything</span>}
            </RecipeLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Batch recipes in this week's plan: cook once, eat several times. */
function BatchPrep({ state }: { state: ViewProps['state'] }) {
  const counts: Record<string, number> = {}
  for (const day of state.plan) for (const { entry } of dayEntries(day)) {
    const r = RECIPE_BY_ID[entry.recipe]
    if (r?.batch && r.servings > 1) counts[r.id] = (counts[r.id] ?? 0) + entry.portion
  }
  const rows = Object.entries(counts)
  if (!rows.length) return null
  return (
    <section className="card">
      <h2>Prep day</h2>
      <p className="muted small">Cook these once (Sunday works well) and the week mostly runs on leftovers.</p>
      <ul className="prep-list">
        {rows.map(([id, servings]) => {
          const r = RECIPE_BY_ID[id]
          const batches = Math.ceil(servings / r.servings - 0.1)
          return (
            <li key={id}>
              <strong><RecipeLink id={r.id} /></strong>
              <span className="muted small">
                {batches > 1 ? `${batches} batches` : '1 batch'} · {servings} servings planned · {r.activeMin * batches} min hands-on
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
