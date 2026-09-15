import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { sources } from '../data/sources'
import { docMeta } from '../data/docMeta'
import { LAST_VERIFIED } from '../data/siteConfig'
import { formatBytes } from '../lib/formatBytes'

const TIER = {
  primary:    'text-status-stated',
  aggregator: 'text-status-disputed',
  trade:      'text-status-approval',
  default:    'text-ink-500',
}

export default function Sources() {
  const sourceEntries = Object.entries(sources)

  return (
    <Container size="default" className="py-10 sm:py-14 space-y-10">
      <PageTitle
        title={pageMeta['/documents'].title}
        description={pageMeta['/documents'].description}
        ogImage={pageMeta['/documents'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
          Public Records Index
        </p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          Documents &amp; Primary Sources
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          All figures on this tracker originate from public filings, meeting records, and verified journalism.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">
          Last verified {LAST_VERIFIED}
        </p>
      </header>

      {/* Document list */}
      <ol className="divide-y divide-rule-strong border-y border-rule">
        {sourceEntries.map(([key, source], i) => {
          const tierCls = TIER[source.tier] ?? TIER.default
          // Real, read-from-file metadata for mirrored PDFs only. An
          // external-link source (no localCopy) gets no page/size fields
          // because we can't inspect the file — better to omit than guess.
          const meta = source.localCopy ? docMeta[source.localCopy] : null
          const fileMeta = meta
            ? [meta.pages ? `${meta.pages} pages` : null, formatBytes(meta.sizeBytes)].filter(Boolean).join(' · ')
            : null
          return (
            <li key={key} className="py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-sm font-mono text-ink-500 tabular-nums shrink-0 w-8 text-right">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <div className="min-w-0 flex-1">
                  {/* Tier tag lives on its own metadata row above the title
                      so a long title cannot displace it mid-line and cause
                      wrap jitter. Also keeps the h3 measure predictable
                      when scanning the list. Page count + file size ride
                      on the same row (mirror-only, read from the actual
                      PDF at build time) — same row treatment, no new
                      badge style. */}
                  {(source.tier || fileMeta) && (
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      {source.tier ? (
                        <p className={`text-2xs font-sans font-semibold uppercase tracking-wide ${tierCls}`}>
                          {source.tier}
                        </p>
                      ) : <span aria-hidden="true" />}
                      {fileMeta && (
                        <p className="text-2xs font-mono text-ink-500 tabular-nums shrink-0">
                          {fileMeta}
                        </p>
                      )}
                    </div>
                  )}
                  {/* h2, not h3. The page goes h1 (page title) straight into
                      the document list, so an h3 here skipped a level and
                      broke the outline for anyone navigating by heading. */}
                  <h2 className="text-lg font-display font-semibold text-ink-900 leading-snug mb-1">
                    {source.url && source.status !== 'dead' && source.status !== 'unverified' ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent underline underline-offset-4 decoration-rule-strong hover:decoration-accent"
                      >
                        {source.title} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      source.title
                    )}
                  </h2>

                  <div className="text-sm font-sans text-ink-600">
                    <span className="font-mono text-ink-500">
                      {[source.publisher, source.date].filter(Boolean).join(' · ')}
                    </span>
                  </div>

                  {source.note && (
                    <p className="text-sm font-sans text-ink-600 leading-relaxed mt-2">
                      {source.note}
                    </p>
                  )}

                  {source.localCopy && (
                    <p className="mt-3">
                      {/* Quiet utility button — bordered chip, not a dashboard CTA.
                          Same treatment as Copy AP citation on /figures so the
                          two record-adjacent actions read as a matched pair. */}
                      <a
                        href={source.localCopy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold border border-rule-strong text-ink-700 hover:border-ink-700 hover:text-ink-900 transition-colors min-h-[44px]"
                      >
                        <span aria-hidden="true">↓</span>
                        Download PDF mirror
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </Container>
  )
}
