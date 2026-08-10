import { useId } from 'react'

const ACCENT = {
  amber: { bar: 'bg-amber-600', text: 'text-amber-700', bg: 'bg-amber-50/50' },
  emerald: { bar: 'bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50/50' },
  blue: { bar: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50/50' },
  violet: { bar: 'bg-violet-600', text: 'text-violet-700', bg: 'bg-violet-50/50' },
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
    <div className={`border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all ${open ? 'ring-1 ring-slate-300' : ''}`}>
      <h2>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
        >
          {/* Left Column: Title & Blurb */}
          <div className="flex items-start gap-3.5 max-w-xl">
            <span className={`w-1.5 h-12 rounded-full shrink-0 ${a.bar}`} />
            <div>
              <div className={`text-2xs font-mono font-bold uppercase tracking-wider ${a.text}`}>
                {label}
              </div>
              <p className="text-xs font-sans text-slate-600 leading-snug mt-1">
                {blurb}
              </p>
            </div>
          </div>

          {/* Right Column: Metric Value & Qualifier */}
          <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 text-right">
            <div>
              <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                {value}
              </div>
              {qualifier && (
                <div className="text-2xs font-mono text-slate-500 max-w-[220px] sm:max-w-[260px] leading-tight mt-0.5">
                  {qualifier}
                </div>
              )}
            </div>
            <span className="text-slate-400 font-mono text-sm shrink-0 ml-1">
              {open ? '▲' : '▼'}
            </span>
          </div>
        </button>
      </h2>

      {open && (
        <div id={panelId} className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  )
}
