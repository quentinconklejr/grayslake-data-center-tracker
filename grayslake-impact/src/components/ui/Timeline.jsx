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

function dateToMs(raw) {
  if (!raw) return null
  if (/Q\d/.test(raw)) {
    const m = raw.match(/(\d{4})-Q(\d)/)
    if (!m) return null
    return new Date(parseInt(m[1]), (parseInt(m[2]) - 1) * 3, 1).getTime()
  }
  const parts = raw.split('-')
  if (parts.length === 1) return new Date(parseInt(raw), 6, 1).getTime()
  if (parts.length === 2) return new Date(`${parts[0]}-${parts[1]}-01T00:00:00`).getTime()
  return new Date(`${raw}T00:00:00`).getTime()
}

function isProjected(raw) {
  const ms = dateToMs(raw)
  return ms !== null && ms > Date.now()
}

function gapLabel(ms1, ms2) {
  const months = Math.round((ms2 - ms1) / (1000 * 60 * 60 * 24 * 30.5))
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years}y ${rem}mo`
}

const CAT = {
  approval:     { badge: 'text-blue-700 bg-blue-50 border-blue-200',          dot: 'bg-blue-500'    },
  opposition:   { badge: 'text-orange-700 bg-orange-50 border-orange-200',    dot: 'bg-orange-500'  },
  development:  { badge: 'text-cyan-700 bg-cyan-50 border-cyan-200',          dot: 'bg-cyan-500'    },
  construction: { badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  legal:        { badge: 'text-red-700 bg-red-50 border-red-200',             dot: 'bg-red-500'     },
  policy:       { badge: 'text-amber-700 bg-amber-50 border-amber-200',       dot: 'bg-amber-500'   },
  default:      { badge: 'text-gray-600 bg-gray-100 border-edge-soft',         dot: 'bg-gray-400'    },
}

const PROP_HEIGHT = 700
const GAP_THRESHOLD_PX = 80

export default function Timeline({ events = [], proportional = false }) {
  if (!events.length) return <p className="text-gray-400 text-sm py-12 text-center">No events loaded.</p>

  const timestamps = events.map(e => dateToMs(e.date))
  const firstTs = timestamps[0] ?? 0
  const lastTs = timestamps[timestamps.length - 1] ?? 0
  const totalMs = Math.max(lastTs - firstTs, 1)

  return (
    <div className="relative">
      {/* Vertical spine */}
      <div
        className="absolute bg-gray-200"
        aria-hidden="true"
        style={{ left: 10, top: 16, bottom: 16, width: 1 }}
      />

      <div>
        {events.map((event, i) => {
          const cat = CAT[event.category] ?? CAT.default
          const projected = isProjected(event.date)

          let spacerPx = 0
          let prevTs = null
          let currTs = null
          if (proportional && i > 0) {
            prevTs = timestamps[i - 1] ?? firstTs
            currTs = timestamps[i] ?? firstTs
            spacerPx = Math.max(8, ((currTs - prevTs) / totalMs) * PROP_HEIGHT)
          }

          const showGapMarker = proportional && i > 0 && spacerPx > GAP_THRESHOLD_PX

          return (
            <div key={i}>
              {proportional && i > 0 && (
                <div className="relative" style={{ height: spacerPx }} aria-hidden="true">
                  {showGapMarker && (
                    <>
                      {/* Dashed override covers the solid spine for this gap */}
                      <div
                        className="absolute"
                        style={{ left: 10, top: 0, bottom: 0, width: 1, background: 'white', borderLeft: '1.5px dashed #d1d5db' }}
                      />
                      <div className="absolute inset-0 flex items-center pl-9">
                        <span className="text-2xs font-mono text-gray-400 italic bg-white border border-gray-100 px-2 py-0.5 rounded">
                          {gapLabel(prevTs, currTs)} with no recorded events
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div
                className={`relative flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 group py-4 pl-9 rounded-lg hover:bg-gray-50/60 transition-colors duration-100 ${
                  !proportional && i < events.length - 1 ? 'border-b border-edge-soft/50' : ''
                }`}
              >
                {/* Dot on spine */}
                <div
                  className="absolute left-0 w-5 h-5 flex items-center justify-center"
                  style={{ top: 16 }}
                  aria-hidden="true"
                >
                  {projected ? (
                    <span
                      className="block w-3.5 h-3.5 rounded-full bg-white"
                      style={{ border: '2px dashed #9ca3af' }}
                    />
                  ) : (
                    <span className={`block w-3.5 h-3.5 rounded-full ${cat.dot}`} />
                  )}
                </div>

                {/* Date */}
                <time className="shrink-0 sm:w-28 text-xs font-mono text-gray-500 pt-0.5 leading-tight">
                  {fmtDate(event.date)}
                </time>

                {/* Category badge — fixed width so headline text aligns regardless of category length */}
                <span className={`self-start shrink-0 inline-flex w-24 justify-center px-1.5 py-1 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-widest ${cat.badge}`}>
                  {event.category}
                </span>

                {/* Content */}
                <div className={`flex-1 min-w-0 sm:pt-px ${projected ? 'opacity-60' : ''}`}>
                  <p className="text-base font-display font-semibold text-gray-900 leading-snug">
                    {event.title}
                    {!event.description && (
                      event.sourceKeys
                        ? event.sourceKeys.map(k => <SourceCitation key={k} sourceKey={k} />)
                        : event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />
                    )}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                      {event.description}
                      {event.sourceKeys
                        ? event.sourceKeys.map(k => <SourceCitation key={k} sourceKey={k} />)
                        : event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
