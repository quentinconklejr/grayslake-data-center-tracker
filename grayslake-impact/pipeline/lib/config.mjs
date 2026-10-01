/**
 * Loads the three YAML config files the pipeline runs on:
 *
 *   config/credibility-rubric.yaml   tiers, claim types, guard parameters
 *   config/sources.yaml              domain → tier registry
 *   config/pipeline.yaml             providers, paths, fetch settings
 *
 * Each loader validates what it reads and throws on anything malformed, so a
 * typo in a config file stops the run instead of quietly changing behaviour.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const CONFIG_DIR = join(ROOT, 'config')

export function readYaml(path) {
  if (!existsSync(path)) throw new Error(`config file missing: ${path}`)
  return YAML.parse(readFileSync(path, 'utf8'))
}

export function loadPipelineConfig(path = join(CONFIG_DIR, 'pipeline.yaml')) {
  const cfg = readYaml(path)
  const fail = msg => { throw new Error(`pipeline.yaml: ${msg}`) }
  if (!cfg.provider) fail('`provider` is required')
  if (!cfg.providers?.[cfg.provider]) fail(`provider "${cfg.provider}" has no settings under providers`)
  for (const name of [cfg.provider, ...(cfg.fallback_providers ?? [])]) {
    if (!cfg.providers[name]) fail(`unknown provider "${name}"`)
  }
  const o = cfg.providers.ollama
  if (o) {
    if (!Number.isInteger(o.num_ctx) || o.num_ctx < 2048) fail('providers.ollama.num_ctx must be an integer >= 2048')
    if (o.output_reserve_tokens >= o.num_ctx) fail('output_reserve_tokens must be smaller than num_ctx')
  }
  if (typeof cfg.spend_cap_usd_per_month !== 'number') fail('spend_cap_usd_per_month must be a number')
  cfg.private_store ??= {}
  cfg.private_store.dir = process.env.PRIVATE_INFO_DIR || cfg.private_store.dir
  if (!cfg.private_store.dir) fail('private_store.dir is required')
  // The private store must never sit inside this repository.
  const store = resolve(cfg.private_store.dir)
  const repoTop = resolve(ROOT, '..')
  if (store === repoTop || store.startsWith(repoTop + '\\') || store.startsWith(repoTop + '/')) {
    fail(`private_store.dir (${store}) is inside the site repository; it must be outside it`)
  }
  return cfg
}
