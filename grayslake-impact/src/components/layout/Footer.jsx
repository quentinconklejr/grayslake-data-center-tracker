import { Link } from 'react-router-dom'
import ReportErrorLink from '../ui/ReportErrorLink'
import { SITE_CONTACT } from '../../data/siteConfig'
import { NAV_LINKS } from '../../data/navLinks'

const NAV = NAV_LINKS.filter(l => l.to !== '/')

const FOOTER_LINKS = [
  { to: '/about',                         label: 'About',   external: false },
  { to: `mailto:${SITE_CONTACT.email}`,  label: 'Contact', external: true  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-24 bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand & Overview */}
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
              <span className="text-base font-bold text-white tracking-tight">Grayslake Data Center Tracker</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              An independent civic data repository collecting public records, land deeds, and municipal hearing logs on T5 @ Chicago IV in Grayslake, Illinois.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              INDEPENDENT CIVIC REPORTING
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold mb-3">Pages</p>
            <div className="grid grid-cols-2 gap-1.5">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="inline-flex items-center text-sm text-slate-300 hover:text-white transition-colors duration-150 py-1.5 font-medium"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Editorial Data Standard & Methodology */}
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold mb-3">Methodology</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              All figures are verified against primary filings from Lake County GIS, ComEd utility records, and Village meeting archives. Conditional projections are explicitly labeled.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link to="/accessibility" className="text-sm text-slate-300 hover:text-white underline underline-offset-4 transition-colors font-medium">
                Accessibility
              </Link>
              <Link to="/privacy" className="text-sm text-slate-300 hover:text-white underline underline-offset-4 transition-colors font-medium">
                Privacy
              </Link>
              <ReportErrorLink className="text-sm text-slate-300 hover:text-white underline underline-offset-4 transition-colors font-medium" />
            </div>
          </div>
        </div>

        {/* Creator Attribution */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-slate-400 font-medium">
            Compiled and maintained by Quentin Conkle Jr. · Peterson Rd &amp; Route 83, Grayslake, IL 60030
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LINKS.map(({ to, label, external }) =>
              external ? (
                <a
                  key={to}
                  href={to}
                  className="text-sm font-mono font-medium text-slate-300 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-mono font-medium text-slate-300 hover:text-white transition-colors duration-150"
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </div>

      </div>

      {/* Disclaimers & Institutional Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-6">
          This project is an independent resident initiative and is not affiliated with T5 Data Centers, LLC or the Village of Grayslake. Every claim links to an archived public record or primary document. If a figure requires correction or a document is missing, please submit an update via the About page.
        </p>
      </div>
    </footer>
  )
}
