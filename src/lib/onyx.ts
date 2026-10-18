import type { OnyxSettings } from '../types'
import type { TaskListDraft } from './googleTasks'

/**
 * Onyx Calendar (the user's desktop calendar) serves MCP over HTTP on port 4747, with a
 * bearer token and open CORS. Timed drafts become calendar blocks; the rest become tasks.
 * Everything goes straight from this browser to the user's own PC.
 */

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

/** Send task lists to Onyx: timed drafts as time blocks, the rest as tasks, all tagged. */
export async function exportToOnyx(cfg: OnyxSettings, lists: TaskListDraft[], onProgress?: (done: number, total: number) => void): Promise<number> {
  if (!cfg.token.trim()) throw new Error('Paste the token from Onyx Calendar → Settings → MCP server first.')
  const total = lists.reduce((s, l) => s + l.tasks.length, 0)
  let done = 0
  for (const list of lists) {
    const tags = ['food-planner', ...(list.tag ? [list.tag] : [])]
    for (const t of list.tasks) {
      const notes = [list.title, t.notes].filter(Boolean).join('\n\n').slice(0, 8000)
      if (t.due && t.at !== undefined) {
        await onyxTool(cfg, 'create_time_block', {
          // The block already sits at its time, so drop a "Mon 7:30 am · " prefix.
          title: t.title.replace(/^[A-Z][a-z]{2} \d{1,2}:\d{2} [ap]m · /, '').slice(0, 500), start: localStamp(t.due, t.at), end: localStamp(t.due, t.at + Math.max(5, t.minutes ?? 30)), notes, tags,
        })
      } else {
        await onyxTool(cfg, 'create_task', { title: t.title.slice(0, 500), ...(t.due ? { due: t.due } : {}), notes, tags })
      }
      done++
      onProgress?.(done, total)
    }
  }
  return done
}
