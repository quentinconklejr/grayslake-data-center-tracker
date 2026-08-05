import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import parcels from '../data/parcels.geojson'
import outline from '../data/parcelsOutline.geojson'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

export default function MapPage() {
  return (
    <FootnoteProvider>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/map']} />

      <FadeIn className="mb-8 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.2em] mb-3">T5 @ Chicago IV · Cornerstone business park, Grayslake</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-4">Land Ownership Map</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          This map shows the {parcels.metadata.parcelCount} parcels recorded to T5 in Grayslake &mdash;{' '}
          {parcels.metadata.countyAcresSum} acres across {outline.features.length} non-contiguous groups &mdash; drawn from
          Lake County&rsquo;s tax parcel layer. Zoom in for individual lot lines; select a parcel for its
          PIN, acreage and recorded sale.
        </p>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed mt-3">
          Ownership is not the same as approval. The Village approved development on{' '}
          <strong className="font-semibold text-gray-800">up to 472 acres</strong>, which is a larger area than
          T5 currently owns and is not published anywhere as a mappable boundary. Nothing on this page should be
          read as the approved campus perimeter.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <SiteMap className="h-[calc(100vh-280px)] min-h-[520px]" />
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
