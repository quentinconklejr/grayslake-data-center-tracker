import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
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
  return (
    <div className={asSection ? 'pt-1 pb-8' : 'max-w-7xl mx-auto px-4 sm:px-6 py-12'}>
      {!asSection && <PageTitle {...pageMeta['/tax-impact']} />}

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-3">Fiscal Revenue</p>
        {asSection ? (
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight mb-3">Tax Impact</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Tax Impact</h1>
        )}
        <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
          Analysis of developer fee allocations, property tax assessment projections, and revenue distribution across eight local taxing bodies.
        </p>
        <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-12">
        <StatCard label="Total Investment" value={figureById['investment'].value} sub="Estimated campus cost" accent="blue" sourceKey="govtech2025" />
        <StatCard label="Taxing Districts" value="8 Districts" sub="Local revenue recipients" accent="blue" sourceKey="villagefaq_archived" />
        <StatCard label="Developer Fees" value="$7.5M+" sub="Permit & infrastructure fees" accent="green" sourceKey="villagefaq_archived" />
        <StatCard label="EAV Growth" value="Pending" sub="Post-construction valuation" accent="amber" />
      </FadeIn>

      <FadeIn className="newsroom-card p-6 mb-10">
        <div className="border-b border-edge-soft pb-4 mb-5">
          <span className="text-xs font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            LOCAL TAXATION
          </span>
          <h3 className="text-2xl font-display font-bold text-slate-900 mt-2">The eight taxing districts named by the Village</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            These are the eight bodies the Village FAQ lists on page 2 as receiving property tax from
            the campus. Four of the eight are not Grayslake districts.
            <SourceCitation sourceKey="villagefaq_archived" />
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
          {taxingDistricts.map(d => (
            <li key={d.name} className="flex items-center gap-2.5 py-2.5 border-b border-slate-100">
              <span
                className={`shrink-0 w-1.5 h-1.5 rounded-full ${d.grayslake ? 'bg-sky-600' : 'bg-amber-500'}`}
                aria-hidden="true"
              />
              <span className="text-sm text-slate-700 leading-snug">{d.name}</span>
              {d.school && (
                <span className="ml-auto shrink-0 text-2xs font-mono uppercase tracking-widest text-slate-500">school</span>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4">
          <span className="inline-flex items-center gap-1.5 text-2xs font-mono uppercase tracking-widest text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" aria-hidden="true" /> Grayslake district
          </span>
          <span className="inline-flex items-center gap-1.5 text-2xs font-mono uppercase tracking-widest text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" /> Outside Grayslake
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mt-4 pt-4 border-t border-slate-100 max-w-prose">
          No per-district share has been published. What each district actually receives depends on the
          Lake County Assessor&rsquo;s valuation, which has not happened, and on each district&rsquo;s own
          levy, which it sets for itself. Any percentage split you see quoted for this campus is an
          estimate somebody made.
        </p>
      </FadeIn>
    </div>
  )
}
