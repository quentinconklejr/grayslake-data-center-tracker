/**
 * Source registry: URL → tier, and a citation → tier and label.
 *
 * The only place a tier comes from: config/sources.yaml is the one registry
 * file, and this module is the one implementation that reads it. The site
 * build (scripts/build-source-tiers.js) and the pipeline both call it
 * (pipeline/test/registry.test.mjs fails if a second copy appears). Anything that matches no entry is Tier 4
 * (rubric hard rule tier_from_registry), including malformed URLs. Wayback
 * snapshots are looked up by the URL they archive. Site-relative paths
 * (/docs/..., /records/...) are this site's own mirrors.
 */
import { join } from 'node:path'
import { CONFIG_DIR, readYaml } from './config.mjs'

export const SITE_HOST = 'grayslakedatacentertracker.org'
const UNKNOWN = Object.freeze({ tier: 4, id: null, name: 'unlisted', matchedBy: 'default' })

export function validateRegistry(reg) {
  const errors = []
  const ids = new Set()
  for (const [i, s] of (reg?.sources ?? []).entries()) {
    if (!s.id) errors.push(`sources[${i}] has no id`)
    if (ids.has(s.id)) errors.push(`duplicate source id ${s.id}`)
    ids.add(s.id)
    if (![1, 2, 3, 4].includes(s.tier)) errors.push(`${s.id}: tier must be 1-4`)
    if (s.tier === 2 && !s.corrections_policy) errors.push(`${s.id}: Tier 2 entries must state corrections_policy`)
    for (const d of s.domains ?? []) if (/[/:]/.test(d)) errors.push(`${s.id}: domain "${d}" must be a bare host`)
    if (s.category === 'party_statement' && !s.party) errors.push(`${s.id}: a party_statement source must name its party`)
  }
  if (!ids.size) errors.push('registry has no sources')
  // Every label an entry can resolve to must be defined (when labels are used).
  if (reg?.labels) {
    const needed = new Set(['tier_4', 'tier_2_unbylined'])
    for (const s of reg.sources ?? []) needed.add(s.kind ?? (s.category === 'party_statement' ? 'party_statement' : `tier_${s.tier}`))
    for (const k of needed) if (!reg.labels[k]) errors.push(`labels: no label for "${k}"`)
  }
  return errors
}

export function loadRegistry(path = join(CONFIG_DIR, 'sources.yaml')) {
  const reg = readYaml(path)
  const errors = validateRegistry(reg)
  if (errors.length) throw new Error(`sources.yaml is invalid:\n  - ${errors.join('\n  - ')}`)
  return reg
}

/** Unwraps web.archive.org/web/<ts>[id_]/<url> to <url>. */
export function unwrapWayback(url) {
  const m = /^https?:\/\/web\.archive\.org\/web\/\d{4,14}[a-z_]*\/(.+)$/i.exec(url)
  if (!m) return url
  const inner = m[1]
  return /^https?:\/\//i.test(inner) ? inner : `http://${inner}`
}

function parse(url) {
  if (typeof url !== 'string' || !url) return null
  let u = url.trim()
  if (u.startsWith('/')) u = `https://${SITE_HOST}${u}`
  u = unwrapWayback(u)
  try {
    const p = new URL(u)
    if (!/^https?:$/.test(p.protocol)) return null
    const host = p.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '')
    return { host, hostPath: host + p.pathname, url: p }
  } catch {
    return null
  }
}

function youtubeChannel(p) {
  if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(p.host)) return null
  return p.url.searchParams.get('channel_id')
    ?? /^\/channel\/([\w-]+)/.exec(p.url.pathname)?.[1]
    ?? null
}

/**
 * Returns { tier, id, name, matchedBy, entry }. A video page URL
 * (youtube.com/watch?v=...) does not name its channel, so it is Tier 4 here;
 * the YouTube fetcher passes the feed URL, which does.
 */
export function lookup(registry, url) {
  const p = parse(url)
  if (!p) return { ...UNKNOWN }
  const sources = registry.sources ?? []

  for (const s of sources) {
    for (const prefix of s.url_prefixes ?? []) {
      const pre = prefix.toLowerCase().replace(/^www\./, '')
      if (p.hostPath.toLowerCase().startsWith(pre)) return hit(s, 'url_prefix')
    }
  }
  const channel = youtubeChannel(p)
  if (channel) {
    const s = sources.find(x => (x.youtube_channels ?? []).includes(channel))
    return s ? hit(s, 'youtube_channel') : { ...UNKNOWN }
  }
  let best = null
  for (const s of sources) {
    for (const d of s.domains ?? []) {
      const dom = d.toLowerCase().replace(/^www\./, '')
      if (p.host === dom || p.host.endsWith('.' + dom)) {
        if (!best || dom.length > best.len) best = { s, len: dom.length }
      }
    }
  }
  return best ? hit(best.s, 'domain') : { ...UNKNOWN }
}

function hit(s, matchedBy) {
  // A party's own channel: T5's website (party_statement) or a government
  // body that is itself a party to the litigation (litigation_party, D-1).
  const party = s.category === 'party_statement' ? s.party : (s.litigation_party ?? null)
  return { tier: s.tier, id: s.id, name: s.name, matchedBy, entry: s, party, partyChannel: s.litigation_party ? 'litigation_party' : (party ? 'party_statement' : null) }
}

/**
 * The byline that counts for a citation: a named reporter confirmed from the
 * archived copy (the citation's `byline` field). An `author` string or page
 * metadata nobody checked does not count.
 */
export function confirmedByline(citation) {
  return citation?.byline?.status === 'confirmed' && citation.byline.name ? citation.byline.name : null
}

/**
 * A citation's tier and Documents-page label. The citation is looked up by its
 * url, then originalUrl, then archiveUrl. Tier 2 is per article: without a
 * confirmed byline a Tier 2 outlet's article is Tier 3 ("tier_2_unbylined").
 * Otherwise the label is the entry's `kind`, `party_statement` for a party's
 * channel, else its tier. A citation that matches nothing is Tier 4.
 */
export function classifyCitation(registry, citation) {
  const urls = [citation?.url, citation?.originalUrl, citation?.archiveUrl].filter(Boolean)
  const found = urls.map(u => lookup(registry, u)).find(h => h.id)
  const entry = found?.entry ?? null
  let tier = entry?.tier ?? 4
  let labelKey
  if (!entry) labelKey = 'tier_4'
  else if (entry.tier === 2 && !confirmedByline(citation)) { labelKey = 'tier_2_unbylined'; tier = 3 }
  else if (entry.kind) labelKey = entry.kind
  else if (entry.category === 'party_statement') labelKey = 'party_statement'
  else labelKey = `tier_${entry.tier}`
  return { tier, registryId: entry?.id ?? null, labelKey, label: registry.labels?.[labelKey] ?? null, registryTier: entry?.tier ?? 4 }
}
