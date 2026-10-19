import { useState } from 'react'
import { PEPTIDES, type Peptide } from '../data/peptides'
import { GOALS, NOT_RECOMMENDED, SUPPLEMENTS, type Goal, type Supplement, type Use } from '../data/supplements'
import type { NutrientReport } from '../lib/analysis'
import { assessPeptide, assessSupplement, recommendedSupplements, relevantPeptides, type Assessment } from '../lib/supplements'
import type { AppState, Domain } from '../types'
import { Icon } from './Icon'
import { Chip, EvidenceChip, Why } from './ui'

type Mode = 'supplements' | 'peptides'

export function SupplementsView({ state, reports }: { state: AppState; reports: NutrientReport[] }) {
  const [mode, setMode] = useState<Mode>('supplements')
  return (
    <>
      <div className="segmented">
        <button className={mode === 'supplements' ? 'on' : ''} onClick={() => setMode('supplements')}>Supplements</button>
        <button className={mode === 'peptides' ? 'on' : ''} onClick={() => setMode('peptides')}>Peptides</button>
      </div>
      {mode === 'supplements' ? <Supplements state={state} reports={reports} /> : <Peptides state={state} />}
    </>
  )
}

// ── Supplements ──────────────────────────────────────────

function Supplements({ state, reports }: { state: AppState; reports: NutrientReport[] }) {
  const p = state.profile
  const [goal, setGoal] = useState<Goal | null>(null)
  const forYou = recommendedSupplements(p, reports)
  const browse = goal ? SUPPLEMENTS.filter((s) => s.uses.some((u) => u.goal === goal)) : []
  const notRec = NOT_RECOMMENDED.filter((n) => !goal || n.goal === goal)

  return (
    <>
      <section className="card hero">
        <h1>Supplements</h1>
        <p className="lead">{forYou.length ? `${forYou.length} suggested for you this week.` : 'Nothing specific needed right now.'}</p>
        <p className="muted small">
          Food comes first; supplements fill specific gaps. Each option shows the dose used in research; tap <strong>Why?</strong> for the evidence and sources. Anything unsafe for your conditions or medications is marked <strong>Not for you</strong> and never recommended. Set your medications in Profile so these checks are complete.
        </p>
        {p.meds.pregnant && <p className="warn-text small">You’re marked as pregnant or breastfeeding: check every supplement with your clinician.</p>}
      </section>

      <section className="card">
        <h2>Recommended for you</h2>
        <p className="muted small">Matched to your health conditions and this week’s nutrient gaps.</p>
        {forYou.length === 0 && <p className="muted small">Your plan covers your targets and you have no conditions that a supplement clearly helps. Browse by goal below.</p>}
      </section>
      {forYou.map((r) => <SupplementCard key={r.supplement.id} s={r.supplement} assessment={r.assessment} highlight={r.reasons} />)}

      <section className="card">
        <h2>Browse by goal</h2>
        <div className="chips">
          {GOALS.map((g) => (
            <button key={g.id} className={`chip goal-chip ${goal === g.id ? 'tone-accent' : ''}`} onClick={() => setGoal(goal === g.id ? null : g.id)} aria-pressed={goal === g.id}>
              <Icon name={g.icon} size={14} /> {g.label}
            </button>
          ))}
        </div>
        {!goal && <p className="muted small">Pick a goal to see every option, including ones that aren’t safe for you (marked).</p>}
      </section>
      {browse.map((s) => <SupplementCard key={s.id} s={s} assessment={assessSupplement(s, p)} highlight={s.uses.filter((u) => u.goal === goal)} />)}

      {notRec.length > 0 && (
        <section className="card">
          <h2>Popular but not recommended</h2>
          <ul className="tip-list">
            {notRec.map((n) => (
              <li key={n.id}>
                <div className="row-between"><strong>{n.name}</strong><Chip tone="bad">For {n.claim.toLowerCase()}</Chip></div>
                <p className="small">{n.why} <Why evidence={n.evidence} ids={n.sources} /></p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="muted small disclaimer">Supplements are not regulated like medicines, and products can differ from their labels. Choose third-party-tested brands, and tell your doctor and pharmacist what you take.</p>
    </>
  )
}

function SupplementCard({ s, assessment, highlight }: { s: Supplement; assessment: Assessment; highlight: Use[] }) {
  const [open, setOpen] = useState(false)
  const blocked = assessment.blocks.length > 0
  const others = s.uses.filter((u) => !highlight.includes(u))
  return (
    <section className={`card nutrient ${blocked ? 'status-low' : ''}`}>
      <button className="nutrient-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="nutrient-title">
          <strong>{s.name}</strong>
          <span className="muted small">{s.forms}</span>
        </span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} />
      </button>
      {blocked && (
        <div className="not-for-you">
          <strong>Not for you.</strong> {assessment.blocks.map((b) => <span key={b.text}>{b.text} <Why ids={b.sources} /> </span>)}
        </div>
      )}
      <ul className="effect-list">
        {highlight.map((u) => (
          <li key={u.text}>
            <span className="small">{u.text} <Why evidence={u.evidence} ids={u.sources} /></span>
          </li>
        ))}
      </ul>
      {open && (
        <div className="nutrient-body">
          <h3>Dose used in research</h3>
          <p className="small">{s.dose.text} <Why ids={s.dose.sources} /></p>
          {others.length > 0 && (
            <>
              <h3>Also studied for</h3>
              <ul className="effect-list">
                {others.map((u) => (
                  <li key={u.text}><span className="small">{u.text} <Why evidence={u.evidence} ids={u.sources} /></span></li>
                ))}
              </ul>
            </>
          )}
          {assessment.cautions.length > 0 && (
            <>
              <h3>Cautions</h3>
              <ul className="effect-list">
                {assessment.cautions.map((c) => <li key={c.text} className="small">{c.text} <Why ids={c.sources} /></li>)}
              </ul>
            </>
          )}
          {s.doesntHelp && (
            <>
              <h3>Doesn’t help with</h3>
              {s.doesntHelp.map((d) => <p key={d.text} className="small">{d.text} <Why ids={d.sources} /></p>)}
            </>
          )}
        </div>
      )}
      {!open && <button className="link small" onClick={() => setOpen(true)}>Dose, cautions & more</button>}
    </section>
  )
}

// ── Peptides ─────────────────────────────────────────────

const STATUS: Record<Peptide['status'], { label: string; tone: 'good' | 'accent' | 'bad' }> = {
  approved: { label: 'FDA-approved (prescription)', tone: 'good' },
  food: { label: 'Food supplement', tone: 'accent' },
  research: { label: 'Unapproved research chemical', tone: 'bad' },
}
const HUMAN: Record<Peptide['humanEvidence'], string> = {
  strong: 'Strong human trial evidence',
  limited: 'Limited human evidence',
  none: 'No controlled human trials',
}

function Peptides({ state }: { state: AppState }) {
  const p = state.profile
  const relevant = relevantPeptides(p)
  const groups: [Peptide['status'], string, string][] = [
    ['approved', 'Approved peptide medicines', 'Proven in large trials for specific conditions. Prescription only: talk to your doctor about whether one fits you.'],
    ['food', 'Food-based peptides', 'Digested like dietary protein; low risk.'],
    ['research', 'Commonly used “research peptides”', 'Widely sold online and in clinics, but not approved for human use. The FDA lists them as compounding substances that may present significant safety risks, human evidence is missing or minimal, and several are banned in tested sport. The app doesn’t give doses for these because no safe dose has been established.'],
  ]
  return (
    <>
      <section className="card hero">
        <h1>Peptides</h1>
        <p className="muted small">
          Peptides are short chains of amino acids. Some are proven prescription medicines; many popular ones are unapproved and untested in people. Here is what the evidence actually shows for the ones people commonly use. <Why ids={['fda_cat2', 'wada']} />
        </p>
        {relevant.length > 0 && (
          <p className="small">
            <strong>Relevant to your conditions:</strong> {relevant.map((x) => x.name).join(', ')}. These are prescription options to discuss with your doctor.
          </p>
        )}
      </section>
      {groups.map(([status, title, blurb]) => (
        <div key={status} className="stack">
          <section className="card"><h2>{title}</h2><p className="muted small">{blurb}</p></section>
          {PEPTIDES.filter((x) => x.status === status).map((x) => <PeptideCard key={x.id} x={x} assessment={assessPeptide(x, p)} relevant={relevant.includes(x)} />)}
        </div>
      ))}
    </>
  )
}

function PeptideCard({ x, assessment, relevant }: { x: Peptide; assessment: Assessment; relevant: boolean }) {
  const blocked = assessment.blocks.length > 0
  return (
    <section className={`card nutrient ${x.status === 'research' || blocked ? 'status-low' : relevant ? 'status-ok' : ''}`}>
      <div className="row-between">
        <span className="nutrient-title">
          <strong>{x.name}</strong>
          {x.aka && <span className="muted small">{x.aka}</span>}
        </span>
      </div>
      <div className="chips">
        <Chip tone={STATUS[x.status].tone}>{STATUS[x.status].label}</Chip>
        <Chip tone={x.humanEvidence === 'strong' ? 'good' : x.humanEvidence === 'limited' ? 'warn' : 'bad'}>{HUMAN[x.humanEvidence]}</Chip>
        {x.wada && <Chip tone="bad">Banned in sport (WADA)</Chip>}
        {relevant && <Chip tone="accent">Relevant to you</Chip>}
      </div>
      {blocked && (
        <div className="not-for-you">
          <strong>Not for you.</strong> {assessment.blocks.map((b) => <span key={b.text}>{b.text} <Why ids={b.sources} /> </span>)}
        </div>
      )}
      <p className="small"><strong>Used for:</strong> {x.usedFor}</p>
      <p className="small"><strong>Evidence:</strong> {x.evidence}</p>
      <p className="small"><strong>Risks:</strong> {x.risks} <Why evidence={x.humanEvidence === 'strong' ? 'strong' : 'limited'} ids={x.sources} /></p>
      {assessment.cautions.length > 0 && (
        <ul className="effect-list">
          {assessment.cautions.map((c) => <li key={c.text} className="small warn-text">{c.text} <Why ids={c.sources} /></li>)}
        </ul>
      )}
    </section>
  )
}

// ── Per brain/body area ──────────────────────────────────

/** Which supplement goals map onto each Brain & body area. */
const DOMAIN_GOALS: Record<Domain, Goal[]> = {
  memory: ['memory'],
  focus: ['focus'],
  mood: ['mood', 'stress'],
  immunity: ['immunity'],
  energy: ['energy', 'thyroid'],
  sleep: ['sleep'],
  bones: ['bones', 'muscle'],
  heart: ['heart', 'bloodPressure'],
}

const EVIDENCE_ORDER: Record<string, number> = { strong: 0, moderate: 1, emerging: 2, limited: 3 }

/** Every supplement and peptide used for one area, strongest evidence first, with safety checks. */
export function DomainOptions({ domain, label, state }: { domain: Domain; label: string; state: AppState }) {
  const p = state.profile
  const goals = DOMAIN_GOALS[domain]
  const matching = (s: Supplement) => s.uses.filter((u) => goals.includes(u.goal))
  const best = (s: Supplement) => Math.min(...matching(s).map((u) => EVIDENCE_ORDER[u.evidence]))
  const supps = SUPPLEMENTS.filter((s) => matching(s).length > 0).sort((a, b) => best(a) - best(b))
  const notRec = NOT_RECOMMENDED.filter((n) => goals.includes(n.goal))
  const peps = PEPTIDES.filter((x) => x.goals.some((g) => goals.includes(g)))
  return (
    <>
      <section className="card">
        <p className="muted small">
          Food comes first: see the nutrients for {label.toLowerCase()} above. These are options people use for this area, strongest evidence first. Ones rated <EvidenceChip level="limited" /> under <strong>Why?</strong> are popular but largely unproven. Anything unsafe for your conditions or medications is marked <strong>Not for you</strong>. Check every one with your doctor before starting.
        </p>
      </section>
      {supps.map((s) => <SupplementCard key={s.id} s={s} assessment={assessSupplement(s, p)} highlight={matching(s)} />)}
      {notRec.length > 0 && (
        <section className="card">
          <h3>Popular but not recommended</h3>
          <ul className="tip-list">
            {notRec.map((n) => (
              <li key={n.id}>
                <div className="row-between"><strong>{n.name}</strong><Chip tone="bad">For {n.claim.toLowerCase()}</Chip></div>
                <p className="small">{n.why} <Why evidence={n.evidence} ids={n.sources} /></p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {peps.length > 0 ? (
        <>
          <section className="card"><h3>Peptides used for {label.toLowerCase()}</h3><p className="muted small">Approved ones are prescription-only. Research peptides are unapproved, and no doses are given.</p></section>
          {peps.map((x) => <PeptideCard key={x.id} x={x} assessment={assessPeptide(x, p)} relevant={false} />)}
        </>
      ) : (
        <p className="muted small">No peptides with human evidence are used for this area.</p>
      )}
    </>
  )
}
