import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import parcelsGeoJSON from '../../data/parcels.geojson'

/**
 * Land ownership map.
 *
 * Two things were wrong with the previous version, one of them serious.
 *
 * 1. THE DASHED BLUE LAYER WAS MISLABELLED. It was drawn from
 *    parcelsOutline.geojson and captioned "Approved 472-Acre Boundary". That
 *    file is the dissolved outline of the same 57 parcels the green fill
 *    already shows - 287.8 acres of recorded ownership - and its own metadata
 *    says, in as many words, "This is NOT the approved campus boundary."
 *    So the map drew 287.8 acres and told the reader it was 472. It has been
 *    removed rather than relabelled: it carried no information the green fill
 *    did not already carry, and its only real effect was the false caption.
 *    The approved campus is not drawn at all, because the Village has never
 *    published it as a mappable shape, and the legend now says so outright.
 *
 * 2. NOBODY COULD TELL WHAT THEY WERE LOOKING AT. A small dark overlay in the
 *    corner with two colour dots, no scale, no source, no statement of what
 *    the site even is. The legend is now a full panel underneath the map:
 *    readable at any width, never covering the thing it describes, and
 *    carrying the provenance and the caveat where a reader will actually see
 *    them.
 *
 * Mobile behaviour is deliberate too. Parcels respond to tap, not only hover,
 * or every parcel on the map is inert on a phone. And one-finger drag scrolls
 * the page rather than panning the map, so a 340px-tall map cannot trap
 * someone mid-scroll; two fingers pan, and a hint says so.
 */
export default function SiteMap({ className = '' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [selected, setSelected] = useState(null)
  const [hint, setHint] = useState('')

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
        center: [42.312, -88.040],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
        // One finger scrolls the page. Two fingers pan the map. Without this a
        // tall map in the middle of a long page catches the thumb and the
        // reader cannot get past it.
        dragging: !isTouch,
        tap: false,
      })
      map.current = m

      L.control.scale({ imperial: true, metric: false, position: 'bottomleft' }).addTo(m)

      const container = mapContainer.current

      const handleWheel = e => {
        if (e.ctrlKey || e.metaKey) {
          m.scrollWheelZoom.enable()
          setHint('')
        } else {
          m.scrollWheelZoom.disable()
          setHint('Ctrl + scroll to zoom')
          setTimeout(() => setHint(''), 1800)
        }
      }
      container.addEventListener('wheel', handleWheel, { passive: true })

      const onTouchStart = e => {
        if (e.touches.length >= 2) {
          m.dragging.enable()
        } else if (isTouch) {
          m.dragging.disable()
          setHint('Use two fingers to move the map')
          setTimeout(() => setHint(''), 1600)
        }
      }
      const onTouchEnd = () => { if (isTouch) m.dragging.disable() }
      container.addEventListener('touchstart', onTouchStart, { passive: true })
      container.addEventListener('touchend', onTouchEnd, { passive: true })

      // Satellite imagery
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, Lake County GIS',
          maxZoom: 18,
        },
      ).addTo(m)

      // Road and place names, so the shapes sit somewhere recognisable
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 18,
          pane: 'overlayPane',
        },
      ).addTo(m)

      // Recorded T5 parcels. The only shape on this map, deliberately.
      if (parcelsGeoJSON) {
        const layer = L.geoJSON(parcelsGeoJSON, {
          style: {
            color: '#047857',
            weight: 1.5,
            fillColor: '#10b981',
            fillOpacity: 0.42,
          },
          onEachFeature: (feature, lyr) => {
            const p = feature.properties || {}
            const info = {
              pin: p.pin || p.PIN || '—',
              acres: p.acres ?? p.ACRES ?? '—',
              price: p.saleAmount ? `$${Number(p.saleAmount).toLocaleString()}` : 'No recorded sale',
              date: p.saleDate || '—',
            }
            const hi = () => lyr.setStyle({ fillOpacity: 0.7, weight: 3, color: '#065f46' })
            const lo = () => lyr.setStyle({ fillOpacity: 0.42, weight: 1.5, color: '#047857' })

            lyr.on({
              mouseover: () => { if (!isTouch) { setSelected(info); hi() } },
              mouseout: () => { if (!isTouch) { setSelected(null); lo() } },
              // Tap support. Without this every parcel is dead on a phone.
              click: () => { setSelected(info); hi(); setTimeout(lo, 2500) },
            })
          },
        }).addTo(m)

        try { m.fitBounds(layer.getBounds(), { padding: [24, 24] }) } catch { /* keep default view */ }
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

  return (
    <div className={className}>
      {/* Caption above the map, so the first thing read is what this is */}
      <div className="mb-2.5">
        <p className="text-2xs font-mono uppercase tracking-widest text-sky-800">
          Cornerstone business park &middot; Grayslake, Illinois
        </p>
        <p className="text-sm text-slate-700 leading-snug mt-0.5">
          Every parcel whose deed is recorded to a T5 entity, drawn from Lake County&rsquo;s tax parcel
          layer. Tap or hover a parcel for its PIN, acreage and recorded sale.
        </p>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-900">
        <div ref={mapContainer} className="w-full h-[340px] sm:h-[450px] lg:h-[520px] z-0" />

        {hint && (
          <div className="absolute inset-x-0 top-3 z-[500] flex justify-center pointer-events-none px-3">
            <div className="bg-slate-900/95 border border-slate-700 text-slate-100 text-xs font-mono px-3.5 py-2 rounded-lg shadow-xl text-center">
              {hint}
            </div>
          </div>
        )}

        {selected && (
          <div className="absolute bottom-3 right-3 z-[400] max-w-[calc(100%-1.5rem)] bg-slate-950/92 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-100 shadow-lg">
            <div className="text-emerald-400 font-bold">PIN {selected.pin}</div>
            <div className="mt-0.5 text-slate-300">
              {selected.acres} acres &middot; {selected.price}
              {selected.date !== '—' && <> &middot; {selected.date}</>}
            </div>
          </div>
        )}
      </div>

      {/* Legend as a real panel, under the map. Readable at any width, never
          covering what it describes, and carrying the caveat where it will
          actually be read. */}
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
              style={{ backgroundColor: 'rgba(16,185,129,0.42)', borderColor: '#047857' }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                Land recorded to T5
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                {acres} acres across {parcelCount} parcels, in four separate groups. This is what T5
                owns today, by deed.
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
                shape, so nothing on this map represents it. Anyone showing you a 472-acre outline is
                showing you an estimate.
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
