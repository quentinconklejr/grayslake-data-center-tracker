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

// Custom layer overrides to make the dark-v11 style feel bespoke
const LAYER_RECOLORS = [
  { id: 'background',                        type: 'background-color', val: '#07070d' },
  { id: 'land',                              type: 'background-color', val: '#090915' },
  { id: 'landuse',                           type: 'fill-color',       val: '#0b0b1a' },
  { id: 'national-park',                     type: 'fill-color',       val: '#0d0d1e' },
  { id: 'water',                             type: 'fill-color',       val: '#0a0a22' },
  { id: 'waterway',                          type: 'line-color',       val: '#0a0a22' },
  { id: 'waterway-shadow',                   type: 'line-color',       val: '#080810' },
  { id: 'road-street',                       type: 'line-color',       val: '#191928' },
  { id: 'road-street-low',                   type: 'line-color',       val: '#131320' },
  { id: 'road-secondary-tertiary',           type: 'line-color',       val: '#1c1c2e' },
  { id: 'road-primary',                      type: 'line-color',       val: '#22223a' },
  { id: 'road-motorway-trunk',               type: 'line-color',       val: '#28284a' },
  { id: 'bridge-street',                     type: 'line-color',       val: '#1c1c30' },
  { id: 'bridge-secondary-tertiary',         type: 'line-color',       val: '#1c1c30' },
  { id: 'bridge-primary',                    type: 'line-color',       val: '#22223a' },
  { id: 'bridge-motorway-trunk',             type: 'line-color',       val: '#28284a' },
  { id: 'building',                          type: 'fill-color',       val: '#0f0f20' },
  { id: 'building-outline',                  type: 'line-color',       val: '#0f0f20' },
]

const HIDE_LAYERS = [
  'poi-label', 'transit-label', 'airport-label',
  'settlement-subdivision-label', 'state-label',
  'road-label-simple', 'road-intersection',
]

// Layers kept visible but heavily muted for orientation
const MUTE_LABELS = [
  { id: 'settlement-major-label', color: '#4a4a72', halo: '#07070d' },
  { id: 'settlement-minor-label', color: '#363660', halo: '#07070d' },
  { id: 'road-label',             color: '#2e2e52', halo: '#07070d' },
]

export default function SiteMap({ className = 'h-[480px]' }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const animRef      = useRef(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return
    let cancelled = false

    import('mapbox-gl').then(({ default: mgl }) => {
      if (cancelled || !containerRef.current) return

      mgl.accessToken = TOKEN
      const map = new mgl.Map({
        container:         containerRef.current,
        style:             'mapbox://styles/mapbox/dark-v11',
        center:            CENTER,
        zoom:              ZOOM,
        attributionControl: false,
        antialias:         true,
      })
      mapRef.current = map

      map.addControl(new mgl.AttributionControl({ compact: true }), 'bottom-left')
      map.addControl(new mgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-left')
      map.addControl(new mgl.NavigationControl({ showCompass: false }), 'bottom-right')

      // Fly in on load for a subtle cinematic entrance
      map.on('style.load', () => {
        if (cancelled) return

        // ── Recolor base layers to match design system ──────────────────
        for (const { id, type, val } of LAYER_RECOLORS) {
          try { if (map.getLayer(id)) map.setPaintProperty(id, type, val) } catch (_) {}
        }
        for (const id of HIDE_LAYERS) {
          try { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none') } catch (_) {}
        }

        // Mute-but-keep orientation labels (settlement names + road names)
        for (const { id, color, halo } of MUTE_LABELS) {
          try {
            if (map.getLayer(id)) {
              map.setPaintProperty(id, 'text-color', color)
              map.setPaintProperty(id, 'text-halo-color', halo)
              map.setPaintProperty(id, 'text-halo-width', 1.5)
            }
          } catch (_) {}
        }

        // ── Site sources ─────────────────────────────────────────────────
        map.addSource('main-parcel', { type: 'geojson', data: geojson(MAIN_RING) })
        map.addSource('opt-parcel',  { type: 'geojson', data: geojson(OPT_RING)  })

        // Fill layers
        map.addLayer({ id: 'main-fill', type: 'fill', source: 'main-parcel',
          paint: { 'fill-color': '#0ea5e9', 'fill-opacity': 0.18 } })
        map.addLayer({ id: 'opt-fill', type: 'fill', source: 'opt-parcel',
          paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.1 } })

        // Outline layers
        map.addLayer({ id: 'main-outline', type: 'line', source: 'main-parcel',
          paint: { 'line-color': '#38bdf8', 'line-width': 2, 'line-opacity': 1.0, 'line-blur': 0 } })
        map.addLayer({ id: 'opt-outline', type: 'line', source: 'opt-parcel',
          paint: { 'line-color': '#fbbf24', 'line-width': 1.5, 'line-opacity': 0.7,
                   'line-dasharray': [3, 2] } })

        // Site label
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
            'text-color': '#7dd3fc',
            'text-halo-color': '#07070d',
            'text-halo-width': 2,
          },
        })

        // ── Animated glow on main parcel ─────────────────────────────────
        let t = 0
        function animateGlow() {
          if (cancelled) return
          t = Date.now() / 1000
          const glow = 0.12 + 0.08 * Math.sin(t * 0.7)
          try { map.setPaintProperty('main-fill', 'fill-opacity', glow) } catch (_) {}
          animRef.current = requestAnimationFrame(animateGlow)
        }
        animateGlow()

        // ── Click handlers ────────────────────────────────────────────────
        const open = () => setPanelOpen(true)
        map.on('click', 'main-fill', open)
        map.on('click', 'opt-fill',  open)
        map.on('mouseenter', 'main-fill', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'main-fill', () => { map.getCanvas().style.cursor = '' })
        map.on('mouseenter', 'opt-fill',  () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'opt-fill',  () => { map.getCanvas().style.cursor = '' })

        // Fly in
        map.flyTo({ center: CENTER, zoom: ZOOM, speed: 0.6, curve: 1.2 })
      })

      // ── Custom site marker ──────────────────────────────────────────────
      const el = document.createElement('div')
      Object.assign(el.style, {
        width: '10px', height: '10px', borderRadius: '50%',
        background: '#38bdf8', border: '2px solid rgba(255,255,255,0.95)',
        cursor: 'pointer',
        boxShadow: '0 0 0 5px rgba(14,165,233,0.18)',
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

  // ── No-token fallback ───────────────────────────────────────────────────────
  if (!TOKEN) {
    return (
      <div className={`${className} bg-gray-900/50 border border-gray-800/60 rounded-xl flex items-center justify-center`}>
        <div className="text-center px-6 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-display font-semibold text-gray-300 mb-2">Map requires a Mapbox token</p>
          <code className="text-2xs font-mono text-blue-400 bg-gray-800 px-2 py-1 rounded block mb-4">
            VITE_MAPBOX_TOKEN=pk.ey… in .env
          </code>
          <div className="text-2xs font-mono text-gray-700 space-y-1">
            <p>Peterson Rd &amp; Route 83 · Grayslake, IL 60030</p>
            <p>42.337°N, 88.001°W · Lake County</p>
            <p>~160 ac main · ~45 ac option parcel</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Map + overlays ─────────────────────────────────────────────────────────
  return (
    <div className={`relative ${className} rounded-xl overflow-hidden border border-gray-800/60 shadow-elevated`}>

      {/* Map canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-gray-950/88 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-800/60">
          <div className="w-4 h-0.5 bg-blue-400 rounded-full shrink-0" />
          <span className="text-2xs font-mono text-gray-400">Main parcel (~160 ac)</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-950/88 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-800/60">
          <svg width="16" height="4" className="shrink-0">
            <line x1="0" y1="2" x2="16" y2="2" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
          <span className="text-2xs font-mono text-gray-400">Option parcel (~45 ac)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-400/8 backdrop-blur-md px-3 py-2 rounded-lg border border-amber-500/20">
          <svg className="w-3 h-3 text-amber-400/70 shrink-0" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1L11 10H1L6 1z" />
            <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
          </svg>
          <span className="text-2xs font-mono text-amber-400/60">Approx. boundary — not surveyed</span>
        </div>
      </div>

      {/* North indicator */}
      <div className="absolute bottom-20 right-4 pointer-events-none z-10 flex flex-col items-center gap-0.5">
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <polygon points="9,1 4,14 9,11 14,14" fill="#4a4a72" />
          <polygon points="9,21 4,14 9,11 14,14" fill="#2c2c45" />
        </svg>
        <span className="text-2xs font-mono text-gray-700 leading-none">N</span>
      </div>

      {/* Click hint */}
      {!panelOpen && (
        <div className="absolute bottom-10 right-14 pointer-events-none z-10">
          <div className="bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800/50 text-xs text-gray-500">
            Click site to view details
          </div>
        </div>
      )}

      {/* ── Side panel ─────────────────────────────────────────────────────── */}
      {panelOpen && (
        <div className="absolute inset-y-0 right-0 w-64 bg-gray-950/96 backdrop-blur-xl border-l border-gray-800/70 flex flex-col z-20">

          <div className="flex items-start justify-between p-4 border-b border-gray-800/50 shrink-0">
            <div className="min-w-0">
              <p className="text-2xs font-mono text-blue-400/70 uppercase tracking-widest mb-0.5">T5 Data Centers</p>
              <h3 className="text-sm font-display font-bold text-gray-100 leading-snug">T5 @ Chicago IV</h3>
              <p className="text-2xs font-mono text-gray-600 mt-0.5">Grayslake · Lake County, IL</p>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="shrink-0 ml-2 mt-0.5 text-gray-600 hover:text-gray-300 transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-2.5 border-b border-gray-800/50 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-2xs font-mono font-semibold uppercase tracking-widest text-emerald-300 bg-emerald-500/8 border border-emerald-500/20 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Under Construction
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <dl className="space-y-0">
              {PANEL_ROWS.map(([k, v]) => (
                <div key={k} className="py-2.5 border-b border-gray-800/30 last:border-0">
                  <dt className="text-2xs font-mono text-gray-500 uppercase tracking-widest leading-none mb-0.5">{k}</dt>
                  <dd className="text-xs text-gray-200 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="p-4 border-t border-gray-800/50 shrink-0 space-y-2">
            <p className="text-xs text-amber-400/50 leading-relaxed">
              Boundaries approximate — not from survey, parcel, or GIS data.
            </p>
            <SourceCitation sourceKey="baxtel2026" />
          </div>
        </div>
      )}
    </div>
  )
}
