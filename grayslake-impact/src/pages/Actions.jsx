import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { actions } from '../data/actions'
import { LAST_VERIFIED } from '../data/siteConfig'

// Jurisdiction filter options — all supported jurisdictions appear even if
// no entries exist for them yet, so the filter communicates coverage scope.
const JURISDICTIONS = [
  'Village of Grayslake',
  'Lake County Board',
  'Lake County Zoning Board of Appeals',
  'Lake County SMC',
  'Avon Township',
  'US Army Corps of Engineers',
  'ComEd/PJM',
  'State of Illinois',
]

const ACTION_TYPES = [...new Set(actions.map(a => a.actionType))].sort()

const JURI_COLORS = {
  'Village of Grayslake':                  { active: 'text-blue-700 bg-blue-50 border-blue-300',    inactive: 'text-gray-500 border-gray-200 hover:text-blue-700 hover:border-blue-300' },
  'Lake County Board':                     { active: 'text-violet-700 bg-violet-50 border-violet-300', inactive: 'text-gray-500 border-gray-200 hover:text-violet-700 hover:border-violet-300' },
  'Lake County Zoning Board of Appeals':   { active: 'text-purple-700 bg-purple-50 border-purple-300', inactive: 'text-gray-500 border-gray-200 hover:text-purple-700 hover:border-purple-300' },
  'Lake County SMC':                       { active: 'text-cyan-700 bg-cyan-50 border-cyan-300',    inactive: 'text-gray-500 border-gray-200 hover:text-cyan-700 hover:border-cyan-300' },
  'Avon Township':                         { active: 'text-amber-700 bg-amber-50 border-amber-300', inactive: 'text-gray-500 border-gray-200 hover:text-amber-700 hover:border-amber-300' },
  'US Army Corps of Engineers':            { active: 'text-emerald-700 bg-emerald-50 border-emerald-300', inactive: 'text-gray-500 border-gray-200 hover:text-emerald-700 hover:border-emerald-300' },
  'ComEd/PJM':                             { active: 'text-orange-700 bg-orange-50 border-orange-300', inactive: 'text-gray-500 border-gray-200 hover:text-orange-700 hover:border-orange-300' },
  'State of Illinois':                     { active: 'text-gray-700 bg-gray-100 border-gray-400',  inactive: 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-400' },
}

const JURI_BADGE = {
  'Village of Grayslake':                'text-blue-700 bg-blue-50 border-blue-200',
  'Lake County Board':                   'text-violet-700 bg-violet-50 border-violet-200',
  'Lake County Zoning Board of Appeals': 'text-purple-700 bg-purple-50 border-purple-200',
  'Lake County SMC':                     'text-cyan-700 bg-cyan-50 border-cyan-200',
  'Avon Township':                       'text-amber-700 bg-amber-50 border-amber-200',
  'US Army Corps of Engineers':          'text-emerald-700 bg-emerald-50 border-emerald-200',
  'ComEd/PJM':                           'text-orange-700 bg-orange-50 border-orange-200',
  'State of Illinois':                   'text-gray-700 bg-gray-100 border-gray-300',
}

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

function ActionCard({ action }) {
  const juriBadge = JURI_BADGE[action.jurisdiction] ?? 'text-gray-600 bg-gray-100 border-gray-200'
  const isPending = action.status === 'pending'
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-100">
        <time className="text-2xs font-mono text-gray-400 shrink-0">{fmtDate(action.date)}</time>
        <span className="text-gray-200 text-2xs">·</span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${juriBadge}`}>
          {action.jurisdiction}
        </span>
        <span className="text-gray-200 text-2xs">·</span>
        <span className="text-2xs font-mono text-gray-500 uppercase tracking-widest">{action.actionType}</span>
        <span className="ml-auto shrink-0">
          {isPending
            ? <span className="inline-flex items-center gap-1 text-2xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-semibold">Pending</span>
            : <span className="inline-flex items-center gap-1 text-2xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-semibold">Complete</span>
          }
        </span>
      </div>
      {/* Body */}
      <div className="px-5 py-4 space-y-2.5">
        <p className="text-sm text-gray-700 leading-relaxed">{action.description}</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-600">Outcome: </span>
          {action.outcome}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-2xs font-mono text-gray-400">
            Last verified: {action.lastVerified}
          </span>
          {action.sourceIds.map(k => (
            <SourceCitation key={k} sourceKey={k} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Actions() {
  const [juriFilter, setJuriFilter]  = useState('all')
  const [typeFilter, setTypeFilter]  = useState('all')

  const visible = actions.filter(a => {
    const juriMatch = juriFilter === 'all' || a.jurisdiction === juriFilter
    const typeMatch = typeFilter === 'all' || a.actionType === typeFilter
    return juriMatch && typeMatch
  })

  return (
    <FootnoteProvider preload={PRELOAD_KEYS}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Jurisdictional Actions" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Cross-Jurisdictional Record</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Jurisdictional Actions</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Approvals, permit applications, legal challenges, and policy actions across the municipal,
          county, state, and federal bodies with jurisdiction over T5 @ Chicago IV.
          All entries are sourced and cited. Verification dates appear on each entry.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xs font-mono text-gray-400">{actions.length} actions on file</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs font-mono text-gray-400">Last verified {LAST_VERIFIED}</span>
        </div>
      </FadeIn>

      {/* Jurisdiction filter */}
      <FadeIn className="mb-5">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-2.5">Filter by jurisdiction</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setJuriFilter('all')}
            className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
              juriFilter === 'all'
                ? 'text-gray-900 bg-gray-100 border-gray-300'
                : 'text-gray-500 border-gray-200 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {JURISDICTIONS.map(j => {
            const colors = JURI_COLORS[j] ?? JURI_COLORS['State of Illinois']
            const count = actions.filter(a => a.jurisdiction === j).length
            return (
              <button
                key={j}
                onClick={() => setJuriFilter(j)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
                  juriFilter === j ? colors.active : colors.inactive
                }`}
              >
                {j}
                {count > 0 && <span className="opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>
      </FadeIn>

      {/* Action type filter */}
      <FadeIn className="mb-10">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-2.5">Filter by action type</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
              typeFilter === 'all'
                ? 'text-gray-900 bg-gray-100 border-gray-300'
                : 'text-gray-500 border-gray-200 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            All types
          </button>
          {ACTION_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`inline-flex items-center px-2.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest transition-colors duration-150 ${
                typeFilter === t
                  ? 'text-gray-900 bg-gray-100 border-gray-300'
                  : 'text-gray-500 border-gray-200 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Entries */}
      <div className="space-y-4">
        {visible.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-gray-400 py-12 text-center font-mono">No actions on file for this filter.</p>
          </FadeIn>
        ) : (
          visible.map((action, i) => (
            <FadeIn key={action.id} delay={i * 0.04}>
              <ActionCard action={action} />
            </FadeIn>
          ))
        )}
      </div>

      <FadeIn className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <Link to="/officials" className="text-blue-600 hover:text-blue-700 transition-colors">
            Officials overview →
          </Link>
          <Link to="/timeline" className="text-blue-600 hover:text-blue-700 transition-colors">
            Full project timeline →
          </Link>
          <Link to="/sources" className="text-blue-600 hover:text-blue-700 transition-colors">
            All sources →
          </Link>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Actions are added as new filings, decisions, or official statements appear in public records
          or verified journalism. Verification dates reflect when each record was last confirmed
          against the cited source — not a real-time status. This site is not affiliated with T5 Data
          Centers, LLC or the Village of Grayslake.
        </p>
      </FadeIn>

      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
