// Tier 2 is per article: a named reporter, confirmed from the archived copy.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { confirmedByline, effectiveTier } from '../lib/score.mjs'
import { renderSourceEntry } from '../lib/render.mjs'
import { ROOT } from '../lib/config.mjs'
import { loadRegistry, lookup } from '../lib/registry.mjs'
import { sources } from '../../src/data/sources.js'

const confirmed = { byline: { name: 'Mick Zawislak', status: 'confirmed', archivedCopy: 'corpus/raw/x.html' } }
const unverified = { byline: { status: 'unverified', reason: 'no archived copy in private-info' } }

test('byline: only a confirmed named byline counts; an author string alone does not', () => {
  assert.equal(confirmedByline(confirmed), 'Mick Zawislak')
  assert.equal(confirmedByline(unverified), null)
  assert.equal(confirmedByline({ author: 'Mick Zawislak' }), null, 'an unchecked author field is not a confirmed byline')
  assert.equal(confirmedByline({ byline: { status: 'confirmed' } }), null, 'confirmed needs a name')
  assert.equal(confirmedByline(null), null)
})

test('byline: in drafting, a Tier 2 citation without a confirmed byline is treated as Tier 3', () => {
  assert.equal(effectiveTier(2, confirmedByline(confirmed)), 2)
  assert.equal(effectiveTier(2, confirmedByline(unverified)), 3)
  assert.equal(effectiveTier(2, confirmedByline({ author: 'Mick Zawislak' })), 3)
  assert.equal(effectiveTier(1, confirmedByline(unverified)), 1, 'the rule is for Tier 2 only')
})

test('byline: every Tier 2 citation on the site records a byline field, and confirmed ones name their archived copy', () => {
  const reg = loadRegistry()
  const t2 = Object.entries(sources).filter(([, s]) => [s.url, s.originalUrl, s.archiveUrl].some(u => u && lookup(reg, u).tier === 2))
  assert.ok(t2.length >= 8)
  for (const [key, s] of t2) {
    assert.ok(['confirmed', 'unverified'].includes(s.byline?.status), `${key} has a byline field`)
    if (s.byline.status === 'confirmed') {
      assert.ok(s.byline.name && /^corpus\/raw\//.test(s.byline.archivedCopy) && /^[0-9a-f]{64}$/.test(s.byline.sha256), `${key}: confirmed from an archived copy`)
    } else {
      assert.ok(s.byline.reason, `${key}: an unverified byline says why`)
      assert.equal(s.byline.name, undefined, `${key}: no guessed name`)
    }
  }
})

test('byline: the build labels a Tier 2 citation without a confirmed byline as Tier 3', async () => {
  execFileSync(process.execPath, [join(ROOT, 'scripts/build-source-tiers.js'), '--check'], { cwd: ROOT, stdio: 'pipe' })
  const { sourceTiers } = await import('../../src/data/sourceTiers.js')
  for (const [key, s] of Object.entries(sources)) {
    const t = sourceTiers[key]
    if (!t.byline) continue
    if (s.byline.status === 'confirmed') assert.equal(t.tier, 2, `${key} stays Tier 2`)
    else {
      assert.equal(t.tier, 3, `${key} drops to Tier 3`)
      assert.match(t.label, /^Tier 3 · news report \(byline unconfirmed\)$/)
    }
  }
  assert.equal(sourceTiers.dailyherald2026.tier, 3)
  assert.equal(sourceTiers.crains2024.tier, 2)
})

test('byline: a new citation drafted by the pipeline records its byline, not a hand-set tier', () => {
  const out = renderSourceEntry('dailyheraldX2026', { category: 'news', title: 'T', publisher: 'Daily Herald', date: 'Oct. 6, 2026', byline: { name: 'Mick Zawislak', status: 'confirmed', archivedCopy: 'shadow/raw/a.html' }, url: 'https://www.dailyherald.com/x' })
  assert.match(out, /byline: \{ name: "Mick Zawislak", status: "confirmed", archivedCopy: "shadow\/raw\/a\.html" \},/)
  assert.doesNotMatch(out, /\btier:/)
})
