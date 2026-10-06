/**
 * Calculated values: figures the site computes itself from county parcel
 * records (src/data/calculations.js), checked by recomputing them.
 *
 * The verbatim guard fails any number not in a cited source, which is right
 * for a total the site adds up itself: no source states it. Such a figure may
 * pass only when all of these hold:
 *   - the entry says so, with the calculation's label ("calculated from
 *     county parcel records");
 *   - every stored input matches the county record: the parcel snapshot
 *     (src/data/parcels.geojson) and, when given, the county rows the audit
 *     read (the lakecountygis corpus record);
 *   - recomputing from the inputs gives exactly the figure printed.
 * Anything else leaves the failure standing, with the reason attached.
 */
import * as turf from '@turf/turf'

export const ACRES_PER_SQM = 1 / 4046.8564224   // as scripts/fetch-parcels.js

/** "62,968,250" → "62968250"; "64.0" stays "64.0" (decimals are part of the claim). */
const normValue = v => String(v).replace(/,/g, '').trim()

/** Rounds hundredths of an acre half up to `decimals` (no float drift). */
function roundHundredths(h, decimals) {
  if (decimals >= 2) return (h / 100).toFixed(2)
  const step = 10 ** (2 - decimals)
  const r = Math.floor((h + step / 2) / step)
  return (r / 10 ** decimals).toFixed(decimals)
}

/** County rows from the lakecountygis corpus text: "PIN …; acres …; owner …; sale amount …; sale date …". */
export function parseCountyRows(text) {
  const rows = new Map()
  for (const m of String(text ?? '').matchAll(/PIN (\d+); acres ([\d.]+); owner [^;]*; sale amount (\w+); sale date ([\w-]+)/g)) {
    rows.set(m[1], { acres: Number(m[2]), saleAmount: m[3] === 'none' ? null : Number(m[3]), saleDate: m[4] === 'none' ? null : m[4] })
  }
  return rows
}

/**
 * Recomputes one calculated value. parcels: Map pin → GeoJSON feature from the
 * snapshot; countyRows: optional Map pin → { acres, saleAmount, saleDate }.
 * Returns { ok, got, problems }.
 */
export function recompute(v, parcels, countyRows = null) {
  const problems = []
  const features = []
  for (const inp of v.inputs ?? []) {
    const f = parcels.get(inp.pin)
    if (!f) { problems.push(`${inp.pin}: not in the county parcel snapshot`); continue }
    const p = f.properties
    for (const k of ['acres', 'saleAmount', 'saleDate']) {
      if ((p[k] ?? null) !== (inp[k] ?? null)) problems.push(`${inp.pin}: stored ${k} ${inp[k]} but the snapshot has ${p[k]}`)
    }
    const row = countyRows?.get(inp.pin)
    if (countyRows && !row) problems.push(`${inp.pin}: not in the county rows the audit read`)
    if (row) for (const k of ['acres', 'saleAmount', 'saleDate']) {
      if ((row[k] ?? null) !== (inp[k] ?? null)) problems.push(`${inp.pin}: stored ${k} ${inp[k]} but the county record has ${row[k]}`)
    }
    features.push(f)
  }
  if (!v.inputs?.length) problems.push('no inputs stored')
  let got = null
  const inputs = v.inputs ?? []
  if (v.op === 'sum_acres') got = roundHundredths(inputs.reduce((s, i) => s + Math.round(i.acres * 100), 0), v.decimals ?? 1)
  else if (v.op === 'count') got = String(inputs.length)
  else if (v.op === 'sum_recordings') {
    const seen = new Map()
    for (const i of inputs) if (i.saleAmount != null) seen.set(`${i.saleDate}|${i.saleAmount}`, i.saleAmount)
    got = String([...seen.values()].reduce((a, b) => a + b, 0))
  } else if (v.op === 'outline_area') {
    if (features.length) {
      const dissolved = turf.dissolve(turf.featureCollection(features))
      if (dissolved.features.length !== 1) problems.push(`inputs form ${dissolved.features.length} separate blocks, not one`)
      got = (dissolved.features.reduce((s, f) => s + turf.area(f), 0) * ACRES_PER_SQM).toFixed(v.decimals ?? 1)
    }
  } else problems.push(`unknown op "${v.op}"`)
  if (got !== null && got !== normValue(v.value)) problems.push(`recomputed ${got}, printed ${v.value}`)
  return { ok: problems.length === 0, got, problems }
}

/**
 * Clears the guard's number failures for an entry's calculated values when
 * they check out. calculations: the src/data/calculations.js list; prose: the
 * entry's text; parcels: Map pin → snapshot feature; countyRowsOf(sourceKey).
 */
export function applyCalculations(entry, prose, failures, { calculations = [], parcels, countyRowsOf = () => null } = {}) {
  const calc = calculations.find(c => c.entry.date === entry.date && c.entry.title === entry.title)
  if (!calc) return { failures, applied: [], problems: [] }
  const labeled = String(prose).toLowerCase().includes(String(calc.label).toLowerCase())
  const countyRows = countyRowsOf(calc.source)
  const applied = [], problems = []
  if (!labeled) problems.push(`entry does not say "${calc.label}"`)
  const remaining = failures.filter(f => {
    if (f.check !== 'number') return true
    const v = calc.values.find(x => normValue(x.value) === normValue(f.value))
    if (!v) return true
    if (!labeled) { f.calc = `not labeled "${calc.label}"`; return true }
    const r = recompute(v, parcels, countyRows)
    if (r.ok) { applied.push({ value: v.value, op: v.op, inputs: v.inputs.length, what: v.what }); return false }
    f.calc = r.problems.join('; ')
    problems.push(`${v.value}: ${f.calc}`)
    return true
  })
  return { failures: remaining, applied, problems }
}
