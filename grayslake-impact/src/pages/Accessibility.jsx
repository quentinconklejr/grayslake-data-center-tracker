import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import { LAST_VERIFIED, SITE_CONTACT } from '../data/siteConfig'

// Was a hardcoded personal gmail while every other surface used the
// university address. Imported so the two cannot drift apart again.
const CONTACT = SITE_CONTACT.email

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
          This site is built to WCAG 2.1 Level AA. Here is what that means and how to reach me if
          something fails.
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
          Charts carry a text description and data table so the values aren&rsquo;t locked inside
          the visual. The parcel map lists all 57 parcels below it, with PIN, acreage, and recorded
          sale.
        </p>
        <p>
          Filters and toggles announce their state, not just their color. Copy buttons confirm when
          they work. Headings run in order, one h1 per page. There is a skip link. Reduced motion
          preference disables animations.
        </p>
      </Section>



      <Section title="If something does not work">
        <p>
          Tell me and I will fix it. Which page, what you were trying to do, and what you use to
          browse. A rough description is enough.
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
