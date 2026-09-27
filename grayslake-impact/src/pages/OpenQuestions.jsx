import { useMemo, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { questions } from '../data/questions'
import { questionStatus, STATUS_META } from '../data/questionStatus'
import ItemCitations from '../components/ui/ItemCitations'
import StatusPill from '../components/records/StatusPill'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

/*
 * Frequently-asked questions, each collapsed into an accordion row on
 * paper ground. The old design gave every row a colored left-rule chosen
 * from a rotating 6-hue palette; the retype drops that decoration —
 * questions are peers and don't need color-coding. A single hairline
 * top-rule per row supplies the visual separation.
 */

// Everything a reader could search for in one question, lowercased once.
function searchText(q) {
  const items = [...(q.stated ?? []), ...(q.disputed ?? []), ...(q.unknown ?? [])]
  return [q.question, q.plain, ...items.map(i => i.text)].filter(Boolean).join(' ').toLowerCase()
}
const SEARCH_INDEX = Object.fromEntries(questions.map(q => [q.id, searchText(q)]))

export default function OpenQuestions() {
  const [openIds, setOpenIds] = useState([]) // All start collapsed
  const [query, setQuery] = useState('')

  // Every word must appear somewhere in the question or its answer.
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return questions
    return questions.filter(q => words.every(w => SEARCH_INDEX[q.id].includes(w)))
  }, [query])

  function toggle(id) {
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const allOpen = openIds.length === questions.length

  return (
    <FootnoteProvider>
      <Container size="default" className="py-8 sm:py-10 space-y-8">
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

        {/* Keyword search. Filters the list as you type; the count below
            the box is a live region so a screen reader hears the result. */}
        <div>
          <label htmlFor="question-search" className="block text-xs font-sans font-semibold text-ink-600 mb-1">
            Search questions
          </label>
          <div className="relative">
            <input
              id="question-search"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Try water, taxes or jobs"
              className="w-full text-base font-sans px-0 py-2 pr-10 bg-transparent border-0 border-b border-rule-strong text-ink-900 placeholder:text-ink-500 focus:outline-none focus:border-accent focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 font-mono text-base leading-none min-h-[44px] min-w-[44px]"
              >
                ×
              </button>
            )}
          </div>
          <p role="status" className="mt-2 text-xs font-sans text-ink-600">
            {query.trim()
              ? `Showing ${shown.length} of ${questions.length} questions`
              : ''}
          </p>
        </div>

        {/* Questions accordion list. Six questions do not warrant a
            jump nav; the accordion titles themselves are the index.
            Container reverted to the default measure so the titles
            do not stretch. */}
        <div>
          {shown.length === 0 && (
            <p className="border-t border-rule py-6 text-base font-sans text-ink-600">
              No question matches &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
          {shown.map(q => {
            const isOpen = openIds.includes(q.id)
            // Status is per-question metadata edited in questionStatus.js.
            // Missing / unknown keys fall back to 'unanswered' so an
            // unreviewed question shows up honestly rather than crashing.
            const status = STATUS_META[questionStatus[q.id]] ?? STATUS_META.unanswered
            return (
              <div key={q.id} className="border-t border-rule">
                <button
                  onClick={() => toggle(q.id)}
                  aria-expanded={isOpen}
                  className="group w-full text-left py-5 sm:py-6 flex items-center justify-between gap-4 hover:bg-paper-sunk transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    {/* Status sits on its own metadata row above the
                        question, as a StatusPill: the same chip the
                        records pages use, so a status looks the same
                        wherever it appears. The label carries the state
                        in words, so colour is never the only cue. */}
                    <span className="block mb-2">
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display text-ink-900 leading-snug">
                      {q.question}
                    </h2>
                  </div>
                  <span
                    aria-hidden="true"
                    className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border border-rule-strong text-ink-600 font-mono text-lg leading-none group-hover:border-accent group-hover:text-accent transition-colors"
                  >
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

        <FootnoteList />
      </Container>
    </FootnoteProvider>
  )
}
