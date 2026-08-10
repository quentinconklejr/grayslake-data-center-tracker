import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { questions } from '../data/questions'
import { LAST_VERIFIED } from '../data/siteConfig'
import ItemCitations from '../components/ui/ItemCitations'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

export default function OpenQuestions() {
  const [search, setSearch] = useState('')
  const [openIds, setOpenIds] = useState([])

  const filteredQuestions = (questions || []).filter(q => {
    if (!q) return false
    const query = search.toLowerCase().trim()
    if (!query) return true
    const questionText = q.question || ''
    const plainText = q.plain || ''
    const catText = q.category || ''
    return (
      questionText.toLowerCase().includes(query) ||
      plainText.toLowerCase().includes(query) ||
      catText.toLowerCase().includes(query)
    )
  })

  function toggle(id) {
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const allOpen = openIds.length === filteredQuestions.length && filteredQuestions.length > 0

  return (
    <FootnoteProvider>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <PageTitle 
          title={pageMeta['/questions'].title} 
          description={pageMeta['/questions'].description} 
          ogImage={pageMeta['/questions'].ogImage} 
        />

        <div>
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-sky-800 mb-1">
            Community Research
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-sm font-sans text-slate-600">
            Resident questions on water consumption, electrical rates, noise levels, property taxes, and municipal approvals, answered with cited public sources.
          </p>
          <div className="text-xs font-mono text-slate-500 mt-2">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Search & Global Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions (e.g. water, noise, ComEd, taxes, jobs)..."
            className="w-full text-sm font-sans px-4 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none"
          />
          <button
            onClick={() => setOpenIds(allOpen ? [] : filteredQuestions.map(q => q.id))}
            className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2.5 rounded-xl border border-sky-200 transition-colors shrink-0"
          >
            {allOpen ? 'Collapse All ▲' : 'Expand All ▼'}
          </button>
        </div>

        {/* Accordion Question List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(q => {
              const isOpen = openIds.includes(q.id)
              return (
                <div key={q.id} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggle(q.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <h3 className="text-base font-semibold text-slate-900">{q.question}</h3>
                    <span className="text-slate-400 font-mono text-sm shrink-0">{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 text-sm font-sans text-slate-700">
                      {/* Plain Language Summary */}
                      {q.plain && (
                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 leading-relaxed text-slate-800">
                          <strong className="block text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">In Plain Language</strong>
                          {q.plain}
                        </div>
                      )}

                      {/* Stated Public Record */}
                      {q.stated && q.stated.length > 0 && (
                        <div>
                          <h4 className="text-2xs font-mono uppercase tracking-wider text-emerald-800 font-semibold mb-2">Stated Public Record</h4>
                          <ul className="space-y-2 pl-4 list-disc marker:text-emerald-500">
                            {q.stated.map((item, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {item.text} <ItemCitations item={item} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Disputed / Contested Claims */}
                      {q.disputed && q.disputed.length > 0 && (
                        <div>
                          <h4 className="text-2xs font-mono uppercase tracking-wider text-amber-800 font-semibold mb-2">Contested / Disputed Points</h4>
                          <ul className="space-y-2 pl-4 list-disc marker:text-amber-500">
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
                          <h4 className="text-2xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">Unanswered in Public Filings</h4>
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
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No questions match "{search}"
            </div>
          )}
        </div>

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
