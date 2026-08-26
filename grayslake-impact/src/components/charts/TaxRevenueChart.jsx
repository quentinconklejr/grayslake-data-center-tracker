import ChartFigure from '../ui/ChartFigure'
import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'

/*
 * Simple proportion-bar chart for developer-fee allocation. Each row
 * has a flat fill color mapped to the status token palette rather than
 * the old glass gradients.
 */
const DEFAULT_DATA = [
  { name: 'Major infrastructure projects', pct: 50, fillCls: 'bg-status-policy',       textCls: 'text-status-policy',       label: '50%' },
  { name: 'Special community projects',    pct: 25, fillCls: 'bg-status-approval',     textCls: 'text-status-approval',     label: '25%' },
  { name: 'Resident cost-control',         pct: 25, fillCls: 'bg-status-construction', textCls: 'text-status-construction', label: '25%' },
]

function ProportionBar({ item, index, inView }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-sans text-ink-700 leading-tight">{item.name}</span>
        <span className={`font-mono text-sm font-semibold shrink-0 ${item.textCls}`}>
          {item.label}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden border border-rule">
        <motion.div
          className={`h-full ${item.fillCls}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${item.pct}%` } : { width: 0 }}
          transition={{
            delay:    0.1 + index * 0.12,
            duration: 0.7,
            ease:     [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>
    </div>
  )
}

function useInViewOnce(ref) {
  const [inView, setInView] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom >= 0) { setInView(true); return }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { rootMargin: '-40px', threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

export default function TaxRevenueChart({ data = DEFAULT_DATA }) {
  const ref = useRef(null)
  const inView = useInViewOnce(ref)

  return (
    <ChartFigure
      caption="Developer fee allocation"
      description="Bar chart of how the Village says developer fees would be split."
      rows={data.map(d => [d.name, d.label ?? `${d.pct}%`])}
    >
      <div ref={ref} className="space-y-4 py-2">
        {data.map((item, i) => (
          <ProportionBar key={item.name} item={item} index={i} inView={inView} />
        ))}
      </div>
    </ChartFigure>
  )
}
