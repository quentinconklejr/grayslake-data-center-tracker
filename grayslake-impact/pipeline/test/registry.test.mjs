// One source registry: config/sources.yaml is the only registry file, and
// pipeline/lib/registry.mjs is the only code that reads it or looks URLs up.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { ROOT } from '../lib/config.mjs'
import { loadRegistry, validateRegistry, classifyCitation } from '../lib/registry.mjs'

const REGISTRY = 'grayslake-impact/config/sources.yaml'
const LOOKUP = 'grayslake-impact/pipeline/lib/registry.mjs'
const SELF = 'grayslake-impact/pipeline/test/registry.test.mjs'
const CODE = /\.(ya?ml|json|js|mjs|cjs|ts)$/i
// Built from parts so this file does not match its own patterns.
const ENTRY_YAML = new RegExp(['id', ': village-grayslake\\s*\\n\\s*name:'].join(''))
const ENTRY_JSON = new RegExp(['"id"', '\\s*:\\s*"village-grayslake"'].join(''))
// A path to the registry passed as an argument ('config/sources.yaml'), not a mention in prose.
const READS_REGISTRY = new RegExp(["['\"`]([\\w./-]*/)?", 'sources\\.ya?ml', "['\"`]\\s*[),]"].join(''))
const OWN_LOOKUP = new RegExp(['function ', '(unwrapWayback|lookup)\\s*\\(', '|', 'url_prefixes', '\\s*\\?\\?'].join(''))

/**
 * Every place a second registry could hide. files: repo-relative paths;
 * read(path) → text. Returns [{ file, why }].
 */
export function registryCopies(files, read) {
  const found = []
  for (const f of files) {
    if (f === REGISTRY || f === SELF || f.includes('node_modules/') || f.includes('/dist/')) continue
    const name = basename(f)
    if (/^(sources|source-registry|registry)\.(ya?ml|json)$/i.test(name)) { found.push({ file: f, why: 'a second registry file' }); continue }
    if (!CODE.test(f)) continue
    const text = read(f)
    if (text === null) continue
    if (ENTRY_YAML.test(text) || ENTRY_JSON.test(text)) found.push({ file: f, why: 'contains registry entries' })
    if (f !== LOOKUP && READS_REGISTRY.test(text) && !/\/test\//.test(f)) found.push({ file: f, why: 'reads sources.yaml itself' })
    if (f !== LOOKUP && OWN_LOOKUP.test(text) && !/\/test\//.test(f)) found.push({ file: f, why: 'its own registry lookup' })
  }
  return found
}

function repoFiles() {
  const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: ROOT, encoding: 'utf8' }).trim()
  const list = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: top, encoding: 'utf8', maxBuffer: 64e6 })
    .split('\n').filter(Boolean)
  return { top, files: [...new Set(list)] }
}

test('registry: exactly one registry file and one lookup in the repo', () => {
  const { top, files } = repoFiles()
  assert.ok(files.includes(REGISTRY), 'config/sources.yaml is in the repo')
  const copies = registryCopies(files, f => { try { return readFileSync(join(top, f), 'utf8') } catch { return null } })
  assert.deepEqual(copies, [], `second copies:\n${copies.map(c => `  ${c.file}: ${c.why}`).join('\n')}`)
})

test('registry: the copy check catches a second registry file, embedded entries, and a second lookup', () => {
  const fake = {
    'grayslake-impact/src/data/registry.json': '{}',
    'grayslake-impact/scripts/other.yaml': ['sources:', '  - id' + ': village-grayslake', '    name: Village', '    tier: 1'].join('\n'),
    'grayslake-impact/scripts/labels.js': "import YAML from 'yaml'\nconst r = YAML.parse(readFileSync('config/" + "sources.yaml'))",
    'grayslake-impact/scripts/mine.js': 'function unwrap' + 'Wayback(u) { return u }',
    [REGISTRY]: 'sources: []',
    'grayslake-impact/README.md': 'id' + ': village-grayslake\n  name: x',
  }
  const found = registryCopies(Object.keys(fake), f => fake[f])
  assert.deepEqual(found.map(x => x.file).sort(), [
    'grayslake-impact/scripts/labels.js', 'grayslake-impact/scripts/mine.js', 'grayslake-impact/scripts/other.yaml', 'grayslake-impact/src/data/registry.json',
  ])
})

test('registry: the site build imports the shared lookup instead of carrying its own', () => {
  const build = readFileSync(join(ROOT, 'scripts/build-source-tiers.js'), 'utf8')
  assert.match(build, /from '\.\.\/pipeline\/lib\/registry\.mjs'/)
  assert.doesNotMatch(build, OWN_LOOKUP)
  assert.doesNotMatch(build, READS_REGISTRY)
})

test('registry: classifyCitation applies party statements, per-article Tier 2 and Tier 4', () => {
  const reg = loadRegistry()
  const c = (url, extra = {}) => classifyCitation(reg, { url, ...extra })
  assert.equal(c('https://www.villageofgrayslake.com/DocumentCenter/View/16083/Press-Release-8-19').label, 'Tier 1 · party statement')
  assert.equal(c('https://www.villageofgrayslake.com/DocumentCenter/View/15500/Ordinance-2025-0-21').label, 'Tier 1 · public record', 'other Village documents stay records')
  const wb = 'https://web.archive.org/web/20260724165553/https://www.villageofgrayslake.com/DocumentCenter/View/15282/T5-FAQ-sheet?bidId='
  assert.equal(c(wb).label, 'Tier 1 · party statement', 'a Wayback copy carries the tier of what it archives')
  const herald = 'https://www.dailyherald.com/20260731/x/'
  assert.equal(c(herald, { byline: { name: 'Mick Zawislak', status: 'confirmed' } }).tier, 2)
  const unb = c(herald, { byline: { status: 'unverified', reason: 'no archived copy' } })
  assert.equal(unb.tier, 3)
  assert.equal(unb.label, 'Tier 3 · news report (byline unconfirmed)')
  assert.equal(c(herald, { author: 'Mick Zawislak' }).tier, 3, 'an unchecked author is not a confirmed byline')
  assert.equal(c('https://www.lakemchenryscanner.com/x').label, 'Tier 3 · news report')
  assert.equal(c('https://example.org/x').tier, 4)
  assert.equal(c('https://example.org/x').registryId, null)
})

test('registry: validation requires a label for every tier and kind in use', () => {
  const reg = loadRegistry()
  assert.deepEqual(validateRegistry(reg), [])
  const noLabel = { ...reg, labels: { ...reg.labels } }
  delete noLabel.labels.news_report
  assert.ok(validateRegistry(noLabel).some(e => /no label for "news_report"/.test(e)))
  assert.equal(dirname(join(ROOT, 'config/sources.yaml')).endsWith('config'), true)
})
