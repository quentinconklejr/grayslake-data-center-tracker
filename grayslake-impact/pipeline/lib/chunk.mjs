/**
 * Splits a document into pieces that fit the model's context window.
 *
 * Splits at paragraph breaks, then sentence ends, then spaces, never inside a
 * word. Consecutive chunks overlap slightly so a sentence cut at a boundary
 * appears whole in one of them. Every split, and every chunk dropped because
 * a document has more chunks than the caller allows, is logged as a warning.
 */
import { log } from './log.mjs'

/** Position just after the last paragraph break, else sentence end, else
 *  space, in the second half of the window; -1 if there is none. */
function lastCut(w, min) {
  const para = w.lastIndexOf('\n\n')
  if (para >= min) return para + 2
  for (let i = w.length - 2; i >= min; i--) {
    if ('.!?'.includes(w[i]) && /\s/.test(w[i + 1])) return i + 2
  }
  const sp = Math.max(w.lastIndexOf(' '), w.lastIndexOf('\n'))
  return sp >= min ? sp + 1 : -1
}

export function chunkText(text, maxChars, { overlap = 300, label = 'document' } = {}) {
  const s = String(text ?? '')
  if (s.length <= maxChars) return [{ index: 0, start: 0, end: s.length, text: s }]
  const chunks = []
  let start = 0
  while (start < s.length) {
    let end = Math.min(s.length, start + maxChars)
    if (end < s.length) {
      const cut = lastCut(s.slice(start, end), Math.floor(maxChars * 0.5))
      if (cut > 0) end = start + cut
    }
    chunks.push({ index: chunks.length, start, end, text: s.slice(start, end) })
    if (end >= s.length) break
    // Back up to a word boundary for the overlap.
    let next = Math.max(start + 1, end - overlap)
    while (next < end && /\S/.test(s[next - 1])) next++
    start = next
  }
  log.warn(`${label}: input of ${s.length} chars exceeds ${maxChars} chars and was split into ${chunks.length} chunks`)
  return chunks
}

/**
 * Keeps at most `max` chunks, preferring those with the most keyword hits,
 * in document order. Warns with the number dropped: dropped text is never
 * read by the model, so anything in it is missed.
 */
export function capChunks(chunks, max, keywords, label = 'document') {
  if (chunks.length <= max) return chunks
  const re = new RegExp(keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi')
  const scored = chunks.map(c => ({ c, hits: (c.text.match(re) ?? []).length }))
  const kept = scored.sort((a, b) => b.hits - a.hits || a.c.index - b.c.index).slice(0, max).map(x => x.c).sort((a, b) => a.index - b.index)
  log.warn(`${label}: ${chunks.length} chunks, only ${max} kept (by keyword hits); ${chunks.length - max} chunk(s) truncated and not read`)
  return kept
}
