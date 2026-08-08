import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import FadeIn from '../components/ui/FadeIn'
import Reveal from '../components/ui/Reveal'
import RevealHeadline from '../components/ui/RevealHeadline'
import CopyKPIButton from '../components/ui/CopyKPIButton'
import SectionBar from '../components/ui/SectionBar'
import SiteMap from '../components/map/SiteMap'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { figureById, figureCopyText } from '../data/keyFigures'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, jobs } = projections
const HERO_SESSION_KEY = 'gdct-hero-animated'

const SECONDARY_STATS = [
  {
    label: 'IT Capacity',
    numValue: project.totalCapacityMW,
    suffix: ' MW',
    note: 'Leasable at full buildout',
    src: 'dcdGW2026',
  },
  {
    label: 'Secured Power',
    numValue: project.securedPowerMW,
    suffix: ' MW',
    note: 'Utility-contracted capacity',
    src: 'dcdGW2026',
  },
  {
    label: 'ComEd Capacity',
    value: `${project.comEdCapacityGW} GW`,
    note: 'Secured from ComEd, per T5 CEO',
    src: 'govtech2025',
  },
  {
    label: 'Phase 1 Online',
    value: project.firstBuildingOnline,
    note: 'Under construction now',
    src: 'dcd2026',
  },
  {
    label: 'Approved Max',
    numValue: project.totalAcres,
    suffix: ' ac',
    note: 'Approved campus maximum',
    src: 'villagefaq_archived',
  },
]

function buildCopyText(displayValue, note, src) {
  const s = sources[src]
  if (!s) return displayValue
  const citation = [s.publisher, s.date].filter(Boolean).join(', ')
  return `${displayValue}: ${note}${citation ? ` (${citation})` : ''}`
}

export default function Home() {
  return (
    <FootnoteProvider>
    <div>
      <PageTitle {...pageMeta['/']} />

      <SectionBar />

      <section data-section="Key Facts" className="bg-gradient-to-b from-slate-50/80 to-white border-b border-edge-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-14">

          <RevealHeadline
            as="h1"
            text="T5 @ Chicago IV is an approved $8.5 billion to $18 billion hyperscale AI facility under construction in Grayslake, Illinois."
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-5 max-w-[52ch]"
          />

          <Reveal delay={0.1}>
            <p className="text-lg text-slate-800 font-semibold mb-5 max-w-[60ch] border-l-2 border-sky-600 pl-4">
              Facility Overview: A 10 million square foot computing campus, ranking among the largest data center proposals in the United States.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="text-xl text-gray-700 leading-relaxed max-w-[65ch] mb-4">
              This repository aggregates public filings, land deeds, and municipal logs, linking every claim directly to its primary source.
            </p>
            <p className="text-xs font-mono text-slate-600 mb-8 font-medium">Last verified {LAST_VERIFIED}</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-0 border-t border-edge-soft pt-10">

            <Reveal className="md:pr-12 md:border-r border-gray-300">
              <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">Permanent Jobs (estimated max)</p>
              <div className="flex items-baseline gap-2 leading-none">
                <span className="text-2xl sm:text-3xl font-display font-medium text-gray-500">up to</span>
                <AnimatedNumber
                  value={jobs.permanent}
                  suffix=""
                  duration={0.6}
                  delay={0.1}
                  sessionKey={HERO_SESSION_KEY}
                  className="text-5xl sm:text-7xl font-display font-black text-gray-900 tracking-tighter"
                />
              </div>
              <p className="text-base text-gray-700 mt-4 leading-relaxed">
                Village FAQ estimate, conditional on full construction of 10 million square feet. Excludes construction positions. Grayslake Mayor Elizabeth Davies reported 1,500 jobs in October 2025; T5 Chief Executive Pete Marin cited over 1,600 in July 2026.<SourceCitation sourceKey="villagefaq_archived" />{' '}
                <Link to="/project#jobs" className="text-sky-700 font-semibold hover:text-sky-800 transition-colors">Full analysis on The Project →</Link>
              </p>
              <CopyKPIButton copyText={figureCopyText('jobs-permanent')} />
            </Reveal>

            <Reveal delay={0.08} className="md:pl-12 border-t border-gray-300 pt-10 md:pt-0 md:border-t-0">
              <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">Total Estimated Investment</p>
              <p className="text-5xl sm:text-7xl font-display font-black text-gray-900 leading-none tracking-tighter">
                {figureById['investment'].value}
              </p>
              <p className="text-base text-gray-700 mt-4 leading-relaxed">
                Village estimates state $8.5 billion; T5 executive projections state up to $18 billion. No independent financial valuation has been published.<SourceCitation sourceKey="govtech2025" />
              </p>
              <CopyKPIButton copyText={figureCopyText('investment')} />
            </Reveal>

          </div>

          <section data-section="Land Ownership" className="-mx-4 sm:-mx-6 mt-12 mb-4 px-4 sm:px-6">
            <FadeIn>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-1">Land Ownership</p>
                  <h2 className="text-3xl font-display font-bold text-gray-900">Land Recorded to T5</h2>
                  <p className="text-base text-gray-700 mt-1 max-w-md leading-relaxed">
                    {figureById['acres-owned'].value} across {figureById['acres-owned'].qualifier}. The approved campus boundary covers additional area not mapped here.
                  </p>
                </div>
                <Link to="/map" className="text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors flex items-center gap-1">
                  Full interactive map
                  <svg className="w-4 h-4" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <SiteMap className="h-[480px]" />
            </FadeIn>
          </section>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-10 pt-8 border-t border-gray-200">
            {SECONDARY_STATS.map(({ label, numValue, suffix = '', value, note, src }) => {
              const displayValue = numValue != null
                ? `${numValue.toLocaleString()}${suffix}`
                : value
              return (
                <FadeIn key={label}>
                  <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.12em] mb-1">{label}</p>
                  <p className="text-xl font-display font-bold text-slate-900 leading-tight">
                    {numValue != null ? (
                      <AnimatedNumber
                        value={numValue}
                        suffix={suffix}
                        duration={0.6}
                        sessionKey={HERO_SESSION_KEY}
                      />
                    ) : (
                      value
                    )}
                    <SourceCitation sourceKey={src} />
                  </p>
                  <p className="text-xs font-medium text-slate-600 mt-1">{note}</p>
                  <CopyKPIButton copyText={buildCopyText(displayValue, note, src)} />
                </FadeIn>
              )
            })}
          </div>

          <FadeIn>
            <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.12em] mb-0.5">Water Consumption (Full Buildout)</p>
                <p className="text-base font-display font-bold text-slate-900">{figureById['water'].value}<SourceCitation sourceKey="clcjawa2026" /><SourceCitation sourceKey="villagefaq_archived" /></p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{figureById['water'].qualifier}</p>
                <CopyKPIButton copyText={figureCopyText('water')} />
              </div>
              <div>
                <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.12em] mb-0.5">Commissioning Flush Volume (200 MW Building)</p>
                <p className="text-base font-display font-bold text-slate-900">{figureById['water-flush'].value}<SourceCitation sourceKey="clcjawa2026" /></p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{figureById['water-flush'].qualifier}</p>
                <CopyKPIButton copyText={figureCopyText('water-flush')} />
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      <PageNext
        prominent
        to="/project"
        label="The Project"
        desc="Energy, jobs, tax distribution, and school funding analysis with cited sources."
        color="text-blue-700"
        hoverBorder="hover:border-blue-300"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <FootnoteList />
      </div>
    </div>
    </FootnoteProvider>
  )
}
