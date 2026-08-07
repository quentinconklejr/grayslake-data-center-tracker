import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { Fragment } from 'react'
import { projections } from '../data/projections'
import { LAST_VERIFIED } from '../data/siteConfig'

const { schoolFundingComparable: meta } = projections

const metaOtherPct = +(100 - meta.percentToSchoolDistrict).toFixed(1)

const GRAYSLAKE_DISTRICTS = [
  { name: 'Fremont Elementary District 79',             desc: 'Elementary school district.',                        sub: 'Village FAQ p. 2' },
  { name: 'Grayslake Community High School Dist. 127',  desc: 'High school district serving Grayslake.',            sub: 'Village FAQ p. 2' },
  { name: 'Mundelein High School District 120',          desc: 'High school district. Campus straddles this boundary.', sub: 'Village FAQ p. 2' },
  { name: 'Fremont Library',                             desc: 'Public library district.',                           sub: 'Village FAQ p. 2' },
  { name: 'Round Lake Area Park District',               desc: 'Park district.',                                     sub: 'Village FAQ p. 2' },
  { name: 'Grayslake Park District',                     desc: 'Park district.',                                     sub: 'Village FAQ p. 2' },
  { name: 'Grayslake Fire Protection District',          desc: 'Fire protection district.',                          sub: 'Village FAQ p. 2' },
  { name: 'Village of Grayslake',                        desc: 'The Village receives a share as a taxing body.',    sub: 'Village FAQ p. 2' },
]

export default function Schools({ asSection = false }) {
  // Embedded in /project the page shares one footnote scope with the rest of
  // the page, so sources can all live in a single block at the bottom.
  const Wrap = asSection ? Fragment : FootnoteProvider

  return (
    <Wrap>
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`}>
      {!asSection && <PageTitle {...pageMeta['/schools']} />}

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-600 uppercase tracking-[0.18em] mb-4">Education</p>
        {asSection ? (
          <h3 className="text-3xl font-display font-bold text-gray-900 tracking-tight mb-3">School Funding Impact</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-3">School Funding Impact</h1>
        )}
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Village officials have publicly cited projections ranging from approximately $300 million
          to over $1 billion in property tax revenue across all taxing districts over the coming
          decades. Those are official statements, not independently verified estimates. The Lake County Assessor
          has not yet valued the campus. Actual revenue depends on that valuation and applicable levy rates.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="mb-10">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.15em] mb-5">Official projections</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <p className="text-2xs font-mono text-blue-600 uppercase tracking-widest mb-2">Mayor of Grayslake</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-gray-900 tracking-tight break-words mb-1">~$300M</p>
            <p className="text-sm text-gray-500 mb-4">projected property tax revenue over the coming decades</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Official statement from the Mayor of Grayslake. Not independently verified.
              Actual revenue depends on the Lake County Assessor's campus valuation, which
              has not been publicly released.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-2xs font-mono text-amber-700 uppercase tracking-widest">Official projection</span>
              <SourceCitation sourceKey="chitrib_june2026" />
            </div>
          </div>
          <div className="glass-card p-6">
            <p className="text-2xs font-mono text-blue-600 uppercase tracking-widest mb-2">Deputy Village Manager</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-gray-900 tracking-tight break-words mb-1">$1B+</p>
            <p className="text-sm text-gray-500 mb-4">projected across all taxing districts over 20 years</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Official statement from the Deputy Village Manager. Not independently verified.
              Actual revenue depends on the Lake County Assessor's campus valuation, which
              has not been publicly released.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-2xs font-mono text-amber-700 uppercase tracking-widest">Official projection</span>
              <SourceCitation sourceKey="chronicle2026" />
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5 mb-10">
          <div className="flex items-start gap-4">
            <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-display font-semibold text-blue-800 mb-1.5">Illinois comparison: DeKalb / Meta</p>
              <p className="text-base text-gray-600 leading-relaxed">
                The data below comes from the Meta data center in DeKalb, IL. Two figures are cited:
                the 2025 property tax bill for one Meta facility ($31.1M), and School District 428's
                ~60.9% share of Meta's taxes across three DeKalb County properties averaged over 2021–2024.
                These are from different datasets and cannot be combined into a per-district dollar figure.
                Neither is directly applicable without a Lake County Assessor valuation of the T5 campus.
              </p>
              <div className="mt-3"><SourceCitation sourceKey="capitolnews2026" /></div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="One Facility — 2025 Tax"   value={`$${meta.totalPropertyTaxBilled2025}M`} sub="Single facility, 2025 tax year"                                       accent="green" sourceKey="capitolnews2026" />
        <StatCard label="School District Share"     value={`${meta.percentToSchoolDistrict}%`}     sub="Avg. across three properties, 2021–2024"              accent="green" sourceKey="capitolnews2026" />
        <StatCard label="Other Taxing Bodies"       value={`${metaOtherPct}%`}                     sub={`Calculated: 100% − ${meta.percentToSchoolDistrict}%`} accent="blue" badge="Derived" />
        <StatCard label="Documented Outcome"        value="1 School Built"                         sub={meta.outcome}                                          accent="green" sourceKey="capitolnews2026" />
      </FadeIn>

      <div className="grid lg:grid-cols-5 gap-4 mb-8">
        <FadeIn className="lg:col-span-2 glass-card p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Tax Allocation</p>
              <h3 className="text-2xl font-display font-bold text-gray-900">DeKalb Precedent</h3>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-gray-400 mb-8">Meta / DeKalb, IL · two separate datasets</p>
          <SchoolFundingChart />
        </FadeIn>

        <FadeIn delay={0.08} className="lg:col-span-3 glass-card p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Case Study</p>
              <h3 className="text-2xl font-display font-bold text-gray-900">Meta, DeKalb, IL</h3>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-gray-400 mb-6">Capitol News Illinois reporting · 2025</p>

          <dl className="space-y-0 mb-6">
            {[
              ['Facility',              meta.source],
              ['One-facility tax (2025)', `$${meta.totalPropertyTaxBilled2025}M billed`],
              ['School share',          `~${meta.percentToSchoolDistrict}%, avg. across 3 properties, 2021–2024`],
              ['District',              meta.districtName],
              ['Documented outcome',    meta.outcome],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-3 py-2.5 border-b border-edge-soft/50 last:border-0">
                <dt className="text-sm text-gray-500 shrink-0">{k}</dt>
                <dd className="text-sm text-gray-800 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
            <p className="text-base text-gray-600 leading-relaxed">
              In DeKalb, school districts received about 60.9% of Meta&rsquo;s property taxes across
              three properties. What that means for Grayslake depends on the Lake County Assessor&rsquo;s
              valuation, which has not been published.
            </p>
          </div>
        </FadeIn>
      </div>

      <FadeIn>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 mb-8">
          <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest mb-2">What's still missing</p>
          <p className="text-base text-gray-600 leading-relaxed">
            The Village FAQ states the development agreements provide no financial incentives to T5.
            The figures on this page are what village officials said publicly. No independent estimate exists.
            Any per-district projection requires a Lake County Assessor valuation and applicable levy rates;
            neither has been published.
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.15em] mb-6">Grayslake districts listed in the Village FAQ</p>
        <div className="mb-6 border border-gray-300 rounded-sm bg-white overflow-hidden shadow-sm">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest leading-none mb-0.5">Village of Grayslake — Official FAQ</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">June 2026</span>
                <span className="text-2xs font-mono bg-white border border-gray-300 text-gray-500 px-1.5 py-0.5 rounded-sm">p. 2</span>
              </div>
            </div>
            <a href="https://villageofgrayslake.com/DocumentCenter/View/15282" target="_blank" rel="noopener noreferrer"
               className="shrink-0 text-2xs font-mono text-blue-600 hover:text-blue-800 transition-colors">View ↗</a>
          </div>
          <div className="px-4 py-3 bg-[#fafaf8] space-y-2">
            <p className="text-xs text-gray-700 leading-relaxed">
              Per page 2 of the Village FAQ, eight taxing bodies will receive property tax revenue from the T5 campus:
              Fremont Elementary District 79, Grayslake Community High School District 127, Mundelein High School District 120,
              Fremont Library, Round Lake Area Park District, Grayslake Park District, Grayslake Fire Protection District,
              and the Village of Grayslake.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              The FAQ also states that the development agreements provide no financial incentives to T5 Data Centers.
            </p>
            <p className="text-2xs font-mono text-gray-400 pt-1 border-t border-edge-soft">Paraphrase — not a verbatim quote. Verify against the linked original.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {GRAYSLAKE_DISTRICTS.map(({ name, desc, sub }) => (
            <div key={name} className="glass-card-hover p-5">
              <p className="text-base font-display font-semibold text-gray-900 mb-0.5">{name}</p>
              <p className="text-sm text-gray-500 mb-3">{sub}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-2xs font-mono text-gray-500 uppercase tracking-widest">Est. annual share</span>
                <span className="text-xs text-gray-400">— no public projection yet</span>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
      {!asSection && <FootnoteList />}
    </div>
    </Wrap>
  )
}
