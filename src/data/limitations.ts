import type { Claim } from './conditions'
import type { Stress } from './exercises'

/**
 * Physical limitations someone can set on the Train tab. Each one rules out exercises that load
 * the problem area (by their Stress flags), can add a little targeted work, and explains why.
 * The plan changes the moment one is switched on or off.
 *
 * None of this replaces a clinician or physiotherapist: every limitation says so.
 */
export type LimitationId =
  | 'shoulder' | 'elbow_wrist' | 'lower_back' | 'knee' | 'hip' | 'osteoporosis'
  | 'balance' | 'heart' | 'eye' | 'hernia' | 'floor'

export interface Limitation {
  id: LimitationId
  label: string
  /** Examples, so people recognise themselves. */
  detail: string
  avoid: Stress[]
  /** Keep at least this many reps in reserve on every set (no straining to failure). */
  minRir?: number
  /** Exercises added on two days a week, with their dose. */
  adds?: { exercise: string; sets: number; reps: string; note: string }[]
  /** What it means for training, with evidence. */
  claims: Claim[]
  /** One plain tip shown with the plan. */
  tip: string
}

const SEE_CLINICIAN = 'If pain is sharp, getting worse, or you’ve had a recent injury or surgery, get advice from a doctor or physiotherapist first.'

export const LIMITATIONS: Limitation[] = [
  {
    id: 'shoulder', label: 'Shoulder pain or injury', detail: 'Impingement, rotator cuff problems, a past dislocation',
    avoid: ['overhead', 'shoulder_deep', 'hanging'],
    adds: [{ exercise: 'band_external_rotation', sets: 2, reps: '12–15', note: 'Strengthens the rotator cuff, the small muscles that keep the shoulder joint centred. Light and slow.' }],
    claims: [
      { text: 'For shoulder impingement, exercise therapy reduced pain and improved function in a meta-analysis of randomised trials, and it’s the recommended first step.', evidence: 'moderate', sources: ['steuri_2017'] },
      { text: 'Raising the arms above shoulder height, or with the thumbs turned down, is linked to signs of impingement, so presses go angled (landmine) or stay at chest height, and raises stop at shoulder height.', evidence: 'limited', sources: ['pm_24077379', 'pm_16282575'] },
    ],
    tip: `Overhead presses, dips and hanging are swapped for chest-height and angled pressing. Mild discomfort that settles within a day is usually OK; ${SEE_CLINICIAN.toLowerCase()}`,
  },
  {
    id: 'elbow_wrist', label: 'Elbow or wrist pain', detail: 'Tennis or golfer’s elbow, sore wrists, arthritis in the hands',
    avoid: ['wrist_load'],
    claims: [
      { text: 'Push-ups and planks on the hands bend the wrists back under body weight. Machines, cables and dumbbells let you keep the wrists straight; a neutral (palms-in) grip is often more comfortable.', evidence: 'limited', sources: [] },
    ],
    tip: `Exercises on your hands are swapped out. Keep wrists straight and grips neutral where you can. ${SEE_CLINICIAN}`,
  },
  {
    id: 'lower_back', label: 'Low back pain', detail: 'Ongoing or returning lower back pain',
    avoid: ['spine_load'],
    claims: [
      { text: 'Exercise therapy reduced pain and improved function in chronic low back pain in a Cochrane review of 249 trials.', evidence: 'strong', sources: ['pm_34580864'] },
      { text: 'Special “core stability” exercises were no better than other exercise, so pick what you’ll keep doing.', evidence: 'moderate', sources: ['pm_26742533'] },
      { text: 'Chest-supported rows load the lower back least of the rows tested, so they replace bent-over rows; heavy barbell squats and deadlifts give way to leg press, goblet squats and supported hinges.', evidence: 'limited', sources: ['pm_19197209'] },
    ],
    tip: `Heavy spine-loading lifts are swapped for supported versions. Some soreness that eases within a day is normal; ${SEE_CLINICIAN.toLowerCase()}`,
  },
  {
    id: 'knee', label: 'Knee pain or arthritis', detail: 'Osteoarthritis, kneecap pain, a past knee injury or replacement',
    avoid: ['deep_knee', 'kneeling'],
    claims: [
      { text: 'Exercise reduced pain and improved function in knee osteoarthritis in a Cochrane review, and the OARSI guideline strongly recommends it as a core treatment.', evidence: 'strong', sources: ['fransen_knee', 'oarsi_2019'] },
    ],
    tip: `Deep loaded knee bends and kneeling are swapped for box squats, leg press, step-ups and leg extensions in a comfortable range. ${SEE_CLINICIAN}`,
  },
  {
    id: 'hip', label: 'Hip pain or arthritis', detail: 'Osteoarthritis, a hip replacement, hip impingement',
    avoid: ['deep_hip'],
    claims: [
      { text: 'Exercise reduced pain and improved physical function in hip osteoarthritis in a Cochrane review, and the OARSI guideline recommends it.', evidence: 'moderate', sources: ['fransen_hip', 'oarsi_2019'] },
    ],
    tip: `Deep squats are swapped for box squats, bridges and hip thrusts. After a hip replacement, follow your surgeon’s movement precautions. ${SEE_CLINICIAN}`,
  },
  {
    id: 'osteoporosis', label: 'Osteoporosis or low bone density', detail: 'Including a past spine fracture',
    avoid: ['spine_flexion', 'spine_twist'],
    adds: [{ exercise: 'superman', sets: 2, reps: '8–10, 3 s hold', note: 'Strengthens the muscles along the spine, which support posture and protect the spine.' }],
    claims: [
      { text: 'Expert recommendations advise strength training at least twice a week plus balance training, and avoiding repeated or loaded bending forward and twisting of the spine (sit-ups, crunches, toe touches).', evidence: 'moderate', sources: ['tftf_2014', 'ssst_2022'] },
      { text: 'In postmenopausal women with low bone mass, supervised heavy lifting and impact training improved bone density in a trial. Get coached form before going heavy.', evidence: 'moderate', sources: ['liftmor'] },
    ],
    tip: 'Crunches, sit-ups and twisting are swapped for planks, Pallof presses and back extensions. Hinge at the hips with a straight back when lifting anything.',
  },
  {
    id: 'balance', label: 'Balance problems or fall risk', detail: 'Unsteady on one leg, past falls, dizziness',
    avoid: ['balance'],
    claims: [
      { text: 'Exercise programmes, especially balance and functional exercise, reduced the rate of falls in older people living at home in a Cochrane review.', evidence: 'strong', sources: ['sherrington_falls'] },
    ],
    tip: 'Single-leg and unsupported exercises are swapped for supported ones. Hold a rail or wall whenever you need to, and add simple balance practice (standing on one foot near a counter).',
  },
  {
    id: 'heart', label: 'Heart condition', detail: 'Heart disease, a past heart attack, heart failure, arrhythmia',
    avoid: [], minRir: 3,
    claims: [
      { text: 'ACSM advises people with heart disease to get medical clearance before starting moderate or vigorous exercise.', evidence: 'strong', sources: ['riebe_screening'] },
      { text: 'Heavy sets push blood pressure very high, and holding your breath pushes it higher, so every set stops at least 3 reps short of failure and you breathe through every rep.', evidence: 'moderate', sources: ['pm_3980383', 'pm_7741618'] },
    ],
    tip: 'Every set stops well short of failure. Breathe out on the effort, never hold your breath, and check with your cardiologist or cardiac rehab team first.',
  },
  {
    id: 'eye', label: 'Glaucoma or recent eye surgery', detail: 'Or another condition where eye pressure matters',
    avoid: ['head_down'], minRir: 2,
    claims: [
      { text: 'Holding your breath on hard reps about doubled the rise in eye pressure in a study.', evidence: 'limited', sources: ['pm_16966619'] },
      { text: 'Hanging upside down more than doubled eye pressure, so head-down positions are left out.', evidence: 'moderate', sources: ['friberg_inversion'] },
    ],
    tip: 'Head-down exercises are swapped out and sets stop short of failure. Keep breathing on every rep.',
  },
  {
    id: 'hernia', label: 'Hernia or recent abdominal surgery', detail: 'Inguinal, umbilical or hiatal hernia, or after a repair',
    avoid: ['spine_load', 'spine_flexion', 'hanging'], minRir: 2,
    claims: [
      { text: 'After a groin hernia repair, the international guideline recommends going back to normal activity without set restrictions as soon as it feels comfortable; follow your own surgeon’s advice.', evidence: 'moderate', sources: ['herniasurge_2018'] },
      { text: 'Holding your breath on hard efforts raises pressure sharply, so while this is switched on, heavy spine-loading lifts and crunches are left out and sets stop short of failure. Turn it off once you’re comfortable and cleared.', evidence: 'limited', sources: ['pm_7741618'] },
    ],
    tip: 'Ease back in as comfort allows and follow your surgeon’s advice. Breathe out on the effort and stop any exercise that brings on a bulge or pain.',
  },
  {
    id: 'floor', label: 'Getting down to the floor is hard', detail: 'Stiff knees or hips, or getting back up is a struggle',
    avoid: ['floor', 'kneeling'],
    claims: [
      { text: 'Floor exercises are swapped for standing, seated and bench versions so you never need to get down and back up.', evidence: 'limited', sources: [] },
    ],
    tip: 'Everything is done standing, seated or on a bench.',
  },
]

export const LIMITATION_BY_ID = Object.fromEntries(LIMITATIONS.map((l) => [l.id, l])) as Record<LimitationId, Limitation>
