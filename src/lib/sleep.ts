import type { SourceId } from '../data/sources'
import type { Evidence, Profile, SleepEntry } from '../types'
import { hasCondition } from './conditions'
import { iso, type TaskDraft, type TaskListDraft } from './googleTasks'
import { formatTime, mealTimes, parseTime } from './schedule'

/** Minutes asleep for one night (bedtime to wake, across midnight). */
export function nightMinutes(e: Pick<SleepEntry, 'bed' | 'wake'>): number {
  const bed = parseTime(e.bed, 23 * 60)
  const wake = parseTime(e.wake, 7 * 60)
  const d = wake - bed
  return d <= 0 ? d + 1440 : d
}

/**
 * Middle of the night in minutes after the previous noon, so 11pm–7am (3am) and 1am–9am (5am)
 * compare on one line instead of wrapping at midnight.
 */
export function midpoint(e: Pick<SleepEntry, 'bed' | 'wake'>): number {
  const bed = parseTime(e.bed, 23 * 60)
  const fromNoon = bed >= 12 * 60 ? bed - 12 * 60 : bed + 12 * 60
  return fromNoon + nightMinutes(e) / 2
}

export const formatHours = (min: number) => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m ? `${h} h ${m} min` : `${h} h`
}

export interface SleepTarget {
  min: number
  max: number
  text: string
  sources: SourceId[]
}

/** Recommended sleep by age: 7–9 h for adults, 7–8 h from 65, 8–10 h for teens (NSF; AASM/SRS for adults). */
export function sleepTarget(p: Profile): SleepTarget {
  if (p.age < 18) return { min: 8 * 60, max: 10 * 60, text: 'Teenagers (14–17) are recommended 8–10 hours.', sources: ['hirshkowitz'] }
  if (p.age >= 65) return { min: 7 * 60, max: 8 * 60, text: 'From 65, 7–8 hours is recommended.', sources: ['hirshkowitz'] }
  return { min: 7 * 60, max: 9 * 60, text: 'Adults are recommended at least 7 hours a night, regularly; 7–9 hours for ages 18–64.', sources: ['watson_sleep', 'hirshkowitz'] }
}

/** Spread (standard deviation) of a list of minutes. */
const spread = (xs: number[]) => {
  if (xs.length < 2) return 0
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  return Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1))
}

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Weekend mornings: Saturday and Sunday (the nights of Friday and Saturday). */
const isWeekendMorning = (date: string) => {
  const day = new Date(`${date}T12:00`).getDay()
  return day === 0 || day === 6
}

export interface SleepAnalysis {
  target: SleepTarget
  /** Nights logged in the last 7 days. */
  nights: SleepEntry[]
  avgMin: number
  /** Nights under the minimum target, under 6 h and under 5 h, in the last 7 days. */
  short: number
  under6: number
  under5: number
  /** Total shortfall against the minimum target over the last 7 days, in minutes. */
  debtMin: number
  /** Spread of the sleep midpoint over the last 14 days, in minutes (needs 4+ nights). */
  midSpreadMin: number | null
  /** Weekend midpoint minus weekday midpoint, in minutes ("social jet lag"), when both are logged. */
  socialJetlagMin: number | null
  irregular: boolean
  last: { entry: SleepEntry; minutes: number } | null
  /** The bed and wake times set in the profile, which the meal schedule also uses. */
  planned: { bed: number; wake: number; minutes: number }
}

/** Irregular when the sleep midpoint wanders more than an hour, or weekends shift it by over an hour. */
export const IRREGULAR_MIN = 60

export function analyzeSleep(log: SleepEntry[], p: Profile, today = new Date()): SleepAnalysis {
  const target = sleepTarget(p)
  const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return isoDate(d) }
  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date))
  const week = sorted.filter((e) => e.date > daysAgo(7) && e.date <= isoDate(today))
  const fortnight = sorted.filter((e) => e.date > daysAgo(14) && e.date <= isoDate(today))
  const mins = week.map(nightMinutes)
  const avgMin = mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : 0

  const mids = fortnight.map(midpoint)
  const midSpreadMin = mids.length >= 4 ? spread(mids) : null
  const weekend = fortnight.filter((e) => isWeekendMorning(e.date)).map(midpoint)
  const weekday = fortnight.filter((e) => !isWeekendMorning(e.date)).map(midpoint)
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const socialJetlagMin = weekend.length && weekday.length ? mean(weekend) - mean(weekday) : null

  const t = mealTimes(p, 0)
  const lastEntry = sorted.at(-1)
  return {
    target,
    nights: week,
    avgMin,
    short: mins.filter((m) => m < target.min).length,
    under6: mins.filter((m) => m < 6 * 60).length,
    under5: mins.filter((m) => m < 5 * 60).length,
    debtMin: mins.reduce((s, m) => s + Math.max(0, target.min - m), 0),
    midSpreadMin,
    socialJetlagMin,
    irregular: (midSpreadMin ?? 0) > IRREGULAR_MIN || Math.abs(socialJetlagMin ?? 0) > IRREGULAR_MIN,
    last: lastEntry ? { entry: lastEntry, minutes: nightMinutes(lastEntry) } : null,
    planned: { bed: t.bed, wake: t.wake, minutes: (((t.wake - t.bed) % 1440) + 1440) % 1440 || 1440 },
  }
}

export type ImpactArea = 'body' | 'brain' | 'food' | 'looks' | 'condition' | 'habit'

export interface SleepImpact {
  id: string
  area: ImpactArea
  tone: 'good' | 'warn' | 'bad'
  title: string
  text: string
  evidence: Evidence
  sources: SourceId[]
  /** Why this shows for you. */
  because?: string
  convention?: string
}

/**
 * What this person's recent sleep means for their health, goals and conditions. Only effects
 * with published evidence are listed, each with its evidence level; observational links are
 * worded as links, not causes.
 */
export function sleepImpacts(a: SleepAnalysis, p: Profile): SleepImpact[] {
  const out: SleepImpact[] = []
  const has = a.nights.length > 0
  const avg = formatHours(a.avgMin)
  const short = has && a.avgMin < a.target.min
  const because = has ? `You averaged ${avg} over ${a.nights.length} night${a.nights.length > 1 ? 's' : ''}.` : undefined

  if (has && !short && a.avgMin <= a.target.max && !a.irregular) {
    out.push({
      id: 'on_target', area: 'body', tone: 'good', title: 'Enough sleep, at steady times', evidence: 'strong', sources: a.target.sources,
      text: `${a.target.text} You’re in range, which is linked to lower risk of weight gain, diabetes, high blood pressure, heart disease and depression.`,
      because,
    })
  }

  if (short) {
    out.push({
      id: 'hunger', area: 'food', tone: 'bad', title: 'Short sleep makes you eat more', evidence: 'moderate', sources: ['alkhatib', 'spiegel'],
      text: 'In a meta-analysis of sleep-restriction trials, people ate about 385 kcal more on days after short sleep, while burning about the same. Sleep loss also lowered leptin and raised ghrelin, the hormones that signal fullness and hunger. Your plan’s high-protein, high-fiber snacks are the best defense on those days.',
      because,
    })
    out.push({
      id: 'focus', area: 'brain', tone: 'bad', title: 'Attention and memory drop, and you won’t feel it', evidence: 'moderate', sources: ['van_dongen'],
      text: 'Two weeks of 6 hours a night impaired attention and working memory as much as up to two full nights without sleep, yet people rated themselves only slightly sleepy.',
      because,
    })
    out.push({
      id: 'glucose', area: 'body', tone: 'warn', title: 'Blood sugar control worsens', evidence: 'moderate', sources: ['spiegel_1999', 'shan_sleep'],
      text: 'Six nights of 4 hours impaired glucose tolerance in healthy young men. Over years, each hour under 7 a night was linked to about 9% higher risk of type 2 diabetes.',
      because,
    })
    out.push({
      id: 'heart', area: 'body', tone: 'warn', title: 'Linked to heart disease and stroke', evidence: 'moderate', sources: ['cappuccio_cvd', 'cappuccio_mort'],
      text: 'In pooled studies of almost 475,000 people, habitual short sleep was linked to 48% higher risk of coronary heart disease and 15% higher risk of stroke, and to slightly higher mortality overall (12%). These are associations, not proof that sleep is the cause.',
      because,
    })
  }
  if (short) {
    out.push({
      id: 'looks', area: 'looks', tone: 'bad', title: 'You look more tired and less attractive', evidence: 'moderate', sources: ['axelsson', 'sundelin'],
      text: 'Strangers rated photos of people after a night of sleep loss as less healthy, more tired and less attractive. After two nights of 4 hours, people were also rated less trustworthy, and others were less willing to socialize with them.',
      because: hasCondition(p, 'looks') ? `${because} You set a looks goal.` : because,
    })
  }
  if (has && a.under6 > 0) {
    out.push({
      id: 'colds', area: 'body', tone: 'bad', title: 'More likely to catch a cold', evidence: 'moderate', sources: ['prather'],
      text: 'When healthy adults were given a cold virus, those who had slept under 6 hours a night the week before were about 4 times as likely to get sick as those sleeping over 7 hours.',
      because: `${a.under6} night${a.under6 > 1 ? 's' : ''} under 6 hours this week.`,
    })
  }
  if (has && a.avgMin > a.target.max) {
    out.push({
      id: 'long', area: 'body', tone: 'warn', title: 'Sleeping longer than recommended', evidence: 'emerging', sources: ['cappuccio_mort', 'watson_sleep'],
      text: 'Regularly sleeping over 9 hours was linked to higher mortality in pooled studies, but this may reflect illness rather than sleep itself. More than 9 hours can be fine when catching up on lost sleep or recovering from illness. If you sleep this long and still feel tired, mention it to your doctor.',
      because,
    })
  }
  if (a.irregular) {
    const parts = [
      a.midSpreadMin !== null && a.midSpreadMin > IRREGULAR_MIN ? `your sleep midpoint varies by about ${Math.round(a.midSpreadMin)} minutes` : '',
      a.socialJetlagMin !== null && Math.abs(a.socialJetlagMin) > IRREGULAR_MIN ? `weekends shift it by ${Math.round(Math.abs(a.socialJetlagMin))} minutes` : '',
    ].filter(Boolean)
    out.push({
      id: 'regularity', area: 'body', tone: 'warn', title: 'Irregular sleep times', evidence: 'moderate', sources: ['windred', 'phillips_sleep'],
      text: 'In about 60,000 UK adults tracked with wrist sensors, regular sleep timing predicted lower mortality more strongly than sleep length did. Irregular sleepers have also had later body clocks and poorer performance. Going to bed and getting up at the same times every day, weekends included, is the fix.',
      because: parts.length ? `${parts.join(' and ')[0].toUpperCase()}${parts.join(' and ').slice(1)}.` : undefined,
      convention: 'Flagging more than an hour of variation is this app’s threshold; the study measured regularity with the Sleep Regularity Index.',
    })
  }

  // Goals: sleep changes what a calorie deficit or surplus does to your body.
  if (short && p.goal === 'lose') {
    out.push({
      id: 'goal_lose', area: 'food', tone: 'bad', title: 'You lose more muscle and less fat', evidence: 'moderate', sources: ['nedeltcheva'],
      text: 'On the same diet, people allowed 5.5 hours of sleep lost 55% less fat and 60% more lean mass than those allowed 8.5 hours, and were hungrier. Sleep protects what your calorie deficit takes off.',
      because,
    })
  }
  if (short && p.goal !== 'lose') {
    out.push({
      id: 'goal_muscle', area: 'body', tone: 'warn', title: 'Harder to keep and build muscle', evidence: 'moderate',
      sources: p.sex === 'male' ? ['nedeltcheva', 'leproult_t'] : ['nedeltcheva'],
      text: `Sleep restriction shifted weight loss from fat toward lean mass in a dieting trial.${p.sex === 'male' ? ' A week of 5 hours a night also lowered daytime testosterone by 10–15% in young men.' : ''}`,
      because,
    })
  }

  // Conditions.
  if (short && (hasCondition(p, 'depression') || hasCondition(p, 'anxiety'))) {
    out.push({
      id: 'mood', area: 'condition', tone: 'bad', title: 'Poor sleep and mood feed each other', evidence: 'moderate', sources: ['baglioni', 'acp_insomnia'],
      text: 'People with insomnia had about twice the risk of later developing depression. If you regularly lie awake, cognitive behavioral therapy for insomnia (CBT-I) is the first-line treatment, ahead of sleeping pills.',
      because,
    })
  }
  if (short && (hasCondition(p, 't1d') || hasCondition(p, 't2d'))) {
    out.push({
      id: 'diabetes', area: 'condition', tone: 'bad', title: 'With diabetes: expect higher glucose', evidence: 'moderate', sources: ['spiegel_1999', 'shan_sleep'],
      text: 'Sleep loss lowers glucose tolerance, so the morning after a short night may run higher. Check more often and expect more hunger.',
      because,
    })
  }
  if (has && a.under6 > 0 && hasCondition(p, 'hypertension')) {
    out.push({
      id: 'bp', area: 'condition', tone: 'bad', title: 'With high blood pressure: short sleep adds risk', evidence: 'emerging', sources: ['gangwisch'],
      text: 'In a US cohort, adults aged 32–59 sleeping 5 hours or less had about twice the risk of developing high blood pressure. Protect 7 hours alongside the sodium limit.',
      because: `${a.under6} night${a.under6 > 1 ? 's' : ''} under 6 hours this week.`,
    })
  }
  if (hasCondition(p, 'migraine') && (short || a.irregular)) {
    out.push({
      id: 'migraine', area: 'condition', tone: 'warn', title: 'With migraine: sleep changes are a common trigger', evidence: 'moderate', sources: ['kelman'],
      text: 'Sleep disturbance was one of the most common migraine triggers patients reported, along with stress and skipped meals. Keep both bedtime and wake time steady, weekends included.',
      because,
    })
  }
  if (hasCondition(p, 'adhd')) {
    out.push({
      id: 'adhd', area: 'condition', tone: a.irregular || short ? 'warn' : 'good', title: 'With ADHD: a later body clock is common', evidence: 'emerging', sources: ['van_veen', 'blume', 'chang_ereader'],
      text: 'Adults with ADHD who struggle to fall asleep had melatonin rising later in the evening than others. Bright light soon after waking pulls the clock earlier; bright screens in the hour before bed delayed it and made it harder to fall asleep.',
      because: has ? because : undefined,
    })
  }
  if (hasCondition(p, 'hashimotos') && has && !short) {
    out.push({
      id: 'thyroid', area: 'condition', tone: 'warn', title: 'Tired despite enough sleep?', evidence: 'strong', sources: ['niddk_hashimoto', 'jonklaas'],
      text: 'With Hashimoto’s, ongoing tiredness when you are sleeping enough can mean your thyroid dose needs adjusting. Ask your doctor about checking your TSH.',
      because,
    })
  }
  if (hasCondition(p, 'gerd')) {
    out.push({
      id: 'gerd', area: 'condition', tone: 'warn', title: 'With reflux: protect the hours before bed', evidence: 'moderate', sources: ['acg_gerd'],
      text: 'Not eating in the 2–3 hours before lying down and raising the head of your bed reduce nighttime reflux, which otherwise disrupts sleep. Your dinner time is set from your bedtime.',
    })
  }

  // What helps, for anyone sleeping short or irregularly.
  if (short || a.irregular || !has) {
    out.push({
      id: 'light', area: 'habit', tone: 'good', title: 'Morning light, dim evenings', evidence: 'moderate', sources: ['blume', 'chang_ereader'],
      text: 'Daylight soon after waking is the strongest signal setting your body clock. Bright screens before bed delayed sleep and next-morning alertness in a controlled trial, so dim them in the last hour.',
    })
    out.push({
      id: 'ifthen', area: 'habit', tone: 'good', title: 'Plan the moment, not just the goal', evidence: 'moderate', sources: ['gollwitzer'],
      text: 'If-then plans (“If it’s 10:30 and I’m on my phone, then I put it on the charger outside the bedroom”) helped people reach their goals more than intentions alone, with a medium-to-large effect across 94 studies. Making the unwanted habit a little harder, like charging the phone in another room, works the same way.',
    })
    out.push({
      id: 'exercise', area: 'habit', tone: 'good', title: 'Regular exercise improves sleep', evidence: 'moderate', sources: ['kredlow'],
      text: 'Regular exercise improved sleep quality moderately and helped people fall asleep faster in a meta-analysis of 66 studies.',
    })
  }
  if (has && a.under6 >= 3) {
    out.push({
      id: 'cbti', area: 'habit', tone: 'warn', title: 'Short nights most of the week', evidence: 'strong', sources: ['acp_insomnia'],
      text: 'If you have trouble falling or staying asleep at least three nights a week for three months, that is chronic insomnia. CBT-I is the first-line treatment, available in person, by app and online. Talk to your doctor.',
      because: `${a.under6} nights under 6 hours this week.`,
    })
  }
  return out
}

/** Times on the user's sleep schedule, with the habits that protect it. */
export interface WindDownStep {
  at: number
  label: string
  detail: string
  sources: SourceId[]
  /** Minutes the step lasts (for calendar blocks). */
  minutes: number
}

export function windDown(p: Profile): WindDownStep[] {
  const t = mealTimes(p, 0)
  const sleepFor = (((t.wake - t.bed) % 1440) + 1440) % 1440 || 1440
  const steps: WindDownStep[] = []
  if (p.caffeine) steps.push({ at: t.bed - 8 * 60, minutes: 5, label: 'Caffeine cutoff', detail: 'Caffeine even 6 hours before bed cut sleep by about an hour in a controlled study.', sources: ['drake'] })
  steps.push({ at: t.lastFood, minutes: 5, label: 'Last food of the day', detail: hasCondition(p, 'gerd') ? 'At least 3 hours before bed, for reflux.' : 'Finishing a few hours before bed is linked to less reflux.', sources: ['acg_gerd'] })
  steps.push({ at: t.bed - 60, minutes: 60, label: 'Dim lights, screens away', detail: 'Bright screens before bed delayed sleep and reduced next-morning alertness.', sources: ['chang_ereader', 'gooley'] })
  steps.push({ at: t.bed, minutes: sleepFor, label: 'Lights out', detail: `Aim for ${formatHours(sleepFor)} in bed, the same time every night.`, sources: ['watson_sleep', 'windred'] })
  steps.push({ at: t.wake + 1440, minutes: 15, label: 'Wake up and get daylight', detail: 'Morning light sets your body clock for the day.', sources: ['blume'] })
  return steps.sort((a, b) => a.at - b.at)
}

/** The wind-down routine as dated tasks for the next 7 nights, starting tonight. */
export function buildSleepTaskLists(p: Profile, today = new Date()): TaskListDraft[] {
  const steps = windDown(p)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tasks: TaskDraft[] = []
  for (let night = 0; night < 7; night++) {
    for (const s of steps) {
      // Steps past midnight (waking up, a 1 am bedtime) belong to the next calendar day.
      const day = new Date(start)
      day.setDate(day.getDate() + night + Math.floor(s.at / 1440))
      const at = ((s.at % 1440) + 1440) % 1440
      const weekday = day.toLocaleDateString('en-US', { weekday: 'short' })
      tasks.push({
        title: `${weekday} ${formatTime(at)} · ${s.label}`,
        notes: s.detail,
        due: iso(day),
        at,
        minutes: s.minutes,
      })
    }
  }
  // Bedtime and waking are anchors, not tasks to fit in: Onyx keeps them as exact blocks.
  return [{ title: `Sleep schedule · from ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`, tag: 'sleep', onyx: 'fixed', tasks }]
}

/** Advice when the planned bed and wake times leave too little time to sleep. */
export function scheduleAdvice(a: SleepAnalysis): string | null {
  if (a.planned.minutes >= a.target.min + 30) return null
  const bed = a.planned.wake + 1440 - (a.target.min + 30)
  return `Your schedule leaves ${formatHours(a.planned.minutes)} in bed. Falling asleep and brief wakings take time, so aim for about ${formatHours(a.target.min + 30)} in bed to sleep ${formatHours(a.target.min)}: lights out by ${formatTime(bed)}.`
}
