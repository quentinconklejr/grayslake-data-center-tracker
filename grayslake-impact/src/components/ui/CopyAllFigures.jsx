import { useState } from 'react'
import { keyFigures, figureCopyText } from '../../data/keyFigures'
import { LAST_VERIFIED, SITE_TITLE } from '../../data/siteConfig'

/**
 * Copies the whole figure set as plain text, one figure per line, each already
 * carrying its qualifier and citation from figureCopyText.
 *
 * The per-figure buttons cover somebody quoting one number. This covers the
 * other real case: a reporter starting a story who wants the whole set in a
 * notes file. Without it that person retypes twelve figures by hand, which is
 * where the conditions get dropped.
 *
 * The header lines matter as much as the figures. A pasted block with no date
 * and no source URL is how a figure ends up in print a year stale.
 */
export default function CopyAllFigures() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const body = keyFigures.map(f => figureCopyText(f.id)).join('\n')
    const text = [
      SITE_TITLE + ' — T5 @ Chicago IV, Grayslake, Illinois',
      'Figures verified ' + LAST_VERIFIED + '. Source links: https://grayslakedatacentertracker.org/project',
      '',
      body,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] ${
        copied
          ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
          : 'border-edge text-gray-700 bg-white hover:border-blue-400 hover:text-gray-900'
      }`}
    >
      {copied ? (
        <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v4.5A1.5 1.5 0 004 10h1.5" strokeLinecap="round" />
        </svg>
      )}
      <span>{copied ? 'Copied all figures' : 'Copy all figures'}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `All ${keyFigures.length} figures copied to clipboard with their conditions and citations` : ''}
      </span>
    </button>
  )
}
