import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageTitle from '../components/ui/PageTitle'
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
  water:   { label: 'Water',   active: 'text-sky-700 bg-sky-50 border-sky-300',          inactive: 'text-gray-500 border-gray-200 hover:text-sky-700 hover:border-sky-300' },
  energy:  { label: 'Energy',  active: 'text-amber-700 bg-amber-50 border-amber-300',    inactive: 'text-gray-500 border-gray-200 hover:text-amber-700 hover:border-amber-300' },
  scale:   { label: 'Scale',   active: 'text-violet-700 bg-violet-50 border-violet-300', inactive: 'text-gray-500 border-gray-200 hover:text-violet-700 hover:border-violet-300' },
  tax:     { label: 'Tax',     active: 'text-emerald-700 bg-emerald-50 border-emerald-300', inactive: 'text-gray-500 border-gray-200 hover:text-emerald-700 hover:border-emerald-300' },
  process: { label: 'Process', active: 'text-red-700 bg-red-50 border-red-300',          inactive: 'text-gray-500 border-gray-200 hover:text-red-700 hover:border-red-300' },
}

const BLOCKS = [
  { key: 'stated',   textCls: 'text-gray-700', dotCls: 'text-emerald-400' },
  { key: 'disputed', textCls: 'text-gray-700', dotCls: 'text-amber-400'   },
  { key: 'unknown',  textCls: 'text-gray-500', dotCls: 'text-gray-300'    },
]

function QuestionCard({ q, isExpanded, onToggle }) {
  const cat = CAT_META[q.category]
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors duration-150">
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
                      <span className="text-2xs text-gray-300">·</span>
                      <p className="text-2xs text-gray-400">{ev.desc}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <span className={`shrink-0 mt-1 ${dotCls}`}>·</span>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/questions']} />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Unresolved Issues</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Open Questions</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Disputes and data gaps around T5 @ Chicago IV, organized by topic and sourced to the public record.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5 mb-10">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-display font-semibold text-blue-800 mb-1.5">How this page works</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This page organizes publicly sourced statements around unresolved questions.
                It takes no position.
                <span className="text-emerald-700"> "Stated"</span> reflects what officials or the developer have said on record.
                <span className="text-amber-700"> "Disputed"</span> reflects what critics, advocates, or independent researchers have said on record.
                <span className="text-gray-400"> "Not Yet Public"</span> marks questions with no public answer.
                Every claim links to its source.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
              activeCategory === 'all'
                ? 'text-gray-900 bg-gray-100 border-gray-300'
                : 'text-gray-500 border-gray-200 hover:text-gray-800 hover:border-gray-300'
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
          className="text-2xs font-mono text-gray-500 hover:text-gray-800 transition-colors duration-150 flex items-center gap-1.5 shrink-0"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
          <svg className={`w-3 h-3 transition-transform duration-150 ${allExpanded ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </FadeIn>

      <div className="space-y-2">
        {visible.map((q, i) => (
          <FadeIn key={q.id} delay={Math.min(i * 0.03, 0.09)}>
            <QuestionCard
              q={q}
              isExpanded={expandedIds.has(q.id)}
              onToggle={() => toggle(q.id)}
            />
          </FadeIn>
        ))}
      </div>

      <FadeIn>
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            Questions are added as new disputes emerge in public documents, journalism, or legal filings.
            This site is not affiliated with T5 Data Centers, LLC or the Village of Grayslake.
            Source citations link to the outlet or organization that made the statement.
            Specific article URLs for newer sources will be added as records are made available.
          </p>
        </div>
      </FadeIn>
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
