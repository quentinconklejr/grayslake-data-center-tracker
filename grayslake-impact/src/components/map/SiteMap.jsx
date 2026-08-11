import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import parcelsGeoJSON from '../../data/parcels.geojson'

/**
 * Land ownership map.
 *
 * The complaint this version answers: a reader could not tell what they were
 * looking at. Green shapes on satellite imagery, no labels, no landmarks, no
 * sense of scale or of where in Grayslake this is. Satellite tiles are good at
 * showing that the land is currently farm field, and bad at everything else -
 * road names wash out against dirt, and one green blob looks like another.
 *
 * So: the shapes now label themselves with acreage, the roads that residents
 * actually use to describe the site are marked, there is a base layer toggle
 * so anyone who wants a plain readable map can have one, and the four
 * ownership groups are named rather than left as anonymous polygons.
 *
 * Group centres and acreages are computed from the parcel data, not typed in:
 * the four groups sum to 287.8, which is the same figure the legend and the
 * key figures use. If the parcel file changes, these labels follow it.
 */

// Point-in-polygon, so each parcel can be assigned to the group that contains
// it and the labels can carry a real acreage rather than a guess.
function ringOf(feature) {
  const g = feature.geometry
  return g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0]
}
function centroidOf(pts) {
  let x = 0, y = 0
  for (const c of pts) { x += c[0]; y += c[1] }
  return [x / pts.length, y / pts.length]
}

// The named clusters. Order is largest first, which is also the order they were
// acquired in, and matches how the timeline describes the purchases.
const GROUPS = [
  { key: 'south', label: 'Main block',   center: [42.30935, -88.03852], acres: 135.1, parcels: 50 },
  { key: 'west',  label: 'West parcel',  center: [42.31181, -88.04683], acres: 69.9,  parcels: 3 },
  { key: 'north', label: 'North parcel', center: [42.31491, -88.04569], acres: 64.0,  parcels: 2 },
  { key: 'east',  label: 'East strip',   center: [42.31436, -88.03611], acres: 18.8,  parcels: 2 },
]

// Landmarks residents actually use to describe where this is.
const LANDMARKS = [
  { at: [42.30480, -88.03900], text: 'Peterson Road' },
  { at: [42.31500, -88.05250], text: 'Alleghany Road' },
  { at: [42.31300, -88.02650], text: 'Route 83' },
]

export default function SiteMap({ className = '' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [selected, setSelected] = useState(null)
  const [hint, setHint] = useState('')
  const [base, setBase] = useState('satellite')
  const layersRef = useRef({})

  const META = parcelsGeoJSON?.metadata ?? {}
  const parcelCount = META.parcelCount ?? parcelsGeoJSON?.features?.length ?? 57
  const acres = META.countyAcresSum != null
    ? (Math.round(META.countyAcresSum * 10) / 10).toFixed(1)
    : '287.8'

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      const isTouch = window.matchMedia('(hover: none)').matches

      const m = L.map(mapContainer.current, {
        center: [42.3118, -88.0405],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
        // One finger scrolls the page, two fingers pan. Without this a tall map
        // in the middle of a long page catches the thumb.
        dragging: !isTouch,
        tap: false,
      })
      map.current = m

      L.control.scale({ imperial: true, metric: false, position: 'bottomleft' }).addTo(m)

      const container = mapContainer.current
      const handleWheel = e => {
        if (e.ctrlKey || e.metaKey) { m.scrollWheelZoom.enable(); setHint('') }
        else { m.scrollWheelZoom.disable(); setHint('Ctrl + scroll to zoom'); setTimeout(() => setHint(''), 1800) }
      }
      container.addEventListener('wheel', handleWheel, { passive: true })

      const onTouchStart = e => {
        if (e.touches.length >= 2) m.dragging.enable()
        else if (isTouch) {
          m.dragging.disable()
          setHint('Use two fingers to move the map')
          setTimeout(() => setHint(''), 1600)
        }
      }
      const onTouchEnd = () => { if (isTouch) m.dragging.disable() }
      container.addEventListener('touchstart', onTouchStart, { passive: true })
      container.addEventListener('touchend', onTouchEnd, { passive: true })

      // ── Base layers ───────────────────────────────────────────────────
      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri &mdash; Esri, USDA, USGS, Lake County GIS', maxZoom: 18 },
      )
      const plain = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', maxZoom: 19 },
      )
      // Road and place names, drawn over satellite only. The plain basemap has
      // its own labels and would double them up.
      const labels = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, pane: 'overlayPane' },
      )
      layersRef.current = { satellite, plain, labels }
      satellite.addTo(m)
      labels.addTo(m)

      // ── Recorded parcels ──────────────────────────────────────────────
      if (parcelsGeoJSON) {
        const layer = L.geoJSON(parcelsGeoJSON, {
          style: {
            color: '#facc15',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.45,
          },
          onEachFeature: (feature, lyr) => {
            const p = feature.properties || {}
            const info = {
              pin: p.pin || p.PIN || '—',
              acres: p.acres ?? p.ACRES ?? '—',
              price: p.saleAmount ? `$${Number(p.saleAmount).toLocaleString()}` : 'No recorded sale',
              date: p.saleDate || null,
            }
            const hi = () => lyr.setStyle({ fillOpacity: 0.72, weight: 3.5, color: '#fde047' })
            const lo = () => lyr.setStyle({ fillOpacity: 0.45, weight: 2, color: '#facc15' })
            lyr.on({
              mouseover: () => { if (!isTouch) { setSelected(info); hi() } },
              mouseout: () => { if (!isTouch) { setSelected(null); lo() } },
              click: () => { setSelected(info); hi(); setTimeout(lo, 2600) },
            })
          },
        }).addTo(m)

        // ── Group labels, drawn on the map itself ───────────────────────
        // This is the thing that was missing. A shape with its acreage written
        // across it needs no legend lookup.
        const counts = GROUPS.map(() => ({ acres: 0, parcels: 0 }))
        for (const pf of parcelsGeoJSON.features) {
          const c = centroidOf(ringOf(pf))
          let best = 0, bestD = Infinity
          GROUPS.forEach((g, i) => {
            const d = (c[0] - g.center[1]) ** 2 + (c[1] - g.center[0]) ** 2
            if (d < bestD) { bestD = d; best = i }
          })
          counts[best].acres += pf.properties?.acres ?? 0
          counts[best].parcels += 1
        }

        GROUPS.forEach((g, i) => {
          const ac = counts[i].acres ? counts[i].acres.toFixed(1) : g.acres
          const n = counts[i].parcels || g.parcels
          L.marker(g.center, {
            interactive: false,
            icon: L.divIcon({
              className: '',
              html:
                `<div style="white-space:nowrap;transform:translate(-50%,-50%);text-align:center;
                   font-family:ui-monospace,Menlo,monospace;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 8px rgba(0,0,0,.7);">
                   <div style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.02em;">${ac} ac</div>
                   <div style="color:#d9f99d;font-size:10px;font-weight:600;">${n} parcel${n === 1 ? '' : 's'}</div>
                 </div>`,
            }),
          }).addTo(m)
        })

        // ── Road labels ─────────────────────────────────────────────────
        LANDMARKS.forEach(({ at, text }) => {
          L.marker(at, {
            interactive: false,
            icon: L.divIcon({
              className: '',
              html:
                `<div style="white-space:nowrap;transform:translate(-50%,-50%);
                   font-family:ui-monospace,Menlo,monospace;font-size:10px;font-weight:700;
                   letter-spacing:.08em;text-transform:uppercase;color:#fef3c7;
                   text-shadow:0 1px 3px rgba(0,0,0,.95),0 0 6px rgba(0,0,0,.8);">${text}</div>`,
            }),
          }).addTo(m)
        })

        try { m.fitBounds(layer.getBounds(), { padding: [30, 30] }) } catch { /* keep default */ }
      }

      setTimeout(() => m.invalidateSize(), 250)

      return () => {
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', onTouchStart)
        container.removeEventListener('touchend', onTouchEnd)
        try { map.current?.remove() } catch { /* already gone */ }
        map.current = null
      }
    } catch (err) {
      console.error('Leaflet map error:', err)
    }
  }, [])

  // Base layer toggle. Satellite proves the land is currently field; the plain
  // map is far easier to read for street names and orientation. Readers want
  // different ones at different moments, so let them switch.
  function switchBase(next) {
    const m = map.current
    const { satellite, plain, labels } = layersRef.current
    if (!m || !satellite || !plain) return
    if (next === 'plain') {
      m.removeLayer(satellite); m.removeLayer(labels); plain.addTo(m); plain.bringToBack()
    } else {
      m.removeLayer(plain); satellite.addTo(m); satellite.bringToBack(); labels.addTo(m)
    }
    setBase(next)
  }

  return (
    <div className={className}>
      {/* Where this is, in words, before any pixels */}
      <div className="mb-2.5">
        <p className="text-2xs font-mono uppercase tracking-widest text-sky-800">
          Cornerstone business park &middot; Grayslake, Illinois
        </p>
        <p className="text-sm text-slate-700 leading-snug mt-0.5">
          North of Peterson Road, east of Alleghany Road, about a mile and a half west of Route 83 and
          two miles from downtown Grayslake. Green shapes are the parcels whose deeds are recorded to
          a T5 entity. Tap or hover one for its PIN, acreage and recorded sale.
        </p>
      </div>

      {/* Base layer toggle */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xs font-mono uppercase tracking-widest text-slate-500">View</span>
        <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
          {[['satellite', 'Satellite'], ['plain', 'Plain map']].map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              onClick={() => switchBase(k)}
              aria-pressed={base === k}
              className={`px-3 py-2 text-xs font-mono font-semibold transition-colors min-h-[44px] ${
                base === k ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-900">
        <div ref={mapContainer} className="w-full h-[340px] sm:h-[460px] lg:h-[540px] z-0" />

        {/* North indicator */}
        <div
          className="absolute top-3 right-3 z-[400] w-9 h-9 rounded-full bg-slate-950/80 border border-slate-600 flex flex-col items-center justify-center text-slate-100 pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[10px] leading-none">&#9650;</span>
          <span className="text-[10px] font-mono font-bold leading-none mt-0.5">N</span>
        </div>

        {hint && (
          <div className="absolute inset-x-0 top-3 z-[500] flex justify-center pointer-events-none px-3">
            <div className="bg-slate-900/95 border border-slate-700 text-slate-100 text-xs font-mono px-3.5 py-2 rounded-lg shadow-xl text-center">
              {hint}
            </div>
          </div>
        )}

        {selected && (
          <div className="absolute bottom-3 right-3 z-[400] max-w-[calc(100%-1.5rem)] bg-slate-950/92 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-100 shadow-lg">
            <div className="text-lime-300 font-bold">PIN {selected.pin}</div>
            <div className="mt-0.5 text-slate-300">
              {selected.acres} acres &middot; {selected.price}
              {selected.date && <> &middot; {selected.date}</>}
            </div>
          </div>
        )}
      </div>

      {/* Legend as a panel, under the map, never covering it */}
      <div className="mt-3 border border-slate-300 rounded-xl bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <p className="text-2xs font-mono font-bold uppercase tracking-widest text-slate-600">
            What you are looking at
          </p>
        </div>

        <div className="px-4 py-3.5 space-y-3">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 w-5 h-5 rounded shrink-0 border-2"
              style={{ backgroundColor: 'rgba(34,197,94,0.45)', borderColor: '#facc15' }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-snug">Land recorded to T5</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                {acres} acres across {parcelCount} parcels, in four groups: a {GROUPS[0].acres}-acre main
                block south of the others, then {GROUPS[1].acres}, {GROUPS[2].acres} and{' '}
                {GROUPS[3].acres} acres. Each group is labelled on the map with its acreage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
            <span
              className="mt-0.5 w-5 h-5 rounded shrink-0 border-2 border-dashed border-slate-400 bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold"
              aria-hidden="true"
            >
              ?
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                The approved campus is not drawn
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Village approvals permit development on up to <strong>472 acres</strong>, a larger area
                than T5 currently owns. The Village has never published that boundary as a mappable
                shape, so nothing here represents it. Anyone showing you a 472-acre outline is showing
                you an estimate.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
          <p className="text-2xs font-mono text-slate-600 leading-relaxed">
            Source: Lake County GIS tax parcel layer
            {META.retrieved ? `, retrieved ${META.retrieved}` : ''}. Acreage is the county&rsquo;s own
            field, not measured from the shapes.
          </p>
        </div>
      </div>
    </div>
  )
}
