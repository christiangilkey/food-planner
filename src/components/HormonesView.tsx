import { useMemo } from 'react'
import type { WeekAnalysis } from '../lib/analysis'
import { hormoneSystems } from '../lib/hormones'
import type { AppState } from '../types'
import { Icon } from './Icon'
import { Sourced } from './ui'

/** Hormone regulation: what food, sleep, light and movement do to the main hormone systems. */
export function Hormones({ state, a }: { state: AppState; a: WeekAnalysis }) {
  const systems = useMemo(() => hormoneSystems(state, a), [state, a])
  return (
    <>
      <section className="card hero">
        <h1>Hormone regulation</h1>
        <p className="muted small">
          How this week’s food, your sleep window and daily habits affect the hormones behind hunger, energy, stress, sleep, thyroid and reproductive health. Each lever is rated by evidence and linked to its source. Food can nudge hormones; it can’t replace testing or treatment for a hormone condition.
        </p>
      </section>
      {systems.map((h) => (
        <section key={h.id} className="card">
          <h2 className="with-icon"><Icon name={h.icon} /> {h.title}</h2>
          <p className="small muted">{h.what}</p>
          {h.stats.length > 0 && (
            <ul className="hormone-stats">
              {h.stats.map((s) => (
                <li key={s.label}>
                  <span className="muted small">{s.label}</span>
                  <strong className={s.tone === 'warn' ? 'warn-text' : s.tone === 'good' ? 'good-text' : ''}>{s.value}</strong>
                </li>
              ))}
            </ul>
          )}
          {h.forYou.length > 0 && (
            <>
              <h3>For you</h3>
              {h.forYou.map((c) => <p key={c.text} className="claim">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
            </>
          )}
          <h3>What helps</h3>
          {h.levers.map((c) => <p key={c.text} className="claim">{c.text} <Sourced evidence={c.evidence} ids={c.sources} /></p>)}
        </section>
      ))}
    </>
  )
}
