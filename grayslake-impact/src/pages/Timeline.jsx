import PageTitle from '../components/ui/PageTitle'
import TimelineUI from '../components/ui/Timeline'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { timelineEvents } from '../data/timeline'

const LEGEND = [
  { label: 'Approval',     cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Construction', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { label: 'Opposition',   cls: 'text-orange-700 bg-orange-50 border-orange-200' },
  { label: 'Legal',        cls: 'text-red-700 bg-red-50 border-red-200' },
  { label: 'Development',  cls: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { label: 'Policy',       cls: 'text-amber-700 bg-amber-50 border-amber-200' },
]

const dateRange = `${timelineEvents[0]?.date?.slice(0,4) ?? '—'} – ${timelineEvents[timelineEvents.length - 1]?.date?.slice(0,4) ?? '—'}`

export default function TimelinePage() {
  return (
    <FootnoteProvider>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Timeline" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Project History</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Sourced Event Timeline</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Key milestones in the T5 @ Chicago IV development — village approvals, community
          opposition, legal challenges, construction activity, and state policy changes.
          All events sourced and cited.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xs font-mono text-gray-400">{timelineEvents.length} events</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">{dateRange}</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Oldest → newest</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Last verified Aug 2, 2026</span>
        </div>
      </FadeIn>

      <FadeIn className="flex flex-wrap gap-2 mb-12">
        {LEGEND.map(({ label, cls }) => (
          <span key={label}
            className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cls}`}
          >
            {label}
          </span>
        ))}
      </FadeIn>

      <TimelineUI events={timelineEvents} />

      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          Events marked <span className="text-emerald-600">construction</span> beyond Nov 2025
          are projected milestones per developer filings, not confirmed completions.
        </p>
      </div>
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
