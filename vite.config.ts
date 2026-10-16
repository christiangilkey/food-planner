import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works from any folder or static host (e.g. GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true },
})
