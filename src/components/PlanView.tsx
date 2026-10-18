import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { RECIPE_BY_ID } from '../data/recipes'
import type { Tab } from '../App'
import { computeTargets } from '../lib/energy'
import { crashRisk, easeScore, rewardScore, satietyScore, servingCost, servingTotals } from '../lib/nutrition'
import { DAYS, dayEntries, dayTotals, eligibleRecipes, generatePlan, isAdhd, magicPlan, pantryReport, rankCandidates, shoppingCost, slotShares, portionFor, type Candidate, type PantryReport } from '../lib/planner'
import { FOOD_BY_ID } from '../data/foods'
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
import { Bar, Chip, Cite, EvidenceChip, Score, Sheet, type ViewProps } from './ui'
import { analyzeWeek } from '../lib/analysis'
import { lowEnergyFixes, type EnergyFix } from '../lib/energyNow'
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

  const regenerate = () => { setMagic(null); update((s) => ({ ...s, plan: generatePlan(s), checked: {} })) }

  // Magic plan: same rules as any week, built from the pantry first.
  const [magic, setMagic] = useState<PantryReport | null>(null)
  const pantryCount = state.pantry.filter((p) => p.grams > 0).length
  const runMagic = () => {
    const next = magicPlan(state)
    update((s) => ({ ...s, plan: next, checked: {} }))
    setMagic(pantryReport(state, next))
  }
  /** Pantry-based alternatives for one slot today, for the meal cards' dropdown. */
  const pantryByPos = useMemo(() => {
    const out: Record<string, Candidate[]> = {}
    if (!pantryCount) return out
    const positions: Pos[] = [{ day, slot: 'breakfast' }, { day, slot: 'lunch' }, { day, slot: 'dinner' }, ...plan[day].snacks.map((_, i): Pos => ({ day, slot: 'snack', snack: i }))]
    for (const pos of positions) {
      out[`${pos.slot}-${pos.snack ?? 0}`] = rankCandidates(state, plan, pos.day, pos.slot, { pantryFirst: true }).filter((c) => c.parts.pantry >= 0.5).slice(0, 8)
    }
    return out
  }, [state, plan, day, pantryCount])
  const pantryChoices = (pos: Pos) => pantryByPos[`${pos.slot}-${pos.snack ?? 0}`] ?? []
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
            <button className="magic with-icon" onClick={runMagic} disabled={!pantryCount} title={pantryCount ? 'Build the week from your pantry first' : 'Scan or add pantry items first (Kitchen tab)'}>
              <Icon name="wand" size={16} /> Magic plan
            </button>
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

      {magic && <MagicSummary report={magic} violations={violations.length} budget={state.profile.weeklyBudget} onClose={() => setMagic(null)} />}

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
          pantryOptions={pantryChoices({ day, slot })}
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
          pantryOptions={pantryChoices({ day, slot: 'snack', snack: i })}
          removable
        />
      ))}
      <button className="secondary add-snack" onClick={() => setSwap({ day, slot: 'snack', snack: d.snacks.length })}>+ Add a snack</button>
      </motion.div>

      {isAdhd(state.profile) && <HungryNow {...{ state, update }} />}
      {hasPlan && <LowEnergyNow state={state} />}
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

/** "Swap for a pantry meal": the best meals for this slot that mostly use what you have. */
function PantryPicker({ options, current, onPick }: { options: Candidate[]; current?: string; onPick: (e: PlanEntry) => void }) {
  const list = options.filter((c) => c.recipe.id !== current)
  if (!list.length) return null
  return (
    <label className="pantry-picker">
      <Icon name="wand" size={15} />
      <select value="" aria-label="Swap for a meal from your pantry"
        onChange={(e) => { const c = list.find((x) => x.recipe.id === e.target.value); if (c) onPick({ recipe: c.recipe.id, portion: c.portion }) }}>
        <option value="">Swap for a pantry meal…</option>
        {list.map((c) => (
          <option key={c.recipe.id} value={c.recipe.id}>
            {c.recipe.name} · {Math.round(c.parts.pantry * 100)}% from pantry · {Math.round(c.totals.kcal)} kcal
          </option>
        ))}
      </select>
    </label>
  )
}

function MagicSummary({ report, violations, budget, onClose }: { report: PantryReport; violations: number; budget: number; onClose: () => void }) {
  const name = (id: string) => FOOD_BY_ID[id]?.name ?? id
  const spoiling = report.used.filter((u) => u.spoilsSoon)
  return (
    <section className="card magic-card" role="status">
      <div className="row-between">
        <h2 className="with-icon"><Icon name="wand" /> Magic plan</h2>
        <button className="icon" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
      </div>
      <p>
        Uses <strong>{report.used.length}</strong> of your {report.used.length + report.unused.length} pantry items, which cover{' '}
        <strong>{Math.round(report.fromPantry * 100)}%</strong> of the week’s ingredients. Still to buy ≈ <strong>{money(report.toBuy)}</strong>
        {report.toBuy > budget ? <span className="warn-text"> (over your {money(budget)} budget)</span> : ` of your ${money(budget)} budget`}.
      </p>
      <p className={violations ? 'warn-text small' : 'good-text small with-icon'}>
        {violations ? `${violations} health rule${violations > 1 ? 's' : ''} can’t be met with these foods; see the warning above.` : <><Icon name="check" size={14} /> Every limit from your conditions and diet is met, same as any other week.</>}
      </p>
      {spoiling.length > 0 && <p className="small">Uses up what spoils first: {spoiling.map((u) => name(u.food)).join(', ')}.</p>}
      {report.unused.length > 0 && (
        <p className="muted small">
          Not used: {report.unused.map(name).join(', ')}. These have no recipe that fits your kitchen, time limit and health settings this week, or they’re kept out by a condition.
        </p>
      )}
    </section>
  )
}

function MealCard({
  label, entry, state, onSwap, onChange, removable, pantryOptions = [],
}: {
  label: string
  entry: PlanEntry | null
  state: ViewProps['state']
  onSwap: () => void
  onChange: (e: PlanEntry | null) => void
  removable?: boolean
  pantryOptions?: Candidate[]
}) {
  const r = entry ? RECIPE_BY_ID[entry.recipe] : undefined
  if (!entry || !r) {
    return (
      <section className="card meal empty">
        <div className="meal-slot">{label}</div>
        <p className="muted">Nothing planned.</p>
        <button className="secondary" onClick={onSwap}>Choose a meal</button>
        <PantryPicker options={pantryOptions} onPick={onChange} />
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
      {!entry.locked && <PantryPicker options={pantryOptions} current={r.id} onPick={onChange} />}
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

/** "I feel low energy": quick fixes ranked for the person, the time of day and today's plan. */
function LowEnergyNow({ state }: { state: ViewProps['state'] }) {
  const [open, setOpen] = useState(false)
  const [at, setAt] = useState(() => new Date())
  const [sleptBadly, setSleptBadly] = useState(false)
  const [notEaten, setNotEaten] = useState(false)
  const analysis = useMemo(() => analyzeWeek(state), [state])
  const result = useMemo(
    () => (open ? lowEnergyFixes(state, analysis, { now: at.getHours() * 60 + at.getMinutes(), dayIndex: todayIndex(), sleptBadly, notEaten }) : null),
    [open, state, analysis, at, sleptBadly, notEaten],
  )
  return (
    <section className="card energy-card">
      <h2 className="with-icon"><Icon name="batteryLow" /> Low on energy right now?</h2>
      <p className="muted small">Fast fixes ranked for you: the time of day, today’s plan, your conditions, medications and diet. Each is rated by evidence.</p>
      {!open ? (
        <button className="primary with-icon" onClick={() => { setAt(new Date()); setOpen(true) }}><Icon name="zap" size={16} /> I feel low energy</button>
      ) : result && (
        <>
          <div className="chips" role="group" aria-label="Tell us more">
            <button className={`toggle-chip ${sleptBadly ? 'on' : ''}`} aria-pressed={sleptBadly} onClick={() => setSleptBadly(!sleptBadly)}><Icon name="bed" size={14} /> Slept badly</button>
            <button className={`toggle-chip ${notEaten ? 'on' : ''}`} aria-pressed={notEaten} onClick={() => setNotEaten(!notEaten)}><Icon name="meal" size={14} /> Haven’t eaten in a while</button>
          </div>
          <ol className="fix-steps">
            {result.fixes.map((f) => <FixItem key={f.id} f={f} />)}
          </ol>
          {result.later.length > 0 && (
            <details className="methods">
              <summary>If it keeps happening</summary>
              <ul className="fix-steps plain">{result.later.map((f) => <FixItem key={f.id} f={f} />)}</ul>
            </details>
          )}
          <button className="ghost small" onClick={() => setOpen(false)}>Close</button>
        </>
      )}
    </section>
  )
}

function FixItem({ f }: { f: EnergyFix }) {
  return (
    <li className={f.avoid ? 'avoid' : ''}>
      <span className="fix-icon"><Icon name={f.icon} size={18} /></span>
      <span className="fix-body">
        <span className="row-between"><strong>{f.title}</strong><EvidenceChip level={f.evidence} /></span>
        <span className="small">{f.detail} <Cite ids={f.sources} /></span>
        {f.why && <span className="why">For you: {f.why}</span>}
        {f.snacks && f.snacks.length > 0 && (
          <span className="fix-snacks">
            {f.snacks.map(({ recipe, portion }) => <RecipeLink key={recipe.id} id={recipe.id} portion={portion} className="chip tone-accent" />)}
          </span>
        )}
      </span>
    </li>
  )
}
