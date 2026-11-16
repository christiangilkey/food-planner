// Lists every package that ships inside the app (the runtime dependencies and everything they
// depend on), with its licence and licence text, into src/data/licenses.json. The app shows it in
// Profile → About & legal. Run after changing dependencies: `npm run licenses`. A test checks that
// the list still matches package.json.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))

/** Where Node would find `name` when required from `fromDir`. */
function resolve(name, fromDir) {
  let dir = fromDir
  for (;;) {
    const candidate = join(dir, 'node_modules', name)
    if (existsSync(join(candidate, 'package.json'))) return candidate
    const up = dirname(dir)
    if (up === dir) return null
    dir = up
  }
}

function licenceText(dir) {
  const file = readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.|$|-)/i.test(f))
  return file ? readFileSync(join(dir, file), 'utf8').slice(0, 20_000).trim() : ''
}

const seen = new Map()
function visit(name, fromDir) {
  const dir = resolve(name, fromDir)
  if (!dir) return
  const pkg = readJson(join(dir, 'package.json'))
  const key = `${pkg.name}@${pkg.version}`
  if (seen.has(key)) return
  const repo = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url
  seen.set(key, {
    name: pkg.name,
    version: pkg.version,
    license: typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? 'See licence text',
    url: (pkg.homepage || repo || `https://www.npmjs.com/package/${pkg.name}`).replace(/^git\+/, '').replace(/\.git$/, ''),
    text: licenceText(dir),
  })
  for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies })) visit(dep, dir)
}

const app = readJson(join(root, 'package.json'))
for (const dep of Object.keys(app.dependencies)) visit(dep, root)

const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(join(root, 'src', 'data', 'licenses.json'), `${JSON.stringify(list, null, 1)}\n`)
console.log(`licenses: ${list.length} packages written to src/data/licenses.json`)
const missing = list.filter((p) => !p.text).map((p) => p.name)
if (missing.length) console.log(`  no licence file (licence field only): ${missing.join(', ')}`)
