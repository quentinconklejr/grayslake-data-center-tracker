import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { projections } from '../../data/projections'

const { permanent, constructionMidpoint } = projections.jobs
const ITEMS = [
  {
    label:    'Permanent Positions',
    sublabel: 'Current Village FAQ estimate — full buildout (2029)',
    value:    permanent,
    max:      permanent,
    color:    '#059669',
    bg:       'rgba(5,150,105,0.08)',
    display:  permanent.toLocaleString(),
    sourced:  true,
  },
  {
    label:    'Construction Workforce',
    sublabel: '"Hundreds" per Village documents — shown at ~400 (estimated)',
    value:    constructionMidpoint,
    max:      permanent,
    color:    '#d97706',
    bg:       'rgba(217,119,6,0.08)',
    display:  `~${constructionMidpoint}`,
    sourced:  false,
  },
]

export default function JobsTimelineChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="space-y-6">
      {ITEMS.map((item, i) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-semibold text-gray-900">{item.label}</span>
                {!item.sourced && (
                  <span className="text-2xs font-mono text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-sm bg-amber-50">
                    Est.
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-0.5 block">{item.sublabel}</span>
            </div>
            <span
              className="font-mono text-xl font-bold shrink-0 tabular-nums"
              style={{ color: item.color }}
            >
              {item.display}
            </span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden bg-gray-100">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.color,
                opacity: item.sourced ? 1 : 0.5,
              }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(item.value / item.max) * 100}%` } : { width: 0 }}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
        Dimmed bar = estimated figure. Solid bar = sourced Village projection.
      </p>
    </div>
  )
}
