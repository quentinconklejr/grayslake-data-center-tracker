// Verbatim guard tests. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import {
  makeCanon, prepareSource, checkQuote, checkClaim, checkDraftProse,
  extractDates, extractNumbers, extractIdentifiers, speakerToken, quotedSpans,
} from '../lib/guard.mjs'

const cfg = guardConfig(loadRubric())

const SOURCE = [
  'The Lake County Board approved an ordinance amending Chapter 151 of the county code on Sept. 8.',
  'The moratorium took effect immediately and is set to expire May 11, 2027, or earlier if the county adopts regulations.',
  '“We’re taking pressure from every side of this issue, but at the end of the day, we choose our citizens,” said District 16 board member Esiah A. Campos.',
  'It does not affect data centers proposed or approved inside municipalities, including the T5 Data Center Campus in Grayslake.',
  'The case, 2026CH00000171, was filed in the Chancery Division. The Village projected $1.4 billion over 20 years.',
  'The board considered an eight-month temporary moratorium after the ZBA voted 6-0.',
].join('\n')
const src = prepareSource(SOURCE, cfg, { date: 'Sept. 8, 2026' })

// --- canonicalization -------------------------------------------------------

test('canon maps typographic characters one to one and collapses whitespace only', () => {
  const canon = makeCanon(cfg)
  assert.equal(canon('“We’re  here”\n\t– now'), '"We\'re here" - now')
  assert.equal(canon('soft­hyphen'), 'softhyphen')
  assert.equal(canon('no break'), 'no break')
  assert.equal(canon('Case Matters'), 'Case Matters', 'no case folding')
  assert.equal(canon('a, b.'), 'a, b.', 'no punctuation stripping')
})

// --- quote checks -------------------------------------------------------------

test('exact substring passes as exact', () => {
  const r = checkQuote('It does not affect data centers proposed or approved inside municipalities', src, cfg)
  assert.equal(r.ok, true)
  assert.equal(r.match, 'exact')
})

test('straight quotes against curly source pass as canonical, not exact', () => {
  const r = checkQuote('"We\'re taking pressure from every side of this issue, but at the end of the day, we choose our citizens,"', src, cfg)
  assert.equal(r.ok, true)
  assert.equal(r.match, 'canonical')
})

test('line breaks and doubled spaces in the quote pass as canonical', () => {
  const r = checkQuote('The moratorium took effect immediately   and is set\nto expire May 11, 2027', src, cfg)
  assert.equal(r.ok, true)
  assert.equal(r.match, 'canonical')
})

test('a paraphrase one word off fails', () => {
  const r = checkQuote('It does not affect data centres proposed or approved inside municipalities', src, cfg)
  assert.equal(r.ok, false)
  assert.equal(r.reason, 'not_found')
  assert.ok(r.nearest.score > 0.8, 'nearest match is reported for debugging')
})

test('a quote spliced from two sentences fails', () => {
  const r = checkQuote('The Lake County Board approved an ordinance amending Chapter 151 and is set to expire May 11, 2027', src, cfg)
  assert.equal(r.ok, false)
  assert.equal(r.reason, 'not_found')
})

test('a quote that starts or ends inside a word fails', () => {
  assert.equal(checkQuote('It does not affect data centers proposed or approved inside municipalitie', src, cfg).reason, 'not_found')
  assert.equal(checkQuote('oes not affect data centers proposed or approved inside municipalities', src, cfg).reason, 'not_found')
})

test('an identifier that is a prefix of a longer one is not found', () => {
  const r = checkClaim({ claim_text: 'The case number is 2026CH0000017.', claim_type: 'procedural', supporting_quotes: ['The case, 2026CH00000171, was filed in the Chancery Division.'], event_date: null, date_basis: 'unknown' }, src, cfg)
  assert.ok(r.failures.some(f => f.check === 'identifier'))
})

test('case differences fail (no case folding)', () => {
  assert.equal(checkQuote('it does not affect data centers proposed or approved inside municipalities', src, cfg).ok, false)
})

test('a missing comma fails (no punctuation stripping)', () => {
  assert.equal(checkQuote('The moratorium took effect immediately and is set to expire May 11 2027', src, cfg).ok, false)
})

test('elisions and editorial brackets are rejected before matching', () => {
  assert.equal(checkQuote('The moratorium took effect immediately ... set to expire May 11, 2027', src, cfg).reason, 'contains_rejected_sequence')
  assert.equal(checkQuote('The moratorium took effect immediately … set to expire May 11, 2027', src, cfg).reason, 'contains_rejected_sequence')
  assert.equal(checkQuote('The [county] moratorium took effect immediately and is set to expire', src, cfg).reason, 'contains_rejected_sequence')
})

test('trivially short quotes are rejected', () => {
  assert.equal(checkQuote('T5', src, cfg).reason, 'too_short')
  assert.equal(checkQuote('Grayslake Grayslake Grayslake Grayslake Grayslake', src, cfg).reason, 'too_few_words')
})

test('over-long quotes are rejected', () => {
  assert.equal(checkQuote('word '.repeat(200), src, cfg).reason, 'too_long')
})

test('a PDF hyphenated line break does not match the joined word', () => {
  const pdf = prepareSource('The Village authorized the special use permit for the dis-\ntrict on the north side of Peterson Road.', cfg)
  assert.equal(checkQuote('The Village authorized the special use permit for the district on the north side', pdf, cfg).ok, false)
})

test('soft hyphens in the source are ignored', () => {
  const s = prepareSource('The Village authorized the special use permit for the dis­trict on the north side of Peterson Road.', cfg)
  assert.equal(checkQuote('The Village authorized the special use permit for the district on the north side', s, cfg).ok, true)
})

test('a quote occurring twice records the first offset and the count', () => {
  const s = prepareSource('No trustee voted nay on any of the five ordinances. Later: No trustee voted nay on any of the five ordinances.', cfg)
  const r = checkQuote('No trustee voted nay on any of the five ordinances.', s, cfg)
  assert.equal(r.ok, true)
  assert.equal(r.occurrences, 2)
  assert.equal(r.offset, 0)
})

// --- claim consistency ---------------------------------------------------------

const goodQuote = 'The moratorium took effect immediately and is set to expire May 11, 2027, or earlier if the county adopts regulations.'

test('a claim whose numbers and dates are in its quote passes', () => {
  const r = checkClaim({
    claim_text: 'The moratorium expires May 11, 2027, unless the county adopts regulations first.',
    claim_type: 'fact', speaker: null, supporting_quotes: [goodQuote],
    event_date: null, date_basis: 'unknown',
  }, src, cfg)
  assert.deepEqual(r.failures, [])
})

test('a correct quote with a wrong date in the claim fails', () => {
  const r = checkClaim({
    claim_text: 'The moratorium expires May 12, 2027.',
    claim_type: 'fact', supporting_quotes: [goodQuote], event_date: null, date_basis: 'unknown',
  }, src, cfg)
  assert.equal(r.ok, false)
  assert.equal(r.failures[0].check, 'date')
})

test('a correct quote with a wrong number in the claim fails', () => {
  const r = checkClaim({
    claim_text: 'The Village projected $1.5 billion over 20 years.',
    claim_type: 'projection', speaker: 'Village of Grayslake',
    supporting_quotes: ['The case, 2026CH00000171, was filed in the Chancery Division. The Village projected $1.4 billion over 20 years.'],
    event_date: null, date_basis: 'unknown',
  }, src, cfg)
  assert.ok(r.failures.some(f => f.check === 'number' && f.value === '1.5'))
})

test('an identifier not in the quote fails', () => {
  const r = checkClaim({
    claim_text: 'The case number is 2026CH00000172.',
    claim_type: 'procedural',
    supporting_quotes: ['The case, 2026CH00000171, was filed in the Chancery Division.'],
    event_date: null, date_basis: 'unknown',
  }, src, cfg)
  assert.ok(r.failures.some(f => f.check === 'identifier'))
})

test('a spelled-out number in the quote supports a digit in the claim', () => {
  const r = checkClaim({
    claim_text: 'The board considered an 8-month moratorium.',
    claim_type: 'fact',
    supporting_quotes: ['The board considered an eight-month temporary moratorium after the ZBA voted 6-0.'],
    event_date: null, date_basis: 'unknown',
  }, src, cfg)
  assert.deepEqual(r.failures, [])
})

test('a quote attributed to the right speaker passes; the wrong speaker fails', () => {
  const quote = 'taking pressure from every side of this issue, but at the end of the day, we choose our citizens'
  const right = checkClaim({ claim_text: 'Campos said the board chose its citizens.', claim_type: 'quote', speaker: 'Esiah A. Campos', supporting_quotes: [quote], event_date: null, date_basis: 'unknown' }, src, cfg)
  assert.deepEqual(right.failures, [])
  const wrong = checkClaim({ claim_text: 'Davies said the board chose its citizens.', claim_type: 'quote', speaker: 'Mayor Elizabeth Davies', supporting_quotes: [quote], event_date: null, date_basis: 'unknown' }, src, cfg)
  assert.ok(wrong.failures.some(f => f.reason === 'speaker_not_near_quote'))
})

test('a quote or opinion without a speaker fails', () => {
  const r = checkClaim({ claim_text: 'Someone said the board chose its citizens.', claim_type: 'opinion', speaker: null, supporting_quotes: ['taking pressure from every side of this issue, but at the end of the day'], event_date: null, date_basis: 'unknown' }, src, cfg)
  assert.ok(r.failures.some(f => f.reason === 'quote_or_opinion_without_speaker'))
})

test('a claim with no supporting quote fails', () => {
  const r = checkClaim({ claim_text: 'The board approved it.', claim_type: 'fact', supporting_quotes: [] }, src, cfg)
  assert.ok(r.failures.some(f => f.reason === 'no_supporting_quote'))
})

test('one failing quote fails the whole claim', () => {
  const r = checkClaim({ claim_text: 'The moratorium took effect.', claim_type: 'fact', supporting_quotes: [goodQuote, 'This sentence was invented by the model entirely.'], event_date: null, date_basis: 'unknown' }, src, cfg)
  assert.equal(r.ok, false)
})

test('event_date must be stated in the quotes or equal the document date', () => {
  const base = { claim_text: 'The Board approved the ordinance.', claim_type: 'fact', supporting_quotes: ['The Lake County Board approved an ordinance amending Chapter 151 of the county code on Sept. 8.'] }
  assert.deepEqual(checkClaim({ ...base, event_date: '2026-09-08', date_basis: 'stated_in_text' }, src, cfg).failures, [])
  assert.ok(checkClaim({ ...base, event_date: '2026-09-09', date_basis: 'stated_in_text' }, src, cfg).failures.some(f => f.check === 'event_date'))
  const doc = { month: 9, day: 8, year: 2026 }
  assert.deepEqual(checkClaim({ ...base, event_date: '2026-09-08', date_basis: 'document_date' }, src, cfg, { docDate: doc }).failures, [])
  assert.ok(checkClaim({ ...base, event_date: '2026-09-08', date_basis: 'unknown' }, src, cfg).failures.length)
})

// --- extraction helpers ----------------------------------------------------------

test('dates are recognised in the formats sources use', () => {
  const d = extractDates('Sept. 8; September 8, 2026; Aug 17th; 8 September 2026; 2026-09-08; 9/8/2026; 5/6/25')
  assert.deepEqual(d.map(x => [x.month, x.day, x.year]).sort(), [
    [5, 6, 2025], [8, 17, null], [9, 8, 2026], [9, 8, 2026], [9, 8, 2026], [9, 8, 2026], [9, 8, null],
  ].sort())
  assert.equal(extractDates('may approve 5 items; 24/7 service; June 2026').length, 0)
})

test('numbers exclude dates and identifiers, and normalize commas and trailing zeros', () => {
  const n = extractNumbers('On July 31, 2026, case 2026CH00000171 sought $62,968,250 for 4.0% of 287.8 acres; T5 has 1.20 GW.')
  assert.deepEqual(n.map(x => x.value), ['62968250', '4', '287.8', '1.2'])
})

test('identifiers are mixed letter-digit tokens of four or more characters', () => {
  assert.deepEqual(extractIdentifiers('HB5513, SB4016, 2026CH00000171, T5, Q4, ABCD').map(x => x.value), ['HB5513', 'SB4016', '2026CH00000171'])
})

test('speaker tokens strip titles and pick a distinctive organisation word', () => {
  assert.equal(speakerToken('Mayor Elizabeth Davies'), 'Davies')
  assert.equal(speakerToken('Illinois State Rep. Daniel Didech (D-Buffalo Grove)'), 'Didech')
  assert.equal(speakerToken('Village of Grayslake'), 'Grayslake')
  assert.equal(speakerToken('T5 Data Centers LLC'), 'T5')
})

test('quoted spans are found for curly and straight double quotes', () => {
  assert.deepEqual(quotedSpans('He said “no” and "yes".').map(s => s.value), ['no', 'yes'])
})

// --- draft prose ------------------------------------------------------------------

test('draft prose: a quotation not in the source fails, one in it passes', () => {
  const ok = checkDraftProse('Campos said the board would “choose our citizens,” he said.', cfg, { evidence: [src] })
  assert.ok(!ok.failures.some(f => f.check === 'quotation'))
  // The source has a comma there; a period inside the closing quote is the
  // only difference allowed, and it is reported as a note.
  const period = checkDraftProse('Campos said the board would “choose our citizens.”', cfg, { evidence: [src] })
  assert.ok(!period.failures.some(f => f.check === 'quotation'))
  assert.ok(period.notes.some(n => n.check === 'quotation'))
  const word = checkDraftProse('Campos said the board would “choose our citizen.”', cfg, { evidence: [src] })
  assert.ok(word.failures.some(f => f.reason === 'quotation_not_in_source'), 'a changed word still fails')
  const bad = checkDraftProse('Campos said the board would “protect our citizens.”', cfg, { evidence: [src] })
  assert.ok(bad.failures.some(f => f.reason === 'quotation_not_in_source'))
})

test('draft prose: allegations need attribution words', () => {
  assert.ok(checkDraftProse('The Village violated the Open Meetings Act.', cfg, { evidence: [src], allegation: true }).failures.some(f => f.check === 'allegation'))
  assert.ok(!checkDraftProse('The complaint alleges the Village violated the Open Meetings Act.', cfg, { evidence: [src], allegation: true }).failures.some(f => f.check === 'allegation'))
})

test('draft prose: blocked terms fail', () => {
  const r = checkDraftProse('He plans to push the POWER Act.', cfg, { evidence: [src], blockedTerms: [{ term: 'POWER Act', reason: 'hold' }] })
  assert.ok(r.failures.some(f => f.check === 'blocked_term'))
})

test('draft prose: a date matching only the document date is a note, not a pass of the text', () => {
  const r = checkDraftProse('Reported on October 2, 2026.', cfg, { evidence: [src], docDates: [{ month: 10, day: 2, year: 2026 }] })
  assert.equal(r.ok, true)
  assert.equal(r.notes.length, 1)
})

test('clock times are compared as times, not as numbers', () => {
  const s = prepareSource('An initial status hearing has been set for 9 a.m. on October 30. Filed at 6:29 PM.', cfg)
  assert.ok(checkDraftProse('The hearing is at 9:00 a.m. on October 30; filed at 6:29 p.m.', cfg, { evidence: [s] }).ok)
  const wrong = checkDraftProse('The hearing is at 10 a.m. on October 30.', cfg, { evidence: [s] })
  assert.ok(wrong.failures.some(f => f.check === 'time'))
})

test('draft prose: the first letter of a quotation may change case, with a note; other letters may not', () => {
  const s = prepareSource('“Because Grayslake is debt-free, operates on a balanced budget, and gave no money to the developer, we are in a truly unique position,” Davies said.', cfg)
  const ok = checkDraftProse('Davies said that “because Grayslake is debt-free, operates on a balanced budget, and gave no money to the developer, we are in a truly unique position.”', cfg, { evidence: [s] })
  assert.equal(ok.ok, true)
  assert.match(ok.notes[0].note, /case of the first letter and final punctuation/)
  const bad = checkDraftProse('Davies said that “because grayslake is debt-free”', cfg, { evidence: [s] })
  assert.ok(bad.failures.some(f => f.check === 'quotation'))
})

// --- party assertions (rubric hard rule party_assertions_attributed) -----------------

import { detectParty, relabelClaims, isProceduralDetail, requiredAttribution } from '../lib/party.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'

const COMPLAINT_HEAD = 'IN THE CIRCUIT COURT OF THE NINETEENTH JUDICIAL CIRCUIT\nPRESERVATION OF COMMUNITY WELL-BEING COLLECTIVE LLC, et al., Plaintiffs,\nv. VILLAGE OF GRAYSLAKE, Defendants.\nCase No. 2026CH00000171\nCOMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF'
const complaint = { url: '/docs/t5-grayslake-complaint-2026ch00000171.pdf', category: 'court', text: COMPLAINT_HEAD }
const reg = loadRegistry()
const claimOf = (claim_type, claim_text) => ({ claim_type, claim_text, speaker: null, attribution: 'document', supporting_quotes: [], event_date: null, date_basis: 'unknown' })

test('party: a complaint is a party court filing; a court order is not', () => {
  assert.equal(detectParty(complaint, lookup(reg, complaint.url)).kind, 'court_filing')
  const order = { ...complaint, text: 'IN THE CIRCUIT COURT\nPlaintiffs v. Defendants\nORDER ON MOTION TO DISMISS\nIT IS HEREBY ORDERED that the motion is denied.' }
  assert.equal(detectParty(order, lookup(reg, order.url)), null)
  const news = { url: 'https://www.lakemchenryscanner.com/2026/08/08/x/', category: 'news', text: 'The complaint says the Plaintiffs ...' }
  assert.equal(detectParty(news, lookup(reg, news.url)), null, 'news reporting about a complaint is not the filing')
})

test('party: every substantive claim in a complaint becomes an allegation, whatever the model said', () => {
  const party = detectParty(complaint, lookup(reg, complaint.url))
  const out = relabelClaims([
    claimOf('fact', 'The campus has backup diesel generation capacity in the range of 1.5 to 2 gigawatts.'),
    claimOf('projection', 'The campus will consume more than 1 gigawatt continuously.'),
    claimOf('opinion', 'The approvals were unlawful.'),
    claimOf('quote', 'Mayor Davies estimated the investment at $8.5 billion.'),
  ], party)
  for (const c of out) {
    assert.equal(c.claim_type, 'allegation')
    assert.equal(c.speaker, 'the plaintiffs')
  }
  assert.equal(out[0].relabeled.from, 'fact')
})

test('party: procedural details in a filing stay procedural; a "procedural" claim with a figure does not', () => {
  const party = detectParty(complaint, lookup(reg, complaint.url))
  const [caseNo, hearing, disguised] = relabelClaims([
    claimOf('procedural', 'Case No. 2026CH00000171 was filed in the Chancery Division on July 31, 2026.'),
    claimOf('procedural', 'An initial status hearing is set for October 30, 2026 at 9:00 a.m. in Courtroom 301.'),
    claimOf('procedural', 'The complaint was filed over a campus using 1.55 gigawatts of power.'),
  ], party)
  assert.equal(caseNo.claim_type, 'procedural')
  assert.equal(hearing.claim_type, 'procedural')
  assert.equal(disguised.claim_type, 'allegation', 'a figure makes it substantive')
  assert.equal(isProceduralDetail(claimOf('fact', 'Case No. 2026CH00000171 was filed.')), false, 'only claims typed procedural qualify')
})

test('party: everything from T5\'s website becomes "T5 stated", never fact', () => {
  const url = 'https://t5datacenters.com/news/grayslake-update/'
  const party = detectParty({ url, text: 'T5 announces ...' }, lookup(reg, url))
  assert.deepEqual([party.kind, party.party], ['party_statement', 'T5 Data Centers'])
  const out = relabelClaims([
    claimOf('fact', 'The campus will use less than 50,000 gallons of water a day.'),
    claimOf('procedural', 'A public hearing is scheduled for October 15, 2026.'),
    claimOf('procedural', 'The first building permit was issued on September 1, 2026.'),
  ], party)
  assert.equal(out[0].claim_type, 'party_statement')
  assert.equal(out[0].speaker, 'T5 Data Centers')
  assert.equal(out[1].claim_type, 'procedural', 'a bare procedural detail keeps its type')
  assert.equal(out[2].claim_type, 'party_statement', 'a permit issuance is substantive: T5 saying it does not make it fact')
})

test('party: claims from a non-party source are left alone', () => {
  const url = 'https://www.dailyherald.com/20260901/news/x/'
  const out = relabelClaims([claimOf('fact', 'The Village issued a permit.')], detectParty({ url, text: '' }, lookup(reg, url)))
  assert.equal(out[0].claim_type, 'fact')
  assert.equal(out[0].relabeled, undefined)
})

test('party: a drafted text must carry the party attribution or the guard fails it', () => {
  const s = prepareSource('T5 expects the campus to use less than 50,000 gallons of water a day once fully built.', cfg)
  const t5 = requiredAttribution({ kind: 'party_statement', party: 'T5 Data Centers' })
  assert.ok(checkDraftProse('The campus will use less than 50,000 gallons of water a day.', cfg, { evidence: [s], requiredAttribution: t5 }).failures.some(f => f.check === 'attribution'))
  assert.equal(checkDraftProse('T5 stated the campus will use less than 50,000 gallons of water a day.', cfg, { evidence: [s], requiredAttribution: t5 }).ok, true)
  assert.equal(checkDraftProse('According to T5, the campus will use less than 50,000 gallons a day.', cfg, { evidence: [s], requiredAttribution: t5 }).ok, true)

  const c = prepareSource('backup diesel generation capacity in the range of 1.5 to 2 gigawatts', cfg)
  const filing = requiredAttribution({ kind: 'court_filing', party: 'the plaintiffs' })
  assert.ok(checkDraftProse('The campus has 1.5 to 2 gigawatts of backup diesel generation.', cfg, { evidence: [c], requiredAttribution: filing }).failures.some(f => f.check === 'attribution'))
  assert.equal(checkDraftProse('The complaint alleges the campus has 1.5 to 2 gigawatts of backup diesel generation.', cfg, { evidence: [c], requiredAttribution: filing }).ok, true)
})

// --- voice: the tracker's own words outside quotation marks ---------------------------

test('voice: a long passage copied without quotation marks fails; the same passage quoted passes', () => {
  const s = prepareSource('Mundelein does not have any jurisdiction in decisions, does not receive any money and/or tax dollars from this project.', cfg)
  const copied = checkDraftProse('Mundelein does not have any jurisdiction in decisions, does not receive any money and/or tax dollars from this project.', cfg, { evidence: [s], noUnquotedCopy: 12 })
  assert.ok(copied.failures.some(f => f.reason === 'unquoted_copy'))
  const quoted = checkDraftProse('Mundelein said it “does not have any jurisdiction in decisions, does not receive any money and/or tax dollars from this project.”', cfg, { evidence: [s], noUnquotedCopy: 12 })
  assert.ok(!quoted.failures.some(f => f.reason === 'unquoted_copy'))
  const paraphrase = checkDraftProse('Mundelein said it has no say in the decisions and receives no tax money from the project.', cfg, { evidence: [s], noUnquotedCopy: 12 })
  assert.ok(!paraphrase.failures.some(f => f.check === 'voice'))
})

test('voice: a copied run may not straddle a quotation', () => {
  const s = prepareSource('one two three four five six seven eight nine ten eleven twelve thirteen', cfg)
  const r = checkDraftProse('one two three four five six “seven eight” nine ten eleven twelve thirteen', cfg, { evidence: [s], noUnquotedCopy: 12 })
  assert.ok(!r.failures.some(f => f.reason === 'unquoted_copy'))
})

test('voice: first person outside quotation marks fails; inside it is fine; "US" is not "us"', () => {
  const s = prepareSource('x', cfg)
  assert.ok(checkDraftProse('CLCJAWA has never raised concerns in any meeting I’ve attended.', cfg, { evidence: [s], noFirstPerson: true }).failures.some(f => f.reason === 'first_person_outside_quotation'))
  assert.ok(checkDraftProse('Mundelein has talked with legislators and our attorney.', cfg, { evidence: [s], noFirstPerson: true }).failures.some(f => f.check === 'voice'))
  assert.ok(!checkDraftProse('The mayor said “we choose our citizens.”', cfg, { evidence: [s], noFirstPerson: true }).failures.some(f => f.check === 'voice'))
  assert.ok(!checkDraftProse('The US Army Corps of Engineers received the permit.', cfg, { evidence: [s], noFirstPerson: true }).failures.some(f => f.check === 'voice'))
})
