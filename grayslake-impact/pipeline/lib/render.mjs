/**
 * Renders drafted entries in the exact text format of the src/data files and
 * validates them by inserting them into temporary copies of those files and
 * loading the copies. The real files are only read.
 *
 * House style, as the files are written today:
 *   timeline.js, sources.js, actions.js   double-quoted strings
 *   updates.js                            single-quoted strings, newest first
 *   every file                            non-ASCII written as \uXXXX escapes,
 *                                         trailing commas, two-space indent
 *                                         per level, long descriptions on
 *                                         their own line
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { ROOT } from './config.mjs'

export const CATEGORIES = ['approval', 'opposition', 'development', 'construction', 'legal', 'policy']
export const TIMELINE_DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?|-Q[1-4])?$/
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A JS string literal in the files' style. */
export function jsString(s, quote = '"') {
  let out = ''
  for (const ch of String(s)) {
    const cp = ch.codePointAt(0)
    if (ch === '\\') out += '\\\\'
    else if (ch === quote) out += '\\' + quote
    else if (ch === '\n') out += '\\n'
    else if (cp < 0x20) out += '\\u' + cp.toString(16).padStart(4, '0')
    else if (cp > 0x7e) {
      out += cp > 0xffff
        ? [...String.fromCodePoint(cp)].map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')
        : '\\u' + cp.toString(16).padStart(4, '0')
    } else out += ch
  }
  return quote + out + quote
}

function renderObject(fields, { quote = '"', indent = '  ', longKeys = ['description'] } = {}) {
  const inner = indent + '  '
  const lines = [`${indent}{`]
  for (const [k, v] of fields) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) lines.push(`${inner}${k}: [${v.map(x => jsString(x, quote)).join(', ')}],`)
    else if (typeof v === 'object') lines.push(`${inner}${k}: { ${Object.entries(v).filter(([, x]) => x !== undefined && x !== null).map(([a, x]) => `${a}: ${jsString(x, quote)}`).join(', ')} },`)
    else if (longKeys.includes(k)) lines.push(`${inner}${k}:`, `${inner}  ${jsString(v, quote)},`)
    else lines.push(`${inner}${k}: ${jsString(v, quote)},`)
  }
  lines.push(`${indent}},`)
  return lines.join('\n')
}

export function renderTimelineEntry(e) {
  const keys = e.sourceKeys?.length > 1 ? [['sourceKeys', e.sourceKeys]] : [['sourceKey', e.sourceKey ?? e.sourceKeys?.[0]]]
  return renderObject([['date', e.date], ['title', e.title], ['description', e.description], ['category', e.category], ...keys])
}

export function renderSourceEntry(key, s) {
  const body = renderObject([
    ['category', s.category], ['title', s.title], ['publisher', s.publisher], ['author', s.author], ['date', s.date],
    ['byline', s.byline], ['url', s.url], ['archiveUrl', s.archiveUrl], ['note', s.note],
  ], { longKeys: ['note'], indent: '  ' })
  // sources.js is an object keyed by source key: `  key: {` rather than `  {`.
  return body.replace(/^ {2}\{/, `  ${key}: {`)
}

export function renderUpdateEntry(u) {
  return renderObject([['date', u.date], ['kind', u.kind], ['title', u.title], ['description', u.description], ['link', u.link], ['linkLabel', u.linkLabel]], { quote: "'" })
}

export function renderActionEntry(a) {
  return renderObject([
    ['id', a.id], ['date', a.date], ['jurisdiction', a.jurisdiction], ['actionType', a.actionType], ['description', a.description],
    ['outcome', a.outcome], ['sourceIds', a.sourceIds], ['status', a.status], ['lastVerified', a.lastVerified],
  ])
}

const DATA_FILES = ['timeline.js', 'sources.js', 'updates.js', 'actions.js']

/**
 * The text of each data file with a draft's snippets inserted, read from the
 * real files and returned as strings; the real files are not written.
 *   timeline.js, actions.js   appended before the closing line of the array
 *   sources.js                appended before the closing line of the object
 *   updates.js                first in the array (newest first)
 */
export function applySnippets(d, dataDir = join(ROOT, 'src/data')) {
  const src = f => readFileSync(join(dataDir, f), 'utf8')
  // Insert before the line that closes the exported array or object ("]",
  // "];", "}" or "};" at the start of a line, the last one in the file).
  const insertBeforeLast = (text, closer, snippet) => {
    const i = text.lastIndexOf('\n' + closer)
    if (i === -1) throw new Error(`no closing ${closer} line in file`)
    return text.slice(0, i + 1) + snippet + '\n' + text.slice(i + 1)
  }
  return {
    'timeline.js': d.timeline ? insertBeforeLast(src('timeline.js'), ']', d.timeline) : src('timeline.js'),
    'sources.js': d.source ? insertBeforeLast(src('sources.js'), '}', d.source) : src('sources.js'),
    'updates.js': d.update ? src('updates.js').replace(/export const updates = \[\r?\n/, m => m + d.update + '\n') : src('updates.js'),
    'actions.js': d.action ? insertBeforeLast(src('actions.js'), ']', d.action) : src('actions.js'),
  }
}
export { DATA_FILES }

/** Inserts snippets into copies of the data files and loads them. */
export async function validateDraft(d) {
  const dir = mkdtempSync(join(tmpdir(), 'draft-validate-'))
  const errors = []
  try {
    const files = applySnippets(d)
    for (const [f, text] of Object.entries(files)) {
      const p = join(dir, f)
      writeFileSync(p, text)
      try { execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' }) } catch (e) { errors.push(`${f}: syntax: ${e.stderr?.toString().split('\n').find(Boolean)}`) }
    }
    if (errors.length) return { ok: false, errors }
    const load = async f => import(pathToFileURL(join(dir, f)).href + `?v=${Date.now()}`)
    const { timelineEvents } = await load('timeline.js')
    const { sources } = await load('sources.js')
    const { updates } = await load('updates.js')
    const { actions } = await load('actions.js')

    if (d.timeline) {
      const e = timelineEvents.at(-1)
      if (!TIMELINE_DATE.test(e.date)) errors.push(`timeline date "${e.date}" is not YYYY, YYYY-MM, YYYY-MM-DD or YYYY-Qn`)
      if (!CATEGORIES.includes(e.category)) errors.push(`timeline category "${e.category}" is not one of ${CATEGORIES.join(', ')}`)
      for (const k of [e.sourceKey, ...(e.sourceKeys ?? [])].filter(Boolean)) if (!sources[k]) errors.push(`timeline cites unknown source "${k}"`)
      if (!e.title || !e.description) errors.push('timeline entry needs a title and a description')
    }
    if (d.update) {
      const u = updates[0]
      if (!ISO_DATE.test(u.date)) errors.push(`updates.js date "${u.date}" is not ISO`)
      if (!['added', 'corrected', 'removed'].includes(u.kind)) errors.push(`updates.js kind "${u.kind}" is not added, corrected or removed`)
    }
    if (d.action) {
      const a = actions.at(-1)
      for (const k of a.sourceIds ?? []) if (!sources[k]) errors.push(`actions.js cites unknown source "${k}"`)
      if (!ISO_DATE.test(a.date) && !/^\d{4}-\d{2}$/.test(a.date)) errors.push(`actions.js date "${a.date}" is not ISO`)
    }
    return { ok: errors.length === 0, errors }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
