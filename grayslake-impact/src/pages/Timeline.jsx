import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import TimelineUI from '../components/ui/Timeline'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { timelineEvents } from '../data/timeline'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

const LEGEND = [
  { key: 'approval',     label: 'Approval',     active: 'text-status-approval    bg-status-approval-soft    border-status-approval',    inactive: 'text-status-approval    bg-status-approval-soft/50    border-status-approval/50    opacity-60 hover:opacity-100' },
  { key: 'construction', label: 'Construction', active: 'text-status-construction bg-status-construction-soft border-status-construction', inactive: 'text-status-construction bg-status-construction-soft/50 border-status-construction/50 opacity-60 hover:opacity-100' },
  { key: 'opposition',   label: 'Opposition',   active: 'text-status-opposition  bg-status-opposition-soft  border-status-opposition',  inactive: 'text-status-opposition  bg-status-opposition-soft/50  border-status-opposition/50  opacity-60 hover:opacity-100' },
  { key: 'legal',        label: 'Legal',        active: 'text-status-legal       bg-status-legal-soft       border-status-legal',       inactive: 'text-status-legal       bg-status-legal-soft/50       border-status-legal/50       opacity-60 hover:opacity-100' },
  { key: 'development',  label: 'Development',  active: 'text-status-development bg-status-development-soft border-status-development', inactive: 'text-status-development bg-status-development-soft/50 border-status-development/50 opacity-60 hover:opacity-100' },
  { key: 'policy',       label: 'Policy',       active: 'text-status-policy      bg-status-policy-soft      border-status-policy',      inactive: 'text-status-policy      bg-status-policy-soft/50      border-status-policy/50      opacity-60 hover:opacity-100' },
]

export default function TimelinePage() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(() => {
    const cat = searchParams.get('cat')
    return LEGEND.some(l => l.key === cat) ? cat : 'all'
  })
  // The proportional-spacing view has no control in the UI, so this never
  // changes. Kept as state rather than a literal so the toggle can come back
  // without rewiring the component.
  const [proportional] = useState(false)

  const visible = activeCategory === 'all'
    ? timelineEvents
    : timelineEvents.filter(e => e.category === activeCategory)

  function handleExportCSV() {
    const headers = ['Date', 'Title', 'Category', 'Description', 'Source Key']
    const rows = visible.map(e => [
      `"${e.date || ''}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.category || ''}"`,
      `"${(e.description || e.desc || '').replace(/"/g, '""')}"`,
      `"${e.sourceKey || (e.sourceKeys ? e.sourceKeys.join(';') : '')}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Grayslake_T5_Timeline_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <FootnoteProvider>
      <Container size="default" className="py-10 sm:py-14 space-y-10">
        <PageTitle
          title={pageMeta['/timeline'].title}
          description={pageMeta['/timeline'].description}
          ogImage={pageMeta['/timeline'].ogImage}
        />

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rule pb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
              Project History
            </p>
            <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
              Timeline of Events
            </h1>
            <p className="text-base font-sans text-ink-700 leading-relaxed">
              Chronological record of village approvals, legal filings, opposition actions, and state policy updates.
            </p>
            <p className="text-2xs font-mono text-ink-500 mt-3">
              Last verified {LAST_VERIFIED}
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-rule hover:decoration-accent shrink-0 self-start sm:self-end min-h-[44px]"
          >
            Export Timeline CSV
          </button>
        </header>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-sans font-semibold border transition-colors min-h-[44px] ${
              activeCategory === 'all'
                ? 'bg-ink-900 text-paper border-ink-900'
                : 'bg-transparent border-rule text-ink-700 hover:border-ink-700'
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
                onClick={() => setActiveCategory(prev => prev === key ? 'all' : key)}
                className={`px-3 py-1.5 text-xs font-sans font-semibold border transition-colors min-h-[44px] ${
                  isActive ? active : inactive
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        {/* Timeline */}
        <TimelineUI events={visible} proportional={proportional} />

        {/* Actions is the same record organised by who acted rather than when.
            It was routed and linked from nowhere; it lives here rather than in
            the nav, which could not hold a ninth item. */}
        <div className="mt-10 pt-6 border-t border-rule">
          <Link
            to="/actions"
            className="inline-flex items-center gap-2 text-base font-sans font-semibold text-accent hover:text-accent-hover underline underline-offset-4 decoration-rule hover:decoration-accent min-h-[44px]"
          >
            See the same events by jurisdiction, with verification dates
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <FootnoteList />
      </Container>
    </FootnoteProvider>
  )
}
