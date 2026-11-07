import { useEffect, useState, useSyncExternalStore } from 'react'

/**
 * The Train tab's rest timer and stopwatch. Times are stored as timestamps, so they keep counting
 * while you switch tabs, lock the phone or reload. Kept in its own storage key, not the app state:
 * it's a moment-to-moment tool, so it isn't part of backups.
 */

export interface TimerState {
  tab: 'rest' | 'watch'
  /** Stopwatch: ms counted before `startedAt` (from earlier runs), plus lap times as total ms. */
  watch: { startedAt: number | null; base: number; laps: number[] }
  /** Rest timer: when it ends while running, ms left while paused, and the chosen length. */
  rest: { endsAt: number | null; left: number; total: number; done: boolean }
}

const KEY = 'food-planner:timer'
const initial = (): TimerState => ({
  tab: 'rest',
  watch: { startedAt: null, base: 0, laps: [] },
  rest: { endsAt: null, left: 120_000, total: 120_000, done: false },
})

function read(): TimerState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial(), ...JSON.parse(raw) }
  } catch { /* private mode or bad data: start fresh */ }
  return initial()
}

let state: TimerState = read()
const listeners = new Set<() => void>()

function set(next: TimerState) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* not saved; still works this session */ }
  listeners.forEach((l) => l())
  watchForEnd()
}

export const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
export const getTimer = () => state

// ── Pure helpers ──

/** Stopwatch time in ms. */
export const elapsed = (w: TimerState['watch'], now: number) => w.base + (w.startedAt === null ? 0 : Math.max(0, now - w.startedAt))
/** Rest time left in ms, never below 0. */
export const remaining = (r: TimerState['rest'], now: number) => Math.min(r.total, Math.max(0, r.endsAt === null ? r.left : r.endsAt - now))

/** "2–3 min" → 120 s, "90 s" → 90 s: the low end of a rest range, in seconds. */
export function parseRest(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:[–-]\s*\d+(?:\.\d+)?)?\s*(min|s)\b/)
  if (!m) return null
  return Math.round(parseFloat(m[1]) * (m[2] === 'min' ? 60 : 1))
}

/** 75 000 ms → "1:15"; over an hour → "1:02:03". */
export function clock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

// ── Actions ──

export const setTab = (tab: TimerState['tab']) => set({ ...state, tab })

export function watchToggle(now = Date.now()) {
  const w = state.watch
  set({ ...state, watch: w.startedAt === null ? { ...w, startedAt: now } : { ...w, base: elapsed(w, now), startedAt: null } })
}
export const watchLap = (now = Date.now()) => set({ ...state, watch: { ...state.watch, laps: [...state.watch.laps, elapsed(state.watch, now)] } })
export const watchReset = () => set({ ...state, watch: { startedAt: null, base: 0, laps: [] } })

/** Start a rest of `sec` seconds now (from a preset or an exercise's rest time). */
export function restStart(sec: number, now = Date.now()) {
  unlockSound()
  set({ ...state, tab: 'rest', rest: { endsAt: now + sec * 1000, left: sec * 1000, total: sec * 1000, done: false } })
}
export function restToggle(now = Date.now()) {
  const r = state.rest
  if (r.endsAt !== null) return set({ ...state, rest: { ...r, left: remaining(r, now), endsAt: null } })
  unlockSound()
  const left = r.done || r.left <= 0 ? r.total : r.left
  set({ ...state, rest: { ...r, left, endsAt: now + left, done: false } })
}
export function restAdd(sec: number, now = Date.now()) {
  const r = state.rest
  const add = sec * 1000
  set({ ...state, rest: r.endsAt !== null
    ? { ...r, endsAt: Math.max(now, r.endsAt) + add, total: r.total + add }
    : { ...r, left: (r.done ? 0 : r.left) + add, total: r.done ? add : r.total + add, done: false } })
}
export const restReset = () => set({ ...state, rest: { ...state.rest, endsAt: null, left: state.rest.total, done: false } })

// ── Ending the rest: one alert, wherever you are in the app ──

let endTimer: ReturnType<typeof setTimeout> | undefined
function watchForEnd() {
  clearTimeout(endTimer)
  const r = state.rest
  if (r.endsAt === null) return
  endTimer = setTimeout(finishRest, Math.max(0, r.endsAt - Date.now()))
}
function finishRest() {
  if (state.rest.endsAt === null) return
  set({ ...state, rest: { ...state.rest, endsAt: null, left: 0, done: true } })
  alertDone()
}
watchForEnd()

let audio: AudioContext | undefined
/** Browsers only play sound after a tap, so get the audio ready when a timer is started. */
function unlockSound() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
  } catch { /* no sound available */ }
}
function alertDone() {
  try { navigator.vibrate?.([200, 100, 200, 100, 400]) } catch { /* no vibration */ }
  try {
    if (!audio) return
    // Three short beeps.
    for (let i = 0; i < 3; i++) {
      const t = audio.currentTime + i * 0.3
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      osc.connect(gain).connect(audio.destination)
      osc.start(t)
      osc.stop(t + 0.22)
    }
  } catch { /* no sound */ }
}

// ── React ──

/** The timer state, re-rendering a few times a second while something is running. */
export function useTimer() {
  const t = useSyncExternalStore(subscribe, getTimer)
  const running = t.watch.startedAt !== null || t.rest.endsAt !== null
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 250)
    return () => { clearTimeout(first); clearInterval(id) }
  }, [running])
  // When nothing runs, the readouts don't depend on `now`.
  return { t, now, running }
}
