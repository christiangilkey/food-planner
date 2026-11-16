import { useState } from 'react'
import { LEGAL_DATE, PRIVACY, TERMS } from '../data/legal'
import { Icon } from './Icon'
import { AgreeLine, LegalSheet } from './Legal'
import { LogoMark } from './Logo'

/** The core disclaimer, shown at sign-up and kept in Profile. */
export function DisclaimerText() {
  return (
    <div className="disclaimer-text">
      <p><strong>I’m not a health professional.</strong> Health Tracker was made by an individual, not a doctor, dietitian, pharmacist or other licensed clinician.</p>
      <p>Everything in this app (meal plans, calorie and nutrient targets, condition settings, supplements and peptides) is general information drawn from published research. It is <strong>not medical advice</strong> and it can’t account for your full health picture.</p>
      <p><strong>Run everything by your doctor first</strong>, especially before changing your diet, starting any supplement or peptide, or if you have a health condition, take medication, or are pregnant or breastfeeding.</p>
      <p>If you think you’re having a medical emergency, call 911 or your local emergency number.</p>
    </div>
  )
}

/**
 * Acknowledgment checkbox plus the text, and the "you agree to the Terms" line. Calls onAccept once
 * ticked and confirmed: accepting means both the disclaimer and the current Terms and Privacy Policy.
 */
export function DisclaimerAcknowledge({ onAccept, buttonLabel = 'Continue' }: { onAccept: () => void; buttonLabel?: string }) {
  const [ok, setOk] = useState(false)
  return (
    <>
      <DisclaimerText />
      <label className={`toggle ${ok ? 'on' : ''}`}>
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span><strong>I understand</strong><small> This app isn’t medical advice, and I’ll check with my doctor before acting on it.</small></span>
      </label>
      <AgreeLine />
      <div className="actions">
        <button className="primary with-icon" disabled={!ok} onClick={onAccept}><Icon name="check" size={16} /> {buttonLabel}</button>
      </div>
    </>
  )
}

/** One-time full-screen notice for people who set up the app before the disclaimer existed. */
export function DisclaimerGate({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="onboarding">
      <div className="onboarding-head">
        <LogoMark size={56} />
        <h1 className="wordmark big">Before you continue</h1>
      </div>
      <section className="card disclaimer-card">
        <DisclaimerAcknowledge onAccept={onAccept} />
      </section>
    </div>
  )
}

/**
 * Shown once when the Terms or Privacy Policy are new to this person (they set up the app before
 * the documents existed, or before they last changed). Nothing is decided for them: they read and agree.
 */
export function TermsGate({ first, onAccept }: { first: boolean; onAccept: () => void }) {
  const [open, setOpen] = useState<typeof TERMS | null>(null)
  return (
    <div className="onboarding">
      <div className="onboarding-head">
        <LogoMark size={56} />
        <h1 className="wordmark big">{first ? 'Terms and privacy' : 'We’ve updated our Terms and Privacy Policy'}</h1>
      </div>
      <section className="card stack tight">
        <p>{first ? 'Health Tracker now has Terms of Service and a Privacy Policy, so it’s clear what the app does with your information and what you’re agreeing to.' : `Our Terms of Service and Privacy Policy changed on ${LEGAL_DATE}.`}</p>
        <ul className="explain small">
          <li>Everything you enter still stays on your device. The developer never receives it.</li>
          <li>Optional features (AI ideas, barcode lookups, Google Tasks) send only what each one needs, straight to that company, and only when you use them.</li>
          <li>It’s general information, not medical advice.</li>
        </ul>
        <div className="add-row">
          <button type="button" className="secondary" onClick={() => setOpen(TERMS)}>Read the Terms</button>
          <button type="button" className="secondary" onClick={() => setOpen(PRIVACY)}>Read the Privacy Policy</button>
        </div>
        <div className="actions">
          <button className="primary with-icon" onClick={onAccept}><Icon name="check" size={16} /> Agree and continue</button>
        </div>
        <p className="muted small">If you don’t agree, stop using the app and delete it (or, on the web, clear this site’s data): that removes everything it stored.</p>
      </section>
      {open && <LegalSheet doc={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
