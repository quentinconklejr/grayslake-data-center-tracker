import SourceCitation from './SourceCitation'

/*
 * Left-rule callout for classifying claims by evidentiary status.
 * Three variants: stated (publicly asserted), disputed (contested),
 * and unknown (no public document exists).
 *
 * Non-color-only encoding is preserved — each variant also carries a
 * text tag ("Stated" / "Disputed" / "Not Yet Public") and a small
 * icon. Colours are pulled to the semantic status tokens so they
 * harmonize with the timeline categories, map, and other status
 * indicators across the site.
 */

export const EVIDENCE = {
  stated: {
    border:   'border-status-stated',
    bg:       'bg-status-stated-soft',
    labelCls: 'text-status-stated',
    titleCls: 'text-ink-800',
    tag:      'Stated',
    desc:     'Publicly stated by officials or the developer',
    icon: (
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="5" />
        <path d="M3.5 6l1.5 1.5 2.5-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  disputed: {
    border:   'border-status-disputed',
    bg:       'bg-status-disputed-soft',
    labelCls: 'text-status-disputed',
    titleCls: 'text-ink-900',
    tag:      'Disputed',
    desc:     'Contested by critics, advocates, or independent researchers',
    icon: (
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 1.5l4.5 8H1.5L6 1.5z" strokeLinejoin="round" />
        <path d="M6 5v2M6 8.5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  unknown: {
    border:   'border-status-unknown',
    bg:       'bg-status-unknown-soft',
    labelCls: 'text-status-unknown',
    titleCls: 'text-ink-600',
    tag:      'Not Yet Public',
    desc:     'Genuinely unanswered. No public document covers this',
    icon: (
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="5" />
        <path d="M4.5 4.5a1.5 1.5 0 013 0c0 1-1.5 1.5-1.5 2.5" strokeLinecap="round" />
        <path d="M6 8.5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
}

export default function EvidenceBlock({ type = 'stated', title, desc, sourceKey, children, className = '' }) {
  const s = EVIDENCE[type] ?? EVIDENCE.stated
  return (
    <div className={`pl-4 border-l-[3px] ${s.border} ${s.bg} py-3 pr-4 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={s.labelCls}>{s.icon}</span>
        <p className={`text-2xs font-sans font-semibold uppercase tracking-wide ${s.labelCls}`}>{s.tag}</p>
        {desc && (
          <>
            <span aria-hidden="true" className="text-ink-400">·</span>
            <p className="text-xs font-sans text-ink-500">{desc}</p>
          </>
        )}
        {sourceKey && <SourceCitation sourceKey={sourceKey} />}
      </div>
      {title && (
        <p className={`text-base font-display font-semibold leading-snug mb-1.5 ${s.titleCls}`}>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}
