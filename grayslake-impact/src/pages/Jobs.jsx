import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { Fragment } from 'react'
import { projections } from '../data/projections'
import Figure from '../components/ui/Figure'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, jobs } = projections

const PHASES = [
  {
    period: '2025 – Q4 2027',
    phase: 'Construction: Phase 1',
    status: 'Active now',
    accent: 'border-amber-300 bg-amber-50',
    dot: 'bg-amber-500',
    label: 'text-amber-700',
    jobs: '"Hundreds" of construction & trade workers (est.)',
    note: 'Earthmoving and site prep underway as of Nov 2025.',
  },
  {
    period: '2027 – 2029',
    phase: 'Construction: Full Buildout',
    status: 'Projected',
    accent: 'border-blue-300 bg-blue-50',
    dot: 'bg-blue-500',
    label: 'text-blue-700',
    jobs: 'Peak construction workforce across all phases',
    note: 'Phasing tied to leasing demand, per developer; no detailed schedule has been published.',
  },
  {
    period: '2029+',
    phase: 'Operations: Full Buildout',
    status: 'Projected',
    accent: 'border-emerald-300 bg-emerald-50',
    dot: 'bg-emerald-500',
    label: 'text-emerald-700',
    jobs: figureById['jobs-permanent'].value + ' permanent positions',
    note: figureById['jobs-permanent'].detail,
    sourceKeys: ['govtech2025', 'villagefaq_archived'],
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

export default function Jobs({ asSection = false }) {
  // Embedded in /project the page shares one footnote scope with the rest of
  // the page, so sources can all live in a single block at the bottom.
  const Wrap = asSection ? Fragment : FootnoteProvider

  return (
    <Wrap>
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`}>
      {!asSection && <PageTitle {...pageMeta['/jobs']} />}

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-600 uppercase tracking-[0.18em] mb-4">Employment</p>
        {asSection ? (
          <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Job Creation</h2>
        ) : (
          <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tight mb-3">Job Creation</h1>
        )}
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Permanent headcount has been stated three ways. Grayslake Mayor Elizabeth Davies cited{' '}
          {jobs.permanentDavies.toLocaleString()} to the Chicago Tribune in October 2025. T5 CEO Pete Marin cited
          &ldquo;over {jobs.permanentMarin.toLocaleString()}&rdquo; in July 2026. The Village FAQ reaches{' '}
          {jobs.permanent.toLocaleString()} by estimating {jobs.permanentBasis}, and states that figure holds{' '}
          {jobs.permanentCondition}, a footprint the approvals permit but T5 has not committed to. The FAQ
          hedges its own number, noting that job estimates &ldquo;may change&rdquo; as operations and technologies do,
          and excludes site development and construction employment from it. That construction workforce is described
          separately as &ldquo;{jobs.constructionPhase}&rdquo; with no precise headcount publicly sourced.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Permanent Jobs"       value={figureById['jobs-permanent'].value} sub={figureById['jobs-permanent'].qualifier} accent="green" sourceKey="villagefaq_archived" />
        <StatCard label="Construction"         value="Hundreds"                         sub="Active 2025–2029 (est.)"  badge="Est." accent="amber" sourceKey="govtech2025" />
        <StatCard label="Phase 1 Online"       value={project.firstBuildingOnline}      sub="First building operational" accent="blue" sourceKey="dcd2026" />
        <StatCard label="Full Buildout"        value={figureById['buildout'].value} sub={figureById['buildout'].qualifier} badge="Disputed" accent="blue" sourceKey="govtech2025" />
      </FadeIn>

      <FadeIn className="glass-card p-6 sm:p-8 mb-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1">
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Workforce Comparison</p>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Permanent vs. Construction</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xs font-mono text-amber-700">Est. included</span>
            <SourceCitation sourceKey="govtech2025" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8 max-w-prose">
          Construction count at ~400 represents "hundreds" per Village documents and is treated as an estimate.
          Permanent headcount is <Figure id="jobs-permanent" />.
        </p>
        <JobsTimelineChart />
      </FadeIn>

      <FadeIn className="mb-10">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.15em] mb-6">Employment by Phase</p>
        <div className="space-y-3">
          {PHASES.map(({ period, phase, status, accent, dot, label, jobs: jobDesc, note, sourceKey }) => (
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
                  <p className="text-base font-display font-semibold text-gray-900 mb-0.5">{phase}</p>
                  <p className="text-sm text-gray-600">{jobDesc}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {note}
                    {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-4">
        <FadeIn className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Typical permanent roles</p>
          </div>
          <div className="space-y-0">
            {PERM_ROLES.map(([role, desc]) => (
              <div key={role} className="py-3 border-b border-edge-soft/50 last:border-0">
                <p className="text-sm font-medium text-gray-800 mb-0.5">{role}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Construction Workforce</p>
            <SourceCitation sourceKey="dailyherald2026" />
          </div>
          <p className="text-base text-gray-600 leading-relaxed mb-5">
            The workforce has been described only as &ldquo;hundreds of construction and trade jobs.&rdquo;
            T5 has not confirmed a project labor agreement with any regional union.
          </p>
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
              Trade unions likely involved
            </p>
            <ul className="space-y-2">
              {[
                'IBEW Local 176 (electricians)',
                'Iron Workers Local 508',
                'Operating Engineers Local 150',
                'Laborers Local 149',
              ].map(u => (
                <li key={u} className="text-sm text-gray-500 flex gap-2">
                  <span aria-hidden="true" className="text-gray-300 shrink-0 mt-0.5">·</span>
                  {u}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              Union involvement is unconfirmed. Names are drawn from comparable Illinois projects.
            </p>
          </div>
        </FadeIn>
      </div>
      {!asSection && <FootnoteList />}
    </div>
    </Wrap>
  )
}
