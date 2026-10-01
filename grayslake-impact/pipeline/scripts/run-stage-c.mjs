#!/usr/bin/env node
/**
 * Stage C, shadow mode: triage → extraction → verbatim guard → party
 * relabeling → scoring → drafting, over items already in the private store.
 *
 *   npm run pipeline:stage-c                      Stage B items not yet processed
 *   npm run pipeline:stage-c -- --all             every Stage B item, again
 *   npm run pipeline:stage-c -- --corpus          also the Stage A corpus (the
 *                                                 sources behind existing entries)
 *   npm run pipeline:stage-c -- --corpus-only
 *   npm run pipeline:stage-c -- --max-chunks 8
 *
 * Writes only to the private store (shadow/stage-c/<run>/, logs/). Opens no
 * pull request and changes nothing in this repository.
 */
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry } from '../lib/registry.mjs'
import { openStore } from '../lib/store.mjs'
import { createProvider } from '../lib/providers/index.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { loadFlagContext } from '../lib/flags.mjs'
import { fromShadow, fromCorpus, processItems, writeStageC } from '../lib/stage-c.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

const has = f => process.argv.includes(`--${f}`)
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1] }
const cfg = loadPipelineConfig()
const rubric = loadRubric()
const registry = loadRegistry()
const store = openStore(cfg.private_store.dir)
const provider = createProvider(cfg)
const runId = new Date().toISOString().replace(/[:.]/g, '-')

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p, acc) : f.endsWith('.json') && acc.push(p) }
  return acc
}

const inputs = []
const shadowPaths = []
if (!has('corpus-only')) {
  for (const p of walk(store.path('shadow/items'))) {
    const rel = p.slice(store.root.length + 1).replace(/\\/g, '/')
    const it = store.readJson(rel)
    if (it.stageC && !has('all')) continue
    it._path = rel
    shadowPaths.push(rel)
    inputs.push(fromShadow(it, { registry, store }))
  }
}
if (has('corpus') || has('corpus-only')) {
  for (const f of readdirSync(store.path('corpus/sources'))) {
    const rec = store.readJson(`corpus/sources/${f}`)
    if (rec?.text && sources[rec.key]) inputs.push(fromCorpus(rec, { registry, store, sources, existsSync }))
  }
}

const result = await processItems(inputs, {
  cfg, rubric, gcfg: guardConfig(rubric), provider, triage: makeTriage(cfg.triage).triage, flagCtx: loadFlagContext(),
  sources, timelineEvents, runId, today: new Date().toISOString().slice(0, 10), maxChunks: Number(arg('max-chunks', 8)),
  onProgress: m => console.log(m),
})
const summary = writeStageC(store, `shadow/stage-c/${runId}`, runId, result, { model: provider.model, numCtx: provider.numCtx, warnings: takeWarnings() })

// Mark processed Stage B items so the next run skips them.
for (const rel of shadowPaths) { const it = store.readJson(rel); it.stageC = { runId }; store.writeJson(rel, it) }

const { filteredItems, ...printable } = summary
void filteredItems
console.log(JSON.stringify({ ...printable, warnings: printable.warnings.length }, null, 2))
console.log(`\nDrafts: ${store.path(`shadow/stage-c/${runId}/drafts.md`)}`)
