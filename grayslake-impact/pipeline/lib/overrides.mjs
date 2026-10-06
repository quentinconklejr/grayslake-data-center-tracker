/**
 * Guard overrides (config/guard-overrides.yaml): recorded exceptions for a
 * guard failure that the source does support but its extracted text cannot
 * show, such as a case number typed into an underscored blank.
 *
 * An override is never taken on trust. It applies to one failure (entry,
 * check, value) only while its passage is still in the cited source's stored
 * text and, normalized, contains the value. If the passage is gone or no
 * longer matches, the override is reported as stale and the failure stands.
 */
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { CONFIG_DIR, readYaml } from './config.mjs'

const NORMALIZE = {
  strip_underscores: s => String(s).replace(/[_\s]+/g, ''),
  none: s => String(s),
}

export function loadOverrides(path = join(CONFIG_DIR, 'guard-overrides.yaml')) {
  if (!existsSync(path)) return []
  const list = readYaml(path)?.overrides ?? []
  for (const o of list) {
    for (const k of ['entry', 'check', 'value', 'source', 'passage', 'reason']) {
      if (!o[k]) throw new Error(`guard override missing "${k}": ${JSON.stringify(o)}`)
    }
    if (!NORMALIZE[o.normalize ?? 'none']) throw new Error(`guard override: unknown normalize "${o.normalize}"`)
  }
  return list
}

/**
 * entry: the timeline entry; failures: the guard's failures for it;
 * textOf(key): the cited source's stored text (or null).
 * Returns the failures that remain, the overrides applied and any stale ones.
 */
export function applyOverrides(entry, failures, textOf, overrides) {
  const mine = overrides.filter(o => o.entry.date === entry.date && o.entry.title === entry.title)
  const applied = [], stale = []
  const remaining = failures.filter(f => {
    const o = mine.find(x => x.check === f.check && String(x.value) === String(f.value))
    if (!o) return true
    const text = textOf(o.source) ?? ''
    const norm = NORMALIZE[o.normalize ?? 'none']
    if (text.includes(o.passage) && norm(o.passage).includes(norm(o.value))) {
      applied.push({ check: o.check, value: o.value, source: o.source, passage: o.passage, reason: o.reason })
      return false
    }
    stale.push({ check: o.check, value: o.value, source: o.source, why: text.includes(o.passage) ? 'passage does not contain the value' : 'passage not in the source text' })
    return true
  })
  return { failures: remaining, applied, stale }
}
