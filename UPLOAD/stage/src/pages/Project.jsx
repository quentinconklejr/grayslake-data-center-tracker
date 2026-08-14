import { useCallback, useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import AccordionSection from '../components/ui/AccordionSection'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { figureById } from '../data/keyFigures'
import { pageMeta } from '../data/pageMeta'
import Energy from './Energy'
import Jobs from './Jobs'
import TaxImpact from './TaxImpact'
import Schools from './Schools'

const SECTIONS = [
  { id: 'energy', label: 'Energy Draw', Component: Energy, figure: 'capacity-comed', blurb: 'Power demand estimates, grid upgrade liability, and unfiled regulatory documents from ComEd.', accent: 'amber' },
  { id: 'jobs', label: 'Job Creation', Component: Jobs, figure: 'jobs-permanent', blurb: 'Comparison of three official employment projections and the specific conditions attached to peak headcount figures.', accent: 'emerald' },
  { id: 'tax', label: 'Fiscal Tax Revenue', Component: TaxImpact, figure: 'investment', blurb: 'Developer fee allocations, revenue distribution across eight local taxing districts, and unprojected fiscal impacts.', accent: 'blue' },
  { id: 'schools', label: 'School Funding', Component: Schools, figure: 'school-funding', blurb: 'Lessons from previous Illinois data center developments, including DeKalb, for Community High School District 127.', accent: 'violet' },
]

const IDS = SECTIONS.map(s => s.id)

function idFromHash() {
  const h = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
  return IDS.includes(h) ? h : null
}

export default function Project() {
  const [open, setOpen] = useState(() => {
    const fromHash = idFromHash()
    return fromHash ? [fromHash] : IDS
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
        <PageTitle 
          title={pageMeta['/project'].title} 
          description={pageMeta['/project'].description} 
          ogImage={pageMeta['/project'].ogImage} 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-2xs font-mono font-bold uppercase tracking-widest text-sky-800 mb-1">
              T5 @ Chicago IV
            </div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              The Project Overview
            </h1>
            <p className="text-sm font-sans text-slate-600 max-w-2xl mt-1">
              An $8.5 billion to $18 billion hyperscale facility under construction in Grayslake, IL.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setOpen(allOpen ? [] : IDS)}
              className="text-xs font-mono font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2.5 rounded-xl border border-sky-200 transition-colors"
            >
              {allOpen ? 'Collapse All Impact Areas ▲' : 'Expand All Impact Areas ▼'}
            </button>
          </div>
        </div>

        {/* Four Core Impact Areas */}
        <div className="space-y-6">
          {SECTIONS.map(({ id, label, figure, blurb, accent, Component }) => {
            const isSectionOpen = open.includes(id)
            return (
              <div id={id} key={id} className="scroll-mt-20">
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

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
