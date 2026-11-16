/**
 * The Content Security Policy (CSP) the build writes into index.html: the only places the page may
 * load scripts, connect to, or show frames from. If an attacker ever slipped code into the page,
 * the browser would refuse to run it or send data anywhere else.
 *
 * Each entry is a feature listed in the Privacy Policy. A new host must be added here (and to the
 * policy), or the browser will block it. Kept free of browser-only code so vite.config.ts can use it.
 */
export const CSP: Record<string, string[]> = {
  'default-src': ["'self'"],
  // Google's sign-in for the optional Google Tasks export; 'wasm-unsafe-eval' lets the scanners
  // start their WebAssembly engines (which ship with the app). No inline scripts, no eval.
  'script-src': ["'self'", "'wasm-unsafe-eval'", 'https://accounts.google.com/gsi/client'],
  'worker-src': ["'self'"],
  // React and the animation library set inline styles.
  'style-src': ["'self'", "'unsafe-inline'", 'https://accounts.google.com/gsi/style'],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://api.anthropic.com', // AI suggestions, with the person's own key
    'https://world.openfoodfacts.org', // barcode lookups
    'https://tasks.googleapis.com', // Google Tasks export
    'https://accounts.google.com',
    // Onyx Calendar on the person's own computer, at the address they type (any port, any local
    // network address), so this can't be narrower than plain http and https.
    'http:',
    'https:',
  ],
  'frame-src': ['https://accounts.google.com'],
  'media-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"],
}

export const cspString = (csp = CSP) => Object.entries(csp).map(([k, v]) => `${k} ${v.join(' ')}`).join('; ')
