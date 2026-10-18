import { useEffect, useState, type ReactNode } from 'react'
import { buildTaskLists, exportToGoogleTasks, getTasksToken, toChecklistText, type ExportOptions, type TaskListDraft } from '../lib/googleTasks'
import { exportToOnyx, onyxHealth } from '../lib/onyx'
import { buildSleepTaskLists } from '../lib/sleep'
import type { AppState, ExportTarget } from '../types'
import { Icon } from './Icon'
import { Sheet, type ViewProps } from './ui'

const ORIGIN = typeof location !== 'undefined' ? location.origin : 'https://christiangilkey.github.io'

const TARGET_NAME: Record<ExportTarget, string> = { google: 'Google Tasks', onyx: 'Onyx' }

/** "Export to Google Tasks" or "Export to Onyx", following the setting. */
export const exportLabel = (s: AppState) => `Export to ${TARGET_NAME[s.exportTarget]}`

/** Send the week to Google Tasks or Onyx (or copy it as a checklist). */
export function ExportSheet({ state, update, onClose }: ViewProps & { onClose: () => void }) {
  const [opts, setOpts] = useState<ExportOptions>({ meals: true, shopping: true, prep: true })
  const lists = buildTaskLists(state, opts)
  const toggle = (k: keyof ExportOptions) => setOpts((o) => ({ ...o, [k]: !o[k] }))
  const onyx = state.exportTarget === 'onyx'
  return (
    <Sheet title={exportLabel(state)} onClose={onClose}>
      <p className="muted small">
        {onyx
          ? 'Meals become time blocks on your Onyx calendar at their planned times; groceries and prep become tasks. Everything is tagged “food-planner”.'
          : 'Creates a task list for each part you choose, with meals due on their day.'}{' '}
        It goes straight from this device to {onyx ? 'your computer' : 'your Google account'}; nothing passes through any other server.
      </p>
      <div className="check-grid">
        {([['meals', 'Meal plan', onyx ? 'One block per meal at its time, with ingredients and steps' : 'One task per meal, due that day, with ingredients'], ['shopping', 'Shopping list', 'One task per item'], ['prep', 'Prep day', 'Batch cooking, due the Sunday before']] as [keyof ExportOptions, string, string][]).map(([k, label, detail]) => (
          <label key={k} className={`check-card ${opts[k] ? 'on' : ''}`}>
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} />
            <span><strong>{label}</strong><small className="muted"> {detail}</small></span>
          </label>
        ))}
      </div>
      <ExportPanel state={state} update={update} lists={lists} />
    </Sheet>
  )
}

/** Send the next week of the sleep routine to Google Tasks or Onyx. */
export function SleepExportSheet({ state, update, onClose }: ViewProps & { onClose: () => void }) {
  const lists = buildSleepTaskLists(state.profile)
  const onyx = state.exportTarget === 'onyx'
  return (
    <Sheet title={`${exportLabel(state)}: sleep schedule`} onClose={onClose}>
      <p className="muted small">
        {onyx
          ? 'Adds your wind-down routine for the next 7 nights as blocks on your Onyx calendar, with your sleep itself as one block each night, tagged “sleep”.'
          : 'Adds your wind-down routine for the next 7 nights as tasks due on their day: caffeine cutoff, last food, screens away, lights out and morning light.'}
      </p>
      <ExportPanel state={state} update={update} lists={lists}>
        <ul className="explain small">
          {lists[0].tasks.slice(0, Math.ceil(lists[0].tasks.length / 7)).map((t) => <li key={t.title}>{t.title.replace(/^[A-Z][a-z]{2} /, '')}</li>)}
        </ul>
      </ExportPanel>
    </Sheet>
  )
}

/** The part both export sheets share: where it goes, the send and copy buttons, and progress. */
function ExportPanel({ state, update, lists, children }: ViewProps & { lists: TaskListDraft[]; children?: ReactNode }) {
  const [clientId, setClientId] = useState(state.googleClientId)
  const [status, setStatus] = useState<{ kind: 'idle' | 'working' | 'done' | 'error'; text?: string }>({ kind: 'idle' })
  const [showSetup, setShowSetup] = useState(!state.googleClientId)
  const count = lists.reduce((s, l) => s + l.tasks.length, 0)
  const onyx = state.exportTarget === 'onyx'

  const sendGoogle = async () => {
    const id = clientId.trim()
    if (!id.endsWith('.apps.googleusercontent.com')) {
      setStatus({ kind: 'error', text: 'That doesn’t look like a Google OAuth client ID (it ends in .apps.googleusercontent.com).' })
      return
    }
    update((s) => ({ ...s, googleClientId: id }))
    setStatus({ kind: 'working', text: 'Waiting for Google sign-in…' })
    const token = await getTasksToken(id)
    const n = await exportToGoogleTasks(token, lists, (done, total) => setStatus({ kind: 'working', text: `Adding tasks… ${done} of ${total}` }))
    setStatus({ kind: 'done', text: `Added ${n} tasks in ${lists.length} list${lists.length > 1 ? 's' : ''}.` })
  }
  const sendOnyx = async () => {
    setStatus({ kind: 'working', text: 'Connecting to Onyx…' })
    const n = await exportToOnyx(state.onyx, lists, (done, total) => setStatus({ kind: 'working', text: `Adding to Onyx… ${done} of ${total}` }))
    setStatus({ kind: 'done', text: `Added ${n} items to Onyx.` })
  }
  const send = async () => {
    try {
      await (onyx ? sendOnyx() : sendGoogle())
    } catch (e) {
      setStatus({ kind: 'error', text: e instanceof Error ? e.message : 'Export failed.' })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toChecklistText(lists))
      setStatus({ kind: 'done', text: 'Copied as a checklist. Paste it into any notes or tasks app.' })
    } catch {
      setStatus({ kind: 'error', text: 'Couldn’t access the clipboard.' })
    }
  }

  return (
    <>
      {children}
      <p className="muted small">{count} {onyx ? 'items' : 'tasks'} in {lists.length} list{lists.length === 1 ? '' : 's'}. Sending to <strong>{onyx ? 'Onyx' : 'Google Tasks'}</strong>; change this under Profile → Exports.</p>

      {onyx ? (
        <OnyxFields state={state} update={update} />
      ) : (
        <>
          <label className="field">
            <span>Google OAuth client ID</span>
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="1234…apps.googleusercontent.com" spellCheck={false} autoComplete="off" />
          </label>
          <button className="link small" onClick={() => setShowSetup(!showSetup)}>{showSetup ? 'Hide' : 'Show'} one-time setup steps</button>
          {showSetup && (
            <ol className="explain setup-steps">
              <li>Open <a className="ext" href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> and create a project (free; no billing needed).</li>
              <li>In <a className="ext" href="https://console.cloud.google.com/apis/library/tasks.googleapis.com" target="_blank" rel="noopener noreferrer">the Google Tasks API page</a>, click <strong>Enable</strong>.</li>
              <li>Under <strong>Google Auth Platform → Audience</strong>, choose <strong>External</strong>, then add your Gmail address as a <strong>test user</strong>.</li>
              <li>Under <strong>Clients</strong>, create an OAuth client of type <strong>Web application</strong>. Add <code>{ORIGIN}</code> under <strong>Authorized JavaScript origins</strong>.</li>
              <li>Copy the client ID (ends in <code>.apps.googleusercontent.com</code>) and paste it above. It isn’t a secret.</li>
            </ol>
          )}
        </>
      )}

      <div className="add-row">
        <button className="primary with-icon" onClick={send} disabled={!count || status.kind === 'working' || (onyx && !state.onyx.token.trim())}><Icon name="check" /> {exportLabel(state)}</button>
        <button className="secondary" onClick={copy} disabled={!count}>Copy as checklist</button>
      </div>
      {status.text && (
        <p className={`small ${status.kind === 'error' ? 'warn-text' : status.kind === 'done' ? 'good-text' : 'muted'}`} role="status">
          {status.text}{' '}
          {status.kind === 'done' && status.text.startsWith('Added') && !onyx && <a className="ext" href="https://tasks.google.com/" target="_blank" rel="noopener noreferrer">Open Google Tasks</a>}
        </p>
      )}
    </>
  )
}

/** Onyx Calendar's address and token, with a live check that it answers. */
export function OnyxFields({ state, update }: ViewProps) {
  const set = (patch: Partial<AppState['onyx']>) => update((s) => ({ ...s, onyx: { ...s.onyx, ...patch } }))
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [version, setVersion] = useState('')
  const url = state.onyx.url
  useEffect(() => {
    let live = true
    setHealth('checking')
    const t = setTimeout(() => onyxHealth({ url, token: '' }).then((h) => {
      if (!live) return
      setHealth(h.ok ? 'ok' : 'down')
      setVersion(h.version ?? '')
    }), 400)
    return () => { live = false; clearTimeout(t) }
  }, [url])
  return (
    <div className="stack tight">
      <label className="field">
        <span>Onyx address</span>
        <input value={state.onyx.url} onChange={(e) => set({ url: e.target.value })} placeholder="http://127.0.0.1:4747" spellCheck={false} autoComplete="off" inputMode="url" />
      </label>
      <label className="field">
        <span>Onyx token</span>
        <input value={state.onyx.token} onChange={(e) => set({ token: e.target.value })} placeholder="From Onyx Calendar → Settings → MCP server" spellCheck={false} autoComplete="off" type="password" />
      </label>
      <p className={`small ${health === 'ok' ? 'good-text' : health === 'down' ? 'warn-text' : 'muted'}`} role="status">
        {health === 'checking' && 'Looking for Onyx…'}
        {health === 'ok' && `Onyx Calendar ${version} is running at this address.`}
        {health === 'down' && 'Onyx isn’t answering at this address. Start Onyx Calendar on that computer; from a phone, use the PC’s network address and turn on “Reachable from your network” in Onyx’s MCP settings.'}
      </p>
      <p className="muted small">The token is stored only on this device. Your browser may ask to allow this page to reach devices on your local network.</p>
    </div>
  )
}
