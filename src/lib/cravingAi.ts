import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import type { AppState } from '../types'
import { checkAiAnswer, cravingOptions, profileSummary, type CravingResult } from './craving'

/**
 * Claude reads the craving, the person's setup and pantry, and picks ideas from lists the app has
 * already filtered by every rule; checkAiAnswer then drops anything not on those lists. Runs in the
 * browser with the person's own API key (billed to their Anthropic account).
 */
const MODEL = 'claude-opus-5-5'

const Pick = z.object({
  kind: z.enum(['recipe', 'food']),
  id: z.string().describe('An id copied exactly from the RECIPES or FOODS list'),
  why: z.string().describe('One short sentence: how it satisfies the craving and fits their goals'),
})
const Answer = z.object({
  understood: z.string().describe('What they seem to be craving, in a few words (e.g. "sweet and crunchy")'),
  from_pantry: z.array(Pick).describe('Up to 3 recipes they can make now: only recipes whose pantry share is 0.6 or more'),
  to_buy: z.array(Pick).describe('Up to 4 recipes or foods to buy for later that would satisfy the craving'),
  note: z.string().describe('One optional short tip, or an empty string'),
})

const SYSTEM = `You suggest food that satisfies a craving for someone using a health-focused meal planner.
Every suggestion must come from the RECIPES or FOODS lists in the message: they have already been filtered by the person's health conditions, diet, medications, foods they won't eat, kitchen and time limits. Never suggest anything that is not on those lists, and copy ids exactly.
Prefer options that genuinely scratch the itch (taste, texture, temperature) while being filling for the calories and kind to their goals and limits. "from_pantry" is only for recipes with pantry share 0.6 or higher; everything else goes in "to_buy". Keep each "why" to one friendly sentence. Do not give medical advice.`

export class AiKeyError extends Error {}

export async function aiIdeas(text: string, state: AppState, apiKey: string): Promise<CravingResult> {
  const options = cravingOptions(state)
  const pantry = state.pantry.filter((p) => p.grams > 0).map((p) => `${p.food} (${Math.round(p.grams)} g)`).join(', ') || 'empty'
  const recipes = options.recipes.map((r) => `${r.id} | ${r.name} | ${r.slots.join('/')} | ${r.kcal} kcal, ${r.protein} g protein, ${r.sugar} g sugar, ${r.sodium} mg sodium | ${r.minutes} min | crunch ${r.crunch}/3, bold flavor ${r.flavor}/3 | pantry share ${r.pantry} | $${r.cost}`).join('\n')
  const foods = options.foods.map((f) => `${f.id} | ${f.name} | ${f.aisle} | $${f.price}`).join('\n')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      output_config: { effort: 'low', format: betaZodOutputFormat(Answer) },
      messages: [{
        role: 'user',
        content: `PERSON\n${profileSummary(state)}\n\nPANTRY (food id and amount at home)\n${pantry}\n\nRECIPES (id | name | meals | per serving | hands-on | texture | pantry share | cost per serving)\n${recipes}\n\nFOODS they could buy (id | name | aisle | package price)\n${foods}\n\nCRAVING\n${text}`,
      }],
    })
    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      throw new Error('Claude didn’t return ideas for that. Showing ideas from your device instead.')
    }
    return checkAiAnswer(response.parsed_output, options)
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      throw new AiKeyError('Your Anthropic API key wasn’t accepted. Check it in Profile → AI suggestions.')
    }
    if (error instanceof Anthropic.RateLimitError) throw new Error('Anthropic is busy or your key hit its limit. Try again in a minute.')
    if (error instanceof Anthropic.APIConnectionError) throw new Error('Couldn’t reach Anthropic (are you offline?).')
    throw error
  }
}
