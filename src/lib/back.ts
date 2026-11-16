import { useEffect, useRef } from 'react'

/**
 * Android's Back button. Screens that can go "back" register here while they're showing; the
 * newest one wins (an open sheet, then a settings page, then a tab other than Today). When none
 * is left, Back leaves the app.
 */
const handlers: { current: () => void }[] = []

export function useBackHandler(active: boolean, onBack: () => void) {
  const ref = useRef(onBack)
  useEffect(() => { ref.current = onBack })
  useEffect(() => {
    if (!active) return
    const h = { current: () => ref.current() }
    handlers.push(h)
    return () => { handlers.splice(handlers.indexOf(h), 1) }
  }, [active])
}

/** Runs the newest handler. False when there's nothing to go back to. */
export function handleBack(): boolean {
  const h = handlers[handlers.length - 1]
  if (!h) return false
  h.current()
  return true
}
