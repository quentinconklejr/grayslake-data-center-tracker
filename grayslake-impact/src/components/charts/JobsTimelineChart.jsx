import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { projections } from '../../data/projections'

const { permanent, constructionMidpoint } = projections.jobs

const ITEMS = [
  {
    label:    'Permanent Positions',
    sublabel: 'Village FAQ estimate, if all 10M sq ft is built',
    value:    permanent,
    max:      permanent,
    color:    '#059669',
    gradient: 'linear-gradient(180deg, rgba(52,211,153,0.95) 0%, rgba(5,150,105,0.88) 100%)',
    glow:     '0 4px 14px rgba(5,150,105,0.55), 0 1px 5px rgba(5,150,105,0.30)',
    bg:       'rgba(5,150,105,0.08)',
    display:  permanent.toLocaleString(),
    sourced:  true,
  },
  {
    label:    'Construction Workforce',
    sublabel: '"Hundreds" per Village documents — shown at ~400 (estimated)',
    value:    constructionMidpoint,
    max:      permanent,
    color:    '#d97706',
    gradient: 'linear-gradient(180deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.88) 100%)',
    glow:     '0 3px 10px rgba(217,119,6,0.38), 0 1px 4px rgba(217,119,6,0.22)',
    bg:       'rgba(217,119,6,0.08)',
    display:  `~${constructionMidpoint}`,
    sourced:  false,
  },
]

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
  background:     'rgba(229,231,235,0.50)',
  backdropFilter: 'blur(4px)',
  boxShadow:      'inset 0 1.5px 4px rgba(15,23,42,0.14), inset 0 0 0 1px rgba(255,255,255,0.20)',
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

export default function JobsTimelineChart() {
  const ref = useRef(null)
  const inView = useInViewOnce(ref)

  return (
    <div ref={ref} className="space-y-6">
      {ITEMS.map((item, i) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-semibold text-gray-900">{item.label}</span>
                {!item.sourced && (
                  <span className="text-2xs font-mono text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-sm bg-amber-50">
                    Est.
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-0.5 block">{item.sublabel}</span>
            </div>
            <span
              className="font-mono text-xl font-bold shrink-0 tabular-nums"
              style={{ color: item.color }}
            >
              {item.display}
            </span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden" style={TRACK_SHADOW}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.gradient,
                boxShadow:  item.glow,
                opacity:    item.sourced ? 1 : 0.5,
                position:   'relative',
                overflow:   'hidden',
              }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(item.value / item.max) * 100}%` } : { width: 0 }}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div aria-hidden="true" style={SHINE} />
              <div aria-hidden="true" style={TIP_HIGHLIGHT} />
            </motion.div>
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
        Dimmed bar = estimated figure. Solid bar = sourced Village projection.
      </p>
    </div>
  )
}
