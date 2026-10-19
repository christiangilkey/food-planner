import { useSyncExternalStore } from 'react'

/**
 * The person's own Anthropic API key, for AI craving ideas. Kept in its own storage slot, never in
 * the app state, so it is not included in data backups or exports and never leaves this device
 * except in requests to Anthropic.
 */
const KEY = 'vena:anthropic-key'
const listeners = new Set<() => void>()

export function getAiKey(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function setAiKey(value: string) {
  try {
    if (value.trim()) localStorage.setItem(KEY, value.trim())
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked (private window): the key works only until the page closes.
  }
  listeners.forEach((l) => l())
}

/** A key that looks like an Anthropic API key (it is only really checked by Anthropic). */
export const looksLikeKey = (k: string) => /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k.trim())

export function useAiKey(): string {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l) } },
    getAiKey,
    () => '',
  )
}

/** Last four characters, for showing which key is saved without revealing it. */
export const maskKey = (k: string) => (k ? `sk-ant-…${k.slice(-4)}` : '')
