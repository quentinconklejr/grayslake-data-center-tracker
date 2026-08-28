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
  'water-usage':      'unanswered',
  'energy-rates':     'unanswered',
  'campus-scale':     'unanswered',
  'tax-revenue':      'unanswered',
  'approval-process': 'unanswered',
  'jobs':             'unanswered',
}
