import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { projections } from '../../data/projections'
import SourceCitation from '../ui/SourceCitation'

const CENTER = [-88.001, 42.337]
const ZOOM   = 12.8
const TOKEN  = import.meta.env.VITE_MAPBOX_TOKEN

const MAIN_RING = [
  [-88.002, 42.339], [-87.992, 42.339],
  [-87.992, 42.332], [-88.002, 42.332],
  [-88.002, 42.339],
]
const OPT_RING = [
  [-87.999, 42.332], [-87.994, 42.332],
  [-87.994, 42.328], [-87.999, 42.328],
  [-87.999, 42.332],
]
const MARKER_LNG = -87.997
const MARKER_LAT =  42.3355

function geojson(ring) {
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }],
  }
}

const { project, jobs } = projections
const PANEL_ROWS = [
  ['Developer',      project.developer],
  ['Location',       'Peterson Rd & Route 83'],
  ['Status',         'Under Construction'],
  ['Main parcel',    `~${project.totalAcres} ac (approx.)`],
  ['Option parcel',  `~${project.optionAcres} ac (approx.)`],
  ['Max buildings',  project.maxBuildings],
  ['IT capacity',    `${project.totalCapacityMW.toLocaleString()} MW`],
  ['Secured power',  `${project.securedPowerMW.toLocaleString()} MW`],
  ['Investment',     `$${project.costLow}–${project.costHigh}B est.`],
  ['Perm. jobs',     project.permanent ?? jobs.permanent],
  ['Phase 1',        project.firstBuildingOnline],
  ['Full buildout',  project.fullBuildOut],
]

const HIDE_LAYERS = [
  'poi-label', 'transit-label', 'airport-label',
  'settlement-subdivision-label', 'state-label',
  'road-label-simple', 'road-intersection',
]

const MUTE_LABELS = [
  { id: 'settlement-major-label', color: '#6b7280', halo: '#ffffff' },
  { id: 'settlement-minor-label', color: '#9ca3af', halo: '#ffffff' },
  { id: 'road-label',             color: '#9ca3af', halo: '#ffffff' },
]

export default function SiteMap({ className = 'h-[480px]' }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const animRef      = useRef(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return
    let cancelled = false

    import('mapbox-gl').then(({ default: mgl }) => {
      if (cancelled || !containerRef.current) return

      mgl.accessToken = TOKEN
      const map = new mgl.Map({
        container:          containerRef.current,
        style:              'mapbox://styles/mapbox/outdoors-v12',
        center:             CENTER,
        zoom:               ZOOM,
        attributionControl: false,
        antialias:          true,
      })
      mapRef.current = map

      map.addControl(new mgl.AttributionControl({ compact: true }), 'bottom-left')
      map.addControl(new mgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-left')
      map.addControl(new mgl.NavigationControl({ showCompass: false }), 'bottom-right')

      map.on('style.load', () => {
        if (cancelled) return
        setMapLoaded(true)

        for (const id of HIDE_LAYERS) {
          try { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none') } catch (_) {}
        }
        for (const { id, color, halo } of MUTE_LABELS) {
          try {
            if (map.getLayer(id)) {
              map.setPaintProperty(id, 'text-color', color)
              map.setPaintProperty(id, 'text-halo-color', halo)
              map.setPaintProperty(id, 'text-halo-width', 1.5)
            }
          } catch (_) {}
        }

        map.addSource('main-parcel', { type: 'geojson', data: geojson(MAIN_RING) })
        map.addSource('opt-parcel',  { type: 'geojson', data: geojson(OPT_RING)  })

        map.addLayer({ id: 'main-fill', type: 'fill', source: 'main-parcel',
          paint: { 'fill-color': '#0284c7', 'fill-opacity': 0.12 } })
        map.addLayer({ id: 'opt-fill', type: 'fill', source: 'opt-parcel',
          paint: { 'fill-color': '#d97706', 'fill-opacity': 0.08 } })

        map.addLayer({ id: 'main-outline', type: 'line', source: 'main-parcel',
          paint: { 'line-color': '#0284c7', 'line-width': 2, 'line-opacity': 0.9 } })
        map.addLayer({ id: 'opt-outline', type: 'line', source: 'opt-parcel',
          paint: { 'line-color': '#d97706', 'line-width': 1.5, 'line-opacity': 0.7,
                   'line-dasharray': [3, 2] } })

        map.addSource('site-label-pt', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{ type: 'Feature',
              properties: { label: 'T5 @ Chicago IV' },
              geometry: { type: 'Point', coordinates: [MARKER_LNG, MARKER_LAT] },
            }],
          },
        })
        map.addLayer({
          id: 'site-label', type: 'symbol', source: 'site-label-pt',
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 12,
            'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
            'text-anchor': 'top',
            'text-offset': [0, 1.2],
            'text-letter-spacing': 0.08,
          },
          paint: {
            'text-color': '#ea6b00',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2.5,
          },
        })

        let t = 0
        function animateGlow() {
          if (cancelled) return
          t = Date.now() / 1000
          const glow = 0.08 + 0.06 * Math.sin(t * 0.7)
          try { map.setPaintProperty('main-fill', 'fill-opacity', glow) } catch (_) {}
          animRef.current = requestAnimationFrame(animateGlow)
        }
        animateGlow()

        const open = () => setPanelOpen(true)
        map.on('click', 'main-fill', open)
        map.on('click', 'opt-fill',  open)
        map.on('mouseenter', 'main-fill', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'main-fill', () => { map.getCanvas().style.cursor = '' })
        map.on('mouseenter', 'opt-fill',  () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'opt-fill',  () => { map.getCanvas().style.cursor = '' })

        map.flyTo({ center: CENTER, zoom: ZOOM, speed: 0.6, curve: 1.2 })
      })

      const el = document.createElement('div')
      Object.assign(el.style, {
        width: '14px', height: '14px', borderRadius: '50%',
        background: '#f97316', border: '2.5px solid rgba(255,255,255,0.98)',
        cursor: 'pointer',
        boxShadow: '0 0 0 5px rgba(249,115,22,0.22), 0 0 0 10px rgba(249,115,22,0.09)',
      })
      el.title = 'T5 @ Chicago IV'
      el.addEventListener('click', (e) => { e.stopPropagation(); setPanelOpen(true) })

      new mgl.Marker({ element: el })
        .setLngLat([MARKER_LNG, MARKER_LAT])
        .addTo(map)
    })

    return () => {
      cancelled = true
      if (animRef.current) cancelAnimationFrame(animRef.current)
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  if (!TOKEN) {
    return (
      <div className={`${className} bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center`}>
        <div className="text-center px-6 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-display font-semibold text-gray-800 mb-2">Map requires a Mapbox token</p>
          <code className="text-2xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded block mb-4">
            VITE_MAPBOX_TOKEN=pk.ey… in .env
          </code>
          <div className="text-2xs font-mono text-gray-400 space-y-1">
            <p>Peterson Rd &amp; Route 83 · Grayslake, IL 60030</p>
            <p>42.337°N, 88.001°W · Lake County</p>
            <p>~160 ac main · ~45 ac option parcel</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className} rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>

      <div ref={containerRef} className="w-full h-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 z-30 bg-gray-50 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest">Loading map</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-white/92 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-4 h-0.5 bg-blue-500 rounded-full shrink-0" />
          <span className="text-2xs font-mono text-gray-500">Main parcel (~160 ac)</span>
        </div>
        <div className="flex items-center gap-2 bg-white/92 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <svg width="16" height="4" className="shrink-0">
            <line x1="0" y1="2" x2="16" y2="2" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
          <span className="text-2xs font-mono text-gray-500">Option parcel (~45 ac)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50/90 backdrop-blur-md px-3 py-2 rounded-lg border border-amber-200 shadow-sm">
          <svg className="w-3 h-3 text-amber-500 shrink-0" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1L11 10H1L6 1z" />
            <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
          </svg>
          <span className="text-2xs font-mono text-amber-600/80">Approx. boundary — not surveyed</span>
        </div>
      </div>

      {/* North indicator */}
      <div className="absolute bottom-20 right-4 pointer-events-none z-10 flex flex-col items-center gap-0.5">
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <polygon points="9,1 4,14 9,11 14,14" fill="#9ca3af" />
          <polygon points="9,21 4,14 9,11 14,14" fill="#d1d5db" />
        </svg>
        <span className="text-2xs font-mono text-gray-400 leading-none">N</span>
      </div>

      {/* Click hint */}
      {!panelOpen && (
        <div className="absolute bottom-10 right-14 pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-xs text-gray-500">
            Click site to view details
          </div>
        </div>
      )}

      {/* Side panel */}
      {panelOpen && (
        <div className="absolute inset-y-0 right-0 w-64 bg-white/96 backdrop-blur-xl border-l border-gray-200 flex flex-col z-20 shadow-lg">

          <div className="flex items-start justify-between p-4 border-b border-gray-100 shrink-0">
            <div className="min-w-0">
              <p className="text-2xs font-mono text-blue-500 uppercase tracking-widest mb-0.5">T5 Data Centers</p>
              <h3 className="text-sm font-display font-bold text-gray-900 leading-snug">T5 @ Chicago IV</h3>
              <p className="text-2xs font-mono text-gray-400 mt-0.5">Grayslake · Lake County, IL</p>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="shrink-0 ml-2 mt-0.5 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-2.5 border-b border-gray-100 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-2xs font-mono font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Under Construction
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <dl className="space-y-0">
              {PANEL_ROWS.map(([k, v]) => (
                <div key={k} className="py-2.5 border-b border-gray-100 last:border-0">
                  <dt className="text-2xs font-mono text-gray-400 uppercase tracking-widest leading-none mb-0.5">{k}</dt>
                  <dd className="text-xs text-gray-800 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="p-4 border-t border-gray-100 shrink-0 space-y-2">
            <p className="text-xs text-amber-600/70 leading-relaxed">
              Boundaries approximate — not from survey, parcel, or GIS data.
            </p>
            <SourceCitation sourceKey="baxtel2026" />
          </div>
        </div>
      )}
    </div>
  )
}
