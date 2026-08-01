import { Link } from 'react-router-dom'

const NAV = [
  { to: '/tax-impact', label: 'Tax Impact' },
  { to: '/jobs',       label: 'Jobs' },
  { to: '/energy',     label: 'Energy' },
  { to: '/schools',    label: 'Schools' },
  { to: '/timeline',   label: 'Timeline' },
  { to: '/map',        label: 'Map' },
  { to: '/sources',    label: 'Sources' },
]

const FOOTER_LINKS = [
  { to: '/about',                        label: 'About',   external: false },
  { to: 'mailto:walterjr.quentin@gmail.com', label: 'Contact', external: true },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/60 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                  <rect x="1" y="6.5" width="2.2" height="4.5" rx="0.4" fill="#38bdf8"/>
                  <rect x="4.4" y="3.5" width="2.2" height="7.5" rx="0.4" fill="#0ea5e9"/>
                  <rect x="7.8" y="5" width="2.2" height="6" rx="0.4" fill="#0284c7"/>
                </svg>
              </div>
              <span className="text-sm font-display font-semibold text-gray-300">Grayslake Data Center Tracker</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A civic data tool tracking the fiscal, employment, energy, and environmental
              impacts of T5 @ Chicago IV — the hyperscale AI data center campus under
              development in Grayslake, Illinois.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-3">Pages</p>
            <div className="grid grid-cols-2 gap-1.5">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div>
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-3">Methodology</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              All data is sourced from public filings, Village records, court documents, and
              verified press coverage. Projections are labeled; only figures traceable to a
              primary source are presented as facts.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800/60 pt-6 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-2xs font-mono text-gray-500">
            Peterson Rd & Route 83 · Grayslake, IL 60030 · Lake County
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LINKS.map(({ to, label, external }) =>
              external ? (
                <a
                  key={to}
                  href={to}
                  className="text-2xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className="text-2xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </div>

      </div>
    </footer>
  )
}
