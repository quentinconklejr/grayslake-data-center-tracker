import { Fragment, useEffect, useRef, useState } from 'react'

const PREFERS_REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Headline that reveals word by word and re-reveals whenever it re-enters the
 * viewport, so scrolling back up replays it instead of leaving a static block.
 *
 * The words are real text in the DOM at all times, so a screen reader or a
 * crawler sees an ordinary heading no matter what the animation is doing.
 */
export default function RevealHeadline({ text, className = '', as: Tag = 'h1', stagger = 0.045 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(PREFERS_REDUCED)

  useEffect(() => {
    if (PREFERS_REDUCED) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setShown(e.isIntersecting && e.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 0.4] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        // The space must be a sibling of the wrapper, not a child of it. Inside
        // an inline-block with overflow-hidden the browser collapses trailing
        // whitespace, which ran every word together.
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom">
          <span
            className="inline-block"
            style={
              PREFERS_REDUCED
                ? undefined
                : {
                    transform: shown ? 'translateY(0)' : 'translateY(0.9em)',
                    opacity: shown ? 1 : 0,
                    transition: `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * stagger}s, opacity 0.5s ease-out ${i * stagger}s`,
                  }
            }
          >
            {w}
          </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
