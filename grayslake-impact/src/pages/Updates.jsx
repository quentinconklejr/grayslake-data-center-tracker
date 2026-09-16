import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import ReportErrorLink from '../components/ui/ReportErrorLink'
import { pageMeta } from '../data/pageMeta'
import { updates } from '../data/updates'
import { LAST_VERIFIED } from '../data/siteConfig'

const KIND = {
  added: 'text-status-stated',
  corrected: 'text-status-disputed',
  removed: 'text-status-legal',
}

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Updates() {
  return (
    <Container size="default" className="py-10 sm:py-14 space-y-10">
      <PageTitle
        title={pageMeta['/updates'].title}
        description={pageMeta['/updates'].description}
        ogImage={pageMeta['/updates'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Change log</p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          Updates
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          What has been added to this site, and what has been corrected. Anything that changes what
          the site asserts is logged here with a date.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </header>

      <ol className="border-t border-rule">
        {updates.map(u => (
          <li key={`${u.date}-${u.title}`} className="border-b border-rule-strong py-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
              <time dateTime={u.date} className="text-xs font-mono text-ink-500">
                {fmtDate(u.date)}
              </time>
              <span
                className={`text-2xs font-sans font-semibold uppercase tracking-wide ${KIND[u.kind] ?? 'text-ink-500'}`}
              >
                {u.kind}
              </span>
            </div>
            <h2 className="text-lg font-display font-semibold text-ink-900 leading-snug">
              {u.title}
            </h2>
            <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
              {u.description}
            </p>
            {u.link && (
              <p className="mt-3">
                <Link
                  to={u.link}
                  className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-accent hover:text-accent-hover min-h-[44px]"
                >
                  {u.linkLabel ?? 'Read more'} <span aria-hidden="true">→</span>
                </Link>
              </p>
            )}
          </li>
        ))}
      </ol>

      <p className="text-sm font-sans text-ink-600 leading-relaxed">
        Spotted something that should be corrected?{' '}
        <ReportErrorLink
          className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
          label="Send it in"
        />
        .
      </p>
    </Container>
  )
}
