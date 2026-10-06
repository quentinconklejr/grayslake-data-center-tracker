#!/usr/bin/env node
/**
 * Stage D: the scheduled job. Task Scheduler runs this every 30 minutes
 * (pipeline/scheduler/setup-task-scheduler.ps1, which the owner runs by hand).
 *
 *   node --use-system-ca pipeline/scripts/run-job.mjs              dry run (default)
 *   node --use-system-ca pipeline/scripts/run-job.mjs --no-push    dry run, don't push private-info
 *   node --use-system-ca pipeline/scripts/run-job.mjs --live       real PRs and ntfy, only if
 *                                                                  config job.live is also true
 *
 * --use-system-ca is required: ilga.gov serves an incomplete certificate chain
 * that only the Windows certificate store completes. The script refuses to
 * run without it.
 *
 * Output is copied to private-info/logs/job/<date>.log. Secret values (ntfy,
 * Internet Archive) are never printed; only whether each is set.
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry } from '../lib/registry.mjs'
import { openStore } from '../lib/store.mjs'
import { createProvider } from '../lib/providers/index.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { loadFlagContext } from '../lib/flags.mjs'
import { makeFetcher } from '../lib/http.mjs'
import { makeWayback } from '../lib/wayback.mjs'
import { makeNotifier } from '../lib/notify.mjs'
import { FETCHERS } from '../lib/fetchers/index.mjs'
import { runJob } from '../lib/job.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

if (!process.execArgv.includes('--use-system-ca')) {
  console.error('run-job: start node with --use-system-ca (ilga.gov needs the Windows certificate store)')
  process.exit(2)
}
const has = f => process.argv.includes(`--${f}`)
const cfg = loadPipelineConfig()
const store = openStore(cfg.private_store.dir)

// Copy all output to the job log.
const logDir = store.path('logs/job')
mkdirSync(logDir, { recursive: true })
const logFile = join(logDir, `${new Date().toISOString().slice(0, 10)}.log`)
for (const level of ['log', 'warn', 'error']) {
  const orig = console[level].bind(console)
  console[level] = (...a) => { orig(...a); try { appendFileSync(logFile, `${new Date().toISOString()} ${level} ${a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}\n`) } catch { /* logging must not stop the job */ } }
}

const run = (cmd, args) => new Promise((resolve, reject) => {
  execFile(cmd, args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
    if (err) reject(new Error(`${cmd.split(/[\\/]/).pop()} ${args[0] === '-C' ? args[2] : args[0]} failed: ${(stderr || err.message).toString().split('\n')[0]}`))
    else resolve(stdout)
  })
})

const set = name => (process.env[name] ? 'set' : 'not set')
console.log(`job start: mode ${cfg.job.live && has('live') ? 'LIVE' : 'dry-run'}; IA keys ${set('IA_S3_ACCESS')}/${set('IA_S3_SECRET')}; ntfy topic ${set(cfg.notify.ntfy.topic_env)}, token ${set(cfg.notify.ntfy.token_env)}`)

// Keep the private store current before writing to it (fast-forward only).
try { await run('git', ['-C', store.root, 'pull', '--ff-only', 'origin', 'main']) } catch (e) { console.warn(`private store pull: ${e.message}`) }

const http = makeFetcher(cfg.http)
const rubric = loadRubric()
const report = await runJob({
  cfg, store,
  registry: loadRegistry(), sources, timelineEvents, rubric, gcfg: guardConfig(rubric),
  provider: createProvider(cfg), triage: makeTriage(cfg.triage).triage, flagCtx: loadFlagContext(),
  http, wayback: makeWayback({ politeFetch: http, userAgent: cfg.http.user_agent }),
  fetchers: Object.fromEntries((cfg.fetchers?.enabled ?? Object.keys(FETCHERS)).map(n => [n, FETCHERS[n]])),
  // Real ntfy pushes in a live job, or in a dry run when notify.ntfy.send_in_dry_run
  // is on (they touch nothing on the site).
  notifier: makeNotifier({ ncfg: cfg.notify.ntfy, live: (cfg.job.live === true && has('live')) || cfg.notify.ntfy.send_in_dry_run === true, dryRunJob: !(cfg.job.live === true && has('live')), store, dryRunDir: `reports/dry-run/${new Date().toISOString().replace(/[:.]/g, '-')}` }),
  run, liveFlag: has('live'), pushStore: cfg.job.push_private_store && !has('no-push'),
})

const { stageC, ...rest } = report
console.log(JSON.stringify({ ...rest, stageC: stageC ? { inputs: stageC.inputs, filtered: stageC.filtered?.total, drafts: stageC.drafts?.length, guardPassRate: stageC.claims?.guardPassRate } : null, warnings: report.warnings?.length ?? 0 }, null, 2))
