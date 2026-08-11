import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import SourceCitation from '../components/ui/SourceCitation'
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
    who: 'Village FAQ',
    detail:
      'Up to 472 acres of development and no more than 10,100,000 sq ft of building. These are ceilings the approvals permit, not commitments T5 has made.',
    sourceKey: 'villagefaq_archived',
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
      detail: 'That the approvals departed from the Village\u2019s own planning framework in a way the state constitution does not permit.',
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
    'A declaration that the 2024\u20132025 approvals are invalid and unenforceable',
    'A judgment vacating and setting aside those approvals',
    'An order voiding the development agreement(s) between the Village and T5',
    'A permanent injunction barring further permits issued in reliance on the approvals',
    'Attorneys\u2019 fees and costs to the extent recoverable',
  ],
}

const MAX_CLAIM = Math.max(...REVENUE_CLAIMS.map(c => c.amount))

const SIDE = {
  village:   { bar: 'bg-sky-600',    chip: 'text-sky-800 bg-sky-50 border-sky-200',       label: 'Village' },
  developer: { bar: 'bg-amber-500',  chip: 'text-amber-900 bg-amber-50 border-amber-200', label: 'Developer' },
}

function Counter({ n, label, tone }) {
  return (
    <div className={`flex-1 min-w-[8.5rem] rounded-xl border px-4 py-3.5 ${tone}`}>
      <div className="text-3xl font-display font-bold leading-none tracking-tight">{n}</div>
      <div className="text-xs leading-snug mt-1.5">{label}</div>
    </div>
  )
}

export default function Agreement() {
  return (
    <FootnoteProvider>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <PageTitle {...pageMeta['/agreement']} />

        <FadeIn className="mb-8">
          <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.15em] mb-3">The Deal</p>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">
            What the Village agreed to
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed">
            A development agreement exists between the Village of Grayslake and T5. It has not been
            published. This site does not have a copy. The page covers what officials have said
            publicly. It is not derived from the document.
          </p>
          <p className="text-2xs font-mono text-gray-600 mt-4">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        {/* The shape of the answer, before the detail. */}
        <FadeIn className="mb-8">
          <div className="flex flex-wrap gap-3">
            <Counter n={TERMS.length} label="terms on the public record" tone="border-emerald-200 bg-emerald-50 text-emerald-900" />
            <Counter n={REVENUE_CLAIMS.length} label="revenue claims, none verified" tone="border-amber-200 bg-amber-50 text-amber-900" />
            <Counter n={UNPUBLISHED.length} label="questions with no public answer" tone="border-slate-300 bg-slate-50 text-slate-800" />
          </div>
        </FadeIn>

        <FadeIn>
          <div className="bg-amber-50 border-l-4 border-amber-400 border-y border-r border-amber-200 rounded-r-xl px-5 sm:px-6 py-5 mb-12">
            <p className="text-2xs font-mono text-amber-800 uppercase tracking-widest mb-2">Read this first</p>
            <p className="text-base text-gray-800 leading-relaxed">
              Everything on this page is what people have <em>said</em> about the agreement. Nobody
              arguing this deal in public is arguing from the text. The text has never been released.
              A lawsuit filed July 31 asks a court to void it.
            </p>
          </div>
        </FadeIn>

        {/* ── The complaint itself ──────────────────────────────────────
            The agreement this page describes is what the lawsuit asks a court
            to void, so the filing belongs here, and now it can be linked in
            full rather than characterised. This is the primary document: a
            file-stamped copy from the Clerk, mirrored on this site so the
            record does not depend on a shared link staying alive. */}
        <FadeIn className="mb-14">
          <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900 px-5 sm:px-6 py-3.5">
              <p className="text-2xs font-mono font-bold uppercase tracking-widest text-slate-300">
                Primary document
              </p>
              <p className="text-lg sm:text-xl font-display font-bold text-white leading-snug mt-0.5">
                The agreement is being challenged in court
              </p>
            </div>

            <div className="px-5 sm:px-6 py-5 bg-white">
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-5">
                {[
                  ['Case number', COMPLAINT.caseNumber],
                  ['Filed', COMPLAINT.filed],
                  ['Court', COMPLAINT.court],
                  ['Plaintiffs', COMPLAINT.plaintiffs],
                  ['Defendants', COMPLAINT.defendants],
                  ['Counsel', COMPLAINT.counsel],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-2xs font-mono uppercase tracking-widest text-slate-500">{k}</dt>
                    <dd className="text-sm text-slate-900 leading-snug mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-2xs font-mono uppercase tracking-widest text-slate-500 mb-2">
                Four counts
              </p>
              <ol className="space-y-2 mb-5">
                {COMPLAINT.counts.map((c, i) => (
                  <li key={c.title} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-2xs font-mono font-bold flex items-center justify-center">
                      {['I', 'II', 'III', 'IV'][i]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{c.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="text-2xs font-mono uppercase tracking-widest text-slate-500 mb-2">
                Relief sought
              </p>
              <ul className="space-y-1.5 mb-5">
                {COMPLAINT.relief.map(r => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug">
                    <span aria-hidden="true" className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={sources.complaint2026?.localCopy ?? '/docs/t5-grayslake-complaint-2026ch00000171.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors min-h-[44px]"
                >
                  Read the complaint (PDF, 37 pages)
                  <span aria-hidden="true">&darr;</span>
                </a>
                <span className="inline-flex items-center text-xs text-slate-600 leading-snug">
                  File-stamped copy, mirrored on this site.
                </span>
              </div>

              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 mt-4 leading-relaxed">
                These are allegations in a complaint, not findings. No defendant had answered at the
                time of writing and no court has ruled on any count. Read it and judge for yourself,
                which is the point of putting it here.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ── 1. On the record ──────────────────────────────────────────── */}
        <FadeIn className="mb-14">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">01</span>
            <h2 className="text-2xl font-display font-bold text-gray-900">What is on the record</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 max-w-prose">
            Terms stated by the Village or its officials in documents that can be cited. Where a
            figure is conditional or was described as unfinished, that is noted with it rather than
            below it.
          </p>
          <div className="space-y-3">
            {TERMS.map((t, i) => (
              <div
                key={t.term}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3 px-4 sm:px-5 py-4">
                  <span className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1">
                      <p className="text-base font-display font-semibold text-gray-900 leading-snug">
                        {t.term}
                      </p>
                      <span className="text-2xs font-mono uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                        {t.who}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {t.detail}
                      <SourceCitation sourceKey={t.sourceKey} />
                    </p>
                    {t.caveat && (
                      <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2.5 leading-relaxed">
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
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">02</span>
            <h2 className="text-2xl font-display font-bold text-gray-900">What the community is told it gets</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 max-w-prose">
            Four public revenue claims, from four speakers, over four different scopes and periods.
            The largest is five times the smallest. Bars are drawn to the figures, so the gap is the
            real one.
          </p>

          <div className="space-y-3">
            {REVENUE_CLAIMS.map(c => {
              const s = SIDE[c.side]
              return (
                <div key={c.figure + c.speaker} className="border border-slate-200 rounded-xl bg-white px-4 sm:px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                    <p className="text-xl sm:text-2xl font-display font-bold text-gray-900 tracking-tight">
                      {c.figure}
                    </p>
                    <span className={`text-2xs font-mono uppercase tracking-wider border rounded px-1.5 py-0.5 ${s.chip}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full ${s.bar}`}
                      style={{ width: `${(c.amount / MAX_CLAIM) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{c.scope}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    {c.speaker}
                    <SourceCitation sourceKey={c.sourceKey} />
                  </p>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-gray-700 leading-relaxed mt-4 max-w-prose border-t border-slate-200 pt-4">
            These are four claims about different things. They cannot be averaged or treated as a
            range. The two largest come from the developer. The two smaller ones come from Village
            officials. None is independently verified. None can be verified until the Lake County
            Assessor values the campus, which has not happened. What any district receives also
            depends on its own levy.
          </p>
        </FadeIn>

        {/* ── 3. The gaps ───────────────────────────────────────────────── */}
        <FadeIn className="mb-14">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5">03</span>
            <h2 className="text-2xl font-display font-bold text-gray-900">What has not been published</h2>
          </div>
          <p className="text-sm text-gray-600 mb-5 max-w-prose">
            These are questions about the deal that no public document currently answers.
          </p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {UNPUBLISHED.map(item => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm text-slate-700 leading-snug"
              >
                <span
                  className="shrink-0 mt-0.5 w-4 h-4 rounded border-2 border-dashed border-slate-400"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        {/* ── 4. Go get it ──────────────────────────────────────────────── */}
        <FadeIn>
          <div className="border border-blue-200 bg-blue-50/60 rounded-xl overflow-hidden">
            <div className="px-5 sm:px-6 py-3 border-b border-blue-200 bg-blue-100/50">
              <p className="text-2xs font-mono font-bold text-blue-800 uppercase tracking-widest">
                Get the document yourself
              </p>
            </div>
            <div className="px-5 sm:px-6 py-5">
              <p className="text-base text-gray-800 leading-relaxed mb-3">
                The development agreement, the approving ordinances and the staff reports are public
                records of the Village of Grayslake. You do not need anyone&rsquo;s permission to read
                them.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Under the Illinois Freedom of Information Act (5 ILCS 140) the Village must respond
                within five business days, extendable by five more. Requests go to the Village&rsquo;s
                FOIA officer through villageofgrayslake.com. Ask for the executed development agreement
                between the Village and T5 Data Centers and any amendments to it, plus the ordinances
                approving the planned unit development.
              </p>
              <p className="text-xs text-gray-700 leading-relaxed border-t border-blue-200 pt-3">
                On June 5, 2026, the Village said it cannot answer further questions because of
                pending litigation. That applies to comment, not FOIA. Statutory response obligations
                continue. Litigation can affect which exemptions the Village claims.
              </p>
              <p className="text-sm text-gray-800 leading-relaxed mt-3 font-medium">
                If you get the agreement, send it. I will publish it here in full.
              </p>
            </div>
          </div>
        </FadeIn>

        <FootnoteList />
        <BackToTop />
      </div>
    </FootnoteProvider>
  )
}
