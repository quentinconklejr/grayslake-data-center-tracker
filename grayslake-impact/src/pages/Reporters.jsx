import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'

const PRESS_FACTS = [
  {
    topic: 'Total Estimated Investment',
    stat: figureById['investment']?.value || '$8.5–18B',
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
      className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors shrink-0 min-h-[44px]"
    >
      {copied ? '✓ Copied AP Citation' : 'Copy AP Citation'}
    </button>
  )
}

export default function Reporters() {
  return (
    <FootnoteProvider>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <PageTitle 
          title={pageMeta['/figures'].title} 
          description={pageMeta['/figures'].description} 
          ogImage={pageMeta['/figures'].ogImage} 
        />

        <div className="border-b border-slate-200 pb-6">
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-sky-800 mb-1">
            Media & Research Briefing
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
            Key Figures & AP Citations
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            Pre-formatted AP-style citations and primary figures for newsrooms, researchers, and financial analysts.
          </p>
          <div className="text-xs font-mono text-slate-500 mt-2">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Fact Briefing Cards Grid */}
        <div className="space-y-4">
          {PRESS_FACTS.map(({ topic, stat, citation }) => (
            <div key={topic} className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    {topic}
                  </div>
                  <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-0.5">
                    {stat}
                  </div>
                </div>
                <CopyCitationButton text={`${topic}: ${stat} — ${citation}`} />
              </div>

              <p className="text-xs font-sans text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {citation}
              </p>
            </div>
          ))}
        </div>

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
