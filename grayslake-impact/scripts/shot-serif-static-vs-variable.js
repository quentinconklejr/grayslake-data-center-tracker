// Produced the evidence used to justify shipping Source Serif 4 as
// static 400 + 600 instances rather than the variable-opsz file.
// Compares the two renderings at the sizes actually used on the site
// (60px H1, 22px subhead) at 1440px width.
//
// Defensive pattern (try/finally + per-call timeouts): standardises
// with the other shot-* scripts so a hung font route intercept cannot
// leave the browser open.
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'fs'

const OUT = 'screenshots'
const NAV_TIMEOUT  = 20_000
const WAIT_TIMEOUT = 15_000
const SHOT_TIMEOUT = 30_000
mkdirSync(OUT, { recursive: true })

const HEADLINE = 'T5 @ Chicago IV is an approved hyperscale data center under construction in Grayslake, Illinois.'
const SUBHEAD  = 'Farm fields at Peterson and Alleghany roads.'
const H3       = 'Land Recorded to T5'
const LABEL    = 'Grid Impact'

const CSS = `
  <style>
    @font-face {
      font-family: 'SourceSerifStatic';
      font-style: normal;
      font-display: swap;
      font-weight: 600;
      src: url('/source-serif-4-latin-600-normal.woff2') format('woff2');
    }
    @font-face {
      font-family: 'SourceSerifStatic';
      font-style: normal;
      font-display: swap;
      font-weight: 400;
      src: url('/source-serif-4-latin-400-normal.woff2') format('woff2');
    }
    @font-face {
      font-family: 'SourceSerifVariable';
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
    .col { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; max-width: 1440px; }
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
      font-weight: 600;
      margin: 0 0 24px 0;
      font-optical-sizing: auto;
    }
    .h3 {
      color: #14110f;
      letter-spacing: -0.02em;
      line-height: 1.15;
      font-size: 36px;
      font-weight: 600;
      margin: 24px 0 12px 0;
      font-optical-sizing: auto;
    }
    .caption {
      font-family: 'IBMPlex', sans-serif;
      font-size: 22px;
      line-height: 1.35;
      color: #3d372f;
      margin: 0 0 24px 0;
    }
    .eyebrow {
      font-style: italic;
      font-weight: 400;
      font-size: 14px;
      color: #6b6660;
      letter-spacing: 0.01em;
      margin: 0 0 12px 0;
      font-optical-sizing: auto;
    }
    .static  { font-family: 'SourceSerifStatic', serif; }
    .variable { font-family: 'SourceSerifVariable', serif; }
    hr { border: 0; border-top: 1px solid #c8bfb0; margin: 40px 0; }
  </style>
`

const HTML = `
<!doctype html>
<html><head><meta charset="utf-8">${CSS}</head>
<body>
  <div class="col">
    <div>
      <p class="label">Static — 600 for headings, 400 for italic labels</p>
      <p class="eyebrow static">${LABEL}</p>
      <h1 class="h1 static">${HEADLINE}</h1>
      <p class="caption">${SUBHEAD}</p>
      <h3 class="h3 static">${H3}</h3>
    </div>
    <div>
      <p class="label">Variable — same weights, opsz auto</p>
      <p class="eyebrow variable">${LABEL}</p>
      <h1 class="h1 variable">${HEADLINE}</h1>
      <p class="caption">${SUBHEAD}</p>
      <h3 class="h3 variable">${H3}</h3>
    </div>
  </div>
</body></html>
`

const browser = await chromium.launch({ timeout: 30_000 })
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(WAIT_TIMEOUT)
  page.setDefaultNavigationTimeout(NAV_TIMEOUT)

  const files = {
    '/source-serif-4-latin-400-normal.woff2':
      'node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff2',
    '/source-serif-4-latin-600-normal.woff2':
      'node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2',
    '/source-serif-4-latin-opsz-normal.woff2':
      'node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2',
    '/ibm-plex-sans-latin-400-normal.woff2':
      'node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2',
  }
  for (const [route, path] of Object.entries(files)) {
    await page.route(`**${route}`, r => r.fulfill({ body: readFileSync(path) }))
  }

  await page.setContent(HTML, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })
  await page.waitForTimeout(500)

  const file = `${OUT}/serif-static-vs-variable-1440.png`
  await page.screenshot({ path: file, fullPage: true, timeout: SHOT_TIMEOUT })
  console.log('✓', file)
} finally {
  await browser.close()
}
