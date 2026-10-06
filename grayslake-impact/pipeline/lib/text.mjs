/**
 * Turns fetched bytes into the text the guard checks against.
 *
 *   HTML  Mozilla Readability isolates the article; its HTML is then walked
 *         node by node, with a line break at every block element, so words in
 *         adjacent paragraphs never run together ("end.Next"), which would
 *         make a correct quote fail. The full-page text is kept too, for
 *         diagnosing quotes that sit outside the article body.
 *   PDF   poppler's pdftotext, one page at a time (form feed separated), in
 *         reading order rather than -layout, so a sentence is not broken up
 *         by column padding. Pages with almost no text are reported as
 *         probable scans; they are never OCR'd into evidence.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { JSDOM, VirtualConsole } from 'jsdom'
import { Readability } from '@mozilla/readability'

const BLOCK = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE',
  'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P',
  'PRE', 'SECTION', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
])
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'IFRAME', 'BUTTON', 'SELECT'])

export function domToText(node) {
  const parts = []
  const walk = n => {
    if (n.nodeType === 3) { parts.push(n.nodeValue); return }
    if (n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11) return
    const tag = n.tagName
    if (tag && SKIP.has(tag)) return
    const block = tag && BLOCK.has(tag)
    if (block) parts.push('\n')
    if (tag === 'TD' || tag === 'TH') parts.push(' ')
    for (const c of n.childNodes) walk(c)
    if (block) parts.push('\n')
  }
  walk(node)
  return parts.join('').replace(/[ \t\f\v ]*\n[\s]*/g, '\n').replace(/[ \t]+/g, ' ').trim()
}

export function htmlToText(html, url) {
  const quiet = new VirtualConsole()           // pages log CSS/script errors; ignore them
  const dom = new JSDOM(html, { url, virtualConsole: quiet })
  const doc = dom.window.document
  const meta = {
    title: doc.querySelector('meta[property="og:title"]')?.content ?? doc.title ?? null,
    byline: doc.querySelector('meta[name="author"]')?.content
      ?? doc.querySelector('meta[property="article:author"]')?.content ?? null,
    published: doc.querySelector('meta[property="article:published_time"]')?.content
      ?? doc.querySelector('time[datetime]')?.getAttribute('datetime') ?? null,
    canonical: doc.querySelector('link[rel="canonical"]')?.href ?? null,
  }
  const fullText = domToText(doc.body ?? doc)
  let text = fullText
  let extractor = 'full-page'
  try {
    const clone = new JSDOM(html, { url, virtualConsole: quiet }).window.document
    const article = new Readability(clone).parse()
    if (article?.content) {
      const frag = JSDOM.fragment(article.content)
      const t = domToText(frag)
      if (t.length > 200) { text = t; extractor = 'readability' }
      meta.byline ??= article.byline ?? null
      meta.title ??= article.title ?? null
    }
  } catch { /* fall back to the full page */ }
  dom.window.close()
  return { text, fullText, extractor, meta }
}

function findBinary(candidates) {
  for (const c of candidates) {
    try {
      if (c.includes('/') || c.includes('\\')) { if (existsSync(c)) return c; continue }
      execFileSync(c, ['-v'], { stdio: 'pipe' })
      return c
    } catch (e) {
      // pdftotext -v exits non-zero on some builds but still runs
      if (e.status !== undefined && e.code !== 'ENOENT') return c
    }
  }
  return null
}

/**
 * Returns { text, pages: [{ page, text, chars }], scannedPages: [n...] }.
 * `text` joins pages with "\n\n"; page boundaries are kept in `pages`.
 */
export function pdfToText(bytesOrPath, toolCandidates) {
  const bin = findBinary(toolCandidates)
  if (!bin) throw new Error(`pdftotext not found (tried ${toolCandidates.join(', ')})`)
  let path = bytesOrPath
  let tmp = null
  if (typeof bytesOrPath !== 'string') {
    tmp = mkdtempSync(join(tmpdir(), 'pdf-'))
    path = join(tmp, 'in.pdf')
    writeFileSync(path, bytesOrPath)
  }
  try {
    const out = execFileSync(bin, ['-enc', 'UTF-8', '-eol', 'unix', path, '-'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    const raw = out.split('\f')
    if (raw.length && raw.at(-1).trim() === '') raw.pop()
    const pages = raw.map((t, i) => ({ page: i + 1, text: t.trim(), chars: t.trim().length }))
    const scannedPages = pages.filter(p => p.chars < 40).map(p => p.page)
    return { text: pages.map(p => p.text).join('\n\n'), pages, scannedPages }
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true })
  }
}
