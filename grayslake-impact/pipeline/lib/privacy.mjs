/**
 * Privacy check (owner decision D-2).
 *
 * Drafts never name a private individual or give their health, medical,
 * address or family details; an individual plaintiff is "a plaintiff". Public
 * officials and public figures in their public role may be named
 * (config privacy.allowed_people, or a listed surname after a title such as
 * "Trustee"). The case caption may appear exactly as listed
 * (privacy.case_captions). Anything else that looks like a person's name is a
 * failure, and the draft goes to human review: a false alarm costs a manual
 * look, a miss could publish a private person's details.
 */

const SENSITIVE = [
  // Narrow on purpose: "conditions of approval", "wastewater treatment" and
  // "Ill." (Illinois) are everywhere in land-use records.
  ['health or medical detail', /\b(health|medical(ly)?|medicine|medication|(?:pre-existing|health|medical|chronic)\s+condition|diagnos\w*|disease|illness|sick|asthma\w*|bronch\w*|respiratory|lung|cancer|cardiac|allerg\w*|disabilit\w*|disabled|pregnan\w*|hospital\w*|surgery|therap\w*|symptom\w*|susceptib\w*)\b/i],
  ['address', /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(Road|Rd|Street|St|Avenue|Ave|Lane|Ln|Drive|Dr|Court|Ct|Way|Boulevard|Blvd|Circle|Cir|Trail|Place|Pl|Terrace)\b\.?|\b(home address|lives at|resides at|residence at|residing at)\b|\bprivate well\b/i],
  // "single-family" and "multi-family" are zoning terms, not family details.
  ['family detail', /\b(children|child|son|daughter|sons|daughters|wife|husband|spouse|grandchild\w*|grandson|granddaughter|grandparent\w*|mother|father|kids?)\b|(?<!single-|multi-|two-)\b(family|families)\b(?!-)/i],
]

// Capitalised words that are not part of a person's name.
const NOT_NAME = new Set(`Village Villages County Board Lake Road Route Park Center Centers Data Company Court Courtroom Circuit Plan Commission
 Department District Illinois Grayslake Mundelein Libertyville Chicago Cornerstone Peterson Alleghany Edison Commonwealth Division Chancery
 Agreement Amendment Ordinance Act Committee Senate House General Assembly Agency Water Joint Action Central Township Avon Business Parkway
 Drive Street Avenue Office State United States Army Corps Engineers Daily Herald Tribune Scanner Chronicle Media News Capitol Sun Times
 The This That These Those Plaintiffs Plaintiff Defendants Defendant Mayor Trustee Trustees Rep Representative Sen Senator Governor Judge
 Clerk Chair Chairman Director Executive Opposition Coalition Collective Community Preservation Well LLC LP Inc Corp Group Management Asset
 Alter Medline Heartland Campus Property Properties Zoning Appeals Stormwater Management Comprehensive Sustainability Land Use Code Section
 Exhibit Agenda Minutes Permit Hearing Notice Special Regular Meeting Public Comment Freedom Information January February March April May
 June July August September October November December Monday Tuesday Wednesday Thursday Friday Saturday Sunday ComEd PJM ICC IEPA
 CLCJAWA Federal Energy Regulatory Environmental Protection Fire Protection High School Community Unit Elementary Library Forest Preserve
 Round Prairie Crossing University Supreme Appellate Northern Southern Eastern Western North South East West Lakes Great Alliance
 Citizens Utility Clean Jobs Coalition Gigawatts Megawatts Phase Building Buildings Facility Facilities Substation Switchyard Development
 Developer Bill Bills Public Works Transportation Planning Environment Health Finance Budget Fiscal Year Report Annual Resolution Order
 Motion Complaint Lawsuit Case Count Counts Due Process Open Meetings Declaratory Injunctive Relief Diesel Generation Backup T5
 Passed Both Houses Third Second First Reading Sent Approved Vetoed Veto Effective Date Rules Assignments Executive Referred Added Chief`.split(/\s+/).filter(Boolean))

const TITLE_RE = /\b(Mayor|Trustee|Trustees|Rep\.|Representative|Sen\.|Senator|Gov\.|Governor|Judge|Clerk|Chair|Director|CEO|President|Commissioner|Attorney|Dr\.|Mr\.|Ms\.|Mrs\.)\s+$/

// Last words that make a capitalised phrase the name of a fund, law, program
// or body rather than a person.
const INSTITUTION_END = /^(Funds?|Acts?|Commissions?|Agency|Agencies|Authority|Authorities|Programs?|Plans?|Codes?|Councils?|Boards?|Committees?|Departments?|Office)$/
// A party label in a court filing: the name after it is a person in the case.
const PARTY_RE = /\b(Plaintiffs?|Defendants?|Petitioners?|Respondents?)[,:]?\s+$/i
const PARTY_LEAD = /^(Plaintiffs?|Defendants?|Petitioners?|Respondents?)\s+/

const norm = s => s.normalize('NFC').replace(/\b[A-Z]\.\s*/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

export function makePrivacy(pcfg = {}) {
  const allowedFull = new Set((pcfg.allowed_people ?? []).map(norm))
  const allowedSurnames = new Set((pcfg.allowed_surnames_with_title ?? []).map(s => s.toLowerCase()))
  const captions = pcfg.case_captions ?? []

  /** Returns { ok, failures: [{ check, reason, value }] }. */
  function check(text) {
    let s = String(text ?? '')
    for (const c of captions) s = s.split(c).join(' ‖ ')   // the caption, exactly, is allowed
    const failures = []
    for (const [label, re] of SENSITIVE) {
      const m = s.match(re)
      if (m) failures.push({ check: 'privacy', reason: label, value: m[0] })
    }
    // Person-name candidates: two or three capitalised words, optionally with
    // a middle initial, possessive allowed.
    const nameRe = /\b([A-Z][a-z]+(?:[-'][A-Z][a-z]+)?)(\s+[A-Z]\.)?(\s+[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?){1,2}(?:['’]s)?\b/g
    const after = new RegExp(nameRe.source, 'y')
    for (let m of s.matchAll(nameRe)) {
      // "Plaintiff Mary Anne Fortmann": the capitalised party label starts the
      // match and would hide the name (it is not a name word). Match again
      // after the label.
      const label = PARTY_LEAD.exec(m[0])
      if (label) {
        after.lastIndex = m.index + label[0].length
        m = after.exec(s)
        if (!m) continue
      }
      const raw = m[0].replace(/['’]s$/, '')
      const words = raw.replace(/\b[A-Z]\.\s*/g, '').split(/\s+/)
      if (words.some(w => NOT_NAME.has(w))) continue
      if (allowedFull.has(norm(raw))) continue
      const before = s.slice(Math.max(0, m.index - 20), m.index)
      // The name of a fund, law or body: the run of capitalised words the
      // candidate starts (the pattern above stops at three) ends in a word
      // such as Fund or Act. "Data Center Community Intervenor Compensation
      // Fund" and "Residential Automated Solar Permitting Platform Act" in the
      // HB5513 / SB4016 synopsis are not people. Not after a title or role
      // ("Mr.", "Rep.", "Mayor") or a party label ("Plaintiff"): those stay
      // checked as before. Only directly adjacent words count, so "John Smith
      // of the Lake County Board" is still a name.
      const run = `${raw} ${s.slice(m.index + m[0].length).match(/^(?:\s+[A-Z][\p{L}'’-]*)*/u)[0]}`.trim().split(/\s+/)
      if (INSTITUTION_END.test(run.at(-1)) && !TITLE_RE.test(before) && !PARTY_RE.test(before)) continue
      if (TITLE_RE.test(before) && allowedSurnames.has(words.at(-1).toLowerCase())) continue
      failures.push({ check: 'privacy', reason: 'possible private individual named', value: raw })
    }
    return { ok: failures.length === 0, failures }
  }

  /** Claims whose text or quotes carry sensitive details are kept out of drafting. */
  function sensitiveClaim(claim) {
    const all = `${claim.claim_text} ${(claim.supporting_quotes ?? []).join(' ')}`
    return SENSITIVE.some(([, re]) => re.test(all))
  }

  return { check, sensitiveClaim }
}
