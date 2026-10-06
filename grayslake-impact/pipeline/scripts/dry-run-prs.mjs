#!/usr/bin/env node
/**
 * Writes dry-run PRs for the ready drafts of an existing Stage C run, with
 * the same code the scheduled job uses: title and body (.md), diff (.diff),
 * the gh command it would run, and the ntfy payload it would send.
 *
 *   npm run pipeline:dry-run-prs -- --run <stage-c run id>     (default: newest run with a ready draft)
 *
 * Opens no PR, sends nothing, changes nothing in this repository. Output:
 * private-info/reports/dry-run/<stage-c run id>/
 */
import { loadPipelineConfig } from '../lib/config.mjs'
import { openStore } from '../lib/store.mjs'
import { buildPr, makeDiff, writeDryRun, ghCommandPreview } from '../lib/pr.mjs'
import { makeNotifier } from '../lib/notify.mjs'

const arg = n => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? null : process.argv[i + 1] }
const cfg = loadPipelineConfig()
const store = openStore(cfg.private_store.dir)
const today = new Date().toISOString().slice(0, 10)

const runs = store.list('shadow/stage-c').sort().reverse()
const ready = run => store.list(`shadow/stage-c/${run}/drafts`).map(f => store.readJson(`shadow/stage-c/${run}/drafts/${f}`)).filter(d => d.status === 'ready')
const runId = arg('run') ?? runs.find(r => ready(r).length)
if (!runId) { console.log('no Stage C run has a ready draft'); process.exit(0) }

const dir = `reports/dry-run/${runId}`
const notifier = makeNotifier({ ncfg: cfg.notify.ntfy, live: false, store, dryRunDir: dir })
const drafts = ready(runId)
for (const [i, d] of drafts.entries()) {
  const pr = buildPr(d, { today })
  const base = writeDryRun(store, dir, i + 1, pr, makeDiff(d, cfg.job.site_repo.data_dir), ghCommandPreview(pr, cfg.job))
  const n = await notifier.draftReady(d, `(dry run) ${store.path(base + '.md')}`)
  console.log(`${String(i + 1).padStart(2)} T${d.effectiveTier} ${pr.title}\n    ${store.path(base + '.md')}\n    ntfy: ${n.skipped ?? n.mode}`)
}
console.log(`\n${drafts.length} dry-run PR(s) in ${store.path(dir)}`)
