import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
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
    note: 'All phases scaling in parallel as demand grows.',
  },
  {
    period: '2029+',
    phase: 'Operations: Full Buildout',
    status: 'Projected',
    accent: 'border-emerald-300 bg-emerald-50',
    dot: 'bg-emerald-500',
    label: 'text-emerald-700',
    jobs: '1,500 – 1,680 permanent positions',
    note: 'Mayor Davies cited 1,500 (Chicago Tribune, Oct. 2025); T5 CEO Pete Marin cited "over 1,600" (Daily Herald, Jul. 2026). The Village FAQ reaches 1,680 at 50 jobs per 300,000 sq ft, conditional on all 10 million sq ft being built, hedged as subject to change, and excluding construction jobs.',
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

export default function Jobs() {
  return (
    <FootnoteProvider>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/jobs']} />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Employment</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Job Creation</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Permanent headcount has been stated three ways. Mayor Davies cited{' '}
          {jobs.permanentDavies.toLocaleString()} to the Chicago Tribune in October 2025. T5 CEO Pete Marin cited
          &ldquo;over {jobs.permanentMarin.toLocaleString()}&rdquo; in July 2026. The Village FAQ reaches{' '}
          {jobs.permanent.toLocaleString()} by estimating {jobs.permanentBasis}, and states that figure holds{' '}
          {jobs.permanentCondition} &mdash; a footprint the approvals permit but T5 has not committed to. The FAQ
          hedges its own number, noting that job estimates &ldquo;may change&rdquo; as operations and technologies do,
          and excludes site development and construction employment from it. That construction workforce is described
          separately as &ldquo;{jobs.constructionPhase}&rdquo; with no precise headcount publicly sourced.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Permanent Jobs"       value={`${jobs.permanentDavies.toLocaleString()}–${jobs.permanent.toLocaleString()}`} sub={`Upper figure ${jobs.permanentCondition}`} accent="green" sourceKey="villagefaq_archived" />
        <StatCard label="Construction"         value="Hundreds"                         sub="Active 2025–2029 (est.)"  badge="Est." accent="amber" sourceKey="govtech2025" />
        <StatCard label="Phase 1 Online"       value={project.firstBuildingOnline}      sub="First building operational" accent="blue" sourceKey="dcd2026" />
        <StatCard label="Full Buildout"        value="2029 at the earliest"             sub="Daily Herald reported 7–10 yrs from Oct 2025" badge="Disputed" accent="blue" sourceKey="govtech2025" />
      </FadeIn>

      <FadeIn className="glass-card p-6 sm:p-8 mb-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1">
          <div>
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-1">Workforce Comparison</p>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Permanent vs. Construction</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xs font-mono text-amber-700">Est. included</span>
            <SourceCitation sourceKey="govtech2025" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8 max-w-prose">
          Construction count at ~400 represents "hundreds" per Village documents and is treated as an estimate.
          The permanent count (1,680) is the current Village FAQ figure. An earlier figure of 1,500
          was cited at the October 2025 public meeting.
        </p>
        <JobsTimelineChart />
      </FadeIn>

      <FadeIn className="mb-10">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Employment by Phase</p>
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
                  <p className="text-sm text-gray-400 mt-1">
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
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest">Typical Permanent Roles</p>
            <span className="text-2xs text-gray-400">Industry standard</span>
          </div>
          <div className="space-y-0">
            {PERM_ROLES.map(([role, desc]) => (
              <div key={role} className="py-3 border-b border-gray-100 last:border-0">
                <p className="text-sm font-medium text-gray-800 mb-0.5">{role}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest">Construction Workforce</p>
            <SourceCitation sourceKey="dailyherald2026" />
          </div>
          <p className="text-base text-gray-600 leading-relaxed mb-5">
            Data center construction at this scale draws on multiple skilled trades.
            Projects of this size often include project labor agreements (PLAs) with regional trade unions.
          </p>
          <div className="border-t border-gray-100 pt-5">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-3">
              Trade unions likely involved
            </p>
            <ul className="space-y-2">
              {[
                'IBEW Local 176 — Electricians',
                'Iron Workers Local 508',
                'Operating Engineers Local 150',
                'Laborers Local 149',
              ].map(u => (
                <li key={u} className="text-sm text-gray-500 flex gap-2">
                  <span className="text-gray-300 shrink-0 mt-0.5">·</span>
                  {u}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-400 mt-4">
              Union involvement is unconfirmed. Names are drawn from comparable Illinois projects.
            </p>
          </div>
        </FadeIn>
      </div>
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
