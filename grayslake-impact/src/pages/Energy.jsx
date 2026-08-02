import PageTitle from '../components/ui/PageTitle'
import StatCard from '../components/ui/StatCard'
import EnergyDrawChart from '../components/charts/EnergyDrawChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { projections } from '../data/projections'

const { project } = projections
const buffer = project.securedPowerMW - project.totalCapacityMW

export default function Energy() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Energy Draw" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Grid Impact</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Energy Draw</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          T5 has secured {project.securedPowerMW.toLocaleString()} MW of utility power against a planned{' '}
          {project.totalCapacityMW.toLocaleString()} MW of leasable IT capacity — a {buffer} MW buffer
          for redundancy and future phases. Both figures are sourced from public developer disclosures.
        </p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Secured Power"     value={`${project.securedPowerMW.toLocaleString()} MW`}  sub="Utility-contracted capacity"   accent="amber" sourceKey="baxtel2026" />
        <StatCard label="IT Capacity"       value={`${project.totalCapacityMW.toLocaleString()} MW`} sub="Leasable at full buildout"      accent="blue"  sourceKey="dcdGW2026" />
        <StatCard label="Power Buffer"      value={`${buffer} MW`}                                    sub="Secured above leasable cap"    accent="amber" sourceKey="baxtel2026" />
        <StatCard label="PJM Zone"          value="COMED"                                             sub="ComEd transmission zone, PJM"  accent="blue"  sourceKey="dceo2026" />
      </FadeIn>

      <FadeIn className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Power Profile</p>
            <h2 className="text-2xl font-display font-bold text-gray-900">Secured Power vs. IT Capacity</h2>
          </div>
          <div className="flex items-center gap-3">
            <SourceCitation sourceKey="baxtel2026" />
            <SourceCitation sourceKey="dcdGW2026" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Both figures are sourced from public developer disclosures — no estimation involved.
          T5 originally announced the campus at 480 MW (2024); subsequent developer plans expanded the leasable IT capacity target to 1,200 MW.
        </p>
        <EnergyDrawChart />
      </FadeIn>

      <FadeIn className="bg-white border border-gray-200 rounded-xl px-6 py-6 mb-6 shadow-sm">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Residential Rate Impact</p>
        <div className="space-y-3">

          <div className="pl-4 border-l-2 border-gray-300 py-1">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-sm font-display font-semibold text-gray-800">Direct distribution costs: tariff-walled</p>
              <SourceCitation sourceKey="dceo2026" />
            </div>
            <p className="text-base text-gray-600 leading-relaxed">
              Illinois maintains a separate utility rate class for large industrial users including data centers.
              The ICC-approved ComEd tariff requires data centers to fund their own transmission and
              distribution upgrade costs — those costs do not flow through to residential rate classes as a direct line item.
            </p>
          </div>

          <div className="pl-4 border-l-2 border-amber-400 bg-amber-50/60 rounded-r py-3 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-sm font-display font-semibold text-amber-800">Regional capacity prices: an open question</p>
            </div>
            <p className="text-base text-gray-600 leading-relaxed">
              The ICC tariff wall contains distribution and transmission upgrade costs within the large
              industrial rate class. However, PJM capacity auction clearing prices are set by aggregate
              regional demand across all load — a wholesale market effect that the distribution tariff
              does not address. Whether and by how much data center growth is contributing to higher
              capacity prices in the ComEd zone is not yet established by any verified public study.
              No confirmed figure is available.
            </p>
          </div>

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
              At {project.totalCapacityMW.toLocaleString()} MW, T5 would be one of the largest single-campus
              loads in the ComEd zone — comparable to a medium-sized city. Interconnection agreements
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
              ['Secured Power',         `${project.securedPowerMW.toLocaleString()} MW`, 'baxtel2026'],
              ['Leasable IT Capacity',  `${project.totalCapacityMW.toLocaleString()} MW`, 'dcdGW2026'],
              ['Power Buffer',          `${buffer} MW`, null],
              ['PJM Queue ID',          '— not yet public', null],
              ['Interconnect Voltage',  '— pending', null],
              ['Power Purchase (PPA)',  '— not disclosed', null],
              ['Renewable Commitment',  '— not disclosed', null],
              ['Cooling Approach',      '— not disclosed', null],
              ['PUE Target',            '— not disclosed', null],
            ].map(([k, v, src]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="flex items-center gap-1.5 text-sm font-mono text-gray-800">
                  {v}
                  {src && <SourceCitation sourceKey={src} />}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

    </div>
  )
}
