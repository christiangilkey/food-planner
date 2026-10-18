import { useEffect, useState } from 'react'

/** Chrome/Edge/Samsung Internet fire this when the app can be installed with one tap. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

// Captured at startup: the event fires once, often before React has rendered.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

export type Platform = 'ios' | 'android' | 'desktop'

export function detectPlatform(ua = navigator.userAgent): Platform {
  // iPadOS reports itself as a Mac but has touch.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

export function isInstalled(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

/** Whether a one-tap install is available, and a function that shows it. */
export function useInstall() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])
  return {
    installed: isInstalled(),
    canPrompt: !!deferred,
    platform: detectPlatform(),
    prompt: async (): Promise<boolean> => {
      if (!deferred) return false
      const e = deferred
      await e.prompt()
      const { outcome } = await e.userChoice
      deferred = null
      notify()
      return outcome === 'accepted'
    },
  }
}
