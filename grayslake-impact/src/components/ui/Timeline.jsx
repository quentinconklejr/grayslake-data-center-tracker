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
  approval:     { dot: 'bg-blue-500 shadow-[0_0_6px_2px_rgba(14,165,233,0.35)]',  badge: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  opposition:   { dot: 'bg-orange-500 shadow-[0_0_6px_2px_rgba(249,115,22,0.3)]', badge: 'text-orange-300 bg-orange-500/10 border-orange-500/25' },
  development:  { dot: 'bg-cyan-500 shadow-[0_0_6px_2px_rgba(6,182,212,0.3)]',    badge: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25' },
  construction: { dot: 'bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.3)]',badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' },
  legal:        { dot: 'bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.3)]',     badge: 'text-red-300 bg-red-500/10 border-red-500/25' },
  policy:       { dot: 'bg-amber-500 shadow-[0_0_6px_2px_rgba(245,158,11,0.3)]',  badge: 'text-amber-300 bg-amber-500/10 border-amber-500/25' },
  default:      { dot: 'bg-gray-600',                                               badge: 'text-gray-400 bg-gray-800/50 border-gray-700/50' },
}

export default function Timeline({ events = [] }) {
  if (!events.length) return <p className="text-gray-500 text-sm py-12 text-center">No events loaded.</p>

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
              {!isLast && <div className="w-px flex-1 bg-gray-800/60 mt-2.5" />}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-10'}`}>
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <time className="text-2xs font-mono font-medium text-gray-500 tracking-wider uppercase">
                  {fmtDate(event.date)}
                </time>
                {event.category && (
                  <span className={`inline-flex px-2 py-0.5 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cat.badge}`}>
                    {event.category}
                  </span>
                )}
              </div>

              <h3 className="text-base font-display font-semibold text-gray-100 leading-snug mb-2">
                {event.title}
              </h3>

              {event.description && (
                <p className="text-sm text-gray-400 leading-relaxed mb-2.5">{event.description}</p>
              )}

              {event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
