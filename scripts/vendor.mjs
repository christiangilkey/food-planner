// Copies the label and barcode scanners' engine files from node_modules into public/vendor, so
// the app ships them itself: no code is fetched from a CDN at run time, and scanning works offline.
// Runs before `dev` and `build`. public/vendor is generated, so it is not committed.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nm = (p) => join(root, 'node_modules', p)
const out = join(root, 'public', 'vendor')

const FILES = [
  ['tesseract.js/dist/worker.min.js', 'tesseract/worker.min.js'],
  ['tesseract.js/LICENSE.md', 'tesseract/LICENSE-tesseract.js.txt'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract/tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract/tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/LICENSE', 'tesseract/LICENSE-tesseract.js-core.txt'],
  ['zxing-wasm/dist/reader/zxing_reader.wasm', 'zxing/zxing_reader.wasm'],
  ['zxing-wasm/LICENSE', 'zxing/LICENSE-zxing-wasm.txt'],
]

rmSync(out, { recursive: true, force: true })
for (const [from, to] of FILES) {
  const dest = join(out, to)
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(nm(from), dest)
}
// The English text-reading data ships unpacked: Android's packager silently unpacks .gz files and
// drops the extension, so a .gz name would be missing inside the APK. scan.ts sets gzip: false.
writeFileSync(join(out, 'tesseract', 'eng.traineddata'), gunzipSync(readFileSync(nm('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'))))
console.log(`vendor: copied ${FILES.length + 1} scanner files to public/vendor`)
