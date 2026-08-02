import PageTitle from '../components/ui/PageTitle'
import StatCard from '../components/ui/StatCard'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { projections } from '../data/projections'

const { schoolFundingComparable: meta } = projections

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

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Education</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">School Funding Impact</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          No Grayslake-specific school funding projections exist yet. This page presents the
          DeKalb/Meta data center as an Illinois precedent case and identifies the districts
          that would receive revenue if a similar allocation model applies.
        </p>
      </FadeIn>

      <FadeIn>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5 mb-10">
          <div className="flex items-start gap-4">
            <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-display font-semibold text-blue-800 mb-1.5">Comparable Case Study — Not a Grayslake Projection</p>
              <p className="text-base text-gray-600 leading-relaxed">
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

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Meta / DeKalb — Total Tax" value={`$${meta.totalPropertyTaxBilled2025}M`} sub="Annual property tax (2025)"                                          accent="green" sourceKey="capitolnews2026" />
        <StatCard label="School District Share"     value={`${meta.percentToSchoolDistrict}%`}     sub={`of total to ${meta.districtName}`}                   accent="green" sourceKey="capitolnews2026" />
        <StatCard label="Other Taxing Bodies"       value={`${metaOtherPct}%`}                     sub="of total to county, library, etc."                    accent="blue"  sourceKey="capitolnews2026" />
        <StatCard label="Documented Outcome"        value="1 School Built"                         sub={meta.outcome}                                          accent="green" sourceKey="capitolnews2026" />
      </FadeIn>

      <div className="grid lg:grid-cols-5 gap-4 mb-8">
        <FadeIn className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Tax Allocation</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">DeKalb Precedent</h2>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-gray-400 mb-8">Meta / DeKalb, IL · 2025 tax year</p>
          <SchoolFundingChart />
        </FadeIn>

        <FadeIn delay={0.08} className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Case Study</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">Meta, DeKalb, IL</h2>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-gray-400 mb-6">Capitol News Illinois reporting · 2025</p>

          <dl className="space-y-0 mb-6">
            {[
              ['Facility',            meta.source],
              ['Year',                '2025 tax year'],
              ['Total property tax',  `$${meta.totalPropertyTaxBilled2025}M billed`],
              ['To schools',          `${meta.percentToSchoolDistrict}% of total`],
              ['District',            meta.districtName],
              ['Documented outcome',  meta.outcome],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <dt className="text-sm text-gray-500 shrink-0">{k}</dt>
                <dd className="text-sm text-gray-800 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
            <p className="text-2xs font-mono text-emerald-700 uppercase tracking-widest mb-2">Key Takeaway</p>
            <p className="text-base text-gray-600 leading-relaxed">
              In DeKalb, over 60% of a hyperscale data center's annual property tax bill flows
              directly to the school district. If a similar allocation applies in Grayslake,
              District 127 and District 46 would be the primary beneficiaries — but this depends
              entirely on the Lake County assessor's valuation, which has not been publicly projected.
            </p>
          </div>
        </FadeIn>
      </div>

      <FadeIn>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 mb-8">
          <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest mb-2">Data Gap — What We Don't Know Yet</p>
          <p className="text-base text-gray-600 leading-relaxed">
            No Grayslake-specific school funding estimate exists in any public document. The Village
            FAQ states the development agreements provide no financial incentives to T5. To project
            actual revenue to CUSD 127 or District 46, you would still need: (1) a Lake County
            Assessor valuation of the T5 campus and (2) the applicable tax levy rates for each district.
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Grayslake Districts That Would Receive Revenue</p>
        <div className="grid md:grid-cols-2 gap-3">
          {GRAYSLAKE_DISTRICTS.map(({ name, desc, sub }) => (
            <div key={name} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
              <p className="text-base font-display font-semibold text-gray-900 mb-0.5">{name}</p>
              <p className="text-sm text-gray-400 mb-3">{sub}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-2xs font-mono text-gray-300 uppercase tracking-widest">Est. annual share</span>
                <span className="text-xs text-gray-400">— no public projection yet</span>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

    </div>
  )
}
