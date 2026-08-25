/*
 * A document-facsimile card for cited source artifacts. Retains a real
 * border (this is deliberately artifact-like) but drops the shadow and
 * the mono-uppercase kicker; the header bar is a hairline top rule with
 * a demoted publisher line, the excerpts stay set in Fraunces italics
 * because they are quotes.
 */
export default function SourceArtifact({ publisher, date, pageRef, url, excerpts = [], annotation }) {
  return (
    <div className="border border-rule bg-paper-raised overflow-hidden text-left">
      <div className="border-b border-rule px-4 py-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600 leading-none mb-1">
            {publisher}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {date && <span className="text-xs font-mono text-ink-500">{date}</span>}
            {pageRef && (
              <span className="text-2xs font-mono border border-rule text-ink-500 px-1.5 py-0.5">
                {pageRef}
              </span>
            )}
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-2xs font-sans font-semibold text-accent hover:text-accent-hover transition-colors flex items-center gap-0.5 mt-0.5"
          >
            View ↗
          </a>
        )}
      </div>

      <div className="px-4 py-3 space-y-3 bg-paper-sunk/50">
        {excerpts.map((text, i) => (
          <blockquote
            key={i}
            className="text-sm leading-relaxed text-ink-700 pl-3 border-l-2 border-rule italic font-display"
          >
            &ldquo;{text}&rdquo;
          </blockquote>
        ))}
        {annotation && (
          <p className="text-xs font-sans text-ink-500 pt-2 border-t border-rule-soft">{annotation}</p>
        )}
      </div>
    </div>
  )
}
