// Bill status pages, twin bills and one PR per existing entry (review of the
// Oct. 7 shadow run). Uses the real HB5513 / SB4016 synopsis. No network, no
// model. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { loadFlagContext, entriesCiting } from '../lib/flags.mjs'
import { billWordingFailures, checkDraftProse, prepareSource } from '../lib/guard.mjs'
import { draftItem, combineAmendments, billTemplate } from '../lib/draft.mjs'
import { processItems, isBillPage, isBillMilestone, billNumber, synopsisOf, coveredMarkdown } from '../lib/stage-c.mjs'
import { buildPr, makeDiff } from '../lib/pr.mjs'
import { applySnippets } from '../lib/render.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'
import { actions } from '../../src/data/actions.js'

const cfg = loadPipelineConfig()
const rubric = loadRubric()
const gcfg = guardConfig(rubric)
const registry = loadRegistry()
const stub = responses => {
  let i = 0
  return { model: 'stub', budgetChars: () => 20000, async generateJSON() { return { content: JSON.stringify(responses[Math.min(i++, responses.length - 1)]), usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] } } }
}

// The synopsis on both ilga.gov bill status pages, as fetched for the corpus.
const SYNOPSIS = 'Amends the Environmental Protection Act, Energy Efficient Building Act, Illinois Power Agency Act, Public Utilities Act, and related statutes to establish comprehensive environmental, water, and energy regulations for hyperscale data centers. In the Environmental Protection Act, requires cumulative impact assessments, public notice, and community benefits agreements for data centers; prohibits nondisclosure agreements; and creates the Data Center Community Intervenor Compensation Fund and Hyperscale Data Center Public Benefits and Affordability Fund funded by annual fees based on peak demand. Mandates water resource planning, quarterly water usage reporting, water scarcity plans, and Water Impact Permits with public hearings and renewal every 5 years. Requires compliance with stringent energy codes and annual energy and water reporting to the Illinois Commerce Commission. Expands renewable energy procurement programs, establishes a hyperscale data center self-direct program, and strengthens equity, transparency, and labor standards in clean energy initiatives. Creates the Residential Automated Solar Permitting Platform Act to require municipalities and counties to adopt a residential automated solar permitting platform on or before July 1, 2027, and authorizes persons to file a civil action against a municipality or county in violation.'
// The first action rows of each page, as fetched.
const HB_ROWS = '2/06/2026 \nHouse \nFiled with the Clerk by Rep. Robyn Gabel \n2/10/2026 \nHouse \nAdded Co-Sponsor Rep. Diane Blair-Sherlock \n 2/13/2026 \n House \n First Reading \n2/13/2026 \nHouse \nReferred to Rules Committee'
const SB_ROWS = '2/06/2026 \nSenate \nFiled with Secretary by Sen. Ram Villivalam \n 2/06/2026 \n Senate \n First Reading \n2/06/2026 \nSenate \nReferred to Assignments'
const page = rows => `Synopsis As Introduced\n ${SYNOPSIS} \n Actions\n Date \n Chamber \n Action \n${rows}`

const HB_URL = 'https://www.ilga.gov/Legislation/BillStatus?DocTypeID=HB&DocNum=5513&GAID=18&SessionID=114'
const SB_URL = 'https://www.ilga.gov/Legislation/BillStatus?DocTypeID=SB&DocNum=4016&GAID=18&SessionID=114'
function billItem(key, num, url, rows) {
  const hit = lookup(registry, url)
  return { origin: 'corpus', id: `corpus:${key}`, sourceKey: key, title: `Bill Status of ${num}, 104th General Assembly`, url, text: page(rows), kind: 'html', published: null, registryHit: hit, registryId: hit.id, registryTier: hit.tier, publisher: hit.name }
}
const extraction = claims => ({ document: { doc_type: 'bill_status', published_date: null, byline: [], is_about_t5_grayslake: 'partly', origin: 'originates', repeats_whom: null }, claims })
const describe = (text, quote) => ({ claim_text: text, claim_type: 'projection', speaker: null, attribution: 'document', event_date: null, date_basis: 'unknown', supporting_quotes: [quote], timeline_category: 'policy' })
const DESCRIPTIONS = [
  describe('The bill requires cumulative impact assessments, public notice, and community benefits agreements for data centers.', 'requires cumulative impact assessments, public notice, and community benefits agreements for data centers'),
  describe('The bill creates the Data Center Community Intervenor Compensation Fund.', 'creates the Data Center Community Intervenor Compensation Fund and Hyperscale Data Center Public Benefits and Affordability Fund funded by annual fees based on peak demand'),
]
const stageCtx = provider => ({ cfg, rubric, gcfg, provider, triage: makeTriage(cfg.triage, []).triage, flagCtx: loadFlagContext(), sources, timelineEvents, actions, runId: 't', today: '2026-10-07' })

// --- 1. bill status pages: milestones only ------------------------------------------------------

test('bills: the real pages are bill status pages; number and synopsis are read from them', () => {
  const hb = billItem('ilgaHB5513', 'HB5513', HB_URL, HB_ROWS)
  assert.ok(isBillPage(hb))
  assert.equal(billNumber(hb), 'HB5513')
  assert.equal(billNumber({ title: 'x', url: SB_URL }), 'SB4016')
  assert.equal(synopsisOf(hb.text), SYNOPSIS)
  assert.equal(synopsisOf(page(HB_ROWS)), synopsisOf(page(SB_ROWS)), 'identical synopses')
})

test('bills: only chamber passage, governor action and effective dates are milestones', () => {
  const re = new RegExp(cfg.triage.significant_bill_actions, 'i')
  const row = t => ({ claim_type: 'procedural', claim_text: t, supporting_quotes: [t], event_date: null })
  assert.ok(isBillMilestone(row('HB5513. 5/30/2027. House: Third Reading - Passed; 059-000-000'), re))
  assert.ok(isBillMilestone(row('SB4016. 8/15/2027. Senate: Governor Approved'), re))
  assert.ok(!isBillMilestone(row('HB5513. 2/13/2026. House: Referred to Rules Committee'), re), 'the real HB5513 rows are routine')
  assert.ok(!isBillMilestone(row('SB4016. 2/06/2026. Senate: Filed with Secretary by Sen. Ram Villivalam'), re))
  for (const d of DESCRIPTIONS) assert.ok(!isBillMilestone(d, re), 'what the bill would do is never a milestone')
})

test('bills: what a bill would do never reaches a PR; HB5513 and SB4016 share one note listing both', async () => {
  const items = [billItem('ilgaHB5513', 'HB5513', HB_URL, HB_ROWS), billItem('ilgaSB4016', 'SB4016', SB_URL, SB_ROWS)]
  let draftCalls = 0
  const provider = { model: 'stub', budgetChars: () => 20000, async generateJSON({ schema }) { if (schema.properties?.title) draftCalls++; return { content: JSON.stringify(extraction(DESCRIPTIONS)), usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] } } }
  const r = await processItems(items, stageCtx(provider))
  takeWarnings()
  assert.equal(r.drafts.length, 0)
  assert.equal(draftCalls, 0, 'no prose is written for a bill description')
  const notes = r.covered.filter(n => n.kind === 'bill')
  assert.equal(notes.length, 1, 'twin bills, one note')
  assert.deepEqual(notes[0].bills, ['HB5513', 'SB4016'])
  assert.equal(notes[0].identicalSynopsis, true)
  assert.equal(notes[0].described.length, 2, 'the same descriptions once, not twice')
  const md = coveredMarkdown('t', r.covered)
  assert.match(md, /## HB5513 and SB4016 \(identical synopses\)/)
  assert.match(md, /No PR: a bill status page opens a PR only for a milestone/)
})

test('bills: different synopses get separate notes', async () => {
  const other = { ...billItem('ilgaSB2181', 'SB2181', 'https://www.ilga.gov/Legislation/BillStatus?DocTypeID=SB&DocNum=2181&GAID=18&SessionID=114', SB_ROWS), sourceKey: null }
  other.text = other.text.replace('Amends the Environmental Protection Act', 'Amends the Illinois Power Agency Act')
  const r = await processItems([billItem('ilgaHB5513', 'HB5513', HB_URL, HB_ROWS), other], stageCtx(stub([extraction(DESCRIPTIONS)])))
  takeWarnings()
  assert.deepEqual(r.covered.filter(n => n.kind === 'bill').map(n => n.bills), [['HB5513'], ['SB2181']])
})

// --- prose about bills ---------------------------------------------------------------------------

test('bill wording: the Oct. 7 drafts ("projects that", "plans to") fail', () => {
  const sb = 'The Illinois General Assembly projects that the bill “requires cumulative impact assessments, public notice, and community benefits agreements for data centers.”'
  const hb = 'The Illinois General Assembly plans to require “cumulative impact assessments, public notice, and community benefits agreements for data centers” under the bill.'
  assert.ok(billWordingFailures(sb).some(f => /projected_or_planned/.test(f.reason)))
  assert.ok(billWordingFailures(hb).some(f => /projected_or_planned/.test(f.reason)))
})

test('bill wording: "the proposed bill would ..." passes; without "would" or "proposed" it fails', () => {
  assert.deepEqual(billWordingFailures('HB5513, a proposed bill, would require “cumulative impact assessments, public notice, and community benefits agreements for data centers.”'), [])
  assert.ok(billWordingFailures('The proposed bill requires “cumulative impact assessments.”').some(f => f.reason === 'bill_provision_without_would'))
  assert.ok(billWordingFailures('The bill would require “cumulative impact assessments.”').some(f => f.reason === 'bill_not_called_proposed'))
  assert.deepEqual(billWordingFailures('He plans to push the bill during the fall veto session.'), [], 'a person\'s plan, not a description of the bill')
  assert.deepEqual(billWordingFailures('The County Board approved the moratorium.'), [], 'no bill named')
})

test('bill wording: the milestone template passes the draft guard', () => {
  const t = billTemplate({ title: 'HB5513 5/30/2027 House: Third Reading - Passed' })
  const g = checkDraftProse(`${t.title}. ${t.description}`, gcfg, { evidence: [prepareSource('HB5513 5/30/2027 House: Third Reading - Passed', gcfg)], billWording: true })
  assert.deepEqual(g.failures.filter(f => f.check === 'bill_wording'), [])
})

// --- 3. one entry, one PR -------------------------------------------------------------------------

const MUNDELEIN = 'https://www.mundelein.org/m/newsflash/Home/Detail/230'
const FOUND_OUT = 'The Village of Mundelein found out about this project after it was approved, permits issued, and construction started.'
const BOUNDARY = 'This data center is 100 percent within the boundaries of the Village of Grayslake.'
const target = () => ({ ...entriesCiting('mundeleindata', timelineEvents, actions)[0], sourceKey: 'mundeleindata' })
const item = (id, url, publisher) => ({ id, title: id, url, published: '2026-06-02', text: `${FOUND_OUT}\n${BOUNDARY}`, registryId: 'mundelein', registryTier: 1, effectiveTier: 1, publisher, party: null, guardCfg: gcfg })
const fact = (t, q) => ({ claim_text: t, claim_type: 'fact', speaker: null, outcome: 'draft_as_fact', guardMatch: ['exact'], supporting_quotes: [q], event_date: null, date_basis: 'unknown' })
const dctx = provider => ({ provider, examples: [], sources, cited: new Map(), blockedTerms: [], labeledTerms: [], today: '2026-10-07', canonUrl: u => u, amend: target() })

async function twoDrafts() {
  const a = await draftItem(item('a', MUNDELEIN, 'Village of Mundelein'), [fact('Mundelein learned of the project after construction started.', FOUND_OUT)],
    dctx(stub([{ title: 'Mundelein statement addition', description: 'The Village of Mundelein stated that it “found out about this project after it was approved, permits issued, and construction started.”', category: 'policy' }])))
  const b = await draftItem(item('b', 'https://www.mundelein.org/m/newsflash/Home/Detail/231', 'Village of Mundelein'), [fact('The campus lies wholly in Grayslake.', BOUNDARY)],
    dctx(stub([{ title: 'Mundelein boundary addition', description: 'The Village of Mundelein also stated that the data center is “100 percent within the boundaries of the Village of Grayslake.”', category: 'policy' }])))
  takeWarnings()
  return [a, b]
}

test('one entry, one PR: two drafts changing the same entry become one draft', async () => {
  const [a, b] = await twoDrafts()
  assert.equal(a.status, 'ready', JSON.stringify(a.attempts))
  assert.equal(b.status, 'ready', JSON.stringify(b.attempts))
  const out = await combineAmendments([a, b], { gcfg, today: '2026-10-07' })
  const ready = out.filter(d => d.status === 'ready')
  assert.equal(ready.length, 1)
  const c = ready[0]
  assert.equal(c.combinedFrom.length, 2)
  assert.deepEqual([a.status, b.status], ['combined', 'combined'])
  assert.ok(c.validation.ok, JSON.stringify(c.validation))
  assert.match(c.rendered.timelineEdit.description, /found out about this project.*100 percent within the boundaries/)
  assert.equal(c.claims.length, 2)
  const pr = buildPr(c, { today: '2026-10-07' })
  assert.match(pr.title, /^Draft: add to “Village of Mundelein publishes statement on T5 development”$/)
  assert.match(pr.body, /### Combined: one entry, one PR/)
  const timeline = applySnippets(c.rendered)['timeline.js']
  assert.equal(timeline.split('mundeleindata').length, 2, 'still one entry citing the source')
  const diff = makeDiff(c, cfg.job.site_repo.data_dir)
  const timelineDiff = diff.split(/^diff --git /m).find(p => p.includes('src/data/timeline.js'))
  assert.equal((timelineDiff.match(/^\+ {4}description:/gm) ?? []).length, 1, 'one changed description in timeline.js')
  assert.equal(diff.split(/^diff --git /m).filter(p => p.includes('src/data/updates.js b/')).length, 1, 'one updates.js line for the combined PR')
  assert.equal((diff.match(/^\+ {4}kind: 'added',/gm) ?? []).length, 1)
})

test('one entry, one PR: past the 5-claim limit a draft waits for a later run', async () => {
  const [a, b] = await twoDrafts()
  a.claims = Array(4).fill(a.claims[0])
  b.claims = Array(2).fill(b.claims[0])
  const out = await combineAmendments([a, b], { gcfg, today: '2026-10-07', maxClaims: 5 })
  assert.equal(b.status, 'deferred')
  const ready = out.filter(d => d.status === 'ready')
  assert.equal(ready.length, 1, 'still one PR for the entry')
  assert.equal(ready[0].claims.length, 4)
  assert.deepEqual(ready[0].deferred.map(x => x.itemId), ['b'])
  assert.match(buildPr(ready[0], { today: '2026-10-07' }).body, /Not in this PR \(it would pass the 5-claim limit\)/)
})
