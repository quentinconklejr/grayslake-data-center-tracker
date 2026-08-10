import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import SourceCitation from '../components/ui/SourceCitation'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

/**
 * "What did the village actually agree to?"
 *
 * The most common question residents ask, and the site answered it only in
 * fragments spread across the energy, tax and schools panels. A reader had to
 * assemble the deal themselves from four pages, and the widespread assumption
 * that residents get nothing was going unanswered because there was nothing
 * to point at.
 *
 * Data is inlined rather than lifted into projections.js on purpose: the page
 * is self-contained, so adding it touches no existing data file.
 *
 * The order is the neutrality safeguard:
 *   1. what is on the record       (citable, conditions attached)
 *   2. what the community is told  (four claims, five-fold spread)
 *   3. what nobody has published   (the gaps, stated plainly)
 *   4. how to get the document     (so the reader need not trust me)
 */

const TERMS = [
  {
    term: 'No financial incentives to T5',
    detail:
      'The Village FAQ states the approved development agreements "do not provide for any financial incentives." No abatement, TIF district or rebate has been disclosed.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Developer fees to the Village',
    detail:
      'Grayslake\u2019s mayor described fees in the "tens of millions of dollars" if the campus is fully built out, split roughly 50% to major infrastructure, 25% to special community projects and 25% to resident cost-control measures.',
    sourceKey: 'govtech2025',
    caveat:
      'Described as ballpark figures still under negotiation at the time, and conditional on full buildout, which T5 has not committed to.',
  },
  {
    term: 'Grid infrastructure paid by the developer',
    detail:
      'Under agreements with ComEd, T5 funds the electricity supply infrastructure serving the campus, including an on-site substation. The FAQ states the Village pays nothing toward it.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Electricity costs borne by T5',
    detail:
      'T5 pays for all electricity used on the campus under Illinois electric rate standards, through supply agreements the FAQ describes as already in place with ComEd.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Property tax to eight districts',
    detail:
      'Eight taxing bodies cover the campus and receive property tax from it. Four of the eight are not Grayslake districts, so part of the tax base accrues to Round Lake, Fremont and Mundelein districts.',
    sourceKey: 'villagefaq_archived',
  },
  {
    term: 'Development caps',
    detail:
      'Up to 472 acres of development and no more than 10,100,000 sq ft of building. These are ceilings the approvals permit, not commitments T5 has made.',
    sourceKey: 'villagefaq_archived',
  },
]

// Four claims, four speakers, four scopes. Smallest to largest so the spread
// is visible rather than argued.
const REVENUE_CLAIMS = [
  {
    figure: '~$300 million',
    scope: 'All taxing districts, over the coming decades',
    speaker: 'Mayor of Grayslake',
    sourceKey: 'chitrib_june2026',
  },
  {
    figure: 'Over $500 million',
    scope: 'Local school districts specifically, no period given, plus "hundreds of millions more" for emergency and social services',
    speaker: 'Pete Marin, T5 chief executive',
    sourceKey: 'scannerLawsuit2026',
  },
  {
    figure: 'Over $1 billion',
    scope: 'All taxing districts, over 20 years',
    speaker: 'Deputy Village Manager',
    sourceKey: 'chronicle2026',
  },
  {
    figure: 'Over $1.5 billion',
    scope: 'New taxes and fees to Grayslake Village and Lake County, no period given',
    speaker: 'Pete Marin, T5 chief executive',
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

export default function Agreement() {
  return (
    <FootnoteProvider>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <PageTitle {...pageMeta['/agreement']} />

        <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
          <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.15em] mb-4">The Deal</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">
            What the Village agreed to
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
            A development agreement exists between the Village of Grayslake and T5. It has not been
            published, and this site does not have a copy. What follows is what officials have said
            about it, kept separate from what the document itself would show, with a route to the
            document at the bottom of the page.
          </p>
          <p className="text-2xs font-mono text-gray-600 mt-4">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        <FadeIn>
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-6 py-5 mb-10">
            <p className="text-2xs font-mono text-amber-800 uppercase tracking-widest mb-2">Read this first</p>
            <p className="text-base text-gray-700 leading-relaxed">
              Everything on this page is what people have <em>said</em> about the agreement, not what
              the agreement says. Nobody arguing about this deal in public, on either side, is arguing
              from the text, because the text has never been released. The lawsuit filed on July 31
              asks a court to void this agreement, which makes the distinction sharper, not less
              important.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mb-12">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">What is on the record</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-prose">
            Terms stated by the Village or its officials in documents that can be cited. Where a
            figure is conditional or was described as unfinished, that is noted with it rather than
            below it.
          </p>
          <div className="space-y-3">
            {TERMS.map(t => (
              <div key={t.term} className="border border-edge rounded-lg bg-white px-5 py-4">
                <p className="text-base font-display font-semibold text-gray-900 mb-1">{t.term}</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {t.detail}
                  <SourceCitation sourceKey={t.sourceKey} />
                </p>
                {t.caveat && (
                  <p className="text-xs text-amber-800 mt-2 pt-2 border-t border-edge-soft leading-relaxed">
                    {t.caveat}
                  </p>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mb-12">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
            What the community is told it gets
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-prose">
            Four public revenue claims, from four speakers, over four different scopes and periods.
            The largest is five times the smallest. None can be checked, for the reason underneath.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">
                Public revenue claims for the T5 campus, with speaker and scope
              </caption>
              <thead>
                <tr className="border-b border-edge">
                  <th scope="col" className="py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-gray-600">Figure</th>
                  <th scope="col" className="py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-gray-600">Scope and period</th>
                  <th scope="col" className="py-2 text-2xs font-mono uppercase tracking-widest text-gray-600">Stated by</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_CLAIMS.map(c => (
                  <tr key={c.figure + c.speaker} className="border-b border-edge-soft/50 last:border-0 align-top">
                    <th scope="row" className="py-3 pr-3 text-sm font-display font-bold text-gray-900">
                      {c.figure}
                    </th>
                    <td className="py-3 pr-4 text-xs text-gray-700 leading-relaxed">{c.scope}</td>
                    <td className="py-3 text-xs text-gray-700 leading-relaxed">
                      {c.speaker}
                      <SourceCitation sourceKey={c.sourceKey} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed mt-4 max-w-prose border-t border-edge-soft pt-4">
            These are not four estimates of one quantity and should not be averaged or presented as a
            range. The two largest come from the developer, the two smaller from Village officials.
            None has been independently verified, and none can be until the Lake County Assessor
            values the campus, which has not happened. What any individual district actually receives
            also depends on its own levy, which each district sets for itself.
          </p>
        </FadeIn>

        <FadeIn className="mb-12">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">What has not been published</h2>
          <p className="text-sm text-gray-600 mb-5 max-w-prose">
            These are not accusations that anything is being hidden. They are the questions a resident
            might reasonably ask about the deal that no public document currently answers.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
            {UNPUBLISHED.map(item => (
              <li key={item} className="flex items-start gap-2.5 py-2.5 border-b border-edge-soft/50 text-sm text-gray-700 leading-snug">
                <span aria-hidden="true" className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn>
          <div className="border border-blue-200 bg-blue-50/50 rounded-xl px-6 py-5">
            <p className="text-2xs font-mono text-blue-700 uppercase tracking-widest mb-2">Get the document yourself</p>
            <p className="text-base text-gray-700 leading-relaxed mb-3">
              The development agreement, the approving ordinances and the staff reports are public
              records of the Village of Grayslake. You do not need anyone permission to read them.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Under the Illinois Freedom of Information Act (5 ILCS 140) the Village must respond
              within five business days, extendable by five more. Requests go to the Village FOIA
              officer through villageofgrayslake.com. Ask for the executed development agreement
              between the Village and T5 Data Centers and any amendments to it, plus the ordinances
              approving the planned unit development.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed border-t border-blue-200 pt-3">
              The Village said on June 5, 2026 that it cannot answer further questions about the
              project because of pending litigation. That position concerns comment, not its statutory
              FOIA obligations, which continue to apply, though litigation can affect which exemptions
              it claims.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed mt-3">
              If you file a request and get the agreement, send it to me and I will publish it here in
              full, so the record stops depending on any one person keeping a copy.
            </p>
          </div>
        </FadeIn>

        <FootnoteList />
        <BackToTop />
      </div>
    </FootnoteProvider>
  )
}
