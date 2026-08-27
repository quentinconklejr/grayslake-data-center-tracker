import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import SiteMap from '../components/map/SiteMap'
import UpdatesSignup from '../components/ui/UpdatesSignup'
import ParcelTable from '../components/map/ParcelTable'
import Container from '../components/layout/Container'
import { PARCELS_DATA } from '../data/parcels'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project } = projections

/*
 * Five secondary figures rendered as a records grid below the two hero
 * numbers. Kept in this order deliberately: capacity numbers first (the
 * three GW/MW figures cluster naturally), then timeline, then acreage.
 * Every value/note string is passed through unchanged.
 */
const SECONDARY_STATS = [
  { label: 'IT Capacity',    numValue: project.totalCapacityMW, suffix: ' MW', note: 'Leasable at full buildout' },
  { label: 'Secured Power',  numValue: project.securedPowerMW,  suffix: ' MW', note: 'Utility-contracted capacity' },
  { label: 'ComEd Capacity', value: `${project.comEdCapacityGW} GW`,           note: 'Secured from ComEd, per T5 CEO' },
  { label: 'Phase 1 Online', value: project.firstBuildingOnline,               note: 'Under construction now' },
  { label: 'Approved Max',   numValue: project.totalAcres,      suffix: ' ac', note: 'Approved campus maximum' },
]

export default function Home() {
  return (
    <FootnoteProvider>
      <Container size="wide" className="pt-8 sm:pt-10 space-y-10 sm:space-y-12">
        <PageTitle
          title={pageMeta['/'].title}
          description={pageMeta['/'].description}
          ogImage={pageMeta['/'].ogImage}
        />

        {/* ── Hero ─────────────────────────────────────────────────────
            One h1, one subhead of one sentence, one verified-line. The
            editorial choice is size and face — Fraunces at 4xl/5xl in a
            reading measure, not extrabold Inter stretched across the
            page. The verified-line stays in the data face so the date
            reads as a stamp, not as prose. */}
        <header className="space-y-4 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 leading-[1.05] tracking-[-0.02em]">
            T5 @ Chicago IV is an approved hyperscale data center under construction in Grayslake, Illinois.
          </h1>
          <p className="text-lg sm:text-xl font-sans text-ink-700 leading-snug">
            Farm fields at Peterson and Alleghany roads.
          </p>
          <p className="text-2xs font-mono text-ink-500 pt-1">
            Every claim linked to its source &middot; Last verified {LAST_VERIFIED}
          </p>
        </header>

        {/* ── Permanent-jobs figure ────────────────────────────────────
            The old design put this behind rounded-2xl + shadow-sm. The
            editorial move is a rule above and below, a size-driven
            figure, and the qualifier as ordinary prose beneath — so the
            reader sees "up to 1,680" and the condition attached to it in
            the same glance. Drop font-extrabold; Fraunces at this size
            has plenty of weight on its own. */}
        <section aria-labelledby="jobs-figure" className="border-t border-rule pt-6 sm:pt-8">
          <p id="jobs-figure" className="text-sm font-sans font-semibold text-ink-900">
            Permanent jobs (estimated max)
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 leading-none">
            <span className="text-xl sm:text-2xl font-sans text-ink-500">up to</span>
            <AnimatedNumber
              value={1680}
              duration={0.8}
              className="text-6xl sm:text-7xl font-display text-ink-900 tracking-[-0.03em]"
            />
          </p>
          <p className="mt-5 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
            Village FAQ estimate, conditional on all 10 million sq ft being built. Excludes construction jobs. Grayslake Mayor Elizabeth Davies cited 1,500 (Oct. 2025); T5 chief executive Pete Marin cited &ldquo;over 1,600&rdquo; (Jul. 2026).
          </p>
          <p className="mt-4">
            <Link to="/project#jobs" className="inline-flex items-center text-sm font-sans font-semibold text-accent hover:text-accent-hover">
              Full range on The Project →
            </Link>
          </p>
        </section>

        {/* ── Investment figure — two contested numbers ────────────────
            The most editorially sensitive block on the site. The whole
            point is that $8.5B and $18B are two different people making
            two different claims, not a range anyone calculated. The old
            design fused them with a slate slash; this treatment gives
            each figure its own column, separates them with a real
            vertical rule on wide screens, and keeps the disambiguating
            paragraph as part of the composition rather than a small
            gray afterthought beneath. On mobile the rule becomes a
            horizontal separator so the two-things quality survives when
            the columns stack.

            Copy is untouched — the paragraph beneath is the same
            sentence the old design carried, with speaker names intact. */}
        <section aria-labelledby="investment-figure" className="border-t border-b border-rule py-6 sm:py-8">
          <p id="investment-figure" className="text-sm font-sans font-semibold text-ink-900">
            Total estimated investment
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] sm:items-baseline gap-x-8 gap-y-6">
            <div className="sm:text-right">
              <p className="text-5xl sm:text-6xl font-display text-ink-900 leading-none tracking-[-0.03em]">
                $8.5B
              </p>
              <p className="mt-3 text-sm font-sans font-semibold text-ink-600">
                Grayslake&rsquo;s mayor
              </p>
            </div>
            <div className="hidden sm:block self-stretch w-px bg-rule mx-auto" aria-hidden="true" />
            {/* Mobile separator between $8.5B and $18B. This rule carries the
                "two competing estimates, not a range" reading when the two
                figures stack. Must remain visible — rule-strong, not
                rule-soft — or the two numbers read as one continuous stat
                and the editorial point of the block collapses. Do not
                degrade to hairline in any future sweep. */}
            <hr className="sm:hidden border-0 border-t border-rule-strong" aria-hidden="true" />
            <div>
              <p className="text-5xl sm:text-6xl font-display text-ink-900 leading-none tracking-[-0.03em]">
                $18B
              </p>
              <p className="mt-3 text-sm font-sans font-semibold text-ink-600">
                T5&rsquo;s chief executive
              </p>
            </div>
          </div>
          <p className="mt-6 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
            Two estimates, not a range. Grayslake&rsquo;s mayor said $8.5B; T5&rsquo;s chief executive said up to $18B. Nobody has published a figure in between, and no independent valuation exists.
          </p>
          <p className="mt-4">
            <Link to="/project#tax" className="inline-flex items-center text-sm font-sans font-semibold text-accent hover:text-accent-hover">
              Fiscal range on The Project →
            </Link>
          </p>
        </section>

        {/* Five-column records grid on wide screens, stacked on mobile.
            Every note string is passed through unchanged from
            SECONDARY_STATS. */}
        <section aria-label="Project figures" className="border-t border-rule pt-8">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y divide-rule-strong sm:divide-y-0 sm:divide-x sm:divide-rule-strong">
            {SECONDARY_STATS.map(({ label, numValue, suffix = '', value, note }, i) => (
              <div key={label} className={`py-5 ${i === 0 ? 'sm:pl-0' : 'sm:pl-5'} sm:pr-5`}>
                <dt className="text-xs font-sans font-semibold text-ink-600">
                  {label}
                </dt>
                <dd className="mt-2 text-2xl font-display text-ink-900 tracking-tight">
                  {numValue != null ? <AnimatedNumber value={numValue} suffix={suffix} /> : value}
                </dd>
                <p className="mt-1.5 text-xs font-sans text-ink-600 leading-snug">{note}</p>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Land ownership / map / parcels ────────────────────────────
            The eyebrow-mono LAND OWNERSHIP kicker is gone. The heading
            and caption stand on their own. Copy is unchanged; the map
            chrome and parcel-table chrome are refactored in their own
            commits. */}
        <section aria-labelledby="land-ownership" className="space-y-5">
          <div className="max-w-3xl">
            <h2 id="land-ownership" className="text-3xl font-display text-ink-900 tracking-tight">
              Land Recorded to T5
            </h2>
            <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed">
              287.8 acres across 57 parcels in Grayslake, IL. The approved campus is larger, up to 472 acres, and is not mapped.
            </p>
          </div>
          <SiteMap showCaption={false} />
          <ParcelTable parcels={PARCELS_DATA} />
        </section>

        <UpdatesSignup />

        <FootnoteList />
      </Container>
    </FootnoteProvider>
  )
}
