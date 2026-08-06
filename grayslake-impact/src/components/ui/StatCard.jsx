import SourceCitation from './SourceCitation'

const ACCENT = {
  blue:   { top: 'border-t-blue-500',    label: 'text-blue-600'    },
  green:  { top: 'border-t-emerald-500', label: 'text-emerald-600' },
  amber:  { top: 'border-t-amber-500',   label: 'text-amber-600'   },
  red:    { top: 'border-t-red-500',     label: 'text-red-600'     },
  violet: { top: 'border-t-violet-500',  label: 'text-violet-600'  },
}

export default function StatCard({ label, value, sub, badge, accent = 'blue', sourceKey }) {
  const a = ACCENT[accent] ?? ACCENT.blue

  return (
    <div className={`bg-white border border-gray-200 border-t-4 ${a.top} rounded-xl px-4 pt-4 pb-4 flex flex-col shadow-glass hover:shadow-glass-hover transition-shadow duration-150`}>
      <p className={`text-2xs font-mono uppercase tracking-[0.18em] mb-3 ${a.label}`}>
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-display font-bold leading-none tracking-tight mb-2 text-gray-900 break-words">
        {value}{sourceKey && <SourceCitation sourceKey={sourceKey} />}
      </p>
      {sub && <p className="text-xs text-gray-600 leading-relaxed flex-1">{sub}</p>}
      {badge && (
        <span className="mt-3 self-start text-2xs font-mono font-semibold px-1.5 py-0.5 rounded-sm border border-gray-300 text-gray-500 uppercase tracking-widest">
          {badge}
        </span>
      )}
    </div>
  )
}
