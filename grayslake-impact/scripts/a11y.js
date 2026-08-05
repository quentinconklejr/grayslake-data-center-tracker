/**
 * Run axe-core against the built site.
 *
 *   npm run build && npm run a11y
 *
 * Needs a Chromium that Puppeteer can launch. It is deliberately not wired
 * into the default build: the environment this was developed in could not
 * download Chromium, so the audit here was done by source review plus the
 * exact contrast arithmetic in check-contrast.js. This script is how you close
 * that gap locally.
 *
 * Roughly 40% of WCAG AA is machine-checkable. What axe cannot tell you is in
 * MANUAL-A11Y-CHECKS.md — run that list too.
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const PORT = 4177

const ROUTES = ['/', '/project', '/timeline', '/questions', '/documents', '/map', '/about', '/actions', '/reporters']

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.geojson': 'application/json', '.pdf': 'application/pdf' }

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ not found — run `npm run build` first')
  process.exit(1)
}

let puppeteer, axeSource
try {
  puppeteer = (await import('puppeteer')).default
  axeSource = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8')
} catch {
  console.error('Missing dependencies. Install with:\n  npm i -D puppeteer axe-core')
  process.exit(1)
}

const server = createServer((req, res) => {
  const url = req.url.split('?')[0]
  let file = join(DIST, url === '/' ? 'index.html' : url)
  if (!existsSync(file) || !extname(file)) {
    const shell = join(DIST, `${url.replace(/^\//, '')}.html`)
    file = existsSync(shell) ? shell : join(DIST, 'index.html')
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(PORT)

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
let total = 0
const summary = []

for (const route of ROUTES) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.evaluate(axeSource)
  const { violations } = await page.evaluate(async () =>
    await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }),
  )
  total += violations.length
  summary.push([route, violations.length])
  if (violations.length) {
    console.log(`\n${route}`)
    for (const v of violations) {
      console.log(`  [${v.impact}] ${v.id} — ${v.help}  (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'})`)
      for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`)
      console.log(`      ${v.helpUrl}`)
    }
  }
  await page.close()
}

await browser.close()
server.close()

console.log('\nroute                violations')
console.log('-'.repeat(34))
for (const [r, n] of summary) console.log(`${r.padEnd(22)}${n}`)
console.log(`\n${total} violation type${total === 1 ? '' : 's'} across ${ROUTES.length} routes`)
console.log('Machine checks cover roughly 40% of AA — see MANUAL-A11Y-CHECKS.md for the rest.')
process.exit(total ? 1 : 0)
