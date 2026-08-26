import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import Container from '../components/layout/Container'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { Fragment } from 'react'
import EvidenceBlock from '../components/ui/EvidenceBlock'
import { projections } from '../data/projections'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, capacityFigures, capacityNote } = projections
// A "Power Buffer" stat used to be derived here. It subtracted two figures
// of different scope, and which answer you got depended on whether you used
// 1,600 or the 1,550 ComEd is elsewhere credited with. No source publishes a
// headroom figure, so the site should not manufacture one.

export default function Energy({ asSection = false }) {
  const Wrap = asSection ? Fragment : FootnoteProvider
  const Root = asSection ? Fragment : Container

  const body = (
    <>
      {!asSection && <PageTitle {...pageMeta['/energy']} />}

      <FadeIn className={asSection ? 'mb-8' : 'mb-10 pb-8 border-b border-rule'}>
        {!asSection && (
          <>
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Grid Impact</p>
            <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-3">Energy Draw</h1>
          </>
        )}
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          Public records document three electrical capacity figures for the Grayslake campus: {project.totalCapacityMW.toLocaleString()} MW of leasable IT computing load, {project.securedPowerMW.toLocaleString()} MW of utility-contracted capacity, and {project.comEdCapacityGW} GW of ComEd substation capacity. They measure different things. Each is cited below with its source.
        </p>
        {!asSection && <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>}
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
        <StatCard label="Secured Power"        value={`${project.securedPowerMW.toLocaleString()} MW`}  sub="Utility-contracted capacity"   accent="amber" sourceKey="dcdGW2026" />
        <StatCard label="IT Capacity"          value={`${project.totalCapacityMW.toLocaleString()} MW`} sub="Leasable at full buildout"     accent="blue"  sourceKey="dcdGW2026" />
        <StatCard label="Total ComEd Capacity" value={`${project.comEdCapacityGW} GW`}                  sub="Secured from ComEd, per T5 CEO" accent="amber" sourceKey="govtech2025" />
        <StatCard label="PJM Zone"             value="COMED"                                            sub="ComEd transmission zone, PJM"  accent="blue"  sourceKey="clcjawa2026" />
      </FadeIn>

      <FadeIn className="mb-10">
        <div className="flex items-baseline justify-between mb-2 border-t border-rule pt-4">
          <div>
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-1">Power Profile</p>
            <h3 className="text-2xl font-display text-ink-900 tracking-tight">Secured Power vs. IT Capacity</h3>
          </div>
          <SourceCitation sourceKey="dcdGW2026" />
        </div>
        <p className="text-base font-sans text-ink-700 mb-8 max-w-prose leading-relaxed">
          T5 announced the campus at 480 MW in 2024 and later expanded the leasable IT capacity target to 1,200 MW. The {project.comEdCapacityGW} GW ComEd figure is the utility substation connection, not the computing load.
        </p>
        <EnergyDrawChart />
      </FadeIn>

      <FadeIn className="mb-10 border-t border-rule pt-6">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Capacity Metric Definitions</p>
        <p className="text-base font-sans text-ink-700 mb-6 max-w-prose leading-relaxed">{capacityNote}</p>
        <div className="divide-y divide-rule-strong border-y border-rule">
          {capacityFigures.map(f => (
            <div key={f.key} className="py-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                <span className="text-xl font-display text-ink-900 tracking-tight">{f.value}</span>
                <span className="text-xs font-sans font-semibold text-ink-600">{f.metric}</span>
              </div>
              <p className="text-base font-sans text-ink-700 leading-relaxed">{f.definition}</p>
              <p className="text-sm font-sans text-ink-600 mt-2 leading-relaxed">
                <span className="font-semibold text-ink-800">Stated by: </span>
                {f.attribution}
                <SourceCitation sourceKey={f.sourceKey} />
                {f.alsoSourceKey && <SourceCitation sourceKey={f.alsoSourceKey} />}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="mb-10 border-t border-rule pt-6">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Residential Rate Impact Analysis</p>
        <div className="space-y-4">
          <EvidenceBlock type="stated" title="Power costs: T5 responsible under Illinois rate standards" sourceKey="villagefaq_archived">
            <p className="text-base font-sans text-ink-700 leading-relaxed">
              The Village FAQ states T5 will pay for all electricity consumed on the campus pursuant to State of Illinois electric rate standards and existing electric supply agreements with ComEd. Power is purchased through a private competitive process and distributed by ComEd. Grayslake Mayor Elizabeth Davies separately confirmed residents will not see rate increases for water or power.<SourceCitation sourceKey="govtech2025" />
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="stated" title="Grid infrastructure: developer-funded, including the substation" sourceKey="villagefaq_archived">
            <p className="text-base font-sans text-ink-700 leading-relaxed">
              Under agreements with ComEd, the developer funds the electrical supply infrastructure serving the campus, including an on-site primary electrical substation. The Village of Grayslake incurs no cost for this infrastructure.
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="stated" title="Separate rate class for large commercial users" sourceKey="villagefaq_archived">
            <p className="text-base font-sans text-ink-700 leading-relaxed">
              Illinois regulations classify high-demand electricity users in a separate rate class, isolating their demand from residential rate structures. Per ComEd filings, utility infrastructure upgrade costs for large facilities are contained within the commercial customer rate class. All ComEd rate schedules remain regulated by the Illinois Commerce Commission.
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="unknown" title="Regional capacity prices: unquantified market variable">
            <p className="text-base font-sans text-ink-700 leading-relaxed">
              While state utility regulations govern direct transmission and distribution rates, PJM capacity auction clearing prices are determined by aggregate wholesale market demand across the region. Whether and to what extent data center load growth affects capacity prices in the ComEd zone has not been established by verified public studies. No confirmed public estimate is available.
            </p>
          </EvidenceBlock>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
        <FadeIn className="border-t border-rule pt-6">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Grid &amp; Interconnection Context</p>
          <div className="space-y-4 text-base font-sans text-ink-700 leading-relaxed">
            <p>
              The ComEd transmission zone covers northeastern Illinois and operates within PJM Interconnection. Large load additions require interconnection studies to evaluate substation capacity, transmission upgrades, and grid reliability.
            </p>
            <p>
              Per Village records, the developer funds the electrical supply infrastructure serving the campus, including an on-site substation.
              <SourceCitation sourceKey="villagefaq_archived" />
              {' '}ComEd confirmed an on-site primary transmission substation supported by three T5 switchyards, sized to accommodate additional regional load.
              <SourceCitation sourceKey="dailyherald_oct2025" />
            </p>
            <p>
              T5 leasing representatives said power procurement had been underway for 18 months before recent utility policy revisions.
              <SourceCitation sourceKey="dailyherald_oct2025" />
              {' '}T5&rsquo;s PJM interconnection queue position has not been released. The queue timeline cannot be independently verified.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="border-t border-rule pt-6">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Technical Infrastructure Specifications</p>
          <dl className="divide-y divide-rule-strong">
            {[
              ['Secured Power',            `${project.securedPowerMW.toLocaleString()} MW`,  'dcdGW2026'],
              ['Leasable IT Capacity',     `${project.totalCapacityMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Total ComEd Capacity',     `${project.comEdCapacityGW} GW`,                   'govtech2025'],
              ['PJM Queue ID',             'Unreleased',                                     null],
              ['Interconnect Voltage',     'Pending filing',                                 null],
              ['Power Purchase (PPA)',     'Undisclosed',                                    null],
              ['Renewable Commitment',     'Undisclosed',                                    null],
              ['Cooling System',           'Closed-loop, air-cooled',                        'clcjawa2026'],
              ['Water Use (full buildout)', figureById['water'].value,                       'clcjawa2026'],
              ['Substation',               'Developer-funded, on campus',                    'villagefaq_archived'],
              ['ComEd Supply Agreement',   'Executed',                                       'villagefaq_archived'],
              ['PUE Target',               'Undisclosed',                                    null],
            ].map(([k, v, src]) => (
              <div key={k} className="flex justify-between items-baseline py-2.5">
                <dt className="text-sm font-sans text-ink-700">{k}</dt>
                <dd className="text-sm font-mono text-ink-900 font-semibold flex items-center gap-1.5">
                  {v}
                  {src && <SourceCitation sourceKey={src} />}
                </dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>

      {!asSection && <FootnoteList />}
    </>
  )

  return (
    <Wrap>
      {asSection ? (
        <div className="pt-1 pb-8">{body}</div>
      ) : (
        <Root size="wide" className="py-12">{body}</Root>
      )}
    </Wrap>
  )
}
