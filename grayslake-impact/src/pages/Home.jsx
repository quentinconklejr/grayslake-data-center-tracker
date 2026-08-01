import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTitle from '../components/ui/PageTitle'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import FadeIn from '../components/ui/FadeIn'
import TaxRevenueChart from '../components/charts/TaxRevenueChart'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SiteMap from '../components/map/SiteMap'
import SourceCitation from '../components/ui/SourceCitation'
import { projections } from '../data/projections'

const { project, jobs } = projections

const heroLines = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const heroLine = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const FACETS = [
  {
    to: '/tax-impact',
    cat: 'Fiscal Impact',
    catColor: 'text-blue-600',
    catBorder: 'border-blue-200',
    headline: 'Developer fees in the tens of millions.',
    body: 'Village officials project "tens of millions" in developer fees if fully built out — split 50% to major infrastructure, 25% community projects, 25% resident cost-control. Property tax revenue depends on Lake County assessor valuation, not yet projected.',
    highlight: null,
    chart: <TaxRevenueChart />,
    chartLabel: 'Developer Fee Allocation',
    sourceKey: 'villageoffaq',
    textCls: 'lg:col-span-5', chartCls: 'lg:col-span-7', flip: false,
  },
  {
    to: '/jobs',
    cat: 'Employment',
    catColor: 'text-emerald-600',
    catBorder: 'border-emerald-200',
    headline: '1,500 permanent positions at full buildout.',
    body: 'The Village projects 1,500 permanent data center jobs by 2029. Construction through 2027–2029 will employ "hundreds" of trade workers — electricians, ironworkers, HVAC installers — in roles typical of large-scale data center projects.',
    highlight: { value: 1500, suffix: ' jobs', label: 'Projected permanent' },
    chart: <JobsTimelineChart />,
    chartLabel: 'Permanent vs. Construction Workforce',
    sourceKey: 'govtech2025',
    textCls: 'lg:col-span-6', chartCls: 'lg:col-span-6', flip: true,
  },
  {
    to: '/energy',
    cat: 'Energy Draw',
    catColor: 'text-amber-600',
    catBorder: 'border-amber-200',
    headline: '1,600 MW secured. 1,200 MW leasable.',
    body: 'T5 has secured 1,600 MW of utility power against a planned 1,200 MW of leasable IT capacity — a 400 MW buffer for redundancy and phased buildout. Residential electric rates are not directly affected under Illinois\'s separate utility rate class structure for data centers.',
    highlight: { value: 1600, suffix: ' MW', label: 'Secured utility power' },
    chart: <EnergyDrawChart />,
    chartLabel: 'Secured Power vs. IT Capacity',
    sourceKey: 'baxtel2026',
    textCls: 'lg:col-span-5', chartCls: 'lg:col-span-7', flip: true,
  },
  {
    to: '/schools',
    cat: 'School Funding',
    catColor: 'text-violet-600',
    catBorder: 'border-violet-200',
    headline: 'In DeKalb, 60.9% went to schools.',
    body: 'No Grayslake-specific school funding projection has been released. The Meta data center in DeKalb, IL provides the closest Illinois precedent: of $31.1M in annual property taxes, 60.9% ($18.9M) went to School District 428 — which funded construction of Mitchell Elementary.',
    highlight: null,
    chart: <SchoolFundingChart />,
    chartLabel: 'DeKalb / Meta Precedent (2025)',
    sourceKey: 'capitolnews2026',
    textCls: 'lg:col-span-7', chartCls: 'lg:col-span-5', flip: false,
  },
]

export default function Home() {
  return (
    <div>
      <PageTitle />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-grid bg-white min-h-[92vh] flex flex-col justify-center overflow-hidden">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(2,132,199,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left — editorial headline */}
            <div className="lg:col-span-7">
              <motion.div initial="hidden" animate="visible" variants={heroLines}>

                <motion.p
                  variants={heroLine}
                  className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"
                >
                  <span className="inline-block w-6 h-px bg-blue-500/40" />
                  Grayslake, Illinois · Lake County
                </motion.p>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-none mb-8">
                  <motion.span variants={heroLine} className="block text-gray-400">Tracking the</motion.span>
                  <motion.span variants={heroLine} className="block text-gray-900">$8.5–18B</motion.span>
                  <motion.span variants={heroLine} className="block text-gray-900">AI campus</motion.span>
                  <motion.span variants={heroLine} className="block text-gray-400">reshaping</motion.span>
                  <motion.span variants={heroLine} className="block text-gray-900">a village.</motion.span>
                </h1>

                <motion.p variants={heroLine} className="text-base text-gray-600 max-w-lg leading-relaxed mb-8">
                  T5 @ Chicago IV — a hyperscale AI data center campus planned for Peterson
                  Road &amp; Route 83. Up to {project.maxBuildings} buildings, {project.totalCapacityMW.toLocaleString()} MW of IT
                  capacity, and {jobs.permanent.toLocaleString()} permanent jobs. This dashboard tracks every
                  public claim, sourced and cited.
                </motion.p>

                <motion.div variants={heroLine} className="flex flex-wrap gap-3">
                  <Link
                    to="/timeline"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-all duration-150 shadow-sm"
                  >
                    View timeline
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link
                    to="/sources"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 bg-white text-sm font-medium transition-all duration-150"
                  >
                    Primary sources
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right — asymmetric stat cluster */}
            <div className="lg:col-span-5">
              <div className="space-y-3">

                {/* Primary stat */}
                <FadeIn delay={0.4} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-3">IT Capacity at Full Buildout</p>
                  <div className="flex items-end gap-2">
                    <AnimatedNumber
                      value={project.totalCapacityMW}
                      delay={0.5}
                      duration={1.8}
                      className="text-6xl font-display font-bold text-blue-600 leading-none tracking-tight"
                    />
                    <span className="text-2xl font-display font-bold text-blue-600/30 mb-1">MW</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xs font-mono text-gray-400">+{project.securedPowerMW - project.totalCapacityMW} MW buffer</span>
                    <SourceCitation sourceKey="dcd2026" />
                  </div>
                </FadeIn>

                {/* Secondary stats — 2×2 grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Site area',      value: project.totalAcres,  suffix: ' ac', delay: 0.55 },
                    { label: 'Perm. jobs',     value: jobs.permanent,       suffix: '',    delay: 0.6  },
                    { label: 'Max buildings',  value: project.maxBuildings, suffix: '',    delay: 0.65 },
                    { label: 'Phase 1 online', value: null, static: project.firstBuildingOnline, delay: 0.7 },
                  ].map(({ label, value, suffix, static: staticVal, delay }) => (
                    <FadeIn key={label} delay={delay} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                      {staticVal ? (
                        <p className="text-2xl font-display font-bold text-gray-900">{staticVal}</p>
                      ) : (
                        <AnimatedNumber
                          value={value}
                          suffix={suffix}
                          delay={delay + 0.1}
                          duration={1.4}
                          className="text-2xl font-display font-bold text-gray-900"
                        />
                      )}
                    </FadeIn>
                  ))}
                </div>

                <FadeIn delay={0.75} className="text-2xs text-gray-400 text-right font-mono">
                  Under construction · Phase 1 target Q4 2027
                </FadeIn>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.7 }}
        >
          <span className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em]">Scroll</span>
          <motion.svg
            width="20" height="12" viewBox="0 0 20 12" fill="none"
            className="text-gray-400"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M2 2l8 8 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      </section>

      {/* ── Site map ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-14">
        <FadeIn>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-1">Site Location</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">Peterson Rd &amp; Route 83</h2>
            </div>
            <Link to="/map" className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              Full map
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
            Each section below links to a full page with all sourced data, charts, and methodology notes.
          </p>
        </FadeIn>

        <div className="space-y-0">
          {FACETS.map(({ to, cat, catColor, catBorder, headline, body, highlight, chart, chartLabel, sourceKey, textCls, chartCls, flip }, i) => (
            <FadeIn key={to} delay={i * 0.08}>
              <div className={`border-t ${catBorder} pt-10 pb-14 grid lg:grid-cols-12 gap-8 lg:gap-12`}>

                {/* Text column */}
                <div className={`${textCls}${flip ? ' lg:order-last' : ''}`}>
                  <p className={`text-2xs font-mono uppercase tracking-[0.2em] mb-3 ${catColor}`}>
                    {cat}
                  </p>
                  <h3 className="text-2xl font-display font-bold text-gray-900 leading-tight mb-4">
                    {headline}
                  </h3>
                  {highlight && (
                    <div className="mb-5">
                      <AnimatedNumber
                        value={highlight.value}
                        suffix={highlight.suffix}
                        duration={1.6}
                        className="text-5xl font-display font-bold tracking-tight text-gray-900"
                      />
                      <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mt-1">{highlight.label}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{body}</p>
                  <div className="flex items-center gap-4">
                    <Link
                      to={to}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      View full analysis
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                  </div>
                </div>

                {/* Chart column */}
                <div className={`${chartCls}${flip ? ' lg:order-first' : ''}`}>
                  <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">{chartLabel}</p>
                  {chart}
                </div>

              </div>
            </FadeIn>
          ))}
        </div>
      </section>

    </div>
  )
}
