/**
 * Post-build: write a static HTML shell per route with correct <head> meta.
 *
 * Why this exists
 * ---------------
 * This is a Vite SPA. Every route was served the same dist/index.html, and
 * PageTitle patched the meta tags client-side. Social crawlers (Slack,
 * Facebook, X, iMessage, LinkedIn) do not execute JavaScript, so they only
 * ever saw the homepage meta. Sharing /energy produced a homepage card.
 *
 * Why not prerendering
 * --------------------
 * Full prerender (react-snap, vite-plugin-ssg) renders the entire DOM per
 * route and needs either headless Chrome in CI or an SSR-compatible entry.
 * The broken thing here is only the <head>, so rendering the <body> is cost
 * without benefit. This script copies the built index.html once per route and
 * rewrites the head tags — no new runtime deps, no browser, no SSR.
 *
 * The JS bundle is byte-identical in every shell, so React Router boots and
 * takes over exactly as before. Users see no difference; crawlers see truth.
 *
 * Serving: vercel.json sets cleanUrls, so /energy resolves to energy.html from
 * the filesystem. Vercel checks the filesystem before applying rewrites, so
 * the SPA catch-all still handles unknown paths and renders NotFound.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pageMeta, SITE_ORIGIN } from '../src/data/pageMeta.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const BASE_TITLE = 'Grayslake Data Center Tracker'
const SUFFIX = ' | T5@Chicago Tracker'

const escape = str =>
  String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Replace a meta tag's content by attribute, or append it if absent. */
function setMeta(html, attr, name, content) {
  const pattern = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`, 'i')
  if (pattern.test(html)) return html.replace(pattern, `$1${escape(content)}$2`)
  return html.replace('</head>', `    <meta ${attr}="${name}" content="${escape(content)}" />\n  </head>`)
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')
let count = 0

for (const [route, meta] of Object.entries(pageMeta)) {
  const title = meta.title ? `${meta.title}${SUFFIX}` : BASE_TITLE
  const url = `${SITE_ORIGIN}${route === '/' ? '/' : route}`
  const image = `${SITE_ORIGIN}${meta.ogImage}`

  let html = template
    .replace(/<title>[^<]*<\/title>/i, `<title>${escape(title)}</title>`)

  html = setMeta(html, 'name', 'description', meta.description)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', meta.description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'property', 'og:image', image)
  html = setMeta(html, 'property', 'og:image:alt', title)
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', meta.description)
  html = setMeta(html, 'name', 'twitter:url', url)
  html = setMeta(html, 'name', 'twitter:image', image)

  // canonical
  if (/<link\s+rel="canonical"/i.test(html)) {
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${url}$2`)
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`)
  }

  const outPath = route === '/' ? join(dist, 'index.html') : join(dist, `${route.slice(1)}.html`)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
  count++
}

console.log(`build-route-html: wrote ${count} route shells with static head meta`)
