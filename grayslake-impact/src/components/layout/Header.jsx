import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from './Nav'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/70 shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            {/* Logo mark */}
            <div className="w-6 h-6 rounded bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none">
                <rect x="1" y="6.5" width="2.2" height="4.5" rx="0.4" fill="#38bdf8"/>
                <rect x="4.4" y="3.5" width="2.2" height="7.5" rx="0.4" fill="#0ea5e9"/>
                <rect x="7.8" y="5" width="2.2" height="6" rx="0.4" fill="#0284c7"/>
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-sm font-display font-semibold text-gray-100 group-hover:text-white transition-colors">
                T5 Chicago IV
              </span>
              <span className="ml-2 text-2xs font-mono text-gray-600 hidden md:inline tracking-widest uppercase">
                Impact
              </span>
            </div>
          </Link>

          <Nav />
        </div>
      </div>
    </header>
  )
}
