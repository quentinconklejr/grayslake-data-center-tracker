import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

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
          return (
            <li key={key} className="py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-sm font-mono text-ink-500 tabular-nums shrink-0 w-8 text-right">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <h3 className="text-lg font-display font-semibold text-ink-900 leading-snug">
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
                    </h3>
                    {source.tier && (
                      <span className={`text-2xs font-sans font-semibold uppercase tracking-wide ${tierCls}`}>
                        {source.tier}
                      </span>
                    )}
                  </div>

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
                      <a
                        href={source.localCopy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-sans font-semibold text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
                      >
                        Download PDF mirror <span aria-hidden="true">↗</span>
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
