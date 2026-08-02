import SourceCitation from './SourceCitation'

function fmtDate(raw) {
  if (!raw) return ''
  if (/Q\d/.test(raw)) return raw.replace(/(\d{4})-Q(\d)/, 'Q$2 $1')
  const parts = raw.split('-')
  if (parts.length === 1) return raw
  if (parts.length === 2) {
    const d = new Date(`${parts[0]}-${parts[1]}-01T00:00:00`)
    return isNaN(d) ? raw : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  const d = new Date(`${raw}T00:00:00`)
  return isNaN(d) ? raw : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CAT = {
  approval:     { dot: 'bg-blue-500',    badge: 'text-blue-700 bg-blue-50 border-blue-200' },
  opposition:   { dot: 'bg-orange-500',  badge: 'text-orange-700 bg-orange-50 border-orange-200' },
  development:  { dot: 'bg-cyan-500',    badge: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  construction: { dot: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  legal:        { dot: 'bg-red-500',     badge: 'text-red-700 bg-red-50 border-red-200' },
  policy:       { dot: 'bg-amber-500',   badge: 'text-amber-700 bg-amber-50 border-amber-200' },
  default:      { dot: 'bg-gray-400',    badge: 'text-gray-600 bg-gray-100 border-gray-200' },
}

export default function Timeline({ events = [] }) {
  if (!events.length) return <p className="text-gray-400 text-sm py-12 text-center">No events loaded.</p>

  return (
    <ol className="relative">
      {events.map((event, i) => {
        const isLast = i === events.length - 1
        const cat = CAT[event.category] ?? CAT.default
        return (
          <li key={i} className="flex group">
            {/* Rail */}
            <div className="flex flex-col items-center mr-7 pt-[5px] shrink-0 w-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.dot}`} />
              {!isLast && <div className="w-px flex-1 bg-gray-200 mt-2.5" />}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-10'}`}>
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <time className="text-2xs font-mono font-medium text-gray-400 tracking-wider uppercase">
                  {fmtDate(event.date)}
                </time>
                {event.category && (
                  <span className={`inline-flex px-2 py-0.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cat.badge}`}>
                    {event.category}
                  </span>
                )}
              </div>

              <h3 className="text-base font-display font-semibold text-gray-900 leading-snug mb-2">
                {event.title}
              </h3>

              {event.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {event.description}
                  {event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />}
                </p>
              )}
              {!event.description && event.sourceKey && (
                <SourceCitation sourceKey={event.sourceKey} />
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
