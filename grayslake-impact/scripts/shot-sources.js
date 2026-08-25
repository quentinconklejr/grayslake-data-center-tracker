// Produced the rule-soft Approach 1 vs Approach 2 comparison on
// /documents — the long divide-y sources list — which showed both
// approaches render essentially identically since #8e8372 and
// #8a7f6f differ by less than a hex point per channel. Usage:
// `node scripts/shot-sources.js <tag>`.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const tag = process.argv[2] ?? 'unnamed'

const browser = await chromium.launch()

for (const vp of [
  { name: '1440', width: 1440, height: 1600 },
  { name: '375',  width: 375,  height: 1400 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:5173/documents', { waitUntil: 'networkidle', timeout: 20000 })

  // Scroll to the list body
  await page.evaluate(() => {
    const ol = document.querySelector('ol')
    ol?.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(400)

  const file = `${OUT}/sources-${vp.name}-${tag}.png`
  await page.screenshot({ path: file, fullPage: false })
  console.log('✓', file)
  await ctx.close()
}

await browser.close()
