/**
 * Drafting: turns one item's scored, guard-passed claims into entries in the
 * src/data formats (timeline.js, sources.js, updates.js, and actions.js for a
 * Tier 1 government action).
 *
 * The model writes the title and description, and only from the verified
 * claims, each tagged with how it may be written (state as fact, attribute,
 * "reported by", "T5 stated", alleged). The result then goes through the same
 * verbatim guard as the claims (guard.checkDraftProse): every quotation, number,
 * date, time and identifier must appear in the verified quotes, required
 * attributions must be present, blocked terms must be absent. One retry with
 * the failures listed; if it still fails, the draft has no prose and the PR
 * shows the claims only.
 *
 * Code, not the model, sets the entry date (from verified claim dates, else
 * the document date), the source key, the source record and the updates line.
 */
import Ajv from 'ajv'
import { generateValidated } from './extract.mjs'
import { prepareSource, checkDraftProse, extractDates } from './guard.mjs'
import { requiredAttribution } from './party.mjs'
import { CATEGORIES, renderTimelineEntry, renderSourceEntry, renderUpdateEntry, renderActionEntry, validateDraft } from './render.mjs'

const DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'category'],
  properties: {
    title: { type: 'string', minLength: 10, maxLength: 110 },
    description: { type: 'string', minLength: 40, maxLength: 1400 },
    category: { type: 'string', enum: CATEGORIES },
  },
}
const validateDraftJson = new Ajv({ strict: false }).compile(DRAFT_SCHEMA)

const MONTHS_AP = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']
export function apDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${MONTHS_AP[+m[2] - 1]} ${+m[3]}, ${m[1]}` : null
}

// Dates in the site's prose read "July 31, 2026"; date fields stay ISO.
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export function proseDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m && MONTHS_FULL[+m[2] - 1] && +m[3] >= 1 && +m[3] <= 31 ? `${MONTHS_FULL[+m[2] - 1]} ${+m[3]}, ${m[1]}` : null
}

/** ISO dates in prose become "July 31, 2026"; text inside quotation marks is left as quoted. */
export function proseDates(s) {
  return String(s ?? '').split(/(“[^”]*”|"[^"]*")/).map((part, i) => i % 2
    ? part
    : part.replace(/\b\d{4}-\d{2}-\d{2}\b/g, iso => proseDate(iso) ?? iso)).join('')
}

/** How a claim may be written, from its outcome and type. */
export function instructionFor(c, item) {
  if (c.claim_type === 'allegation') return `ALLEGATION by ${c.speaker ?? 'the filer'}: write it as alleged ("the complaint alleges ...", "${c.speaker ?? 'the plaintiffs'} allege ..."), never as fact`
  if (c.claim_type === 'party_statement') return `PARTY STATEMENT by ${c.speaker}: write "${c.speaker.split(' ')[0]} stated ..." or "according to ${c.speaker.split(' ')[0]}", never as fact`
  if (c.outcome === 'draft_as_reported' || c.outcome === 'redraft_from_corroborating_source') return `REPORTED BY ${item.publisher}: write "${item.publisher} reported ..." or "according to ${item.publisher}"`
  if (['quote', 'opinion'].includes(c.claim_type)) return `ATTRIBUTE to ${c.speaker}: say who said it`
  if (c.claim_type === 'projection') return `PROJECTION by ${c.speaker ?? item.publisher}: say it is a projection or plan and whose`
  return 'STATE AS FACT'
}

const SYSTEM = `You write one entry for the timeline of a neutral public-records tracker about the T5 @ Chicago IV data center campus in Grayslake, Illinois.

Write only from the claims you are given. Each claim has an instruction for how it may be written; follow it exactly. Do not add facts, context, numbers, dates or names that are not in the claims' quotes. Keep the tracker's style: plain, past tense, no adjectives of judgement, attribute anything that is not stated as fact, say what a measure does not cover when the claims say so.

Rules:
- Any words inside quotation marks must be copied exactly from a quote, with “ and ” around them.
- Every number, date and name you write must appear in the quotes.
- Write dates as "July 31, 2026", never "2026-07-31".
- The name "POWER Act" is a label the bill text does not use. Use it only if a quote does, only in quotation marks, always with HB5513, and add the sentence "The bill text does not use the name." For example: the so-called “POWER Act” (HB5513). The bill text does not use the name. SB4016 is the Senate bill with an identical synopsis; name it by number only, and never put it in the same sentence as the name unless you say that advocacy groups make that link.
- Never name a private individual: call an individual plaintiff "a plaintiff". Never include anyone's health, medical, address or family details. Public officials may be named in their official role.
- Write in your own words. Anything copied from a quote goes inside quotation marks; never copy a long passage without them.
- Never write in the first person (I, we, our, us, my) outside quotation marks.
- title: a short sentence-case headline, no final period.
- description: one paragraph.
- category: one of approval, opposition, development, construction, legal, policy.
Return JSON only.`

function claimsBlock(claims, item) {
  return claims.map((c, i) => [
    `Claim ${i + 1}: ${c.claim_text}`,
    `  Instruction: ${instructionFor(c, item)}`,
    ...c.supporting_quotes.map(q => `  Quote: "${q}"`),
  ].join('\n')).join('\n\n')
}

function examplesBlock(examples) {
  return examples.map(e => `Example (category ${e.category}):\nTitle: ${e.title}\nDescription: ${e.description}`).join('\n\n')
}

/**
 * Title and description for one ilga.gov bill action, from the item title
 * "HB5513 3/27/2026 House: <action>". The action is quoted whole; the bill is
 * named by number only: the ilga.gov row never uses the "POWER Act" label.
 */
export function billTemplate(item) {
  const m = /^([A-Z]{2}\d+) (\d{1,2})\/(\d{1,2})\/(\d{4}) (\w+): (.+)$/.exec(item.title ?? '')
  if (!m) return null
  const [, bill, mo, dd, yy, chamber, action] = m
  const iso = `${yy}-${mo.padStart(2, '0')}-${dd.padStart(2, '0')}`
  return {
    title: `${bill}: ${action}`.slice(0, 110),
    description: `The Illinois General Assembly’s bill status page for ${bill} records this ${chamber} action on ${proseDate(iso)}: “${action}”.`,
    category: 'policy',
  }
}

/** Straight double quotes in pairs become curly ones; a lone quote is left alone. */
export function curlyQuotes(s) {
  return String(s ?? "").replace(/"([^"]+)"/g, "“$1”")
}

/** Most common verified full event date, else the document date. */
export function entryDate(claims, docIso, { party } = {}) {
  const doc = /^\d{4}-\d{2}-\d{2}/.test(docIso ?? '') ? docIso.slice(0, 10) : null
  // A court filing is an event on its filing date, not on the dates it
  // describes (which reach back to 2024).
  if (party?.kind === 'court_filing' && doc) return { date: doc, basis: 'filing date (a court filing is dated when filed)' }
  const counts = new Map()
  for (const c of claims) {
    if (c.date_basis !== 'stated_in_text' || !/^\d{4}-\d{2}-\d{2}$/.test(c.event_date ?? '')) continue
    // A date after the document's own date is something scheduled (a hearing
    // set for later), not the event the document reports.
    if (doc && c.event_date > doc) continue
    counts.set(c.event_date, (counts.get(c.event_date) ?? 0) + 1)
  }
  if (counts.size) {
    const [date] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
    return { date, basis: 'event date stated in the quotes' }
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(docIso ?? '')) return { date: docIso.slice(0, 10), basis: 'document date (no event date stated); written as "reported on" if needed' }
  return { date: null, basis: 'no date' }
}

/** The guard's options for this draft's prose. */
export function guardOptions(claims, item, blockedTerms, labeledTerms = []) {
  const evidence = [prepareSource(claims.flatMap(c => c.supporting_quotes).join('\n'), item.guardCfg)]
  const docDates = item.published ? extractDates(item.published.slice(0, 10)) : []
  const req = []
  if (item.party) req.push(...requiredAttribution(item.party))
  if (claims.some(c => c.outcome === 'draft_as_reported')) {
    const name = item.publisher.replace(/^the\s+/i, '')
    req.push({ label: `"${name} reported" or "according to ${name}"`, test: new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}[^.]{0,40}\\b(reported|reports|wrote)\\b|according to (the )?${name.replace(/\s+/g, '\\s+')}`, 'i') })
  }
  // Unquoted copying: 12 words for news and party sources (copyright,
  // attribution); 20 for Tier 1 public records, whose wording may be reused
  // but still not at length without quotation marks.
  const copyLimit = item.effectiveTier === 1 && !item.party ? 20 : 12
  return { evidence, docDates, allegation: claims.some(c => c.claim_type === 'allegation'), requiredAttribution: req, blockedTerms, labeledTerms, noUnquotedCopy: copyLimit, noFirstPerson: true }
}

const KEY_PREFIX = {
  'village-grayslake': 'grayslake', 'village-grayslake-youtube': 'grayslakeVideo', 'lake-county': 'lakeCounty', 'lake-county-legistar': 'lakeCounty',
  ilga: 'ilga', 'daily-herald': 'dailyherald', 'chicago-tribune': 'chitrib', 'capitol-news-illinois': 'capitolnews', 'chicago-sun-times': 'suntimes',
  'crains-chicago': 'crains', 'lake-mchenry-scanner': 'scanner', 'chronicle-media': 'chronicle', 't5-data-centers': 't5', clcjawa: 'clcjawa', mundelein: 'mundelein',
}
const TOPIC_STOP = new Set('the and for with from that this into over after about village county board grayslake lake data center centers campus t5 chicago new first'.split(' '))

export function sourceKeyFor(item, title, existing) {
  const prefix = KEY_PREFIX[item.registryId] ?? (item.registryId ?? 'source').replace(/-(\w)/g, (_, c) => c.toUpperCase())
  const word = (title.match(/[A-Za-z]{4,}/g) ?? []).find(w => !TOPIC_STOP.has(w.toLowerCase())) ?? 'Item'
  const year = (item.published ?? '').slice(0, 4) || String(new Date().getFullYear())
  let key = `${prefix}${word[0].toUpperCase()}${word.slice(1).toLowerCase()}${year}`
  if (existing[key]) key = `${key}_${(item.published ?? '').slice(5, 10).replace('-', '')}`
  let n = 2
  while (existing[key]) key = `${key.replace(/_\d+$/, '')}_${n++}`
  return key
}

function sourceRecord(item, title) {
  const category = item.partyKind === 'court_filing' || item.registryCategory === 'court' ? 'court'
    : item.effectiveTier === 1 && (!item.party || item.party.channel === 'litigation_party') ? 'government' : 'news'
  // Tier 2 is per article: record whether this article has a named reporter.
  // The Documents label comes from the registry and this field, not from here.
  const byline = item.registryTier === 2
    ? (item.effectiveTier === 2 && item.byline
      ? { name: String(item.byline), status: 'confirmed', archivedCopy: item.rawPath ?? undefined, sha256: item.rawSha256 ?? undefined }
      : { status: 'unverified', reason: 'no named byline on the article as fetched' })
    : undefined
  return {
    category,
    title: item.title || title,
    publisher: item.publisher,
    author: item.registryTier >= 2 && item.byline ? item.byline : undefined,
    date: apDate(item.published) ?? undefined,
    url: item.url,
    archiveUrl: item.snapshot?.verified ? item.snapshot.snapshotUrl : undefined,
    byline,
  }
}

const JURISDICTION = { 'village-grayslake': 'Village of Grayslake', 'lake-county': 'Lake County Board', 'lake-county-legistar': 'Lake County Board', ilga: 'State of Illinois', mundelein: 'Village of Mundelein' }
const ACTION_TYPE = { approval: 'Land-Use Approval', construction: 'Building Permit', legal: 'Legal Challenge', policy: 'Policy Change', development: 'Official Statement', opposition: 'Official Statement' }

/**
 * Drafts one item. ctx: { provider, examples, sources, cited (canon url → key),
 * blockedTerms, labeledTerms, today (ISO), canonUrl }
 */
export async function draftItem(item, claims, ctx) {
  const date = entryDate(claims, item.published, { party: item.party })
  const opts = guardOptions(claims, item, ctx.blockedTerms, ctx.labeledTerms)
  const user0 = `${examplesBlock(ctx.examples)}\n\nDocument: ${item.title} (${item.publisher}${item.published ? ', ' + (proseDate(item.published) ?? item.published.slice(0, 10)) : ''})\nEntry date: ${proseDate(date.date) ?? 'unknown'}\n\n${claimsBlock(claims, item)}`
  const attempts = []
  let prose = null
  let failures = []
  // D-4: a bill milestone is written by code from a template, not by the
  // model, with the ilga.gov action quoted whole.
  if (item.fetcher === 'ilga-bills') {
    const t = billTemplate(item)
    if (t) {
      const g = checkDraftProse(`${t.title}. ${t.description}`, item.guardCfg, { ...opts, noUnquotedCopy: 0 })
      attempts.push({ attempt: 1, template: true, title: t.title, guard: g.ok, failures: g.failures, notes: g.notes })
      if (g.ok) prose = { ...t, guardNotes: g.notes }
    }
  }
  for (let attempt = 1; attempt <= 2 && !prose && item.fetcher !== 'ilga-bills'; attempt++) {
    const note = attempt === 2
      ? `\n\nYour previous draft failed these checks; fix every one:\n${failures.map(f => `- ${f.check}: ${f.reason}${f.value ? ` (${JSON.stringify(f.value)})` : ''}`).join('\n')}`
      : ''
    const r = await generateValidated(ctx.provider, { system: SYSTEM, user: user0 + note, schema: DRAFT_SCHEMA, validator: validateDraftJson, label: `draft ${item.id}` })
    if (!r.ok) { attempts.push({ attempt, schemaErrors: r.errors }); failures = r.errors.map(e => ({ check: 'schema', reason: e })); continue }
    // House style: curly quotation marks. Done in code, before the guard, so
    // the guard checks exactly the text that would be published.
    // Dates likewise: "2026-07-31" in prose becomes "July 31, 2026".
    r.data.title = proseDates(curlyQuotes(r.data.title))
    r.data.description = proseDates(curlyQuotes(r.data.description))
    const g = checkDraftProse(`${r.data.title}. ${r.data.description}`, item.guardCfg, opts)
    attempts.push({ attempt, title: r.data.title, guard: g.ok, failures: g.failures, notes: g.notes })
    if (g.ok) prose = { ...r.data, guardNotes: g.notes }
    else failures = g.failures
  }

  const draft = {
    itemId: item.id, url: item.url, tier: item.registryTier, effectiveTier: item.effectiveTier, registry: item.registryId,
    party: item.party ?? null, date, attempts,
    claims: claims.map(c => ({ claim_text: c.claim_text, claim_type: c.claim_type, relabeled: c.relabeled ?? null, speaker: c.speaker, outcome: c.outcome, rule: c.rule, labels: c.labels, quotes: c.supporting_quotes, guardMatch: c.guardMatch, instruction: instructionFor(c, item) })),
    status: prose ? 'ready' : 'claims_only',
    guard: prose ? 'pass' : 'fail',
  }
  // D-2: a draft that names a private person or gives health, address or
  // family details goes to human review, not to a PR.
  if (prose && ctx.privacy) {
    const pv = ctx.privacy.check(`${prose.title}. ${prose.description}`)
    if (!pv.ok) {
      Object.assign(draft, { status: 'human_review', privacy: pv.failures, heldProse: { title: prose.title, description: prose.description } })
      return draft
    }
  }
  if (!prose || !date.date) {
    if (!date.date) draft.status = 'claims_only'
    return draft
  }

  // Source: reuse a key the site already has for this URL, else a new record.
  const canon = ctx.canonUrl(item.url)
  let sourceKey = item.sourceKey ?? ctx.cited.get(canon) ?? null
  let source = null
  if (!sourceKey) {
    sourceKey = sourceKeyFor(item, prose.title, ctx.sources)
    source = sourceRecord(item, prose.title)
  }
  const entry = { date: date.date, title: prose.title, description: prose.description, category: prose.category, sourceKey }
  const update = {
    date: ctx.today, kind: 'added',
    title: `Added to the timeline: ${prose.title}`,
    description: `The timeline now includes an entry dated ${proseDate(date.date) ?? date.date}, citing ${item.publisher}.`,
    link: '/timeline', linkLabel: 'See the timeline',
  }
  // The updates line is generated text too, so it gets the same check. It is
  // built by code from the entry and the item metadata, so those are its
  // evidence (a publisher name can hold a number no quote has, e.g. "19th
  // Judicial Circuit").
  const meta = prepareSource([item.publisher, prose.title, date.date].join('\n'), item.guardCfg)
  // No copy check here: the line names the publisher, which is copied by design.
  const ug = checkDraftProse(`${update.title}. ${update.description}`, item.guardCfg, { ...opts, evidence: [...opts.evidence, meta], docDates: [...opts.docDates, ...extractDates(date.date ?? '')], requiredAttribution: [], noUnquotedCopy: 0 })
  let action = null
  if (item.effectiveTier === 1 && !item.party && JURISDICTION[item.registryId]) {
    action = {
      id: `${item.registryId}-${date.date}-${sourceKey}`.toLowerCase(),
      date: date.date, jurisdiction: JURISDICTION[item.registryId], actionType: ACTION_TYPE[prose.category],
      description: prose.description, outcome: 'Drafted by the pipeline: state the outcome after checking the record.',
      sourceIds: [sourceKey], status: date.date <= ctx.today ? 'complete' : 'pending', lastVerified: apDate(ctx.today),
    }
  }
  const rendered = {
    timeline: renderTimelineEntry(entry),
    source: source ? renderSourceEntry(sourceKey, source) : null,
    update: renderUpdateEntry(update),
    action: action ? renderActionEntry(action) : null,
  }
  const validation = await validateDraft(rendered)
  Object.assign(draft, {
    entry, sourceKey, newSource: source, update, action, rendered, validation,
    updateGuard: ug.ok ? 'pass' : 'fail', updateGuardFailures: ug.failures,
    status: validation.ok && ug.ok ? 'ready' : 'invalid',
  })
  return draft
}
