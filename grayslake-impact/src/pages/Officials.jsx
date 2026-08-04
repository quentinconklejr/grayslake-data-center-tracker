import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { timelineEvents } from '../data/timeline'
import { LAST_VERIFIED } from '../data/siteConfig'
import AudienceBreadcrumb from '../components/ui/AudienceBreadcrumb'

const POLICY_CATS = new Set(['approval', 'legal', 'policy'])

const filtered = timelineEvents.filter(e => POLICY_CATS.has(e.category))

const CATEGORIES = [
  {
    key: 'approval',
    label: 'Approval',
    desc: 'Village board votes, zoning decisions, and permit grants.',
    cls: 'text-blue-700 bg-blue-50 border-blue-200 hover:border-blue-400',
    labelCls: 'text-blue-600',
  },
  {
    key: 'legal',
    label: 'Legal',
    desc: 'Court filings, federal permit applications, and pending litigation.',
    cls: 'text-red-700 bg-red-50 border-red-200 hover:border-red-400',
    labelCls: 'text-red-600',
  },
  {
    key: 'policy',
    label: 'Policy',
    desc: 'State and township resolutions, regulatory directives, and official statements.',
    cls: 'text-amber-700 bg-amber-50 border-amber-200 hover:border-amber-400',
    labelCls: 'text-amber-600',
  },
]

export default function Officials() {
  return (
    <FootnoteProvider>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <AudienceBreadcrumb current="Officials" />
      <PageTitle
        title="For Officials"
        description="Approvals, legal challenges, and policy actions related to T5 @ Chicago IV — a sourced record for municipal, county, and state officials."
        ogImage="/og/officials.png"
      />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Policy & Legal Record</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Approvals, legal challenges, and policy events</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          A filtered view of the project timeline covering approval decisions, legal filings,
          and state or local policy actions. All entries are sourced and cited.
          For construction and opposition events, see the full{' '}
          <Link to="/timeline" className="text-blue-600 hover:text-blue-700 transition-colors">Timeline page</Link>.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xs font-mono text-gray-400">{filtered.length} events across 3 categories</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Last verified {LAST_VERIFIED}</span>
        </div>
      </FadeIn>

      <FadeIn className="grid sm:grid-cols-3 gap-4 mb-12">
        {CATEGORIES.map(({ key, label, desc, cls, labelCls }) => {
          const count = timelineEvents.filter(e => e.category === key).length
          return (
            <Link
              key={key}
              to={`/timeline?cat=${key}`}
              className={`block border rounded-xl px-5 py-4 transition-colors duration-150 group ${cls}`}
            >
              <p className={`text-2xs font-mono uppercase tracking-[0.2em] font-semibold mb-1.5 ${labelCls}`}>
                {label}
                <span className="ml-1.5 opacity-60">({count})</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors mb-3">
                {desc}
              </p>
              <p className="text-2xs font-mono text-gray-400 flex items-center gap-1">
                View on timeline
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </Link>
          )
        })}
      </FadeIn>

      <FadeIn className="mt-4 border-t border-gray-200 pt-8">
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <Link to="/timeline" className="text-blue-600 hover:text-blue-700 transition-colors">
            Full project timeline →
          </Link>
          <Link to="/actions" className="text-blue-600 hover:text-blue-700 transition-colors">
            Jurisdictional actions →
          </Link>
          <Link to="/questions" className="text-blue-600 hover:text-blue-700 transition-colors">
            Open questions →
          </Link>
          <Link to="/sources" className="text-blue-600 hover:text-blue-700 transition-colors">
            All sources →
          </Link>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          This site is not affiliated with T5 Data Centers, LLC, the Village of Grayslake,
          or any advocacy group. It is an independent, resident-built resource drawing on
          public records and verified journalism.
        </p>
      </FadeIn>

      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
