// Produced the evidence used to pick weight 600 (not 700) for Source
// Serif 4 on h1/h2/h3 — rendered the same headline at weights 400,
// 500, 600, and 700 at 1440px. 400/500 read as body-copy at display
// size, 700 (browser h1 default) shades into advocacy voice. 600 is
// the sweet spot; the rule lives in src/index.css.
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'fs'

const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const BROWSER = await chromium.launch()

const HEADLINE = 'T5 @ Chicago IV is an approved hyperscale data center under construction in Grayslake, Illinois.'
const SUBHEAD  = 'Farm fields at Peterson and Alleghany roads.'

const CSS = `
  <style>
    @font-face {
      font-family: 'SourceSerif4';
      font-style: normal;
      font-display: swap;
      font-weight: 200 900;
      src: url('/source-serif-4-latin-opsz-normal.woff2') format('woff2-variations');
    }
    @font-face {
      font-family: 'IBMPlex';
      font-style: normal;
      font-display: swap;
      font-weight: 400;
      src: url('/ibm-plex-sans-latin-400-normal.woff2') format('woff2');
    }
    body {
      background: #faf8f4;
      color: #3d372f;
      font-family: 'IBMPlex', sans-serif;
      margin: 0;
      padding: 48px 96px;
    }
    .row { max-width: 1100px; margin-bottom: 56px; }
    .label {
      font-family: 'IBMPlex', sans-serif;
      font-style: italic;
      font-size: 12.5px;
      color: #6b6660;
      letter-spacing: 0.01em;
      margin: 0 0 12px 0;
    }
    .h1 {
      color: #14110f;
      letter-spacing: -0.025em;
      line-height: 1.05;
      font-size: 60px;
      font-family: 'SourceSerif4', serif;
      font-optical-sizing: auto;
      margin: 0;
    }
    .sub {
      font-family: 'IBMPlex', sans-serif;
      font-size: 22px;
      line-height: 1.35;
      color: #3d372f;
      margin: 20px 0 0 0;
    }
    hr { border: 0; border-top: 1px solid #c8bfb0; margin: 0 0 56px 0; }
  </style>
`

const rows = [400, 500, 600, 700].map(w => `
  <div class="row">
    <p class="label">Source Serif 4 &mdash; weight ${w}</p>
    <h1 class="h1" style="font-weight: ${w};">${HEADLINE}</h1>
    <p class="sub">${SUBHEAD}</p>
  </div>
  <hr />
`).join('')

const HTML = `
<!doctype html>
<html><head><meta charset="utf-8">${CSS}</head>
<body>${rows}</body></html>
`

const ctx = await BROWSER.newContext({ viewport: { width: 1440, height: 1800 } })
const page = await ctx.newPage()

await page.route('**/source-serif-4-latin-opsz-normal.woff2', r =>
  r.fulfill({ body: readFileSync('node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2') })
)
await page.route('**/ibm-plex-sans-latin-400-normal.woff2', r =>
  r.fulfill({ body: readFileSync('node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2') })
)

await page.setContent(HTML, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

const file = `${OUT}/serif-weights.png`
await page.screenshot({ path: file, fullPage: true })
console.log('✓', file)

await BROWSER.close()
