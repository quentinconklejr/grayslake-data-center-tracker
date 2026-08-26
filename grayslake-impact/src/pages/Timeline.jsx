import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import TimelineUI from '../components/ui/Timeline'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { timelineEvents } from '../data/timeline'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

// Filter chips use the same dark-inversion pattern as the Actions
// jurisdiction/type chips (single site-wide convention for segmented
// controls). The per-category status colour survives on the timeline
// itself — dots and category badges inside TimelineUI — so a filtered
// view still colour-codes its events; only the filter chip itself is
// neutralised.
const LEGEND = [
  { key: 'approval',     label: 'Approval' },
  { key: 'construction', label: 'Construction' },
  { key: 'opposition',   label: 'Opposition' },
  { key: 'legal',        label: 'Legal' },
  { key: 'development',  label: 'Development' },
  { key: 'policy',       label: 'Policy' },
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
            className="text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent shrink-0 self-start sm:self-end min-h-[44px]"
          >
            Export Timeline CSV
          </button>
        </header>

        {/* Category filters. aria-pressed + role="group" matches the
            same segmented-control convention used on Actions filters
            and SiteMap's base-map toggle. */}
        <div role="group" aria-label="Filter timeline by category" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-sans font-semibold border transition-colors min-h-[44px] ${
              activeCategory === 'all'
                ? 'bg-ink-900 text-paper border-ink-900'
                : 'bg-transparent text-ink-700 border-rule-strong hover:border-ink-700 hover:text-ink-900'
            }`}
          >
            All <span className="ml-1 text-ink-500">({timelineEvents.length})</span>
          </button>
          {LEGEND.map(({ key, label }) => {
            const count = timelineEvents.filter(e => e.category === key).length
            const isActive = activeCategory === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(prev => prev === key ? 'all' : key)}
                className={`px-3 py-1.5 text-xs font-sans font-semibold border transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-ink-900 text-paper border-ink-900'
                    : 'bg-transparent text-ink-700 border-rule-strong hover:border-ink-700 hover:text-ink-900'
                }`}
              >
                {label} <span className={`ml-1 ${isActive ? 'text-paper-sunk' : 'text-ink-500'}`}>({count})</span>
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
            className="inline-flex items-center gap-2 text-base font-sans font-semibold text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent min-h-[44px]"
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
