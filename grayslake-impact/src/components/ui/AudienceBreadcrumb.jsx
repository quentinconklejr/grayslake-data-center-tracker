import { Link } from 'react-router-dom'

const SIBLINGS = [
  { to: '/residents', label: 'Residents' },
  { to: '/reporters', label: 'Reporters' },
  { to: '/officials', label: 'Officials' },
]

export default function AudienceBreadcrumb({ current }) {
  return (
    <nav
      aria-label="Audience guides"
      className="flex items-center justify-between gap-4 mb-10 pb-3 border-b border-gray-200"
    >
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Home
      </Link>

      <div className="flex items-center gap-1" role="list">
        {SIBLINGS.map(({ to, label }) => (
          <span key={to} role="listitem">
            {label === current ? (
              <span className="inline-block text-sm font-semibold text-gray-900 px-3 py-1 rounded-md bg-gray-100">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="inline-block text-sm text-gray-500 px-3 py-1 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  )
}
