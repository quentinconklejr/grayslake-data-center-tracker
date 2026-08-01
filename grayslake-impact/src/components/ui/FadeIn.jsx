import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState, useLayoutEffect } from 'react'

export default function FadeIn({ children, delay = 0, y = 12, className = '', as = 'div' }) {
  const shouldReduce = useReducedMotion()
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const MotionEl = motion[as] ?? motion.div

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || shouldReduce) { setVisible(true); return }

    // Synchronous BoundingClientRect check runs before browser paint — no flash of invisible
    // content for elements already in the viewport on load.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px', threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shouldReduce])

  return (
    <MotionEl
      ref={ref}
      initial={{ opacity: 0, y: shouldReduce ? 0 : y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: shouldReduce ? 0 : y }}
      transition={{
        delay: visible ? delay : 0,
        duration: shouldReduce ? 0 : 0.45,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </MotionEl>
  )
}
