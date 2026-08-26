import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import { LAST_VERIFIED, SITE_CONTACT } from '../data/siteConfig'

export default function About() {
  return (
    <Container size="wide" className="py-12 sm:py-16">
      <PageTitle {...pageMeta['/about']} />

      <FadeIn className="mb-12 pb-8 border-b border-rule">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">About This Site</p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] mb-4 max-w-2xl">Why I Built This</h1>
        <p className="text-lg font-sans text-ink-700 leading-relaxed max-w-2xl">
          A resident-built resource. No affiliation with T5 Data Centers or the Village of Grayslake.
        </p>
      </FadeIn>

      {/* Desktop: prose column on the left, a metadata rail on the right
          that stays visible while the reader scrolls. Under lg the rail
          drops below the prose so mobile keeps a single flowing column. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,65ch)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <div>
          <FadeIn className="mb-12">
            <div className="space-y-5 text-base font-sans text-ink-700 leading-relaxed">
              <p>
                I&rsquo;m Quentin Conkle Jr., a sophomore at University of Illinois Urbana-Champaign pursuing Information Sciences and Data Science. I grew up in Grayslake. When T5 was announced, public records on the project were scattered across village meeting minutes, trade coverage, and local reporting. A sourced answer to a basic question, like projected tax revenue or what the lawsuits claim, required reading across multiple documents. This site collects that record in one place.
              </p>
              <p>
                I collect the public record: village approvals, tax filings, press coverage, legal developments. Every figure links to a source. I hold no position on the data center. If something is wrong or a document is missing, I want to know.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="border-t border-rule pt-8">
            <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Get in touch</p>
            <blockquote className="border-l-[3px] border-ink-900 pl-5 mb-5 py-1">
              <p className="text-xl sm:text-2xl font-display italic text-ink-900 leading-snug">
                &ldquo;I&rsquo;d rather fix a mistake than leave it standing.&rdquo;
              </p>
            </blockquote>
            <p className="text-base font-sans text-ink-700 leading-relaxed mb-5">
              If you have a correction or a document this site is missing, please reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent text-paper text-sm font-sans font-semibold hover:bg-accent-hover transition-colors min-h-[44px]"
              >
                <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                  <path d="M1.5 5l6.5 5 6.5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Email me
              </a>
              <a
                href={`tel:${SITE_CONTACT.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-ink-900 text-ink-800 text-sm font-sans font-semibold hover:bg-paper-sunk transition-colors min-h-[44px]"
              >
                <svg aria-hidden="true" className="w-4 h-4 shrink-0 text-ink-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3C3 3 4 7 7 10s7 4 7 4l1.5-3-2.5-1.5-1.5 1.5C10 10 6 6 6 5.5l1.5-1.5L6 2 3 3z" strokeLinejoin="round" />
                </svg>
                {SITE_CONTACT.phone}
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Metadata rail — sticky on desktop, inline (below prose) on mobile.
            Holds the independence disclaimer and the last-verified stamp:
            the two claims that make the archive credible but that would break
            the reading rhythm if kept mid-flow. */}
        <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 lg:self-start space-y-8">
          <div className="border-l-[3px] border-accent bg-accent-soft pl-5 pr-4 py-4">
            <p className="text-xs font-display italic text-accent tracking-wide mb-2">Independence</p>
            <p className="text-sm font-sans text-ink-700 leading-relaxed">
              This site is not affiliated with T5 Data Centers, LLC, the Village of Grayslake,
              or any advocacy group on either side of this project. It was built independently,
              from publicly available documents and verified journalism.
              No organization has reviewed or approved the content.
            </p>
          </div>

          <dl className="text-sm font-sans space-y-3 pt-2 border-t border-rule">
            <div className="pt-3">
              <dt className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-500">Last updated</dt>
              <dd className="mt-0.5 font-mono text-ink-700">{LAST_VERIFIED}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <BackToTop />
    </Container>
  )
}
