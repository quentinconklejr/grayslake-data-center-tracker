import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import parcelsGeoJSON from '../../data/parcels.geojson'
import outlineGeoJSON from '../../data/parcelsOutline.geojson'

export default function SiteMap({ className = '' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [hoveredParcel, setHoveredParcel] = useState(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      const m = L.map(mapContainer.current, {
        center: [42.312, -88.040],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false, // Disables accidental page scroll zoom
      })

      map.current = m

      // Cooperative scroll gesture handling
      const container = mapContainer.current
      const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
          m.scrollWheelZoom.enable()
          setShowScrollHint(false)
        } else {
          m.scrollWheelZoom.disable()
          setShowScrollHint(true)
          setTimeout(() => setShowScrollHint(false), 2000)
        }
      }

      container.addEventListener('wheel', handleWheel, { passive: true })

      // Base Satellite Layer
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, Lake County GIS',
          maxZoom: 18,
        }
      ).addTo(m)

      // Road & Place Names Overlay
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          pane: 'overlayPane',
        }
      ).addTo(m)

      // Approved Boundary Overlay
      if (outlineGeoJSON) {
        L.geoJSON(outlineGeoJSON, {
          style: {
            color: '#38bdf8',
            weight: 2.5,
            dashArray: '4, 4',
            fillOpacity: 0,
          },
        }).addTo(m)
      }

      // Recorded T5 Parcels
      if (parcelsGeoJSON) {
        L.geoJSON(parcelsGeoJSON, {
          style: {
            color: '#059669',
            weight: 1.5,
            fillColor: '#10b981',
            fillOpacity: 0.35,
          },
          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const props = feature.properties || {}
                setHoveredParcel({
                  pin: props.pin || props.PIN || '—',
                  acres: props.acres || props.ACRES || '—',
                  price: props.saleAmount ? `$${Number(props.saleAmount).toLocaleString()}` : (props['Recorded sale'] || props.PRICE || '—'),
                })
                e.target.setStyle({ fillOpacity: 0.65, weight: 2.5 })
              },
              mouseout: (e) => {
                setHoveredParcel(null)
                e.target.setStyle({ fillOpacity: 0.35, weight: 1.5 })
              },
            })
          },
        }).addTo(m)
      }

      setTimeout(() => m.invalidateSize(), 250)
    } catch (err) {
      console.error('Leaflet map error:', err)
    }

    return () => {
      try {
        map.current?.remove()
        map.current = null
      } catch (e) {
        // ignore
      }
    }
  }, [])

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-edge shadow-sm bg-slate-900 ${className}`}>
      <div ref={mapContainer} className="w-full h-[450px] z-0" />

      {/* Cooperative Gesture Scroll Hint Overlay */}
      {showScrollHint && (
        <div className="absolute inset-0 z-[500] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center pointer-events-none transition-opacity">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono px-4 py-2 rounded-lg shadow-xl">
            Use <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 font-bold">Ctrl</kbd> + scroll to zoom map
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-200 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400"></span>
          <span>Recorded T5 Parcels (287.8 ac)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400/40 border border-sky-400 border-dashed"></span>
          <span>Approved 472-Acre Boundary</span>
        </div>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredParcel && (
        <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-100 shadow-lg">
          <span className="text-emerald-400 font-bold">PIN: {hoveredParcel.pin}</span> · {hoveredParcel.acres} Acres · {hoveredParcel.price}
        </div>
      )}
    </div>
  )
}
