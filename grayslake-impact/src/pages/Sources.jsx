import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

const SOURCE_CATEGORIES = [
  { label: 'Government Records', desc: 'Village of Grayslake FAQs and meeting records, Village of Mundelein statement, Illinois DCEO program pages' },
  { label: 'Press Coverage',     desc: 'Chicago Tribune, Capitol News Illinois, Daily Herald, Chronicle Media, Government Technology, Data Center Dynamics, Patch, Hoodline' },
]

const SOURCE_ENTRIES = Object.entries(sources)

export default function Sources() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/sources']} />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Transparency</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Primary Sources</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          All figures in this tracker come from publicly available documents and verified journalism.
          Estimated figures are labeled.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="space-y-1.5 mb-12">
        {SOURCE_ENTRIES.map(([key, source], i) => (
          <div
            key={key}
            className="group glass-card-hover px-5 py-4 flex gap-5"
          >
            <span className="text-2xs font-mono text-gray-300 mt-0.5 w-6 shrink-0 group-hover:text-gray-400 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 leading-snug mb-0.5">{source.title}</p>
              {source.publisher && (
                <p className="text-xs text-gray-500 mb-1">{source.publisher}</p>
              )}
              {source.note && (
                <p className="text-xs text-amber-700/80 italic mb-1">{source.note}</p>
              )}
              {source.status === 'dead' ? (
                <span className="text-2xs font-mono text-amber-800 line-through decoration-amber-400 break-all">
                  {source.url}
                </span>
              ) : source.status === 'unverified' ? (
                <span className="text-2xs font-mono text-amber-700 italic">link pending verification</span>
              ) : source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xs font-mono text-gray-400 hover:text-blue-600 inline-block transition-colors duration-150 truncate max-w-full"
                >
                  {source.url}
                </a>
              )}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1 self-start">
              {source.verified && (
                <span className="text-2xs font-mono text-gray-400">verified {source.verified}</span>
              )}
              {source.status === 'unverified' && (
                <span className="text-2xs font-mono text-amber-700 uppercase tracking-widest">unverified</span>
              )}
              {source.status === 'dead' && (
                <span className="text-2xs font-mono text-amber-800 bg-amber-50 border border-amber-300 rounded-sm px-1.5 py-0.5 uppercase tracking-widest whitespace-nowrap">
                  link dead {source.deadCheckedAt}
                </span>
              )}
              {source.status === 'background' && (
                <span className="text-2xs font-mono text-gray-400 uppercase tracking-widest">background</span>
              )}
              <span className="text-2xs font-mono text-gray-300 uppercase tracking-widest">{key}</span>
            </div>
          </div>
        ))}
      </FadeIn>

      <FadeIn>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Source Categories</p>
          <div className="grid md:grid-cols-2 gap-6">
            {SOURCE_CATEGORIES.map(({ label, desc }) => (
              <div key={label}>
                <p className="text-xs font-display font-semibold text-gray-800 mb-1.5">{label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
