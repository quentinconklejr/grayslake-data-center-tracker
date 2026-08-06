import { Link } from 'react-router-dom'
import { SITE_CONTACT } from '../../data/siteConfig'
import { NAV_LINKS } from '../../data/navLinks'

const NAV = NAV_LINKS.filter(l => l.to !== '/')

const FOOTER_LINKS = [
  { to: '/about',                        label: 'About',   external: false },
  { to: `mailto:${SITE_CONTACT.email}`,  label: 'Contact', external: true  },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none" aria-hidden="true">
                  <rect x="1.5" y="7.5" width="2.5" height="5" rx="0.5" fill="white"/>
                  <rect x="5.5" y="4.5" width="2.5" height="8" rx="0.5" fill="white"/>
                  <rect x="9.5" y="6" width="2.5" height="6.5" rx="0.5" fill="white"/>
                  <path d="M3 5.5L7 2.5L11 4" stroke="white" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">Grayslake Data Center Tracker</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              An independent tracker collecting public records and press coverage
              on T5 @ Chicago IV &mdash; a hyperscale data center under construction
              in Grayslake, Illinois.
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
                  className="inline-flex items-center text-xs text-gray-300 hover:text-white transition-colors duration-150 py-1.5"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div>
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-3">Methodology</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              All data is sourced from public filings, Village records, and press
              coverage. Projections are labeled; only figures traceable to a primary source
              are presented as facts.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-2xs font-mono text-gray-400">
            Compiled by Quentin Conkle Jr. · Peterson Rd &amp; Route 83, Grayslake, IL 60030
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LINKS.map(({ to, label, external }) =>
              external ? (
                <a
                  key={to}
                  href={to}
                  className="text-xs font-mono text-gray-300 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className="text-xs font-mono text-gray-300 hover:text-white transition-colors duration-150"
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-700 pt-6">
          This site is not affiliated with T5 Data Centers, LLC or the Village of Grayslake. It is an
          independent, resident-built resource. Every claim links to a public source; figures that are
          conditional or contested are labelled as such. If a figure is wrong or a document is missing,
          please get in touch via the About page.
        </p>
      </div>
    </footer>
  )
}
