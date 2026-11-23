import type { Claim } from '../data/conditions'
import { HEAD_INFO, HEADS, isLift, kindOf, MUSCLE_LABEL, REGION_LABEL, type Exercise, type Gear, type HeadId, type Stress } from '../data/training'

/**
 * What changes when you swap one exercise for another, and why: which muscles and muscle heads get
 * more or less work, the equipment's effect on load and balance, stretch-position loading, joint
 * stress and time. Built from each exercise's data, so every swap gets an explanation.
 */
export type SwapTone = 'gain' | 'lose' | 'info'
export interface SwapPoint { tone: SwapTone; text: string; claim?: Claim; convention?: string }
export interface SwapComparison { summary: string; claim?: Claim; points: SwapPoint[] }

type Style = 'machine' | 'cable' | 'free' | 'suspension' | 'band' | 'bodyweight'
const MACHINE: Gear[] = ['smith', 'leg_press', 'leg_ext', 'leg_curl', 'chest_press', 'shoulder_press', 'row_machine', 'pec_deck', 'calf_machine', 'back_ext']
const FREE: Gear[] = ['barbell', 'dumbbell', 'kettlebell', 'trap_bar', 'landmine']

/** The equipment that shapes how an exercise feels: a guided machine beats a bench, and so on. */
export function styleOf(e: Exercise): Style {
  const g = e.gear.flatMap((x) => (Array.isArray(x) ? [x[0]] : [x]))
  if (g.some((x) => MACHINE.includes(x))) return 'machine'
  if (g.some((x) => x === 'cable' || x === 'cable_dual')) return 'cable'
  if (g.some((x) => FREE.includes(x))) return 'free'
  if (g.includes('suspension')) return 'suspension'
  if (g.some((x) => x === 'band' || x === 'mini_band')) return 'band'
  return 'bodyweight'
}

const HAUGEN: Claim = { text: 'Free weights and machines built similar muscle in pooled trials; strength gains were biggest on the kind of equipment people trained with.', evidence: 'moderate', sources: ['pm_37582807'] }
const LOAD: Claim = { text: 'Light and heavy loads built similar muscle when sets were taken close to failure.', evidence: 'strong', sources: ['schoenfeld_load', 'lopez_load'] }
const LONG: Claim = { text: 'Training a muscle where it is stretched (long muscle lengths) grew it as much as or more than training it where it is short, in several trials.', evidence: 'emerging', sources: ['kassiano_rom', 'maeo_hamstring', 'pedrosa_long', 'pm_35819335'] }
const STRETCH_ANY: Claim = { text: 'Regular stretching improved range of motion whatever the technique; comfortable stretches worked about as well as intense ones.', evidence: 'strong', sources: ['konrad_stretch', 'ingram_dose'] }
const BALANCE_ANY: Claim = { text: 'Balance training improved balance in older adults; doing it regularly, about 3 times a week, mattered most.', evidence: 'moderate', sources: ['lesinski_balance'] }
const COACHING = 'How the equipment feels is common coaching knowledge rather than something trials have compared head to head.'

const STYLE_TEXT: Record<Style, string> = {
  machine: 'A machine guides the path: quick to learn, safe to push close to failure, and little balance needed. The strength you build shows most on that machine.',
  cable: 'Cables keep tension on the muscle all the way through, including the stretched part, and make it easy to change the angle.',
  free: 'Free weights make you steady the load yourself, which works the smaller stabilising muscles and carries over to lifting things in daily life, but they take more practice.',
  suspension: 'Suspension straps use your body weight: change the lean to make it easier or harder, and your core works to keep you straight.',
  band: 'A band gets harder as it stretches, so the end of each rep is hardest and the stretched start is easiest. Progress with a stronger band or more reps.',
  bodyweight: 'It uses your body weight, so progress comes from more reps, slower lowering or harder versions rather than adding weight.',
}

const STRESS_TEXT: Record<Stress, string> = {
  overhead: 'arms overhead under load', shoulder_deep: 'a deep stretch across the front of the shoulder', hanging: 'hanging from a bar',
  wrist_load: 'weight on bent-back wrists', spine_flexion: 'curling the spine', spine_twist: 'twisting the spine', spine_load: 'heavy load through the spine',
  deep_knee: 'deep knee bending', kneeling: 'kneeling', deep_hip: 'a deep hip bend', balance: 'balancing without support', head_down: 'the head below the heart',
  floor: 'getting down to the floor', prone: 'lying face down',
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)
const heads = (ids: HeadId[]) => list(ids.slice(0, 3).map((h) => HEAD_INFO[h].label.toLowerCase()))
const stresses = (e: Exercise) => new Set<Stress>((e.stress ?? []).filter((s) => !(s === 'balance' && e.support)))

function stressPoints(from: Exercise, to: Exercise): SwapPoint[] {
  const a = stresses(from)
  const b = stresses(to)
  const out: SwapPoint[] = []
  const gone = [...a].filter((s) => !b.has(s)).map((s) => STRESS_TEXT[s])
  const added = [...b].filter((s) => !a.has(s)).map((s) => STRESS_TEXT[s])
  if (gone.length) out.push({ tone: 'gain', text: `Easier on the body: no ${list(gone)}.` })
  if (added.length) out.push({ tone: 'lose', text: `Adds ${list(added)}, so skip it if that bothers you.` })
  if (from.supine !== to.supine) out.push({ tone: 'info', text: to.supine ? 'Done lying on your back.' : 'Not done lying on your back, which suits later pregnancy.' })
  return out
}

function liftComparison(from: Exercise, to: Exercise): SwapComparison {
  const points: SwapPoint[] = []
  const hf = HEADS[from.id]
  const ht = HEADS[to.id]
  const target = MUSCLE_LABEL[to.primary[0]]?.toLowerCase() ?? 'target muscle'
  const samePrimary = from.primary[0] === to.primary[0]

  // Which parts of the muscle do the work.
  if (hf && ht) {
    const more = ht.prime.filter((h) => !hf.prime.includes(h))
    const less = hf.prime.filter((h) => !ht.prime.includes(h))
    if (more.length) points.push({ tone: 'gain', text: `Puts more of the work on the ${heads(more)}.` })
    if (less.length) points.push({ tone: 'lose', text: `Less direct work for the ${heads(less)}.` })
    const helpers = ht.assist.filter((h) => !hf.assist.includes(h) && !hf.prime.includes(h) && !ht.prime.includes(h))
    if (helpers.length && points.length < 3) points.push({ tone: 'info', text: `The ${heads(helpers)} help${helpers.length > 1 ? '' : 's'} more.` })
  }
  const newSecondary = to.secondary.filter((m) => !from.secondary.includes(m) && !from.primary.includes(m))
  const lostSecondary = from.secondary.filter((m) => !to.secondary.includes(m) && !to.primary.includes(m))
  if (newSecondary.length) points.push({ tone: 'gain', text: `Some helper work for your ${list(newSecondary.map((m) => MUSCLE_LABEL[m].toLowerCase()))} too.` })
  if (lostSecondary.length) points.push({ tone: 'lose', text: `No helper work for your ${list(lostSecondary.map((m) => MUSCLE_LABEL[m].toLowerCase()))}, which ${from.name} gave; the weekly set count in How it works shows if that leaves a gap.` })

  // One joint or several.
  if (from.compound && !to.compound) points.push({ tone: 'info', text: `An isolation exercise: one joint moves, so it’s easier to take your ${target} close to failure with less overall tiredness, but it trains fewer muscles and builds less all-round strength.` })
  if (!from.compound && to.compound) points.push({ tone: 'info', text: `A compound lift: several joints and muscles at once, heavier loads and more all-round strength, but more tiring, and your ${target} may not be what ends the set.` })

  // Equipment.
  const sf = styleOf(from)
  const st = styleOf(to)
  const bar = (e: Exercise) => e.gear.includes('barbell') || e.gear.includes('smith')
  const dbs = (e: Exercise) => e.gear.some((g) => (Array.isArray(g) ? g[0] : g) === 'dumbbell')
  if (bar(to) && dbs(from)) points.push({ tone: 'info', text: 'A bar lets you lift the most weight and add it in small steps, but it fixes your hands in place, which some shoulders and wrists dislike.', convention: COACHING })
  if (dbs(to) && bar(from)) points.push({ tone: 'info', text: 'Dumbbells let each arm move freely and go a little deeper, and a weaker side can’t lean on the stronger one, but you’ll handle less total weight.', convention: COACHING })
  if (sf !== st) points.push({ tone: 'info', text: STYLE_TEXT[st], ...(sf === 'machine' || st === 'machine' || (sf === 'free' && st !== 'band') || st === 'free' ? { claim: HAUGEN } : { convention: COACHING }) })

  // Where in the range the muscle is loaded.
  if (to.long && !from.long) points.push({ tone: 'gain', text: 'Loads the muscle hardest where it’s stretched, which trials link to as much or more growth.', claim: LONG })
  if (from.long && !to.long) points.push({ tone: 'lose', text: 'Less load in the stretched position, which trials suggest helps growth. Lower slowly through the full range to make up some of it.', claim: LONG })

  points.push(...stressPoints(from, to))
  if (to.unilateral && !from.unilateral) points.push({ tone: 'info', text: 'One side at a time: evens out left–right differences and adds a balance challenge, but each set takes about twice as long.' })
  if (from.unilateral && !to.unilateral) points.push({ tone: 'info', text: 'Both sides at once: quicker, and usually a heavier total load, but a stronger side can hide a weaker one.' })
  points.push({ tone: 'info', text: `Your logged weights for ${from.name} don’t carry over: start a little lighter and settle on a weight over the first session or two.` })

  const summary = samePrimary
    ? `Same main muscle and the same sets, so your ${target} should grow about as well as long as the sets stay hard. What changes is which part works most, how you load it, and what it asks of your joints.`
    : `This trains your ${list(to.primary.map((m) => MUSCLE_LABEL[m].toLowerCase()))} instead of your ${list(from.primary.map((m) => MUSCLE_LABEL[m].toLowerCase()))}, so the week’s balance of muscles shifts.`
  return { summary, claim: samePrimary ? LOAD : undefined, points }
}

function holdComparison(from: Exercise, to: Exercise): SwapComparison {
  const points: SwapPoint[] = []
  const ka = kindOf(from)
  const kb = kindOf(to)
  if (kb === 'balance' || ka === 'balance') {
    if (to.support && !from.support) points.push({ tone: 'gain', text: 'Can be done holding a counter, so it’s safer if you’re unsteady.' })
    if (!to.support && from.support) points.push({ tone: 'lose', text: 'Done without holding on: harder, so keep a counter within reach.' })
    points.push(...stressPoints(from, to))
    if (to.hold !== from.hold && to.hold) points.push({ tone: 'info', text: `The dose changes to ${to.hold}.` })
    return { summary: 'Any balance drill trains balance; doing some regularly matters more than which one. What changes is how hard it is and what it asks of you.', claim: BALANCE_ANY, points }
  }
  const ra = from.regions ?? []
  const rb = to.regions ?? []
  const more = rb.filter((r) => !ra.includes(r)).map((r) => REGION_LABEL[r].toLowerCase())
  const less = ra.filter((r) => !rb.includes(r)).map((r) => REGION_LABEL[r].toLowerCase())
  if (more.length) points.push({ tone: 'gain', text: `Also stretches your ${list(more)}.` })
  if (less.length) points.push({ tone: 'lose', text: `No longer stretches your ${list(less)}; another stretch in the week may cover ${less.length > 1 ? 'them' : 'it'}.` })
  if (ka !== kb) {
    points.push(kb === 'yoga'
      ? { tone: 'info', text: 'A yoga pose: you hold a position while breathing slowly, often stretching several areas and working some strength and balance at the same time.' }
      : { tone: 'info', text: 'A targeted stretch or drill: it aims at one area, so it’s easier to feel exactly where it works.' })
  }
  points.push(...stressPoints(from, to))
  if (to.hold && to.hold !== from.hold) points.push({ tone: 'info', text: `The dose changes to ${to.hold}.` })
  return { summary: 'Stretching works whichever way you do it; what changes is which areas get stretched and what the position asks of you.', claim: STRETCH_ANY, points }
}

/** How swapping `from` for `to` changes your results, and why. */
export function compareExercises(from: Exercise, to: Exercise): SwapComparison {
  return isLift(from) && isLift(to) ? liftComparison(from, to) : holdComparison(from, to)
}

const STYLE_LABEL: Record<Style, string> = { machine: 'Machine', cable: 'Cable', free: 'Free weights', suspension: 'Suspension straps', band: 'Band', bodyweight: 'Body weight' }
const KIND_LABEL = { mobility: 'Stretch', yoga: 'Yoga pose', balance: 'Balance drill', strength: '' } as const
/** "Compound · Free weights" or "Yoga pose · 5 breaths each side". */
export const swapTag = (e: Exercise) => (isLift(e) ? `${e.compound ? 'Compound' : 'Isolation'} · ${STYLE_LABEL[styleOf(e)]}` : `${KIND_LABEL[kindOf(e)]}${e.hold ? ` · ${e.hold}` : ''}`)

/** The two or three points worth showing before you open the full comparison. */
export function headline(c: SwapComparison): SwapPoint[] {
  const useful = c.points.filter((p) => !p.text.startsWith('Your logged weights'))
  const strong = useful.filter((p) => p.tone !== 'info' || p.claim)
  return (strong.length ? strong : useful).slice(0, 3)
}
