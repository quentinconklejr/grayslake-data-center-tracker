// Fixes from the review of the Oct. 7 shadow run: speaker attribution,
// changes to existing entries instead of second entries, and dates taken from
// the page rather than the feed. No network, no model.
// Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { loadFlagContext } from '../lib/flags.mjs'
import { speakerFailures } from '../lib/guard.mjs'
import { draftItem } from '../lib/draft.mjs'
import { processItems, fromShadow, isMilestone, targetEntry } from '../lib/stage-c.mjs'
import { editDescription, applySnippets } from '../lib/render.mjs'
import { buildPr, makeDiff } from '../lib/pr.mjs'
import { pagePostedDate } from '../lib/fetchers/common.mjs'
import newsflash from '../lib/fetchers/village-newsflash.mjs'
import { runFetchers } from '../lib/runner.mjs'
import { openStore } from '../lib/store.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'
import { actions } from '../../src/data/actions.js'

const cfg = loadPipelineConfig()
const rubric = loadRubric()
const gcfg = guardConfig(rubric)
const registry = loadRegistry()
const quietly = async fn => { const w = console.warn; console.warn = () => {}; try { return await fn() } finally { console.warn = w; takeWarnings() } }
const stub = responses => {
  let i = 0
  return { model: 'stub', budgetChars: () => 20000, async generateJSON() { return { content: JSON.stringify(responses[Math.min(i++, responses.length - 1)]), usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] } } }
}

// The Mundelein statement as published (June 2, 2026), in the lines that matter.
const MUNDELEIN_TEXT = [
  'Posted on June 02, 2026 | Last Updated on June 02, 2026',
  'Information related to the Grayslake T5 data center from Mayor Robin D. Meier.',
  'Mundelein does not get any money or revenue from the Grayslake T5 Data Center project.',
  'The Village of Mundelein found out about this project after it was approved, permits issued, and construction started.',
  'The Village (Mayor Meier) shared information from Grayslake in a social media post on November 19, 2025.',
  'This data center is 100 percent within the boundaries of the Village of Grayslake.',
  'Mundelein does not have any jurisdiction in decisions, does not receive any money and/or tax dollars from this project, or have any input into what legally happens in the Grayslake municipality.',
  'There may be several taxing bodies outside of Grayslake and Mundelein that may have the potential of receiving monies from the data center tax roles or other.',
].join('\n')
const JURISDICTION = 'Mundelein does not have any jurisdiction in decisions, does not receive any money and/or tax dollars from this project, or have any input into what legally happens in the Grayslake municipality.'
const POST = 'The Village (Mayor Meier) shared information from Grayslake in a social media post on November 19, 2025.'

// --- 1. speaker attribution ----------------------------------------------------------------------

test('speaker: the Village\'s own sentence may not be given to the Mayor\'s social media post', () => {
  const bad = 'Mayor Meier shared information from Grayslake in a social media post on November 19, 2025, noting that the Village “does not have any jurisdiction in decisions, does not receive any money and/or tax dollars from this project.”'
  const f = speakerFailures(bad, MUNDELEIN_TEXT, gcfg, { publisher: 'Village of Mundelein' })
  assert.equal(f.length, 1)
  assert.equal(f[0].check, 'speaker')
  assert.match(f[0].reason, /attribute it to Village of Mundelein/)
  assert.match(f[0].value, /^Mayor Meier: “does not have any jurisdiction/)
})

test('speaker: the publisher may say it; the Mayor may be named where the source names him', () => {
  const good = 'Mayor Meier shared information from Grayslake in a social media post on November 19, 2025. The Village of Mundelein stated that it “does not have any jurisdiction in decisions.”'
  assert.deepEqual(speakerFailures(good, MUNDELEIN_TEXT, gcfg, {}), [])
  // A quotation from the sentence that names him, or the one beside it, may be his.
  assert.deepEqual(speakerFailures('Mayor Meier said the Village “found out about this project after it was approved.”', MUNDELEIN_TEXT, gcfg, {}), [])
})

test('speaker: unquoted sentences are matched to the closest source sentence; claim speakers count as people', () => {
  assert.equal(speakerFailures('Mayor Meier stated that the data center is entirely within Grayslake\'s boundaries and that Mundelein has no taxing role.', MUNDELEIN_TEXT, gcfg, {}).length, 1)
  assert.equal(speakerFailures('Robin Meier stated that Mundelein has no jurisdiction in the decisions.', MUNDELEIN_TEXT, gcfg, { people: ['Robin D. Meier'] }).length, 1)
  assert.deepEqual(speakerFailures('The Village stated that Mundelein has no jurisdiction in the decisions.', MUNDELEIN_TEXT, gcfg, { people: ['Robin D. Meier'] }), [], 'no person named, nothing to check')
})

test('speaker: a draft that misattributes is retried and passes only when attributed to the publisher', async () => {
  const item = { id: 'm', title: 'Information related to the Grayslake T5 data center', url: 'https://www.mundelein.org/m/newsflash/Home/Detail/230', published: '2026-06-02', text: MUNDELEIN_TEXT, registryId: 'mundelein', registryTier: 1, effectiveTier: 1, publisher: 'Village of Mundelein', party: null, guardCfg: gcfg }
  const claims = [
    { claim_text: 'Mundelein has no jurisdiction in decisions about the project.', claim_type: 'fact', speaker: null, outcome: 'draft_as_fact', guardMatch: ['exact'], supporting_quotes: [JURISDICTION], event_date: null, date_basis: 'unknown' },
    { claim_text: 'Mayor Meier shared information in a social media post on November 19, 2025.', claim_type: 'fact', speaker: null, outcome: 'draft_as_fact', guardMatch: ['exact'], supporting_quotes: [POST], event_date: '2025-11-19', date_basis: 'stated_in_text' },
  ]
  const ctx = provider => ({ provider, examples: [], sources, cited: new Map(), blockedTerms: [], labeledTerms: [], today: '2026-10-07', canonUrl: u => u })
  const bad = { title: 'Village of Mundelein issues statement on Grayslake T5 project', description: 'Mayor Meier shared information from Grayslake in a social media post on November 19, 2025, noting that Mundelein “does not have any jurisdiction in decisions.”', category: 'policy' }
  const good = { ...bad, description: 'The Village of Mundelein stated that it “does not have any jurisdiction in decisions.” Mayor Meier shared information from Grayslake in a social media post on November 19, 2025.' }
  const d = await draftItem(item, claims, ctx(stub([bad, good])))
  takeWarnings()
  assert.ok(d.attempts[0].failures.some(f => f.check === 'speaker'))
  assert.equal(d.status, 'ready', JSON.stringify(d.attempts))
  const never = await draftItem(item, claims, ctx(stub([bad, bad])))
  assert.equal(never.status, 'claims_only')
})

// --- 2. existing entries --------------------------------------------------------------------------

const MUNDELEIN_URL = 'https://www.mundelein.org/m/newsflash/Home/Detail/230'
const extraction = claims => ({ document: { doc_type: 'press_release', published_date: null, byline: [], is_about_t5_grayslake: 'yes', origin: 'originates', repeats_whom: null }, claims })
const stageCtx = provider => ({ cfg, rubric, gcfg, provider, triage: makeTriage(cfg.triage, []).triage, flagCtx: loadFlagContext(), sources, timelineEvents, actions, runId: 't', today: '2026-10-07' })
const fact = (text, quote) => ({ claim_text: text, claim_type: 'fact', speaker: null, attribution: 'document', event_date: null, date_basis: 'unknown', supporting_quotes: [quote], timeline_category: 'policy' })
function mundeleinItem() {
  const hit = lookup(registry, MUNDELEIN_URL)
  return { origin: 'shadow', id: 'mundelein:230', title: 'Information related to the Grayslake T5 data center', url: MUNDELEIN_URL, text: `Grayslake data center.\n${MUNDELEIN_TEXT}`, kind: 'html', published: '2026-06-02', registryHit: hit, registryId: hit.id, registryTier: hit.tier, publisher: hit.name }
}
const FOUND_OUT = 'The Village of Mundelein found out about this project after it was approved, permits issued, and construction started.'
const ADDITION = { title: 'Village of Mundelein statement', description: 'The Village of Mundelein stated that it “found out about this project after it was approved, permits issued, and construction started.”', category: 'policy' }

test('existing entry: the draft changes that entry, never adds a second one, and the PR says so', async () => {
  const before = timelineEvents.length
  const r = await processItems([mundeleinItem()], stageCtx(stub([extraction([fact('Mundelein learned of the project after permits were issued and construction started.', FOUND_OUT)]), ADDITION])))
  takeWarnings()
  const d = r.drafts[0]
  assert.equal(d.status, 'ready', JSON.stringify({ a: d.attempts, v: d.validation }))
  assert.equal(d.rendered.timeline, null, 'no new timeline entry')
  assert.equal(d.rendered.source, null, 'no new source')
  assert.equal(d.amend.title, 'Village of Mundelein publishes statement on T5 development')
  assert.equal(d.entry.date, '2026-06-02')
  assert.match(d.entry.description, /^The Village of Mundelein published information .* The Village of Mundelein stated that it “found out about this project after it was approved, permits issued, and construction started\.”$/)

  const pr = buildPr(d, { today: '2026-10-07' })
  assert.equal(pr.title, 'Draft: add to “Village of Mundelein publishes statement on T5 development”')
  assert.match(pr.body, /### Changes an existing entry/)
  assert.match(pr.body, /changes that entry and adds no new one/)
  assert.ok(!pr.labels.includes('possible-duplicate'))

  const files = applySnippets(d.rendered)
  const { timelineEvents: after } = await import(`data:text/javascript,${encodeURIComponent(files['timeline.js'])}`)
  assert.equal(after.length, before, 'the number of timeline entries is unchanged')
  assert.equal(after.filter(e => e.sourceKey === 'mundeleindata').length, 1)
  const diff = makeDiff(d, cfg.job.site_repo.data_dir)
  assert.match(diff, /^-.*The Village of Mundelein published information stating it has no defensible legal basis/m, 'the old description line is replaced')
  assert.ok(!/^\+\s+date:/m.test(diff.split('updates.js')[0]), 'no date line added to timeline.js')
})

test('existing entry: only the appended description is checked; the unused title cannot fail the draft', async () => {
  // The title names the Mayor where the source does not; it is never published.
  const titled = { ...ADDITION, title: 'Mayor Meier says Mundelein has no jurisdiction in decisions' }
  const r = await processItems([mundeleinItem()], stageCtx(stub([extraction([fact('Mundelein learned of the project after permits were issued and construction started.', FOUND_OUT)]), titled])))
  takeWarnings()
  assert.equal(r.drafts[0].status, 'ready', JSON.stringify(r.drafts[0].attempts))
  assert.ok(!/Mayor Meier says/.test(applySnippets(r.drafts[0].rendered)['timeline.js']))
})

test('existing entry: at most 5 claims per PR; the rest are listed, not drafted', async () => {
  const lines = MUNDELEIN_TEXT.split('\n').slice(2)
  const tags = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf']
  const many = lines.map((q, i) => fact(`Claim ${tags[i]} from the statement, on the Mundelein position regarding the Grayslake campus.`, q))
  const r = await processItems([mundeleinItem()], stageCtx(stub([extraction(many), ADDITION])))
  takeWarnings()
  assert.ok(many.length > 5)
  assert.equal(r.drafts[0].claims.length, 5)
  assert.equal(r.drafts[0].extraClaims.length, r.covered[0].lacking.length - 5)
})

test('existing entry: an edit lands on exactly one entry, or fails validation', () => {
  const text = 'export const timelineEvents = [\n  {\n    date: "2026-06-02",\n    title: "A",\n    description: "old",\n    category: "policy",\n  },\n];\n'
  assert.match(editDescription(text, 'title', 'A', 'new “x”'), /description:\n {6}"new \\u201cx\\u201d",/)
  assert.throws(() => editDescription(text, 'title', 'B', 'new'), /not found exactly once/)
  assert.throws(() => applySnippets({ timeline: '  {},', timelineEdit: { title: 'A', description: 'x' } }), /never adds a second entry/)
})

test('existing entry: the target is the entry citing only this source, else the nearest in date; timeline before actions', () => {
  const e = (file, date, title, entry) => ({ file, date, title, entry: { date, title, ...entry } })
  const sole = e('src/data/timeline.js', '2026-06-05', 'sole', { sourceKey: 'k' })
  const shared = e('src/data/timeline.js', '2025-05-06', 'shared', { sourceKeys: ['k', 'x'] })
  const act = e('src/data/actions.js', '2026-06-01', 'act', { id: 'act' })
  assert.equal(targetEntry([shared, sole, act], '2025-05-01').title, 'sole')
  const shared2 = e('src/data/timeline.js', '2024-05-02', 'older', { sourceKeys: ['k', 'y'] })
  assert.equal(targetEntry([shared, shared2], '2025-04-01').title, 'shared')
  assert.equal(targetEntry([act], '2026-06-01').title, 'act')
})

test('court filing: only a new filing, hearing date, ruling or order is a milestone', () => {
  const p = (t, extra = {}) => ({ claim_type: 'procedural', claim_text: t, ...extra })
  assert.ok(isMilestone(p('A status hearing is set for November 12, 2026 in Courtroom 203.')))
  assert.ok(isMilestone(p('The court entered an order granting the motion to dismiss on October 20, 2026.')))
  assert.ok(!isMilestone({ claim_type: 'allegation', claim_text: 'Plaintiffs allege the hearing on September 9, 2024 lasted one minute.' }), 'an allegation is never a milestone')
  assert.ok(!isMilestone(p('The case was assigned to the chancery division.')), 'no date')
})

const COMPLAINT_TEXT = 'FILED 7/31/2026 6:29 PM\nCOMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF\nPlaintiffs, Preservation of Community Well-being Collective LLC, for their Complaint against Defendants T5 Data Centers, LLC state as follows:\nThe campus will require backup generation capacity in the range of 1.5 to 2 gigawatts of stationary diesel engines.\nA status hearing is set for November 12, 2026 at 9:00 a.m. in Courtroom 203.'
function complaintItem() {
  return { origin: 'corpus', id: 'corpus:complaint2026', sourceKey: 'complaint2026', title: 'Complaint', url: '/docs/t5-grayslake-complaint-2026ch00000171.pdf', text: COMPLAINT_TEXT, kind: 'html', published: '2026-07-31', registryHit: lookup(registry, '/docs/x.pdf'), registryId: 'tracker-mirror', registryTier: 1, registryCategory: 'court', publisher: 'Circuit Court of the 19th Judicial Circuit, Lake County, Illinois, Chancery Division' }
}
const allegation = { claim_text: 'The campus will require backup generation capacity of 1.5 to 2 gigawatts.', claim_type: 'fact', speaker: null, attribution: 'document', event_date: null, date_basis: 'unknown', supporting_quotes: ['The campus will require backup generation capacity in the range of 1.5 to 2 gigawatts of stationary diesel engines.'], timeline_category: 'legal' }
const hearing = { claim_text: 'A status hearing is set for November 12, 2026 in Courtroom 203.', claim_type: 'procedural', speaker: null, attribution: 'document', event_date: '2026-11-12', date_basis: 'stated_in_text', supporting_quotes: ['A status hearing is set for November 12, 2026 at 9:00 a.m. in Courtroom 203.'], timeline_category: 'legal' }

test('court filing: claims the entry lacks but no milestone give only an "already covered" note', async () => {
  const r = await processItems([complaintItem()], stageCtx(stub([extraction([allegation])])))
  takeWarnings()
  assert.equal(r.drafts.length, 0)
  assert.equal(r.covered[0].court, true)
  assert.deepEqual(r.covered[0].lacking, [])
  assert.equal(r.covered[0].notMilestones.length, 1)
})

test('court filing: a new hearing date is drafted as a change to the existing lawsuit entry', async () => {
  const add = { title: 'Status hearing set', description: 'A status hearing is set for November 12, 2026, according to the complaint.', category: 'legal' }
  const r = await processItems([complaintItem()], stageCtx(stub([extraction([allegation, hearing]), add])))
  takeWarnings()
  assert.equal(r.drafts.length, 1)
  const d = r.drafts[0]
  assert.deepEqual(d.claims.map(c => c.claim_text), [hearing.claim_text], 'only the milestone, not the allegation')
  assert.ok(d.amend, 'a change to the existing entry')
  assert.equal(d.rendered.timeline, null)
})

// --- 3. dates from the page ------------------------------------------------------------------------

test('page date: News Flash "Posted on" wins over the feed; Related News dates are not the page\'s', () => {
  const lincoln = 'News Flash\nGrayslake Heritage Center & Museum\nPosted on October 02, 2026\nIn continued celebration of our nation\'s 250th year.\nRelated News\nThe Cadillac of Fire Trucks\nPosted on October 06, 2026'
  assert.equal(pagePostedDate({ text: lincoln }), '2026-10-02')
  assert.equal(pagePostedDate({ text: 'Bob Lichter presents a history of Pirsch Fire Trucks.\nGrayslake Heritage Center & Museum\nPosted on October 06, 2026' }), '2026-10-06')
  assert.equal(pagePostedDate({ text: 'Related News\nPosted on May 05, 2026' }), null, 'only a Related News date: none of the page\'s own')
  assert.equal(pagePostedDate({ text: 'A PDF newsletter', meta: { published: '2026-09-29T10:00:00-05:00' } }), '2026-09-29')
  assert.equal(newsflash.pageDate, pagePostedDate)
})

function tempStore() {
  const dir = mkdtempSync(join(tmpdir(), 'store-'))
  mkdirSync(join(dir, '.git'))
  return openStore(dir)
}

test('page date: the first-run window and the stored date use the page, the feed date is kept aside', async () => {
  const store = tempStore()
  const now = new Date('2026-10-07T20:00:00Z')
  const pages = {
    'https://www.villageofgrayslake.com/CivicAlerts.aspx?aid=2057': 'Bob Lichter presents a history of Pirsch Fire Trucks.\nPosted on October 06, 2026',
    'https://www.villageofgrayslake.com/CivicAlerts.aspx?aid=1500': 'An old notice.\nPosted on March 03, 2026',
  }
  const fetcher = {
    name: 'village-newsflash', snapshot: 'never', sourceUrl: 'https://www.villageofgrayslake.com/', pageDate: pagePostedDate,
    async discover() {
      return { candidates: [
        // Feed says Sept 17 (outside the 14-day window); the page says Oct 6.
        { key: 'a', url: 'https://www.villageofgrayslake.com/CivicAlerts.aspx?aid=2057', title: 'The Cadillac of Fire Trucks', published: '2026-09-17T17:26:52.000Z' },
        // Feed says Oct 5 (inside); the page says March 3.
        { key: 'b', url: 'https://www.villageofgrayslake.com/CivicAlerts.aspx?aid=1500', title: 'Old notice', published: '2026-10-05T00:00:00.000Z' },
      ] }
    },
    async fetchItem(ctx, c) { return { kind: 'html', text: pages[c.url] } },
  }
  const run = await quietly(() => runFetchers({ fetchers: [fetcher], store, cfg, registry, sources: {}, http: null, wayback: null, now, snapshots: false }))
  const s = run.fetchers['village-newsflash']
  assert.equal(s.new, 1, 'the Oct. 6 page is inside the window')
  assert.equal(s.baselined, 1, 'the March 3 page is outside it, whatever the feed says')
  const item = store.readJson(s.items[0].path)
  assert.equal(item.published, '2026-10-06')
  assert.equal(item.meta.listedDate, '2026-09-17T17:26:52.000Z')
})

test('page date: items stored with the feed date are read with the page date in Stage C', () => {
  const stored = { id: 'village-newsflash:2118a4a5dd8a532e', fetcher: 'village-newsflash', url: 'https://www.villageofgrayslake.com/CivicAlerts.aspx?aid=2057', title: 'The Cadillac of Fire Trucks', published: '2026-09-17T17:26:52.000Z', kind: 'html', text: 'Bob Lichter presents a history of Pirsch Fire Trucks.\nGrayslake Heritage Center & Museum\nPosted on October 06, 2026', meta: { page: { published: null } } }
  assert.equal(fromShadow(stored, { registry, store: { path: p => p } }).published, '2026-10-06')
  const other = { ...stored, fetcher: 'lake-county-legistar', published: '2026-10-05T18:48:46Z', text: 'Posted on October 06, 2026' }
  assert.equal(fromShadow(other, { registry, store: { path: p => p } }).published, '2026-10-05', 'only fetchers that read a page date use one')
})
