/**
 * Shared helpers for fetchers.
 *
 * A fetcher is { name, sourceUrl, snapshot, discover(ctx), fetchItem(ctx, candidate) }.
 *   discover   returns { candidates: [{ key, url, title, published, tierUrl?, meta? }] }
 *              and throws StructureError when the page no longer looks the way
 *              the parser expects, so a redesign is noticed instead of being
 *              read as "nothing new"
 *   fetchItem  returns { kind, text, bytes?, contentType?, pages?, scannedPages?, meta? }
 *   pageDate   optional (doc) => ISO date the fetched page or document prints
 *              for itself. When present it is the item's date, for the
 *              first-run window and every dated field; the listing's date is
 *              kept as meta.listedDate
 *   snapshot   'always' (archive each new item's URL), 'page' (archive the
 *              candidate's snapshotTarget once per run), or 'after_triage'
 *              (Stage C decides)
 */
import { JSDOM, VirtualConsole } from 'jsdom'
import { htmlToText, pdfToText } from '../text.mjs'
import { extractDates } from '../guard.mjs'

export class StructureError extends Error {}
export class SourceUnavailable extends Error {}

const quiet = new VirtualConsole()
export const parseHtml = (html, url) => new JSDOM(html, { url, virtualConsole: quiet }).window.document
export const parseXml = xml => new JSDOM(xml, { contentType: 'text/xml', virtualConsole: quiet }).window.document

export function isPdf(bytes, contentType = '') {
  return /pdf/i.test(contentType) || bytes.subarray(0, 5).toString() === '%PDF-'
}

/** Bytes → text for the guard, by type. */
export function toText(bytes, contentType, url, pdftotext) {
  if (isPdf(bytes, contentType)) {
    const pdf = pdfToText(bytes, pdftotext)
    return { kind: 'pdf', text: pdf.text, pages: pdf.pages.map(p => ({ page: p.page, chars: p.chars })), scannedPages: pdf.scannedPages }
  }
  const h = htmlToText(bytes.toString('utf8'), url)
  return { kind: 'html', text: h.text, fullText: h.fullText, extractor: h.extractor, meta: h.meta }
}

/** Fetches a URL and returns its text, or throws with the HTTP status. */
export async function fetchDocument(ctx, url) {
  const res = await ctx.http(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}${res.error ? ' ' + res.error : ''} for ${url}`)
  return { ...toText(res.bytes, res.contentType, res.finalUrl, ctx.pdftotext), bytes: res.bytes, contentType: res.contentType, finalUrl: res.finalUrl }
}

/** ISO date (YYYY-MM-DD) from a slug like "VB-Agenda-Brief-2026-09-15-FINAL"
 *  or "Signed-April-16-2026-Regular-Minutes"; null if none. */
export function dateFromSlug(slug) {
  const s = String(slug ?? '')
  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const mdy = /(?<!\d)(\d{2})-(\d{2})-(\d{4})(?!\d)/.exec(s)
  if (mdy) return `${mdy[3]}-${mdy[1]}-${mdy[2]}`
  const d = extractDates(s.replace(/[-_]+/g, ' ')).find(x => x.year)
  return d ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : null
}

export function isoFromAny(s) {
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : new Date(t).toISOString()
}

/**
 * The date a CivicPlus page prints for itself: "Posted on October 06, 2026"
 * (News Flash detail pages, which also list "Related News" with their own
 * "Posted on" lines; only the text before that list counts). Falls back to
 * the page's article:published_time. ISO date, or null.
 */
export function pagePostedDate(doc) {
  const own = String(doc?.text ?? '').split(/\bRelated News\b/)[0]
  const m = /\bPosted on\s+([A-Z][a-z]+\.? \d{1,2},? \d{4})/.exec(own)
  const d = m ? extractDates(m[1]).find(x => x.year) : null
  if (d) return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
  const meta = doc?.meta?.published ? isoFromAny(doc.meta.published) : null
  return meta ? meta.slice(0, 10) : null
}
