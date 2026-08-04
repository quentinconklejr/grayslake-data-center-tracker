import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { contacts } from '../data/contacts'
import { LAST_VERIFIED } from '../data/siteConfig'
import AudienceBreadcrumb from '../components/ui/AudienceBreadcrumb'

const { project, jobs, stateIncentiveContext } = projections

const KEY_FIGURES = [
  {
    label: 'Campus area',
    value: `${project.totalAcres.toLocaleString()} acres`,
    detail: 'Peterson Road & Route 83, Grayslake',
    sourceKey: 'villageoffaq',
  },
  {
    label: 'Total buildable area',
    value: `${Number(project.totalSqFt).toLocaleString()} sq ft`,
    detail: 'At full buildout per Village FAQ',
    sourceKey: 'villageoffaq',
  },
  {
    label: 'IT capacity',
    value: `${project.totalCapacityMW.toLocaleString()} MW`,
    detail: 'Leasable at full buildout',
    sourceKey: 'dcdGW2026',
  },
  {
    label: 'Secured utility power',
    value: `${project.securedPowerMW.toLocaleString()} MW`,
    detail: 'ComEd capacity contracted',
    sourceKey: 'dcdGW2026',
  },
  {
    label: 'Approved buildings',
    value: `${project.approvedBuildings} (up to ${project.maxBuildings})`,
    detail: 'Per Village approvals; CEO cited 20 as upper estimate',
    sourceKey: 'govtech2025',
  },
  {
    label: 'Permanent jobs projected',
    value: jobs.permanent.toLocaleString(),
    detail: 'Village FAQ current estimate at full buildout',
    sourceKey: 'villageoffaq',
  },
  {
    label: 'Developer investment range',
    value: `$${project.costLow}B – $${project.costHigh}B`,
    detail: "Mayor Davies: $8.5B · CEO Marin: up to $18B",
    sourceKey: 'govtech2025',
  },
  {
    label: 'Phase 1 online',
    value: project.firstBuildingOnline,
    detail: 'First 60 MW building, currently under construction',
    sourceKey: 'dcd2026',
  },
  {
    label: 'Land acquisition price',
    value: '$29.4M for 134 acres',
    detail: 'Option on 45 additional acres',
    sourceKey: 'baxtel2026',
  },
  {
    label: 'State incentive status',
    value: 'Applications suspended',
    detail: `${stateIncentiveContext.statusChange}`,
    sourceKey: 'dceo2026',
  },
  {
    label: 'Village FAQ litigation notice',
    value: 'June 5, 2026',
    detail: 'Village states it can no longer respond to questions due to pending litigation',
    sourceKey: 'villageoffaq',
  },
  {
    label: 'Wetlands fill permit',
    value: '~15.75 acres applied',
    detail: 'US Army Corps of Engineers Section 404 permit application filed',
    sourceKey: 'chitrib_june2026',
  },
]

export default function Reporters() {
  return (
    <FootnoteProvider>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <AudienceBreadcrumb current="Reporters" />
      <PageTitle
        title="For Reporters"
        description="Key figures, citations, and press contact reference for T5 @ Chicago IV — the largest proposed development in Lake County, Illinois."
        ogImage="/og/reporters.png"
      />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Press Reference</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Key figures and contacts</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Sourced figures from public documents and press coverage on T5 @ Chicago IV.
          Every number links to its primary source. See{' '}
          <Link to="/sources" className="text-blue-600 hover:text-blue-700 transition-colors">the Sources page</Link>
          {' '}for full citation details.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      {/* Key figures table */}
      <FadeIn className="mb-14">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-5">Key Figures</p>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
          {KEY_FIGURES.map(({ label, value, detail, sourceKey }) => (
            <div key={label} className="grid sm:grid-cols-5 gap-2 sm:gap-4 px-5 py-4">
              <div className="sm:col-span-2">
                <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-sm font-display font-semibold text-gray-900 leading-snug">
                  {value}
                  {sourceKey && <SourceCitation sourceKey={sourceKey} />}
                </p>
                {detail && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Contacts */}
      <FadeIn className="mb-14">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-2">Contacts</p>
        <p className="text-xs text-gray-500 mb-5">
          Contact information is drawn only from source documents on file. Where no direct contact
          information appears in those records it is noted below.
        </p>
        <div className="space-y-4">
          {contacts.map(c => (
            <div key={c.org} className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
              <p className="text-sm font-display font-semibold text-gray-900">{c.org}</p>
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mt-0.5 mb-3">{c.role}</p>
              <div className="space-y-1.5">
                {c.website && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-gray-400 w-14 shrink-0 font-mono">web</span>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {c.website}
                    </a>
                  </div>
                )}
              </div>
              {c.note && (
                <p className="text-xs text-amber-700/80 italic mt-3 leading-relaxed border-t border-gray-100 pt-3">
                  {c.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Note on coverage */}
      <FadeIn className="border-t border-gray-200 pt-8">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-3">Coverage on File</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          This site indexes primary reporting from the Daily Herald, Chicago Tribune, Data Center Dynamics,
          Government Technology, Capitol News Illinois, Chronicle Media, Patch, and Hoodline,
          as well as official documents from the Village of Grayslake, Village of Mundelein,
          Citizens Utility Board, Alliance for the Great Lakes, and Illinois DCEO.
        </p>
        <Link
          to="/sources"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all sources
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          This site is not affiliated with T5 Data Centers, LLC or the Village of Grayslake.
          It is an independent, resident-built resource. If a figure is wrong or a document is missing,
          please reach out via the About page.
        </p>
      </FadeIn>

      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
