import { useEffect, useRef, useState } from 'react'

/*
 * Horizontal scroll container for the records tables.
 *
 * A records table with six columns cannot honestly be reflowed to 375px, so
 * it scrolls sideways inside its own box rather than pushing the page
 * sideways. Two things that a bare overflow-x-auto does not give you:
 *
 *   - tabindex=0 and a role/label when the content actually overflows, so a
 *     keyboard user can scroll the region (WCAG 2.1.1). Applied only on
 *     overflow, because a focusable element that cannot scroll is a stop on
 *     the tab path that does nothing.
 *   - a visible edge fade while more content sits to the right, so the
 *     table does not look like it simply ends mid-column.
 */
export default function ScrollTable({ label, children }) {
  const ref = useRef(null)
  const [overflows, setOverflows] = useState(false)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function measure() {
      const over = el.scrollWidth > el.clientWidth + 1
      setOverflows(over)
      setAtEnd(!over || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.addEventListener('scroll', measure, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', measure)
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={ref}
        {...(overflows ? { tabIndex: 0, role: 'region', 'aria-label': label } : {})}
        className="overflow-x-auto"
      >
        {children}
      </div>
      {overflows && !atEnd && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{ background: 'linear-gradient(to right, rgba(250,248,244,0), rgba(250,248,244,0.95))' }}
        />
      )}
      {overflows && (
        <p className="mt-2 text-2xs font-sans text-ink-500 sm:hidden">
          Scroll the table sideways to see every column.
        </p>
      )}
    </div>
  )
}
