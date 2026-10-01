/**
 * Lead notes for Tier 2 articles (owner decision D-5).
 *
 * A Tier 2 article stays queue-only, but each one produces a short note for
 * the owner: outlet, headline, what the article cites, and which Tier 1
 * source to look for to confirm it. Built by code from the article text and
 * its extracted claims; no model writes it.
 */

// What an article refers to → the Tier 1 source that would confirm it.
const LOOK_FOR = [
  [/\b(village board|trustees?|plan commission|PCZBA|ordinance|special use permit|building permit|foundation permit)\b/i, 'Village of Grayslake Agendas & Minutes and News Flash (villageofgrayslake.com)'],
  [/\b(county board|zoning board of appeals|ZBA|moratorium|stormwater management commission|unincorporated)\b/i, 'Lake County Legistar (lakecounty.legistar.com)'],
  [/\b(lawsuit|complaint|plaintiffs?|defendants?|judge|status hearing|courtroom|circuit court)\b/i, 'Lake County Circuit Clerk docket for 2026CH00000171 (manual)'],
  [/\b(General Assembly|state senate|state house|bill|legislat\w+|veto session|HB ?\d{3,4}|SB ?\d{3,4})\b/i, 'ilga.gov bill status'],
  [/\b(ComEd|Commerce Commission|ICC|PJM|rate case|interconnection)\b/i, 'ICC e-Docket, PJM queue, ComEd filings'],
  [/\b(wetlands?|Army Corps|Section 404)\b/i, 'USACE Chicago District public notices'],
  [/\b(IEPA|Illinois EPA|air permit|generators?)\b/i, 'Illinois EPA public notices'],
  [/\b(CLCJAWA|Joint Action Water Agency|Lake Michigan allocation|gallons)\b/i, 'CLCJAWA (clcjawa.com) and its Legistar body'],
  [/\b(parcels?|deeds?|PIN|sold|purchase price|recorded)\b/i, 'Lake County Recorder search (manual) and the GIS parcel layer'],
]

const DOC_NOUNS = /\b(ordinance|permit|complaint|lawsuit|agenda|minutes|letter|report|filing|application|resolution|press release|statement|FAQ|presentation|study|plan)\b/gi

export function leadNote(item, claims = []) {
  const text = `${item.title ?? ''}\n${item.text ?? ''}`
  const speakers = [...new Set(claims.map(c => c.speaker).filter(Boolean))].slice(0, 6)
  const according = [...new Set([...text.matchAll(/\b[Aa]ccording to (?:the )?([A-Z][\w.&'’-]*(?:\s+(?:of\s+)?[A-Z][\w.&'’-]*){0,5})/g)].map(m => m[1]))].slice(0, 6)
  const docs = [...new Set((text.match(DOC_NOUNS) ?? []).map(d => d.toLowerCase()))].slice(0, 8)
  const lookFor = LOOK_FOR.filter(([re]) => re.test(text)).map(([, s]) => s)
  return {
    outlet: item.publisher,
    headline: item.title,
    url: item.url,
    date: item.published ?? null,
    byline: item.byline ?? null,
    cites: { speakers, accordingTo: according, documentsMentioned: docs },
    lookFor: lookFor.length ? lookFor : ['No Tier 1 source identified from the text; read the article'],
    claimsQueued: claims.length,
  }
}

export function leadNotesMarkdown(notes) {
  return notes.map(n => [
    `### ${n.outlet}: ${n.headline}`,
    `${n.date ?? 'undated'}${n.byline ? ` · ${n.byline}` : ''} · ${n.url}`,
    `- Cites: ${[...n.cites.speakers, ...n.cites.accordingTo].join('; ') || 'no named source found'}${n.cites.documentsMentioned.length ? `; documents mentioned: ${n.cites.documentsMentioned.join(', ')}` : ''}`,
    `- Look for: ${n.lookFor.join('; ')}`,
    `- ${n.claimsQueued} claim(s) queued`,
  ].join('\n')).join('\n\n')
}
