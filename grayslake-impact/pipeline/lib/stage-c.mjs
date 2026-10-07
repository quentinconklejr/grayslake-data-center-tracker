/**
 * Stage C as a library: triage → extraction → verbatim guard → party
 * relabeling → scoring → drafting, over work items, plus the writer for its
 * shadow output. Used by scripts/run-stage-c.mjs (stored items, corpus) and
 * scripts/run-job.mjs (the scheduled job, on newly fetched items).
 */
import { existsSync, readFileSync } from 'node:fs'
import { chunksFor, extractChunk } from './extract.mjs'
import { prepareSource, checkClaim, extractDates } from './guard.mjs'
import { lookup } from './registry.mjs'
import { detectParty, relabelClaims, relabelClauseProjections, isOfficialRecord } from './party.mjs'
import { makePrivacy } from './privacy.mjs'
import { leadNote, leadNotesMarkdown } from './leads.mjs'
import { decide, effectiveTier, signalsFor, corroboratingItems, isDraftable, confirmedByline } from './score.mjs'
import { flagsForClaim, existingEntryMatches, entriesCiting, claimCovered } from './flags.mjs'
import { draftItem } from './draft.mjs'
import { canonicalUrl } from './dedupe.mjs'
import { pdfToText } from './text.mjs'
import { log } from './log.mjs'
import { FEED as YT_FEED } from './fetchers/village-youtube.mjs'
import { FETCHERS } from './fetchers/index.mjs'

// At most this many claims go into one PR; the rest are listed, not drafted.
const MAX_CLAIMS_PER_DRAFT = 5

// A court filing's later record events: a new filing, a hearing date, a
// ruling or an order. Only procedural claims with a date count; what the
// filer alleges is never a milestone.
const MILESTONE = /\b(filed|filing|hearing|ruled|ruling|order(ed|s)?|judgment|dismiss\w*|granted|denied|continued|set for|status conference)\b/i
export const isMilestone = c => c.claim_type === 'procedural' && MILESTONE.test(c.claim_text ?? '') && (extractDates(c.claim_text ?? '').some(d => d.year) || /^\d{4}-\d{2}-\d{2}$/.test(c.event_date ?? ''))

/** The existing entry a draft changes: the timeline entry citing only this source, else the one nearest the document's date; an actions entry only if no timeline entry cites it. */
export function targetEntry(entries, published) {
  const tl = entries.filter(e => e.file === 'src/data/timeline.js')
  const pool = tl.length ? tl : entries
  const sole = pool.filter(e => e.entry.sourceKey && !e.entry.sourceKeys)
  if (sole.length === 1) return sole[0]
  const ms = s => Date.parse(String(s ?? '').length === 7 ? `${s}-01` : s)
  const t = ms(published)
  return [...pool].sort((a, b) => (Number.isNaN(t) ? 0 : Math.abs(ms(a.date) - t) - Math.abs(ms(b.date) - t)))[0]
}

/** A Stage B shadow item as a work item. */
export function fromShadow(it, { registry, store }) {
  const hit = lookup(registry, it.fetcher === 'village-youtube' ? YT_FEED : it.url)
  return {
    origin: 'shadow', id: it.id, itemPath: it._path ?? null, title: it.title, url: it.url, text: it.text, kind: it.kind,
    // The page's own date, also for items stored before the runner used it.
    published: FETCHERS[it.fetcher]?.pageDate?.({ text: it.text, meta: it.meta?.page }) ?? (it.published ? it.published.slice(0, 10) : null),
    registryId: hit.id, registryTier: hit.tier, registryHit: hit, registryCategory: /court/i.test(hit.id ?? '') ? 'court' : null,
    publisher: hit.name ?? 'Unknown', byline: it.meta?.page?.byline ?? null,
    snapshot: it.snapshot, dedupe: it.dedupe, needsHumanReview: it.needsHumanReview, fetcher: it.fetcher,
    rawPdf: it.kind === 'pdf' && it.rawPath ? store.path(it.rawPath) : null,
    ocrPages: it.ocr?.path && existsSync(store.path(it.ocr.path)) ? JSON.parse(readFileSync(store.path(it.ocr.path), 'utf8').replace(/^﻿/, '')).pages : null,
  }
}

/** A Stage A corpus record (a source the site already cites) as a work item. */
export function fromCorpus(rec, { registry, store, sources, existsSync }) {
  const s = sources[rec.key]
  const hit = lookup(registry, s.url)
  const d = /^Retrieved/i.test(s.date ?? '') ? null : extractDates(s.date ?? '').find(x => x.year)
  return {
    origin: 'corpus', id: `corpus:${rec.key}`, title: s.title, url: s.url, text: rec.text, kind: rec.kind,
    published: d ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : null,
    registryId: hit.id, registryTier: hit.tier, registryHit: hit, registryCategory: s.category,
    publisher: s.publisher, byline: confirmedByline(s), sourceKey: rec.key,
    snapshot: s.archiveUrl ? { verified: true, snapshotUrl: s.archiveUrl } : null,
    rawPdf: rec.kind === 'pdf' && existsSync(store.path(`corpus/raw/${rec.key}.pdf`)) ? store.path(`corpus/raw/${rec.key}.pdf`) : null,
  }
}

/**
 * ctx: { cfg, rubric, gcfg, provider, triage, flagCtx, sources, timelineEvents, actions, runId, today, maxChunks, onProgress }
 * Returns { filtered, humanReview, work, drafts, dropped, queued, leads, leadNotes, covered }.
 *
 * A source that already has a timeline or actions entry never gets a second
 * entry: its claims are checked against the existing entries, and the claims
 * they lack (at most MAX_CLAIMS_PER_DRAFT) become a proposed change to one
 * existing entry (targetEntry). For a court filing only a new milestone
 * qualifies (isMilestone). With nothing that qualifies there is no draft,
 * only the "already covered" note in `covered`.
 */
export async function processItems(inputs, ctx) {
  const { cfg, rubric, gcfg, provider, triage, flagCtx, sources, timelineEvents, runId, today } = ctx
  const actions = ctx.actions ?? []
  const maxChunks = ctx.maxChunks ?? 8
  const say = ctx.onProgress ?? (() => {})
  const filtered = [], humanReview = [], work = [], dropped = []

  for (const item of inputs) {
    item.guardCfg = gcfg
    if (item.dedupe?.duplicateOf) { filtered.push({ id: item.id, title: item.title, origin: item.origin, reason: `duplicate of ${item.dedupe.duplicateOf}` }); continue }
    // Routine bill actions (co-sponsors, readings) are not news: only the
    // actions matching triage.significant_bill_actions go further.
    if (item.fetcher === 'ilga-bills' && cfg.triage?.significant_bill_actions && !new RegExp(cfg.triage.significant_bill_actions, 'i').test(item.title ?? '')) {
      filtered.push({ id: item.id, title: item.title, origin: item.origin, reason: 'routine bill action (not in triage.significant_bill_actions)' })
      continue
    }
    // D-3: the FOIA records packet is maintained by hand in src/data/records.js.
    if (item.url?.startsWith('/records/') || item.sourceKey === 't5RecordsPacket2026') {
      humanReview.push({ id: item.id, title: item.title, url: item.url, reason: 'FOIA records packet: no draft; edit src/data/records.js by hand (flag)', triage: 'blocked (D-3)' })
      continue
    }
    // A scan has no text to triage; a person reads it (never OCR'd into evidence).
    if (item.kind === 'pdf' && String(item.text ?? '').trim().length < 200) {
      // With OCR text, triage on it; a match goes to a person with the pages
      // named. OCR text is never extracted or drafted from (not verbatim).
      if (item.ocrPages?.length) {
        const t = triage({ ...item, text: item.ocrPages.map(p => p.text).join('\n') }, item.ocrPages)
        if (t.match) humanReview.push({ id: item.id, title: item.title, url: item.url, reason: `scanned PDF; OCR text (triage only, not evidence) matched ${t.reason} on page(s) ${t.pages?.join(', ') ?? 'n/a'}: a person must read it`, triage: t.reason })
        else filtered.push({ id: item.id, title: item.title, origin: item.origin, reason: `scanned PDF; OCR text: ${t.reason}` })
        continue
      }
      humanReview.push({ id: item.id, title: item.title, url: item.url, reason: 'scanned PDF with no text layer: a person must read it', triage: 'not triaged (no text)' })
      continue
    }
    let pages = null
    if (item.rawPdf) { try { pages = pdfToText(item.rawPdf, cfg.tools.pdftotext).pages } catch (e) { log.warn(`${item.id}: could not re-read PDF pages: ${e.message}`) } }
    const t = triage(item, pages)
    if (!t.match) { filtered.push({ id: item.id, title: item.title, origin: item.origin, reason: t.reason }); continue }
    item.triage = { rule: t.rule, reason: t.reason, pages: t.pages, pagesTotal: t.pagesTotal }
    if (t.pages && t.pagesTotal && t.pages.length < t.pagesTotal) log.warn(`${item.id}: triage kept ${t.pages.length} of ${t.pagesTotal} PDF pages; the rest are not read`)
    if (item.kind === 'video') { humanReview.push({ id: item.id, title: item.title, url: item.url, reason: item.needsHumanReview, triage: t.reason }); continue }
    // Structured records (the county parcel layer) are not prose: a model
    // writing about them pastes raw rows. They need a data diff, by a person.
    if (item.kind === 'records') { humanReview.push({ id: item.id, title: item.title, url: item.url, reason: 'structured records: review the parcel diff (scripts/fetch-parcels.js), not a prose draft', triage: t.reason }); continue }
    item.extractText = t.text
    work.push(item)
  }

  for (const item of work) {
    say(`extracting ${item.id} (T${item.registryTier}, ${item.triage.reason})`)
    const meta = { title: item.title, publisher: item.publisher, date: item.published, relevance: item.triage.reason }
    const chunks = chunksFor(provider, meta, item.extractText, { maxChunks, label: item.id })
    item.claims = []
    item.docInfo = null
    item.schemaFailures = 0
    item.chunks = chunks.length
    const d0 = item.published ? extractDates(item.published)[0] : null
    const docDate = d0 ? { month: d0.month, day: d0.day, year: d0.year } : undefined
    // D-4: a bill action row is a Tier 1 record. Code makes the one claim it
    // supports, quoting the whole row; no model is involved.
    if (item.fetcher === 'ilga-bills') {
      const row = String(item.text ?? '')
      const claim = { claim_text: row, claim_type: 'procedural', speaker: null, attribution: 'document', event_date: item.published, date_basis: 'stated_in_text', supporting_quotes: [row], timeline_category: 'policy' }
      const g = checkClaim(claim, prepareSource(row, gcfg), gcfg, { docDate, record: true })
      item.docInfo = { doc_type: 'bill_status', byline: [], origin: 'originates' }
      if (g.ok) item.claims.push({ ...claim, guardMatch: g.quotes.map(q => q.match) })
      else dropped.push({ runId, item: item.id, url: item.url, claim, failures: g.failures.map(f => ({ check: f.check, reason: f.reason, value: f.value })) })
      chunks.length = 0
    }
    for (const ch of chunks) {
      const r = await extractChunk(provider, meta, ch, chunks.length, item.id)
      if (!r.ok) { item.schemaFailures++; log.warn(`${item.id} chunk ${ch.index + 1}: schema failure after retry: ${r.errors.slice(0, 2).join('; ')}`); continue }
      item.docInfo ??= r.data.document
      const src = prepareSource(ch.text, gcfg)
      for (const c of r.data.claims) {
        const g = checkClaim(c, src, gcfg, { docDate })
        if (!g.ok) { dropped.push({ runId, item: item.id, url: item.url, claim: c, failures: g.failures.map(f => ({ check: f.check, reason: f.reason, value: f.value })) }); continue }
        item.claims.push({ ...c, guardMatch: g.quotes.map(q => q.match) })
      }
    }
    item.party = detectParty({ url: item.url, text: item.text, category: item.registryCategory, docType: item.docInfo?.doc_type }, item.registryHit)
    item.partyKind = item.party?.kind ?? null
    const officialRecord = isOfficialRecord({ docType: item.docInfo?.doc_type, fetcher: item.fetcher })
    item.passingClaims = relabelClauseProjections(relabelClaims(item.claims, item.party, { officialRecord }), { officialRecord })
    item.effectiveTier = effectiveTier(item.registryTier, item.byline ?? item.docInfo?.byline)
    item.docOrigin = item.docInfo?.origin ?? 'unclear'
  }

  for (const item of work) {
    for (const c of item.passingClaims) {
      const by = corroboratingItems(c, item, work)
      const d = decide(rubric, signalsFor(c, item, true, by.length))
      Object.assign(c, { outcome: d.outcome, rule: d.rule, labels: [d.label, ...d.flags].filter(Boolean), corroboration: by.length, corroboratedBy: by })
    }
  }

  const cited = new Map()
  for (const [k, s] of Object.entries(sources)) for (const u of [s.url, s.archiveUrl, s.originalUrl]) if (u && /^https?:/.test(u)) cited.set(canonicalUrl(u), k)
  const examples = ['2026-09-08', '2026-07-31', '2026-06-02'].map(date => timelineEvents.find(e => e.date === date && e.description)).filter(Boolean)
  const privacy = makePrivacy(cfg.privacy)
  const dctx = { provider, examples, sources, cited, blockedTerms: cfg.editorial?.blocked_terms ?? [], labeledTerms: cfg.editorial?.labeled_terms ?? [], today, canonUrl: canonicalUrl, privacy }
  const drafts = [], queued = [], leads = [], leadNotes = [], covered = []
  for (const item of work) {
    // D-5: a Tier 2 article stays queue-only, with a lead note for the owner.
    if (item.registryTier === 2) leadNotes.push(leadNote(item, item.passingClaims))
    // A Tier 3 item is never cited alone (rubric tiers.3). A corroborated
    // claim from it is queued with the corroborating items named: the entry
    // belongs to their draft, cited to them, not to a draft of the Tier 3 item.
    let draftable = item.passingClaims.filter(c => isDraftable(c.outcome) && c.outcome !== 'redraft_from_corroborating_source')
    // D-2: claims carrying health, address or family details never reach
    // drafting; a person reviews them.
    const sensitive = draftable.filter(c => privacy.sensitiveClaim(c))
    if (sensitive.length) {
      humanReview.push({ id: item.id, title: item.title, url: item.url, reason: `${sensitive.length} claim(s) with health, address or family details held for human review (D-2)`, claims: sensitive.map(c => c.claim_text) })
      draftable = draftable.filter(c => !sensitive.includes(c))
    }
    for (const c of item.passingClaims.filter(c => !draftable.includes(c))) {
      const rec = { runId, item: item.id, url: item.url, tier: item.effectiveTier, outcome: c.outcome, claim: c.claim_text, quotes: c.supporting_quotes, corroboratedBy: c.corroboratedBy ?? [] }
      if (c.outcome === 'private_lead') leads.push(rec)
      else queued.push(rec)
    }
    if (!draftable.length) continue
    // Already covered: the source has an entry. Only claims it lacks go on.
    const key = item.sourceKey ?? cited.get(canonicalUrl(item.url)) ?? null
    const entries = entriesCiting(key, timelineEvents, actions)
    let coveredNote = null
    let target = null
    if (entries.length) {
      const text = entries.map(e => e.text).join('\n')
      const missing = draftable.filter(c => !claimCovered(c, text))
      const court = item.party?.kind === 'court_filing' || item.registryCategory === 'court'
      const lacking = court ? missing.filter(isMilestone) : missing
      coveredNote = {
        id: item.id, title: item.title, url: item.url, sourceKey: key, court,
        entries: entries.map(({ file, date, title }) => ({ file, date, title })),
        coveredClaims: draftable.length - missing.length, lacking: lacking.map(c => c.claim_text),
        notMilestones: court ? missing.filter(c => !isMilestone(c)).map(c => c.claim_text) : [],
      }
      covered.push(coveredNote)
      if (!lacking.length) continue
      draftable = lacking
      target = { ...targetEntry(entries, item.published), sourceKey: key }
    }
    if (draftable.length > MAX_CLAIMS_PER_DRAFT) log.warn(`${item.id}: ${draftable.length} draftable claims; the first ${MAX_CLAIMS_PER_DRAFT} are drafted, the rest listed`)
    say(`drafting ${item.id} from ${Math.min(draftable.length, MAX_CLAIMS_PER_DRAFT)} claim(s)`)
    const d = await draftItem(item, draftable.slice(0, MAX_CLAIMS_PER_DRAFT), target ? { ...dctx, amend: target } : dctx)
    d.origin = item.origin   // 'shadow' or 'corpus'
    d.fetcher = item.fetcher ?? null
    d.title = item.title
    d.extraClaims = draftable.slice(MAX_CLAIMS_PER_DRAFT).map(c => c.claim_text)
    d.flags = [...new Map([...draftable.flatMap(c => flagsForClaim(c, flagCtx)), ...(d.actionFlag ? [d.actionFlag] : [])].map(f => [`${f.file}|${f.id ?? ''}`, f])).values()]
    d.alreadyCovered = coveredNote
    d.existing = d.entry && !d.amend ? existingEntryMatches({ ...d.entry, sourceKey: d.sourceKey }, timelineEvents) : []
    drafts.push(d)
  }
  return { filtered, humanReview, work, drafts, dropped, queued, leads, leadNotes, covered }
}

export function draftMarkdown(d, i) {
  return [
    `## ${i + 1}. ${d.entry?.title ?? '(no prose: claims only)'}`, '',
    `- Item: ${d.itemId} (${d.origin}) · ${d.url}`,
    `- Tier: registry ${d.tier}, effective ${d.effectiveTier} · party: ${d.party ? `${d.party.kind} (${d.party.party})` : 'none'}`,
    `- Draft guard: **${d.guard}** · status: **${d.status}**${d.validation ? ` · format check: ${d.validation.ok ? 'pass' : 'FAIL ' + d.validation.errors.join('; ')}` : ''}${d.updateGuard ? ` · updates line guard: ${d.updateGuard}` : ''}`,
    `- Date: ${d.date.date ?? 'none'} (${d.date.basis})${d.dateReview ? ` · **human review:** ${d.dateReview}` : ''}`,
    ...(d.placeholders?.length ? [`- **Placeholder text (guard failure):** ${d.placeholders.map(p => JSON.stringify(p.value)).join(', ')}`] : []),
    ...(d.amend ? [`- **Changes the existing entry** ${d.amend.file.replace('src/data/', '')} ${d.amend.date} "${d.amend.title}" (no new entry): adds ${d.claims.length} claim(s) it lacks`] : []),
    ...d.attempts.map(a => `- Attempt ${a.attempt}: ${a.schemaErrors ? 'schema errors ' + a.schemaErrors.join('; ') : a.guard ? 'guard pass' : 'guard FAIL: ' + a.failures.map(f => `${f.check} ${f.reason}${f.value ? ' ' + JSON.stringify(f.value) : ''}`).join('; ')}`),
    ...(d.existing?.length ? [`- **Possible existing entry:** ${d.existing.map(e => `${e.date} "${e.title}" (${e.why})`).join('; ')}`] : []),
    ...(d.flags ?? []).map(f => `- Flag: ${f.file}${f.id ? ' ' + f.id : ''}: ${f.note}`),
    '', '**Claims**', '',
    ...d.claims.map(c => `- [${c.claim_type}${c.relabeled ? ` ← ${c.relabeled.from}` : ''} → ${c.outcome}] ${c.claim_text}\n  - “${c.quotes[0]}” (${c.guardMatch.join(', ')})`),
    '',
    ...(d.rendered?.timelineEdit || d.rendered?.actionEdit ? ['```js', `// ${d.amend.file}: existing entry "${d.amend.title}", description becomes:`, (d.rendered.timelineEdit ?? d.rendered.actionEdit).description, '', '// src/data/updates.js (top of the array)', d.rendered.update, '```'] : []),
    ...(d.rendered?.timeline ? ['```js', '// src/data/timeline.js', d.rendered.timeline, ...(d.rendered.source ? ['', '// src/data/sources.js', d.rendered.source] : [`// sources.js: reuses existing key ${d.sourceKey}`]), '', '// src/data/updates.js (top of the array)', d.rendered.update, ...(d.rendered.action ? ['', '// src/data/actions.js', d.rendered.action] : []), '```'] : []),
    '',
  ].join('\n')
}

/** Writes drafts, summary, dropped claims, queue and leads to the private store. */
export function writeStageC(store, base, runId, result, extra = {}) {
  const { filtered, humanReview, work, drafts, dropped, queued, leads, leadNotes = [], covered = [] } = result
  for (const n of leadNotes) store.appendJsonl('shadow/leads/tier2-lead-notes.jsonl', { runId, ...n })
  if (leadNotes.length) store.writeText(`${base}/tier2-lead-notes.md`, `# Tier 2 lead notes, ${runId}\n\nQueue-only (D-5). Confirm against the Tier 1 source before anything is drafted.\n\n${leadNotesMarkdown(leadNotes)}\n`)
  for (const r of dropped) store.appendJsonl('logs/dropped-claims.jsonl', r)
  for (const q of queued) store.appendJsonl('shadow/queue/needs-corroboration.jsonl', q)
  for (const l of leads) store.appendJsonl('shadow/leads/private-leads.jsonl', l)
  drafts.forEach((d, i) => store.writeJson(`${base}/drafts/${String(i + 1).padStart(3, '0')}-${(d.sourceKey ?? d.itemId).replace(/[^\w-]+/g, '_')}.json`, d))
  const reasons = {}
  for (const f of filtered) {
    const r = f.reason.startsWith('duplicate of') ? 'duplicate of a stored item' : f.reason.replace(/:.*$/, '')
    reasons[r] = (reasons[r] ?? 0) + 1
  }
  const passed = work.reduce((s, i) => s + i.claims.length, 0)
  const summary = {
    runId, ...extra,
    inputs: new Set([...work, ...filtered, ...humanReview].map(x => x.id)).size,
    filtered: { total: filtered.length, byReason: reasons },
    humanReview, extracted: work.length,
    claims: { extracted: passed + dropped.length, passedGuard: passed, dropped: dropped.length, guardPassRate: passed + dropped.length ? passed / (passed + dropped.length) : null, relabeled: work.reduce((s, i) => s + i.passingClaims.filter(c => c.relabeled).length, 0) },
    outcomes: Object.fromEntries([...new Set(work.flatMap(i => i.passingClaims.map(c => c.outcome)))].map(o => [o, work.reduce((s, i) => s + i.passingClaims.filter(c => c.outcome === o).length, 0)])),
    drafts: drafts.map(d => ({ item: d.itemId, origin: d.origin, title: d.entry?.title ?? d.heldProse?.title ?? null, tier: d.tier, effectiveTier: d.effectiveTier, party: d.party?.kind ?? null, guard: d.guard, status: d.status, ...(d.dateReview ? { dateReview: d.dateReview } : {}), existing: d.existing.length, flags: d.flags.length, alreadyCovered: Boolean(d.alreadyCovered) })),
    alreadyCovered: covered.map(n => ({ item: n.id, sourceKey: n.sourceKey, coveredClaims: n.coveredClaims, lacking: n.lacking.length })),
    queued: queued.length, privateLeads: leads.length, tier2LeadNotes: leadNotes.length,
    filteredItems: filtered,
  }
  store.writeJson(`${base}/summary.json`, summary)
  if (covered.length) store.writeText(`${base}/covered.md`, coveredMarkdown(runId, covered))
  store.writeText(`${base}/drafts.md`, `# Stage C shadow drafts, ${runId}\n\nNothing here is published; no PR was opened.\n\n${drafts.map(draftMarkdown).join('\n')}`)
  return summary
}

/** The "already covered" note: per source, the existing entries and only the claims they lack. */
export function coveredMarkdown(runId, covered) {
  return [`# Already covered, ${runId}`, '', 'Sources that already have a timeline or actions entry. Only claims the entry lacks are listed; a PR proposing a change to the existing entry opens only when there are some (for a court filing, only a new filing, hearing date, ruling or order).', '',
    ...covered.flatMap(n => [
      `## ${n.title} (${n.sourceKey})`, '',
      ...n.entries.map(e => `- Existing: ${e.file.replace('src/data/', '')} ${e.date} "${e.title}"`),
      n.lacking.length ? `- ${n.court ? 'New court milestones' : 'Claims the entry lacks'} (${n.lacking.length}; ${n.coveredClaims} already covered); PR proposes a change to the existing entry with at most ${MAX_CLAIMS_PER_DRAFT}:` : `- No PR: ${n.court && n.notMilestones.length ? `${n.notMilestones.length} claim(s) the entry lacks, but none is a new filing, hearing date, ruling or order` : `all ${n.coveredClaims} claim(s) are already covered`}.`,
      ...n.lacking.map(t => `  - ${t}`), '',
    ])].join('\n')
}
