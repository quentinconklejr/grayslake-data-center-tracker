/**
 * Party assertions (rubric hard rule party_assertions_attributed).
 *
 * Two kinds of document are a party speaking for itself:
 *
 *   court filing by a party   a complaint, motion, answer, brief, petition or
 *                             response. Every claim in it becomes an
 *                             `allegation` by the filer. A court's own order
 *                             is not a party filing.
 *   party_statement source    a registry source with category
 *                             party_statement (T5's website). Every claim
 *                             becomes a `party_statement` by that party
 *                             ("T5 stated ...").
 *
 * This runs in code after extraction and before scoring. The model's
 * claim_type is ignored for these documents, with one exception: a
 * procedural detail (case or bill number, filing or hearing date, court,
 * docket event) that states no substantive figure keeps its procedural type,
 * because "Case No. 2026CH00000171 was filed July 31, 2026" is a fact about
 * the record, not the filer's assertion.
 */
import { extractNumbers } from './guard.mjs'

const FILING_HEADS = /\b(COMPLAINT|MOTION|ANSWER|PETITION|BRIEF|MEMORANDUM|RESPONSE|REPLY|COUNTERCLAIM|AFFIDAVIT|OBJECTION)\b/
const PARTIES = /\b(Plaintiffs?|Defendants?|Petitioners?|Respondents?|Movants?)\b/
const COURT_ORDER = /\bIT IS (HEREBY )?ORDERED\b|\bORDER\s+(GRANTING|DENYING|ON)\b|^\s*ORDER\b/m
const COURT_HOSTS = /(^|\.)(lakecountycircuitclerk\.org|researchil\.tylerhost\.net|19thcircuitcourt\.state\.il\.us)$/i

/**
 * Who, if anyone, is the party speaking in this document.
 * item: { url, text, category? (sources.js category), docType? (extraction doc_type) }
 * registryHit: lookup() result for the item's URL
 * Returns null, or { kind: 'court_filing' | 'party_statement', party, label }.
 */
export function detectParty(item, registryHit) {
  if (registryHit?.party) {
    return { kind: 'party_statement', party: registryHit.party, channel: registryHit.partyChannel ?? 'party_statement', label: `${registryHit.party} stated` }
  }
  let host = ''
  try { host = new URL(item.url, 'https://grayslakedatacentertracker.org').hostname } catch { /* not a URL */ }
  const courtish = item.category === 'court' || item.docType === 'filing' || COURT_HOSTS.test(host)
  if (!courtish) return null
  const head = String(item.text ?? '').slice(0, 4000)
  if (COURT_ORDER.test(head)) return null
  if (!FILING_HEADS.test(head) || !PARTIES.test(head)) return null
  const filer = /\bDefendants?\b[^.]{0,80}\b(MOTION|ANSWER|BRIEF|RESPONSE)\b/.test(head) ? 'the defendants'
    : /\bPetitioners?\b/.test(head) ? 'the petitioners' : 'the plaintiffs'
  return { kind: 'court_filing', party: filer, label: `${filer} allege` }
}

const PROCEDURAL_WORDS = /\b(case|docket|cause no|no\.|filed|filing|hearing|status hearing|courtroom|chancery|circuit court|judge|summons|served|continued|bill|introduced|referred|assigned|first reading|second reading|third reading|re-referred|sponsor)\b/i

/**
 * True when a claim states only procedure: it uses procedural vocabulary and
 * every number in it is part of a date, a time, an identifier (case or bill
 * number) or a courtroom number.
 */
export function isProceduralDetail(claim) {
  if (claim?.claim_type !== 'procedural') return false
  const text = String(claim.claim_text ?? '')
  if (!PROCEDURAL_WORDS.test(text)) return false
  const masked = text.replace(/\b(courtroom|room)\s+\d+\b/gi, ' ')
  // extractNumbers already leaves out dates, times and identifiers; a bare
  // year is procedural too. Anything else is a substantive figure.
  return extractNumbers(masked).filter(n => !/^(19|20)\d\d$/.test(n.value)).length === 0
}

// Owner decision D-1: from a party's own channel, only record facts may be
// stated as fact: dates, vote outcomes, the existence of a document or act,
// and numbers in an official record. Anything evaluative, negated or
// forward-looking is the party's claim and is attributed.
const EVALUATIVE = /\b(compl(y|ies|iance|iant)|ensur\w*|transparen\w*|minimal(ly)?|best interests?|consistent with|satisf(y|ies|ied|actory)|safe(ly|ty)?|benefit\w*|largest|significant(ly)?|commit(s|ted|ment)?|protect\w*|responsib\w*|sustainab\w*|diversif\w*|virtually|fully|properly|lawful(ly)?|legal(ly)?|appropriate(ly)?|adequate(ly)?|thorough(ly)?|openness|openly|successful(ly)?|important|unique|strong|world-class|state-of-the-art|clean|efficient)\b/i
const NEGATION = /\b(no|not|never|none|neither|nor|without)\b|n['’]t\b/i
const FORWARD = /\b(will|would|could|may|might|expect\w*|estimat\w*|project(s|ed|ion|ions)?|plans? to|anticipat\w*|intend\w*)\b/i
const VOTE = /\b(voted|vote of|ayes?|nays?|unanimous(ly)?|roll call)\b|\b\d+\s*-\s*\d+\s+vote\b/i
const DOC_EVENT = /\b(issued|approved|adopted|passed|denied|tabled|filed|published|posted|scheduled|held|signed|recorded|introduced|referred|amended|granted|executed|convened|continued|received)\b/i
const RECORD_NOUN = /\b(ordinance|agreement|permit|plan|amendment|resolution|minutes|agenda|exhibit|section|parcel|pin)\b/i
const OFFICIAL_DOC_TYPES = new Set(['ordinance', 'minutes', 'agenda', 'docket', 'bill_status', 'data'])

/**
 * True when a claim from a party's own channel is a record fact that may be
 * stated as fact (D-1). officialRecord: the document is itself an official
 * record (ordinance, minutes, agenda, docket), not a press release,
 * newsletter or FAQ.
 */
export function isRecordFact(claim, { officialRecord = false } = {}) {
  if (!['fact', 'procedural'].includes(claim?.claim_type)) return false
  const t = String(claim.claim_text ?? '')
  if (EVALUATIVE.test(t) || NEGATION.test(t) || FORWARD.test(t)) return false
  if (isProceduralDetail(claim)) return true
  if (VOTE.test(t)) return true
  const figures = extractNumbers(t).filter(n => !/^(19|20)\d\d$/.test(n.value)).length > 0
  if (DOC_EVENT.test(t)) return !figures || officialRecord
  return officialRecord && figures && RECORD_NOUN.test(t)
}

export const isOfficialRecord = ({ docType, fetcher }) => OFFICIAL_DOC_TYPES.has(docType) || fetcher === 'village-agendas'

/**
 * Relabels claims from a party document. Returns new claim objects; each
 * carries `relabeled: { from, reason }` when its type changed.
 * opts.officialRecord: see isRecordFact (applies to party channels, not to
 * court filings, where only procedural details stay facts).
 */
export function relabelClaims(claims, party, opts = {}) {
  if (!party) return claims.map(c => ({ ...c }))
  return claims.map(c => {
    if (isProceduralDetail(c)) return { ...c, partyDocument: party.kind }
    if (party.kind === 'party_statement' && isRecordFact(c, opts)) return { ...c, partyDocument: party.kind, recordFact: true }
    const to = party.kind === 'court_filing' ? 'allegation' : 'party_statement'
    const out = { ...c, claim_type: to, speaker: party.party, attribution: 'named', partyDocument: party.kind }
    if (c.claim_type !== to) out.relabeled = { from: c.claim_type, reason: `${party.kind === 'court_filing' ? 'party court filing' : 'party statement source'}: ${party.party}` }
    return out
  })
}

/** The attribution a drafted text must contain for a party's claims. */
export function requiredAttribution(party) {
  if (!party) return []
  if (party.kind === 'court_filing') {
    return [{ label: 'allegation attribution (allege/alleges/the complaint/the lawsuit)', test: /\balleg(e|es|ed|ing|ation|ations)\b|\bthe complaint\b|\bthe (lawsuit|suit|filing)\b|\bplaintiffs? (say|said|claim|contend|argue)/i }]
  }
  const name = party.party.split(/\s+/)[0]
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [{ label: `"${name} stated" or "according to ${name}"`, test: new RegExp(`\\b${esc}\\b[^.]{0,60}\\b(stated|states|said|says|announced|wrote|claims?|described)\\b|according to ${esc}\\b`, 'i') }]
}
