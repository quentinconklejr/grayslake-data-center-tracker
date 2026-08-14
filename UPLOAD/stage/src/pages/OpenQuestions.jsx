import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { questions } from '../data/questions'
import ItemCitations from '../components/ui/ItemCitations'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

const COLOR_ACCENTS = [
  'border-l-sky-500 hover:border-sky-600',
  'border-l-emerald-500 hover:border-emerald-600',
  'border-l-amber-500 hover:border-amber-600',
  'border-l-violet-500 hover:border-violet-600',
  'border-l-indigo-500 hover:border-indigo-600',
  'border-l-teal-500 hover:border-teal-600',
]

export default function OpenQuestions() {
  const [openIds, setOpenIds] = useState([]) // All start collapsed

  function toggle(id) {
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const allOpen = openIds.length === questions.length

  return (
    <FootnoteProvider>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <PageTitle 
          title={pageMeta['/questions']?.title || 'Open Questions'} 
          description={pageMeta['/questions']?.description || ''} 
          ogImage={pageMeta['/questions']?.ogImage || ''} 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-2xs font-mono font-bold uppercase tracking-widest text-sky-800 mb-1">
              Resident & Journalist Guide
            </div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm font-sans text-slate-600 max-w-2xl mt-1">
              Water draw, power capacity, noise, taxes, and zoning approvals answered with public records.
            </p>
          </div>

          <button
            onClick={() => setOpenIds(allOpen ? [] : questions.map(q => q.id))}
            className="text-xs font-mono font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2.5 rounded-xl border border-sky-200 transition-colors shrink-0"
          >
            {allOpen ? 'Collapse All ▲' : 'Expand All ▼'}
          </button>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isOpen = openIds.includes(q.id)
            const accent = COLOR_ACCENTS[idx % COLOR_ACCENTS.length]
            return (
              <div 
                key={q.id} 
                className={`border-l-4 border-y border-r border-slate-200 rounded-r-xl rounded-l-sm bg-white shadow-sm overflow-hidden transition-all ${accent}`}
              >
                <button
                  onClick={() => toggle(q.id)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 leading-snug">
                    {q.question}
                  </h2>
                  <span className="text-slate-400 font-mono text-base font-bold shrink-0">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-sm font-sans text-slate-700">
                    {q.plain && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-slate-800">
                        <strong className="block text-2xs font-mono uppercase tracking-wider text-sky-900 mb-1 font-bold">
                          Plain Language Summary
                        </strong>
                        {q.plain}
                      </div>
                    )}

                    {q.stated && q.stated.length > 0 && (
                      <div>
                        <h4 className="text-2xs font-mono uppercase tracking-wider text-emerald-800 font-bold mb-2">
                          Stated Public Record & Official Filings
                        </h4>
                        <ul className="space-y-2.5 pl-4 list-disc marker:text-emerald-500">
                          {q.stated.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {item.text} <ItemCitations item={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.disputed && q.disputed.length > 0 && (
                      <div>
                        <h4 className="text-2xs font-mono uppercase tracking-wider text-amber-800 font-bold mb-2">
                          Contested / Disputed Claims
                        </h4>
                        <ul className="space-y-2.5 pl-4 list-disc marker:text-amber-500">
                          {q.disputed.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {item.text} <ItemCitations item={i} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.unknown && q.unknown.length > 0 && (
                      <div>
                        <h4 className="text-2xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                          Unanswered in Public Filings
                        </h4>
                        <ul className="space-y-2 pl-4 list-disc marker:text-slate-400">
                          {q.unknown.map((item, i) => (
                            <li key={i} className="leading-relaxed text-slate-600">
                              {item.text} <ItemCitations item={i} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
