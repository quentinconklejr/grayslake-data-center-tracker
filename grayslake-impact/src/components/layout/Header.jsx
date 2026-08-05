import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_LINKS, GUIDE_LINKS } from '../../data/navLinks'

function NavLink_({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
          isActive
            ? 'text-gray-900'
            : 'text-gray-500 hover:text-gray-800'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function GuidesDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const location = useLocation()
  const isAnyActive = GUIDE_LINKS.some(l => location.pathname === l.to)

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('button')?.focus()
      }
    }
    function onMouse(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouse)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouse)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="guides-menu"
        className={`text-xs font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1 ${
          isAnyActive || open ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        Guides
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          id="guides-menu"
          role="menu"
          className="absolute right-0 top-full mt-2 w-40 bg-white/98 backdrop-blur-sm border border-gray-200 rounded-lg shadow-glass-md py-1.5 z-50"
        >
          {GUIDE_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              role="menuitem"
              className={({ isActive }) =>
                `block px-4 py-2 text-xs font-medium transition-colors duration-100 ${
                  isActive
                    ? 'text-gray-900 bg-gray-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function MobileNavLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block py-3 text-sm border-b border-gray-100 last:border-0 transition-colors duration-150 ${
          isActive ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800 font-medium'
        }`
      }
    >
      {label}
    </NavLink>
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
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b transition-all duration-200 ${
      scrolled ? 'border-gray-200 shadow-glass' : 'border-gray-100'
    }`}>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center py-3.5 gap-4 sm:gap-8">

        <Link to="/" className="shrink-0 flex flex-col group">
          <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-tight whitespace-nowrap tracking-tight">
            Grayslake Data Center Tracker
          </span>
          <span className="hidden sm:block text-2xs font-mono text-gray-400 leading-tight mt-0.5">
            An independent public-records project · Not affiliated with T5 or the Village
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3 flex-1 justify-end flex-wrap">
          {NAV_LINKS.map(l => <NavLink_ key={l.to} {...l} />)}
          <GuidesDropdown />
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto text-gray-400 hover:text-gray-700 transition-colors p-1 -mr-1"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/98 overflow-y-auto max-h-[calc(100dvh-4rem)]">
          {/* Primary topic links */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-2">
            {NAV_LINKS.map(l => <MobileNavLink key={l.to} {...l} />)}
          </div>

          {/* Guides section — visually distinct group */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-3">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-1 pb-0.5">
                Guides
              </p>
              {GUIDE_LINKS.map(l => <MobileNavLink key={l.to} {...l} />)}
            </div>
          </div>
        </div>
      )}

    </header>
  )
}
