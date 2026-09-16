import { recordsFiles } from '../../data/records'
import { formatBytes } from '../../lib/formatBytes'

/*
 * Download link for one split PDF.
 *
 * Page count and file size sit inside the link text rather than beside it, so
 * a screen reader user reaching the link by tabbing hears what they are about
 * to open and how large it is, which is the whole point of labelling size.
 */
export default function PdfLink({ file, label, className = '' }) {
  const f = recordsFiles[file]
  if (!f) return null

  const meta = [`${f.pages} ${f.pages === 1 ? 'page' : 'pages'}`, formatBytes(f.sizeBytes)]
    .filter(Boolean)
    .join(' · ')

  return (
    <a
      href={f.path}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-semibold border border-rule-strong text-ink-700 hover:border-ink-700 hover:text-ink-900 transition-colors min-h-[44px] ${className}`.trim()}
    >
      <span aria-hidden="true">↓</span>
      <span>
        {label} <span className="font-mono font-normal text-ink-500">PDF, {meta}</span>
      </span>
    </a>
  )
}
