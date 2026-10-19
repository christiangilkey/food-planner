import { useEffect, useMemo, useState } from 'react'
import type { Tab } from '../App'
import type { Claim } from '../data/conditions'
import { FOOD_BY_ID } from '../data/foods'
import { DOMAINS, SODIUM_SOURCES } from '../data/nutrients'
import { PLANT_SOURCES, PLANT_TARGET, PROTEIN_VARIETY_TARGET } from '../data/rotation'
import { SOURCES, type SourceKind } from '../data/sources'
import { analyzeWeek, type NutrientReport, type WeekAnalysis } from '../lib/analysis'
import { activeAvoidEntries, activeConditions, activeDiets, avoidedFoods, limitReasons, mergedLimits, netCarbLimits, planViolations, type Violation } from '../lib/conditions'
import { hormoneSystems } from '../lib/hormones'
import { DAYS } from '../lib/plan-utils'
import { analyzeRotation, type RotationReport, type RuleStatus } from '../lib/rotation'
import { analyzeSleep, type SleepAnalysis } from '../lib/sleep'
import { recommendedSupplements } from '../lib/supplements'
import { weeklyTips, type BioTip, type TipCategory } from '../lib/tips'
import type { Domain } from '../types'
import { DietCard } from './DietFields'
import { Hormones } from './HormonesView'
import { Icon, type IconName } from './Icon'
import { RecipeLink } from './RecipeViewer'
import { SleepView } from './SleepView'
import { DomainOptions, SupplementsView } from './SupplementsView'
import { Bar, Chip, Cite, EvidenceChip, Why, type ViewProps } from './ui'

type Page = 'nutrients' | 'conditions' | 'hormones' | 'rotation' | 'tips' | 'supplements' | 'sleep' | 'sources'
type Tone = 'good' | 'warn' | 'bad' | 'muted'

const PAGES: { id: Page; label: string; icon: IconName; needsPlan: boolean }[] = [
  { id: 'nutrients', label: 'Nutrients', icon: 'salad', needsPlan: true },
  { id: 'conditions', label: 'Conditions & diet', icon: 'stethoscope', needsPlan: true },
  { id: 'hormones', label: 'Hormones', icon: 'flask', needsPlan: true },
  { id: 'rotation', label: 'Food rotation', icon: 'refresh', needsPlan: true },
  { id: 'tips', label: 'Tips', icon: 'lightbulb', needsPlan: true },
  { id: 'supplements', label: 'Supplements', icon: 'pill', needsPlan: false },
  { id: 'sleep', label: 'Sleep', icon: 'moon', needsPlan: false },
  { id: 'sources', label: 'Sources', icon: 'book', needsPlan: false },
]
const asPage = (s?: string): Page | null => PAGES.find((p) => p.id === s)?.id ?? null

const fmt = (n: number, unit: string) => `${n >= 100 ? Math.round(n) : n >= 10 ? n.toFixed(0) : n.toFixed(1)} ${unit}`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
/** "Iron", "Iron and zinc", "Iron, zinc and 2 more". */
const names = (list: string[]) => list.length <= 2 ? list.join(' and ') : `${list[0]}, ${list[1]} and ${list.length - 2} more`

function ClaimLine({ c }: { c: Claim }) {
  return <p className="claim">{c.text} <Why evidence={c.evidence} ids={c.sources} /></p>
}

function Disclaimer() {
  return (
    <p className="muted small disclaimer">
      Estimates from typical food values, not a diagnosis or medical advice. Absorption, medications and health conditions change what you actually need. If something keeps showing up low or you have symptoms, ask your doctor about a blood test (for example ferritin, vitamin D or B12) before starting high-dose supplements.
    </p>
  )
}

export function HealthView({ state, update, goTo, section }: ViewProps & { goTo: (t: Tab, section?: string) => void; section?: string }) {
  // App remounts this screen whenever the section in goTo() changes, so the initial value is enough.
  const [page, setPage] = useState<Page | null>(() => asPage(section))
  useEffect(() => { window.scrollTo(0, 0) }, [page])

  const p = state.profile
  const hasConditions = p.conditions.length > 0 || p.diets.length > 0
  const analysis = useMemo(() => analyzeWeek(state), [state])
  const rotation = useMemo(() => analyzeRotation(state), [state])
  const tips = useMemo(() => weeklyTips(state, analysis.reports, rotation), [state, analysis, rotation])
  const violations = useMemo(() => planViolations(p, state.plan), [p, state.plan])
  const sleep = useMemo(() => analyzeSleep(state.sleepLog, p), [state.sleepLog, p])
  const planned = analysis.daysPlanned > 0

  if (page) {
    const meta = PAGES.find((x) => x.id === page)!
    return (
      <div className="stack">
        <div className="page-back">
          <button className="back-btn" onClick={() => setPage(null)} aria-label="Back to Health">
            <Icon name="chevronLeft" size={20} /> Health
          </button>
        </div>
        {page === 'sleep' ? (
          <SleepView state={state} update={update} goTo={goTo} />
        ) : meta.needsPlan && !planned ? (
          <NoPlan title={meta.label} goTo={goTo} />
        ) : (
          <>
            {page === 'nutrients' && <Nutrients state={state} a={analysis} />}
            {page === 'conditions' && (hasConditions ? <Conditions state={state} a={analysis} rules={rotation.rules} violations={violations} /> : <NoConditions goTo={goTo} />)}
            {page === 'hormones' && <Hormones state={state} a={analysis} />}
            {page === 'rotation' && <Rotation rules={rotation.rules} plants={rotation.plants} proteinGroups={rotation.proteinGroups.length} />}
            {page === 'tips' && <Tips tips={tips} />}
            {page === 'supplements' && <SupplementsView state={state} reports={planned ? analysis.reports : []} />}
            {page === 'sources' && <Sources />}
            {page !== 'sources' && <Disclaimer />}
          </>
        )}
      </div>
    )
  }

  const issues = planned ? weekIssues(analysis, violations, rotation, sleep) : []
  const status = tileStatus({ state, a: analysis, rotation, tips, violations, sleep, hasConditions, planned })

  return (
    <div className="stack">
      <section className="card hero health-summary">
        <p className="eyebrow">This week</p>
        {!planned ? (
          <>
            <h1>No week planned yet</h1>
            <p className="muted">Plan a week of meals and Health checks it against your nutrients, conditions and goals.</p>
            <button className="primary" onClick={() => goTo('week')}>Plan my week</button>
          </>
        ) : issues.length === 0 ? (
          <>
            <h1 className="with-icon"><Icon name="checkCircle" size={24} className="good-text" /> You’re on track</h1>
            <p className="muted">This week’s plan meets your nutrient targets, limits and food guidelines.</p>
          </>
        ) : (
          <>
            <h1>{issues.some((x) => x.tone === 'bad') ? `${plural(issues.length, 'thing')} to improve` : `Mostly on track · ${plural(issues.length, 'thing')} to improve`}</h1>
            <ul className="issue-list">
              {issues.slice(0, 3).map((x) => (
                <li key={x.text}>
                  <button className={`issue tone-${x.tone}`} onClick={() => setPage(x.page)}>
                    <Icon name="alert" size={18} />
                    <span>{x.text}</span>
                    <Icon name="chevronRight" size={18} />
                  </button>
                </li>
              ))}
            </ul>
            {issues.length > 3 && <p className="muted small">{plural(issues.length - 3, 'more thing')} inside the sections below.</p>}
          </>
        )}
      </section>

      <nav className="card health-tiles" aria-label="Health sections">
        {PAGES.map((x) => {
          const s = status[x.id]
          return (
            <button key={x.id} className="health-tile" onClick={() => setPage(x.id)}>
              <span className={`tile-icon tone-${s.tone}`}><Icon name={x.icon} size={20} /></span>
              <span className="tile-text">
                <strong>{x.label}</strong>
                <span className={`tile-status tone-${s.tone}`}>{s.text}</span>
              </span>
              <Icon name="chevronRight" className="tile-chevron" />
            </button>
          )
        })}
      </nav>

      <Disclaimer />
    </div>
  )
}

function NoPlan({ title, goTo }: { title: string; goTo: (t: Tab) => void }) {
  return (
    <section className="card hero empty-state">
      <h1>{title}</h1>
      <p>This check runs on your planned week. Plan one and it fills in automatically.</p>
      <button className="primary" onClick={() => goTo('week')}>Plan my week</button>
    </section>
  )
}

function NoConditions({ goTo }: { goTo: (t: Tab) => void }) {
  return (
    <section className="card hero empty-state">
      <h1>Conditions & diet</h1>
      <p>You haven’t added any health conditions or a diet. Add them in your profile and the planner keeps every meal within their limits.</p>
      <button className="secondary" onClick={() => goTo('profile')}>Open profile</button>
    </section>
  )
}

// ── Home summary ─────────────────────────────────────────

interface Issue { text: string; page: Page; tone: 'bad' | 'warn' }

/** The few things worth fixing this week, worst first, each pointing at the page that explains it. */
function weekIssues(a: WeekAnalysis, violations: Violation[], rotation: RotationReport, sleep: SleepAnalysis): Issue[] {
  const out: Issue[] = []
  if (violations.length) out.push({ text: `This week breaks ${plural(violations.length, 'rule')} from your conditions or diet`, page: 'conditions', tone: 'bad' })
  const low = a.reports.filter((r) => r.status === 'low' && !r.info.notFoodAlone)
  if (low.length) out.push({ text: `Low in ${names(low.map((r) => r.info.label))}`, page: 'nutrients', tone: 'bad' })
  const high = a.reports.filter((r) => r.nearUpper)
  if (high.length) out.push({ text: `Close to the safe upper limit for ${names(high.map((r) => r.info.label))}`, page: 'nutrients', tone: 'warn' })
  if (a.sodiumPerDay > a.sodiumLimit && !violations.some((v) => v.kind === 'sodium')) out.push({ text: 'More sodium than your daily limit', page: 'nutrients', tone: 'warn' })
  if (a.caffeinePerDay > a.caffeineLimit && !violations.some((v) => v.kind === 'caffeine')) out.push({ text: 'More caffeine than your daily limit', page: 'nutrients', tone: 'warn' })
  const off = rotation.rules.filter((r) => r.status !== 'met')
  if (off.length) out.push({ text: `${plural(off.length, 'food guideline')} not met yet`, page: 'rotation', tone: 'warn' })
  if (sleep.nights.length && sleep.avgMin < sleep.target.min) out.push({ text: `Sleeping under ${sleep.target.min / 60} hours a night`, page: 'sleep', tone: 'warn' })
  return out.sort((x, y) => (x.tone === y.tone ? 0 : x.tone === 'bad' ? -1 : 1))
}

function nutrientLine(reports: NutrientReport[]): { text: string; tone: Tone } {
  // Same rule as the weekly summary: nutrients food alone rarely covers (vitamin D) aren't counted as a problem.
  const low = reports.filter((r) => r.status === 'low' && !r.info.notFoodAlone)
  const close = reports.filter((r) => r.status === 'borderline' && !r.info.notFoodAlone)
  const hard = reports.filter((r) => r.status !== 'ok' && r.info.notFoodAlone)
  if (low.length) return { text: `Low in ${names(low.map((r) => r.info.label))}`, tone: 'bad' }
  // Nearly there isn't counted as a problem in the summary, so it isn't shown as a warning either.
  if (close.length) return { text: `Nearly there on ${names(close.map((r) => r.info.label))}`, tone: 'muted' }
  if (hard.length) return { text: `On track · ${names(hard.map((r) => r.info.label))} is hard from food alone`, tone: 'muted' }
  return { text: 'Every target met', tone: 'good' }
}

function tileStatus({ state, a, rotation, tips, violations, sleep, hasConditions, planned }: {
  state: ViewProps['state']; a: WeekAnalysis; rotation: RotationReport; tips: BioTip[]; violations: Violation[]; sleep: SleepAnalysis; hasConditions: boolean; planned: boolean
}): Record<Page, { text: string; tone: Tone }> {
  const needsPlan = { text: 'Needs a planned week', tone: 'muted' as Tone }
  const flags = planned ? hormoneSystems(state, a).flatMap((h) => h.stats).filter((s) => s.tone === 'warn').length : 0
  const met = rotation.rules.filter((r) => r.status === 'met').length
  const forYou = recommendedSupplements(state.profile, planned ? a.reports : []).length
  return {
    nutrients: planned ? nutrientLine(a.reports) : needsPlan,
    conditions: !hasConditions ? { text: 'None added', tone: 'muted' }
      : !planned ? needsPlan
      : violations.length ? { text: `${plural(violations.length, 'rule')} broken this week`, tone: 'bad' }
      : { text: 'Plan fits every limit', tone: 'good' },
    hormones: !planned ? needsPlan : flags ? { text: `${plural(flags, 'thing')} to watch`, tone: 'warn' } : { text: 'Nothing to watch this week', tone: 'good' },
    rotation: !planned ? needsPlan : { text: `${met} of ${rotation.rules.length} guidelines met · ${rotation.plants.length} plants`, tone: met === rotation.rules.length ? 'good' : 'warn' },
    tips: !planned ? needsPlan : { text: tips.length ? `${plural(tips.length, 'tip')} picked for you` : 'Nothing new this week', tone: 'muted' },
    supplements: { text: forYou ? `${forYou} suggested for you` : 'Nothing needed right now', tone: 'muted' },
    sleep: !sleep.nights.length ? { text: 'Log a night to see your sleep', tone: 'muted' }
      : { text: `${(sleep.avgMin / 60).toFixed(1)} h a night${sleep.short ? ` · ${plural(sleep.short, 'short night')}` : ' · on target'}`, tone: sleep.short ? 'warn' : 'good' },
    sources: { text: `${Object.keys(SOURCES).length} studies and guidelines`, tone: 'muted' },
  }
}

// ── Nutrients ────────────────────────────────────────────

type DomainStatus = 'risk' | 'watch' | 'ok'

function domainStatus(domain: Domain, reports: NutrientReport[]): { status: DomainStatus; nutrients: NutrientReport[] } {
  const hits = reports.filter((r) => r.status !== 'ok' && r.info.effects.some((e) => e.domain === domain))
  const serious = hits.some(
    (r) => r.status === 'low' && !r.info.notFoodAlone && r.info.effects.some((e) => e.domain === domain && e.evidence !== 'emerging'),
  )
  return { status: serious ? 'risk' : hits.length ? 'watch' : 'ok', nutrients: hits }
}

function Nutrients({ state, a }: { state: ViewProps['state']; a: WeekAnalysis }) {
  const [focus, setFocus] = useState<Domain | null>(null)
  const sorted = [...a.reports].sort((x, y) => x.pct - y.pct)
  const shown = focus ? sorted.filter((r) => r.info.effects.some((e) => e.domain === focus)) : sorted
  const attention = shown.filter((r) => r.status !== 'ok' || r.nearUpper)
  const fine = shown.filter((r) => r.status === 'ok' && !r.nearUpper)
  const line = nutrientLine(a.reports)
  const focusLabel = focus ? DOMAINS.find((d) => d.id === focus)!.label : ''

  return (
    <>
      <section className="card hero">
        <h1>Nutrients</h1>
        <p className={`lead ${line.tone}-text`}>{line.text === 'Every target met' ? 'Your plan meets every nutrient target.' : `${line.text}.`}</p>
        <p className="muted small">
          The daily average of your {a.daysPlanned}-day plan, against what’s recommended for you.{' '}
          <Why ids={['usda_fdc']}>
            Compared with the Dietary Reference Intakes for a {state.profile.age}-year-old {state.profile.sex}
            {state.profile.conditions.includes('menopause') ? ', adjusted for menopause stage' : ''}. Food values come from:
          </Why>
        </p>
      </section>

      <section className="card">
        <h2>By area</h2>
        <p className="muted small">Tap an area to see the nutrients behind it, plus supplements and peptides people use for it.</p>
        <div className="domain-grid">
          {DOMAINS.map((d) => {
            const s = domainStatus(d.id, a.reports)
            return (
              <button key={d.id} className={`domain status-${s.status} ${focus === d.id ? 'on' : ''}`} onClick={() => setFocus(focus === d.id ? null : d.id)} aria-pressed={focus === d.id}>
                <span className="domain-icon"><Icon name={d.icon} size={22} /></span>
                <span className="domain-label">{d.label}</span>
                <span className="domain-status">{s.status === 'ok' ? 'Covered' : s.status === 'risk' ? 'At risk' : 'Watch'}</span>
                {s.nutrients.length > 0 && (
                  <span className="domain-why">{s.nutrients.map((n) => n.info.label + (n.info.notFoodAlone ? ' (sun/supplement)' : '')).join(', ')}</span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {focus && (
        <p className="muted small focus-note">
          Showing nutrients that affect <strong>{focusLabel.toLowerCase()}</strong>.{' '}
          <button className="link" onClick={() => setFocus(null)}>Show all</button>
        </p>
      )}

      {attention.length > 0 && <h2 className="section-title">Needs attention</h2>}
      {attention.map((r) => <NutrientRow key={r.info.key} r={r} focus={focus} />)}

      {fine.length > 0 && (
        <details className="more">
          <summary>{plural(fine.length, 'nutrient')} on track</summary>
          <div className="stack">{fine.map((r) => <NutrientRow key={r.info.key} r={r} focus={focus} />)}</div>
        </details>
      )}

      {focus && (
        <details className="more">
          <summary>Supplements & peptides for {focusLabel.toLowerCase()}</summary>
          <div className="stack"><DomainOptions domain={focus} label={focusLabel} state={state} /></div>
        </details>
      )}

      {!focus && <Limits a={a} />}
    </>
  )
}

function Limits({ a }: { a: WeekAnalysis }) {
  const sodiumOver = a.sodiumPerDay > a.sodiumLimit
  const caffeineOver = a.caffeinePerDay > a.caffeineLimit
  return (
    <section className="card limits">
      <h2>Sodium, fat, sugar & caffeine</h2>
      <div className="limit-row">
        <div className="summary-label"><strong>Sodium</strong><span className={sodiumOver ? 'warn-text' : ''}>{Math.round(a.sodiumPerDay)} / {a.sodiumLimit} mg a day</span></div>
        <Bar value={a.sodiumPerDay} max={a.sodiumLimit} tone={sodiumOver ? 'bad' : 'good'} label="Sodium" />
        <p className="small muted">
          {a.sodiumLimit < 2300 ? 'Your goal is 1,500 mg because of high blood pressure; no day may go over 2,300 mg.' : 'The chronic-disease risk-reduction intake is 2,300 mg a day.'}{' '}
          <Why ids={a.sodiumLimit < 2300 ? ['acc_htn', 'aha_sodium'] : SODIUM_SOURCES} />
        </p>
      </div>
      <div className="limit-row">
        <div className="summary-label"><strong>Saturated fat</strong><span>{a.satFatPct.toFixed(1)}% of calories</span></div>
        <p className="small muted">Under 10% for most people; 5–6% if you need to lower LDL. <Why ids={['sacks_fat', 'eckel']} /></p>
      </div>
      <div className="limit-row">
        <div className="summary-label"><strong>Added sugar</strong><span>{a.addedSugarPct.toFixed(1)}% of calories</span></div>
        <p className="small muted">The ADA advises minimizing added sugar; the 2025–2030 Dietary Guidelines advise avoiding highly processed sugary foods. <Why ids={['ada_5', 'dga_2025']} /></p>
      </div>
      <div className="limit-row">
        <div className="summary-label"><strong>Caffeine from food & drinks</strong><span className={caffeineOver ? 'warn-text' : ''}>{Math.round(a.caffeinePerDay)} / {a.caffeineLimit} mg a day</span></div>
        <Bar value={a.caffeinePerDay} max={a.caffeineLimit} tone={caffeineOver ? 'bad' : 'good'} label="Caffeine" />
        <p className="small muted">{a.caffeineLimit < 400 ? 'Under 200 mg a day in pregnancy.' : 'Up to 400 mg a day isn’t linked to harm for most adults.'} Coffee you drink outside the plan counts too. <Why ids={a.caffeineLimit < 400 ? ['acog_caffeine'] : ['fda_caffeine']} /></p>
      </div>
    </section>
  )
}

const STATUS_WORD: Record<NutrientReport['status'], [string, Tone]> = { low: ['Low', 'bad'], borderline: ['Nearly', 'warn'], ok: ['Met', 'good'] }

function NutrientRow({ r, focus }: { r: NutrientReport; focus: Domain | null }) {
  const [open, setOpen] = useState(false)
  const tone = r.status === 'low' ? 'bad' : r.status === 'borderline' ? 'warn' : 'good'
  const effects = focus ? r.info.effects.filter((e) => e.domain === focus) : r.info.effects
  const [word, wordTone] = r.nearUpper ? ['Near limit', 'warn' as Tone] : STATUS_WORD[r.status]
  return (
    <section className={`card nutrient status-${r.status}`}>
      <button className="nutrient-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="nutrient-title">
          <strong>{r.info.label}</strong>
          <span className="muted small">{fmt(r.perDay, r.info.unit)} of {fmt(r.target, r.info.unit)} a day</span>
        </span>
        <span className="head-end">
          <span className={`status-word ${wordTone}-text`}>{word}</span>
          <Icon name={open ? 'chevronDown' : 'chevronRight'} />
        </span>
      </button>
      <Bar value={r.perDay} max={r.target} tone={tone} label={r.info.label} />
      {open && (
        <div className="nutrient-body">
          <div className="chips">
            {r.info.effects.map((e) => {
              const d = DOMAINS.find((x) => x.id === e.domain)!
              return <span key={e.domain} className="chip tone-muted with-icon" title={e.what}><Icon name={d.icon} size={13} /> {d.label}</span>
            })}
          </div>
          <p className="small muted">Daily target {fmt(r.target, r.info.unit)}{r.upperLimit ? `, upper limit ${fmt(r.upperLimit, r.info.unit)}` : ''}. <Why ids={r.info.targetSources} /></p>
          {r.nearUpper && r.upperLimit && (
            <p className="warn-text small">
              Close to or above the safe upper limit of {fmt(r.upperLimit, r.info.unit)} a day. This usually comes from fortified foods or supplements. Consider smaller portions of fortified cereal, and check any multivitamin you take. <Why ids={r.info.targetSources} />
            </p>
          )}
          {r.status !== 'ok' && <p className="small">{r.info.issues} <Why ids={r.info.targetSources} /></p>}
          {r.info.note && <p className="note">{r.info.note.text} <Why ids={r.info.note.sources} /></p>}

          <h3>{r.status === 'ok' ? 'Why it matters' : 'What a shortfall can do'}</h3>
          <ul className="effect-list">
            {effects.map((e) => {
              const d = DOMAINS.find((x) => x.id === e.domain)!
              return (
                <li key={e.domain}>
                  <strong className="with-icon small"><Icon name={d.icon} size={16} /> {d.label}</strong>
                  <span className="small">{e.what} <Why evidence={e.evidence} ids={e.sources} /></span>
                </li>
              )
            })}
          </ul>

          {r.status !== 'ok' && (
            <>
              <h3>Foods that fix it</h3>
              <ul className="fix-list">
                {r.foods.map((f) => (
                  <li key={f.food.id}>
                    <span>{f.food.name}</span>
                    <span className="muted small">{fmt(f.perServing, r.info.unit)} per {f.servingGrams} g</span>
                  </li>
                ))}
              </ul>
              <p className="muted small">Foods your conditions exclude are left out. <Why ids={['usda_fdc']}>Nutrient values are approximated from:</Why></p>
              {r.recipes.length > 0 && (
                <>
                  <h3>Meals you can make that are rich in it</h3>
                  <ul className="fix-list">
                    {r.recipes.map((x) => (
                      <li key={x.recipe.id}>
                        <RecipeLink id={x.recipe.id} />
                        <span className="muted small">{fmt(x.perServing, r.info.unit)} per serving</span>
                      </li>
                    ))}
                  </ul>
                  <p className="muted small">Swap one of these into your week from the Food tab.</p>
                </>
              )}
            </>
          )}

          <h3>Absorb more of it</h3>
          <ul className="effect-list">
            {r.info.absorption.map((t) => (
              <li key={t.text}><span className="small">{t.text} <Why evidence={t.evidence} ids={t.sources} /></span></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

// ── Conditions ───────────────────────────────────────────

function Conditions({ state, a, rules, violations }: { state: ViewProps['state']; a: WeekAnalysis; rules: RuleStatus[]; violations: Violation[] }) {
  const p = state.profile
  const conditions = activeConditions(p)
  const limits = mergedLimits(p)
  const avoided = avoidedFoods(p)
  const reasons = limitReasons(p)
  const diets = activeDiets(p)
  const carbs = netCarbLimits(p)
  const what = conditions.length ? (diets.length ? 'conditions and diet' : 'conditions') : 'diet'

  return (
    <>
      <section className={`card ${violations.length ? 'banner' : 'hero'}`}>
        <h1>{conditions.length ? (diets.length ? 'Your conditions & diet' : 'Your conditions') : 'Your diet'}</h1>
        {violations.length === 0 ? (
          <p className="good-text with-icon"><Icon name="check" /> This week’s plan is within every limit set by your {what}.</p>
        ) : (
          <>
            <p className="warn-text">This week breaks {plural(violations.length, 'rule')}. Make a new week on the Food tab.</p>
            <ul className="explain">{violations.slice(0, 3).map((v, i) => <li key={i}>{v.day !== undefined ? `${DAYS[v.day]}: ` : ''}{v.message}</li>)}</ul>
            {violations.length > 3 && (
              <details className="more inline">
                <summary>{plural(violations.length - 3, 'more rule')}</summary>
                <ul className="explain">{violations.slice(3).map((v, i) => <li key={i}>{v.day !== undefined ? `${DAYS[v.day]}: ` : ''}{v.message}</li>)}</ul>
              </details>
            )}
          </>
        )}
      </section>

      <section className="card">
        <h2>Limits your plan follows</h2>
        <ul className="explain">
          {limits.sodiumMaxMg && <li>Sodium: every day under {limits.sodiumMaxMg} mg, aiming for {limits.sodiumGoalMg} mg. This week averages {Math.round(a.sodiumPerDay)} mg.</li>}
          {limits.satFatMaxPct && <li>Saturated fat: under {limits.satFatMaxPct}% of calories. This week: {a.satFatPct.toFixed(1)}%.</li>}
          {limits.addedSugarMaxPct && <li>Added sugar: under {limits.addedSugarMaxPct}% of calories. This week: {a.addedSugarPct.toFixed(1)}%.</li>}
          {limits.noCrashMeals && <li>No meals likely to spike blood sugar.</li>}
          {limits.lastFoodBeforeBedMin && <li>No food in the {limits.lastFoodBeforeBedMin / 60} hours before bed.</li>}
          {limits.eggsMaxWeek && <li>At most {limits.eggsMaxWeek} eggs a week.</li>}
          {limits.proteinMaxPerKg && <li>Protein capped at {limits.proteinMaxPerKg} g per kg.</li>}
          {diets.length > 0 && <li>Diet: {diets.map((d) => d.label).join(' + ')}. Only foods {diets.length > 1 ? 'all of these allow' : 'it allows'} are planned.</li>}
          {carbs && <li>Net carbs: under {carbs.perDay} g a day. This week averages {Math.round(a.netCarbsPerDay)} g.</li>}
          {avoided.size > 0 && <li>Removed foods: {[...avoided.keys()].map((f) => FOOD_BY_ID[f]?.name ?? f).join(', ')}.</li>}
        </ul>
      </section>

      {diets.map((d) => (
        <details key={d.id} className="more card-details">
          <summary className="with-icon"><Icon name={d.icon} /> {d.label} diet: what the research shows</summary>
          <DietCard d={d} p={p} />
        </details>
      ))}

      {conditions.map((c) => {
        const ruleStatus = c.rules.map((r) => rules.find((x) => x.rule.id === r.id)).filter((x): x is RuleStatus => !!x)
        const removed = c.avoid.flatMap((entry) => entry.foods.filter((f) => avoided.get(f)?.some((x) => x.condition.id === c.id && x.entry === entry)).map((f) => ({ f, entry })))
        const scanned = activeAvoidEntries(p).filter((x) => x.condition.id === c.id && x.entry.keywords?.length && !x.entry.foods.length)
        const own = reasons.filter((r) => r.condition.id === c.id)
        return (
          <section key={c.id} className="card">
            <h2 className="with-icon"><Icon name={c.icon} /> {c.label}</h2>
            <p className="small muted">{c.blurb}</p>

            {ruleStatus.length > 0 && (
              <ul className="rule-status">
                {ruleStatus.map((s) => (
                  <li key={s.rule.id}>
                    <div className="summary-label">
                      <span>{s.rule.label}</span>
                      <span className={s.status === 'met' ? 'good-text' : 'warn-text'}>{s.servings.toFixed(1)} / {s.rule.min ?? s.rule.max} a week {s.status === 'met' && <Icon name="check" size={14} />}</span>
                    </div>
                    <Why evidence={s.rule.evidence} ids={s.rule.sources} convention={s.rule.convention}>{s.rule.why}</Why>
                  </li>
                ))}
              </ul>
            )}

            <details className="more inline">
              <summary>What this changes in your plan</summary>
              {own.length > 0 && (
                <>
                  <h3>Limits the plan must respect</h3>
                  {own.map((r) => <ClaimLine key={r.key} c={r.claim} />)}
                </>
              )}

              {removed.length > 0 && (
                <>
                  <h3>Removed from your plan</h3>
                  {[...new Set(removed.map((x) => x.entry))].map((entry, i) => (
                    <div key={i}>
                      <p className="small"><strong>{removed.filter((x) => x.entry === entry).map((x) => FOOD_BY_ID[x.f]?.name).join(', ')}</strong></p>
                      <ClaimLine c={entry.reason} />
                    </div>
                  ))}
                </>
              )}

              {scanned.length > 0 && (
                <>
                  <h3>Kept out of scanned products</h3>
                  {scanned.map(({ entry }, i) => (
                    <div key={i}>
                      <p className="small"><strong>Anything listing {entry.keywords!.slice(0, -1).join(', ')} or {entry.keywords!.at(-1)}</strong></p>
                      <ClaimLine c={entry.reason} />
                    </div>
                  ))}
                </>
              )}

              {c.helps.length > 0 && (
                <>
                  <h3>What the plan adds, and why</h3>
                  {c.helps.map((h) => <ClaimLine key={h.text} c={h} />)}
                </>
              )}

              {c.guidance.length > 0 && (
                <>
                  <h3>Also know</h3>
                  {c.guidance.map((g) => <ClaimLine key={g.text} c={g} />)}
                </>
              )}
              {c.suppressTips.length > 0 && <p className="muted small">Turned off for this condition: {c.suppressTips.map((t) => TIP_NAMES[t] ?? t).join(', ')}.</p>}
            </details>
          </section>
        )
      })}
    </>
  )
}

const TIP_NAMES: Record<string, string> = { fast: 'overnight-fasting tips', creatine: 'creatine', protein_spread: 'high-protein tips' }

// ── Rotation ─────────────────────────────────────────────

function Rotation({ rules, plants, proteinGroups }: { rules: RuleStatus[]; plants: string[]; proteinGroups: number }) {
  const order = { short: 0, over: 1, met: 2 }
  const sorted = [...rules].sort((a, b) => order[a.status] - order[b.status])
  const off = sorted.filter((s) => s.status !== 'met')
  const met = sorted.filter((s) => s.status === 'met')
  return (
    <>
      <section className="card hero">
        <h1>Food rotation</h1>
        <p className={`lead ${off.length ? 'warn-text' : 'good-text'}`}>
          {off.length ? `${plural(off.length, 'guideline')} to work on this week.` : 'Every food guideline is met this week.'}
        </p>
        <div className="target-grid three">
          <div><span className="big-number">{met.length}/{rules.length}</span><small>guidelines met</small></div>
          <div><span className="big-number">{plants.length}</span><small>of {PLANT_TARGET} plants</small></div>
          <div><span className="big-number">{proteinGroups}</span><small>protein sources (aim {PROTEIN_VARIETY_TARGET}+)</small></div>
        </div>
        <p className="muted small">
          How often to eat each kind of food, from dietary guidelines and research (plus any rules your conditions add). The planner aims for these and switches sources so no single food dominates.{' '}
          <Why ids={['dga_2025']} convention={`The target of ${PROTEIN_VARIETY_TARGET} different sources is this app’s choice.`}>
            Varying protein sources follows the Dietary Guidelines’ advice to eat protein from both animal and plant sources.
          </Why>
        </p>
      </section>

      {off.length > 0 && <h2 className="section-title">To work on</h2>}
      {off.map((s) => <RuleRow key={s.rule.id} s={s} />)}

      {met.length > 0 && (
        <details className="more">
          <summary>{plural(met.length, 'guideline')} met</summary>
          <div className="stack">{met.map((s) => <RuleRow key={s.rule.id} s={s} />)}</div>
        </details>
      )}

      <section className="card">
        <div className="row-between"><h2 className="with-icon"><Icon name="sprout" /> Plant variety</h2><span className="muted small">{plants.length} / {PLANT_TARGET}</span></div>
        <Bar value={plants.length} max={PLANT_TARGET} tone={plants.length >= PLANT_TARGET ? 'good' : 'warn'} label="Plant variety" />
        <p className="small">
          In the American Gut Project, people who ate 30+ different plants a week had more diverse gut bacteria than those eating 10 or fewer. Herbs and spices count too, so your real number is probably higher. <Why evidence="emerging" ids={PLANT_SOURCES} />
        </p>
        {plants.length > 0 && (
          <details className="more inline">
            <summary>Plants this week</summary>
            <div className="chips">{plants.map((pl) => <span key={pl} className="chip tone-muted">{pl}</span>)}</div>
          </details>
        )}
      </section>
    </>
  )
}

function RuleRow({ s }: { s: RuleStatus }) {
  const [open, setOpen] = useState(false)
  const target = s.min !== undefined ? `aim for ${s.min}+` : `at most ${s.max}`
  const tone = s.status === 'met' ? 'good' : s.status === 'over' ? 'bad' : 'warn'
  return (
    <section className={`card nutrient status-${s.status === 'met' ? 'ok' : s.status === 'over' ? 'low' : 'borderline'}`}>
      <button className="nutrient-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="nutrient-title">
          <strong>{s.rule.label}</strong>
          <span className="muted small">{s.servings.toFixed(1)} servings this week · {target}</span>
        </span>
        <span className="head-end">
          <span className={`status-word ${tone}-text`}>{s.status === 'met' ? 'Met' : s.status === 'over' ? 'Too much' : 'Short'}</span>
          <Icon name={open ? 'chevronDown' : 'chevronRight'} />
        </span>
      </button>
      <Bar value={s.servings} max={s.min ?? s.max ?? 1} tone={tone} label={s.rule.label} />
      {open && (
        <div className="nutrient-body">
          <div className="day-dots" aria-label="Days eaten">
            {DAYS.map((d, i) => <span key={d} className={s.days.includes(i) ? 'on' : ''} title={d}>{d[0]}</span>)}
          </div>
          <p className="small">{s.rule.why} <Why evidence={s.rule.evidence} ids={s.rule.sources} convention={s.rule.convention} /></p>
          {s.status === 'short' && s.rule.fixes && (
            <p className="small">Easy adds: {s.rule.fixes.map((id) => FOOD_BY_ID[id]?.name).filter(Boolean).join(', ')}.</p>
          )}
          {s.rule.domains.length > 0 && (
            <div className="chips">
              {s.rule.domains.map((id) => {
                const d = DOMAINS.find((x) => x.id === id)!
                return <Chip key={id} tone="muted"><Icon name={d.icon} size={13} /> {d.label}</Chip>
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ── Tips ─────────────────────────────────────────────────

const CATEGORY_ORDER: TipCategory[] = ['brain', 'ADHD', 'blood sugar', 'sleep & rhythm', 'hydration', 'absorption', 'gut', 'training', 'supplements']

function Tips({ tips }: { tips: BioTip[] }) {
  return (
    <>
      <section className="card hero">
        <h1>Tips for your week</h1>
        <p className="muted small">
          {tips.length ? `${plural(tips.length, 'habit')} picked for your profile and this week’s plan.` : 'No tips for this week’s plan.'} Anything unsafe for your conditions is left out, and the timing ones are already in your daily schedule.
        </p>
      </section>
      {CATEGORY_ORDER.map((cat) => {
        const list = tips.filter((t) => t.category === cat)
        if (!list.length) return null
        return (
          <section key={cat} className="card">
            <h2 className="cap">{cat}</h2>
            <ul className="tip-list">
              {list.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong>
                  <p className="small">{t.text} <Why evidence={t.evidence} ids={t.sources} /></p>
                  {t.because && <p className="why">For you: {t.because}</p>}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <p className="muted small disclaimer">Supplements can interact with medications. Check with your doctor or pharmacist before starting one, especially alongside ADHD medication.</p>
    </>
  )
}

// ── Sources ──────────────────────────────────────────────

const KIND_LABEL: Record<SourceKind, string> = {
  guideline: 'Clinical guidelines & official advice',
  'meta-analysis': 'Meta-analyses & systematic reviews',
  trial: 'Randomized & controlled trials',
  cohort: 'Observational studies',
  review: 'Narrative reviews',
  reference: 'Reference data',
  regulation: 'Regulations & drug labels',
}

function Sources() {
  const all = Object.values(SOURCES)
  return (
    <>
      <section className="card hero">
        <h1>Sources & methods</h1>
        <p className="small">Every health claim, target and limit in this app links to one of these {all.length} sources. Each study was checked against PubMed’s records before being cited. Tap <strong>Why?</strong> next to any claim to see its evidence and sources.</p>
        <h3>How to read the labels</h3>
        <ul className="explain">
          <li><EvidenceChip level="strong" /> Backed by randomized trials, meta-analyses or major clinical guidelines.</li>
          <li><EvidenceChip level="moderate" /> Supported by smaller trials or consistent observational research.</li>
          <li><EvidenceChip level="emerging" /> Early or mixed evidence: plausible and low-risk, but not settled.</li>
          <li><EvidenceChip level="limited" /> Commonly used, but research is sparse, small or inconclusive. Treat as unproven.</li>
          <li><span className="convention">App convention</span> The direction comes from the cited research, but the exact number (a weight, cap or threshold) is this app’s choice because no published figure exists.</li>
        </ul>
        <details className="more inline">
          <summary>Limits of this app</summary>
          <ul className="explain">
            <li>Food nutrient values are approximations from <Cite ids={['usda_fdc']} />; brands and preparation vary.</li>
            <li>Recipe “reward” ratings and the formulas that combine factors into scores are the app’s judgment, as marked.</li>
            <li>How a day’s calories are split between meals (about 25/30/30/15%) and the meal-time rules are the app’s conventions, built around the cited timing evidence.</li>
            <li>Prices are estimates, not health data.</li>
            <li>This is a planning tool, not medical advice. Conditions such as diabetes, kidney disease and MAOI use need individual care from your clinicians.</li>
          </ul>
        </details>
      </section>
      {(Object.keys(KIND_LABEL) as SourceKind[]).map((kind) => {
        const list = all.filter((x) => x.kind === kind).sort((x, y) => x.label.localeCompare(y.label))
        if (!list.length) return null
        return (
          <details key={kind} className="more card-details">
            <summary>{KIND_LABEL[kind]} <span className="muted">({list.length})</span></summary>
            <section className="card">
              <ul className="source-list">
                {list.map((x) => (
                  <li key={x.url + x.label}>
                    <a href={x.url} target="_blank" rel="noopener noreferrer" className="ext">{x.title}</a>
                    <span className="muted small">{x.where}, {x.year}</span>
                  </li>
                ))}
              </ul>
            </section>
          </details>
        )
      })}
    </>
  )
}
