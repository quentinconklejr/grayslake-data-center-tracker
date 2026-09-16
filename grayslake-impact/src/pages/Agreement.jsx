import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import SourceCitation from '../components/ui/SourceCitation'
import Container from '../components/layout/Container'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'
import { sources } from '../data/sources'

/**
 * "What did the village actually agree to?"
 *
 * First version was a correct page that read like a filing cabinet: three
 * stacks of near-identical white cards. The content was right and nobody was
 * going to get to the bottom of it.
 *
 * What changed, and why:
 *
 * - A counter strip up top. Six things documented, four revenue claims, seven
 *   questions with no public answer. That shape IS the story, and it now
 *   arrives in two seconds instead of after three screens of reading.
 *
 * - The revenue claims became a bar chart. Four numbers spanning a factor of
 *   five, listed as text, read as four similar facts. Drawn to scale, the
 *   spread is the point, and the two largest visibly come from the developer.
 *   Bars are proportional to the figures, so nothing is exaggerated by the
 *   drawing.
 *
 * - Cards carry who said it. A term sourced to the Village FAQ and a claim
 *   from the developer are different kinds of thing and now look different.
 *
 * The order is still the neutrality safeguard, and it has not moved:
 *   1. what is on the record       (citable, conditions attached)
 *   2. what the community is told  (four claims, drawn to scale)
 *   3. what nobody has published   (the gaps, stated plainly)
 *   4. how to get the document     (so the reader need not trust me)
 */

const TERMS = [
  {
    term: 'No financial incentives to T5',
    who: 'Village FAQ',
    detail:
      'The Village FAQ states the approved development agreements "do not provide for any financial incentives." No abatement, TIF district or rebate has been disclosed.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Developer fees to the Village',
    who: 'Mayor of Grayslake',
    detail:
      'Grayslake’s mayor described fees in the "tens of millions of dollars" if the campus is fully built out, split roughly 50% to major infrastructure, 25% to special community projects and 25% to resident cost-control measures.',
    sourceKey: 'govtech2025',
    caveat:
      'Ballpark figures, subject to negotiation at the time. Conditional on full buildout. T5 has not committed to it.',
  },
  {
    term: 'Grid infrastructure paid by the developer',
    who: 'Village FAQ',
    detail:
      'Under agreements with ComEd, T5 funds the electricity supply infrastructure serving the campus, including an on-site substation. The FAQ states the Village pays nothing toward it.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Electricity costs borne by T5',
    who: 'Village FAQ',
    detail:
      'T5 pays for all electricity used on the campus under Illinois electric rate standards, through supply agreements the FAQ describes as already in place with ComEd.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Property tax to eight districts',
    who: 'Village FAQ',
    detail:
      'Eight taxing bodies cover the campus and receive property tax from it. Four of the eight are not Grayslake districts, so part of the tax base accrues to Round Lake, Fremont and Mundelein districts.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Development caps',
    who: 'The signed ordinances',
    detail:
      'About 473.5 acres of development and no more than 10,160,000 sq ft of building, the sums of the figures the five ordinances state one by one. The Village FAQ gives them as up to 472 acres and 10,100,000 sq ft. Either way these are ceilings the approvals permit, not commitments T5 has made.',
    sourceKeys: ['t5RecordsPacket2026', 'villagefaq_archived'],
  },
]

// `amount` is only for bar width. It is the lower bound of each claim in
// millions, so a bar can never overstate what was said.
const REVENUE_CLAIMS = [
  {
    figure: '~$300 million',
    amount: 300,
    scope: 'All taxing districts, over the coming decades',
    speaker: 'Mayor of Grayslake',
    side: 'village',
    sourceKey: 'chitrib_june2026',
  },
  {
    figure: 'Over $500 million',
    amount: 500,
    scope: 'Local school districts specifically, no period given, plus "hundreds of millions more" for emergency and social services',
    speaker: 'Pete Marin, T5 chief executive',
    side: 'developer',
    sourceKey: 'scannerLawsuit2026',
  },
  {
    figure: 'Over $1 billion',
    amount: 1000,
    scope: 'All taxing districts, over 20 years',
    speaker: 'Deputy Village Manager',
    side: 'village',
    sourceKey: 'chronicle2026',
  },
  {
    figure: 'Over $1.5 billion',
    amount: 1500,
    scope: 'New taxes and fees to Grayslake Village and Lake County, no period given',
    speaker: 'Pete Marin, T5 chief executive',
    side: 'developer',
    sourceKey: 'scannerLawsuit2026',
  },
]

const UNPUBLISHED = [
  'The development agreement document itself',
  'The dollar amount of developer fees, and the schedule on which they are paid',
  'Whether any fee obligation survives if the campus is only partly built',
  'Any host-community agreement, community benefits agreement or local hiring commitment',
  'Any noise, lighting, setback or generator testing conditions attached to the approvals',
  'Any decommissioning or site-restoration obligation if the campus closes',
  'The Lake County Assessor valuation, without which no tax figure can be checked',
]

// Read from the file-stamped PDF, not from news coverage. The Aug 7-8 reports
// described the counts loosely; these are the headings as they appear in the
// filing. The case number was in neither report.
const COMPLAINT = {
  caseNumber: '2026CH00000171',
  filed: 'July 31, 2026, 6:29 PM',
  court: '19th Judicial Circuit, Lake County, Chancery Division',
  plaintiffs: 'Preservation of Community Well-being Collective LLC and nine residents of Grayslake, Mundelein and Round Lake Park',
  defendants: 'Village of Grayslake; T5 Data Centers, LLC; Alter Asset Management Company',
  counsel: 'Law Office of Ronald D. Cummings',
  counts: [
    {
      title: 'Ultra vires municipal action',
      detail: 'That the Village acted beyond the authority its own ordinances give it, and a declaration to that effect.',
    },
    {
      title: 'Substantive due process, Illinois Constitution',
      detail: 'That the approvals departed from the Village’s own planning framework in a way the state constitution does not permit.',
    },
    {
      title: 'Procedural due process, Illinois Constitution',
      detail: 'That the notice and hearing process denied affected residents a meaningful opportunity to be heard.',
    },
    {
      title: 'Illinois Open Meetings Act',
      detail: 'That Village business on this project was conducted outside properly noticed open meetings.',
    },
  ],
  relief: [
    'A declaration that the 2024–2025 approvals are invalid and unenforceable',
    'A judgment vacating and setting aside those approvals',
    'An order voiding the development agreement(s) between the Village and T5',
    'A permanent injunction barring further permits issued in reliance on the approvals',
    'Attorneys’ fees and costs to the extent recoverable',
  ],
}

const MAX_CLAIM = Math.max(...REVENUE_CLAIMS.map(c => c.amount))

const SIDE = {
  village:   { bar: 'bg-status-approval', chip: 'text-status-approval', label: 'Village' },
  developer: { bar: 'bg-status-policy',   chip: 'text-status-policy',   label: 'Developer' },
}

function Counter({ n, label, tone, textCls }) {
  return (
    <div className={`flex-1 min-w-[9rem] border-t-2 ${tone} pt-3`}>
      <div className={`text-3xl font-display leading-none tracking-tight ${textCls ?? 'text-ink-900'}`}>{n}</div>
      <div className="text-sm font-sans text-ink-700 leading-snug mt-1.5">{label}</div>
    </div>
  )
}

export default function Agreement() {
  return (
    <FootnoteProvider>
      <Container size="default" className="py-10 sm:py-14">
        <PageTitle {...pageMeta['/agreement']} />

        <FadeIn className="mb-10">
          <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">The Deal</p>
          <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-4">
            What the Village agreed to
          </h1>
          <p className="text-lg font-sans text-ink-700 max-w-2xl leading-relaxed">
            A development agreement exists between the Village of Grayslake and T5. It has not been
            published. This site does not have a copy. The page covers what officials have said
            publicly. It is not derived from the document.
          </p>
          <p className="text-2xs font-mono text-ink-500 mt-4">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* The shape of the answer, before the detail. */}
        <FadeIn className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
            <Counter n={TERMS.length} label="terms on the public record" tone="border-status-construction" textCls="text-status-construction" />
            <Counter n={REVENUE_CLAIMS.length} label="revenue claims, none verified" tone="border-status-disputed" textCls="text-status-disputed" />
            <Counter n={UNPUBLISHED.length} label="questions with no public answer" tone="border-ink-500" />
          </div>
        </FadeIn>

        <FadeIn>
          <aside className="border-l-[3px] border-status-disputed bg-status-disputed-soft pl-5 pr-4 py-4 mb-14 max-w-2xl">
            <p className="text-xs font-display italic text-status-disputed mb-2">Read this first</p>
            <p className="text-base font-sans text-ink-800 leading-relaxed">
              Everything on this page is what people have <em>said</em> about the agreement. Nobody
              arguing this deal in public is arguing from the text. The text has never been released.
              A lawsuit filed July 31 asks a court to void it.
            </p>
          </aside>
        </FadeIn>

        {/* ── The complaint itself ──────────────────────────────────────
            Deliberate exception to the "no dark surfaces" rule of the new
            design. This block is a document facsimile: a real court filing,
            presented with the visual weight of a document, with a dark
            title bar reading like a docket header. It is the only elevated
            surface in the app, and it's earned. */}
        <FadeIn className="mb-14">
          <div className="border-2 border-ink-900 overflow-hidden">
            <div className="bg-ink-900 px-5 sm:px-6 py-4">
              <p className="text-2xs font-sans font-semibold uppercase tracking-wide text-paper-sunk">
                Primary document
              </p>
              <p className="text-xl sm:text-2xl font-display text-paper leading-tight mt-1">
                The agreement is being challenged in court
              </p>
            </div>

            <div className="px-5 sm:px-6 py-5 bg-paper-raised">
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                {[
                  ['Case number', COMPLAINT.caseNumber],
                  ['Filed',       COMPLAINT.filed],
                  ['Court',       COMPLAINT.court],
                  ['Plaintiffs',  COMPLAINT.plaintiffs],
                  ['Defendants',  COMPLAINT.defendants],
                  ['Counsel',     COMPLAINT.counsel],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">{k}</dt>
                    <dd className="text-sm font-sans text-ink-900 leading-snug mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
                Four counts
              </p>
              <ol className="space-y-2 mb-5">
                {COMPLAINT.counts.map((c, i) => (
                  <li key={c.title} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 w-7 h-7 border border-ink-900 text-ink-900 text-2xs font-mono font-semibold flex items-center justify-center">
                      {['I', 'II', 'III', 'IV'][i]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-display font-semibold text-ink-900 leading-snug">{c.title}</p>
                      <p className="text-sm font-sans text-ink-700 leading-relaxed mt-0.5">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
                Relief sought
              </p>
              <ul className="space-y-1.5 mb-5">
                {COMPLAINT.relief.map(r => (
                  <li key={r} className="flex items-start gap-2.5 text-sm font-sans text-ink-700 leading-snug">
                    <span aria-hidden="true" className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-ink-400" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <a
                  href={sources.complaint2026?.localCopy ?? '/docs/t5-grayslake-complaint-2026ch00000171.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink-900 text-paper text-sm font-sans font-semibold hover:bg-ink-800 transition-colors min-h-[44px]"
                >
                  Read the complaint (PDF, 37 pages)
                  <span aria-hidden="true">↓</span>
                </a>
                <span className="inline-flex items-center text-sm font-sans text-ink-600 leading-snug pt-1">
                  File-stamped copy, mirrored on this site.
                </span>
              </div>

              <p className="text-sm font-sans text-status-disputed border-l-[3px] border-status-disputed bg-status-disputed-soft pl-4 pr-4 py-2.5 mt-5 leading-relaxed">
                These are allegations in a complaint, not findings. No defendant had answered at the
                time of writing and no court has ruled on any count. Read it and judge for yourself,
                which is the point of putting it here.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ── 1. On the record ──────────────────────────────────────────── */}
        <FadeIn className="mb-14">
          <div className="flex items-baseline gap-3 mb-2 border-t border-rule pt-4">
            <span className="text-2xs font-mono font-semibold text-status-construction">01</span>
            <h2 className="text-3xl font-display text-ink-900 tracking-tight">What is on the record</h2>
          </div>
          <p className="text-base font-sans text-ink-700 mb-6 max-w-prose leading-relaxed">
            Terms stated by the Village or its officials in documents that can be cited. Where a
            figure is conditional or was described as unfinished, that is noted with it rather than
            below it.
          </p>
          <div className="divide-y divide-rule-strong border-y border-rule">
            {TERMS.map((t, i) => (
              <div key={t.term} className="py-5">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 text-xs font-mono text-status-construction tabular-nums w-6 text-right pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <p className="text-lg font-display font-semibold text-ink-900 leading-snug">
                        {t.term}
                      </p>
                      <span className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">
                        {t.who}
                      </span>
                    </div>
                    <p className="text-base font-sans text-ink-700 leading-relaxed">
                      {t.detail}
                      {/* A term can now rest on more than one document: the
                          development caps are stated by the ordinances and
                          summarised by the FAQ, and both belong on the line. */}
                      {t.sourceKeys
                        ? t.sourceKeys.map(k => <SourceCitation key={k} sourceKey={k} />)
                        : t.sourceKey && <SourceCitation sourceKey={t.sourceKey} />}
                    </p>
                    {t.caveat && (
                      <p className="text-sm font-sans text-status-disputed border-l-[3px] border-status-disputed bg-status-disputed-soft pl-4 pr-4 py-2.5 mt-3 leading-relaxed">
                        {t.caveat}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── 2. Revenue claims, drawn to scale ─────────────────────────── */}
        <FadeIn className="mb-14">
          <div className="flex items-baseline gap-3 mb-2 border-t border-rule pt-4">
            <span className="text-2xs font-mono font-semibold text-status-disputed">02</span>
            <h2 className="text-3xl font-display text-ink-900 tracking-tight">What the community is told it gets</h2>
          </div>
          <p className="text-base font-sans text-ink-700 mb-6 max-w-prose leading-relaxed">
            Four public revenue claims, from four speakers, over four different scopes and periods.
            The largest is five times the smallest. Bars are drawn to the figures, so the gap is the
            real one.
          </p>

          <div className="divide-y divide-rule-strong border-y border-rule">
            {REVENUE_CLAIMS.map(c => {
              const s = SIDE[c.side]
              return (
                <div key={c.figure + c.speaker} className="py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                    <p className="text-2xl font-display text-ink-900 tracking-tight">
                      {c.figure}
                    </p>
                    <span className={`text-2xs font-sans font-semibold uppercase tracking-wide ${s.chip}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-paper-sunk overflow-hidden mb-3">
                    <div
                      aria-hidden="true"
                      className={`h-full ${s.bar}`}
                      style={{ width: `${(c.amount / MAX_CLAIM) * 100}%` }}
                    />
                  </div>

                  <p className="text-sm font-sans text-ink-700 leading-relaxed">{c.scope}</p>
                  <p className="text-sm font-sans text-ink-600 leading-relaxed mt-1">
                    {c.speaker}
                    <SourceCitation sourceKey={c.sourceKey} />
                  </p>
                </div>
              )
            })}
          </div>

          <p className="text-sm font-sans text-ink-700 leading-relaxed mt-4 max-w-prose pt-4">
            These are four claims about different things. They cannot be averaged or treated as a
            range. The two largest come from the developer. The two smaller ones come from Village
            officials. None is independently verified. None can be verified until the Lake County
            Assessor values the campus, which has not happened. What any district receives also
            depends on its own levy.
          </p>
        </FadeIn>

        {/* ── 3. The gaps ───────────────────────────────────────────────── */}
        <FadeIn className="mb-14">
          <div className="flex items-baseline gap-3 mb-2 border-t border-rule pt-4">
            <span className="text-2xs font-mono font-semibold text-ink-600">03</span>
            <h2 className="text-3xl font-display text-ink-900 tracking-tight">What has not been published</h2>
          </div>
          <p className="text-base font-sans text-ink-700 mb-5 max-w-prose leading-relaxed">
            These are questions about the deal that no public document currently answers.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-8 divide-y divide-rule-strong sm:divide-y-0 border-y border-rule sm:border-t sm:border-b">
            {UNPUBLISHED.map(item => (
              <li
                key={item}
                className="flex items-start gap-3 py-3 sm:border-b sm:border-rule-strong text-sm font-sans text-ink-700 leading-snug"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 mt-1 w-3 h-3 border border-dashed border-ink-500"
                />
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        {/* ── 4. Go get it ──────────────────────────────────────────────── */}
        <FadeIn>
          <div className="border-t border-rule pt-6">
            <p className="text-xs font-display italic text-accent tracking-wide mb-2">
              Get the document yourself
            </p>
            <h2 className="text-2xl font-display text-ink-900 tracking-tight mb-4">
              Public records, not private property
            </h2>
            <p className="text-base font-sans text-ink-800 leading-relaxed mb-3">
              The development agreement, the approving ordinances and the staff reports are public
              records of the Village of Grayslake. You do not need anyone&rsquo;s permission to read
              them.
            </p>
            <p className="text-base font-sans text-ink-700 leading-relaxed mb-3">
              Under the Illinois Freedom of Information Act (5 ILCS 140) the Village must respond
              within five business days, extendable by five more. Requests go to the Village&rsquo;s
              FOIA officer through villageofgrayslake.com. Ask for the executed development agreement
              between the Village and T5 Data Centers and any amendments to it, plus the ordinances
              approving the planned unit development.
            </p>
            <p className="text-sm font-sans text-ink-700 leading-relaxed border-t border-rule-soft pt-3">
              On June 5, 2026, the Village said it cannot answer further questions because of
              pending litigation. That applies to comment, not FOIA. Statutory response obligations
              continue. Litigation can affect which exemptions the Village claims.
            </p>
            <p className="text-base font-sans text-ink-800 leading-relaxed mt-4 font-semibold">
              If you get the agreement, send it. I will publish it here in full.
            </p>
          </div>
        </FadeIn>

        <FootnoteList />
        <BackToTop />
      </Container>
    </FootnoteProvider>
  )
}
