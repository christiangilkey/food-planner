import { useEffect, useState } from 'react'
import { Icon } from './Icon'

/** The public address of the app: always share this, never a local test address. */
export const APP_URL = 'https://christiangilkey.github.io/food-planner/'

/** Copy text to the clipboard, with a fallback for browsers that block the Clipboard API. */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

/** A small header button that copies the app's link so you can send it to someone. */
export function ShareButton() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  useEffect(() => {
    if (status === 'idle') return
    const t = setTimeout(() => setStatus('idle'), 2200)
    return () => clearTimeout(t)
  }, [status])

  const onClick = async () => setStatus((await copy(APP_URL)) ? 'copied' : 'failed')

  return (
    <span className="share-wrap">
      <button className="share-btn" onClick={onClick} aria-label="Copy a link to Food Planner to share" title="Copy a link to share">
        <Icon name={status === 'copied' ? 'check' : 'share'} size={18} />
      </button>
      <span className="share-toast" role="status" aria-live="polite">
        {status === 'copied' && 'Link copied'}
        {status === 'failed' && `Copy this link: ${APP_URL}`}
      </span>
    </span>
  )
}
