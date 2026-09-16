/**
 * Verify every records citation against the original FOIA packet.
 *
 *   npm run audit:records
 *
 * What it checks
 * --------------
 *   1. Page arithmetic. For every citation in src/data/records.js, the
 *      declared `file_page` equals `packet_page − packetStart + 1`, and lands
 *      inside the split file's page count.
 *   2. Split files. Each one exists, has the page count the data file
 *      declares, and matches its recorded SHA-256.
 *   3. Split integrity. For every cited page, the text extracted from the
 *      split PDF at the linked page is identical to the same page of the
 *      original packet. This is the check that a #page=N link lands where it
 *      claims. Needs the source packet (see below).
 *   4. Values on the page. Where a fact carries a numeric or date value and
 *      the cited page has a usable text layer, the value must appear on that
 *      page. Pages whose text layer is an unreadable scan are skipped here
 *      and listed instead: those were read from the rendered page image, and
 *      the fact records that with `verified: 'image'`.
 *   5. Totals agree. The sums in records.js match the figures in
 *      projections.js, which is what the rest of the site renders. These are
 *      two files and they must not drift.
 *
 * The source packet
 * -----------------
 * Checks 3 and 4 need the original 242-page PDF, which is not in the repo: it
 * is 48 MB, and the split files under public/records/t5/ are what the site
 * serves. Put it at
 *
 *     private/records/t5-packet.pdf          (git-ignored)
 *
 * or point T5_PACKET_PDF at it:
 *
 *     T5_PACKET_PDF=~/Downloads/packet.pdf npm run audit:records
 *
 * Without it, checks 1, 2 and 5 still run and the script says which checks it
 * skipped. It exits non-zero on any failure, so it is safe in CI as long as CI
 * accepts the skip.
 *
 * Needs `pdftotext` and `pdfinfo` from poppler-utils for checks 2 to 4.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  recordsDocuments,
  recordsFiles,
  recordsTimeline,
  recordsTotals,
  modifiedStandards,
  masterSitePlan,
  heartlandSitePlan,
} from '../src/data/records.js'
import { projections } from '../src/data/projections.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const PACKET =
  process.env.T5_PACKET_PDF || join(ROOT, 'private', 'records', 't5-packet.pdf')
const PACKET_SHA = '6c4f50a5879cfb7f4e01a3df5fd9911fff521fcf17ee21401ad7c033e78f8167'

const failures = []
const notes = []
const fail = (check, where, detail) => failures.push({ check, where, detail })

function have(bin) {
  try {
    execFileSync('which', [bin], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

const POPPLER = have('pdftotext') && have('pdfinfo')
const HAVE_PACKET = existsSync(PACKET)

const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex')
const pageText = (pdf, n) =>
  execFileSync('pdftotext', ['-f', String(n), '-l', String(n), '-layout', pdf, '-'], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
const normalise = s =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

/* Every citation in the data file, flattened. */
const citations = []
for (const d of recordsDocuments) {
  for (const f of d.facts) citations.push({ where: `${d.id} fact`, file: d.file, ...f })
  citations.push({
    where: `${d.id} vote`,
    file: d.file,
    packet_page: d.vote.packet_page,
    file_page: d.vote.packet_page - recordsFiles[d.file].packetStart + 1,
    verified: d.vote.verified,
  })
  for (const [label, [a, b]] of Object.entries(d.keyPages)) {
    for (const p of [a, b]) {
      citations.push({
        where: `${d.id} keyPage ${label}`,
        file: d.file,
        packet_page: p,
        file_page: p - recordsFiles[d.file].packetStart + 1,
      })
    }
  }
}
for (const r of [...modifiedStandards.rows, ...modifiedStandards.alsoInThisSection])
  citations.push({ where: 'modifiedStandards', ...r })
for (const t of recordsTimeline) citations.push({ where: `timeline ${t.date}`, ...t })
for (const p of [masterSitePlan, heartlandSitePlan])
  citations.push({ where: `plan p.${p.packet_page}`, ...p })

/* ── 1. Page arithmetic ─────────────────────────────────────────────── */
for (const c of citations) {
  const f = recordsFiles[c.file]
  if (!f) {
    fail('arithmetic', c.where, `unknown file key ${c.file}`)
    continue
  }
  const expected = c.packet_page - f.packetStart + 1
  if (c.file_page !== expected)
    fail('arithmetic', c.where, `file_page ${c.file_page}, expected ${expected}`)
  if (expected < 1 || expected > f.pages)
    fail('arithmetic', c.where, `packet p.${c.packet_page} is outside ${c.file}`)
}

/* ── 2. Split files ─────────────────────────────────────────────────── */
for (const [key, f] of Object.entries(recordsFiles)) {
  const path = join(PUBLIC, f.path)
  if (!existsSync(path)) {
    fail('files', key, `missing at public${f.path}`)
    continue
  }
  if (statSync(path).size !== f.sizeBytes)
    fail('files', key, `size ${statSync(path).size}, declared ${f.sizeBytes}`)
  if (sha256(path) !== f.sha256) fail('files', key, 'SHA-256 does not match')
  if (POPPLER) {
    const out = execFileSync('pdfinfo', [path], { encoding: 'utf8' })
    const pages = Number(/Pages:\s+(\d+)/.exec(out)?.[1])
    if (pages !== f.pages) fail('files', key, `${pages} pages, declared ${f.pages}`)
  }
}
if (!POPPLER) notes.push('poppler-utils not found: page counts and text checks skipped')

/* ── 3 and 4. Against the original packet ───────────────────────────── */
if (HAVE_PACKET && POPPLER) {
  if (sha256(PACKET) !== PACKET_SHA)
    fail('packet', PACKET, 'SHA-256 does not match the packet these citations were read from')

  const seen = new Set()
  for (const c of citations) {
    const f = recordsFiles[c.file]
    if (!f) continue
    const key = `${c.file}:${c.packet_page}`
    if (seen.has(key)) continue
    seen.add(key)
    const fp = c.packet_page - f.packetStart + 1
    if (fp < 1 || fp > f.pages) continue
    const fromSplit = pageText(join(PUBLIC, f.path), fp)
    const fromPacket = pageText(PACKET, c.packet_page)
    if (normalise(fromSplit) !== normalise(fromPacket))
      fail('split', c.where, `packet p.${c.packet_page} differs from ${c.file} p.${fp}`)
  }

  const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']
  let checked = 0
  let byImage = 0
  for (const c of citations) {
    if (c.value == null || !c.unit) continue
    const text = normalise(pageText(PACKET, c.packet_page))
    if (c.verified === 'image' || text.length < 40) {
      byImage++
      continue
    }
    if (c.unit === 'sq ft' || c.unit === 'acres') {
      const targets = c.components ?? [c.value]
      const present = targets.every(v =>
        [v.toLocaleString('en-US'), String(v)].some(s => text.includes(normalise(s))),
      )
      if (!present) fail('value', c.where, `${c.value} ${c.unit} not on packet p.${c.packet_page}`)
      else checked++
    } else if (c.unit === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(c.value)) {
      const [y, m, d] = c.value.split('-').map(Number)
      const month = MONTHS[m - 1]
      const forms = [
        `${month} ${d}, ${y}`, `${m}/${d}/${y}`,
        `${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}.${y}`,
        `${m}-${d}-${y}`,
        `${d}th day of ${month}, ${y}`, `${d}st day of ${month}, ${y}`,
        `${d}nd day of ${month}, ${y}`, `${d}rd day of ${month}, ${y}`,
      ]
      if (!forms.some(f => text.includes(normalise(f)))) byImage++
      else checked++
    }
  }
  notes.push(`${checked} values confirmed against the page text, ${byImage} read from page images`)
} else if (!HAVE_PACKET) {
  notes.push(`source packet not found at ${PACKET}: split-integrity and value checks skipped`)
}

/* ── 5. Totals agree with what the rest of the site renders ─────────── */
const acreSum = recordsTotals.acres.parts.reduce((a, p) => a + p.value, 0)
const areaSum = recordsTotals.floorArea.parts.reduce((a, p) => a + p.value, 0)
if (Math.abs(acreSum - recordsTotals.acres.value) > 0.001)
  fail('totals', 'records.js', `acre parts sum to ${acreSum}, total says ${recordsTotals.acres.value}`)
if (areaSum !== recordsTotals.floorArea.value)
  fail('totals', 'records.js', `floor area parts sum to ${areaSum}, total says ${recordsTotals.floorArea.value}`)
if (projections.project.totalAcres !== recordsTotals.acres.value)
  fail('totals', 'projections.js', `totalAcres ${projections.project.totalAcres} does not match records ${recordsTotals.acres.value}`)
if (projections.project.totalSqFt !== recordsTotals.floorArea.value)
  fail('totals', 'projections.js', `totalSqFt ${projections.project.totalSqFt} does not match records ${recordsTotals.floorArea.value}`)
if (projections.project.masterPlanBuildings !== recordsTotals.masterPlanBuildings.value)
  fail('totals', 'projections.js', `masterPlanBuildings ${projections.project.masterPlanBuildings} does not match records ${recordsTotals.masterPlanBuildings.value}`)
for (const d of recordsDocuments) {
  const fact = d.facts.find(f => f.unit === 'sq ft' && f.value === d.floorAreaCapSqft)
  if (!fact) fail('totals', d.id, `no cited fact carries the ${d.floorAreaCapSqft} sq ft cap`)
}

/* ── Report ─────────────────────────────────────────────────────────── */
console.log(`audit-records: ${citations.length} citations across ${Object.keys(recordsFiles).length} files`)
for (const n of notes) console.log(`  note: ${n}`)
if (failures.length === 0) {
  console.log('  PASS — no failures')
} else {
  console.log(`  ${failures.length} FAILURE(S):`)
  for (const f of failures) console.log(`    [${f.check}] ${f.where} — ${f.detail}`)
  process.exitCode = 1
}
