// Produced the whole-site screenshot sweep used to sign off the page
// refactors — Project, Agreement, Questions, Timeline, Documents, Map,
// About, Actions, Figures — at 375 and 1440.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5173'
const OUT = 'screenshots'

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const ROUTES = [
  ['project',      '/project'],
  ['agreement',    '/agreement'],
  ['questions',    '/questions'],
  ['timeline',     '/timeline'],
  ['documents',    '/documents'],
  ['map',          '/map'],
  ['about',        '/about'],
  ['actions',      '/actions'],
  ['figures',      '/figures'],
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  for (const [name, path] of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 20000 })
    const h = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y <= h; y += vp.height * 0.8) {
      await page.evaluate(sy => window.scrollTo(0, sy), y)
      await page.waitForTimeout(80)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    const file = `${OUT}/${name}-${vp.name}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log('✓', file)
  }
  await ctx.close()
}

await browser.close()
