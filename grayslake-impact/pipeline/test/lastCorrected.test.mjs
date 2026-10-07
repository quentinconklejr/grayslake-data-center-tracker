// "Last updated" on the Methodology page: the date of the most recent correction.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { lastCorrectedDate } from '../../src/lib/lastCorrected.js'
import { updates } from '../../src/data/updates.js'

test('last updated: the latest corrected line wins, whatever the order', () => {
  assert.equal(lastCorrectedDate([
    { date: '2026-09-15', kind: 'corrected' },
    { date: '2026-10-06', kind: 'corrected' },
    { date: '2026-10-01', kind: 'corrected' },
  ]), '2026-10-06')
})

test('last updated: added and removed lines do not count', () => {
  assert.equal(lastCorrectedDate([
    { date: '2026-11-01', kind: 'added' },
    { date: '2026-11-02', kind: 'removed' },
    { date: '2026-10-06', kind: 'corrected' },
  ]), '2026-10-06')
  assert.equal(lastCorrectedDate([{ date: '2026-11-01', kind: 'added' }]), null)
  assert.equal(lastCorrectedDate([]), null)
})

test('last updated: the real log gives the newest corrected date, not a fixed date', () => {
  const expected = updates.filter(u => u.kind === 'corrected').map(u => u.date).sort().pop()
  assert.equal(lastCorrectedDate(updates), expected)
  assert.notEqual(lastCorrectedDate(updates), '2026-09-27')
})

test('last updated: the Methodology page computes it and no longer shows Last verified', () => {
  const page = readFileSync(new URL('../../src/pages/Methodology.jsx', import.meta.url), 'utf8')
  assert.match(page, /lastCorrectedDate\(updates\)/)
  assert.match(page, /Last updated/)
  assert.doesNotMatch(page, /Last verified|LAST_VERIFIED/)
})
