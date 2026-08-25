// Produced the 375 / 768 / 1440 Home screenshots used at every step of
// the refactor to verify layout, hero composition, and stat-grid
// stacking as tokens changed. Run manually against the dev server.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5173'
const OUT = 'screenshots'

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 })

  // Trigger reveal-on-scroll animations by paging through, then rewind.
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y <= h; y += vp.height * 0.8) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)

  const file = `${OUT}/home-${vp.name}.png`
  await page.screenshot({ path: file, fullPage: true })
  console.log('✓', file)

  await ctx.close()
}

await browser.close()
