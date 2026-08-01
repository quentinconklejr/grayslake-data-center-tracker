import { motion, useReducedMotion } from 'framer-motion'

export default function FadeIn({
  children,
  delay = 0,
  y = 20,
  className = '',
  once = true,
  as = 'div',
}) {
  const shouldReduce = useReducedMotion()
  const MotionEl = motion[as] ?? motion.div

  return (
    <MotionEl
      initial={{ opacity: 0, y: shouldReduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{
        delay: shouldReduce ? 0 : delay,
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </MotionEl>
  )
}
