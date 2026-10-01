// Guard overrides (config/guard-overrides.yaml).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadOverrides, applyOverrides } from '../lib/overrides.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { prepareSource, checkDraftProse } from '../lib/guard.mjs'
import { timelineEvents } from '../../src/data/timeline.js'

const gcfg = guardConfig(loadRubric())
const overrides = loadOverrides()
const lawsuit = timelineEvents.find(e => e.title === 'Lawsuit filed in Lake County Circuit Court')
// The complaint's caption as its PDF text layer reads.
const CAPTION = 'Defendants.\n\n)\n\nCase No. _2__0_2_6__C__H_0__0_0__0_0__1_7_1\n\nCOMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF'

test('overrides: the lawsuit case number override is recorded with its reason and matches a real entry', () => {
  const o = overrides.find(x => x.value === '2026CH00000171')
  assert.ok(o, 'override present')
  assert.equal(o.check, 'identifier')
  assert.equal(o.source, 'complaint2026')
  assert.match(o.reason, /underscored blank/)
  assert.ok(lawsuit, 'the timeline entry it names exists')
  assert.equal(o.entry.date, lawsuit.date)
})

test('overrides: the guard fails the case number on the raw text; the override clears it while the passage is in the source', () => {
  const prose = `${lawsuit.title}. ${lawsuit.description}`
  const res = checkDraftProse(prose, gcfg, { evidence: [prepareSource(CAPTION, gcfg)] })
  assert.ok(res.failures.some(f => f.check === 'identifier' && f.value === '2026CH00000171'), 'the guard alone cannot match it')
  const ov = applyOverrides(lawsuit, res.failures, k => (k === 'complaint2026' ? CAPTION : null), overrides)
  assert.ok(!ov.failures.some(f => f.check === 'identifier' && f.value === '2026CH00000171'))
  assert.equal(ov.applied.length, 1)
  assert.match(ov.applied[0].reason, /underscored blank/)
  assert.deepEqual(ov.stale, [])
})

test('overrides: an override whose passage is gone from the source is stale, and the failure stands', () => {
  const failures = [{ check: 'identifier', reason: 'identifier_not_in_source', value: '2026CH00000171' }]
  const ov = applyOverrides(lawsuit, failures, () => 'Case No. 2026CH00000999', overrides)
  assert.equal(ov.failures.length, 1)
  assert.equal(ov.stale[0].why, 'passage not in the source text')
})

test('overrides: a passage that does not contain the value does not clear it', () => {
  const o = [{ ...overrides.find(x => x.value === '2026CH00000171'), value: '2026CH00000172' }]
  const failures = [{ check: 'identifier', reason: 'identifier_not_in_source', value: '2026CH00000172' }]
  const ov = applyOverrides(lawsuit, failures, () => CAPTION, o)
  assert.equal(ov.failures.length, 1)
  assert.equal(ov.stale[0].why, 'passage does not contain the value')
})

test('overrides: an override applies only to the entry, check and value it names', () => {
  const other = { ...lawsuit, title: 'Some other entry' }
  const failures = [{ check: 'identifier', reason: 'identifier_not_in_source', value: '2026CH00000171' }]
  assert.equal(applyOverrides(other, failures, () => CAPTION, overrides).failures.length, 1)
  const numberFailure = [{ check: 'number', reason: 'number_not_in_source', value: '2026CH00000171' }]
  assert.equal(applyOverrides(lawsuit, numberFailure, () => CAPTION, overrides).failures.length, 1)
})
