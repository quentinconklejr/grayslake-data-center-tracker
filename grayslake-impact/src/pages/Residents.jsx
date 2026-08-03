import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { questions } from '../data/questions'
import { projections } from '../data/projections'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, jobs, fees, residentialRateImpact } = projections

// Pre-collect all sourceKeys so footnote numbers are stable
const PRELOAD_KEYS = []
for (const q of questions) {
  for (const block of ['stated', 'disputed', 'unknown']) {
    for (const item of q[block] ?? []) {
      if (item.sourceKey && !PRELOAD_KEYS.includes(item.sourceKey)) {
        PRELOAD_KEYS.push(item.sourceKey)
      }
    }
  }
}
// Add any projections-sourced keys not already present
;['villageoffaq', 'govtech2025', 'dcdGW2026', 'chitrib_june2026'].forEach(k => {
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
      <PageTitle title="For Residents" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Plain-Language Summary</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">What this project means for Grayslake residents</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          T5 @ Chicago IV is the largest development ever proposed in Lake County. This page summarizes
          what is confirmed, what is disputed, and what has no public answer yet — in plain language,
          with every claim linked to its source.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <Section title="What exactly is being built?">
        <p>
          T5 Data Centers plans to build a hyperscale AI data center campus on {project.totalAcres.toLocaleString()} acres
          at Peterson Road and Route 83.
          <SourceCitation sourceKey="villageoffaq" />
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
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 space-y-2">
          <Fact label="Site size">{project.totalAcres.toLocaleString()} acres<SourceCitation sourceKey="villageoffaq" /></Fact>
          <Fact label="Buildings">Up to {project.maxBuildings} approved<SourceCitation sourceKey="govtech2025" /></Fact>
          <Fact label="IT capacity">{project.totalCapacityMW.toLocaleString()} MW at full buildout<SourceCitation sourceKey="dcdGW2026" /></Fact>
          <Fact label="Phase 1">{project.firstBuildingOnline}<SourceCitation sourceKey="dcdGW2026" /></Fact>
        </div>
      </Section>

      <Section title="Will my water bill or water quality be affected?">
        {waterQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
          </p>
        ))}
        {waterQ?.disputed.length > 0 && (
          <div className="bg-amber-50 border-l-2 border-amber-300 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest font-semibold mb-2">Disputed</p>
            {waterQ.disputed.map((item, i) => (
              <p key={i} className="text-gray-600">
                {item.text}
                {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
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
            {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
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
            {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
          </p>
        ))}
        {scaleQ?.unknown.length > 0 && (
          <div className="bg-gray-50 border-l-2 border-gray-200 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-semibold mb-2">Not yet determined</p>
            {scaleQ.unknown.map((item, i) => (
              <p key={i} className="text-gray-500">
                {item.text}
                {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
              </p>
            ))}
          </div>
        )}
      </Section>

      <Section title="What about jobs?">
        <p>
          The Village FAQ projects {jobs.permanent.toLocaleString()} permanent jobs at full buildout.
          <SourceCitation sourceKey="villageoffaq" />
          {' '}An earlier figure of {jobs.permanentEarlier.toLocaleString()} was cited at the October 2025 public meeting.
          <SourceCitation sourceKey="govtech2025" />
        </p>
        <p>
          Construction through 2027–2029 will employ {jobs.constructionPhase}, per Village documents.
          <SourceCitation sourceKey="villageoffaq" />
        </p>
      </Section>

      <Section title="What will the village and schools receive in taxes?">
        {taxQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
          </p>
        ))}
        {taxQ?.disputed.length > 0 && (
          <div className="bg-amber-50 border-l-2 border-amber-300 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest font-semibold mb-2">Context</p>
            {taxQ.disputed.map((item, i) => (
              <p key={i} className="text-gray-600">
                {item.text}
                {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
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
                {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
              </p>
            ))}
          </div>
        )}
      </Section>

      <Section title="Was the approval process proper?">
        {procQ?.stated.map((item, i) => (
          <p key={i}>
            {item.text}
            {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
          </p>
        ))}
        {procQ?.disputed.length > 0 && (
          <div className="bg-amber-50 border-l-2 border-amber-300 rounded-r pl-4 py-3 pr-3">
            <p className="text-2xs font-mono text-amber-700 uppercase tracking-widest font-semibold mb-2">Disputed</p>
            {procQ.disputed.map((item, i) => (
              <p key={i} className="text-gray-600">
                {item.text}
                {item.sourceKey && <SourceCitation sourceKey={item.sourceKey} />}
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
