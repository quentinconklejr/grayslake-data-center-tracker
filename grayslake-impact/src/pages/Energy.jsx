import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import EvidenceBlock from '../components/ui/EvidenceBlock'
import { projections } from '../data/projections'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, capacityFigures, capacityNote } = projections
const buffer = project.securedPowerMW - project.totalCapacityMW

export default function Energy({ asSection = false }) {
  return (
    <FootnoteProvider>
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`}>
      {!asSection && <PageTitle {...pageMeta['/energy']} />}

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.18em] mb-4">Grid Impact</p>
        {asSection ? (
          <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Energy Draw</h2>
        ) : (
          <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tight mb-3">Energy Draw</h1>
        )}
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Three capacity figures for this campus appear in public sources. They measure different
          things and are not competing estimates of the same quantity: {project.totalCapacityMW.toLocaleString()} MW
          of leasable IT capacity, {project.securedPowerMW.toLocaleString()} MW of secured utility power, and{' '}
          {project.comEdCapacityGW} GW of total ComEd capacity. All three trace back to T5 and describe different
          parts of the same system rather than disagreeing about one number. Each is attributed below.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <StatCard label="Secured Power"     value={`${project.securedPowerMW.toLocaleString()} MW`}  sub="Utility-contracted capacity"   accent="amber" sourceKey="dcdGW2026" />
        <StatCard label="IT Capacity"       value={`${project.totalCapacityMW.toLocaleString()} MW`} sub="Leasable at full buildout"      accent="blue"  sourceKey="dcdGW2026" />
        <StatCard label="Total ComEd Capacity" value={`${project.comEdCapacityGW} GW`}                sub="Secured from ComEd, per T5 CEO"  accent="amber" sourceKey="govtech2025" />
        <StatCard label="Power Buffer"      value={`${buffer} MW`}                                    sub="Calculated: 1,600 − 1,200 MW"  accent="amber" badge="Derived" />
        <StatCard label="PJM Zone"          value="COMED"                                             sub="ComEd transmission zone, PJM"  accent="blue"  sourceKey="clcjawa2026" />
      </FadeIn>

      <FadeIn className="glass-card p-8 mb-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Power Profile</p>
            <h2 className="text-3xl font-display font-bold text-gray-900">Secured Power vs. IT Capacity</h2>
          </div>
          <div className="flex items-center gap-3">
            <SourceCitation sourceKey="dcdGW2026" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8 max-w-prose">
          The two figures charted below are T5&rsquo;s own disclosures. No estimation is involved.
          T5 originally announced the campus at 480 MW (2024) and later raised the leasable IT capacity target to 1,200 MW.
          A third figure, {project.comEdCapacityGW} GW of total ComEd capacity, describes the utility connection rather
          than the computing load. The comparison below sets the three side by side.
        </p>
        <EnergyDrawChart />
      </FadeIn>

      <FadeIn className="glass-card px-6 py-6 mb-6">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-2">Which Capacity Figure Is Which</p>
        <p className="text-sm text-gray-500 mb-5 max-w-prose">{capacityNote}</p>
        <div className="space-y-3">
          {capacityFigures.map(f => (
            <div
              key={f.key}
              className="border border-edge bg-white rounded-lg px-4 py-3.5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                <span className="text-lg font-display font-bold text-gray-900">{f.value}</span>
                <span className="text-2xs font-mono uppercase tracking-widest text-gray-500">{f.metric}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{f.definition}</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                <span className="font-medium text-gray-600">Stated by: </span>
                {f.attribution}
                <SourceCitation sourceKey={f.sourceKey} />
                {f.alsoSourceKey && <SourceCitation sourceKey={f.alsoSourceKey} />}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="glass-card px-6 py-6 mb-6">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.15em] mb-6">Residential Rate Impact</p>
        <div className="space-y-3">

          <EvidenceBlock type="stated" title="Power costs: T5 responsible under Illinois rate standards" sourceKey="villagefaq_archived">
            <p className="text-sm text-gray-600 leading-relaxed">
              The Village FAQ states T5 will pay for all electricity used on the campus &ldquo;as per State
              of Illinois electric rate standards and as provided for in electric supply agreements that are
              already in place between T5 and ComEd.&rdquo; Power is bought through a private competitive
              process and distributed by ComEd. Mayor Davies separately said residents will not see impacts
              to water or power.<SourceCitation sourceKey="govtech2025" />
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="stated" title="Grid infrastructure: developer-funded, including the substation" sourceKey="villagefaq_archived">
            <p className="text-sm text-gray-600 leading-relaxed">
              Under agreements with ComEd, the developer funds the electricity supply infrastructure serving
              the campus, including its own electrical substation on site. The FAQ states the Village of
              Grayslake will pay nothing for this infrastructure.
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="stated" title="Separate rate class for large users" sourceKey="villagefaq_archived">
            <p className="text-sm text-gray-600 leading-relaxed">
              The FAQ states Illinois regulations place high-electricity users like data centers in a separate
              rate class, so their demand does not directly affect residential rates, and that per ComEd the
              cost of utility infrastructure upgrades for large projects is largely contained to the business
              customer rate class. All ComEd rates are regulated by the ICC.
            </p>
          </EvidenceBlock>

          <EvidenceBlock type="unknown" title="Regional capacity prices: an open question">
            <p className="text-sm text-gray-600 leading-relaxed">
              Illinois utility regulation may address direct distribution and transmission costs,
              but PJM capacity auction clearing prices are set by aggregate regional demand across
              all load. That is a wholesale market effect that state utility rules do not address
              directly. Whether and by how much data center growth is contributing to higher
              capacity prices in the ComEd zone is not yet established by any verified public study.
              No confirmed figure is available.
            </p>
          </EvidenceBlock>

        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-4">
        <FadeIn className="glass-card p-6">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.15em] mb-6">Grid &amp; Interconnection Context</p>
          <div className="space-y-4 text-base text-gray-600 leading-relaxed">
            <p>
              The ComEd transmission zone covers northeastern Illinois and is managed by PJM Interconnection.
              New large loads require interconnection studies evaluating substation capacity, transmission
              upgrades, and system reliability.
            </p>
            <p>
              The Village FAQ states the developer funds the electricity supply infrastructure serving the
              campus, including its own on-site substation, and that the Village pays nothing for it.
              <SourceCitation sourceKey="villagefaq_archived" />
              {' '}ComEd confirmed an on-site primary transmission substation supported by three dedicated T5
              switchyards, which it said will have the future ability to serve other large projects in the area.
              <SourceCitation sourceKey="dailyherald_oct2025" />
            </p>
            <p>
              T5&rsquo;s head of leasing said power procurement had been underway for 18 months, ahead of changes
              ComEd and other utilities have made to allocation and procurement.
              <SourceCitation sourceKey="dailyherald_oct2025" />
              {' '}T5&rsquo;s PJM interconnection queue position is not publicly filed, so its queue timeline cannot
              be verified from public records.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="glass-card p-6">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-[0.15em] mb-6">Technical Key Metrics</p>
          <div className="space-y-0">
            {[
              ['Secured Power',         `${project.securedPowerMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Leasable IT Capacity',  `${project.totalCapacityMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Total ComEd Capacity',  `${project.comEdCapacityGW} GW`, 'govtech2025'],
              ['Power Buffer',          `${buffer} MW`, null, '1,600 − 1,200'],
              ['PJM Queue ID',          '— not yet public', null],
              ['Interconnect Voltage',  '— pending', null],
              ['Power Purchase (PPA)',  '— not disclosed', null],
              ['Renewable Commitment',  '— not disclosed', null],
              ['Cooling Approach',         'Closed-loop, air-cooled', 'clcjawa2026'],
              ['Water Use (full buildout)', figureById['water'].value, 'clcjawa2026'],
              ['Substation',               'Developer-funded, on campus', 'villagefaq_archived'],
              ['ComEd Supply Agreement',   'Stated as already in place',  'villagefaq_archived'],
              ['PUE Target',            '— not disclosed', null],
            ].map(([k, v, src, note]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-edge-soft/50 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="flex items-center gap-1.5 text-sm font-mono text-gray-800">
                  {v}
                  {note && <span className="text-xs font-mono text-gray-400">(calc: {note})</span>}
                  {src && <SourceCitation sourceKey={src} />}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
