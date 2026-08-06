import { Link } from 'react-router-dom'

/**
 * End-of-page hand-off. Sized to be seen: on the homepage this now occupies
 * the slot the Impact-by-category grid used to fill, so it needs to read as a
 * destination rather than a footnote.
 */
export default function PageNext({
  to,
  label,
  desc,
  color = 'text-blue-700',
  hoverBorder = 'hover:border-blue-500',
  prominent = false,
}) {
  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 ${prominent ? 'mt-20 mb-16' : 'mt-16 mb-8'}`}>
      <p className="text-2xs font-mono text-gray-600 uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
        <span className="inline-block w-5 h-px bg-gray-400" aria-hidden="true" />
        Up next
      </p>
      <Link
        to={to}
        className={`group flex items-center justify-between gap-6 bg-white border-2 border-edge ${hoverBorder} rounded-2xl transition-all duration-150 hover:shadow-glass-md ${
          prominent ? 'px-8 py-8 sm:px-10 sm:py-10' : 'px-6 py-5'
        }`}
      >
        <div className="min-w-0">
          <p className={`text-2xs font-mono uppercase tracking-[0.18em] font-semibold mb-2 ${color}`}>{label}</p>
          <p
            className={`font-display font-bold text-gray-900 leading-tight mb-2 ${
              prominent ? 'text-3xl sm:text-4xl' : 'text-xl'
            }`}
          >
            {label === 'The Project' ? 'See what the approvals actually permit' : label}
          </p>
          <p className={`text-gray-700 leading-snug ${prominent ? 'text-base max-w-2xl' : 'text-sm'}`}>{desc}</p>
        </div>
        <svg
          className={`shrink-0 ${color} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 ${
            prominent ? 'w-8 h-8' : 'w-4 h-4'
          }`}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
        >
          <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}
