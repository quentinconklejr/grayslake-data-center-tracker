import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../../data/navLinks'

// Maps route paths to human-readable breadcrumb labels.
// Kept separate from pageMeta so breadcrumbs always match the nav labels.
function NavLink_({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center text-sm font-medium whitespace-nowrap transition-colors duration-150 py-1.5 border-b-2 ${
          isActive
            ? 'text-blue-700 border-blue-600 font-semibold'
            : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function MobileNavLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block py-3 text-sm border-b border-edge-soft/50 last:border-0 transition-colors duration-150 ${
          isActive ? 'text-blue-700 font-semibold' : 'text-gray-500 hover:text-gray-900 font-medium'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function TrackerIcon() {
  return (
    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
      <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none" aria-hidden="true">
        <rect x="1.5" y="7.5" width="2.5" height="5" rx="0.5" fill="white"/>
        <rect x="5.5" y="4.5" width="2.5" height="8" rx="0.5" fill="white"/>
        <rect x="9.5" y="6" width="2.5" height="6.5" rx="0.5" fill="white"/>
        <path d="M3 5.5L7 2.5L11 4" stroke="white" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
      </svg>
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()


  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 bg-white/97 backdrop-blur-sm border-b transition-all duration-200 ${
      scrolled ? 'border-blue-200/50 shadow-glass-md' : 'border-gray-100'
    }`}>

      {/* ── Main bar ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center py-3.5 gap-3 sm:gap-6">

        <Link to="/" className="shrink-0 flex items-center gap-2.5 group" aria-label="Grayslake Data Center Tracker, Home">
          <TrackerIcon />
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight whitespace-nowrap tracking-tight">
              Grayslake Data Center Tracker
            </span>
            <span className="hidden sm:block text-2xs font-mono text-gray-400 leading-tight mt-0.5 whitespace-nowrap">
              Not affiliated with T5 or the Village
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-end"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(l => <NavLink_ key={l.to} {...l} />)}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden ml-auto text-gray-500 hover:text-gray-800 transition-colors p-2.5 -mr-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          )}
        </button>

      </div>


      {/* ── Mobile menu ──────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-gray-100 bg-white/98 overflow-y-auto max-h-[calc(100dvh-4rem)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-2">
            {NAV_LINKS.map(l => <MobileNavLink key={l.to} {...l} />)}
          </div>
        </div>
      )}

    </header>
  )
}
