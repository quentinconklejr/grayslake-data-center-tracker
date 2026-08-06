import { Link } from 'react-router-dom'
import { SITE_CONTACT } from '../../data/siteConfig'
import { NAV_LINKS } from '../../data/navLinks'

const NAV = NAV_LINKS.filter(l => l.to !== '/')

const FOOTER_LINKS = [
  { to: '/about',                       label: 'About',   external: false },
  { to: `mailto:${SITE_CONTACT.email}`, label: 'Contact', external: true  },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                  <rect x="1" y="6.5" width="2.2" height="4.5" rx="0.4" fill="#2563eb"/>
                  <rect x="4.4" y="3.5" width="2.2" height="7.5" rx="0.4" fill="#1d4ed8"/>
                  <rect x="7.8" y="5" width="2.2" height="6" rx="0.4" fill="#1d4ed8"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800 tracking-tight">Grayslake Data Center Tracker</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A civic data tool tracking the fiscal, employment, energy, and environmental
              impacts of T5 @ Chicago IV — the hyperscale AI data center campus under
              development in Grayslake, Illinois.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-3">Pages</p>
            <div className="grid grid-cols-2 gap-1.5">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="inline-flex items-center text-xs text-gray-500 hover:text-gray-800 transition-colors duration-150 py-1.5"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-3">Methodology</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              All data is sourced from public filings, Village records, and verified press
              coverage. Projections are labeled; only figures traceable to a primary source
              are presented as facts.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-2xs font-mono text-gray-400">
            Compiled by Quentin Conkle Jr. · Peterson Rd &amp; Route 83, Grayslake, IL 60030
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LINKS.map(({ to, label, external }) =>
              external ? (
                <a
                  key={to}
                  href={to}
                  className="text-2xs font-mono text-gray-400 hover:text-gray-700 transition-colors duration-150"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className="text-2xs font-mono text-gray-400 hover:text-gray-700 transition-colors duration-150"
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-200 pt-6">
          This site is not affiliated with T5 Data Centers, LLC or the Village of Grayslake. It is an
          independent, resident-built resource. Every claim links to a public source; figures that are
          conditional or contested are labelled as such. If a figure is wrong or a document is missing,
          please get in touch via the About page.
        </p>
      </div>
    </footer>
  )
}
