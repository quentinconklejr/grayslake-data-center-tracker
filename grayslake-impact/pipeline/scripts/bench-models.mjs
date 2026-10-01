#!/usr/bin/env node
/**
 * Benchmarks candidate Ollama models on the sources behind the existing
 * timeline entries.
 *
 *   npm run pipeline:bench                                   all candidates, num_ctx from config
 *   npm run pipeline:bench -- --models qwen2.5:7b,gemma4:12b
 *   npm run pipeline:bench -- --num-ctx 16384
 *   npm run pipeline:bench -- --ctx-probe                    only: GPU fit at 8192/12288/16384
 *   npm run pipeline:bench -- --max-chunks 6                 cap chunks per source (default 6)
 *
 * For every source with text in the corpus, each model extracts claims chunk
 * by chunk (the production prompt and schema), and every claim goes through
 * the verbatim guard against the chunk it came from. Metrics per model:
 *
 *   schema failure rate   chunks whose JSON failed validation after the one retry
 *                         (and the first-attempt rate, before the retry)
 *   guard pass rate       claims that passed every guard check
 *   fact coverage         numbers and dates from the owner's timeline entries
 *                         (only those the guard confirmed are in the sources)
 *                         that appear in the model's passing quotes
 *   time per item         seconds per chunk, and per timeline entry (the
 *                         extraction time of the sources it cites)
 *
 * Winner: highest guard pass rate among models whose schema failure rate
 * after retry is 5% or less; ties go to coverage, then speed.
 *
 * Results and every claim go to the private store (reports/bench-*.json/.md).
 */
import { loadPipelineConfig } from '../lib/config.mjs'
import { loadRubric, guardConfig } from '../lib/rubric.mjs'
import { openStore } from '../lib/store.mjs'
import { createProvider } from '../lib/providers/index.mjs'
import { chunksFor, extractChunk } from '../lib/extract.mjs'
import { prepareSource, checkClaim, extractNumbers, extractDates } from '../lib/guard.mjs'
import { takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? dflt : process.argv[i + 1]
}
const CANDIDATES = ['qwen2.5:7b', 'gemma4:12b', 'ministral-3:14b', 'qwen3:14b']
const models = (arg('models', CANDIDATES.join(','))).split(',').map(s => s.trim()).filter(Boolean)
const cfg = loadPipelineConfig()
const numCtx = Number(arg('num-ctx', cfg.providers.ollama.num_ctx))
const maxChunks = Number(arg('max-chunks', 6))
const gcfg = guardConfig(loadRubric())
const store = openStore(cfg.private_store.dir)
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

// --- context probe ----------------------------------------------------------------
if (process.argv.includes('--ctx-probe')) {
  const rows = []
  for (const model of models) {
    const p = createProvider(cfg, 'ollama', { model })
    for (const ctx of [8192, 12288, 16384]) {
      try {
        const r = await p.probeContext(ctx)
        rows.push({ model, ...r })
        console.log(`${model.padEnd(18)} num_ctx ${String(ctx).padEnd(6)} size ${(r.sizeBytes / 2 ** 30).toFixed(1)} GiB  on GPU ${(r.gpuShare * 100).toFixed(0)}%`)
      } catch (e) {
        rows.push({ model, ctx, error: e.message })
        console.log(`${model.padEnd(18)} num_ctx ${ctx}: ${e.message}`)
      }
      await p.unload()
    }
  }
  store.writeJson(`reports/ctx-probe-${stamp}.json`, rows)
  process.exit(0)
}

// --- the work list ------------------------------------------------------------------
const keysOf = e => [...new Set([e.sourceKey, ...(e.sourceKeys ?? [])].filter(Boolean))]
const sourceKeys = [...new Set(timelineEvents.flatMap(keysOf))].sort()
const corpus = Object.fromEntries(sourceKeys.map(k => [k, store.readJson(`corpus/sources/${k}.json`)]).filter(([, r]) => r?.text))

// Facts to look for: numbers and full dates in each owner entry that the guard
// confirmed are present in that entry's sources.
const factsByEntry = timelineEvents.map(e => {
  const ev = keysOf(e).filter(k => corpus[k]).map(k => prepareSource(corpus[k].text, gcfg))
  const prose = `${e.title}. ${e.description ?? ''}`
  const nums = extractNumbers(prose).map(n => n.value).filter(v => ev.some(s => s.numbers.has(v)) && !/^(19|20)\d\d$/.test(v))
  const dates = extractDates(prose).filter(d => ev.some(s => s.dates.get(`${d.month}-${d.day}`))).map(d => `${d.month}-${d.day}`)
  return { nums: [...new Set(nums)], dates: [...new Set(dates)] }
})

function docDateOf(key) {
  const d = extractDates(sources[key]?.date ?? '')[0]
  return d ? { month: d.month, day: d.day, year: d.year } : undefined
}

// --- run ---------------------------------------------------------------------------------
const report = { stamp, numCtx, maxChunks, models: {} }
for (const model of models) {
  console.log(`\n=== ${model} (num_ctx ${numCtx}) ===`)
  const p = createProvider(cfg, 'ollama', { model, num_ctx: numCtx })
  const perSource = {}
  const t0 = Date.now()
  for (const [key, rec] of Object.entries(corpus)) {
    const chunks = chunksFor(p, rec, rec.text, { maxChunks, label: `${model} ${key}` })
    const out = { chunks: [], claims: [], ms: 0 }
    for (const ch of chunks) {
      const r = await extractChunk(p, rec, ch, chunks.length, `${model} ${key}`)
      out.ms += r.durationMs
      out.chunks.push({ index: ch.index, ok: r.ok, firstAttemptOk: r.firstAttemptOk, attempts: r.attempts, errors: r.errors, usage: r.usage, ms: r.durationMs, warnings: r.warnings })
      if (!r.ok) continue
      const src = prepareSource(ch.text, gcfg)
      for (const c of r.data.claims) {
        const g = checkClaim(c, src, gcfg, { docDate: docDateOf(key) })
        out.claims.push({ ...c, chunk: ch.index, guard: g.ok, failures: g.failures.map(f => ({ check: f.check, reason: f.reason, value: f.value })) })
      }
    }
    perSource[key] = out
    const pass = out.claims.filter(c => c.guard).length
    console.log(`  ${key.padEnd(24)} chunks ${out.chunks.length}  schema-ok ${out.chunks.filter(c => c.ok).length}  claims ${out.claims.length}  guard-pass ${pass}  ${(out.ms / 1000).toFixed(0)}s`)
  }
  await p.unload()

  const chunksAll = Object.values(perSource).flatMap(s => s.chunks)
  const claimsAll = Object.values(perSource).flatMap(s => s.claims)
  const failReasons = {}
  for (const c of claimsAll) for (const f of c.failures) failReasons[`${f.check}:${f.reason}`] = (failReasons[`${f.check}:${f.reason}`] ?? 0) + 1

  let factsTotal = 0, factsFound = 0
  const entryTimes = []
  for (const [i, e] of timelineEvents.entries()) {
    const keys = keysOf(e).filter(k => perSource[k])
    if (!keys.length) continue
    entryTimes.push(keys.reduce((s, k) => s + perSource[k].ms, 0))
    const passing = keys.flatMap(k => perSource[k].claims.filter(c => c.guard))
    const ev = prepareSource(passing.flatMap(c => c.supporting_quotes).join('\n'), gcfg)
    const f = factsByEntry[i]
    factsTotal += f.nums.length + f.dates.length
    factsFound += f.nums.filter(n => ev.numbers.has(n)).length + f.dates.filter(d => ev.dates.has(d)).length
  }
  const outTok = chunksAll.reduce((s, c) => s + c.usage.outputTokens, 0)
  const msAll = chunksAll.reduce((s, c) => s + c.ms, 0)
  const m = {
    chunks: chunksAll.length,
    schemaFailRateFirstAttempt: chunksAll.filter(c => !c.firstAttemptOk).length / chunksAll.length,
    schemaFailRate: chunksAll.filter(c => !c.ok).length / chunksAll.length,
    claims: claimsAll.length,
    claimsPassed: claimsAll.filter(c => c.guard).length,
    guardPassRate: claimsAll.length ? claimsAll.filter(c => c.guard).length / claimsAll.length : 0,
    factCoverage: factsTotal ? factsFound / factsTotal : 0,
    factsTotal, factsFound,
    secPerChunk: msAll / 1000 / chunksAll.length,
    secPerEntry: entryTimes.reduce((a, b) => a + b, 0) / 1000 / entryTimes.length,
    outputTokPerSec: outTok / (msAll / 1000),
    wallSec: (Date.now() - t0) / 1000,
    failReasons,
    warnings: takeWarnings(),
  }
  report.models[model] = { metrics: m, perSource }
  store.writeJson(`reports/bench-${stamp}.json`, report)
  console.log(`  → schema fail ${(m.schemaFailRate * 100).toFixed(1)}% (first try ${(m.schemaFailRateFirstAttempt * 100).toFixed(1)}%), guard pass ${(m.guardPassRate * 100).toFixed(1)}% (${m.claimsPassed}/${m.claims}), coverage ${(m.factCoverage * 100).toFixed(1)}%, ${m.secPerChunk.toFixed(1)} s/chunk, ${m.secPerEntry.toFixed(0)} s/entry`)
}

// --- verdict ------------------------------------------------------------------------------
const rows = Object.entries(report.models).map(([model, { metrics: m }]) => ({ model, ...m }))
const eligible = rows.filter(r => r.schemaFailRate <= 0.05)
const ranked = [...eligible].sort((a, b) => b.guardPassRate - a.guardPassRate || b.factCoverage - a.factCoverage || a.secPerChunk - b.secPerChunk)
report.winner = ranked[0]?.model ?? null
store.writeJson(`reports/bench-${stamp}.json`, report)

const pct = x => `${(x * 100).toFixed(1)}%`
const md = [
  `# Model benchmark ${stamp}`, '', `num_ctx ${numCtx}, max ${maxChunks} chunks per source, ${Object.keys(corpus).length} sources.`, '',
  '| Model | Schema fail (after retry) | Schema fail (first try) | Claims | Guard pass | Fact coverage | s/chunk | s/entry | out tok/s |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.model} | ${pct(r.schemaFailRate)} | ${pct(r.schemaFailRateFirstAttempt)} | ${r.claims} | ${pct(r.guardPassRate)} | ${pct(r.factCoverage)} (${r.factsFound}/${r.factsTotal}) | ${r.secPerChunk.toFixed(1)} | ${r.secPerEntry.toFixed(0)} | ${r.outputTokPerSec.toFixed(0)} |`),
  '', `Winner: **${report.winner ?? 'none eligible'}**`, '',
  '## Guard failure reasons', '',
  ...rows.map(r => `- ${r.model}: ${Object.entries(r.failReasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`),
]
const file = store.writeText(`reports/bench-${stamp}.md`, md.join('\n') + '\n')
console.log('\n' + md.join('\n'))
console.log(`\nReport: ${file}`)
