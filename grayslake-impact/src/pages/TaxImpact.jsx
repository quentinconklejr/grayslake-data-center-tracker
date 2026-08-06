import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import TaxRevenueChart from '../components/charts/TaxRevenueChart'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, fees, schoolFundingComparable: meta, stateIncentiveContext: incentive, taxingDistricts, taxingDistrictsNote } = projections

const metaOtherPct = +(100 - meta.percentToSchoolDistrict).toFixed(1)

const FEE_DATA = [
  { name: 'Major infrastructure projects', pct: 50, color: '#d97706', bg: 'rgba(217,119,6,0.09)', label: '50%' },
  { name: 'Special community projects',    pct: 25, color: '#0284c7', bg: 'rgba(2,132,199,0.09)', label: '25%' },
  { name: 'Resident cost-control',         pct: 25, color: '#059669', bg: 'rgba(5,150,105,0.09)', label: '25%' },
]

export default function TaxImpact({ asSection = false }) {
  return (
    <FootnoteProvider>
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`}>
      {!asSection && <PageTitle {...pageMeta['/tax-impact']} />}

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600 uppercase tracking-[0.18em] mb-4">Fiscal Impact</p>
        {asSection ? (
          <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Tax Revenue &amp; Developer Fees</h2>
        ) : (
          <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tight mb-3">Tax Revenue &amp; Developer Fees</h1>
        )}
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Village officials project "{fees.totalDescription}" in developer fees.
          Property tax revenue depends on Lake County assessor valuation, which has not been
          publicly projected. The DeKalb/Meta data center provides the closest Illinois precedent.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Total Investment"    value={figureById['investment'].value} sub={figureById['investment'].qualifier} badge="Range" accent="blue"  sourceKey="govtech2025" />
        <StatCard label="Developer Fees"      value="Tens of millions"                             sub="Ballpark, per Mayor Davies"          accent="blue"  sourceKey="govtech2025" />
        <StatCard label="Meta / DeKalb"        value={`$${meta.totalPropertyTaxBilled2025}M`}      sub="One facility, 2025 tax year"          accent="green" sourceKey="capitolnews2026" />
        <StatCard label="DeKalb → Schools"    value={`${meta.percentToSchoolDistrict}%`}            sub="Avg. across 3 properties, 2021–2024"              accent="green" sourceKey="capitolnews2026" />
      </FadeIn>

      <FadeIn className="glass-card px-6 py-6 mb-8">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Who Receives the Tax Base</p>
            <h2 className="text-3xl font-display font-bold text-gray-900">Taxing districts covering the campus</h2>
          </div>
          <SourceCitation sourceKey="villagefaq_archived" />
        </div>
        <p className="text-sm text-gray-500 mb-6 max-w-prose">
          Four of the eight districts listed by the Village sit outside Grayslake. The campus straddles
          district lines, so part of the tax base it creates accrues to Round Lake, Fremont and Mundelein
          districts rather than to Grayslake ones.
        </p>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-0 mb-5">
          {taxingDistricts.map(d => (
            <li key={d.name} className="flex items-center gap-2.5 py-2.5 border-b border-gray-100">
              <span
                className={`shrink-0 w-1.5 h-1.5 rounded-full ${d.grayslake ? 'bg-blue-500' : 'bg-amber-500'}`}
                aria-hidden="true"
              />
              <span className="text-sm text-gray-700 leading-snug">{d.name}</span>
              {d.school && (
                <span className="ml-auto shrink-0 text-2xs font-mono uppercase tracking-widest text-gray-400">school</span>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4">
          <span className="inline-flex items-center gap-1.5 text-2xs font-mono uppercase tracking-widest text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" /> Grayslake district
          </span>
          <span className="inline-flex items-center gap-1.5 text-2xs font-mono uppercase tracking-widest text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" /> Outside Grayslake
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{taxingDistrictsNote}</p>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200 mb-8">

        <FadeIn className="bg-white p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Mayor's Estimate</p>
              <h2 className="text-3xl font-display font-bold text-gray-900">Developer Fee Allocation</h2>
            </div>
            <SourceCitation sourceKey="govtech2025" />
          </div>
          <p className="text-sm text-gray-500 mb-8">Per Mayor Davies (Government Technology) · ballpark figures, still under negotiation</p>
          <TaxRevenueChart data={FEE_DATA} />
        </FadeIn>

        <FadeIn delay={0.08} className="bg-white p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Illinois Precedent</p>
              <h2 className="text-3xl font-display font-bold text-gray-900">Meta / DeKalb, IL</h2>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-sm text-gray-500 mb-6">The closest Illinois precedent on file</p>

          <SchoolFundingChart />

          <dl className="mt-8 space-y-0 border-t border-gray-200 pt-6">
            {[
              ['Facility',              meta.source],
              ['One-facility tax (2025)', `$${meta.totalPropertyTaxBilled2025}M / year`],
              ['School share',          `~${meta.percentToSchoolDistrict}%, avg. across 3 properties, 2021–2024`],
              ['School district',       meta.districtName],
              ['Outcome',               meta.outcome],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 last:border-0">
                <dt className="text-sm text-gray-500 shrink-0">{k}</dt>
                <dd className="text-sm text-gray-800 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>

      <FadeIn>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest mb-2">State incentive program</p>
              <p className="text-base text-gray-600 leading-relaxed">
                {incentive.statusChange}. The program had required ${incentive.minInvestmentRequired}M+ investment over
                60 months and offered a {incentive.constructionWageTaxCredit}% construction wage tax credit for projects
                in underserved areas. Whether T5 secured incentive status before the deadline is not publicly confirmed.
              </p>
            </div>
            <SourceCitation sourceKey="dceo2026" />
          </div>
        </div>
      </FadeIn>
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
