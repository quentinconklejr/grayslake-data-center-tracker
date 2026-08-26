import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { sources } from '../data/sources'
import StatCard from '../components/ui/StatCard'
import SchoolFundingChart from '../components/charts/SchoolFundingChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import Container from '../components/layout/Container'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { Fragment } from 'react'
import { projections } from '../data/projections'
import { LAST_VERIFIED } from '../data/siteConfig'

const { schoolFundingComparable: meta } = projections

const metaOtherPct = +(100 - meta.percentToSchoolDistrict).toFixed(1)

const GRAYSLAKE_DISTRICTS = [
  { name: 'Fremont Elementary District 79',            desc: 'Elementary school district.',                            sub: 'Village FAQ p. 2' },
  { name: 'Grayslake Community High School Dist. 127', desc: 'High school district serving Grayslake.',                sub: 'Village FAQ p. 2' },
  { name: 'Mundelein High School District 120',        desc: 'High school district. Campus straddles this boundary.',  sub: 'Village FAQ p. 2' },
  { name: 'Fremont Library',                            desc: 'Public library district.',                              sub: 'Village FAQ p. 2' },
  { name: 'Round Lake Area Park District',              desc: 'Park district.',                                        sub: 'Village FAQ p. 2' },
  { name: 'Grayslake Park District',                    desc: 'Park district.',                                        sub: 'Village FAQ p. 2' },
  { name: 'Grayslake Fire Protection District',         desc: 'Fire protection district.',                             sub: 'Village FAQ p. 2' },
  { name: 'Village of Grayslake',                       desc: 'The Village receives a share as a taxing body.',        sub: 'Village FAQ p. 2' },
]

export default function Schools({ asSection = false }) {
  const Wrap = asSection ? Fragment : FootnoteProvider

  const body = (
    <>
      {!asSection && <PageTitle {...pageMeta['/schools']} />}

      <FadeIn className="mb-10 pb-8 border-b border-rule">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Education</p>
        {asSection ? (
          <h3 className="text-3xl font-display text-ink-900 tracking-tight leading-tight mb-3">School Funding Impact</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-3">School Funding Impact</h1>
        )}
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          Village officials have cited property tax projections ranging from $300 million to over
          $1 billion across all taxing districts over the coming decades. Neither figure is
          independently verified. The Lake County Assessor has not valued the campus. Actual
          revenue depends on that valuation and applicable levy rates.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="mb-10">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Official projections</p>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="border-t border-rule pt-4">
            <p className="text-xs font-sans font-semibold text-status-approval mb-2">Mayor of Grayslake</p>
            <p className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight break-words mb-1">~$300M</p>
            <p className="text-sm font-sans text-ink-600 mb-4">projected property tax revenue over the coming decades</p>
            <p className="text-sm font-sans text-ink-600 leading-relaxed">
              Official statement from the Mayor of Grayslake. Not independently verified.
              Actual revenue depends on the Lake County Assessor&rsquo;s campus valuation, which
              has not been publicly released.
            </p>
            <div className="mt-4 pt-3 border-t border-rule-soft flex items-center justify-between">
              <span className="text-2xs font-sans font-semibold text-status-disputed uppercase tracking-wide">Official projection</span>
              <SourceCitation sourceKey="chitrib_june2026" />
            </div>
          </div>
          <div className="border-t border-rule pt-4">
            <p className="text-xs font-sans font-semibold text-status-approval mb-2">Deputy Village Manager</p>
            <p className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight break-words mb-1">$1B+</p>
            <p className="text-sm font-sans text-ink-600 mb-4">projected across all taxing districts over 20 years</p>
            <p className="text-sm font-sans text-ink-600 leading-relaxed">
              Official statement from the Deputy Village Manager. Not independently verified.
              Actual revenue depends on the Lake County Assessor&rsquo;s campus valuation, which
              has not been publicly released.
            </p>
            <div className="mt-4 pt-3 border-t border-rule-soft flex items-center justify-between">
              <span className="text-2xs font-sans font-semibold text-status-disputed uppercase tracking-wide">Official projection</span>
              <SourceCitation sourceKey="chronicle2026" />
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <aside className="border-l-[3px] border-status-approval bg-status-approval-soft pl-5 pr-4 py-4 mb-10 max-w-3xl">
          <p className="text-xs font-display italic text-status-approval mb-1">Illinois comparison: DeKalb / Meta</p>
          <p className="text-base font-sans text-ink-700 leading-relaxed">
            Meta&rsquo;s DeKalb facility paid $31.1 million in property taxes in 2025. School District
            428 received roughly 60.9% of Meta&rsquo;s taxes across three DeKalb County properties,
            averaged over 2021 to 2024. The two figures come from different datasets. They cannot
            produce a per-district dollar amount for Grayslake without a Lake County Assessor
            valuation.
          </p>
          <div className="mt-2"><SourceCitation sourceKey="capitolnews2026" /></div>
        </aside>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
        <StatCard label="One Facility — 2025 Tax" value={`$${meta.totalPropertyTaxBilled2025}M`} sub="Single facility, 2025 tax year"                        accent="green" sourceKey="capitolnews2026" />
        <StatCard label="School District Share"    value={`${meta.percentToSchoolDistrict}%`}    sub="Avg. across three properties, 2021–2024"              accent="green" sourceKey="capitolnews2026" />
        <StatCard label="Other Taxing Bodies"      value={`${metaOtherPct}%`}                     sub={`Calculated: 100% − ${meta.percentToSchoolDistrict}%`} accent="blue"  badge="Derived" />
        <StatCard label="Documented Outcome"       value="1 School Built"                         sub={meta.outcome}                                          accent="green" sourceKey="capitolnews2026" />
      </FadeIn>

      <div className="grid lg:grid-cols-5 gap-x-10 gap-y-8 mb-10">
        <FadeIn className="lg:col-span-2 border-t border-rule pt-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-display italic text-ink-500 tracking-wide mb-1">Tax Allocation</p>
              <h3 className="text-2xl font-display text-ink-900 tracking-tight">DeKalb Precedent</h3>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-ink-500 mb-6">Meta / DeKalb, IL · two separate datasets</p>
          <SchoolFundingChart />
        </FadeIn>

        <FadeIn delay={0.08} className="lg:col-span-3 border-t border-rule pt-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-display italic text-ink-500 tracking-wide mb-1">Case Study</p>
              <h3 className="text-2xl font-display text-ink-900 tracking-tight">Meta, DeKalb, IL</h3>
            </div>
            <SourceCitation sourceKey="capitolnews2026" />
          </div>
          <p className="text-2xs font-mono text-ink-500 mb-4">Capitol News Illinois reporting · 2025</p>

          <dl className="mb-5 divide-y divide-rule-strong border-y border-rule">
            {[
              ['Facility',                meta.source],
              ['One-facility tax (2025)', `$${meta.totalPropertyTaxBilled2025}M billed`],
              ['School share',            `~${meta.percentToSchoolDistrict}%, avg. across 3 properties, 2021–2024`],
              ['District',                meta.districtName],
              ['Documented outcome',      meta.outcome],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-3 py-2.5">
                <dt className="text-sm font-sans text-ink-500 shrink-0">{k}</dt>
                <dd className="text-sm font-sans text-ink-800 font-semibold text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <aside className="border-l-[3px] border-status-construction bg-status-construction-soft px-5 py-4">
            <p className="text-base font-sans text-ink-700 leading-relaxed">
              In DeKalb, school districts received about 60.9% of Meta&rsquo;s property taxes across
              three properties. What that means for Grayslake depends on the Lake County Assessor&rsquo;s
              valuation, which has not been published.
            </p>
          </aside>
        </FadeIn>
      </div>

      <FadeIn>
        <aside className="border-l-[3px] border-status-disputed bg-status-disputed-soft pl-5 pr-4 py-4 mb-10 max-w-3xl">
          <p className="text-xs font-display italic text-status-disputed mb-1">What&rsquo;s still missing</p>
          <p className="text-base font-sans text-ink-700 leading-relaxed">
            The Village FAQ states the development agreements provide no financial incentives to T5.
            The figures on this page are what village officials said publicly. No independent estimate exists.
            Any per-district projection requires a Lake County Assessor valuation and applicable levy rates;
            neither has been published.
          </p>
        </aside>
      </FadeIn>

      <FadeIn>
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Grayslake districts listed in the Village FAQ</p>

        <div className="mb-6 border border-rule bg-paper-raised overflow-hidden">
          <div className="border-b border-rule px-4 py-2.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600 leading-none mb-1">Village of Grayslake — Official FAQ</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-ink-500">June 2026</span>
                <span className="text-2xs font-mono border border-rule text-ink-500 px-1.5 py-0.5">p. 2</span>
              </div>
            </div>
            {/* Was the Village live DocumentCenter URL, dead since Aug 5, 2026 -
                the most official-looking element on the page sent readers to a
                404. Points at the archived snapshot and local mirror instead. */}
            <div className="shrink-0 flex items-center gap-3">
              <a href={sources.villagefaq_archived.url} target="_blank" rel="noopener noreferrer"
                 className="text-xs font-sans font-semibold text-accent hover:text-accent-hover">Archived copy</a>
              <a href={sources.villagefaq_archived.localCopy} target="_blank" rel="noopener noreferrer"
                 className="text-xs font-sans font-semibold text-accent hover:text-accent-hover">PDF mirror</a>
            </div>
          </div>
          <div className="px-4 py-3 bg-paper-sunk space-y-2">
            <p className="text-sm font-sans text-ink-700 leading-relaxed">
              Per page 2 of the Village FAQ, eight taxing bodies will receive property tax revenue from the T5 campus:
              Fremont Elementary District 79, Grayslake Community High School District 127, Mundelein High School District 120,
              Fremont Library, Round Lake Area Park District, Grayslake Park District, Grayslake Fire Protection District,
              and the Village of Grayslake.
            </p>
            <p className="text-sm font-sans text-ink-700 leading-relaxed">
              The FAQ also states that the development agreements provide no financial incentives to T5 Data Centers.
            </p>
            <p className="text-xs font-sans text-ink-500 pt-1 border-t border-rule-soft">
              Paraphrase — not a verbatim quote. Verify against the linked original.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          {GRAYSLAKE_DISTRICTS.map(({ name, desc, sub }) => (
            <div key={name} className="border-t border-rule-soft pt-3">
              <p className="text-base font-display text-ink-900 mb-0.5">{name}</p>
              <p className="text-xs font-sans text-ink-500 mb-2">{sub}</p>
              <p className="text-sm font-sans text-ink-600 leading-relaxed">{desc}</p>
              <div className="mt-3 pt-2 border-t border-rule-soft flex justify-between">
                <span className="text-2xs font-sans font-semibold text-ink-500 uppercase tracking-wide">Est. annual share</span>
                <span className="text-xs font-sans text-ink-500">— no public projection yet</span>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      {!asSection && <FootnoteList />}
    </>
  )

  return (
    <Wrap>
      {asSection ? (
        <div className="pt-1 pb-8">{body}</div>
      ) : (
        <Container size="wide" className="py-12">{body}</Container>
      )}
    </Wrap>
  )
}
