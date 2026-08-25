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
    citation: 'Village of Grayslake estimates total investment at $8.5 billion; T5 Data Centers chief executive Pete Marin cited up to $18 billion. (Village of Grayslake FAQ, June 2026; Government Technology, Oct. 2025).',
    src: 'govtech2025',
  },
  {
    topic: 'Permanent Operational Jobs',
    stat: 'Up to 1,680 jobs',
    citation: 'Village FAQ estimates up to 1,680 permanent operational jobs assuming full 10M sq ft buildout (1 job per 6,000 sq ft). Grayslake Mayor Elizabeth Davies cited 1,500 jobs; T5 CEO cited over 1,600. Excludes construction labor. (Village FAQ, June 2026).',
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
    citation: 'Lake County GIS records confirm 287.82 acres recorded across 57 parcels to T5 Data Centers. Village approvals permit development on up to 472 acres in Cornerstone Business Park. (Lake County GIS, Aug. 2026).',
    src: 'lakecountygis',
  },
  {
    topic: 'Pending Legal Action',
    stat: 'Circuit Court Lawsuit Filed',
    citation: 'On July 31, 2026, the Preservation of Community Well-being Collective LLC and nine residents filed a lawsuit in Lake County Circuit Court challenging Village approvals under local zoning and sustainability ordinances. (Lake & McHenry County Scanner, Aug. 2026).',
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

  return (
    <button
      onClick={handleCopy}
      className={`text-sm font-sans font-semibold underline underline-offset-4 decoration-rule hover:decoration-accent shrink-0 min-h-[44px] transition-colors ${
        copied ? 'text-status-stated' : 'text-accent hover:text-accent-hover'
      }`}
    >
      {copied ? '✓ Copied AP Citation' : 'Copy AP Citation'}
    </button>
  )
}

export default function Reporters() {
  return (
    <FootnoteProvider>
      <Container size="default" className="py-10 sm:py-14 space-y-10">
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

        {/* Fact briefing list */}
        <div className="divide-y divide-rule-soft border-y border-rule">
          {PRESS_FACTS.map(({ topic, stat, citation }) => (
            <div key={topic} className="py-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-sans font-semibold text-ink-600">
                    {topic}
                  </p>
                  <p className="text-2xl font-display text-ink-900 tracking-tight mt-1">
                    {stat}
                  </p>
                </div>
                <CopyCitationButton text={`${topic}: ${stat} — ${citation}`} />
              </div>

              <p className="text-sm font-sans text-ink-700 leading-relaxed mt-4">
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
