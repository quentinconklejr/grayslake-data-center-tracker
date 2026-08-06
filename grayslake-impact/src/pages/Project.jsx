import { useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import BackToTop from '../components/ui/BackToTop'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import KeyFigureList from '../components/ui/KeyFigureList'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { keyFigures } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'
import Energy from './Energy'
import Jobs from './Jobs'
import TaxImpact from './TaxImpact'
import Schools from './Schools'

// Four topic pages merged into one. Each keeps its own footnote numbering, so
// citations stay local to the section they support. The old URLs redirect here
// and land on the matching anchor, so existing links keep working.
// Every source the At a Glance grid cites, in the order the cards render, so
// footnote numbers are stable rather than assigned by whichever card mounts first.
const GLANCE_KEYS = []
for (const f of keyFigures) {
  for (const k of [f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean)) {
    if (!GLANCE_KEYS.includes(k)) GLANCE_KEYS.push(k)
  }
}

const GLANCE_GROUPS = [
  { id: 'hero',     ids: ['jobs-permanent', 'investment'],                                        cols: 'sm:grid-cols-2',  hero: true },
  { id: 'land',     label: 'Land',              ids: ['acres-owned', 'acres-approved', 'acres-controlled'], cols: 'sm:grid-cols-3' },
  { id: 'power',    label: 'Power & Scale',     ids: ['capacity-comed', 'buildable-area'],        cols: 'sm:grid-cols-2' },
  { id: 'timeline', label: 'Timeline & Status', ids: ['buildout', 'buildings', 'wetlands'],       cols: 'sm:grid-cols-3' },
  { id: 'water',    label: 'Water',             ids: ['water', 'water-flush'],                    cols: 'sm:grid-cols-2' },
]

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
          <p className="text-xs font-mono text-blue-700 uppercase tracking-[0.2em] mb-3">T5 @ Chicago IV</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight mb-4">The Project</h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed mb-2">
            An $8.5–18B campus under construction, one of the largest data centers proposed anywhere in the U.S.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Energy draw, permanent jobs, developer fees, and school funding. Every figure carries the
            condition attached to it, linked to its source.
          </p>
          <p className="text-xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* Its own footnote scope. The four sections below each carry their own
            FootnoteProvider, but this grid sat outside all of them, so every
            SourceCitation in it resolved to a null footnote number and rendered
            as an empty [] linking to #fn-null. */}
        <FootnoteProvider preload={GLANCE_KEYS}>
          <FadeIn className="py-8 border-b border-gray-200">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">At a glance</p>
            <KeyFigureList figures={keyFigures} variant="grouped" groups={GLANCE_GROUPS} />
            <FootnoteList />
          </FadeIn>
        </FootnoteProvider>
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
              className={`shrink-0 px-3 py-3 text-sm border-b-2 transition-colors font-medium ${
                active === id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
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
      <PageNext
        to="/timeline"
        label="Event Timeline"
        desc="Every approval, lawsuit, construction event, and opposition milestone, sourced and in order."
        color="text-cyan-700"
        hoverBorder="hover:border-cyan-300"
      />
      <BackToTop />
    </div>
  )
}
