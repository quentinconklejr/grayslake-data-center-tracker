import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import EnterpriseLeadBanner from '../components/ui/EnterpriseLeadBanner'
import DataTransparencyFootnote from '../components/ui/DataTransparencyFootnote'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'
import parcelsGeoJSON from '../data/parcels.geojson'

const PARCEL_DATA = (parcelsGeoJSON?.features || []).map(f => ({
  pin: f.properties?.pin || f.properties?.PIN || '—',
  acres: f.properties?.acres || f.properties?.ACRES || '—',
  salePrice: f.properties?.salePrice || f.properties?.PRICE || '—',
  date: f.properties?.date || f.properties?.DATE || '—',
}))

export default function MapPage() {
  const [showTable, setShowTable] = useState(false)

  return (
    <FootnoteProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <PageTitle {...pageMeta['/map']} />

        <FadeIn className="mb-6 pb-6 border-b border-edge-soft">
          <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-2">GIS Parcel Layer</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Land Ownership Map</h1>
          <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
            Interactive map displaying the 57 recorded Lake County tax parcels associated with T5 Data Centers in Grayslake, Illinois.
          </p>
          <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* Enterprise Lead Capture */}
        <FadeIn>
          <EnterpriseLeadBanner />
        </FadeIn>

        {/* Map Component (Uses built-in map legend below map) */}
        <FadeIn className="mb-6">
          <SiteMap className="h-[520px] rounded-xl border border-slate-200 shadow-sm" />
        </FadeIn>

        {/* Collapsible Parcel Table */}
        <FadeIn className="my-8">
          <div className="newsroom-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">57 Recorded Parcel Directory</h3>
                <p className="text-xs font-mono text-slate-600">Lake County GIS Tax Parcel Attribute List</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTable(prev => !prev)}
                className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-2 rounded-lg border border-sky-200 transition-colors"
              >
                {showTable ? 'Hide Parcel Directory ▲' : 'View Full Parcel Directory (57 PINs) ▼'}
              </button>
            </div>

            {showTable && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <ParcelTable parcels={PARCEL_DATA} sourceKey="gisParcels2026" />
              </div>
            )}
          </div>
        </FadeIn>

        <DataTransparencyFootnote />
        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
