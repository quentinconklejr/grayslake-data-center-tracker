import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5173'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
]

const PAGES = [
  { name: 'home',   path: '/' },
  { name: 'energy', path: '/energy' },
]

mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  })
  const page = await ctx.newPage()

  for (const pg of PAGES) {
    await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 })
    // Let animations settle
    await page.waitForTimeout(800)

    const file = `screenshots/${pg.name}-${vp.name}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log(`✓ ${file}`)
  }

  await ctx.close()
}

await browser.close()
console.log('Done.')
