/**
 * Credibility rubric loader.
 *
 * Reads config/credibility-rubric.yaml and checks that it is complete and
 * internally consistent: four tiers, every decision-table outcome defined,
 * every claim type known, guard parameters of the right type. The pipeline
 * refuses to start on a rubric that fails these checks.
 */
import { join } from 'node:path'
import { CONFIG_DIR, readYaml } from './config.mjs'

export const CLAIM_TYPES = ['fact', 'quote', 'opinion', 'allegation', 'projection', 'procedural']
const TIER_OUTCOMES = ['draft_as_fact', 'draft_as_reported', 'queue_only', 'never']
const REQUIRED_HARD_RULES = [
  'no_verbatim_no_claim', 'opinion_never_fact', 'unnamed_never_fact', 'tier_from_registry',
  'tier4_never_public', 'model_text_is_not_evidence', 'human_merge_only', 'no_rewrite_of_existing',
]

export function validateRubric(r) {
  const errors = []
  const need = (cond, msg) => { if (!cond) errors.push(msg) }

  need(r && typeof r === 'object', 'rubric is empty')
  if (!r || typeof r !== 'object') return errors

  for (const t of [1, 2, 3, 4]) {
    const tier = r.tiers?.[t]
    need(tier, `tiers.${t} missing`)
    if (!tier) continue
    need(TIER_OUTCOMES.includes(tier.publish?.outcome), `tiers.${t}.publish.outcome must be one of ${TIER_OUTCOMES.join(', ')}`)
  }
  need(r.tiers?.[4]?.publish?.outcome === 'never', 'tiers.4 must never publish')
  need(r.tiers?.[4]?.default_for_unknown_domain === true, 'tiers.4.default_for_unknown_domain must be true')

  for (const ct of CLAIM_TYPES) need(r.claim_types?.[ct], `claim_types.${ct} missing`)
  for (const ct of ['quote', 'opinion', 'allegation', 'projection']) {
    need(r.claim_types?.[ct]?.may_become_fact === false, `claim_types.${ct}.may_become_fact must be false`)
  }
  need(r.modifiers?.attribution?.unnamed, 'modifiers.attribution.unnamed missing')

  const ruleIds = new Set((r.hard_rules ?? []).map(h => h.id))
  for (const id of REQUIRED_HARD_RULES) need(ruleIds.has(id), `hard_rules.${id} missing`)

  const outcomes = r.outcomes ?? {}
  need(Array.isArray(r.decision_table) && r.decision_table.length > 0, 'decision_table is empty')
  for (const [i, row] of (r.decision_table ?? []).entries()) {
    need(row && typeof row.when === 'object', `decision_table[${i}].when missing`)
    need(outcomes[row?.outcome], `decision_table[${i}].outcome "${row?.outcome}" is not defined under outcomes`)
  }
  const last = r.decision_table?.at(-1)
  need(last && Object.keys(last.when ?? {}).length === 0, 'decision_table must end with a catch-all row (when: {})')
  need(r.decision_table?.[0]?.when?.verbatim_guard === 'fail' && r.decision_table?.[0]?.outcome === 'drop_and_log',
    'decision_table must start with the verbatim-guard drop rule')

  const g = r.verbatim_guard
  need(g, 'verbatim_guard missing')
  if (g) {
    const q = g.quote_rules ?? {}
    for (const k of ['min_chars', 'min_words', 'max_chars']) need(Number.isInteger(q[k]) && q[k] > 0, `verbatim_guard.quote_rules.${k} must be a positive integer`)
    need(q.min_chars < q.max_chars, 'verbatim_guard.quote_rules.min_chars must be below max_chars')
    need(Array.isArray(q.reject_if_contains), 'verbatim_guard.quote_rules.reject_if_contains must be a list')
    const c = g.canonicalization ?? {}
    need(c.case_folding === false, 'verbatim_guard.canonicalization.case_folding must be false')
    need(c.punctuation_stripping === false, 'verbatim_guard.canonicalization.punctuation_stripping must be false')
    for (const [from, to] of Object.entries(c.typographic_equivalents ?? {})) {
      need([...from].length === 1 && [...String(to)].length === 1, `typographic equivalent ${JSON.stringify(from)} → ${JSON.stringify(to)} must map one character to one character`)
    }
    need(g.on_fail === 'drop_and_log', 'verbatim_guard.on_fail must be drop_and_log')
    const cq = g.claim_quote_consistency ?? {}
    need(Number.isInteger(cq.named_speaker_within_chars_of_quote), 'claim_quote_consistency.named_speaker_within_chars_of_quote must be an integer')
  }
  return errors
}

export function loadRubric(path = join(CONFIG_DIR, 'credibility-rubric.yaml')) {
  const r = readYaml(path)
  const errors = validateRubric(r)
  if (errors.length) throw new Error(`credibility-rubric.yaml is invalid:\n  - ${errors.join('\n  - ')}`)
  return r
}

/** The guard's parameters in the shape guard.mjs takes. */
export function guardConfig(rubric) {
  const g = rubric.verbatim_guard
  return {
    typographic: g.canonicalization.typographic_equivalents ?? {},
    remove: g.canonicalization.remove ?? [],
    minChars: g.quote_rules.min_chars,
    minWords: g.quote_rules.min_words,
    maxChars: g.quote_rules.max_chars,
    rejectIfContains: g.quote_rules.reject_if_contains,
    speakerWindow: g.claim_quote_consistency.named_speaker_within_chars_of_quote,
  }
}
