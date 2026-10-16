import { useState } from 'react'
import { buildTaskLists, exportToGoogleTasks, getTasksToken, toChecklistText, type ExportOptions } from '../lib/googleTasks'
import { Icon } from './Icon'
import { Sheet, type ViewProps } from './ui'

const ORIGIN = typeof location !== 'undefined' ? location.origin : 'https://christiangilkey.github.io'

/** Send the week to Google Tasks (or copy it as a checklist). */
export function ExportSheet({ state, update, onClose }: ViewProps & { onClose: () => void }) {
  const [opts, setOpts] = useState<ExportOptions>({ meals: true, shopping: true, prep: true })
  const [clientId, setClientId] = useState(state.googleClientId)
  const [status, setStatus] = useState<{ kind: 'idle' | 'working' | 'done' | 'error'; text?: string }>({ kind: 'idle' })
  const [showSetup, setShowSetup] = useState(!state.googleClientId)
  const lists = buildTaskLists(state, opts)
  const count = lists.reduce((s, l) => s + l.tasks.length, 0)

  const toggle = (k: keyof ExportOptions) => setOpts((o) => ({ ...o, [k]: !o[k] }))

  const send = async () => {
    const id = clientId.trim()
    if (!id.endsWith('.apps.googleusercontent.com')) {
      setStatus({ kind: 'error', text: 'That doesn’t look like a Google OAuth client ID (it ends in .apps.googleusercontent.com).' })
      return
    }
    update((s) => ({ ...s, googleClientId: id }))
    try {
      setStatus({ kind: 'working', text: 'Waiting for Google sign-in…' })
      const token = await getTasksToken(id)
      const n = await exportToGoogleTasks(token, lists, (done, total) => setStatus({ kind: 'working', text: `Adding tasks… ${done} of ${total}` }))
      setStatus({ kind: 'done', text: `Added ${n} tasks in ${lists.length} list${lists.length > 1 ? 's' : ''}.` })
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
    <Sheet title="Export to Google Tasks" onClose={onClose}>
      <p className="muted small">Creates a task list for each part you choose, with meals due on their day. It goes straight from this device to your Google account; nothing passes through any other server.</p>
      <div className="check-grid">
        {([['meals', 'Meal plan', 'One task per meal, due that day, with ingredients'], ['shopping', 'Shopping list', 'One task per item'], ['prep', 'Prep day', 'Batch cooking, due the Sunday before']] as [keyof ExportOptions, string, string][]).map(([k, label, detail]) => (
          <label key={k} className={`check-card ${opts[k] ? 'on' : ''}`}>
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} />
            <span><strong>{label}</strong><small className="muted"> {detail}</small></span>
          </label>
        ))}
      </div>
      <p className="muted small">{count} tasks in {lists.length} list{lists.length === 1 ? '' : 's'}.</p>

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

      <div className="add-row">
        <button className="primary with-icon" onClick={send} disabled={!count || status.kind === 'working'}><Icon name="check" /> Export to Google Tasks</button>
        <button className="secondary" onClick={copy} disabled={!count}>Copy as checklist</button>
      </div>
      {status.text && (
        <p className={`small ${status.kind === 'error' ? 'warn-text' : status.kind === 'done' ? 'good-text' : 'muted'}`} role="status">
          {status.text}{' '}
          {status.kind === 'done' && status.text.startsWith('Added') && <a className="ext" href="https://tasks.google.com/" target="_blank" rel="noopener noreferrer">Open Google Tasks</a>}
        </p>
      )}
    </Sheet>
  )
}
