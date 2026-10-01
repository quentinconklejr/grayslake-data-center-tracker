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
    return { kind: 'party_statement', party: registryHit.party, label: `${registryHit.party} stated` }
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

/**
 * Relabels claims from a party document. Returns new claim objects; each
 * carries `relabeled: { from, reason }` when its type changed.
 */
export function relabelClaims(claims, party) {
  if (!party) return claims.map(c => ({ ...c }))
  return claims.map(c => {
    if (isProceduralDetail(c)) return { ...c, partyDocument: party.kind }
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
