/**
 * Village of Grayslake YouTube channel (meeting livestreams and recordings).
 *
 * Primary: the channel's public RSS feed. As of 2026-10-01 YouTube answers
 * 404 for every channel's feed (tested with several channels and user
 * agents), so there is a fallback: the YouTube Data API v3 uploads playlist,
 * used only when YOUTUBE_API_KEY is set. The channel page itself is not
 * scraped. With neither available, discover throws SourceUnavailable and the
 * runner records a failure for the health check.
 *
 * An item is the video's title and description only. Meeting audio is not
 * transcribed here, and auto-captions are never verbatim evidence (plan §5.6),
 * so every video item is flagged for a person to watch.
 */
import { parseXml, isoFromAny, StructureError, SourceUnavailable } from './common.mjs'

export const CHANNEL_ID = 'UCPnLOnmTu9VhW0paDWubHhw'
export const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`

export function parseAtom(xml) {
  const doc = parseXml(xml)
  if (!doc.querySelector('feed')) throw new StructureError('not an Atom feed')
  return [...doc.getElementsByTagName('entry')].map(e => {
    const byTag = tag => e.getElementsByTagName(tag)[0]?.textContent?.trim() ?? null
    return {
      videoId: byTag('yt:videoId'),
      title: byTag('title'),
      published: byTag('published'),
      description: byTag('media:description'),
    }
  }).filter(v => v.videoId)
}

async function viaApi(ctx, key) {
  const playlist = 'UU' + CHANNEL_ID.slice(2)
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${playlist}&key=${encodeURIComponent(key)}`
  const res = await ctx.http(url)
  if (!res.ok) throw new SourceUnavailable(`YouTube Data API HTTP ${res.status}`)
  const data = JSON.parse(res.bytes.toString('utf8'))
  return (data.items ?? []).map(i => ({
    videoId: i.snippet?.resourceId?.videoId,
    title: i.snippet?.title,
    published: i.snippet?.publishedAt,
    description: i.snippet?.description,
  })).filter(v => v.videoId)
}

export default {
  name: 'village-youtube',
  sourceUrl: FEED,
  snapshot: 'never',   // Wayback does not usefully archive video pages

  async discover(ctx) {
    let videos
    let via = 'rss'
    const res = await ctx.http(FEED)
    if (res.ok) {
      videos = parseAtom(res.bytes.toString('utf8'))
    } else if (ctx.env.YOUTUBE_API_KEY) {
      videos = await viaApi(ctx, ctx.env.YOUTUBE_API_KEY)
      via = 'data-api'
    } else {
      throw new SourceUnavailable(`YouTube RSS HTTP ${res.status} and no YOUTUBE_API_KEY for the Data API fallback`)
    }
    return {
      via,
      candidates: videos.map(v => ({
        key: v.videoId,
        url: `https://www.youtube.com/watch?v=${v.videoId}`,
        // The watch URL does not name the channel; the tier comes from the feed.
        tierUrl: FEED,
        title: v.title,
        published: isoFromAny(v.published),
        meta: { videoId: v.videoId, description: v.description, via },
      })),
    }
  },

  async fetchItem(ctx, cand) {
    return {
      kind: 'video',
      text: [cand.title, cand.meta.description].filter(Boolean).join('\n\n'),
      needsHumanReview: 'Video content is not transcribed; watch the recording. Auto-captions are not verbatim evidence.',
    }
  },
}
