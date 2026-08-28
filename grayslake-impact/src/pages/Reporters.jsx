import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

const PRESS_FACTS = [
  {
    topic: 'Total Estimated Investment',
    stat: figureById['investment']?.value || '$8.5B / $18B',
    citation: 'Grayslake Mayor Elizabeth Davies cited total investment of $8.5 billion; T5 Data Centers chief executive Pete Marin cited up to $18 billion. Two figures from two people, not a published range. (Government Technology, Oct. 2025).',
    src: 'govtech2025',
  },
  {
    topic: 'Permanent Operational Jobs',
    stat: 'Up to 1,680 jobs',
    citation: 'The Village FAQ estimates up to 1,680 permanent operational jobs assuming the full 10 million sq ft is built (50 jobs per 300,000 sq ft), and hedges that the estimate may change. Grayslake Mayor Elizabeth Davies cited 1,500 jobs (Oct. 2025); T5 chief executive Pete Marin cited over 1,600 (Jul. 2026). Excludes construction labor. (Approved T5 Data Center Campus FAQs, updated June 5, 2026 - archived snapshot; the Village\'s live copy is no longer reachable).',
    src: 'villagefaq_archived',
  },
  {
    topic: 'Electrical Capacity',
    stat: '1,200 MW IT / 1,600 MW Power',
    citation: 'T5 reports 1,200 MW of leasable IT capacity and 1,600 MW of utility-contracted capacity. Total substation capacity from ComEd is rated at 1.55 GW. (Data Center Dynamics, Feb. 2025; Government Technology, Oct. 2025).',
    src: 'dcdGW2026',
  },
  {
    topic: 'Land Ownership & Site Area',
    stat: '287.8 Acres Recorded / 472 Approved',
    citation: 'Lake County GIS records confirm 287.82 acres recorded across 57 parcels to T5 Data Centers (Lake County GIS Tax Parcel layer, retrieved Aug. 5, 2026). Village approvals separately permit development on up to 472 acres in Cornerstone Business Park (Approved T5 Data Center Campus FAQs, updated June 5, 2026 - archived snapshot).',
    src: 'lakecountygis',
  },
  {
    topic: 'Pending Legal Action',
    stat: 'Circuit Court Lawsuit Filed',
    citation: 'On July 31, 2026, the Preservation of Community Well-being Collective LLC and nine individual residents filed a complaint in the Circuit Court of the 19th Judicial Circuit, Lake County, Chancery Division (No. 2026CH00000171). It pleads four counts: ultra vires municipal action, substantive due process and procedural due process under the Illinois Constitution, and violation of the Illinois Open Meetings Act. Allegations, not findings. (Complaint, filed July 31, 2026; Lake & McHenry County Scanner, Aug. 8, 2026).',
    src: 'scannerLawsuit2026',
  },
]

function CopyCitationButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Quiet utility button — small bordered chip, not a dashboard CTA.
  // The visible label changes on copy; the aria-live=polite region beside
  // it announces "Citation copied to clipboard" once the state flips so
  // screen readers get the confirmation the sighted user gets from the
  // visual flash.
  return (
    <span className="inline-flex items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold border transition-colors min-h-[44px] ${
          copied
            ? 'bg-status-stated-soft text-status-stated border-status-stated'
            : 'bg-transparent text-ink-700 border-rule-strong hover:border-ink-700 hover:text-ink-900'
        }`}
      >
        <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
        {copied ? 'Copied' : 'Copy AP citation'}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Citation copied to clipboard' : ''}
      </span>
    </span>
  )
}

export default function Reporters() {
  return (
    <FootnoteProvider>
      <Container size="wide" className="py-10 sm:py-14 space-y-10">
        <PageTitle
          title={pageMeta['/figures'].title}
          description={pageMeta['/figures'].description}
          ogImage={pageMeta['/figures'].ogImage}
        />

        <header className="border-b border-rule pb-8">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
            Media &amp; Research Briefing
          </p>
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
            Key Figures &amp; AP Citations
          </h1>
          <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
            Pre-formatted AP-style citations and primary figures for newsrooms, researchers, and financial analysts.
          </p>
          <p className="text-2xs font-mono text-ink-500 mt-3">
            Last verified {LAST_VERIFIED}
          </p>
        </header>

        {/* Fact briefing grid. Single column at mobile stays the reading
            rhythm; on lg+ the same records become a two-up card grid so
            newsrooms scanning for a quote don't have to scroll a single
            56rem column. Rule dividers become border boxes on the grid
            so each card reads as a discrete records unit. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {PRESS_FACTS.map(({ topic, stat, citation }) => (
            <div key={topic} className="flex flex-col border border-rule-strong p-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-sans font-semibold text-ink-600">
                    {topic}
                  </p>
                  <p className="text-2xl font-display text-ink-900 tracking-tight mt-1 leading-tight">
                    {stat}
                  </p>
                </div>
                <CopyCitationButton text={`${topic}: ${stat} — ${citation}`} />
              </div>

              <p className="text-sm font-sans text-ink-700 leading-relaxed mt-4 flex-1">
                {citation}
              </p>
            </div>
          ))}
        </div>

        <FootnoteList />
      </Container>
    </FootnoteProvider>
  )
}
