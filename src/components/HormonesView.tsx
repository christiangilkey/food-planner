import { useMemo } from 'react'
import type { WeekAnalysis } from '../lib/analysis'
import { hormoneSystems } from '../lib/hormones'
import type { AppState } from '../types'
import { Icon } from './Icon'
import { Why } from './ui'

/** Hormone regulation: what food, sleep, light and movement do to the main hormone systems. */
export function Hormones({ state, a }: { state: AppState; a: WeekAnalysis }) {
  const systems = useMemo(() => hormoneSystems(state, a), [state, a])
  const flagged = systems.filter((h) => h.stats.some((s) => s.tone === 'warn'))
  return (
    <>
      <section className="card hero">
        <h1>Hormones</h1>
        <p className={`lead ${flagged.length ? 'warn-text' : 'good-text'}`}>
          {flagged.length ? `Worth a look: ${flagged.map((h) => h.title.toLowerCase()).join(', ')}.` : 'Nothing in this week’s plan stands out.'}
        </p>
        <p className="muted small">
          How this week’s food, your sleep window and daily habits affect the hormones behind hunger, energy, stress, sleep, thyroid and reproductive health. Food can nudge hormones; it can’t replace testing or treatment for a hormone condition.
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
              {h.forYou.map((c) => <p key={c.text} className="claim">{c.text} <Why evidence={c.evidence} ids={c.sources} /></p>)}
            </>
          )}
          {h.levers.length > 0 && (
            <details className="more inline">
              <summary>{h.levers.length === 1 ? '1 thing that helps' : `${h.levers.length} things that help`}</summary>
              {h.levers.map((c) => <p key={c.text} className="claim">{c.text} <Why evidence={c.evidence} ids={c.sources} /></p>)}
            </details>
          )}
        </section>
      ))}
    </>
  )
}
