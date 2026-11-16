import { useEffect, useState } from 'react'
import { CONTACT_EMAIL, DATA_CREDITS, LEGAL_DATE, LEGAL_DOCS, PRIVACY, PROVIDER, PROVIDER_PLACE, SOURCE_URL, TERMS, type LegalDoc } from '../data/legal'
import { splitLinks } from '../lib/legalText'
import { APP_VERSION, isNative } from '../lib/platform'
import { DisclaimerText } from './Disclaimer'
import { Icon } from './Icon'
import { Sheet } from './ui'

/** Text with its web and email addresses as links that open outside the app. */
export function Linked({ text }: { text: string }) {
  return <>{splitLinks(text).map((p, i) => (p.href ? <a key={i} className="ext" href={p.href} target="_blank" rel="noopener noreferrer">{p.text}</a> : p.text))}</>
}

export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <article className="legal-doc">
      <p className="muted small">Effective {LEGAL_DATE}{PROVIDER ? ` · ${PROVIDER}` : ''}</p>
      <p className="legal-summary"><Linked text={doc.summary} /></p>
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h3>{s.heading}</h3>
          {s.body.map((b, i) => (typeof b === 'string'
            ? <p key={i}><Linked text={b} /></p>
            : <ul key={i}>{b.list.map((li) => <li key={li}><Linked text={li} /></li>)}</ul>))}
        </section>
      ))}
    </article>
  )
}

export function LegalSheet({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  return <Sheet title={doc.title} onClose={onClose}><LegalDocView doc={doc} /></Sheet>
}

interface Licence { name: string; version: string; license: string; url: string; text: string }

/** Open-source packages and open data in the app, each with its licence. */
function LicencesSheet({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<Licence[] | null>(null)
  // Loaded only when opened: the licence texts are large.
  useEffect(() => { void import('../data/licenses.json').then((m) => setList(m.default as Licence[])) }, [])
  return (
    <Sheet title="Open-source licences and data" onClose={onClose}>
      <p className="muted small">The app is built with this open-source software and open data. Thank you to everyone who made them.</p>
      <h3>Data and engines</h3>
      <ul className="licence-list">
        {DATA_CREDITS.map((c) => (
          <li key={c.name}>
            <a className="ext" href={c.url} target="_blank" rel="noopener noreferrer"><strong>{c.name}</strong></a>
            <span className="muted small"> · {c.licence}</span>
            <div className="small">{c.note}</div>
          </li>
        ))}
      </ul>
      <h3>Software packages</h3>
      {!list ? <p className="muted small">Loading…</p> : (
        <ul className="licence-list">
          {list.map((p) => (
            <li key={`${p.name}@${p.version}`}>
              <details>
                <summary><strong>{p.name}</strong> <span className="muted small">{p.version} · {p.license}</span></summary>
                <p className="small"><a className="ext" href={p.url} target="_blank" rel="noopener noreferrer">{p.url}</a></p>
                {p.text ? <pre className="licence-text">{p.text}</pre> : <p className="muted small">Licensed under {p.license}; the package includes no separate licence file.</p>}
              </details>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}

type Open = LegalDoc['id'] | 'licences' | null

/** Profile → About & legal. */
export function AboutPage() {
  const [open, setOpen] = useState<Open>(null)
  const doc = LEGAL_DOCS.find((d) => d.id === open)
  return (
    <>
      <section className="card disclaimer-card"><DisclaimerText /></section>
      <section className="card">
        <h2>Legal</h2>
        <div className="pf-group legal-links">
          {LEGAL_DOCS.map((d) => (
            <button key={d.id} type="button" className="pf-row" onClick={() => setOpen(d.id)}>
              <span className="pf-row-text"><span className="pf-row-label">{d.title}</span></span>
              <Icon name="chevronRight" size={18} className="pf-row-chevron" />
            </button>
          ))}
          <button type="button" className="pf-row" onClick={() => setOpen('licences')}>
            <span className="pf-row-text"><span className="pf-row-label">Open-source licences and data</span></span>
            <Icon name="chevronRight" size={18} className="pf-row-chevron" />
          </button>
        </div>
      </section>
      <section className="card small stack tight">
        <h2>About</h2>
        <p>Health Tracker {APP_VERSION}{isNative ? ' for Android' : ''}{PROVIDER ? `, by ${PROVIDER}, ${PROVIDER_PLACE}` : ''}.</p>
        <p>
          Questions, privacy requests or a problem?{' '}
          {CONTACT_EMAIL
            ? <a className="ext" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            : <>Open an issue at <a className="ext" href={`${SOURCE_URL}/issues`} target="_blank" rel="noopener noreferrer">GitHub</a> (it’s public, so leave out health details).</>}
        </p>
        <p className="muted">Not affiliated with or endorsed by Anthropic, Google, Open Food Facts, the USDA, the NIH or any other organisation named in the app.</p>
      </section>
      {doc && <LegalSheet doc={doc} onClose={() => setOpen(null)} />}
      {open === 'licences' && <LicencesSheet onClose={() => setOpen(null)} />}
    </>
  )
}

/** "By continuing, you agree to the Terms of Service and Privacy Policy", with both readable in place. */
export function AgreeLine({ verb = 'continuing' }: { verb?: string }) {
  const [open, setOpen] = useState<LegalDoc | null>(null)
  return (
    <p className="muted small agree-line">
      By {verb}, you agree to the{' '}
      <button type="button" className="link" onClick={() => setOpen(TERMS)}>Terms of Service</button> and{' '}
      <button type="button" className="link" onClick={() => setOpen(PRIVACY)}>Privacy Policy</button>.
      {open && <LegalSheet doc={open} onClose={() => setOpen(null)} />}
    </p>
  )
}
