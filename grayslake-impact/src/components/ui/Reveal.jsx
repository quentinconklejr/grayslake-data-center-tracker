import { useEffect, useRef, useState } from 'react'

// Read once at module load. Motion preference does not change mid-session in
// practice, and reading it here keeps it out of an effect, which avoids the
// extra render pass that setting it in useEffect would cause.
const PREFERS_REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fades and lifts content each time it enters the viewport, in either scroll
 * direction. FadeIn only fires once; this replays, which is what makes the
 * page feel alive when you scroll back up.
 */
export default function Reveal({ children, delay = 0, y = 14, className = '', as: Tag = 'div', once = false }) {
  const ref = useRef(null)
  // With reduced motion the content simply starts visible and never animates.
  const [shown, setShown] = useState(PREFERS_REDUCED)

  useEffect(() => {
    if (PREFERS_REDUCED) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          if (once) io.disconnect()
        } else if (!once) {
          setShown(false)
        }
      },
      { threshold: 0.08, rootMargin: '-4% 0px -4% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <Tag
      ref={ref}
      className={className}
      style={
        PREFERS_REDUCED
          ? undefined
          : {
              opacity: shown ? 1 : 0,
              transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
              transition: `opacity 0.5s ease-out ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
            }
      }
    >
      {children}
    </Tag>
  )
}
