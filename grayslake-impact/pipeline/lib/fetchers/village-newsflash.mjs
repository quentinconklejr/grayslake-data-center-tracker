/**
 * Village of Grayslake News Flash RSS (press releases, notices,
 * newsletters). Each entry links to a News Flash page or straight to a
 * DocumentCenter file; the linked document is fetched.
 */
import { parseXml, fetchDocument, isoFromAny, pagePostedDate, StructureError } from './common.mjs'

export const FEED = 'https://www.villageofgrayslake.com/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml'

export function parseRss(xml) {
  const doc = parseXml(xml)
  if (!doc.querySelector('rss > channel')) throw new StructureError('not an RSS 2.0 document')
  return [...doc.querySelectorAll('channel > item')].map(it => {
    const t = sel => it.querySelector(sel)?.textContent?.trim() ?? null
    return { title: t('title'), link: t('link'), guid: t('guid'), pubDate: t('pubDate'), description: t('description') }
  })
}

export default {
  name: 'village-newsflash',
  sourceUrl: FEED,
  snapshot: 'always',

  async discover(ctx) {
    const res = await ctx.http(FEED)
    if (!res.ok) throw new Error(`HTTP ${res.status}${res.error ? ' ' + res.error : ''} for ${FEED}`)
    const items = parseRss(res.bytes.toString('utf8'))
    return {
      candidates: items.filter(i => i.link).map(i => ({
        key: i.guid ?? i.link,
        url: i.link,
        title: i.title,
        published: isoFromAny(i.pubDate),
        meta: { feedDescription: i.description },
      })),
    }
  },

  async fetchItem(ctx, cand) {
    return fetchDocument(ctx, cand.url)
  },

  // The feed's pubDate is not the posting date: on Oct. 7, 2026 it dated
  // three items Sept. 17 whose pages said "Posted on" Oct. 2 to 6. The page's
  // own date wins (runner.mjs); a linked PDF has none, and the feed date stays.
  pageDate: pagePostedDate,
}
