import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import parcelsGeoJSON from '../../data/parcels.geojson'
import outlineGeoJSON from '../../data/parcelsOutline.geojson'

export default function SiteMap({ className = '' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [hoveredParcel, setHoveredParcel] = useState(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      // Center coordinates over T5 Grayslake site (Peterson Rd & Rt 83)
      const m = L.map(mapContainer.current, {
        center: [42.312, -88.040],
        zoom: 14,
        zoomControl: true,
      })

      map.current = m

      // High-resolution Esri World Imagery (Satellite) — No token or API key required
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, Lake County GIS',
          maxZoom: 18,
        }
      ).addTo(m)

      // Add Approved Campus Outline (Dashed Blue Line)
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

      // Add Recorded T5 Parcels (Emerald Polygons)
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
                e.target.setStyle({
                  fillOpacity: 0.6,
                  weight: 2.5,
                })
              },
              mouseout: (e) => {
                setHoveredParcel(null)
                e.target.setStyle({
                  fillOpacity: 0.35,
                  weight: 1.5,
                })
              },
            })
          },
        }).addTo(m)
      }

      // Force Leaflet to recalculate container dimensions after mount
      setTimeout(() => m.invalidateSize(), 250)
    } catch (err) {
      console.error('Leaflet map error:', err)
    }

    return () => {
      try {
        map.current?.remove()
        map.current = null
      } catch (e) {
        // ignore cleanup error
      }
    }
  }, [])

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-edge shadow-sm bg-slate-900 ${className}`}>
      <div ref={mapContainer} className="w-full h-[450px] z-0" />

      {/* Map Legend Overlay */}
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
