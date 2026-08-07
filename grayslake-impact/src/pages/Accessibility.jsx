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

export default function Accessibility() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/accessibility']} />

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.15em] mb-4">Accessibility</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">
          Using this site
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
          This site aims to meet WCAG 2.1 Level AA. Here is what that means in practice, and how to
          reach me if something gets in your way.
        </p>
        <p className="text-2xs font-mono text-gray-600 mt-4">Last reviewed {LAST_VERIFIED}</p>
      </FadeIn>

      <Section title="What has been done">
        <p>
          Every text colour on the site is checked against the background it sits on, by script,
          before each release. Nothing ships below the 4.5:1 minimum. Card and panel borders clear
          the 3:1 that applies to interface boundaries.
        </p>
        <p>
          Charts are not left as pictures. Each one carries a description and a table of the values
          behind it, because the proportions a bar shows are otherwise unreadable without sight of
          it. The parcel map has the same arrangement: a table beneath it lists all 57 parcels with
          their PIN, acreage and recorded sale, so nothing on that page exists only inside the map.
        </p>
        <p>
          Filters and toggles say whether they are on rather than only changing colour, and hitting
          copy tells you it worked. Headings run in order, one h1 per page, so you can move through
          a page by structure. There is a skip link. If your operating system asks for reduced
          motion, the site stops animating.
        </p>
      </Section>



      <Section title="If something does not work">
        <p>
          Tell me and I will fix it. Say which page you were on, what you were trying to do, and
          what you use to browse, if you are comfortable sharing that. A rough description is
          enough; I would rather hear about a problem imprecisely than not hear about it.
        </p>
        <p>
          <a
            href={`mailto:${CONTACT}?subject=${encodeURIComponent('Accessibility problem on grayslakedatacentertracker.org')}`}
            className="text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium"
          >
            {CONTACT}
          </a>
        </p>
      </Section>

      <BackToTop />
    </div>
  )
}
