import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Container from './Container'
import { NAV_STORY, NAV_TOOLS, NAV_META } from '../../data/navLinks'

function NavLink_({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center whitespace-nowrap py-1.5 border-b-2 text-sm font-sans transition-colors duration-150 ${
          isActive
            ? 'text-ink-900 border-accent font-semibold'
            : 'text-ink-700 border-transparent hover:text-ink-900 hover:border-rule'
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
        `block py-2.5 px-3 text-sm font-sans transition-colors ${
          isActive
            ? 'text-ink-900 font-semibold bg-accent-soft'
            : 'text-ink-700 hover:bg-paper-sunk'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

/*
 * Small masthead mark. Simple bar chart in the accent hue rather than
 * the old sky-gradient tile — reads as a records mark, not a product
 * icon.
 */
function TrackerLogo() {
  return (
    <div className="w-7 h-7 flex items-center justify-center shrink-0" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <rect x="3"  y="14" width="3" height="7"  fill="#1e3a5f" />
        <rect x="8"  y="9"  width="3" height="12" fill="#1e3a5f" />
        <rect x="13" y="11" width="3" height="10" fill="#1e3a5f" />
        <rect x="18" y="6"  width="3" height="15" fill="#1e3a5f" />
        <line x1="2" y1="21.5" x2="22" y2="21.5" stroke="#14110f" strokeWidth="1" />
      </svg>
    </div>
  )
}

export default function Header() {
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

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-rule">
      <Container size="wide" className="flex items-center justify-between h-16 overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 pr-2">
          <TrackerLogo />
          <div className="flex flex-col min-w-0">
            <span className="font-display text-ink-900 text-base sm:text-lg leading-tight tracking-tight truncate">
              Grayslake Data Center Tracker
            </span>
            <span className="text-2xs font-sans italic text-ink-500 truncate hidden sm:block">
              Not affiliated with T5 or the Village
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0" aria-label="Primary">
          {NAV_STORY.map(l => (
            <NavLink_ key={l.to} to={l.to} label={l.label} end={l.end} />
          ))}
          <span aria-hidden="true" className="h-4 w-px bg-rule" />
          {NAV_TOOLS.map(l => (
            <NavLink_ key={l.to} to={l.to} label={l.label} end={l.end} />
          ))}
          <span aria-hidden="true" className="h-4 w-px bg-rule" />
          {NAV_META.map(l => (
            <NavLink_ key={l.to} to={l.to} label={l.label} end={l.end} />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          ref={toggleRef}
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="lg:hidden flex items-center justify-center p-2 text-ink-700 hover:text-ink-900 hover:bg-paper-sunk shrink-0 min-h-[44px] min-w-[44px]"
        >
          {mobileOpen ? (
            <span aria-hidden="true" className="text-xl font-mono">×</span>
          ) : (
            <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </Container>

      {mobileOpen && (
        <div ref={menuRef} className="lg:hidden bg-paper border-b border-rule px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
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
