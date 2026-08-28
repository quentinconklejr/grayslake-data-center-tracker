// Per-question answered status.
//
// This is a content judgment call — whether a question has enough public
// evidence to count as answered, partially answered, or unanswered — and
// belongs in this data file so the reviewer sets values here rather than
// touching the rendering component. Every question defaults to
// `unanswered` until reviewed.
//
// Allowed values: 'answered', 'partial', 'unanswered'
// - answered:   the stated evidence block resolves the question and the
//               disputed/unknown blocks do not leave a material gap
// - partial:    parts of the question are answered but the disputed or
//               unknown blocks flag a material gap
// - unanswered: no adequate public record resolves it
//
// Rendering picks up the label + colour from STATUS_META below; the
// values in `questionStatus` are the only thing to edit when reviewing.
export const STATUS_META = {
  answered:   { label: 'Answered',           cls: 'text-status-stated' },
  partial:    { label: 'Partially answered', cls: 'text-status-disputed' },
  unanswered: { label: 'Unanswered',         cls: 'text-status-unknown' },
}

// Keys match the `id` field on every entry in src/data/questions.js.
// If a question id is missing from this map, the renderer falls back to
// 'unanswered' — so removing a question can't crash the page, but
// adding a new one shows up as unanswered until you set its value.
export const questionStatus = {
  // Volume is documented (Village FAQ: <50,000 gal/day, 4.0% of Village
  // supply; CLCJAWA: 0.25% of system flow, 3.2M-gal commissioning flush).
  // The source of supply is not: no regulatory filing names municipal
  // supply vs on-site well, and no IEPA permit or allocation study is
  // public. Half the question is on the record.
  'water-usage':      'partial',

  // Nothing on the record answers this. The stated block is the Village's
  // own FAQ plus officials' and a trade association's assurances; no rate
  // filing, ICC docket or study establishes the bill impact, and the PJM
  // capacity-price question has no project-specific figure at all.
  'energy-rates':     'unanswered',

  // The approved envelope is a determination in a named document (up to
  // 472 acres, no more than 10,100,000 sq ft). The rest is contested
  // between sources: 470 vs 472 acres, 18 vs 'fewer than 20' vs 'up to
  // 20' buildings, 1.55 vs 1.6 GW, and phasing is undetermined.
  'campus-scale':     'partial',

  // No public record produces a number. The two figures on offer are
  // officials' unverified projections that differ by more than 3x
  // (~$300M over decades vs >$1B over 20 years), no district-level split
  // exists, and the Lake County Assessor has not valued the campus.
  'tax-revenue':      'unanswered',

  // Adequacy is the question in litigation. A filed complaint alleges
  // inadequacy and the Village asserts compliance; no court has ruled and
  // the Village stopped answering on June 5, 2026. Nothing resolves it.
  'approval-process': 'unanswered',

  // The Village FAQ states a figure and its derivation (50 jobs per
  // 300,000 sq ft => 1,680 at full buildout) and hedges it. Three sources
  // give three numbers (1,500 / over 1,600 / 1,680), and no breakdown by
  // role, wage or local hiring exists. Figure exists, contested.
  'jobs':             'partial',
}
