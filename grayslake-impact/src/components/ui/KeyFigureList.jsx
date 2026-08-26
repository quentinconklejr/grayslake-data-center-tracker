import SourceCitation from './SourceCitation'
import CopyKPIButton from './CopyKPIButton'
import { figureCopyText } from '../../data/keyFigures'

/**
 * Renders canonical figures from keyFigures.js.
 *
 * The qualifier is deliberately required and is never rendered far from
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
      <div className="space-y-10">
        {groups.map(group => (
          <div key={group.id}>
            {group.label && (
              <h3 className="text-xl font-display text-ink-900 tracking-tight mb-4 pb-2 border-b border-rule">
                {group.label}
              </h3>
            )}
            <div className={`grid gap-x-8 gap-y-6 ${group.cols}`}>
              {group.ids.map(id => {
                const f = byId[id]
                if (!f) return null
                return (
                  <div key={f.id} className={`border-t border-rule-soft pt-3 ${group.hero ? '' : ''}`}>
                    <p className="text-xs font-sans font-semibold text-ink-600">{f.label}</p>
                    <p className={`font-display text-ink-900 leading-tight tracking-tight ${group.hero ? 'text-3xl mt-1' : 'text-xl mt-1'}`}>
                      {f.value}
                    </p>
                    <p className={`font-sans text-ink-700 mt-1 leading-snug ${group.hero ? 'text-base' : 'text-sm'}`}>
                      {f.qualifier}
                    </p>
                    <p className="text-sm font-sans text-ink-600 mt-2 leading-relaxed">
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
        {figures.map(f => (
          <div key={f.id} className="border-t border-rule pt-4">
            <p className="text-xs font-sans font-semibold text-ink-600">{f.label}</p>
            <p className="text-2xl font-display text-ink-900 leading-tight tracking-tight mt-1">{f.value}</p>
            <p className="text-sm font-sans text-ink-700 mt-1 leading-snug">{f.qualifier}</p>
            <p className="text-sm font-sans text-ink-600 mt-2 leading-relaxed">
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
    <div className="divide-y divide-rule-strong border-t border-b border-rule">
      {figures.map(f => (
        <div key={f.id} className="grid sm:grid-cols-5 gap-2 sm:gap-8 py-5">
          <div className="sm:col-span-2">
            <p className="text-xs font-sans font-semibold text-ink-600 leading-tight">{f.label}</p>
          </div>
          <div className="sm:col-span-3">
            <p className="text-base font-display font-semibold text-ink-900 leading-snug">
              {f.value}
              <span className="font-sans font-normal text-ink-700"> — {f.qualifier}</span>
              {[f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean).map(k => (
                <SourceCitation key={k} sourceKey={k} />
              ))}
            </p>
            {f.detail && <p className="text-sm font-sans text-ink-600 mt-1 leading-snug">{f.detail}</p>}
            {copyable && <CopyKPIButton copyText={figureCopyText(f.id)} />}
          </div>
        </div>
      ))}
    </div>
  )
}
