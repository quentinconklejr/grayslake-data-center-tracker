#!/usr/bin/env node
/**
 * Checks every source link the site shows, and exits 1 if any is broken.
 *
 *   - External URLs (and each source's archiveUrl) are fetched with a
 *     browser user agent and a full GET, so a bot-wall page is caught.
 *   - Site-relative paths (/docs/... PDFs, /records/t5 and other routes)
 *     used to fail with "Failed to parse URL" and were ignored. They are now
 *     checked against the built site in dist/ (run `npm run build` first),
 *     falling back to public/ and the route list in pageMeta.js.
 *   - 401/403/429 and bot-wall pages mean the server answered but would not
 *     let a script read the page. Those are not counted as broken, but they
 *     are listed at the end as needing a manual check, because "the server
 *     is up" is not the same as "the link is right".
 *
 * Skips entries marked status:"unverified" (tracked separately).
 * Run via: node scripts/check-links.js
 */

import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sources } from '../src/data/sources.js'
import { pageMeta } from '../src/data/pageMeta.js'
import { recordsPackets, recordsFiles } from '../src/data/records.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const PUBLIC = join(ROOT, 'public')
const TIMEOUT_MS = 20_000
const CONCURRENCY = 8
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
const BLOCKED = [401, 403, 429]

// Every link to check: [label, url]
const links = []
for (const [key, s] of Object.entries(sources)) {
  if (s.status === 'unverified') continue
  if (s.url) links.push([key, s.url])
  if (s.localCopy && s.localCopy !== s.url) links.push([`${key} (local copy)`, s.localCopy])
  if (s.archiveUrl) links.push([`${key} (archive)`, s.archiveUrl])
}
for (const [id, p] of Object.entries(recordsPackets)) {
  if (p.fullPdfUrl) links.push([`records packet ${id}`, p.fullPdfUrl])
}
for (const [id, f] of Object.entries(recordsFiles)) links.push([`records file ${id}`, f.path])

function checkLocal(label, path) {
  const clean = decodeURIComponent(path.split(/[?#]/)[0])
  const route = clean.replace(/\/$/, '') || '/'
  const candidates = [
    join(DIST, clean),
    join(DIST, `${route.slice(1)}.html`),
    join(PUBLIC, clean),
  ]
  const ok = candidates.some(p => existsSync(p) && !p.endsWith('\\') && !p.endsWith('/')) || route in pageMeta
  return { label, url: path, status: ok ? 'local' : 'missing', ok }
}

async function request(url, method) {
  const res = await fetch(url, {
    method,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': UA, Accept: 'text/html,application/pdf,*/*' },
    redirect: 'follow',
  })
  let wall = false
  if (method === 'GET' && res.ok && /text\/html/.test(res.headers.get('content-type') ?? '')) {
    const head = (await res.text()).slice(0, 20000)
    wall = /Just a moment|_Incapsula_Resource|cf-chl|captcha/i.test(head)
  }
  return { status: res.status, wall }
}

async function checkUrl(label, url) {
  if (url.startsWith('/')) return checkLocal(label, url)
  try {
    // GET, not HEAD: some sites answer HEAD with 200 and serve a bot wall
    // to a real page load, which only the body reveals.
    const r = await request(url, 'GET')
    const blocked = BLOCKED.includes(r.status) || r.wall
    return { label, url, status: r.wall ? `${r.status} bot wall` : r.status, ok: (r.status >= 200 && r.status < 300) || blocked, blocked }
  } catch (err) {
    const reason = err.name === 'TimeoutError' || err.name === 'AbortError' ? 'timeout' : err.message
    return { label, url, status: reason, ok: false }
  }
}

async function main() {
  console.log(`\nChecking ${links.length} links (${CONCURRENCY} concurrent)…\n`)
  if (!existsSync(DIST)) console.log('  (dist/ not found: local paths are checked against public/ and routes only)\n')

  const results = []
  for (let i = 0; i < links.length; i += CONCURRENCY) {
    const batch = await Promise.all(links.slice(i, i + CONCURRENCY).map(([l, u]) => checkUrl(l, u)))
    for (const r of batch) {
      const badge = !r.ok ? 'FAIL' : r.blocked ? 'BLKD' : '  OK'
      console.log(`  [${badge}] ${String(r.status).padEnd(14)}  ${r.label}`)
    }
    results.push(...batch)
  }

  const blocked = results.filter(r => r.blocked)
  if (blocked.length) {
    console.log(`\n! ${blocked.length} link(s) answered but blocked automated reading. Check these by hand:\n`)
    for (const b of blocked) console.log(`  ${b.label}: ${b.url}  (${b.status})`)
  }

  const failures = results.filter(r => !r.ok)
  if (failures.length === 0) {
    console.log(`\n✓ No broken links among ${results.length} checked.\n`)
    process.exit(0)
  }
  console.log(`\n✗ ${failures.length} broken link(s):\n`)
  for (const f of failures) {
    console.log(`  ${f.label}: ${f.url}`)
    console.log(`    → ${f.status}\n`)
  }
  process.exit(1)
}

main()
