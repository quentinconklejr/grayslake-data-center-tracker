import { useState, useContext, useRef, useEffect } from 'react'
import { sources } from '../../data/sources'
import { useFootnoteNumber, FootnoteCtx } from './FootnoteContext'
import { prefersReducedMotion } from '../../lib/prefersReducedMotion'

export default function SourceCitation({ sourceKey }) {
  const num = useFootnoteNumber(sourceKey)
  const source = sources[sourceKey]
  const ctx = useContext(FootnoteCtx)
  const [show, setShow] = useState(false)
  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)

  function open(e) {
    // Phones: jump to this source's own entry in the list (not the top of
    // the list), move focus there, and leave a "Back to text" button in the
    // entry that returns to this superscript.
    if (window.matchMedia('(max-width: 768px)').matches) {
      e.preventDefault()
      const entry = document.getElementById(`fn-${num}`) ?? document.getElementById('footnote-list')
      if (!entry) return
      ctx?.setBackTo?.({ num, el: buttonRef.current })
      entry.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      entry.focus({ preventScroll: true })
      return
    }
    setShow(true)
    ctx?.setHoveredKey?.(sourceKey)
  }

  function close() {
    setShow(false)
    ctx?.setHoveredKey?.(null)
  }

  useEffect(() => {
    if (!show) return
    function handler(e) {
      if (!wrapperRef.current?.contains(e.target)) close()
    }
    // Escape closes the popup and puts focus back on the superscript.
    function onKeyDown(e) {
      if (e.key !== 'Escape') return
      close()
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', handler)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handler)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [show])

  if (!source) return null

  // The reference sits inline as a small superscript, not a bracketed
  // markdown-looking token. A transparent 44×44 ::after hit target overlays
  // the visible mark so touch users get WCAG 2.5.5 AAA without inflating
  // the typographic footprint. `contain: layout` on the button prevents
  // that 44×44 rect from bleeding ~18px into ancestor scrollWidth (which
  // otherwise adds up across multiple markers to a horizontal scrollbar
  // at 375px). Paint + hit-testing still extend to the full 44×44.
  // aria-label announces "Source N" so SR does not read the visual glyph
  // out as "one".
  return (
    <span ref={wrapperRef} className="relative inline align-baseline ml-0.5">
      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        onMouseEnter={() => !window.matchMedia('(max-width: 768px)').matches && open({ preventDefault: () => {} })}
        onMouseLeave={close}
        aria-label={`Source ${num}`}
        aria-expanded={show}
        className="relative align-super text-2xs font-mono font-semibold text-accent hover:text-accent-hover [contain:layout] after:absolute after:content-[''] after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
      >
        <span aria-hidden="true">{num}</span>
      </button>

      {show && (
        <div role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-3 bg-ink-900 text-paper border border-ink-900 text-xs z-50 pointer-events-none">
          <div className="font-mono font-semibold text-paper-sunk">Source {num}</div>
          <div className="font-sans font-semibold mt-1">{source.title}</div>
          {(source.publisher || source.date) && (
            <div className="text-2xs font-sans text-paper-sunk mt-1">
              {[source.publisher, source.date].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      )}
    </span>
  )
}
