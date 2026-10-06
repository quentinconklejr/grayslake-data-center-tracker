// The Updates log: every line complete, and every link a path on this site.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { updates } from '../../src/data/updates.js'

test('updates: every line has a date, kind, title, description and a site-relative link', () => {
  for (const u of updates) {
    const label = `${u.date} ${u.title}`
    assert.match(u.date, /^\d{4}-\d{2}-\d{2}$/, label)
    assert.ok(['added', 'corrected', 'removed'].includes(u.kind), label)
    assert.ok(u.title && u.description, label)
    if (u.link !== undefined) {
      // A local path (for example C:/Program Files/Git/timeline, which a shell
      // once produced from "/timeline") must never reach the page.
      assert.match(u.link, /^\/[a-z0-9/#-]*$/i, `${label}: link ${u.link}`)
      assert.ok(u.linkLabel, `${label}: link needs a label`)
    }
  }
})

test('updates: newest first', () => {
  for (let i = 1; i < updates.length; i++) assert.ok(updates[i - 1].date >= updates[i].date, `${updates[i - 1].date} before ${updates[i].date}`)
})
