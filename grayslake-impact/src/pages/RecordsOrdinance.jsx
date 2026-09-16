import { Link, useParams, Navigate } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import ReportErrorLink from '../components/ui/ReportErrorLink'
import PageCite from '../components/records/PageCite'
import PdfLink from '../components/records/PdfLink'
import HashBlock from '../components/records/HashBlock'
import SignatureNote from '../components/records/SignatureNote'
import { pageMeta } from '../data/pageMeta'
import { LAST_VERIFIED } from '../data/siteConfig'
import { documentById, recordsDocuments, recordsFiles, filePage } from '../data/records'

const num = n => n.toLocaleString('en-US')

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function RecordsOrdinance() {
  const { ordinance } = useParams()
  const doc = documentById[ordinance]

  if (!doc) return <Navigate to="/records/t5" replace />

  const file = recordsFiles[doc.file]
  const meta = pageMeta[`/records/t5/${doc.id}`]
  const index = recordsDocuments.findIndex(d => d.id === doc.id)
  const prev = recordsDocuments[index - 1]
  const next = recordsDocuments[index + 1]

  return (
    <Container size="default" className="py-10 sm:py-14 space-y-12">
      <PageTitle title={meta.title} description={meta.description} ogImage={meta.ogImage} />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
          <Link to="/records" className="hover:text-accent underline underline-offset-4 decoration-rule">
            Public Records
          </Link>{' '}
          <span aria-hidden="true">/</span>{' '}
          <Link to="/records/t5" className="hover:text-accent underline underline-offset-4 decoration-rule">
            T5 ordinances
          </Link>
        </p>
        <p className="text-sm font-mono text-ink-500 mb-2">Ordinance {doc.ordinance}</p>
        <h1 className="text-3xl sm:text-4xl font-display text-ink-900 tracking-tight leading-[1.1] mb-3">
          {doc.shortTitle}
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">{doc.title}</p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </header>

      {/* At a glance */}
      <section aria-labelledby="at-a-glance">
        <h2 id="at-a-glance" className="sr-only">
          At a glance
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 border-b border-rule divide-y divide-rule-strong sm:divide-y-0">
          <div className="py-4">
            <dt className="text-xs font-sans font-semibold text-ink-600">Passed</dt>
            <dd className="mt-1.5 text-base font-mono text-ink-900">{fmtDate(doc.passed)}</dd>
          </div>
          <div className="py-4">
            <dt className="text-xs font-sans font-semibold text-ink-600">Land covered</dt>
            <dd className="mt-1.5 text-base font-sans text-ink-900">{doc.acresText}</dd>
          </div>
          <div className="py-4">
            <dt className="text-xs font-sans font-semibold text-ink-600">Floor area cap</dt>
            <dd className="mt-1.5 text-base font-mono text-ink-900">{num(doc.floorAreaCapSqft)} sq ft</dd>
          </div>
          <div className="py-4">
            <dt className="text-xs font-sans font-semibold text-ink-600">T5 signature in packet</dt>
            <dd className="mt-1.5 text-base font-sans text-ink-900">
              {doc.signatureStatus === 'in-packet' ? 'Yes' : 'Not in this copy'}
            </dd>
          </div>
        </dl>
        {doc.floorAreaCapNote && (
          <p className="mt-3 text-sm font-sans text-ink-600 leading-relaxed max-w-2xl">
            {doc.floorAreaCapNote}
          </p>
        )}
      </section>

      {/* Summary */}
      <section aria-labelledby="summary">
        <h2 id="summary" className="text-2xl font-display text-ink-900 tracking-tight">
          What this ordinance does
        </h2>
        <div className="mt-4 space-y-4 max-w-2xl">
          {doc.summary.map(p => (
            <p key={p.slice(0, 40)} className="text-base font-sans text-ink-700 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Vote */}
      <section aria-labelledby="vote">
        <h2 id="vote" className="text-2xl font-display text-ink-900 tracking-tight">
          The vote
        </h2>
        <p className="mt-2 text-sm font-sans text-ink-600">
          Recorded on the signature page of the ordinance.{' '}
          <PageCite file={doc.file} page={doc.vote.packet_page} />
        </p>
        <dl className="mt-5 border-t border-rule">
          <div className="border-b border-rule-strong py-3.5 flex flex-col sm:flex-row sm:gap-6">
            <dt className="sm:w-28 shrink-0 text-xs font-sans font-semibold text-ink-600 uppercase tracking-wide pt-1">
              Ayes
            </dt>
            <dd className="text-base font-sans text-ink-900 leading-relaxed">
              {doc.vote.ayes.length > 0
                ? `Trustees ${doc.vote.ayes.join(', ')}`
                : 'None recorded'}
            </dd>
          </div>
          <div className="border-b border-rule-strong py-3.5 flex flex-col sm:flex-row sm:gap-6">
            <dt className="sm:w-28 shrink-0 text-xs font-sans font-semibold text-ink-600 uppercase tracking-wide pt-1">
              Nays
            </dt>
            <dd className="text-base font-sans text-ink-900 leading-relaxed">
              {doc.vote.nays.length > 0 ? `Trustees ${doc.vote.nays.join(', ')}` : 'None'}
            </dd>
          </div>
          <div className="border-b border-rule-strong py-3.5 flex flex-col sm:flex-row sm:gap-6">
            <dt className="sm:w-28 shrink-0 text-xs font-sans font-semibold text-ink-600 uppercase tracking-wide pt-1">
              Absent
            </dt>
            <dd className="text-base font-sans text-ink-900 leading-relaxed">
              {doc.vote.absent.length > 0
                ? `Trustees ${doc.vote.absent.join(' and ')}`
                : 'None'}
            </dd>
          </div>
          <div className="border-b border-rule-strong py-3.5 flex flex-col sm:flex-row sm:gap-6">
            <dt className="sm:w-28 shrink-0 text-xs font-sans font-semibold text-ink-600 uppercase tracking-wide pt-1">
              Signed for the Village by
            </dt>
            <dd className="text-base font-sans text-ink-900 leading-relaxed">{doc.villageSigner}</dd>
          </div>
        </dl>
      </section>

      {/* Key facts */}
      <section aria-labelledby="facts">
        <h2 id="facts" className="text-2xl font-display text-ink-900 tracking-tight">
          What the document says
        </h2>
        <ul className="mt-5 border-t border-rule">
          {doc.facts.map(f => (
            <li key={f.text.slice(0, 50)} className="border-b border-rule-strong py-4">
              <p className="text-base font-sans text-ink-700 leading-relaxed">
                {f.text} <PageCite file={doc.file} page={f.packet_page} />
              </p>
              <p className="mt-1.5 text-2xs font-mono text-ink-500">
                {f.source_doc}
                {f.verified === 'image' && ' · read from the page image'}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Signature status */}
      <section aria-labelledby="signature">
        <h2 id="signature" className="text-2xl font-display text-ink-900 tracking-tight">
          Signature status
        </h2>
        <div className="mt-4">
          {doc.signatureNote ? (
            <SignatureNote
              file={doc.file}
              documentName={doc.signatureNote.documentName}
              packetPage={doc.signatureNote.packetPage}
              villageSignedOn={doc.signatureNote.villageSignedOn}
            />
          ) : (
            <p className="text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
              Both parties signed the agreement attached to this ordinance. The Village signed on{' '}
              {fmtDate(doc.passed)}, and two authorized officers of T5@CHICAGO IV LP signed through
              DocuSign on May 12, 2025.{' '}
              <PageCite file={doc.file} page={doc.keyPages['Signature pages'][0]} />
            </p>
          )}
        </div>
      </section>

      {/* Key page ranges */}
      <section aria-labelledby="pages">
        <h2 id="pages" className="text-2xl font-display text-ink-900 tracking-tight">
          Where things are in the document
        </h2>
        <p className="mt-2 text-sm font-sans text-ink-600 max-w-2xl leading-relaxed">
          Packet pages on the left, the page inside{' '}
          <span className="font-mono">{file.path.split('/').pop()}</span> on the right.
        </p>
        <dl className="mt-5 border-t border-rule">
          {Object.entries(doc.keyPages).map(([label, [from, to]]) => (
            <div key={label} className="border-b border-rule-strong py-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <dt className="text-base font-sans text-ink-900">{label}</dt>
              <dd className="text-sm font-mono text-ink-600 tabular-nums">
                <PageCite
                  file={doc.file}
                  page={from}
                  label={from === to ? `Packet p. ${from}` : `Packet pp. ${from}–${to}`}
                  className="text-sm"
                />
                <span className="ml-2 text-ink-500">
                  (file {from === to ? `p. ${filePage(doc.file, from)}` : `pp. ${filePage(doc.file, from)}–${filePage(doc.file, to)}`})
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The file itself */}
      <section aria-labelledby="file" className="border-t border-rule pt-8">
        <h2 id="file" className="text-2xl font-display text-ink-900 tracking-tight">
          The document
        </h2>
        <p className="mt-2 text-sm font-sans text-ink-600 max-w-2xl leading-relaxed">
          Packet pages {doc.packetPages[0]} to {doc.packetPages[1]}, split out of the original file
          without re-encoding.
        </p>
        <p className="mt-4">
          <PdfLink file={doc.file} label={`Ordinance ${doc.ordinance}`} />
        </p>
        <div className="mt-5">
          <HashBlock label={`SHA-256 of ${file.path.split('/').pop()}`} value={file.sha256} />
        </div>
        <object
          data={file.path}
          type="application/pdf"
          className="hidden lg:block w-full h-[38rem] mt-6 border border-rule bg-paper-raised"
          aria-label={`Ordinance ${doc.ordinance}, embedded PDF`}
        >
          <p className="p-4 text-sm font-sans text-ink-700">
            Your browser cannot display the PDF here. Use the download link above.
          </p>
        </object>
        <p className="mt-4 text-sm font-sans text-ink-600 leading-relaxed">
          If something on this page does not match the document,{' '}
          <ReportErrorLink
            className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
            label="report it"
          />
          .
        </p>
      </section>

      {/* Prev / next */}
      <nav aria-label="Other ordinances" className="border-t border-rule pt-6 flex flex-wrap justify-between gap-4">
        {prev ? (
          <Link
            to={`/records/t5/${prev.id}`}
            className="text-sm font-sans font-semibold text-accent hover:text-accent-hover min-h-[44px] inline-flex items-center gap-2"
          >
            <span aria-hidden="true">←</span> Ordinance {prev.ordinance}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/records/t5/${next.id}`}
            className="text-sm font-sans font-semibold text-accent hover:text-accent-hover min-h-[44px] inline-flex items-center gap-2"
          >
            Ordinance {next.ordinance} <span aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
    </Container>
  )
}
