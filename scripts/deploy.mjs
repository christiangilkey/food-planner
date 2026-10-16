// Publishes the built site (dist/) to the gh-pages branch, which GitHub Pages serves.
// Usage: npm run deploy   (runs tests and a fresh build first)
import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })
const out = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim()

const root = process.cwd()
const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ is missing; run npm run build first.')

const remote = out('git', ['remote', 'get-url', 'origin'], root)
const sha = out('git', ['rev-parse', '--short', 'HEAD'], root)
const name = out('git', ['config', 'user.name'], root)
const email = out('git', ['config', 'user.email'], root)

// Tell GitHub Pages not to run Jekyll on the files.
writeFileSync(join(dist, '.nojekyll'), '')

run('git', ['init', '-q', '-b', 'gh-pages'], dist)
run('git', ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'add', '-A'], dist)
run('git', ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '-m', `Deploy ${sha}`], dist)
run('git', ['push', '-f', remote, 'gh-pages'], dist)
console.log(`Deployed ${sha} to gh-pages.`)
