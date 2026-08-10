import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

const CATEGORIES = [
  { id: 'all', label: 'All Documents' },
  { id: 'government', label: 'Village & Government' },
  { id: 'press', label: 'Press Coverage' },
  { id: 'utility', label: 'Utility & Water' },
  { id: 'legal', label: 'Legal Filings' },
]

export default function Sources() {
  const [category, setCategory] = useState('all')

  const sourceEntries = Object.entries(sources).filter(([, source]) => {
    if (category === 'government') {
      return source.publisher?.toLowerCase().includes('village') || 
             source.publisher?.toLowerCase().includes('county') || 
             source.publisher?.toLowerCase().includes('dceo')
    }
    if (category === 'press') {
      return source.tier === 'primary' || source.tier === 'aggregator' || source.tier === 'trade'
    }
    if (category === 'utility') {
      return source.publisher?.toLowerCase().includes('water') || 
             source.publisher?.toLowerCase().includes('cub') || 
             source.publisher?.toLowerCase().includes('clcjawa')
    }
    if (category === 'legal') {
      return source.title?.toLowerCase().includes('lawsuit') || 
             source.note?.toLowerCase().includes('litigation')
    }
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <PageTitle 
        title={pageMeta['/documents'].title} 
        description={pageMeta['/documents'].description} 
        ogImage={pageMeta['/documents'].ogImage} 
      />

      <div className="border-b border-slate-200 pb-6">
        <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-sky-800 mb-1">
          Transparency & Sources
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
          Documents & Primary Sources
        </h1>
        <p className="text-sm font-sans text-slate-600 max-w-2xl">
          All figures on this tracker originate from public filings, meeting records, and verified journalism.
        </p>
        <div className="text-xs font-mono text-slate-500 mt-2">
          Last verified {LAST_VERIFIED}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0 ${
              category === cat.id 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Document Cards List */}
      <div className="space-y-4">
        {sourceEntries.map(([key, source], i) => (
          <div key={key} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-400 font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
              {source.tier && (
                <span className="text-2xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {source.tier}
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-slate-900 leading-snug">
              {source.url && source.status !== 'dead' && source.status !== 'unverified' ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-700 underline decoration-sky-300 underline-offset-2">
                  {source.title} ↗
                </a>
              ) : (
                source.title
              )}
            </h3>

            <div className="text-xs font-mono text-slate-500">
              {[source.publisher, source.date].filter(Boolean).join(' · ')}
            </div>

            {source.note && (
              <p className="text-xs font-sans text-slate-600 leading-relaxed pt-1">
                {source.note}
              </p>
            )}

            {/* Local PDF Mirror Download Button */}
            {source.localCopy && (
              <div className="pt-2">
                <a 
                  href={source.localCopy} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors"
                >
                  Download PDF Mirror ↗
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
