import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import StatCard from '../components/ui/StatCard'
import JobsTimelineChart from '../components/charts/JobsTimelineChart'
import SourceCitation from '../components/ui/SourceCitation'
import FadeIn from '../components/ui/FadeIn'
import Container from '../components/layout/Container'
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
    rail: 'border-status-policy',
    dot:  'bg-status-policy',
    label:'text-status-policy',
    jobs: 'Hundreds of construction and trade workers (estimated)',
    note: 'Site preparation and earthmoving active as of November 2025.',
  },
  {
    period: '2027 to 2029',
    phase: 'Construction: Full Buildout',
    status: 'Projected',
    rail: 'border-status-approval',
    dot:  'bg-status-approval',
    label:'text-status-approval',
    jobs: 'Peak construction workforce across subsequent phases',
    note: 'Phasing depends on commercial leasing demand; detailed schedule unreleased.',
  },
  {
    period: '2029+',
    phase: 'Operations: Full Buildout',
    status: 'Projected',
    rail: 'border-status-construction',
    dot:  'bg-status-construction',
    label:'text-status-construction',
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
  const Wrap = asSection ? Fragment : FootnoteProvider

  const body = (
    <>
      {!asSection && <PageTitle {...pageMeta['/jobs']} />}

      <FadeIn className="mb-10 pb-8 border-b border-rule">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Employment</p>
        {asSection ? (
          <h3 className="text-3xl font-display text-ink-900 tracking-tight leading-tight mb-3">Job Creation</h3>
        ) : (
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-3">Job Creation</h1>
        )}
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          Three official sources cite different permanent employment figures. Grayslake Mayor Elizabeth Davies cited {jobs.permanentDavies.toLocaleString()} jobs in October 2025. T5 Chief Executive Pete Marin cited more than {jobs.permanentMarin.toLocaleString()} in July 2026. The Village FAQ projects up to {jobs.permanent.toLocaleString()} permanent positions, based on {jobs.permanentBasis}. That maximum assumes full construction of the permitted {jobs.permanentCondition}. T5 has not committed to full buildout. Construction employment is listed separately as {jobs.constructionPhase}, with no headcount published.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
        <StatCard label="Permanent Jobs" value={figureById['jobs-permanent'].value} sub={figureById['jobs-permanent'].qualifier} accent="green" sourceKey="villagefaq_archived" />
        <StatCard label="Construction"   value="Hundreds"                            sub="Active 2025 to 2029 (est.)"  badge="Est." accent="amber" sourceKey="govtech2025" />
        <StatCard label="Phase 1 Online" value={project.firstBuildingOnline}         sub="First building operational" accent="blue" sourceKey="dcd2026" />
        <StatCard label="Full Buildout"  value={figureById['buildout'].value}        sub={figureById['buildout'].qualifier} badge="Disputed" accent="blue" sourceKey="govtech2025" />
      </FadeIn>

      <FadeIn className="mb-10 border-t border-rule pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
          <div>
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-1">Workforce Comparison</p>
            <h3 className="text-2xl font-display text-ink-900 tracking-tight">Permanent vs. Construction Workforce</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-sans font-semibold text-status-disputed">Est. included</span>
            <SourceCitation sourceKey="govtech2025" />
          </div>
        </div>
        <p className="text-base font-sans text-ink-700 mb-8 max-w-prose leading-relaxed">
          Village documents estimate construction headcount at 400 positions. Permanent operational headcount is listed as <Figure id="jobs-permanent" />.
        </p>
        <JobsTimelineChart />
      </FadeIn>

      <FadeIn className="mb-10 border-t border-rule pt-6">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Employment Timeline by Phase</p>
        <div className="space-y-5">
          {PHASES.map(({ period, phase, status, rail, dot, label, jobs: jobDesc, note, sourceKey }) => (
            <div key={phase} className={`border-l-[3px] pl-5 py-1 ${rail}`}>
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className={`mt-2 w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-0.5">
                    <span className="text-xs font-mono text-ink-600">{period}</span>
                    <span className={`text-2xs font-sans font-semibold uppercase tracking-wide ${label}`}>{status}</span>
                  </div>
                  <p className="text-lg font-display text-ink-900 mb-1">{phase}</p>
                  <p className="text-base font-sans font-semibold text-ink-800">{jobDesc}</p>
                  <p className="text-sm font-sans text-ink-600 mt-1 leading-relaxed">
                    {note}
                    {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
        <FadeIn className="border-t border-rule pt-6">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4">Permanent Operational Roles</p>
          <dl className="divide-y divide-rule-strong">
            {PERM_ROLES.map(([role, desc]) => (
              <div key={role} className="py-3">
                <dt className="text-base font-sans font-semibold text-ink-900">{role}</dt>
                <dd className="text-sm font-sans text-ink-600 mt-0.5">{desc}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>

        <FadeIn delay={0.08} className="border-t border-rule pt-6">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-xs font-display italic text-ink-500 tracking-wide">Construction Trade Workforce</p>
            <SourceCitation sourceKey="dailyherald2026" />
          </div>
          <p className="text-base font-sans text-ink-700 leading-relaxed mb-5">
            The trade workforce is listed in public records as &ldquo;hundreds of construction and trade jobs.&rdquo; T5 has not formally executed a project labor agreement with regional building trades councils.
          </p>
          {/* A list of four named trade locals sat here, with a note beneath
              conceding the designations were inferred from other projects. No
              source connects any of them to this campus. Naming real
              organisations on inference is the one thing this site cannot do
              and remain useful. */}
          <div className="border-t border-rule-soft pt-4">
            <p className="text-sm font-sans text-ink-600 leading-relaxed">
              No contractor list, trade breakdown or project labor agreement has been published for
              this campus. General site work at Cornerstone is being carried out by the original
              developer, the Alter Group.
            </p>
          </div>
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
        <Container size="wide" className="py-12">{body}</Container>
      )}
    </Wrap>
  )
}
