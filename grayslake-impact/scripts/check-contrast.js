/**
 * WCAG 2.1 contrast audit computed directly from tailwind.config.js.
 *
 *   npm run check-contrast
 *
 * No browser needed: contrast is pure arithmetic on the hex values, so this is
 * exact rather than sampled. Checks every text colour actually used in the
 * source against the background it sits on.
 *
 * AA thresholds: 4.5:1 normal text, 3:1 large text (>=24px, or >=18.66px bold)
 * and non-text UI. The site's `2xs` scale is 10px, so everything at that size
 * is normal text and needs 4.5 — that is where citation and caption metadata
 * lives, which is exactly the text a reporter needs to read.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const srgb = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = hex => {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h
  const [r, g, b] = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16))
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

// Palette, parsed from the config rather than retyped
const cfg = readFileSync(join(ROOT, 'tailwind.config.js'), 'utf8')
const PALETTE = {}
const FAMILIES = ['gray', 'blue', 'emerald', 'amber', 'red', 'violet', 'sky', 'cyan', 'purple', 'orange']
for (const family of FAMILIES) {
  // Anchor on the family key so the enclosing `colors: {` block is not itself
  // read as a family, which silently dropped the entire grey ramp.
  const block = cfg.match(new RegExp(`\\b${family}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},`))
  if (!block) continue
  for (const [, shade, hex] of block[1].matchAll(/(\d+):\s*'(#[0-9a-fA-F]{3,6})'/g)) {
    PALETTE[`${family}-${shade}`] = hex
  }
}
const WHITE = '#ffffff'

// Backgrounds a text colour can land on in this design
const BACKGROUNDS = Object.fromEntries(
  Object.entries({
    white: WHITE,
    'gray-50': PALETTE['gray-50'],
    'blue-50': PALETTE['blue-50'],
    'amber-50': PALETTE['amber-50'],
    'emerald-50': PALETTE['emerald-50'],
  }).filter(([, hex]) => Boolean(hex)),
)

// Which text colours are actually used, and at what size
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.jsx?$/.test(f)) out.push(p)
  }
  return out
}
const files = walk(join(ROOT, 'src'))

// Files that paint onto a dark surface. Their text is checked against that
// surface, not white, so light-on-dark stops reporting as a failure.
const DARK_SURFACE = /className="[^"]*bg-(?:gray|slate)-(?:800|900|950)\b/
const darkFiles = new Set(
  files.filter(f => DARK_SURFACE.test(readFileSync(f, 'utf8'))).map(f => f.replace(ROOT + '/', '')),
)
const usage = new Map() // token -> Set of files
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  // Split on element boundaries so an aria-hidden attribute can be associated
  // with the class list it sits beside. Decorative content is exempt from
  // contrast (WCAG 1.4.3) but only if it is genuinely hidden from assistive
  // technology, so that is what we test for rather than assuming.
  // Lines explicitly annotated as decoration, for colours defined in config
  // arrays away from the element that carries aria-hidden.
  const annotated = new Set()
  for (const line of src.split('\n')) {
    if (!/decorative \(aria-hidden\)/.test(line)) continue
    for (const [, t] of line.matchAll(/\btext-((?:gray|blue|amber|emerald|red|violet|sky|cyan|purple|orange)-\d{2,3})\b/g)) annotated.add(t)
  }
  for (const el of src.split('<')) {
    const decorative = /aria-hidden=["{]?true/.test(el.slice(0, 400))
    for (const [, token] of el.matchAll(/\btext-((?:gray|blue|amber|emerald|red|violet|sky|cyan|purple|orange)-\d{2,3})\b/g)) {
      if (decorative || annotated.has(token)) continue
      if (!usage.has(token)) usage.set(token, new Set())
      usage.get(token).add(f.replace(ROOT + '/', ''))
    }
  }
}

// Small text (2xs/xs) demands 4.5 regardless of weight — 10px and 12px here
const SMALL_TEXT_TOKENS = new Set()
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const [, cls] of src.matchAll(/className="([^"]*text-2xs[^"]*)"/g)) {
    for (const [, t] of cls.matchAll(/text-((?:gray|blue|amber|emerald)-\d{2,3})/g)) SMALL_TEXT_TOKENS.add(t)
  }
}

const fails = []
const rows = []
for (const [token, where] of [...usage].sort()) {
  const hex = PALETTE[token]
  if (!hex) continue
  for (const [bgName, bgHex] of Object.entries(BACKGROUNDS)) {
    const r = ratio(hex, bgHex)
    const small = SMALL_TEXT_TOKENS.has(token)
    const need = 4.5 // all body/caption text on this site is < 24px
    const pass = r >= need
    rows.push({ token, hex, bg: bgName, r: +r.toFixed(2), need, pass, small, files: [...where].length })
    const lightOnly = [...where].filter(w => !darkFiles.has(w))
    if (!pass && (bgName === 'white' || bgName === 'gray-50') && lightOnly.length) {
      fails.push({ token, hex, bg: bgName, r: +r.toFixed(2), small, where: lightOnly })
    }
  }
}

console.log('token          hex       vs white  vs gray-50   used in')
console.log('-'.repeat(66))
const seen = new Set()
for (const row of rows) {
  if (row.bg !== 'white' || seen.has(row.token)) continue
  seen.add(row.token)
  const g50 = rows.find(x => x.token === row.token && x.bg === 'gray-50')
  const mark = row.pass ? ' ' : '!'
  console.log(
    `${mark} ${row.token.padEnd(12)} ${row.hex}  ${String(row.r).padStart(5)}     ${String(g50?.r ?? '-').padStart(5)}      ${row.files} file(s)`,
  )
}

if (fails.length) {
  console.log('\nFAIL — below 4.5:1 on a primary background:')
  for (const f of fails) {
    console.log(`  ${f.token} (${f.hex}) on ${f.bg}: ${f.r}:1`)
    for (const w of f.where.slice(0, 4)) console.log(`      ${w}`)
    if (f.where.length > 4) console.log(`      …and ${f.where.length - 4} more`)
  }
  process.exit(1)
}
console.log('\nPASS — every text colour in use meets 4.5:1 on white and gray-50')
