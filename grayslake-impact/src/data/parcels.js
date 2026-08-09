import parcelsGeoJSON from './parcels.geojson'

export const PARCELS_DATA = (parcelsGeoJSON?.features || []).map(f => {
  const props = f.properties || {}
  return {
    pin: props.pin || props.PIN || '—',
    acres: props.acres || props.ACRES || '—',
    salePrice: props.salePrice || props['Recorded sale'] || props.PRICE || '—',
    date: props.date || props.Date || props.DATE || '—',
  }
})
