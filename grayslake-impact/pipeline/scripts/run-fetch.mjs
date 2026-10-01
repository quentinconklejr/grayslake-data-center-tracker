#!/usr/bin/env node
/**
 * Stage B: run the Tier 1 fetchers once, in shadow mode.
 *
 *   npm run pipeline:fetch
 *   npm run pipeline:fetch -- --only village-agendas,ilga-bills
 *   npm run pipeline:fetch -- --no-snapshots
 *
 * Output goes only to the private store (shadow/items, state, logs/runs).
 * Nothing is written to this repository and no pull request is opened.
 */
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRegistry } from '../lib/registry.mjs'
import { openStore } from '../lib/store.mjs'
import { makeFetcher } from '../lib/http.mjs'
import { makeWayback } from '../lib/wayback.mjs'
import { enabledFetchers } from '../lib/fetchers/index.mjs'
import { runFetchers } from '../lib/runner.mjs'
import { sources } from '../../src/data/sources.js'

const arg = name => { const i = process.argv.indexOf(`--${name}`); return i === -1 ? null : process.argv[i + 1] }
const cfg = loadPipelineConfig()
const store = openStore(cfg.private_store.dir)
const http = makeFetcher(cfg.http)
const snapshots = !process.argv.includes('--no-snapshots')
const wayback = makeWayback({ politeFetch: http, userAgent: cfg.http.user_agent })

const run = await runFetchers({
  fetchers: enabledFetchers(cfg, arg('only')?.split(',')),
  store, cfg, registry: loadRegistry(), sources, http,
  wayback: snapshots ? wayback : null, snapshots,
})

console.log(`\nRun ${run.runId} (shadow mode; Wayback ${snapshots ? (wayback.authed ? 'SPN2 with keys' : 'anonymous') : 'off'})`)
for (const [name, s] of Object.entries(run.fetchers)) {
  if (s.error) { console.log(`  ${name.padEnd(22)} FAILED ${s.error}${s.healthAlert ? `  [HEALTH: ${s.healthAlert}]` : ''}`); continue }
  console.log(`  ${name.padEnd(22)} ${s.firstRun ? 'first run, ' : ''}discovered ${s.discovered}, seen ${s.alreadySeen}, baselined ${s.baselined}, new ${s.new} (updates ${s.updates}, near-dup ${s.nearDuplicates}), duplicates ${s.duplicates}, already cited ${s.alreadyCited}, fetch errors ${s.fetchErrors}${s.via ? `, via ${s.via}` : ''}`)
  for (const it of s.items.slice(0, 12)) console.log(`      T${it.tier} ${it.duplicateOf ? '(dup) ' : ''}${it.title}`)
  if (s.items.length > 12) console.log(`      … ${s.items.length - 12} more`)
}
for (const sn of run.snapshots) console.log(`  wayback ${sn.error ? 'FAILED ' + sn.error : (sn.verified ? 'verified ' : 'UNVERIFIED ') + sn.snapshotUrl + ' (' + sn.verification + ')'}`)
console.log(`  ${run.warnings.length} warning(s); log: ${store.path(`logs/runs/${run.runId}.json`)}`)
