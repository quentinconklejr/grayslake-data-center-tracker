import PageTitle from '../components/ui/PageTitle'
import SiteMap from '../components/map/SiteMap'
import FadeIn from '../components/ui/FadeIn'

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="Site Map" />

      <FadeIn className="mb-6 pb-6 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-blue-400/50 uppercase tracking-[0.2em] mb-3">Site</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Site Map</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          Peterson Road &amp; Route 83, Grayslake, IL 60030. Approximate parcel boundaries
          drawn from public records — not derived from survey or GIS data. Click the site
          boundary to view project statistics.
        </p>
      </FadeIn>

      <SiteMap className="h-[calc(100vh-280px)] min-h-[520px]" />

    </div>
  )
}
