import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import { questions } from '../data/questions'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

// Category badge helper for styled tags
function CategoryBadge({ category }) {
  const map = {
    water: { label: 'Water Impact', style: 'text-sky-800 bg-sky-50 border-sky-200' },
    energy: { label: 'Power & Grid', style: 'text-amber-800 bg-amber-50 border-amber-200' },
    scale: { label: 'Campus Scale', style: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
    tax: { label: 'Tax Revenue', style: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
    process: { label: 'Governance & Process', style: 'text-purple-800 bg-purple-50 border-purple-200' },
    jobs: { label: 'Employment', style: 'text-teal-800 bg-teal-50 border-teal-200' },
  }
  const meta = map[category?.toLowerCase()] || { label: category || 'General', style: 'text-slate-800 bg-slate-100 border-slate-200' }

  return (
    <span className={`text-xs font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${meta.style}`}>
      {meta.label}
    </span>
  )
}

export default function OpenQuestions() {
  const [search, setSearch] = useState('')
  const [openIds, setOpenIds] = useState([])

  const filteredQuestions = questions.filter(q => {
    const query = search.toLowerCase().trim()
    if (!query) return true
    return (
      q.question.toLowerCase().includes(query) ||
      q.answer.toLowerCase().includes(query) ||
      (q.category && q.category.toLowerCase().includes(query))
    )
  })

  function toggle(id) {
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const allOpen = openIds.length === filteredQuestions.length && filteredQuestions.length > 0

  return (
    <FootnoteProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <PageTitle {...pageMeta['/questions']} />

        <FadeIn className="mb-8 pb-6 border-b border-edge-soft">
          <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-2">Community Research</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Frequently Asked Questions</h1>
          <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
            Resident questions on water consumption, electrical rates, noise levels, property taxes, and municipal approvals, answered with cited public sources.
          </p>
          <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* Search Bar & Controls */}
        <FadeIn className="mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions (e.g. water, noise, ComEd, taxes, jobs)..."
                className="w-full text-sm font-sans px-4 py-3 pl-10 rounded-xl border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM11.5 11.5L15 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => setOpenIds(allOpen ? [] : filteredQuestions.map(q => q.id))}
              className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-3 rounded-xl border border-sky-200 transition-colors shrink-0"
            >
              {allOpen ? 'Collapse All ▲' : 'Expand All ▼'}
            </button>
          </div>
        </FadeIn>

        {/* Question Cards */}
        <div className="space-y-4 mb-12">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(q => {
              const isOpen = openIds.includes(q.id)
              return (
                <FadeIn key={q.id}>
                  <div className="newsroom-card overflow-hidden transition-all duration-150">
                    {/* Question Header Button */}
                    <button
                      type="button"
                      onClick={() => toggle(q.id)}
                      className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-2">
                        <CategoryBadge category={q.category} />
                        <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-snug">
                          {q.question}
                        </h3>
                      </div>
                      <span className="text-slate-400 shrink-0 mt-1">
                        <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-700' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>

                    {/* Answer Body */}
                    {isOpen && (
                      <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-base text-slate-800 leading-relaxed space-y-3 pt-4">
                          {q.answer}
                        </div>
                      </div>
                    )}
                  </div>
                </FadeIn>
              )
            })
          ) : (
            <div className="newsroom-card p-8 text-center text-sm font-mono text-slate-600">
              No questions match "{search}"
            </div>
          )}
        </div>

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
