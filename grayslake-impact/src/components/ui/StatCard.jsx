import SourceCitation from './SourceCitation'

export default function StatCard({ label, value, sub, badge, accent = 'blue', sourceKey }) {
  const borderColor = {
    blue:   'border-blue-500',
    green:  'border-emerald-500',
    amber:  'border-amber-500',
    red:    'border-red-500',
    violet: 'border-violet-500',
  }[accent] ?? 'border-blue-500'

  return (
    <div className={`border-t-2 ${borderColor} pt-5 pb-1 flex flex-col`}>
      <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.18em] mb-3">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-display font-bold leading-none tracking-tight mb-2 text-gray-900">
        {value}{sourceKey && <SourceCitation sourceKey={sourceKey} />}
      </p>
      {sub && <p className="text-xs text-gray-500 leading-relaxed flex-1">{sub}</p>}
      {badge && (
        <span className="mt-2 self-start text-2xs font-mono font-semibold px-1.5 py-0.5 rounded-sm border border-gray-300 text-gray-500">
          {badge}
        </span>
      )}
    </div>
  )
}
