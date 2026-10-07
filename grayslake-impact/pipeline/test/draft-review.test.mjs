// Fixes from the review of the Oct. 1 dry-run drafts: entry dates that fit
// the title's event, sources already covered by an entry, placeholder text,
// and ordinance clauses mislabeled as projections. No network, no model.
// Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { loadFlagContext, entriesCiting, claimCovered } from '../lib/flags.mjs'
import { draftItem, filingStamp, fitDate, titleEvent, instructionFor } from '../lib/draft.mjs'
import { relabelClauseProjections } from '../lib/party.mjs'
import { findPlaceholders, addedLines } from '../lib/guard.mjs'
import { processItems } from '../lib/stage-c.mjs'
import { buildPr } from '../lib/pr.mjs'
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
const dctx = provider => ({ provider, examples: [], sources, cited: new Map(), blockedTerms: cfg.editorial.blocked_terms, labeledTerms: cfg.editorial.labeled_terms, today: '2026-10-07', canonUrl: u => u })
const claim = over => ({ claim_type: 'fact', speaker: null, outcome: 'draft_as_fact', guardMatch: ['exact'], date_basis: 'unknown', event_date: null, ...over })

// --- dates: lawsuit filings -------------------------------------------------------------------

test('filing date: the stamp at the top of the document, not "filed" in the body', () => {
  assert.equal(filingStamp('FILED 7/31/2026 6:29 PM ERIN CARTWRIGHT WEINSTEIN Clerk of the Circuit Court'), '2026-07-31')
  assert.equal(filingStamp('Filed: August 3, 2026\nIN THE CIRCUIT COURT'), '2026-08-03')
  assert.equal(filingStamp('The developer filed its application on September 23, 2024.'), null, 'the filer describing an earlier filing')
  assert.equal(filingStamp('COMPLAINT FOR DECLARATORY RELIEF'), null)
})

test('filing date: a complaint with no stamp goes to human review, not to a PR with a listing date', async () => {
  const quote = 'This action seeks declaratory and injunctive relief from a series of discretionary land-use approvals issued by the Village of Grayslake between September 23, 2024 and May 6, 2025'
  const item = { id: 'c', title: 'Complaint', url: '/docs/x.pdf', published: '2026-08-02', text: `COMPLAINT\n${quote}`, registryId: 'tracker-mirror', registryTier: 1, effectiveTier: 1, publisher: 'Circuit Court', party: { kind: 'court_filing', party: 'the plaintiffs' }, guardCfg: gcfg }
  const claims = [claim({ claim_type: 'allegation', speaker: 'the plaintiffs', outcome: 'draft_attributed', claim_text: 'The plaintiffs seek relief from approvals issued between September 23, 2024 and May 6, 2025.', supporting_quotes: [quote], event_date: '2024-09-23', date_basis: 'stated_in_text' })]
  const prose = { title: 'Plaintiffs file complaint for declaratory and injunctive relief', description: 'The complaint alleges that the Village issued approvals “between September 23, 2024 and May 6, 2025.”', category: 'legal' }
  const d = await draftItem(item, claims, dctx(stub([prose])))
  assert.equal(d.status, 'human_review')
  assert.match(d.dateReview, /no filing date is stamped/)
  assert.equal(d.rendered, undefined)

  const stamped = await draftItem({ ...item, text: `FILED 7/31/2026 6:29 PM\n${item.text}` }, claims, dctx(stub([prose])))
  takeWarnings()
  assert.equal(stamped.status, 'ready', JSON.stringify(stamped.attempts))
  assert.equal(stamped.entry.date, '2026-07-31', 'not 2024-09-23, a date the complaint describes')
  assert.match(stamped.date.basis, /stamped on the document/)
})

// --- dates: approvals ----------------------------------------------------------------------------

const NOTICE = 'pursuant to notice duly published on September 9, 2024 in the Daily Herald, the Village’s Plan Commission/Zoning Board of Appeals (the “PCZBA”) did conduct a public hearing on the proposed modification of the General Development Plan'
const APPROVES = 'the Village Board hereby approves the Third Amendment to SUP Agreement in substantially the form attached hereto as Exhibit B'
const FAQ = 'The approval of the data center campus was completed over an almost eight-month period between 9/23/2024 and 5/6/2025.'

test('approval date: a hearing or notice date does not date an approval; with no approval date the draft goes to a person', () => {
  const item = { published: '2025-05-06' }
  const claims = [
    claim({ claim_text: 'A public hearing on the proposed modification was conducted on September 9, 2024.', supporting_quotes: [NOTICE], event_date: '2024-09-09', date_basis: 'stated_in_text' }),
    claim({ claim_text: 'The Village Board approved the Third Amendment to the SUP Agreement.', supporting_quotes: [APPROVES] }),
  ]
  const f = fitDate('Village of Grayslake approves T5@CHICAGO IV Campus Plan', { date: '2024-09-09', basis: 'event date stated in the quotes' }, claims, item)
  assert.equal(f.date, null)
  assert.match(f.review, /no quote gives a date for the approval itself/)
})

test('approval date: a date a quote gives for the approval itself is used', () => {
  const claims = [
    claim({ claim_text: 'The approval of the data center campus was completed between September 23, 2024, and May 6, 2025.', supporting_quotes: [FAQ], event_date: '2025-05-06', date_basis: 'stated_in_text' }),
    claim({ claim_text: 'A public hearing was conducted on September 9, 2024.', supporting_quotes: [NOTICE], event_date: '2024-09-09', date_basis: 'stated_in_text' }),
  ]
  const kept = fitDate('Village of Grayslake authorizes T5 data center campus', { date: '2025-05-06', basis: 'x' }, claims, { published: '2026-06-05' })
  assert.equal(kept.date, '2025-05-06')
  const moved = fitDate('Village of Grayslake authorizes T5 data center campus', { date: '2024-09-09', basis: 'x' }, claims, { published: '2026-06-05' })
  assert.equal(moved.date, '2025-05-06', 'the hearing date is replaced by the approval date')
  const unquoted = [claim({ claim_text: 'The Board approved the campus on May 6, 2025.', supporting_quotes: ['the Board approved the campus'], event_date: '2025-05-06', date_basis: 'stated_in_text' })]
  assert.equal(fitDate('Board approves campus', { date: '2025-05-06', basis: 'x' }, unquoted, { published: '2026-06-05' }).date, null, 'the date must be in a quote, not only in the model\'s claim')
})

// --- dates: the document itself ---------------------------------------------------------------

test('statement date: "issues statement" is dated by the statement, not by an earlier event it mentions', async () => {
  const money = 'Mundelein does not get any money or revenue from the Grayslake T5 Data Center project.'
  const post = 'The Village (Mayor Meier) shared information from Grayslake in a social media post on November 19, 2025.'
  const item = { id: 'm', title: 'Information related to the Grayslake T5 data center', url: 'https://www.mundelein.org/m/newsflash/Home/Detail/230', published: '2026-06-02', registryId: 'mundelein', registryTier: 1, effectiveTier: 1, publisher: 'Village of Mundelein', party: null, guardCfg: gcfg }
  const claims = [
    claim({ claim_text: 'The Village of Mundelein does not receive any money or revenue from the project.', supporting_quotes: [money] }),
    claim({ claim_text: 'Mayor Meier shared information from Grayslake in a social media post on November 19, 2025.', supporting_quotes: [post], event_date: '2025-11-19', date_basis: 'stated_in_text' }),
  ]
  const prose = { title: 'Village of Mundelein issues statement on Grayslake T5 project', description: 'The Village of Mundelein stated that it “does not get any money or revenue from the Grayslake T5 Data Center project.”', category: 'policy' }
  const d = await draftItem(item, claims, dctx(stub([prose])))
  takeWarnings()
  assert.equal(titleEvent(prose.title), 'publication')
  assert.equal(d.status, 'ready', JSON.stringify(d.attempts))
  assert.equal(d.entry.date, '2026-06-02', 'not November 19, 2025')
  // The old draft put "Drafted by the pipeline: state the outcome ..." in actions.js.
  assert.equal(d.rendered.action, null)
  assert.match(d.actionFlag.note, /Village of Mundelein action/)
  assert.deepEqual(findPlaceholders(Object.values(d.rendered).filter(Boolean).join('\n')), [])
})

// --- placeholders -------------------------------------------------------------------------------------

test('placeholders: the old actions.js outcome and other fill-ins are caught; source wording such as "TBD" is not', () => {
  const old = '+    outcome: "Drafted by the pipeline: state the outcome after checking the record.",'
  assert.ok(findPlaceholders(old).length >= 1)
  for (const s of ['TODO: confirm the vote', 'The vote was [insert count].', 'Lorem ipsum', 'Approved on {{date}}', '<fill in outcome>']) assert.ok(findPlaceholders(s).length, s)
  for (const s of ['Hearing date TBD', 'Pipeline draft. Nothing publishes unless you merge this.', 'The outcome was approved 6-0.']) assert.deepEqual(findPlaceholders(s), [], s)
  assert.equal(addedLines('--- a/x\n+++ b/x\n context TODO\n+added line'), 'added line', 'context lines and headers are not added text')
})

test('placeholders: a draft whose rendered text holds one fails the guard and is not ready', async () => {
  const quote = 'On September 8, 2026, the Lake County Board approved an ordinance establishing a moratorium on new data center approvals, set to expire May 11, 2027.'
  const item = { id: 'p', title: 'Moratorium', url: 'https://www.lakecountyil.gov/m/newsflash/Home/Detail/9999', published: '2026-09-08', registryId: 'lake-county', registryTier: 1, effectiveTier: 1, publisher: 'Lake County, Illinois', party: null, guardCfg: gcfg }
  const claims = [claim({ claim_text: 'On September 8, 2026, the Board approved a moratorium set to expire May 11, 2027.', supporting_quotes: [quote], event_date: '2026-09-08', date_basis: 'stated_in_text' })]
  const prose = { title: 'County Board approves data center moratorium', description: 'The County Board approved a moratorium on new data center approvals, “set to expire May 11, 2027.” [Insert vote count.]', category: 'policy' }
  const d = await draftItem(item, claims, dctx(stub([prose])))
  takeWarnings()
  assert.equal(d.status, 'invalid')
  assert.equal(d.guard, 'fail')
  assert.equal(d.placeholders[0].check, 'placeholder')
})

// --- already covered ---------------------------------------------------------------------------------

test('already covered: entries citing a source are found in timeline.js and actions.js', () => {
  const e = entriesCiting('villagefaq_archived', timelineEvents, actions)
  assert.ok(e.some(x => x.file === 'src/data/timeline.js' && x.date === '2025-05-06'))
  assert.ok(e.some(x => x.file === 'src/data/actions.js' && x.title === 'grayslake-approval-2025'))
  assert.deepEqual(entriesCiting('noSuchSource', timelineEvents, actions), [])
  assert.deepEqual(entriesCiting(null, timelineEvents, actions), [])
})

test('already covered: a claim is covered only when its figures and most of its words are in the entry', () => {
  const entry = entriesCiting('villagefaq_archived', timelineEvents, actions).map(e => e.text).join('\n')
  assert.ok(claimCovered({ claim_text: 'The approval of the data center campus was completed between 9/23/2024 and 5/6/2025.' }, entry))
  assert.ok(!claimCovered({ claim_text: 'The approved development agreements do not provide for any financial incentives.' }, entry), 'not in the entry')
  assert.ok(!claimCovered({ claim_text: 'The approval was completed between 9/23/2024 and 6/1/2025.' }, entry), 'a date the entry lacks')
})

const MUNDELEIN = 'https://www.mundelein.org/m/newsflash/Home/Detail/230'
const DEFENSIBLE = 'We (Mundelein) currently do not have any defensible argument against the Grayslake data center.'
const INCENTIVE = 'Mundelein does not get any money or revenue from the Grayslake T5 Data Center project.'
function mundeleinItem() {
  const hit = lookup(registry, MUNDELEIN)
  return { origin: 'shadow', id: 'mundelein:230', title: 'Information related to the Grayslake T5 data center', url: MUNDELEIN, text: `Grayslake data center. ${DEFENSIBLE} ${INCENTIVE}`, kind: 'html', published: '2026-06-02', registryHit: hit, registryId: hit.id, registryTier: hit.tier, publisher: hit.name }
}
const extraction = claims => ({ document: { doc_type: 'press_release', published_date: null, byline: [], is_about_t5_grayslake: 'yes', origin: 'originates', repeats_whom: null }, claims })
const stageCtx = provider => ({ cfg, rubric, gcfg, provider, triage: makeTriage(cfg.triage, []).triage, flagCtx: loadFlagContext(), sources, timelineEvents, actions, runId: 't', today: '2026-10-07' })
const covered = { claim_text: 'The Village of Mundelein does not have a defensible argument against the Grayslake data center.', claim_type: 'opinion', speaker: 'Village of Mundelein', attribution: 'named', event_date: null, date_basis: 'unknown', supporting_quotes: [DEFENSIBLE], timeline_category: 'policy' }
const lacking = { claim_text: 'The Village of Mundelein receives no money or revenue from the T5 project.', claim_type: 'fact', speaker: null, attribution: 'document', event_date: null, date_basis: 'unknown', supporting_quotes: [INCENTIVE], timeline_category: 'policy' }

test('already covered: a source with an entry and nothing new gets a note, no draft and no PR', async () => {
  const r = await processItems([mundeleinItem()], stageCtx(stub([extraction([covered])])))
  takeWarnings()
  assert.equal(r.drafts.length, 0)
  assert.equal(r.covered.length, 1)
  assert.equal(r.covered[0].sourceKey, 'mundeleindata')
  assert.deepEqual(r.covered[0].lacking, [])
  assert.equal(r.covered[0].entries[0].date, '2026-06-02')
})

test('already covered: only the claims the entry lacks are drafted, and the PR says so', async () => {
  const prose = { title: 'Village of Mundelein issues statement on Grayslake T5 project', description: 'The Village of Mundelein stated that it “does not get any money or revenue from the Grayslake T5 Data Center project.”', category: 'policy' }
  const r = await processItems([mundeleinItem()], stageCtx(stub([extraction([covered, lacking]), prose])))
  takeWarnings()
  assert.deepEqual(r.covered[0].lacking, [lacking.claim_text])
  assert.equal(r.drafts.length, 1)
  const d = r.drafts[0]
  assert.deepEqual(d.claims.map(c => c.claim_text), [lacking.claim_text], 'the covered claim is not drafted')
  assert.equal(d.status, 'ready', JSON.stringify(d.attempts))
  const pr = buildPr(d, { today: '2026-10-07' })
  // Since the Oct. 7 review: a change to the existing entry, not a second one.
  assert.match(pr.body, /### Changes an existing entry/)
  assert.match(pr.body, /2026-06-02 “Village of Mundelein publishes statement on T5 development”/)
  assert.match(pr.body, /Made from 1 claim\(s\) the existing entries lack \(at most 5 per PR; 1 already covered\)/)
})

// --- ordinance clauses ---------------------------------------------------------------------------------

test('ordinance clauses: "shall" in an official record is a provision, not a projection', () => {
  const clause = { claim_type: 'projection', claim_text: 'The Campus Plan will serve as the new General Development Plan.', supporting_quotes: ['The Campus Plan shall be the new General Development Plan for the Subject Property only and shall replace the plan for the Subject Property as reflected in the Updated Land Use Plan.'] }
  const [c] = relabelClauseProjections([clause], { officialRecord: true })
  assert.equal(c.claim_type, 'fact')
  assert.equal(c.provision, true)
  assert.equal(c.relabeled.from, 'projection')
  assert.match(instructionFor(c, { publisher: 'Village of Grayslake' }), /ORDINANCE PROVISION/)
  assert.ok(!/PROJECTION/.test(instructionFor(c, { publisher: 'Village of Grayslake' })))
})

test('ordinance clauses: a clause that projects, a speaker\'s "will", and non-records stay projections', () => {
  const projects = { claim_type: 'projection', claim_text: 'The campus is expected to use 50,000 gallons per day.', supporting_quotes: ['The Developer shall report usage, which is expected to be no more than 50,000 gallons per day.'] }
  const speaker = { claim_type: 'projection', claim_text: 'The campus will bring 1,500 jobs.', supporting_quotes: ['Trustee Smith said the campus will bring 1,500 jobs.'] }
  const shall = { claim_type: 'projection', claim_text: 'The plan shall govern.', supporting_quotes: ['The Campus Plan shall be the new General Development Plan.'] }
  assert.equal(relabelClauseProjections([projects], { officialRecord: true })[0].claim_type, 'projection')
  assert.equal(relabelClauseProjections([speaker], { officialRecord: true })[0].claim_type, 'projection')
  assert.equal(relabelClauseProjections([shall], { officialRecord: false })[0].claim_type, 'projection', 'a news story quoting "shall" is not an ordinance')
})
