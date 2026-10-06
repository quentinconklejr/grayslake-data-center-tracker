// Stage B tests: parsers, dedupe, Wayback handling and the shadow-mode runner.
// No network: every HTTP call is a stub. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseAgendasPage } from '../lib/fetchers/village-agendas.mjs'
import { parseRss } from '../lib/fetchers/village-newsflash.mjs'
import villageYoutube, { parseAtom } from '../lib/fetchers/village-youtube.mjs'
import { parseBillStatus } from '../lib/fetchers/ilga-bills.mjs'
import legistar, { matterToCandidate } from '../lib/fetchers/legistar.mjs'
import { dateFromSlug, StructureError, SourceUnavailable } from '../lib/fetchers/common.mjs'
import { canonicalUrl, contentHash, minhash, similarity, classify, remember, emptyIndex, citedUrlSet, sha256 } from '../lib/dedupe.mjs'
import { makeWayback } from '../lib/wayback.mjs'
import { runFetchers } from '../lib/runner.mjs'
import { openStore } from '../lib/store.mjs'
import { loadRegistry } from '../lib/registry.mjs'
import { loadPipelineConfig } from '../lib/config.mjs'
import { takeWarnings } from '../lib/log.mjs'

const quietly = async fn => { const w = console.warn; console.warn = () => {}; try { return await fn() } finally { console.warn = w; takeWarnings() } }
const ok = (body, contentType = 'text/html') => ({ ok: true, status: 200, bytes: Buffer.from(body), contentType, finalUrl: '' })
const notFound = () => ({ ok: false, status: 404, bytes: Buffer.alloc(0), contentType: '' })

// --- parsers ---------------------------------------------------------------------

test('agendas page: one candidate per DocumentCenter id, label from the visible link', () => {
  const html = `<html><body>
    <a href="/DocumentCenter/View/16140/VB-Agenda-Brief-2026-09-15-FINAL" aria-hidden="true"></a>
    <a href="/DocumentCenter/View/16140/VB-Agenda-Brief-2026-09-15-FINAL">September 15, 2026 (PDF) Opens in new window</a>
    <a href="/DocumentCenter/View/16138/Signed-April-16-2026-Regular-Minutes">April 16</a>
    <a href="/DocumentCenter/View/12466/04-10-2023-PCZBA-Agenda">x</a>
    <a href="/6/Agendas-Minutes">not a document</a></body></html>`
  const links = parseAgendasPage(html)
  assert.deepEqual(links.map(l => l.id), ['16140', '16138', '12466'])
  assert.equal(links[0].label, 'September 15, 2026 (PDF)')
})

test('dates are read from DocumentCenter slugs in the forms the Village uses', () => {
  assert.equal(dateFromSlug('VB-Agenda-Brief-2026-09-15-FINAL'), '2026-09-15')
  assert.equal(dateFromSlug('04-10-2023-PCZBA-Agenda'), '2023-04-10')
  assert.equal(dateFromSlug('Signed-April-16-2026-Regular-Minutes'), '2026-04-16')
  assert.equal(dateFromSlug('Pension-July-2026'), null, 'month and year alone is not a date')
})

test('News Flash RSS parses items; a non-RSS document is a structure error', () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>Village of Grayslake - News Flash</title>
    <item><title>Village of Grayslake Press Release 9/1</title><link>https://www.villageofgrayslake.com/DocumentCenter/View/16100/PR</link>
    <pubDate>Tue, 01 Sep 2026 10:00:00 -0600</pubDate><guid isPermaLink="false">g1</guid><description>d</description></item></channel></rss>`
  const items = parseRss(xml)
  assert.equal(items.length, 1)
  assert.equal(items[0].guid, 'g1')
  assert.throws(() => parseRss('<html><body>Maintenance</body></html>'), StructureError)
})

test('YouTube Atom feed parses video ids, titles and descriptions', () => {
  const xml = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
    <entry><yt:videoId>abc123</yt:videoId><title>Village Board Meeting</title><published>2026-09-16T00:30:00+00:00</published>
    <media:group><media:description>Regular meeting</media:description></media:group></entry></feed>`
  assert.deepEqual(parseAtom(xml), [{ videoId: 'abc123', title: 'Village Board Meeting', published: '2026-09-16T00:30:00+00:00', description: 'Regular meeting' }])
})

test('YouTube: a 404 feed with no API key is "source unavailable", not "nothing new"', async () => {
  const ctx = { http: async () => notFound(), env: {} }
  await assert.rejects(villageYoutube.discover(ctx), SourceUnavailable)
})

test('YouTube: falls back to the Data API when a key is set; tier comes from the channel feed', async () => {
  const api = JSON.stringify({ items: [{ snippet: { title: 'Plan Commission', publishedAt: '2026-09-20T00:00:00Z', description: '', resourceId: { videoId: 'v9' } } }] })
  const ctx = { http: async url => (url.includes('googleapis') ? ok(api, 'application/json') : notFound()), env: { YOUTUBE_API_KEY: 'k' } }
  const r = await villageYoutube.discover(ctx)
  assert.equal(r.via, 'data-api')
  assert.equal(r.candidates[0].url, 'https://www.youtube.com/watch?v=v9')
  assert.equal(loadRegistry() && (await import('../lib/registry.mjs')).lookup(loadRegistry(), r.candidates[0].tierUrl).tier, 1)
  const item = await villageYoutube.fetchItem(ctx, r.candidates[0])
  assert.match(item.needsHumanReview, /not verbatim evidence/)
})

test('ilga Bill Status: every dated Actions row becomes a record', () => {
  const html = `<html><body><div><h2 class="h5">Actions</h2><table><thead><tr><th>Date</th><th>Chamber</th><th>Action</th></tr></thead><tbody>
    <tr><td>2/06/2026 </td><td>House </td><td>Filed with the Clerk by <a href="#">Rep. Robyn Gabel</a></td></tr>
    <tr><td>3/27/2026</td><td>House</td><td>Rule 19(a) / Re-referred to Rules Committee</td></tr>
    </tbody></table></div></body></html>`
  const { rows } = parseBillStatus(html, 'https://www.ilga.gov/x')
  assert.deepEqual(rows[1], { date: '3/27/2026', chamber: 'House', action: 'Rule 19(a) / Re-referred to Rules Committee' })
  assert.equal(rows[0].action, 'Filed with the Clerk by Rep. Robyn Gabel')
  assert.throws(() => parseBillStatus('<html><body><h2>Summary</h2></body></html>', 'https://www.ilga.gov/x'), StructureError)
})

test('Legistar: a matter maps to its public detail page, and a second version is an update', () => {
  const m = { MatterId: 33971, MatterGuid: 'G', MatterLastModifiedUtc: '2026-09-30T19:06:20.157', MatterFile: '26-1213', MatterName: 'ZON-001209-2026', MatterTitle: 't', MatterTypeName: 'Ordinance', MatterStatusName: 'Agenda Ready', MatterBodyName: 'Lake County Board' }
  const c = matterToCandidate(m)
  assert.equal(c.url, 'https://lakecounty.legistar.com/LegislationDetail.aspx?ID=33971&GUID=G')
  assert.equal(c.key, '33971@2026-09-30T19:06:20.157')
  const state = {}
  assert.equal(legistar.isUpdate(state, c), false)
  legistar.onNewItem(state, c)
  assert.equal(legistar.isUpdate(state, matterToCandidate({ ...m, MatterLastModifiedUtc: '2026-10-02T00:00:00' })), true)
})

// --- dedupe ----------------------------------------------------------------------------

test('canonical URLs drop tracking, fragments, www., trailing slash, and unwrap Wayback', () => {
  assert.equal(canonicalUrl('http://www.Example.com/a/?utm_source=x&b=2&a=1#top'), 'https://example.com/a?a=1&b=2')
  assert.equal(canonicalUrl('https://web.archive.org/web/20260927075454/https://www.lakemchenryscanner.com/2026/09/08/x/'), 'https://lakemchenryscanner.com/2026/09/08/x')
})

test('content hash ignores whitespace, case and punctuation, nothing else', () => {
  assert.equal(contentHash('The Board  voted 6-0.'), contentHash('the board voted 6 0'))
  assert.notEqual(contentHash('The Board voted 6-0.'), contentHash('The Board voted 5-0.'))
})

test('near-duplicates are flagged; unrelated text is not', () => {
  const base = 'The Lake County Board approved an ordinance establishing a moratorium on new data center approvals in unincorporated Lake County, effective immediately and set to expire May 11, 2027, or earlier if regulations are adopted. '.repeat(2)
  const edited = base.replace('effective immediately', 'which took effect immediately')
  const other = 'Grayslake residents gathered at the University Center to discuss property taxes, school funding, water service and road repairs for the coming fiscal year, with several trustees answering questions. '.repeat(2)
  assert.ok(similarity(minhash(base), minhash(edited)) >= 0.8)
  assert.ok(similarity(minhash(base), minhash(other)) < 0.3)
  const index = emptyIndex()
  const a = classify(index, { url: 'https://a.example/1', text: base })
  remember(index, 'item-a', a)
  assert.equal(classify(index, { url: 'https://b.example/2', text: edited }).nearDuplicateOf, 'item-a')
  assert.equal(classify(index, { url: 'https://a.example/1/', text: 'x' }).duplicateOf, 'item-a', 'same URL')
  assert.equal(classify(index, { url: 'https://c.example/3', text: base }).duplicateOf, 'item-a', 'same content at a new URL')
})

test('URLs the site already cites are recognised', () => {
  const cited = citedUrlSet({ s: { url: 'https://www.dailyherald.com/a/', archiveUrl: 'https://web.archive.org/web/2026/https://x.example/y' }, local: { url: '/docs/x.pdf' } })
  assert.ok(cited.has('https://dailyherald.com/a'))
  assert.ok(cited.has('https://x.example/y'))
  assert.equal(classify(emptyIndex(), { url: 'https://dailyherald.com/a?utm_source=t', text: '' }, cited).alreadyCited, true)
})

// --- Wayback -----------------------------------------------------------------------------

test('Wayback anonymous capture reads the snapshot timestamp from Content-Location', async () => {
  const fetchImpl = async () => ({ status: 302, headers: new Headers({ 'content-location': '/web/20261001120000/https://www.villageofgrayslake.com/DocumentCenter/View/1' }) })
  const wb = makeWayback({ politeFetch: async () => notFound(), fetchImpl, env: {}, userAgent: 'test' })
  const r = await wb.capture('https://www.villageofgrayslake.com/DocumentCenter/View/1')
  assert.equal(r.ok, true)
  assert.equal(r.snapshotUrl, 'https://web.archive.org/web/20261001120000/https://www.villageofgrayslake.com/DocumentCenter/View/1')
  const limited = makeWayback({ politeFetch: async () => notFound(), fetchImpl: async () => ({ status: 429, headers: new Headers() }), env: {}, userAgent: 't' })
  assert.match((await limited.capture('https://x.example')).error, /rate limited/)
})

test('Wayback SPN2 is used when keys are present, and polls until success', async () => {
  const calls = []
  const fetchImpl = async (url, opts = {}) => {
    calls.push([url, opts.method ?? 'GET', opts.headers?.Authorization])
    if (url.endsWith('/save')) return { ok: true, status: 200, json: async () => ({ job_id: 'j1' }) }
    return { ok: true, status: 200, json: async () => ({ status: 'success', timestamp: '20261001120000', original_url: 'https://x.example/doc' }) }
  }
  const wb = makeWayback({ politeFetch: async () => notFound(), fetchImpl, env: { IA_S3_ACCESS: 'a', IA_S3_SECRET: 's' }, pollMs: 1, userAgent: 't' })
  assert.equal(wb.authed, true)
  const r = await wb.capture('https://x.example/doc')
  assert.equal(r.snapshotUrl, 'https://web.archive.org/web/20261001120000/https://x.example/doc')
  assert.equal(calls[0][2], 'LOW a:s')
})

test('a snapshot is verified only if its bytes or extracted text match what was fetched', async () => {
  const bytes = Buffer.from('%PDF-1.4 the document')
  const wb = makeWayback({ politeFetch: async () => ok(bytes, 'application/pdf'), env: {}, userAgent: 't' })
  assert.deepEqual(await wb.verify('https://web.archive.org/web/1/x', { rawSha256: sha256(bytes) }), { verified: true, result: 'identical-bytes' })
  const other = makeWayback({ politeFetch: async () => ok('<html><body>Page not found</body></html>'), env: {}, userAgent: 't' })
  const v = await other.verify('https://web.archive.org/web/1/x', { rawSha256: 'nope', textHash: contentHash('the real text'), toText: b => b.toString() })
  assert.equal(v.verified, false)
})

// --- runner ---------------------------------------------------------------------------------

function tempStore() {
  const dir = mkdtempSync(join(tmpdir(), 'store-'))
  mkdirSync(join(dir, '.git'))
  return openStore(dir)
}

function fakeFetcher(name, cands, { snapshot = 'always', fail } = {}) {
  return {
    name, snapshot, sourceUrl: 'https://www.villageofgrayslake.com/',
    async discover() { if (fail) throw fail; return { candidates: cands() } },
    async fetchItem(ctx, c) { return { kind: 'record', text: c.text } },
  }
}

const cfg = loadPipelineConfig()
const registry = loadRegistry()
const NOW = new Date('2026-10-01T12:00:00Z')

test('runner: first run baselines the backlog, processes recent items, and writes only to the store', async () => {
  const store = tempStore()
  const cands = () => [
    { key: 'old', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/100', title: 'old', published: '2025-01-01', text: 'an old document from last year about something' },
    { key: 'undated', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/101', title: 'undated', published: null, text: 'undated' },
    { key: 'new', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/200', title: 'new', published: '2026-09-28', text: 'a new agenda about the T5 data center campus' },
  ]
  const wb = { capture: async url => ({ ok: true, snapshotUrl: `https://web.archive.org/web/20261001000000/${url}`, mode: 'test' }), verify: async () => ({ verified: true, result: 'identical-text' }) }
  const run = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f1', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  const s = run.fetchers.f1
  assert.equal(s.baselined, 2)
  assert.equal(s.new, 1)
  const days = readdirSync(store.path('shadow/items'))
  const item = store.readJson(`shadow/items/${days[0]}/f1/new.json`)
  assert.equal(item.tier, 1, 'tier from the registry: villageofgrayslake.com')
  assert.equal(item.snapshot.verified, true)
  assert.equal(run.mode, 'shadow')

  // Second run: nothing new; a newly appeared old-dated item is processed, not baselined.
  const run2 = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f1', () => [...cands(), { key: 'late', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/150', title: 'late', published: '2024-01-01', text: 'a document posted late with an old date in its name' }])], store, cfg, registry, sources: {}, http: null, wayback: wb, now: new Date('2026-10-01T14:00:00Z') }))
  assert.equal(run2.fetchers.f1.alreadySeen, 3)
  assert.equal(run2.fetchers.f1.new, 1)
})

test('runner: an unlisted domain is Tier 4, and a document already stored elsewhere is a duplicate', async () => {
  const store = tempStore()
  const text = 'identical content posted twice at two different addresses on the web, long enough to fingerprint: the Village Board approved the agenda, heard public comment on the campus, and adjourned at nine in the evening after a long meeting'
  const cands = () => [
    { key: 'a', url: 'https://some-blog.example/post', title: 'a', published: '2026-09-30', text },
    { key: 'b', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/9', title: 'b', published: '2026-09-30', text },
  ]
  const run = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f2', cands, { snapshot: 'after_triage' })], store, cfg, registry, sources: {}, http: null, wayback: null, now: NOW }))
  const items = run.fetchers.f2.items
  assert.equal(items[0].tier, 4)
  assert.equal(items[1].duplicateOf, items[0].id)
  assert.equal(run.fetchers.f2.duplicates, 1)
})

test('runner: a failing fetcher records consecutive failures and raises a health alert at three', async () => {
  const store = tempStore()
  const broken = fakeFetcher('f3', () => [], { fail: new StructureError('page changed') })
  let run
  for (let i = 0; i < 3; i++) run = await quietly(() => runFetchers({ fetchers: [broken], store, cfg, registry, sources: {}, http: null, wayback: null, now: NOW }))
  assert.match(run.fetchers.f3.error, /structure changed/)
  assert.match(run.fetchers.f3.healthAlert, /failed 3 runs in a row/)
})

test('runner: failed captures stay queued and are retried, then given up after three attempts', async () => {
  const store = tempStore()
  const cands = () => [{ key: 'x', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/7', title: 'x', published: '2026-09-30', text: 'a document' }]
  const wb = { capture: async () => ({ ok: false, error: 'anonymous save HTTP 429 (rate limited)' }), verify: async () => ({}) }
  for (let i = 0; i < 3; i++) await quietly(() => runFetchers({ fetchers: [fakeFetcher('f4', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  const q = store.readJson('state/snapshot-queue.json')
  assert.equal(q.length, 1)
  assert.equal(q[0].attempts, 3)
  assert.equal(q[0].status, 'failed')
})

test('runner: nothing is written inside the site repository', () => {
  assert.equal(existsSync(join(process.cwd(), 'shadow')), false)
  assert.equal(existsSync(join(process.cwd(), 'state')), false)
})

test('runner: a capture not served yet is verified on a later run, not rejected', async () => {
  const store = tempStore()
  const cands = () => [{ key: 'y', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/8', title: 'y', published: '2026-09-30', text: 'a document' }]
  let served = false
  const wb = {
    capture: async url => ({ ok: true, snapshotUrl: `https://web.archive.org/web/20261001000000/${url}`, mode: 'test' }),
    verify: async () => (served ? { verified: true, result: 'identical-bytes' } : { verified: false, retryable: true, result: 'snapshot not served yet (HTTP 404)' }),
  }
  const r1 = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f5', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  assert.match(r1.snapshots[0].verification, /^pending/)
  assert.equal(store.readJson('state/snapshot-queue.json')[0].status, 'verify-pending')
  served = true
  const r2 = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f5', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  assert.equal(r2.snapshots[0].verified, true)
  assert.equal(store.readJson('state/snapshot-queue.json')[0].status, 'done')
})

test('runner: a snapshot whose content differs is rejected, not retried', async () => {
  const store = tempStore()
  const cands = () => [{ key: 'z', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/9', title: 'z', published: '2026-09-30', text: 'a document' }]
  const wb = { capture: async url => ({ ok: true, snapshotUrl: `https://web.archive.org/web/1/${url}`, mode: 'test' }), verify: async () => ({ verified: false, result: 'content differs from what the pipeline fetched' }) }
  await quietly(() => runFetchers({ fetchers: [fakeFetcher('f6', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  assert.equal(store.readJson('state/snapshot-queue.json')[0].status, 'unverified')
})

test('ilga: identical action rows on the same day get distinct keys', async () => {
  const { default: ilga } = await import('../lib/fetchers/ilga-bills.mjs')
  const row = '<tr><td>3/27/2026</td><td>House</td><td>Added Co-Sponsor Rep. A</td></tr>'
  const html = `<html><body><div><h2>Actions</h2><table><tbody>${row}${row}</tbody></table></div></body></html>`
  const ctx = { http: async () => ({ ok: true, status: 200, bytes: Buffer.from(html) }), cfg: { fetchers: { ilga: { bills: [{ type: 'HB', number: 1, gaid: 18, session: 114 }] } } } }
  const { candidates } = await ilga.discover(ctx)
  assert.equal(new Set(candidates.map(c => c.key)).size, 2)
})

test('wayback: a page-level snapshot verifies when it contains the expected text', async () => {
  const page = '<html><body><table><tr><td>3/27/2026</td><td>House</td><td>Rule 19(a) /  Re-referred to Rules Committee</td></tr></table></body></html>'
  const wb = makeWayback({ politeFetch: async () => ok(page), env: {}, userAgent: 't' })
  const toText = b => b.toString().replace(/<[^>]+>/g, ' ')
  assert.equal((await wb.verify('https://web.archive.org/web/1/x', { mustContain: 'Rule 19(a) / Re-referred to Rules Committee', toText })).verified, true)
  assert.equal((await wb.verify('https://web.archive.org/web/1/x', { mustContain: 'Passed Both Houses', toText })).verified, false)
})

test('runner: a capture the archive never stores is taken again, then given up', async () => {
  const store = tempStore()
  const cands = () => [{ key: 'n', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/10', title: 'n', published: '2026-09-30', text: 'a document' }]
  let captures = 0
  const wb = { capture: async url => { captures++; return { ok: true, snapshotUrl: `https://web.archive.org/web/1/${url}`, mode: 'test' } }, verify: async () => ({ verified: false, retryable: true, result: 'snapshot not served yet (HTTP 404)' }) }
  for (let i = 0; i < 8; i++) await quietly(() => runFetchers({ fetchers: [fakeFetcher('f7', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  assert.equal(captures, 3)
  assert.equal(store.readJson('state/snapshot-queue.json')[0].status, 'failed')
})

test('runner: a retake is not captured in the same run that found the capture missing', async () => {
  const store = tempStore()
  const cands = () => [{ key: 'r', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/11', title: 'r', published: '2026-09-30', text: 'a document' }]
  let captures = 0
  const wb = { capture: async url => { captures++; return { ok: true, snapshotUrl: `https://web.archive.org/web/1/${url}`, mode: 'test' } }, verify: async () => ({ verified: false, retryable: true, result: 'snapshot not served yet (HTTP 404)' }) }
  const run = () => quietly(() => runFetchers({ fetchers: [fakeFetcher('f8', cands)], store, cfg, registry, sources: {}, http: null, wayback: wb, now: NOW }))
  await run()
  assert.equal(captures, 1, 'run 1 captures and finds it not yet served')
  await run()
  assert.equal(captures, 1, 'run 2 finds it still missing and marks it for a retake, without recapturing')
  await run()
  assert.equal(captures, 2, 'run 3 retakes it')
})

test('runner: backfill fetches the items a first run baselined, and nothing already processed', async () => {
  const store = tempStore()
  const cands = () => [
    { key: 'old', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/300', title: 'old', published: '2025-01-01', text: 'an old agenda' },
    { key: 'new', url: 'https://www.villageofgrayslake.com/DocumentCenter/View/301', title: 'new', published: '2026-09-30', text: 'a new agenda' },
  ]
  await quietly(() => runFetchers({ fetchers: [fakeFetcher('f9', cands, { snapshot: 'never' })], store, cfg, registry, sources: {}, http: null, wayback: null, now: NOW }))
  const r = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f9', cands, { snapshot: 'never' })], store, cfg, registry, sources: {}, http: null, wayback: null, now: NOW, backfill: true }))
  assert.equal(r.fetchers.f9.backfilled, 1)
  assert.equal(r.fetchers.f9.new, 1)
  assert.equal(r.fetchers.f9.alreadySeen, 1, 'the item processed on the first run is not refetched')
  const again = await quietly(() => runFetchers({ fetchers: [fakeFetcher('f9', cands, { snapshot: 'never' })], store, cfg, registry, sources: {}, http: null, wayback: null, now: NOW, backfill: true }))
  assert.equal(again.fetchers.f9.backfilled ?? 0, 0, 'a backfilled item is no longer a baseline entry')
})

test('dedupe: scans with no text are not duplicates of each other', () => {
  const index = emptyIndex()
  const a = classify(index, { url: 'https://www.villageofgrayslake.com/DocumentCenter/View/1', text: '' })
  remember(index, 'a', a)
  const b = classify(index, { url: 'https://www.villageofgrayslake.com/DocumentCenter/View/2', text: '  ' })
  assert.equal(b.duplicateOf, undefined)
  assert.equal(b.contentHash, null)
})

test('runner: records cut from one shared page are not duplicates of each other', async () => {
  const store = tempStore()
  const page = 'https://www.ilga.gov/Legislation/BillStatus?DocTypeID=HB&DocNum=5513&GAID=18&SessionID=114'
  const recFetcher = {
    name: 'f10', snapshot: 'never', sourceUrl: page,
    async discover() { return { candidates: ['a', 'b', 'c'].map(k => ({ key: `HB5513|${k}`, url: page, title: k, published: '2026-09-30' })) } },
    async fetchItem(ctx, c) { return { kind: 'record', text: `HB5513. 9/30/2026. House: action ${c.title}` } },
  }
  const r = await quietly(() => runFetchers({ fetchers: [recFetcher], store, cfg, registry, sources: {}, http: null, wayback: null, now: NOW }))
  assert.equal(r.fetchers.f10.new, 3)
  assert.equal(r.fetchers.f10.duplicates, 0)
})
