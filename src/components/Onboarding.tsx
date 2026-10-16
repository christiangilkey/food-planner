import { useState } from 'react'
import { computeTargets } from '../lib/energy'
import { generatePlan } from '../lib/planner'
import { ConditionFields } from './ConditionFields'
import { BodyFields, EquipmentFields, LifestyleFields } from './ProfileFields'
import type { ViewProps } from './ui'

const STEPS = [
  { title: 'About you', blurb: 'Used to work out how much energy and protein you need, and your vitamin and mineral targets.' },
  { title: 'Your kitchen', blurb: "Check what you own. You'll only get meals you can actually make. A knife and cutting board are assumed." },
  { title: 'Health', blurb: 'Turn on any conditions you have. The plan will avoid foods that could worsen them and favor foods with evidence of helping. You can change this any time.' },
  { title: 'How you eat', blurb: 'Time, money and daily rhythm. You can change any of these later.' },
]

export function Onboarding(props: ViewProps) {
  const { state, update } = props
  const [step, setStep] = useState(0)
  const last = step === STEPS.length - 1
  const t = computeTargets(state.profile)

  const finish = () =>
    update((s) => {
      const ready = { ...s, setupDone: true }
      return { ...ready, plan: generatePlan(ready) }
    })

  return (
    <div className="onboarding">
      <div className="onboarding-head">
        <span className="logo big" aria-hidden>🥕</span>
        <h1>Food Planner</h1>
        <p className="muted">Meals that keep you full, fit your kitchen, your budget and your brain.</p>
        <ol className="steps" aria-label="Setup progress">
          {STEPS.map((s, i) => (
            <li key={s.title} className={i === step ? 'current' : i < step ? 'done' : ''}>{s.title}</li>
          ))}
        </ol>
      </div>

      <section className="card">
        <h2>{STEPS[step].title}</h2>
        <p className="muted">{STEPS[step].blurb}</p>
        {step === 0 && (
          <>
            <BodyFields {...props} />
            <p className="target-preview">
              About <strong>{t.kcal} kcal</strong> and <strong>{t.protein} g protein</strong> a day.
            </p>
          </>
        )}
        {step === 1 && <EquipmentFields {...props} />}
        {step === 2 && <ConditionFields {...props} />}
        {step === 3 && <LifestyleFields {...props} />}
      </section>

      <div className="actions">
        {step > 0 && <button className="secondary" onClick={() => setStep(step - 1)}>Back</button>}
        {last ? (
          <button className="primary" onClick={finish}>Build my week</button>
        ) : (
          <button className="primary" onClick={() => setStep(step + 1)}>Next</button>
        )}
      </div>
    </div>
  )
}
