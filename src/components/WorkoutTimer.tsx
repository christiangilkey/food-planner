import { useEffect, useRef, useState } from 'react'
import {
  clock, elapsed, remaining, restAdd, restReset, restStart, restToggle, setTab, useTimer, watchLap, watchReset, watchToggle,
} from '../lib/timer'
import { Icon } from './Icon'

const PRESETS = [60, 90, 120, 180]

/** Rest timer and stopwatch for the gym. A small pill follows you down the page while one is running. */
export function WorkoutTimer() {
  const { t, now, running } = useTimer()
  const card = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = card.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const restLeft = remaining(t.rest, now)
  const restOn = t.rest.endsAt !== null
  const watchMs = elapsed(t.watch, now)
  const watchOn = t.watch.startedAt !== null
  const pct = t.rest.total > 0 ? (restLeft / t.rest.total) * 100 : 0
  const laps = t.watch.laps

  return (
    <>
      <section ref={card} className="card workout-timer" aria-label="Workout timer">
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={t.tab === 'rest'} className={t.tab === 'rest' ? 'on' : ''} onClick={() => setTab('rest')}>
            Rest timer{restOn && t.tab !== 'rest' && <span className="seg-badge">{clock(restLeft)}</span>}
          </button>
          <button role="tab" aria-selected={t.tab === 'watch'} className={t.tab === 'watch' ? 'on' : ''} onClick={() => setTab('watch')}>
            Stopwatch{watchOn && t.tab !== 'watch' && <span className="seg-badge">{clock(watchMs)}</span>}
          </button>
        </div>

        {t.tab === 'rest' ? (
          <>
            <div className={`timer-readout ${t.rest.done ? 'done' : ''}`} aria-live="polite">
              {t.rest.done ? 'Time’s up' : clock(restLeft)}
            </div>
            <div className="timer-bar" aria-hidden="true"><span style={{ width: `${t.rest.done ? 0 : pct}%` }} /></div>
            <div className="timer-presets">
              {PRESETS.map((s) => (
                <button key={s} className={`toggle-chip ${!t.rest.done && t.rest.total === s * 1000 ? 'on' : ''}`} onClick={() => restStart(s)}>{clock(s * 1000)}</button>
              ))}
            </div>
            <div className="timer-actions">
              <button className="primary" onClick={() => restToggle()}>
                <Icon name={restOn ? 'pause' : 'play'} size={18} /> {restOn ? 'Pause' : t.rest.done ? 'Again' : 'Start'}
              </button>
              <button className="secondary" onClick={() => restAdd(15)} aria-label="Add 15 seconds"><Icon name="plus" size={16} /> 15 s</button>
              <button className="secondary icon-only" onClick={restReset} aria-label="Reset the rest timer"><Icon name="reset" size={18} /></button>
            </div>
            <p className="muted small timer-hint">Tap a rest time under any exercise to start it. Your phone buzzes and beeps when time’s up, if the app is open.</p>
          </>
        ) : (
          <>
            <div className="timer-readout">{clock(watchMs)}</div>
            <div className="timer-actions">
              <button className="primary" onClick={() => watchToggle()}>
                <Icon name={watchOn ? 'pause' : 'play'} size={18} /> {watchOn ? 'Pause' : watchMs > 0 ? 'Resume' : 'Start'}
              </button>
              <button className="secondary" onClick={() => watchLap()} disabled={!watchOn}><Icon name="flag" size={16} /> Lap</button>
              <button className="secondary icon-only" onClick={watchReset} aria-label="Reset the stopwatch"><Icon name="reset" size={18} /></button>
            </div>
            {laps.length > 0 && (
              <ol className="timer-laps">
                {laps.map((ms, i) => ({ ms, i, split: ms - (laps[i - 1] ?? 0) })).reverse().slice(0, 6).map(({ ms, i, split }) => (
                  <li key={i}><span className="muted">Lap {i + 1}</span><span>{clock(split)}</span><span className="muted">{clock(ms)}</span></li>
                ))}
              </ol>
            )}
          </>
        )}
      </section>

      {running && !inView && (
        <button className="timer-pill" onClick={() => card.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} aria-label="Show the timer">
          <Icon name="timer" size={16} />
          {restOn ? <>{clock(restLeft)} <span>rest</span></> : <>{clock(watchMs)}</>}
        </button>
      )}
    </>
  )
}
