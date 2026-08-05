import SourceCitation from './SourceCitation'

/**
 * Renders canonical figures from keyFigures.js.
 *
 * The qualifier is deliberately not optional and is never rendered far from
 * the value. Most of this site's past errors were figures that travelled
 * without their condition attached — 1,680 jobs read as a projection rather
 * than a ceiling, 1.55 GW read as an opposition claim, 472 acres read as
 * ownership. Keeping the two together in one component is the structural fix.
 */
export default function KeyFigureList({ figures, variant = 'table' }) {
  if (variant === 'cards') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {figures.map(f => (
          <div key={f.id} className="border border-gray-200 rounded-lg bg-white px-4 py-3.5">
            <p className="text-2xs font-mono uppercase tracking-widest text-gray-600 mb-1">{f.label}</p>
            <p className="text-lg font-display font-bold text-gray-900 leading-tight">{f.value}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-snug">{f.qualifier}</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {f.detail}
              {[f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean).map(k => (
                <SourceCitation key={k} sourceKey={k} />
              ))}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
      {figures.map(f => (
        <div key={f.id} className="grid sm:grid-cols-5 gap-2 sm:gap-4 px-5 py-4">
          <div className="sm:col-span-2">
            <p className="text-2xs font-mono text-gray-600 uppercase tracking-widest leading-tight">{f.label}</p>
          </div>
          <div className="sm:col-span-3">
            <p className="text-sm font-display font-semibold text-gray-900 leading-snug">
              {f.value}
              <span className="font-normal text-gray-600"> — {f.qualifier}</span>
              {[f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean).map(k => (
                <SourceCitation key={k} sourceKey={k} />
              ))}
            </p>
            {f.detail && <p className="text-xs text-gray-600 mt-1 leading-snug">{f.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
