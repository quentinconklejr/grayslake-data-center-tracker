import ChartFigure from '../ui/ChartFigure'
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
    fillCls:  'bg-status-construction',
    textCls:  'text-status-construction',
    display:  permanent.toLocaleString(),
    sourced:  true,
  },
  {
    label:    'Construction Workforce',
    sublabel: '"Hundreds" per Village documents; shown at ~400 (estimated)',
    value:    constructionMidpoint,
    max:      permanent,
    fillCls:  'bg-status-policy',
    textCls:  'text-status-policy',
    display:  `~${constructionMidpoint}`,
    sourced:  false,
  },
]

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
    <ChartFigure
      caption="Permanent versus construction workforce"
      description="Bar chart comparing projected permanent positions with the estimated construction workforce."
      rows={ITEMS.map(i => [i.label, `${i.display ?? i.value} — ${i.sublabel}`])}
    >
      <div ref={ref} className="space-y-6">
        {ITEMS.map((item, i) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-semibold text-ink-900">{item.label}</span>
                  {!item.sourced && (
                    <span className="text-2xs font-sans font-semibold text-status-disputed border border-status-disputed px-1.5 py-0.5">
                      Est.
                    </span>
                  )}
                </div>
                <span className="text-xs font-sans text-ink-500 mt-0.5 block">{item.sublabel}</span>
              </div>
              <span className={`font-mono text-xl font-semibold shrink-0 tabular-nums ${item.textCls}`}>
                {item.display}
              </span>
            </div>

            <div className="h-4 w-full overflow-hidden border border-rule">
              <motion.div
                className={`h-full ${item.sourced ? item.fillCls : 'bg-ink-500'}`}
                initial={{ width: 0 }}
                animate={inView ? { width: `${(item.value / item.max) * 100}%` } : { width: 0 }}
                transition={{ delay: 0.15 + i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </div>
        ))}

        <p className="text-xs font-sans text-ink-500 pt-2 border-t border-rule-soft">
          Dimmed bar = estimated figure. Solid bar = sourced Village projection.
        </p>
      </div>
    </ChartFigure>
  )
}
