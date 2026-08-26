// Produced the evidence for the rule-soft comparison — confirmed
// that ParcelTable is a poor target because its row parsing is done
// by zebra rows (bg-paper-sunk/50), not by divide-rule-soft, so the
// rule-soft value change is invisible there. Kept for future
// per-page comparisons; usage: `node scripts/shot-parcel.js <tag>`.
//
// Defensive pattern (try/finally + per-call timeouts): the /map route
// pulls Mapbox tiles which can stall, so navigation was the historic
// hang point. Now bounded and browser.close() runs on error.
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

    await page.goto('http://localhost:5173/map', { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })

    // Scroll to the parcel table (bottom of page) so it's visible
    await page.evaluate(() => {
      const t = document.querySelector('section[aria-label="Recorded parcel directory"]')
      t?.scrollIntoView({ block: 'start' })
    })
    await page.waitForTimeout(400)

    // Screenshot just the parcel table region (with some padding)
    const rect = await page.evaluate(() => {
      const t = document.querySelector('section[aria-label="Recorded parcel directory"]')
      if (!t) return null
      const r = t.getBoundingClientRect()
      return { x: 0, y: 0, width: window.innerWidth, height: Math.min(r.height + 60, window.innerHeight) }
    })

    const file = `${OUT}/parcel-${vp.name}-${tag}.png`
    await page.screenshot({ path: file, clip: rect, timeout: SHOT_TIMEOUT })
    console.log('✓', file)
    await ctx.close()
  }
} finally {
  await browser.close()
}
