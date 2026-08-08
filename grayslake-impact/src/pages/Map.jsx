import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

// 57 recorded parcels from Lake County GIS records
const PARCEL_DATA = [
  { pin: '1010200018', acres: '49.21', salePrice: '$29,356,282', date: 'May 2024' },
  { pin: '1011100009', acres: '48.39', salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1003400037', acres: '43.81', salePrice: '—', date: '—' },
  { pin: '1011200017', acres: '33.05', salePrice: '$3,250,000', date: 'May 2025' },
  { pin: '1003400036', acres: '20.19', salePrice: '—', date: '—' },
  { pin: '1010200014', acres: '20.18', salePrice: '$29,356,282', date: 'May 2024' },
  { pin: '1011100007', acres: '16.35', salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1002300010', acres: '10.37', salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1002300019', acres: '8.42',  salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1011100005', acres: '5.82',  salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1011101001', acres: '1.04',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101028', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101029', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101030', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101031', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101032', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101033', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101046', acres: '0.72',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101017', acres: '0.71',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101018', acres: '0.71',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101019', acres: '0.71',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101020', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101021', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101022', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101023', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101024', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101025', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101016', acres: '0.71',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101026', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101027', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101034', acres: '0.71',  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101003', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101004', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101005', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101006', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101007', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101008', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101009', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101010', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101011', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101012', acres: '0.70',  salePrice: '$5,592,606',  date: 'Apr 202Here is the updated `src/pages/Map.jsx` file. To keep the file clean and avoid long repetitive arrays, it imports parcel data from your existing GeoJSON file and renders the interactive `<ParcelTable />`:

### Updated `src/pages/Map.jsx`

```jsx
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'
import parcelsGeoJSON from '../data/parcels.geojson'

// Extract parcel attributes directly from GeoJSON
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
