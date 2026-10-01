/**
 * Runs fetchers in shadow mode: everything goes to the private store, nothing
 * to this repository, no pull requests.
 *
 * For each fetcher:
 *   1. discover candidates. A StructureError or any other failure is recorded
 *      against the fetcher's health (consecutive failures) and the run moves on.
 *   2. skip candidates already seen. On a fetcher's first run, candidates
 *      dated before the first-run window (and undated ones) are recorded as
 *      seen without being fetched, so the backlog is not ingested.
 *   3. fetch and extract text, hash the raw bytes and the text.
 *   4. dedupe against every item any fetcher has stored (URL, content hash,
 *      near-duplicate) and against URLs the site already cites.
 *   5. look up the tier in the registry (never from the page).
 *   6. write the item to shadow/items/<date>/<fetcher>/, the bytes to
 *      shadow/raw/<sha256>.<ext>.
 *   7. queue a Wayback capture per the fetcher's snapshot policy; captures are
 *      capped per run, verified against the fetched bytes or text, and
 *      retried on later runs (three attempts).
 *
 * State lives in the store under state/; a run log under logs/runs/.
 */
import { sha256, classify, remember, emptyIndex, citedUrlSet } from './dedupe.mjs'
import { lookup } from './registry.mjs'
import { toText, StructureError, SourceUnavailable } from './fetchers/common.mjs'
import { log, takeWarnings } from './log.mjs'

const MAX_SNAPSHOT_ATTEMPTS = 3
const MAX_VERIFY_ATTEMPTS = 2   // a capture still not served after this is retaken
const HEALTH_ALERT_AFTER = 3

const safe = s => String(s).replace(/[^\w.-]+/g, '_').slice(0, 80)

export async function runFetchers({ fetchers, store, cfg, registry, sources, http, wayback, env = process.env, now = new Date(), snapshots = true, backfill = false }) {
  const runId = now.toISOString().replace(/[:.]/g, '-')
  const day = now.toISOString().slice(0, 10)
  const windowDays = cfg.fetchers?.first_run_window_days ?? 14
  const maxSnaps = cfg.fetchers?.max_snapshots_per_run ?? 10
  const index = store.readJson('state/dedupe-index.json') ?? emptyIndex()
  const queue = store.readJson('state/snapshot-queue.json') ?? []
  const cited = citedUrlSet(sources)
  const run = { runId, startedAt: now.toISOString(), mode: 'shadow', fetchers: {}, snapshots: [], warnings: [] }

  for (const f of fetchers) {
    const statePath = `state/fetchers/${f.name}.json`
    const state = store.readJson(statePath) ?? { seen: {}, consecutiveFailures: 0 }
    const firstRun = !state.lastSuccessAt
    const since = new Date(now.getTime() - windowDays * 86_400_000)
    const ctx = { http, cfg, env, state, since, pdftotext: cfg.tools.pdftotext }
    const stats = { firstRun, discovered: 0, alreadySeen: 0, baselined: 0, new: 0, updates: 0, duplicates: 0, nearDuplicates: 0, alreadyCited: 0, fetchErrors: 0, items: [] }
    run.fetchers[f.name] = stats
    state.lastRunAt = now.toISOString()

    let found
    try {
      found = await f.discover(ctx)
    } catch (err) {
      state.consecutiveFailures = (state.consecutiveFailures ?? 0) + 1
      stats.error = `${err instanceof StructureError ? 'structure changed' : err instanceof SourceUnavailable ? 'source unavailable' : 'error'}: ${err.message}`
      stats.consecutiveFailures = state.consecutiveFailures
      if (state.consecutiveFailures >= HEALTH_ALERT_AFTER) stats.healthAlert = `${f.name} has failed ${state.consecutiveFailures} runs in a row`
      log.warn(`${f.name}: ${stats.error}`)
      store.writeJson(statePath, state)
      continue
    }
    for (const w of found.warnings ?? []) log.warn(`${f.name}: ${w}`)
    if (found.via) stats.via = found.via
    stats.discovered = found.candidates.length

    for (const cand of found.candidates) {
      // Backfill: fetch what an earlier first run recorded as seen without
      // fetching (the baseline backlog). Everything else already seen is skipped.
      const backfilling = backfill && state.seen[cand.key]?.baseline
      if (state.seen[cand.key] && !backfilling) { stats.alreadySeen++; continue }
      if (backfilling) stats.backfilled = (stats.backfilled ?? 0) + 1
      const inWindow = cand.published && new Date(cand.published) >= since
      if (firstRun && !inWindow) {
        state.seen[cand.key] = { at: now.toISOString(), baseline: true }
        stats.baselined++
        continue
      }

      let doc
      try {
        doc = await f.fetchItem(ctx, cand)
      } catch (err) {
        stats.fetchErrors++
        log.warn(`${f.name}: could not fetch ${cand.url}: ${err.message}`)
        continue   // not marked seen: retried next run
      }

      const tierInfo = lookup(registry, cand.tierUrl ?? cand.url)
      // A record cut from a shared page (one bill action of many on the bill's
      // status page) is identified by page URL plus its key, not the page URL.
      // (A query parameter, not a #fragment: canonicalUrl drops fragments.)
      const dedupeUrl = doc.kind === 'record' ? `${cand.url}${cand.url.includes('?') ? '&' : '?'}_record=${encodeURIComponent(cand.key)}` : cand.url
      const dd = classify(index, { url: dedupeUrl, text: doc.text }, cited)
      const id = `${f.name}:${sha256(cand.key).slice(0, 16)}`
      const update = f.isUpdate?.(state, cand) ?? false
      const ext = doc.kind === 'pdf' ? 'pdf' : doc.kind === 'html' ? 'html' : null
      let rawPath = null
      if (doc.bytes && ext) {
        rawPath = `shadow/raw/${sha256(doc.bytes)}.${ext}`
        if (!store.exists(rawPath)) store.writeBytes(rawPath, doc.bytes)
      }
      const item = {
        id, runId, fetcher: f.name, key: cand.key,
        url: cand.url, finalUrl: doc.finalUrl ?? cand.url, canonicalUrl: dd.canonicalUrl,
        title: cand.title, published: cand.published, fetchedAt: new Date().toISOString(),
        tier: tierInfo.tier, registryId: tierInfo.id, party: tierInfo.party ?? null,
        kind: doc.kind, contentType: doc.contentType ?? null,
        rawSha256: doc.bytes ? sha256(doc.bytes) : null, rawPath,
        textSha256: sha256(doc.text ?? ''), contentHash: dd.contentHash,
        text: doc.text ?? '', textChars: (doc.text ?? '').length,
        pages: doc.pages ?? null, scannedPages: doc.scannedPages ?? [],
        meta: { ...(cand.meta ?? {}), ...(doc.meta ? { page: doc.meta } : {}) },
        update,
        dedupe: {
          duplicateOf: dd.duplicateOf ?? null, reason: dd.reason ?? null,
          nearDuplicateOf: dd.nearDuplicateOf ?? null, similarity: dd.similarity ?? null,
          alreadyCited: Boolean(dd.alreadyCited),
        },
        needsHumanReview: doc.needsHumanReview ?? (doc.scannedPages?.length ? `${doc.scannedPages.length} scanned page(s) with no text layer` : null),
        snapshot: null,
        stage: 'fetched',
      }
      if (doc.kind === 'pdf' && !doc.text.trim()) item.needsHumanReview = 'PDF has no text layer (scan); a person must read it'

      if (dd.duplicateOf) stats.duplicates++
      else {
        stats.new++
        if (update) stats.updates++
        if (dd.nearDuplicateOf) stats.nearDuplicates++
        remember(index, id, dd)
      }
      if (dd.alreadyCited) stats.alreadyCited++

      const itemPath = `shadow/items/${day}/${f.name}/${safe(cand.key)}.json`
      store.writeJson(itemPath, item)
      state.seen[cand.key] = { at: now.toISOString(), id }
      f.onNewItem?.(state, cand)
      stats.items.push({ id, title: cand.title, tier: item.tier, duplicateOf: item.dedupe.duplicateOf, path: itemPath })

      const target = f.snapshot === 'always' ? cand.url : f.snapshot === 'page' ? cand.snapshotTarget : null
      if (snapshots && target && !dd.duplicateOf && !queue.some(q => q.target === target && q.status === 'pending')) {
        const pageLevel = f.snapshot === 'page'
        queue.push({
          target, itemPath, attempts: 0, status: 'pending', queuedAt: now.toISOString(),
          // A page-level snapshot is checked for this item's text, not for the item's own hash.
          rawSha256: pageLevel ? null : item.rawSha256,
          textHash: pageLevel ? null : item.contentHash,
          mustContain: pageLevel ? (cand.snapshotMustContain ?? null) : null,
        })
      }
    }

    if (found.cursor) state.cursor = found.cursor
    state.lastSuccessAt = now.toISOString()
    state.consecutiveFailures = 0
    store.writeJson(statePath, state)
  }

  // --- Wayback captures -----------------------------------------------------------
  if (snapshots && wayback) {
    const expectFor = q => ({
      rawSha256: q.rawSha256,
      textHash: q.textHash,
      mustContain: q.mustContain,
      toText: (bytes, ct) => toText(bytes, ct, q.target, cfg.tools.pdftotext).text,
    })
    const record = (q, result) => {
      run.snapshots.push({ target: q.target, ...result })
      const item = store.readJson(q.itemPath)
      if (item) { item.snapshot = result; store.writeJson(q.itemPath, item) }
    }
    const verifyInto = async (q, cap) => {
      q.verifyAttempts = (q.verifyAttempts ?? 0) + 1
      const v = await wayback.verify(cap.snapshotUrl, expectFor(q))
      if (v.verified) q.status = 'done'
      else if (v.retryable && q.verifyAttempts < MAX_VERIFY_ATTEMPTS) { q.status = 'verify-pending'; q.snapshotUrl = cap.snapshotUrl; q.mode = cap.mode }
      // Never served: an anonymous save can report a snapshot that was never
      // stored. Take it again, within the capture attempt limit.
      else if (v.retryable && q.attempts < MAX_SNAPSHOT_ATTEMPTS) { q.status = 'pending'; q.verifyAttempts = 0; delete q.snapshotUrl }
      else if (v.retryable) { q.status = 'failed'; log.warn(`wayback: ${q.target} was never served after ${q.attempts} capture(s); archive by hand`) }
      else { q.status = 'unverified'; log.warn(`wayback: ${q.target} captured but not verified (${v.result}); not offered as archiveUrl`) }
      const verification = q.status === 'verify-pending' ? `pending: ${v.result}; retried next run`
        : q.status === 'pending' ? `not stored by the archive (${v.result}); will capture again` : v.result
      record(q, { snapshotUrl: cap.snapshotUrl, mode: cap.mode, verified: v.verified, verification, at: new Date().toISOString() })
    }

    // Captures from earlier runs that were not yet served: verify them now.
    // A capture sent back for a retake waits for the next run: Save Page Now
    // answers a repeat request within the hour with the same capture.
    const handled = new Set()
    for (const q of queue.filter(x => x.status === 'verify-pending')) { handled.add(q); await verifyInto(q, { snapshotUrl: q.snapshotUrl, mode: q.mode }) }

    let done = 0
    for (const q of queue.filter(x => x.status === 'pending' && !handled.has(x))) {
      if (done >= maxSnaps) break
      done++
      q.attempts++
      const cap = await wayback.capture(q.target)
      if (cap.ok) { await verifyInto(q, cap); continue }
      q.lastError = cap.error
      if (q.attempts >= MAX_SNAPSHOT_ATTEMPTS) { q.status = 'failed'; log.warn(`wayback: giving up on ${q.target} after ${q.attempts} attempts: ${cap.error}`) }
      record(q, { error: cap.error, at: new Date().toISOString() })
    }
    const pendingLeft = queue.filter(x => x.status === 'pending').length
    if (pendingLeft) log.warn(`wayback: ${pendingLeft} capture(s) still queued for later runs`)
  }
  // Keep the queue file small: drop finished entries older than 30 days.
  const cutoff = now.getTime() - 30 * 86_400_000
  const kept = queue.filter(q => q.status === 'pending' || q.status === 'verify-pending' || Date.parse(q.queuedAt) > cutoff)

  store.writeJson('state/dedupe-index.json', index)
  store.writeJson('state/snapshot-queue.json', kept)
  run.finishedAt = new Date().toISOString()
  run.warnings = takeWarnings()
  store.writeJson(`logs/runs/${runId}.json`, run)
  return run
}

