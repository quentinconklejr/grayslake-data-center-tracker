// Owner decisions D-1 to D-5 (2026-10-01) and the triage terms taken from the
// site's own data. No network, no model. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'
import { detectParty, relabelClaims, isRecordFact, requiredAttribution } from '../lib/party.mjs'
import { makePrivacy } from '../lib/privacy.mjs'
import { leadNote } from '../lib/leads.mjs'
import { makeTriage, derivedTerms } from '../lib/triage.mjs'
import { processItems } from '../lib/stage-c.mjs'
import { draftItem, billTemplate } from '../lib/draft.mjs'
import { prepareSource, checkClaim, checkDraftProse } from '../lib/guard.mjs'
import { loadFlagContext } from '../lib/flags.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

const cfg = loadPipelineConfig()
const rubric = loadRubric()
const gcfg = guardConfig(rubric)
const reg = loadRegistry()
const fact = t => ({ claim_type: 'fact', claim_text: t, speaker: null, attribution: 'document', supporting_quotes: [t] })

// --- D-1: parties' own channels -------------------------------------------------------------

const NEWSLETTER = 'https://www.villageofgrayslake.com/DocumentCenter/View/16209/October-2026'

test('D-1: the Village is a party to the lawsuit; its own channels are party documents', () => {
  const p = detectParty({ url: NEWSLETTER, text: '' }, lookup(reg, NEWSLETTER))
  assert.deepEqual([p.kind, p.party, p.channel], ['party_statement', 'Village of Grayslake', 'litigation_party'])
  assert.equal(detectParty({ url: 'https://www.mundelein.org/x', text: '' }, lookup(reg, 'https://www.mundelein.org/x')), null, 'Mundelein is not a party')
})

test('D-1: the September newsletter\'s contested claims are attributed; record facts stay facts', () => {
  const party = detectParty({ url: NEWSLETTER, text: '' }, lookup(reg, NEWSLETTER))
  const claims = [
    fact('The data center campus complies with Village zoning and all local, state, and federal laws.'),
    fact('No Non-Disclosure Agreements were signed by the Village during the project process.'),
    fact('No local property tax breaks or incentives were granted for the project.'),
    fact('T5 has begun construction on its new data center campus in the Cornerstone Business Park.'),
    fact('The facility utilizes a closed-loop cooling system with recycled water to keep municipal water consumption minimal.'),
    { ...fact('Once operational, the data center will become the largest single property taxpayer.'), claim_type: 'projection' },
    fact('The Village issued the first building permit on September 1, 2026.'),
    fact('The Village Board voted 6-0 to approve the ordinance.'),
  ]
  const out = relabelClaims(claims, party, { officialRecord: false })
  assert.deepEqual(out.map(c => c.claim_type), ['party_statement', 'party_statement', 'party_statement', 'party_statement', 'party_statement', 'party_statement', 'fact', 'fact'])
  assert.ok(out.slice(0, 6).every(c => c.speaker === 'Village of Grayslake'))
})

test('D-1: numbers stay facts only in an official record', () => {
  const c = fact('The ordinance caps total gross floor area at 2,570,000 square feet.')
  assert.equal(isRecordFact(c, { officialRecord: true }), true)
  assert.equal(isRecordFact(c, { officialRecord: false }), false, 'the same sentence in a press release is the Village\'s claim')
  assert.equal(isRecordFact(fact('The Village issued an 800,000-square-foot building permit.'), { officialRecord: false }), false)
})

test('D-1: a Village draft stated in the site\'s voice fails the guard; "the Village stated" passes', () => {
  const s = prepareSource('The data center campus complies with Village zoning and all local, state, and federal laws.', gcfg)
  const req = requiredAttribution({ kind: 'party_statement', party: 'Village of Grayslake' })
  assert.ok(checkDraftProse('The campus complies with Village zoning.', gcfg, { evidence: [s], requiredAttribution: req }).failures.some(f => f.check === 'attribution'))
  assert.equal(checkDraftProse('The Village stated that the campus complies with Village zoning.', gcfg, { evidence: [s], requiredAttribution: req }).ok, true)
})

// --- D-2: privacy ---------------------------------------------------------------------------

const privacy = makePrivacy(cfg.privacy)

test('D-2: private names and health, address and family details fail; officials and the caption pass', () => {
  const fails = t => privacy.check(t).failures.map(f => f.reason)
  assert.ok(fails('Suzanne P. Williams alleges harm to her private well.').includes('possible private individual named'))
  assert.ok(fails('A plaintiff has a pre-existing bronchial health condition.').includes('health or medical detail'))
  assert.ok(fails('A plaintiff lives at 123 Oak Street.').includes('address'))
  assert.ok(fails('A plaintiff and her children live near the site.').includes('family detail'))
  assert.deepEqual(fails('A plaintiff alleges the approvals were unlawful.'), [])
  assert.deepEqual(fails('Mayor Elizabeth Davies said the permit was issued.'), [])
  assert.deepEqual(fails('Trustee Sahu voted aye.'), [])
  assert.deepEqual(fails(`${cfg.privacy.case_captions[0]} was filed July 31, 2026.`), [])
  assert.deepEqual(fails('The plan allows single-family lots and sets conditions of approval for wastewater treatment.'), [], 'zoning words are not personal details')
})

test('D-2: a draft that trips the check goes to human review, not to a PR', async () => {
  const quote = 'Plaintiff Suzanne P. Williams alleges the campus will injure the water supply serving the community.'
  const item = { id: 'corpus:complaint2026', title: 'Complaint', url: '/docs/x.pdf', published: '2026-07-31', registryId: 'tracker-mirror', registryTier: 1, effectiveTier: 1, publisher: 'Circuit Court of the 19th Judicial Circuit', party: { kind: 'court_filing', party: 'the plaintiffs' }, guardCfg: gcfg }
  const claims = [{ claim_text: 'The complaint alleges the campus will injure the water supply.', claim_type: 'allegation', speaker: 'the plaintiffs', outcome: 'draft_attributed', supporting_quotes: [quote], event_date: null, date_basis: 'unknown', guardMatch: ['exact'] }]
  const provider = { async generateJSON() { return { content: JSON.stringify({ title: 'Complaint alleges harm to water supply', description: 'The complaint alleges that Suzanne P. Williams will be harmed because the campus will “injure the water supply.”', category: 'legal' }), usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] } } }
  const d = await draftItem(item, claims, { provider, examples: [], sources, cited: new Map(), blockedTerms: [], today: '2026-10-01', canonUrl: u => u, privacy })
  takeWarnings()
  assert.equal(d.status, 'human_review')
  assert.ok(d.privacy.some(f => f.value === 'Suzanne P. Williams'))
  assert.equal(d.rendered, undefined, 'nothing is rendered for a PR')
})

// The synopsis on the ilga.gov bill status pages for HB5513 and SB4016
// (identical on both), as fetched for the corpus.
const SYNOPSIS = 'Amends the Environmental Protection Act, Energy Efficient Building Act, Illinois Power Agency Act, Public Utilities Act, and related statutes to establish comprehensive environmental, water, and energy regulations for hyperscale data centers. In the Environmental Protection Act, requires cumulative impact assessments, public notice, and community benefits agreements for data centers; prohibits nondisclosure agreements; and creates the Data Center Community Intervenor Compensation Fund and Hyperscale Data Center Public Benefits and Affordability Fund funded by annual fees based on peak demand. Mandates water resource planning, quarterly water usage reporting, water scarcity plans, and Water Impact Permits with public hearings and renewal every 5 years. Requires compliance with stringent energy codes and annual energy and water reporting to the Illinois Commerce Commission. Expands renewable energy procurement programs, establishes a hyperscale data center self-direct program, and strengthens equity, transparency, and labor standards in clean energy initiatives. Creates the Residential Automated Solar Permitting Platform Act to require municipalities and counties to adopt a residential automated solar permitting platform on or before July 1, 2027, and authorizes persons to file a civil action against a municipality or county in violation.'

test('D-2: names of funds, laws and bodies in the HB5513 / SB4016 synopsis are not people', () => {
  assert.deepEqual(privacy.check(SYNOPSIS).failures, [])
  // The two drafts held for human review in the Oct. 7 shadow run.
  const hb = 'The Illinois General Assembly plans to include requirements in the Environmental Protection Act for “cumulative impact assessments, public notice, and community benefits agreements for data centers.” The assembly also plans to create the “Data Center Community Intervenor Compensation Fund and Hyperscale Data Center Public Benefits and Affordability Fund” which would be “funded by annual fees based on peak demand.”'
  const sb = 'The bill “Creates the Residential Automated Solar Permitting Platform Act to require municipalities and counties to adopt a residential automated solar permitting platform on or before July 1, 2027.”'
  assert.deepEqual(privacy.check(hb).failures, [])
  assert.deepEqual(privacy.check(sb).failures, [])
})

test('D-2: names after a title or a party label, and names merely near a body, are still flagged', () => {
  const values = t => privacy.check(t).failures.map(f => f.value)
  assert.deepEqual(values('The letter was signed by Mr. Harold Fund.'), ['Harold Fund'], 'after a title, "Fund" is a surname')
  assert.deepEqual(values('Plaintiff Mary Anne Fund lives nearby.'), ['Mary Anne Fund'], 'a party in a court filing')
  assert.deepEqual(values('The plaintiff, Mary Anne Fund, lives nearby.'), ['Mary Anne Fund'])
  // Before this check, a capitalised party label hid the name after it.
  assert.deepEqual(values('Plaintiff Mary Anne Fortmann lives nearby.'), ['Mary Anne Fortmann'])
  assert.deepEqual(values('Plaintiffs Suzanne P. Williams and Robin A. Weller allege harm.'), ['Suzanne P. Williams', 'Robin A. Weller'])
  assert.deepEqual(values('John Smith of the Lake County Board spoke.'), ['John Smith'], 'only adjacent words make a body\'s name')
  assert.deepEqual(values('Suzanne P. Williams, Robin A. Weller and Gavin Rychener filed the complaint.'), ['Suzanne P. Williams', 'Robin A. Weller', 'Gavin Rychener'])
})

test('D-2: claims carrying health details never reach drafting', () => {
  assert.equal(privacy.sensitiveClaim({ claim_text: 'A plaintiff has a pre-existing bronchial health condition.', supporting_quotes: [] }), true)
  assert.equal(privacy.sensitiveClaim({ claim_text: 'The approvals were obtained through deficient hearings.', supporting_quotes: ['obtained through procedurally deficient hearings'] }), false)
})

// --- D-3: FOIA packet -------------------------------------------------------------------------

const stub = { model: 'stub', budgetChars: () => 20000, async generateJSON() { throw new Error('the model must not be called') } }
const ctx = { cfg, rubric, gcfg, provider: stub, triage: makeTriage(cfg.triage, []).triage, flagCtx: loadFlagContext(), sources, timelineEvents, runId: 't', today: '2026-10-01' }

test('D-3: the FOIA records packet is never drafted; it is flagged for a manual records.js edit', async () => {
  const item = { origin: 'corpus', id: 'corpus:t5RecordsPacket2026', sourceKey: 't5RecordsPacket2026', title: 'T5@CHICAGO IV ordinances', url: '/records/t5', text: 'T5@CHICAGO IV '.repeat(50), kind: 'pdf', registryHit: lookup(reg, '/records/t5'), registryId: 'tracker-mirror', registryTier: 1, publisher: 'Village of Grayslake' }
  const r = await processItems([item], ctx)
  takeWarnings()
  assert.equal(r.drafts.length, 0)
  assert.match(r.humanReview[0].reason, /records\.js by hand/)
})

// --- D-4: bills -------------------------------------------------------------------------------------

test('D-4: only chamber passage, governor action and effective dates are significant', () => {
  const re = new RegExp(cfg.triage.significant_bill_actions, 'i')
  for (const a of ['Third Reading - Passed; 059-000-000', 'Passed Both Houses', 'Sent to the Governor', 'Governor Approved', 'Effective Date January 1, 2027', 'Public Act . . . . . . . . . 104-0001', 'Governor Vetoed']) assert.ok(re.test(a), a)
  for (const a of ['Added Co-Sponsor Rep. A', 'First Reading', 'Rule 19(a) / Re-referred to Rules Committee', 'Assigned to Executive Committee', 'Filed with the Clerk by Rep. Robyn Gabel']) assert.ok(!re.test(a), a)
})

test('D-4: a bill row is quoted whole under the lower record minimum, and a fragment is rejected', () => {
  const row = 'SB4016. 5/30/2027. Senate: Passed Both Houses'
  const s = prepareSource(row, gcfg)
  const whole = checkClaim({ claim_text: row, claim_type: 'procedural', supporting_quotes: [row], event_date: '2027-05-30', date_basis: 'stated_in_text' }, s, gcfg, { record: true })
  assert.deepEqual(whole.failures, [])
  const part = checkClaim({ claim_text: 'Passed Both Houses', claim_type: 'procedural', supporting_quotes: ['Senate: Passed Both Houses'], event_date: null, date_basis: 'unknown' }, s, gcfg, { record: true })
  assert.ok(part.failures.some(f => f.reason === 'record_quote_not_whole_row'))
  const short = 'SB4016. 5/30/2027. Senate: Vetoed'
  const ss = prepareSource(short, gcfg)
  assert.equal(checkClaim({ claim_text: short, claim_type: 'procedural', supporting_quotes: [short], event_date: null, date_basis: 'unknown' }, ss, gcfg).ok, false, 'without the record rule the normal minimum applies')
  assert.equal(checkClaim({ claim_text: short, claim_type: 'procedural', supporting_quotes: [short], event_date: null, date_basis: 'unknown' }, ss, gcfg, { record: true }).ok, true)
})

test('D-4: a bill milestone draft is a code template, quotes the action, names the bill by number only, and passes the guard', async () => {
  const row = 'SB4016. 5/30/2027. Senate: Passed Both Houses'
  const item = { id: 'ilga-bills:x', fetcher: 'ilga-bills', title: 'SB4016 5/30/2027 Senate: Passed Both Houses', url: 'https://www.ilga.gov/Legislation/BillStatus?DocTypeID=SB&DocNum=4016&GAID=18&SessionID=114', published: '2027-05-30', registryId: 'ilga', registryTier: 1, effectiveTier: 1, publisher: 'Illinois General Assembly', party: null, guardCfg: gcfg }
  const t = billTemplate(item)
  assert.equal(t.title, 'SB4016: Passed Both Houses')
  assert.match(t.description, /“Passed Both Houses”/)
  assert.ok(!/POWER Act/i.test(t.title + t.description))
  const claims = [{ claim_text: row, claim_type: 'procedural', speaker: null, outcome: 'draft_as_fact', supporting_quotes: [row], event_date: '2027-05-30', date_basis: 'stated_in_text', guardMatch: ['exact'] }]
  const d = await draftItem(item, claims, { provider: stub, examples: [], sources, cited: new Map(), blockedTerms: cfg.editorial.blocked_terms, today: '2027-05-31', canonUrl: u => u, privacy })
  takeWarnings()
  assert.equal(d.status, 'ready', JSON.stringify(d.attempts))
  assert.equal(d.attempts[0].template, true)
  assert.equal(d.entry.date, '2027-05-30')
})

// --- D-5: Tier 2 lead notes -------------------------------------------------------------------------

test('D-5: a Tier 2 article gets a lead note: outlet, headline, what it cites, which Tier 1 source to check', () => {
  const n = leadNote({ publisher: 'Daily Herald', title: 'Grayslake issues first building permit', url: 'https://www.dailyherald.com/x', published: '2026-09-01', byline: 'Mick Zawislak',
    text: 'According to the Village of Grayslake, the building permit was issued. The lawsuit set a status hearing. The ordinance passed.' }, [{ speaker: 'Mayor Elizabeth Davies' }])
  assert.equal(n.outlet, 'Daily Herald')
  assert.ok(n.cites.speakers.includes('Mayor Elizabeth Davies'))
  assert.ok(n.cites.accordingTo.includes('Village of Grayslake'))
  assert.ok(n.lookFor.some(s => /Agendas & Minutes/.test(s)) && n.lookFor.some(s => /Circuit Clerk/.test(s)))
})

// --- triage terms from the site's data -----------------------------------------------------------

test('triage: terms from the site\'s own data catch documents that use only the entity or ordinance names', () => {
  const terms = derivedTerms()
  for (const t of ['T5 @ Chicago Land Holdings', '2025-0-21', 'T5@CHICAGO IV LP', 'Alter Asset Management Company']) assert.ok(terms.includes(t), t)
  const { judge } = makeTriage(cfg.triage, [])
  assert.equal(judge('Ordinance 2025-0-21 amending the special use permit').match, true)
  assert.equal(judge('Deed from Alter Asset Management Company recorded').match, true)
  assert.equal(judge('Police Commission minutes').match, false)
})

test('OCR text is used for triage only: a matching scan goes to human review, never to extraction', async () => {
  const mk = (id, ocrText) => ({ origin: 'shadow', id, title: 'Signed minutes', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/1', text: '', kind: 'pdf', registryHit: lookup(reg, NEWSLETTER), registryId: 'village-grayslake', registryTier: 1, publisher: 'Village of Grayslake', ocrPages: [{ page: 1, text: 'Roll call' }, { page: 2, text: ocrText }] })
  const r = await processItems([mk('a', 'Ordinance 2025-0-21 approving the Fifth Amendment'), mk('b', 'Approval of the police pension report')], ctx)
  takeWarnings()
  assert.equal(r.work.length, 0, 'nothing from OCR reaches the model')
  assert.match(r.humanReview.find(h => h.id === 'a').reason, /OCR text \(triage only, not evidence\) matched .* page\(s\) 1, 2/)
  assert.match(r.filtered.find(f => f.id === 'b').reason, /scanned PDF; OCR text/)
})
