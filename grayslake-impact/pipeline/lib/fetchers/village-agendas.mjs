/**
 * Village of Grayslake "Agendas & Minutes" page.
 *
 * The Village does not use CivicPlus Agenda Center (its RSS feed is empty);
 * agendas, Agenda Briefs and minutes are posted as DocumentCenter files
 * linked from this one page. Every link is /DocumentCenter/View/<id>/<slug>,
 * and ids only increase, so a link whose id has not been seen is a new
 * document. The PDF is fetched and its text extracted.
 */
import { parseHtml, fetchDocument, dateFromSlug, StructureError } from './common.mjs'

export const PAGE = 'https://www.villageofgrayslake.com/6/Agendas-Minutes'
const MIN_LINKS = 20   // the page carried 300+ when this was written

export function parseAgendasPage(html) {
  const doc = parseHtml(html, PAGE)
  const byId = new Map()
  for (const a of doc.querySelectorAll('a[href*="/DocumentCenter/View/"]')) {
    const m = /\/DocumentCenter\/View\/(\d+)(?:\/([^?#"]*))?/.exec(a.getAttribute('href'))
    if (!m) continue
    const id = m[1]
    const slug = decodeURIComponent(m[2] ?? '')
    const label = (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').replace(/\s*Opens in new window\s*$/i, '').trim()
    const prev = byId.get(id)
    if (prev) { if (!prev.label && label) prev.label = label; continue }
    byId.set(id, { id, slug, label })
  }
  return [...byId.values()]
}

export default {
  name: 'village-agendas',
  sourceUrl: PAGE,
  snapshot: 'always',

  async discover(ctx) {
    const res = await ctx.http(PAGE)
    if (!res.ok) throw new Error(`HTTP ${res.status}${res.error ? ' ' + res.error : ''} for ${PAGE}`)
    const links = parseAgendasPage(res.bytes.toString('utf8'))
    if (links.length < MIN_LINKS) throw new StructureError(`only ${links.length} DocumentCenter links on the Agendas page (expected at least ${MIN_LINKS}); the page may have changed`)
    return {
      candidates: links.map(l => ({
        key: l.id,
        url: `https://www.villageofgrayslake.com/DocumentCenter/View/${l.id}${l.slug ? '/' + l.slug : ''}`,
        title: l.slug ? l.slug.replace(/-/g, ' ').trim() : l.label,
        published: dateFromSlug(l.slug) ?? dateFromSlug(l.label),
        meta: { documentId: Number(l.id), linkText: l.label },
      })),
    }
  },

  async fetchItem(ctx, cand) {
    return fetchDocument(ctx, cand.url)
  },
}
