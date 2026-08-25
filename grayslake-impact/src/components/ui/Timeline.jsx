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
  approval:     { badge: 'text-status-approval    bg-status-approval-soft    border-status-approval',    dot: 'bg-status-approval'    },
  opposition:   { badge: 'text-status-opposition  bg-status-opposition-soft  border-status-opposition',  dot: 'bg-status-opposition'  },
  development:  { badge: 'text-status-development bg-status-development-soft border-status-development', dot: 'bg-status-development' },
  construction: { badge: 'text-status-construction bg-status-construction-soft border-status-construction', dot: 'bg-status-construction' },
  legal:        { badge: 'text-status-legal       bg-status-legal-soft       border-status-legal',       dot: 'bg-status-legal'       },
  policy:       { badge: 'text-status-policy      bg-status-policy-soft      border-status-policy',      dot: 'bg-status-policy'      },
  default:      { badge: 'text-ink-600            bg-paper-sunk              border-rule',               dot: 'bg-ink-400'            },
}

const PROP_HEIGHT = 700
const GAP_THRESHOLD_PX = 80

export default function Timeline({ events = [], proportional = false }) {
  if (!events.length) return <p className="text-gray-400 text-sm py-12 text-center">No events loaded.</p>

  // Sorted here rather than trusting the order of the data file, which had
  // drifted: a June 26 entry sat above a June 9 one. The proportional view
  // also computed a negative gap across that pair and silently clamped it.
  const sorted = [...events].sort((a, b) => (dateToMs(a.date) ?? 0) - (dateToMs(b.date) ?? 0))
  const timestamps = sorted.map(e => dateToMs(e.date))
  const firstTs = timestamps[0] ?? 0
  const lastTs = timestamps[timestamps.length - 1] ?? 0
  const totalMs = Math.max(lastTs - firstTs, 1)

  return (
    <div className="relative">
      {/* Vertical spine */}
      <div
        className="absolute bg-rule"
        aria-hidden="true"
        style={{ left: 10, top: 16, bottom: 16, width: 1 }}
      />

      <div>
        {sorted.map((event, i) => {
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

          // First projected entry after the last recorded one.
          //
          // Chronological order puts Q4 2027 and 2029 below the July 2026
          // lawsuit, so the last two things a reader scrolling to the bottom
          // sees are forecasts, and the most consequential recorded event is
          // mid-page. The tempting fix is to pin the lawsuit to the top, but
          // that breaks the one promise this page makes - that it is a
          // chronological record - and a pinned item is an editorial judgement
          // about what matters most. A divider fixes the same problem by
          // stating a fact instead: everything below this line has not
          // happened yet.
          const prevProjected = i > 0 ? isProjected(sorted[i - 1].date) : false
          const showProjectedDivider = projected && !prevProjected && i > 0

          return (
            <div key={i}>
              {showProjectedDivider && (
                <div className="relative flex items-center gap-3 py-5 pl-9">
                  <div className="absolute left-0 w-5 flex justify-center" aria-hidden="true">
                    <span className="block w-2 h-2 rounded-full bg-paper ring-2 ring-rule" />
                  </div>
                  <span className="text-xs font-display italic text-ink-500 whitespace-nowrap">
                    Projected &mdash; has not happened
                  </span>
                  <span className="flex-1 border-t border-dashed border-rule" aria-hidden="true" />
                </div>
              )}
              {proportional && i > 0 && (
                <div className="relative" style={{ height: spacerPx }} aria-hidden="true">
                  {showGapMarker && (
                    <>
                      {/* Dashed override covers the solid spine for this gap */}
                      <div
                        className="absolute"
                        style={{ left: 10, top: 0, bottom: 0, width: 1, background: '#faf8f4', borderLeft: '1.5px dashed #c8bfb0' }}
                      />
                      <div className="absolute inset-0 flex items-center pl-9">
                        <span className="text-xs font-display italic text-ink-500 bg-paper px-2 py-0.5">
                          {gapLabel(prevTs, currTs)} with no recorded events
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div
                className={`relative flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 group py-4 pl-9 hover:bg-paper-sunk/40 transition-colors duration-100 ${
                  !proportional && i < sorted.length - 1 ? 'border-b border-rule-soft' : ''
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
                      className="block w-3.5 h-3.5 rounded-full bg-paper"
                      style={{ border: '2px dashed #8a7f6f' }}
                    />
                  ) : (
                    <span className={`block w-3.5 h-3.5 rounded-full ${cat.dot}`} />
                  )}
                </div>

                {/* Date */}
                <time className="shrink-0 sm:w-28 text-xs font-mono text-ink-500 pt-0.5 leading-tight">
                  {fmtDate(event.date)}
                </time>

                {/* Category badge */}
                <span className={`self-start shrink-0 inline-flex whitespace-nowrap justify-center px-2 py-0.5 border text-2xs font-sans font-semibold uppercase tracking-wide ${cat.badge}`}>
                  {event.category}
                </span>

                {/* Content */}
                <div className={`flex-1 min-w-0 sm:pt-px ${projected ? 'opacity-70' : ''}`}>
                  <p className="text-base font-display font-semibold text-ink-900 leading-snug">
                    {event.title}
                    {!event.description && (
                      event.sourceKeys
                        ? event.sourceKeys.map(k => <SourceCitation key={k} sourceKey={k} />)
                        : event.sourceKey && <SourceCitation sourceKey={event.sourceKey} />
                    )}
                  </p>
                  {event.description && (
                    <p className="text-sm font-sans text-ink-600 leading-relaxed mt-1">
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
