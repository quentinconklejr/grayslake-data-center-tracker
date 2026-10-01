/**
 * Ollama provider (local, free). Talks to the Ollama HTTP API directly.
 *
 * num_ctx is always sent explicitly; Ollama's own default is smaller and
 * would silently cut long inputs. Ollama truncates an over-long prompt rather
 * than erroring, so the response's prompt_eval_count is checked and a warning
 * logged when the input came near the window; a response cut off by the
 * output limit (done_reason "length") is warned about too.
 */
import { log } from '../log.mjs'

export function createOllama(pcfg, overrides = {}) {
  const c = { ...pcfg, ...overrides }
  const base = c.base_url.replace(/\/$/, '')
  const model = c.model
  const numCtx = c.num_ctx
  const modelOpts = c.model_options?.[model] ?? {}

  async function call(path, body, timeoutS = c.request_timeout_s ?? 600) {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutS * 1000),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`ollama ${path} HTTP ${res.status}: ${text.slice(0, 300)}`)
    return JSON.parse(text)
  }

  return {
    name: 'ollama',
    paid: false,
    model,
    numCtx,
    charsPerToken: c.chars_per_token,
    outputReserve: c.output_reserve_tokens,

    /** Characters of document text that fit beside the given prompt. */
    budgetChars(fixedPromptChars) {
      const fixedTokens = Math.ceil(fixedPromptChars / c.chars_per_token)
      return Math.floor((numCtx - c.output_reserve_tokens - fixedTokens - 64) * c.chars_per_token)
    },

    async generateJSON({ system, user, schema, label = '' }) {
      const t0 = Date.now()
      const body = {
        model,
        stream: false,
        format: schema,
        keep_alive: c.keep_alive,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        options: { num_ctx: numCtx, num_predict: c.output_reserve_tokens, temperature: c.temperature, seed: c.seed },
        ...(modelOpts.think !== undefined ? { think: modelOpts.think } : {}),
      }
      const r = await call('/api/chat', body)
      const warnings = []
      const inTok = r.prompt_eval_count ?? 0
      if (inTok >= numCtx - c.output_reserve_tokens) {
        const w = `${label}: prompt used ${inTok} of num_ctx ${numCtx} tokens; input may have been truncated by Ollama`
        warnings.push(w); log.warn(w)
      }
      if (r.done_reason === 'length') {
        const w = `${label}: output hit the ${c.output_reserve_tokens}-token limit and was cut off`
        warnings.push(w); log.warn(w)
      }
      return {
        content: r.message?.content ?? '',
        usage: { inputTokens: inTok, outputTokens: r.eval_count ?? 0 },
        durationMs: Date.now() - t0,
        evalDurationMs: (r.eval_duration ?? 0) / 1e6,
        doneReason: r.done_reason,
        warnings,
      }
    },

    /** Loads the model at this num_ctx and reports how much of it is on the GPU. */
    async probeContext(ctx) {
      await call('/api/generate', { model, prompt: 'ok', stream: false, keep_alive: '2m', options: { num_ctx: ctx, num_predict: 1 }, ...(modelOpts.think !== undefined ? { think: modelOpts.think } : {}) })
      const ps = await (await fetch(`${base}/api/ps`)).json()
      const m = ps.models?.find(x => x.name === model || x.model === model)
      return m ? { ctx, sizeBytes: m.size, vramBytes: m.size_vram, gpuShare: m.size ? m.size_vram / m.size : 0, contextLength: m.context_length ?? null } : { ctx, error: 'model not listed by /api/ps' }
    },

    async unload() {
      await call('/api/generate', { model, keep_alive: 0, stream: false }).catch(() => {})
    },
  }
}
