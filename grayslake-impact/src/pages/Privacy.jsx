import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import { LAST_VERIFIED } from '../data/siteConfig'

const CONTACT = 'walterjr.quentin@gmail.com'

function Section({ title, children }) {
  return (
    <FadeIn className="border-t border-edge-soft pt-8 pb-9">
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-base text-gray-700 leading-relaxed max-w-3xl">{children}</div>
    </FadeIn>
  )
}

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/privacy']} />

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.15em] mb-4">Privacy</p>
        <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tight mb-4">
          What this site collects
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
          Almost nothing. No cookies, no accounts, nothing sold to anyone. I have no idea who you
          are and no way to find out, which is how I would want it as a reader.
        </p>
        <p className="text-2xs font-mono text-gray-600 mt-4">Last reviewed {LAST_VERIFIED}</p>
      </FadeIn>

      <Section title="Visitor numbers">
        <p>
          I use Plausible to count visits. It records the page you landed on, the country you
          arrived from, roughly what device you used, and the site that referred you if there was
          one. It does not set cookies, does not store an IP address, and cannot follow you to
          other sites. There is no profile of you anywhere, because there is nothing to build one
          from.
        </p>
        <p>
          I look at this to see whether anyone is reading, and which pages reporters and residents
          actually open. That is the whole use.
        </p>
      </Section>

      <Section title="Other services in the page">
        <p>
          The map is served by Mapbox, so loading the map page sends a request to Mapbox for the
          satellite tiles. Their privacy terms apply to that request, not mine. Every other page
          works without it.
        </p>
        <p>
          The site is hosted on Vercel, which keeps standard server logs the way any web host does.
          Source documents link out to the Village of Grayslake, Lake County, the Internet Archive
          and various news sites, and once you follow a link you are on their terms rather than
          this page.
        </p>
      </Section>

      <Section title="If you email me">
        <p>
          Corrections and questions arrive in my personal inbox and stay there. I do not run a
          mailing list, and I will not add you to one. If you send a correction and I publish a
          fix, the fix goes up without your name unless you ask me to credit you.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If what the site collects ever changes, this page changes with it and the review date at
          the top moves. Questions about any of it can go to{' '}
          <a
            href={`mailto:${CONTACT}?subject=${encodeURIComponent('Privacy question about grayslakedatacentertracker.org')}`}
            className="text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium"
          >
            {CONTACT}
          </a>.
        </p>
      </Section>

      <BackToTop />
    </div>
  )
}
