import { FOOD_BY_ID } from '../data/foods'
import { METHODS } from '../data/methods'
import { RECIPE_BY_ID } from '../data/recipes'
import type { AppState, Recipe } from '../types'
import { money } from './format'
import { servingTotals } from './nutrition'
import { DAYS, dayEntries } from './plan-utils'
import { formatTime, mealTimes } from './schedule'
import { buildShoppingList, formatLb } from './shopping'
import { mealTip } from './tips'

export interface TaskDraft {
  title: string
  notes?: string
  /** YYYY-MM-DD (Google Tasks stores due dates without a time). */
  due?: string
}

export interface TaskListDraft {
  title: string
  tasks: TaskDraft[]
}

export interface ExportOptions {
  meals: boolean
  shopping: boolean
  prep: boolean
}

const SCOPE = 'https://www.googleapis.com/auth/tasks'
const API = 'https://tasks.googleapis.com/tasks/v1'

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Numbered cooking steps for a task's notes. */
export function methodText(r: Recipe): string {
  const steps = METHODS[r.id]
  return steps?.length ? ['How to make it:', ...steps.map((step, i) => `${i + 1}. ${step}`)].join('\n') : ''
}

const ingredientLines = (r: Recipe, scale: number) =>
  r.items.map((it) => `• ${FOOD_BY_ID[it.food]?.name ?? it.food}: ${Math.round(it.grams * scale)} g (${formatLb(it.grams * scale)})`).join('\n')

/** The Monday of the week containing `today` (the plan's Mon–Sun map onto it). */
export function weekStart(today = new Date()): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/** Turn the week into task lists: meals by day, groceries, and prep-day cooking. */
export function buildTaskLists(state: AppState, opts: ExportOptions, today = new Date()): TaskListDraft[] {
  const monday = weekStart(today)
  const dateOf = (day: number) => { const d = new Date(monday); d.setDate(d.getDate() + day); return d }
  const label = `${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  const lists: TaskListDraft[] = []

  if (opts.meals) {
    const tasks: TaskDraft[] = []
    state.plan.forEach((day, d) => {
      const t = mealTimes(state.profile, day.snacks.length)
      for (const { slot, entry } of dayEntries(day)) {
        const r = RECIPE_BY_ID[entry.recipe]
        if (!r) continue
        const snackIndex = slot === 'snack' ? day.snacks.indexOf(entry) : -1
        const at = slot === 'snack' ? t.snacks[snackIndex] : t[slot]
        const totals = servingTotals(r, entry.portion)
        const scale = entry.portion / r.servings
        const ingredients = ingredientLines(r, scale)
        const tip = mealTip(r, entry.portion, state.profile)
        const slotName = slot[0].toUpperCase() + slot.slice(1)
        tasks.push({
          title: `${DAYS[d]} ${at !== undefined ? formatTime(at) : ''} · ${slotName}: ${r.name}${entry.portion !== 1 ? ` (${entry.portion}×)` : ''}`.replace(/\s+·/, ' ·'),
          notes: [
            `${Math.round(totals.kcal)} kcal · ${Math.round(totals.protein)} g protein · ${Math.round(totals.carbs)} g carbs · ${r.activeMin} min hands-on`,
            '', ingredients,
            r.batch && r.servings > 1 ? '\nIf you cooked this batch on prep day, just reheat a portion until steaming hot (165°F).' : '',
            `\n${methodText(r)}`,
            tip ? `\nTip: ${tip.text}` : '',
          ].filter((x) => x !== '').join('\n'),
          due: iso(dateOf(d)),
        })
      }
    })
    lists.push({ title: `Meal plan · week of ${label}`, tasks })
  }

  if (opts.shopping) {
    const { items, total } = buildShoppingList(state)
    const store = state.stores.find((s) => s.id === state.preferredStore)
    lists.push({
      title: `Groceries · ${label}${store ? ` · ${store.name}` : ''}`,
      tasks: [
        ...items.map((it) => ({
          title: `${it.food.name}: ${it.packages > 1 ? `${it.packages} × ` : ''}${it.food.packageLabel}`,
          notes: `${it.food.aisle} · about ${money(it.cost)}${it.cheaper ? ` (${money(it.cheaper.cost)} at ${it.cheaper.storeName})` : ''}`,
          due: iso(monday),
        })),
        { title: `Estimated total: ${money(total)}`, due: iso(monday) },
      ],
    })
  }

  if (opts.prep) {
    const counts: Record<string, number> = {}
    for (const day of state.plan) for (const { entry } of dayEntries(day)) {
      const r = RECIPE_BY_ID[entry.recipe]
      if (r?.batch && r.servings > 1) counts[r.id] = (counts[r.id] ?? 0) + entry.portion
    }
    // Prep on the Sunday before the week, or today if that has passed.
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const prepDay = dateOf(-1) < startOfToday ? startOfToday : dateOf(-1)
    const tasks = Object.entries(counts).map(([id, servings]) => {
      const r = RECIPE_BY_ID[id]
      const batches = Math.ceil(servings / r.servings - 0.1)
      return {
        title: `Cook ${r.name}${batches > 1 ? ` × ${batches} batches` : ''}`,
        notes: [
          `${servings} servings planned this week · ${r.activeMin * batches} min hands-on`,
          '', `Ingredients${batches > 1 ? ` for ${batches} batches` : ''}:`, ingredientLines(r, batches),
          '', methodText(r),
          '', 'Cool leftovers within 2 hours, refrigerate, and eat within 3–4 days.',
        ].join('\n'),
        due: iso(prepDay),
      }
    })
    if (tasks.length) lists.push({ title: `Prep day · week of ${label}`, tasks })
  }
  return lists
}

/** Plain-text checklist (works without any Google setup: paste anywhere). */
export function toChecklistText(lists: TaskListDraft[]): string {
  return lists.map((l) => [`${l.title}`, ...l.tasks.map((t) => `- [ ] ${t.title}`)].join('\n')).join('\n\n')
}

// ── Google sign-in (Google Identity Services token flow) ────────────

interface TokenResponse { access_token?: string; error?: string; error_description?: string }
interface TokenClient { requestAccessToken: (o?: { prompt?: string }) => void }
interface GoogleOAuth { accounts: { oauth2: { initTokenClient: (cfg: { client_id: string; scope: string; callback: (r: TokenResponse) => void; error_callback?: (e: { type: string; message?: string }) => void }) => TokenClient } } }

let gisLoading: Promise<void> | null = null
function loadGis(): Promise<void> {
  if ((window as unknown as { google?: GoogleOAuth }).google?.accounts?.oauth2) return Promise.resolve()
  gisLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { gisLoading = null; reject(new Error('Couldn’t load Google sign-in. Check your connection.')) }
    document.head.appendChild(s)
  })
  return gisLoading
}

/** Opens Google's consent popup and returns an access token for Google Tasks only. */
export async function getTasksToken(clientId: string): Promise<string> {
  await loadGis()
  const google = (window as unknown as { google: GoogleOAuth }).google
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: SCOPE,
      callback: (r) => (r.access_token ? resolve(r.access_token) : reject(new Error(r.error_description || r.error || 'Google sign-in failed.'))),
      error_callback: (e) => reject(new Error(e.type === 'popup_closed' ? 'The Google window was closed before finishing.' : e.message || 'Google sign-in failed.')),
    })
    client.requestAccessToken({ prompt: '' })
  })
}

async function call<T>(token: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google Tasks error ${res.status}${text.includes('accessNotConfigured') || text.includes('has not been used') ? ': enable the Google Tasks API in your Google Cloud project.' : ''}`)
  }
  return res.json() as Promise<T>
}

/** Creates each list in the user's Google Tasks, with tasks in order. */
export async function exportToGoogleTasks(token: string, lists: TaskListDraft[], onProgress?: (done: number, total: number) => void): Promise<number> {
  const total = lists.reduce((s, l) => s + l.tasks.length, 0)
  let done = 0
  for (const list of lists) {
    const created = await call<{ id: string }>(token, '/users/@me/lists', { title: list.title.slice(0, 1024) })
    // New tasks go to the top, so insert in reverse to keep the list in order.
    for (const t of [...list.tasks].reverse()) {
      await call(token, `/lists/${encodeURIComponent(created.id)}/tasks`, {
        title: t.title.slice(0, 1024),
        notes: t.notes?.slice(0, 8192),
        due: t.due ? `${t.due}T00:00:00.000Z` : undefined,
      })
      onProgress?.(++done, total)
    }
  }
  return done
}
