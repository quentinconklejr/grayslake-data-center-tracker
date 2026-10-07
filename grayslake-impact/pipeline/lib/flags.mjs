/**
 * Flags for the owner. The pipeline never edits src/data/records.js,
 * keyFigures.js, projections.js or questionStatus.js (rubric hard rule
 * no_rewrite_of_existing); when a new claim may bear on them it says so.
 *
 * These files are read as text, never imported or written, so nothing here
 * can change them. The topic maps name ids that must exist in those files; a
 * test checks they do, so a renamed id is caught.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './config.mjs'
import { extractNumbers, extractDates } from './guard.mjs'

const read = f => readFileSync(join(ROOT, 'src/data', f), 'utf8')

export const KEY_FIGURE_TOPICS = {
  'acres-owned': /\bacres?\b/i,
  'acres-approved': /\bacres?\b/i,
  'acres-controlled': /\bacres?\b/i,
  'buildable-area': /\bsq(uare)?\.?\s?f(ee)?t\b|\bsquare feet\b/i,
  'buildings': /\bbuildings?\b/i,
  'jobs-permanent': /\bjobs?\b/i,
  'capacity-comed': /\b(GW|gigawatts?|MW|megawatts?)\b/i,
  'investment': /\$\s?[\d.]+\s?(billion|B)\b/i,
  'water': /\bgallons?\b/i,
  'water-flush': /\bgallons?\b.*\b(flush|fill)\b|\b(flush|fill)\b.*\bgallons?\b/i,
  'buildout': /\b(build-?out|fully built|full buildout)\b/i,
  'wetlands': /\bwetlands?\b/i,
  'school-funding': /\bschools?\b|\bdistrict\s?\d+\b/i,
}

export const QUESTION_TOPICS = {
  'water-usage': /\bwater\b|\bgallons?\b/i,
  'energy-rates': /\belectric(ity)?\b|\brates?\b|\bComEd\b|\bPJM\b|\bcapacity price/i,
  'campus-scale': /\bacres?\b|\bsquare feet\b|\bsq\.? ?ft\b|\bbuildings?\b|\b(GW|MW|gigawatts?|megawatts?)\b/i,
  'tax-revenue': /\btax(es)?\b|\brevenue\b|\bschools?\b/i,
  'approval-process': /\bapprov(al|ed)\b|\bhearing\b|\bOpen Meetings\b|\bordinance\b|\blawsuit\b|\bcomplaint\b/i,
  'jobs': /\bjobs?\b/i,
}

const RECORDS_TERMS = /\b20(24|25)-0-\d{2}\b|\bspecial use permit\b|\bSUP agreement\b|\b(Third|Fourth|Fifth) Amendment\b|\bFOIA\b|\bmaster site plan\b|\bHeartland\b|\bTransportation IGA\b/i

export function loadFlagContext() {
  const kf = read('keyFigures.js')
  const qs = read('questionStatus.js')
  const keyFigures = {}
  for (const id of Object.keys(KEY_FIGURE_TOPICS)) {
    const m = new RegExp(`id: '${id}',\\s*\\n\\s*label: '([^']+)',\\s*\\n\\s*value: ([^\\n]+)`).exec(kf)
    keyFigures[id] = m ? { label: m[1], value: m[2].replace(/,\s*$/, '') } : null
  }
  const questionStatus = {}
  for (const id of Object.keys(QUESTION_TOPICS)) {
    const m = new RegExp(`'${id}':\\s*'(\\w+)'`).exec(qs)
    questionStatus[id] = m ? m[1] : null
  }
  return { keyFigures, questionStatus, keyFiguresText: kf, questionStatusText: qs }
}

/** Flags for one claim. Only claims with a figure can bear on a key figure. */
export function flagsForClaim(claim, ctx) {
  const text = `${claim.claim_text} ${(claim.supporting_quotes ?? []).join(' ')}`
  const flags = []
  const hasFigure = extractNumbers(claim.claim_text).length > 0
  if (hasFigure) {
    for (const [id, re] of Object.entries(KEY_FIGURE_TOPICS)) {
      if (re.test(claim.claim_text) && ctx.keyFigures[id]) {
        flags.push({ file: 'src/data/keyFigures.js', id, note: `may bear on key figure "${ctx.keyFigures[id].label}" (site shows ${ctx.keyFigures[id].value}); not edited` })
      }
    }
  }
  for (const [id, re] of Object.entries(QUESTION_TOPICS)) {
    if (re.test(claim.claim_text)) flags.push({ file: 'src/data/questionStatus.js', id, note: `may bear on open question "${id}" (status: ${ctx.questionStatus[id] ?? 'unknown'}); not edited` })
  }
  if (RECORDS_TERMS.test(text)) flags.push({ file: 'src/data/records.js', note: 'mentions the FOIA ordinances or agreements; check against the records layer by hand; not edited' })
  return flags
}

const STOP = new Set('the a an of and or to in on for at by with from that this is was were be been as it its into over after before about than not no new data center village county board grayslake lake t5'.split(' '))
const words = s => new Set(String(s).toLowerCase().match(/[a-z]{4,}/g)?.filter(w => !STOP.has(w)) ?? [])

function dateMs(raw) {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(raw ?? '')
  return m ? Date.UTC(+m[1], m[2] ? +m[2] - 1 : 6, m[3] ? +m[3] : 1) : null
}

/**
 * Existing timeline entries this draft may duplicate or update: same cited
 * URL, or within three days and sharing at least half of the shorter text's distinctive words (and three or more).
 */
export function existingEntryMatches(draft, timelineEvents) {
  const out = []
  const dMs = dateMs(draft.date)
  const w = words(`${draft.title} ${draft.description ?? ''}`)
  for (const e of timelineEvents) {
    const keys = [e.sourceKey, ...(e.sourceKeys ?? [])].filter(Boolean)
    if (draft.sourceKey && keys.includes(draft.sourceKey)) { out.push({ date: e.date, title: e.title, why: 'cites the same source' }); continue }
    const eMs = dateMs(e.date)
    if (dMs == null || eMs == null || Math.abs(dMs - eMs) > 3 * 86_400_000) continue
    const ew = words(`${e.title} ${e.description ?? ''}`)
    // Overlap against the shorter text: a short draft against a long entry
    // would score low on Jaccard even when it describes the same event.
    const inter = [...w].filter(x => ew.has(x)).length
    const overlap = inter / (Math.min(w.size, ew.size) || 1)
    if (inter >= 3 && overlap >= 0.5) out.push({ date: e.date, title: e.title, why: `within 3 days, ${Math.round(overlap * 100)}% of distinctive words shared` })
  }
  return out
}


// --- already covered ----------------------------------------------------------------

/**
 * Entries that already cite a source: timeline events by sourceKey or
 * sourceKeys, actions by sourceIds.
 */
export function entriesCiting(sourceKey, timelineEvents, actions = []) {
  if (!sourceKey) return []
  const out = []
  for (const e of timelineEvents) if ([e.sourceKey, ...(e.sourceKeys ?? [])].includes(sourceKey)) out.push({ file: 'src/data/timeline.js', date: e.date, title: e.title, text: `${e.title} ${e.description ?? ''}`, entry: e })
  for (const a of actions) if ((a.sourceIds ?? []).includes(sourceKey)) out.push({ file: 'src/data/actions.js', date: a.date, title: a.id, text: `${a.description ?? ''} ${a.outcome ?? ''}`, entry: a })
  return out
}

// Function words and verbs of saying carry nothing a reader would miss.
const COVER_STOP = new Set([...STOP, ...'does have has had will would could should currently against which their there them they said stated states says also only more most other such were being some than then what when where while within'.split(' ')])
// Six-letter stems, so "approved" meets "approval" and "receives" meets "receive".
const stems = s => new Set((String(s).toLowerCase().match(/[a-z]{4,}/g) ?? []).filter(w => !COVER_STOP.has(w)).map(w => w.slice(0, 6)))
const figures = s => ({
  numbers: new Set(extractNumbers(s).map(n => n.value).filter(v => !/^(19|20)\d\d$/.test(v))),
  dates: new Set(extractDates(s).filter(d => d.year).map(d => `${d.year}-${d.month}-${d.day}`)),
})

/**
 * True when an existing entry already says what a claim says: every figure
 * and full date in the claim appears in the entry, and at least half of the
 * claim's distinctive words do. A heuristic that leans towards "lacking": a
 * claim wrongly listed as new costs a look; one wrongly called covered would
 * be lost.
 */
export function claimCovered(claim, entryText) {
  const mine = figures(claim.claim_text)
  const theirs = figures(entryText)
  if (![...mine.numbers].every(n => theirs.numbers.has(n)) || ![...mine.dates].every(d => theirs.dates.has(d))) return false
  const w = stems(claim.claim_text)
  if (!w.size) return true
  const ew = stems(entryText)
  return [...w].filter(x => ew.has(x)).length / w.size >= 0.5
}
