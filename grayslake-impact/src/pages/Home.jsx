import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import FadeIn from '../components/ui/FadeIn'
import TaxRevenueChart from '../components/charts/TaxRevenueChart'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SiteMap from '../components/map/SiteMap'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'

const { project, jobs } = projections

const FACETS = [
  {
    to: '/tax-impact',
    cat: 'Fiscal Impact',
    catColor: 'text-blue-600',
    catBorder: 'border-blue-200',
    headline: 'Developer fees in the tens of millions.',
    body: 'Mayor Davies described the developer fee split as approximately 50% to major infrastructure, 25% community projects, 25% resident cost-control — characterized as ballpark figures still under negotiation. Property tax revenue depends on Lake County assessor valuation, not yet projected.',
    chart: <TaxRevenueChart />,
    chartLabel: 'Developer Fee Allocation',
    sourceKey: 'govtech2025',
    textCls: 'lg:col-span-5', chartCls: 'lg:col-span-7', flip: false,
  },
  {
    to: '/jobs',
    cat: 'Employment',
    catColor: 'text-emerald-600',
    catBorder: 'border-emerald-200',
    headline: '1,680 permanent positions at full buildout.',
    body: 'The Village FAQ\'s current estimate is 1,680 permanent jobs at full buildout. An earlier figure of 1,500 was cited at the October 2025 public meeting. Construction through 2027–2029 will employ "hundreds" of trade workers — electricians, ironworkers, HVAC installers — in roles typical of large-scale data center projects.',
    chart: <JobsTimelineChart />,
    chartLabel: 'Permanent vs. Construction Workforce',
    sourceKey: 'villageoffaq',
    textCls: 'lg:col-span-6', chartCls: 'lg:col-span-6', flip: true,
  },
  {
    to: '/energy',
    cat: 'Energy Draw',
    catColor: 'text-amber-600',
    catBorder: 'border-amber-200',
    headline: '1,600 MW secured. 1,200 MW leasable.',
    body: 'T5 has secured 1,600 MW of utility power against a planned 1,200 MW of leasable IT capacity — a 400 MW buffer for redundancy and phased buildout. Residential electric rates are not directly affected under Illinois\'s separate utility rate class structure for data centers.',
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
    body: 'No Grayslake-specific school funding projection has been released. The Meta data center in DeKalb provides the closest Illinois precedent: School District 428 received ~60.9% of Meta\'s taxes across three properties (multi-year data). The 2025 bill for one facility was $31.1M — a separate figure from a different dataset.',
    chart: <SchoolFundingChart />,
    chartLabel: 'DeKalb / Meta Precedent (2025)',
    sourceKey: 'capitolnews2026',
    textCls: 'lg:col-span-7', chartCls: 'lg:col-span-5', flip: false,
  },
]

export default function Home() {
  return (
    <FootnoteProvider>
    <div>
      <PageTitle />

      {/* ── Intro + key stats ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-14">

          <FadeIn>
            <p className="text-xl text-gray-600 leading-relaxed max-w-[65ch] mb-4">
              T5 @ Chicago IV is a proposed hyperscale AI data center campus on Peterson Road
              and Route 83 in Grayslake, Illinois. This tracker collects public records and press
              coverage on the project — jobs, taxes, energy, school funding — and links every claim to its source.
            </p>
            <p className="text-2xs font-mono text-gray-400 mb-12">Last verified Aug 2, 2026</p>
          </FadeIn>

          {/* Headline stats — typographically dominant */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-0 border-t border-gray-200 pt-10">

            <FadeIn className="md:pr-12 md:border-r border-gray-200">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Permanent Jobs at Full Buildout</p>
              <AnimatedNumber
                value={jobs.permanent}
                suffix=""
                duration={1.6}
                delay={0.1}
                className="text-7xl sm:text-8xl font-display font-black text-gray-900 leading-none tracking-tighter block"
              />
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                Projected by 2029 — Village FAQ estimate<SourceCitation sourceKey="villageoffaq" />
              </p>
            </FadeIn>

            <FadeIn delay={0.08} className="md:pl-12 border-t border-gray-200 pt-10 md:pt-0 md:border-t-0">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Total Estimated Investment</p>
              <p className="text-6xl sm:text-7xl font-display font-black text-gray-900 leading-none tracking-tighter">
                $8.5<span className="text-gray-300">–</span>18<span className="text-4xl sm:text-5xl">B</span>
              </p>
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                Mayor Davies: $8.5B · CEO Marin: up to $18B<SourceCitation sourceKey="govtech2025" />
              </p>
            </FadeIn>

          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-100">
            {[
              { label: 'IT Capacity',    value: `${project.totalCapacityMW.toLocaleString()} MW`, note: 'Leasable at full buildout',   src: 'dcdGW2026' },
              { label: 'Secured Power',  value: `${project.securedPowerMW.toLocaleString()} MW`,  note: 'Utility-contracted capacity',   src: 'dcdGW2026' },
              { label: 'Phase 1 Online', value: project.firstBuildingOnline,                       note: 'Under construction now',        src: 'dcd2026'   },
              { label: 'Campus Area',    value: `${project.totalAcres.toLocaleString()} ac`,       note: 'Peterson Rd & Route 83',        src: 'villageoffaq' },
            ].map(({ label, value, note, src }) => (
              <FadeIn key={label}>
                <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.16em] mb-1">{label}</p>
                <p className="text-xl font-display font-bold text-gray-800 leading-tight">
                  {value}<SourceCitation sourceKey={src} />
                </p>
                <p className="text-xs text-gray-400 mt-1">{note}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Site map ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-14">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">

        <FadeIn className="mb-12">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-gray-300" />
            Impact by category
          </p>
          <h2 className="text-3xl font-display font-bold text-gray-900">Four dimensions of impact.</h2>
          <p className="text-base text-gray-500 mt-2 max-w-xl leading-relaxed">
            Each section links to a full page with all sourced data, charts, and methodology notes.
          </p>
        </FadeIn>

        <div className="space-y-0">
          {FACETS.map(({ to, cat, catColor, catBorder, headline, body, chart, chartLabel, sourceKey, textCls, chartCls, flip }, i) => (
            <FadeIn key={to} delay={i * 0.08}>
              <div className={`border-t ${catBorder} pt-10 pb-14 grid lg:grid-cols-12 gap-8 lg:gap-12`}>

                <div className={`${textCls}${flip ? ' lg:order-last' : ''}`}>
                  <p className={`text-2xs font-mono uppercase tracking-[0.2em] mb-3 ${catColor}`}>{cat}</p>
                  <h3 className="text-2xl font-display font-bold text-gray-900 leading-tight mb-5">
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
