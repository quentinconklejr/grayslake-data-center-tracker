export default function EnterpriseLeadBanner() {
  return (
    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
      <div className="text-2xs font-mono font-bold uppercase tracking-wider text-sky-800">
        RESEARCH ALERTS & RSS FEED
      </div>
      <h3 className="text-base font-bold text-slate-900">
        Subscribe to Document Updates & Deed Records
      </h3>
      <p className="text-xs font-sans text-slate-600 leading-relaxed max-w-xl">
        Get automated updates whenever new Lake County GIS parcel deeds, Village Board meeting transcripts, or court filings are published.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <a
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-white bg-sky-800 hover:bg-sky-900 px-3.5 py-2 rounded-lg transition-colors"
        >
          Subscribe via RSS Feed ↗
        </a>
        <a
          href="mailto:qconkle2@illinois.edu?subject=Subscribe%20to%20Grayslake%20Data%20Center%20Updates"
          className="text-xs font-mono font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-300 transition-colors"
        >
          Request Email Updates
        </a>
      </div>
    </div>
  )
}
