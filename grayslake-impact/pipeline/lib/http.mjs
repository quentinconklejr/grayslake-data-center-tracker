/**
 * Polite HTTP fetching: an honest user agent, a minimum interval between
 * requests to the same host, timeouts, and a couple of retries with backoff on
 * network errors and 5xx. Never retries 4xx, and never tries to get past a
 * login, paywall or bot wall.
 */
const lastHit = new Map()
const sleep = ms => new Promise(r => setTimeout(r, ms))

export function makeFetcher(httpCfg) {
  const minGap = (httpCfg.min_interval_per_host_s ?? 5) * 1000
  const timeout = (httpCfg.timeout_s ?? 30) * 1000
  const retries = httpCfg.retries ?? 2

  return async function politeFetch(url, { headers = {} } = {}) {
    const host = new URL(url).host
    for (let attempt = 0; ; attempt++) {
      const wait = (lastHit.get(host) ?? 0) + minGap - Date.now()
      if (wait > 0) await sleep(wait)
      lastHit.set(host, Date.now())
      try {
        const res = await fetch(url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(timeout),
          headers: { 'User-Agent': httpCfg.user_agent, Accept: 'text/html,application/pdf,application/xml,*/*;q=0.8', ...headers },
        })
        if (res.status >= 500 && attempt < retries) { await sleep(2000 * 2 ** attempt); continue }
        const bytes = Buffer.from(await res.arrayBuffer())
        return {
          ok: res.ok,
          status: res.status,
          finalUrl: res.url,
          contentType: res.headers.get('content-type') ?? '',
          etag: res.headers.get('etag'),
          lastModified: res.headers.get('last-modified'),
          bytes,
        }
      } catch (err) {
        if (attempt < retries) { await sleep(2000 * 2 ** attempt); continue }
        const cause = err.cause?.code ? ` (${err.cause.code})` : ''
        return { ok: false, status: 0, error: err.name === 'TimeoutError' ? 'timeout' : `${err.message}${cause}`, finalUrl: url, bytes: Buffer.alloc(0), contentType: '' }
      }
    }
  }
}

/** Detects pages that answered 200 but are a bot challenge, not the document. */
export function looksLikeBotWall(text) {
  return /Just a moment\.\.\.|cf-chl|_Incapsula_Resource|captcha|Access Denied|Please enable JavaScript and cookies/i.test(String(text).slice(0, 20000))
}

/** web.archive.org/web/<ts>/<url> → web.archive.org/web/<ts>id_/<url>, which
 *  serves the archived bytes without the Wayback toolbar. */
export function waybackRaw(archiveUrl) {
  return archiveUrl.replace(/(web\.archive\.org\/web\/\d{4,14})(?:[a-z_]*)\//i, '$1id_/')
}
