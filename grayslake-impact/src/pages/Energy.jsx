import PageTitle from '../components/ui/PageTitle'
import StatCard from '../components/ui/StatCard'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import EvidenceBlock from '../components/ui/EvidenceBlock'
import { projections } from '../data/projections'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project } = projections
const buffer = project.securedPowerMW - project.totalCapacityMW

export default function Energy() {
  return (
    <FootnoteProvider>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle
        title="Energy Draw"
        description="Energy capacity and utility rate analysis for T5 @ Chicago IV: 1,200 MW leasable IT capacity, 1,600 MW utility-contracted power, and Illinois rate structure context."
        ogImage="/og/energy.png"
      />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Grid Impact</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Energy Draw</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          T5 has secured {project.securedPowerMW.toLocaleString()} MW of utility power against a planned{' '}
          {project.totalCapacityMW.toLocaleString()} MW of leasable IT capacity. The {buffer} MW difference
          serves as a buffer for redundancy and future phases. Both figures are from public developer disclosures.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Secured Power"     value={`${project.securedPowerMW.toLocaleString()} MW`}  sub="Utility-contracted capacity"   accent="amber" sourceKey="dcdGW2026" />
        <StatCard label="IT Capacity"       value={`${project.totalCapacityMW.toLocaleString()} MW`} sub="Leasable at full buildout"      accent="blue"  sourceKey="dcdGW2026" />
        <StatCard label="Power Buffer"      value={`${buffer} MW`}                                    sub="Calculated: 1,600 − 1,200 MW"  accent="amber" badge="Derived" />
        <StatCard label="PJM Zone"          value="COMED"                                             sub="ComEd transmission zone, PJM"  accent="blue"  sourceKey="villageoffaq" />
      </FadeIn>

      <FadeIn className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Power Profile</p>
            <h2 className="text-2xl font-display font-bold text-gray-900">Secured Power vs. IT Capacity</h2>
          </div>
          <div className="flex items-center gap-3">
            <SourceCitation sourceKey="dcdGW2026" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Both figures are from public developer disclosures. No estimation is involved.
          T5 originally announced the campus at 480 MW (2024). Developer plans later expanded the leasable IT capacity target to 1,200 MW.
        </p>
        <EnergyDrawChart />
      </FadeIn>

      <FadeIn className="bg-white border border-gray-200 rounded-xl px-6 py-6 mb-6 shadow-sm">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Residential Rate Impact</p>
        <div className="space-y-3">

          <EvidenceBlock type="stated" title="Power costs: T5 responsible under Illinois rate standards" sourceKey="villageoffaq">
            <p className="text-sm text-gray-600 leading-relaxed">
              The Village FAQ states that T5 will pay for its own power under State of Illinois
              electric rate standards. Residential customers would not be directly billed for T5's
              energy costs.
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
        <FadeIn className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Grid &amp; Interconnection Context</p>
          <div className="space-y-4 text-base text-gray-600 leading-relaxed">
            <p>
              The ComEd transmission zone covers northeastern Illinois and is managed by PJM Interconnection.
              New large loads require interconnection studies evaluating substation capacity, transmission
              upgrades, and system reliability.
            </p>
            <p>
              At {project.totalCapacityMW.toLocaleString()} MW<SourceCitation sourceKey="dcdGW2026" />, T5 would be one of the largest single-campus
              loads in the ComEd zone, comparable to a medium-sized city. Interconnection agreements
              typically require the developer to fund necessary substation upgrades.
            </p>
            <p>
              PJM queue timelines for loads of this scale commonly run 3–5 years from application
              to energization. T5's queue position is not yet publicly filed.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Technical Key Metrics</p>
          <div className="space-y-0">
            {[
              ['Secured Power',         `${project.securedPowerMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Leasable IT Capacity',  `${project.totalCapacityMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Power Buffer',          `${buffer} MW`, null, '1,600 − 1,200'],
              ['PJM Queue ID',          '— not yet public', null],
              ['Interconnect Voltage',  '— pending', null],
              ['Power Purchase (PPA)',  '— not disclosed', null],
              ['Renewable Commitment',  '— not disclosed', null],
              ['Cooling Approach',         'Primarily air-cooled',  'villageoffaq'],
              ['Water Use (full buildout)', '≤ 50,000 gal / day',   'villageoffaq'],
              ['PUE Target',            '— not disclosed', null],
            ].map(([k, v, src, note]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
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
