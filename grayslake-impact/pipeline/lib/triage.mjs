/**
 * Triage: does an item go to the model for extraction?
 *
 * Deterministic keyword and entity matching only (rules in
 * config/pipeline.yaml under `triage`). No model is involved in deciding
 * relevance, so a filtered item can always be explained by which terms it
 * lacked.
 *
 * For PDFs the matching pages are also selected (plus `page_context` pages on
 * each side), so a 200-page packet sends only the pages about the project to
 * extraction. The selection is reported, and pages left out are logged.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './config.mjs'

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const termRe = (terms, flags = 'gi') => terms.length ? new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map(t => esc(t).replace(/\\? /g, '\\s+')).join('|')})(?![\\p{L}\\p{N}])`, flags + 'u') : null

/** T5 parcel PINs from the committed parcel snapshot, in both written forms
 *  (1010200018 and 10-10-200-018). */
export function parcelPins() {
  const gj = JSON.parse(readFileSync(join(ROOT, 'src/data/parcels.geojson'), 'utf8'))
  const pins = new Set()
  for (const f of gj.features) {
    const p = String(f.properties.pin)
    pins.add(p)
    if (p.length === 10) pins.add(`${p.slice(0, 2)}-${p.slice(2, 4)}-${p.slice(4, 7)}-${p.slice(7)}`)
  }
  return [...pins]
}

export function makeTriage(tcfg, pins = parcelPins()) {
  const strong = termRe([...(tcfg.strong_terms ?? []), ...pins])
  const project = termRe(tcfg.project_terms ?? [])
  const local = termRe(tcfg.local_terms ?? [])
  const t5 = /(?<![\p{L}\p{N}])T5(?![\p{L}\p{N}])/gu   // upper case only

  const hits = (re, text) => {
    if (!re) return []
    const out = new Map()
    for (const m of String(text).matchAll(re)) {
      const k = m[0].replace(/\s+/g, ' ')
      out.set(k, (out.get(k) ?? 0) + 1)
    }
    return [...out.entries()].map(([term, count]) => ({ term, count }))
  }

  function judge(text) {
    const h = { strong: hits(strong, text), project: hits(project, text), local: hits(local, text), t5: hits(t5, text) }
    if (h.strong.length) return { match: true, rule: 'A', reason: `strong term: ${h.strong.map(x => x.term).join(', ')}`, hits: h }
    if (h.project.length && h.local.length) return { match: true, rule: 'B', reason: `project term (${h.project[0].term}) with local term (${h.local[0].term})`, hits: h }
    if (h.t5.length && (h.project.length || h.local.length)) return { match: true, rule: 'C', reason: `"T5" with ${h.project.length ? 'project' : 'local'} term`, hits: h }
    const reason = h.project.length ? 'project term without any local term'
      : h.t5.length ? '"T5" without a project or local term'
      : h.local.length ? 'local terms only, no project or T5 term'
      : 'no project, T5 or local terms'
    return { match: false, rule: null, reason, hits: h }
  }

  /**
   * pages: [{ page, text }] for PDFs, or null.
   * Returns the judgement plus, for a matching PDF, the selected page numbers
   * and the text to extract from.
   */
  function triage(item, pages = null) {
    const whole = judge(`${item.title ?? ''}\n${item.text ?? ''}`)
    if (!whole.match || !pages?.length) return { ...whole, text: item.text ?? '', pages: null }
    const ctx = tcfg.page_context ?? 1
    const keep = new Set()
    for (const p of pages) {
      if (judge(p.text).match || hits(strong, p.text).length || hits(project, p.text).length || hits(t5, p.text).length) {
        for (let d = -ctx; d <= ctx; d++) keep.add(p.page + d)
      }
    }
    const selected = pages.filter(p => keep.has(p.page))
    // The document matched as a whole but no single page did (terms split
    // across pages): keep everything rather than drop it.
    const use = selected.length ? selected : pages
    return {
      ...whole,
      pages: use.map(p => p.page),
      pagesTotal: pages.length,
      text: use.map(p => `[page ${p.page}]\n${p.text}`).join('\n\n'),
    }
  }

  return { judge, triage }
}
