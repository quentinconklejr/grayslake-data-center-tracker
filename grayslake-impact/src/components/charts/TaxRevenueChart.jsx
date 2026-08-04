import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const DEFAULT_DATA = [
  { name: 'Major infrastructure projects', pct: 50, color: '#d97706', bg: 'rgba(217,119,6,0.09)', label: '50%' },
  { name: 'Special community projects',    pct: 25, color: '#0284c7', bg: 'rgba(2,132,199,0.09)', label: '25%' },
  { name: 'Resident cost-control',         pct: 25, color: '#059669', bg: 'rgba(5,150,105,0.09)', label: '25%' },
]

function ProportionBar({ item, index, inView }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-600 leading-tight">{item.name}</span>
        <span className="font-mono text-sm font-semibold shrink-0" style={{ color: item.color }}>
          {item.label}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
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
