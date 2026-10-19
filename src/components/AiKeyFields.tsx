import { useState } from 'react'
import { looksLikeKey, maskKey, setAiKey, useAiKey } from '../lib/aiKey'
import { Icon } from './Icon'

/** Profile → AI suggestions: the person's own Anthropic API key, stored only on this device. */
export function AiKeyFields() {
  const key = useAiKey()
  const [draft, setDraft] = useState('')
  const [show, setShow] = useState(false)
  const valid = looksLikeKey(draft)

  return (
    <div className="stack">
      <p className="muted pf-intro">
        “I’m craving…” on the Today tab can use Claude for smarter ideas. Without a key, it still works using suggestions made on your device.
      </p>

      <section className="card">
        {key ? (
          <>
            <p className="good-text with-icon"><Icon name="check" /> Using your key {maskKey(key)}</p>
            <button className="ghost danger small" onClick={() => setAiKey('')}>Remove key</button>
          </>
        ) : (
          <form className="stack tight" onSubmit={(e) => { e.preventDefault(); if (valid) { setAiKey(draft); setDraft('') } }}>
            <label className="field">
              <span>Your Anthropic API key</span>
              <span className="input-wrap">
                <input type={show ? 'text' : 'password'} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="sk-ant-…" autoComplete="off" spellCheck={false} />
              </span>
            </label>
            <label className="toggle compact">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
              <span><strong>Show key</strong></span>
            </label>
            {draft && !valid && <p className="warn-text small">That doesn’t look like an Anthropic API key (they start with “sk-ant-”).</p>}
            <button className="primary" disabled={!valid}>Save key</button>
            <p className="muted small">Create one at console.anthropic.com → API keys. Usage is billed to your Anthropic account.</p>
          </form>
        )}
      </section>

      <section className="card">
        <h3>What gets sent</h3>
        <ul className="explain small">
          <li>Only when you tap “Find ideas”: what you typed, your setup (body, goal, conditions, diet, medications, foods you won’t eat, kitchen, budget), your pantry, and the meals and foods your settings allow.</li>
          <li>It goes straight from this device to Anthropic. The key is stored only on this device and is left out of backups.</li>
          <li>Ideas are picked only from what your settings allow, and the app checks them again before showing them. It’s not medical advice.</li>
        </ul>
      </section>
    </div>
  )
}
