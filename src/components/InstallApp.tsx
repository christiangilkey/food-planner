import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useInstall, type Platform } from '../lib/install'
import { Icon } from './Icon'
import { Sheet } from './ui'

const STEPS: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: 'iPhone or iPad (Safari)',
    steps: [
      'Open this page in Safari (other iPhone browsers can’t add apps).',
      'Tap the Share button: the square with an arrow pointing up, at the bottom of the screen (top on iPad).',
      'Scroll down and tap “Add to Home Screen”.',
      'Tap “Add”. Health Tracker appears on your home screen and opens full-screen like an app.',
    ],
  },
  android: {
    title: 'Android (Chrome)',
    steps: [
      'Tap the ⋮ menu in the top-right corner of Chrome.',
      'Tap “Install app” (or “Add to Home screen”).',
      'Tap “Install”. Health Tracker appears with your other apps and works offline.',
    ],
  },
  desktop: {
    title: 'Computer (Chrome or Edge)',
    steps: [
      'Click the install icon at the right end of the address bar (a screen with a down arrow), or open the ⋮ menu.',
      'Choose “Install Health Tracker”.',
      'It opens in its own window and gets a desktop and Start menu icon.',
    ],
  },
}

/**
 * Top-bar button with a glowing ring that circles it, inviting you to add the app to your home
 * screen. It opens the instructions, and it's gone once the app is opened from the home screen.
 */
export function InstallButton() {
  const install = useInstall()
  const [open, setOpen] = useState(false)
  if (install.installed) return null
  return (
    <>
      <button className="install-ring" onClick={() => setOpen(true)} aria-label="Add this app to your home screen" title="Add to your home screen">
        <span className="install-ring-glow" aria-hidden />
        <Icon name="squarePlus" size={18} />
      </button>
      {/* Rendered at the page level: the top bar's blur would otherwise trap the sheet inside the bar. */}
      {open && createPortal(
        <InstallSheet
          platform={install.platform}
          onClose={() => setOpen(false)}
          onInstall={install.canPrompt ? async () => { if (await install.prompt()) setOpen(false) } : undefined}
        />,
        document.body,
      )}
    </>
  )
}

/** Step-by-step instructions: this device first; iPhone and Android open on a computer. */
export function InstallSheet({ platform, onClose, onInstall }: { platform: Platform; onClose: () => void; onInstall?: () => void }) {
  const order: Platform[] = platform === 'desktop' ? ['ios', 'android', 'desktop'] : [platform, ...(['ios', 'android', 'desktop'] as Platform[]).filter((p) => p !== platform)]
  const isOpen = (p: Platform, i: number) => (platform === 'desktop' ? p !== 'desktop' : i === 0)
  return (
    <Sheet title="Add to your home screen" onClose={onClose}>
      <p className="muted small">Health Tracker installs like an app: its own icon, full-screen, and it works offline. Your data stays on this device.</p>
      {onInstall && <button className="primary with-icon install-now" onClick={onInstall}><Icon name="squarePlus" size={16} /> Install now</button>}
      {order.map((p, i) => (
        <details key={p} className="methods" open={isOpen(p, i)}>
          <summary>{STEPS[p].title}{p === platform ? ' · this device' : ''}</summary>
          <ol className="method-steps">{STEPS[p].steps.map((s) => <li key={s}>{s}</li>)}</ol>
        </details>
      ))}
    </Sheet>
  )
}

/** Install status and button, for the Profile settings page. */
export function InstallFields() {
  const install = useInstall()
  const [open, setOpen] = useState(false)
  return (
    <>
      {install.installed ? (
        <p className="good-text with-icon"><Icon name="check" /> You’re using the installed app.</p>
      ) : (
        <>
          <p className="muted small">Put Health Tracker on your home screen with its own icon. It opens full-screen and works offline.</p>
          <button className="primary with-icon" onClick={async () => { if (!(install.canPrompt && (await install.prompt()))) setOpen(true) }}>
            <Icon name="squarePlus" size={16} /> {install.canPrompt ? 'Install app' : 'Show me how'}
          </button>
        </>
      )}
      {open && <InstallSheet platform={install.platform} onClose={() => setOpen(false)} />}
    </>
  )
}

/** Card version, always visible so it can be found again. */
export function InstallCard() {
  return (
    <section className="card">
      <h2 className="with-icon"><Icon name="smartphone" /> Home screen app</h2>
      <InstallFields />
    </section>
  )
}
