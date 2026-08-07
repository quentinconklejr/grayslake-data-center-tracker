import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import BackToTop from '../components/ui/BackToTop'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import TimelineUI from '../components/ui/Timeline'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { timelineEvents } from '../data/timeline'
import { LAST_VERIFIED } from '../data/siteConfig'
import { projections } from '../data/projections'

const LEGEND = [
  { key: 'approval',     label: 'Approval',     active: 'text-blue-700 bg-blue-50 border-blue-300',          inactive: 'text-blue-700 bg-blue-50/50 border-blue-200 opacity-60 hover:opacity-100' },
  { key: 'construction', label: 'Construction', active: 'text-emerald-700 bg-emerald-50 border-emerald-300', inactive: 'text-emerald-700 bg-emerald-50/50 border-emerald-200 opacity-60 hover:opacity-100' },
  { key: 'opposition',   label: 'Opposition',   active: 'text-orange-700 bg-orange-50 border-orange-300',    inactive: 'text-orange-700 bg-orange-50/50 border-orange-200 opacity-60 hover:opacity-100' },
  { key: 'legal',        label: 'Legal',        active: 'text-red-700 bg-red-50 border-red-300',             inactive: 'text-red-700 bg-red-50/50 border-red-200 opacity-60 hover:opacity-100' },
  { key: 'development',  label: 'Development',  active: 'text-cyan-700 bg-cyan-50 border-cyan-300',          inactive: 'text-cyan-700 bg-cyan-50/50 border-cyan-200 opacity-60 hover:opacity-100' },
  { key: 'policy',       label: 'Policy',       active: 'text-amber-700 bg-amber-50 border-amber-300',       inactive: 'text-amber-700 bg-amber-50/50 border-amber-200 opacity-60 hover:opacity-100' },
]

const dateRange = `${timelineEvents[0]?.date?.slice(0,4) ?? '—'} – ${timelineEvents[timelineEvents.length - 1]?.date?.slice(0,4) ?? '—'}`

const { buildoutHorizon } = projections

export default function TimelinePage() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(() => {
    const cat = searchParams.get('cat')
    return LEGEND.some(l => l.key === cat) ? cat : 'all'
  })
  const [proportional, setProportional] = useState(false)

  const visible = activeCategory === 'all'
    ? timelineEvents
    : timelineEvents.filter(e => e.category === activeCategory)

  function handleCategory(key) {
    setActiveCategory(prev => prev === key ? 'all' : key)
  }

  return (
    <FootnoteProvider>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/timeline']} />

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-xs font-mono text-blue-600 uppercase tracking-[0.18em] mb-4">Project History</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">How We Got Here</h1>
        <p className="text-lg text-gray-700 max-w-2xl leading-relaxed mb-2">
          Approvals, legal challenges, opposition actions, and policy changes, each entry cited.
        </p>
        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
          Entries are cited. Solid markers are confirmed events; hollow markers are projected milestones from developer filings.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xs font-mono text-gray-400">{visible.length} of {timelineEvents.length} events</span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">{dateRange}</span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Oldest → newest</span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Last verified {LAST_VERIFIED}</span>
        </div>
      </FadeIn>

      <FadeIn className="flex flex-wrap items-center justify-between gap-3 mb-10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`inline-flex items-center px-2.5 py-1.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-all duration-150 ${
              activeCategory === 'all'
                ? 'text-gray-900 bg-gray-100 border-gray-300'
                : 'text-gray-500 border-edge-soft hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            All ({timelineEvents.length})
          </button>
          {LEGEND.map(({ key, label, active, inactive }) => {
            const count = timelineEvents.filter(e => e.category === key).length
            const isActive = activeCategory === key
            return (
              <button
                key={key}
                onClick={() => handleCategory(key)}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-all duration-150 ${isActive ? active : inactive}`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
        <button
          role="switch"
          aria-checked={proportional}
          onClick={() => setProportional(v => !v)}
          className="text-xs font-mono text-gray-500 hover:text-gray-800 transition-colors duration-150 flex items-center gap-1.5 shrink-0"
          title="When on, the gap between events reflects the actual time between them"
        >
          {proportional ? 'Date gaps: on' : 'Date gaps: off'}
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2v8M10 2v8M2 4.5h8M2 7.5h5" strokeLinecap="round" />
          </svg>
        </button>
      </FadeIn>

      <TimelineUI events={visible} proportional={proportional} />

      <div className="mt-12 pt-6 border-t border-edge-soft">
        <p className="text-xs text-gray-500 leading-relaxed">
          Events marked <span className="text-emerald-700">construction</span> beyond Nov 2025 are
          projected milestones per developer filings, not confirmed completions.
          Hollow markers indicate projected events; solid markers indicate documented events.
        </p>
      </div>
      <FadeIn className="mt-10 pt-8 border-t border-edge-soft">
        <p className="text-2xs font-mono text-gray-600 uppercase tracking-widest mb-2">When Is &ldquo;Full Buildout&rdquo;?</p>
        <p className="text-sm text-gray-600 mb-5 max-w-prose">{buildoutHorizon.note}</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {buildoutHorizon.claims.map(c => (
            <div key={c.key} className="border border-edge rounded-lg bg-white px-4 py-3.5">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-lg font-display font-bold text-gray-900 leading-tight">{c.value}</p>
                <span className="text-2xs font-mono uppercase tracking-widest text-gray-600">{c.framing}</span>
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed mb-2">&ldquo;{c.quote}&rdquo;</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {c.attribution}
                <SourceCitation sourceKey={c.sourceKey} />
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          First power is also given two ways:{' '}
          {buildoutHorizon.firstPower.map((f, i) => (
            <span key={f.value}>
              {i > 0 && ' and '}
              <strong className="font-semibold text-gray-800">{f.value}</strong> ({f.attribution})
              <SourceCitation sourceKey={f.sourceKey} />
            </span>
          ))}.
        </p>
      </FadeIn>
      <PageNext
        to="/questions"
        label="Questions & Answers"
        desc="What's settled, what's disputed, and what has no public answer yet: water, energy, jobs, taxes, and process."
        color="text-blue-700"
        hoverBorder="hover:border-blue-300"
      />


      <FootnoteList />
      <BackToTop />
    </div>
    </FootnoteProvider>
  )
}
