import SourceCitation from './SourceCitation'

const ACCENTS = {
  blue:   { border: 'border-blue-500/40',   label: 'text-blue-400/50' },
  green:  { border: 'border-emerald-500/40', label: 'text-emerald-400/50' },
  amber:  { border: 'border-amber-500/40',  label: 'text-amber-400/50' },
  red:    { border: 'border-red-500/40',    label: 'text-red-400/50' },
  violet: { border: 'border-violet-500/40', label: 'text-violet-400/50' },
}

export default function StatCard({ label, value, sub, badge, accent = 'blue', sourceKey }) {
  const a = ACCENTS[accent] ?? ACCENTS.blue
  return (
    <div className={`border-t-2 ${a.border} pt-5 pb-1 flex flex-col`}>
      <p className={`text-2xs font-mono uppercase tracking-[0.18em] mb-3 ${a.label}`}>
        {label}
      </p>
      <p className="text-4xl font-display font-bold leading-none tracking-tight mb-2 text-gray-100">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 leading-relaxed flex-1">{sub}</p>}
      {badge && (
        <span className={`mt-2 self-start text-2xs font-mono font-semibold px-1.5 py-0.5 rounded-sm border ${a.border} ${a.label}`}>
          {badge}
        </span>
      )}
      {sourceKey && (
        <div className="mt-3 pt-3 border-t border-gray-800/40">
          <SourceCitation sourceKey={sourceKey} />
        </div>
      )}
    </div>
  )
}
