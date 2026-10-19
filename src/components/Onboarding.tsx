import { useEffect, useState, type ComponentType } from 'react'
import { DisclaimerAcknowledge } from './Disclaimer'
import { Icon } from './Icon'
import { Logo, LogoMark } from './Logo'
import { computeTargets } from '../lib/energy'
import { generatePlan } from '../lib/planner'
import { ConditionFields } from './ConditionFields'
import { DietFields } from './DietFields'
import { MedFields } from './MedFields'
import { ActivityGoalFields, BodyBasicsFields, BudgetFields, EquipmentFields, RhythmFields } from './ProfileFields'
import type { ViewProps } from './ui'

/** One topic per step. Optional steps say so, and Next works as skip. */
const STEPS: { title: string; blurb: string; Fields: ComponentType<ViewProps> }[] = [
  { title: 'About you', blurb: 'Used to work out how much energy and protein you need.', Fields: BodyBasicsFields },
  { title: 'Activity & goal', blurb: 'How active you are, and what you want from your meals.', Fields: ActivityGoalFields },
  { title: 'Your kitchen', blurb: 'Tick what you own. A knife and cutting board are assumed.', Fields: EquipmentFields },
  { title: 'Health conditions', blurb: 'Optional. Tap any you have; the plan avoids foods that could worsen them.', Fields: ConditionFields },
  { title: 'Diet', blurb: 'Optional. Choose any eating pattern you follow.', Fields: DietFields },
  { title: 'Medications', blurb: 'Optional. Used to screen supplements and foods for interactions.', Fields: MedFields },
  { title: 'Your day', blurb: 'Used to time your meals, water and caffeine cutoff.', Fields: RhythmFields },
  { title: 'Budget & time', blurb: 'What you want to spend and how long you want to cook.', Fields: BudgetFields },
]

export function Onboarding(props: ViewProps) {
  const { state, update } = props
  const [step, setStep] = useState(0)
  const last = step === STEPS.length - 1
  const t = computeTargets(state.profile)
  useEffect(() => { window.scrollTo(0, 0) }, [step, state.disclaimerAccepted])

  const finish = () =>
    update((s) => {
      const ready = { ...s, setupDone: true }
      return { ...ready, plan: generatePlan(ready) }
    })

  if (!state.disclaimerAccepted) {
    return (
      <div className="onboarding">
        <div className="onboarding-head">
          <LogoMark size={112} />
          <h1 className="wordmark big">Health Tracker</h1>
          <p className="muted">Meals that keep you full, fit your kitchen, your budget and your brain.</p>
        </div>
        <section className="card disclaimer-card">
          <h2>Please read first</h2>
          <DisclaimerAcknowledge buttonLabel="I understand, get started" onAccept={() => update((s) => ({ ...s, disclaimerAccepted: true }))} />
        </section>
      </div>
    )
  }

  const { title, blurb, Fields } = STEPS[step]
  return (
    <div className="onboarding pf-ob">
      <div className="pf-ob-top">
        <div className="pf-ob-brand"><Logo height={30} /></div>
        <p className="pf-ob-count">Step {step + 1} of {STEPS.length}</p>
        <div className="pf-ob-progress" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-valuetext={`Step ${step + 1} of ${STEPS.length}: ${title}`}>
          {STEPS.map((s, i) => <span key={s.title} className={i <= step ? 'on' : ''} />)}
        </div>
      </div>

      <div>
        <h1>{title}</h1>
        <p className="muted">{blurb}</p>
      </div>
      <Fields {...props} />
      {step <= 1 && (
        <p className="target-preview">
          About <strong>{t.kcal.toLocaleString()} calories</strong> and <strong>{t.protein} g protein</strong> a day.
        </p>
      )}

      <div className="pf-ob-actions">
        {step > 0 && (
          <button className="ghost with-icon" onClick={() => setStep(step - 1)}><Icon name="chevronLeft" size={18} /> Back</button>
        )}
        {last ? (
          <button className="primary" onClick={finish}>Build my week</button>
        ) : (
          <button className="primary" onClick={() => setStep(step + 1)}>Next</button>
        )}
      </div>
    </div>
  )
}
