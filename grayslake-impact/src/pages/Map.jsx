import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'
import parcelsGeoJSON from '../data/parcels.geojson'

// Extract parcel attributes directly from GeoJSON without long arrays
const PARCEL_DATA = (parcelsGeoJSON?.features || []).map(f => ({
  pin: f.properties?.pin || f.properties?.PIN || '—',
  acres: f.properties?.acres || f.properties?.ACRES || '—',
  salePrice: f.properties?.salePrice || f.properties?.PRICE || '—',
  date: f.properties?.date || f.properties?.DATE || '—',
}))

export default function MapPage() {
  return (
    <FootnoteProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <PageTitle {...pageMeta['/map']} />

        <FadeIn className="mb-8 pb-6 border-b border-edge-soft">
          <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-2">GIS Parcel Layer</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Land Ownership Map</h1>
          <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
            Interactive map displaying the 57 recorded Lake County tax parcels associated with T5 Data Centers in Grayslake, Illinois.
          </p>
          <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* Interactive Map Component */}
        <FadeIn className="mb-10">
          <SiteMap className="h-[520px] rounded-xl border border-slate-200 shadow-sm" />
        </FadeIn>

        {/* Interactive Parcel Directory Table */}
        <FadeIn>
          <ParcelTable parcels={PARCEL_DATA} sourceKey="gisParcels2026" />
        </FadeIn>

        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
