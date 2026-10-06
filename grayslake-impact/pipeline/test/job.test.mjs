// Stage D tests: scheduling decisions, lock, connectivity, ntfy, PRs and a
// whole job run, all offline. git, gh, ntfy and HTTP are stubs.
// Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadPipelineConfig, ROOT } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { loadRegistry } from '../lib/registry.mjs'
import { openStore } from '../lib/store.mjs'
import { makeTriage } from '../lib/triage.mjs'
import { loadFlagContext } from '../lib/flags.mjs'
import { makeNotifier } from '../lib/notify.mjs'
import { buildPr, makeDiff, openLivePr, ghCommandPreview } from '../lib/pr.mjs'
import { dueFetchers, acquireLock, releaseLock, isOnline, runJob, pushStore } from '../lib/job.mjs'
import { renderTimelineEntry, renderSourceEntry, renderUpdateEntry } from '../lib/render.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

const cfg = loadPipelineConfig()
const rubric = loadRubric()
const quietly = async fn => { const w = console.warn, l = console.log; console.warn = () => {}; console.log = () => {}; try { return await fn() } finally { console.warn = w; console.log = l; takeWarnings() } }
function tempStore() { const d = mkdtempSync(join(tmpdir(), 'store-')); mkdirSync(join(d, '.git')); return openStore(d) }
const NOW = new Date('2026-10-02T12:00:00Z')

// --- scheduling ----------------------------------------------------------------------

test('fetchers are due by cadence; after a long sleep every overdue fetcher runs once and the missed count is reported', () => {
  const cadence = { a: 30, b: 120, c: 1440 }
  const state = { fetchers: { a: '2026-10-02T11:45:00Z', b: '2026-10-02T09:00:00Z', c: '2026-10-02T00:00:00Z' } }
  const d = Object.fromEntries(dueFetchers(state, cadence, NOW).map(x => [x.name, x]))
  assert.equal(d.a.due, false)
  assert.equal(d.b.due, true)
  assert.equal(d.c.due, false)
  const asleep = Object.fromEntries(dueFetchers(state, cadence, new Date('2026-10-04T12:00:00Z')).map(x => [x.name, x]))
  assert.ok(asleep.a.due && asleep.b.due && asleep.c.due)
  assert.ok(asleep.a.missed > 90, 'about two days of 30-minute slots were missed')
  assert.equal(dueFetchers({ fetchers: {} }, cadence, NOW).every(x => x.due), true, 'never run → due')
})

test('the lock stops a second run, and a stale lock is taken over', () => {
  const store = tempStore()
  assert.equal(acquireLock(store, 180, NOW).ok, true)
  assert.equal(acquireLock(store, 180, new Date(NOW.getTime() + 60_000)).ok, false)
  const later = acquireLock(store, 180, new Date(NOW.getTime() + 4 * 3_600_000))
  assert.deepEqual([later.ok, later.tookOverStale], [true, true])
  releaseLock(store)
  assert.equal(acquireLock(store, 180, NOW).tookOverStale, false)
})

test('connectivity: online if any check URL answers', async () => {
  assert.equal(await isOnline(['a', 'b'], async u => { if (u === 'a') throw new Error('dns'); return { status: 200 } }), true)
  assert.equal(await isOnline(['a', 'b'], async () => { throw new Error('offline') }), false)
})

// --- ntfy ------------------------------------------------------------------------------------

test('ntfy dry run writes the payload with topic and token redacted, never their values', async () => {
  const store = tempStore()
  const env = { NTFY_TOPIC: 'secret-topic-value-123', NTFY_TOKEN: 'tk_secret_value_456' }
  const n = makeNotifier({ ncfg: cfg.notify.ntfy, live: false, env, store, dryRunDir: 'reports/dry-run/x' })
  await n.draftReady({ effectiveTier: 1, entry: { title: 'County Board adopts moratorium' } }, 'https://github.com/x/pull/1')
  const skipped = await n.draftReady({ effectiveTier: 2, entry: { title: 'Tier 2 item' } }, 'u')
  assert.match(skipped.skipped, /tier 2/)
  const file = readFileSync(store.path('reports/dry-run/x/ntfy.jsonl'), 'utf8')
  assert.ok(!file.includes('secret-topic-value-123') && !file.includes('tk_secret_value_456'))
  assert.match(file, /\[set, redacted\]/)
  assert.equal(file.trim().split('\n').length, 1, 'only the Tier 1 draft was notified')
})

test('ntfy live sends title and link only, with the token as a bearer header, and keeps it out of errors', async () => {
  const store = tempStore()
  const calls = []
  const fetchImpl = async (url, opts) => { calls.push({ url, opts }); return { ok: false, status: 500 } }
  const n = makeNotifier({ ncfg: cfg.notify.ntfy, live: true, env: { NTFY_TOPIC: 'topicX', NTFY_TOKEN: 'tokY' }, store, dryRunDir: 'd', fetchImpl })
  const r = await n.draftReady({ effectiveTier: 1, entry: { title: 'T' } }, 'https://pr')
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer tokY')
  assert.equal(calls[0].opts.headers.Click, 'https://pr')
  assert.ok(!JSON.stringify(r).includes('tokY') && !JSON.stringify(r).includes('topicX'))
})

// --- PRs -------------------------------------------------------------------------------------

const draft = {
  itemId: 'x', url: 'https://www.lakecountyil.gov/m/newsflash/Home/Detail/9999', tier: 1, effectiveTier: 1, party: null, guard: 'pass', status: 'ready',
  date: { date: '2026-09-08', basis: 'event date stated in the quotes' }, sourceKey: 'lakeCountyMoratorium2026',
  newSource: { publisher: 'Lake County, Illinois' }, validation: { ok: true }, flags: [{ file: 'src/data/keyFigures.js', id: 'water', note: 'may bear on key figure; not edited' }], existing: [],
  claims: [{ claim_type: 'fact', outcome: 'draft_as_fact', claim_text: 'The Board approved a moratorium.', quotes: ['The Lake County Board approved an ordinance establishing a moratorium'], guardMatch: ['exact'] }],
  entry: { title: 'County Board adopts moratorium' },
  rendered: {
    timeline: renderTimelineEntry({ date: '2026-09-08', title: 'County Board adopts moratorium', description: 'The Lake County Board approved an ordinance establishing a moratorium.', category: 'policy', sourceKey: 'lakeCountyMoratorium2026' }),
    source: renderSourceEntry('lakeCountyMoratorium2026', { category: 'government', title: 'Moratorium', publisher: 'Lake County, Illinois', url: 'https://www.lakecountyil.gov/m/newsflash/Home/Detail/9999', tier: 'primary' }),
    update: renderUpdateEntry({ date: '2026-10-02', kind: 'added', title: 'Added to the timeline: County Board adopts moratorium', description: 'D', link: '/timeline', linkLabel: 'See the timeline' }),
  },
}

test('PR body carries the quotes, tier, flags and the review checklist; branch is under pipeline/', () => {
  const pr = buildPr(draft, { today: '2026-10-02' })
  assert.match(pr.branch, /^pipeline\/draft-2026-10-02-/)
  assert.match(pr.title, /^Draft: /)
  assert.match(pr.body, /> The Lake County Board approved an ordinance establishing a moratorium/)
  assert.match(pr.body, /Flags \(not edited\)/)
  assert.match(pr.body, /- \[ \] Open the source/)
  assert.ok(pr.labels.includes('tier-1') && pr.labels.includes('needs-decision'))
  assert.match(ghCommandPreview(pr, cfg.job), /--base main --head pipeline\/draft-/)
})

test('the diff only adds lines to the four data files, with repository paths', () => {
  const diff = makeDiff(draft, cfg.job.site_repo.data_dir)
  assert.match(diff, /diff --git a\/grayslake-impact\/src\/data\/timeline\.js b\/grayslake-impact\/src\/data\/timeline\.js/)
  assert.match(diff, /\+ {4}title: "County Board adopts moratorium",/)
  assert.ok(!/^-[^-]/m.test(diff), 'no line removed')
  assert.ok(!/records\.js|keyFigures\.js|questionStatus\.js/.test(diff))
})

test('a live PR needs both job.live and --live, and never targets the base branch', async () => {
  const run = async () => ''
  const pr = buildPr(draft, { today: '2026-10-02' })
  await assert.rejects(openLivePr(draft, pr, { jcfg: { ...cfg.job, live: false }, liveFlag: true, run }), /job.live/)
  await assert.rejects(openLivePr(draft, pr, { jcfg: { ...cfg.job, live: true }, liveFlag: false, run }), /--live/)
  await assert.rejects(openLivePr(draft, { ...pr, branch: 'main' }, { jcfg: { ...cfg.job, live: true }, liveFlag: true, run }), /refusing/)
})

test('a live PR runs: fetch, worktree from origin/main, commit, push the draft branch, gh pr create, remove worktree', async () => {
  const calls = []
  const run = async (cmd, args) => {
    calls.push([cmd, ...args].join(' '))
    if (args.includes('worktree') && args.includes('add')) {
      // Simulate the worktree: copy the data files where the PR code writes them.
      const wt = args[args.indexOf('-b') + 2]
      const dir = join(wt, cfg.job.site_repo.data_dir)
      mkdirSync(dir, { recursive: true })
      for (const f of ['timeline.js', 'sources.js', 'updates.js', 'actions.js']) (await import('node:fs')).copyFileSync(join(ROOT, 'src/data', f), join(dir, f))
    }
    return args[0] === 'pr' ? 'https://github.com/quentinconklejr/grayslake-data-center-tracker/pull/99\n' : ''
  }
  const pr = buildPr(draft, { today: '2026-10-02' })
  const r = await openLivePr(draft, pr, { jcfg: { ...cfg.job, live: true }, liveFlag: true, run })
  assert.equal(r.url, 'https://github.com/quentinconklejr/grayslake-data-center-tracker/pull/99')
  const seq = calls.map(c => c.replace(/\S*pr-worktree-\S*/g, '<wt>').replace(/\S*pr-body-\S*/g, '<body>'))
  assert.match(seq[0], /fetch origin main$/)
  assert.match(seq[1], /worktree add -b pipeline\/draft-\S+ <wt> origin\/main$/)
  assert.ok(seq.some(c => /push -u origin pipeline\/draft-/.test(c)))
  assert.ok(!seq.some(c => /push\b.*\bmain\b/.test(c) && !/pipeline\/draft-/.test(c)), 'never pushes main')
  assert.ok(seq.some(c => /pr create --repo quentinconklejr\/grayslake-data-center-tracker --base main --head pipeline\/draft-/.test(c)))
  assert.match(seq.at(-1), /worktree remove --force <wt>/)
})

test('pushing the private store commits and pushes HEAD:main, never forced; nothing to commit is fine', async () => {
  const calls = []
  const store = tempStore()
  await pushStore(store, async (cmd, args) => { calls.push(args.join(' ')); return args.includes('--porcelain') ? ' M x\n' : '' }, 'r1')
  assert.ok(calls.some(c => /commit -m job r1/.test(c)))
  assert.ok(calls.some(c => /push origin HEAD:main$/.test(c)))
  assert.ok(!calls.some(c => /--force|-f\b/.test(c)))
  const quiet = await pushStore(store, async (cmd, args) => (args.includes('--porcelain') ? '' : ''), 'r2')
  assert.equal(quiet.note, 'nothing to commit')
})

// --- a whole job, offline -------------------------------------------------------------------

const QUOTE = 'The Lake County Board approved an ordinance establishing a moratorium on new data center approvals, set to expire May 11, 2027.'
function stubProvider() {
  return {
    model: 'stub', numCtx: 8192,
    budgetChars: () => 20000,
    async generateJSON({ schema }) {
      const isDraft = Boolean(schema.properties?.title)
      const content = isDraft
        ? { title: 'County Board approves data center moratorium', description: "The County Board approved a moratorium on new data center approvals, “set to expire May 11, 2027.”", category: 'policy' }
        : { document: { doc_type: 'press_release', published_date: null, byline: [], is_about_t5_grayslake: 'partly', origin: 'originates', repeats_whom: null },
            claims: [{ claim_text: 'The Lake County Board approved a moratorium set to expire May 11, 2027.', claim_type: 'fact', speaker: null, attribution: 'document', event_date: null, date_basis: 'unknown', supporting_quotes: [QUOTE], timeline_category: 'policy' }] }
      return { content: JSON.stringify(content), usage: { inputTokens: 1, outputTokens: 1 }, durationMs: 1, warnings: [] }
    },
  }
}
const newsFetcher = {
  name: 'village-newsflash', snapshot: 'never', sourceUrl: 'https://www.lakecountyil.gov/',
  async discover() { return { candidates: [{ key: 'k1', url: 'https://www.lakecountyil.gov/m/newsflash/Home/Detail/9999', title: 'Data center moratorium', published: '2026-10-01T12:00:00Z' }] } },
  async fetchItem() { return { kind: 'html', text: `Lake County news. ${QUOTE} The measure covers unincorporated Lake County only.`, bytes: Buffer.from('<html></html>'), contentType: 'text/html' } },
}
function jobDeps(store, over = {}) {
  const runs = []
  return {
    runs,
    deps: {
      cfg, store, registry: loadRegistry(), sources, timelineEvents, rubric, gcfg: guardConfig(rubric), provider: stubProvider(),
      triage: makeTriage(cfg.triage, []).triage, flagCtx: loadFlagContext(), http: null, wayback: null,
      fetchers: { 'village-newsflash': newsFetcher },
      notifier: makeNotifier({ ncfg: cfg.notify.ntfy, live: false, env: {}, store, dryRunDir: 'reports/dry-run/test' }),
      run: async (cmd, args) => { runs.push([cmd, ...args].join(' ')); return args.includes('--porcelain') ? ' M x' : '' },
      fetchImpl: async () => ({ status: 200 }), liveFlag: false, pushStore: true, now: NOW, ...over,
    },
  }
}

test('job: a full dry run fetches, triages, extracts, drafts, writes PR files and an ntfy line, and pushes the store', async () => {
  const store = tempStore()
  const { deps, runs } = jobDeps(store)
  const r = await quietly(() => runJob(deps))
  assert.equal(r.mode, 'dry-run')
  assert.equal(r.fetch['village-newsflash'].new, 1)
  assert.equal(r.prs.length, 1)
  assert.match(r.prs[0].url, /^https:\/\/github\.com\/quentinconklejr\/private-info\/blob\/main\/reports\/dry-run\/.+\.md$/, 'dry-run link points to the PR file in the private repo')
  const dry = store.list(`reports/dry-run/${r.runId}`)
  assert.ok(dry.some(f => f.endsWith('.md')) && dry.some(f => f.endsWith('.diff')))
  assert.ok(existsSync(store.path('reports/dry-run/test/ntfy.jsonl')))
  assert.ok(runs.some(c => /push origin HEAD:main/.test(c)))
  assert.ok(!runs.some(c => /gh|pr create/.test(c)), 'no gh call in a dry run')
  // Second run inside the cadence: nothing due, nothing reprocessed.
  const r2 = await quietly(() => runJob({ ...deps, now: new Date(NOW.getTime() + 5 * 60_000) }))
  assert.equal(r2.fetch, undefined)
  assert.equal(r2.prs.length, 0)
})

test('job: offline stops early and records it; the next online run catches up', async () => {
  const store = tempStore()
  const { deps } = jobDeps(store, { fetchImpl: async () => { throw new Error('offline') } })
  const r = await quietly(() => runJob(deps))
  assert.equal(r.offline, true)
  assert.ok(store.readJson('state/job.json').lastOfflineAt)
  const r2 = await quietly(() => runJob({ ...deps, fetchImpl: async () => ({ status: 200 }) }))
  assert.equal(r2.fetch['village-newsflash'].new, 1)
})

test('job: a run after 48 hours without success raises a health alert (dry-run ntfy)', async () => {
  const store = tempStore()
  store.writeJson('state/job.json', { fetchers: {}, lastSuccessAt: '2026-09-29T12:00:00Z' })
  const { deps } = jobDeps(store)
  const r = await quietly(() => runJob(deps))
  assert.ok(r.alerts.some(a => /no completed run for 72 hours/.test(a)))
  assert.ok(r.notifications.some(n => n.kind === 'health' && n.mode === 'dry-run'))
})

test('job: a held lock skips the run', async () => {
  const store = tempStore()
  store.writeJson('state/job.lock', { pid: 1, startedAt: NOW.toISOString() })
  const { deps } = jobDeps(store)
  const r = await quietly(() => runJob(deps))
  assert.match(r.skipped, /holds the lock/)
})

test('job: --live alone does not go live when config job.live is false', async () => {
  const store = tempStore()
  const { deps, runs } = jobDeps(store, { liveFlag: true })
  const r = await quietly(() => runJob(deps))
  assert.equal(r.mode, 'dry-run')
  assert.ok(!runs.some(c => /pr create/.test(c)))
})

test('every scheduled command uses --use-system-ca', () => {
  const ps1 = readFileSync(join(ROOT, 'pipeline/scheduler/setup-task-scheduler.ps1'), 'utf8')
  assert.match(ps1, /\$arguments = "--use-system-ca /)
  assert.ok(!/--live/.test(ps1.match(/\$arguments = [^\n]*/)[0]), 'the scheduled task never passes --live')
  assert.ok(!/\[switch\]\$Live/.test(ps1), 'no -Live switch')
  assert.match(ps1, /live:\\s\*true'\) \{ throw/, 'refuses to register while job.live is true')
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  for (const [k, v] of Object.entries(pkg.scripts)) if (k.startsWith('pipeline:') && k !== 'pipeline:test') assert.match(v, /--use-system-ca/, k)
  assert.match(readFileSync(join(ROOT, 'pipeline/scripts/run-job.mjs'), 'utf8'), /execArgv\.includes\('--use-system-ca'\)/)
})

test('ntfy in a dry run: real push allowed by config, titled as a dry run, link only', async () => {
  const store = tempStore()
  const calls = []
  const n = makeNotifier({ ncfg: cfg.notify.ntfy, live: true, dryRunJob: true, env: { NTFY_TOPIC: 't' }, store, dryRunDir: 'd', fetchImpl: async (u, o) => { calls.push(o); return { ok: true, status: 200 } } })
  await n.draftReady({ effectiveTier: 1, entry: { title: 'X' } }, 'https://github.com/quentinconklejr/private-info/blob/main/reports/dry-run/r/01.md')
  assert.match(calls[0].headers.Title, /(dry run)/)
  assert.match(calls[0].body, /nothing was opened on the site repo/)
  assert.equal(cfg.notify.ntfy.send_in_dry_run, true)
  assert.equal(cfg.job.live, false, 'the job itself stays a dry run')
})
