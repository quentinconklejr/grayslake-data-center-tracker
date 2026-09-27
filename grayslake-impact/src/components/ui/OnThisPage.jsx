import { useEffect, useState } from 'react'

/*
 * "On this page" rail for long pages, shown on xl screens only.
 *
 * The parent decides where it sits (it sits in space the text column does
 * not use) and passes the section ids. Plain in-page anchors, so it works
 * with the keyboard and without script; the scroll listener only moves the
 * current-section marker. Target sections carry scroll-mt so the jump does
 * not land under the sticky site header.
 *
 * `onNavigate(id)` runs before the jump, for pages whose sections can be
 * collapsed (/project opens the one you asked for).
 */
export default function OnThisPage({ items, onNavigate, className = '' }) {
  const [current, setCurrent] = useState(items[0]?.id)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      // The current section is the last one whose top has passed a line
      // just below the sticky header.
      let active = items[0]?.id
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) active = id
      }
      setCurrent(active)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [items])

  return (
    <nav aria-label="On this page" className={`hidden xl:block ${className}`.trim()}>
      <div className="sticky top-24">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-3">On this page</p>
        <ul className="border-l border-rule space-y-0.5">
          {items.map(({ id, label }) => {
            const isCurrent = current === id
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => onNavigate?.(id)}
                  aria-current={isCurrent ? 'location' : undefined}
                  className={`block -ml-px pl-3 py-1.5 border-l-2 text-xs font-sans leading-snug transition-colors ${
                    isCurrent
                      ? 'border-accent text-ink-900 font-semibold'
                      : 'border-transparent text-ink-600 hover:text-ink-900 hover:border-rule-strong'
                  }`}
                >
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
