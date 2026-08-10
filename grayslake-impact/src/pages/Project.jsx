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

const GLANCE_KEYS = []
for (const f of keyFigures) {
  for (const k of [f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean)) {
    if (!GLANCE_KEYS.includes(k)) GLANCE_KEYS.push(k)
  }
}

const GLANCE_GROUPS = [
  { id: 'hero',     ids: ['jobs-permanent', 'investment'],                          cols: 'sm:grid-cols-2',  hero: true },
  { id: 'land',     label: 'Land',              ids: ['acres-owned', 'acres-approved', 'acres-controlled'], cols: 'sm:grid-cols-3' },
  { id: 'power',    label: 'Power & Scale',     ids: ['capacity-comed', 'buildable-area'],        cols: 'sm:grid-cols-2' },
  { id: 'timeline', label: 'Timeline & Status', ids: ['buildout', 'buildings', 'wetlands'],       cols: 'sm:grid-cols-3' },
  { id: 'water',    label: 'Water',             ids: ['water', 'water-flush'],                    cols: 'sm:grid-cols-2' },
]

// In src/pages/Project.jsx, update the SECTIONS array (around line 35):
const SECTIONS = [
  { id: 'energy', label: 'Energy', Component: Energy, figure: 'capacity-comed', blurb: 'Power demand estimates, grid upgrade liability, and unfiled regulatory documents from ComEd.', accent: 'amber' },
  { id: 'jobs', label: 'Jobs', Component: Jobs, figure: 'jobs-permanent', blurb: 'Comparison of three official employment projections and the specific conditions attached to peak headcount figures.', accent: 'emerald' },
  { id: 'tax', label: 'Tax', Component: TaxImpact, figure: 'investment', blurb: 'Developer fee allocations, revenue distribution across eight local taxing districts, and unprojected fiscal impacts.', accent: 'blue' },
  { id: 'schools', label: 'Schools', Component: Schools, figure: 'school-funding', blurb: 'Lessons from previous Illinois data center developments, including DeKalb, for Community High School District 127.', accent: 'violet' },
]

const IDS = SECTIONS.map(s => s.id)

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
            <p className="text-sm font-mono font-semibold text-blue-700 uppercase tracking-[0.15em] mb-3">T5 @ Chicago IV</p>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">The Project</h1>
            <p className="text-lg text-gray-800 max-w-2xl leading-relaxed mb-3 font-medium">
              An $8.5 billion to $18 billion hyperscale facility currently under construction in Grayslake, ranking among the largest computing proposals in the nation.
            </p>
            <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
              A breakdown of power demand, job projections, developer fees, and school funding. Every claim includes its qualifying conditions and links to official public records.
            </p>
            <p className="text-sm font-mono text-gray-700 mt-4 font-medium">Last verified {LAST_VERIFIED}</p>
          </FadeIn>

          <Reveal className="pt-9 pb-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 leading-tight">Four areas of impact</h2>
                <p className="text-base text-gray-700 mt-1">Select a section to review detailed analysis and primary sources.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(allOpen ? [] : IDS)}
                className="text-base font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-1 min-h-[44px]"
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
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-7 -mt-4">
                    <a
                      href="#sources"
                      className="inline-flex items-center gap-1.5 text-base font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                    >
                      Sources for {label.toLowerCase()}
                      <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M7 2v10M2.5 7.5L7 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </AccordionSection>
              )
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="py-12 border-t border-edge-soft">
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 mb-7">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">At-a-glance project metrics</h2>
                <p className="text-base text-gray-700">
                  A comprehensive record of verified metrics from Village documents and developer filings. Copying any metric includes its source citation and qualifying conditions.
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
          desc="Chronological record of approvals, litigation, construction milestones, and public hearings."
          color="text-cyan-700"
          hoverBorder="hover:border-cyan-300"
        />

        <div id="sources" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28">
          <FootnoteList />
        </div>

        <BackToTop />
      </div>
    </FootnoteProvider>
  )
}
