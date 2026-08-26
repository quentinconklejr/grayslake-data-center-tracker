import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import ParcelTable from '../components/map/ParcelTable'
import { PARCELS_DATA } from '../data/parcels'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

export default function MapPage() {
  return (
    <FootnoteProvider>
      <Container size="wide" className="py-12 sm:py-16 space-y-12">
        <PageTitle
          title={pageMeta['/map'].title}
          description={pageMeta['/map'].description}
          ogImage={pageMeta['/map'].ogImage}
        />

        <header className="max-w-3xl">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
            GIS Parcel Layer
          </p>
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
            Land Ownership Map &amp; Parcel Directory
          </h1>
          <p className="text-base font-sans text-ink-700 leading-relaxed">
            Interactive satellite map and searchable tax directory displaying the 57 recorded Lake County tax parcels associated with T5 Data Centers in Grayslake, Illinois.
          </p>
          <p className="text-2xs font-mono text-ink-500 mt-3">
            Last verified {LAST_VERIFIED}
          </p>
        </header>

        <SiteMap />
        <ParcelTable parcels={PARCELS_DATA} />

        <FootnoteList />
      </Container>
    </FootnoteProvider>
  )
}
