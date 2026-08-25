import { useState, useContext, useRef, useEffect } from 'react'
import { sources } from '../../data/sources'
import { useFootnoteNumber, FootnoteCtx } from './FootnoteContext'

export default function SourceCitation({ sourceKey }) {
  const num = useFootnoteNumber(sourceKey)
  const source = sources[sourceKey]
  const ctx = useContext(FootnoteCtx)
  const [show, setShow] = useState(false)
  const wrapperRef = useRef(null)

  function open(e) {
    // Mobile Touch Handling: Scroll to footnote list on touch devices
    if (window.matchMedia('(max-width: 768px)').matches) {
      e.preventDefault()
      document.getElementById('footnote-list')?.scrollIntoView({ behavior: 'smooth' })
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
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [show])

  if (!source) return null

  return (
    <span ref={wrapperRef} className="relative inline-block ml-0.5">
      <button
        onClick={open}
        onMouseEnter={() => !window.matchMedia('(max-width: 768px)').matches && open({ preventDefault: () => {} })}
        onMouseLeave={close}
        className="text-2xs font-mono font-semibold text-accent hover:text-accent-hover focus:outline-none"
      >
        [{num}]
      </button>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-3 bg-ink-900 text-paper border border-ink-900 text-xs z-50 pointer-events-none">
          <div className="font-mono font-semibold text-paper-sunk">Source [{num}]</div>
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
