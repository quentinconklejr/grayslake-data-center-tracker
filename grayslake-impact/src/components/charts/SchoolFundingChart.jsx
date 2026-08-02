import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { projections } from '../../data/projections'

const { schoolFundingComparable } = projections
const TOTAL_M    = schoolFundingComparable.totalPropertyTaxBilled2025
const SCHOOL_PCT = schoolFundingComparable.percentToSchoolDistrict
const OTHER_PCT  = +(100 - SCHOOL_PCT).toFixed(1)

export default function SchoolFundingChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="space-y-6">

      {/* Total callout — one facility, 2025 */}
      <div>
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-4xl font-display font-bold text-gray-900 tracking-tight">${TOTAL_M}M</span>
          <span className="text-sm text-gray-500">2025 tax bill — one DeKalb facility</span>
        </div>
        <p className="text-2xs font-mono text-gray-400">Single-facility figure · 2025 tax year</p>
      </div>

      {/* Separator note */}
      <p className="text-2xs font-mono text-amber-600 uppercase tracking-widest border-t border-amber-100 pt-3">
        School share below — three-property average, 2021–2024
      </p>

      {/* Proportion bar */}
      <div className="space-y-2">
        <div className="h-6 w-full rounded overflow-hidden flex bg-gray-100">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: 0 }}
            animate={inView ? { width: `${SCHOOL_PCT}%` } : { width: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <motion.div
            className="h-full bg-gray-300"
            initial={{ width: 0 }}
            animate={inView ? { width: `${OTHER_PCT}%` } : { width: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        <div className="flex gap-4 pt-0.5">
          <span className="flex items-center gap-1.5 text-2xs font-mono text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 shrink-0" />
            {SCHOOL_PCT}% Schools
          </span>
          <span className="flex items-center gap-1.5 text-2xs font-mono text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-300 shrink-0" />
            {OTHER_PCT}% Other
          </span>
        </div>
      </div>

      {/* Segment breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-l-2 border-emerald-500 pl-3">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">School District 428</p>
          <p className="text-2xl font-display font-bold text-gray-900">{SCHOOL_PCT}%</p>
          <p className="text-xs text-gray-500 mt-0.5">avg. share across three properties</p>
        </div>
        <div className="border-l-2 border-gray-300 pl-3">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Other Taxing Bodies</p>
          <p className="text-2xl font-display font-bold text-gray-500">{OTHER_PCT}%</p>
          <p className="text-xs text-gray-500 mt-0.5">calculated complement</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-2xs font-mono text-emerald-600 uppercase tracking-widest mb-1">Documented outcome</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          Funded construction of Mitchell Elementary School — opened 2025.
        </p>
      </div>
    </div>
  )
}
