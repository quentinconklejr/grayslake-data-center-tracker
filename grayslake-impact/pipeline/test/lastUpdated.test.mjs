// Site-wide "Last updated": computed from the Updates log, never typed by hand.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { lastUpdateDate, lastCorrectedDate, formatLongDate } from '../../src/lib/lastCorrected.js'
import { updates } from '../../src/data/updates.js'
import { LAST_UPDATED, LAST_UPDATED_ISO } from '../../src/data/siteConfig.js'
import { ROOT } from '../lib/config.mjs'

const MONTHS = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?'
const TYPED_DATE = new RegExp(`\\b(?:${MONTHS})\\.? \\d{1,2},? \\d{4}\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b|\\b\\d{1,2}/\\d{1,2}/\\d{2,4}\\b`)
// Comments may mention dates; code may not.
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const typedDates = src => [...code(src).matchAll(new RegExp(TYPED_DATE.source, 'g'))].map(m => m[0])

test('last updated: the newest dated line of any kind', () => {
  assert.equal(lastUpdateDate([
    { date: '2026-10-01', kind: 'corrected' },
    { date: '2026-11-02', kind: 'added' },
    { date: '2026-10-20', kind: 'removed' },
    { date: 'not a date', kind: 'added' },
  ]), '2026-11-02')
  assert.equal(lastCorrectedDate([{ date: '2026-11-02', kind: 'added' }, { date: '2026-10-01', kind: 'corrected' }]), '2026-10-01', 'the Methodology helper still counts corrections only')
  assert.equal(lastUpdateDate([]), null)
})

test('last updated: dates are written out the same in every time zone', () => {
  assert.equal(formatLongDate('2026-10-06'), 'October 6, 2026')
  assert.equal(formatLongDate('2027-01-01'), 'January 1, 2027')
  assert.equal(formatLongDate(null), '')
})

test('last updated: the site-wide date comes from the Updates log, not a fixed date', () => {
  const newest = updates.map(u => u.date).sort().pop()
  assert.equal(LAST_UPDATED_ISO, newest)
  assert.equal(LAST_UPDATED, formatLongDate(newest))
  assert.notEqual(LAST_UPDATED_ISO, '2026-09-27')
})

test('last updated: no date is typed into the footer or the site config', () => {
  const footer = readFileSync(join(ROOT, 'src/components/layout/Footer.jsx'), 'utf8')
  assert.deepEqual(typedDates(footer), [], 'the footer must not contain a typed date')
  assert.match(footer, /Last updated <span className="font-mono">\{LAST_UPDATED\}<\/span>/)
  const config = readFileSync(join(ROOT, 'src/data/siteConfig.js'), 'utf8')
  assert.deepEqual(typedDates(config), [], 'siteConfig.js must not contain a typed date')
  assert.match(config, /LAST_UPDATED_ISO = lastUpdateDate\(updates\)/)
})

test('last updated: the typed-date check catches the forms a hand-set date would take', () => {
  for (const s of ['Last verified Sep 27, 2026', "const d = 'October 6, 2026'", 'Last updated Oct. 6 2026', "'2026-10-06'", '10/6/2026'])
    assert.equal(typedDates(s).length, 1, s)
  assert.deepEqual(typedDates('// set on Sep 27, 2026\nconst x = LAST_UPDATED'), [], 'a date in a comment is fine')
})

test('last updated: nothing in the site still uses the old hand-set constant', () => {
  const files = []
  const walk = d => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(m?js|jsx)$/.test(f) && files.push(p) } }
  walk(join(ROOT, 'src')); walk(join(ROOT, 'scripts'))
  const users = files.filter(f => /\bLAST_VERIFIED\b/.test(readFileSync(f, 'utf8')))
  assert.deepEqual(users, [])
})
