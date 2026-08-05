/**
 * Accuracy gate for the committed parcel data.
 *
 *   npm run verify-parcels
 *
 * Recomputes geodesic area from the stored geometry and compares it to the
 * county's own CALCACRE field, per parcel and in aggregate. The old map drew
 * two hand-typed rectangles that depicted 203 acres against 472 approved and
 * sat 4.36 km from the real site; nothing caught it because nothing checked.
 * This is that check.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as turf from '@turf/turf'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ACRES_PER_SQM = 1 / 4046.8564224
const AGGREGATE_TOLERANCE_PCT = 0.5
const PARCEL_TOLERANCE_PCT = 3

const parcels = JSON.parse(readFileSync(join(ROOT, 'src/data/parcels.geojson'), 'utf8'))
const outline = JSON.parse(readFileSync(join(ROOT, 'src/data/parcelsOutline.geojson'), 'utf8'))

const fail = []
let countySum = 0
let computedSum = 0
let worst = { pct: 0, pin: null }

for (const f of parcels.features) {
  const county = f.properties.acres
  const computed = turf.area(f) * ACRES_PER_SQM
  countySum += county
  computedSum += computed
  const pct = (Math.abs(computed - county) / county) * 100
  if (pct > worst.pct) worst = { pct, pin: f.properties.pin }
  if (pct > PARCEL_TOLERANCE_PCT) {
    fail.push(`  parcel ${f.properties.pin}: county ${county} ac vs computed ${computed.toFixed(2)} ac (${pct.toFixed(2)}%)`)
  }
}

const aggPct = (Math.abs(computedSum - countySum) / countySum) * 100
const outlineAcres = outline.features.reduce((s, f) => s + turf.area(f) * ACRES_PER_SQM, 0)

console.log(`parcels            ${parcels.features.length}`)
console.log(`county CALCACRE    ${countySum.toFixed(2)} ac`)
console.log(`computed geodesic  ${computedSum.toFixed(2)} ac`)
console.log(`aggregate deviation ${aggPct.toFixed(3)}%  (tolerance ${AGGREGATE_TOLERANCE_PCT}%)`)
console.log(`worst parcel        ${worst.pin} at ${worst.pct.toFixed(2)}%  (tolerance ${PARCEL_TOLERANCE_PCT}%)`)
console.log(`dissolved outline   ${outline.features.length} groups, ${outlineAcres.toFixed(2)} ac`)

if (parcels.features.length !== parcels.metadata.parcelCount) {
  fail.push(`  metadata parcelCount ${parcels.metadata.parcelCount} != ${parcels.features.length} features`)
}
if (Math.abs(outlineAcres - computedSum) / computedSum > 0.01) {
  fail.push(`  dissolved outline ${outlineAcres.toFixed(2)} ac disagrees with parcel sum ${computedSum.toFixed(2)} ac`)
}
if (aggPct > AGGREGATE_TOLERANCE_PCT) {
  fail.push(`  aggregate deviation ${aggPct.toFixed(3)}% exceeds ${AGGREGATE_TOLERANCE_PCT}%`)
}

if (fail.length) {
  console.error('\nFAIL\n' + fail.join('\n'))
  process.exit(1)
}
console.log('\nPASS — geometry matches the county record within tolerance')
