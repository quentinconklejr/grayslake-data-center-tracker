import PageTitle from '../components/ui/PageTitle'
import StatCard from '../components/ui/StatCard'
import TaxRevenueChart from '../components/charts/TaxRevenueChart'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { projections } from '../data/projections'

const { project, fees, schoolFundingComparable: meta, stateIncentiveContext: incentive } = projections

const metaSchoolM = +(meta.totalPropertyTaxBilled2025 * meta.percentToSchoolDistrict / 100).toFixed(1)
const metaOtherM  = +(meta.totalPropertyTaxBilled2025 - metaSchoolM).toFixed(1)

const FEE_DATA = [
  { name: 'Major infrastructure projects', pct: 50, color: '#f59e0b', label: '50%' },
  { name: 'Special community projects',    pct: 25, color: '#0ea5e9', label: '25%' },
  { name: 'Resident cost-control',         pct: 25, color: '#10b981', label: '25%' },
]

export default function TaxImpact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Tax Impact" />

      {/* Header */}
      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-blue-400/50 uppercase tracking-[0.2em] mb-3">Fiscal Impact</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Tax Revenue &amp; Developer Fees</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          Village officials project "{fees.totalDescription}" in developer fees if fully built out.
          Exact property tax revenue depends on Lake County assessor valuation, which has not
          been publicly projected. The DeKalb/Meta data center provides the closest Illinois precedent.
        </p>
      </FadeIn>

      {/* Stats */}
      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Total Investment"    value={`$${project.costLow}–${project.costHigh}B`} sub="Developer-stated range" badge="Range" accent="blue"  sourceKey="dcd2026" />
        <StatCard label="Developer Fees"      value="Tens of millions"                             sub="If fully built out"                  accent="blue"  sourceKey="villageoffaq" />
        <StatCard label="Meta / DeKalb Ref."  value={`$${meta.totalPropertyTaxBilled2025}M`}      sub="Annual property tax (2025)"           accent="green" sourceKey="capitolnews2026" />
        <StatCard label="DeKalb → Schools"    value={`$${metaSchoolM}M`}                          sub={`${meta.percentToSchoolDistrict}% of DeKalb tax`} accent="green" sourceKey="capitolnews2026" />
      </FadeIn>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-px bg-gray-800/20 rounded-xl overflow-hidden border border-gray-800/40 mb-8">

        {/* Fee allocation */}
        <FadeIn className="bg-gray-950 p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Village Agreement</p>
              <h2 className="text-lg font-display font-bold text-gray-200">Developer Fee Allocation</h2>
            </div>
            <SourceCitation sourceKey="villageoffaq" />
          </div>
          <p className="text-xs text-gray-500 mb-8">Per Village of Grayslake agreement · % of total fees collected</p>
          <TaxRevenueChart data={FEE_DATA} />
        </FadeIn>

        {/* DeKalb comparable */}
        <FadeIn delay={0.08} className="bg-gray-950 p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Illinois Precedent</p>
              <h2 className="text-lg font-display font-bold text-gray-200">Meta / DeKalb, IL</h2>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-xs text-gray-500 mb-6">Closest publicly documented Illinois data center tax case</p>

          <SchoolFundingChart />

          <dl className="mt-8 space-y-0 border-t border-gray-800/40 pt-6">
            {[
              ['Facility',         meta.source],
              ['Tax year',         '2025'],
              ['Total billed',     `$${meta.totalPropertyTaxBilled2025}M / year`],
              ['School district',  meta.districtName],
              ['School share',     `${meta.percentToSchoolDistrict}% → $${metaSchoolM}M / yr`],
              ['Other bodies',     `${(100 - meta.percentToSchoolDistrict).toFixed(1)}% → $${metaOtherM}M / yr`],
              ['Outcome',          meta.outcome],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-800/30 last:border-0">
                <dt className="text-xs text-gray-500 shrink-0">{k}</dt>
                <dd className="text-xs text-gray-200 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>

      {/* State incentive note */}
      <FadeIn>
        <div className="bg-amber-400/5 border border-amber-500/20 rounded-xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xs font-mono text-amber-400/60 uppercase tracking-widest mb-2">State Incentive Program — Status Change</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {incentive.statusChange}. The program had required ${incentive.minInvestmentRequired}M+ investment over
                60 months and offered a {incentive.constructionWageTaxCredit}% construction wage tax credit for projects
                in underserved areas. Whether T5 secured incentive status before the deadline is not publicly confirmed.
              </p>
            </div>
            <SourceCitation sourceKey="dceo2026" />
          </div>
        </div>
      </FadeIn>

    </div>
  )
}
