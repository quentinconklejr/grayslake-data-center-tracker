// Produced the 375 / 768 / 1440 Home screenshots used at every step of
// the refactor to verify layout, hero composition, and stat-grid
// stacking as tokens changed. Run manually against the dev server.
//
// Defensive pattern (try/finally + per-call timeouts): a hung navigation
// or slow reveal-on-scroll animation used to leave the headless Chromium
// process alive and the terminal blocked forever. Now every await that
// touches the page has a bounded timeout, and browser.close() is in
// finally so a mid-loop throw still tears the browser down.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5173'
const OUT = 'screenshots'
const NAV_TIMEOUT  = 20_000
const WAIT_TIMEOUT = 15_000
const SHOT_TIMEOUT = 30_000

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ timeout: 30_000 })
try {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()
    page.setDefaultTimeout(WAIT_TIMEOUT)
    page.setDefaultNavigationTimeout(NAV_TIMEOUT)

    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })

    // Trigger reveal-on-scroll animations by paging through, then rewind.
    const h = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y <= h; y += vp.height * 0.8) {
      await page.evaluate((sy) => window.scrollTo(0, sy), y)
      await page.waitForTimeout(120)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    const file = `${OUT}/home-${vp.name}.png`
    await page.screenshot({ path: file, fullPage: true, timeout: SHOT_TIMEOUT })
    console.log('✓', file)

    await ctx.close()
  }
} finally {
  await browser.close()
}
