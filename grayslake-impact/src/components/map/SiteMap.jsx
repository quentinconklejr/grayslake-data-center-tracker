import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import SourceCitation from '../ui/SourceCitation'
import parcels from '../../data/parcels.geojson'
import outline from '../../data/parcelsOutline.geojson'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Bounds and centre are derived from the parcel data itself rather than typed
// in by hand. The previous hard-coded centre sat 4.36 km from the actual site.
const BBOX = parcels.features
  .flatMap(f => f.geometry.coordinates[0])
  .reduce(
    (b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)],
    [180, 90, -180, -90],
  )
const CENTER = [(BBOX[0] + BBOX[2]) / 2, (BBOX[1] + BBOX[3]) / 2]

const META = parcels.metadata
const PARCEL_ZOOM = 14 // individual lot lines appear at or above this zoom

const usd = n =>
  n == null ? null : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
const prettyDate = d =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null

const SORTED = [...parcels.features].sort((a, b) => b.properties.acres - a.properties.acres)

const HIDE_LAYERS = [
  'poi-label', 'transit-label', 'airport-label',
  'settlement-subdivision-label', 'state-label',
  'road-label-simple', 'road-intersection',
]
const MUTE_LABELS = [
  { id: 'settlement-major-label', color: '#4b5563', halo: '#ffffff' },
  { id: 'settlement-minor-label', color: '#6b7280', halo: '#ffffff' },
  { id: 'road-label',             color: '#6b7280', halo: '#ffffff' },
]

export default function SiteMap({ className = 'h-[480px]' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!selected) return
    const onKey = e => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return
    let cancelled = false

    import('mapbox-gl').then(({ default: mgl }) => {
      if (cancelled || !containerRef.current) return
      mgl.accessToken = TOKEN

      const map = new mgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: CENTER,
        zoom: 12.5,
        attributionControl: false,
        antialias: true,
        cooperativeGestures: true,
      })
      mapRef.current = map

      map.addControl(new mgl.AttributionControl({ compact: true }), 'bottom-left')
      map.addControl(new mgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-left')
      map.addControl(new mgl.NavigationControl({ showCompass: false }), 'bottom-right')
      map.addControl(new mgl.FullscreenControl(), 'top-right')

      map.on('style.load', () => {
        if (cancelled) return
        setMapLoaded(true)

        for (const id of HIDE_LAYERS) {
          try { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none') } catch { /* layer absent in style */ }
        }
        for (const { id, color, halo } of MUTE_LABELS) {
          try {
            if (map.getLayer(id)) {
              map.setPaintProperty(id, 'text-color', color)
              map.setPaintProperty(id, 'text-halo-color', halo)
              map.setPaintProperty(id, 'text-halo-width', 1.5)
            }
          } catch { /* layer absent in style */ }
        }

        map.addSource('t5-outline', { type: 'geojson', data: outline })
        map.addSource('t5-parcels', { type: 'geojson', data: parcels })

        // Ownership fill — the whole holding, always visible
        map.addLayer({
          id: 't5-fill', type: 'fill', source: 't5-outline',
          paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.22 },
        })
        map.addLayer({
          id: 't5-edge', type: 'line', source: 't5-outline',
          paint: { 'line-color': '#93c5fd', 'line-width': 2.5 },
        })

        // Individual lot lines, revealed on zoom
        map.addLayer({
          id: 't5-parcel-lines', type: 'line', source: 't5-parcels',
          minzoom: PARCEL_ZOOM,
          paint: { 'line-color': '#bfdbfe', 'line-width': 0.8, 'line-opacity': 0.85 },
        })
        map.addLayer({
          id: 't5-parcel-hit', type: 'fill', source: 't5-parcels',
          paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.01 },
        })

        map.on('click', 't5-parcel-hit', e => {
          if (e.features?.[0]) setSelected(e.features[0].properties)
        })
        map.on('mouseenter', 't5-parcel-hit', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 't5-parcel-hit', () => { map.getCanvas().style.cursor = '' })

        map.fitBounds(BBOX, { padding: 56, duration: 900 })
      })
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const provenance = (
    <p className="text-xs text-gray-600 leading-relaxed">
      Parcel geometry from the{' '}
      <a
        href={META.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 hover:text-blue-800 underline underline-offset-2"
      >
        Lake County GIS tax parcel layer
      </a>
      , retrieved {META.retrieved}. {META.parcelCount} parcels recorded to T5, {META.countyAcresSum} acres
      by the county&rsquo;s own acreage field.{' '}
      <strong className="font-semibold text-gray-800">
        This shows land T5 owns, not the approved campus boundary
      </strong>{' '}
      . The Village approved development on up to 472 acres, a larger area that is not published
      as a mappable boundary.
    </p>
  )

  if (!TOKEN) {
    return (
      <div className={`${className} bg-gray-50 border border-edge rounded-xl flex items-center justify-center`}>
        <div className="text-center px-6 max-w-sm">
          <p className="text-sm font-display font-semibold text-gray-800 mb-2">Map requires a Mapbox token</p>
          <code className="text-2xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded block mb-4">
            VITE_MAPBOX_TOKEN=pk.ey… in .env
          </code>
          <div className="text-2xs font-mono text-gray-600 space-y-1">
            <p>Cornerstone business park, Grayslake, IL</p>
            <p>{CENTER[1].toFixed(4)}°N, {Math.abs(CENTER[0]).toFixed(4)}°W</p>
            <p>{META.parcelCount} parcels · {META.countyAcresSum} ac in T5 ownership</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={`relative ${className} max-h-[60vh] sm:max-h-none rounded-xl overflow-hidden border border-edge shadow-sm`}>
        <div
          ref={containerRef}
          className="w-full h-full"
          role="img"
          aria-label={
            `Satellite map showing ${META.parcelCount} parcels recorded to T5 in Grayslake, ` +
            `totalling ${META.countyAcresSum} acres across ${outline.features.length} separate groups. ` +
            `The same data is available as a table under "Parcel list" below.`
          }
        />

        {/* Keyboard users reaching the map get a way past it and a pointer to
            the equivalent data, since the canvas itself carries none. */}
        <a
          href="#parcel-list"
          className="sr-only focus:not-sr-only focus:absolute focus:z-40 focus:top-3 focus:left-3 focus:px-3 focus:py-2 focus:bg-white focus:text-blue-700 focus:rounded-lg focus:border focus:border-blue-300 focus:shadow-lg text-sm font-medium"
        >
          Skip map, go to parcel list
        </a>

        {!mapLoaded && (
          <div className="absolute inset-0 z-30 bg-gray-50 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin motion-reduce:animate-none" />
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">Loading map</p>
          </div>
        )}

        {selected && (
          <div
            role="region"
            aria-label={`Details for parcel ${selected.pin}`}
            className="absolute inset-y-0 right-0 w-64 bg-white/97 backdrop-blur-xl border-l border-edge-soft flex flex-col z-20 shadow-lg"
          >
            <div className="flex items-start justify-between p-4 border-b border-edge-soft/50 shrink-0">
              <div className="min-w-0">
                <p className="text-xs font-mono text-blue-700 uppercase tracking-widest mb-0.5">Parcel</p>
                <h3 className="text-sm font-display font-bold text-gray-900 leading-snug">PIN {selected.pin}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 ml-2 mt-0.5 p-1 -m-1 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close parcel details"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <dl className="space-y-0">
                {[
                  ['Acreage', `${selected.acres} ac`],
                  ['Owner of record', selected.owner],
                  ['Recorded sale', usd(selected.saleAmount) ?? 'No sale recorded'],
                  ['Sale date', prettyDate(selected.saleDate) ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} className="py-2.5 border-b border-edge-soft/50 last:border-0">
                    <dt className="text-xs font-mono text-gray-600 uppercase tracking-widest leading-none mb-0.5">{k}</dt>
                    <dd className="text-xs text-gray-900 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-2xs text-gray-600 mt-3 leading-relaxed">
                Sale figures are the consideration recorded against the deed and may cover several parcels.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-edge">
          <span className="w-4 h-2.5 rounded-sm bg-blue-600/25 border border-blue-300 shrink-0" aria-hidden="true" />
          <span className="text-xs text-gray-700">Land recorded to T5 ({META.countyAcresSum} ac)</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-edge">
          <span className="w-4 h-px bg-blue-200 shrink-0" aria-hidden="true" />
          <span className="text-xs text-gray-700">Individual lot lines (zoom in)</span>
        </div>
      </div>

      {/* Not a legend entry: there is no 472-acre shape on the map to key. It sat
          in the legend row and read as a layer the reader could not find. */}
      <p className="mt-3 flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2.5">
        <svg className="w-4 h-4 shrink-0 mt-px" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3.5M8 10.5v.5" strokeLinecap="round" />
        </svg>
        <span>
          The approved 472-acre boundary is <strong className="font-semibold">not drawn here</strong>. The Village has
          not published it as a mappable shape, so nothing on this map represents it.
        </span>
      </p>

      <div className="mt-3 flex items-start gap-2">
        {provenance}
      </div>

      {/* Text equivalent — the same data the map carries, for anyone not using it visually */}
      <details id="parcel-list" className="mt-4 border border-edge rounded-xl bg-white scroll-mt-24">
        <summary className="px-4 py-3 text-sm font-medium text-gray-800 cursor-pointer select-none">
          Parcel list ({META.parcelCount} parcels, {META.countyAcresSum} acres)
        </summary>
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">
              Parcels recorded to T5 in Grayslake, from the Lake County GIS tax parcel layer, retrieved {META.retrieved}
            </caption>
            <thead>
              <tr className="border-b border-edge-soft">
                <th scope="col" className="py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-gray-600">PIN</th>
                <th scope="col" className="py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-gray-600">Acres</th>
                <th scope="col" className="py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-gray-600">Recorded sale</th>
                <th scope="col" className="py-2 text-2xs font-mono uppercase tracking-widest text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {SORTED.map(f => (
                <tr key={f.properties.pin} className="border-b border-edge-soft/50 last:border-0">
                  <th scope="row" className="py-1.5 pr-4 text-xs font-mono font-normal text-gray-700">{f.properties.pin}</th>
                  <td className="py-1.5 pr-4 text-xs text-gray-700 tabular-nums">{f.properties.acres}</td>
                  <td className="py-1.5 pr-4 text-xs text-gray-700 tabular-nums">{usd(f.properties.saleAmount) ?? '—'}</td>
                  <td className="py-1.5 text-xs text-gray-700">{prettyDate(f.properties.saleDate) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="mt-3">
        <SourceCitation sourceKey="lakecountygis" />
      </div>
    </div>
  )
}
