import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { LEGAL_DOCS } from './src/data/legal.ts'
import { cspString } from './src/lib/csp.ts'
import { legalPage } from './src/lib/legalText.ts'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

/**
 * Release builds only (the dev server needs inline scripts for hot reload):
 * - write the Content Security Policy into index.html (see src/lib/csp.ts);
 * - publish privacy.html, terms.html and storage.html from the same text the app shows.
 */
function releaseSafety(): Plugin {
  return {
    name: 'release-safety',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: cspString() }, injectTo: 'head-prepend' }],
    generateBundle() {
      for (const doc of LEGAL_DOCS) this.emitFile({ type: 'asset', fileName: `${doc.id}.html`, source: legalPage(doc) })
    },
  }
}

// Relative base so the build works from any folder or static host (e.g. GitHub Pages) and inside the Android app.
export default defineConfig({
  base: './',
  plugins: [react(), releaseSafety()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { host: true },
})
