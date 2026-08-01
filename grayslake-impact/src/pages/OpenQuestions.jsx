import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageTitle from '../components/ui/PageTitle'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { questions } from '../data/questions'

const CAT_META = {
  water:   { label: 'Water',   active: 'text-sky-300 bg-sky-500/15 border-sky-500/30',       inactive: 'text-gray-500 border-gray-700/40 hover:text-sky-300/70 hover:border-sky-500/20' },
  energy:  { label: 'Energy',  active: 'text-amber-300 bg-amber-500/15 border-amber-500/30', inactive: 'text-gray-500 border-gray-700/40 hover:text-amber-300/70 hover:border-amber-500/20' },
  scale:   { label: 'Scale',   active: 'text-violet-300 bg-violet-500/15 border-violet-500/30', inactive: 'text-gray-500 border-gray-700/40 hover:text-violet-300/70 hover:border-violet-500/20' },
  tax:     { label: 'Tax',     active: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', inactive: 'text-gray-500 border-gray-700/40 hover:text-emerald-300/70 hover:border-emerald-500/20' },
  process: { label: 'Process', active: 'text-red-300 bg-red-500/15 border-red-500/30',       inactive: 'text-gray-500 border-gray-700/40 hover:text-red-300/70 hover:border-red-500/20' },
}

const BLOCKS = [
  {
    key: 'stated',
    label: 'Stated',
    desc: 'Publicly stated by officials or the developer',
    labelCls: 'text-gray-400',
    borderCls: 'border-gray-600/40',
    bgCls: '',
    dotCls: 'text-gray-600',
    textCls: 'text-gray-300',
  },
  {
    key: 'disputed',
    label: 'Disputed',
    desc: 'Contested by critics, advocates, or independent research',
    labelCls: 'text-amber-400/70',
    borderCls: 'border-amber-500/40',
    bgCls: 'bg-amber-400/[0.03]',
    dotCls: 'text-amber-700/50',
    textCls: 'text-gray-300',
  },
  {
    key: 'unknown',
    label: 'Not Yet Public',
    desc: 'Genuinely unanswered — no public document covers this',
    labelCls: 'text-gray-600',
    borderCls: 'border-gray-700/30',
    bgCls: 'bg-gray-900/40',
    dotCls: 'text-gray-700',
    textCls: 'text-gray-500',
  },
]

function QuestionCard({ q, isExpanded, onToggle }) {
  const cat = CAT_META[q.category]
  return (
    <div className="border border-gray-800/50 rounded-xl overflow-hidden bg-gray-900/20">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gray-900/50 transition-colors duration-150 group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className={`shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cat.active}`}>
            {cat.label}
          </span>
          <h3 className="text-sm font-display font-semibold text-gray-200 leading-snug group-hover:text-gray-100 transition-colors">
            {q.question}
          </h3>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
            <div className="px-6 pb-6 pt-1 space-y-2 border-t border-gray-800/40">
              {BLOCKS.map(({ key, label, desc, labelCls, borderCls, bgCls, dotCls, textCls }) => {
                const items = q[key]
                if (!items?.length) return null
                return (
                  <div
                    key={key}
                    className={`mt-3 pl-4 border-l-2 ${borderCls} ${bgCls} rounded-r py-3 pr-3`}
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <p className={`text-2xs font-mono uppercase tracking-widest font-semibold ${labelCls}`}>{label}</p>
                      <span className="text-2xs text-gray-700">·</span>
                      <p className="text-2xs text-gray-600">{desc}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <span className={`shrink-0 mt-1 ${dotCls}`}>·</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${textCls}`}>{item.text}</p>
                            {item.sourceKey && (
                              <div className="mt-1.5">
                                <SourceCitation sourceKey={item.sourceKey} />
                              </div>
                            )}
                          </div>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Open Questions" />

      {/* Header */}
      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-blue-400/50 uppercase tracking-[0.2em] mb-3">Unresolved Issues</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Open Questions</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          The key disputes and data gaps around T5 @ Chicago IV — organized by topic,
          sourced to the record, and updated as new public information becomes available.
        </p>
        <p className="text-2xs font-mono text-gray-600 mt-3">Updated Jul 31, 2026</p>
      </FadeIn>

      {/* Neutrality statement */}
      <FadeIn>
        <div className="bg-blue-400/5 border border-blue-500/20 rounded-xl px-6 py-5 mb-10">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-400/60 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-display font-semibold text-blue-300/80 mb-1.5">How this page works</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                This page organizes publicly sourced statements around genuinely unresolved questions.
                It does not characterize, evaluate, or endorse any position.
                <span className="text-gray-300"> "Stated"</span> reflects what officials or the developer have said on record.
                <span className="text-amber-300/80"> "Disputed"</span> reflects what critics, advocates, or independent researchers have said on record.
                <span className="text-gray-500"> "Not Yet Public"</span> identifies what has no public answer yet.
                Every claim links to its source.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Filter chips + expand toggle */}
      <FadeIn className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
              activeCategory === 'all'
                ? 'text-gray-200 bg-gray-700/60 border-gray-500/50'
                : 'text-gray-500 border-gray-700/40 hover:text-gray-300 hover:border-gray-600/50'
            }`}
          >
            All ({questions.length})
          </button>
          {Object.entries(CAT_META).map(([cat, meta]) => {
            const count = questions.filter(q => q.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
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
          className="text-2xs font-mono text-gray-500 hover:text-gray-300 transition-colors duration-150 flex items-center gap-1.5 shrink-0"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
          <svg className={`w-3 h-3 transition-transform duration-150 ${allExpanded ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </FadeIn>

      {/* Question cards */}
      <div className="space-y-2">
        {visible.map((q, i) => (
          <FadeIn key={q.id} delay={i * 0.05}>
            <QuestionCard
              q={q}
              isExpanded={expandedIds.has(q.id)}
              onToggle={() => toggle(q.id)}
            />
          </FadeIn>
        ))}
      </div>

      {/* Footer */}
      <FadeIn>
        <div className="mt-10 pt-6 border-t border-gray-800/40">
          <p className="text-xs text-gray-500 leading-relaxed">
            Questions are added as new disputes emerge in public documents, journalism, or legal filings.
            This site is not affiliated with T5 Data Centers, LLC or the Village of Grayslake.
            Source citations on this page link to the outlet or organization that made the statement —
            specific article URLs for newer sources will be added as they become available.
          </p>
        </div>
      </FadeIn>
    </div>
  )
}
