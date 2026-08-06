import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageTitle from '../components/ui/PageTitle'
import PageNext from '../components/ui/PageNext'
import BackToTop from '../components/ui/BackToTop'
import { pageMeta } from '../data/pageMeta'
import ItemCitations from '../components/ui/ItemCitations'
import { keysOf } from '../lib/citationKeys'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { EVIDENCE } from '../components/ui/EvidenceBlock'
import { questions } from '../data/questions'
import { LAST_VERIFIED } from '../data/siteConfig'

// Pre-collect all sourceKeys in order of first appearance across all questions
// so footnote numbers are stable even when accordion items are collapsed.
const PRELOAD_KEYS = []
for (const q of questions) {
  for (const block of ['stated', 'disputed', 'unknown']) {
    for (const item of q[block] ?? []) {
      for (const k of keysOf(item)) {
        if (!PRELOAD_KEYS.includes(k)) PRELOAD_KEYS.push(k)
      }
    }
  }
}

const CAT_META = {
  water:   { label: 'Water',   accent: 'border-l-sky-400',     active: 'text-sky-700 bg-sky-50 border-sky-300',          inactive: 'text-gray-500 border-edge-soft hover:text-sky-700 hover:border-sky-300' },
  energy:  { label: 'Energy',  accent: 'border-l-amber-400',   active: 'text-amber-700 bg-amber-50 border-amber-300',    inactive: 'text-gray-500 border-edge-soft hover:text-amber-700 hover:border-amber-300' },
  scale:   { label: 'Scale',   accent: 'border-l-violet-400',  active: 'text-violet-700 bg-violet-50 border-violet-300', inactive: 'text-gray-500 border-edge-soft hover:text-violet-700 hover:border-violet-300' },
  tax:     { label: 'Tax',     accent: 'border-l-emerald-400', active: 'text-emerald-700 bg-emerald-50 border-emerald-300', inactive: 'text-gray-500 border-edge-soft hover:text-emerald-700 hover:border-emerald-300' },
  jobs:    { label: 'Jobs',    accent: 'border-l-blue-400',    active: 'text-blue-700 bg-blue-50 border-blue-300',       inactive: 'text-gray-500 border-edge-soft hover:text-blue-700 hover:border-blue-300' },
  process: { label: 'Process', accent: 'border-l-red-400',     active: 'text-red-700 bg-red-50 border-red-300',          inactive: 'text-gray-500 border-edge-soft hover:text-red-700 hover:border-red-300' },
}

// dotCls values are rendered on an aria-hidden bullet that repeats the
// adjacent text label, so they are decoration and exempt from contrast. The
// label carries the meaning, which also keeps this clear of 1.4.1 Use of Colour.
const BLOCKS = [
  { key: 'stated',   textCls: 'text-gray-700', dotCls: 'text-emerald-400' }, // decorative (aria-hidden)
  { key: 'disputed', textCls: 'text-gray-700', dotCls: 'text-amber-400'   }, // decorative (aria-hidden)
  { key: 'unknown',  textCls: 'text-gray-500', dotCls: 'text-gray-300'    }, // decorative (aria-hidden)
]

function QuestionCard({ q, isExpanded, onToggle }) {
  const cat = CAT_META[q.category]
  return (
    <div className="border border-edge rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors duration-150">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors duration-150 group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className={`shrink-0 mt-0.5 inline-flex w-16 justify-center items-center px-2 py-0.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cat.active}`}>
            {cat.label}
          </span>
          <h3 className="text-sm font-display font-semibold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors">
            {q.question}
          </h3>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 space-y-2 border-t border-gray-100">
              {BLOCKS.map(({ key, textCls, dotCls }) => {
                const ev = EVIDENCE[key]
                const items = q[key]
                if (!items?.length) return null
                return (
                  <div
                    key={key}
                    className={`mt-3 pl-4 border-l-2 ${ev.border} ${ev.bg} rounded-r py-3 pr-3`}
                  >
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={ev.labelCls}>{ev.icon}</span>
                      <p className={`text-2xs font-mono uppercase tracking-widest font-semibold ${ev.labelCls}`}>{ev.tag}</p>
                      <span aria-hidden="true" className="text-2xs text-gray-300">·</span>
                      <p className="text-2xs text-gray-400">{ev.desc}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <span aria-hidden="true" className={`shrink-0 mt-1 ${dotCls}`}>·</span>
                          <p className={`flex-1 min-w-0 text-xs leading-relaxed ${textCls}`}>
                            {item.text}
                            <ItemCitations item={item} />
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OpenQuestions() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedIds, setExpandedIds] = useState(new Set())
  // Plain-language view is the default. This page absorbed the Residents
  // guide, whose whole purpose was making the same material readable without
  // prior context; leading with the detailed evidence blocks would lose that.
  const [detailed, setDetailed] = useState(false)

  const visible = activeCategory === 'all'
    ? questions
    : questions.filter(q => q.category === activeCategory)

  const allExpanded = visible.every(q => expandedIds.has(q.id))

  function toggle(id) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allExpanded) {
      setExpandedIds(prev => {
        const next = new Set(prev)
        visible.forEach(q => next.delete(q.id))
        return next
      })
    } else {
      setExpandedIds(prev => {
        const next = new Set(prev)
        visible.forEach(q => next.add(q.id))
        return next
      })
    }
  }

  function handleCategoryChange(cat) {
    setActiveCategory(cat)
    setExpandedIds(new Set())
  }

  return (
    <FootnoteProvider preload={PRELOAD_KEYS}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/questions']} />

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.18em] mb-4">Questions &amp; Answers</p>
        <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tight mb-3">What&rsquo;s Settled, What&rsquo;s Not</h1>
        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
          What&rsquo;s confirmed in the public record, what&rsquo;s contested, and what has no answer yet: water, electricity,
          scale, jobs, taxes and the approval process.
        </p>

        <div className="mt-5 inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50" role="group" aria-label="Level of detail">
          {[
            { key: false, label: 'Plain language' },
            { key: true, label: 'Full detail' },
          ].map(({ key, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDetailed(key)}
              aria-pressed={detailed === key}
              className={`px-4 py-2 text-sm rounded-md transition-colors min-h-[40px] ${
                detailed === key
                  ? 'bg-white text-gray-900 font-medium shadow-sm border border-edge'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-2xs font-mono text-gray-600 mt-4">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      {detailed && (
      <FadeIn>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5 mb-10">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-display font-semibold text-blue-800 mb-1.5">How this page works</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                All statements here come from public records, journalism, or legal filings.
                The categories describe who made each claim, not whether it&rsquo;s accurate.
                <span className="text-emerald-700"> "Stated"</span> reflects what officials or the developer have said on record.
                <span className="text-amber-700"> "Disputed"</span> reflects what critics, advocates, or independent researchers have said on record.
                <span className="text-gray-400"> "Not Yet Public"</span> marks questions with no public answer.
                Every claim links to its source.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
      )}

      <FadeIn className="flex flex-col gap-3 mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => handleCategoryChange('all')}
            className={`inline-flex items-center px-2.5 py-1.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
              activeCategory === 'all'
                ? 'text-gray-900 bg-gray-100 border-gray-300'
                : 'text-gray-500 border-edge-soft hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            All ({questions.length})
          </button>
          {Object.entries(CAT_META).map(([cat, meta]) => {
            const count = questions.filter(q => q.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={activeCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
                  activeCategory === cat ? meta.active : meta.inactive
                }`}
              >
                {meta.label} ({count})
              </button>
            )
          })}
        </div>
        <button
          onClick={toggleAll}
          className="text-2xs font-mono text-gray-500 hover:text-gray-800 transition-colors duration-150 flex items-center gap-1.5 shrink-0"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
          <svg className={`w-3 h-3 transition-transform duration-150 ${allExpanded ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </FadeIn>

      <p aria-live="polite" className="sr-only">
        {visible.length} of {questions.length} questions shown, {detailed ? 'full detail' : 'plain language'} view
      </p>
      <div className={detailed ? 'space-y-2' : 'space-y-8'}>
        {visible.map((q, i) => (
          <FadeIn key={q.id} delay={Math.min(i * 0.03, 0.09)}>
            {detailed ? (
              <QuestionCard
                q={q}
                isExpanded={expandedIds.has(q.id)}
                onToggle={() => toggle(q.id)}
              />
            ) : (
              <section aria-labelledby={`q-${q.id}`}>
                <div className={`pl-5 border-l-4 mb-4 ${(CAT_META[q.category] ?? CAT_META.water).accent}`}>
                  <h2 id={`q-${q.id}`} className="text-xl font-display font-bold text-gray-900 mb-2">
                    {q.question}
                  </h2>
                  <p className="text-base text-gray-700 leading-relaxed">{q.plain}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDetailed(true)
                    setExpandedIds(prev => new Set(prev).add(q.id))
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 transition-all duration-150 min-h-[44px]"
                >
                  See the sources behind this
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </section>
            )}
          </FadeIn>
        ))}
      </div>

      <FadeIn>
        <div className="mt-10 pt-6 border-t border-edge-soft">
          <p className="text-xs text-gray-500 leading-relaxed">
            Questions are added as new disputes surface in public records, journalism, or court filings.
          </p>
        </div>
      </FadeIn>
      <FootnoteList />
      <PageNext
        to="/reporters"
        label="For Reporters"
        desc="Key figures with citations ready to copy, plus a press contacts reference for story inquiries."
        color="text-violet-700"
        hoverBorder="hover:border-violet-300"
      />
      <BackToTop />
    </div>
    </FootnoteProvider>
  )
}
