import PageTitle from '../components/ui/PageTitle'
import StatCard from '../components/ui/StatCard'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { projections } from '../data/projections'

const { schoolFundingComparable: meta } = projections

const metaSchoolM = +(meta.totalPropertyTaxBilled2025 * meta.percentToSchoolDistrict / 100).toFixed(1)
const metaOtherM  = +(meta.totalPropertyTaxBilled2025 - metaSchoolM).toFixed(1)
const metaOtherPct = +(100 - meta.percentToSchoolDistrict).toFixed(1)

const GRAYSLAKE_DISTRICTS = [
  { name: 'Grayslake CUSD 127',    desc: 'High school and middle school district. Includes Grayslake Central and North High Schools.', sub: 'Largest district taxing body by levy share' },
  { name: 'Grade School District 46', desc: 'Elementary schools within Avon Township. Likely the primary beneficiary after CUSD 127.', sub: 'Elementary through 8th grade' },
  { name: 'College of Lake County', desc: 'Community college receiving a share of Lake County property tax extensions.', sub: 'CLC — Grayslake campus' },
  { name: 'Other Taxing Bodies',    desc: 'Grayslake Public Library, Grayslake-Avon Fire Protection District, Avon Township road district.', sub: 'Fire, library, township' },
]

export default function Schools() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="School Funding" />

      {/* Header */}
      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-violet-400/50 uppercase tracking-[0.2em] mb-3">Education</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">School Funding Impact</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          No Grayslake-specific school funding projections exist yet. This page presents the
          DeKalb/Meta data center as an Illinois precedent case and identifies the districts
          that would receive revenue if a similar allocation model applies.
        </p>
      </FadeIn>

      {/* Comparable disclaimer */}
      <FadeIn>
        <div className="bg-blue-400/5 border border-blue-500/20 rounded-xl px-6 py-5 mb-10">
          <div className="flex items-start gap-4">
            <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-display font-semibold text-blue-300 mb-1.5">Comparable Case Study — Not a Grayslake Projection</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                The data below comes from the Meta data center in DeKalb, IL — a similar AI/hyperscale
                facility elsewhere in Illinois. It is used here as the best available public precedent
                for how a large data center's property taxes are distributed to schools. No Lake County
                assessor valuation or Grayslake school district revenue figure has been publicly released.
              </p>
              <div className="mt-3"><SourceCitation sourceKey="capitolnews2026" /></div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Meta / DeKalb — Total Tax" value={`$${meta.totalPropertyTaxBilled2025}M`} sub="Annual property tax (2025)"                          accent="green" sourceKey="capitolnews2026" />
        <StatCard label="School District Share"     value={`${meta.percentToSchoolDistrict}%`}     sub={`$${metaSchoolM}M / yr to ${meta.districtName}`}    accent="green" sourceKey="capitolnews2026" />
        <StatCard label="Other Taxing Bodies"       value={`${metaOtherPct}%`}                     sub={`$${metaOtherM}M / yr to county, library, etc.`}    accent="blue"  sourceKey="capitolnews2026" />
        <StatCard label="Documented Outcome"        value="1 School Built"                         sub={meta.outcome}                                         accent="green" sourceKey="capitolnews2026" />
      </FadeIn>

      {/* Chart + case study */}
      <div className="grid lg:grid-cols-5 gap-4 mb-8">
        <FadeIn className="lg:col-span-2 bg-gray-900/40 border border-gray-800/50 rounded-xl p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Tax Allocation</p>
              <h2 className="text-lg font-display font-bold text-gray-200">DeKalb Precedent</h2>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-gray-500 mb-8">Meta / DeKalb, IL · 2025 tax year</p>
          <SchoolFundingChart />
        </FadeIn>

        <FadeIn delay={0.08} className="lg:col-span-3 bg-gray-900/40 border border-gray-800/50 rounded-xl p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Case Study</p>
              <h2 className="text-lg font-display font-bold text-gray-200">Meta, DeKalb, IL</h2>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-gray-500 mb-6">Capitol News Illinois reporting · 2025</p>

          <dl className="space-y-0 mb-6">
            {[
              ['Facility',            meta.source],
              ['Year',                '2025 tax year'],
              ['Total property tax',  `$${meta.totalPropertyTaxBilled2025}M billed`],
              ['To schools',          `${meta.percentToSchoolDistrict}% → $${metaSchoolM}M / yr`],
              ['District',            meta.districtName],
              ['Documented outcome',  meta.outcome],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-3 py-2.5 border-b border-gray-800/30 last:border-0">
                <dt className="text-xs text-gray-500 shrink-0">{k}</dt>
                <dd className="text-xs text-gray-200 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-emerald-400/5 border border-emerald-500/20 rounded-xl px-5 py-4">
            <p className="text-2xs font-mono text-emerald-400/60 uppercase tracking-widest mb-2">Key Takeaway</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              In DeKalb, over 60% of a hyperscale data center's annual property tax bill flows
              directly to the school district. If a similar allocation applies in Grayslake,
              District 127 and District 46 would be the primary beneficiaries — but this depends
              entirely on the Lake County assessor's valuation, which has not been publicly projected.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Data gap */}
      <FadeIn>
        <div className="bg-amber-400/5 border border-amber-500/20 rounded-xl px-6 py-5 mb-8">
          <p className="text-2xs font-mono text-amber-400/60 uppercase tracking-widest mb-2">Data Gap — What We Don't Know Yet</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            No Grayslake-specific school funding estimate exists in any public document. To project
            actual revenue to CUSD 127 or District 46, you would need: (1) a Lake County Assessor
            valuation of the T5 campus, (2) the applicable tax levy rates for each district, and
            (3) any abatement or incentive agreements that reduce taxable value.
          </p>
        </div>
      </FadeIn>

      {/* District cards */}
      <FadeIn>
        <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-5">Grayslake Districts That Would Receive Revenue</p>
        <div className="grid md:grid-cols-2 gap-3">
          {GRAYSLAKE_DISTRICTS.map(({ name, desc, sub }) => (
            <div key={name} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-5">
              <p className="text-sm font-display font-semibold text-gray-200 mb-0.5">{name}</p>
              <p className="text-xs text-gray-500 mb-3">{sub}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              <div className="mt-4 pt-3 border-t border-gray-800/40 flex justify-between">
                <span className="text-2xs font-mono text-gray-700 uppercase tracking-widest">Est. annual share</span>
                <span className="text-xs text-gray-500">— no public projection yet</span>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

    </div>
  )
}
