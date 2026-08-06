import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import FadeIn from '../components/ui/FadeIn'
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

// "once per session" key — shared so all hero numbers skip together on revisit
const HERO_SESSION_KEY = 'gdct-hero-animated'

// Homepage impact cards — one sentence each, link to /project for the full analysis.
// Charts live on /project where readers have chosen to go deeper; the homepage teases.
const IMPACT_CARDS = [
  {
    to: '/project#jobs',
    cat: 'Employment',
    catColor: 'text-emerald-700',
    topBorder: 'border-t-emerald-400',
    headline: `${figureById['jobs-permanent'].value} permanent jobs — ${figureById['jobs-permanent'].qualifier}.`,
    sourceKey: 'govtech2025',
  },
  {
    to: '/project#energy',
    cat: 'Energy Draw',
    catColor: 'text-amber-700',
    topBorder: 'border-t-amber-400',
    headline: 'Three capacity figures, three different measurements.',
    sourceKey: 'govtech2025',
  },
  {
    to: '/project#tax',
    cat: 'Fiscal Impact',
    catColor: 'text-blue-600',
    topBorder: 'border-t-blue-400',
    headline: 'Developer fees in the tens of millions.',
    sourceKey: 'govtech2025',
  },
  {
    to: '/project#schools',
    cat: 'School Funding',
    catColor: 'text-violet-600',
    topBorder: 'border-t-violet-400',
    headline: 'In DeKalb, 60.9% went to schools.',
    sourceKey: 'capitolnews2026',
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
      <section data-section="Key Facts" className="bg-gradient-to-b from-blue-50/60 to-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-14">

          <FadeIn>
            <p className="text-sm text-blue-700/70 font-medium mb-2">
              In plain language: a very large computing facility — one of the biggest proposed anywhere in the U.S.
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-4 max-w-[52ch]">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-10 pt-8 border-t border-gray-100">
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
                  <p className="text-xs text-gray-500 mt-1">{note}</p>
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
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
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
                    className={`group block bg-white border border-gray-200 ${hoverBorder} rounded-xl px-5 py-5 transition-all duration-150 hover:shadow-glass-md`}
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
      <section data-section="Land Ownership" className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-14">
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

      {/* ── Impact overview ───────────────────────────────────────────────────── */}
      <section data-section="Impact Overview" className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-14">

        <FadeIn className="mb-8">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-gray-300" />
            Impact by category
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-4">
          {IMPACT_CARDS.map(({ to, cat, catColor, topBorder, headline, sourceKey }, i) => (
            <FadeIn key={to} delay={Math.min(i * 0.05, 0.12)}>
              <Link
                to={to}
                className={`group flex flex-col h-full bg-white border border-gray-200 border-t-[5px] ${topBorder} rounded-xl px-5 py-5 hover:shadow-glass-md hover:border-gray-300 transition-all duration-150`}
              >
                <p className={`text-2xs font-mono uppercase tracking-[0.2em] mb-3 ${catColor}`}>{cat}</p>
                <p className="text-sm font-display font-semibold text-gray-900 leading-snug flex-1 mb-4">{headline}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition-colors">
                    Full analysis
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <FootnoteList />
      </div>
      <PageNext
        to="/project"
        label="The Project"
        desc="Energy, jobs, taxes, and school funding — every figure with its source and condition."
        color="text-blue-700"
        hoverBorder="hover:border-blue-300"
      />
    </div>
    </FootnoteProvider>
  )
}
