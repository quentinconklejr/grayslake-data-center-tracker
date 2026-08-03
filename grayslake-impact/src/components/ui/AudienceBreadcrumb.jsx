import { Link } from 'react-router-dom'

const SIBLINGS = [
  { to: '/residents', label: 'Residents' },
  { to: '/reporters', label: 'Reporters' },
  { to: '/officials', label: 'Officials' },
]

export default function AudienceBreadcrumb({ current }) {
  return (
    <div className="flex items-center gap-0 text-xs font-mono text-gray-400 mb-8 flex-wrap">
      <Link to="/" className="hover:text-gray-600 transition-colors flex items-center gap-1">
        <span>←</span>
        <span>Home</span>
      </Link>
      <span className="mx-2.5 text-gray-200">|</span>
      {SIBLINGS.map(({ to, label }, i) => (
        <span key={to} className="flex items-center">
          {i > 0 && <span className="mx-1.5 text-gray-200">·</span>}
          {label === current
            ? <span className="text-gray-600">{label}</span>
            : <Link to={to} className="hover:text-gray-600 transition-colors">{label}</Link>
          }
        </span>
      ))}
    </div>
  )
}
