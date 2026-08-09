import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import AccordionSection from '../components/ui/AccordionSection'
import { questions } from '../data/questions'
import { LAST_VERIFIED } from '../data/siteConfig'

export default function OpenQuestions() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState([])

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
    setOpen(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/questions']} />

      <FadeIn className="mb-8 pb-6 border-b border-edge-soft">
        <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-2">Community Research</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Frequently Asked Questions</h1>
        <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
          Resident questions on energy draw, water usage, noise levels, property taxes, and school funding, answered with cited public sources.
        </p>
        <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      {/* Instant Search Bar */}
      <FadeIn className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions by keyword (e.g. water, noise, ComEd, taxes)..."
          className="w-full text-sm font-sans px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none"
        />
      </FadeIn>

      {/* Accordion Questions */}
      <div className="space-y-4 mb-12">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => (
            <AccordionSection
              key={q.id}
              id={q.id}
              label={q.question}
              blurb={q.category || 'General'}
              open={open.includes(q.id)}
              onToggle={() => toggle(q.id)}
            >
              <div className="p-5 bg-slate-50/80 rounded-lg text-base text-slate-800 leading-relaxed border border-slate-200/80">
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
    </div>
  )
}
