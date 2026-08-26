import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import Container from '../components/layout/Container'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'
import { projections } from '../data/projections'

const { taxingDistricts } = projections

// The table that used to live here listed eight districts with "Est. Levy
// Share" percentages and no citation, and its districts did not match the
// eight the Village FAQ actually names on page 2 - it included Grayslake CCSD
// 46, College of Lake County and the Forest Preserve, none of which appear in
// the FAQ list. Two contradictory lists of "eight taxing districts" sat a few
// screens apart on the same page, one of them carrying invented-looking
// numbers. Replaced with the FAQ list, cited.

// asSection is how the other three impact pages render inside the /project
// accordion. TaxImpact never accepted it, so inside a panel it rendered its
// own h1 and its own PageTitle, which rewrote the browser tab to the Tax page.
export default function TaxImpact({ asSection = false }) {
  const body = (
    <>
      {!asSection && <PageTitle {...pageMeta['/tax-impact']} />}

      <FadeIn className="mb-10 pb-8 border-b border-rule">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Fiscal Revenue</p>
        {asSection ? (
          <h3 className="text-3xl font-display text-ink-900 tracking-tight leading-tight mb-3">Tax Impact</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">Tax Impact</h1>
        )}
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          Developer fees, property tax projections, and revenue across eight local taxing bodies.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
        <StatCard label="Total Investment" value={figureById['investment'].value} sub="Estimated campus cost"     accent="blue"  sourceKey="govtech2025" />
        <StatCard label="Taxing Districts" value="8 Districts"                    sub="Local revenue recipients" accent="blue"  sourceKey="villagefaq_archived" />
        <StatCard label="Developer Fees"   value="$7.5M+"                         sub="Permit & infrastructure fees" accent="green" sourceKey="villagefaq_archived" />
        <StatCard label="EAV Growth"       value="Pending"                        sub="Post-construction valuation" accent="amber" />
      </FadeIn>

      <FadeIn className="mb-10 border-t border-rule pt-6">
        <div className="pb-4 mb-5">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-1">Local Taxation</p>
          <h3 className="text-2xl font-display text-ink-900 tracking-tight">The eight taxing districts named by the Village</h3>
          <p className="text-base font-sans text-ink-700 mt-2 max-w-prose leading-relaxed">
            These are the eight bodies the Village FAQ lists on page 2 as receiving property tax from
            the campus. Four of the eight are not Grayslake districts.
            <SourceCitation sourceKey="villagefaq_archived" />
          </p>
        </div>

        {/* Row treatment carries the Grayslake/Outside distinction as a
            visible text tag on every row — the previous colour-coded
            dot was aria-hidden and failed WCAG 1.4.1 for sighted users
            with colour-vision deficiency. Text is now the primary
            channel; the earlier decorative legend below the list is
            redundant and has been removed. */}
        <ul className="grid sm:grid-cols-2 gap-x-10 divide-y divide-rule-strong sm:divide-y-0 border-y border-rule sm:border-t sm:border-b">
          {taxingDistricts.map(d => (
            <li key={d.name} className="flex items-baseline gap-3 py-3 sm:border-b sm:border-rule-strong">
              <span className="text-sm font-sans text-ink-800 leading-snug flex-1 min-w-0">{d.name}</span>
              <span className="shrink-0 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">
                {d.grayslake ? 'Grayslake' : 'Outside'}
              </span>
              {d.school && (
                <span className="shrink-0 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">School</span>
              )}
            </li>
          ))}
        </ul>

        <p className="text-sm font-sans text-ink-600 leading-relaxed mt-6 pt-4 border-t border-rule-soft max-w-prose">
          No per-district share has been published. What each district actually receives depends on the
          Lake County Assessor&rsquo;s valuation, which has not happened, and on each district&rsquo;s own
          levy, which it sets for itself. Any percentage split you see quoted for this campus is an
          estimate somebody made.
        </p>
      </FadeIn>
    </>
  )

  return asSection ? (
    <div className="pt-1 pb-8">{body}</div>
  ) : (
    <Container size="wide" className="py-12">{body}</Container>
  )
}
