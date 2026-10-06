/**
 * ilga.gov Bill Status pages for the bills in config/pipeline.yaml
 * (fetchers.ilga.bills). Each row of a bill's Actions table is an item, so
 * a new committee referral, amendment or vote shows up as a new item.
 *
 * Bills are identified by number only. Generated text must not use the name
 * "POWER Act" until the owner confirms it (editorial hold in pipeline.yaml),
 * so nothing here labels a bill by that name.
 */
import { parseHtml, isoFromAny, StructureError } from './common.mjs'
import { sha256 } from '../dedupe.mjs'

export function billUrl(b) {
  return `https://www.ilga.gov/Legislation/BillStatus?DocTypeID=${b.type}&DocNum=${b.number}&GAID=${b.gaid}&SessionID=${b.session}`
}

export function parseBillStatus(html, url) {
  const doc = parseHtml(html, url)
  const heading = [...doc.querySelectorAll('h2')].find(h => /^\s*Actions\s*$/i.test(h.textContent))
  const table = heading?.parentElement?.querySelector('table') ?? heading?.nextElementSibling
  if (!table || table.tagName !== 'TABLE') throw new StructureError('no Actions table after an "Actions" heading')
  const rows = [...table.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()))
    .filter(cells => cells.length >= 3 && /\d{1,2}\/\d{1,2}\/\d{4}/.test(cells[0]))
    .map(([date, chamber, action]) => ({ date, chamber, action }))
  if (!rows.length) throw new StructureError('Actions table has no dated rows')
  const synopsis = [...doc.querySelectorAll('h2, h3, h4')].find(h => /Synopsis As Introduced/i.test(h.textContent))
  return { rows, synopsis: synopsis?.nextElementSibling?.textContent?.replace(/\s+/g, ' ').trim() ?? null }
}

export default {
  name: 'ilga-bills',
  get sourceUrl() { return 'https://www.ilga.gov/Legislation/BillStatus' },
  snapshot: 'page',

  async discover(ctx) {
    const bills = ctx.cfg.fetchers?.ilga?.bills ?? []
    if (!bills.length) return { candidates: [] }
    const candidates = []
    for (const b of bills) {
      const url = billUrl(b)
      const res = await ctx.http(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}${res.error ? ' ' + res.error : ''} for ${url}`)
      const { rows, synopsis } = parseBillStatus(res.bytes.toString('utf8'), url)
      const id = `${b.type}${b.number}`
      // Identical rows on the same day are separate actions; number them.
      const occurrences = new Map()
      for (const r of rows) {
        const [m, d, y] = r.date.split('/')
        const base = `${id}|${r.date}|${r.chamber}|${sha256(r.action).slice(0, 16)}`
        const n = (occurrences.get(base) ?? 0) + 1
        occurrences.set(base, n)
        candidates.push({
          key: n === 1 ? base : `${base}#${n}`,
          url,
          snapshotTarget: url,
          snapshotMustContain: r.action,
          title: `${id} ${r.date} ${r.chamber}: ${r.action}`,
          published: isoFromAny(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00Z`),
          meta: { bill: id, ...r, synopsis },
        })
      }
    }
    return { candidates }
  },

  async fetchItem(ctx, cand) {
    const { bill, date, chamber, action } = cand.meta
    return { kind: 'record', text: `${bill}. ${date}. ${chamber}: ${action}` }
  },
}
