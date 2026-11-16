import { APP_NAME, LEGAL_DATE, LEGAL_DOCS, PROVIDER, type LegalDoc } from '../data/legal.ts'

/**
 * Turns the legal documents into links-in-text pieces (for the app) and into standalone web pages
 * (for privacy.html and friends, written by the build). No browser-only code, so the build can use it.
 */

export interface Piece { text: string; href?: string }

const LINK = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g

/** "See https://x.org/a." → ["See ", link "https://x.org/a", "."] */
export function splitLinks(text: string): Piece[] {
  const out: Piece[] = []
  let last = 0
  for (const m of text.matchAll(LINK)) {
    let found = m[0]
    // A full stop, comma or bracket after an address belongs to the sentence.
    const trail = found.match(/[.,;:)]+$/)?.[0] ?? ''
    found = found.slice(0, found.length - trail.length)
    const start = m.index ?? 0
    if (start > last) out.push({ text: text.slice(last, start) })
    out.push({ text: found, href: found.includes('@') && !found.startsWith('http') ? `mailto:${found}` : found })
    last = start + found.length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const linked = (s: string) => splitLinks(s).map((p) => (p.href ? `<a href="${esc(p.href)}" rel="noopener noreferrer">${esc(p.text)}</a>` : esc(p.text))).join('')

/** A complete, self-contained page for one document. */
export function legalPage(doc: LegalDoc): string {
  const others = LEGAL_DOCS.filter((d) => d.id !== doc.id).map((d) => `<a href="./${d.id}.html">${esc(d.title)}</a>`).join(' · ')
  const body = doc.sections.map((s) => `<h2>${esc(s.heading)}</h2>\n${s.body.map((b) => (typeof b === 'string' ? `<p>${linked(b)}</p>` : `<ul>${b.list.map((li) => `<li>${linked(li)}</li>`).join('')}</ul>`)).join('\n')}`).join('\n')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'">
<title>${esc(doc.title)} · ${esc(APP_NAME)}</title>
<style>
  :root { color-scheme: light dark; --ink: #1b1d1b; --muted: #5d625d; --bg: #fbfbf9; --accent: #1f6f4a; }
  @media (prefers-color-scheme: dark) { :root { --ink: #ecefeb; --muted: #a6aca5; --bg: #0f110f; --accent: #6fcf9b; } }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 720px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { font-size: 1.8rem; line-height: 1.2; margin: 0 0 4px; }
  h2 { font-size: 1.1rem; margin: 28px 0 6px; }
  .meta, nav { color: var(--muted); font-size: 0.92rem; }
  .summary { font-size: 1.05rem; }
  a { color: var(--accent); overflow-wrap: anywhere; }
  li { margin: 4px 0; }
</style>
</head>
<body>
<main>
<p class="meta">${esc(APP_NAME)}${PROVIDER ? ` · ${esc(PROVIDER)}` : ''}</p>
<h1>${esc(doc.title)}</h1>
<p class="meta">Effective ${esc(LEGAL_DATE)}</p>
<p class="summary">${linked(doc.summary)}</p>
${body}
<hr>
<nav>${others} · <a href="./">Open ${esc(APP_NAME)}</a></nav>
</main>
</body>
</html>
`
}
