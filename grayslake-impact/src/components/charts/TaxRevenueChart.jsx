import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Editorial horizontal proportion bars — no Recharts needed.
// Each segment reveals left-to-right with staggered delay.
const DEFAULT_DATA = [
  { name: 'Major infrastructure projects', pct: 50, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: '50%' },
  { name: 'Special community projects',    pct: 25, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', label: '25%' },
  { name: 'Resident cost-control',         pct: 25, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: '25%' },
]

function ProportionBar({ item, index, inView }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-400 leading-tight">{item.name}</span>
        <span className="font-mono text-sm font-semibold shrink-0" style={{ color: item.color }}>
          {item.label}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-800/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: item.color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${item.pct}%` } : { width: 0 }}
          transition={{
            delay: 0.1 + index * 0.12,
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>
    </div>
  )
}

export default function TaxRevenueChart({ data = DEFAULT_DATA }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="space-y-4 py-2">
      {data.map((item, i) => (
        <ProportionBar key={item.name} item={item} index={i} inView={inView} />
      ))}
    </div>
  )
}
