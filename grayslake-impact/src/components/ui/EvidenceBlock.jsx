import SourceCitation from './SourceCitation'

export const EVIDENCE = {
  stated: {
    border:  'border-emerald-400',
    bg:      'bg-emerald-50/40',
    labelCls: 'text-emerald-700',
    tag:     'Stated',
    desc:    'Publicly stated by officials or the developer',
    icon: (
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="5" />
        <path d="M3.5 6l1.5 1.5 2.5-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  disputed: {
    border:  'border-amber-400',
    bg:      'bg-amber-50/60',
    labelCls: 'text-amber-700',
    tag:     'Disputed',
    desc:    'Contested by critics, advocates, or independent research',
    icon: (
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 1.5l4.5 8H1.5L6 1.5z" strokeLinejoin="round" />
        <path d="M6 5v2M6 8.5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  unknown: {
    border:  'border-gray-200',
    bg:      'bg-gray-50',
    labelCls: 'text-gray-400',
    tag:     'Not Yet Public',
    desc:    'Genuinely unanswered — no public document covers this',
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
    <div className={`pl-4 border-l-2 ${s.border} ${s.bg} rounded-r py-3 pr-3 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={s.labelCls}>{s.icon}</span>
        <p className={`text-2xs font-mono uppercase tracking-widest font-semibold ${s.labelCls}`}>{s.tag}</p>
        {desc && (
          <>
            <span aria-hidden="true" className="text-2xs text-gray-300">·</span>
            <p className="text-xs text-gray-500">{desc}</p>
          </>
        )}
        {sourceKey && <SourceCitation sourceKey={sourceKey} />}
      </div>
      {title && (
        <p className={`text-sm font-display font-semibold mb-1.5 ${type === 'disputed' ? 'text-amber-900' : type === 'unknown' ? 'text-gray-500' : 'text-gray-800'}`}>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}
