/**
 * Per-provider rate limiter: a concurrency cap plus a requests-per-minute
 * cap (0 = none). Each provider gets its own instance.
 */
const sleep = ms => new Promise(r => setTimeout(r, ms))

export function makeLimiter({ requests_per_minute = 0, concurrency = 1 } = {}) {
  let active = 0
  const waiting = []
  const starts = []

  async function acquire() {
    while (active >= concurrency) await new Promise(r => waiting.push(r))
    active++
    if (requests_per_minute > 0) {
      for (;;) {
        const now = Date.now()
        while (starts.length && now - starts[0] >= 60_000) starts.shift()
        if (starts.length < requests_per_minute) break
        await sleep(60_000 - (now - starts[0]) + 5)
      }
      starts.push(Date.now())
    }
  }
  function release() {
    active--
    waiting.shift()?.()
  }
  return async function limited(fn) {
    await acquire()
    try { return await fn() } finally { release() }
  }
}
