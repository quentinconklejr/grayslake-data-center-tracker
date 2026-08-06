import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import FadeIn from '../components/ui/FadeIn'
import CopyKPIButton from '../components/ui/CopyKPIButton'
import SectionBar from '../components/ui/SectionBar'
import TaxRevenueChart from '../components/charts/TaxRevenueChart'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SiteMap from '../components/map/SiteMap'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { figureById, figureCopyText } from '../data/keyFigures'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, jobs } = projections

// "once per session" key — shared so all hero numbers skip together on revisit
const HERO_SESSION_KEY = 'gdct-hero-animated'

const FACETS = [
  {
    to: '/tax-impact',
    cat: 'Fiscal Impact',
    catColor: 'text-blue-600',
    catBorder: 'border-blue-200',
    headline: 'Developer fees in the tens of millions.',
    body: 'Mayor Davies described the developer fee split as approximately 50% to major infrastructure, 25% community projects, and 25% to resident cost-control. He characterized those as ballpark figures still under negotiation. Property tax revenue depends on Lake County assessor valuation. No projection has been released.',
    chart: <TaxRevenueChart />,
    chartLabel: 'Developer Fee Allocation',
    sourceKey: 'govtech2025',
    textCls: 'lg:col-span-5', chartCls: 'lg:col-span-7', flip: false,
  },
  {
    to: '/jobs',
    cat: 'Employment',
    catColor: 'text-emerald-700',
    catBorder: 'border-emerald-200',
    headline: `${figureById['jobs-permanent'].value} permanent jobs — ${figureById['jobs-permanent'].qualifier}.`,
    body: 'The Village FAQ gives no flat headcount. It states that "if all 10 million sq ft of approved data center space is built," an estimated "50 permanent jobs are created for every 300,000 sq ft, or 1,680 permanent jobs" — and hedges that estimate, noting job creation "may change" as operations and technologies do. That footprint is a ceiling the approvals allow, not a commitment. Two lower figures were stated directly by people: Mayor Davies cited 1,500 permanent positions in October 2025, and CEO Pete Marin cited "over 1,600" in July 2026. Construction employment is counted separately: the FAQ excludes it, and it runs to "hundreds" of trade workers through 2027–2029.',
    chart: <JobsTimelineChart />,
    chartLabel: 'Permanent vs. Construction Workforce',
    sourceKey: 'govtech2025',
    textCls: 'lg:col-span-6', chartCls: 'lg:col-span-6', flip: true,
  },
  {
    to: '/energy',
    cat: 'Energy Draw',
    catColor: 'text-amber-700',
    catBorder: 'border-amber-200',
    headline: 'Three capacity figures, three different measurements.',
    body: 'T5 CEO Pete Marin described 1.55 GW of capacity secured from ComEd, of which 1.2 GW is leasable IT capacity; the campus includes a ComEd-built substation. CLCJAWA\'s utility briefing separately records 1.6 GW available to Phase I. These describe the utility connection and the computing load, not competing estimates of one number. Residential electric rates are not directly affected under Illinois\'s separate utility rate class structure for data centers.',
    chart: <EnergyDrawChart />,
    chartLabel: 'Secured Power vs. IT Capacity',
    sourceKey: 'govtech2025',
    textCls: 'lg:col-span-5', chartCls: 'lg:col-span-7', flip: true,
  },
  {
    to: '/schools',
    cat: 'School Funding',
    catColor: 'text-violet-600',
    catBorder: 'border-violet-200',
    headline: 'In DeKalb, 60.9% went to schools.',
    body: 'No Grayslake-specific school funding projection has been released. The Meta data center in DeKalb provides the closest Illinois precedent: School District 428 received ~60.9% of Meta\'s taxes across three properties (multi-year data). The 2025 bill for one facility was $31.1M, a figure drawn from a separate dataset.',
    chart: <SchoolFundingChart />,
    chartLabel: 'DeKalb / Meta Precedent (2025)',
    sourceKey: 'capitolnews2026',
    textCls: 'lg:col-span-7', chartCls: 'lg:col-span-5', flip: false,
  },
]

// Secondary stats — numeric ones get count-up animation and copy button
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
    note: 'Approved maximum, not the area shown on the map below',
    src: 'villagefaq_archived',
  },
]

// Copy text for a canonical figure. This string is the one that travels
// furthest from its context — pasted into a story, an email, a slide — so it
// must carry the qualifier and the citation, never just the number.
function buildCopyText(displayValue, note, src) {
  const s = sources[src]
  if (!s) return displayValue
  const citation = [s.publisher, s.date].filter(Boolean).join(', ')
  // Casing is preserved exactly as authored. This previously called
  // note.toLowerCase() to make the caption read as a sentence continuation,
  // which mangled every proper noun in it — "ComEd" became "comed", "T5 CEO"
  // became "t5 ceo", "Peterson Rd & Route 83" became "peterson rd & route 83".
  // An em dash separates value from caption instead, so the caption stands on
  // its own and case never needs adjusting.
  return `${displayValue} — ${note}${citation ? ` (${citation})` : ''}`
}

export default function Home() {
  return (
    <FootnoteProvider>
    <div>
      <PageTitle {...pageMeta['/']} />

      {/* Section context bar — appears on scroll, stays below header */}
      <SectionBar />

      {/* ── Intro + key stats ──────────────────────────────────────────────── */}
      <section data-section="Key Facts" className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-14">

          <FadeIn>
            <p className="text-sm text-gray-500 mb-2">
              In plain language: a very large computing facility — one of the biggest proposed anywhere in the U.S.
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-4 max-w-[52ch]">
              T5 @ Chicago IV is an approved $8.5–18B hyperscale AI data center under construction in Grayslake, Illinois.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-[65ch] mb-4">
              This tracker collects public records and press coverage on the project and links every
              claim to its source.
            </p>
            <p className="text-2xs font-mono text-gray-400 mb-8">Last verified {LAST_VERIFIED}</p>
          </FadeIn>

          {/* Headline stats — typographically dominant */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-0 border-t border-gray-200 pt-10">

            <FadeIn className="md:pr-12 md:border-r border-gray-200">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Permanent Jobs (estimated max)</p>
              <div className="flex items-baseline gap-2 leading-none">
                <span className="text-2xl sm:text-3xl font-display font-medium text-gray-400">up to</span>
                <AnimatedNumber
                  value={jobs.permanent}
                  suffix=""
                  duration={0.6}
                  delay={0.1}
                  sessionKey={HERO_SESSION_KEY}
                  className="text-6xl sm:text-7xl font-display font-black text-gray-900 tracking-tighter"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                Village FAQ estimate, conditional on all 10 million sq ft being built and hedged as subject
                to change. Excludes construction jobs. Davies cited 1,500 (Oct. 2025); Marin cited &ldquo;over
                1,600&rdquo; (Jul. 2026).<SourceCitation sourceKey="villagefaq_archived" />{' '}
                <Link to="/project#jobs" className="text-blue-600 hover:text-blue-700 transition-colors">Full range on The Project →</Link>
              </p>
              <CopyKPIButton copyText={figureCopyText('jobs-permanent')} />
            </FadeIn>

            <FadeIn delay={0.08} className="md:pl-12 border-t border-gray-200 pt-10 md:pt-0 md:border-t-0">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Total Estimated Investment</p>
              <p className="text-6xl sm:text-7xl font-display font-black text-gray-900 leading-none tracking-tighter">
                {figureById['investment'].value}
              </p>
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                {figureById['investment'].qualifier}<SourceCitation sourceKey="govtech2025" />
              </p>
              <CopyKPIButton copyText={figureCopyText('investment')} />
            </FadeIn>

          </div>

          {/* Secondary stats with count-up and copy buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-100">
            {SECONDARY_STATS.map(({ label, numValue, suffix = '', value, note, src }) => {
              const displayValue = numValue != null
                ? `${numValue.toLocaleString()}${suffix}`
                : value
              return (
                <FadeIn key={label}>
                  <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.16em] mb-1">{label}</p>
                  <p className="text-xl font-display font-bold text-gray-800 leading-tight">
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
                  <p className="text-xs text-gray-400 mt-1">{note}</p>
                  <CopyKPIButton copyText={buildCopyText(displayValue, note, src)} />
                </FadeIn>
              )
            })}
          </div>

          {/* Water use — surfaced from /energy technical table */}
          <FadeIn>
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.16em] mb-0.5">Water (full buildout)</p>
                <p className="text-sm font-display font-bold text-gray-800">{figureById['water'].value}<SourceCitation sourceKey="clcjawa2026" /><SourceCitation sourceKey="villagefaq_archived" /></p>
                <p className="text-2xs text-gray-600 mt-0.5">{figureById['water'].qualifier}</p>
                <CopyKPIButton copyText={figureCopyText('water')} />
              </div>
              <div>
                <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.16em] mb-0.5">Commissioning flush (one 200 MW bldg)</p>
                <p className="text-sm font-display font-bold text-gray-800">{figureById['water-flush'].value}<SourceCitation sourceKey="clcjawa2026" /></p>
                <p className="text-2xs text-gray-600 mt-0.5">{figureById['water-flush'].qualifier}</p>
                <CopyKPIButton copyText={figureCopyText('water-flush')} />
              </div>
            </div>
          </FadeIn>

          {/* START HERE — shown after the stats so headline numbers hit first */}
          <FadeIn>
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-gray-300" />
                Start here
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    to: '/questions',
                    label: 'Residents',
                    color: 'text-blue-700',
                    hoverBorder: 'hover:border-blue-300',
                    desc: 'Plain-language answers on water, energy, jobs, taxes and the approval process.',
                  },
                  {
                    to: '/reporters',
                    label: 'Reporters',
                    color: 'text-violet-700',
                    hoverBorder: 'hover:border-violet-300',
                    desc: 'Key figures with citations and a contacts reference for press inquiries.',
                  },
                ].map(({ to, label, color, hoverBorder, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`group block bg-white border border-gray-200 ${hoverBorder} rounded-xl px-5 py-4 transition-all duration-150 hover:shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-xs font-mono uppercase tracking-[0.2em] font-semibold mb-1.5 ${color}`}>{label}</p>
                        <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">{desc}</p>
                      </div>
                      <svg
                        className={`shrink-0 w-3.5 h-3.5 mt-0.5 ${color} opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-150`}
                        viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
                      >
                        <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Site map ─────────────────────────────────────────────────────────── */}
      <section data-section="Land Ownership" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-14">
        <FadeIn>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.2em] mb-1">Land Ownership</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">Land recorded to T5</h2>
              <p className="text-sm text-gray-600 mt-1 max-w-md leading-snug">
                {figureById['acres-owned'].value} across {figureById['acres-owned'].qualifier}. The approved
                campus is larger and is not mapped.
              </p>
            </div>
            <Link to="/map" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              Full map
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <SiteMap className="h-[480px]" />
        </FadeIn>
      </section>

      {/* ── Impact facets ─────────────────────────────────────────────────────── */}
      <section data-section="Impact Overview" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        <FadeIn className="mb-12">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-gray-300" />
            Impact by category
          </p>
          <h2 className="text-2xl font-display font-bold text-gray-900">Four areas of impact.</h2>
          <p className="text-base text-gray-500 mt-2 max-w-xl leading-relaxed">
            Each section links to a full page with sourced data and methodology.
          </p>
        </FadeIn>

        <div className="space-y-0">
          {FACETS.map(({ to, cat, catColor, catBorder, headline, body, chart, chartLabel, sourceKey, textCls, chartCls, flip }, i) => (
            <FadeIn key={to} delay={Math.min(i * 0.05, 0.15)}>
              <div data-section={cat} className={`border-t ${catBorder} pt-10 pb-14 grid lg:grid-cols-12 gap-8 lg:gap-12`}>

                <div className={`${textCls}${flip ? ' lg:order-last' : ''}`}>
                  <p className={`text-2xs font-mono uppercase tracking-[0.2em] mb-3 ${catColor}`}>{cat}</p>
                  <h3 className="text-xl font-display font-bold text-gray-900 leading-tight mb-5">
                    {headline}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed mb-5">{body}</p>
                  <div className="flex items-center gap-4">
                    <Link
                      to={to}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      View full analysis
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                  </div>
                </div>

                <div className={`${chartCls}${flip ? ' lg:order-first' : ''}`}>
                  <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">{chartLabel}</p>
                  {chart}
                </div>

              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <FootnoteList />
      </div>
    </div>
    </FootnoteProvider>
  )
}
