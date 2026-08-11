import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const TAX_DISTRICTS = [
  { district: 'Grayslake CHSD 127', share: '~50-55%', role: 'High School District (Community High School)' },
  { district: 'Grayslake CCSD 46', share: '~25-30%', role: 'Elementary & Middle School District' },
  { district: 'Grayslake Fire Protection District', share: '~8-10%', role: 'Emergency & Fire Services' },
  { district: 'College of Lake County (Dist 532)', share: '~4-6%', role: 'Community College System' },
  { district: 'Grayslake Area Public Library', share: '~3-4%', role: 'Library District' },
  { district: 'Lake County Government', share: '~3-5%', role: 'County Services & Infrastructure' },
  { district: 'Avon Township / Road District', share: '~1-2%', role: 'Township Infrastructure' },
  { district: 'Lake County Forest Preserve', share: '~1-2%', role: 'Regional Conservation' },
]

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
          <h3 className="text-2xl font-display font-bold text-slate-900 mt-2">Distribution Across 8 Local Taxing Districts</h3>
          <p className="text-sm text-slate-600 mt-1">
            Property tax revenue from the Cornerstone development is allocated across local municipal and educational taxing bodies based on tax levy ratios.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-mono uppercase text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-3 font-semibold">Taxing District</th>
                <th className="py-2.5 px-3 font-semibold">Est. Levy Share</th>
                <th className="py-2.5 px-3 font-semibold">Primary Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-sans">
              {TAX_DISTRICTS.map(d => (
                <tr key={d.district} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{d.district}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-sky-800">{d.share}</td>
                  <td className="py-2.5 px-3 text-slate-600">{d.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  )
}
