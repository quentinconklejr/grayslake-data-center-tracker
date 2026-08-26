import { createContext, useContext, useRef, useState } from 'react'
import { sources } from '../../data/sources'

export const FootnoteCtx = createContext(null)

export function FootnoteProvider({ children, preload = [] }) {
  const stateRef = useRef(null)
  const [hoveredKey, setHoveredKey] = useState(null)

  if (stateRef.current === null) {
    const registry = {}
    const order = []
    preload.forEach(key => {
      if (!registry[key]) {
        registry[key] = order.length + 1
        order.push(key)
      }
    })
    stateRef.current = { registry, order }
  }

  function register(sourceKey) {
    if (!sourceKey) return null
    const s = stateRef.current
    if (!s.registry[sourceKey]) {
      s.registry[sourceKey] = s.order.length + 1
      s.order.push(sourceKey)
    }
    return s.registry[sourceKey]
  }

  return (
    <FootnoteCtx.Provider value={{ register, stateRef, hoveredKey, setHoveredKey }}>
      {children}
    </FootnoteCtx.Provider>
  )
}

export function useFootnoteNumber(sourceKey) {
  const ctx = useContext(FootnoteCtx)
  if (!ctx || !sourceKey) return null
  return ctx.register(sourceKey)
}

export function FootnoteList() {
  const ctx = useContext(FootnoteCtx)
  if (!ctx) return null
  const { order } = ctx.stateRef.current
  const { hoveredKey } = ctx
  if (!order.length) return null

  return (
    <div id="footnote-list" className="mt-12 pt-6 border-t border-rule scroll-mt-24">
      <p className="text-xs font-display italic text-ink-500 tracking-wide mb-5">Sources</p>
      <ol className="space-y-3">
        {order.map((key, i) => {
          const source = sources[key]
          if (!source) return null
          const num = i + 1
          const isHighlighted = hoveredKey === key
          // The "dim non-hovered" state used opacity-35, which composited
          // ink text to ~1.46:1 against paper — a WCAG body-text failure.
          // Dropped in favour of highlighting the hovered source only;
          // other sources render at full contrast at all times.
          return (
            <li
              key={key}
              id={`fn-${num}`}
              className={`flex gap-3 scroll-mt-20 transition-all duration-150 ${
                isHighlighted ? 'bg-accent-soft -mx-2 px-2 py-0.5' : ''
              }`}
            >
              <span className="text-xs font-mono text-ink-500 shrink-0 tabular-nums w-5 text-right pt-px">
                {num}.
              </span>
              <div className="text-sm font-sans text-ink-700 leading-relaxed min-w-0">
                <span className={`font-semibold ${isHighlighted ? 'text-ink-900 underline underline-offset-2 decoration-accent' : 'text-ink-800'}`}>
                  {source.title}
                </span>
                {source.publisher && (
                  <span className="text-ink-500"> · {source.publisher}</span>
                )}
                {source.date && (
                  <span className="text-ink-500 font-mono"> · {source.date}</span>
                )}
                {source.url && source.status !== 'unverified' && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1.5 text-accent hover:text-accent-hover transition-colors"
                  >
                    ↗
                  </a>
                )}
                {source.note && (
                  <span className="block text-status-disputed italic mt-0.5">{source.note}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
