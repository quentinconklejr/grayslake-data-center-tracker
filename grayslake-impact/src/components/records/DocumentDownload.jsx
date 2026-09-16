import { recordsFiles } from '../../data/records'
import { formatBytes } from '../../lib/formatBytes'

/*
 * One downloadable document, as a full-width row.
 *
 * The earlier treatment was a small bordered chip in a wrapping row, which
 * made six documents read as six buttons of equal weight with their page
 * counts squeezed inline. A reader looking for "the one with the site plan"
 * had to read every chip.
 *
 * This gives each file a title line and a metadata line under it, with the
 * format on the right, and lets the rows stack so the eye runs down a column
 * instead of wrapping across one. Still a rule-separated list on paper rather
 * than a card grid: the sheet glyph and the hover rule carry the affordance,
 * which is the same job a border and shadow would do with more ink.
 *
 * The whole row is the link, so the target is the full width rather than a
 * chip, and the accessible name covers title, size and format in one string.
 */
function SheetGlyph() {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 mt-0.5 inline-flex items-center justify-center w-9 h-9 border border-rule-strong text-ink-600 group-hover:border-ink-900 group-hover:text-ink-900 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v6h6M9 13h6M9 17h4" />
      </svg>
    </span>
  )
}

export default function DocumentDownload({ file, label, sublabel }) {
  const f = recordsFiles[file]
  if (!f) return null

  const pages = `${f.pages} ${f.pages === 1 ? 'page' : 'pages'}`
  const size = formatBytes(f.sizeBytes)

  return (
    <a
      href={f.path}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}${sublabel ? `, ${sublabel}` : ''}. PDF, ${pages}, ${size}.`}
      className="group flex items-start justify-between gap-4 border-b border-rule-strong py-4 hover:bg-paper-sunk transition-colors"
    >
      <div className="flex items-start gap-3 min-w-0">
        <SheetGlyph />
        <div className="min-w-0">
          <span className="block text-base font-display font-semibold text-ink-900 leading-snug group-hover:text-accent">
            {label}
          </span>
          {sublabel && (
            <span className="block text-sm font-sans text-ink-600 leading-snug mt-0.5">{sublabel}</span>
          )}
          <span className="block text-2xs font-mono text-ink-500 tabular-nums mt-1">
            {pages} &middot; {size}
          </span>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="shrink-0 self-center text-2xs font-mono font-semibold text-ink-500 group-hover:text-ink-900 transition-colors"
      >
        PDF ↓
      </span>
    </a>
  )
}
