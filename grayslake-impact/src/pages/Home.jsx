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

// "once per session" key — shared so all hero numbers skip together on revisit
const HERO_SESSION_KEY = 'gdct-hero-animated'

// Homepage impact cards — one sentence each, link to /project for the full analysis.
// Charts live on /project where readers have chosen to go deeper; the homepage teases.

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
      <section data-section="Key Facts" className="bg-gradient-to-b from-blue-50/60 to-white border-b border-edge-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-14">

          <RevealHeadline
            as="h1"
            text="T5 @ Chicago IV is an approved $8.5–18B hyperscale AI data center under construction in Grayslake, Illinois."
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-5 max-w-[52ch]"
          />

          {/* The plain-language gloss sits after the headline: it explains the
              headline, so it cannot precede it. */}
          <Reveal delay={0.1}>
            <p className="text-lg text-blue-800 font-medium mb-5 max-w-[60ch] border-l-2 border-blue-300 pl-4">
              In plain language: a very large computing facility, one of the biggest proposed anywhere in the U.S.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="text-xl text-gray-600 leading-relaxed max-w-[65ch] mb-4">
              This tracker collects public records and press coverage on the project and links every
              claim to its source.
            </p>
            <p className="text-2xs font-mono text-gray-500 mb-8">Last verified {LAST_VERIFIED}</p>
          </Reveal>

          {/* Headline stats — typographically dominant */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-0 border-t border-edge-soft pt-10">

            <Reveal className="md:pr-12 md:border-r border-gray-300">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.18em] mb-4">Permanent Jobs (estimated max)</p>
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
                to change. Excludes construction jobs. Grayslake Mayor Elizabeth Davies cited 1,500 (Oct. 2025);
                T5 chief executive Pete Marin cited &ldquo;over 1,600&rdquo; (Jul. 2026).<SourceCitation sourceKey="villagefaq_archived" />{' '}
                <Link to="/project#jobs" className="text-blue-600 hover:text-blue-700 transition-colors">Full range on The Project →</Link>
              </p>
              <CopyKPIButton copyText={figureCopyText('jobs-permanent')} />
            </Reveal>

            <Reveal delay={0.08} className="md:pl-12 border-t border-gray-300 pt-10 md:pt-0 md:border-t-0">
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.18em] mb-4">Total Estimated Investment</p>
              <p className="text-6xl sm:text-7xl font-display font-black text-gray-900 leading-none tracking-tighter">
                {figureById['investment'].value}
              </p>
              <p className="text-sm text-gray-500 mt-4 leading-snug">
                Grayslake&rsquo;s mayor put it at $8.5B; T5&rsquo;s chief executive said up to $18B.
                No independent valuation has been published.<SourceCitation sourceKey="govtech2025" />
              </p>
              <CopyKPIButton copyText={figureCopyText('investment')} />
            </Reveal>

          </div>


      {/* ── Site map ─────────────────────────────────────────────────────────── */}
      <section data-section="Land Ownership" className="-mx-4 sm:-mx-6 mt-12 mb-4 px-4 sm:px-6">
        <FadeIn>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.2em] mb-1">Land Ownership</p>
              <h2 className="text-3xl font-display font-bold text-gray-900">Land recorded to T5</h2>
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

        </div>
      </section>


      <PageNext
        prominent
        to="/project"
        label="The Project"
        desc="Energy, jobs, taxes, and school funding, every figure with its source and condition."
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
