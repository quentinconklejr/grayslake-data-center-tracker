import ChartFigure from '../ui/ChartFigure'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { projections } from '../../data/projections'

const SECURED  = projections.project.securedPowerMW
const CAPACITY = projections.project.totalCapacityMW
const BUFFER   = SECURED - CAPACITY

/*
 * Two-segment horizontal proportion bar. The glass gradient and diagonal
 * shine are gone in favour of two flat colour blocks whose split holds
 * the whole point: what portion of secured power is actually leasable.
 * All numeric callouts sit in the display face; tabular numerals come
 * from the global .font-mono rule where the unit labels use mono.
 */
export default function EnergyDrawChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const capPct = (CAPACITY / SECURED) * 100
  const bufPct = (BUFFER   / SECURED) * 100

  return (
    <ChartFigure
      caption="Secured power versus leasable IT capacity"
      description="Stacked bar showing how much of the secured utility power is leasable IT capacity and how much is buffer."
      rows={[
        ['Secured utility power',       `${SECURED.toLocaleString()} MW`],
        ['Leasable IT capacity',        `${CAPACITY.toLocaleString()} MW`],
        ['Buffer',                      `${BUFFER.toLocaleString()} MW`],
        ['Leasable share of secured',   `${capPct.toFixed(1)}%`],
        ['Buffer share of secured',     `${bufPct.toFixed(1)}%`],
      ]}
    >
      <div ref={ref} className="space-y-6">
        {/* Primary figures */}
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-rule">
          <div>
            <p className="text-xs font-sans font-semibold text-ink-600 mb-1">Secured Utility Power</p>
            <p className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight break-words">
              1,600 <span className="text-2xl text-ink-500">MW</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-sans font-semibold text-ink-600 mb-1">IT Capacity (Leasable)</p>
            <p className="text-3xl font-display text-accent tracking-tight">
              1,200 <span className="text-lg text-accent/60">MW</span>
            </p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="space-y-2">
          <p className="text-xs font-sans font-semibold text-ink-600">Power allocation (% of secured)</p>
          <div className="h-4 w-full flex overflow-hidden border border-rule">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={inView ? { width: `${capPct}%` } : { width: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <motion.div
              className="h-full bg-status-policy/70"
              initial={{ width: 0 }}
              animate={inView ? { width: `${bufPct}%` } : { width: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-5 pt-1">
            <span className="flex items-center gap-2 text-xs font-sans text-ink-700">
              <span aria-hidden="true" className="w-3 h-3 bg-accent" />
              {capPct.toFixed(0)}% IT capacity
            </span>
            <span className="flex items-center gap-2 text-xs font-sans text-ink-700">
              <span aria-hidden="true" className="w-3 h-3 bg-status-policy/70" />
              {bufPct.toFixed(0)}% buffer
            </span>
          </div>

          <div className="flex justify-between text-2xs font-mono text-ink-500 pt-1">
            <span>0 MW</span>
            <span>{CAPACITY.toLocaleString()} MW</span>
            <span>{SECURED.toLocaleString()} MW</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-rule">
          {[
            { label: 'Secured', value: `${SECURED.toLocaleString()} MW`,  color: 'text-ink-900' },
            { label: 'IT Cap.', value: `${CAPACITY.toLocaleString()} MW`, color: 'text-accent' },
            { label: 'Buffer',  value: `${BUFFER} MW`,                     color: 'text-ink-500' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-xs font-sans font-semibold text-ink-600 mb-1">{label}</p>
              <p className={`text-xl font-display tracking-tight ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </ChartFigure>
  )
}
