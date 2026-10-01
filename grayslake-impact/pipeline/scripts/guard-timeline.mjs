#!/usr/bin/env node
/**
 * Runs the verbatim guard's prose checks over the existing timeline entries,
 * against the text of the sources each entry cites (built by
 * `npm run pipeline:corpus`). Offline: reads only the private store and
 * src/data. Changes nothing in the site.
 *
 *   npm run pipeline:guard-timeline
 *
 * The owner's entries are hand-written paraphrase, so this is not the claim
 * check (that needs extracted quotes). It applies the checks that generated
 * prose must pass: every quotation is in a cited source, every number, full
 * date and identifier appears in a cited source, and allegations are
 * attributed. Each entry gets one status:
 *
 *   PASS          every check found its evidence
 *   FAIL          all cited sources have text, and something was not found
 *   UNRESOLVED    something was not found, but a cited source has no text,
 *                 so it may be there
 *   UNVERIFIABLE  no cited source has text
 *
 * The detailed report, with source snippets, goes to the private store.
 */
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { openStore } from '../lib/store.mjs'
import { prepareSource, checkDraftProse, extractDates, makeCanon, occurrences } from '../lib/guard.mjs'
import { loadOverrides, applyOverrides } from '../lib/overrides.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

const cfg = loadPipelineConfig()
const gcfg = guardConfig(loadRubric())
const store = openStore(cfg.private_store.dir)
const canon = makeCanon(gcfg)
const overrides = loadOverrides()
const keysOf = e => [...new Set([e.sourceKey, ...(e.sourceKeys ?? [])].filter(Boolean))]

const results = []
for (const [i, entry] of timelineEvents.entries()) {
  const keys = keysOf(entry)
  const recs = keys.map(k => ({ key: k, rec: store.readJson(`corpus/sources/${k}.json`) }))
  const withText = recs.filter(r => r.rec?.text)
  const missing = recs.filter(r => !r.rec?.text).map(r => r.key)
  const evidence = withText.map(r => prepareSource(r.rec.text, gcfg, { key: r.key }))
  const fullEvidence = withText.map(r => prepareSource(r.rec.fullText ?? r.rec.text, gcfg, { key: r.key }))
  const docDates = keys.flatMap(k => extractDates(sources[k]?.date ?? ''))
  const allegation = keys.some(k => sources[k]?.category === 'court')
  const prose = `${entry.title}. ${entry.description ?? ''}`

  const res = checkDraftProse(prose, gcfg, { evidence, docDates, allegation })
  // A failure the article text misses but the full page has points at the
  // text extractor, not the entry.
  for (const f of res.failures) {
    if (!f.value) continue
    const v = canon(f.check === 'quotation' ? f.value : f.value)
    if (f.check === 'quotation' || f.check === 'identifier') {
      f.outsideArticle = fullEvidence.some(e => occurrences(e.canon, v).length > 0)
    } else if (f.check === 'number') {
      const fullCheck = checkDraftProse(f.value, gcfg, { evidence: fullEvidence })
      f.outsideArticle = fullCheck.failures.length === 0
    }
  }
  const blocked = checkDraftProse(prose, gcfg, { evidence, blockedTerms: cfg.editorial?.blocked_terms ?? [], labeledTerms: cfg.editorial?.labeled_terms ?? [] })
    .failures.filter(f => f.check === 'blocked_term' || f.check === 'labeled_term')

  // Recorded exceptions (config/guard-overrides.yaml), each re-checked against the source text.
  const ov = applyOverrides(entry, res.failures, k => recs.find(r => r.key === k)?.rec?.text ?? null, overrides)
  res.failures = ov.failures

  const status = !withText.length ? 'UNVERIFIABLE'
    : res.failures.length === 0 ? 'PASS'
    : missing.length ? 'UNRESOLVED' : 'FAIL'
  results.push({ i, date: entry.date, title: entry.title, keys, missing, status, failures: res.failures, notes: res.notes, blocked, overrides: ov.applied, staleOverrides: ov.stale })
}

// --- console summary ---------------------------------------------------------
const count = s => results.filter(r => r.status === s).length
console.log(`\nTimeline guard audit: ${results.length} entries`)
console.log(`  PASS ${count('PASS')}   FAIL ${count('FAIL')}   UNRESOLVED ${count('UNRESOLVED')}   UNVERIFIABLE ${count('UNVERIFIABLE')}\n`)
for (const r of results) {
  console.log(`${r.status.padEnd(12)} ${r.date.padEnd(10)} ${r.title}`)
  for (const f of r.failures) {
    const where = f.outsideArticle ? '  [found outside article body: extractor]' : ''
    console.log(`               - ${f.check}: ${f.reason}${f.value ? ` → ${JSON.stringify(f.value)}` : ''}${where}`)
  }
  for (const n of r.notes) console.log(`               · note: ${n.note} → ${JSON.stringify(n.value)}`)
  for (const o of r.overrides) console.log(`               · override: ${o.check} ${JSON.stringify(o.value)} accepted from ${o.source} (config/guard-overrides.yaml)`)
  for (const o of r.staleOverrides) console.log(`               ! stale override: ${o.check} ${JSON.stringify(o.value)} (${o.why})`)
  for (const b of r.blocked) console.log(`               · editorial: ${b.check === 'labeled_term' ? `"${b.value}" ${b.reason.replace(/_/g, ' ')}${b.detail ? ` (${b.detail})` : ''}` : `hold: contains "${b.value}"`} (fine in owner text; generated text may not)`)
  if (r.missing.length) console.log(`               · no text for: ${r.missing.join(', ')}`)
}

// --- detailed report to the private store -----------------------------------------
const day = new Date().toISOString().slice(0, 10)
const md = [`# Timeline guard audit, ${day}`, '', `PASS ${count('PASS')} · FAIL ${count('FAIL')} · UNRESOLVED ${count('UNRESOLVED')} · UNVERIFIABLE ${count('UNVERIFIABLE')}`, '']
for (const r of results) {
  md.push(`## ${r.status}: ${r.date} — ${r.title}`, '', `Sources: ${r.keys.join(', ')}${r.missing.length ? ` (no text: ${r.missing.join(', ')})` : ''}`, '')
  for (const f of r.failures) {
    md.push(`- **${f.check}** ${f.reason}${f.value ? `: \`${f.value}\`` : ''}${f.outsideArticle ? ' (found outside the article body)' : ''}`)
    if (f.nearest) md.push(`  - nearest in source (${Math.round(f.nearest.score * 100)}% word overlap): “${f.nearest.text}”`)
  }
  for (const n of r.notes) md.push(`- note: ${n.note}: \`${n.value}\``)
  for (const o of r.overrides) md.push(`- override: **${o.check}** \`${o.value}\` accepted from ${o.source}, passage \`${o.passage}\`. Reason: ${o.reason}`)
  for (const o of r.staleOverrides) md.push(`- **stale override**: ${o.check} \`${o.value}\` (${o.why})`)
  md.push('')
}
const file = store.writeText(`reports/guard-timeline-${day}.md`, md.join('\n'))
store.writeJson(`reports/guard-timeline-${day}.json`, results)
console.log(`\nDetailed report: ${file}`)
