import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_DATA = [
  { name: 'Major infrastructure projects', pct: 50, color: '#d97706', bg: 'rgba(217,119,6,0.09)', label: '50%' },
  { name: 'Special community projects',    pct: 25, color: '#0284c7', bg: 'rgba(2,132,199,0.09)', label: '25%' },
  { name: 'Resident cost-control',         pct: 25, color: '#059669', bg: 'rgba(5,150,105,0.09)', label: '25%' },
]

// Maps base color hex → gradient + glow so external callers don't need updating
const COLOR_META = {
  '#d97706': {
    gradient: 'linear-gradient(180deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.88) 100%)',
    glow:     '0 4px 14px rgba(217,119,6,0.55), 0 1px 5px rgba(217,119,6,0.30)',
  },
  '#0284c7': {
    gradient: 'linear-gradient(180deg, rgba(56,189,248,0.95) 0%, rgba(2,132,199,0.88) 100%)',
    glow:     '0 4px 14px rgba(2,132,199,0.55), 0 1px 5px rgba(2,132,199,0.30)',
  },
  '#059669': {
    gradient: 'linear-gradient(180deg, rgba(52,211,153,0.95) 0%, rgba(5,150,105,0.88) 100%)',
    glow:     '0 4px 14px rgba(5,150,105,0.55), 0 1px 5px rgba(5,150,105,0.30)',
  },
}

// Diagonal streak in top third — simulates angled glass reflection
const SHINE = {
  position:      'absolute',
  inset:         0,
  background:    'linear-gradient(160deg, rgba(255,255,255,0.0) 10%, rgba(255,255,255,0.52) 30%, rgba(255,255,255,0.18) 50%, transparent 68%)',
  pointerEvents: 'none',
}

// Lighter rim at the rounded tip — gives the 3-D glass-capsule feel
const TIP_HIGHLIGHT = {
  position:      'absolute',
  right:         0,
  top:           0,
  bottom:        0,
  width:         '20px',
  background:    'linear-gradient(90deg, transparent, rgba(255,255,255,0.26))',
  borderRadius:  '0 9999px 9999px 0',
  pointerEvents: 'none',
}

const TRACK_SHADOW = {
  background:    'rgba(229,231,235,0.50)',
  backdropFilter: 'blur(4px)',
  boxShadow:     'inset 0 1.5px 4px rgba(15,23,42,0.14), inset 0 0 0 1px rgba(255,255,255,0.20)',
}

function ProportionBar({ item, index, inView }) {
  const meta = COLOR_META[item.color] ?? { gradient: item.color, glow: 'none' }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-600 leading-tight">{item.name}</span>
        <span className="font-mono text-sm font-semibold shrink-0" style={{ color: item.color }}>
          {item.label}
        </span>
      </div>
      <div className="h-3 w-full rounded-full overflow-hidden" style={TRACK_SHADOW}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: meta.gradient,
            boxShadow: meta.glow,
            position:  'relative',
            overflow:  'hidden',
          }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${item.pct}%` } : { width: 0 }}
          transition={{
            delay:    0.1 + index * 0.12,
            duration: 0.7,
            ease:     [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div aria-hidden="true" style={SHINE} />
          <div aria-hidden="true" style={TIP_HIGHLIGHT} />
        </motion.div>
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
    <div ref={ref} className="space-y-4 py-2">
      {data.map((item, i) => (
        <ProportionBar key={item.name} item={item} index={i} inView={inView} />
      ))}
    </div>
  )
}
