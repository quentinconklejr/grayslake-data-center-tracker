import { useCallback, useEffect, useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import AccordionSection from '../components/ui/AccordionSection'
import Container from '../components/layout/Container'
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
      <Container size="wide" className="py-10 sm:py-14 space-y-8">
        <PageTitle
          title={pageMeta['/project'].title}
          description={pageMeta['/project'].description}
          ogImage={pageMeta['/project'].ogImage}
        />

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-rule">
          <div className="max-w-2xl">
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
              T5 @ Chicago IV
            </p>
            <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05]">
              The Project Overview
            </h1>
            <p className="mt-3 text-base font-sans text-ink-700 leading-relaxed">
              A hyperscale facility under construction in Grayslake, IL. The Village put the cost at
              $8.5 billion; T5&rsquo;s chief executive said up to $18 billion.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setOpen(allOpen ? [] : IDS)}
              className="text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent min-h-[44px]"
            >
              {allOpen ? 'Collapse all impact areas' : 'Expand all impact areas'}
            </button>
          </div>
        </header>

        {/* Four core impact areas */}
        <div>
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
      </Container>
    </FootnoteProvider>
  )
}
