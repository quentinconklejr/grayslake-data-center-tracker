import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import ReportErrorLink from '../components/ui/ReportErrorLink'
import { pageMeta } from '../data/pageMeta'
import { updates } from '../data/updates'
import { tierLabels } from '../data/sourceTiers'
import { LAST_VERIFIED, SITE_CONTACT } from '../data/siteConfig'

/*
 * How the site chooses and labels sources, the review step before anything
 * publishes, and the corrections log. The log is generated from the
 * kind: 'corrected' lines in src/data/updates.js, so a correction logged
 * there appears here with no second copy to keep in step.
 */

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const H2 = 'text-2xl sm:text-3xl font-display text-ink-900 tracking-tight scroll-mt-24'
const P = 'text-base font-sans text-ink-700 leading-relaxed max-w-2xl'
const TEXT_LINK = 'text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent'

// The label names shown on the Documents page for each tier, read from the
// source registry (config/sources.yaml via src/data/sourceTiers.js).
const labelsFor = n => Object.values(tierLabels)
  .filter(l => l.startsWith(`Tier ${n} `))
  .map(l => l.split(' · ')[1])

const TIERS = [
  {
    tier: 1,
    name: 'The record itself',
    text: 'Village of Grayslake agendas, approved minutes, ordinances, permits and press releases; Lake County Board and Zoning Board of Appeals records; the county’s parcel map data and recorded documents; court filings; bill text and status on ilga.gov; notices and permits from state and federal agencies; and official meeting video. When I cite one, I state what the document says or records and link to it, with a page number where I can.',
  },
  {
    tier: 2,
    name: 'An established news outlet',
    text: 'An article with a named reporter from one of six outlets: the Daily Herald, the Chicago Tribune, the Lake County News-Sun, the Chicago Sun-Times, Crain’s Chicago Business and Capitol News Illinois. I attribute what they report to them by name.',
  },
  {
    tier: 3,
    name: 'Other reporting and secondary sources',
    text: 'Trade publications, sites that rewrite other outlets’ stories, republished articles, advocacy groups, blogs, and articles from a Tier 2 outlet that carry no reporter’s name. The Lake and McHenry County Scanner and Chronicle Media are in this tier. Some entries cite a Tier 3 report on its own, such as a lawmaker’s statement that only the Scanner reported. When a Tier 1 or Tier 2 source covers the same thing, I cite that instead.',
  },
  {
    tier: 4,
    name: 'Leads only',
    text: 'Social media posts, anonymous posts, comment sections and websites I have not reviewed. I never cite or quote them. At most they tell me where to look.',
  },
]

const LABELS = [
  ['What a record says', 'Stated as fact, with the document linked: the acreage an ordinance sets, the date a complaint was filed, a vote result in approved minutes.'],
  ['Allegations', 'Claims made in a lawsuit are allegations. I write them that way (“the complaint alleges”) and say when no court has ruled on them.'],
  ['Statements by parties to the lawsuit', 'The Village of Grayslake and T5 Data Centers are both defendants in the pending lawsuit. When either says something about the project, I attribute it (“the Village stated”, “T5 stated”). The only things I take from them without attribution are plain record facts: a meeting date, a vote result, that a document or permit exists, or a number in an official record.'],
  ['Projections', 'Forecasts, such as tax revenue, jobs or build-out dates, are labeled as projections and attributed to whoever made them.'],
  ['News reports', 'When I rely on a news report, I name the outlet (“the Daily Herald reported”).'],
  ['Figures I calculate', 'When I add up figures myself, for example acreage and sale totals from county parcel records, I say that the figure is calculated and what it was calculated from.'],
  ['Names the record does not use', 'The Village’s mayor calls HB5513 the “POWER Act.” The bill text does not use the name, so I use it only in quotation marks, next to the bill number. Advocacy groups also attach the name to SB4016, the Senate bill with an identical synopsis; when I mention that, I say it is their label.'],
  ['Quotations', 'Words in quotation marks are copied exactly from the source. I do not shorten a quotation with an ellipsis.'],
  ['Private individuals', 'I do not name private residents, and I do not publish anyone’s health, address or family details. Public officials are named in their official roles.'],
]

export default function Methodology() {
  const corrections = updates.filter(u => u.kind === 'corrected')

  return (
    <Container size="default" className="py-10 sm:py-14 space-y-12">
      <PageTitle
        title={pageMeta['/methodology'].title}
        description={pageMeta['/methodology'].description}
        ogImage={pageMeta['/methodology'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">How this site works</p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-3">
          Methodology and Corrections
        </h1>
        <p className={P}>
          This page explains how I choose sources, how I label what people and organizations say, what
          happens before anything goes on the site, and how I correct mistakes. Every correction is
          listed at the bottom, newest first.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-3">Last verified {LAST_VERIFIED}</p>
      </header>

      <section aria-labelledby="tiers" className="space-y-5">
        <h2 id="tiers" className={H2}>How I rate sources</h2>
        <p className={P}>
          I sort every source into one of four tiers. The tier depends on who published it, not on what
          the page says about itself.
        </p>
        <dl className="border-t border-rule">
          {TIERS.map(t => (
            <div key={t.tier} className="border-b border-rule-strong py-5 sm:grid sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
              <dt>
                <span className="block text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">Tier {t.tier}</span>
                <span className="block mt-1 text-base font-display font-semibold text-ink-900 leading-snug">{t.name}</span>
                <span className="block mt-1 text-xs font-sans text-ink-500">Labeled: {labelsFor(t.tier).join(', ')}</span>
              </dt>
              <dd className="mt-2 sm:mt-0 text-base font-sans text-ink-700 leading-relaxed">{t.text}</dd>
            </div>
          ))}
        </dl>
        <p className={P}>
          Every source on the <Link to="/documents" className={TEXT_LINK}>Documents</Link> page carries
          its tier and the kind of source it is, for example &ldquo;{tierLabels.news_report}.&rdquo; Those
          labels are generated from the same list of sources and tiers that the review scripts use, not
          set by hand.
        </p>
      </section>

      <section aria-labelledby="labels" className="space-y-5">
        <h2 id="labels" className={H2}>How I label claims</h2>
        <dl className="border-t border-rule">
          {LABELS.map(([term, text]) => (
            <div key={term} className="border-b border-rule-strong py-5">
              <dt className="text-lg font-display font-semibold text-ink-900 leading-snug">{term}</dt>
              <dd className="mt-1.5 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="listing" className="space-y-4">
        <h2 id="listing" className={H2}>How a source gets listed</h2>
        <p className={P}>
          Every entry links to at least one source on the <Link to="/documents" className={TEXT_LINK}>Documents</Link> page.
          For each source I record the publisher, the title, the date and a link. Where I can, I add an
          archived copy: a snapshot in the Internet Archive&rsquo;s Wayback Machine that I have checked
          against what I read, or a copy of the PDF on this site. A few sources do not have an archived
          copy yet, and I archive those by hand.
        </p>
        <p className={P}>
          I also keep a private copy of each document I rely on, with a fingerprint of the file (a SHA-256
          hash), so I can show later exactly what a source said when I read it.
        </p>
        <p className={P}>
          Some documents, such as signed meeting minutes, are scans with no text in them. I run those
          through text recognition to find the passages worth reading. I do not quote from that
          machine-read text. I quote from the document itself.
        </p>
      </section>

      <section aria-labelledby="review" className="space-y-4">
        <h2 id="review" className={H2}>Review before anything publishes</h2>
        <p className={P}>
          I use a set of scripts to watch public sources: Village agendas and news posts, the
          Village&rsquo;s meeting videos, Lake County Board records, and the status of HB5513 and SB4016
          on ilga.gov. They draft proposed entries only from Tier 1 sources: public records, and statements
          the Village and T5 publish on their own channels, which are always attributed. A news article
          never becomes an entry by itself; the scripts write me a note saying which record to check.
        </p>
        <p className={P}>
          Before a proposed entry reaches me, an automated check compares every quotation, number, date,
          case number and bill number in it with the text of the cited source, and rejects the draft if
          anything is not there. A second check holds back any draft that names a private person or
          includes health, address or family details.
        </p>
        <p className={P}>
          Nothing the scripts produce goes on the site by itself. Each proposed change is meant to reach
          me as a pull request that lists every quotation and where it came from, and I decide whether to
          publish it after reading it against the sources. For now the scripts run in a test mode and
          publish nothing. I also run the same check over the existing timeline; the most recent
          corrections below came out of that review.
        </p>
      </section>

      <section aria-labelledby="corrections" className="space-y-5">
        <h2 id="corrections" className={H2}>Corrections</h2>
        <p className={P}>
          When I get something wrong, I fix it and add a dated line to the{' '}
          <Link to="/updates" className={TEXT_LINK}>Updates</Link> page saying what changed. Those lines
          stay. To report an error, use the &ldquo;Report an error&rdquo; link at the bottom of any page or
          email <a href={`mailto:${SITE_CONTACT.email}`} className={TEXT_LINK}>{SITE_CONTACT.email}</a>.
        </p>

        {corrections.length === 0 ? (
          <p className={P}>No corrections have been logged yet.</p>
        ) : (
          <ol className="border-t border-rule" aria-label="Corrections log, newest first">
            {corrections.map(u => (
              <li key={`${u.date}-${u.title}`} className="border-b border-rule-strong py-6">
                <time dateTime={u.date} className="block text-xs font-mono text-ink-500 mb-2">
                  {fmtDate(u.date)}
                </time>
                <h3 className="text-lg font-display font-semibold text-ink-900 leading-snug">{u.title}</h3>
                <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed max-w-2xl">{u.description}</p>
                {u.link && (
                  <p className="mt-3">
                    <Link
                      to={u.link}
                      className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-accent hover:text-accent-hover min-h-[44px]"
                    >
                      {u.linkLabel ?? 'Read more'} <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}

        <p className="text-sm font-sans text-ink-600 leading-relaxed">
          Spotted something that should be corrected?{' '}
          <ReportErrorLink className={TEXT_LINK} label="Send it in" />.
        </p>
      </section>
    </Container>
  )
}
