#!/usr/bin/env node
/**
 * Fetches every source URL and exits 1 if any returns non-200.
 * Skips entries marked status:"unverified" — those are known-broken and tracked separately.
 * Run via: node scripts/check-links.js
 */

import { sources } from '../src/data/sources.js'

const TIMEOUT_MS = 10_000
const CONCURRENCY = 8

const entries = Object.entries(sources).filter(
  ([, s]) => s.url && s.status !== 'unverified'
)

async function checkUrl(key, url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'grayslake-link-checker/1.0' },
      redirect: 'follow',
    })
    clearTimeout(timer)
    return { key, url, status: res.status, ok: res.ok }
  } catch (err) {
    clearTimeout(timer)
    const reason = err.name === 'AbortError' ? 'timeout' : err.message
    return { key, url, status: null, ok: false, reason }
  }
}

async function runBatch(batch) {
  return Promise.all(batch.map(([key, s]) => checkUrl(key, s.url)))
}

async function main() {
  console.log(`\nChecking ${entries.length} source URLs (${CONCURRENCY} concurrent)…\n`)

  const results = []
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY)
    const batchResults = await runBatch(batch)
    for (const r of batchResults) {
      const badge = r.ok ? '  OK' : 'FAIL'
      const code = r.status ?? r.reason
      console.log(`  [${badge}] ${String(code).padEnd(4)}  ${r.key}`)
    }
    results.push(...batchResults)
  }

  const failures = results.filter((r) => !r.ok)

  if (failures.length === 0) {
    console.log(`\n✓ All ${results.length} links returned 200.\n`)
    process.exit(0)
  }

  console.log(`\n✗ ${failures.length} dead link(s) found:\n`)
  for (const f of failures) {
    console.log(`  ${f.key}: ${f.url}`)
    console.log(`    → ${f.status ?? f.reason}\n`)
  }
  process.exit(1)
}

main()
