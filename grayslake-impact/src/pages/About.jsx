import PageTitle from '../components/ui/PageTitle'
import FadeIn from '../components/ui/FadeIn'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle title="About" />

      <FadeIn className="mb-10 pb-8 border-b border-gray-800/60">
        <p className="text-2xs font-mono text-blue-400/50 uppercase tracking-[0.2em] mb-3">About This Site</p>
        <h1 className="text-4xl font-display font-bold text-gray-100 tracking-tight mb-3">Why I Built This</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
          A resident-built resource. No affiliation with T5 Data Centers or the Village of Grayslake.
        </p>
      </FadeIn>

      {/* Bio */}
      <FadeIn className="mb-10">
        <div className="prose-custom space-y-4 text-sm text-gray-400 leading-relaxed">
          <p>
            I'm Quentin Conkle Jr. — a sophomore at the University of Illinois Urbana-Champaign
            studying Information Sciences and Data Science. I grew up in Grayslake, so when I
            started hearing about a massive data center campus going up near town, I paid attention.
          </p>
          <p>
            At first I didn't know much about it beyond the basics: big tech company, wetlands
            nearby, people upset at town hall. So I started digging. What I found wasn't a clean
            story — it was village meeting minutes scattered across a government site, trade press
            written for industry insiders, and social media arguments with a lot of heat and not
            much sourcing. Every time I tried to understand what was actually happening, I had to
            piece it together from five different places.
          </p>
          <p>
            The more I talked to people in Grayslake, the more I realized this wasn't just my
            problem. A lot of residents genuinely couldn't find the basic facts in one place —
            how much tax revenue the village would actually see, what the energy draw would mean
            for bills, what the legal challenges were about, or what questions still didn't have
            public answers. I kept thinking someone should build a clear, neutral resource for
            this. Eventually I figured it might as well be me.
          </p>
          <p>
            That's what this site is. I'm not trying to tell you what to think about the data
            center. I'm trying to collect the public record — village approvals, tax filings,
            press coverage, legal developments — and present it clearly so you can form your own
            opinion. If there's a claim on this site, it links to a source.
          </p>
        </div>
      </FadeIn>

      {/* Affiliation disclaimer */}
      <FadeIn className="mb-10">
        <div className="bg-blue-400/5 border border-blue-500/20 rounded-xl px-6 py-5">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-400/60 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-display font-semibold text-blue-300/80 mb-1.5">Independence</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                This site is not affiliated with T5 Data Centers, LLC, the Village of Grayslake,
                or any advocacy group on either side of this project. It was built independently,
                on my own time, using publicly available documents and verified journalism.
                No organization has reviewed or approved the content here.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Contact */}
      <FadeIn>
        <div className="border border-gray-800/50 rounded-xl px-6 py-6">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest mb-4">Contact</p>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            If you have a correction, a document I'm missing, or updated information — I want to
            hear from you. This site is only as accurate as the public record I've been able to
            find, and I'd rather fix a mistake than leave it up.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:walterjr.quentin@gmail.com"
              className="flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded bg-gray-800/60 border border-gray-700/50 flex items-center justify-center shrink-0 group-hover:border-blue-500/30 transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="1" y="3" width="12" height="8" rx="1.2" />
                  <path d="M1 4l6 4.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-mono text-gray-400 group-hover:text-blue-400 transition-colors">
                walterjr.quentin@gmail.com
              </span>
            </a>
            <a
              href="tel:+12243309078"
              className="flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded bg-gray-800/60 border border-gray-700/50 flex items-center justify-center shrink-0 group-hover:border-blue-500/30 transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 2.5C2 2.5 3 5.5 5.5 8S11.5 12 11.5 12l1-2.5-2-1-1 1C8 9 5 6 5 4.5l1-1-1-2L2 2.5z" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-mono text-gray-400 group-hover:text-blue-400 transition-colors">
                224-330-9078
              </span>
            </a>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
