import ChartFigure from '../ui/ChartFigure'
import SourceCitation from '../ui/SourceCitation'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { projections } from '../../data/projections'

const { comEdCapacityGW, totalCapacityMW, securedPowerMW } = projections.project

/*
 * Three published capacity figures, each drawn to one shared scale and each
 * carrying who said it.
 *
 * This used to be a stacked bar that split 1,600 MW into 1,200 MW of IT
 * capacity plus a "400 MW / 25% buffer". No source publishes a buffer; the
 * site computed it by subtraction. The bars are now separate, so nothing on
 * the chart is derived from the others: each length is one sourced figure.
 */
const FIGURES = [
  {
    key: 'comed',
    label: 'Secured from ComEd',
    value: `${comEdCapacityGW} GW`,
    mw: comEdCapacityGW * 1000,
    source: 'Pete Marin, T5 CEO, via Government Technology (Oct. 2025)',
    sourceKey: 'govtech2025',
    bar: 'bg-ink-700',
  },
  {
    key: 'it',
    label: 'Leasable IT capacity',
    value: `${totalCapacityMW / 1000} GW`,
    mw: totalCapacityMW,
    source: 'Pete Marin, T5 CEO, via Government Technology (Oct. 2025)',
    sourceKey: 'govtech2025',
    bar: 'bg-accent',
  },
  {
    key: 'secured',
    label: 'Secured utility power',
    value: `${securedPowerMW.toLocaleString()} MW`,
    mw: securedPowerMW,
    source: 'Pete Marin, T5 CEO, via Data Center Dynamics (Feb. 2025)',
    sourceKey: 'dcdGW2026',
    bar: 'bg-status-policy',
  },
]

const SCALE_MW = Math.max(...FIGURES.map(f => f.mw))

export default function EnergyDrawChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <ChartFigure
      caption="Reported electrical capacity figures"
      description="Three capacity figures as published, each drawn to the same scale and attributed to its source. No figure is computed from the others."
      rows={FIGURES.map(f => [`${f.label} (${f.source})`, f.value])}
    >
      <div ref={ref}>
        <ul className="divide-y divide-rule-strong border-y border-rule">
          {FIGURES.map((f, i) => (
            <li key={f.key} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                <p className="text-sm font-sans font-semibold text-ink-700">{f.label}</p>
                <p className="text-2xl font-display text-ink-900 tracking-tight">
                  {f.value}
                  <SourceCitation sourceKey={f.sourceKey} />
                </p>
              </div>
              <div aria-hidden="true" className="h-3 w-full bg-paper-sunk overflow-hidden">
                <motion.div
                  className={`h-full ${f.bar}`}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${(f.mw / SCALE_MW) * 100}%` } : { width: 0 }}
                  transition={{ delay: 0.1 + i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
              <p className="mt-2 text-xs font-sans text-ink-600">{f.source}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm font-sans text-status-disputed border-l-[3px] border-status-disputed bg-status-disputed-soft pl-4 pr-4 py-2.5 leading-relaxed">
          T5 CEO Pete Marin cited 1.6 GW (1,600 MW) in February 2025 and 1.55 GW in October 2025. The difference has not been explained publicly.
        </p>
        <p className="mt-3 text-xs font-sans text-ink-600 leading-relaxed">
          Bars share one scale. Each shows a single published figure; none is calculated from the others.
        </p>
      </div>
    </ChartFigure>
  )
}
