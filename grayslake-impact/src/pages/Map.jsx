import PageTitle from '../components/ui/PageTitle'
import SiteMap from '../components/map/SiteMap'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

export default function MapPage() {
  return (
    <FootnoteProvider>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Site Map" />

      <FadeIn className="mb-8 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">T5 @ Chicago IV · Peterson Rd &amp; Route 83</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-4">Campus Site Map</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          The Village of Grayslake FAQ records the campus site as 472 acres and 10,100,000 sq ft
          of total buildable area. The blue boundary marks the main campus footprint; the amber
          dashed line marks the option parcel to the south. Boundaries are approximate — not
          derived from survey or GIS data.
          <span className="block mt-2 text-sm text-gray-400">Click either boundary or the orange marker to view project statistics.</span>
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      <SiteMap className="h-[calc(100vh-280px)] min-h-[520px]" />
      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
