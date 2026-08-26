// Produced the Fraunces vs Source Serif 4 comparison that drove the
// initial typeface swap decision — rendered the Home hero at 1440px in
// both faces so we could compare letterforms, colour on the page, and
// register. Result: swapped to Source Serif 4. Retained for reference
// if the display face is ever re-evaluated.
//
// Defensive pattern (try/finally + per-call timeouts): a slow font
// route interception used to leave the browser open forever if the
// woff2 fetch never resolved. Now every wait is bounded and
// browser.close() is in finally.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = 'screenshots'
const NAV_TIMEOUT  = 20_000
const WAIT_TIMEOUT = 15_000
const SHOT_TIMEOUT = 30_000
mkdirSync(OUT, { recursive: true })

const BROWSER = await chromium.launch({ timeout: 30_000 })

const HEADLINE = 'T5 @ Chicago IV is an approved hyperscale data center under construction in Grayslake, Illinois.'
const SUBHEAD  = 'Farm fields at Peterson and Alleghany roads.'
const STAMP    = 'Every claim linked to its source · Last verified Aug 24, 2026'

const CSS_COMMON = `
  <style>
    @font-face {
      font-family: 'Fraunces';
      font-style: normal;
      font-display: swap;
      font-weight: 100 900;
      src: url('/fraunces-latin-opsz-normal.woff2') format('woff2-variations');
    }
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
    @font-face {
      font-family: 'IBMPlexMono';
      font-style: normal;
      font-display: swap;
      font-weight: 500;
      src: url('/ibm-plex-mono-latin-500-normal.woff2') format('woff2');
    }
    body {
      background: #faf8f4;
      color: #3d372f;
      font-family: 'IBMPlex', sans-serif;
      margin: 0;
      padding: 64px 96px;
    }
    .stack { max-width: 1000px; }
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
      font-weight: 500;
      font-size: 60px;
      margin: 0;
    }
    .sub {
      color: #3d372f;
      font-family: 'IBMPlex', sans-serif;
      font-size: 22px;
      line-height: 1.35;
      margin: 24px 0 12px 0;
    }
    .stamp {
      color: #6b6660;
      font-family: 'IBMPlexMono', ui-monospace, monospace;
      font-size: 12.5px;
      margin: 0;
    }
    .fraunces  { font-family: 'Fraunces', serif;      font-optical-sizing: auto; }
    .source    { font-family: 'SourceSerif4', serif;  font-optical-sizing: auto; }
    hr { border: 0; border-top: 1px solid #c8bfb0; margin: 96px 0; }
  </style>
`

const HTML = `
<!doctype html>
<html><head><meta charset="utf-8">${CSS_COMMON}</head>
<body>
  <div class="stack">
    <p class="label">Fraunces &mdash; variable opsz, weight 500</p>
    <h1 class="h1 fraunces">${HEADLINE}</h1>
    <p class="sub">${SUBHEAD}</p>
    <p class="stamp">${STAMP}</p>
  </div>
  <hr />
  <div class="stack">
    <p class="label">Source Serif 4 &mdash; variable opsz, weight 600</p>
    <h1 class="h1 source" style="font-weight: 600;">${HEADLINE}</h1>
    <p class="sub">${SUBHEAD}</p>
    <p class="stamp">${STAMP}</p>
  </div>
</body></html>
`

try {
  const ctx = await BROWSER.newContext({ viewport: { width: 1440, height: 1400 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(WAIT_TIMEOUT)
  page.setDefaultNavigationTimeout(NAV_TIMEOUT)

  // Serve fonts from node_modules over routes
  await page.route('**/fraunces-latin-opsz-normal.woff2', async r => {
    const { readFileSync } = await import('fs')
    r.fulfill({ body: readFileSync('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2') })
  })
  await page.route('**/source-serif-4-latin-opsz-normal.woff2', async r => {
    const { readFileSync } = await import('fs')
    r.fulfill({ body: readFileSync('node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2') })
  })
  await page.route('**/ibm-plex-sans-latin-400-normal.woff2', async r => {
    const { readFileSync } = await import('fs')
    r.fulfill({ body: readFileSync('node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2') })
  })
  await page.route('**/ibm-plex-mono-latin-500-normal.woff2', async r => {
    const { readFileSync } = await import('fs')
    r.fulfill({ body: readFileSync('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2') })
  })

  await page.setContent(HTML, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })
  await page.waitForTimeout(500)

  const file = `${OUT}/font-compare-1440.png`
  await page.screenshot({ path: file, fullPage: true, timeout: SHOT_TIMEOUT })
  console.log('✓', file)
} finally {
  await BROWSER.close()
}
