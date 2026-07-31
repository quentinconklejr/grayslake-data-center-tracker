import PageTitle from '../components/ui/PageTitle'
import StatCard from '../components/ui/StatCard'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { projections } from '../data/projections'

const { project, jobs } = projections

const PHASES = [
  {
    period: '2025 – Q4 2027',
    phase: 'Construction — Phase 1',
    status: 'Active now',
    accent: 'border-amber-500/40 bg-amber-500/5',
    dot: 'bg-amber-500',
    label: 'text-amber-400',
    jobs: '"Hundreds" of construction & trade workers (est.)',
    note: 'Earthmoving and site prep underway as of Nov 2025.',
  },
  {
    period: '2027 – 2029',
    phase: 'Construction — Full Buildout',
    status: 'Projected',
    accent: 'border-blue-500/40 bg-blue-500/5',
    dot: 'bg-blue-500',
    label: 'text-blue-400',
    jobs: 'Peak construction workforce across all phases',
    note: 'All phases scaling in parallel as demand grows.',
  },
  {
    period: '2029+',
    phase: 'Operations — Full Buildout',
    status: 'Projected',
    accent: 'border-emerald-500/40 bg-emerald-500/5',
    dot: 'bg-emerald-500',
    label: 'text-emerald-400',
    jobs: '1,500 permanent positions',
    note: 'Village estimate of 1,500; the Village FAQ\'s per-sq-ft figure (50 jobs per 300,000 sq ft) extrapolates to ~1,680 at full buildout.',
  },
]

const PERM_ROLES = [
  ['Data Center Technicians',   'Hardware maintenance, server lifecycle management'],
  ['Network / IT Engineers',    'Infrastructure, connectivity, systems reliability'],
  ['Facilities & Mechanical',   'HVAC, electrical, cooling systems'],
  ['Security Operations',       'Physical and cyber security staff'],
  ['Site Management',           'Operations leadership, compliance'],
  ['Administrative / Support',  'HR, finance, administration'],
]

export default function Jobs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Job Creation" />

      {/* Header */}
      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-emerald-400/50 uppercase tracking-[0.2em] mb-3">Employment</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Job Creation</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          T5 has projected {jobs.permanent.toLocaleString()} permanent positions at full buildout.
          Construction phase employment is described in Village documents as "{jobs.constructionPhase}" —
          no precise headcount is publicly sourced for that period.
        </p>
      </FadeIn>

      {/* Stats */}
      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Permanent Jobs"       value={jobs.permanent.toLocaleString()} sub="At full buildout (2029)"    accent="green" sourceKey="govtech2025" />
        <StatCard label="Construction"         value="Hundreds"                         sub="Active 2025–2029 (est.)"  badge="Est." accent="amber" sourceKey="govtech2025" />
        <StatCard label="Phase 1 Online"       value={project.firstBuildingOnline}      sub="First building operational" accent="blue" sourceKey="dcd2026" />
        <StatCard label="Full Buildout"        value={project.fullBuildOut}             sub={`Up to ${project.maxBuildings} buildings`} accent="blue" sourceKey="patch2026" />
      </FadeIn>

      {/* Chart */}
      <FadeIn className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-8 mb-3">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-1">Workforce Comparison</p>
            <h2 className="text-lg font-display font-bold text-gray-200">Permanent vs. Construction</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xs font-mono text-amber-400/60">Est. included</span>
            <SourceCitation sourceKey="govtech2025" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-8">
          Construction count at ~400 represents "hundreds" per Village docs — clearly estimated.
          Permanent count (1,500) is the Village projection; the Village FAQ's per-sq-ft rate (50 jobs / 300,000 sq ft) extrapolates to ~1,680 at full buildout.
        </p>
        <JobsTimelineChart />
      </FadeIn>

      {/* Phase timeline */}
      <FadeIn className="mb-10">
        <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-5">Employment by Phase</p>
        <div className="space-y-3">
          {PHASES.map(({ period, phase, status, accent, dot, label, jobs: jobDesc, note }) => (
            <div key={phase} className={`border rounded-xl px-6 py-5 ${accent}`}>
              <div className="flex items-start gap-5">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-2xs font-mono text-gray-500">{period}</span>
                    <span className={`text-2xs font-mono uppercase tracking-widest ${label}`}>{status}</span>
                  </div>
                  <p className="text-sm font-display font-semibold text-gray-200 mb-0.5">{phase}</p>
                  <p className="text-xs text-gray-400">{jobDesc}</p>
                  <p className="text-xs text-gray-500 mt-1">{note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Role categories + construction context */}
      <div className="grid md:grid-cols-2 gap-4">
        <FadeIn className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest">Typical Permanent Roles</p>
            <span className="text-2xs text-gray-500">Industry standard</span>
          </div>
          <div className="space-y-0">
            {PERM_ROLES.map(([role, desc]) => (
              <div key={role} className="py-3 border-b border-gray-800/40 last:border-0">
                <p className="text-xs font-medium text-gray-300 mb-0.5">{role}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest">Construction Workforce</p>
            <SourceCitation sourceKey="dailyherald2026" />
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            Large-scale data center construction requires electricians, ironworkers, HVAC
            installers, and civil workers. Projects at this scale often include project labor
            agreements (PLAs) with regional trade unions.
          </p>
          <div className="border-t border-gray-800/40 pt-5">
            <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-3">
              Trade unions likely involved
            </p>
            <ul className="space-y-2">
              {[
                'IBEW Local 176 — Electricians',
                'Iron Workers Local 508',
                'Operating Engineers Local 150',
                'Laborers Local 149',
              ].map(u => (
                <li key={u} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-gray-700 shrink-0 mt-0.5">·</span>
                  {u}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Union involvement unconfirmed — based on comparable IL projects.
            </p>
          </div>
        </FadeIn>
      </div>

    </div>
  )
}
