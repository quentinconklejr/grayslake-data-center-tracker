import { useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import KeyFigureList from '../components/ui/KeyFigureList'
import { keyFigures } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'
import Energy from './Energy'
import Jobs from './Jobs'
import TaxImpact from './TaxImpact'
import Schools from './Schools'

// Four topic pages merged into one. Each keeps its own footnote numbering, so
// citations stay local to the section they support. The old URLs redirect here
// and land on the matching anchor, so existing links keep working.
const SECTIONS = [
  { id: 'energy', label: 'Energy', Component: Energy },
  { id: 'jobs', label: 'Jobs', Component: Jobs },
  { id: 'tax', label: 'Tax', Component: TaxImpact },
  { id: 'schools', label: 'Schools', Component: Schools },
]

export default function Project() {
  const [active, setActive] = useState(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
    )
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <PageTitle {...pageMeta['/project']} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <FadeIn className="pb-8 border-b border-gray-200">
          <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.2em] mb-3">T5 @ Chicago IV</p>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">The Project</h1>
          <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
            What the approvals permit, what has been built, and what each figure actually rests on.
            Energy, employment, tax and school funding in one place, every number carrying the
            condition attached to it.
          </p>
          <p className="text-2xs font-mono text-gray-600 mt-3">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        <FadeIn className="py-8 border-b border-gray-200">
          <p className="text-2xs font-mono text-gray-600 uppercase tracking-widest mb-4">At a glance</p>
          <KeyFigureList figures={keyFigures} variant="cards" />
        </FadeIn>
      </div>

      {/* In-page nav — replaces four separate nav entries */}
      <nav
        aria-label="Sections of this page"
        className="sticky top-14 z-20 bg-white/95 backdrop-blur border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={`shrink-0 px-3 py-3 text-sm border-b-2 transition-colors ${
                active === id
                  ? 'border-blue-600 text-blue-700 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {SECTIONS.map(({ id, label, Component }) => (
        <section key={id} id={id} aria-label={label} className="scroll-mt-28 border-b border-gray-200 last:border-0">
          <Component asSection />
        </section>
      ))}
    </div>
  )
}
