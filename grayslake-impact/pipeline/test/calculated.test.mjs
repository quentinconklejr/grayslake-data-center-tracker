// Calculated values: figures the site computes from county parcel records.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as turf from '@turf/turf'
import { recompute, applyCalculations, parseCountyRows, ACRES_PER_SQM } from '../lib/calculated.mjs'

// Three parcels: two adjacent squares and one detached square.
const sq = (x, y, d, props) => turf.polygon([[[x, y], [x + d, y], [x + d, y + d], [x, y + d], [x, y]]], props)
const A = sq(-88.0, 42.3, 0.002, { pin: '1', acres: 44.67, saleAmount: 1000, saleDate: '2025-01-17' })
const B = sq(-87.998, 42.3, 0.002, { pin: '2', acres: 44.68, saleAmount: 1000, saleDate: '2025-01-17' })
const C = sq(-87.99, 42.3, 0.001, { pin: '3', acres: 10.0, saleAmount: null, saleDate: null })
const parcels = new Map([A, B, C].map(f => [f.properties.pin, f]))
const inp = f => ({ pin: f.properties.pin, acres: f.properties.acres, saleAmount: f.properties.saleAmount, saleDate: f.properties.saleDate })
const COUNTY = 'PIN 1; acres 44.67; owner T5; sale amount 1000; sale date 2025-01-17\nPIN 2; acres 44.68; owner T5; sale amount 1000; sale date 2025-01-17\nPIN 3; acres 10.0; owner T5; sale amount none; sale date none'
const rows = parseCountyRows(COUNTY)

const entry = { date: '2024-05-02', title: 'Land acquisition begins' }
const calcs = values => [{ entry, label: 'calculated from county parcel records', source: 'lakecountygis', values }]
const fail = value => ({ check: 'number', reason: 'number_not_in_source', value })
const ctx = values => ({ calculations: calcs(values), parcels, countyRowsOf: () => rows })
const LABELED = 'The following totals are calculated from county parcel records. They total 89.4 acres.'

test('calculated: county rows parse, with "none" as null', () => {
  assert.deepEqual(rows.get('3'), { acres: 10, saleAmount: null, saleDate: null })
  assert.equal(rows.get('1').saleAmount, 1000)
})

test('calculated: sums round half up without float drift (44.67 + 44.68 = 89.35 → 89.4)', () => {
  const r = recompute({ value: '89.4', op: 'sum_acres', decimals: 1, inputs: [inp(A), inp(B)] }, parcels, rows)
  assert.equal(r.got, '89.4')
  assert.ok(r.ok, r.problems.join('; '))
  const wrong = recompute({ value: '89.3', op: 'sum_acres', decimals: 1, inputs: [inp(A), inp(B)] }, parcels, rows)
  assert.equal(wrong.ok, false)
  assert.match(wrong.problems.join(), /recomputed 89\.4, printed 89\.3/)
})

test('calculated: recorded consideration counts each distinct sale once; count counts inputs', () => {
  assert.equal(recompute({ value: '1,000', op: 'sum_recordings', inputs: [inp(A), inp(B)] }, parcels, rows).ok, true)
  assert.equal(recompute({ value: '3', op: 'count', inputs: [inp(A), inp(B), inp(C)] }, parcels, rows).ok, true)
})

test('calculated: outline area is the dissolved boundary area, and the inputs must form one block', () => {
  const area = (turf.area(turf.dissolve(turf.featureCollection([A, B])).features[0]) * ACRES_PER_SQM).toFixed(1)
  assert.equal(recompute({ value: area, op: 'outline_area', decimals: 1, inputs: [inp(A), inp(B)] }, parcels, rows).ok, true)
  const split = recompute({ value: area, op: 'outline_area', decimals: 1, inputs: [inp(A), inp(C)] }, parcels, rows)
  assert.match(split.problems.join(), /2 separate blocks/)
})

test('calculated: a labeled entry passes only when the recomputed numbers match', () => {
  const r = applyCalculations(entry, LABELED, [fail('89.4'), fail('12')], ctx([{ value: '89.4', op: 'sum_acres', decimals: 1, inputs: [inp(A), inp(B)] }]))
  assert.deepEqual(r.failures.map(f => f.value), ['12'], 'a number with no stored calculation still fails')
  assert.equal(r.applied[0].value, '89.4')
  const wrong = applyCalculations(entry, LABELED.replace('89.4', '89.3'), [fail('89.3')], ctx([{ value: '89.3', op: 'sum_acres', decimals: 1, inputs: [inp(A), inp(B)] }]))
  assert.equal(wrong.failures.length, 1)
  assert.match(wrong.failures[0].calc, /recomputed 89\.4/)
})

test('calculated: without the label the figure is not accepted', () => {
  const r = applyCalculations(entry, 'They total 89.4 acres.', [fail('89.4')], ctx([{ value: '89.4', op: 'sum_acres', decimals: 1, inputs: [inp(A), inp(B)] }]))
  assert.equal(r.failures.length, 1)
  assert.match(r.problems[0], /does not say "calculated from county parcel records"/)
})

test('calculated: a stored input that differs from the snapshot or the county record is rejected', () => {
  const doctored = { ...inp(A), acres: 45.0 }
  const r = applyCalculations(entry, LABELED, [fail('89.7')], ctx([{ value: '89.7', op: 'sum_acres', decimals: 1, inputs: [doctored, inp(B)] }]))
  assert.equal(r.failures.length, 1)
  assert.match(r.failures[0].calc, /stored acres 45 but the snapshot has 44\.67/)
  assert.match(r.failures[0].calc, /but the county record has 44\.67/)
  const missing = recompute({ value: '1', op: 'count', inputs: [{ pin: '9', acres: 1, saleAmount: null, saleDate: null }] }, parcels, rows)
  assert.match(missing.problems.join(), /not in the county parcel snapshot/)
})

test('calculated: an entry with no stored calculations is left alone', () => {
  const other = { date: '2026-01-01', title: 'Other' }
  const r = applyCalculations(other, LABELED, [fail('89.4')], ctx([]))
  assert.equal(r.failures.length, 1)
  assert.deepEqual(r.applied, [])
})

test('calculated: a two-decimal sum keeps its trailing zero (county figures as recorded)', () => {
  const r = recompute({ value: '89.35', op: 'sum_acres', decimals: 2, inputs: [inp(A), inp(B)] }, parcels, rows)
  assert.equal(r.got, '89.35')
  const D = sq(-87.98, 42.3, 0.001, { pin: '4', acres: 45.33, saleAmount: null, saleDate: null })
  const p2 = new Map([...parcels, ['4', D]])
  const t = recompute({ value: '90.00', op: 'sum_acres', decimals: 2, inputs: [inp(A), inp(D)] }, p2, null)
  assert.equal(t.got, '90.00')
  assert.ok(t.ok, t.problems.join('; '))
})

test('calculated: every figure stored in src/data/calculations.js recomputes from the county snapshot', async () => {
  const { readFileSync } = await import('node:fs')
  const { calculations } = await import('../../src/data/calculations.js')
  const snapshot = new Map(JSON.parse(readFileSync(new URL('../../src/data/parcels.geojson', import.meta.url), 'utf8')).features.map(f => [f.properties.pin, f]))
  const { timelineEvents } = await import('../../src/data/timeline.js')
  for (const c of calculations) {
    const entry = timelineEvents.find(e => e.date === c.entry.date && e.title === c.entry.title)
    assert.ok(entry, `entry ${c.entry.title} exists`)
    assert.ok(entry.description.includes(c.label), 'the entry carries the label')
    for (const v of c.values) {
      const r = recompute(v, snapshot)
      assert.ok(r.ok, `${v.value}: ${r.problems.join('; ')}`)
      assert.ok(entry.description.includes(v.value), `${v.value} is printed in the entry`)
    }
  }
  const land = calculations.find(c => c.entry.title === 'Land acquisition begins')
  assert.equal(land.values.find(v => v.value === '135.10').inputs.length, 50)
  assert.equal(land.values.find(v => v.value === '134.9').op, 'outline_area')
})
