import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import ReportErrorLink from '../components/ui/ReportErrorLink'
import PageCite from '../components/records/PageCite'
import DocumentDownload from '../components/records/DocumentDownload'
import HashBlock from '../components/records/HashBlock'
import StatusPill from '../components/records/StatusPill'
import ScrollTable from '../components/records/ScrollTable'
import { formatBytes } from '../lib/formatBytes'
import { pageMeta } from '../data/pageMeta'
import { LAST_VERIFIED } from '../data/siteConfig'
import {
  recordsPackets,
  recordsDocuments,
  recordsTotals,
  recordsTimeline,
  modifiedStandards,
  masterSitePlan,
  heartlandSitePlan,
  notInPacket,
  openQuestionsForVillage,
} from '../data/records'

const packet = recordsPackets['t5-2024-2025']

const num = n => n.toLocaleString('en-US')

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── Summary figure ──────────────────────────────────────────────────
   Same rule-and-size treatment as the homepage figures: no card, no
   shadow, the qualifier sitting directly under the number so the figure
   cannot travel without the condition attached to it. */
function SummaryFigure({ label, value, qualifier, math, children }) {
  return (
    <div className="border-t border-rule-strong pt-4">
      <dt className="text-xs font-sans font-semibold text-ink-600">{label}</dt>
      <dd className="mt-2 text-2xl sm:text-[26px] font-display text-ink-900 tracking-tight leading-tight break-words">
        {value}
      </dd>
      <p className="mt-1.5 text-xs font-sans text-ink-600 leading-snug">{qualifier}</p>
      {math && (
        <p className="mt-2 text-2xs font-mono text-ink-500 leading-snug break-words">{math}</p>
      )}
      {children && <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1">{children}</p>}
    </div>
  )
}

function SignatureCell({ doc }) {
  return doc.signatureStatus === 'in-packet' ? (
    <span className="text-status-stated font-semibold">Yes</span>
  ) : (
    <span className="text-ink-600">Not in this copy</span>
  )
}

export default function RecordsT5() {
  const [copied, setCopied] = useState(false)

  function copyCitation() {
    navigator.clipboard?.writeText(packet.citation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Container size="default" className="py-10 sm:py-14 space-y-14">
      <PageTitle
        title={pageMeta['/records/t5'].title}
        description={pageMeta['/records/t5'].description}
        ogImage={pageMeta['/records/t5'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
          <Link to="/records" className="hover:text-accent underline underline-offset-4 decoration-rule">
            Public Records
          </Link>
        </p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          The approved T5 ordinances and site plans
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          The Village of Grayslake approved the T5@CHICAGO IV campus through five ordinances passed
          between {fmtDate(packet.approvalsFrom)} and {fmtDate(packet.approvalsTo)}. This page sets
          out what those ordinances and the agreements attached to them say. Every figure links to
          the page it came from.
        </p>
        <p className="text-sm font-sans text-ink-600 max-w-2xl leading-relaxed mt-3">
          Page numbers on this page refer to the original {packet.pages}-page packet, where page 1
          is the first page of the file. They are not the printed page numbers on the documents,
          which restart inside every exhibit. Each link opens the same page inside the smaller file
          that document was split into.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </header>

      {/* ── 1. Summary ─────────────────────────────────────────────── */}
      <section aria-labelledby="summary" data-section="Summary">
        <h2 id="summary" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          What the five ordinances approved
        </h2>
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          <SummaryFigure
            label="Land approved"
            value={`about ${recordsTotals.acres.value} acres`}
            qualifier={recordsTotals.acres.note}
            math={`${recordsTotals.acres.parts.map(p => p.value).join(' + ')} = ${recordsTotals.acres.value}`}
          >
            {recordsDocuments.map(d => (
              <PageCite
                key={d.id}
                file={d.file}
                page={d.facts.find(f => f.unit === 'acres').packet_page}
                label={`p. ${d.facts.find(f => f.unit === 'acres').packet_page}`}
              />
            ))}
          </SummaryFigure>

          <SummaryFigure
            label="Building floor area allowed"
            value={`up to ${num(recordsTotals.floorArea.value)} sq ft`}
            qualifier={recordsTotals.floorArea.note}
            math={`${recordsTotals.floorArea.parts.map(p => num(p.value)).join(' + ')} = ${num(recordsTotals.floorArea.value)}`}
          >
            {recordsTotals.floorArea.parts.map(p => {
              const d = recordsDocuments.find(x => x.ordinance === p.label)
              const f = d.facts.find(x => x.unit === 'sq ft' && x.value === p.value)
              return <PageCite key={p.label} file={d.file} page={f.packet_page} label={`p. ${f.packet_page}`} />
            })}
          </SummaryFigure>

          <SummaryFigure
            label="Ordinances passed"
            value={`${recordsTotals.ordinances.value} ordinances`}
            qualifier={`${recordsTotals.ordinances.from} to ${recordsTotals.ordinances.to}. ${recordsTotals.ordinances.note}`}
          >
            {recordsDocuments.map(d => (
              <PageCite key={d.id} file={d.file} page={d.vote.packet_page} label={`p. ${d.vote.packet_page}`} />
            ))}
          </SummaryFigure>

          <SummaryFigure
            label="Buildings on the master plan"
            value={`${recordsTotals.masterPlanBuildings.value} labelled`}
            qualifier={recordsTotals.masterPlanBuildings.note}
          >
            <PageCite file={masterSitePlan.file} page={masterSitePlan.packet_page} />
          </SummaryFigure>
        </dl>
      </section>

      {/* ── 2. Timeline ────────────────────────────────────────────── */}
      <section aria-labelledby="timeline" data-section="Timeline">
        <h2 id="timeline" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          What happened, in order
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          Dates recorded in the packet itself. Events outside these documents are on the{' '}
          <Link
            to="/timeline"
            className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
          >
            project timeline
          </Link>
          .
        </p>
        <ol className="mt-6 border-t border-rule">
          {recordsTimeline.map(e => (
            <li key={`${e.date}-${e.label}`} className="border-b border-rule-strong py-4 flex flex-col sm:flex-row sm:gap-5">
              <div className="shrink-0 sm:w-32">
                <time dateTime={e.date} className="text-xs font-mono text-ink-500">
                  {fmtDate(e.date)}
                </time>
              </div>
              <div className="min-w-0 mt-1 sm:mt-0">
                <p className="text-base font-display font-semibold text-ink-900 leading-snug">
                  {e.label}
                </p>
                <p className="text-sm font-sans text-ink-600 leading-relaxed mt-1">
                  {e.text} <PageCite file={e.file} page={e.packet_page} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 3. Ordinance table ─────────────────────────────────────── */}
      <section aria-labelledby="ordinances" data-section="Ordinances">
        <h2 id="ordinances" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          The five ordinances
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          Each row links to a page setting out that ordinance in full.
        </p>
        <div className="mt-6">
          <ScrollTable label="The five ordinances, as a table">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <caption className="sr-only">
                Ordinance number, date passed, recorded vote, what each ordinance did, acreage,
                floor area cap, and whether a T5 signature appears in this copy of the packet.
              </caption>
              <thead>
                <tr className="border-y border-rule-strong">
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Ordinance</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Passed</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Vote</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">What it does</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Acres</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Floor area cap</th>
                  <th scope="col" className="py-3 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">T5 signature in packet</th>
                </tr>
              </thead>
              <tbody>
                {recordsDocuments.map(d => (
                  <tr key={d.id} className="border-b border-rule align-top">
                    <th scope="row" className="py-4 pr-4 font-normal">
                      <Link
                        to={`/records/t5/${d.id}`}
                        className="font-mono text-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-rule-strong hover:decoration-accent"
                      >
                        {d.ordinance}
                      </Link>
                    </th>
                    <td className="py-4 pr-4 text-sm font-mono text-ink-700 whitespace-nowrap">{fmtDate(d.passed)}</td>
                    <td className="py-4 pr-4 text-sm font-sans text-ink-700 whitespace-nowrap">
                      {d.vote.ayes.length} aye, {d.vote.nays.length} nay
                      {d.vote.absent.length > 0 && `, ${d.vote.absent.length} absent`}
                      <br />
                      <PageCite file={d.file} page={d.vote.packet_page} />
                    </td>
                    <td className="py-4 pr-4 text-sm font-sans text-ink-700 min-w-[16rem]">{d.shortTitle}</td>
                    <td className="py-4 pr-4 text-sm font-mono text-ink-700 tabular-nums whitespace-nowrap">{d.acres}</td>
                    <td className="py-4 pr-4 text-sm font-mono text-ink-700 tabular-nums whitespace-nowrap">
                      {num(d.floorAreaCapSqft)}
                      {d.floorAreaCapSuperseded && (
                        <span className="block text-2xs font-sans text-ink-500 whitespace-normal max-w-[12rem] mt-1">
                          Replaced by the 2,120,000 combined cap
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-sm font-sans whitespace-nowrap">
                      <SignatureCell doc={d} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollTable>
        </div>
      </section>

      {/* ── 4. Modified standards ──────────────────────────────────── */}
      <section aria-labelledby="standards" data-section="Standards">
        <h2 id="standards" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          What was changed from the normal standards
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          The agreements set several development standards differently from the Cornerstone zoning
          standards that otherwise apply. {modifiedStandards.appliesTo}
        </p>
        <div className="mt-6">
          <ScrollTable label="Development standards changed from the Cornerstone rules">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <caption className="sr-only">
                Each development standard, the normal Cornerstone rule, what the T5 agreements
                allow instead, and the packet page it appears on.
              </caption>
              <thead>
                <tr className="border-y border-rule-strong">
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Standard</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Normal Cornerstone rule</th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">What T5 got</th>
                  <th scope="col" className="py-3 text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">Page</th>
                </tr>
              </thead>
              <tbody>
                {modifiedStandards.rows.map(r => (
                  <tr key={r.standard} className="border-b border-rule align-top">
                    <th scope="row" className="py-4 pr-4 text-sm font-sans font-semibold text-ink-900">{r.standard}</th>
                    <td className="py-4 pr-4 text-sm font-sans text-ink-700">{r.normal}</td>
                    <td className="py-4 pr-4 text-sm font-sans text-ink-900">{r.granted}</td>
                    <td className="py-4 text-sm"><PageCite file={r.file} page={r.packet_page} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollTable>
        </div>
        <ul className="mt-6 space-y-3 max-w-2xl">
          {modifiedStandards.alsoInThisSection.map(item => (
            <li key={item.packet_page} className="text-base font-sans text-ink-700 leading-relaxed">
              {item.text} <PageCite file={item.file} page={item.packet_page} />
            </li>
          ))}
        </ul>
      </section>

      {/* ── 5. Plans ───────────────────────────────────────────────── */}
      <section aria-labelledby="plans" data-section="Plans">
        <h2 id="plans" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          The plans
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          Square footages and heights written on these sheets are labels on a concept plan. The
          approved limits are the floor area caps in the agreements, in the table above.
        </p>
        <div className="mt-6 space-y-10">
          {[masterSitePlan, heartlandSitePlan].map(plan => (
            <figure key={plan.packet_page} className="border-t border-rule pt-6">
              {/* Not wrapped in a link. The full-resolution link sits in the
                  caption with its own text, and two links to the same file
                  in the same figure is one tab stop of nothing. */}
              <img
                src={plan.image}
                alt={plan.alt}
                width="1800"
                height="1165"
                loading="lazy"
                className="w-full h-auto border border-rule bg-paper-raised"
              />
              <figcaption className="mt-4">
                <p className="text-base font-display font-semibold text-ink-900 leading-snug">
                  {plan.title}
                </p>
                <p className="text-sm font-sans text-ink-600 leading-relaxed mt-1">
                  Drawn by {plan.drawnBy}. Sheet scale {plan.scale}, sheet dated {plan.sheetDate}.{' '}
                  <PageCite file={plan.file} page={plan.packet_page} />
                </p>
                <ul className="mt-3 space-y-1.5 text-sm font-sans text-ink-700 leading-relaxed list-disc pl-5">
                  {plan.labels.map(l => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <p className="text-sm font-sans text-ink-600 leading-relaxed mt-3 max-w-2xl">
                  {plan.caution}
                </p>
                <details className="mt-3">
                  <summary className="text-sm font-sans font-semibold text-accent hover:text-accent-hover cursor-pointer min-h-[44px] inline-flex items-center">
                    Description of the drawing
                  </summary>
                  <p className="mt-2 text-sm font-sans text-ink-700 leading-relaxed max-w-2xl">
                    {plan.longDescription}
                  </p>
                </details>
                <p className="mt-3">
                  <a
                    href={plan.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-sans font-semibold text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
                  >
                    Open the image at full resolution
                  </a>
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── 6. Not in the packet ───────────────────────────────────── */}
      <section aria-labelledby="gaps" data-section="What is missing">
        <h2 id="gaps" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          What these records do not include
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          These documents settle a specific set of questions and are silent on the rest. Nothing
          below appears anywhere in the packet, which means this page cannot answer it.
        </p>
        <ul className="mt-6 border-t border-rule">
          {notInPacket.map(item => (
            <li
              key={item}
              className="border-b border-rule-strong py-3.5 text-base font-sans text-ink-700 leading-relaxed"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 7. Open questions ──────────────────────────────────────── */}
      <section aria-labelledby="open-questions" data-section="Open questions">
        <h2 id="open-questions" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          Open questions for the Village
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          Questions the packet raises and does not answer. This page will be updated when answers
          arrive, and the status on each line will say when it was asked.
        </p>
        <ol className="mt-6 border-t border-rule">
          {openQuestionsForVillage.map(q => (
            <li
              key={q.id}
              className="border-b border-rule-strong py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-5"
            >
              <p className="text-base font-sans text-ink-900 leading-relaxed">{q.question}</p>
              <StatusPill tone={q.tone}>{q.status}</StatusPill>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 8. Download and cite ───────────────────────────────────── */}
      <section aria-labelledby="download" data-section="Download">
        <h2 id="download" className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
          Download and cite
        </h2>
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          {packet.fullPdfNote}
        </p>

        {/* The master file first, given the weight it earns. This is the same
            heavy-left-rule treatment the map uses for its editor's note: the
            site's existing way of saying "read this one", rather than a new
            card style invented for one block. */}
        <a
          href={packet.fullPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`The complete ${packet.pages}-page packet. PDF, ${formatBytes(packet.sizeBytes)}, hosted at the Internet Archive.`}
          className="group mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-l-[3px] border-ink-900 bg-paper-sunk pl-5 sm:pl-6 pr-5 py-4 hover:bg-paper-raised transition-colors"
        >
          <span className="min-w-0">
            <span className="block text-2xs font-display font-semibold text-ink-800 uppercase tracking-[0.14em] mb-1">
              The complete packet
            </span>
            <span className="block text-lg font-display text-ink-900 leading-snug group-hover:text-accent">
              All {packet.pages} pages, as received
            </span>
            <span className="block text-2xs font-mono text-ink-600 tabular-nums mt-1">
              PDF &middot; {formatBytes(packet.sizeBytes)} &middot; hosted at the Internet Archive
            </span>
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-sm font-sans font-semibold text-accent group-hover:text-accent-hover"
          >
            Open ↗
          </span>
        </a>

        <p className="mt-8 text-xs font-sans font-semibold text-ink-600">
          Or one file per document
        </p>
        <div className="mt-2 border-t border-rule">
          {recordsDocuments.map(d => (
            <DocumentDownload
              key={d.id}
              file={d.file}
              label={`Ordinance ${d.ordinance}`}
              sublabel={d.shortTitle}
            />
          ))}
          <DocumentDownload
            file={masterSitePlan.file}
            label="Master site plan"
            sublabel={masterSitePlan.title}
          />
        </div>

        <div className="mt-8 border-t border-rule pt-6 space-y-5 max-w-2xl">
          <HashBlock
            label="SHA-256 of the complete packet as received"
            value={packet.sha256}
            note="Check a download against this to confirm it is the file we were sent. Triple-click to select the whole hash."
          />
          <div>
            <p className="text-xs font-sans font-semibold text-ink-600">Suggested citation</p>
            <p className="mt-1.5 text-sm font-sans text-ink-900 leading-relaxed">{packet.citation}</p>
            <span className="inline-flex items-center gap-3">
              <button
                type="button"
                onClick={copyCitation}
                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold border transition-colors min-h-[44px] ${
                  copied
                    ? 'bg-status-stated-soft text-status-stated border-status-stated'
                    : 'bg-transparent text-ink-700 border-rule-strong hover:border-ink-700 hover:text-ink-900'
                }`}
              >
                <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
                {copied ? 'Copied' : 'Copy citation'}
              </button>
              <span role="status" aria-live="polite" className="sr-only">
                {copied ? 'Citation copied to clipboard' : ''}
              </span>
            </span>
          </div>
          <div>
            <p className="text-xs font-sans font-semibold text-ink-600">Provenance</p>
            <p className="mt-1.5 text-sm font-sans text-ink-900 leading-relaxed">
              {packet.credit}, {packet.receivedMonth}.
            </p>
          </div>
          <p className="text-sm font-sans text-ink-600 leading-relaxed">
            If something on this page does not match the document it cites,{' '}
            <ReportErrorLink
              className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
              label="report it"
            />
            .
          </p>
        </div>
      </section>
    </Container>
  )
}
