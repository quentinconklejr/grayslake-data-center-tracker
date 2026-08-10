import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import PageNext from '../components/ui/PageNext'
import { pageMeta } from '../data/pageMeta'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import FadeIn from '../components/ui/FadeIn'
import Reveal from '../components/ui/Reveal'
import RevealHeadline from '../components/ui/RevealHeadline'
import CopyKPIButton from '../components/ui/CopyKPIButton'
import SectionBar from '../components/ui/SectionBar'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import { PARCELS_DATA } from '../data/parcels'
import SourceCitation from '../components/ui/SourceCitation'
import EnterpriseLeadBanner from '../components/ui/EnterpriseLeadBanner'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { projections } from '../data/projections'
import { figureById, figureCopyText } from '../data/keyFigures'
import { sources } from '../data/sources'
import { LAST_VERIFIED } from '../data/siteConfig'

const { project, jobs } = projections

export default function Home() {
  return (
    <FootnoteProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <PageTitle 
          title={pageMeta['/'].title} 
          description={pageMeta['/'].description} 
          ogImage={pageMeta['/'].ogImage} 
        />

        {/* Hero Banner */}
        <div className="space-y-4">
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-sky-800">
            Independent Civic Data Repository
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight max-w-3xl leading-tight">
            T5 @ Chicago IV is an approved $8.5–18B hyperscale AI data center in Grayslake, Illinois.
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl leading-relaxed">
            Collecting public records, municipal hearing transcripts, land deeds, and environmental filings for the proposed campus.
          </p>
          <div className="text-xs font-mono text-slate-500">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Primary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Permanent Jobs (Estimated Max)
            </div>
            <div className="text-3xl font-display font-bold text-slate-900">
              up to 1,680
            </div>
            <p className="text-xs font-sans text-slate-600 leading-relaxed">
              Village FAQ estimate, conditional on all 10 million sq ft being built. Excludes construction labor. Mayor Elizabeth Davies cited 1,500; T5 CEO cited over 1,600.
            </p>
            <Link to="/project#jobs" className="inline-flex items-center text-xs font-mono font-semibold text-sky-800 hover:text-sky-900 pt-1">
              Full range on The Project →
            </Link>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Estimated Investment
            </div>
            <div className="text-3xl font-display font-bold text-slate-900">
              $8.5–18B
            </div>
            <p className="text-xs font-sans text-slate-600 leading-relaxed">
              Grayslake’s mayor put total investment at $8.5B; T5’s chief executive cited up to $18B. No independent valuation has been published.
            </p>
            <Link to="/project#tax" className="inline-flex items-center text-xs font-mono font-semibold text-sky-800 hover:text-sky-900 pt-1">
              Fiscal details on The Project →
            </Link>
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4">
          <div>
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Land Ownership & Location
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
              Land Recorded to T5 (287.8 Acres)
            </h2>
            <p className="text-xs font-sans text-slate-600 mt-1">
              287.8 acres across 57 recorded parcels in Lake County GIS records. The approved campus covers up to 472 acres.
            </p>
          </div>

          <SiteMap />
          <ParcelTable parcels={PARCELS_DATA} />
        </div>

        {/* Newsletter Alert Subscription Banner */}
        <EnterpriseLeadBanner />

        {/* Footnote Sources List */}
        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
