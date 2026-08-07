/**
 * Post-build: write robots.txt and sitemap.xml into dist/.
 *
 * Generated rather than hand-written so the URL list cannot drift from the
 * routes that actually exist. Only canonical routes are listed; the redirect
 * paths kept for old shared links (/energy, /jobs, /tax-impact, /schools,
 * /sources, /reporters, /residents, /officials) are deliberately excluded,
 * because listing a URL that 302s at a search engine invites it to index two
 * addresses for one page.
 *
 * lastmod uses LAST_VERIFIED, the date the figures were last checked against
 * source, rather than the build timestamp. A redeploy that changes no content
 * should not claim the page changed.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_ORIGIN } from '../src/data/pageMeta.js'
import { LAST_VERIFIED } from '../src/data/siteConfig.js'

const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist')

// changefreq/priority are hints only; kept honest rather than all-1.0.
const ROUTES = [
  ['/',              '1.0', 'weekly'],
  ['/project',       '0.9', 'weekly'],
  ['/timeline',      '0.9', 'weekly'],
  ['/map',           '0.8', 'monthly'],
  ['/figures',       '0.8', 'weekly'],
  ['/documents',     '0.8', 'weekly'],
  ['/questions',     '0.7', 'monthly'],
  ['/actions',       '0.7', 'weekly'],
  ['/about',         '0.5', 'yearly'],
  ['/accessibility', '0.3', 'yearly'],
  ['/privacy',       '0.3', 'yearly'],
]

const lastmod = new Date(LAST_VERIFIED + ' UTC').toISOString().slice(0, 10)
if (Number.isNaN(Date.parse(LAST_VERIFIED))) {
  throw new Error(`LAST_VERIFIED is not a parseable date: ${LAST_VERIFIED}`)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(([path, priority, changefreq]) => `  <url>
    <loc>${SITE_ORIGIN}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const robots = `# Grayslake Data Center Tracker
# Everything here is public record and meant to be found.
User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`

writeFileSync(join(dist, 'sitemap.xml'), sitemap)
writeFileSync(join(dist, 'robots.txt'), robots)
console.log(`build-seo-files: sitemap.xml with ${ROUTES.length} URLs (lastmod ${lastmod}), robots.txt`)
