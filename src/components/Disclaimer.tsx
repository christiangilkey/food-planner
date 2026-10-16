import { useState } from 'react'
import { Icon } from './Icon'
import { LogoMark } from './Logo'

/** The core disclaimer, shown at sign-up and kept in Profile. */
export function DisclaimerText() {
  return (
    <div className="disclaimer-text">
      <p><strong>I’m not a health professional.</strong> Food Planner was made by an individual, not a doctor, dietitian, pharmacist or other licensed clinician.</p>
      <p>Everything in this app (meal plans, calorie and nutrient targets, condition settings, supplements and peptides) is general information drawn from published research. It is <strong>not medical advice</strong> and it can’t account for your full health picture.</p>
      <p><strong>Run everything by your doctor first</strong>, especially before changing your diet, starting any supplement or peptide, or if you have a health condition, take medication, or are pregnant or breastfeeding.</p>
      <p>If you think you’re having a medical emergency, call 911 or your local emergency number.</p>
    </div>
  )
}

/** Acknowledgment checkbox plus the text. Calls onAccept once ticked and confirmed. */
export function DisclaimerAcknowledge({ onAccept, buttonLabel = 'Continue' }: { onAccept: () => void; buttonLabel?: string }) {
  const [ok, setOk] = useState(false)
  return (
    <>
      <DisclaimerText />
      <label className={`toggle ${ok ? 'on' : ''}`}>
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span><strong>I understand</strong><small> This app isn’t medical advice, and I’ll check with my doctor before acting on it.</small></span>
      </label>
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
