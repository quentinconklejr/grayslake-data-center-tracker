import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { questions } from '../data/questions'
import { LAST_VERIFIED } from '../data/siteConfig'
import ItemCitations from '../components/ui/ItemCitations'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'water', label: 'Water Usage' },
  { id: 'energy', label: 'Power & Grid' },
  { id: 'scale', label: 'Campus Scale' },
  { id: 'tax', label: 'Property Tax' },
  { id: 'process', label: 'Zoning & Lawsuits' },
  { id: 'jobs', label: 'Employment' },
]

export default function OpenQuestions() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openIds, setOpenIds] = useState(questions.map(q => q.id)) // Default open for easy scanning

  const filteredQuestions = activeCategory === 'all'
    ? questions
    : questions.filter(q => q.category === activeCategory)

  function toggle(id) {
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const allOpen = openIds.length === filteredQuestions.length && filteredQuestions.length > 0

  return (
    <FootnoteProvider>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <PageTitle 
          title={pageMeta['/questions'].title} 
          description={pageMeta['/questions'].description} 
          ogImage={pageMeta['/questions'].ogImage} 
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-sky-800 mb-1">
              Public Record Directory
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-sm font-sans text-slate-600 max-w-2xl">
              Resident inquiries regarding water draw, electrical capacity, property taxes, noise levels, and lawsuit status, answered with cited public records.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 shrink-0">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Category Filter Pills & Global Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0 ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setOpenIds(allOpen ? [] : filteredQuestions.map(q => q.id))}
            className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-lg border border-sky-200 transition-colors shrink-0 self-start sm:self-auto"
          >
            {allOpen ? 'Collapse All ▲' : 'Expand All ▼'}
          </button>
        </div>

        {/* Question Cards */}
        <div className="space-y-4">
          {filteredQuestions.map(q => {
            const isOpen = openIds.includes(q.id)
            return (
              <div key={q.id} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(q.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{q.question}</h3>
                  <span className="text-slate-400 font-mono text-sm shrink-0">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-sm font-sans text-slate-700">
                    {/* Plain Language Summary */}
                    {q.plain && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-slate-800">
                        <strong className="block text-2xs font-mono uppercase tracking-wider text-sky-900 mb-1 font-bold">
                          Plain Language Summary
                        </strong>
                        {q.plain}
                      </div>
                    )}

                    {/* Stated Public Record */}
                    {q.stated && q.stated.length > 0 && (
                      <div>
                        <h4 className="text-2xs font-mono uppercase tracking-wider text-emerald-800 font-bold mb-2">
                          Stated Public Record & Official Filings
                        </h4>
                        <ul className="space-y-2.5 pl-4 list-disc marker:text-emerald-500">
                          {q.stated.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {item.text} <ItemCitations item={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Contested Points */}
                    {q.disputed && q.disputed.length > 0 && (
                      <div>
                        <h4 className="text-2xs font-mono uppercase tracking-wider text-amber-800 font-bold mb-2">
                          Contested / Disputed Claims
                        </h4>
                        <ul className="space-y-2.5 pl-4 list-disc marker:text-amber-500">
                          {q.disputed.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {item.text} <ItemCitations item={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Unanswered Points */}
                    {q.unknown && q.unknown.length > 0 && (
                      <div>
                        <h4 className="text-2xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                          Unanswered in Public Filings
                        </h4>
                        <ul className="space-y-2 pl-4 list-disc marker:text-slate-400">
                          {q.unknown.map((item, idx) => (
                            <li key={idx} className="leading-relaxed text-slate-600">
                              {item.text} <ItemCitations item={item} />
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
