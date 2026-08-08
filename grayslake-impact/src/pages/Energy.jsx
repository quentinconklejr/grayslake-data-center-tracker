import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { Fragment } from 'react'
import EvidenceBlock from '../components/ui/EvidenceBlock'
import { projections } from '../data/projections'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, capacityFigures, capacityNote } = projections
const buffer = project.securedPowerMW - project.totalCapacityMW

export default function Energy({ asSection = false }) {
  const Wrap = asSection ? Fragment : FootnoteProvider

  return (
    <Wrap>
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`}>
      {!asSection && <PageTitle {...pageMeta['/energy']} />}

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-3">Grid Impact</p>
        {asSection ? (
          <h3 className="text-3xl font-display font-bold text-gray-900 tracking-tight mb-3">Energy Draw</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-3">Energy Draw</h1>
        )}
        <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
          Public records cite three distinct electrical capacity metrics for the Grayslake campus. These figures represent different technical aspects of the infrastructure rather than conflicting estimates: {project.totalCapacityMW.toLocaleString()} MW of leasable IT computing load, {project.securedPowerMW.toLocaleString()} MW of utility-contracted capacity, and {project.comEdCapacityGW} GW of overall ComEd grid connection capacity. Each figure is detailed below with its primary source.
        </p>
        <p className="text-xs font-mono text-gray-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard label="Secured Power"       value={`${project.securedPowerMW.toLocaleString()} MW`}  sub="Utility-contracted capacity"   accent="amber" sourceKey="dcdGW2026" />
        <StatCard label="IT Capacity"        value={`${project.totalCapacityMW.toLocaleString()} MW`} sub="Leasable at full buildout"      accent="blue"  sourceKey="dcdGW2026" />
        <StatCard label="Total ComEd Capacity" value={`${project.comEdCapacityGW} GW`}                sub="Secured from ComEd, per T5 CEO"  accent="amber" sourceKey="govtech2025" />
        <StatCard label="Power Buffer"      value={`${buffer} MW`}                                sub="Calculated: 1,600 minus 1,200 MW" accent="amber" badge="Derived" />
        <StatCard label="PJM Zone"          value="COMED"                                             sub="ComEd transmission zone, PJM"  accent="blue"  sourceKey="clcjawa2026" />
      </FadeIn>

      <FadeIn className="glass-card p-8 mb-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1">Power Profile</p>
            <h3 className="text-2xl font-display font-bold text-gray-900">Secured Power vs. IT Capacity</h3>
          </div>
          <div className="flex items-center gap-3">
            <SourceCitation sourceKey="dcdGW2026" />
          </div>
        </div>
        <p className="text-base text-gray-700 mb-8 max-w-prose leading-relaxed">
          The figures charted below reflect T5&rsquo;s official disclosures. T5 originally announced the campus at 480 MW in 2024 and later expanded the leasable IT capacity target to 1,200 MW. The third metric, {project.comEdCapacityGW} GW of total ComEd capacity, describes the utility substation connection rather than the computing load.
        </p>
        <EnergyDrawChart />
      </FadeIn>

      <FadeIn className="glass-card px-6 py-6 mb-6">
        <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2">Capacity Metric Definitions</p>
        <p className="text-base text-gray-700 mb-5 max-w-prose leading-relaxed">{capacityNote}</p>
        <div className="space-y-3">
          {capacityFigures.map(f => (
            <div
              key={f.key}
              className="border border-edge-soft bg-white rounded-lg px-4 py-3.5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                <span className="text-xl font-display font-bold text-gray-900">{f.value}</span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600">{f.metric}</span>
              </div>
              <p className="text-base text-gray-700 leading-relaxed">{f.definition}</p>
              <p className="text-xs font-mono text-slate-600 mt-2 leading-relaxed">
                <span className="font-semibold text-slate-800">Stated by: </span>
                {f.attribution}
                <SourceCitation sourceKey={f.sourceKey} />
                {f.alsoSourceKey && <SourceCitation sourceKey={f.alsoSourceKey} />}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="glass-card px-6 py-6 mb-6">
        <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.15em] mb-6">Residential Rate Impact Analysis</p>
        <div className="space-y-4">

          <EvidenceBlock type="stated" title="Power costs: T5 responsible under Illinois rate standards" sourceKey="villagefaq_archived">
            <p className="text-base text-gray-700 leading-relaxed">
              The Village FAQ states T5 will pay for all electricity consumed on the campus pursuant to State of Illinois electric rate standards and existing electric supply agreements with ComEd. Power is purchased through a private competitive process and distributed by ComEd. Grayslake Mayor Elizabeth Davies separately confirmed residents will not see rate increases for water or power.<SourceCitation sourceKey="govtech2025" />
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="stated" title="Grid infrastructure: developer-funded, including the substation" sourceKey="villagefaq_archived">
            <p className="text-base text-gray-700 leading-relaxed">
              Under agreements with ComEd, the developer funds the electrical supply infrastructure serving the campus, including an on-site primary electrical substation. The Village of Grayslake incurs no cost for this infrastructure.
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="stated" title="Separate rate class for large commercial users" sourceKey="villagefaq_archived">
            <p className="text-base text-gray-700 leading-relaxed">
              Illinois regulations classify high-demand electricity users in a separate rate class, isolating their demand from residential rate structures. Per ComEd filings, utility infrastructure upgrade costs for large facilities are contained within the commercial customer rate class. All ComEd rate schedules remain regulated by the Illinois Commerce Commission.
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="unknown" title="Regional capacity prices: unquantified market variable">
            <p className="text-base text-gray-700 leading-relaxed">
              While state utility regulations govern direct transmission and distribution rates, PJM capacity auction clearing prices are determined by aggregate wholesale market demand across the region. Whether and to what extent data center load growth affects capacity prices in the ComEd zone has not been established by verified public studies. No confirmed public estimate is available.
            </p>
          </EvidenceBlock>

        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn className="glass-card p-6">
          <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.15em] mb-5">Grid & Interconnection Context</p>
          <div className="space-y-4 text-base text-gray-700 leading-relaxed">
            <p>
              The ComEd transmission zone covers northeastern Illinois and operates within PJM Interconnection. Large load additions require interconnection studies to evaluate substation capacity, transmission upgrades, and grid reliability.
            </p>
            <p>
              Per Village records, the developer funds the electrical supply infrastructure serving the campus, including an on-site substation.
              <SourceCitation sourceKey="villagefaq_archived" />
              {' '}ComEd confirmed the construction of an on-site primary transmission substation supported by three dedicated T5 switchyards, designed with potential future capacity to support surrounding regional development.
              <SourceCitation sourceKey="dailyherald_oct2025" />
            </p>
            <p>
              T5 leasing representatives stated power procurement had been underway for 18 months prior to recent utility policy revisions.
              <SourceCitation sourceKey="dailyherald_oct2025" />
              {' '}T5&rsquo;s specific PJM interconnection queue position has not been publicly released, making independent verification of queue timeline status unavailable from public records.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="glass-card p-6">
          <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.15em] mb-5">Technical Infrastructure Specifications</p>
          <div className="space-y-0">
            {[
              ['Secured Power',         `${project.securedPowerMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Leasable IT Capacity',  `${project.totalCapacityMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Total ComEd Capacity',  `${project.comEdCapacityGW} GW`, 'govtech2025'],
              ['Power Buffer',          `${buffer} MW`, null, '1,600 minus 1,200'],
              ['PJM Queue ID',          'Unreleased', null],
              ['Interconnect Voltage',  'Pending filing', null],
              ['Power Purchase (PPA)',  'Undisclosed', null],
              ['Renewable Commitment',  'Undisclosed', null],
              ['Cooling System',        'Closed-loop, air-cooled', 'clcjawa2026'],
              ['Water Use (full buildout)', figureById['water'].value, 'clcjawa2026'],
              ['Substation',            'Developer-funded, on campus', 'villagefaq_archived'],
              ['ComEd Supply Agreement',   'Executed', 'villagefaq_archived'],
              ['PUE Target',            'Undisclosed', null],
            ].map(([k, v, src, note]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-edge-soft/50 last:border-0">
                <span className="text-sm font-medium text-slate-700">{k}</span>
                <span className="flex items-center gap-1.5 text-sm font-mono text-slate-900 font-semibold">
                  {v}
                  {note && <span className="text-xs font-mono text-slate-500">(calc: {note})</span>}
                  {src && <SourceCitation sourceKey={src} />}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
      {!asSection && <FootnoteList />}
    </div>
    </Wrap>
  )
}
