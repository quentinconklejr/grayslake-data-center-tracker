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
  }, [show]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!source) return null

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      style={{ fontSize: '0.6em', verticalAlign: 'super', lineHeight: 0 }}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      <a
        href={`#fn-${num}`}
        aria-describedby={show ? tooltipId : undefined}
        className={`inline-flex items-center justify-center transition-colors duration-150 ${
          isDimmed
            ? 'text-blue-300/35'
            : isHighlighted || show
            ? 'text-blue-700'
            : 'text-blue-600 hover:text-blue-700'
        }`}
        style={{ minHeight: '24px', minWidth: '24px' }}
        title={source.title}
        onClick={(e) => {
          // On coarse-pointer devices (touch), first tap shows popover; second tap navigates
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
            marginBottom: '6px',
            fontSize: '0.875rem',
            lineHeight: 1.4,
            whiteSpace: 'normal',
          }}
        >
          <span className="block w-56 max-w-[min(14rem,80vw)] bg-white border border-gray-200 rounded-lg shadow-glass-md p-3 text-left font-sans not-italic normal-case">
            <span className="block text-xs font-medium text-gray-900 leading-snug">{source.title}</span>
            {(source.publisher || source.date) && (
              <span className="block text-2xs font-mono text-gray-500 mt-1.5">
                {[source.publisher, source.date].filter(Boolean).join(' · ')}
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  )
}
