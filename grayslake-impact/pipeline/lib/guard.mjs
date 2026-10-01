/**
 * Verbatim guard.
 *
 * Every claim the pipeline extracts must carry a supporting quote, and the
 * quote must be an exact substring of the text the pipeline itself fetched.
 * This module is the code that decides that. It has no network access and no
 * model in it, so a fabricated quote fails mechanically.
 *
 * Canonicalization (applied identically to source and quote) is limited to
 * the rubric's list: Unicode NFC, a fixed one-to-one map of typographic
 * characters (curly quotes, dashes, no-break space), removal of soft hyphens,
 * and collapsing whitespace. It never changes, drops or reorders a word: no
 * case folding, no punctuation stripping. A quote that only matches under
 * anything looser fails.
 *
 * On top of the substring test, claim–quote consistency checks catch a real
 * quote paired with a claim it does not support: every number, full date and
 * identifier in the claim must appear in the quotes, and a quote or opinion
 * must sit near its named speaker in the source.
 *
 * Parameters come from config/credibility-rubric.yaml via rubric.guardConfig().
 */

// ---------------------------------------------------------------------------
// Canonicalization
// ---------------------------------------------------------------------------

export function makeCanon(cfg) {
  const map = new Map(Object.entries(cfg.typographic ?? {}))
  const remove = new Set(cfg.remove ?? [])
  return function canon(s) {
    let out = ''
    for (const ch of String(s ?? '').normalize('NFC')) {
      if (remove.has(ch)) continue
      out += map.get(ch) ?? ch
    }
    return out.replace(/\s+/g, ' ').trim()
  }
}

/** Pre-computes what the checks need from one source text. */
export function prepareSource(raw, cfg, meta = {}) {
  const canon = makeCanon(cfg)
  const c = canon(raw)
  return {
    raw: String(raw ?? ''),
    canon: c,
    numbers: numberSet(c, { includeWords: true }),
    dates: dateIndex(c),
    times: new Set(extractTimes(c).map(t => t.value)),
    meta,
  }
}

export function countWords(s) {
  return (String(s).match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) ?? []).length
}

const WORD_CHAR = /[\p{L}\p{N}]/u

/**
 * Offsets where `needle` occurs in `hay` on word boundaries: a match may not
 * begin or end inside a word, so "citizen" does not match inside "citizens"
 * and "HB551" does not match inside "HB5513".
 */
export function occurrences(hay, needle) {
  if (!needle) return []
  const out = []
  const startsWord = WORD_CHAR.test(needle[0])
  const endsWord = WORD_CHAR.test(needle.at(-1))
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {
    if (startsWord && i > 0 && WORD_CHAR.test(hay[i - 1])) continue
    const end = i + needle.length
    if (endsWord && end < hay.length && WORD_CHAR.test(hay[end])) continue
    out.push(i)
  }
  return out
}

const contains = (hay, needle) => occurrences(hay, needle).length > 0

// ---------------------------------------------------------------------------
// Quote check
// ---------------------------------------------------------------------------

/**
 * Checks one supporting quote against one prepared source.
 * Returns { ok, reason?, match: 'exact'|'canonical', offset, occurrences }.
 *   exact      the raw quote appears byte for byte in the raw source
 *   canonical  it appears only after canonicalizing both sides
 */
export function checkQuote(quote, source, cfg) {
  const canon = makeCanon(cfg)
  if (typeof quote !== 'string' || !quote.trim()) return { ok: false, reason: 'empty_quote' }
  for (const bad of cfg.rejectIfContains ?? []) {
    if (quote.includes(bad)) return { ok: false, reason: 'contains_rejected_sequence', detail: bad }
  }
  const q = canon(quote)
  if (q.length < cfg.minChars) return { ok: false, reason: 'too_short', detail: `${q.length} < ${cfg.minChars} chars` }
  if (q.length > cfg.maxChars) return { ok: false, reason: 'too_long', detail: `${q.length} > ${cfg.maxChars} chars` }
  const words = countWords(q)
  if (words < cfg.minWords) return { ok: false, reason: 'too_few_words', detail: `${words} < ${cfg.minWords} words` }

  const hits = occurrences(source.canon, q)
  if (!hits.length) return { ok: false, reason: 'not_found', nearest: nearestSpan(q, source.canon) }
  return {
    ok: true,
    match: contains(source.raw, quote) ? 'exact' : 'canonical',
    offset: hits[0],
    occurrences: hits.length,
  }
}

// ---------------------------------------------------------------------------
// Numbers, dates, identifiers
// ---------------------------------------------------------------------------

const MONTHS = [
  ['january', 'jan'], ['february', 'feb'], ['march', 'mar'], ['april', 'apr'], ['may'],
  ['june', 'jun'], ['july', 'jul'], ['august', 'aug'], ['september', 'sept', 'sep'],
  ['october', 'oct'], ['november', 'nov'], ['december', 'dec'],
]
const MONTH_OF = new Map(MONTHS.flatMap((names, i) => names.map(n => [n, i + 1])))
const MONTH_RE = MONTHS.flat().sort((a, b) => b.length - a.length).join('|')

/**
 * Full dates only (a month with a day). Month-and-year alone ("June 2026") is
 * not checked: it is too coarse to tell a supported date from an invented one.
 */
export function extractDates(text) {
  const s = String(text)
  const out = []
  const push = (m, d, y, index, length) => {
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) out.push({ month: m, day: d, year: y ?? null, index, length, text: s.slice(index, index + length) })
  }
  // March 5, 2026 / Mar. 5 / Sept. 5th, 2026
  const named = new RegExp(`\\b(${MONTH_RE})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?!\\d)(?:,?\\s+(\\d{4})(?!\\d))?`, 'gi')
  for (const m of s.matchAll(named)) push(MONTH_OF.get(m[1].toLowerCase()), +m[2], m[3] ? +m[3] : null, m.index, m[0].length)
  // 5 March 2026
  const dayFirst = new RegExp(`\\b(\\d{1,2})\\s+(${MONTH_RE})\\.?,?\\s+(\\d{4})(?!\\d)`, 'gi')
  for (const m of s.matchAll(dayFirst)) push(MONTH_OF.get(m[2].toLowerCase()), +m[1], +m[3], m.index, m[0].length)
  // 2026-03-05
  for (const m of s.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) push(+m[2], +m[3], +m[1], m.index, m[0].length)
  // 3/5/2026 or 3/5/26 (a year is required, so fractions are not read as dates)
  for (const m of s.matchAll(/(?<![\d/])(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(?![\d/])/g)) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]
    push(+m[1], +m[2], y, m.index, m[0].length)
  }
  return out
}

function dateIndex(text) {
  const idx = new Map()
  for (const d of extractDates(text)) {
    const k = `${d.month}-${d.day}`
    if (!idx.has(k)) idx.set(k, new Set())
    idx.get(k).add(d.year)
  }
  return idx
}

/** A claim date is supported if the month and day match and the years agree,
 *  or the source states the month and day without a year. */
function dateSupported(d, index) {
  const years = index.get(`${d.month}-${d.day}`)
  if (!years) return false
  return d.year === null || years.has(d.year) || years.has(null)
}

/** Clock times ("9 a.m.", "9:00 a.m.", "6:29 PM"), normalized to "9:00am". */
export function extractTimes(text) {
  const re = /(?<![\d:])(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s?m\b\.?/gi
  return [...String(text).matchAll(re)]
    .filter(m => +m[1] >= 1 && +m[1] <= 12)
    .map(m => ({ value: `${+m[1]}:${m[2] ?? '00'}${m[3].toLowerCase()}m`, text: m[0], index: m.index, length: m[0].length }))
}

const IDENT_RE = /\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{4,}\b/g
export function extractIdentifiers(text) {
  return [...String(text).matchAll(IDENT_RE)].map(m => ({ value: m[0], index: m.index, length: m[0].length }))
}

/** Replaces each span with spaces of the same length, so indices still line up. */
function blank(text, spans) {
  let out = String(text)
  for (const { index, length } of spans) out = out.slice(0, index) + ' '.repeat(length) + out.slice(index + length)
  return out
}

const NUM_RE = /(?<![\p{L}\p{N}.,])(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(?!\p{N})/gu

function normNumber(intPart, decPart) {
  const i = intPart.replace(/,/g, '').replace(/^0+(?=\d)/, '')
  const d = (decPart ?? '').replace(/0+$/, '')
  return d ? `${i}.${d}` : i
}

/**
 * Numbers in the text, with full dates and identifiers taken out first so
 * "July 31, 2026" is checked as a date and "2026CH00000171" as an identifier.
 */
export function extractNumbers(text) {
  const s = String(text)
  const masked = blank(s, [...extractDates(s), ...extractTimes(s), ...extractIdentifiers(s)])
  return [...masked.matchAll(NUM_RE)].map(m => ({ value: normNumber(m[1], m[2]), text: m[0], index: m.index }))
}

const WORD_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90,
}
const WORD_NUM_RE = new RegExp(`\\b(${Object.keys(WORD_NUMBERS).join('|')})(?:-(one|two|three|four|five|six|seven|eight|nine))?\\b`, 'gi')

/** Every number a text states, including dates' parts and spelled-out numbers,
 *  so a claim's "8" is supported by a source's "eight". Source side only. */
function numberSet(text, { includeWords }) {
  const set = new Set()
  for (const m of String(text).matchAll(NUM_RE)) set.add(normNumber(m[1], m[2]))
  if (includeWords) {
    for (const m of String(text).matchAll(WORD_NUM_RE)) {
      set.add(String(WORD_NUMBERS[m[1].toLowerCase()] + (m[2] ? WORD_NUMBERS[m[2].toLowerCase()] : 0)))
    }
  }
  return set
}

// ---------------------------------------------------------------------------
// Speaker proximity
// ---------------------------------------------------------------------------

// Leading place qualifiers ("Illinois State Rep.") are stripped with titles.
const QUALIFIERS = /^(illinois|u\.s\.|us|lake county|grayslake)\s+/i
const TITLES = /^(mayor|trustee|rep\.?|representative|sen\.?|senator|gov\.?|governor|dr\.?|mr\.?|ms\.?|mrs\.?|ceo|president|chair(?:man|woman)?|commissioner|judge|director|executive director|state rep\.?|state sen\.?|state representative|state senator|board member|district \d+ board member)\s+/i
const ORG_WORDS = /\b(village|county|board|commission|court|council|department|agency|inc|llc|lp|company|corp|corporation|district|township|association|group|state|office)\b/i
const GENERIC = new Set(['Village', 'County', 'Board', 'Lake', 'Illinois', 'Department', 'Commission', 'Office', 'State', 'Data', 'Center', 'Centers', 'Company', 'District', 'Township', 'The', 'Of', 'LLC', 'Inc', 'Inc.', 'LP', 'Corp', 'Corp.', 'Corporation'])

/** The token that should appear near a quote: a person's surname, or an
 *  organisation's most distinctive capitalised word. */
export function speakerToken(speaker) {
  let s = String(speaker ?? '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/,.*$/, '').trim()
  let titled = false
  for (;;) {
    if (TITLES.test(s)) { s = s.replace(TITLES, ''); titled = true; continue }
    if (QUALIFIERS.test(s) && s.split(/\s+/).length > 2) { s = s.replace(QUALIFIERS, ''); continue }
    break
  }
  if (!s) return null
  // A title ("Mayor", "Rep.") means a person, whatever words follow.
  if (!titled && ORG_WORDS.test(s)) {
    const words = s.split(/\s+/).filter(w => /^[A-Z0-9]/.test(w) && !GENERIC.has(w))
    return words.sort((a, b) => b.length - a.length)[0] ?? s
  }
  const parts = s.split(/\s+/).filter(w => !/^(jr\.?|sr\.?|ii|iii|iv)$/i.test(w))
  return parts.at(-1)
}

export function checkSpeaker(speaker, quoteResult, quoteCanonLength, source, window) {
  const token = speakerToken(speaker)
  if (!token) return { ok: false, reason: 'no_speaker_token' }
  const from = Math.max(0, quoteResult.offset - window)
  const to = Math.min(source.canon.length, quoteResult.offset + quoteCanonLength + window)
  const near = source.canon.slice(from, to)
  const re = new RegExp(`(?<![\\p{L}])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'u')
  return re.test(near) ? { ok: true, token } : { ok: false, reason: 'speaker_not_near_quote', token }
}

// ---------------------------------------------------------------------------
// Claim check (extracted claims, Stage C)
// ---------------------------------------------------------------------------

/**
 * claim: { claim_text, claim_type, speaker, supporting_quotes[], event_date, date_basis }
 * source: prepareSource(...)
 * opts.docDate: { month, day, year } of the document, if known
 *
 * Returns { ok, failures[], quotes[] }. Any failure drops the claim.
 */
export function checkClaim(claim, source, cfg, opts = {}) {
  const canon = makeCanon(cfg)
  const failures = []
  const quotes = Array.isArray(claim?.supporting_quotes) ? claim.supporting_quotes : []
  if (!quotes.length) failures.push({ check: 'quote', reason: 'no_supporting_quote' })

  const results = quotes.map(q => ({ quote: q, ...checkQuote(q, source, cfg) }))
  for (const r of results) if (!r.ok) failures.push({ check: 'quote', reason: r.reason, value: r.quote, detail: r.detail, nearest: r.nearest })

  const passed = results.filter(r => r.ok)
  const evidence = prepareSource(passed.map(r => r.quote).join('\n'), cfg)
  const text = String(claim?.claim_text ?? '')

  for (const n of extractNumbers(text)) {
    if (!evidence.numbers.has(n.value)) failures.push({ check: 'number', reason: 'number_not_in_quotes', value: n.text })
  }
  for (const d of extractDates(text)) {
    if (dateSupported(d, evidence.dates)) continue
    if (opts.docDate && sameDate(d, opts.docDate)) continue
    failures.push({ check: 'date', reason: 'date_not_in_quotes', value: d.text })
  }
  for (const id of extractIdentifiers(text)) {
    if (!contains(evidence.canon, id.value)) failures.push({ check: 'identifier', reason: 'identifier_not_in_quotes', value: id.value })
  }
  for (const t of extractTimes(text)) {
    if (!evidence.times.has(t.value)) failures.push({ check: 'time', reason: 'time_not_in_quotes', value: t.text })
  }

  failures.push(...checkEventDate(claim, evidence, opts))

  if (['quote', 'opinion'].includes(claim?.claim_type)) {
    if (!claim.speaker) failures.push({ check: 'speaker', reason: 'quote_or_opinion_without_speaker' })
    else if (passed.length) {
      const anyNear = passed.some(r => checkSpeaker(claim.speaker, r, canon(r.quote).length, source, cfg.speakerWindow).ok)
      if (!anyNear) failures.push({ check: 'speaker', reason: 'speaker_not_near_quote', value: claim.speaker, detail: speakerToken(claim.speaker) })
    }
  }
  return { ok: failures.length === 0, failures, quotes: results }
}

function sameDate(a, b) {
  return a.month === b.month && a.day === b.day && (a.year == null || b.year == null || a.year === b.year)
}

function checkEventDate(claim, evidence, opts) {
  const ev = claim?.event_date
  const basis = claim?.date_basis
  if (ev == null) return []
  if (basis === 'unknown') return [{ check: 'event_date', reason: 'event_date_with_unknown_basis', value: ev }]
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ev)
  if (!m) return []                      // month precision: not checked
  const d = { year: +m[1], month: +m[2], day: +m[3] }
  if (basis === 'document_date') {
    return opts.docDate && sameDate(d, opts.docDate) ? [] : [{ check: 'event_date', reason: 'event_date_not_document_date', value: ev }]
  }
  return dateSupported(d, evidence.dates) ? [] : [{ check: 'event_date', reason: 'event_date_not_in_quotes', value: ev }]
}

// ---------------------------------------------------------------------------
// Draft prose check (generated descriptions; also run on the owner's entries)
// ---------------------------------------------------------------------------

const ALLEGATION_MARKERS = /\balleg|\bcomplaint\b|\blawsuit\b|\bplaintiffs?\b|\bsued\b|\bsuit\b|\basks the court\b|\baccus|\bpetition/i

function quotationVariants(q) {
  const out = []
  const trimmed = q.replace(/[.,;:!?]$/, '')
  const swap = t => {
    const c = t[0]
    const s = c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()
    return s === c ? null : s + t.slice(1)
  }
  if (trimmed !== q && trimmed) out.push({ text: trimmed, differs: 'final punctuation inside the quotation marks' })
  if (swap(q)) out.push({ text: swap(q), differs: 'the case of the first letter' })
  if (trimmed !== q && trimmed && swap(trimmed)) out.push({ text: swap(trimmed), differs: 'the case of the first letter and final punctuation' })
  return out
}

/** Text inside double quotation marks, curly or straight. */
export function quotedSpans(text) {
  const s = String(text)
  const out = []
  for (const m of s.matchAll(/“([^”]+)”/g)) out.push({ value: m[1], index: m.index })
  for (const m of s.matchAll(/"([^"]+)"/g)) out.push({ value: m[1], index: m.index })
  return out
}

/**
 * Checks prose against evidence. In Stage C the evidence is the verified
 * quotes; in the timeline audit it is the full text of each cited source.
 *
 * opts.evidence      prepared sources (array)
 * opts.docDates      [{month, day, year}] document dates that may be cited
 * opts.allegation    true if the prose reports allegations
 * opts.blockedTerms  [{term, reason}] that must not appear
 * opts.requiredAttribution [{label, test: RegExp}] that must each match
 */
export function checkDraftProse(text, cfg, opts = {}) {
  const canon = makeCanon(cfg)
  const evidence = opts.evidence ?? []
  const failures = []
  const notes = []
  const s = String(text ?? '')

  for (const span of quotedSpans(s)) {
    if (/\.\.\.|…/.test(span.value)) {
      failures.push({ check: 'quotation', reason: 'elision_in_quotation', value: span.value })
      continue
    }
    const q = canon(span.value)
    if (evidence.some(e => contains(e.canon, q))) continue
    // Two quoting conventions change a quotation without changing its words:
    // American style puts a closing period or comma inside the quotation
    // marks whatever the source had there, and a quotation worked into a
    // sentence may change the case of its first letter. Only those two
    // characters may differ, and the result says which.
    const variants = quotationVariants(q)
    const hit = variants.find(v => evidence.some(e => contains(e.canon, v.text)))
    if (hit) {
      notes.push({ check: 'quotation', note: `matches except for ${hit.differs}`, value: span.value })
      continue
    }
    const best = evidence.map(e => nearestSpan(q, e.canon)).filter(Boolean).sort((a, b) => b.score - a.score)[0]
    failures.push({ check: 'quotation', reason: 'quotation_not_in_source', value: span.value, nearest: best })
  }

  const allNumbers = new Set(evidence.flatMap(e => [...e.numbers]))
  for (const n of extractNumbers(s)) {
    if (!allNumbers.has(n.value)) failures.push({ check: 'number', reason: 'number_not_in_source', value: n.text })
  }

  for (const d of extractDates(s)) {
    if (evidence.some(e => dateSupported(d, e.dates))) continue
    const docMatch = (opts.docDates ?? []).find(dd => sameDate(d, dd))
    if (docMatch) { notes.push({ check: 'date', note: 'matches the document date, not the text', value: d.text }); continue }
    failures.push({ check: 'date', reason: 'date_not_in_source', value: d.text })
  }

  for (const id of extractIdentifiers(s)) {
    if (!evidence.some(e => contains(e.canon, id.value))) failures.push({ check: 'identifier', reason: 'identifier_not_in_source', value: id.value })
  }

  for (const t of extractTimes(s)) {
    if (!evidence.some(e => e.times.has(t.value))) failures.push({ check: 'time', reason: 'time_not_in_source', value: t.text })
  }

  if (opts.allegation && !ALLEGATION_MARKERS.test(s)) {
    failures.push({ check: 'allegation', reason: 'allegation_without_attribution' })
  }

  // Outside quotation marks the text must be the tracker's own words: no run
  // of `noUnquotedCopy` words copied from the evidence (that is a quotation
  // without quotation marks, and for news a copyright problem), and no first
  // person ("I attended", "our attorney"), which can only be someone else's.
  if (opts.noUnquotedCopy || opts.noFirstPerson) {
    const outside = s.replace(/“[^”]*”/g, ' ‖ ').replace(/"[^"]*"/g, ' ‖ ')
    if (opts.noFirstPerson) {
      const fp = outside.match(/(?<![\p{L}])(I|I['’](?:ve|m|d|ll)|we|we['’](?:ve|re|d|ll)|our|ours|us|my|me)(?![\p{L}])/giu)
      // "US" in capitals is the country, not "us".
      const real = (fp ?? []).filter(w => w !== 'US')
      if (real.length) failures.push({ check: 'voice', reason: 'first_person_outside_quotation', value: [...new Set(real)].join(', ') })
    }
    if (opts.noUnquotedCopy) {
      const n = opts.noUnquotedCopy
      // The marker left where a quotation was stays a word, so a run never spans it.
      const words = canon(outside).split(' ').filter(Boolean)
      const hay = evidence.map(e => ' ' + e.canon.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ') + ' ')
      const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
      for (let i = 0; i + n <= words.length; i++) {
        const run = words.slice(i, i + n).map(norm).filter(Boolean)
        if (run.length < n) continue
        if (hay.some(h => h.includes(' ' + run.join(' ') + ' '))) {
          failures.push({ check: 'voice', reason: 'unquoted_copy', value: words.slice(i, i + n).join(' ') })
          break
        }
      }
    }
  }

  // Attribution the text must carry: a party's claims ("T5 stated", "the
  // complaint alleges"), or an outlet's ("reported by").
  for (const r of opts.requiredAttribution ?? []) {
    if (!r.test.test(s)) failures.push({ check: 'attribution', reason: 'missing_required_attribution', value: r.label })
  }

  for (const b of opts.blockedTerms ?? []) {
    if (s.toLowerCase().includes(String(b.term).toLowerCase())) failures.push({ check: 'blocked_term', reason: 'blocked_term', value: b.term, detail: b.reason })
  }

  return { ok: failures.length === 0, failures, notes }
}

// ---------------------------------------------------------------------------
// Debugging aid: never used to pass anything.
// ---------------------------------------------------------------------------

/** The window of the source with the most words in common with the needle. */
export function nearestSpan(needle, hay) {
  const tok = s => [...String(s).matchAll(/[\p{L}\p{N}]+/gu)].map(m => ({ w: m[0].toLowerCase(), i: m.index, end: m.index + m[0].length }))
  const n = tok(needle)
  const h = tok(hay)
  if (!n.length || !h.length) return null
  const want = new Map()
  for (const t of n) want.set(t.w, (want.get(t.w) ?? 0) + 1)
  let best = null
  for (let start = 0; start < h.length; start++) {
    if (!want.has(h[start].w)) continue
    const end = Math.min(h.length, start + n.length)
    const seen = new Map()
    let score = 0
    for (let j = start; j < end; j++) {
      const w = h[j].w
      const c = seen.get(w) ?? 0
      if (c < (want.get(w) ?? 0)) { score++; seen.set(w, c + 1) }
    }
    if (!best || score > best.score) best = { score, start, end }
    if (score === n.length) break
  }
  if (!best) return null   // no word in common
  const text = hay.slice(h[best.start].i, h[best.end - 1].end)
  return { score: best.score / n.length, text }
}
