import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { questions } from '../data/questions'
import ItemCitations from '../components/ui/ItemCitations'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

/*
 * Frequently-asked questions, each collapsed into an accordion row on
 * paper ground. The old design gave every row a colored left-rule chosen
 * from a rotating 6-hue palette; the retype drops that decoration —
 * questions are peers and don't need color-coding. A single hairline
 * top-rule per row supplies the visual separation.
 */

export default function OpenQuestions() {
  const [openIds, setOpenIds] = useState([]) // All start collapsed

  function toggle(id) {
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const allOpen = openIds.length === questions.length

  return (
    <FootnoteProvider>
      <Container size="wide" className="py-8 sm:py-10 space-y-8">
        <PageTitle
          title={pageMeta['/questions']?.title || 'Open Questions'}
          description={pageMeta['/questions']?.description || ''}
          ogImage={pageMeta['/questions']?.ogImage || ''}
        />

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rule pb-6">
          <div className="max-w-2xl">
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
              Resident &amp; Journalist Guide
            </p>
            <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05]">
              Frequently Asked Questions
            </h1>
            <p className="text-base font-sans text-ink-700 mt-3 leading-relaxed">
              Water draw, power capacity, noise, taxes, and zoning approvals answered with public records.
            </p>
          </div>

          <button
            onClick={() => setOpenIds(allOpen ? [] : questions.map(q => q.id))}
            className="text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent shrink-0 min-h-[44px]"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </header>

        {/* Desktop layout: jump nav (sticky) on the right, questions
            list on the left, capped to a readable measure. Under lg the
            jump nav disappears (accordion titles serve the same purpose
            in a single-column stack). */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12 xl:gap-16">

        {/* Questions accordion list */}
        <div className="max-w-3xl">
          {questions.map(q => {
            const isOpen = openIds.includes(q.id)
            return (
              <div key={q.id} id={q.id} className="border-t border-rule scroll-mt-24">
                <button
                  onClick={() => toggle(q.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-5 sm:py-6 flex items-start justify-between gap-4 hover:bg-paper-sunk transition-colors"
                >
                  <h2 className="text-xl sm:text-2xl font-display text-ink-900 leading-snug">
                    {q.question}
                  </h2>
                  <span aria-hidden="true" className="text-ink-400 font-mono text-lg shrink-0 pt-1">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pl-0 sm:pl-8 pb-6 pt-2 space-y-5 text-base font-sans text-ink-700">
                    {q.plain && (
                      <aside className="border-l-[3px] border-status-approval bg-status-approval-soft pl-5 py-3 pr-4 leading-relaxed text-ink-800">
                        <p className="text-xs font-display italic text-status-approval mb-1">
                          Plain Language Summary
                        </p>
                        {q.plain}
                      </aside>
                    )}

                    {q.stated && q.stated.length > 0 && (
                      <div>
                        <p className="text-xs font-display italic text-status-stated tracking-wide mb-2">
                          Stated Public Record &amp; Official Filings
                        </p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-status-stated">
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
                        <p className="text-xs font-display italic text-status-disputed tracking-wide mb-2">
                          Contested / Disputed Claims
                        </p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-status-disputed">
                          {q.disputed.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {item.text} <ItemCitations item={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.unknown && q.unknown.length > 0 && (
                      <div>
                        <p className="text-xs font-display italic text-status-unknown tracking-wide mb-2">
                          Unanswered in Public Filings
                        </p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-status-unknown">
                          {q.unknown.map((item, i) => (
                            <li key={i} className="leading-relaxed text-ink-600">
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
          <div className="border-t border-rule" />
        </div>

        <nav aria-label="Jump to question" className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <p className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500 mb-3">
            Jump to
          </p>
          <ol className="space-y-2 border-l border-rule pl-4">
            {questions.map((q, i) => (
              <li key={q.id}>
                <a
                  href={`#${q.id}`}
                  onClick={() => {
                    if (!openIds.includes(q.id)) setOpenIds(prev => [...prev, q.id])
                  }}
                  className="block text-sm font-sans text-ink-700 hover:text-accent leading-snug underline underline-offset-4 decoration-transparent hover:decoration-accent transition-colors"
                >
                  <span aria-hidden="true" className="font-mono text-ink-500 mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {q.question}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        </div>

        <FootnoteList />
      </Container>
    </FootnoteProvider>
  )
}
