// This site's own dated observations in the owner's timeline entries.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { siteObservations, applySiteObservations } from '../lib/observations.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { prepareSource, checkDraftProse } from '../lib/guard.mjs'
import { timelineEvents } from '../../src/data/timeline.js'

const gcfg = guardConfig(loadRubric())
const FAQ = 'Updated as of June 5, 2026 Approved T5 Data Center Campus FAQ’s NOTE: UNFORTUNATELY DUE TO NOTICE OF IMPENDING LITIGATION, AND UPON ADVICE OF COUNSEL, THE VILLAGE CANNOT AT THIS TIME OFFER FURTHER RESPONSES.'
const dateFailures = prose => checkDraftProse(prose, gcfg, { evidence: [prepareSource(FAQ, gcfg)] }).failures.filter(f => f.check === 'date')

test('observations: a date stated as this site’s own observation passes', () => {
  const prose = 'The FAQ was updated as of June 5, 2026. As of August 5, 2026, this site could not reach the FAQ page on the Village website.'
  const failures = dateFailures(prose)
  assert.deepEqual(failures.map(f => f.value), ['August 5, 2026'], 'the guard alone cannot find the date in a source')
  const r = applySiteObservations(prose, failures)
  assert.deepEqual(r.failures, [])
  assert.equal(r.accepted[0].date, 'August 5, 2026')
  assert.match(r.accepted[0].sentence, /^As of August 5, 2026, this site could not reach/)
})

test('observations: the same date stated as plain fact still fails', () => {
  for (const prose of [
    'The FAQ document itself became unreachable by August 5, 2026.',
    'As of August 5, 2026, the FAQ page could not be reached.',
    'This site could not reach the FAQ page as of August 5, 2026.',
    'As of August 5, 2026, the Village said this site could not reach it.',
  ]) {
    const r = applySiteObservations(prose, dateFailures(prose))
    assert.equal(r.failures.length, 1, prose)
    assert.deepEqual(r.accepted, [], prose)
  }
})

test('observations: only the observation’s own date is accepted, not another date in the entry', () => {
  const prose = 'The Village posted the notice on July 9, 2026. As of August 5, 2026, this site could not reach the FAQ page on the Village website.'
  const r = applySiteObservations(prose, dateFailures(prose))
  assert.deepEqual(r.failures.map(f => f.value), ['July 9, 2026'])
  assert.equal(siteObservations(prose).length, 1)
})

test('observations: the Village FAQ entry states the August 5 date as this site’s observation', () => {
  const e = timelineEvents.find(x => x.title === 'Village FAQ updated, litigation notice added')
  assert.ok(e)
  assert.match(e.description, /As of August 5, 2026, this site could not reach the FAQ page on the Village website\./)
  assert.doesNotMatch(e.description, /became unreachable/)
  assert.equal(siteObservations(e.description)[0].date, 'August 5, 2026')
})

test('observations: drafting does not use site observations', () => {
  const draft = readFileSync(new URL('../lib/draft.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(draft, /observations\.mjs|applySiteObservations/)
})
