import { formatBytes } from '../../lib/formatBytes'

/*
 * Format, page count and file size as a row of matching badges.
 *
 * Every value comes from data read off the actual file (docMeta.js, which
 * extract-doc-meta.js generates, or the records data). A field that is not
 * known is left out rather than guessed, so an external web article gets no
 * badges at all.
 */
export default function DocBadges({ format, pages, sizeBytes, className = '' }) {
  const items = [
    format,
    pages ? `${pages} ${pages === 1 ? 'page' : 'pages'}` : null,
    formatBytes(sizeBytes),
  ].filter(Boolean)
  if (!items.length) return null

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`.trim()} aria-label="File details">
      {items.map(item => (
        <li
          key={item}
          className="inline-flex items-center px-1.5 py-0.5 border border-rule-strong bg-paper-raised text-2xs font-mono text-ink-600 tabular-nums"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
