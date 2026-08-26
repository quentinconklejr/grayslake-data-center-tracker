import SourceCitation from './SourceCitation'

/*
 * Small labelled figure used across pages for secondary metrics.
 *
 * Previously a bg-white + rounded-xl + border-t-4-colored-accent + shadow
 * card with a mono-uppercase kicker; now a rule-only records block
 * whose accent lives in the label and a thin top rule.
 */

const ACCENT = {
  blue:   'text-status-approval    border-status-approval',
  green:  'text-status-construction border-status-construction',
  amber:  'text-status-policy      border-status-policy',
  red:    'text-status-legal       border-status-legal',
  violet: 'text-status-development border-status-development',
}

export default function StatCard({ label, value, sub, badge, accent = 'blue', sourceKey }) {
  const [labelCls, borderCls] = (ACCENT[accent] ?? ACCENT.blue).split(/\s+/)

  return (
    <div className={`pt-3 pb-4 border-t-2 ${borderCls}`}>
      <p className={`text-xs font-sans font-semibold ${labelCls}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl sm:text-3xl font-display leading-tight tracking-tight text-ink-900 break-words">
        {value}{sourceKey && <SourceCitation sourceKey={sourceKey} />}
      </p>
      {sub && <p className="mt-1.5 text-sm font-sans text-ink-600 leading-snug">{sub}</p>}
      {badge && (
        <span className="mt-2 inline-block text-2xs font-sans font-semibold text-ink-500 uppercase tracking-wide">
          {badge}
        </span>
      )}
    </div>
  )
}
