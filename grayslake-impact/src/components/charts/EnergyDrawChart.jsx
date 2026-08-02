import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SECURED = 1600
const CAPACITY = 1200
const BUFFER   = SECURED - CAPACITY

export default function EnergyDrawChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const capPct = (CAPACITY / SECURED) * 100
  const bufPct  = (BUFFER   / SECURED) * 100

  return (
    <div ref={ref} className="space-y-8">

      {/* Primary figure */}
      <div className="flex items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Secured Utility Power</p>
          <p className="text-5xl font-display font-bold text-gray-900 tracking-tight">1,600 <span className="text-2xl text-gray-400">MW</span></p>
        </div>
        <div className="text-right">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">IT Capacity (Leasable)</p>
          <p className="text-3xl font-display font-bold text-blue-600 tracking-tight">1,200 <span className="text-lg text-blue-600/50">MW</span></p>
        </div>
      </div>

      {/* Stacked bar showing composition */}
      <div className="space-y-2">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest">Power allocation (% of secured)</p>
        <div className="h-5 w-full rounded overflow-hidden flex bg-gray-100">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={inView ? { width: `${capPct}%` } : { width: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <motion.div
            className="h-full bg-amber-400/50 border-l border-amber-500/40"
            initial={{ width: 0 }}
            animate={inView ? { width: `${bufPct}%` } : { width: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Labels below bar — never inside a width-constrained animated segment */}
        <div className="flex gap-4 pt-0.5">
          <span className="flex items-center gap-1.5 text-2xs font-mono text-blue-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 shrink-0" />
            {capPct.toFixed(0)}% IT capacity
          </span>
          <span className="flex items-center gap-1.5 text-2xs font-mono text-amber-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/70 shrink-0" />
            {bufPct.toFixed(0)}% buffer
          </span>
        </div>

        <div className="flex justify-between text-2xs font-mono text-gray-400 pt-1">
          <span>0 MW</span>
          <span>{CAPACITY.toLocaleString()} MW</span>
          <span>{SECURED.toLocaleString()} MW</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200">
        {[
          { label: 'Secured',  value: `${SECURED.toLocaleString()} MW`, color: 'text-gray-800' },
          { label: 'IT Cap.',  value: `${CAPACITY.toLocaleString()} MW`, color: 'text-blue-600' },
          { label: 'Buffer',   value: `${BUFFER} MW`,                    color: 'text-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-lg font-display font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
