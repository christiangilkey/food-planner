import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONDITIONS } from '../data/conditions'
import { DIETS } from '../data/diets'
import { LEGAL_DOCS, LEGAL_VERSION, PRIVACY } from '../data/legal'
import licences from '../data/licenses.json'
import { EQUIPMENT } from '../data/recipes'
import { ACTIVITIES, CONDITION_IDS, DIET_IDS, EQUIPMENT_IDS, httpUrl, MAX_BACKUP_CHARS, safeId } from './backup'
import { CSP, cspString } from './csp'
import { ACTIVITY } from './energy'
import { legalPage, splitLinks } from './legalText'
import { generatePlan } from './planner'
import { blankProduct, syncProducts } from './products'
import { defaultState, exportState, importState } from './store'
import type { AppState } from '../types'

/**
 * Tests that try to break the app, not just use it (Security for Apps, lesson 45): hostile backups,
 * leaked secrets, unexpected addresses, and the safety settings that ship with every release.
 */

const root = join(__dirname, '..', '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')

/** A state with something in every part, as a long-time user would have. */
function buildFullState(): AppState {
  const s = defaultState()
  s.setupDone = true
  s.disclaimerAccepted = true
  s.termsAccepted = LEGAL_VERSION
  s.profile = { ...s.profile, name: 'Sam', age: 41, conditions: ['adhd', 'hypertension'], diets: ['pescatarian'], excluded: ['tuna'], meds: { ...s.profile.meds, ssri: true } }
  s.products = [{ ...blankProduct(), id: 'abc123', name: 'Greek yogurt', brand: 'Fage', barcode: '0123456789012', servingGrams: 170, packageGrams: 907, price: 6.49, label: { kcal: 90, protein: 18 }, matches: 'greek_yogurt', slots: ['breakfast'], tags: ['dairy'], aisle: 'Dairy & Eggs', addedAt: '2026-11-01T10:00:00.000Z' }]
  s.pantry = [{ food: 'greek_yogurt', grams: 500 }, { food: 'oats', grams: 300 }]
  s.stores = [{ id: 'aldi-mh2x1', name: 'Aldi' }]
  s.priceOverrides = { 'aldi-mh2x1': { oats: 2.99 } }
  s.preferredStore = 'aldi-mh2x1'
  s.checked = { oats: true }
  s.sleepLog = [{ date: '2026-11-05', bed: '23:10', wake: '07:00' }]
  s.exportTarget = 'onyx'
  s.onyx = { url: 'http://192.168.1.20:4747', token: 'secret-onyx-token' }
  s.fitness = { ...s.fitness, enabled: true, days: 4, priorities: ['glutes'], weightUnit: 'kg', preset: 'vtaper', addOns: ['tendon'], places: [{ id: 'gym', name: 'Gym', equipment: ['dumbbells', 'cable_station'] }, { id: 'home', name: 'Home', equipment: ['suspension'] }], place: 'home', limitations: ['shoulder', 'knee'], avoid: ['dip'], swaps: { bench: 'db_bench' } }
  s.bodyLog = [{ date: '2026-11-02', weightLb: 182, waistIn: 34 }]
  s.liftLog = [{ date: '2026-11-03', exercise: 'bench', unit: 'kg', sets: [{ weight: 60, reps: 8 }, { reps: 7 }] }]
  s.plan = generatePlan(s, 42)
  return s
}

// Planning a week is slow, so build the full state once and hand out copies.
const built = buildFullState()
const fullState = (): AppState => structuredClone(built)

describe('backups never carry secrets', () => {
  it('leave the Onyx token out of the file', () => {
    const file = exportState(fullState())
    expect(file).not.toContain('secret-onyx-token')
    expect(JSON.parse(file).onyx.token).toBe('')
  })
  it('keep this device’s token and Terms agreement, whatever the file says', () => {
    const device = { ...defaultState(), termsAccepted: '', onyx: { url: 'http://127.0.0.1:4747', token: 'mine' } }
    const evil = { ...fullState(), onyx: { url: 'http://127.0.0.1:4747', token: 'attacker' }, termsAccepted: LEGAL_VERSION }
    const back = importState(JSON.stringify(evil), device)
    expect(back.onyx.token).toBe('mine')
    expect(back.termsAccepted).toBe('')
  })
})

describe('a real backup comes back exactly', () => {
  it('round-trips everything except the token', () => {
    const s = fullState()
    const back = importState(exportState(s), s)
    expect(back).toEqual(s)
  })
})

describe('hostile backups', () => {
  it('refuse files that aren’t backups, or are far too big', () => {
    expect(() => importState('not json')).toThrow(/not a Health Tracker backup/)
    expect(() => importState('[]')).toThrow(/not a Health Tracker backup/)
    expect(() => importState(JSON.stringify({ profile: {} }))).toThrow(/not a Health Tracker backup/)
    expect(() => importState(' '.repeat(MAX_BACKUP_CHARS + 1))).toThrow(/too large/)
  })

  it('can’t pollute JavaScript’s shared object prototype', () => {
    const evil = `{"profile":{"__proto__":{"polluted":1}},"plan":[],"__proto__":{"polluted":1},"constructor":{"prototype":{"polluted":1}},
      "products":[{"id":"x1","name":"Bad","matches":"__proto__","label":{"__proto__":{"polluted":1}}}],
      "priceOverrides":{"__proto__":{"oats":1}},"checked":{"__proto__":true}}`
    const back = importState(evil)
    syncProducts(back.products)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect((Object.prototype as unknown as Record<string, unknown>).n).toBeUndefined()
    expect(back.products[0].matches).toBe('')
    expect(Object.keys(back.priceOverrides)).toEqual([])
  })

  it('replace impossible values with safe ones and drop unknown fields', () => {
    const evil = {
      ...JSON.parse(exportState(fullState())),
      profile: { ...fullState().profile, sex: '<img src=x onerror=alert(1)>', age: 1e12, activity: 'hacker', conditions: ['adhd', 'not-a-condition', 7], name: 'x'.repeat(10_000) },
      equipment: ['stove', 'rm -rf'],
      onyx: { url: 'javascript:alert(1)', token: 'x' },
      exportTarget: 'evil',
      pantry: [{ food: '<script>', grams: 5 }, { food: 'oats', grams: -50 }, 'junk'],
      liftLog: [{ date: 'yesterday', exercise: 'bench', unit: 'lb', sets: [] }, { date: '2026-11-03', exercise: 'bench', unit: 'stone', sets: [{ weight: 'heavy', reps: 1e9 }] }],
      sneaky: { anything: true },
    }
    const back = importState(JSON.stringify(evil))
    expect(back.profile.sex).toBe('male')
    expect(back.profile.age).toBe(100)
    expect(back.profile.activity).toBe('light')
    expect(back.profile.conditions).toEqual(['adhd'])
    expect(back.profile.name.length).toBeLessThanOrEqual(80)
    expect(back.equipment).toEqual(['stove'])
    expect(back.onyx.url).toBe(defaultState().onyx.url)
    expect(back.exportTarget).toBe('google')
    expect(back.pantry).toEqual([{ food: 'oats', grams: 0 }])
    expect(back.liftLog).toEqual([{ date: '2026-11-03', exercise: 'bench', unit: 'lb', sets: [{}] }])
    expect('sneaky' in back).toBe(false)
  })

  it('cap huge lists', () => {
    const many = { ...JSON.parse(exportState(defaultState())), pantry: Array.from({ length: 50_000 }, (_, i) => ({ food: `f${i}`, grams: 1 })) }
    expect(importState(JSON.stringify(many)).pantry.length).toBe(10_000)
  })
})

describe('the backup checker’s lists match the app’s own', () => {
  it('conditions, diets, equipment and activity levels', () => {
    expect([...CONDITION_IDS].sort()).toEqual(CONDITIONS.map((c) => c.id).sort())
    expect([...DIET_IDS].sort()).toEqual(DIETS.map((d) => d.id).sort())
    expect([...EQUIPMENT_IDS].sort()).toEqual(EQUIPMENT.map((e) => e.id).sort())
    expect([...ACTIVITIES].sort()).toEqual(Object.keys(ACTIVITY).sort())
  })
})

describe('addresses and names from outside', () => {
  it('accepts only plain web addresses', () => {
    expect(httpUrl('http://127.0.0.1:4747')).toBe('http://127.0.0.1:4747')
    expect(httpUrl('https://pc.local:4747/')).toBe('https://pc.local:4747/')
    for (const bad of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,hi', 'http://user:pw@host', 'ftp://x', '', 42]) expect(httpUrl(bad)).toBeNull()
  })
  it('refuses special names as ids', () => {
    for (const bad of ['__proto__', 'constructor', 'prototype', '', 'a b', '<x>', 'x'.repeat(201)]) expect(safeId(bad)).toBe(false)
    expect(safeId('greek_yogurt')).toBe(true)
  })
})

describe('the Content Security Policy', () => {
  it('allows no inline scripts, eval or plugins', () => {
    const script = CSP['script-src'].join(' ')
    expect(script).not.toMatch(/'unsafe-inline'|'unsafe-eval'|\*|data:|blob:/)
    expect(CSP['object-src']).toEqual(["'none'"])
    expect(CSP['base-uri']).toEqual(["'self'"])
    expect(cspString()).toContain("default-src 'self'")
  })
  it('names only services the Privacy Policy describes', () => {
    const policy = JSON.stringify(PRIVACY)
    const hosts = Object.values(CSP).flat().filter((v) => v.startsWith('https://')).map((v) => new URL(v).hostname)
    const company: Record<string, string> = { 'api.anthropic.com': 'Anthropic', 'world.openfoodfacts.org': 'Open Food Facts', 'tasks.googleapis.com': 'Google', 'accounts.google.com': 'Google' }
    for (const h of hosts) {
      expect(company[h], `${h} must be described in the Privacy Policy and listed here`).toBeDefined()
      expect(policy).toContain(company[h])
    }
  })
})

/** Every source file, for checks on what the app's own code does. */
function sourceFiles(dir = join(root, 'src')): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts') ? [p] : []
  })
}

describe('no code from outside, no unsafe HTML', () => {
  const files = sourceFiles().map((p) => [p, readFileSync(p, 'utf8')] as const)
  it('never renders HTML from strings or runs text as code', () => {
    for (const [p, text] of files) expect(text, p).not.toMatch(/dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(|new Function\(/)
  })
  it('loads the scanners from the app’s own files, never a CDN', () => {
    for (const [p, text] of files) expect(text, p).not.toMatch(/cdn\.jsdelivr|unpkg\.com|cdnjs/)
    const scan = read('src/lib/scan.ts')
    for (const opt of ['workerPath', 'corePath', 'langPath', 'locateFile']) expect(scan).toContain(opt)
    expect(read('scripts/vendor.mjs')).toContain('eng.traineddata')
    expect(scan).toContain('gzip: false')
  })
})

describe('legal pages', () => {
  it('turn addresses into links without swallowing punctuation', () => {
    expect(splitLinks('See https://x.org/a. Or mail me@x.org,')).toEqual([
      { text: 'See ' }, { text: 'https://x.org/a', href: 'https://x.org/a' }, { text: '. Or mail ' }, { text: 'me@x.org', href: 'mailto:me@x.org' }, { text: ',' },
    ])
  })
  it('escape their text and lock the page down', () => {
    for (const doc of LEGAL_DOCS) {
      const html = legalPage(doc)
      expect(html).toContain("default-src 'none'")
      expect(html).not.toMatch(/<script/i)
    }
    expect(legalPage({ id: 'privacy', title: '<b>x</b>', summary: '"', sections: [] })).toContain('&lt;b&gt;x&lt;/b&gt;')
  })
  it('say who provides the app and cover the outside services it uses', () => {
    const all = JSON.stringify(LEGAL_DOCS)
    for (const name of ['Anthropic', 'Open Food Facts', 'Google', 'GitHub', 'Onyx', '16', 'not medical advice']) expect(all).toContain(name)
  })
})

describe('the licence list', () => {
  it('includes every package the app ships with (run `npm run licenses` after changing dependencies)', () => {
    const pkg = JSON.parse(read('package.json')) as { dependencies: Record<string, string> }
    const names = new Set((licences as { name: string }[]).map((l) => l.name))
    for (const dep of Object.keys(pkg.dependencies)) expect(names.has(dep), dep).toBe(true)
  })
})

describe('release settings', () => {
  it('the Android app never points at a development server or allows plain http', () => {
    const cap = JSON.parse(read('capacitor.config.json')) as { server?: { url?: string; cleartext?: boolean; androidScheme?: string } }
    expect(cap.server?.url).toBeUndefined()
    expect(cap.server?.cleartext).not.toBe(true)
  })
  it('the Android app keeps its data out of Android’s cloud backup and asks only for the camera', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml')
    expect(manifest).toMatch(/android:allowBackup="false"/)
    const perms = [...manifest.matchAll(/uses-permission android:name="([^"]+)"/g)].map((m) => m[1]).sort()
    expect(perms).toEqual(['android.permission.CAMERA', 'android.permission.INTERNET'])
  })
})
