// Rubric, registry and pipeline config tests. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import YAML from 'yaml'
import { loadRubric, validateRubric } from '../lib/rubric.mjs'
import { loadRegistry, lookup, unwrapWayback } from '../lib/registry.mjs'
import { loadPipelineConfig, ROOT, CONFIG_DIR, readYaml } from '../lib/config.mjs'

// --- rubric -------------------------------------------------------------------

test('the committed rubric loads and validates', () => {
  const r = loadRubric()
  assert.equal(r.tiers[4].publish.outcome, 'never')
})

test('rubric validation catches unsafe edits', () => {
  const fresh = () => readYaml(join(CONFIG_DIR, 'credibility-rubric.yaml'))
  const cases = [
    [r => { r.tiers[4].publish.outcome = 'draft_as_fact' }, /tiers\.4/],
    [r => { r.claim_types.opinion.may_become_fact = true }, /opinion/],
    [r => { r.verbatim_guard.canonicalization.case_folding = true }, /case_folding/],
    [r => { r.decision_table.shift() }, /verbatim-guard drop rule/],
    [r => { r.decision_table.pop() }, /catch-all/],
    [r => { r.decision_table[3].outcome = 'publish_now' }, /not defined/],
    [r => { r.hard_rules = r.hard_rules.filter(h => h.id !== 'human_merge_only') }, /human_merge_only/],
    [r => { r.verbatim_guard.quote_rules.min_chars = 0 }, /min_chars/],
    [r => { r.verbatim_guard.canonicalization.typographic_equivalents['ab'] = 'c' }, /one character/],
  ]
  for (const [mutate, expected] of cases) {
    const r = fresh()
    mutate(r)
    const errors = validateRubric(r)
    assert.ok(errors.some(e => expected.test(e)), `expected ${expected} in ${JSON.stringify(errors)}`)
  }
})

// --- registry -------------------------------------------------------------------

const reg = loadRegistry()

test('owner decisions: six Tier 2 outlets, each with corrections policy unverified', () => {
  const t2 = reg.sources.filter(s => s.tier === 2)
  assert.deepEqual(t2.map(s => s.name).sort(), [
    'Capitol News Illinois', 'Chicago Sun-Times', 'Chicago Tribune', "Crain's Chicago Business",
    'Daily Herald', 'Lake County News-Sun',
  ])
  for (const s of t2) assert.equal(s.corrections_policy, 'unverified', s.name)
})

test('owner decisions: Scanner is Tier 3; court and Recorder sources are not automated', () => {
  assert.equal(lookup(reg, 'https://www.lakemchenryscanner.com/2026/09/08/x/').tier, 3)
  for (const id of ['lake-county-circuit-clerk', 'researchil', 'lake-county-recorder-search']) {
    assert.equal(reg.sources.find(s => s.id === id).automate, false, id)
  }
})

test('tier lookups', () => {
  const t = u => lookup(reg, u).tier
  assert.equal(t('https://www.dailyherald.com/20260901/news/x/'), 2)
  assert.equal(t('https://www.villageofgrayslake.com/DocumentCenter/View/16140'), 1)
  assert.equal(t('https://webapi.legistar.com/v1/lakecounty/matters'), 1)
  assert.equal(t('https://webapi.legistar.com/v1/cookcounty/matters'), 4, 'another county on Legistar is not listed')
  assert.equal(t('https://www.ilga.gov/Legislation/BillStatus?DocTypeID=HB&DocNum=5513'), 1)
  assert.equal(t('https://www.youtube.com/feeds/videos.xml?channel_id=UCPnLOnmTu9VhW0paDWubHhw'), 1)
  assert.equal(t('https://www.youtube.com/feeds/videos.xml?channel_id=UCsomeoneelse'), 4)
  assert.equal(t('https://www.youtube.com/watch?v=abc'), 4)
  assert.equal(t('/docs/t5-grayslake-complaint-2026ch00000171.pdf'), 1)
  assert.equal(t('https://www.facebook.com/groups/x'), 4)
  assert.equal(t('https://some-new-blog.example/post'), 4)
  assert.equal(t('not a url'), 4)
  assert.equal(t('javascript:alert(1)'), 4)
})

test('owner decision: T5 website is a listed party-statement source', () => {
  const r = lookup(reg, 'https://t5datacenters.com/some-press-release/')
  assert.equal(r.id, 't5-data-centers')
  assert.equal(r.party, 'T5 Data Centers')
  assert.equal(lookup(reg, 'https://www.dailyherald.com/x').party, null)
  assert.equal(lookup(reg, 'https://www.chronicleillinois.com/x').tier, 3, 'Chronicle stays Tier 3')
})

test('look-alike hosts do not inherit a tier', () => {
  const t = u => lookup(reg, u).tier
  assert.equal(t('https://villageofgrayslake.com.evil.example/x'), 4)
  assert.equal(t('https://evilvillageofgrayslake.com/x'), 4)
  assert.equal(t('https://dailyherald.com.example.net/x'), 4)
})

test('Wayback snapshots take the tier of the archived URL', () => {
  const w = 'https://web.archive.org/web/20260927075454/https://www.lakemchenryscanner.com/2026/09/08/x/'
  assert.equal(unwrapWayback(w), 'https://www.lakemchenryscanner.com/2026/09/08/x/')
  assert.equal(lookup(reg, w).tier, 3)
  assert.equal(lookup(reg, 'https://web.archive.org/web/20260724165553id_/https://www.villageofgrayslake.com/DocumentCenter/View/15282').tier, 1)
})

// --- pipeline config -------------------------------------------------------------

test('pipeline config loads with Ollama as the provider and an explicit num_ctx', () => {
  const c = loadPipelineConfig()
  assert.equal(c.provider, 'ollama')
  assert.equal(c.providers.ollama.num_ctx, 8192)
  assert.equal(c.providers.gemini.enabled, false)
  assert.equal(c.providers.claude.enabled, false)
  assert.deepEqual(c.fallback_providers, [])
})

test('a private store inside the site repository is refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pipecfg-'))
  const cfg = YAML.parse(YAML.stringify(readYaml(join(CONFIG_DIR, 'pipeline.yaml'))))
  cfg.private_store.dir = join(ROOT, 'private-info')
  const path = join(dir, 'pipeline.yaml')
  writeFileSync(path, YAML.stringify(cfg))
  const saved = process.env.PRIVATE_INFO_DIR
  delete process.env.PRIVATE_INFO_DIR
  try {
    assert.throws(() => loadPipelineConfig(path), /inside the site repository/)
  } finally {
    if (saved !== undefined) process.env.PRIVATE_INFO_DIR = saved
  }
})
