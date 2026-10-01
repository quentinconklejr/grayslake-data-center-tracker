/** The Tier 1 fetchers, by name. config/pipeline.yaml fetchers.enabled picks which run. */
import villageAgendas from './village-agendas.mjs'
import villageNewsflash from './village-newsflash.mjs'
import villageYoutube from './village-youtube.mjs'
import ilgaBills from './ilga-bills.mjs'
import legistar from './legistar.mjs'

export const FETCHERS = Object.fromEntries([villageAgendas, villageNewsflash, villageYoutube, ilgaBills, legistar].map(f => [f.name, f]))

export function enabledFetchers(cfg, only) {
  const names = only?.length ? only : (cfg.fetchers?.enabled ?? Object.keys(FETCHERS))
  return names.map(n => {
    const f = FETCHERS[n]
    if (!f) throw new Error(`unknown fetcher "${n}" (known: ${Object.keys(FETCHERS).join(', ')})`)
    return f
  })
}
