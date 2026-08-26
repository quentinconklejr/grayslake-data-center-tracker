import { Link } from 'react-router-dom'
import ReportErrorLink from '../ui/ReportErrorLink'
import Container from './Container'
import { SITE_CONTACT, LAST_VERIFIED } from '../../data/siteConfig'
import { NAV_LINKS } from '../../data/navLinks'

const NAV = NAV_LINKS.filter(l => l.to !== '/')

/*
 * Colophon. What replaces the old dark three-column-plus-pill-badge
 * footer.
 *
 * A civic-records site should end the way a printed report ends —
 * masthead, imprint, sources, and a disclaimer — set in text on the
 * same paper ground as the body, separated by a rule. No dark surface,
 * no chip badge, no mono-uppercase kickers. The reading order is
 * top-to-bottom (title → description → maintainer → methodology →
 * index → utility links → affiliation disclaimer), so a screen reader
 * receives the same order the eye does.
 *
 * Every string of copy from the old footer is preserved unchanged.
 */
export default function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink-900 bg-paper text-ink-700">
      <Container size="wide" className="py-12 sm:py-14">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <div className="max-w-2xl">
          <p className="text-2xl font-display text-ink-900 tracking-tight leading-tight">
            Grayslake Data Center Tracker
          </p>
          <p className="mt-3 text-base font-sans text-ink-700 leading-relaxed">
            An independent civic data repository collecting public records, land deeds, and municipal hearing logs on T5 @ Chicago IV in Grayslake, Illinois.
          </p>
        </div>

        {/* ── Imprint ─────────────────────────────────────────────── */}
        <div className="mt-8 max-w-2xl space-y-1 text-sm font-sans text-ink-700 leading-relaxed">
          <p>
            Compiled and maintained by <span className="font-semibold text-ink-900">Quentin Conkle Jr.</span> &middot; Peterson Rd &amp; Route 83, Grayslake, IL 60030
          </p>
          <p>
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
            >
              {SITE_CONTACT.email}
            </a>
            <span className="text-ink-500"> &middot; Last verified <span className="font-mono">{LAST_VERIFIED}</span></span>
          </p>
          <p className="pt-1 text-xs font-display italic text-ink-500 tracking-wide">
            Independent civic reporting.
          </p>
        </div>

        {/* ── Methodology ─────────────────────────────────────────── */}
        <div className="mt-10 max-w-2xl">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
            Methodology
          </p>
          <p className="text-sm font-sans text-ink-700 leading-relaxed">
            All figures are verified against primary filings from Lake County GIS, ComEd utility records, and Village meeting archives. Conditional projections are explicitly labeled.
          </p>
        </div>

        {/* ── Index of pages ──────────────────────────────────────── */}
        <div className="mt-10">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-3">
            Pages
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-sans">
            {NAV.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-ink-700 hover:text-ink-900 underline underline-offset-4 decoration-rule-strong hover:decoration-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Utility links ───────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-sans">
          <Link
            to="/accessibility"
            className="text-ink-600 hover:text-ink-900 underline underline-offset-4 decoration-rule-strong hover:decoration-accent"
          >
            Accessibility
          </Link>
          <Link
            to="/privacy"
            className="text-ink-600 hover:text-ink-900 underline underline-offset-4 decoration-rule-strong hover:decoration-accent"
          >
            Privacy
          </Link>
          <ReportErrorLink className="text-ink-600 hover:text-ink-900 underline underline-offset-4 decoration-rule-strong hover:decoration-accent" />
        </div>

        {/* ── Affiliation disclaimer ──────────────────────────────── */}
        <p className="mt-10 pt-6 border-t border-rule-soft text-xs font-sans text-ink-500 leading-relaxed max-w-3xl">
          This project is an independent resident initiative and is not affiliated with T5 Data Centers, LLC or the Village of Grayslake. Every claim links to an archived public record or primary document. If a figure requires correction or a document is missing, please submit an update via the About page.
        </p>
      </Container>
    </footer>
  )
}
