import { useState } from 'react'

export default function CopyKPIButton({ copyText }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy: ${copyText}`}
      className={`mt-2 inline-flex items-center gap-1.5 text-xs font-mono transition-colors duration-150 min-h-[44px] px-2 -ml-2 ${
        copied ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {copied ? (
        <>
          <svg aria-hidden="true" className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg aria-hidden="true" className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4.5" y="4.5" width="6" height="6" rx="1" />
            <path d="M7.5 4.5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v3.5a1 1 0 001 1h1.5" />
          </svg>
          <span>Copy</span>
        </>
      )}
      {/* Copy success was signalled only by a colour and icon swap. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Figure and citation copied to clipboard' : ''}
      </span>
    </button>
  )
}
