import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import parcels from '../data/parcels.geojson'
import outline from '../data/parcelsOutline.geojson'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'
import SourceCitation from '../components/ui/SourceCitation'
import { projections } from '../data/projections'

const { acreageFigures, acreageNote } = projections

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

      <FadeIn className="mt-10 pt-8 border-t border-gray-200">
        <p className="text-2xs font-mono text-gray-600 uppercase tracking-widest mb-2">Three Acreage Figures</p>
        <p className="text-sm text-gray-600 mb-5 max-w-prose">{acreageNote}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {acreageFigures.map(f => (
            <div key={f.key} className="border border-gray-200 rounded-lg bg-white px-4 py-3.5">
              <p className="text-lg font-display font-bold text-gray-900 leading-tight">{f.value}</p>
              <p className="text-2xs font-mono uppercase tracking-widest text-gray-600 mt-0.5 mb-2">{f.metric}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{f.definition}</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {f.attribution}
                <SourceCitation sourceKey={f.sourceKey} />
              </p>
            </div>
          ))}
        </div>
      </FadeIn>
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
