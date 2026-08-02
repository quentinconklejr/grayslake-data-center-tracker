import { createContext, useContext, useRef } from 'react'
import { sources } from '../../data/sources'

const FootnoteCtx = createContext(null)

/**
 * Wrap a page with this to enable the footnote system.
 * preload: array of sourceKeys in desired display order (needed for
 * pages where citations are inside conditionally-rendered sections,
 * e.g. accordion items, so they register even when collapsed).
 */
export function FootnoteProvider({ children, preload = [] }) {
  const stateRef = useRef(null)
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
    <FootnoteCtx.Provider value={{ register, stateRef }}>
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
  if (!order.length) return null

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Sources</p>
      <ol className="space-y-3">
        {order.map((key, i) => {
          const source = sources[key]
          if (!source) return null
          const num = i + 1
          return (
            <li key={key} id={`fn-${num}`} className="flex gap-3 scroll-mt-20">
              <span className="text-xs font-mono text-gray-400 shrink-0 tabular-nums w-5 text-right pt-px">
                {num}.
              </span>
              <div className="text-xs text-gray-600 leading-relaxed min-w-0">
                <span className="text-gray-800 font-medium">{source.title}</span>
                {source.publisher && (
                  <span className="text-gray-500"> — {source.publisher}</span>
                )}
                {source.date && (
                  <span className="text-gray-500"> · {source.date}</span>
                )}
                {source.url && source.status !== 'unverified' && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    ↗
                  </a>
                )}
                {source.note && (
                  <span className="block text-amber-700/70 italic mt-0.5">{source.note}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
