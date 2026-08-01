import PageTitle from '../components/ui/PageTitle'
import TimelineUI from '../components/ui/Timeline'
import FadeIn from '../components/ui/FadeIn'
import { timelineEvents } from '../data/timeline'

const LEGEND = [
  { label: 'Approval',     cls: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  { label: 'Construction', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' },
  { label: 'Opposition',   cls: 'text-orange-300 bg-orange-500/10 border-orange-500/25' },
  { label: 'Legal',        cls: 'text-red-300 bg-red-500/10 border-red-500/25' },
  { label: 'Development',  cls: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25' },
  { label: 'Policy',       cls: 'text-amber-300 bg-amber-500/10 border-amber-500/25' },
]

const dateRange = `${timelineEvents[0]?.date?.slice(0,4) ?? '—'} – ${timelineEvents[timelineEvents.length - 1]?.date?.slice(0,4) ?? '—'}`

export default function TimelinePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Timeline" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-blue-400/50 uppercase tracking-[0.2em] mb-3">Project History</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Sourced Event Timeline</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          Key milestones in the T5 @ Chicago IV development — village approvals, community
          opposition, legal challenges, construction activity, and state policy changes.
          All events sourced and cited.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xs font-mono text-gray-500">{timelineEvents.length} events</span>
          <span className="text-gray-700">·</span>
          <span className="text-2xs font-mono text-gray-500">{dateRange}</span>
          <span className="text-gray-700">·</span>
          <span className="text-2xs font-mono text-gray-500">Oldest → newest</span>
          <span className="text-gray-700">·</span>
          <span className="text-2xs font-mono text-gray-600">Updated Jul 31, 2026</span>
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

      <div className="mt-12 pt-6 border-t border-gray-800/40">
        <p className="text-xs text-gray-500 leading-relaxed">
          Events marked <span className="text-emerald-400/40">construction</span> beyond Nov 2025
          are projected milestones per developer filings, not confirmed completions.
        </p>
      </div>
    </div>
  )
}
