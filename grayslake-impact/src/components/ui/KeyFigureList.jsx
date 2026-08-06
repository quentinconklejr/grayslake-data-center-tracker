import SourceCitation from './SourceCitation'
import CopyKPIButton from './CopyKPIButton'
import { figureCopyText } from '../../data/keyFigures'

/**
 * Renders canonical figures from keyFigures.js.
 *
 * The qualifier is deliberately not optional and is never rendered far from
 * the value. Most of this site's past errors were figures that travelled
 * without their condition attached — 1,680 jobs read as a projection rather
 * than a ceiling, 1.55 GW read as an opposition claim, 472 acres read as
 * ownership. Keeping the two together in one component is the structural fix.
 *
 * variant="grouped" accepts a `groups` prop:
 *   [{ id, label?, ids[], cols (Tailwind grid class), hero? }]
 * Hero groups get larger typography and more padding.
 */
export default function KeyFigureList({ figures, variant = 'table', groups = null, copyable = false }) {
  const byId = Object.fromEntries(figures.map(f => [f.id, f]))

  if (variant === 'grouped' && groups) {
    return (
      <div className="space-y-8">
        {groups.map(group => (
          <div key={group.id}>
            {group.label && (
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 pb-2 border-b border-gray-100">
                {group.label}
              </p>
            )}
            <div className={`grid gap-4 ${group.cols}`}>
              {group.ids.map(id => {
                const f = byId[id]
                if (!f) return null
                return (
                  <div
                    key={f.id}
                    className={`border border-gray-200 rounded-xl bg-white ${group.hero ? 'px-5 py-5' : 'px-4 py-4'}`}
                  >
                    <p className="text-2xs font-mono uppercase tracking-widest text-gray-500 mb-1">{f.label}</p>
                    <p className={`font-display font-bold text-gray-900 leading-tight ${group.hero ? 'text-2xl mt-0.5' : 'text-lg'}`}>
                      {f.value}
                    </p>
                    <p className={`text-gray-600 mt-1 leading-snug ${group.hero ? 'text-sm' : 'text-xs'}`}>
                      {f.qualifier}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {f.detail}
                      {[f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean).map(k => (
                        <SourceCitation key={k} sourceKey={k} />
                      ))}
                    </p>
                    {copyable && <CopyKPIButton copyText={figureCopyText(f.id)} />}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {figures.map(f => (
          <div key={f.id} className="border border-gray-200 rounded-xl bg-white px-6 py-5">
            <p className="text-2xs font-mono uppercase tracking-widest text-gray-600 mb-1">{f.label}</p>
            <p className="text-2xl font-display font-bold text-gray-900 leading-tight">{f.value}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-snug">{f.qualifier}</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {f.detail}
              {[f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean).map(k => (
                <SourceCitation key={k} sourceKey={k} />
              ))}
            </p>
            {copyable && <CopyKPIButton copyText={figureCopyText(f.id)} />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
      {figures.map(f => (
        <div key={f.id} className="grid sm:grid-cols-5 gap-2 sm:gap-5 px-6 py-5">
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
            {copyable && <CopyKPIButton copyText={figureCopyText(f.id)} />}
          </div>
        </div>
      ))}
    </div>
  )
}
