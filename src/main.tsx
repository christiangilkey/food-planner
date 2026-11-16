import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans/index.css'
import './index.css'
import App from './App.tsx'
import './lib/install'
import { handleBack } from './lib/back'
import { clearCameraCopies } from './lib/files'
import { isNative } from './lib/platform'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (isNative) {
  // Android: Back closes the top sheet or page, then goes to Today, then leaves the app.
  void import('@capacitor/app').then(({ App: NativeApp }) => NativeApp.addListener('backButton', () => { if (!handleBack()) void NativeApp.exitApp() }))
  // Remove any label photo a crash left behind.
  void clearCameraCopies()
}

// The Android app carries its own files and updates through new releases, so only the web app
// needs offline caching and update checks.
if ('serviceWorker' in navigator && import.meta.env.PROD && !isNative) {
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
