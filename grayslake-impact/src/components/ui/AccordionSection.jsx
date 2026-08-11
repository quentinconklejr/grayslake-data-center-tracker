import { useId } from 'react'

const ACCENT = {
  amber: { bar: 'bg-amber-600', text: 'text-amber-700', bg: 'bg-amber-50/50' },
  emerald: { bar: 'bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50/50' },
  blue: { bar: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50/50' },
  violet: { bar: 'bg-violet-600', text: 'text-violet-700', bg: 'bg-violet-50/50' },
}

/**
 * Collapsible impact section.
 *
 * The mobile layout was the source of the squeeze. Three things:
 *
 * 1. The header put the headline figure in a right-aligned column with
 *    `text-right` and `self-end`. On a phone that column wraps under the
 *    title and the number ends up hard against the right edge, reading as a
 *    stray fragment rather than the answer to the label above it. It is now
 *    left-aligned and full width below sm, sitting directly under its label.
 *
 * 2. The accent bar was a fixed h-12, taller than the stacked text next to it
 *    on narrow screens, so it stuck out past the block it was marking.
 *
 * 3. The open panel used px-5 on mobile, and the page rendered inside it adds
 *    its own px-4, on top of the page wrapper's px-4. Three layers of padding
 *    left roughly 271px of usable width on a 375px screen - more than a
 *    quarter of the display given over to margin. The panel now uses px-4 on
 *    mobile and the pages drop their own horizontal padding when embedded.
 */
export default function AccordionSection({
  id,
  label,
  value,
  qualifier,
  blurb,
  accent = 'blue',
  open,
  onToggle,
  children,
}) {
  const a = ACCENT[accent] ?? ACCENT.blue
  const panelId = `${useId()}panel`

  return (
    <div
      id={id}
      className={`border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all ${
        open ? 'ring-1 ring-slate-300' : ''
      }`}
    >
      <h2>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-slate-50/80 transition-colors"
        >
          {/* Title and blurb */}
          <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
            <span className={`w-1.5 self-stretch min-h-[2.5rem] rounded-full shrink-0 ${a.bar}`} />
            <div className="min-w-0">
              <div className={`text-2xs font-mono font-bold uppercase tracking-wider ${a.text}`}>
                {label}
              </div>
              <p className="text-sm sm:text-xs font-sans text-slate-600 leading-relaxed sm:leading-snug mt-1">
                {blurb}
              </p>
            </div>
          </div>

          {/* Headline figure. Left-aligned and full width on mobile so it reads
              as part of the same block rather than a fragment pinned to the
              far edge. */}
          <div className="flex items-end justify-between gap-4 w-full sm:w-auto sm:justify-start shrink-0 pl-4.5 sm:pl-0 sm:text-right">
            <div className="min-w-0">
              <div className="text-2xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight break-words">
                {value}
              </div>
              {qualifier && (
                <div className="text-2xs font-mono text-slate-500 leading-tight mt-1 sm:max-w-[19rem]">
                  {qualifier}
                </div>
              )}
            </div>
            <span className="text-slate-400 font-mono text-sm shrink-0 sm:ml-3" aria-hidden="true">
              {open ? '▲' : '▼'}
            </span>
          </div>
        </button>
      </h2>

      {open && (
        <div id={panelId} className="px-4 sm:px-6 pb-6 pt-3 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  )
}
