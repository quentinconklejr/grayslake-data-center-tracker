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
        className="text-2xs font-mono font-bold text-sky-700 hover:text-sky-900 focus:outline-none"
      >
        [{num}]
      </button>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-2.5 bg-slate-900 text-slate-100 rounded-lg shadow-xl text-xs z-50 pointer-events-none">
          <div className="font-bold text-sky-400">Source [{num}]</div>
          <div className="font-semibold mt-0.5">{source.title}</div>
          {(source.publisher || source.date) && (
            <div className="text-2xs text-slate-400 mt-1">
              {[source.publisher, source.date].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      )}
    </span>
  )
}
