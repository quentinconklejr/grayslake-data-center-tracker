import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'
import { sources } from '../data/sources'

const SOURCE_CATEGORIES = [
  { label: 'Government Records',  desc: 'Village of Grayslake meeting minutes, Lake County assessor filings, IEPA notices, zoning resolutions' },
  { label: 'Court Documents',     desc: 'Circuit Court filings, injunction records, Lake County zoning appeal documents' },
  { label: 'Press Coverage',      desc: "Lake County News-Sun, Chicago Tribune, Crain's Chicago Business, data center trade press" },
]

const SOURCE_ENTRIES = Object.entries(sources)

export default function Sources() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Sources" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-blue-400/50 uppercase tracking-[0.2em] mb-3">Transparency</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Primary Sources</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          All data in this dashboard is derived from publicly available documents, government
          filings, court records, and verified journalism. No data is estimated without explicit
          notation.
        </p>
      </FadeIn>

      <FadeIn className="space-y-1.5 mb-12">
        {SOURCE_ENTRIES.map(([key, source], i) => (
          <div
            key={key}
            className="group bg-gray-900/30 border border-gray-800/40 hover:border-gray-700/60 rounded-xl px-5 py-4 flex gap-5 transition-colors duration-150"
          >
            <span className="text-2xs font-mono text-gray-700 mt-0.5 w-6 shrink-0 group-hover:text-gray-500 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-200 leading-snug mb-0.5">{source.title}</p>
              {source.publisher && (
                <p className="text-xs text-gray-500 mb-1">{source.publisher}</p>
              )}
              {source.status === 'unverified' ? (
                <span className="text-2xs font-mono text-amber-700/80 italic">link pending verification</span>
              ) : source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xs font-mono text-gray-600 hover:text-blue-400 inline-block transition-colors duration-150 truncate max-w-full"
                >
                  {source.url}
                </a>
              )}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1 self-start">
              {source.status === 'unverified' && (
                <span className="text-2xs font-mono text-amber-700/80 uppercase tracking-widest">unverified</span>
              )}
              {source.status === 'background' && (
                <span className="text-2xs font-mono text-gray-600 uppercase tracking-widest">background</span>
              )}
              <span className="text-2xs font-mono text-gray-700 uppercase tracking-widest">{key}</span>
            </div>
          </div>
        ))}
      </FadeIn>

      <FadeIn>
        <div className="bg-gray-900/30 border border-gray-800/40 rounded-xl p-6">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-5">Source Categories</p>
          <div className="grid md:grid-cols-3 gap-6">
            {SOURCE_CATEGORIES.map(({ label, desc }) => (
              <div key={label}>
                <p className="text-xs font-display font-semibold text-gray-300 mb-1.5">{label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
