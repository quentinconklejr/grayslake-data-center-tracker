import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import parcelsGeoJSON from '../../data/parcels.geojson'
import outlineGeoJSON from '../../data/parcelsOutline.geojson'

/**
 * Land ownership map.
 *
 * THE LABEL BUG THIS FIXES
 * ------------------------
 * The previous version wrote an acreage on each of the four ownership groups,
 * which was the right idea, but assigned parcels to groups by nearest centroid.
 * That is wrong wherever groups are close together or oddly shaped, and here it
 * was wrong badly: the main block should read 135.1 ac / 50 parcels and was
 * labelled 79.9 / 47, while the small east strip should read 18.8 / 2 and was
 * labelled 74.0 / 5. The four numbers still summed to 287.8, so nothing looked
 * broken - the totals were right and every individual label was wrong, which is
 * the worst way for a number to be wrong.
 *
 * Parcels are now assigned by point-in-polygon against the dissolved ownership
 * outline, the same test used to derive the figures quoted elsewhere on the
 * site. Labels are computed from the data at render, so they cannot drift from
 * the parcel file.
 *
 * The outline file is used ONLY for this grouping test. It is not drawn. An
 * earlier version drew it as a dashed line captioned "Approved 472-Acre
 * Boundary", which was false: it is the outline of the 287.8 acres of recorded
 * ownership, and the file's own metadata says so.
 */

function ringOf(feature) {
  const g = feature.geometry
  return g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0]
}
function centroidOf(pts) {
  let x = 0, y = 0
  for (const c of pts) { x += c[0]; y += c[1] }
  return [x / pts.length, y / pts.length]
}
function pointInRing([x, y], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi) inside = !inside
  }
  return inside
}

// Roads residents use to describe where the site is.
const LANDMARKS = [
  { at: [42.30480, -88.03900], text: 'Peterson Road' },
  { at: [42.31500, -88.05250], text: 'Alleghany Road' },
  { at: [42.31300, -88.02650], text: 'Route 83' },
]

export default function SiteMap({ className = '', showCaption = true }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const layersRef = useRef({})
  const [selected, setSelected] = useState(null)
  const [hint, setHint] = useState('')
  const [base, setBase] = useState('satellite')

  const META = parcelsGeoJSON?.metadata ?? {}
  const parcelCount = META.parcelCount ?? parcelsGeoJSON?.features?.length ?? 57
  const acres = META.countyAcresSum != null
    ? (Math.round(META.countyAcresSum * 10) / 10).toFixed(1)
    : '287.8'

  // Group totals, computed once, by containment rather than proximity.
  const groups = useMemo(() => {
    const rings = (outlineGeoJSON?.features ?? []).map(ringOf)
    const acc = rings.map(r => ({ ring: r, center: centroidOf(r), acres: 0, parcels: 0 }))
    for (const pf of parcelsGeoJSON?.features ?? []) {
      const c = centroidOf(ringOf(pf))
      const hit = acc.find(g => pointInRing(c, g.ring))
      if (hit) { hit.acres += pf.properties?.acres ?? 0; hit.parcels += 1 }
    }
    return acc
      .filter(g => g.parcels > 0)
      .sort((a, b) => b.acres - a.acres)
      .map(g => ({
        center: [g.center[1], g.center[0]],
        acres: Math.round(g.acres * 10) / 10,
        parcels: g.parcels,
      }))
  }, [])

  useEffect(() => {
    if (map.current || !mapContainer.current) return
    try {
      const isTouch = window.matchMedia('(hover: none)').matches

      const m = L.map(mapContainer.current, {
        center: [42.3118, -88.0405],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
        // One finger scrolls the page, two fingers pan the map.
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
      const onTouchStart = e => {
        if (e.touches.length >= 2) m.dragging.enable()
        else if (isTouch) { m.dragging.disable(); setHint('Two fingers to move the map'); setTimeout(() => setHint(''), 1600) }
      }
      const onTouchEnd = () => { if (isTouch) m.dragging.disable() }
      container.addEventListener('wheel', handleWheel, { passive: true })
      container.addEventListener('touchstart', onTouchStart, { passive: true })
      container.addEventListener('touchend', onTouchEnd, { passive: true })

      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri &mdash; Esri, USDA, USGS, Lake County GIS', maxZoom: 18 },
      )
      const plain = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', maxZoom: 19 },
      )
      const labels = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, pane: 'overlayPane' },
      )
      layersRef.current = { satellite, plain, labels }
      satellite.addTo(m)
      labels.addTo(m)

      if (parcelsGeoJSON) {
        const layer = L.geoJSON(parcelsGeoJSON, {
          style: { color: '#facc15', weight: 2, fillColor: '#22c55e', fillOpacity: 0.42 },
          onEachFeature: (feature, lyr) => {
            const p = feature.properties || {}
            const info = {
              pin: p.pin || p.PIN || '—',
              acres: p.acres ?? p.ACRES ?? '—',
              price: p.saleAmount ? `$${Number(p.saleAmount).toLocaleString()}` : 'No recorded sale',
              date: p.saleDate || null,
            }
            const hi = () => lyr.setStyle({ fillOpacity: 0.72, weight: 3.5, color: '#fde047' })
            const lo = () => lyr.setStyle({ fillOpacity: 0.42, weight: 2, color: '#facc15' })
            lyr.on({
              mouseover: () => { if (!isTouch) { setSelected(info); hi() } },
              mouseout: () => { if (!isTouch) { setSelected(null); lo() } },
              click: () => { setSelected(info); hi(); setTimeout(lo, 2600) },
            })
          },
        }).addTo(m)

        // Group labels, computed by containment.
        groups.forEach(g => {
          L.marker(g.center, {
            interactive: false,
            icon: L.divIcon({
              className: '',
              iconSize: [120, 40],
              iconAnchor: [60, 20],
              html:
                `<div style="width:120px;text-align:center;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;
                   text-shadow:0 1px 4px rgba(0,0,0,.95),0 0 10px rgba(0,0,0,.8);pointer-events:none;">
                   <div style="color:#fff;font-size:15px;font-weight:500;letter-spacing:-.01em;line-height:1.1;">${g.acres} ac</div>
                   <div style="color:#fde047;font-size:10px;font-weight:500;letter-spacing:.06em;margin-top:1px;">${g.parcels} PARCEL${g.parcels === 1 ? '' : 'S'}</div>
                 </div>`,
            }),
          }).addTo(m)
        })

        LANDMARKS.forEach(({ at, text }) => {
          L.marker(at, {
            interactive: false,
            icon: L.divIcon({
              className: '',
              iconSize: [140, 16],
              iconAnchor: [70, 8],
              html:
                `<div style="width:140px;text-align:center;white-space:nowrap;
                   font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:10px;font-weight:500;
                   letter-spacing:.1em;text-transform:uppercase;color:#e0f2fe;
                   text-shadow:0 1px 4px rgba(0,0,0,.95),0 0 8px rgba(0,0,0,.85);">${text}</div>`,
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
  }, [groups])

  function switchBase(next) {
    const m = map.current
    const { satellite, plain, labels } = layersRef.current
    if (!m || !satellite || !plain) return
    if (next === 'plain') { m.removeLayer(satellite); m.removeLayer(labels); plain.addTo(m); plain.bringToBack() }
    else { m.removeLayer(plain); satellite.addTo(m); satellite.bringToBack(); labels.addTo(m) }
    setBase(next)
  }

  return (
    <div className={className}>
      {/* Suppressed on the homepage, which already has its own heading and
          would otherwise stack two captions on top of each other. */}
      {showCaption && (
        <p className="text-base font-sans text-ink-700 leading-relaxed mb-4 max-w-3xl">
          North of Peterson Road and east of Alleghany Road, about a mile and a half west of Route 83.
          Green shapes are the parcels whose deeds are recorded to a T5 entity; each group is labelled
          with its acreage. Tap or hover a parcel for its PIN and recorded sale.
        </p>
      )}

      {/* ── Basemap toggle + summary ────────────────────────────────
          Segmented dark-inversion chip pair — same treatment as the
          Actions jurisdiction / type filters and the Timeline category
          filters, so the site has one segmented-control convention
          rather than two. role="group" + aria-pressed preserved for
          screen readers. */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-rule">
        <div className="inline-flex items-center gap-2" role="group" aria-label="Base map style">
          <span className="text-xs font-sans font-semibold text-ink-600 mr-1">Base map</span>
          {[['satellite', 'Satellite'], ['plain', 'Plain']].map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              onClick={() => switchBase(k)}
              aria-pressed={base === k}
              className={`inline-flex items-center px-3 py-1.5 border text-xs font-sans font-semibold transition-colors min-h-[44px] ${
                base === k
                  ? 'bg-ink-900 text-paper border-ink-900'
                  : 'bg-transparent text-ink-700 border-rule-strong hover:border-ink-700 hover:text-ink-900'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-ink-500">
          {parcelCount} parcels &middot; {acres} acres
        </span>
      </div>

      {/* ── Map surface ───────────────────────────────────────────── */}
      <div className="relative w-full mt-3 border border-rule bg-ink-900 overflow-hidden">
        <div ref={mapContainer} className="w-full h-[340px] sm:h-[460px] lg:h-[540px] z-0" />

        <div
          className="absolute top-3 right-3 z-[400] w-9 h-9 border border-rule flex flex-col items-center justify-center bg-ink-900/85 text-paper pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[10px] leading-none">&#9650;</span>
          <span className="text-[10px] font-mono font-medium leading-none mt-0.5">N</span>
        </div>

        {hint && (
          <div className="absolute inset-x-0 top-3 z-[500] flex justify-center pointer-events-none px-3">
            <div className="bg-ink-900/95 border border-rule text-paper text-xs font-mono px-3.5 py-2">
              {hint}
            </div>
          </div>
        )}

        {selected && (
          <div className="absolute bottom-3 right-3 z-[400] max-w-[calc(100%-1.5rem)] bg-ink-900/95 backdrop-blur-md px-3.5 py-2.5 border border-rule text-xs font-mono text-paper">
            <div className="font-semibold text-status-stated" style={{ color: '#a3e28a' }}>PIN {selected.pin}</div>
            <div className="mt-0.5 text-paper-sunk">
              {selected.acres} acres &middot; {selected.price}
              {selected.date && <> &middot; {selected.date}</>}
            </div>
          </div>
        )}
      </div>

      {/* ── Legend (typeset, not boxed) ───────────────────────────── */}
      <p className="mt-4 text-sm font-sans text-ink-700 leading-relaxed max-w-3xl">
        <span
          className="inline-block align-middle mr-2 w-3.5 h-3.5"
          style={{ backgroundColor: 'rgba(34,197,94,0.42)', border: '2px solid #facc15' }}
          aria-hidden="true"
        />
        <span className="font-semibold text-ink-900">Land recorded to T5.</span>{' '}
        {acres} acres across {parcelCount} parcels, in {groups.length} groups
        {groups.length ? ` of ${groups.map(g => `${g.acres}`).join(', ')} acres` : ''}. Each group
        is labelled on the map with its own acreage and parcel count.
      </p>
      <p className="mt-1 text-xs font-sans text-ink-500 leading-relaxed max-w-3xl">
        Acreage is the county&rsquo;s own field, not measured from the shapes.
      </p>

      {/* ── Editor's note — the 472-acre callout ─────────────────────
          The single most consequential sentence on the site. Village
          approvals cover a larger area than T5 owns; the Village has
          never released that boundary as data; anyone drawing one is
          drawing an estimate. Given the visual weight of a real pull
          quote — heavy left rule, small caps label in the display
          face, larger body text — so a scanning reader reads it before
          they read the map. */}
      <aside
        aria-label="Editor's note"
        className="mt-6 border-l-[3px] border-ink-900 bg-paper-sunk pl-5 sm:pl-6 pr-5 py-4 max-w-2xl"
      >
        <p className="text-2xs font-display font-semibold text-ink-800 uppercase tracking-[0.14em] mb-2">
          Editor&rsquo;s note
        </p>
        <p className="text-lg sm:text-xl font-display text-ink-900 leading-snug mb-3">
          The approved campus is not drawn.
        </p>
        <p className="text-base font-sans text-ink-700 leading-relaxed">
          Village approvals permit development on up to <span className="font-mono text-ink-900">472 acres</span>, a larger area
          than T5 currently owns. The Village has never published that boundary as a mappable
          shape, so nothing here represents it. Anyone showing you a 472-acre outline is showing
          you an estimate.
        </p>
      </aside>
    </div>
  )
}
