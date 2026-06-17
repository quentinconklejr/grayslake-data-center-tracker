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

      {/* Header */}
      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-amber-400/50 uppercase tracking-[0.2em] mb-3">Grid Impact</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Energy Draw</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          T5 has secured {project.securedPowerMW.toLocaleString()} MW of utility power against a planned{' '}
          {project.totalCapacityMW.toLocaleString()} MW of leasable IT capacity — a {buffer} MW buffer
          for redundancy and future phases. Both figures are sourced from public developer disclosures.
        </p>
      </FadeIn>

      {/* Stats */}
      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Secured Power"     value={`${project.securedPowerMW.toLocaleString()} MW`}  sub="Utility-contracted capacity"   accent="amber" sourceKey="baxtel2026" />
        <StatCard label="IT Capacity"       value={`${project.totalCapacityMW.toLocaleString()} MW`} sub="Leasable at full buildout"      accent="blue"  sourceKey="dcd2026" />
        <StatCard label="Power Buffer"      value={`${buffer} MW`}                                    sub="Secured above leasable cap"    accent="amber" sourceKey="baxtel2026" />
        <StatCard label="PJM Zone"          value="COMED"                                             sub="ComEd transmission zone, PJM"  accent="blue"  sourceKey="dceo2026" />
      </FadeIn>

      {/* Chart */}
      <FadeIn className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-8 mb-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Power Profile</p>
            <h2 className="text-lg font-display font-bold text-gray-200">Secured Power vs. IT Capacity</h2>
          </div>
          <div className="flex items-center gap-3">
            <SourceCitation sourceKey="baxtel2026" />
            <SourceCitation sourceKey="dcd2026" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-8">
          Both figures are sourced from public developer disclosures — no estimation involved.
        </p>
        <EnergyDrawChart />
      </FadeIn>

      {/* Residential rate callout — nuanced */}
      <FadeIn className="bg-gray-900/40 border border-gray-800/50 rounded-xl px-6 py-6 mb-6">
        <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-5">Residential Rate Impact</p>
        <div className="space-y-3">

          {/* Tariff wall — confirmed */}
          <div className="pl-4 border-l-2 border-gray-600/40 py-1">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-xs font-display font-semibold text-gray-300">Direct distribution costs: tariff-walled</p>
              <SourceCitation sourceKey="dceo2026" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Illinois maintains a separate utility rate class for large industrial users including data centers.
              The ICC-approved ComEd tariff requires data centers to fund their own transmission and
              distribution upgrade costs — those costs do not flow through to residential rate classes as a direct line item.
            </p>
          </div>

          {/* PJM capacity effect — disputed/open */}
          <div className="pl-4 border-l-2 border-amber-500/40 bg-amber-400/[0.03] rounded-r py-3 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-xs font-display font-semibold text-amber-300/80">Regional capacity prices: an open question</p>
              <SourceCitation sourceKey="cub2026" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              ComEd residential bills rose approximately 12% in June 2026. The Citizens Utility Board
              links up to ~25% of that increase to data-center-driven PJM capacity price increases —
              a wholesale electricity market effect. PJM capacity prices are set by aggregate regional
              demand across all load; the tariff wall on distribution does not insulate residents from
              capacity auction outcomes driven by the regional surge in data center load.
            </p>
          </div>

        </div>
      </FadeIn>

      {/* Context panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <FadeIn className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-5">Grid &amp; Interconnection Context</p>
          <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
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

        <FadeIn delay={0.08} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-5">Technical Key Metrics</p>
          <div className="space-y-0">
            {[
              ['Secured Power',         `${project.securedPowerMW.toLocaleString()} MW`, 'baxtel2026'],
              ['Leasable IT Capacity',  `${project.totalCapacityMW.toLocaleString()} MW`, 'dcd2026'],
              ['Power Buffer',          `${buffer} MW`, null],
              ['PJM Queue ID',          '— not yet public', null],
              ['Interconnect Voltage',  '— pending', null],
              ['Power Purchase (PPA)',  '— not disclosed', null],
              ['Renewable Commitment',  '— not disclosed', null],
              ['Cooling Approach',      '— not disclosed', null],
              ['PUE Target',            '— not disclosed', null],
            ].map(([k, v, src]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-800/30 last:border-0">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-gray-300">
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
