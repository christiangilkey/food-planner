import type { Claim } from './conditions'
import type { Region } from './exercises'

/**
 * Posture and mobility goals someone can pick on the Train tab. Each one adds stretches for the
 * regions involved and a little strength work, and says plainly how much the evidence supports it.
 *
 * Posture is only loosely linked to pain, and "ideal" posture varies from person to person, so the
 * goals are framed as comfort, strength and range of motion, never as fixing a defect.
 */
export type PostureGoalId = 'forward_head' | 'rounded_shoulders' | 'upper_back' | 'pelvic_tilt' | 'desk' | 'overhead' | 'squat_depth'

export interface PostureGoal {
  id: PostureGoalId
  label: string
  detail: string
  /** Regions to stretch more. */
  stretch: Region[]
  /** Work added to two days a week; the first option that fits your equipment and body is used. */
  strengthen: { options: string[]; sets: number; reps: string; note: string }[]
  claims: Claim[]
  /** Where the choice of exercises is this app's own. */
  convention: string
  /** One plain sentence shown with the goal. */
  tip: string
}

const ROW = ['chest_db_row', 'chest_row', 'cable_row', 'db_row', 'band_row', 'trx_row', 'inverted_row']
const REAR = ['face_pull', 'band_face_pull', 'reverse_pec_deck', 'rear_fly', 'band_pull_apart', 'trx_y']
const POSTURE_TRIALS: Claim = {
  text: 'In people with forward head, rounded shoulders or a rounded upper back, programs of strengthening and stretching improved those angles in a meta-analysis of small trials.',
  evidence: 'emerging', sources: ['sepehri'],
}
const NO_PERFECT_POSTURE: Claim = {
  text: 'There’s no strong evidence that sitting, standing or bending “incorrectly” causes back or neck pain; experts suggest changing position often rather than holding one ideal posture.',
  evidence: 'limited', sources: ['slater_posture'],
}
const RANGE: Claim = {
  text: 'Regular stretching for several weeks clearly improves range of motion, and lifting through a full range improves it about as much.',
  evidence: 'strong', sources: ['konrad_stretch', 'alizadeh_rom'],
}

export const POSTURE_GOALS: PostureGoal[] = [
  {
    id: 'forward_head', label: 'Forward head (“tech neck”)', detail: 'Your head sits in front of your shoulders',
    stretch: ['neck', 'chest'],
    strengthen: [
      { options: ['chin_tucks'], sets: 2, reps: '10, 3-second hold', note: 'Trains the deep neck muscles that hold the head back over the shoulders.' },
      { options: REAR, sets: 2, reps: '12–15', note: 'Works the upper back and the back of the shoulders.' },
    ],
    claims: [POSTURE_TRIALS, NO_PERFECT_POSTURE],
    convention: 'The exercise choice and doses are this app’s, based on the kinds of exercise used in the trials.',
    tip: 'Move your screen up to eye level and change position often; no single “perfect” posture is needed.',
  },
  {
    id: 'rounded_shoulders', label: 'Rounded shoulders', detail: 'Shoulders roll forward, chest feels tight',
    stretch: ['chest', 'upper_back'],
    strengthen: [
      { options: REAR, sets: 2, reps: '12–15', note: 'Strengthens the muscles that draw the shoulders back.' },
      { options: ['band_external_rotation', 'cable_external_rotation'], sets: 2, reps: '12–15', note: 'Strengthens the rotator cuff, which turns the arm outward.' },
    ],
    claims: [POSTURE_TRIALS, NO_PERFECT_POSTURE],
    convention: 'The exercise choice and doses are this app’s, based on the kinds of exercise used in the trials.',
    tip: 'Stretch the chest, then strengthen the upper back; done 2–3 times a week, changes show up over months.',
  },
  {
    id: 'upper_back', label: 'Rounded upper back', detail: 'A hunch between the shoulder blades',
    stretch: ['upper_back', 'chest'],
    strengthen: [
      { options: ROW, sets: 2, reps: '10–12', note: 'Rows strengthen the muscles between the shoulder blades.' },
      { options: ['back_ext', 'superman'], sets: 2, reps: '8–10', note: 'Back extensions strengthen the muscles that hold the upper back upright.' },
    ],
    claims: [
      { text: 'Exercise, especially back strengthening, modestly improves a rounded upper back in trials.', evidence: 'moderate', sources: ['ponzano_kyphosis', 'gonzalez_kyphosis', 'katzman_sheaf'] },
      POSTURE_TRIALS,
    ],
    convention: 'The exercise choice and doses are this app’s, based on the back-strengthening trials.',
    tip: 'If the rounding is new, getting worse, or you’re losing height, mention it to your doctor: it can be a sign of spine fractures.',
  },
  {
    id: 'pelvic_tilt', label: 'Anterior pelvic tilt', detail: 'Pelvis tipped forward, a deep lower-back curve',
    stretch: ['hip_flexors', 'quads'],
    strengthen: [
      { options: ['glute_bridge', 'db_hip_thrust', 'hip_thrust'], sets: 2, reps: '10–12', note: 'Strong glutes help you hold the pelvis level when you want to.' },
      { options: ['dead_bug', 'plank', 'reverse_crunch'], sets: 2, reps: '8–10 slow', note: 'Trains the abs to control the pelvis and lower back.' },
      { options: ['pelvic_tilt'], sets: 2, reps: '10 slow', note: 'Practises tipping the pelvis back, so you can feel and control the position.' },
    ],
    claims: [
      { text: 'In 120 healthy young adults, 85% of men and 75% of women had some forward pelvic tilt, so it is normal, not a defect.', evidence: 'emerging', sources: ['herrington_tilt'] },
      { text: 'Across 13 studies, people with low back pain tended to have a flatter lower-back curve than people without it, not a deeper one.', evidence: 'moderate', sources: ['chun_lordosis'] },
      { text: 'Stretching the hip flexors increased how far the hip extends in a trial of people with stiff hips.', evidence: 'emerging', sources: ['pm_15330693'] },
    ],
    convention: 'Stretching the hip flexors and strengthening the glutes and abs is a common coaching approach; no good trial shows it changes the tilt much. Do it for comfort, range and strength.',
    tip: 'A forward tilt is common and usually harmless; this adds range and control rather than “fixing” it.',
  },
  {
    id: 'desk', label: 'Stiff from sitting all day', detail: 'Tight hips, hamstrings and upper back after desk work',
    stretch: ['hip_flexors', 'hamstrings', 'upper_back', 'chest'],
    strengthen: [
      { options: ['glute_bridge', 'db_hip_thrust', 'hip_thrust'], sets: 2, reps: '10–12', note: 'Works the hips through the range that long sitting leaves unused.' },
    ],
    claims: [NO_PERFECT_POSTURE, RANGE],
    convention: 'The stretches chosen for desk stiffness are this app’s choice.',
    tip: 'Get up every 30–60 minutes for a minute or two; the after-meal walks on your schedule help too.',
  },
  {
    id: 'overhead', label: 'Stiff reaching overhead', detail: 'Arms won’t go straight up without arching the back',
    stretch: ['lats', 'chest', 'upper_back'],
    strengthen: [
      { options: ['wall_angel'], sets: 2, reps: '10 slow', note: 'Practises reaching up while keeping the ribs down.' },
      { options: REAR, sets: 2, reps: '12–15', note: 'Strengthens the upper back and rear shoulders that guide the arm overhead.' },
    ],
    claims: [RANGE],
    convention: 'The exercise choice and doses are this app’s.',
    tip: 'If reaching overhead is painful rather than stiff, set the shoulder limitation instead and see a physiotherapist.',
  },
  {
    id: 'squat_depth', label: 'Squat depth and stiff ankles', detail: 'Heels lift or the back rounds before you reach depth',
    stretch: ['calves', 'adductors', 'glutes'],
    strengthen: [
      { options: ['goblet', 'box_squat', 'trx_squat'], sets: 2, reps: '8, 3-second pause at the bottom', note: 'Pausing at the bottom of a squat builds depth with load.' },
    ],
    claims: [
      { text: 'Calf stretching increased ankle bend (dorsiflexion) by a small amount in pooled trials.', evidence: 'moderate', sources: ['pm_16926259'] },
      RANGE,
    ],
    convention: 'The exercise choice and doses are this app’s.',
    tip: 'Raising the heels on small plates is a fine way to squat deeper while your ankles loosen up.',
  },
]

export const POSTURE_GOAL_BY_ID = Object.fromEntries(POSTURE_GOALS.map((g) => [g.id, g])) as Record<PostureGoalId, PostureGoal>

/** What stretching, yoga and balance days do, with the evidence. */
export const DAY_TYPE_CLAIMS: Record<'stretch' | 'yoga' | 'balance', Claim[]> = {
  stretch: [
    { text: 'Stretching regularly for several weeks clearly improves flexibility; about 10 minutes per muscle group a week captured most of the gain, and comfortable stretches worked about as well as intense ones.', evidence: 'strong', sources: ['konrad_stretch', 'ingram_dose'] },
    { text: 'Stretching didn’t reduce sports injuries or next-day soreness in pooled trials; strength training does more for injuries.', evidence: 'strong', sources: ['lauersen', 'herbert_doms'] },
  ],
  yoga: [
    { text: 'In people aged 60 and over, yoga gave small improvements in balance and medium improvements in mobility.', evidence: 'moderate', sources: ['youkhana_yoga'] },
    { text: 'For chronic low back pain, yoga gave small improvements in pain and function compared with no exercise, and about the same as other back exercise.', evidence: 'moderate', sources: ['wieland_yoga'] },
  ],
  balance: [
    { text: 'Balance training improved balance in healthy older adults; about 3 sessions a week for 11–12 weeks worked best.', evidence: 'moderate', sources: ['lesinski_balance'] },
    { text: 'Exercise programmes, especially balance and functional exercise, reduced the rate of falls in older people living at home.', evidence: 'strong', sources: ['sherrington_falls'] },
  ],
}
