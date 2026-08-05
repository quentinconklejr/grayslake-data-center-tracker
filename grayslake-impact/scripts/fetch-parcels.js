/**
 * Re-fetch T5 parcel geometry from Lake County GIS and regenerate
 * src/data/parcels.geojson and src/data/parcelsOutline.geojson.
 *
 *   node scripts/fetch-parcels.js
 *
 * The data is committed rather than fetched at page load, deliberately: a
 * civic tracker should not go blank because a county server is down or its
 * schema changed. Re-run this when ownership may have moved, check the diff,
 * and update `retrieved` in the output.
 *
 * Accuracy: geometry is requested with maxAllowableOffset ~0.55 m, which only
 * removes collinear vertices along straight lot lines. The script asserts the
 * computed geodesic area matches the county's own CALCACRE field to within
 * 0.5% in aggregate, and fails loudly if it does not.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as turf from '@turf/turf'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SERVICE =
  'https://maps.lakecountyil.gov/arcgis/rest/services/GISMapping/WABParcels/MapServer/12'
const WHERE = "taxpayer_name LIKE 'T5%' AND MUNI_NAME = 'GRAYSLAKE'"
const ACRES_PER_SQM = 1 / 4046.8564224
const TOLERANCE_PCT = 0.5

function url(extra) {
  const p = new URLSearchParams({
    where: WHERE,
    outFields: 'PIN,CALCACRE,taxpayer_name,sale_amt1,sale_date1',
    returnGeometry: 'true',
    outSR: '4326',
    geometryPrecision: '6',
    maxAllowableOffset: '0.000005',
    f: 'json',
    ...extra,
  })
  return `${SERVICE}/query?${p}`
}

const res = await fetch(url({}))
if (!res.ok) throw new Error(`county GIS returned ${res.status}`)
const esri = await res.json()
if (esri.error) throw new Error(`county GIS error: ${JSON.stringify(esri.error)}`)
if (!esri.features?.length) throw new Error('no parcels returned — has the taxpayer name changed?')

const features = esri.features.map(f =>
  turf.polygon([f.geometry.rings[0]], {
    pin: f.attributes.PIN,
    acres: +f.attributes.CALCACRE.toFixed(2),
    owner: f.attributes.taxpayer_name,
    saleAmount: f.attributes.sale_amt1 ?? null,
    saleDate: f.attributes.sale_date1
      ? new Date(f.attributes.sale_date1).toISOString().slice(0, 10)
      : null,
  }),
)
features.sort((a, b) => b.properties.acres - a.properties.acres)
const fc = turf.featureCollection(features)

// --- accuracy gate ---
const countySum = features.reduce((s, f) => s + f.properties.acres, 0)
const computed = turf.area(fc) * ACRES_PER_SQM
const deviation = (Math.abs(computed - countySum) / countySum) * 100
console.log(
  `county CALCACRE ${countySum.toFixed(2)} ac | computed ${computed.toFixed(2)} ac | deviation ${deviation.toFixed(3)}%`,
)
if (deviation > TOLERANCE_PCT) {
  throw new Error(`geometry deviates ${deviation.toFixed(2)}% from county acreage — refusing to write`)
}

const retrieved = new Date().toISOString().slice(0, 10)
const metadata = {
  title: 'T5-owned parcels, Grayslake, Illinois',
  source: 'Lake County, Illinois GIS Division — Tax Parcel Information (layer 12)',
  sourceUrl: SERVICE,
  query: WHERE,
  retrieved,
  crs: 'EPSG:4326',
  simplification: 'maxAllowableOffset 0.000005 deg (~0.55 m); removes collinear vertices only',
  parcelCount: features.length,
  countyAcresSum: +countySum.toFixed(2),
  computedAcres: +computed.toFixed(2),
  note: 'Land recorded in T5 ownership. This is NOT the approved campus boundary, which the Village permits at up to 472 acres.',
}
fc.metadata = metadata

const outline = turf.dissolve(fc)
outline.features.sort((a, b) => turf.area(b) - turf.area(a))
outline.features.forEach((f, i) => {
  f.properties = { group: i + 1, acres: +(turf.area(f) * ACRES_PER_SQM).toFixed(1) }
})
outline.metadata = { ...metadata, title: 'T5 ownership outline (parcels dissolved)', groups: outline.features.length }

writeFileSync(join(ROOT, 'src/data/parcels.geojson'), JSON.stringify(fc, null, 1))
writeFileSync(join(ROOT, 'src/data/parcelsOutline.geojson'), JSON.stringify(outline, null, 1))
console.log(`wrote ${features.length} parcels in ${outline.features.length} contiguous groups (retrieved ${retrieved})`)
