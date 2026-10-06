#!/usr/bin/env node
/**
 * Builds the text corpus for every source the timeline cites, into the
 * private store (corpus/sources/<key>.json and corpus/raw/).
 *
 *   npm run pipeline:corpus              fetch what is missing
 *   npm run pipeline:corpus -- --force   refetch everything
 *
 * This is the one Stage A step that uses the network, and only to read the
 * public pages the site already cites. Where a source has a Wayback copy the
 * archived bytes are used (the `id_` form, without the toolbar), which is the
 * copy the owner checked when adding it; otherwise the live URL. Mirrored
 * PDFs and the FOIA split files are read from public/. The county parcel
 * layer is structured data, so its "text" is the committed snapshot's records.
 *
 * Nothing is written to this repository.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, loadPipelineConfig } from '../lib/config.mjs'
import { openStore } from '../lib/store.mjs'
import { makeFetcher, looksLikeBotWall, waybackRaw } from '../lib/http.mjs'
import { htmlToText, pdfToText } from '../lib/text.mjs'
import { log, takeWarnings } from '../lib/log.mjs'
import { sources } from '../../src/data/sources.js'
import { timelineEvents } from '../../src/data/timeline.js'

const force = process.argv.includes('--force')
const cfg = loadPipelineConfig()
const store = openStore(cfg.private_store.dir)
const politeFetch = makeFetcher(cfg.http)
const sha = b => createHash('sha256').update(b).digest('hex')

const keys = [...new Set(timelineEvents.flatMap(e => e.sourceKeys ?? (e.sourceKey ? [e.sourceKey] : [])))].sort()

function parcelsText() {
  const gj = JSON.parse(readFileSync(join(ROOT, 'src/data/parcels.geojson'), 'utf8'))
  const lines = gj.features.map(f => {
    const p = f.properties
    return `PIN ${p.pin}; acres ${p.acres}; owner ${p.owner}; sale amount ${p.saleAmount ?? 'none'}; sale date ${p.saleDate ?? 'none'}`
  })
  return { text: lines.join('\n'), retrieved: gj.metadata?.retrieved }
}

function fromPdfFile(path) {
  const bytes = readFileSync(path)
  const pdf = pdfToText(path, cfg.tools.pdftotext)
  return { bytes, pdf }
}

async function fetchRemote(url, label) {
  const res = await politeFetch(url)
  if (!res.ok) return { error: `${label}: HTTP ${res.status}${res.error ? ' ' + res.error : ''}` }
  const isPdf = /pdf/i.test(res.contentType) || res.bytes.subarray(0, 5).toString() === '%PDF-'
  if (isPdf) {
    const pdf = pdfToText(res.bytes, cfg.tools.pdftotext)
    return { res, kind: 'pdf', text: pdf.text, pages: pdf.pages.map(p => ({ page: p.page, chars: p.chars })), scannedPages: pdf.scannedPages }
  }
  const html = res.bytes.toString('utf8')
  if (looksLikeBotWall(html)) return { error: `${label}: bot wall` }
  const h = htmlToText(html, res.finalUrl)
  return { res, kind: 'html', text: h.text, fullText: h.fullText, extractor: h.extractor, meta: h.meta }
}

const summary = []
for (const key of keys) {
  const s = sources[key]
  const rel = `corpus/sources/${key}.json`
  if (!s) { log.warn('timeline cites a key that is not in sources.js', { key }); continue }
  if (!force && store.exists(rel)) { summary.push([key, 'cached', store.readJson(rel).origin]); continue }

  const rec = { key, title: s.title, publisher: s.publisher, author: s.author ?? null, date: s.date, url: s.url, archiveUrl: s.archiveUrl ?? null, fetchedAt: new Date().toISOString(), warnings: [] }
  try {
    if (key === 'lakecountygis') {
      const p = parcelsText()
      Object.assign(rec, { origin: 'structured', kind: 'records', text: p.text, note: `Committed snapshot of the county layer, retrieved ${p.retrieved}. Records, not prose: totals are computed, not stated.` })
    } else if (s.localCopy) {
      const { bytes, pdf } = fromPdfFile(join(ROOT, 'public', s.localCopy))
      store.writeBytes(`corpus/raw/${key}.pdf`, bytes)
      Object.assign(rec, { origin: 'local-pdf', kind: 'pdf', fetchedUrl: s.localCopy, sha256: sha(bytes), text: pdf.text, pages: pdf.pages.map(p => ({ page: p.page, chars: p.chars })), scannedPages: pdf.scannedPages })
    } else if (s.url?.startsWith('/records/')) {
      const dir = join(ROOT, 'public', 'records', 't5')
      const files = readdirSync(dir).filter(f => f.endsWith('.pdf')).sort()
      const parts = []
      const scanned = []
      for (const f of files) {
        const { pdf } = fromPdfFile(join(dir, f))
        parts.push(`=== ${f} ===\n${pdf.text}`)
        scanned.push(...pdf.scannedPages.map(p => `${f}#${p}`))
      }
      Object.assign(rec, { origin: 'local-pdf', kind: 'pdf', fetchedUrl: '/records/t5/*.pdf', files, text: parts.join('\n\n'), scannedPages: scanned })
    } else {
      let got = null
      if (s.archiveUrl) {
        got = await fetchRemote(waybackRaw(s.archiveUrl), 'wayback')
        if (got.error) rec.warnings.push(got.error)
        else rec.origin = 'wayback'
      }
      if ((!got || got.error) && s.url && !['dead', 'unverified'].includes(s.status)) {
        const target = s.url.startsWith('https://web.archive.org/') ? waybackRaw(s.url) : s.url
        got = await fetchRemote(target, 'live')
        if (got.error) rec.warnings.push(got.error)
        else rec.origin = target.includes('web.archive.org') ? 'wayback' : 'live'
      }
      // Last resort: the closest existing Wayback snapshot. Unlike archiveUrl,
      // nobody has checked this one, so the record says so.
      if ((!got || got.error) && s.url && /^https?:/.test(s.url)) {
        const av = await politeFetch(`https://archive.org/wayback/available?url=${s.url.replace(/[?&#]/g, encodeURIComponent)}`)
        const snap = av.ok ? JSON.parse(av.bytes.toString('utf8'))?.archived_snapshots?.closest : null
        if (snap?.available && snap.status === '200') {
          got = await fetchRemote(waybackRaw(snap.url.replace(/^http:/, 'https:')), 'wayback-closest')
          if (got.error) rec.warnings.push(got.error)
          else { rec.origin = 'wayback-closest'; rec.warnings.push(`used unverified closest snapshot ${snap.timestamp}`) }
        } else {
          rec.warnings.push('no Wayback snapshot exists')
        }
      }
      if (!got || got.error) {
        Object.assign(rec, { origin: 'unavailable', text: '' })
      } else {
        const ext = got.kind === 'pdf' ? 'pdf' : 'html'
        store.writeBytes(`corpus/raw/${key}.${ext}`, got.res.bytes)
        Object.assign(rec, {
          kind: got.kind, fetchedUrl: got.res.finalUrl, status: got.res.status, contentType: got.res.contentType,
          sha256: sha(got.res.bytes), text: got.text, fullText: got.fullText, extractor: got.extractor,
          pages: got.pages, scannedPages: got.scannedPages, pageMeta: got.meta,
        })
      }
    }
  } catch (err) {
    rec.origin = 'error'
    rec.text = ''
    rec.warnings.push(err.message)
  }
  if (rec.text && rec.text.length < 1500 && rec.kind === 'html') rec.warnings.push(`thin text (${rec.text.length} chars): possibly a paywall or teaser`)
  if (rec.scannedPages?.length) rec.warnings.push(`${rec.scannedPages.length} page(s) with no text layer (scans): not checkable`)
  for (const w of rec.warnings) log.warn(`${key}: ${w}`)
  store.writeJson(rel, rec)
  summary.push([key, rec.origin, `${rec.text.length} chars`, rec.extractor ?? '', rec.warnings.join('; ')])
}

console.log('\nCorpus:')
for (const row of summary) console.log('  ' + row.filter(Boolean).join(' | '))
const w = takeWarnings()
console.log(`\n${keys.length} sources, ${w.length} warning(s). Written to ${store.path('corpus')}`)
