import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_STORY, NAV_TOOLS, NAV_META } from '../../data/navLinks'

function NavLink_({ to, label, end, tone = 'story' }) {
  const idle =
    tone === 'tool'
      ? 'text-slate-600 border-transparent hover:text-blue-600 hover:border-slate-300 font-medium'
      : 'text-slate-800 border-transparent hover:text-blue-600 hover:border-slate-300 font-semibold'
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center whitespace-nowrap transition-all duration-150 py-1.5 border-b-2 ${
          tone === 'tool' ? 'text-sm' : 'text-base'
        } ${isActive ? 'text-blue-600 border-blue-600 font-bold' : idle}`
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
        `block py-3 text-base border-b border-slate-100 last:border-0 transition-colors duration-150 ${
          isActive ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-slate-900 font-medium'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function TrackerIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
      <svg viewBox="0 0 14 14" className="w-4.5 h-4.5" fill="none" aria-hidden="true">
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
    <header className={`sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b transition-all duration-200 ${
      scrolled ? 'border-slate-200 shadow-sm' : 'border-slate-100'
    }`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center py-3.5 gap-3 sm:gap-6">

        {/* Brand Section */}
        <Link to="/" className="flex items-center gap-3 min-w-0 group" aria-label="Grayslake Data Center Tracker, Home">
          <TrackerIcon />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="text-lg sm:text-2xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-[1.15] sm:leading-tight sm:whitespace-nowrap tracking-tight">
                Grayslake<br className="sm:hidden" /> Data Center Tracker
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200/90">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VERIFIED PUBLIC RECORD
              </span>
            </div>
            <span className="hidden sm:block text-xs font-mono text-slate-500 leading-tight mt-0.5 whitespace-nowrap">
              Independent Civic Research · Peterson Rd & Route 83, Grayslake, IL
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-end"
          aria-label="Main navigation"
        >
          {NAV_STORY.map(l => <NavLink_ key={l.to} {...l} />)}

          <span className="w-px h-5 bg-slate-200 shrink-0" aria-hidden="true" />

          {NAV_TOOLS.map(l => <NavLink_ key={l.to} {...l} tone="tool" />)}

          <span className="w-px h-5 bg-slate-200 shrink-0" aria-hidden="true" />

          {NAV_META.map(l => <NavLink_ key={l.to} {...l} tone="tool" />)}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden ml-auto shrink-0 text-slate-700 hover:text-slate-900 transition-colors p-2.5 -mr-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          )}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-slate-100 bg-white/98 overflow-y-auto max-h-[calc(100dvh-5.5rem)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-3">
            {[NAV_STORY, NAV_TOOLS, NAV_META].map((group, i) => (
              <div key={i} className={i > 0 ? 'border-t border-slate-100 mt-1 pt-1' : undefined}>
                {group.map(l => <MobileNavLink key={l.to} {...l} />)}
              </div>
            ))}
          </div>
        </div>
      )}

    </header>
  )
}
