import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { SOURCES, type SourceId } from '../data/sources'
import { Icon } from './Icon'
import type { AppState, Evidence } from '../types'
import type { Update } from '../lib/store'

export interface ViewProps {
  state: AppState
  update: Update
}

export function Bar({ value, max, tone = 'accent', label }: { value: number; max: number; tone?: 'accent' | 'good' | 'warn' | 'bad'; label?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="bar" role="meter" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={Math.round(max)} aria-label={label}>
      <div className={`bar-fill tone-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Chip({ children, tone }: { children: ReactNode; tone?: 'good' | 'warn' | 'bad' | 'muted' | 'accent' }) {
  return <span className={`chip ${tone ? `tone-${tone}` : ''}`}>{children}</span>
}

/** Score 0–100 rendered as a small labeled pill. */
export function Score({ label, value, title }: { label: string; value: number; title?: string }) {
  const tone = value >= 70 ? 'good' : value >= 45 ? 'muted' : 'warn'
  return (
    <span className={`chip tone-${tone}`} title={title}>
      {label} {value}
    </span>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <motion.div className="sheet-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      <motion.div
        className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      >
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </motion.div>
    </motion.div>
  )
}

export function NumberField({
  label, value, onChange, min, max, step = 1, suffix,
}: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  // Keep a local draft so the field can be empty mid-edit without pushing NaN into app state.
  const [draft, setDraft] = useState(String(value))
  const [focused, setFocused] = useState(false)
  const shown = focused ? draft : String(value)
  const commit = (raw: string) => {
    let n = Number(raw)
    if (raw.trim() === '' || !Number.isFinite(n)) return
    if (min !== undefined) n = Math.max(min, n)
    if (max !== undefined) n = Math.min(max, n)
    onChange(n)
  }
  return (
    <label className="field">
      <span>{label}</span>
      <span className="input-wrap">
        <input
          type="number"
          inputMode="decimal"
          value={shown}
          min={min}
          max={max}
          step={step}
          onFocus={() => { setDraft(String(value)); setFocused(true) }}
          onChange={(e) => { setDraft(e.target.value); commit(e.target.value) }}
          onBlur={() => setFocused(false)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </span>
    </label>
  )
}

const EVIDENCE_TEXT: Record<Evidence, { label: string; tone: 'good' | 'accent' | 'muted'; title: string }> = {
  strong: { label: 'Strong evidence', tone: 'good', title: 'Backed by randomized trials or consistent large studies' },
  moderate: { label: 'Moderate evidence', tone: 'accent', title: 'Supported by smaller trials or consistent observational studies' },
  emerging: { label: 'Emerging', tone: 'muted', title: 'Early or mixed research: promising, low risk, not settled' },
}

export function EvidenceChip({ level }: { level: Evidence }) {
  const e = EVIDENCE_TEXT[level]
  return <span className={`chip tone-${e.tone}`} title={e.title}>{e.label}</span>
}

/** Clickable source links. Each opens the paper, guideline or fact sheet in a new tab. */
export function Cite({ ids, convention }: { ids: SourceId[]; convention?: string }) {
  if (!ids.length && !convention) return null
  return (
    <span className="cite">
      {ids.map((id) => {
        const s = SOURCES[id]
        return (
          <a key={id} href={s.url} target="_blank" rel="noopener noreferrer" title={`${s.title} — ${s.where}, ${s.year} (${s.kind})`}>
            {s.label}
          </a>
        )
      })}
      {convention && <span className="convention" title={convention}>App convention</span>}
    </span>
  )
}

/** A claim with its evidence level and sources on one line. */
export function Sourced({ evidence, ids, convention }: { evidence?: Evidence; ids: SourceId[]; convention?: string }) {
  return (
    <span className="sourced">
      {evidence && <EvidenceChip level={evidence} />}
      <Cite ids={ids} convention={convention} />
    </span>
  )
}
