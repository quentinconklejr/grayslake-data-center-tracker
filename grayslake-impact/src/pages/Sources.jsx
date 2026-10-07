import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import DocBadges from '../components/ui/DocBadges'
import { pageMeta } from '../data/pageMeta'
import { sources } from '../data/sources'
import { sourceTiers, recordsTier } from '../data/sourceTiers'
import { docMeta } from '../data/docMeta'
import { LAST_UPDATED } from '../data/siteConfig'
import { recordsPackets, recordsDocuments, recordsFiles } from '../data/records'

// Tier labels come from the source registry (config/sources.yaml) through
// src/data/sourceTiers.js, generated at build time, so they cannot drift.
const TIER = {
  1: 'text-status-stated',
  2: 'text-status-approval',
  3: 'text-status-disputed',
  default: 'text-ink-500',
}

const packet = recordsPackets['t5-2024-2025']

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatOf(path) {
  return /\.pdf$/i.test(path ?? '') ? 'PDF' : null
}

const byCategory = cat => Object.entries(sources).filter(([, s]) => s.category === cat)

/*
 * The hub. /documents holds every source the tracker cites, grouped by
 * kind, and is the one nav item for documents. /records and /records/t5
 * keep their addresses and are linked from the first two sections rather
 * than folded in here, because they carry the page-level citations.
 */
const SECTIONS = [
  { id: 'public-records', title: 'Public Records (FOIA)', count: 1 },
  { id: 'ordinances',     title: 'Municipal Ordinances',  count: recordsDocuments.length },
  { id: 'court-filings',  title: 'Court Filings',         count: byCategory('court').length },
  { id: 'news',           title: 'News and Trade Reporting', count: byCategory('news').length },
  { id: 'government',     title: 'Government Notices, Data and Analysis', count: byCategory('government').length },
]

const H3 = 'text-lg font-display font-semibold text-ink-900 leading-snug mb-1'
const TITLE_LINK = 'hover:text-accent underline underline-offset-4 decoration-rule-strong hover:decoration-accent'
const CHIP_BUTTON = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold border border-rule-strong text-ink-700 hover:border-ink-700 hover:text-ink-900 transition-colors min-h-[44px]'
const ARROW_LINK = 'inline-flex items-center gap-2 text-sm font-sans font-semibold text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent min-h-[44px]'

function Section({ id, title, intro, children }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24" id={`section-${id}`}>
      <h2 id={id} className="text-2xl sm:text-3xl font-display text-ink-900 tracking-tight">
        {title}
      </h2>
      {intro && (
        <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">{intro}</p>
      )}
      <ol className="mt-5 divide-y divide-rule-strong border-y border-rule">{children}</ol>
    </section>
  )
}

function Entry({ n, children }) {
  return (
    <li className="py-6">
      <div className="flex items-baseline gap-4">
        <span className="text-sm font-mono text-ink-500 tabular-nums shrink-0 w-8 text-right">
          {String(n).padStart(2, '0')}.
        </span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </li>
  )
}

function SourceEntry({ n, sourceKey, source }) {
  const tier = sourceTiers[sourceKey]
  const tierCls = TIER[tier?.tier] ?? TIER.default
  // Real, read-from-file metadata for mirrored PDFs only. An external-link
  // source (no localCopy) gets no badges because we cannot inspect the file.
  const meta = source.localCopy ? docMeta[source.localCopy] : null
  return (
    <Entry n={n}>
      {/* Tier tag on its own metadata row above the title so a long title
          cannot displace it mid-line. File badges ride on the same row. */}
      {(tier || meta) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 mb-1.5">
          {tier ? (
            <p className={`text-2xs font-sans font-semibold uppercase tracking-wide ${tierCls}`}>
              {tier.label}
            </p>
          ) : <span aria-hidden="true" />}
          {meta && <DocBadges format={formatOf(source.localCopy)} pages={meta.pages} sizeBytes={meta.sizeBytes} />}
        </div>
      )}
      <h3 className={H3}>
        {source.url && source.status !== 'dead' && source.status !== 'unverified' ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className={TITLE_LINK}>
            {source.title} <span aria-hidden="true">↗</span>
          </a>
        ) : (
          source.title
        )}
      </h3>

      <div className="text-sm font-sans text-ink-600">
        <span className="font-mono text-ink-500">
          {[source.publisher, source.date].filter(Boolean).join(' · ')}
        </span>
      </div>

      {source.note && (
        <p className="text-sm font-sans text-ink-600 leading-relaxed mt-2 break-words">{source.note}</p>
      )}

      {(source.localCopy || source.archiveUrl) && (
        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          {source.localCopy && (
            <a href={source.localCopy} target="_blank" rel="noopener noreferrer" className={CHIP_BUTTON}>
              <span aria-hidden="true">↓</span>
              Download PDF mirror
            </a>
          )}
          {/* A Wayback Machine copy, so the citation survives the original
              page moving or disappearing. */}
          {source.archiveUrl && (
            <a
              href={source.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent min-h-[44px]"
            >
              Archived copy <span aria-hidden="true">↗</span>
              <span className="sr-only">(Wayback Machine, opens in new tab)</span>
            </a>
          )}
        </p>
      )}
    </Entry>
  )
}

export default function Sources() {
  const foia = sources.t5RecordsPacket2026

  return (
    <Container size="default" className="py-10 sm:py-14 space-y-12">
      <PageTitle
        title={pageMeta['/documents'].title}
        description={pageMeta['/documents'].description}
        ogImage={pageMeta['/documents'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
          Public Records Index
        </p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          Documents &amp; Primary Sources
        </h1>
        <p className="text-base font-sans text-ink-700 max-w-2xl leading-relaxed">
          All figures on this tracker originate from public filings, meeting records, and verified journalism.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">
          Last updated {LAST_UPDATED}
        </p>

        <nav aria-label="Document sections" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a
                  href={`#section-${s.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold border border-rule-strong text-ink-700 hover:border-ink-700 hover:text-ink-900 transition-colors min-h-[44px]"
                >
                  {s.title} <span className="font-mono font-normal text-ink-500">({s.count})</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Section
        id="public-records"
        title="Public Records (FOIA)"
        intro="Records this tracker obtained under the Illinois Freedom of Information Act and publishes in full, each figure linked to the page it came from."
      >
        <Entry n={1}>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 mb-1.5">
            <p className={`text-2xs font-sans font-semibold uppercase tracking-wide ${TIER[recordsTier.tier]}`}>{recordsTier.label}</p>
            <DocBadges format="PDF" pages={packet.pages} sizeBytes={packet.sizeBytes} />
          </div>
          <h3 className={H3}>
            <Link to="/records/t5" className={TITLE_LINK}>{packet.title}</Link>
          </h3>
          <div className="text-sm font-sans text-ink-600">
            <span className="font-mono text-ink-500">
              {[foia?.publisher, foia?.date].filter(Boolean).join(' · ')}
            </span>
          </div>
          {foia?.note && (
            <p className="text-sm font-sans text-ink-600 leading-relaxed mt-2">{foia.note}</p>
          )}
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
            <Link to="/records/t5" className={ARROW_LINK}>
              Read the T5 records <span aria-hidden="true">→</span>
            </Link>
            <Link to="/records" className={ARROW_LINK}>
              All public records and how we handle them <span aria-hidden="true">→</span>
            </Link>
          </p>
        </Entry>
      </Section>

      <Section
        id="ordinances"
        title="Municipal Ordinances"
        intro="The five Village of Grayslake ordinances that approved the campus. Each has its own page with the key figures cited to the page of the ordinance."
      >
        {recordsDocuments.map((d, i) => {
          const file = recordsFiles[d.file]
          return (
            <Entry key={d.id} n={i + 1}>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 mb-1.5">
                <p className={`text-2xs font-sans font-semibold uppercase tracking-wide ${TIER[recordsTier.tier]}`}>{recordsTier.label}</p>
                <DocBadges format={formatOf(file?.path)} pages={file?.pages} sizeBytes={file?.sizeBytes} />
              </div>
              <h3 className={H3}>
                <Link to={`/records/t5/${d.id}`} className={TITLE_LINK}>
                  Ordinance {d.ordinance}, {d.shortTitle}
                </Link>
              </h3>
              <div className="text-sm font-sans text-ink-600">
                <span className="font-mono text-ink-500">
                  {d.jurisdiction} &middot; Passed {fmtDate(d.passed)}
                </span>
              </div>
              {file?.path && (
                <p className="mt-3">
                  <a href={file.path} target="_blank" rel="noopener noreferrer" className={CHIP_BUTTON}>
                    <span aria-hidden="true">↓</span>
                    Download PDF
                  </a>
                </p>
              )}
            </Entry>
          )
        })}
      </Section>

      <Section id="court-filings" title="Court Filings">
        {byCategory('court').map(([key, s], i) => <SourceEntry key={key} n={i + 1} sourceKey={key} source={s} />)}
      </Section>

      <Section id="news" title="News and Trade Reporting">
        {byCategory('news').map(([key, s], i) => <SourceEntry key={key} n={i + 1} sourceKey={key} source={s} />)}
      </Section>

      <Section
        id="government"
        title="Government Notices, Data and Analysis"
        intro="Notices and data published by public bodies, and analysis from utility and environmental groups."
      >
        {byCategory('government').map(([key, s], i) => <SourceEntry key={key} n={i + 1} sourceKey={key} source={s} />)}
      </Section>
    </Container>
  )
}
