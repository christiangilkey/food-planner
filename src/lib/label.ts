import type { LabelFacts, LabelKey } from '../types'

/**
 * Reads US Nutrition Facts text (from on-device OCR of a label photo) into numbers. OCR is
 * imperfect, so everything it finds is shown in an editable form before it's saved.
 */
export interface ParsedLabel {
  label: LabelFacts
  servingGrams?: number
  servingsPerContainer?: number
  /** How many values were found, to judge whether the photo was readable. */
  found: number
}

type Unit = 'g' | 'mg' | 'µg'

// Checked in order: the first pattern that matches a line decides what the line is.
const LINES: { key: LabelKey | null; re: RegExp; unit: Unit }[] = [
  { key: 'addedSugar', re: /added\s*sugars?/i, unit: 'g' },
  { key: 'satFat', re: /sat(?:urated|\.)?\s*fat/i, unit: 'g' },
  { key: null, re: /trans\s*fat|polyunsat|monounsat|cholest/i, unit: 'g' },
  { key: 'fat', re: /total\s*fat|^\s*fat\b/i, unit: 'g' },
  { key: 'sodium', re: /sodium/i, unit: 'mg' },
  { key: 'carbs', re: /carb/i, unit: 'g' },
  { key: 'fiber', re: /fib(?:er|re)/i, unit: 'g' },
  { key: 'sugar', re: /sugar/i, unit: 'g' },
  { key: 'protein', re: /protein/i, unit: 'g' },
  { key: 'vitD', re: /vit(?:amin|\.)?\s*d\b/i, unit: 'µg' },
  { key: 'calcium', re: /calcium/i, unit: 'mg' },
  { key: 'iron', re: /\biron\b/i, unit: 'mg' },
  { key: 'potassium', re: /potas/i, unit: 'mg' },
]

/** Fix the usual OCR slips inside numbers: O→0, l/I→1, "1 2g" → "12g" is left alone. */
function cleanNumbers(text: string): string {
  return text
    .replace(/(?<=\d)[oO](?=\d|[ \t%]|$|m?c?g\b)/gm, '0')
    .replace(/(?<=\s|^)[oO](?=\s*m?c?g\b)/g, '0')
    .replace(/(?<=\d)[lI](?=\d)/g, '1')
    .replace(/(?<=\s)[lI](?=\d)/g, '1')
    .replace(/µg|(?<=\d\s?)ug\b/g, 'mcg')
}

const NUMBER = String.raw`(<\s*)?(\d+(?:[.,]\d+)?)\s*(mcg|mg|mq|rng|g|iu)?`

/** The amount on a nutrient line (the number right after the name, not the % Daily Value). */
function amount(line: string, unit: Unit): number | undefined {
  const m = new RegExp(NUMBER, 'i').exec(line)
  if (!m) return undefined
  const [, less, raw, rawUnit] = m
  let v = Number(raw.replace(',', '.'))
  if (!Number.isFinite(v)) return undefined
  if (less) v = v / 2 // "<1g": count half
  const u = rawUnit?.toLowerCase()
  if (!u && unit === 'g' && raw.length >= 2 && raw.endsWith('9') && !raw.includes('.')) {
    // OCR often reads the "g" as a 9: "Protein 129" is 12 g.
    v = Number(raw.slice(0, -1))
  }
  if (u === 'iu') return unit === 'µg' ? v / 40 : undefined // vitamin D: 40 IU = 1 µg
  if (u === 'mcg' && unit === 'mg') return v / 1000
  if ((u === 'mg' || u === 'mq' || u === 'rng') && unit === 'g') return v / 1000
  if ((u === 'mg' || u === 'mq' || u === 'rng') && unit === 'µg') return v * 1000
  if (u === 'g' && unit === 'mg') return v * 1000
  return v
}

export function parseNutritionLabel(text: string): ParsedLabel {
  const clean = cleanNumbers(text)
  const label: LabelFacts = {}

  const serving = /serving\s*size[^\n]*?\(\s*(\d+(?:\.\d+)?)\s*(?:g|ml)\s*\)/i.exec(clean) ?? /serving\s*size[^\n]*?(\d+(?:\.\d+)?)\s*(?:g|ml)\b/i.exec(clean)
  const servingGrams = serving ? Number(serving[1]) : undefined
  const per = /(\d+(?:\.\d+)?)\s*servings?\s*per\s*(?:container|package)/i.exec(clean) ?? /servings?\s*per\s*(?:container|package)\s*(?:about\s*)?(\d+(?:\.\d+)?)/i.exec(clean)
  const servingsPerContainer = per ? Number(per[1]) : undefined

  // The first "Calories <n>" that isn't "Calories from fat" or the "2,000 calories a day" footnote.
  const cal = /\bcalories\b(?!\s*from)[^\d]{0,12}(\d{1,4})\b(?!\s*,?\d)(?!\s*calories)/i.exec(clean)
  if (cal) label.kcal = Number(cal[1])

  for (const line of clean.split(/\r?\n/)) {
    for (const { key, re, unit } of LINES) {
      const m = re.exec(line)
      if (!m) continue
      if (key && label[key] === undefined) {
        // "Includes 10g Added Sugars": the number comes before the name.
        const rest = key === 'addedSugar' ? line : line.slice(m.index + m[0].length)
        const v = amount(rest, unit)
        if (v !== undefined && v < 5000) label[key] = Math.round(v * 10) / 10
      }
      break
    }
  }
  return { label, servingGrams, servingsPerContainer, found: Object.keys(label).length }
}

/** Grams in a package from text like "16 oz (454g)", "1.5 lb", "500 g" or "12 fl oz". */
export function packageGramsFrom(text: string): number | undefined {
  const g = /(\d+(?:\.\d+)?)\s*(?:g|grams?|ml)\b/i.exec(text)
  if (g) return Number(g[1])
  const kg = /(\d+(?:\.\d+)?)\s*(?:kg|l|liters?)\b/i.exec(text)
  if (kg) return Number(kg[1]) * 1000
  const oz = /(\d+(?:\.\d+)?)\s*(?:fl\.?\s*)?oz\b/i.exec(text)
  if (oz) return Math.round(Number(oz[1]) * 28.35)
  const lb = /(\d+(?:\.\d+)?)\s*lbs?\b/i.exec(text)
  if (lb) return Math.round(Number(lb[1]) * 453.6)
  return undefined
}
