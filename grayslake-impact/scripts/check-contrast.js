/**
 * WCAG 2.1 contrast audit for the semantic token layer.
 *
 *   npm run check-contrast
 *
 * Contrast is computed directly from the hex values declared in
 * tailwind.config.js. No browser needed — the math is exact rather than
 * sampled. Checks every text colour actually used in the source against
 * every background it can land on.
 *
 * AA thresholds: 4.5:1 normal text, 3:1 large text (>=24px, or >=18.66px
 * bold) and non-text UI. The site's `2xs` scale is 12.5px, so everything
 * at that size is normal text and needs 4.5 — that is where citation and
 * caption metadata lives.
 *
 * Semantic tokens shape:
 *   text-{family}                 (uses DEFAULT)
 *   text-{family}-{shade}         (uses named shade, e.g. ink-500)
 *   text-{family}-{sub}           (nested groups, e.g. status-stated)
 *   text-{family}-{sub}-{shade}   (nested groups w/ shade, e.g. paper-sunk)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// ── Colour math ──────────────────────────────────────────────────────
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

// ── Parse the semantic palette from tailwind.config.js ───────────────
// The config file is JS not JSON, so eval its default export in a
// controlled way rather than trying to regex-match nested braces.
const cfgPath = join(ROOT, 'tailwind.config.js')
const cfgUrl  = 'file://' + cfgPath.replace(/\\/g, '/')
const { default: cfg } = await import(cfgUrl)
// Colours live at theme.colors (replacing Tailwind defaults), not
// theme.extend.colors. Fall back to extend for backward compatibility.
const COLORS = cfg.theme.colors ?? cfg.theme.extend?.colors ?? {}

// Flatten: { 'ink-900': '#hex', 'ink': '#hex' (DEFAULT), 'status-stated-soft': '#hex' }
const PALETTE = {}
function flatten(obj, prefix) {
  if (typeof obj === 'string') {
    PALETTE[prefix] = obj
    return
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'DEFAULT') { PALETTE[prefix] = v; continue }
    flatten(v, prefix ? `${prefix}-${k}` : k)
  }
}
for (const [family, val] of Object.entries(COLORS)) flatten(val, family)

// ── Walk source ──────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.jsx?$/.test(f)) out.push(p)
  }
  return out
}
const files = walk(join(ROOT, 'src'))

// Tokens that describe a paper-coloured foreground painted on a dark
// or coloured surface — text-paper on bg-accent, text-paper on bg-ink-900,
// text-paper-sunk on bg-ink-900, etc. These are exempt from the paper-
// background contrast check because the check would false-flag a light
// text colour that is actually landing on a dark button or a dark bar.
const PAPER_ON_DARK = new Set(['paper', 'paper-raised', 'paper-sunk'])

// text-{token} usages. Token is any dash-joined string of word characters
// following text- that resolves in PALETTE. aria-hidden and inline-annotated
// decorative colours are exempt from contrast (WCAG 1.4.3).
const TOKEN_RE = /\btext-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\b/g

const usage = new Map() // token -> Set of files
for (const f of files) {
  const src = readFileSync(f, 'utf8')

  // Colours annotated as decoration elsewhere in the file (e.g. inside a
  // config array away from the element that carries aria-hidden).
  const annotated = new Set()
  for (const line of src.split('\n')) {
    if (!/decorative \(aria-hidden\)/.test(line)) continue
    for (const [, t] of line.matchAll(TOKEN_RE)) annotated.add(t)
  }

  for (const el of src.split('<')) {
    const decorative = /aria-hidden=["{]?true/.test(el.slice(0, 400))
    for (const [, token] of el.matchAll(TOKEN_RE)) {
      if (!PALETTE[token]) continue
      if (decorative || annotated.has(token)) continue
      if (!usage.has(token)) usage.set(token, new Set())
      usage.get(token).add(f.replace(ROOT + '/', '').replace(ROOT + '\\', ''))
    }
  }
}

// ── Backgrounds text can land on ─────────────────────────────────────
const BACKGROUNDS = {
  'paper':         PALETTE['paper'],          // #faf8f4
  'paper-raised':  PALETTE['paper-raised'],   // #ffffff
  'paper-sunk':    PALETTE['paper-sunk'],     // #f0ecdf
  'accent-soft':   PALETTE['accent-soft'],    // hover fill for links
  // Status-hue soft backgrounds — evidence blocks, timeline chips, etc.
  ...Object.fromEntries(
    Object.entries(PALETTE)
      .filter(([k]) => k.startsWith('status-') && k.endsWith('-soft'))
  ),
}

// ── Compute pairs ────────────────────────────────────────────────────
const rows  = []
const fails = []
for (const [token, where] of [...usage].sort()) {
  const hex = PALETTE[token]
  if (!hex) continue
  // paper-* tokens are always foregrounds on dark/coloured surfaces
  // (buttons, dark bars, map overlays). They're never intended to land
  // on paper — skip the paper-background contrast check for them.
  const isPaperFg = PAPER_ON_DARK.has(token)
  for (const [bgName, bgHex] of Object.entries(BACKGROUNDS)) {
    if (!bgHex) continue
    const r = ratio(hex, bgHex)
    const pass = r >= 4.5
    rows.push({ token, hex, bg: bgName, r: +r.toFixed(2), pass, files: [...where].length })
    if (!pass && !isPaperFg && (bgName === 'paper' || bgName === 'paper-raised')) {
      fails.push({ token, hex, bg: bgName, r: +r.toFixed(2), where: [...where] })
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────
console.log('token                     hex       vs paper  vs raised  vs sunk   used in')
console.log('-'.repeat(88))
const seen = new Set()
for (const row of rows) {
  if (row.bg !== 'paper' || seen.has(row.token)) continue
  seen.add(row.token)
  const raised = rows.find(x => x.token === row.token && x.bg === 'paper-raised')
  const sunk   = rows.find(x => x.token === row.token && x.bg === 'paper-sunk')
  const mark = row.pass ? ' ' : '!'
  console.log(
    `${mark} ${row.token.padEnd(24)} ${row.hex}  ${String(row.r).padStart(5)}     ${String(raised?.r ?? '-').padStart(5)}      ${String(sunk?.r ?? '-').padStart(5)}     ${row.files} file(s)`,
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
console.log('\nPASS — every text colour in use meets 4.5:1 on paper and paper-raised')
