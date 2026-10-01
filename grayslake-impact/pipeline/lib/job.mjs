/**
 * The scheduled job: one run of the whole pipeline.
 *
 *   1. take a lock (a second copy started while one runs exits at once; a
 *      lock older than job.lock_stale_minutes is from a crashed run)
 *   2. health: alert if no run has completed for job.health_alert_after_hours
 *   3. connectivity: if no check URL answers, record "offline" and stop; the
 *      next start catches up
 *   4. run every fetcher that is due. After sleep or time offline every
 *      overdue fetcher is due, and runs once: fetchers keep their own state
 *      (seen ids, cursors), so one run picks up everything missed
 *   5. Stage C on every stored item not yet processed
 *   6. PRs for ready drafts (dry run: title, body and diff written to
 *      reports/dry-run/<run>/), ntfy for Tier 1 drafts and health alerts
 *   7. commit and push the private store
 *
 * Everything with an outside effect (git, gh, ntfy, HTTP) is passed in, so
 * the whole job can be tested offline.
 */
import { runFetchers } from './runner.mjs'
import { fromShadow, processItems, writeStageC } from './stage-c.mjs'
import { buildPr, makeDiff, writeDryRun, ghCommandPreview, openLivePr } from './pr.mjs'
import { log, takeWarnings } from './log.mjs'

const MIN = 60_000

export function dueFetchers(jobState, cadence, now) {
  return Object.entries(cadence).map(([name, minutes]) => {
    const last = jobState.fetchers?.[name] ? Date.parse(jobState.fetchers[name]) : null
    const elapsed = last == null ? Infinity : now.getTime() - last
    const due = elapsed >= minutes * MIN - 60_000   // a minute's slack for scheduler jitter
    const missed = last == null ? 0 : Math.max(0, Math.floor(elapsed / (minutes * MIN)) - 1)
    return { name, due, missed, lastRunAt: jobState.fetchers?.[name] ?? null }
  })
}

export function acquireLock(store, staleMinutes, now) {
  const held = store.readJson('state/job.lock')
  if (held && now.getTime() - Date.parse(held.startedAt) < staleMinutes * MIN) return { ok: false, holder: held }
  store.writeJson('state/job.lock', { pid: process.pid, startedAt: now.toISOString() })
  return { ok: true, tookOverStale: Boolean(held) }
}

export function releaseLock(store) {
  store.writeJson('state/job.lock', null)
}

export async function isOnline(urls, fetchImpl = fetch) {
  for (const u of urls) {
    try {
      const r = await fetchImpl(u, { method: 'HEAD', signal: AbortSignal.timeout(15_000) })
      if (r.status > 0) return true
    } catch { /* try the next */ }
  }
  return false
}

/**
 * deps: { cfg, store, registry, sources, timelineEvents, rubric, gcfg, provider,
 *         triage, flagCtx, http, wayback, fetchers (by name), notifier,
 *         run (cmd, args) → stdout, fetchImpl, liveFlag, now, pushStore }
 */
export async function runJob(deps) {
  const { cfg, store, now = new Date() } = deps
  const jcfg = cfg.job
  const runId = now.toISOString().replace(/[:.]/g, '-')
  const today = now.toISOString().slice(0, 10)
  const live = jcfg.live === true && deps.liveFlag === true
  const dryDir = `reports/dry-run/${runId}`
  const report = { runId, mode: live ? 'live' : 'dry-run', startedAt: now.toISOString(), alerts: [], prs: [], notifications: [] }

  const lock = acquireLock(store, jcfg.lock_stale_minutes ?? 180, now)
  if (!lock.ok) { report.skipped = `another run holds the lock since ${lock.holder.startedAt}`; return report }
  if (lock.tookOverStale) report.alerts.push('took over a stale lock: an earlier run did not finish')

  try {
    const state = store.readJson('state/job.json') ?? { fetchers: {}, runs: [] }
    if (state.lastSuccessAt) {
      const hours = (now.getTime() - Date.parse(state.lastSuccessAt)) / 3_600_000
      if (hours >= (jcfg.health_alert_after_hours ?? 48)) report.alerts.push(`no completed run for ${Math.round(hours)} hours (machine asleep or offline?); catching up now`)
    }

    if (!(await isOnline(jcfg.connectivity_check ?? [], deps.fetchImpl))) {
      state.lastOfflineAt = now.toISOString()
      store.writeJson('state/job.json', state)
      report.offline = true
      return report
    }

    // --- fetch ------------------------------------------------------------------------
    const due = dueFetchers(state, jcfg.cadence_minutes, now)
    report.due = due
    const toRun = due.filter(d => d.due && deps.fetchers[d.name]).map(d => deps.fetchers[d.name])
    if (toRun.length) {
      const run = await runFetchers({ fetchers: toRun, store, cfg, registry: deps.registry, sources: deps.sources, http: deps.http, wayback: deps.wayback, now, snapshots: Boolean(deps.wayback) })
      for (const f of toRun) state.fetchers[f.name] = now.toISOString()
      report.fetch = Object.fromEntries(Object.entries(run.fetchers).map(([n, s]) => [n, { new: s.new ?? 0, error: s.error ?? null }]))
      for (const s of Object.values(run.fetchers)) if (s.healthAlert) report.alerts.push(s.healthAlert)
    }

    // --- Stage C on unprocessed items ----------------------------------------------------
    const pending = []
    for (const rel of listItems(store)) {
      const it = store.readJson(rel)
      if (it.stageC) continue
      it._path = rel
      pending.push(it)
    }
    let drafts = []
    if (pending.length) {
      const result = await processItems(pending.map(it => fromShadow(it, { registry: deps.registry, store })), {
        cfg, rubric: deps.rubric, gcfg: deps.gcfg, provider: deps.provider, triage: deps.triage, flagCtx: deps.flagCtx,
        sources: deps.sources, timelineEvents: deps.timelineEvents, runId, today, maxChunks: 8, onProgress: m => log.info(m),
      })
      report.stageC = writeStageC(store, `shadow/stage-c/${runId}`, runId, result, { model: deps.provider.model })
      delete report.stageC.filteredItems
      for (const it of pending) { const fresh = store.readJson(it._path); fresh.stageC = { runId }; store.writeJson(it._path, fresh) }
      drafts = result.drafts
    }

    // --- PRs and notifications --------------------------------------------------------
    const ready = drafts.filter(d => d.status === 'ready')
    if (ready.length > (jcfg.max_prs_per_run ?? 5)) report.alerts.push(`${ready.length} drafts ready; only ${jcfg.max_prs_per_run} PRs opened this run, the rest next run`)
    for (const [i, d] of ready.slice(0, jcfg.max_prs_per_run ?? 5).entries()) {
      const pr = buildPr(d, { today })
      const diff = makeDiff(d, jcfg.site_repo.data_dir)
      let url
      if (live) {
        url = (await openLivePr(d, pr, { jcfg, liveFlag: deps.liveFlag, run: deps.run })).url
      } else {
        const base = writeDryRun(store, dryDir, i + 1, pr, diff, ghCommandPreview(pr, jcfg))
        url = `(dry run) ${store.path(base + '.md')}`
      }
      report.prs.push({ branch: pr.branch, title: pr.title, tier: d.effectiveTier, url })
      const n = await deps.notifier.draftReady(d, url)
      report.notifications.push({ kind: 'draft', tier: d.effectiveTier, ...n })
    }
    for (const a of report.alerts) report.notifications.push({ kind: 'health', ...(await deps.notifier.health(a)) })

    state.lastSuccessAt = now.toISOString()
    state.runs = [...(state.runs ?? []).slice(-49), { runId, at: now.toISOString(), mode: report.mode, prs: report.prs.length, alerts: report.alerts.length }]
    store.writeJson('state/job.json', state)
    report.warnings = takeWarnings()
    store.writeJson(`logs/job/${runId}.json`, report)

    // --- private store -------------------------------------------------------------------
    if (deps.pushStore) report.push = await pushStore(store, deps.run, runId)
    return report
  } finally {
    releaseLock(store)
  }
}

function listItems(store) {
  const out = []
  for (const day of store.list('shadow/items')) {
    for (const fetcher of store.list(`shadow/items/${day}`)) {
      for (const f of store.list(`shadow/items/${day}/${fetcher}`)) if (f.endsWith('.json')) out.push(`shadow/items/${day}/${fetcher}/${f}`)
    }
  }
  return out
}

/** Commits and pushes the private store. Fast-forward only; never forced. */
export async function pushStore(store, run, runId) {
  try {
    await run('git', ['-C', store.root, 'add', '-A'])
    const status = String(await run('git', ['-C', store.root, 'status', '--porcelain']) ?? '')
    if (!status.trim()) return { ok: true, note: 'nothing to commit' }
    await run('git', ['-C', store.root, 'commit', '-m', `job ${runId}`])
    await run('git', ['-C', store.root, 'push', 'origin', 'HEAD:main'])
    return { ok: true }
  } catch (e) {
    log.warn(`private store push failed: ${e.message}`)
    return { ok: false, error: e.message }
  }
}
