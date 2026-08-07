import { useId } from 'react'

/**
 * One collapsible impact section.
 *
 * The panel content stays mounted when collapsed and is hidden with the
 * `hidden` attribute rather than unmounted. That is deliberate: every section
 * registers its citations with FootnoteProvider on mount, so unmounting the
 * closed ones would renumber the source list every time somebody opened a
 * panel, and the same footnote marker would point at different sources
 * depending on what the reader had clicked. Hidden content is skipped by
 * screen readers and taken out of the tab order by the browser, so nothing
 * inside a closed panel is reachable.
 *
 * The trigger is a real button inside an h2, which is what lets a screen
 * reader list the four sections and jump between them. aria-expanded carries
 * the open state and the chevron is decorative.
 */

// Only the -700 shades are used for anything a reader has to see. The 400 and
// 500 steps of these ramps sit between 1.6:1 and 2.5:1 on white, so a bar or a
// border drawn in them is decoration a low-vision reader will not find.
//
// The card outline stays border-edge in every state rather than switching to
// the accent. edge is the one boundary colour on this site measured against
// WCAG 1.4.11's 3:1, and swapping it for a pastel on open would have quietly
// undone that. Open state is carried by the chevron rotation, the background
// tint and the panel itself, none of which depend on colour alone.
const ACCENT = {
  amber:   { bar: 'bg-amber-700',   text: 'text-amber-700',   openBg: 'bg-amber-50' },
  emerald: { bar: 'bg-emerald-700', text: 'text-emerald-700', openBg: 'bg-emerald-50' },
  blue:    { bar: 'bg-blue-700',    text: 'text-blue-700',    openBg: 'bg-blue-50' },
  violet:  { bar: 'bg-violet-700',  text: 'text-violet-700',  openBg: 'bg-violet-50' },
}

export default function AccordionSection({
  id, label, value, qualifier, blurb, accent = 'blue', open, onToggle, children,
}) {
  const a = ACCENT[accent] ?? ACCENT.blue
  const panelId = `${useId()}panel`

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 rounded-2xl border-2 border-edge bg-white overflow-hidden"
    >
      <h2 id={`${id}-heading`} className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={`w-full text-left flex items-stretch transition-colors ${
            open ? a.openBg : 'bg-white hover:bg-gray-50'
          }`}
        >
          <span className={`shrink-0 transition-all duration-200 ${a.bar} ${open ? 'w-2.5' : 'w-1.5'}`} aria-hidden="true" />

          <span className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 sm:px-6 py-5">
            <span className="flex-1 min-w-0">
              <span className={`block text-xs font-mono uppercase tracking-[0.15em] mb-1.5 ${a.text}`}>
                {label}
              </span>
              <span className="block text-base text-gray-700 leading-snug">{blurb}</span>
            </span>

            <span className="sm:text-right sm:max-w-[16rem] sm:shrink-0">
              <span className="block text-2xl sm:text-3xl font-display font-bold text-gray-900 leading-tight">
                {value}
              </span>
              <span className="block text-sm text-gray-600 leading-snug mt-1.5">{qualifier}</span>
            </span>
          </span>

          <span className="flex items-center pr-5 sm:pr-6 shrink-0">
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-full border border-edge bg-white text-gray-700 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </button>
      </h2>

      <div id={panelId} hidden={!open} className="border-t border-edge-soft">
        {children}
      </div>
    </section>
  )
}
