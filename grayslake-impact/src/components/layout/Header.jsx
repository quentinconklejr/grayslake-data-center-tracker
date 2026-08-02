import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/',           label: 'Home',      end: true  },
  { to: '/tax-impact', label: 'Tax',       end: false },
  { to: '/jobs',       label: 'Jobs',      end: false },
  { to: '/energy',     label: 'Energy',    end: false },
  { to: '/schools',    label: 'Schools',   end: false },
  { to: '/timeline',   label: 'Timeline',  end: false },
  { to: '/questions',  label: 'Questions', end: false },
  { to: '/map',        label: 'Map',       end: false },
  { to: '/sources',    label: 'Sources',   end: false },
  { to: '/about',      label: 'About',     end: false },
]

function NavLink_({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `text-xs whitespace-nowrap transition-colors duration-100 ${
          isActive ? 'text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-700 font-normal'
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
        `block py-2.5 text-sm border-b border-gray-50 last:border-0 transition-colors duration-100 ${
          isActive ? 'text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-700 font-normal'
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
    <header className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200 ${
      scrolled ? 'border-gray-200 shadow-sm' : 'border-gray-100'
    }`}>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-6 flex items-center py-3 gap-8">

        <Link to="/" className="shrink-0 flex flex-col group">
          <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-tight whitespace-nowrap">
            Grayslake Data Center Tracker
          </span>
          <span className="hidden sm:block text-2xs font-mono text-gray-400 leading-tight mt-0.5">
            An independent public-records project · Not affiliated with T5 or the Village of Grayslake
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 flex-1 justify-end">
          {NAV.map(l => <NavLink_ key={l.to} {...l} />)}
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
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-7xl mx-auto px-6 py-1">
            {NAV.map(l => <MobileNavLink key={l.to} {...l} />)}
          </nav>
        </div>
      )}

    </header>
  )
}
