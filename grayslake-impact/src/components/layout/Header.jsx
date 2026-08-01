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
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-6 h-6 rounded bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600/15 transition-colors">
              <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none">
                <rect x="1" y="6.5" width="2.2" height="4.5" rx="0.4" fill="#0284c7"/>
                <rect x="4.4" y="3.5" width="2.2" height="7.5" rx="0.4" fill="#0369a1"/>
                <rect x="7.8" y="5" width="2.2" height="6" rx="0.4" fill="#0369a1"/>
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-sm font-display font-semibold text-gray-900 group-hover:text-gray-700 transition-colors block">
                Grayslake Data Center Tracker
              </span>
              <span className="text-2xs font-mono text-gray-400 hidden md:block tracking-wide mt-0.5">
                Tracking T5 @ Chicago IV · Grayslake, IL · Lake County
              </span>
            </div>
          </Link>

          <Nav />
        </div>
      </div>
    </header>
  )
}
