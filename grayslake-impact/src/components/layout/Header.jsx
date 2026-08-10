import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_STORY, NAV_TOOLS, NAV_META } from '../../data/navLinks'

function NavLink_({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center whitespace-nowrap transition-colors duration-150 py-1.5 border-b-2 text-sm ${
          isActive 
            ? 'text-sky-700 border-sky-600 font-bold' 
            : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300 font-medium'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function MobileNavLink({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `block py-2.5 px-3 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-sky-50 text-sky-800 font-bold'
            : 'text-slate-700 hover:bg-slate-50 font-medium'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function TrackerLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center shrink-0 shadow-sm">
      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="16" width="4" height="10" rx="1" fill="#0284c7" />
        <rect x="12" y="10" width="4" height="16" rx="1" fill="#38bdf8" />
        <rect x="18" y="13" width="4" height="13" rx="1" fill="#0ea5e9" />
        <rect x="24" y="18" width="2.5" height="8" rx="0.75" fill="#7dd3fc" />
        <rect x="5" y="27" width="22" height="1" rx="0.5" fill="#475569" />
      </svg>
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const toggleRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // The mobile menu had no Escape key and no focus return. On a phone, which
  // is how most people open this, a keyboard or screen reader user opened it
  // and tabbed straight past it into the page behind, unable to dismiss it.
  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMobileOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = [toggleRef.current, ...(menuRef.current?.querySelectorAll('a[href], button:not([disabled])') ?? [])].filter(Boolean)
      if (focusable.length < 2) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-slate-200 transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 w-full overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 pr-2">
          <TrackerLogo />
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-slate-900 text-base sm:text-lg tracking-tight truncate">
              Grayslake Data Center Tracker
            </span>
            <span className="text-2xs font-mono text-slate-500 truncate hidden sm:block">
              Not affiliated with T5 or the Village
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 shrink-0">
          {NAV_STORY.map(l => (
            <NavLink_ key={l.to} to={l.to} label={l.label} end={l.end} />
          ))}
          <span className="h-4 w-px bg-slate-200" />
          {NAV_TOOLS.map(l => (
            <NavLink_ key={l.to} to={l.to} label={l.label} end={l.end} />
          ))}
          <span className="h-4 w-px bg-slate-200" />
          {NAV_META.map(l => (
            <NavLink_ key={l.to} to={l.to} label={l.label} end={l.end} />
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          ref={toggleRef}
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none shrink-0 min-h-[44px] min-w-[44px]"
        >
          {mobileOpen ? (
            <span className="text-xl font-bold font-mono">×</span>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div ref={menuRef} className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">
          {NAV_STORY.map(l => (
            <MobileNavLink key={l.to} to={l.to} label={l.label} end={l.end} onClick={() => setMobileOpen(false)} />
          ))}
          {NAV_TOOLS.map(l => (
            <MobileNavLink key={l.to} to={l.to} label={l.label} end={l.end} onClick={() => setMobileOpen(false)} />
          ))}
          {NAV_META.map(l => (
            <MobileNavLink key={l.to} to={l.to} label={l.label} end={l.end} onClick={() => setMobileOpen(false)} />
          ))}
        </div>
      )}
    </header>
  )
}
