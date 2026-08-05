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

      {/* Pending vs. decided status board */}
      <FadeIn className="mb-10">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Decisions &amp; Pending Actions</h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-sm">
          {[
            {
              date: 'Sep 23, 2024 – May 6, 2025',
              event: 'Village approval process — 7+ months of board meetings, zoning, and special-use permits',
              status: 'decided',
              label: 'Decided',
            },
            {
              date: 'Oct 2025',
              event: 'Public meeting — jobs estimate (1,500 permanent) and developer fee framework presented to board',
              status: 'decided',
              label: 'On Record',
            },
            {
              date: 'Jun 5, 2026',
              event: 'US Army Corps of Engineers wetlands fill permit application filed (~15.75 acres)',
              status: 'pending',
              label: 'Pending',
            },
            {
              date: 'Jun 5, 2026',
              event: 'Village FAQ updated — Village states it can no longer respond to project questions due to pending litigation',
              status: 'pending',
              label: 'Litigation Active',
            },
            {
              date: 'Jun 2026',
              event: 'Lake County coalition retains counsel to challenge village approvals as invalid',
              status: 'pending',
              label: 'Pending',
            },
            {
              date: 'Jun 26, 2026',
              event: 'Opposition coalition signals intent to file civil actions; no filings confirmed at publication',
              status: 'pending',
              label: 'Signaled',
            },
            {
              date: 'Jul 1, 2026',
              event: 'Governor directs DCEO to suspend new data center tax incentive applications (no stated end date)',
              status: 'decided',
              label: 'In Effect',
            },
            {
              date: 'Jun 2026',
              event: 'Avon Township board adopts transparency resolution calling for greater community engagement',
              status: 'decided',
              label: 'Adopted',
            },
          ].map(({ date, event, status, label }) => (
            <div key={date + label} className="flex items-start gap-4 px-5 py-3.5 bg-white hover:bg-gray-50/60 transition-colors">
              <span className="text-2xs font-mono text-gray-400 w-36 shrink-0 pt-0.5">{date}</span>
              <span className="text-gray-700 flex-1 leading-snug text-xs">{event}</span>
              <span className={`text-2xs font-mono font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                status === 'pending'
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}>{label}</span>
            </div>
          ))}
        </div>
        <p className="text-2xs font-mono text-gray-400 mt-2">
          Status reflects public records as of {LAST_VERIFIED}. No docket numbers are publicly available for the pending civil actions.
          See the full timeline for sourced citations on each entry.
        </p>
      </FadeIn>

      {/* Category browse cards */}
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
