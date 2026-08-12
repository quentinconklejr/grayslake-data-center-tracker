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
        {/* Hero.
            This was four stacked blocks of prose before a single number: the
            headline, a bordered callout, a paragraph about what the tracker is,
            and a verification date. Roughly ten lines to scroll past before the
            first fact, on a page whose whole job is facts.

            Cut to two. The callout lost its box - the border and tint were what
            made it read as heavy, and a box promises more than one sentence can
            pay off. The football-field comparison and the building count went
            with it; both are on The Project, where a reader has asked for
            detail. What is left is the one thing the cards below cannot say:
            what the buildings physically are.

            The line about the tracker collecting public records is about the
            SITE, not the project, so it folds into the verification stamp
            instead of taking a paragraph of its own.

            The subhead used to read "Warehouses full of computers, rented out
            to other companies, on farm fields at Peterson and Alleghany
            roads." That was three jobs in one sentence - define a data centre,
            explain the business model, give the location - and the first two
            carried a voice. "Warehouses full of computers" is plain-spoken
            right up until a reporter reads it as a sneer, and on a site whose
            only asset is neutrality that is a cost with no matching benefit.
            The definition was never needed; anyone here can work out what a
            data centre is. The leasing model is a real and load-bearing fact,
            because it is why no tenant can be named, but it belongs on The
            Project where a reader has asked for it.

            What survives is the location, in the form locals actually use.
            Nobody in Grayslake navigates by "Grayslake" - the headline
            already said that - they navigate by the crossroads.

            Sizing: the headline was text-5xl in a max-w-4xl box while the cards
            under it run the full max-w-6xl. On a laptop that set three short
            ragged lines above two wide cards, so the page looked like two
            different layouts stacked. It is now a step smaller with a slightly
            wider measure, which puts it on two lines and lines its right edge
            up nearer the cards. Mobile is untouched at text-3xl. */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-display font-extrabold text-slate-900 tracking-tight leading-[1.08] max-w-5xl">
            T5 @ Chicago IV is an approved hyperscale data center under construction in Grayslake, Illinois.
          </h1>
          <p className="text-base sm:text-lg font-sans text-slate-700 max-w-4xl leading-relaxed">
            Farm fields at Peterson and Alleghany roads.
          </p>
          <div className="text-xs font-mono text-slate-500">
            Every claim linked to its source &middot; Last verified {LAST_VERIFIED}
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
            {/* This was one fused number, $8.5-18B, pulled from keyFigures.js -
                a file whose own note on that entry reads "two figures from two
                people, not a range anyone calculated". Printing it as a single
                span is exactly the thing the data layer warns against: an en
                dash between two numbers means every value in between was
                considered, and nobody considered them. The headline stopped
                doing this earlier; this card was the last place on the site
                that still did, and the last open item from the first audit.

                Two numbers, a separator, and the speakers named. */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900">$8.5B</span>
              <span className="text-2xl sm:text-3xl font-display font-bold text-slate-400">/</span>
              <span className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900">$18B</span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed">
              Two estimates, not a range. Grayslake’s mayor said $8.5B; T5’s chief executive said up to
              $18B. Nobody has published a figure in between, and no independent valuation exists.
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
            {/* The caption used to read "Approved campus boundary covers up to
                472 acres" directly under a map, which invites the reader to
                assume the 472 acres are the shape they are looking at. They are
                not. The map draws 57 recorded deeds; parcelsOutline.geojson
                says so in its own metadata. The sentence now states plainly
                that the approved campus is bigger and is not on the map. */}
            <p className="text-xs font-sans text-slate-600 mt-0.5">
              287.8 acres across 57 parcels in Grayslake, IL. The approved campus is larger, up to 472 acres, and is not mapped.
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
