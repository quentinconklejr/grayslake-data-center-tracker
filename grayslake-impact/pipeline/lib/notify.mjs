/**
 * ntfy push notifications (https://ntfy.sh), for Tier 1 drafts and health
 * alerts only.
 *
 * The message carries a short title and a link, never claim text or source
 * text. The topic and token are read from environment variables named in
 * config; their values are never logged, written to a file or put in an
 * error message. In dry-run mode the notification is written to
 * reports/dry-run/<run>/ntfy.jsonl with the topic and token redacted.
 */
export function makeNotifier({ ncfg, live, env = process.env, store, dryRunDir, fetchImpl = fetch }) {
  const topic = env[ncfg?.topic_env ?? 'NTFY_TOPIC']
  const token = env[ncfg?.token_env ?? 'NTFY_TOKEN']
  const configured = Boolean(ncfg?.enabled && topic)
  const sent = []

  async function send({ title, message, url, priority = 'default', tags = [] }) {
    const payload = { title: String(title).slice(0, 120), message: String(message ?? '').slice(0, 300), click: url ?? null, priority, tags }
    if (!live) {
      store.appendJsonl(`${dryRunDir}/ntfy.jsonl`, { ...payload, at: new Date().toISOString(), topic: topic ? '[set, redacted]' : '[not set]', token: token ? '[set, redacted]' : '[not set]', mode: 'dry-run' })
      sent.push({ ...payload, mode: 'dry-run' })
      return { ok: true, mode: 'dry-run' }
    }
    if (!configured) return { ok: false, error: 'ntfy not configured (enabled=false or topic env var not set)' }
    const headers = { Title: payload.title, Priority: priority, Tags: tags.join(',') }
    if (payload.click) headers.Click = payload.click
    if (token) headers.Authorization = `Bearer ${token}`
    try {
      const res = await fetchImpl(`${ncfg.server.replace(/\/$/, '')}/${encodeURIComponent(topic)}`, { method: 'POST', headers, body: payload.message || payload.title, signal: AbortSignal.timeout(15_000) })
      sent.push({ ...payload, mode: 'live', status: res.status })
      // Never echo the request (it names the topic) in the error.
      return res.ok ? { ok: true, mode: 'live' } : { ok: false, error: `ntfy HTTP ${res.status}` }
    } catch (e) {
      return { ok: false, error: `ntfy request failed (${e.name})` }
    }
  }

  return {
    sent,
    /** A Tier 1 draft is ready for review. */
    async draftReady(d, prUrl) {
      if (!(ncfg?.tiers ?? [1]).includes(d.effectiveTier)) return { ok: true, skipped: `tier ${d.effectiveTier} is not alerted` }
      return send({ title: `Tracker draft: ${d.entry?.title ?? d.title}`, message: `Tier ${d.effectiveTier} draft ready for review.`, url: prUrl, priority: 'high', tags: ['memo'] })
    },
    async health(text) {
      if (ncfg?.health_alerts === false) return { ok: true, skipped: 'health alerts off' }
      return send({ title: 'Tracker pipeline needs attention', message: text, priority: 'default', tags: ['warning'] })
    },
  }
}
