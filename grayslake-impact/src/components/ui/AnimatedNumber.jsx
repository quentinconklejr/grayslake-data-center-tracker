import { useEffect, useRef, useState } from 'react'
import { useInView, animate, useReducedMotion } from 'framer-motion'

const DEFAULT_SESSION_KEY = null

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 0.6,
  delay = 0,
  className = '',
  format = (v) => Math.round(v).toLocaleString(),
  sessionKey = DEFAULT_SESSION_KEY,
}) {
  const shouldReduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  // Determine initial display value: use final value immediately if reduced motion
  // or if this animation has already run this session.
  const [display, setDisplay] = useState(() => {
    if (shouldReduce) return value
    if (sessionKey) {
      try {
        if (sessionStorage.getItem(sessionKey) === '1') return value
      } catch { /* sessionStorage unavailable */ }
    }
    return 0
  })

  // Track whether we should animate (false = skip; already showing final value)
  const animated = useRef(display === value)

  useEffect(() => {
    if (!inView || animated.current) return
    animated.current = true

    let stop
    const timer = setTimeout(() => {
      const controls = animate(0, value, {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (v) => setDisplay(v),
        onComplete: () => {
          if (sessionKey) {
            try { sessionStorage.setItem(sessionKey, '1') } catch { /* ignore */ }
          }
        },
      })
      stop = controls.stop
    }, delay * 1000)

    return () => { clearTimeout(timer); stop?.() }
  }, [inView, value, duration, delay, sessionKey])

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{prefix}{format(display)}{suffix}</span>
      <span className="sr-only">{prefix}{format(value)}{suffix}</span>
    </span>
  )
}
