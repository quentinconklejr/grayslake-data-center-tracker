// Chunking, rate limiting and schema-validation-with-retry tests. No network:
// the provider is a stub. Run: npm run pipeline:test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chunkText, capChunks } from '../lib/chunk.mjs'
import { makeLimiter } from '../lib/ratelimit.mjs'
import { extractChunk, chunksFor } from '../lib/extract.mjs'
import { takeWarnings } from '../lib/log.mjs'

const silence = () => { const w = console.warn; console.warn = () => {}; return () => { console.warn = w } }

test('short text is one chunk and logs nothing', () => {
  takeWarnings()
  assert.equal(chunkText('short text', 1000).length, 1)
  assert.equal(takeWarnings().length, 0)
})

test('long text is split on boundaries, never inside a word, covers everything, and warns', () => {
  const restore = silence()
  const para = 'The Village Board met on Tuesday. Trustees discussed the permit at length. '
  const text = Array.from({ length: 60 }, (_, i) => `${para}Paragraph ${i}.`).join('\n\n')
  const chunks = chunkText(text, 1200, { overlap: 100, label: 't' })
  restore()
  assert.ok(chunks.length > 1)
  for (const c of chunks) {
    assert.ok(c.text.length <= 1200)
    assert.ok(c.start === 0 || /\s/.test(text[c.start - 1]), 'chunk starts at a word boundary')
    assert.ok(c.end === text.length || /\s/.test(text[c.end - 1]) || /\s/.test(text[c.end]), 'chunk ends at a word boundary')
  }
  for (let i = 1; i < chunks.length; i++) assert.ok(chunks[i].start <= chunks[i - 1].end, 'no gap between chunks')
  assert.equal(chunks.at(-1).end, text.length)
  const w = takeWarnings()
  assert.equal(w.length, 1)
  assert.match(w[0].msg, /split into \d+ chunks/)
})

test('capping chunks keeps the most relevant and warns about the dropped ones', () => {
  const restore = silence()
  const chunks = ['nothing here', 'T5 Grayslake T5', 'more nothing', 'Grayslake data center'].map((text, index) => ({ index, text }))
  const kept = capChunks(chunks, 2, ['T5', 'Grayslake', 'data center'], 'doc')
  restore()
  assert.deepEqual(kept.map(c => c.index), [1, 3])
  assert.match(takeWarnings()[0].msg, /2 chunk\(s\) truncated/)
})

test('the rate limiter enforces concurrency', async () => {
  const limited = makeLimiter({ concurrency: 2 })
  let active = 0, peak = 0
  await Promise.all(Array.from({ length: 6 }, () => limited(async () => {
    active++; peak = Math.max(peak, active)
    await new Promise(r => setTimeout(r, 20))
    active--
  })))
  assert.equal(peak, 2)
})

const goodResponse = JSON.stringify({
  document: { doc_type: 'news_article', published_date: null, byline: [], is_about_t5_grayslake: 'yes', origin: 'originates', repeats_whom: null },
  claims: [{
    claim_text: 'The Board approved the ordinance.', claim_type: 'fact', speaker: null, attribution: 'document',
    event_date: null, date_basis: 'unknown', supporting_quotes: ['The Lake County Board approved an ordinance amending Chapter 151'], timeline_category: 'policy',
  }],
})

function stubProvider(responses) {
  const calls = []
  return {
    calls,
    budgetChars: () => 10_000,
    async generateJSON(args) {
      calls.push(args)
      const content = responses[calls.length - 1]
      if (content instanceof Error) throw content
      return { content, usage: { inputTokens: 100, outputTokens: 50 }, durationMs: 5, warnings: [] }
    },
  }
}
const meta = { title: 't', publisher: 'p', date: 'd' }
const chunk = { index: 0, text: 'doc' }

test('a valid response is accepted on the first attempt', async () => {
  const p = stubProvider([goodResponse])
  const r = await extractChunk(p, meta, chunk, 1, 'x')
  assert.equal(r.ok, true)
  assert.equal(r.attempts, 1)
  assert.equal(p.calls.length, 1)
})

test('an invalid response is retried once, with the errors, and the retry can succeed', async () => {
  const bad = JSON.stringify({ document: {}, claims: [{ claim_text: 'x' }] })
  const p = stubProvider([bad, goodResponse])
  const r = await extractChunk(p, meta, chunk, 1, 'x')
  assert.equal(r.ok, true)
  assert.equal(r.attempts, 2)
  assert.equal(r.firstAttemptOk, false)
  assert.match(p.calls[1].user, /did not match the required JSON schema/)
})

test('two invalid responses fail the chunk after exactly one retry', async () => {
  const p = stubProvider(['not json', '{"claims": "nope"}', goodResponse])
  const r = await extractChunk(p, meta, chunk, 1, 'x')
  assert.equal(r.ok, false)
  assert.equal(p.calls.length, 2)
  assert.ok(r.errors.length > 0)
})

test('schema enforces enums and exact shapes', async () => {
  const wrongType = JSON.parse(goodResponse)
  wrongType.claims[0].claim_type = 'rumor'
  const extra = JSON.parse(goodResponse)
  extra.claims[0].confidence = 0.9
  for (const resp of [wrongType, extra]) {
    const p = stubProvider([JSON.stringify(resp), JSON.stringify(resp)])
    assert.equal((await extractChunk(p, meta, chunk, 1, 'x')).ok, false)
  }
})

test('chunksFor sizes chunks from the provider budget', () => {
  const restore = silence()
  const p = { budgetChars: () => 3000 }
  const chunks = chunksFor(p, meta, 'word '.repeat(2000), { label: 'x' })
  restore()
  takeWarnings()
  assert.ok(chunks.length >= 3)
  assert.ok(chunks.every(c => c.text.length <= 3000))
})
