import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// DeKalb/Meta precedent — editorial proportion visualization, not a chart library.
const TOTAL_M    = 31.1
const SCHOOL_PCT = 60.9
const OTHER_PCT  = +(100 - SCHOOL_PCT).toFixed(1)
const SCHOOL_M   = +(TOTAL_M * SCHOOL_PCT / 100).toFixed(1)
const OTHER_M    = +(TOTAL_M * OTHER_PCT  / 100).toFixed(1)

export default function SchoolFundingChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="space-y-6">

      {/* Total callout */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-display font-bold text-gray-100 tracking-tight">${TOTAL_M}M</span>
        <span className="text-sm text-gray-500">annual property tax — DeKalb, IL (2025)</span>
      </div>

      {/* Proportion bar */}
      <div className="space-y-1.5">
        <div className="h-6 w-full rounded overflow-hidden flex">
          <motion.div
            className="h-full bg-emerald-500 flex items-center justify-start pl-3"
            initial={{ width: 0 }}
            animate={inView ? { width: `${SCHOOL_PCT}%` } : { width: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="text-2xs font-mono font-bold text-white whitespace-nowrap">
              {SCHOOL_PCT}% Schools
            </span>
          </motion.div>
          <motion.div
            className="h-full bg-gray-700 flex items-center justify-end pr-3"
            initial={{ width: 0 }}
            animate={inView ? { width: `${OTHER_PCT}%` } : { width: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="text-2xs font-mono text-gray-400 whitespace-nowrap">
              {OTHER_PCT}% Other
            </span>
          </motion.div>
        </div>
      </div>

      {/* Segment breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-l-2 border-emerald-500/50 pl-3">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">School District 428</p>
          <p className="text-2xl font-display font-bold text-gray-100">${SCHOOL_M}M</p>
          <p className="text-xs text-gray-500 mt-0.5">{SCHOOL_PCT}% of total</p>
        </div>
        <div className="border-l-2 border-gray-700 pl-3">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Other Taxing Bodies</p>
          <p className="text-2xl font-display font-bold text-gray-400">${OTHER_M}M</p>
          <p className="text-xs text-gray-500 mt-0.5">{OTHER_PCT}% of total</p>
        </div>
      </div>

      <div className="border-t border-gray-800/40 pt-4">
        <p className="text-2xs font-mono text-emerald-400/60 uppercase tracking-widest mb-1">Documented outcome</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Funded construction of Mitchell Elementary School — opened 2025.
        </p>
      </div>
    </div>
  )
}
