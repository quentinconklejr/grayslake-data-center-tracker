import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import AccordionSection from '../components/ui/AccordionSection'
import { questions } from '../data/questions'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

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

        {/* Search Bar & Expand Controls */}
        <FadeIn className="mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions by keyword (e.g. water, noise, ComEd, taxes)..."
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

        {/* Questions Rendered Using AccordionSection */}
        <div className="space-y-4 mb-12">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(q => (
              <AccordionSection
                key={q.id}
                id={q.id}
                label={q.question}
                blurb={q.category ? `${q.category.toUpperCase()} IMPACT` : 'GENERAL'}
                open={openIds.includes(q.id)}
                onToggle={() => toggle(q.id)}
              >
                <div className="p-5 bg-white rounded-lg text-base text-slate-800 leading-relaxed border border-slate-200">
                  {q.answer}
                </div>
              </AccordionSection>
            ))
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
