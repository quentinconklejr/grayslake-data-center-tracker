// Stage C tests: triage, scoring, flags, rendering and drafting. No network,
// no model: the provider is a stub. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadPipelineConfig, ROOT } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { decide, effectiveTier, signalsFor, corroborationCount, isDraftable } from '../lib/score.mjs'
import { loadFlagContext, flagsForClaim, existingEntryMatches, KEY_FIGURE_TOPICS, QUESTION_TOPICS } from '../lib/flags.mjs'
import { jsString, renderTimelineEntry, renderSourceEntry, renderUpdateEntry, validateDraft, CATEGORIES } from '../lib/render.mjs'
import { draftItem, entryDate, sourceKeyFor, apDate, instructionFor } from '../lib/draft.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { timelineEvents } from '../../src/data/timeline.js'
import { sources } from '../../src/data/sources.js'

const cfg = loadPipelineConfig()
const rubric = loadRubric()
const gcfg = guardConfig(rubric)
const { judge, triage } = makeTriage(cfg.triage, ['1010200018', '10-10-200-018'])

// --- triage ----------------------------------------------------------------------

test('triage: strong terms, project+local, and T5+context match; the rest is filtered with a reason', () => {
  assert.equal(judge('T5 Data Centers announced a campus').rule, 'A')
  assert.equal(judge('Case 2026CH00000171 status hearing').rule, 'A')
  assert.equal(judge('HB 5513 was re-referred').rule, 'A')
  assert.equal(judge('PIN 10-10-200-018 was conveyed').rule, 'A')
  assert.equal(judge('A data center moratorium for unincorporated Lake County').rule, 'B')
  assert.equal(judge('T5 crews were seen near Peterson Road').rule, 'C')
  assert.deepEqual([judge('Police Commission agenda: approve minutes').match, judge('Police Commission agenda: approve minutes').reason], [false, 'no project, T5 or local terms'])
  assert.equal(judge('Grayslake cemetery walk this Saturday').reason, 'local terms only, no project or T5 term')
  assert.equal(judge('A data center opened in Ohio').reason, 'project term without any local term')
  assert.equal(judge('model t5 filter in a file name, Grayslake').match, false, 'lower-case t5 does not count')
})

test('triage: a PDF keeps only the matching pages plus context, and says how many', () => {
  const pages = [1, 2, 3, 4, 5, 6].map(page => ({ page, text: page === 4 ? 'T5 Data Centers site plan' : 'routine business' }))
  const t = triage({ title: 'Agenda', text: pages.map(p => p.text).join('\n') }, pages)
  assert.deepEqual(t.pages, [3, 4, 5])
  assert.match(t.text, /\[page 4\]\nT5 Data Centers site plan/)
})

// --- scoring -----------------------------------------------------------------------

const item = (over = {}) => ({ id: 'i', registryId: 'village-grayslake', effectiveTier: 1, docOrigin: 'originates', ...over })
const claim = (over = {}) => ({ claim_type: 'fact', attribution: 'document', claim_text: 'x', supporting_quotes: ['x'], ...over })
const outcome = (c, it, corr = 0, guard = true) => decide(rubric, signalsFor(c, it, guard, corr)).outcome

test('scoring follows the rubric decision table', () => {
  assert.equal(outcome(claim(), item(), 0, false), 'drop_and_log')
  assert.equal(outcome(claim(), item()), 'draft_as_fact')
  assert.equal(outcome(claim({ claim_type: 'procedural' }), item()), 'draft_as_fact')
  for (const t of ['quote', 'opinion', 'allegation', 'projection', 'party_statement']) assert.equal(outcome(claim({ claim_type: t }), item()), 'draft_attributed', t)
  assert.equal(outcome(claim(), item({ effectiveTier: 2, docOrigin: 'originates' })), 'draft_as_reported')
  assert.equal(outcome(claim({ attribution: 'unnamed' }), item({ effectiveTier: 2 })), 'draft_as_reported')
  assert.equal(outcome(claim(), item({ effectiveTier: 2, docOrigin: 'repeats' })), 'queue_only', 'a repeat whose original is not traced is queued')
  assert.equal(outcome(claim(), item({ effectiveTier: 3 })), 'queue_only')
  assert.equal(outcome(claim(), item({ effectiveTier: 3 }), 1), 'redraft_from_corroborating_source')
  assert.equal(outcome(claim(), item({ effectiveTier: 4 })), 'private_lead')
  assert.equal(outcome(claim({ attribution: 'unnamed' }), item({ effectiveTier: 1 })), 'queue_only', 'unnamed sources never become fact')
  assert.ok(!isDraftable('queue_only') && !isDraftable('private_lead') && isDraftable('draft_attributed'))
})

test('a Tier 2 article without a named byline is scored as Tier 3', () => {
  assert.equal(effectiveTier(2, 'Mick Zawislak'), 2)
  assert.equal(effectiveTier(2, null), 3)
  assert.equal(effectiveTier(2, 'Daily Herald staff'), 3)
  assert.equal(effectiveTier(2, ['', 'Sam Borcia']), 2)
  assert.equal(effectiveTier(1, null), 1)
})

test('corroboration counts only independent Tier 1/2 items stating the same figures and dates', () => {
  const c = claim({ claim_text: 'The moratorium expires May 11, 2027.' })
  const me = item({ id: 'a', registryId: 'chronicle-media', effectiveTier: 3 })
  const gov = { id: 'b', registryId: 'lake-county', effectiveTier: 1, passingClaims: [{ supporting_quotes: ['set to expire May 11, 2027'] }] }
  const sameSource = { id: 'c', registryId: 'chronicle-media', effectiveTier: 1, passingClaims: gov.passingClaims }
  const t3 = { id: 'd', registryId: 'patch', effectiveTier: 3, passingClaims: gov.passingClaims }
  const wrong = { id: 'e', registryId: 'daily-herald', effectiveTier: 2, passingClaims: [{ supporting_quotes: ['set to expire May 12, 2027'] }] }
  assert.equal(corroborationCount(c, me, [gov, sameSource, t3, wrong]), 1)
  assert.equal(corroborationCount(claim({ claim_text: 'The board met.' }), me, [gov]), 0, 'no figures, no corroboration')
  const year = { id: 'f', registryId: 'lake-county', effectiveTier: 1, passingClaims: [{ supporting_quotes: ['adopted in 2025'] }] }
  assert.equal(corroborationCount(claim({ claim_text: 'The plan was announced in 2025.' }), me, [year]), 0, 'a bare year is not a figure')
})

// --- flags ----------------------------------------------------------------------------

test('flag topic ids exist in keyFigures.js and questionStatus.js', () => {
  const kf = readFileSync(join(ROOT, 'src/data/keyFigures.js'), 'utf8')
  const qs = readFileSync(join(ROOT, 'src/data/questionStatus.js'), 'utf8')
  for (const id of Object.keys(KEY_FIGURE_TOPICS)) assert.ok(kf.includes(`id: '${id}'`), id)
  for (const id of Object.keys(QUESTION_TOPICS)) assert.ok(qs.includes(`'${id}'`), id)
})

test('claims are flagged against key figures, questions and records, never edited', () => {
  const ctx = loadFlagContext()
  const f = flagsForClaim({ claim_text: 'The campus will use less than 50,000 gallons of water per day.', supporting_quotes: ['under Ordinance 2025-0-21'] }, ctx)
  assert.ok(f.some(x => x.file === 'src/data/keyFigures.js' && x.id === 'water'))
  assert.ok(f.some(x => x.file === 'src/data/questionStatus.js' && x.id === 'water-usage'))
  assert.ok(f.some(x => x.file === 'src/data/records.js'))
  assert.ok(f.every(x => /not edited/.test(x.note)))
  assert.equal(flagsForClaim({ claim_text: 'Water service is provided by the Village.' }, ctx).filter(x => x.file === 'src/data/keyFigures.js').length, 0, 'no figure, no key-figure flag')
})

test('a draft matching an existing timeline entry is flagged', () => {
  const m = existingEntryMatches({ date: '2026-09-08', title: 'County Board adopts data center moratorium', description: 'moratorium unincorporated expire ordinance Chapter 151', sourceKey: 'x' }, timelineEvents)
  assert.ok(m.some(e => e.date === '2026-09-08'))
  assert.ok(existingEntryMatches({ date: '2026-09-01', title: 't', sourceKey: 'scannerPermit2026' }, timelineEvents).some(e => e.why === 'cites the same source'))
})

// --- rendering ------------------------------------------------------------------------------

test('strings are escaped the way the data files write them', () => {
  assert.equal(jsString('Davies said “no” — it’s done'), '"Davies said \\u201cno\\u201d \\u2014 it\\u2019s done"')
  assert.equal(jsString("it's", "'"), "'it\\'s'")
  assert.equal(jsString('a "b"'), '"a \\"b\\""')
})

test('rendered entries match the files\' layout', () => {
  const t = renderTimelineEntry({ date: '2026-10-01', title: 'T', description: 'D', category: 'policy', sourceKey: 'k' })
  assert.equal(t, '  {\n    date: "2026-10-01",\n    title: "T",\n    description:\n      "D",\n    category: "policy",\n    sourceKey: "k",\n  },')
  assert.match(renderSourceEntry('k', { category: 'news', title: 'T', url: 'https://x' }), /^ {2}k: \{\n {4}category: "news",/)
  assert.match(renderUpdateEntry({ date: '2026-10-01', kind: 'added', title: 'T', description: 'D', link: '/timeline', linkLabel: 'L' }), /date: '2026-10-01',/)
})

test('validation loads the drafts into copies of the data files and checks format', async () => {
  const good = await validateDraft({
    timeline: renderTimelineEntry({ date: '2026-10-01', title: 'T', description: 'D', category: 'policy', sourceKey: 'newKey2026' }),
    source: renderSourceEntry('newKey2026', { category: 'government', title: 'T', url: 'https://x.example' }),
    update: renderUpdateEntry({ date: '2026-10-01', kind: 'added', title: 'T', description: 'D', link: '/timeline', linkLabel: 'L' }),
  })
  assert.deepEqual(good, { ok: true, errors: [] })
  const bad = await validateDraft({ timeline: renderTimelineEntry({ date: 'October 1, 2026', title: 'T', description: 'D', category: 'news', sourceKey: 'nope' }) })
  assert.equal(bad.ok, false)
  assert.ok(bad.errors.some(e => /date/.test(e)) && bad.errors.some(e => /category/.test(e)) && bad.errors.some(e => /unknown source/.test(e)))
  // The real files are untouched.
  assert.equal(readFileSync(join(ROOT, 'src/data/timeline.js'), 'utf8').includes('newKey2026'), false)
})

// --- drafting -------------------------------------------------------------------------------

test('entry date comes from verified claim dates, else the document date', () => {
  assert.deepEqual(entryDate([{ date_basis: 'stated_in_text', event_date: '2026-09-08' }], '2026-09-10T00:00:00Z').date, '2026-09-08')
  assert.equal(entryDate([{ date_basis: 'unknown', event_date: null }], '2026-09-10T00:00:00Z').date, '2026-09-10')
  assert.equal(apDate('2026-09-08'), 'Sept. 8, 2026')
})

test('source keys follow publisher + topic + year and never collide', () => {
  assert.equal(sourceKeyFor({ registryId: 'lake-mchenry-scanner', published: '2026-09-08' }, 'County board bans data centers', {}), 'scannerBans2026', 'county is a stop word')
  assert.equal(sourceKeyFor({ registryId: 'lake-mchenry-scanner', published: '2026-09-08' }, 'Moratorium adopted', { scannerMoratorium2026: {} }), 'scannerMoratorium2026_0908')
})

test('claim instructions carry the attribution the rubric requires', () => {
  const it = { publisher: 'Daily Herald' }
  assert.match(instructionFor({ claim_type: 'allegation', speaker: 'the plaintiffs' }, it), /alleg/)
  assert.match(instructionFor({ claim_type: 'party_statement', speaker: 'T5 Data Centers' }, it), /T5 stated/)
  assert.match(instructionFor({ claim_type: 'fact', outcome: 'draft_as_reported' }, it), /Daily Herald reported/)
  assert.equal(instructionFor({ claim_type: 'fact', outcome: 'draft_as_fact' }, it), 'STATE AS FACT')
})

function stubProvider(responses) {
  let i = 0
  return { model: 'stub', async generateJSON() { const content = JSON.stringify(responses[Math.min(i++, responses.length - 1)]); return { content, usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] } } }
}
const QUOTE = 'The Lake County Board approved an ordinance establishing a moratorium on new data center approvals, set to expire May 11, 2027.'
const baseItem = {
  id: 'shadow:x', title: 'Moratorium ordinance', url: 'https://www.lakecountyil.gov/m/newsflash/Home/Detail/9999', published: '2026-09-08',
  registryId: 'lake-county', registryTier: 1, effectiveTier: 1, publisher: 'Lake County, Illinois', party: null, guardCfg: gcfg,
}
const baseClaims = [{ claim_text: 'The Board approved a moratorium set to expire May 11, 2027.', claim_type: 'fact', speaker: null, outcome: 'draft_as_fact', supporting_quotes: [QUOTE], event_date: '2026-09-08', date_basis: 'document_date', guardMatch: ['exact'] }]
const ctxFor = provider => ({ provider, examples: [], sources, cited: new Map(), blockedTerms: cfg.editorial.blocked_terms, today: '2026-10-01', canonUrl: u => u })

test('drafting: prose that passes the guard yields valid timeline, sources and updates entries', async () => {
  const d = await draftItem(baseItem, baseClaims, ctxFor(stubProvider([{ title: 'County Board approves data center moratorium', description: 'The Lake County Board approved an ordinance establishing a moratorium on new data center approvals, set to expire May 11, 2027.', category: 'policy' }])))
  takeWarnings()
  assert.equal(d.guard, 'pass')
  assert.equal(d.status, 'ready', JSON.stringify(d.validation))
  assert.equal(d.entry.date, '2026-09-08')
  assert.ok(CATEGORIES.includes(d.entry.category))
  assert.match(d.rendered.source, /lakeCounty\w+2026: \{/)
  assert.match(d.rendered.update, /kind: 'added'/)
  assert.match(d.rendered.action, /sourceIds: \["lakeCounty\w+2026"\]/)
})

test('drafting: a draft with an unsupported number is retried, then left as claims only', async () => {
  const bad = { title: 'County Board approves data center moratorium', description: 'The Lake County Board approved a 12-month moratorium on data centers.', category: 'policy' }
  const d = await draftItem(baseItem, baseClaims, ctxFor(stubProvider([bad, bad])))
  assert.equal(d.guard, 'fail')
  assert.equal(d.status, 'claims_only')
  assert.equal(d.attempts.length, 2)
  assert.ok(d.attempts[1].failures.some(f => f.check === 'number'))
  assert.equal(d.rendered, undefined, 'nothing is rendered for a failed draft')
})

test('drafting: a party claim drafted without "T5 stated" fails the guard', async () => {
  const party = { kind: 'party_statement', party: 'T5 Data Centers' }
  const it = { ...baseItem, registryId: 't5-data-centers', party, url: 'https://t5datacenters.com/x' }
  const claims = [{ ...baseClaims[0], claim_type: 'party_statement', speaker: 'T5 Data Centers', outcome: 'draft_attributed', claim_text: 'The moratorium expires May 11, 2027.' }]
  const asFact = { title: 'Moratorium set to expire in 2027', description: 'The moratorium on new data center approvals is set to expire May 11, 2027.', category: 'policy' }
  const d = await draftItem(it, claims, ctxFor(stubProvider([asFact, asFact])))
  assert.equal(d.status, 'claims_only')
  assert.ok(d.attempts[0].failures.some(f => f.check === 'attribution'))
  const attributed = { title: 'T5 says moratorium set to expire in 2027', description: 'T5 stated that the moratorium on new data center approvals is set to expire May 11, 2027.', category: 'policy' }
  const ok = await draftItem(it, claims, ctxFor(stubProvider([attributed])))
  assert.equal(ok.guard, 'pass')
  assert.equal(ok.action, null, 'a party statement is never drafted as a government action')
})

test('drafting: the POWER Act name is blocked in generated text', async () => {
  const quote = 'He plans to push the POWER Act during the fall veto session, which would require data centers to disclose water use.'
  const claims = [{ ...baseClaims[0], claim_text: 'He plans to push the bill during the fall veto session.', supporting_quotes: [quote], event_date: null, date_basis: 'unknown' }]
  const named = { title: 'Lawmaker plans to push POWER Act', description: 'He plans to push the POWER Act during the fall veto session.', category: 'policy' }
  const d = await draftItem(baseItem, claims, ctxFor(stubProvider([named, named])))
  assert.ok(d.attempts.every(a => a.failures.some(f => f.check === 'blocked_term')))
  assert.equal(d.status, 'claims_only')
})

// --- fixes from the first live Stage C run ------------------------------------------

import { curlyQuotes } from '../lib/draft.mjs'
import { processItems } from '../lib/stage-c.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'

test('straight quotation marks become curly ones, in pairs', () => {
  assert.equal(curlyQuotes('a "b c" d "e"'), 'a “b c” d “e”')
  assert.equal(curlyQuotes('a 6" pipe'), 'a 6" pipe', 'a lone mark is left alone')
})

test('drafting: the updates line may name the publisher even if its numbers are in no quote', async () => {
  const it = { ...baseItem, publisher: 'Circuit Court of the 19th Judicial Circuit' }
  const d = await draftItem(it, baseClaims, ctxFor(stubProvider([{ title: 'County Board approves data center moratorium', description: QUOTE, category: 'policy' }])))
  assert.equal(d.updateGuard, 'pass', JSON.stringify(d.updateGuardFailures))
  assert.equal(d.status, 'ready')
})

test('Stage C: a corroborated Tier 3 claim is queued with its corroborator, never drafted under the Tier 3 source', async () => {
  const registry = loadRegistry()
  const quote = 'The Lake County Board approved an ordinance establishing a moratorium on new data center approvals, set to expire May 11, 2027.'
  const mk = (id, url, text) => ({ origin: 'shadow', id, title: id, url, text, kind: 'html', published: '2026-09-08', registryHit: lookup(registry, url), registryId: lookup(registry, url).id, registryTier: lookup(registry, url).tier, publisher: lookup(registry, url).name, byline: 'Sam Borcia' })
  const items = [
    mk('gov', 'https://www.lakecountyil.gov/m/newsflash/Home/Detail/9999', `Lake County data center news. ${quote}`),
    mk('scanner', 'https://www.lakemchenryscanner.com/2026/09/08/x/', `Lake County data center story. ${quote}`),
  ]
  const provider = {
    model: 'stub', budgetChars: () => 20000,
    async generateJSON({ schema }) {
      const content = schema.properties?.title
        ? { title: 'County Board approves data center moratorium', description: quote, category: 'policy' }
        : { document: { doc_type: 'news_article', published_date: null, byline: [], is_about_t5_grayslake: 'partly', origin: 'originates', repeats_whom: null },
            claims: [{ claim_text: 'The moratorium is set to expire May 11, 2027.', claim_type: 'fact', speaker: null, attribution: 'document', event_date: null, date_basis: 'unknown', supporting_quotes: [quote], timeline_category: 'policy' }] }
      return { content: JSON.stringify(content), usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] }
    },
  }
  const r = await processItems(items, { cfg, rubric, gcfg, provider, triage, flagCtx: loadFlagContext(), sources, timelineEvents, runId: 't', today: '2026-10-01' })
  takeWarnings()
  assert.deepEqual(r.drafts.map(d => d.itemId), ['gov'], 'only the Tier 1 item is drafted')
  const q = r.queued.find(x => x.item === 'scanner')
  assert.equal(q.outcome, 'redraft_from_corroborating_source')
  assert.deepEqual(q.corroboratedBy, ['gov'])
  assert.equal(r.work.find(w => w.id === 'scanner').origin, 'shadow', 'the input origin is not overwritten by the model\'s origin signal')
})
