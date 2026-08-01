import { sources } from '../../data/sources'

export default function SourceCitation({ sourceKey }) {
  const source = sources[sourceKey]
  if (!source) return null
  const label = source.publisher ?? source.title

  if (source.status === 'unverified') {
    return (
      <span className="inline-flex items-center gap-1 text-2xs font-mono text-gray-400">
        <svg className="w-2.5 h-2.5 shrink-0 text-amber-500" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="5" cy="5" r="4" />
          <path d="M5 3v2.5M5 7h.01" strokeLinecap="round" />
        </svg>
        {label}
        <span className="text-gray-300 italic">· link pending verification</span>
      </span>
    )
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      className="inline-flex items-center gap-1 text-2xs font-mono text-gray-400 hover:text-blue-600 transition-colors duration-150 group"
    >
      <svg
        className="w-2.5 h-2.5 shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors"
        viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M1 9L9 1M9 1H4M9 1v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
      {source.status === 'background' && (
        <span className="text-gray-300 italic">· background</span>
      )}
    </a>
  )
}
