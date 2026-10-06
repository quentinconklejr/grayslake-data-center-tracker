/**
 * Provider interface. One config setting (`provider` in config/pipeline.yaml)
 * picks the model provider; `fallback_providers` lists optional fallbacks,
 * empty by default.
 *
 * Every provider exposes:
 *   name, paid, model
 *   budgetChars(fixedPromptChars)        document chars that fit one request
 *   generateJSON({ system, user, schema, label })
 *     → { content, usage: { inputTokens, outputTokens }, durationMs, doneReason, warnings }
 *
 * Each provider is wrapped in its own rate limiter. Gemini and Claude are
 * registered but not implemented until Stage C, together with the monthly
 * spend cap that applies to paid providers; enabling them now fails loudly
 * rather than doing anything unexpected.
 */
import { createOllama } from './ollama.mjs'
import { makeLimiter } from '../ratelimit.mjs'

const FACTORIES = {
  ollama: createOllama,
  gemini: () => { throw new Error('gemini provider is not implemented yet (Stage C)') },
  claude: () => { throw new Error('claude provider is not implemented yet (Stage C)') },
}

export function createProvider(cfg, name = cfg.provider, overrides = {}) {
  const pcfg = cfg.providers?.[name]
  if (!pcfg) throw new Error(`no settings for provider "${name}"`)
  if (pcfg.enabled === false) throw new Error(`provider "${name}" is disabled in config/pipeline.yaml`)
  const factory = FACTORIES[name]
  if (!factory) throw new Error(`unknown provider "${name}"`)
  const p = factory(pcfg, overrides)
  const limited = makeLimiter(pcfg.rate_limit)
  return { ...p, generateJSON: args => limited(() => p.generateJSON(args)) }
}
