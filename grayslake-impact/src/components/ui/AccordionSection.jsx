import { useId } from 'react'

/*
 * Section-level accordion for the four impact areas on /project (Energy,
 * Jobs, Fiscal Tax, Schools).
 *
 * Previously a bordered white card with shadow-sm and a mono-uppercase
 * kicker; now a rule-separated block on paper ground. The accent value
 * from the parent (amber/emerald/blue/violet) becomes a status-hue rail
 * beside the title — the same non-color-only cue the map and evidence
 * blocks use — and the label becomes a Fraunces headline instead of a
 * mono chip.
 */

const ACCENT = {
  amber:   { bar: 'bg-status-policy',       text: 'text-status-policy' },
  emerald: { bar: 'bg-status-construction', text: 'text-status-construction' },
  blue:    { bar: 'bg-status-approval',     text: 'text-status-approval' },
  violet:  { bar: 'bg-status-development',  text: 'text-status-development' },
}

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
      className={`border-t border-rule ${open ? 'pb-8' : ''}`}
    >
      <h2>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left py-5 sm:py-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 hover:bg-paper-sunk transition-colors"
        >
          {/* Title + description */}
          <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
            <span aria-hidden="true" className={`w-1 self-stretch min-h-[3rem] shrink-0 ${a.bar}`} />
            <div className="min-w-0">
              <div className="text-2xl sm:text-[26px] font-display text-ink-900 tracking-tight leading-tight">
                {label}
              </div>
              <p className="mt-1.5 text-sm font-sans text-ink-600 leading-snug max-w-2xl">
                {blurb}
              </p>
            </div>
          </div>

          {/* Headline figure */}
          <div className="flex items-baseline justify-between gap-4 w-full sm:w-auto sm:justify-start shrink-0 pl-5 sm:pl-0 sm:text-right">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[26px] font-display text-ink-900 tracking-tight leading-tight break-words">
                {value}
              </div>
              {qualifier && (
                <div className="text-xs font-sans text-ink-500 leading-snug mt-1 sm:max-w-[19rem]">
                  {qualifier}
                </div>
              )}
            </div>
            <span aria-hidden="true" className="text-ink-400 font-mono text-sm shrink-0 sm:ml-4">
              {open ? '−' : '+'}
            </span>
          </div>
        </button>
      </h2>

      {open && (
        <div id={panelId} className="pt-2 pl-0 sm:pl-8">
          {children}
        </div>
      )}
    </div>
  )
}
