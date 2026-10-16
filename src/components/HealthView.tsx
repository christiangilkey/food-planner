import { useMemo, useState } from 'react'
import type { Claim } from '../data/conditions'
import { FOOD_BY_ID } from '../data/foods'
import { DOMAINS, SODIUM_SOURCES } from '../data/nutrients'
import { PLANT_SOURCES, PLANT_TARGET, PROTEIN_VARIETY_TARGET } from '../data/rotation'
import { SOURCES, type SourceKind } from '../data/sources'
import { analyzeWeek, type NutrientReport, type WeekAnalysis } from '../lib/analysis'
import { activeConditions, avoidedFoods, limitReasons, mergedLimits, planViolations } from '../lib/conditions'
import { DAYS } from '../lib/plan-utils'
import { analyzeRotation, type RuleStatus } from '../lib/rotation'
import { weeklyTips, type BioTip, type TipCategory } from '../lib/tips'
import type { AppState, Domain } from '../types'
import { Icon } from './Icon'
import { RecipeLink } from './RecipeViewer'
import { DomainOptions, SupplementsView } from './SupplementsView'
import { Bar, Chip, Cite, EvidenceChip, Sourced } from './ui'

type Section = 'brain' | 'conditions' | 'rotation' | 'biohacks' | 'supplements' | 'sources'

const fmt = (n: number, unit: string) => `${n >= 100 ? Math.round(n) : n >= 10 ? n.toFixed(0) : n.toFixed(1)} ${unit}`

function ClaimLine({ c }: { c: Claim }) {
  return <p className="claim">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>
}

export function HealthView({ state }: { state: AppState }) {
  const hasConditions = state.profile.conditions.length > 0
  const [section, setSection] = useState<Section>(hasConditions ? 'conditions' : 'brain')
  const analysis = useMemo(() => analyzeWeek(state), [state])
  const rotation = useMemo(() => analyzeRotation(state), [state])
  const tips = useMemo(() => weeklyTips(state, analysis.reports, rotation), [state, analysis, rotation])

  const tabs: [Section, string][] = [
    ['brain', 'Brain & body'],
    ...(hasConditions ? [['conditions', 'Conditions'] as [Section, string]] : []),
    ['rotation', 'Rotation'],
    ['biohacks', 'Biohacks'],
    ['supplements', 'Supplements & peptides'],
    ['sources', 'Sources'],
  ]

  if (!analysis.daysPlanned && section !== 'sources' && section !== 'supplements') {
    return (
      <section className="card">
        <h1>Health</h1>
        <p className="muted">Build a week on the Plan tab and the checks run automatically.</p>
      </section>
    )
  }

  return (
    <div className="stack">
      <div className="segmented section-tabs" role="tablist" aria-label="Health sections">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={section === id} className={section === id ? 'on' : ''} onClick={() => setSection(id)}>{label}</button>
        ))}
      </div>
      {section === 'brain' && <BrainBody state={state} a={analysis} />}
      {section === 'conditions' && <Conditions state={state} a={analysis} rules={rotation.rules} />}
      {section === 'rotation' && <Rotation rules={rotation.rules} plants={rotation.plants} proteinGroups={rotation.proteinGroups.length} />}
      {section === 'biohacks' && <Biohacks tips={tips} />}
      {section === 'supplements' && <SupplementsView state={state} reports={analysis.reports} />}
      {section === 'sources' && <Sources />}
      <p className="muted small disclaimer">
        Estimates from typical food values, not a diagnosis or medical advice. Absorption, medications and health conditions change what you actually need. If something keeps showing up low or you have symptoms, ask your doctor about a blood test (for example ferritin, vitamin D or B12) before starting high-dose supplements.
      </p>
    </div>
  )
}

// ── Brain & body ─────────────────────────────────────────

type DomainStatus = 'risk' | 'watch' | 'ok'

function domainStatus(domain: Domain, reports: NutrientReport[]): { status: DomainStatus; nutrients: NutrientReport[] } {
  const hits = reports.filter((r) => r.status !== 'ok' && r.info.effects.some((e) => e.domain === domain))
  const serious = hits.some(
    (r) => r.status === 'low' && !r.info.notFoodAlone && r.info.effects.some((e) => e.domain === domain && e.evidence !== 'emerging'),
  )
  return { status: serious ? 'risk' : hits.length ? 'watch' : 'ok', nutrients: hits }
}

function BrainBody({ state, a }: { state: AppState; a: WeekAnalysis }) {
  const [focus, setFocus] = useState<Domain | null>(null)
  const sorted = [...a.reports].sort((x, y) => x.pct - y.pct)
  const shown = focus ? sorted.filter((r) => r.info.effects.some((e) => e.domain === focus)) : sorted

  return (
    <>
      <section className="card hero">
        <h1>Brain & body check</h1>
        <p className="muted small">
          Which areas this week’s plan could shortchange: the daily average of your {a.daysPlanned}-day plan against the Dietary Reference Intakes for a {state.profile.age}-year-old {state.profile.sex}
          {state.profile.conditions.includes('menopause') ? ', adjusted for menopause stage' : ''}. Tap an area to see the nutrients behind it, plus supplements and peptides people use for it. Food values come from <Cite ids={['usda_fdc']} />.
        </p>
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

      {focus && <DomainOptions domain={focus} label={DOMAINS.find((d) => d.id === focus)!.label} state={state} />}
      {focus && (
        <p className="muted small">
          Showing nutrients that affect <strong>{DOMAINS.find((d) => d.id === focus)?.label.toLowerCase()}</strong>.{' '}
          <button className="link" onClick={() => setFocus(null)}>Show all</button>
        </p>
      )}
      {shown.map((r) => <NutrientRow key={r.info.key} r={r} focus={focus} defaultOpen={r.status === 'low'} />)}

      {!focus && (
        <section className="card">
          <div className="summary-label"><strong>Sodium</strong><span>{Math.round(a.sodiumPerDay)} / {a.sodiumLimit} mg a day</span></div>
          <Bar value={a.sodiumPerDay} max={a.sodiumLimit} tone={a.sodiumPerDay > a.sodiumLimit ? 'bad' : 'good'} label="Sodium" />
          <p className="small">
            {a.sodiumLimit < 2300 ? 'Your goal is 1,500 mg because of high blood pressure; no day may go over 2,300 mg.' : 'The chronic-disease risk-reduction intake is 2,300 mg a day.'}{' '}
            <Cite ids={a.sodiumLimit < 2300 ? ['acc_htn', 'aha_sodium'] : SODIUM_SOURCES} />
          </p>
          <div className="summary-label"><strong>Saturated fat</strong><span>{a.satFatPct.toFixed(1)}% of calories</span></div>
          <p className="small muted">Under 10% for most people; 5–6% if you need to lower LDL. <Cite ids={['sacks_fat', 'eckel']} /></p>
          <div className="summary-label"><strong>Added sugar</strong><span>{a.addedSugarPct.toFixed(1)}% of calories</span></div>
          <p className="small muted">The ADA advises minimizing added sugar; the 2025–2030 Dietary Guidelines advise avoiding highly processed sugary foods. <Cite ids={['ada_5', 'dga_2025']} /></p>
        </section>
      )}
    </>
  )
}

function NutrientRow({ r, focus, defaultOpen }: { r: NutrientReport; focus: Domain | null; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen || r.nearUpper)
  const tone = r.status === 'low' ? 'bad' : r.status === 'borderline' ? 'warn' : 'good'
  const effects = focus ? r.info.effects.filter((e) => e.domain === focus) : r.info.effects
  return (
    <section className={`card nutrient status-${r.status}`}>
      <button className="nutrient-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="nutrient-title">
          <strong>{r.info.label}</strong>
          <span className="muted small">{fmt(r.perDay, r.info.unit)} of {fmt(r.target, r.info.unit)} · {Math.round(r.pct * 100)}%</span>
        </span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} />
      </button>
      <Bar value={r.perDay} max={r.target} tone={tone} label={r.info.label} />
      <div className="chips">
        {r.info.effects.map((e) => {
          const d = DOMAINS.find((x) => x.id === e.domain)!
          return <span key={e.domain} className="chip tone-muted with-icon" title={e.what}><Icon name={d.icon} size={13} /> {d.label}</span>
        })}
      </div>
      {open && (
        <div className="nutrient-body">
          <p className="small muted">Daily target {fmt(r.target, r.info.unit)}{r.upperLimit ? `, upper limit ${fmt(r.upperLimit, r.info.unit)}` : ''}. <Cite ids={r.info.targetSources} /></p>
          {r.nearUpper && r.upperLimit && (
            <p className="warn-text small">
              Close to or above the safe upper limit of {fmt(r.upperLimit, r.info.unit)} a day. This usually comes from fortified foods or supplements. Consider smaller portions of fortified cereal, and check any multivitamin you take. <Cite ids={r.info.targetSources} />
            </p>
          )}
          <h3>{r.status === 'ok' ? 'Why it matters' : 'What a shortfall can do'}</h3>
          <ul className="effect-list">
            {effects.map((e) => {
              const d = DOMAINS.find((x) => x.id === e.domain)!
              return (
                <li key={e.domain}>
                  <span className="effect-head"><strong className="with-icon"><Icon name={d.icon} size={16} /> {d.label}</strong> <Sourced evidence={e.evidence} ids={e.sources} /></span>
                  <span className="small">{e.what}</span>
                </li>
              )
            })}
          </ul>
          {r.status !== 'ok' && <p className="small">{r.info.issues} <Cite ids={r.info.targetSources} /></p>}
          {r.info.note && <p className="note">{r.info.note.text} <Cite ids={r.info.note.sources} /></p>}

          <h3>Absorb more of it</h3>
          <ul className="effect-list">
            {r.info.absorption.map((t) => (
              <li key={t.text}>
                <span className="small">{t.text}</span>
                <Sourced evidence={t.evidence} ids={t.sources} />
              </li>
            ))}
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
              <p className="muted small">Nutrient values approximated from <Cite ids={['usda_fdc']} />. Foods your conditions exclude are left out.</p>
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
                  <p className="muted small">Swap one of these into your week from the Plan tab.</p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

// ── Conditions ───────────────────────────────────────────

function Conditions({ state, a, rules }: { state: AppState; a: WeekAnalysis; rules: RuleStatus[] }) {
  const p = state.profile
  const conditions = activeConditions(p)
  const violations = planViolations(p, state.plan)
  const limits = mergedLimits(p)
  const avoided = avoidedFoods(p)
  const reasons = limitReasons(p)

  return (
    <>
      <section className={`card ${violations.length ? 'banner' : 'hero'}`}>
        <h1>Your conditions</h1>
        {violations.length === 0 ? (
          <p className="good-text with-icon"><Icon name="check" /> This week’s plan is within every limit set by your conditions.</p>
        ) : (
          <>
            <p className="warn-text">This week breaks {violations.length} rule{violations.length > 1 ? 's' : ''}. Make a new week on the Plan tab.</p>
            <ul className="explain">{violations.slice(0, 6).map((v, i) => <li key={i}>{v.day !== undefined ? `${DAYS[v.day]}: ` : ''}{v.message}</li>)}</ul>
          </>
        )}
        <ul className="explain">
          {limits.sodiumMaxMg && <li>Sodium: every day under {limits.sodiumMaxMg} mg, aiming for {limits.sodiumGoalMg} mg. This week averages {Math.round(a.sodiumPerDay)} mg.</li>}
          {limits.satFatMaxPct && <li>Saturated fat: under {limits.satFatMaxPct}% of calories. This week: {a.satFatPct.toFixed(1)}%.</li>}
          {limits.addedSugarMaxPct && <li>Added sugar: under {limits.addedSugarMaxPct}% of calories. This week: {a.addedSugarPct.toFixed(1)}%.</li>}
          {limits.noCrashMeals && <li>No meals likely to spike blood sugar.</li>}
          {limits.lastFoodBeforeBedMin && <li>No food in the {limits.lastFoodBeforeBedMin / 60} hours before bed.</li>}
          {limits.eggsMaxWeek && <li>At most {limits.eggsMaxWeek} eggs a week.</li>}
          {limits.proteinMaxPerKg && <li>Protein capped at {limits.proteinMaxPerKg} g per kg.</li>}
          {avoided.size > 0 && <li>Removed foods: {[...avoided.keys()].map((f) => FOOD_BY_ID[f]?.name ?? f).join(', ')}.</li>}
        </ul>
      </section>

      {conditions.map((c) => {
        const ruleStatus = c.rules.map((r) => rules.find((x) => x.rule.id === r.id)).filter((x): x is RuleStatus => !!x)
        const removed = c.avoid.flatMap((entry) => entry.foods.filter((f) => avoided.get(f)?.some((x) => x.condition.id === c.id && x.entry === entry)).map((f) => ({ f, entry })))
        return (
          <section key={c.id} className="card">
            <h2 className="with-icon"><Icon name={c.icon} /> {c.label}</h2>
            <p className="small muted">{c.blurb}</p>

            {reasons.filter((r) => r.condition.id === c.id).length > 0 && (
              <>
                <h3>Limits the plan must respect</h3>
                {reasons.filter((r) => r.condition.id === c.id).map((r) => <ClaimLine key={r.key} c={r.claim} />)}
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

            {(ruleStatus.length > 0 || c.helps.length > 0) && <h3>What the plan adds, and why</h3>}
            {ruleStatus.map((s) => (
              <div key={s.rule.id} className="claim">
                <div className="summary-label">
                  <span>{s.rule.label}</span>
                  <span className={s.status === 'met' ? 'good-text' : 'warn-text'}>{s.servings.toFixed(1)} / {s.rule.min ?? s.rule.max} a week {s.status === 'met' && <Icon name="check" size={14} />}</span>
                </div>
                <span className="small">{s.rule.why}</span> <Sourced evidence={s.rule.evidence} ids={s.rule.sources} convention={s.rule.convention} />
              </div>
            ))}
            {c.helps.map((h) => <ClaimLine key={h.text} c={h} />)}

            {c.guidance.length > 0 && (
              <>
                <h3>Also know</h3>
                {c.guidance.map((g) => <ClaimLine key={g.text} c={g} />)}
              </>
            )}
            {c.suppressTips.length > 0 && <p className="muted small">Turned off for this condition: {c.suppressTips.map((t) => TIP_NAMES[t] ?? t).join(', ')}.</p>}
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
  return (
    <>
      <section className="card hero">
        <h1>Weekly food rotation</h1>
        <p className="muted small">
          How often to eat each kind of food, from dietary guidelines and research (plus any rules your conditions add). The planner aims for these when it builds your week, and switches sources so no single food dominates.
        </p>
        <div className="target-grid three">
          <div><span className="big-number">{rules.filter((r) => r.status === 'met').length}/{rules.length}</span><small>guidelines met</small></div>
          <div><span className="big-number">{plants.length}</span><small>of {PLANT_TARGET} plants</small></div>
          <div><span className="big-number">{proteinGroups}</span><small>protein sources (aim {PROTEIN_VARIETY_TARGET}+)</small></div>
        </div>
        <p className="muted small">Varying protein sources follows the Dietary Guidelines’ advice to eat protein from both animal and plant sources. <Cite ids={['dga_2025']} convention={`The target of ${PROTEIN_VARIETY_TARGET} different sources is this app’s choice.`} /></p>
      </section>

      {sorted.map((s) => <RuleRow key={s.rule.id} s={s} />)}

      <section className="card">
        <div className="row-between"><h2 className="with-icon"><Icon name="sprout" /> Plant variety</h2><span className="muted small">{plants.length} / {PLANT_TARGET}</span></div>
        <Bar value={plants.length} max={PLANT_TARGET} tone={plants.length >= PLANT_TARGET ? 'good' : 'warn'} label="Plant variety" />
        <div className="chips">{plants.map((pl) => <span key={pl} className="chip tone-muted">{pl}</span>)}</div>
        <p className="small">
          In the American Gut Project, people who ate 30+ different plants a week had more diverse gut bacteria than those eating 10 or fewer. Herbs and spices count too, so your real number is probably higher. <Sourced evidence="emerging" ids={PLANT_SOURCES} />
        </p>
      </section>
    </>
  )
}

function RuleRow({ s }: { s: RuleStatus }) {
  const [open, setOpen] = useState(s.status !== 'met')
  const target = s.min !== undefined ? `aim for ${s.min}+` : `at most ${s.max}`
  const tone = s.status === 'met' ? 'good' : s.status === 'over' ? 'bad' : 'warn'
  return (
    <section className={`card nutrient status-${s.status === 'met' ? 'ok' : s.status === 'over' ? 'low' : 'borderline'}`}>
      <button className="nutrient-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="nutrient-title">
          <strong>{s.rule.label}</strong>
          <span className="muted small">
            {s.servings.toFixed(1)} servings this week · {target}
            {s.status === 'met' ? ' · met' : s.status === 'over' ? ' · over' : ' · short'}
          </span>
        </span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} />
      </button>
      <Bar value={s.servings} max={s.min ?? s.max ?? 1} tone={tone} label={s.rule.label} />
      <div className="day-dots" aria-label="Days eaten">
        {DAYS.map((d, i) => <span key={d} className={s.days.includes(i) ? 'on' : ''} title={d}>{d[0]}</span>)}
      </div>
      {open && (
        <div className="nutrient-body">
          <p className="small">{s.rule.why} <Sourced evidence={s.rule.evidence} ids={s.rule.sources} convention={s.rule.convention} /></p>
          {s.rule.convention && <p className="muted small">{s.rule.convention}</p>}
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

// ── Biohacks ─────────────────────────────────────────────

const CATEGORY_ORDER: TipCategory[] = ['brain', 'ADHD', 'blood sugar', 'sleep & rhythm', 'hydration', 'absorption', 'gut', 'training', 'supplements']

function Biohacks({ tips }: { tips: BioTip[] }) {
  return (
    <>
      <section className="card hero">
        <h1>Biohacks for your week</h1>
        <p className="muted small">
          Habits and tweaks picked for your profile and this week’s plan, each with its evidence level and sources. Anything unsafe for your conditions is left out. The timing ones are built into your daily schedule on the Plan tab.
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
                  <div className="row-between"><strong>{t.title}</strong><EvidenceChip level={t.evidence} /></div>
                  <p className="small">{t.text} <Cite ids={t.sources} /></p>
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
        <p className="small">Every health claim, target and limit in this app links to one of these {all.length} sources. Each study was checked against PubMed’s records before being cited.</p>
        <h3>How to read the labels</h3>
        <ul className="explain">
          <li><EvidenceChip level="strong" /> Backed by randomized trials, meta-analyses or major clinical guidelines.</li>
          <li><EvidenceChip level="moderate" /> Supported by smaller trials or consistent observational research.</li>
          <li><EvidenceChip level="emerging" /> Early or mixed evidence: plausible and low-risk, but not settled.</li>
          <li><EvidenceChip level="limited" /> Commonly used, but research is sparse, small or inconclusive. Treat as unproven.</li>
          <li><span className="convention">App convention</span> The direction comes from the cited research, but the exact number (a weight, cap or threshold) is this app’s choice because no published figure exists.</li>
        </ul>
        <h3>Limits of this app</h3>
        <ul className="explain">
          <li>Food nutrient values are approximations from <Cite ids={['usda_fdc']} />; brands and preparation vary.</li>
          <li>Recipe “reward” ratings and the formulas that combine factors into scores are the app’s judgment, as marked.</li>
          <li>How a day’s calories are split between meals (about 25/30/30/15%) and the meal-time rules are the app’s conventions, built around the cited timing evidence.</li>
          <li>Prices are estimates, not health data.</li>
          <li>This is a planning tool, not medical advice. Conditions such as diabetes, kidney disease and MAOI use need individual care from your clinicians.</li>
        </ul>
      </section>
      {(Object.keys(KIND_LABEL) as SourceKind[]).map((kind) => {
        const list = all.filter((x) => x.kind === kind).sort((x, y) => x.label.localeCompare(y.label))
        if (!list.length) return null
        return (
          <section key={kind} className="card">
            <h2>{KIND_LABEL[kind]}</h2>
            <ul className="source-list">
              {list.map((x) => (
                <li key={x.url + x.label}>
                  <a href={x.url} target="_blank" rel="noopener noreferrer" className="ext">{x.title}</a>
                  <span className="muted small">{x.where}, {x.year}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
