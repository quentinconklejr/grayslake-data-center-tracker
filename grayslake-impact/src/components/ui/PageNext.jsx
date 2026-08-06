import { Link } from 'react-router-dom'

export default function PageNext({ to, label, desc, color = 'text-blue-700', hoverBorder = 'hover:border-blue-300' }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 mb-8">
      <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
        <span className="inline-block w-4 h-px bg-gray-300" aria-hidden="true" />
        Up next
      </p>
      <Link
        to={to}
        className={`group flex items-center justify-between gap-4 bg-white border border-gray-200 ${hoverBorder} rounded-xl px-6 py-5 hover:bg-gray-50/50 hover:shadow-glass-md transition-all duration-150`}
      >
        <div className="min-w-0">
          <p className={`text-xs font-mono uppercase tracking-[0.2em] font-semibold mb-1 ${color}`}>{label}</p>
          <p className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">{desc}</p>
        </div>
        <svg
          className={`shrink-0 w-4 h-4 ${color} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150`}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
        >
          <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}
