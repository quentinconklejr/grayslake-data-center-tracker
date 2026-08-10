import { useCallback, useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import AccordionSection from '../components/ui/AccordionSection'
import KeyFigureList from '../components/ui/KeyFigureList'
import CopyAllFigures from '../components/ui/CopyAllFigures'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { keyFigures, figureById } from '../data/keyFigures'
import { pageMeta } from '../data/pageMeta'
import { LAST_VERIFIED } from '../data/siteConfig'
import Energy from './Energy'
import Jobs from './Jobs'
import TaxImpact from './TaxImpact'
import Schools from './Schools'

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
  }, [])

  const allOpen = open.length === IDS.length

  return (
    <FootnoteProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <PageTitle 
          title={pageMeta['/project'].title} 
          description={pageMeta['/project'].description} 
          ogImage={pageMeta['/project'].ogImage} 
        />

        <div>
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-blue-700 mb-1">
            T5 @ Chicago IV
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
            The Project Overview
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-3xl leading-relaxed">
            An $8.5 billion to $18 billion hyperscale facility currently under construction in Grayslake, IL. Every figure carries its qualifying conditions and primary source links.
          </p>
          <div className="text-xs font-mono text-slate-500 mt-2">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Sticky Jump Bar for Quick Wayfinding */}
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md py-2.5 border-y border-slate-200 flex items-center justify-between gap-4 overflow-x-auto text-xs font-mono">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 uppercase tracking-wider text-2xs">Jump to:</span>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => {
                  if (!open.includes(s.id)) setOpen(prev => [...prev, s.id])
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setOpen(allOpen ? [] : IDS)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline shrink-0"
          >
            {allOpen ? 'Collapse all ▲' : 'Expand all ▼'}
          </button>
        </div>

        {/* Impact Accordion Sections */}
        <div className="space-y-6">
          {SECTIONS.map(({ id, label, figure, blurb, accent, Component }) => {
            const isSectionOpen = open.includes(id)
            return (
              <div id={id} key={id} className="scroll-mt-28">
                <AccordionSection
                  id={id}
                  label={label}
                  value={figureById[figure]?.value}
                  qualifier={figureById[figure]?.qualifier}
                  blurb={blurb}
                  accent={accent}
                  open={isSectionOpen}
                  onToggle={() => toggle(id)}
                >
                  <Component asSection={true} />
                </AccordionSection>
              </div>
            )
          })}
        </div>

        {/* Footnote List */}
        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
