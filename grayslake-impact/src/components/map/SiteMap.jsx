import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import parcelsGeoJSON from '../../data/parcels.geojson'
import outlineGeoJSON from '../../data/parcelsOutline.geojson'

mapboxgl.accessToken = 'pk.eyJ1IjoicXVlbnRpbmNvbmtsZSIsImEiOiJjbTdia2o5YTYwMnZsMmpzOWVndTczOTlsIn0.9iO05lW759lO6yM14w9vlg'

export default function SiteMap({ className = '' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [hoveredParcel, setHoveredParcel] = useState(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    if (!mapboxgl.supported()) {
      setMapError(true)
      return
    }

    try {
      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-88.040, 42.312], // Adjusted center coordinates over Grayslake site
        zoom: 14.0,
        pitch: 0,
      })

      map.current = m
      m.addControl(new mapboxgl.NavigationControl(), 'top-right')

      m.on('load', () => {
        try {
          m.resize()

          m.addSource('parcels-data', {
            type: 'geojson',
            data: parcelsGeoJSON,
          })
          m.addSource('outline-data', {
            type: 'geojson',
            data: outlineGeoJSON,
          })

          m.addLayer({
            id: 'campus-outline',
            type: 'line',
            source: 'outline-data',
            paint: {
              'line-color': '#38bdf8',
              'line-width': 2.5,
              'line-dasharray': [2, 2],
            },
          })

          m.addLayer({
            id: 'parcels-fill',
            type: 'fill',
            source: 'parcels-data',
            paint: {
              'fill-color': '#10b981',
              'fill-opacity': 0.35,
            },
          })

          m.addLayer({
            id: 'parcels-borders',
            type: 'line',
            source: 'parcels-data',
            paint: {
              'line-color': '#059669',
              'line-width': 1.5,
            },
          })

          m.on('mousemove', 'parcels-fill', (e) => {
            if (e.features && e.features.length > 0) {
              m.getCanvas().style.cursor = 'pointer'
              const props = e.features[0].properties || {}
              setHoveredParcel({
                pin: props.pin || props.PIN || '—',
                acres: props.acres || props.ACRES || '—',
                price: props.salePrice ? `$${Number(props.salePrice).toLocaleString()}` : (props['Recorded sale'] || props.PRICE || '—'),
              })
            }
          })

          m.on('mouseleave', 'parcels-fill', () => {
            if (m) m.getCanvas().style.cursor = ''
            setHoveredParcel(null)
          })
        } catch (err) {
          console.error('Mapbox layers error:', err)
          setMapError(true)
        }
      })
    } catch (err) {
      console.error('Mapbox initialization error:', err)
      setMapError(true)
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

  // Trigger container resize check after mount
  useEffect(() => {
    if (!map.current) return
    const timer = setTimeout(() => map.current?.resize(), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-edge shadow-sm bg-slate-900 ${className}`}>
      {mapError ? (
        <div className="w-full h-[450px] flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900">
          <p className="font-semibold text-slate-200 mb-1">Interactive Map Layer Offline</p>
          <p className="text-xs max-w-md">
            WebGL is required to display the interactive satellite map. Please refer to the parcel directory table for all 57 recorded PINs and acreage figures.
          </p>
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-[450px]" />
      )}

      {/* Map Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-200 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400"></span>
          <span>Recorded T5 Parcels (287.8 ac)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400/40 border border-sky-400 border-dashed"></span>
          <span>Approved 472-Acre Boundary</span>
        </div>
      </div>

      {/* Parcel Hover Card */}
      {hoveredParcel && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-100 shadow-lg">
          <span className="text-emerald-400 font-bold">PIN: {hoveredParcel.pin}</span> · {hoveredParcel.acres} Acres · {hoveredParcel.price}
        </div>
      )}
    </div>
  )
}
