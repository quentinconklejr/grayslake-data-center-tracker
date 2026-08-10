import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

const BADGE_STYLES = {
  primary: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  aggregator: 'bg-amber-50 text-amber-800 border-amber-200',
  trade: 'bg-sky-50 text-sky-800 border-sky-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
}

export default function Sources() {
  const sourceEntries = Object.entries(sources)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <PageTitle 
        title={pageMeta['/documents'].title} 
        description={pageMeta['/documents'].description} 
        ogImage={pageMeta['/documents'].ogImage} 
      />

      <div className="border-b border-slate-200 pb-6">
        <div className="text-2xs font-mono font-bold uppercase tracking-widest text-sky-800 mb-1">
          Public Records Index
        </div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight mb-2">
          Documents & Primary Sources
        </h1>
        <p className="text-sm font-sans text-slate-600 max-w-2xl">
          All figures on this tracker originate from public filings, meeting records, and verified journalism.
        </p>
        <div className="text-xs font-mono text-slate-500 mt-2">
          Last verified {LAST_VERIFIED}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {sourceEntries.map(([key, source], i) => {
          const badgeClass = BADGE_STYLES[source.tier] || BADGE_STYLES.default
          return (
            <div key={key} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-2 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {source.tier && (
                  <span className={`text-2xs font-mono uppercase px-2 py-0.5 rounded border font-semibold ${badgeClass}`}>
                    {source.tier}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {source.url && source.status !== 'dead' && source.status !== 'unverified' ? (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-800 underline decoration-sky-300 underline-offset-2">
                    {source.title} ↗
                  </a>
                ) : (
                  source.title
                )}
              </h3>

              <div className="text-xs font-mono text-slate-500">
                {[source.publisher, source.date].filter(Boolean).join(' · ')}
              </div>

              {source.note && (
                <p className="text-xs font-sans text-slate-600 leading-relaxed pt-1">
                  {source.note}
                </p>
              )}

              {source.localCopy && (
                <div className="pt-2">
                  <a 
                    href={source.localCopy} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors font-semibold"
                  >
                    Download PDF Mirror ↗
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
