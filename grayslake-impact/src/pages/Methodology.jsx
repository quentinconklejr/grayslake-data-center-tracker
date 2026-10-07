import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import { updates } from '../data/updates'
import { tierLabels } from '../data/sourceTiers'
import { lastCorrectedDate } from '../lib/lastCorrected'

/*
 * The owner's account of the site, the source tiers (labels read from the
 * registry), and the corrections log. The log is generated from the
 * kind: 'corrected' lines in src/data/updates.js, so a correction logged
 * there appears here with no second copy to keep in step.
 */

// The owner's text, word for word.
const BODY = [
  "The Grayslake Data Center Tracker collects the public information about the proposed T5 @ Chicago IV data center campus in Grayslake in one place.",
  "When I returned to my hometown this past summer, I heard multiple discussions about a data center being built in Grayslake, yet no one had any concrete facts. When I saw the outrage and backlash, I noticed one of the main reasons people were angry was the lack of transparency and information about the plans. I wanted to help everyone, including myself, by putting everything that has been released in one place, so there is less confusion.",
  "One of the main values of this site is neutrality. I want a spot with all the released information I can find, so visitors can take their own stances based on it. I publish articles, documents, and other records related to the proposed development.",
  "To keep the information accurate and reliable, I sort my sources into tiers based on what type of source they are: official records, news articles from established outlets, and everything else.",
  "When the Village, T5, or the plaintiffs in the lawsuit make a claim, I attribute it to them (\"the Village stated\") instead of presenting it as fact, because their statements sometimes conflict. Things shown in official records, like vote results and dates, are stated plainly.",
  "Before anything goes live, I check the entry and make sure it links to a working source that is also listed on the site. I do my best to avoid mistakes, but they can still happen. My contact information is on the site, and every correction is logged with its date on this page.",
  "As mentioned, this site does not take a side. Many sources of information are written to persuade the reader, which adds to the confusion, and that is what I want to prevent. The main values of this site are neutrality and reliability."
]

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const H2 = 'text-2xl sm:text-3xl font-display text-ink-900 tracking-tight scroll-mt-24'
const P = 'text-base font-sans text-ink-700 leading-relaxed'

// The label names shown on the Documents page for each tier, read from the
// source registry (config/sources.yaml via src/data/sourceTiers.js).
const labelsFor = n => Object.values(tierLabels)
  .filter(l => l.startsWith(`Tier ${n} `))
  .map(l => l.split(' · ')[1])

const TIERS = [
  {
    tier: 1,
    name: 'The record itself',
    text: 'Village of Grayslake agendas, approved minutes, ordinances and permits; Lake County Board and Zoning Board of Appeals records; the county’s parcel map data and recorded documents; court filings; bill text and status on ilga.gov; notices and permits from state and federal agencies; and official meeting video. When I cite one, I state what the document says or records and link to it, with a page number where I can. The Village’s press releases, the Mayor’s statements, the Village’s project FAQ and T5’s website are also Tier 1, labeled as party statements.',
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

export default function Methodology() {
  const corrections = updates.filter(u => u.kind === 'corrected')
  const lastUpdated = lastCorrectedDate(updates)

  return (
    <Container size="prose" className="py-12 sm:py-16 space-y-12">
      <PageTitle
        title={pageMeta['/methodology'].title}
        description={pageMeta['/methodology'].description}
        ogImage={pageMeta['/methodology'].ogImage}
      />

      <header className="border-b border-rule pb-8">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">How this site works</p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-3">
          Methodology and Corrections
        </h1>
        {lastUpdated && (
          <p className="text-2xs font-mono text-ink-500 mb-8">
            Last updated <time dateTime={lastUpdated}>{fmtDate(lastUpdated)}</time>
          </p>
        )}
        <div className="space-y-4">
          {BODY.map(text => (
            <p key={text.slice(0, 40)} className={P}>{text}</p>
          ))}
        </div>
      </header>

      <section aria-labelledby="tiers" className="space-y-5">
        <h2 id="tiers" className={H2}>How I rate sources</h2>
        <dl className="border-t border-rule">
          {TIERS.map(t => (
            <div key={t.tier} className="border-b border-rule-strong py-5">
              <dt>
                <span className="block text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">Tier {t.tier}</span>
                <span className="block mt-1 text-base font-display font-semibold text-ink-900 leading-snug">{t.name}</span>
                <span className="block mt-1 text-xs font-sans text-ink-500">Labeled: {labelsFor(t.tier).join(', ')}</span>
              </dt>
              <dd className="mt-2 text-base font-sans text-ink-700 leading-relaxed">{t.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="corrections" className="space-y-5">
        <h2 id="corrections" className={H2}>Corrections</h2>

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
                <p className="mt-2 text-base font-sans text-ink-700 leading-relaxed">{u.description}</p>
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
      </section>
    </Container>
  )
}
