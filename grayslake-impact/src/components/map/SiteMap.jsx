import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import parcelsGeoJSON from '../../data/parcels.geojson'
import outlineGeoJSON from '../../data/parcelsOutline.geojson'

// Public Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoicXVlbnRpbmNvbmtsZSIsImEiOiJjbTdia2o5YTYwMnZsMmpzOWVndTczOTlsIn0.9iO05lW759lO6yM14w9vlg'

export default function SiteMap({ className = '' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [hoveredParcel, setHoveredParcel] = useState(null)

  useEffect(() => {
    if (map.current) return // Initialize map once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-88.0645, 42.3485],
      zoom: 14.2,
      pitch: 0,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      // Add 57 Parcels GeoJSON Source
      map.current.addSource('parcels-data', {
        type: 'geojson',
        data: parcelsGeoJSON,
      })

      // Add Approved Campus Outline Source
      map.current.addSource('outline-data', {
        type: 'geojson',
        data: outlineGeoJSON,
      })

      // Render Approved Campus Boundary (Dashed Outline)
      map.current.addLayer({
        id: 'campus-outline',
        type: 'line',
        source: 'outline-data',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.5,
          'line-dasharray':,
        },
      })

      // Render Recorded T5 Parcels Fill
      map.current.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels-data',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.35,
        },
      })

      // Render Parcel Borders
      map.current.addLayer({
        id: 'parcels-borders',
        type: 'line',
        source: 'parcels-data',
        paint: {
          'line-color': '#059669',
          'line-width': 1.5,
        },
      })

      // Hover Tooltip Interactions
      map.current.on('mousemove', 'parcels-fill', (e) => {
        if (e.features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer'
          const props = e.features[0].properties
          setHoveredParcel({
            pin: props.pin || props.PIN || '—',
            acres: props.acres || props.ACRES || '—',
            price: props.salePrice || props['Recorded sale'] || props.PRICE || '—',
          })
        }
      })

      map.current.on('mouseleave', 'parcels-fill', () => {
        map.current.getCanvas().style.cursor = ''
        setHoveredParcel(null)
      })
    })

    return () => map.current?.remove()
  }, [])

  return (
    <div className={`w-full block space-y-3 ${className}`}>
      {/* Interactive Mapbox Canvas */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Live Hover Info Overlay */}
        {hoveredParcel && (
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-lg border border-slate-700 font-mono text-xs shadow-lg">
            <span className="text-emerald-400 font-bold">PIN: {hoveredParcel.pin}</span> · {hoveredParcel.acres} Acres · {hoveredParcel.price}
          </div>
        )}
      </div>

      {/* Built-in Map Legend Caption */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 px-1 py-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-600" />
          <span>Recorded T5 Parcels (287.8 ac)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-sky-400 border-dashed" />
          <span>Approved 472-Acre Boundary</span>
        </div>
      </div>
    </div>
  )
}
