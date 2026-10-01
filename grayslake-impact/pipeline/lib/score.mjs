/**
 * Scoring: applies config/credibility-rubric.yaml's decision table to each
 * claim, in code. The model supplies claim text, type and quotes; it never
 * supplies a tier or an outcome.
 *
 * Signals per claim:
 *   verbatim_guard   'pass' | 'fail' (from guard.checkClaim)
 *   tier             registry tier, lowered to 3 for a Tier 2 article
 *                    without a named byline (rubric tiers.2.qualifies_when)
 *   claim_type       after party relabeling (party.mjs)
 *   origin           'originates' for Tier 1 records; otherwise what the
 *                    extraction reported about the document
 *   original_found   false: tracing a repeated story to its original is not
 *                    automated, so a repeat from Tier 2 or 3 is queued
 *   attribution      named | unnamed | document
 *   conflict         false here; possible figure conflicts are surfaced as
 *                    flags (flags.mjs) for the owner, not decided by code
 *   independent_tier_1_or_2_corroboration
 *                    other Tier 1/2 items in the same run, from a different
 *                    source and not a near-duplicate, whose passing claims
 *                    state the same figures and dates
 */
import { extractNumbers, extractDates } from './guard.mjs'

const DRAFTABLE = new Set(['draft_as_fact', 'draft_attributed', 'draft_as_reported', 'redraft_from_corroborating_source'])
export const isDraftable = outcome => DRAFTABLE.has(outcome)

function matches(cond, signals) {
  for (const [k, want] of Object.entries(cond)) {
    const have = signals[k]
    if (Array.isArray(want)) { if (!want.includes(have)) return false; continue }
    if (typeof want === 'string' && /^(>=|<=|>|<)\d+$/.test(want)) {
      const [, op, n] = /^(>=|<=|>|<)(\d+)$/.exec(want)
      const v = Number(have ?? 0)
      if (!({ '>=': v >= n, '<=': v <= n, '>': v > n, '<': v < n })[op]) return false
      continue
    }
    if (have !== want) return false
  }
  return true
}

/** Returns { outcome, rule (index), flags[], labels[] } for one claim's signals. */
export function decide(rubric, signals) {
  for (const [i, row] of rubric.decision_table.entries()) {
    if (matches(row.when ?? {}, signals)) {
      const o = rubric.outcomes[row.outcome] ?? {}
      return { outcome: row.outcome, rule: i, when: row.when, flags: row.flags ?? [], label: o.label ?? null, siteVoice: Boolean(o.site_voice) }
    }
  }
  throw new Error('decision table has no matching row (it must end with a catch-all)')
}

/** Effective tier: a Tier 2 article needs a named byline. */
export function effectiveTier(tier, byline) {
  if (tier !== 2) return tier
  const named = (Array.isArray(byline) ? byline : [byline]).some(b => b && /[A-Z][a-z]+\s+[A-Z]/.test(b) && !/\b(staff|wire|report|news|herald|tribune|times)\b/i.test(b))
  return named ? 2 : 3
}

export function signalsFor(claim, item, guardOk, corroboration = 0) {
  return {
    verbatim_guard: guardOk ? 'pass' : 'fail',
    tier: item.effectiveTier,
    claim_type: claim.claim_type,
    origin: item.effectiveTier === 1 ? 'originates' : (item.docOrigin ?? 'unclear'),
    original_found: false,
    attribution: claim.attribution ?? 'document',
    conflict: false,
    independent_tier_1_or_2_corroboration: corroboration,
  }
}

// A bare year is not a figure: "in 2025" would otherwise be "corroborated" by
// any document that mentions 2025.
const factsOf = text => ({
  numbers: new Set(extractNumbers(text).map(n => n.value).filter(v => !/^(19|20)\d\d$/.test(v))),
  dates: new Set(extractDates(text).map(d => `${d.month}-${d.day}`)),
})

/**
 * Counts independent Tier 1/2 items whose passing claims state every figure
 * and date the given claim states. A claim with no figures and no dates is
 * never counted as corroborated: words alone are too loose to match on.
 */
export function corroborationCount(claim, item, others) {
  return corroboratingItems(claim, item, others).length
}

/** The ids of the independent Tier 1/2 items that corroborate a claim. */
export function corroboratingItems(claim, item, others) {
  const mine = factsOf(claim.claim_text)
  if (!mine.numbers.size && !mine.dates.size) return []
  const sources = new Map()
  for (const o of others) {
    if (o.id === item.id || o.registryId === item.registryId) continue
    if (o.effectiveTier > 2) continue
    if (item.dedupe?.nearDuplicateOf === o.id || o.dedupe?.nearDuplicateOf === item.id) continue
    for (const c of o.passingClaims ?? []) {
      const theirs = factsOf(c.supporting_quotes.join(' '))
      // One per independent source: two items from the same registry entry count once.
      if ([...mine.numbers].every(n => theirs.numbers.has(n)) && [...mine.dates].every(d => theirs.dates.has(d))) { if (!sources.has(o.registryId ?? o.id)) sources.set(o.registryId ?? o.id, o.id); break }
    }
  }
  return [...sources.values()]
}
