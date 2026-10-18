import type { AppState, ExportTarget, OnyxSettings } from '../types'
import type { TaskDraft, TaskListDraft } from './googleTasks'

/**
 * Onyx Calendar (the user's desktop calendar) serves MCP over HTTP on port 4747, with a
 * bearer token and open CORS. Timed drafts become calendar blocks; the rest become tasks.
 * Everything goes straight from this browser to the user's own PC.
 */

const TARGET_NAME: Record<ExportTarget, string> = { google: 'Google Tasks', onyx: 'Onyx' }

/** "Export to Google Tasks" or "Export to Onyx", following the setting. */
export const exportLabel = (s: Pick<AppState, 'exportTarget'>) => `Export to ${TARGET_NAME[s.exportTarget]}`

const base = (cfg: OnyxSettings) => cfg.url.trim().replace(/\/+$/, '')

/** Chrome asks permission before a web page reaches a device on the local network. */
const LOCAL = { targetAddressSpace: 'local' } as RequestInit

function friendly(e: unknown, cfg: OnyxSettings): Error {
  const msg = e instanceof Error ? e.message : String(e)
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
    return new Error(`Couldn’t reach Onyx at ${base(cfg)}. Make sure Onyx Calendar is running on that computer${/127\.0\.0\.1|localhost/.test(cfg.url) ? '' : ', “Reachable from your network” is on in its MCP settings,'} and that the browser was allowed to reach it.`)
  }
  return e instanceof Error ? e : new Error(msg)
}

/** True when Onyx answers at this address (no token needed). */
export async function onyxHealth(cfg: OnyxSettings): Promise<{ ok: boolean; version?: string }> {
  try {
    const res = await fetch(`${base(cfg)}/health`, LOCAL)
    if (!res.ok) return { ok: false }
    const body = (await res.json()) as { ok?: boolean; version?: string }
    return { ok: !!body.ok, version: body.version }
  } catch {
    return { ok: false }
  }
}

let nextId = 1

/** Call one Onyx MCP tool and return its parsed result. */
export async function onyxTool<T = unknown>(cfg: OnyxSettings, name: string, args: Record<string, unknown>): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${base(cfg)}/mcp`, {
      ...LOCAL,
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token.trim()}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method: 'tools/call', params: { name, arguments: args } }),
    })
  } catch (e) {
    throw friendly(e, cfg)
  }
  if (res.status === 401) throw new Error('Onyx refused the token. Copy it again from Onyx Calendar → Settings → MCP server.')
  if (!res.ok) throw new Error(`Onyx error ${res.status}.`)
  const reply = (await res.json()) as { error?: { message: string }; result?: { content?: { text: string }[]; isError?: boolean } }
  if (reply.error) throw new Error(`Onyx: ${reply.error.message}`)
  const text = reply.result?.content?.[0]?.text ?? ''
  if (reply.result?.isError) throw new Error(`Onyx: ${text}`)
  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "YYYY-MM-DD" plus minutes after its midnight (may pass 1440) → Onyx local time "YYYY-MM-DDTHH:MM". */
export function localStamp(day: string, minutes: number): string {
  const d = new Date(`${day}T00:00`)
  d.setMinutes(Math.round(minutes))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** The block or Magic add item already carries its time, so drop a "Mon 7:30 am · " prefix. */
const bareTitle = (t: string) => t.replace(/^[A-Z][a-z]{2} \d{1,2}:\d{2} [ap]m · /, '').slice(0, 500)

/** "07:30" from minutes after midnight (wrapping past 24 h). */
const hhmm = (m: number) => {
  const x = ((Math.round(m) % 1440) + 1440) % 1440
  return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`
}

/** Stable id per item, so sending the same week again updates Onyx instead of adding duplicates. */
function itemId(tag: string, due: string, title: string): string {
  let h = 0
  for (const ch of `${tag}|${due}|${title}`) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0
  return `fp-${tag}-${due}-${(h >>> 0).toString(36)}`
}

/** Onyx's Magic add takes at most this many items per call, one day per call. */
export const MAGIC_MAX_ITEMS = 30

interface MagicItem {
  title: string
  minutes?: number
  notes?: string
  tags: string[]
  preferred?: string
  id: string
}

interface MagicReply {
  mode: 'review' | 'placed'
  queued?: unknown[]
  placed?: unknown[]
  unplaced?: { title: string; reason: string }[]
  already_planned?: unknown[]
}

export interface OnyxResult {
  /** Items sent to Onyx in total. */
  sent: number
  /** Waiting in Magic add for the user to review. */
  queued: number
  /** Placed on the calendar straight away (Magic add set to place, or fixed blocks). */
  placed: number
  /** Magic add couldn't fit these into their day. */
  unplaced: { title: string; reason: string }[]
  /** This Onyx has no Magic add tool yet: everything went in as fixed blocks and tasks. */
  legacy: boolean
}

/**
 * Send task lists to Onyx. Meals and prep go to Magic add, which fits them around what is already
 * on each day (Onyx decides whether they wait for review or are placed); groceries go as one
 * shopping task; sleep times stay exact blocks. An older Onyx without Magic add gets fixed blocks
 * and tasks, as before.
 */
export async function exportToOnyx(cfg: OnyxSettings, lists: TaskListDraft[], onProgress?: (done: number, total: number) => void): Promise<OnyxResult> {
  if (!cfg.token.trim()) throw new Error('Paste the token from Onyx Calendar → Settings → MCP server first.')
  const result: OnyxResult = { sent: 0, queued: 0, placed: 0, unplaced: [], legacy: false }

  // Sort everything into Magic add batches (by day) and exact blocks/tasks.
  const byDay = new Map<string, MagicItem[]>()
  const fixed: { list: TaskListDraft; task: TaskDraft }[] = []
  const queue = (due: string, item: MagicItem) => byDay.set(due, [...(byDay.get(due) ?? []), item])
  for (const list of lists) {
    const tag = list.tag ?? 'tasks'
    const tags = ['food-planner', tag]
    const mode = list.onyx ?? 'magic'
    if (mode === 'bundle' && list.tasks.length) {
      const due = list.tasks.find((t) => t.due)?.due ?? isoToday()
      queue(due, {
        title: list.title.split(' · ')[0] === 'Groceries' ? 'Grocery shopping' : list.title,
        minutes: Math.min(120, 20 + 2 * list.tasks.length),
        notes: [list.title, '', ...list.tasks.map((t) => `☐ ${t.title}${t.notes ? ` (${t.notes})` : ''}`)].join('\n').slice(0, 8000),
        tags, id: itemId(tag, due, list.title),
      })
      continue
    }
    for (const task of list.tasks) {
      if (mode === 'fixed' || !task.due) { fixed.push({ list, task }); continue }
      queue(task.due, {
        title: bareTitle(task.title),
        ...(task.minutes ? { minutes: Math.max(5, Math.min(240, Math.round(task.minutes))) } : {}),
        notes: [list.title, task.notes].filter(Boolean).join('\n\n').slice(0, 8000),
        tags,
        ...(task.at !== undefined ? { preferred: hhmm(task.at) } : {}),
        id: itemId(tag, task.due, task.title),
      })
    }
  }

  const total = [...byDay.values()].reduce((s, xs) => s + xs.length, 0) + fixed.length
  const tick = (n: number) => { result.sent += n; onProgress?.(result.sent, total) }

  for (const [date, items] of [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (let i = 0; i < items.length; i += MAGIC_MAX_ITEMS) {
      const batch = items.slice(i, i + MAGIC_MAX_ITEMS)
      if (!result.legacy) {
        try {
          const r = await onyxTool<MagicReply>(cfg, 'magic_add', { date, items: batch, source: 'food-planner' })
          if (r.mode === 'placed') result.placed += r.placed?.length ?? 0
          else result.queued += (r.queued?.length ?? 0) + (r.already_planned?.length ?? 0)
          result.unplaced.push(...(r.unplaced ?? []))
          tick(batch.length)
          continue
        } catch (e) {
          // An Onyx from before Magic add for other apps: fall back to blocks and tasks.
          if (!(e instanceof Error && /Unknown tool/i.test(e.message))) throw e
          result.legacy = true
        }
      }
      for (const it of batch) {
        await (it.preferred
          ? onyxTool(cfg, 'create_time_block', { title: it.title, start: `${date}T${it.preferred}`, end: localStamp(date, toMin(it.preferred) + (it.minutes ?? 30)), notes: it.notes, tags: it.tags })
          : onyxTool(cfg, 'create_task', { title: it.title, due: date, notes: it.notes, tags: it.tags }))
        result.placed++
        tick(1)
      }
    }
  }

  for (const { list, task } of fixed) {
    const tags = ['food-planner', ...(list.tag ? [list.tag] : [])]
    const notes = [list.title, task.notes].filter(Boolean).join('\n\n').slice(0, 8000)
    await (task.due && task.at !== undefined
      ? onyxTool(cfg, 'create_time_block', { title: bareTitle(task.title), start: localStamp(task.due, task.at), end: localStamp(task.due, task.at + Math.max(5, task.minutes ?? 30)), notes, tags })
      : onyxTool(cfg, 'create_task', { title: task.title.slice(0, 500), ...(task.due ? { due: task.due } : {}), notes, tags }))
    result.placed++
    tick(1)
  }
  return result
}

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5))
const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
