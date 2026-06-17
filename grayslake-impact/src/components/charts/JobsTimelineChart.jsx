import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Custom horizontal comparison bars — more editorial than vertical Recharts bars.
const ITEMS = [
  {
    label:    'Permanent Positions',
    sublabel: 'Village projection — full buildout (2029)',
    value:    1500,
    max:      1500,
    color:    '#10b981',
    bg:       'rgba(16,185,129,0.08)',
    display:  '1,500',
    sourced:  true,
  },
  {
    label:    'Construction Workforce',
    sublabel: '"Hundreds" per Village documents — shown at ~400 (estimated)',
    value:    400,
    max:      1500,
    color:    '#f59e0b',
    bg:       'rgba(245,158,11,0.08)',
    display:  '~400',
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
          {/* Label row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-semibold text-gray-200">{item.label}</span>
                {!item.sourced && (
                  <span className="text-2xs font-mono text-amber-500/70 border border-amber-500/25 px-1.5 py-0.5 rounded-sm">
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

          {/* Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden" style={{ background: item.bg }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.color,
                opacity: item.sourced ? 1 : 0.55,
              }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(item.value / item.max) * 100}%` } : { width: 0 }}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-500 pt-2 border-t border-gray-800/40">
        Dimmed bar = estimated figure. Solid bar = sourced Village projection.
      </p>
    </div>
  )
}
