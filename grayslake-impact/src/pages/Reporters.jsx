import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { figureById } from '../data/keyFigures'
import { LAST_VERIFIED } from '../data/siteConfig'

const PRESS_FACTS = [
  {
    topic: 'Total Estimated Investment',
    stat: figureById['investment'].value,
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
    src: 'gisParcels2026',
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
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded border border-sky-200 transition-colors shrink-0"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3.5 8.5l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied AP Citation!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-sky-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5.5 4.5h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6a1 1 0 011-1z" />
            <path d="M3.5 11.5h-1a1 1 0 01-1-1v-6a1 1 0 011-1h6a1 1 0 011 1v1" />
          </svg>
          Copy AP Citation
        </>
      )}
    </button>
  )
}

export default function Reporters() {
  return (
    <FootnoteProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <PageTitle {...pageMeta['/reporters']} />

        <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
          <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-2">Media & Press Kit</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Press & Research Briefing</h1>
          <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
            Verified figures, pre-formatted AP-style citations, primary document mirrors, and downloadable datasets for newsrooms, analysts, and researchers.
          </p>
          <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* Project Fast Facts for Newsrooms */}
        <FadeIn className="newsroom-card p-6 mb-10">
          <div className="border-b border-edge-soft pb-4 mb-6">
            <span className="text-xs font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              EXECUTIVE BRIEFING
            </span>
            <h2 className="text-2xl font-display font-bold text-slate-900 mt-2">Key Project Facts & AP Citations</h2>
            <p className="text-sm text-slate-600 mt-1">
              Click any citation button to copy the pre-verified statistic and its primary source credit.
            </p>
          </div>

          <div className="space-y-6">
            {PRESS_FACTS.map(({ topic, stat, citation, src }) => (
              <div key={topic} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/90">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider">{topic}</span>
                  <CopyCitationButton text={`${stat} — ${citation}`} />
                </div>
                <p className="text-xl font-display font-bold text-slate-900 mb-1.5">{stat}</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {citation}
                  <SourceCitation sourceKey={src} />
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Primary Data Exports */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FadeIn className="newsroom-card p-6">
            <span className="text-xs font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              OPEN DATASET
            </span>
            <h3 className="text-xl font-display font-bold text-slate-900 mt-2 mb-2">Lake County Tax Parcel Dataset</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Authoritative Lake County GIS tax parcel boundaries, acreages, deed recordings, and sale prices for all 57 parcels acquired by T5 Data Centers.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/map"
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg border border-slate-300 transition-colors"
              >
                Search & Filter Table →
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.08} className="newsroom-card p-6">
            <span className="text-xs font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              PRIMARY ARCHIVE
            </span>
            <h3 className="text-xl font-display font-bold text-slate-900 mt-2 mb-2">Primary Document Mirrors</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Independent mirrors of official Village of Grayslake FAQ PDFs, CLCJAWA water board presentations, and Lake County Circuit Court lawsuit filings.
            </p>
            <a
              href="/documents"
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg border border-slate-300 transition-colors"
            >
              Browse Document Index →
            </a>
          </FadeIn>
        </div>

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
