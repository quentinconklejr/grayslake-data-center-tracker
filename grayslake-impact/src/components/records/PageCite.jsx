import { recordsFiles, filePage } from '../../data/records'

/*
 * The citation mark used throughout /records.
 *
 * It prints the packet page, because that is the number a reader cites and
 * the number the Village would recognise, but it links to the page inside
 * the split file, because that is the only number that makes #page=N land
 * correctly. Both numbers live in the data file; this component is the one
 * place that knows they differ.
 *
 * Deliberately not the SourceCitation superscript used elsewhere on the
 * site. That marker points at a bibliography entry and opens a tooltip; this
 * one is a direct link into a PDF at a specific page, and it should look
 * like one so a reader knows a click leaves for the document.
 */
export default function PageCite({ file, page, label, className = '' }) {
  const f = recordsFiles[file]
  if (!f || page == null) return null

  const n = filePage(file, page)
  const href = n ? `${f.path}#page=${n}` : f.path
  const text = label ?? `Packet p. ${page}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`whitespace-nowrap text-2xs font-mono text-accent hover:text-accent-hover underline underline-offset-2 decoration-rule-strong hover:decoration-accent ${className}`.trim()}
      // The visible text says "Packet p. 215"; without this a screen reader
      // gets no hint that the link opens a PDF at a particular page in a
      // different file, which is the whole mechanism of this section.
      aria-label={`${text}, opens PDF at page ${n ?? 1} of ${f.path.split('/').pop()}`}
    >
      {text}
    </a>
  )
}
