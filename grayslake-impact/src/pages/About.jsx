import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import { LAST_VERIFIED, SITE_CONTACT } from '../data/siteConfig'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/about']} />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-xs font-mono text-blue-600 uppercase tracking-[0.2em] mb-3">About This Site</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Why I Built This</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          A resident-built resource. No affiliation with T5 Data Centers or the Village of Grayslake.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last updated {LAST_VERIFIED}</p>
      </FadeIn>

      <FadeIn className="mb-10">
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            I'm Quentin Conkle Jr., a sophomore at UIUC studying information sciences and data science. I grew up in Grayslake. When the T5 campus was announced, I found there was no single resource covering what was actually proposed, so I built one.
          </p>
          <p>
            Public information on the project was scattered across village meeting minutes, trade coverage, and local reporting. A sourced answer to a basic question, like projected tax revenue or what the lawsuits claim, required reading across multiple documents.
          </p>
          <p>
            Neighbors and community members were in the same position. This site is an attempt to collect the basics in one place.
          </p>
          <p>
            I'm not here to advocate a position on the data center. I collect the public record, including village approvals, tax filings, press coverage, and legal developments, and link every figure to a source. If something is wrong or a document is missing, I want to know.
          </p>
        </div>
      </FadeIn>

      <FadeIn className="mb-10">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-display font-semibold text-blue-800 mb-1.5">Independence</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This site is not affiliated with T5 Data Centers, LLC, the Village of Grayslake,
                or any advocacy group on either side of this project. It was built independently,
                from publicly available documents and verified journalism.
                No organization has reviewed or approved the content.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="border border-blue-200 rounded-xl px-6 py-6 bg-blue-50/40">
          <p className="text-xs font-mono text-blue-700 uppercase tracking-widest mb-2">Get in touch</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            If you have a correction or a document this site is missing, please reach out.
            I'd rather fix a mistake than leave it standing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-150 min-h-[44px]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                <path d="M1.5 5l6.5 5 6.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Email me
            </a>
            <a
              href={`tel:${SITE_CONTACT.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:border-gray-400 hover:text-gray-900 transition-colors duration-150 min-h-[44px]"
            >
              <svg className="w-4 h-4 shrink-0 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 3C3 3 4 7 7 10s7 4 7 4l1.5-3-2.5-1.5-1.5 1.5C10 10 6 6 6 5.5l1.5-1.5L6 2 3 3z" strokeLinejoin="round" />
              </svg>
              {SITE_CONTACT.phone}
            </a>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
