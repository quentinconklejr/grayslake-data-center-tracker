import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import SiteMap from '../components/map/SiteMap'
import UpdatesSignup from '../components/ui/UpdatesSignup'
import ParcelTable from '../components/map/ParcelTable'
import { PARCELS_DATA } from '../data/parcels'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project } = projections

const SECONDARY_STATS = [
  { label: 'IT Capacity', numValue: project.totalCapacityMW, suffix: ' MW', note: 'Leasable at full buildout' },
  { label: 'Secured Power', numValue: project.securedPowerMW, suffix: ' MW', note: 'Utility-contracted capacity' },
  { label: 'ComEd Capacity', value: `${project.comEdCapacityGW} GW`, note: 'Secured from ComEd, per T5 CEO' },
  { label: 'Phase 1 Online', value: project.firstBuildingOnline, note: 'Under construction now' },
  { label: 'Approved Max', numValue: project.totalAcres, suffix: ' ac', note: 'Approved campus maximum' },
]

export default function Home() {
  return (
    <FootnoteProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <PageTitle 
          title={pageMeta['/'].title} 
          description={pageMeta['/'].description} 
          ogImage={pageMeta['/'].ogImage} 
        />

        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-none max-w-4xl">
            T5 @ Chicago IV is an approved hyperscale data center under construction in Grayslake, Illinois.
          </h1>
          {/* This box used to read "In plain language: a very large computing
              facility. Two figures have been put on its cost: ..." Four things
              were wrong with it. Announcing that plain language is coming is
              the tell - a person just writes plainly. "Very large" is a
              non-measurement sitting among 1,200 MW and 287.8 acres. "Two
              figures have been put on its cost" is passive with no actor, and
              names the actors in the same breath anyway. And it repeated the
              investment card 200px below it, so a highlighted box delivered a
              definition plus a duplicate.

              It now says the one thing nothing else above the fold says: what
              the thing physically is and how big. Square footage is the
              approval figure; the football-field number is that figure divided
              by 57,600. The building count is deliberately attributed, because
              the approval document does not give one. */}
          <p className="text-base sm:text-lg font-sans text-sky-900 bg-sky-50 p-4 rounded-xl border border-sky-200 max-w-3xl leading-relaxed font-medium">
            Warehouses full of computers, rented out to other companies. The approvals allow up to
            10.1 million square feet of them on farm fields at Peterson and Alleghany roads, roughly
            175 football fields of floor space. The approval document gives no building count;
            reporting puts it at 18.
          </p>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            This tracker collects public records and press coverage on the project and links every claim to its source.
          </p>
          <div className="text-xs font-mono text-slate-500">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Hero Big Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-3">
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500">
              PERMANENT JOBS (ESTIMATED MAX)
            </div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl text-slate-500 font-semibold">up to</span>
              <AnimatedNumber value={1680} duration={0.8} />
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed">
              Village FAQ estimate, conditional on all 10 million sq ft being built. Excludes construction jobs. Grayslake Mayor Elizabeth Davies cited 1,500 (Oct. 2025); T5 chief executive Pete Marin cited “over 1,600” (Jul. 2026).
            </p>
            <Link to="/project#jobs" className="inline-flex items-center text-xs font-mono font-bold text-sky-800 hover:text-sky-900 pt-1">
              Full range on The Project →
            </Link>
          </div>

          <div className="p-6 sm:p-8 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-3">
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500">
              TOTAL ESTIMATED INVESTMENT
            </div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900">
              {figureById['investment']?.value || '$8.5–18B'}
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed">
              Grayslake’s mayor put it at $8.5B; T5’s chief executive said up to $18B. No independent valuation has been published.
            </p>
            <Link to="/project#tax" className="inline-flex items-center text-xs font-mono font-bold text-sky-800 hover:text-sky-900 pt-1">
              Fiscal range on The Project →
            </Link>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SECONDARY_STATS.map(({ label, numValue, suffix = '', value, note }) => (
            <div key={label} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
              <div className="text-2xs font-mono font-bold text-slate-500 uppercase">{label}</div>
              <div className="text-xl font-display font-bold text-slate-900">
                {numValue != null ? <AnimatedNumber value={numValue} suffix={suffix} /> : value}
              </div>
              <div className="text-2xs font-sans text-slate-500">{note}</div>
            </div>
          ))}
        </div>

        {/* Map & Parcel Directory */}
        <div className="space-y-4">
          <div>
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-sky-800">LAND OWNERSHIP</div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Land Recorded to T5</h2>
            <p className="text-xs font-sans text-slate-600 mt-0.5">
              287.8 acres across 57 parcels in Grayslake, IL. Approved campus boundary covers up to 472 acres.
            </p>
          </div>
          <SiteMap showCaption={false} />
          <ParcelTable parcels={PARCELS_DATA} />
        </div>

        <UpdatesSignup />

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
