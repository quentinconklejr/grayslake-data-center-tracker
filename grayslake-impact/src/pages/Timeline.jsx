import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import TimelineUI from '../components/ui/Timeline'
import { pageMeta } from '../data/pageMeta'
import { timelineEvents } from '../data/timeline'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

const LEGEND = [
  { key: 'approval', label: 'Approval', active: 'text-blue-700 bg-blue-50 border-blue-300', inactive: 'text-blue-700 bg-blue-50/50 border-blue-200 opacity-60 hover:opacity-100' },
  { key: 'construction', label: 'Construction', active: 'text-emerald-700 bg-emerald-50 border-emerald-300', inactive: 'text-emerald-700 bg-emerald-50/50 border-emerald-200 opacity-60 hover:opacity-100' },
  { key: 'opposition', label: 'Opposition', active: 'text-orange-700 bg-orange-50 border-orange-300', inactive: 'text-orange-700 bg-orange-50/50 border-orange-200 opacity-60 hover:opacity-100' },
  { key: 'legal', label: 'Legal', active: 'text-red-700 bg-red-50 border-red-300', inactive: 'text-red-700 bg-red-50/50 border-red-200 opacity-60 hover:opacity-100' },
  { key: 'development', label: 'Development', active: 'text-cyan-700 bg-cyan-50 border-cyan-300', inactive: 'text-cyan-700 bg-cyan-50/50 border-cyan-200 opacity-60 hover:opacity-100' },
  { key: 'policy', label: 'Policy', active: 'text-amber-700 bg-amber-50 border-amber-300', inactive: 'text-amber-700 bg-amber-50/50 border-amber-200 opacity-60 hover:opacity-100' },
]

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <PageTitle 
          title={pageMeta['/timeline'].title} 
          description={pageMeta['/timeline'].description} 
          ogImage={pageMeta['/timeline'].ogImage} 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-emerald-800 mb-1">
              Project History
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
              Timeline of Events
            </h1>
            <p className="text-sm font-sans text-slate-600">
              Chronological record of village approvals, legal filings, opposition actions, and state policy updates.
            </p>
            <div className="text-xs font-mono text-slate-500 mt-2">
              Last verified {LAST_VERIFIED}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors shrink-0 self-start sm:self-center min-h-[44px]"
          >
            Export Timeline CSV
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors min-h-[44px] ${
              activeCategory === 'all' 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All ({timelineEvents.length})
          </button>
          {LEGEND.map(({ key, label }) => {
            const count = timelineEvents.filter(e => e.category === key).length
            const isActive = activeCategory === key
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(prev => prev === key ? 'all' : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors min-h-[44px] ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        {/* Timeline Visualization */}
        <TimelineUI events={visible} proportional={proportional} />

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
