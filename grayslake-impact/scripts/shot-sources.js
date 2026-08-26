// Produced the rule-soft Approach 1 vs Approach 2 comparison on
// /documents — the long divide-y sources list — which showed both
// approaches render essentially identically since #8e8372 and
// #8a7f6f differ by less than a hex point per channel. Usage:
// `node scripts/shot-sources.js <tag>`.
//
// Defensive pattern (try/finally + per-call timeouts): standardises
// with the other shot-* scripts so a stalled navigation cannot leave
// a headless Chromium hanging.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = 'screenshots'
const NAV_TIMEOUT  = 20_000
const WAIT_TIMEOUT = 15_000
const SHOT_TIMEOUT = 30_000
mkdirSync(OUT, { recursive: true })

const tag = process.argv[2] ?? 'unnamed'

const browser = await chromium.launch({ timeout: 30_000 })
try {
  for (const vp of [
    { name: '1440', width: 1440, height: 1600 },
    { name: '375',  width: 375,  height: 1400 },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()
    page.setDefaultTimeout(WAIT_TIMEOUT)
    page.setDefaultNavigationTimeout(NAV_TIMEOUT)

    await page.goto('http://localhost:5173/documents', { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })

    // Scroll to the list body
    await page.evaluate(() => {
      const ol = document.querySelector('ol')
      ol?.scrollIntoView({ block: 'start' })
    })
    await page.waitForTimeout(400)

    const file = `${OUT}/sources-${vp.name}-${tag}.png`
    await page.screenshot({ path: file, fullPage: false, timeout: SHOT_TIMEOUT })
    console.log('✓', file)
    await ctx.close()
  }
} finally {
  await browser.close()
}
