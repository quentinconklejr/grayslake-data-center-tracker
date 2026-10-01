/**
 * The private store: a local clone of quentinconklejr/private-info, outside
 * this repository. Raw source text, leads, logs, benchmark output and
 * shadow-mode drafts are written here and nowhere else.
 *
 * Layout
 *   corpus/sources/<sourceKey>.json   text of each source the site cites
 *   corpus/raw/<sourceKey>.<ext>      the fetched bytes behind it
 *   reports/                          guard and benchmark reports
 *   logs/                             run logs, dropped-claims.jsonl
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'

export function openStore(dir) {
  const root = resolve(dir)
  if (!existsSync(join(root, '.git'))) {
    throw new Error(`private store ${root} is not a git clone. Clone it first:\n  gh repo clone quentinconklejr/private-info "${root}"`)
  }
  const path = (...p) => {
    const full = resolve(root, ...p)
    if (!full.startsWith(root)) throw new Error(`path escapes the private store: ${p.join('/')}`)
    return full
  }
  const ensure = file => mkdirSync(dirname(file), { recursive: true })
  return {
    root,
    path,
    writeJson(rel, data) { const f = path(rel); ensure(f); writeFileSync(f, JSON.stringify(data, null, 2) + '\n'); return f },
    readJson(rel) { const f = path(rel); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null },
    writeText(rel, text) { const f = path(rel); ensure(f); writeFileSync(f, text); return f },
    writeBytes(rel, bytes) { const f = path(rel); ensure(f); writeFileSync(f, bytes); return f },
    appendJsonl(rel, obj) { const f = path(rel); ensure(f); appendFileSync(f, JSON.stringify(obj) + '\n'); return f },
    exists(rel) { return existsSync(path(rel)) },
    list(rel) { const d = path(rel); return existsSync(d) ? readdirSync(d) : [] },
  }
}
