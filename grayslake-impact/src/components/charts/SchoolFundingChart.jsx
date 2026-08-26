import ChartFigure from '../ui/ChartFigure'
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
    <ChartFigure
      caption="DeKalb and Meta school funding precedent"
      description="Bar chart of the share of Meta's DeKalb property taxes that went to the school district."
      rows={[
        ['Total property tax billed, 2025, one facility', `$${TOTAL_M}M`],
        ['Share to School District 428',                   `${SCHOOL_PCT}%`],
        ['Share to other districts',                       `${OTHER_PCT}%`],
      ]}
    >
      <div ref={ref} className="space-y-6">
        {/* Total callout — one facility, 2025 */}
        <div>
          <div className="flex items-baseline gap-3 mb-0.5">
            <span className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight break-words">${TOTAL_M}M</span>
            <span className="text-sm font-sans text-ink-600">2025 tax bill, one DeKalb facility</span>
          </div>
          <p className="text-2xs font-mono text-ink-500">Single-facility figure · 2025 tax year</p>
        </div>

        {/* Separator note */}
        <p className="text-xs font-display italic text-status-disputed border-t border-rule pt-3">
          School share below is a three-property average, 2021–2024
        </p>

        {/* Proportion bar */}
        <div className="space-y-2">
          <div className="h-5 w-full overflow-hidden flex border border-rule">
            <motion.div
              className="h-full bg-status-construction"
              initial={{ width: 0 }}
              animate={inView ? { width: `${SCHOOL_PCT}%` } : { width: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <motion.div
              className="h-full bg-ink-500"
              initial={{ width: 0 }}
              animate={inView ? { width: `${OTHER_PCT}%` } : { width: 0 }}
              transition={{ delay: 0.65, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-5 pt-1">
            <span className="flex items-center gap-2 text-xs font-sans text-status-construction">
              <span aria-hidden="true" className="w-3 h-3 bg-status-construction" />
              {SCHOOL_PCT}% Schools
            </span>
            <span className="flex items-center gap-2 text-xs font-sans text-ink-600">
              <span aria-hidden="true" className="w-3 h-3 bg-ink-500" />
              {OTHER_PCT}% Other
            </span>
          </div>
        </div>

        {/* Segment breakdown */}
        <div className="grid grid-cols-2 gap-6">
          <div className="border-l-[3px] border-status-construction pl-3">
            <p className="text-xs font-sans font-semibold text-ink-600 mb-1">School District 428</p>
            <p className="text-2xl font-display text-ink-900 tracking-tight">{SCHOOL_PCT}%</p>
            <p className="text-xs font-sans text-ink-500 mt-0.5">avg. share across three properties</p>
          </div>
          <div className="border-l-[3px] border-rule pl-3">
            <p className="text-xs font-sans font-semibold text-ink-600 mb-1">Other Taxing Bodies</p>
            <p className="text-2xl font-display text-ink-500 tracking-tight">{OTHER_PCT}%</p>
            <p className="text-xs font-sans text-ink-500 mt-0.5">calculated complement</p>
          </div>
        </div>

        <div className="border-t border-rule pt-4">
          <p className="text-xs font-display italic text-status-construction mb-1">Documented outcome</p>
          <p className="text-sm font-sans text-ink-700 leading-relaxed">
            Funded construction of Mitchell Elementary School, which opened in 2025.
          </p>
        </div>
      </div>
    </ChartFigure>
  )
}
