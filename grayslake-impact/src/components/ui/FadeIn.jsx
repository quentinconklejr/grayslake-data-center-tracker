import { useRef, useLayoutEffect } from 'react'

export default function FadeIn({ children, delay = 0, y = 8, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Elements already in the viewport on load: appear immediately, no animation.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom >= 0) return

    // Hide below-fold elements before first browser paint.
    el.style.opacity = '0'
    el.style.transform = `translateY(${y}px)`
    el.style.willChange = 'opacity, transform'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        // By the time IO fires the browser has committed opacity:0.
        // One rAF schedules the transition in the next paint cycle.
        requestAnimationFrame(() => {
          el.style.transition = `opacity 0.35s ease-out ${delay}s, transform 0.35s ease-out ${delay}s`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          el.addEventListener('transitionend', () => {
            el.style.willChange = ''
            el.style.transition = ''
          }, { once: true })
        })
      },
      { rootMargin: '0px', threshold: 0.01 }
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [delay, y])

  return <Tag ref={ref} className={className}>{children}</Tag>
}
