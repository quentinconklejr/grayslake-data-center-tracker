import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import ReportErrorLink from '../components/ui/ReportErrorLink'
import { pageMeta } from '../data/pageMeta'
import { LAST_VERIFIED } from '../data/siteConfig'
import { recordsPackets, recordsProjects, recordsTotals } from '../data/records'

const packet = recordsPackets['t5-2024-2025']
const project = recordsProjects.t5

function fmtRange(from, to) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' }
  const a = new Date(`${from}T00:00:00`).toLocaleDateString('en-US', opts)
  const b = new Date(`${to}T00:00:00`).toLocaleDateString('en-US', opts)
  return `${a} to ${b}`
}

export default function Records() {
  return (
    <Container size="default" className="py-10 sm:py-14 space-y-12">
      <PageTitle
        title={pageMeta['/records'].title}
        description={pageMeta['/records'].description}
        ogImage={pageMeta['/records'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
          Primary Documents
        </p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          Public Records
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          Government records this tracker has obtained and published in full. Every figure on the
          pages below carries a link to the page of the document it came from, so you can read the
          sentence it was taken out of rather than take our word for it.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </header>

      {/* Packet card. One project today; the layout holds a list. */}
      <section aria-labelledby="packets">
        <h2 id="packets" className="sr-only">
          Records available
        </h2>
        <ol className="border-y border-rule divide-y divide-rule-strong">
          <li className="py-6">
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <p className="text-2xs font-sans font-semibold uppercase tracking-wide text-status-stated">
                primary
              </p>
              <p className="text-2xs font-mono text-ink-500 tabular-nums shrink-0">
                {packet.pages} pages
              </p>
            </div>
            <h3 className="text-lg font-display font-semibold text-ink-900 leading-snug mb-1">
              <Link
                to="/records/t5"
                className="hover:text-accent underline underline-offset-4 decoration-rule-strong hover:decoration-accent"
              >
                {packet.title}
              </Link>
            </h3>
            <p className="text-sm font-sans text-ink-600">
              <span className="font-mono text-ink-500">
                {packet.jurisdiction} &middot; {fmtRange(packet.approvalsFrom, packet.approvalsTo)}
              </span>
            </p>
            <p className="text-sm font-sans text-ink-600 leading-relaxed mt-2 max-w-2xl">
              {project.blurb} Five ordinances passed between{' '}
              {fmtRange(packet.approvalsFrom, packet.approvalsTo).replace(' to ', ' and ')}, covering
              about {recordsTotals.acres.value} acres, with the signed agreements, exhibits and site
              plans attached to them. Obtained through an {packet.obtainedVia}.
            </p>
            <p className="mt-3">
              <Link
                to="/records/t5"
                className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-accent hover:text-accent-hover min-h-[44px]"
              >
                Read the T5 records
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </li>
        </ol>
      </section>

      {/* How we handle records */}
      <section aria-labelledby="handling" className="border-t border-rule pt-8">
        <h2
          id="handling"
          className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight mb-4"
        >
          How we handle records
        </h2>
        <div className="space-y-4 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">
          <p>
            Records come from Freedom of Information Act requests to the body that holds them, or
            from documents that body has already published. Where a record was obtained by someone
            else and shared with this tracker, the page says so.
          </p>
          <p>
            Nothing is edited. Files are published as they arrived, and the SHA-256 hash of the file
            we received is printed alongside it so anyone can check that what they downloaded is
            what we were sent. Large packets are split into one file per document to make them
            usable, and the split files are byte copies of the original pages rather than
            re-exported versions.
          </p>
          <p>
            Page numbers refer to the original packet: page 1 is the first page of the file we
            received, not the printed page number stamped on the document, which restarts inside
            every exhibit. Each citation links to the same page inside the smaller file it was split
            into.
          </p>
          <p>
            These pages describe what the documents say. Where a document is silent on something,
            the page says that too rather than filling the gap.
          </p>
          <p>
            If a figure here does not match the document it cites,{' '}
            <ReportErrorLink
              className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent"
              label="report it"
            />{' '}
            and it will be checked against the page and corrected.
          </p>
        </div>
      </section>
    </Container>
  )
}
