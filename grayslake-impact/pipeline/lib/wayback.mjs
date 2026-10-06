/**
 * Wayback Machine snapshots.
 *
 * capture(url): asks the Internet Archive's Save Page Now to archive a URL.
 *   With IA_S3_ACCESS / IA_S3_SECRET set it uses the authenticated SPN2 API
 *   (POST /save, then poll /save/status/<job>), which has higher limits and
 *   reports errors. Without them it uses the anonymous form (GET /save/<url>),
 *   which works at low volume. Either way the result is a snapshot URL or an
 *   error; a failure never stops the run.
 *
 * verify(snapshotUrl, expected): fetches the snapshot's raw bytes (the id_
 *   form) and compares them with what the pipeline fetched: identical bytes,
 *   or matching extracted text, or a mismatch. Only a verified snapshot is
 *   ever offered as an archiveUrl.
 */
import { contentHash, sha256 } from './dedupe.mjs'
import { waybackRaw } from './http.mjs'

const sleep = ms => new Promise(r => setTimeout(r, ms))

export function makeWayback({ politeFetch, fetchImpl = fetch, env = process.env, pollMs = 5000, maxPolls = 24, userAgent, captureGapMs }) {
  const access = env.IA_S3_ACCESS
  const secret = env.IA_S3_SECRET
  const authed = Boolean(access && secret)
  // Save Page Now rate-limits anonymous use hard; space captures out.
  const gap = captureGapMs ?? (authed ? 5_000 : 20_000)
  let lastCapture = 0

  async function captureAuthed(url) {
    const res = await fetchImpl('https://web.archive.org/save', {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `LOW ${access}:${secret}`, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': userAgent },
      body: new URLSearchParams({ url, skip_first_archive: '1' }).toString(),
      signal: AbortSignal.timeout(60_000),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || !body.job_id) return { ok: false, error: `SPN2 HTTP ${res.status}${body.message ? ': ' + body.message : ''}` }
    for (let i = 0; i < maxPolls; i++) {
      await sleep(pollMs)
      const st = await (await fetchImpl(`https://web.archive.org/save/status/${body.job_id}`, { headers: { Accept: 'application/json', Authorization: `LOW ${access}:${secret}` } })).json().catch(() => ({}))
      if (st.status === 'success') return { ok: true, snapshotUrl: `https://web.archive.org/web/${st.timestamp}/${st.original_url ?? url}`, timestamp: st.timestamp, mode: 'spn2' }
      if (st.status === 'error') return { ok: false, error: `SPN2 ${st.status_ext ?? 'error'}: ${st.message ?? ''}`.trim() }
    }
    return { ok: false, error: 'SPN2 job did not finish in time' }
  }

  async function captureAnonymous(url) {
    const res = await fetchImpl(`https://web.archive.org/save/${url}`, {
      redirect: 'manual',
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(120_000),
    })
    const loc = res.headers.get('content-location') ?? res.headers.get('location') ?? ''
    const m = /\/web\/(\d{14})\//.exec(loc)
    if (m) return { ok: true, snapshotUrl: `https://web.archive.org/web/${m[1]}/${url}`, timestamp: m[1], mode: 'anonymous' }
    return { ok: false, error: `anonymous save HTTP ${res.status}${res.status === 429 ? ' (rate limited)' : ''}` }
  }

  return {
    authed,
    async capture(url) {
      const wait = lastCapture + gap - Date.now()
      if (wait > 0) await sleep(wait)
      lastCapture = Date.now()
      try { return authed ? await captureAuthed(url) : await captureAnonymous(url) } catch (e) { return { ok: false, error: e.message } }
    },
    /** expected: { rawSha256, textHash, mustContain, toText(bytes, contentType) → text }
     *  mustContain is for page-level snapshots (a bill status page archived for
     *  one action row): the archived page must contain that text. */
    async verify(snapshotUrl, expected) {
      const res = await politeFetch(waybackRaw(snapshotUrl))
      // A fresh capture is often not served for a few minutes; that is
      // retryable, unlike a snapshot whose content is wrong.
      if (!res.ok) return { verified: false, retryable: true, result: `snapshot not served yet (HTTP ${res.status})` }
      if (expected.rawSha256 && sha256(res.bytes) === expected.rawSha256) return { verified: true, result: 'identical-bytes' }
      try {
        const text = expected.toText(res.bytes, res.contentType)
        if (expected.textHash && contentHash(text) === expected.textHash) return { verified: true, result: 'identical-text' }
        if (expected.mustContain) {
          const norm = s => String(s).replace(/\s+/g, ' ').trim()
          if (norm(text).includes(norm(expected.mustContain))) return { verified: true, result: 'contains-expected-text' }
        }
        return { verified: false, result: 'content differs from what the pipeline fetched' }
      } catch (e) {
        return { verified: false, result: `could not read snapshot: ${e.message}` }
      }
    },
  }
}
