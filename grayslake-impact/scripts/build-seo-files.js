import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_ORIGIN } from '../src/data/pageMeta.js'
import { LAST_VERIFIED } from '../src/data/siteConfig.js'
import { timelineEvents } from '../src/data/timeline.js'

const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist')

const ROUTES = [
  ['/', '1.0', 'weekly'],
  ['/project', '0.9', 'weekly'],
  ['/timeline', '0.9', 'weekly'],
  ['/map', '0.8', 'monthly'],
  ['/figures', '0.8', 'weekly'],
  ['/documents', '0.8', 'weekly'],
  ['/questions', '0.7', 'monthly'],
  ['/actions', '0.7', 'weekly'],
  ['/about', '0.5', 'yearly'],
]

const lastmod = new Date(LAST_VERIFIED + ' UTC').toISOString().slice(0, 10)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(([path, priority, changefreq]) => `  <url>
    <loc>${SITE_ORIGIN}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`

const robots = `# Grayslake Data Center Tracker
User-agent: *
Allow: /
Sitemap: ${SITE_ORIGIN}/sitemap.xml`

// Generate RSS Feed (feed.xml)
const rssItems = timelineEvents.slice(0, 10).map(e => `    <item>
      <title><![CDATA[${e.title}]]></title>
      <link>${SITE_ORIGIN}/timeline</link>
      <description><![CDATA[${e.description || e.title}]]></description>
      <pubDate>${new Date(e.date || lastmod).toUTCString()}</pubDate>
      <guid>${SITE_ORIGIN}/timeline#${e.date}</guid>
    </item>`).join('\n')

const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Grayslake Data Center Tracker Updates</title>
    <link>${SITE_ORIGIN}</link>
    <description>Public records, land deeds, and filing updates for T5 @ Chicago IV in Grayslake, IL.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`

writeFileSync(join(dist, 'sitemap.xml'), sitemap)
writeFileSync(join(dist, 'robots.txt'), robots)
writeFileSync(join(dist, 'feed.xml'), rssFeed)

console.log(`build-seo-files: sitemap.xml, robots.txt, feed.xml generated.`)
