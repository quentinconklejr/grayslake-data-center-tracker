import { useEffect, useRef, useState } from 'react'
import { useInView, animate, useReducedMotion } from 'framer-motion'

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5,
  delay = 0,
  className = '',
  format = (v) => Math.round(v).toLocaleString(),
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const shouldReduce = useReducedMotion()
  const [display, setDisplay] = useState(shouldReduce ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (shouldReduce) { setDisplay(value); return }

    let stop
    const timer = setTimeout(() => {
      const controls = animate(0, value, {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (v) => setDisplay(v),
      })
      stop = controls.stop
    }, delay * 1000)

    return () => { clearTimeout(timer); stop?.() }
  }, [inView, value, duration, delay, shouldReduce])

  return (
    <span ref={ref} className={className}>
      {prefix}{format(display)}{suffix}
    </span>
  )
}
