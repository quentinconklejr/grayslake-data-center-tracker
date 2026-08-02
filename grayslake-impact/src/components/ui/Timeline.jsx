import SourceCitation from './SourceCitation'

function fmtDate(raw) {
  if (!raw) return ''
  if (/Q\d/.test(raw)) return raw.replace(/(\d{4})-Q(\d)/, 'Q$2 $1')
  const parts = raw.split('-')
  if (parts.length === 1) return raw
  if (parts.length === 2) {
    const d = new Date(`${parts[0]}-${parts[1]}-01T00:00:00`)
    return isNaN(d) ? raw : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const d = new Date(`${raw}T00:00:00`)
  return isNaN(d) ? raw : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CAT = {
  approval:     { badge: 'text-blue-700 bg-blue-50 border-blue-200',       dot: 'bg-blue-500'    },
  opposition:   { badge: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-500'  },
  development:  { badge: 'text-cyan-700 bg-cyan-50 border-cyan-200',       dot: 'bg-cyan-500'    },
  construction: { badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  legal:        { badge: 'text-red-700 bg-red-50 border-red-200',          dot: 'bg-red-500'     },
  policy:       { badge: 'text-amber-700 bg-amber-50 border-amber-200',    dot: 'bg-amber-500'   },
  default:      { badge: 'text-gray-600 bg-gray-100 border-gray-200',      dot: 'bg-gray-400'    },
}

export default function Timeline({ events = [] }) {
  if (!events.length) return <p className="text-gray-400 text-sm py-12 text-center">No events loaded.</p>

  return (
    <div className="divide-y divide-gray-100">
      {events.map((event, i) => {
        const cat = CAT[event.category] ?? CAT.default
        return (
          <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 group">

            {/* Date */}
            <time className="shrink-0 sm:w-28 text-2xs font-mono text-gray-400 pt-0.5 leading-tight">
              {fmtDate(event.date)}
            </time>

            {/* Category badge */}
            <span className={`self-start shrink-0 inline-flex px-1.5 py-0.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cat.badge}`}>
              {event.category}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0 sm:pt-px">
              <p className="text-sm font-display font-semibold text-gray-900 leading-snug">
                {event.title}
                {!event.description && event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />}
              </p>
              {event.description && (
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  {event.description}
                  {event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />}
                </p>
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}
