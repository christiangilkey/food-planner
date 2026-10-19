import { useState } from 'react'
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
      'Tap “Add”. Food Planner appears on your home screen and opens full-screen like an app.',
    ],
  },
  android: {
    title: 'Android (Chrome)',
    steps: [
      'Tap the ⋮ menu in the top-right corner of Chrome.',
      'Tap “Install app” (or “Add to Home screen”).',
      'Tap “Install”. Food Planner appears with your other apps and works offline.',
    ],
  },
  desktop: {
    title: 'Computer (Chrome or Edge)',
    steps: [
      'Click the install icon at the right end of the address bar (a screen with a down arrow), or open the ⋮ menu.',
      'Choose “Install Food Planner”.',
      'It opens in its own window and gets a desktop and Start menu icon.',
    ],
  },
}

/** Header button: one-tap install where the browser supports it, step-by-step instructions everywhere else. */
export function InstallButton() {
  const install = useInstall()
  const [open, setOpen] = useState(false)
  if (install.installed) return null
  const onClick = async () => {
    if (install.canPrompt && (await install.prompt())) return
    setOpen(true)
  }
  return (
    <>
      <button className="install-btn with-icon" onClick={onClick} title="Add Food Planner to your home screen">
        <Icon name="squarePlus" size={16} /> Install app
      </button>
      {open && <InstallSheet platform={install.platform} onClose={() => setOpen(false)} />}
    </>
  )
}

export function InstallSheet({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const order: Platform[] = [platform, ...(['ios', 'android', 'desktop'] as Platform[]).filter((p) => p !== platform)]
  return (
    <Sheet title="Add to your home screen" onClose={onClose}>
      <p className="muted small">Food Planner installs like an app: its own icon, full-screen, and it works offline. Your data stays on this device.</p>
      {order.map((p, i) => (
        <details key={p} className="methods" open={i === 0}>
          <summary>{STEPS[p].title}{i === 0 ? ' · this device' : ''}</summary>
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
          <p className="muted small">Put Food Planner on your home screen with its own icon. It opens full-screen and works offline.</p>
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
