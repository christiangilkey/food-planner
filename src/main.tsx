import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans/index.css'
import './index.css'
import App from './App.tsx'
import './lib/install'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Registration can fail in some private windows and embedded browsers; the app works without offline support.
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))

  // An installed app can sit in the background for days. When it comes back, check whether a
  // newer version was published and reload into it (everything you entered is kept in storage).
  const current = (document.querySelector('script[type="module"][src*="assets/index-"]') as HTMLScriptElement | null)?.src
  const checkForUpdate = async () => {
    try {
      const html = await (await fetch('./', { cache: 'no-store' })).text()
      const latest = html.match(/assets\/index-[\w-]+\.js/)?.[0]
      // Reload at most once per new version, so a CDN that is still catching up can't cause a loop.
      if (current && latest && !current.endsWith(latest) && sessionStorage.getItem('reloadedFor') !== latest) {
        sessionStorage.setItem('reloadedFor', latest)
        location.reload()
      }
      // On a first visit the new worker is still installing and the browser rejects update(); skip it then.
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg && !reg.installing) await reg.update().catch(() => {})
    } catch {
      // Offline: keep using the cached version.
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void checkForUpdate() })
  window.addEventListener('load', () => void checkForUpdate())
}
