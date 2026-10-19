import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { FOOD_BY_ID } from '../data/foods'
import { RECIPE_BY_ID } from '../data/recipes'
import type { Tab } from '../App'
import { planViolations } from '../lib/conditions'
import { computeTargets } from '../lib/energy'
import { money } from '../lib/format'
import { hasLooksGoal, puffiness } from '../lib/looks'
import { exportLabel } from '../lib/onyx'
import { setEntry, type Pos } from '../lib/plan-utils'
import { DAYS, dayEntries, dayTotals, generatePlan, magicPlan, pantryReport, shoppingCost, type PantryReport } from '../lib/planner'
import { analyzeRotation } from '../lib/rotation'
import { formatTime, mealTimes } from '../lib/schedule'
import type { PlanEntry } from '../types'
import { ExportSheet } from './ExportSheet'
import { Icon } from './Icon'
import { MealCard, MealSheet } from './MealCard'
import { SLOT_LABEL, todayIndex } from '../lib/meals'
import { RecipeLink } from './RecipeViewer'
import { Bar, type ViewProps } from './ui'

/** The week: build or rebuild it, pick a day, and change any meal. */
export function PlanView({ state, update, goTo }: ViewProps & { goTo: (t: Tab, section?: string) => void }) {
  const [day, setDayRaw] = useState(todayIndex)
  const [dayDir, setDayDir] = useState(0)
  const setDay = (d: number) => { setDayDir(Math.sign(d - day)); setDayRaw(d) }
  const [open, setOpen] = useState<Pos | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [magic, setMagic] = useState<PantryReport | null>(null)
  const targets = computeTargets(state.profile)
  const plan = state.plan
  const d = plan[day]
  const totals = dayTotals(d)
  const bill = useMemo(() => shoppingCost(state, plan), [state, plan])
  const hasPlan = plan.some((x) => dayEntries(x).length > 0)
  const pantryCount = state.pantry.filter((p) => p.grams > 0).length
  const rotation = useMemo(() => analyzeRotation(state), [state])
  const rulesMet = rotation.rules.filter((r) => r.status === 'met').length
  const violations = useMemo(() => planViolations(state.profile, plan), [state.profile, plan])
  const times = mealTimes(state.profile, d.snacks.length)
  const handsOn = dayEntries(d).reduce((m, { entry }) => m + (RECIPE_BY_ID[entry.recipe]?.activeMin ?? 0), 0)

  const regenerate = () => { setMagic(null); update((s) => ({ ...s, plan: generatePlan(s), checked: {} })) }
  // Magic plan: same rules as any week, built from the pantry first.
  const runMagic = () => {
    const next = magicPlan(state)
    update((s) => ({ ...s, plan: next, checked: {} }))
    setMagic(pantryReport(state, next))
  }
  const change = (pos: Pos, entry: PlanEntry | null) => update((s) => ({ ...s, plan: setEntry(s.plan, pos, entry) }))
  const over = bill > state.profile.weeklyBudget
  const kcalTone = totals.kcal < targets.kcal * 0.85 || totals.kcal > targets.kcal * 1.15 ? 'warn' : 'good'
  const puff = hasLooksGoal(state.profile) && totals.kcal > 0 ? puffiness(totals, state.profile) : null

  return (
    <div className="stack">
      <section className="card hero">
        <h1>This week</h1>
        {hasPlan
          ? <p className="muted">Groceries ≈ <strong>{money(bill)}</strong>{over ? <span className="warn-text"> · over your {money(state.profile.weeklyBudget)} budget</span> : ` · within your ${money(state.profile.weeklyBudget)} budget`}</p>
          : <p className="muted">Build a week of meals that fit your body, health, kitchen and budget.</p>}
        <div className="hero-actions">
          <button className="primary" onClick={regenerate}>{hasPlan ? 'New week' : 'Plan my week'}</button>
          <button className="magic with-icon" onClick={runMagic} disabled={!pantryCount} title={pantryCount ? 'Build the week from your pantry first' : 'Add pantry items first (Shop → Pantry)'}>
            <Icon name="wand" size={16} /> Magic plan
          </button>
        </div>
        <p className="muted small">{pantryCount ? 'Magic plan uses what’s in your pantry first.' : 'Add pantry items in Shop to use Magic plan.'} Meals you keep stay when you make a new week.</p>
        {hasPlan && (
          <div className="hero-links">
            <button className="rotation-pill" onClick={() => goTo('health', 'rotation')}>
              <span className="with-icon"><Icon name="refresh" size={16} /> <strong>{rulesMet}/{rotation.rules.length}</strong> food guidelines</span>
              <span className="with-icon"><Icon name="sprout" size={16} /> <strong>{rotation.plants.length}</strong>/30 plants</span>
              <span className="muted">›</span>
            </button>
            <button className="link with-icon" onClick={() => setShowExport(true)}><Icon name="share" size={15} /> {exportLabel(state)}</button>
          </div>
        )}
      </section>

      {hasPlan && violations.length > 0 && (
        <section className="card banner" role="alert">
          <h2>This week doesn’t fit your health settings</h2>
          <ul className="explain">{violations.slice(0, 3).map((v, i) => <li key={i}>{v.day !== undefined ? `${DAYS[v.day]}: ` : ''}{v.message}</li>)}</ul>
          <p className="small">This usually happens after you change your conditions. Make a new week; if it keeps happening, add equipment or allow more foods in Profile.</p>
          <button className="primary" onClick={regenerate}>Make a new week</button>
        </section>
      )}

      {magic && <MagicSummary report={magic} violations={violations.length} budget={state.profile.weeklyBudget} onClose={() => setMagic(null)} />}

      {hasPlan && (
        <>
          <div className="day-tabs" role="tablist" aria-label="Day">
            {DAYS.map((name, i) => (
              <button key={name} role="tab" aria-selected={i === day} className={`${i === day ? 'on' : ''} ${i === todayIndex() ? 'is-today' : ''}`} onClick={() => setDay(i)}>
                <span>{name}</span>
              </button>
            ))}
          </div>

          <section className="card day-summary">
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
            <p className="muted small">About {handsOn} min of hands-on cooking</p>
            {puff && <p className={`small ${puff.tone === 'warn' ? 'warn-text' : 'good-text'}`}>{puff.text}</p>}
          </section>

          <motion.div key={day} className="stack" initial={{ opacity: 0, x: dayDir * 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {(['breakfast', 'lunch', 'dinner'] as const).map((slot) => (
              <MealCard key={slot} label={`${SLOT_LABEL[slot]} · ${formatTime(times[slot])}`} entry={d[slot]} state={state} onOpen={() => setOpen({ day, slot })} />
            ))}
            {d.snacks.map((s, i) => (
              <MealCard
                key={`snack-${i}`}
                label={`${`Snack ${d.snacks.length > 1 ? i + 1 : ''}`.trim()}${times.snacks[i] !== undefined ? ` · ${formatTime(times.snacks[i])}` : ''}`}
                entry={s} state={state} onOpen={() => setOpen({ day, slot: 'snack', snack: i })}
              />
            ))}
            <button className="ghost add-snack" onClick={() => setOpen({ day, slot: 'snack', snack: d.snacks.length })}>+ Add a snack</button>
          </motion.div>

          <BatchPrep state={state} />
        </>
      )}

      {open && <MealSheet pos={open} state={state} onChange={(e) => change(open, e)} onClose={() => setOpen(null)} />}
      {showExport && <ExportSheet state={state} update={update} onClose={() => setShowExport(false)} />}
    </div>
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

