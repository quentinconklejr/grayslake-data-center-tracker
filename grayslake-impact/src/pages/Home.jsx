import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
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
    headline: '1,680 permanent positions at full buildout.',
    body: 'The Village FAQ\'s current estimate is 1,680 permanent jobs at full buildout. An earlier figure of 1,500 was cited at the October 2025 public meeting. Construction through 2027–2029 will employ "hundreds" of trade workers, per Village documents.',
    chart: <JobsTimelineChart />,
    chartLabel: 'Permanent vs. Construction Workforce',
    sourceKey: 'villageoffaq',
    textCls: 'lg:col-span-6', chartCls: 'lg:col-span-6', flip: true,
  },
  {
    to: '/energy',
    cat: 'Energy Draw',
    catColor: 'text-amber-700',
    catBorder: 'border-amber-200',
    headline: '1,600 MW secured. 1,200 MW leasable.',
    body: 'T5 has secured 1,600 MW of utility power against a planned 1,200 MW of leasable IT capacity. The 400 MW difference serves as a buffer for redundancy and phased buildout. Residential electric rates are not directly affected under Illinois\'s separate utility rate class structure for data centers.',
    chart: <EnergyDrawChart />,
    chartLabel: 'Secured Power vs. IT Capacity',
    sourceKey: 'dcdGW2026',
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
    label: 'Phase 1 Online',
    value: project.firstBuildingOnline,
    note: 'Under construction now',
    src: 'dcd2026',
  },
  {
    label: 'Campus Area',
    numValue: project.totalAcres,
    suffix: ' ac',
    note: 'Peterson Rd & Route 83',
    src: 'villageoffaq',
  },
]

function buildCopyText(displayValue, note, src) {
  const s = sources[src]
  if (!s) return displayValue
  const citation = [s.publisher, s.date].filter(Boolean).join(', ')
  return `${displayValue} ${note.toLowerCase()}${citation ? ` (${citation})` : ''}`
}

export default function Home() {
  return (
    <FootnoteProvider>
    <div>
      <PageTitle
        description="A civic data dashboard tracking the T5 @ Chicago IV hyperscale AI data center development in Grayslake, Illinois — jobs, taxes, energy, water, and legal challenges, all sourced."
        ogImage="/og/home.png"
      />

      {/* Section context bar — appears on scroll, stays below header */}
      <SectionBar />

      {/* ── Intro + key stats ──────────────────────────────────────────────── */}
      <section data-section="Key Facts" className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-14">

          <FadeIn>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-4 max-w-[52ch]">
              T5 @ Chicago IV is a proposed $8.5–18B hyperscale AI data center in Grayslake, Illinois.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-[65ch] mb-4">
              This tracker collects public records and press coverage on the project and links every
              claim to its source.
            </p>
            <p className="text-2xs font-mono text-gray-400 mb-12">Last verified {LAST_VERIFIED}</p>
          </FadeIn>

          {/* Headline stats — typographically dominant */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-0 border-t border-gray-200 pt-10">

            <FadeIn className="md:pr-12 md:border-r border-gray-200">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Permanent Jobs at Full Buildout</p>
              <AnimatedNumber
                value={jobs.permanent}
                suffix=""
                duration={0.6}
                delay={0.1}
                sessionKey={HERO_SESSION_KEY}
                className="text-7xl sm:text-8xl font-display font-black text-gray-900 leading-none tracking-tighter block"
              />
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                Projected by 2029. Village FAQ estimate.<SourceCitation sourceKey="villageoffaq" />
              </p>
              <CopyKPIButton copyText={buildCopyText(`${jobs.permanent.toLocaleString()} permanent jobs`, 'Projected by 2029. Village FAQ estimate.', 'villageoffaq')} />
            </FadeIn>

            <FadeIn delay={0.08} className="md:pl-12 border-t border-gray-200 pt-10 md:pt-0 md:border-t-0">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Total Estimated Investment</p>
              <p className="text-6xl sm:text-7xl font-display font-black text-gray-900 leading-none tracking-tighter">
                $8.5–18<span className="text-4xl sm:text-5xl">B</span>
              </p>
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                Mayor Davies: $8.5B · CEO Marin: up to $18B<SourceCitation sourceKey="govtech2025" />
              </p>
              <CopyKPIButton copyText={buildCopyText('$8.5–18B total estimated investment', 'Mayor Davies: $8.5B · CEO Marin: up to $18B', 'govtech2025')} />
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
                <p className="text-sm font-display font-bold text-gray-800">≤ 50,000 gal/day<SourceCitation sourceKey="villageoffaq" /></p>
                <CopyKPIButton copyText={buildCopyText('≤ 50,000 gal/day water use (full buildout)', 'Village FAQ estimate', 'villageoffaq')} />
              </div>
              <div>
                <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.16em] mb-0.5">Commissioning flush (one-time)</p>
                <p className="text-sm font-display font-bold text-gray-800">~3.2M gal<SourceCitation sourceKey="hoodline2026" /></p>
                <CopyKPIButton copyText={buildCopyText('~3.2M gal commissioning flush (one-time)', 'One-time event at system startup', 'hoodline2026')} />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Start here ───────────────────────────────────────────────────────── */}
      <section data-section="Audience Guides" className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <FadeIn>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <span className="inline-block w-4 h-px bg-gray-300" />
              Start here
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  to: '/residents',
                  label: 'Residents',
                  color: 'text-blue-600',
                  border: 'border-blue-100 hover:border-blue-300',
                  desc: 'Plain-language summary: water, energy, jobs, taxes, and the approval process.',
                },
                {
                  to: '/reporters',
                  label: 'Reporters',
                  color: 'text-violet-600',
                  border: 'border-violet-100 hover:border-violet-300',
                  desc: 'Key figures with citations and a contacts reference for press inquiries.',
                },
                {
                  to: '/officials',
                  label: 'Officials',
                  color: 'text-amber-700',
                  border: 'border-amber-100 hover:border-amber-300',
                  desc: 'Approval decisions, legal challenges, and policy events — sourced and dated.',
                },
              ].map(({ to, label, color, border, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className={`block border rounded-xl px-5 py-4 bg-white transition-colors duration-150 group ${border}`}
                >
                  <p className={`text-2xs font-mono uppercase tracking-[0.2em] font-semibold mb-1.5 ${color}`}>{label}</p>
                  <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">{desc}</p>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Site map ─────────────────────────────────────────────────────────── */}
      <section data-section="Site Location" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-14">
        <FadeIn>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-1">Site Location</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">Peterson Rd &amp; Route 83</h2>
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
