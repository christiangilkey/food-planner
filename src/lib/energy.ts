import { APP_CONVENTION, type SourceId } from '../data/sources'
import type { Activity, Profile } from '../types'
import { mergedLimits } from './conditions'

export const ACTIVITY: Record<Activity, { factor: number; label: string; detail: string }> = {
  sedentary: { factor: 1.2, label: 'Sedentary', detail: 'Desk job, little exercise' },
  light: { factor: 1.375, label: 'Lightly active', detail: 'Light exercise 1–3 days a week, or on your feet some of the day' },
  moderate: { factor: 1.55, label: 'Moderately active', detail: 'Exercise 3–5 days a week' },
  very: { factor: 1.725, label: 'Very active', detail: 'Hard exercise 6–7 days a week, or a physical job' },
  athlete: { factor: 1.9, label: 'Athlete', detail: 'Training twice a day, or heavy manual labor' },
}

export interface Explained {
  text: string
  sources: SourceId[]
  /** Set when the number is the app's own convention. */
  convention?: string
}

export interface Targets {
  bmr: number
  tdee: number
  kcal: number
  protein: number
  fat: number
  carbs: number
  bmi: number
  /** Plain-language explanation of how the numbers were derived, with sources. */
  explain: Explained[]
}

export const lbToKg = (lb: number) => lb * 0.45359237
export const inToCm = (inch: number) => inch * 2.54

/** Mifflin–St Jeor BMR × activity factor, adjusted for goal and health conditions. */
export function computeTargets(p: Profile): Targets {
  const kg = lbToKg(p.weightLb)
  const cm = inToCm(p.heightIn)
  const m = cm / 100
  const bmi = kg / (m * m)
  const bmr = 10 * kg + 6.25 * cm - 5 * p.age + (p.sex === 'male' ? 5 : -161)
  const tdee = bmr * ACTIVITY[p.activity].factor
  const limits = mergedLimits(p)

  let kcal = tdee
  const explain: Explained[] = [
    { text: `Resting burn (BMR) ≈ ${Math.round(bmr)} kcal from the Mifflin–St Jeor equation, using your weight, height, age and sex.`, sources: ['mifflin'] },
    {
      text: `× ${ACTIVITY[p.activity].factor} for "${ACTIVITY[p.activity].label}" = ${Math.round(tdee)} kcal a day to maintain your weight.`,
      sources: ['nasem_macros'],
      convention: 'The 1.2–1.9 activity multipliers are the conventional companions to Mifflin–St Jeor; they are estimates, not measured values.',
    },
  ]
  if (p.goal === 'lose') {
    const cut = Math.min(500, tdee * 0.2)
    kcal = tdee - cut
    explain.push({ text: `−${Math.round(cut)} kcal a day for gradual fat loss. The AHA/ACC/TOS obesity guideline advises a 500–750 kcal daily deficit.`, sources: ['jensen'] })
  } else if (p.goal === 'gain') {
    const add = Math.min(400, tdee * 0.12)
    kcal = tdee + add
    explain.push({ text: `+${Math.round(add)} kcal a day for lean gain. A modest 10–20% surplus is suggested to limit fat gain.`, sources: ['iraki'] })
  }
  const floor = p.sex === 'male' ? 1500 : 1200
  if (kcal < floor) {
    kcal = floor
    explain.push({ text: `Raised to ${floor} kcal, the low end of the obesity guideline’s calorie ranges (1,200–1,500 women, 1,500–1,800 men).`, sources: ['jensen'] })
  }

  // Protein: g/kg of body weight. At higher BMI use adjusted weight so targets stay realistic.
  const kgAt25 = 25 * m * m
  const refKg = bmi > 27 ? kgAt25 + 0.25 * (kg - kgAt25) : kg
  let perKg = p.goal === 'maintain' ? 1.4 : 1.6
  if (p.activity === 'very' || p.activity === 'athlete') perKg += 0.2
  const capped = limits.proteinMaxPerKg !== undefined && perKg > limits.proteinMaxPerKg
  if (capped) perKg = limits.proteinMaxPerKg!
  const protein = refKg * perKg
  if (capped) {
    explain.push({ text: `Protein capped at ${perKg} g per kg (${Math.round(protein)} g) for kidney disease. Your renal team may set it lower.`, sources: ['kdoqi'] })
  } else {
    explain.push({
      text: `Protein ${perKg.toFixed(1)} g per kg${bmi > 27 ? ' of adjusted body weight' : ''} = ${Math.round(protein)} g. The 2025–2030 Dietary Guidelines advise 1.2–1.6 g/kg; up to 2.0 is supported for hard training. Protein is the most filling macronutrient${p.goal === 'lose' ? ' and protects muscle during weight loss' : ''}.`,
      sources: ['dga_2025', 'jager', 'morton', 'leidy'],
      convention: bmi > 27 ? 'Using an adjusted weight above BMI 27 (so protein isn’t overestimated from fat mass) is this app’s convention.' : undefined,
    })
  }

  let fat = (kcal * 0.3) / 9
  let carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4)
  if (p.diets.includes('keto')) {
    carbs = 50
    fat = Math.max(0, (kcal - protein * 4 - carbs * 4) / 9)
    explain.push({ text: `Keto: carbs held to about 50 g a day (under 50 g net), and fat fills the rest (${Math.round((fat * 900) / kcal)}% of calories).`, sources: ['bueno_keto', 'evert'], convention: 'The 50 g figure is the common definition of a very-low-carb ketogenic diet used in the cited trials.' })
  } else {
    explain.push({ text: 'Fat at 30% of calories, inside the 20–35% acceptable range; carbs fill the rest.', sources: ['nasem_macros'], convention: APP_CONVENTION })
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal: Math.round(kcal / 10) * 10,
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    bmi: Math.round(bmi * 10) / 10,
    explain,
  }
}
