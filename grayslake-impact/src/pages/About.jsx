import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="About" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">About This Site</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Why I Built This</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          A resident-built resource. No affiliation with T5 Data Centers or the Village of Grayslake.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last updated Aug 2, 2026</p>
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
        <div className="border border-gray-200 rounded-xl px-6 py-6 bg-white">
          <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-4">Contact</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            If you have a correction or a document this site is missing, please reach out.
            I'd rather fix a mistake than leave it standing.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:qconkle2@illinois.edu"
              className="flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="1" y="3" width="12" height="8" rx="1.2" />
                  <path d="M1 4l6 4.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-mono text-gray-600 group-hover:text-blue-600 transition-colors">
                qconkle2@illinois.edu
              </span>
            </a>
            <a
              href="tel:+12243309078"
              className="flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 2.5C2 2.5 3 5.5 5.5 8S11.5 12 11.5 12l1-2.5-2-1-1 1C8 9 5 6 5 4.5l1-1-1-2L2 2.5z" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-mono text-gray-600 group-hover:text-blue-600 transition-colors">
                224-330-9078
              </span>
            </a>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
