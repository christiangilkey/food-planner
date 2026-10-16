import { animate, type MotionValue } from 'motion/react'
import { useEffect, type RefObject } from 'react'

/** Is the touch starting on something that should keep the gesture for itself? */
function ownsHorizontalGesture(target: EventTarget | null, root: HTMLElement): boolean {
  let el = target instanceof Element ? target : null
  if (el?.closest('.sheet, input, textarea, select, [data-no-swipe]')) return true
  while (el && el !== root) {
    if (el instanceof HTMLElement && el.scrollWidth > el.clientWidth + 2) {
      const ox = getComputedStyle(el).overflowX
      if (ox === 'auto' || ox === 'scroll') return true
    }
    el = el.parentElement
  }
  return false
}

/**
 * Horizontal swipe between pages, like a native app. The page follows the finger with some
 * resistance (via `offset`), then either commits (`onSwipe(+1 | -1)`) or springs back.
 * Vertical scrolling is untouched: the gesture only engages once the motion is clearly sideways.
 */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  offset: MotionValue<number>,
  onSwipe: (direction: 1 | -1) => boolean,
  enabled = true,
) {
  useEffect(() => {
    const root = ref.current
    if (!root || !enabled) return
    let startX = 0
    let startY = 0
    let startT = 0
    let axis: 'x' | 'y' | null = null
    let active = false

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || ownsHorizontalGesture(e.target, root)) { active = false; return }
      active = true
      axis = null
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startT = performance.now()
    }
    const onMove = (e: TouchEvent) => {
      if (!active) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (!axis && Math.hypot(dx, dy) > 10) axis = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'x' : 'y'
      if (axis === 'x') offset.set(dx * 0.35)
    }
    const onEnd = (e: TouchEvent) => {
      if (!active || axis !== 'x') { active = false; return }
      active = false
      const dx = e.changedTouches[0].clientX - startX
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - startT)
      const committed = (Math.abs(dx) > 70 || velocity > 0.6) && onSwipe(dx < 0 ? 1 : -1)
      if (!committed) animate(offset, 0, { type: 'spring', stiffness: 500, damping: 40 })
    }

    root.addEventListener('touchstart', onStart, { passive: true })
    root.addEventListener('touchmove', onMove, { passive: true })
    root.addEventListener('touchend', onEnd, { passive: true })
    root.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      root.removeEventListener('touchstart', onStart)
      root.removeEventListener('touchmove', onMove)
      root.removeEventListener('touchend', onEnd)
      root.removeEventListener('touchcancel', onEnd)
    }
  }, [ref, offset, onSwipe, enabled])
}
