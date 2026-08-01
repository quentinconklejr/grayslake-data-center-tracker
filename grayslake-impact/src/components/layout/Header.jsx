import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

const LEFT = [
  { to: '/',           label: 'Home',      end: true  },
  { to: '/tax-impact', label: 'Tax',       end: false },
  { to: '/jobs',       label: 'Jobs',      end: false },
  { to: '/energy',     label: 'Energy',    end: false },
]

const RIGHT = [
  { to: '/schools',   label: 'Schools',   end: false },
  { to: '/timeline',  label: 'Timeline',  end: false },
  { to: '/questions', label: 'Questions', end: false },
  { to: '/map',       label: 'Map',       end: false },
  { to: '/sources',   label: 'Sources',   end: false },
]

const ALL = [...LEFT, ...RIGHT]

function NavItem({ to, label, end, compact = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded font-medium transition-all duration-150 whitespace-nowrap ${
          compact
            ? 'px-2.5 py-1 text-sm'
            : 'px-3.5 py-2 text-base'
        } ${
          isActive
            ? 'text-blue-600 bg-blue-50 shadow-[inset_0_0_0_1px_rgba(2,132,199,0.18)]'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
      scrolled
        ? 'border-b border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)]'
        : 'border-b border-gray-100'
    }`}>
      {scrolled ? (
        /* ── Compact sticky bar ───────────────────────────────────────────── */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-12">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-5 h-5 rounded bg-blue-600/10 border border-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/15 transition-colors">
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                <rect x="1" y="6.5" width="2.2" height="4.5" rx="0.4" fill="#0284c7"/>
                <rect x="4.4" y="3.5" width="2.2" height="7.5" rx="0.4" fill="#0369a1"/>
                <rect x="7.8" y="5" width="2.2" height="6" rx="0.4" fill="#0369a1"/>
              </svg>
            </div>
            <span className="text-sm font-display font-bold text-gray-900 group-hover:text-gray-700 transition-colors whitespace-nowrap">
              Grayslake Data Center Tracker
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 justify-end">
            {ALL.map(l => <NavItem key={l.to} {...l} compact />)}
          </nav>
        </div>
      ) : (
        /* ── Full editorial header ────────────────────────────────────────── */
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-7">
          {/* Top nav row — left links */}
          <nav className="flex items-center justify-center gap-1 mb-5">
            {LEFT.map(l => <NavItem key={l.to} {...l} />)}
          </nav>

          {/* Site title */}
          <div className="text-center mb-5">
            <Link to="/" className="group inline-block" aria-label="Home — Grayslake Data Center Tracker">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-gray-900 tracking-tight leading-tight group-hover:text-gray-700 transition-colors">
                Grayslake Data Center Tracker
              </h1>
            </Link>
          </div>

          {/* Bottom nav row — right links */}
          <nav className="flex items-center justify-center gap-1">
            {RIGHT.map(l => <NavItem key={l.to} {...l} />)}
          </nav>
        </div>
      )}
    </header>
  )
}
