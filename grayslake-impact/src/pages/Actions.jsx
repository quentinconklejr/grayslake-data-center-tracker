import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import BackToTop from '../components/ui/BackToTop'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { actions } from '../data/actions'
import { LAST_VERIFIED } from '../data/siteConfig'

/*
 * Jurisdictional actions record. Filter chips are the neutral variant of
 * the site's segmented control (dark active / bordered inactive), so a
 * dozen jurisdictions don't pull a dozen extra colours into the palette.
 */

const JURISDICTIONS = [
  'Village of Grayslake',
  '19th Judicial Circuit Court',
  'Residents & Opposition Coalition',
  'Lake County Board',
  'Lake County Zoning Board of Appeals',
  'Lake County SMC',
  'Avon Township',
  'US Army Corps of Engineers',
  'ComEd/PJM',
  'State of Illinois',
]

const ACTION_TYPES = [...new Set(actions.map(a => a.actionType))].sort()

function fmtDate(raw) {
  if (!raw) return ''
  const parts = raw.split('-')
  if (parts.length === 1) return raw
  if (parts.length === 2) {
    const d = new Date(`${parts[0]}-${parts[1]}-01T00:00:00`)
    return isNaN(d) ? raw : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const d = new Date(`${raw}T00:00:00`)
  return isNaN(d) ? raw : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Pre-collect all sourceIds for stable footnote numbers
const PRELOAD_KEYS = []
for (const a of actions) {
  for (const k of a.sourceIds) {
    if (!PRELOAD_KEYS.includes(k)) PRELOAD_KEYS.push(k)
  }
}

function chipClass(active) {
  return `inline-flex items-center px-3 py-1.5 border text-xs font-sans font-semibold transition-colors duration-150 min-h-[44px] ${
    active
      ? 'bg-ink-900 text-paper border-ink-900'
      : 'bg-transparent text-ink-600 border-rule hover:border-ink-700 hover:text-ink-900'
  }`
}

function ActionCard({ action }) {
  const isPending = action.status === 'pending'
  return (
    <article className="py-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
        <time className="text-xs font-mono text-ink-500 shrink-0">{fmtDate(action.date)}</time>
        <span aria-hidden="true" className="text-ink-400">·</span>
        <span className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-700">
          {action.jurisdiction}
        </span>
        <span aria-hidden="true" className="text-ink-400">·</span>
        <span className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">{action.actionType}</span>
        <span className="ml-auto shrink-0">
          {isPending
            ? <span className="text-2xs font-sans font-semibold uppercase tracking-wide text-status-disputed">Pending</span>
            : <span className="text-2xs font-sans font-semibold uppercase tracking-wide text-status-stated">Complete</span>
          }
        </span>
      </div>
      <p className="text-base font-sans text-ink-800 leading-relaxed">{action.description}</p>
      <p className="text-sm font-sans text-ink-600 leading-relaxed mt-2">
        <span className="font-semibold text-ink-800">Outcome: </span>
        {action.outcome}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-2xs font-mono text-ink-500">
          Last verified: {action.lastVerified}
        </span>
        {action.sourceIds.map(k => <SourceCitation key={k} sourceKey={k} />)}
      </div>
    </article>
  )
}

export default function Actions() {
  const [juriFilter, setJuriFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const visible = actions.filter(a => {
    const juriMatch = juriFilter === 'all' || a.jurisdiction === juriFilter
    const typeMatch = typeFilter === 'all' || a.actionType === typeFilter
    return juriMatch && typeMatch
  })

  return (
    <FootnoteProvider preload={PRELOAD_KEYS}>
      <Container size="default" className="py-12 sm:py-16">
        <PageTitle {...pageMeta['/actions']} />

        <FadeIn className="mb-10 pb-8 border-b border-rule">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Regulatory actions</p>
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-3">Jurisdictional Actions</h1>
          <p className="text-lg font-sans text-ink-700 max-w-2xl leading-relaxed">
            Approvals, permit applications, legal challenges, and policy actions across the municipal,
            county, state and federal bodies with jurisdiction over T5 @ Chicago IV, plus the case now
            before the 19th Judicial Circuit and the private parties bringing it.
            All entries are sourced and cited. Verification dates appear on each entry.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-2xs font-mono text-ink-500">{actions.length} actions on file</span>
            <span aria-hidden="true" className="text-ink-400">·</span>
            <span className="text-2xs font-mono text-ink-500">Last verified {LAST_VERIFIED}</span>
          </div>
        </FadeIn>

        {/* Jurisdiction filter */}
        <FadeIn className="mb-6">
          <p id="juri-filter-label" className="text-xs font-display italic text-ink-500 tracking-wide mb-3">Filter by jurisdiction</p>
          <div role="group" aria-labelledby="juri-filter-label" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={juriFilter === 'all'} onClick={() => setJuriFilter('all')} className={chipClass(juriFilter === 'all')}>
              All
            </button>
            {JURISDICTIONS.map(j => {
              const count = actions.filter(a => a.jurisdiction === j).length
              return (
                <button
                  key={j}
                  type="button"
                  aria-pressed={juriFilter === j}
                  onClick={() => setJuriFilter(j)}
                  className={chipClass(juriFilter === j)}
                >
                  {j}
                  {count > 0 && <span className="opacity-70 ml-1">({count})</span>}
                </button>
              )
            })}
          </div>
        </FadeIn>

        {/* Action type filter */}
        <FadeIn className="mb-10">
          <p id="type-filter-label" className="text-xs font-display italic text-ink-500 tracking-wide mb-3">Filter by action type</p>
          <div role="group" aria-labelledby="type-filter-label" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={typeFilter === 'all'} onClick={() => setTypeFilter('all')} className={chipClass(typeFilter === 'all')}>
              All types
            </button>
            {ACTION_TYPES.map(t => (
              <button
                key={t}
                type="button"
                aria-pressed={typeFilter === t}
                onClick={() => setTypeFilter(t)}
                className={chipClass(typeFilter === t)}
              >
                {t}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Entries */}
        <p aria-live="polite" className="sr-only">
          {visible.length} of {actions.length} actions shown
        </p>
        <div className="divide-y divide-rule-soft border-y border-rule">
          {visible.length === 0 ? (
            <FadeIn>
              <p className="text-sm font-sans text-ink-500 py-12 text-center">No actions on file for this filter.</p>
            </FadeIn>
          ) : (
            visible.map((action, i) => (
              <FadeIn key={action.id} delay={i * 0.04}>
                <ActionCard action={action} />
              </FadeIn>
            ))
          )}
        </div>

        <FadeIn className="mt-12 border-t border-rule pt-8">
          <div className="flex flex-wrap gap-6 text-sm font-sans">
            <Link to="/timeline" className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-rule hover:decoration-accent">
              Full project timeline →
            </Link>
            <Link to="/documents" className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-rule hover:decoration-accent">
              All documents and sources →
            </Link>
          </div>
        </FadeIn>

        <FootnoteList />
        <BackToTop />
      </Container>
    </FootnoteProvider>
  )
}
