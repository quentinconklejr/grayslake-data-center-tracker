import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import TimelineUI from '../components/ui/Timeline'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { timelineEvents } from '../data/timeline'
import { LAST_VERIFIED } from '../data/siteConfig'
import AudienceBreadcrumb from '../components/ui/AudienceBreadcrumb'

const POLICY_CATS = new Set(['approval', 'legal', 'policy'])

const filtered = timelineEvents.filter(e => POLICY_CATS.has(e.category))

// Pre-collect sourceKeys from filtered events so footnote numbers are stable
const PRELOAD_KEYS = []
for (const e of filtered) {
  const keys = e.sourceKeys ?? (e.sourceKey ? [e.sourceKey] : [])
  for (const k of keys) {
    if (!PRELOAD_KEYS.includes(k)) PRELOAD_KEYS.push(k)
  }
}

const LEGEND = [
  { label: 'Approval', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Legal',    cls: 'text-red-700 bg-red-50 border-red-200' },
  { label: 'Policy',   cls: 'text-amber-700 bg-amber-50 border-amber-200' },
]

export default function Officials() {
  return (
    <FootnoteProvider preload={PRELOAD_KEYS}>
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
          The full timeline — including construction and opposition events — is on the{' '}
          <Link to="/timeline" className="text-blue-600 hover:text-blue-700 transition-colors">Timeline page</Link>.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xs font-mono text-gray-400">{filtered.length} events</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Last verified {LAST_VERIFIED}</span>
        </div>
      </FadeIn>

      <FadeIn className="flex flex-wrap gap-2 mb-10">
        {LEGEND.map(({ label, cls }) => (
          <span
            key={label}
            className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cls}`}
          >
            {label}
          </span>
        ))}
      </FadeIn>

      <TimelineUI events={filtered} />

      <FadeIn className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <Link to="/actions" className="text-blue-600 hover:text-blue-700 transition-colors">
            Jurisdictional actions →
          </Link>
          <Link to="/timeline" className="text-blue-600 hover:text-blue-700 transition-colors">
            Full project timeline →
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
