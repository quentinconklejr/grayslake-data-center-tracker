import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import { PARCELS_DATA } from '../data/parcels'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

export default function MapPage() {
  return (
    <FootnoteProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <PageTitle 
          title={pageMeta['/map'].title} 
          description={pageMeta['/map'].description} 
          ogImage={pageMeta['/map'].ogImage} 
        />

        <div>
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-sky-800 mb-1">
            GIS Parcel Layer
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
            Land Ownership Map & Parcel Directory
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            Interactive satellite map and searchable tax directory displaying the 57 recorded Lake County tax parcels associated with T5 Data Centers in Grayslake, Illinois.
          </p>
          <div className="text-xs font-mono text-slate-500 mt-2">
            Last verified {LAST_VERIFIED}
          </div>
        </div>

        {/* Interactive Satellite Map */}
        <SiteMap />

        {/* Searchable Parcel Directory */}
        <ParcelTable parcels={PARCELS_DATA} />

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
