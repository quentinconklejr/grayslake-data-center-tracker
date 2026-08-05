import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import ItemCitations from '../components/ui/ItemCitations'
import { keysOf } from '../lib/citationKeys'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { questions } from '../data/questions'
import { projections } from '../data/projections'
import { LAST_VERIFIED } from '../data/siteConfig'
import AudienceBreadcrumb from '../components/ui/AudienceBreadcrumb'

const { project, jobs, fees, residentialRateImpact } = projections

// Pre-collect all sourceKeys so footnote numbers are stable
const PRELOAD_KEYS = []
for (const q of questions) {
  for (const block of ['stated', 'disputed', 'unknown']) {
    for (const item of q[block] ?? []) {
      for (const k of keysOf(item)) {
        if (!PRELOAD_KEYS.includes(k)) PRELOAD_KEYS.push(k)
      }
    }
  }
}
// Add any projections-sourced keys not already present
;['govtech2025', 'dcdGW2026', 'chitrib_june2026', 'clcjawa2026', 'dailyherald2026'].forEach(k => {
  if (!PRELOAD_KEYS.includes(k)) PRELOAD_KEYS.push(k)
})

function Section({ title, children }) {
  return (
    <FadeIn className="border-t border-gray-200 pt-8 pb-10">
      <h2 className="text-xl font-display font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        {children}
      </div>
    </FadeIn>
  )
}

function Fact({ label, children }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="shrink-0 text-2xs font-mono text-gray-400 uppercase tracking-widest w-24">{label}</span>
      <span className="text-gray-700">{children}</span>
    </div>
  )
}

const waterQ = questions.find(q => q.id === 'water-usage')
const energyQ = questions.find(q => q.id === 'energy-rates')
const scaleQ  = questions.find(q => q.id === 'campus-scale')
const taxQ    = questions.find(q => q.id === 'tax-revenue')
const procQ   = questions.find(q => q.id === 'approval-process')

export default function Residents() {
  return (
    <FootnoteProvider preload={PRELOAD_KEYS}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <AudienceBreadcrumb current="Residents" />
      <PageTitle {...pageMeta['/residents']} />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Plain-Language Summary</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">What this project means for Grayslake residents</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          T5 @ Chicago IV is the largest development ever approved in Lake County, and site work is underway. This page summarizes
          what is confirmed, what is disputed, and what has no public answer yet, in plain language,
          with every claim linked to its source.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <Section title="What exactly is being built?">
        <p>
          T5 Data Centers plans to build a hyperscale AI data center campus on {project.totalAcres.toLocaleString()} acres
          at Peterson Road and Route 83, in the Cornerstone business park.
          <SourceCitation sourceKey="dailyherald2026" />
          {' '}At full buildout, the campus would include up to {project.approvedBuildings}–{project.maxBuildings} buildings totaling
          roughly {project.totalSqFt.toLocaleString()} square feet, with {project.totalCapacityMW.toLocaleString()} MW of leasable
          computing capacity.
          <SourceCitation sourceKey="govtech2025" />
        </p>
        <p>
          The first building is expected online in {project.firstBuildingOnline}. Full buildout is projected
          around {project.fullBuildOut}.
          <SourceCitation sourceKey="dcdGW2026" />
        </p>
        <p>
          You may see different power numbers in different places. T5&rsquo;s CEO described{' '}
          {project.comEdCapacityGW} GW secured from ComEd, of which {project.totalCapacityMW.toLocaleString()} MW is
          leasable computing capacity.
          <SourceCitation sourceKey="govtech2025" />
          {' '}The larger number is the size of the electrical connection; the smaller one is how much computing it can
          rent out. Both can be accurate at once.
        </p>
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 space-y-2">
          <Fact label="Site size">{project.totalAcres.toLocaleString()} acres<SourceCitation sourceKey="dailyherald2026" /></Fact>
          <Fact label="Buildings">Up to {project.maxBuildings} approved<SourceCitation sourceKey="govtech2025" /></Fact>
          <Fact label="IT capacity">{project.totalCapacityMW.toLocaleString()} MW at full buildout, per T5<SourceCitation sourceKey="dcdGW2026" /></Fact>
          <Fact label="ComEd capacity">{project.comEdCapacityGW} GW secured, per T5 CEO<SourceCitation sourceKey="govtech2025" /></Fact>
          <Fact label="Phase 1">{project.firstBuildingOnline}<SourceCitation sourceKey="dcdGW2026" /></Fact>
        </div>
      </Section>

      <Section title="Will my water bill or water quality be affected?">
        {waterQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            <ItemCitations item={item} />
          </p>
        ))}
        {waterQ?.disputed.length > 0 && (
          <div className="bg-amber-50 border-l-2 border-amber-300 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest font-semibold mb-2">Disputed</p>
            {waterQ.disputed.map((item, i) => (
              <p key={i} className="text-gray-600">
                {item.text}
                <ItemCitations item={item} />
              </p>
            ))}
          </div>
        )}
        {waterQ?.unknown.length > 0 && (
          <div className="bg-gray-50 border-l-2 border-gray-200 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-semibold mb-2">No public answer yet</p>
            {waterQ.unknown.map((item, i) => (
              <p key={i} className="text-gray-500">{item.text}</p>
            ))}
          </div>
        )}
      </Section>

      <Section title="Will my electric bill go up?">
        {energyQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            <ItemCitations item={item} />
          </p>
        ))}
        <p>
          {residentialRateImpact.tariffNote}
        </p>
        {energyQ?.unknown.length > 0 && (
          <div className="bg-gray-50 border-l-2 border-gray-200 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-semibold mb-2">No public answer yet</p>
            {energyQ.unknown.map((item, i) => (
              <p key={i} className="text-gray-500">{item.text}</p>
            ))}
          </div>
        )}
      </Section>

      <Section title="How big will it really get?">
        {scaleQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            <ItemCitations item={item} />
          </p>
        ))}
        {scaleQ?.unknown.length > 0 && (
          <div className="bg-gray-50 border-l-2 border-gray-200 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-semibold mb-2">Not yet determined</p>
            {scaleQ.unknown.map((item, i) => (
              <p key={i} className="text-gray-500">
                {item.text}
                <ItemCitations item={item} />
              </p>
            ))}
          </div>
        )}
      </Section>

      <Section title="What about jobs?">
        <p>
          Mayor Davies cited {jobs.permanentDavies.toLocaleString()} permanent jobs at full buildout in October 2025.
          <SourceCitation sourceKey="govtech2025" />
          {' '}T5&rsquo;s CEO cited &ldquo;over {jobs.permanentMarin.toLocaleString()}&rdquo; in July 2026.
          <SourceCitation sourceKey="dailyherald_jul2026" />
          {' '}The Village FAQ gives a higher number, {jobs.permanent.toLocaleString()}, but reaches it by estimating
          50 jobs for every 300,000 square feet and assuming the largest campus the approvals allow actually gets built.
          The FAQ says so itself &mdash; the figure applies only &ldquo;if all 10 million sq ft of approved data center
          space is built&rdquo; &mdash; and cautions the estimate may change. It also leaves construction jobs out.
          <SourceCitation sourceKey="villagefaq_archived" />
        </p>
        <p>
          Construction through 2027–2029 will employ {jobs.constructionPhase}.
          <SourceCitation sourceKey="govtech2025" />
        </p>
      </Section>

      <Section title="What will the village and schools receive in taxes?">
        {taxQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            <ItemCitations item={item} />
          </p>
        ))}
        {taxQ?.disputed.length > 0 && (
          <div className="bg-amber-50 border-l-2 border-amber-300 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest font-semibold mb-2">Context</p>
            {taxQ.disputed.map((item, i) => (
              <p key={i} className="text-gray-600">
                {item.text}
                <ItemCitations item={item} />
              </p>
            ))}
          </div>
        )}
        {taxQ?.unknown.length > 0 && (
          <div className="bg-gray-50 border-l-2 border-gray-200 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-semibold mb-2">No public answer yet</p>
            {taxQ.unknown.map((item, i) => (
              <p key={i} className="text-gray-500">
                {item.text}
                <ItemCitations item={item} />
              </p>
            ))}
          </div>
        )}
      </Section>

      <Section title="Was the approval process proper?">
        {procQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            <ItemCitations item={item} />
          </p>
        ))}
        {procQ?.disputed.length > 0 && (
          <div className="bg-amber-50 border-l-2 border-amber-300 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest font-semibold mb-2">Disputed</p>
            {procQ.disputed.map((item, i) => (
              <p key={i} className="text-gray-600">
                {item.text}
                <ItemCitations item={item} />
              </p>
            ))}
          </div>
        )}
        {procQ?.unknown.length > 0 && (
          <div className="bg-gray-50 border-l-2 border-gray-200 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-semibold mb-2">Pending</p>
            {procQ.unknown.map((item, i) => (
              <p key={i} className="text-gray-500">{item.text}</p>
            ))}
          </div>
        )}
      </Section>

      <FadeIn className="mt-4 border-t border-gray-200 pt-8">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/questions" className="text-blue-600 hover:text-blue-700 transition-colors">
            All open questions →
          </Link>
          <Link to="/timeline" className="text-blue-600 hover:text-blue-700 transition-colors">
            Project timeline →
          </Link>
          <Link to="/sources" className="text-blue-600 hover:text-blue-700 transition-colors">
            All sources →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6 leading-relaxed">
          This page is not affiliated with T5 Data Centers, LLC or the Village of Grayslake.
          Every claim links to a public source. If a figure or fact is wrong, please reach out via the About page.
        </p>
      </FadeIn>

      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
