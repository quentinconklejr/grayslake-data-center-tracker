/**
 * Dedupe: is this item new?
 *
 *   1. URL       canonical form (lowercase host, no www., no tracking params,
 *                no fragment, no trailing slash, Wayback unwrapped)
 *   2. content   sha256 of the extracted text after canonicalization, so the
 *                same document at a second URL is caught
 *   3. near-dup  Jaccard similarity of 5-word shingles, estimated with a
 *                64-value MinHash, against recently seen items; catches a
 *                re-posted or lightly edited copy
 *   4. cited     the site already cites this URL (sources.js url,
 *                archiveUrl or originalUrl)
 *
 * A near-duplicate is not discarded: it is stored and marked, so Stage C can
 * treat it as an update to, or a copy of, the earlier item rather than as an
 * independent source.
 */
import { createHash } from 'node:crypto'
import { unwrapWayback } from './registry.mjs'

const TRACKING = /^(utm_\w+|fbclid|gclid|mc_cid|mc_eid|ocid|cmpid|_ga|ref|src|share|smid)$/i

export function canonicalUrl(url) {
  try {
    const u = new URL(unwrapWayback(String(url).trim()))
    u.hash = ''
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, '')
    for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k)
    u.searchParams.sort()
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.replace(/\/+$/, '')
    return u.toString().replace(/^http:/, 'https:')
  } catch {
    return String(url)
  }
}

export const sha256 = data => createHash('sha256').update(data).digest('hex')

function normText(text) {
  return String(text ?? '').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/** Hash of the text ignoring whitespace, case and punctuation: the same
 *  document re-rendered at another URL hashes the same. */
export function contentHash(text) {
  return sha256(normText(text))
}

function shingles(text, k = 5) {
  const w = normText(text).split(' ').filter(Boolean)
  const out = new Set()
  if (w.length < k) { if (w.length) out.add(w.join(' ')); return out }
  for (let i = 0; i + k <= w.length; i++) out.add(w.slice(i, i + k).join(' '))
  return out
}

// 64 seeded 32-bit hashes (FNV-1a with a per-row seed).
const SEEDS = Array.from({ length: 64 }, (_, i) => (0x9e3779b1 * (i + 1)) >>> 0)
function h32(str, seed) {
  let h = (0x811c9dc5 ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h >>> 0
}

export function minhash(text) {
  const sh = shingles(text)
  const sig = new Array(64).fill(0xffffffff)
  for (const s of sh) for (let i = 0; i < 64; i++) { const v = h32(s, SEEDS[i]); if (v < sig[i]) sig[i] = v }
  return sig
}

export function similarity(sigA, sigB) {
  let eq = 0
  for (let i = 0; i < 64; i++) if (sigA[i] === sigB[i]) eq++
  return eq / 64
}

export const NEAR_DUP_THRESHOLD = 0.8

/**
 * index: { urls: {canon: itemId}, hashes: {hash: itemId}, recent: [{id, sig}] }
 * Returns { duplicateOf, reason } for an exact duplicate, or
 * { nearDuplicateOf, similarity } / {} for a new item.
 */
export function classify(index, { url, text }, citedUrls = new Set()) {
  const canon = canonicalUrl(url)
  const out = { canonicalUrl: canon, contentHash: text ? contentHash(text) : null }
  if (citedUrls.has(canon)) out.alreadyCited = true
  if (index.urls[canon]) return { ...out, duplicateOf: index.urls[canon], reason: 'url' }
  if (out.contentHash && index.hashes[out.contentHash]) return { ...out, duplicateOf: index.hashes[out.contentHash], reason: 'content' }
  if (text && normText(text).split(' ').length >= 30) {
    const sig = minhash(text)
    out.signature = sig
    let best = null
    for (const r of index.recent) {
      const s = similarity(sig, r.sig)
      if (s >= NEAR_DUP_THRESHOLD && (!best || s > best.s)) best = { id: r.id, s }
    }
    if (best) Object.assign(out, { nearDuplicateOf: best.id, similarity: best.s })
  }
  return out
}

export function remember(index, id, info, maxRecent = 500) {
  index.urls[info.canonicalUrl] = id
  if (info.contentHash) index.hashes[info.contentHash] ??= id
  if (info.signature) {
    index.recent.push({ id, sig: info.signature })
    if (index.recent.length > maxRecent) index.recent.splice(0, index.recent.length - maxRecent)
  }
}

export function emptyIndex() {
  return { urls: {}, hashes: {}, recent: [] }
}

/** Every URL the site already cites, canonicalized. */
export function citedUrlSet(sources) {
  const set = new Set()
  for (const s of Object.values(sources)) {
    for (const u of [s.url, s.archiveUrl, s.originalUrl]) if (u && /^https?:/.test(u)) set.add(canonicalUrl(u))
  }
  return set
}
