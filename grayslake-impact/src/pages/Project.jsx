import { useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import BackToTop from '../components/ui/BackToTop'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import KeyFigureList from '../components/ui/KeyFigureList'
import Reveal from '../components/ui/Reveal'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { keyFigures, figureById } from '../data/keyFigures'
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
  { id: 'energy',  label: 'Energy',  Component: Energy,
    figure: 'capacity-comed', blurb: 'What the campus draws, who pays for the grid, and what is still unfiled.',
    accent: 'amber' },
  { id: 'jobs',    label: 'Jobs',    Component: Jobs,
    figure: 'jobs-permanent', blurb: 'Three different headcounts, and the condition attached to the largest.',
    accent: 'emerald' },
  { id: 'tax',     label: 'Tax',     Component: TaxImpact,
    figure: 'investment',    blurb: 'Developer fees, the eight taxing districts, and what nobody has projected.',
    accent: 'blue' },
  { id: 'schools', label: 'Schools', Component: Schools,
    figure: 'buildable-area', blurb: 'What the DeKalb precedent does and does not tell us about District 127.',
    accent: 'violet' },
]

const ACCENT_RING = {
  amber:   'hover:border-amber-400 focus-visible:border-amber-500',
  emerald: 'hover:border-emerald-400 focus-visible:border-emerald-500',
  blue:    'hover:border-blue-400 focus-visible:border-blue-500',
  violet:  'hover:border-violet-400 focus-visible:border-violet-500',
}
const ACCENT_TEXT = {
  amber: 'text-amber-700', emerald: 'text-emerald-700', blue: 'text-blue-700', violet: 'text-violet-700',
}

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
        <FadeIn className="pb-8 border-b border-edge-soft">
          <p className="text-xs font-mono text-blue-700 uppercase tracking-[0.18em] mb-4">T5 @ Chicago IV</p>
          <h1 className="text-5xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight mb-4">The Project</h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed mb-2">
            An $8.5–18B campus under construction, one of the largest data centers proposed anywhere in the U.S.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Energy draw, permanent jobs, developer fees, and school funding. Every figure carries the
            condition attached to it, linked to its source.
          </p>
          <p className="text-xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* Four jump cards. Previously twelve figures in five groups sat here,
            which meant scrolling a long way before reaching any actual section. */}
        <Reveal className="py-9">
          <p className="text-2xs font-mono text-gray-600 uppercase tracking-[0.15em] mb-5">Four areas of impact</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECTIONS.map(({ id, label, figure, blurb, accent }) => {
              const f = figureById[figure]
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`group block rounded-xl border-2 border-edge bg-white px-5 py-5 transition-colors ${ACCENT_RING[accent]}`}
                >
                  <p className={`text-2xs font-mono uppercase tracking-[0.15em] mb-3 ${ACCENT_TEXT[accent]}`}>{label}</p>
                  <p className="text-2xl font-display font-bold text-gray-900 leading-tight mb-1">{f?.value}</p>
                  <p className="text-xs text-gray-600 leading-snug mb-3">{f?.qualifier}</p>
                  <p className="text-sm text-gray-700 leading-snug">{blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                    Read this section
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              )
            })}
          </div>
        </Reveal>
      </div>

      {/* In-page nav — replaces four separate nav entries */}
      <nav
        aria-label="Sections of this page"
        className="sticky top-14 z-20 bg-white/95 backdrop-blur border-b border-edge-soft"
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
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-edge-soft'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {SECTIONS.map(({ id, label, Component }) => (
        <section key={id} id={id} aria-label={label} className="scroll-mt-28 border-b border-edge-soft last:border-0">
          <Component asSection />
        </section>
      ))}

      {/* Every figure in one table, after the sections rather than in front of
          them. Useful as a reference once you have read the detail. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FootnoteProvider preload={GLANCE_KEYS}>
          <Reveal className="py-12 border-t border-edge-soft">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Every figure on one page</h2>
            <p className="text-base text-gray-600 max-w-2xl mb-7">
              The same numbers as above, grouped, each with the condition attached to it and a link to its source.
            </p>
            <KeyFigureList figures={keyFigures} variant="grouped" groups={GLANCE_GROUPS} />
            <FootnoteList />
          </Reveal>
        </FootnoteProvider>
      </div>
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
