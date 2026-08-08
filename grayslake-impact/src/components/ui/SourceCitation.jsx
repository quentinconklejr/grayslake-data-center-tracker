import { useState, useContext, useRef, useEffect } from 'react'
import { sources } from '../../data/sources'
import { useFootnoteNumber, FootnoteCtx } from './FootnoteContext'

export default function SourceCitation({ sourceKey }) {
  const num = useFootnoteNumber(sourceKey)
  const source = sources[sourceKey]
  const ctx = useContext(FootnoteCtx)
  const [show, setShow] = useState(false)
  const wrapperRef = useRef(null)
  const tooltipId = `tooltip-fn-${num}`

  const isHighlighted = ctx?.hoveredKey === sourceKey
  const isDimmed = !!ctx?.hoveredKey && ctx.hoveredKey !== sourceKey

  function open() {
    setShow(true)
    ctx?.setHoveredKey?.(sourceKey)
  }
  function close() {
    setShow(false)
    ctx?.setHoveredKey?.(null)
  }

  // Close on outside tap (touch devices)
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
    <span
      ref={wrapperRef}
      className="relative inline-block ml-0.5 mr-0.5"
      style={{ verticalAlign: 'super', lineHeight: 0 }}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      <a
        href={`#fn-${num}`}
        aria-describedby={show ? tooltipId : undefined}
        className={`inline-flex items-center justify-center font-mono text-xs font-semibold px-1.5 py-0.5 rounded transition-all duration-150 border ${
          isDimmed
            ? 'text-gray-400 bg-gray-50 border-gray-200'
            : isHighlighted || show
            ? 'text-sky-900 bg-sky-100 border-sky-400 shadow-sm'
            : 'text-sky-800 bg-sky-50/80 hover:bg-sky-100 border-sky-200/90 hover:border-sky-300'
        }`}
        style={{ minHeight: '22px', minWidth: '22px' }}
        title={source.title}
        onClick={(e) => {
          if (window.matchMedia('(pointer: coarse)').matches && !show) {
            e.preventDefault()
            open()
          }
        }}
      >
        [{num}]
      </a>

      {show && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            lineHeight: 1.4,
            whiteSpace: 'normal',
          }}
        >
          <span className="block w-64 max-w-[min(16rem,85vw)] bg-white border border-slate-300 rounded-lg shadow-lg p-3.5 text-left font-sans not-italic normal-case">
            <span className="inline-block text-[11px] font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-1.5 py-0.5 rounded mb-1.5 border border-sky-200">
              Source [{num}]
            </span>
            <span className="block text-sm font-semibold text-slate-900 leading-snug">
              {source.title}
            </span>
            {(source.publisher || source.date) && (
              <span className="block text-xs font-mono text-slate-600 mt-2 border-t border-slate-100 pt-1.5 font-medium">
                {[source.publisher, source.date].filter(Boolean).join(' · ')}
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  )
}
