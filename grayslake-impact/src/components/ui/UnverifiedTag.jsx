// Inline marker for a figure whose only source is no longer reachable.
// Used instead of silently dropping the citation or substituting a different
// party's number, either of which would misrepresent the record.
export default function UnverifiedTag({ note = 'Source unreachable, pending re-verification' }) {
  return (
    <span
      title={note}
      className="ml-1.5 inline-flex items-center align-middle gap-1 text-2xs font-mono uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-300 rounded-sm px-1.5 py-0.5"
    >
      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M6 3.5v3M6 8.75v.25" strokeLinecap="round" />
        <circle cx="6" cy="6" r="4.75" />
      </svg>
      Unverified
    </span>
  )
}
