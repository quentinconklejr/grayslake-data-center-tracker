import { useCallback, useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import BackToTop from '../components/ui/BackToTop'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import KeyFigureList from '../components/ui/KeyFigureList'
import CopyAllFigures from '../components/ui/CopyAllFigures'
import AccordionSection from '../components/ui/AccordionSection'
import Reveal from '../components/ui/Reveal'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { keyFigures, figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'
import Energy from './Energy'
import Jobs from './Jobs'
import TaxImpact from './TaxImpact'
import Schools from './Schools'

// Four topic pages merged into one, each one a panel that opens on click.
// They used to be stacked open, which put roughly nine screens of scrolling
// between the top of the page and the sources at the foot of it, and gave a
// reader no way to see the four areas side by side. Collapsed headers show the
// headline figure and its condition, so the summary is readable without
// opening anything. The old topic URLs still redirect here and land on the
// matching panel.

// Every source the figure list cites, in the order the cards render, so
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

const IDS = SECTIONS.map(s => s.id)

// A link from elsewhere on the site, or a bookmarked #energy, has to open the
// panel it points at. Otherwise it scrolls to a closed header and the reader
// sees nothing new.
function idFromHash() {
  const h = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
  return IDS.includes(h) ? h : null
}

export default function Project() {
  const [open, setOpen] = useState(() => {
    const fromHash = idFromHash()
    return fromHash ? [fromHash] : []
  })

  const toggle = useCallback(id => {
    setOpen(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }, [])

  useEffect(() => {
    const target = idFromHash()
    if (target) {
      // The panel opens in the same tick the page mounts, so the element is
      // its full height by the time we scroll to it.
      requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView())
    }
    function onHashChange() {
      const id = idFromHash()
      if (!id) return
      setOpen(prev => (prev.includes(id) ? prev : [...prev, id]))
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const allOpen = open.length === IDS.length

  return (
    <FootnoteProvider preload={GLANCE_KEYS}>
    <div>
      <PageTitle {...pageMeta['/project']} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <FadeIn className="pb-8 border-b border-edge-soft">
          <p className="text-xs font-mono text-blue-700 uppercase tracking-[0.18em] mb-4">T5 @ Chicago IV</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">The Project</h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed mb-2">
            An $8.5–18B campus under construction, one of the largest data centers proposed anywhere in the U.S.
          </p>
          <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
            Energy draw, permanent jobs, developer fees, and school funding. Every figure carries the
            condition attached to it, linked to its source.
          </p>
          <p className="text-xs font-mono text-gray-500 mt-3">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        <Reveal className="pt-9 pb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 leading-tight">Four areas of impact</h2>
              <p className="text-base text-gray-600 mt-1">Select a section to read the detail and its sources.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(allOpen ? [] : IDS)}
              className="text-sm font-medium text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-1 min-h-[44px]"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        </Reveal>

        <div className="space-y-4 pb-9">
          {SECTIONS.map(({ id, label, figure, blurb, accent, Component }) => {
            const f = figureById[figure]
            return (
              <AccordionSection
                key={id}
                id={id}
                label={label}
                value={f?.value}
                qualifier={f?.qualifier}
                blurb={blurb}
                accent={accent}
                open={open.includes(id)}
                onToggle={() => toggle(id)}
              >
                <Component asSection />
                {/* Sources for every section live in one block at the foot of
                    the page, matching the rest of the site. This is the way
                    down to it. */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-7 -mt-4">
                  <a
                    href="#sources"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    Sources for {label.toLowerCase()}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M7 2v10M2.5 7.5L7 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </AccordionSection>
            )
          })}
        </div>
      </div>

      {/* Every figure in one table, after the sections rather than in front of
          them. Useful as a reference once you have read the detail. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="py-12 border-t border-edge-soft">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 mb-7">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Every figure on one page</h2>
              <p className="text-base text-gray-600">
                The same numbers as above, grouped, each with the condition attached to it and a link
                to its source. Copy any one of them and the condition and citation travel with it.
              </p>
            </div>
            <CopyAllFigures />
          </div>
          <KeyFigureList figures={keyFigures} variant="grouped" groups={GLANCE_GROUPS} copyable />
        </Reveal>
      </div>

      <PageNext
        to="/timeline"
        label="Event Timeline"
        desc="Every approval, lawsuit, construction event, and opposition milestone, sourced and in order."
        color="text-cyan-700"
        hoverBorder="hover:border-cyan-300"
      />

      {/* Sources last, as on every other page. */}
      <div id="sources" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28">
        <FootnoteList />
      </div>

      <BackToTop />
    </div>
    </FootnoteProvider>
  )
}
