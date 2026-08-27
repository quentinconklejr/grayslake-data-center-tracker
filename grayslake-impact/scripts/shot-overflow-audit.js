// Walk the DOM at 375px and report every element whose intrinsic width
// exceeds the viewport. Defensive pattern — try/finally, per-call timeouts,
// bounded launch.
//
// Provenance: added while tracking down a 2px horizontal scrollbar on
// /project, /energy, /schools, /jobs at 375px. Two root causes were
// fixed (ChartFigure sr-only table wrapped in a div so overflow:hidden
// clips it; SourceCitation button given `contain: layout` so its 44×44
// ::after tap region does not inflate ancestor scrollWidth). Keep this
// script in the tree and re-run after any layout change — it will flag
// regressions in the same class of bug before they ship.
//
// Requires: dev server on http://localhost:5173 and playwright installed.
// Usage: node scripts/shot-overflow-audit.js
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const NAV_TIMEOUT  = 20_000
const WAIT_TIMEOUT = 15_000
const VIEWPORT = { width: 375, height: 812 }

const ROUTES = ['/project', '/', '/questions', '/energy', '/schools', '/tax-impact', '/jobs', '/timeline', '/agreement', '/actions', '/about', '/figures', '/documents', '/map', '/accessibility', '/privacy']

const browser = await chromium.launch({ timeout: 30_000 })
try {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  page.setDefaultTimeout(WAIT_TIMEOUT)
  page.setDefaultNavigationTimeout(NAV_TIMEOUT)

  for (const path of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })
    await page.waitForTimeout(500)

    const report = await page.evaluate(vw => {
      const html = document.documentElement
      const body = document.body
      const docScrollWidth = Math.max(html.scrollWidth, body.scrollWidth)
      if (docScrollWidth <= vw) return { docScrollWidth, offenders: [] }

      // Walk every element. Anything whose right edge exceeds the viewport
      // is a candidate — but only leaf-ish elements that actually
      // introduce the width (their parent has scrollWidth too big BECAUSE
      // of them).
      const offenders = []
      const walk = document.querySelectorAll('*')
      for (const el of walk) {
        const r = el.getBoundingClientRect()
        const own = el.scrollWidth
        // Element itself is wider than viewport OR its right edge exceeds
        if (own > vw + 4 || r.right > vw + 4) {
          // Skip elements inside a container that has overflow-x auto/scroll
          // and thus is legitimately allowed to be wider
          let hasScrollAncestor = false
          for (let a = el.parentElement; a; a = a.parentElement) {
            const cs = getComputedStyle(a)
            if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) { hasScrollAncestor = true; break }
          }
          if (hasScrollAncestor) continue

          // Skip fixed-position elements (menus, popups)
          if (getComputedStyle(el).position === 'fixed') continue

          // Skip document-root elements
          if (el === html || el === body) continue

          offenders.push({
            tag: el.tagName,
            id: el.id || '',
            cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '',
            own,
            right: Math.round(r.right),
            text: (el.innerText || '').slice(0, 40).replace(/\n/g, ' | '),
          })
        }
      }
      // Sort by own width descending; keep top 8
      offenders.sort((a, b) => b.own - a.own)
      return { docScrollWidth, offenders: offenders.slice(0, 8) }
    }, VIEWPORT.width)

    if (report.docScrollWidth > VIEWPORT.width) {
      console.log(`\n[BAD] ${path}  docScrollWidth=${report.docScrollWidth}px (viewport ${VIEWPORT.width}px)`)
      for (const o of report.offenders) {
        console.log(`  ${o.tag.padEnd(6)} own=${o.own} right=${o.right}  cls="${String(o.cls).slice(0, 80)}"  text="${o.text}"`)
      }
    } else {
      console.log(`[ok]  ${path}  docScrollWidth=${report.docScrollWidth}`)
    }
  }
} finally {
  await browser.close()
}
