import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { Fragment } from 'react'
import { projections } from '../data/projections'
import Figure from '../components/ui/Figure'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, jobs } = projections

const PHASES = [
  {
    period: '2025 to Q4 2027',
    phase: 'Construction: Phase 1',
    status: 'Active',
    accent: 'border-amber-300 bg-amber-50/80',
    dot: 'bg-amber-500',
    label: 'text-amber-800',
    jobs: 'Hundreds of construction and trade workers (estimated)',
    note: 'Site preparation and earthmoving active as of November 2025.',
  },
  {
    period: '2027 to 2029',
    phase: 'Construction: Full Buildout',
    status: 'Projected',
    accent: 'border-blue-300 bg-blue-50/80',
    dot: 'bg-blue-500',
    label: 'text-blue-800',
    jobs: 'Peak construction workforce across subsequent phases',
    note: 'Phasing depends on commercial leasing demand; detailed schedule unreleased.',
  },
  {
    period: '2029+',
    phase: 'Operations: Full Buildout',
    status: 'Projected',
    accent: 'border-emerald-300 bg-emerald-50/80',
    dot: 'bg-emerald-500',
    label: 'text-emerald-800',
    jobs: figureById['jobs-permanent'].value + ' permanent positions',
    note: figureById['jobs-permanent'].detail,
    sourceKeys: ['govtech2025', 'villagefaq_archived'],
  },
]

const PERM_ROLES = [
  ['Data Center Technicians',    'Hardware maintenance, server lifecycle management'],
  ['Network / IT Engineers',     'Infrastructure, connectivity, systems reliability'],
  ['Facilities & Mechanical',    'HVAC, electrical, cooling systems'],
  ['Security Operations',        'Physical and cyber security staff'],
  ['Site Management',            'Operations leadership, compliance'],
  ['Administrative / Support',  'HR, finance, administration'],
]

export default function Jobs({ asSection = false }) {
  const Wrap = asSection ? Fragment : FootnoteProvider

  return (
    <Wrap>
    <div className={`${asSection ? "pt-1 pb-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-12"}`}>
      {!asSection && <PageTitle {...pageMeta['/jobs']} />}

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-3">Employment</p>
        {asSection ? (
          <h3 className="text-3xl font-display font-bold text-gray-900 tracking-tight mb-3">Job Creation</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-3">Job Creation</h1>
        )}
        <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
          Three official sources cite different permanent employment figures. Grayslake Mayor Elizabeth Davies cited {jobs.permanentDavies.toLocaleString()} jobs in October 2025. T5 Chief Executive Pete Marin cited more than {jobs.permanentMarin.toLocaleString()} in July 2026. The Village FAQ projects up to {jobs.permanent.toLocaleString()} permanent positions, based on {jobs.permanentBasis}. That maximum assumes full construction of the permitted {jobs.permanentCondition}. T5 has not committed to full buildout. Construction employment is listed separately as {jobs.constructionPhase}, with no headcount published.
        </p>
        <p className="text-xs font-mono text-gray-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-12">
        <StatCard label="Permanent Jobs"       value={figureById['jobs-permanent'].value} sub={figureById['jobs-permanent'].qualifier} accent="green" sourceKey="villagefaq_archived" />
        <StatCard label="Construction"         value="Hundreds"                         sub="Active 2025 to 2029 (est.)"  badge="Est." accent="amber" sourceKey="govtech2025" />
        <StatCard label="Phase 1 Online"       value={project.firstBuildingOnline}      sub="First building operational" accent="blue" sourceKey="dcd2026" />
        <StatCard label="Full Buildout"        value={figureById['buildout'].value} sub={figureById['buildout'].qualifier} badge="Disputed" accent="blue" sourceKey="govtech2025" />
      </FadeIn>

      <FadeIn className="glass-card p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1">
          <div>
            <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1">Workforce Comparison</p>
            <h3 className="text-2xl font-display font-bold text-gray-900">Permanent vs. Construction Workforce</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Est. included</span>
            <SourceCitation sourceKey="govtech2025" />
          </div>
        </div>
        <p className="text-base text-gray-700 mb-8 max-w-prose leading-relaxed">
          Village documents estimate construction headcount at 400 positions. Permanent operational headcount is listed as <Figure id="jobs-permanent" />.
        </p>
        <JobsTimelineChart />
      </FadeIn>

      <FadeIn className="mb-10">
        <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-[0.15em] mb-5">Employment Timeline by Phase</p>
        <div className="space-y-4">
          {PHASES.map(({ period, phase, status, accent, dot, label, jobs: jobDesc, note, sourceKey }) => (
            <div key={phase} className={`border rounded-xl px-6 py-5 ${accent}`}>
              <div className="flex items-start gap-5">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-semibold text-slate-600">{period}</span>
                    <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${label}`}>{status}</span>
                  </div>
                  <p className="text-lg font-display font-bold text-gray-900 mb-1">{phase}</p>
                  <p className="text-base font-medium text-gray-800">{jobDesc}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {note}
                    {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">Permanent Operational Roles</p>
          </div>
          <div className="space-y-0">
            {PERM_ROLES.map(([role, desc]) => (
              <div key={role} className="py-3 border-b border-edge-soft/50 last:border-0">
                <p className="text-base font-semibold text-slate-900 mb-0.5">{role}</p>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">Construction Trade Workforce</p>
            <SourceCitation sourceKey="dailyherald2026" />
          </div>
          <p className="text-base text-gray-700 leading-relaxed mb-5">
            The trade workforce is listed in public records as &ldquo;hundreds of construction and trade jobs.&rdquo; T5 has not formally executed a project labor agreement with regional building trades councils.
          </p>
          {/* A list of four named trade locals sat here, with a note beneath
              conceding the designations were inferred from other projects. No
              source connects any of them to this campus. Naming real
              organisations on inference is the one thing this site cannot do
              and remain useful. */}
          <div className="border-t border-gray-200 pt-5">
            <p className="text-xs font-mono text-slate-600 leading-relaxed">
              No contractor list, trade breakdown or project labor agreement has been published for
              this campus. General site work at Cornerstone is being carried out by the original
              developer, the Alter Group.
            </p>
          </div>
        </FadeIn>
      </div>
      {!asSection && <FootnoteList />}
    </div>
    </Wrap>
  )
}
