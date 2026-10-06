#!/usr/bin/env node
/**
 * OCR every stored scanned PDF (no text layer) with Windows' built-in OCR
 * (pipeline/scripts/ocr-windows.ps1), writing shadow/ocr/<sha256>.json and
 * recording `ocr` on the item.
 *
 *   npm run pipeline:ocr
 *
 * OCR text is for triage only: a scan whose OCR text matches the triage rules
 * goes to human review with the matching pages named. It is never extracted
 * or drafted from, because OCR misreads characters and so cannot satisfy the
 * verbatim guard.
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { loadPipelineConfig, ROOT } from '../lib/config.mjs'
import { openStore } from '../lib/store.mjs'

const cfg = loadPipelineConfig()
const store = openStore(cfg.private_store.dir)
const ps1 = join(ROOT, 'pipeline/scripts/ocr-windows.ps1')

function walk(dir, acc = []) {
  for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p, acc) : f.endsWith('.json') && acc.push(p) }
  return acc
}

let done = 0, failed = 0, skipped = 0
for (const p of walk(store.path('shadow/items'))) {
  const rel = p.slice(store.root.length + 1).replace(/\\/g, '/')
  const it = store.readJson(rel)
  if (it.kind !== 'pdf' || (it.textChars ?? 0) >= 200 || !it.rawPath) continue
  const out = `shadow/ocr/${it.rawSha256}.json`
  if (!existsSync(store.path(out))) {
    try {
      execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1, '-Pdf', store.path(it.rawPath), '-Out', store.path(out)], { stdio: 'pipe', timeout: 300_000 })
    } catch (e) {
      failed++
      console.warn(`OCR failed for ${it.id}: ${String(e.stderr ?? e.message).split('\n').find(Boolean)}`)
      continue
    }
  } else skipped++
  // Windows PowerShell 5.1 writes UTF-8 with a byte-order mark.
  const ocr = JSON.parse(readFileSync(store.path(out), 'utf8').replace(/^﻿/, ''))
  it.ocr = { path: out, engine: ocr.engine, language: ocr.language, pages: ocr.pages.length, chars: ocr.pages.reduce((s, x) => s + (x.text?.length ?? 0), 0), note: 'triage only; never verbatim evidence' }
  store.writeJson(rel, it)
  done++
  console.log(`${it.id}: ${it.ocr.pages} page(s), ${it.ocr.chars} chars`)
}
console.log(`\nOCR: ${done} scan(s) with OCR text (${skipped} already done), ${failed} failed`)
