import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import PageCite from '../components/records/PageCite'
import PdfLink from '../components/records/PdfLink'
import { pageMeta } from '../data/pageMeta'
import { SITE_CONTACT, LAST_VERIFIED } from '../data/siteConfig'
import {
  recordsPackets,
  recordsDocuments,
  recordsTotals,
  masterSitePlan,
} from '../data/records'

const packet = recordsPackets['t5-2024-2025']
const num = n => n.toLocaleString('en-US')

const FIGURES = [
  {
    label: 'Land approved',
    value: `about ${recordsTotals.acres.value} acres`,
    note: 'The sum of the acreage each of the five ordinances states, each approximate in the document.',
    cites: recordsDocuments.map(d => ({
      file: d.file,
      page: d.facts.find(f => f.unit === 'acres').packet_page,
    })),
  },
  {
    label: 'Building floor area allowed',
    value: `up to ${num(recordsTotals.floorArea.value)} sq ft`,
    note: 'The sum of the four floor area caps in force. Ordinance 2025-0-06 replaced the Phase 2 cap of 1,590,000 sq ft with a combined 2,120,000 sq ft, so the earlier figure is not added.',
    cites: recordsTotals.floorArea.parts.map(p => {
      const d = recordsDocuments.find(x => x.ordinance === p.label)
      return { file: d.file, page: d.facts.find(f => f.unit === 'sq ft' && f.value === p.value).packet_page }
    }),
  },
  {
    label: 'Ordinances and votes',
    value: '5 ordinances, none opposed',
    note: 'Passed between November 19, 2024 and May 6, 2025. No trustee voted nay on any of the five. Two trustees were absent for the first two.',
    cites: recordsDocuments.map(d => ({ file: d.file, page: d.vote.packet_page })),
  },
  {
    label: 'Buildings on the master plan',
    value: '18 labelled',
    note: 'Eleven labelled 530,000 sq ft and seven labelled 630,000 sq ft, each labelled 90 feet in height. These are labels on a concept plan, not approved limits.',
    cites: [{ file: masterSitePlan.file, page: masterSitePlan.packet_page }],
  },
]

export default function Press() {
  const [copied, setCopied] = useState(false)

  function copyCitation() {
    navigator.clipboard?.writeText(packet.citation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Container size="default" className="py-10 sm:py-14 space-y-10">
      <PageTitle
        title={pageMeta['/press'].title}
        description={pageMeta['/press'].description}
        ogImage={pageMeta['/press'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Press</p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          For reporters
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          The Village of Grayslake approved the T5@CHICAGO IV data center campus through five
          ordinances passed between November 19, 2024 and May 6, 2025. This tracker has published
          the full {packet.pages}-page packet of those ordinances, the agreements attached to them
          and the site plans, obtained through an Illinois FOIA request. The figures below are taken
          from the documents themselves and each one links to the page it came from.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </header>

      <section aria-labelledby="figures">
        <h2 id="figures" className="text-2xl font-display text-ink-900 tracking-tight">
          The numbers, with pages
        </h2>
        <dl className="mt-5 border-t border-rule">
          {FIGURES.map(f => (
            <div key={f.label} className="border-b border-rule-strong py-5">
              <dt className="text-xs font-sans font-semibold text-ink-600">{f.label}</dt>
              <dd>
                <p className="mt-1.5 text-2xl font-display text-ink-900 tracking-tight leading-tight">
                  {f.value}
                </p>
                <p className="mt-2 text-sm font-sans text-ink-700 leading-relaxed max-w-2xl">
                  {f.note}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  {f.cites.map(c => (
                    <PageCite key={`${c.file}-${c.page}`} file={c.file} page={c.page} label={`p. ${c.page}`} />
                  ))}
                </p>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm font-sans text-ink-600 leading-relaxed max-w-2xl">
          Page numbers refer to the original packet, where page 1 is the first page of the file we
          received. The full breakdown, the development standards the agreements changed, and what
          the packet does not contain are on the{' '}
          <Link
            to="/records/t5"
            className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
          >
            records page
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="downloads" className="border-t border-rule pt-8">
        <h2 id="downloads" className="text-2xl font-display text-ink-900 tracking-tight">
          Downloads
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {recordsDocuments.map(d => (
            <li key={d.id}>
              <PdfLink file={d.file} label={`Ordinance ${d.ordinance}`} />
            </li>
          ))}
          <li>
            <PdfLink file={masterSitePlan.file} label="Master site plan" />
          </li>
        </ul>
        <p className="mt-4 text-sm font-sans text-ink-700">
          <a
            href={packet.fullPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
          >
            The complete {packet.pages}-page packet
          </a>
          <span className="text-ink-500"> &middot; SHA-256 </span>
          <span className="font-mono text-2xs text-ink-600 break-all">{packet.sha256}</span>
        </p>
      </section>

      <section aria-labelledby="citation" className="border-t border-rule pt-8">
        <h2 id="citation" className="text-2xl font-display text-ink-900 tracking-tight">
          Suggested citation
        </h2>
        <p className="mt-3 text-base font-sans text-ink-900 leading-relaxed max-w-2xl">
          {packet.citation}
        </p>
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
        <p className="mt-4 text-sm font-sans text-ink-600 leading-relaxed max-w-2xl">
          Records obtained by {packet.credit} through an Illinois FOIA request, {packet.receivedMonth}.
        </p>
      </section>

      <section aria-labelledby="contact" className="border-t border-rule pt-8">
        <h2 id="contact" className="text-2xl font-display text-ink-900 tracking-tight">
          Contact
        </h2>
        <p className="mt-3 text-base font-sans text-ink-700 leading-relaxed">
          Quentin Conkle Jr.{' '}
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
          >
            {SITE_CONTACT.email}
          </a>
          {' '}&middot;{' '}
          <a
            href={`tel:${SITE_CONTACT.phoneTel}`}
            className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
          >
            {SITE_CONTACT.phone}
          </a>
        </p>
        <p className="mt-2 text-sm font-sans text-ink-600 leading-relaxed">
          This tracker is not affiliated with T5 Data Centers or the Village of Grayslake.
        </p>
      </section>
    </Container>
  )
}
