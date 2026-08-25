import { useState, useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LAST_VERIFIED } from '../../data/siteConfig'

/*
 * Sticky sub-bar under the site header. Shows the current section title
 * (from data-section attributes on the page) and the last-verified date
 * once the reader has scrolled past the hero. Reads as a running head
 * on long pages, not as chrome.
 */
export default function SectionBar() {
  const [current, setCurrent] = useState(null)
  const [visible, setVisible] = useState(false)
  const [headerH, setHeaderH] = useState(66)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    const hdr = document.querySelector('header')
    if (!hdr) return
    const ro = new ResizeObserver(() => setHeaderH(hdr.offsetHeight))
    ro.observe(hdr)
    setHeaderH(hdr.offsetHeight)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-section]')]
    if (!sections.length) return

    function update() {
      const threshold = headerH + 48
      let active = null
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= threshold) {
          active = el.dataset.section
        }
      }
      setCurrent(active)
      setVisible(window.scrollY > 100)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [headerH])

  return (
    <div
      className="sticky z-40 overflow-hidden bg-paper border-b border-rule-soft"
      style={{
        top: headerH,
        maxHeight: visible && current ? 36 : 0,
        transition: shouldReduce ? 'none' : 'max-height 0.2s ease',
      }}
      aria-hidden={!visible || !current}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-9">
        <span className="text-xs font-display italic text-ink-700 truncate">{current}</span>
        <span className="text-2xs font-mono text-ink-500 shrink-0 ml-4">
          Last verified {LAST_VERIFIED}
        </span>
      </div>
    </div>
  )
}
