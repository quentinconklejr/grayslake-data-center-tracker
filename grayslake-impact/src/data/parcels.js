import parcelsGeoJSON from './parcels.geojson'

export const PARCELS_DATA = (parcelsGeoJSON?.features || []).map(f => {
  const props = f.properties || {}
  return {
    pin: props.pin || props.PIN || '—',
    acres: props.acres || props.ACRES || '—',
    salePrice: props.saleAmount ? `$${Number(props.saleAmount).toLocaleString()}` : (props['Recorded sale'] || props.salePrice || props.PRICE || '—'),
    date: props.saleDate || props.date || props.Date || props.DATE || '—',
  }
})
